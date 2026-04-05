/// <reference path="../index.d.ts" />

const hello = require('./hello');

jukkit.log('插件正在加载');

jukkit.onEnable(function () {
    hello.init();
});

jukkit.onDisable(function () {
    jukkit.log('插件已卸载');
});
