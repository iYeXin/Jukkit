const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let AdmZip;
try {
    AdmZip = require('adm-zip');
} catch (e) {
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
    if (!AdmZip) {
        throw new Error('缺少 adm-zip 依赖');
    }
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

function getAdmZip() {
    return AdmZip;
}

module.exports = {
    collectFiles,
    computeHash,
    createZipFast,
    createAssetsZip,
    getAdmZip
};
