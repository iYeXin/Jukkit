const { main } = require('./.jukkit/build/index');

main().catch(err => {
    console.error('❌ 构建失败:', err.message);
    process.exit(1);
});
