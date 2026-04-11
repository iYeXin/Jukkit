const { spawn } = require('child_process');

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

function runTypeScript(tsConfigPath) {
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

module.exports = {
    runRspack,
    runTypeScript
};
