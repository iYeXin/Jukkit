const URL = java.net.URL;
const OutputStreamWriter = java.io.OutputStreamWriter;
const StandardCharsets = java.nio.charset.StandardCharsets;
const Base64 = java.util.Base64;
const ByteArrayOutputStream = java.io.ByteArrayOutputStream;

const fetch = function (url, options) {
    options = options || {};
    var method = options.method || 'GET';

    return new Promise(function (resolve, reject) {
        jukkit.runAsync(function () {
            var connection = null;
            try {
                var javaUrl = new URL(url);
                connection = javaUrl.openConnection();
                connection.setRequestMethod(method);
                connection.setConnectTimeout(options.timeout || 10000);
                connection.setReadTimeout(options.timeout || 10000);

                if (options.headers) {
                    Object.keys(options.headers).forEach(function (key) {
                        connection.setRequestProperty(key, options.headers[key]);
                    });
                }

                if (options.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                    connection.setDoOutput(true);
                    var bodyData = options.body;
                    if (typeof bodyData === 'object' && !(bodyData instanceof String)) {
                        bodyData = JSON.stringify(bodyData);
                        if (!options.headers || !options.headers['Content-Type']) {
                            connection.setRequestProperty('Content-Type', 'application/json; charset=UTF-8');
                        }
                    }
                    var output = connection.getOutputStream();
                    var writer = new OutputStreamWriter(output, StandardCharsets.UTF_8);
                    writer.write(bodyData);
                    writer.flush();
                    writer.close();
                }

                var responseCode = connection.getResponseCode();
                var contentType = connection.getContentType() || '';

                var inputStream = responseCode >= 400 ? connection.getErrorStream() : connection.getInputStream();
                var rawBytes = null;
                var bodyText = '';

                if (inputStream) {
                    var baos = new ByteArrayOutputStream();
                    var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 8192);
                    var bytesRead;

                    while ((bytesRead = inputStream.read(buffer)) !== -1) {
                        baos.write(buffer, 0, bytesRead);
                    }

                    rawBytes = baos.toByteArray();
                    baos.close();

                    var isBinary = contentType.indexOf('image/') !== -1 ||
                        contentType.indexOf('video/') !== -1 ||
                        contentType.indexOf('audio/') !== -1 ||
                        contentType.indexOf('application/octet-stream') !== -1 ||
                        contentType.indexOf('application/pdf') !== -1 ||
                        contentType.indexOf('application/zip') !== -1;

                    if (!isBinary) {
                        try {
                            bodyText = new java.lang.String(rawBytes, StandardCharsets.UTF_8);
                        } catch (e) {
                            bodyText = '';
                        }
                    }
                }

                var headers = {};
                var headerFields = connection.getHeaderFields();
                var iter = headerFields.entrySet().iterator();
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
                        headers[key] = valuesArray.join(', ');
                    }
                }

                var response = {
                    status: responseCode,
                    statusText: '',
                    ok: responseCode >= 200 && responseCode < 300,
                    headers: headers,
                    _bodyText: bodyText,
                    _rawBytes: rawBytes,
                    _bodyUsed: false,

                    getHeader: function (name) {
                        return this.headers[name] || null;
                    },

                    text: function () {
                        if (this._bodyUsed) {
                            return Promise.reject(new Error('Body already used'));
                        }
                        this._bodyUsed = true;
                        return Promise.resolve(this._bodyText);
                    },

                    json: function () {
                        if (this._bodyUsed) {
                            return Promise.reject(new Error('Body already used'));
                        }
                        this._bodyUsed = true;
                        try {
                            return Promise.resolve(JSON.parse(this._bodyText));
                        } catch (e) {
                            return Promise.reject(e);
                        }
                    },

                    base64: function () {
                        if (this._bodyUsed) {
                            return Promise.reject(new Error('Body already used'));
                        }
                        this._bodyUsed = true;

                        if (this._rawBytes) {
                            var base64Encoded = Base64.getEncoder().encodeToString(this._rawBytes);
                            return Promise.resolve(base64Encoded);
                        }

                        return Promise.resolve('');
                    },

                    arrayBuffer: function () {
                        if (this._bodyUsed) {
                            return Promise.reject(new Error('Body already used'));
                        }
                        this._bodyUsed = true;

                        if (this._rawBytes) {
                            return Promise.resolve(this._rawBytes);
                        }

                        return Promise.resolve(null);
                    },

                    blob: function () {
                        if (this._bodyUsed) {
                            return Promise.reject(new Error('Body already used'));
                        }
                        this._bodyUsed = true;

                        if (this._rawBytes) {
                            return Promise.resolve({
                                type: contentType,
                                size: this._rawBytes.length,
                                data: this._rawBytes
                            });
                        }

                        return Promise.resolve(null);
                    }
                };

                resolve(response);

            } catch (e) {
                reject(e);
            } finally {
                if (connection) connection.disconnect();
            }
        });
    });
};

module.exports = fetch;
