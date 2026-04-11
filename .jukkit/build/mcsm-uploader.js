const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function doRequest(method, baseUrl, options = {}) {
    const { headers = {}, body, query = {} } = options;
    const urlObj = new URL(baseUrl);
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
            urlObj.searchParams.append(key, String(value));
        }
    }
    const url = urlObj.toString();

    const defaultHeaders = {
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (!(body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json; charset=utf-8';
    }

    const mergedHeaders = { ...defaultHeaders, ...headers };
    const fetchOptions = { method, headers: mergedHeaders, body };

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        const text = await response.text();
        console.error(`❌ 请求失败 (${response.status}): ${text}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch { }
        return text;
    }
}

async function getUploadConfig(server, targetFile) {
    const uploadDir = path.posix.dirname(targetFile);
    const baseUrl = `${server.url}/api/files/upload`;
    const query = {
        upload_dir: uploadDir,
        daemonId: server.daemonId,
        uuid: server.instanceId,
        apikey: server.apiKey,
    };
    const result = await doRequest('POST', baseUrl, { query });
    if (result.status !== 200) {
        throw new Error(`获取上传凭证失败: ${result.status}`);
    }
    return result.data;
}

async function uploadFileToDaemon(baseUrl, password, filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), filename);

    const url = `${baseUrl}/upload/${password}`;
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`上传文件失败 (${response.status}): ${text}`);
    }
    return text;
}

async function fetchRawLogs(server, size = 4096) {
    const baseUrl = `${server.url}/api/protected_instance/outputlog`;
    const query = {
        uuid: server.instanceId,
        daemonId: server.daemonId,
        size: size.toString(),
        apikey: server.apiKey,
    };
    const result = await doRequest('GET', baseUrl, { query });
    if (result.status !== 200) {
        throw new Error(`获取日志失败: ${result.status}`);
    }
    return result.data;
}

function extractTimeSec(line) {
    const first15 = line.substring(0, 15);
    const match = first15.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
}

function computeLineHash(lines, index) {
    const start = Math.max(0, index - 3);
    const slice = lines.slice(start, index + 1);
    const combined = slice.join('\n');
    return crypto.createHash('sha256').update(combined).digest('hex');
}

async function startLogPulling(uploadStartTime, serverConfig) {
    const now = new Date();
    const localTimeSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const startTimeSec = (localTimeSec - 5 + 86400) % 86400;
    console.log(`\n开始拉取日志（起始时间: ${now.toLocaleTimeString()}）`);
    let lastProcessedTime = startTimeSec;
    let processedHashes = new Set();
    let isFetching = false;

    async function pullOnce() {
        if (isFetching) return;
        isFetching = true;
        try {
            const logs = await fetchRawLogs(serverConfig, 16 * 1024);
            const lines = logs.split(/\r?\n/);
            const newOutputLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const timeSec = extractTimeSec(line);
                if (timeSec === null) continue;
                if (timeSec < lastProcessedTime) continue;
                const hash = computeLineHash(lines, i);
                if (processedHashes.has(hash)) continue;

                processedHashes.add(hash);
                newOutputLines.push(line);
                if (timeSec > lastProcessedTime) lastProcessedTime = timeSec;
            }

            if (newOutputLines.length > 0) {
                console.log(`\n新日志 (${newOutputLines.length} 行):`);
                for (const line of newOutputLines) {
                    const formatted = line.replace(/^(\[\d{2}:\d{2}:\d{2}\])/, '\x1b[36m$1\x1b[0m');
                    console.log(formatted);
                }
            }
        } catch (err) {
            console.error(`\n⚠️ 拉取日志出错: ${err.message}`);
        } finally {
            isFetching = false;
        }
    }

    setTimeout(async () => { await pullOnce(); }, 1000);
    const interval = setInterval(async () => { await pullOnce(); }, 3000);

    process.on('SIGINT', () => {
        clearInterval(interval);
        console.log('\n🚪 已停止日志拉取');
        process.exit(0);
    });
}

async function checkRemoteDirectory(server, targetFilePath) {
    const targetDir = path.posix.dirname(targetFilePath);
    const dirToCheck = targetDir.endsWith('/') ? targetDir : targetDir + '/';

    const baseUrl = `${server.url}/api/files/list`;
    const query = {
        daemonId: server.daemonId,
        uuid: server.instanceId,
        target: dirToCheck,
        page: 0,
        page_size: 1,
        apikey: server.apiKey,
    };

    try {
        await doRequest('GET', baseUrl, { query });
    } catch (err) {
        return false;
    }

    return true;
}

async function uploadModulesZip(upload, pluginPackage, outputJsFile) {
    const { server, targetFile, autoPullLogs } = upload;
    if (!server || !targetFile) {
        console.warn('⚠️ 上传配置不完整，跳过上传');
        return false;
    }

    const isDev = pluginPackage && pluginPackage.dev === true;
    if (isDev) {
        console.log(`🔍 检查远程目录是否存在: ${path.posix.dirname(targetFile)}`);
        const dirExists = await checkRemoteDirectory(server, targetFile);
        if (!dirExists) {
            console.error(`❌ 远程目录不存在: ${path.posix.dirname(targetFile)}`);
            console.error('   请先上传 dev 版本插件（JAR）并重启服务器，然后重试。');
            return false;
        } else {
            console.log('✅ 远程目录存在，可以上传模块 ZIP');
        }
    }

    console.log(`\n📤 准备上传模块 ZIP 到 ${server.url}`);
    const uploadStartTime = Math.floor(Date.now() / 1000);

    try {
        const { password, addr } = await getUploadConfig(server, targetFile);
        console.log(`   获取凭证成功，原始上传主机地址: ${addr}`);

        let port = '80';
        if (addr.includes(':')) {
            const parts = addr.split(':');
            port = parts[1];
        }

        const panelUrl = new URL(server.url);
        const uploadHost = `${panelUrl.hostname}:${port}`;
        const uploadBaseUrl = `${panelUrl.protocol}//${uploadHost}`;

        console.log(`   实际上传地址: ${uploadBaseUrl}/upload/${password}`);

        const uploadResult = await uploadFileToDaemon(uploadBaseUrl, password, outputJsFile);
        console.log(`✅ 上传成功: ${uploadResult}`);

        if (autoPullLogs) {
            await startLogPulling(uploadStartTime, server);
        }

        return true;
    } catch (err) {
        console.error(`❌ 上传失败: ${err.message}`);
        return false;
    }
}

module.exports = {
    doRequest,
    getUploadConfig,
    uploadFileToDaemon,
    fetchRawLogs,
    startLogPulling,
    checkRemoteDirectory,
    uploadModulesZip
};
