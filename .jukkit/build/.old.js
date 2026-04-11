const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

let AdmZip;
try {
    AdmZip = require('adm-zip');
} catch (e) {
}

const requireFromCwd = require('module').createRequire(__filename);
let config;
try {
    const rawConfig = requireFromCwd('./jukkit.config.js');
    config = rawConfig.default || rawConfig;
} catch (err) {
    console.error('❌ 无法加载 jukkit.config.js：', err.message);
    process.exit(1);
}

const {
    project = {},
    pluginPackage = null,
    upload = null,
    templates = {},
    targets = {}
} = config;

const {
    srcDir = 'src',
    entry = 'index.js',
    init = null,
    assetsDir = 'assets',
    modulesDir = 'modules',
    output: outputJsFile,
    target = 'common',
    typescript = null
} = project;

const tsEnabled = typescript && typescript.enable === true;
const tsConfigPath = typescript && typescript.configPath ? typescript.configPath : 'tsconfig.json';
const tsEntry = typescript && typescript.entry ? typescript.entry : entry.replace(/\.js$/, '.ts');

const initDir = init && init.dir ? init.dir : null;
const initEntry = init && init.entry ? init.entry : 'init.js';

if (!outputJsFile) {
    console.error('❌ 配置文件缺少 project.output 字段');
    process.exit(1);
}

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
    const startTimeSec = (uploadStartTime - 5) % 86400 + 8 * 60 * 60;
    let lastProcessedTime = startTimeSec;
    let processedHashes = new Set();
    let isFetching = false;

    console.log(`\n开始拉取日志（起始时间: ${new Date(uploadStartTime * 1000).toLocaleTimeString()}）`);

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

function collectFiles(dir, baseDir = '') {
    const files = [];
    if (!fs.existsSync(dir)) {
        return files;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            files.push(...collectFiles(fullPath, relativePath));
        } else if (entry.isFile()) {
            files.push({
                path: relativePath,
                fullPath: fullPath
            });
        }
    }

    return files;
}

function computeHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

function createZipFast(files) {
    const zip = new AdmZip();
    for (const file of files) {
        const content = fs.readFileSync(file.fullPath);
        const zipPath = file.path.replace(/\\/g, '/');
        zip.addFile(zipPath, content);
    }
    return zip;
}

function createAssetsZip(assetsDirPath) {
    if (!fs.existsSync(assetsDirPath)) {
        return null;
    }
    const files = collectFiles(assetsDirPath);
    if (files.length === 0) {
        return null;
    }
    const zip = createZipFast(files);
    const zipBuffer = zip.toBuffer();
    const hash = computeHash(zipBuffer);
    return { zip, files, hash };
}

async function buildJar(pluginCfg, srcDir, entryFile, initFile, assetsZipInfo, initDir, templateJarPath, targetName) {
    if (!AdmZip) {
        console.error('❌ 缺少打包 JAR 所需的依赖 adm-zip。请运行 npm install adm-zip');
        process.exit(1);
    }

    const {
        name,
        version,
        description,
        author,
        authors,
        website,
        prefix,
        apiVersion,
        load,
        depend,
        softdepend,
        loadbefore,
        output: jarOutput,
        dev
    } = pluginCfg;

    if (!fs.existsSync(templateJarPath)) {
        console.error(`❌ 模板 JAR 不存在: ${templateJarPath}`);
        process.exit(1);
    }

    let finalJarOutput = jarOutput;
    if (targetName) {
        const ext = path.extname(jarOutput);
        const base = path.basename(jarOutput, ext);
        const dir = path.dirname(jarOutput);
        finalJarOutput = path.join(dir, `${base}-${targetName}${ext}`);
    }

    const outputDir = path.dirname(finalJarOutput);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📦 打包插件 JAR: ${name} v${version}${dev ? ' [DEV]' : ''}${targetName ? ` [${targetName}]` : ''}`);
    console.log(`   模板: ${templateJarPath}`);
    console.log(`   输出: ${finalJarOutput}`);

    const zip = new AdmZip(templateJarPath);

    const pluginJson = {
        name,
        version,
        description: description || '',
        author: author || 'iyexin',
        authors: authors || [],
        website: website || '',
        prefix: prefix || name,
        main: 'main.js',
        apiVersion: apiVersion || '1.20',
        load: load || 'POSTWORLD',
        depend: depend || [],
        softdepend: softdepend || [],
        loadbefore: loadbefore || [],
        dev: dev || false
    };
    zip.updateFile('plugin.json', Buffer.from(JSON.stringify(pluginJson, null, 4), 'utf8'));

    let pluginYml = `name: ${name}
version: ${version}
main: iyexin.jukkit.core.JsPluginTemplate
description: ${description || ''}
`;

    if (authors && authors.length > 0) {
        pluginYml += `authors: [${authors.map(a => `'${a}'`).join(', ')}]\n`;
    } else if (author) {
        pluginYml += `author: ${author}\n`;
    }

    if (website) {
        pluginYml += `website: ${website}\n`;
    }

    if (prefix) {
        pluginYml += `prefix: ${prefix}\n`;
    }

    pluginYml += `api-version: ${apiVersion || '1.20'}\n`;

    if (load) {
        pluginYml += `load: ${load}\n`;
    }

    if (depend && depend.length > 0) {
        pluginYml += `depend: [${depend.map(d => `'${d}'`).join(', ')}]\n`;
    }

    if (softdepend && softdepend.length > 0) {
        pluginYml += `softdepend: [${softdepend.map(d => `'${d}'`).join(', ')}]\n`;
    }

    if (loadbefore && loadbefore.length > 0) {
        pluginYml += `loadbefore: [${loadbefore.map(d => `'${d}'`).join(', ')}]\n`;
    }

    zip.updateFile('plugin.yml', Buffer.from(pluginYml, 'utf8'));

    const srcFiles = collectFiles(srcDir);

    if (initDir && fs.existsSync(initDir)) {
        const initFiles = collectFiles(initDir, 'init');
        srcFiles.push(...initFiles);
    }

    const modulesZip = createZipFast(srcFiles);
    const modulesZipBuffer = modulesZip.toBuffer();
    const modulesHash = computeHash(modulesZipBuffer);

    zip.deleteFile('.jukkit/modules.zip');
    zip.addFile('.jukkit/modules.zip', modulesZipBuffer);
    console.log(`   模块 ZIP 包含 ${srcFiles.length} 个文件`);
    console.log(`   构建哈希: ${modulesHash}`);

    const manifest = {
        entryPoint: entryFile,
        version: '1.2.0',
        dependencies: {},
        nodeCoreModules: [],
        archive: 'modules.zip',
        hash: modulesHash
    };

    if (initFile) {
        manifest.init = initFile;
    }

    if (assetsZipInfo) {
        zip.deleteFile('.jukkit/assets.zip');
        zip.addFile('.jukkit/assets.zip', assetsZipInfo.zip.toBuffer());
        manifest.assetsArchive = 'assets.zip';
        manifest.assetsHash = assetsZipInfo.hash;
        console.log(`   资源 ZIP 包含 ${assetsZipInfo.files.length} 个文件`);
        console.log(`   资源哈希: ${assetsZipInfo.hash}`);
    }

    zip.deleteFile('.jukkit/manifest.json');
    zip.addFile('.jukkit/manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

    zip.writeZip(finalJarOutput);
    console.log(`✅ JAR 打包完成: ${path.resolve(finalJarOutput)}`);
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

function runRspack() {
    return new Promise((resolve, reject) => {
        console.log('\n🔧 运行 Rspack 编译...');

        const rspack = spawn('npx', ['rspack', 'build', '--config', 'rspack.config.js'], {
            cwd: process.cwd(),
            shell: true,
            stdio: 'inherit'
        });

        rspack.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Rspack 编译完成');
                resolve();
            } else {
                reject(new Error(`Rspack 编译失败，退出码: ${code}`));
            }
        });

        rspack.on('error', (err) => {
            reject(new Error(`Rspack 启动失败: ${err.message}`));
        });
    });
}

function runTypeScript() {
    return new Promise((resolve, reject) => {
        console.log('\n🔷 运行 TypeScript 编译...');

        const tsc = spawn('npx', ['tsc', '-p', tsConfigPath], {
            cwd: process.cwd(),
            shell: true,
            stdio: 'inherit'
        });

        tsc.on('close', (code) => {
            if (code === 0) {
                console.log('✅ TypeScript 编译完成');
                resolve();
            } else {
                reject(new Error(`TypeScript 编译失败，退出码: ${code}`));
            }
        });

        tsc.on('error', (err) => {
            reject(new Error(`TypeScript 启动失败: ${err.message}`));
        });
    });
}

(async () => {
    if (!AdmZip) {
        console.error('❌ 缺少必要依赖 adm-zip。请运行 npm install adm-zip');
        process.exit(1);
    }

    if (tsEnabled) {
        console.log('🔷 TypeScript 模式已启用');
        console.log(`   配置文件: ${tsConfigPath}`);
        console.log(`   入口文件: ${tsEntry}`);

        try {
            await runTypeScript();
        } catch (err) {
            console.error(`❌ ${err.message}`);
            process.exit(1);
        }
    }

    try {
        await runRspack();
    } catch (err) {
        console.error(`❌ ${err.message}`);
        process.exit(1);
    }

    const rspackOutputDir = path.resolve('dist/rspack');
    const rspackIndexFile = path.join(rspackOutputDir, 'index.js');

    if (!fs.existsSync(rspackIndexFile)) {
        console.error(`❌ Rspack 输出文件不存在: ${rspackIndexFile}`);
        process.exit(1);
    }

    console.log(`\n📦 打包编译后的代码...`);
    console.log(`   编译输出目录: ${rspackOutputDir}`);

    const outputDir = path.dirname(outputJsFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = collectFiles(rspackOutputDir);

    if (initDir) {
        const initDirPath = path.resolve(initDir);
        if (fs.existsSync(initDirPath)) {
            const initFiles = collectFiles(initDirPath, 'init');
            files.push(...initFiles);
            console.log(`   init 目录: ${initDir}`);
            console.log(`   init 文件数: ${initFiles.length}`);
        }
    }

    if (modulesDir) {
        const modulesDirPath = path.resolve(modulesDir);
        if (fs.existsSync(modulesDirPath)) {
            const modulesFiles = collectFiles(modulesDirPath, 'modules');
            files.push(...modulesFiles);
            console.log(`   modules 目录: ${modulesDir}`);
            console.log(`   modules 文件数: ${modulesFiles.length}`);
        }
    }

    const zip = createZipFast(files);

    const zipBuffer = zip.toBuffer();
    const hash = computeHash(zipBuffer);

    const manifest = {
        entryPoint: 'index.js',
        version: '1.2.0',
        dependencies: {},
        nodeCoreModules: [],
        hash: hash
    };

    if (initDir) {
        const initDirPath = path.resolve(initDir);
        if (fs.existsSync(initDirPath)) {
            manifest.init = 'init/' + initEntry;
        }
    }

    const assetsDirPath = path.resolve(assetsDir);
    const assetsZipInfo = createAssetsZip(assetsDirPath);

    if (assetsZipInfo) {
        zip.addFile('assets.zip', assetsZipInfo.zip.toBuffer());
        manifest.assetsHash = assetsZipInfo.hash;
        console.log(`   资源目录: ${assetsDir}`);
        console.log(`   资源文件数: ${assetsZipInfo.files.length}`);
    }

    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

    fs.writeFileSync(outputJsFile, zip.toBuffer());
    console.log(`✅ 模块 ZIP 生成完成: ${outputJsFile}`);
    console.log(`   包含 ${files.length} 个文件`);
    console.log(`   构建哈希: ${hash}`);

    if (pluginPackage) {
        const initManifestPath = initDir && fs.existsSync(path.resolve(initDir)) ? 'init/' + initEntry : null;

        const targetList = Array.isArray(target) ? target : [target];

        for (const targetName of targetList) {
            const templatePath = templates[targetName];
            if (!templatePath) {
                console.error(`❌ 未找到目标 "${targetName}" 的模板配置`);
                console.error(`   可用的模板: ${Object.keys(templates).join(', ')}`);
                process.exit(1);
            }

            const templateJarPath = path.resolve(templatePath);
            if (!fs.existsSync(templateJarPath)) {
                console.error(`❌ 模板 JAR 不存在: ${templateJarPath}`);
                process.exit(1);
            }

            const targetConfig = targets[targetName] || {};
            const mergedPluginPackage = { ...pluginPackage, ...targetConfig };

            await buildJar(mergedPluginPackage, rspackOutputDir, 'index.js', initManifestPath, assetsZipInfo, initDir, templateJarPath, targetList.length > 1 ? targetName : null);
        }
    } else {
        console.log('ℹ️ 未配置 pluginPackage，跳过 JAR 打包');
    }

    if (upload && upload.enable) {
        const { server, targetFile, autoPullLogs } = upload;
        if (!server || !targetFile) {
            console.warn('⚠️ 上传配置不完整，跳过上传');
            process.exit(0);
        }

        const isDev = pluginPackage && pluginPackage.dev === true;
        if (isDev) {
            console.log(`🔍 检查远程目录是否存在: ${path.posix.dirname(targetFile)}`);
            const dirExists = await checkRemoteDirectory(server, targetFile);
            if (!dirExists) {
                console.error(`❌ 远程目录不存在: ${path.posix.dirname(targetFile)}`);
                console.error('   请先上传 dev 版本插件（JAR）并重启服务器，然后重试。');
                process.exit(1);
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

            const serverUrlObj = new URL(server.url);
            const serverHostname = serverUrlObj.hostname;
            const uploadBaseUrl = `http://${serverHostname}:${port}`;
            console.log(`   自动填充公网地址: ${uploadBaseUrl}`);

            const result = await uploadFileToDaemon(uploadBaseUrl, password, outputJsFile);
            console.log(`   ✅ 上传成功: ${result}`);
            console.log(`   📦 ZIP 包含所有模块和资源，热重载将加载完整代码`);

            if (autoPullLogs) {
                await startLogPulling(uploadStartTime, server);
            } else {
                console.log('ℹ️ 自动拉取日志未启用');
            }
        } catch (err) {
            console.error(`❌ 上传失败: ${err.message}`);
            process.exit(1);
        }
    }
})();