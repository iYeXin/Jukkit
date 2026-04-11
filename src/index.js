/// <reference path="../index.d.ts" />

const hello = require('./hello');

jukkit.onEnable(function () {
    hello.init();
});

jukkit.onDisable(function () {
    jukkit.log('已卸载');
});
