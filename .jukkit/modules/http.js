const HttpServer = com.sun.net.httpserver.HttpServer;
const HttpHandler = com.sun.net.httpserver.HttpHandler;
const HttpExchange = com.sun.net.httpserver.HttpExchange;
const InetSocketAddress = java.net.InetSocketAddress;
const StandardCharsets = java.nio.charset.StandardCharsets;
const BufferedReader = java.io.BufferedReader;
const InputStreamReader = java.io.InputStreamReader;
const ByteArrayInputStream = java.io.ByteArrayInputStream;
const StringBuilder = java.lang.StringBuilder;
const CountDownLatch = java.util.concurrent.CountDownLatch;
const TimeUnit = java.util.concurrent.TimeUnit;

const bindEvent = require('./bindEvent');

var servers = [];

var toJsMap = function (javaMap) {
    var obj = {};
    if (!javaMap) return obj;
    var iter = javaMap.entrySet().iterator();
    while (iter.hasNext()) {
        var entry = iter.next();
        var key = entry.getKey();
        if (key !== null) {
            var values = entry.getValue();
            var valuesArray = [];
            var valueIter = values.iterator();
            while (valueIter.hasNext()) {
                valuesArray.push(valueIter.next());
            }
            obj[key] = valuesArray.length === 1 ? valuesArray[0] : valuesArray;
        }
    }
    return obj;
};

var parseQueryString = function (queryString) {
    var params = {};
    if (!queryString) return params;

    var pairs = queryString.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair.length === 2) {
            var key = decodeURIComponent(pair[0]);
            var value = decodeURIComponent(pair[1]);
            if (params[key]) {
                if (Array.isArray(params[key])) {
                    params[key].push(value);
                } else {
                    params[key] = [params[key], value];
                }
            } else {
                params[key] = value;
            }
        }
    }
    return params;
};

var IncomingMessage = function (exchange) {
    var reqBodyStream = exchange.getRequestBody();
    var bodyBytes = null;

    var baos = new java.io.ByteArrayOutputStream();
    var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 8192);
    var bytesRead;
    while ((bytesRead = reqBodyStream.read(buffer)) !== -1) {
        baos.write(buffer, 0, bytesRead);
    }
    var allBytes = baos.toByteArray();
    if (allBytes.length > 0) {
        bodyBytes = allBytes;
    }
    baos.close();

    var uri = exchange.getRequestURI().toString();
    var pathParts = uri.split('?');
    var path = pathParts[0];
    var queryString = pathParts.length > 1 ? pathParts[1] : '';

    this.method = exchange.getRequestMethod();
    this.url = uri;
    this.path = path;
    this.queryString = queryString;
    this.query = parseQueryString(queryString);
    this.headers = toJsMap(exchange.getRequestHeaders());
    this._exchange = exchange;
    this._bodyBytes = bodyBytes;
    this._bodyUsed = false;
    this.readable = true;

    var hostHeader = this.headers['Host'] || this.headers['host'] || '';
    this.host = hostHeader;
    this.protocol = 'HTTP/1.1';
};

IncomingMessage.prototype.on = function (event, callback) {
    this['_' + event] = callback;
    return this;
};

IncomingMessage.prototype.emit = function (event, data) {
    if (this['_' + event]) {
        this['_' + event](data);
    }
    return this;
};

IncomingMessage.prototype.setEncoding = function (encoding) {
    this._encoding = encoding;
    return this;
};

IncomingMessage.prototype.read = function () {
    if (this._bodyUsed) return null;
    this._bodyUsed = true;

    if (!this._bodyBytes) return null;

    if (this._encoding) {
        return new java.lang.String(this._bodyBytes, this._encoding);
    }

    return this._bodyBytes;
};

IncomingMessage.prototype.text = function () {
    if (this._bodyUsed) return Promise.resolve(null);
    this._bodyUsed = true;

    if (!this._bodyBytes) return Promise.resolve('');

    return Promise.resolve(new java.lang.String(this._bodyBytes, StandardCharsets.UTF_8));
};

IncomingMessage.prototype.json = function () {
    var self = this;
    return this.text().then(function (text) {
        if (!text) return null;
        return JSON.parse(text);
    });
};

var ServerResponse = function (exchange) {
    this._exchange = exchange;
    this._headersSent = false;
    this._finished = false;
    this.statusCode = 200;
    this.statusMessage = 'OK';
    this.headers = {};
    this.headersSent = false;
    this.writable = true;
    this._chunks = [];
    this._latch = new CountDownLatch(1);
};

ServerResponse.prototype.on = function (event, callback) {
    this['_' + event] = callback;
    return this;
};

ServerResponse.prototype.emit = function (event, data) {
    if (this['_' + event]) {
        this['_' + event](data);
    }
    return this;
};

ServerResponse.prototype.setHeader = function (name, value) {
    if (this._headersSent) {
        throw new Error('Headers already sent');
    }
    this.headers[name] = value;
    return this;
};

ServerResponse.prototype.getHeader = function (name) {
    return this.headers[name];
};

ServerResponse.prototype.removeHeader = function (name) {
    delete this.headers[name];
    return this;
};

ServerResponse.prototype.getHeaders = function () {
    return this.headers;
};

ServerResponse.prototype.hasHeader = function (name) {
    return this.headers.hasOwnProperty(name);
};

ServerResponse.prototype.writeHead = function (statusCode, statusMessage, headers) {
    if (this._headersSent) return this;

    if (typeof statusMessage === 'object') {
        headers = statusMessage;
        statusMessage = null;
    }

    this.statusCode = statusCode;
    if (statusMessage) this.statusMessage = statusMessage;

    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                this.headers[key] = headers[key];
            }
        }
    }

    this._headersSent = true;
    this.headersSent = true;
    return this;
};

ServerResponse.prototype.write = function (chunk, encoding) {
    if (this._finished) {
        throw new Error('Response already finished');
    }

    if (!this._headersSent) {
        this.writeHead(this.statusCode);
    }

    if (typeof chunk === 'string') {
        chunk = new java.lang.String(chunk).getBytes(encoding || StandardCharsets.UTF_8);
    }

    this._chunks.push(chunk);
    return true;
};

ServerResponse.prototype.end = function (data, encoding, callback) {
    if (this._finished) return this;

    if (typeof data === 'function') {
        callback = data;
        data = null;
    } else if (typeof encoding === 'function') {
        callback = encoding;
        encoding = null;
    }

    if (data) {
        this.write(data, encoding);
    }

    this._finished = true;
    this.writable = false;

    if (!this._headersSent) {
        this.writeHead(this.statusCode);
    }

    var responseHeaders = this._exchange.getResponseHeaders();
    for (var key in this.headers) {
        if (this.headers.hasOwnProperty(key)) {
            responseHeaders.set(key, this.headers[key]);
        }
    }

    if (!responseHeaders.get('Content-Type')) {
        responseHeaders.set('Content-Type', 'text/plain; charset=utf-8');
    }

    var totalLength = 0;
    for (var i = 0; i < this._chunks.length; i++) {
        totalLength += this._chunks[i].length;
    }

    this._exchange.sendResponseHeaders(this.statusCode, totalLength > 0 ? totalLength : -1);

    if (totalLength > 0) {
        var os = this._exchange.getResponseBody();
        for (var i = 0; i < this._chunks.length; i++) {
            os.write(this._chunks[i]);
        }
        os.flush();
        os.close();
    } else {
        this._exchange.getResponseBody().close();
    }

    this.emit('finish');
    this.emit('close');

    if (callback) callback();

    this._latch.countDown();

    return this;
};

ServerResponse.prototype.json = function (data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
    return this;
};

ServerResponse.prototype.send = function (data) {
    if (typeof data === 'object') {
        this.json(data);
    } else {
        this.end(String(data));
    }
    return this;
};

ServerResponse.prototype.redirect = function (statusCode, url) {
    if (typeof statusCode === 'string') {
        url = statusCode;
        statusCode = 302;
    }
    this.writeHead(statusCode, { 'Location': url });
    this.end();
    return this;
};

var Server = function (requestListener) {
    this._server = null;
    this._requestListener = requestListener;
    this._closed = false;
    this.listening = false;
    this._address = null;
};

Server.prototype.on = function (event, callback) {
    this['_' + event] = callback;
    return this;
};

Server.prototype.emit = function (event, data) {
    if (this['_' + event]) {
        this['_' + event](data);
    }
    return this;
};

Server.prototype.listen = function (port, hostname, backlog, callback) {
    var self = this;

    if (typeof hostname === 'function') {
        callback = hostname;
        hostname = null;
    } else if (typeof backlog === 'function') {
        callback = backlog;
        backlog = null;
    }

    port = port || 8080;
    hostname = hostname || '0.0.0.0';

    var address = new InetSocketAddress(hostname, port);
    var httpServer = HttpServer.create(address, 0);

    this._server = httpServer;
    this._address = address;

    var requestListener = this._requestListener;

    httpServer.createContext('/', new HttpHandler({
        handle: function (exchange) {
            var req = new IncomingMessage(exchange);
            var res = new ServerResponse(exchange);

            try {
                if (requestListener) {
                    requestListener(req, res);

                    if (!res._finished) {
                        res._latch.await(30, TimeUnit.SECONDS);
                    }
                }
            } catch (e) {
                if (!res._headersSent) {
                    res.writeHead(500);
                    res.end('Internal Server Error');
                }
            }
        }
    }));

    httpServer.setExecutor(null);

    bindEvent('unload', function () {
        self.close();
    });

    servers.push(this);

    httpServer.start();
    this.listening = true;
    this.emit('listening');

    if (callback) callback();

    return this;
};

Server.prototype.close = function (callback) {
    if (this._closed) return this;
    if (!this._server) return this;

    var self = this;
    this._closed = true;
    this.listening = false;

    jukkit.runAsync(function () {
        try {
            self._server.stop(0);
            self.emit('close');
            if (callback) callback();
        } catch (e) {
            self.emit('error', e);
        }
    });

    return this;
};

Server.prototype.address = function () {
    if (!this._server) return null;
    return {
        port: this._server.getAddress().getPort(),
        address: this._server.getAddress().getHostString()
    };
};

var createServer = function (options, requestListener) {
    if (typeof options === 'function') {
        requestListener = options;
        options = {};
    }

    return new Server(requestListener);
};

var request = function (options, callback) {
    var url;
    if (typeof options === 'string') {
        url = options;
        options = {};
    } else {
        url = options.protocol + '//' + options.hostname + (options.port ? ':' + options.port : '') + options.path;
    }

    return fetch(url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body,
        timeout: options.timeout
    }).then(function (response) {
        var res = {
            statusCode: response.status,
            statusMessage: response.statusText,
            headers: response.headers,
            httpVersion: '1.1'
        };

        if (callback) {
            response.text().then(function (body) {
                callback(res, body);
            });
        }

        return response;
    });
};

var get = function (url, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = options || {};
    options.method = 'GET';

    return request(url, callback);
};

var post = function (url, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = options || {};
    options.method = 'POST';

    return request(url, callback);
};

module.exports = {
    createServer: createServer,
    request: request,
    get: get,
    post: post,
    Server: Server,
    IncomingMessage: IncomingMessage,
    ServerResponse: ServerResponse,

    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    STATUS_CODES: {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        301: 'Moved Permanently',
        302: 'Found',
        304: 'Not Modified',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    }
};
