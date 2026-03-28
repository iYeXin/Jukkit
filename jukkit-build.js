const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createRequire } = require('module');

// 可选依赖：用于打包 JAR
let AdmZip;
try {
    AdmZip = require('adm-zip');
} catch (e) {
    // 如果未安装，仅打包 JAR 时会报错，但不影响其他功能
}

// ==================== 加载配置文件 ====================
const requireFromCwd = createRequire(__filename);
let config;
try {
    const rawConfig = requireFromCwd('./jukkit.config.js');
    config = rawConfig.default || rawConfig;
} catch (err) {
    console.error('❌ 无法加载 jukkit.config.js：', err.message);
    process.exit(1);
}

// 解构配置，提供默认值
const {
    project = {},
    pluginPackage = null,
    upload = null
} = config;

const {
    defaultModuleDir = 'modules',
    intry: entryFile,
    output: outputJsFile
} = project;

if (!entryFile || !outputJsFile) {
    console.error('❌ 配置文件缺少 project.intry 或 project.output 字段');
    process.exit(1);
}

// ==================== 模块展开相关函数 ====================
function getModulePath(moduleName) {
    return path.resolve(defaultModuleDir, `${moduleName}.js`);
}

function readModuleRaw(moduleName) {
    const filePath = getModulePath(moduleName);
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error(`❌ 读取模块失败: ${filePath}\n`, err.message);
        process.exit(1);
    }
}

function expandContent(content, currentFilePath, processedStack = []) {
    const lines = content.split(/\r?\n/);
    const resultLines = [];

    const includeRegex = /^\s*"include\s+([^"]+)"\s*;?\s*$/;
    const includeAllRegex = /^\s*"includeAll\s+([^"]+)"\s*;?\s*$/;

    for (let line of lines) {
        let match;

        if ((match = line.match(includeAllRegex))) {
            const moduleName = match[1].trim();
            const modulePath = getModulePath(moduleName);

            if (processedStack.includes(modulePath)) {
                console.error(`❌ 检测到循环依赖: ${modulePath}`);
                console.error(`   调用栈: ${[...processedStack, modulePath].join(' -> ')}`);
                process.exit(1);
            }

            const rawContent = readModuleRaw(moduleName);
            const expanded = expandContent(rawContent, modulePath, [...processedStack, currentFilePath]);
            resultLines.push(expanded);
        } else if ((match = line.match(includeRegex))) {
            const moduleName = match[1].trim();
            const rawContent = readModuleRaw(moduleName);
            resultLines.push(rawContent);
        } else {
            resultLines.push(line);
        }
    }

    return resultLines.join('\n');
}

// ==================== HTTP 请求封装 ====================
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            return json;
        } catch { }
        return text;
    }
}

// ==================== 上传与日志拉取相关 ====================
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
    return result.data; // { password, addr }
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
    const startTimeSec = (uploadStartTime - 5) % 86400 + 8 * 60 * 60;
    let lastProcessedTime = startTimeSec;
    let processedHashes = new Set();
    let isFetching = false;

    console.log(`\n开始拉取日志（起始时间: ${new Date(uploadStartTime * 1000).toLocaleTimeString()}）`);

    async function pullOnce() {
        if (isFetching) return;
        isFetching = true;
        try {
            const logs = await fetchRawLogs(serverConfig, 4 * 1024);
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

// ==================== JAR 打包函数 ====================
async function buildJar(pluginCfg, mainJsPath) {
    if (!AdmZip) {
        console.error('❌ 缺少打包 JAR 所需的依赖 adm-zip。请运行 npm install adm-zip');
        process.exit(1);
    }

    const { name, version, description, author, output: jarOutput, templateJar, dev } = pluginCfg;

    // 查找模板 JAR
    const templateJarPath = path.resolve(templateJar);
    if (!fs.existsSync(templateJarPath)) {
        console.error(`❌ 模板 JAR 不存在: ${templateJarPath}`);
        process.exit(1);
    }

    // 确保输出目录存在
    const outputDir = path.dirname(jarOutput);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📦 打包插件 JAR: ${name} v${version}${dev ? ' [DEV]' : ''}`);
    console.log(`   模板: ${templateJarPath}`);
    console.log(`   输出: ${jarOutput}`);

    const zip = new AdmZip(templateJarPath);

    // 生成 plugin.json
    const pluginJson = {
        name,
        version,
        description: description || '',
        author: author || 'iyexin',
        main: 'main.js',
        apiVersion: '1.20',
        dev: dev || false,
        depends: [],
        softDepends: []
    };
    zip.updateFile('plugin.json', Buffer.from(JSON.stringify(pluginJson, null, 4), 'utf8'));

    // 生成 plugin.yml
    const pluginYml = `name: ${name}
version: ${version}
main: iyexin.jukkit.core.JsPluginTemplate
description: ${description || ''}
author: ${author || 'iyexin'}
api-version: 1.20
`;
    zip.updateFile('plugin.yml', Buffer.from(pluginYml, 'utf8'));

    // 添加 main.js
    if (!fs.existsSync(mainJsPath)) {
        console.error(`❌ 主 JS 文件不存在: ${mainJsPath}`);
        process.exit(1);
    }
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    zip.updateFile('main.js', Buffer.from(mainJsContent, 'utf8'));

    zip.writeZip(jarOutput);
    console.log(`✅ JAR 打包完成: ${path.resolve(jarOutput)}`);
}

// ==================== 远程目录检查 ====================
async function checkRemoteDirectory(server, targetFilePath) {
    // 提取目录路径（例如 /plugins/dev_QYMC/）
    const targetDir = path.posix.dirname(targetFilePath);
    // 确保目录以 / 结尾（API 可能需要）
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
        const result = await doRequest('GET', baseUrl, { query });
    } catch (err) {
        // 请求失败视为目录不存在
        return false;
    }

    return true;
}

// ==================== 主流程 ====================
(async () => {
    // 1. 构建模块合并，生成 JS 文件
    try {
        const entryPath = path.resolve(entryFile);
        const entryContent = fs.readFileSync(entryPath, 'utf8');
        const finalContent = expandContent(entryContent, entryPath);

        const outputDir = path.dirname(outputJsFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputJsFile, finalContent, 'utf8');
        console.log(`✅ 模块合并完成: ${outputJsFile}`);
    } catch (err) {
        console.error('❌ 构建失败：', err.message);
        process.exit(1);
    }

    // 2. 如果配置了 pluginPackage，则打包 JAR
    if (pluginPackage) {
        await buildJar(pluginPackage, outputJsFile);
    } else {
        console.log('ℹ️ 未配置 pluginPackage，跳过 JAR 打包');
    }

    // 3. 处理上传
    if (upload && upload.enable) {
        const { server, targetFile, autoPullLogs } = upload;
        if (!server || !targetFile) {
            console.warn('⚠️ 上传配置不完整，跳过上传');
            process.exit(0);
        }

        // 检查是否 dev 模式且需要检查目录存在
        const isDev = pluginPackage && pluginPackage.dev === true;
        if (isDev) {
            console.log(`🔍 检查远程目录是否存在: ${path.posix.dirname(targetFile)}`);
            const dirExists = await checkRemoteDirectory(server, targetFile);
            if (!dirExists) {
                console.error(`❌ 远程目录不存在: ${path.posix.dirname(targetFile)}`);
                console.error('   请先上传 dev 版本插件（JAR）并重启服务器，然后重试。');
                process.exit(1);
            } else {
                console.log('✅ 远程目录存在，可以上传 JS 文件');
            }
        }

        console.log(`\n📤 准备上传文件到 ${server.url}`);
        const uploadStartTime = Math.floor(Date.now() / 1000);

        try {
            // 获取上传凭证
            const { password, addr } = await getUploadConfig(server, targetFile);
            console.log(`   获取凭证成功，原始上传主机地址: ${addr}`);

            // 解析端口
            let port = '80';
            if (addr.includes(':')) {
                const parts = addr.split(':');
                port = parts[1];
            }

            // 从配置的 server.url 中提取域名
            const serverUrlObj = new URL(server.url);
            const serverHostname = serverUrlObj.hostname;
            const uploadBaseUrl = `http://${serverHostname}:${port}`;
            console.log(`   自动填充公网地址: ${uploadBaseUrl}`);

            // 上传 JS 文件
            const result = await uploadFileToDaemon(uploadBaseUrl, password, outputJsFile);
            console.log(`   ✅ 上传成功: ${result}`);

            // 如果启用自动拉取日志
            if (autoPullLogs) {
                await startLogPulling(uploadStartTime, server);
            } else {
                console.log('ℹ️ 自动拉取日志未启用');
            }
        } catch (err) {
            console.error(`❌ 上传失败: ${err.message}`);
            process.exit(1);
        }
    } else {
        console.log('ℹ️ 未启用文件上传');
    }
})();