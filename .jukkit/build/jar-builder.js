const fs = require('fs');
const path = require('path');
const { collectFiles, createZipFast, computeHash, getAdmZip } = require('./utils');

async function buildJar(pluginCfg, srcDir, entryFile, initFile, assetsZipInfo, initDir, templateJarPath, targetName) {
    const AdmZip = getAdmZip();
    if (!AdmZip) {
        throw new Error('缺少打包 JAR 所需的依赖 adm-zip。请运行 npm install adm-zip');
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
        throw new Error(`模板 JAR 不存在: ${templateJarPath}`);
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

    return finalJarOutput;
}

module.exports = {
    buildJar
};
