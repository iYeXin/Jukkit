'use strict';

var callbacks = {
    unload: []
};

var bindEvent = function (eventName, callback) {
    switch (eventName) {
        case 'unload':
            callbacks.unload.push(callback);
            break;
        default:
            throw new Error('Unknown event: ' + eventName);
    }
};

jukkit.onUnload(function () {
    callbacks.unload.forEach(function (cb) {
        cb();
    });
});


module.exports = bindEvent;
