'use strict';

const polyfill = require('./polyfill');
const bindEvent = require('./bindEvent');
const fetch = require('./fetch');

globalThis.setTimeout = polyfill.setTimeout;
globalThis.clearTimeout = polyfill.clearTimeout;
globalThis.setInterval = polyfill.setInterval;
globalThis.clearInterval = polyfill.clearInterval;
globalThis.console = polyfill.console;
globalThis._bindEvent = bindEvent;
globalThis._fetch = fetch;
globalThis.fetch = fetch;

globalThis.Promise = null;

// console.log('init');
