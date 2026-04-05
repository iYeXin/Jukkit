const Logger = require('Logger');
const fetch = require('fetch');

const logger = new Logger('Hello');

const HITOKOTO_API = 'https://v1.hitokoto.cn/';

async function getHitokoto() {
    try {
        const response = await fetch(HITOKOTO_API);
        const data = await response.json();
        return {
            text: data.hitokoto || '获取一言失败',
            from: data.from || '',
            fromWho: data.from_who || '',
            type: data.type || ''
        };
    } catch (err) {
        logger.warn('获取一言失败: ' + err.message);
        return {
            text: '获取一言失败',
            from: '',
            fromWho: '',
            type: ''
        };
    }
}

function formatHitokoto(data) {
    var result = '§e' + data.text;
    if (data.from) {
        result += ' §7—— ' + data.from;
    }
    return result;
}

async function init() {
    jukkit.command('hello', async function (sender, cmd, label, args) {
        sender.sendMessage('§a正在获取一言...');
        const data = await getHitokoto();
        sender.sendMessage(formatHitokoto(data));
        return true;
    });

    const data = await getHitokoto();
    logger.info('一言: ' + data.text + (data.from ? ' —— ' + data.from : ''));

    logger.info('Hello 模块已加载');
}

module.exports = {
    init: init,
    getHitokoto: getHitokoto,
    formatHitokoto: formatHitokoto
};
