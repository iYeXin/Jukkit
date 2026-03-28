(() => {
    const logger = new Logger('Hello');

    jukkit.command('hello', (sender, cmd, label, args) => {
        sender.sendMessage('§aHello, ' + sender.getName() + '!');
        return true;
    });

    jukkit.on('PlayerJoinEvent', (event) => {
        const player = event.getPlayer();
        player.sendMessage('§e欢迎来到服务器!');
    });

    logger.info('Hello 模块已加载');
})();
