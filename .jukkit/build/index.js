const fs = require('fs');
const path = require('path');
const { collectFiles, createZipFast, computeHash, createAssetsZip, getAdmZip } = require('./utils');
const { buildJar } = require('./jar-builder');
const { uploadModulesZip } = require('./mcsm-uploader');
const { runRspack, runTypeScript } = require('./compilers');

function loadConfig() {
    let projectConfig = {};
    let pluginConfig = {};

    const cwd = process.cwd();

    try {
        const rawProjectConfig = require(path.join(cwd, 'jukkit.config.js'));
        const fullConfig = rawProjectConfig.default || rawProjectConfig;
        projectConfig = fullConfig.project || {};
    } catch (err) {
        console.error('❌ 无法加载 jukkit.config.js：', err.message);
        process.exit(1);
    }

    try {
        const rawPluginConfig = require(path.join(cwd, 'configs', 'plugin.config.js'));
        pluginConfig = rawPluginConfig.default || rawPluginConfig;
    } catch (err) {
        console.log('ℹ️ 未找到 configs/plugin.config.js，跳过 JAR 打包');
    }

    return { projectConfig, pluginConfig };
}

async function buildModulesZip(projectConfig, pluginConfig) {
    const {
        srcDir = 'src',
        entry = 'index.js',
        init = null,
        assetsDir = 'assets',
        modulesDir = 'modules',
        output: outputJsFile,
        target = 'common',
        typescript = null
    } = projectConfig;

    const tsEnabled = typescript && typescript.enable === true;
    const tsConfigPath = typescript && typescript.configPath ? typescript.configPath : 'tsconfig.json';
    const tsEntry = typescript && typescript.entry ? typescript.entry : entry.replace(/\.js$/, '.ts');

    const initDir = init && init.dir ? init.dir : null;
    const initEntry = init && init.entry ? init.entry : 'init.js';

    if (!outputJsFile) {
        console.error('❌ 配置文件缺少 project.output 字段');
        process.exit(1);
    }

    if (!getAdmZip()) {
        console.error('❌ 缺少必要依赖 adm-zip。请运行 npm install adm-zip');
        process.exit(1);
    }

    if (tsEnabled) {
        console.log('🔷 TypeScript 模式已启用');
        console.log(`   配置文件: ${tsConfigPath}`);
        console.log(`   入口文件: ${tsEntry}`);

        try {
            await runTypeScript(tsConfigPath);
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

    return { outputJsFile, assetsZipInfo, rspackOutputDir, initDir, initEntry };
}

async function buildPluginJars(pluginConfig, buildInfo, projectConfig) {
    const { outputJsFile, assetsZipInfo, rspackOutputDir, initDir, initEntry } = buildInfo;
    const { templates, pluginPackage, targets } = pluginConfig;

    if (!pluginPackage) {
        console.log('ℹ️ 未配置 pluginPackage，跳过 JAR 打包');
        return;
    }

    const { target } = projectConfig;
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

        const initManifestPath = initDir && fs.existsSync(path.resolve(initDir)) ? 'init/' + initEntry : null;

        await buildJar(mergedPluginPackage, rspackOutputDir, 'index.js', initManifestPath, assetsZipInfo, initDir, templateJarPath, targetList.length > 1 ? targetName : null);
    }
}

async function main() {
    const { projectConfig, pluginConfig } = loadConfig();

    const buildInfo = await buildModulesZip(projectConfig, pluginConfig);

    if (Object.keys(pluginConfig).length > 0) {
        await buildPluginJars(pluginConfig, buildInfo, projectConfig);
    }

    if (pluginConfig.upload && pluginConfig.upload.enable) {
        await uploadModulesZip(pluginConfig.upload, pluginConfig.pluginPackage, buildInfo.outputJsFile);
    }
}

module.exports = {
    loadConfig,
    buildModulesZip,
    buildPluginJars,
    main
};
