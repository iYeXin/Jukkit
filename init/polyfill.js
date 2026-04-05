'use strict';

var bindEvent = require('./bindEvent');

var toArray = function (args) {
    var arr = [];
    for (var i = 0; i < args.length; i++) {
        arr.push(args[i]);
    }
    return arr;
};

if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
            return false;
        }
        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len + n, 0);
        while (k < len) {
            if (o[k] === searchElement) {
                return true;
            }
            k++;
        }
        return false;
    };
}

var _timeout = (function () {
    var timers = {};
    var _setTimeout = function (callback, delay) {
        var args = toArray(arguments).slice(2);
        var taskId = jukkit.runAsyncLater(delay, function () {
            try {
                callback.apply(null, args);
                delete timers[taskId];
            } catch (error) {
                jukkit.error('Error in setTimeout callback: ' + error);
            }
        });
        timers[taskId] = 1;
        return taskId;
    };
    var _clearTimeout = function (taskId) {
        try {
            jukkit.cancelTask(taskId);
            delete timers[taskId];
        } catch (error) {
            jukkit.error('Error clearing timeout: ' + error);
        }
    };
    bindEvent('unload', function () {
        Object.keys(timers).forEach(function (key) {
            jukkit.cancelTask(key);
        });
    });
    return {
        setTimeout: _setTimeout,
        clearTimeout: _clearTimeout
    };
})();

var _interval = (function () {
    var intervals = {};
    var counter = 0;
    var setInterval = function (callback, delay) {
        var args = toArray(arguments).slice(2);
        var id = ++counter;
        var schedule = function () {
            intervals[id] = setTimeout(function () {
                if (intervals[id]) {
                    try {
                        callback.apply(null, args);
                    } catch (error) {
                        jukkit.error('Error in setInterval callback: ' + error);
                    }
                    if (intervals[id]) {
                        schedule();
                    }
                }
            }, delay);
        };
        schedule();
        return id;
    };
    var clearInterval = function (id) {
        clearTimeout(intervals[id]);
        delete intervals[id];
    };
    return {
        setInterval: setInterval,
        clearInterval: clearInterval
    };
})();

var _console = (function () {
    var formatValue = function (value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (typeof value === 'function') return '[Function]';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    };
    var formatArgs = function (args) {
        if (args.length === 0) return '';
        if (args.length === 1) return formatValue(args[0]);
        var result = String(args[0]);
        var argIndex = 1;
        result = result.replace(/%[sdifjoO%]/g, function (match) {
            if (match === '%%') return '%';
            if (argIndex >= args.length) return match;
            var arg = args[argIndex++];
            switch (match) {
                case '%s': return String(arg);
                case '%d':
                case '%i': return parseInt(arg, 10) || 0;
                case '%f': return parseFloat(arg) || 0;
                case '%j': return JSON.stringify(arg);
                case '%o':
                case '%O': return formatValue(arg);
                default: return match;
            }
        });
        while (argIndex < args.length) {
            result += ' ' + formatValue(args[argIndex++]);
        }
        return result;
    };
    var argsToArray = function (args) {
        var arr = [];
        for (var i = 0; i < args.length; i++) {
            arr.push(args[i]);
        }
        return arr;
    };
    return {
        log: function () {
            jukkit.log(formatArgs(argsToArray(arguments)));
        },
        info: function () {
            jukkit.log('[INFO] ' + formatArgs(argsToArray(arguments)));
        },
        warn: function () {
            jukkit.warn(formatArgs(argsToArray(arguments)));
        },
        error: function () {
            jukkit.error(formatArgs(argsToArray(arguments)));
        }
    };
})();

module.exports = {
    setTimeout: _timeout.setTimeout,
    clearTimeout: _timeout.clearTimeout,
    setInterval: _interval.setInterval,
    clearInterval: _interval.clearInterval,
    console: _console
};
