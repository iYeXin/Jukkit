const Paths = java.nio.file.Paths;
const Files = java.nio.file.Files;
const StandardCharsets = java.nio.charset.StandardCharsets;
const StandardOpenOption = java.nio.file.StandardOpenOption;
const LinkOption = java.nio.file.LinkOption;
const StandardCopyOption = java.nio.file.StandardCopyOption;
const ArrayList = java.util.ArrayList;
const FileInputStream = java.io.FileInputStream;
const FileOutputStream = java.io.FileOutputStream;
const BufferedInputStream = java.io.BufferedInputStream;
const BufferedOutputStream = java.io.BufferedOutputStream;

const StandardOpenOptionArray = Java.type("java.nio.file.StandardOpenOption[]");

const bindEvent = require('./bindEvent');

var toJsArray = function (iterable) {
    var arr = [];
    var iterator = iterable.iterator();
    while (iterator.hasNext()) {
        arr.push(iterator.next());
    }
    return arr;
};

var getPath = function (path) {
    if (typeof path !== 'string') throw new Error('Path must be a string');
    return Paths.get(path);
};

var getCharset = function (encoding) {
    if (!encoding || encoding.toLowerCase() === 'utf8' || encoding.toLowerCase() === 'utf-8') {
        return StandardCharsets.UTF_8;
    }
    return StandardCharsets.UTF_8;
};

var sync = {
    readFileSync: function (path, options) {
        var p = getPath(path);
        var encoding = 'utf8';
        if (options) {
            if (typeof options === 'string') encoding = options;
            else if (options.encoding) encoding = options.encoding;
        }

        if (encoding === 'binary' || encoding === 'buffer') {
            try {
                return Files.readAllBytes(p);
            } catch (e) {
                throw new Error('Failed to read file: ' + e.message);
            }
        }

        var charset = getCharset(encoding);
        try {
            var bytes = Files.readAllBytes(p);
            return new java.lang.String(bytes, charset);
        } catch (e) {
            throw new Error('Failed to read file: ' + e.message);
        }
    },

    writeFileSync: function (path, data, options) {
        var p = getPath(path);
        var encoding = 'utf8';
        var flag = 'w';
        if (options) {
            if (typeof options === 'string') {
                encoding = options;
            } else {
                if (options.encoding) encoding = options.encoding;
                if (options.flag) flag = options.flag;
            }
        }

        var bytes;
        if (typeof data === 'string' || data instanceof java.lang.String) {
            var charset = getCharset(encoding);
            bytes = new java.lang.String(data).getBytes(charset);
        } else if (data instanceof java.lang.Object && data.getClass().isArray() && data.getClass().getComponentType() === java.lang.Byte.TYPE) {
            bytes = data;
        } else {
            throw new Error('Data must be a string or byte array');
        }

        try {
            var optsList = [];
            if (flag === 'a') {
                optsList.push(StandardOpenOption.APPEND);
                optsList.push(StandardOpenOption.CREATE);
            } else {
                optsList.push(StandardOpenOption.WRITE);
                optsList.push(StandardOpenOption.CREATE);
                optsList.push(StandardOpenOption.TRUNCATE_EXISTING);
            }
            var optsArray = Java.to(optsList, StandardOpenOptionArray);
            Files.write(p, bytes, optsArray);
        } catch (e) {
            throw new Error('Failed to write file: ' + e.message);
        }
    },

    appendFileSync: function (path, data, options) {
        if (!options) options = {};
        if (typeof options === 'string') options = { encoding: options };
        options.flag = 'a';
        this.writeFileSync(path, data, options);
    },

    existsSync: function (path) {
        var p = getPath(path);
        return Files.exists(p, LinkOption.NOFOLLOW_LINKS);
    },

    mkdirSync: function (path, options) {
        var p = getPath(path);
        try {
            if (options && options.recursive) {
                Files.createDirectories(p);
            } else {
                Files.createDirectory(p);
            }
        } catch (e) {
            throw new Error('Failed to create directory: ' + e.message);
        }
    },

    rmdirSync: function (path, options) {
        var p = getPath(path);
        try {
            if (options && options.recursive) {
                Files.walkFileTree(p, new java.nio.file.SimpleFileVisitor({
                    visitFile: function (file, attrs) {
                        Files.delete(file);
                        return java.nio.file.FileVisitResult.CONTINUE;
                    },
                    visitFileFailed: function (file, exc) {
                        return java.nio.file.FileVisitResult.CONTINUE;
                    },
                    postVisitDirectory: function (dir, exc) {
                        Files.delete(dir);
                        return java.nio.file.FileVisitResult.CONTINUE;
                    }
                }));
            } else {
                Files.delete(p);
            }
        } catch (e) {
            throw new Error('Failed to remove directory: ' + e.message);
        }
    },

    statSync: function (path) {
        var p = getPath(path);
        try {
            var attrs = Files.readAttributes(p, java.nio.file.attribute.BasicFileAttributes.class);
            return {
                size: attrs.size(),
                isFile: attrs.isRegularFile(),
                isDirectory: attrs.isDirectory(),
                isSymbolicLink: attrs.isSymbolicLink(),
                isBlockDevice: false,
                isCharacterDevice: false,
                isFIFO: false,
                isSocket: false,
                mtime: new Date(attrs.lastModifiedTime().toMillis()),
                atime: new Date(attrs.lastAccessTime().toMillis()),
                ctime: new Date(attrs.creationTime().toMillis()),
                mode: 0,
                uid: 0,
                gid: 0,
                dev: 0,
                ino: 0,
                nlink: 1
            };
        } catch (e) {
            throw new Error('Failed to stat file: ' + e.message);
        }
    },

    lstatSync: function (path) {
        return this.statSync(path);
    },

    unlinkSync: function (path) {
        var p = getPath(path);
        try {
            Files.delete(p);
        } catch (e) {
            throw new Error('Failed to delete file: ' + e.message);
        }
    },

    readdirSync: function (path, options) {
        var p = getPath(path);
        try {
            var stream = Files.newDirectoryStream(p);
            var list = new ArrayList();
            var iterator = stream.iterator();
            while (iterator.hasNext()) {
                var entry = iterator.next();
                var name = entry.getFileName().toString();
                if (options && options.withFileTypes) {
                    var isDir = Files.isDirectory(entry);
                    list.push({
                        name: name,
                        isFile: function () { return !isDir; },
                        isDirectory: function () { return isDir; },
                        isSymbolicLink: function () { return false; }
                    });
                } else {
                    list.add(name);
                }
            }
            stream.close();
            return toJsArray(list);
        } catch (e) {
            throw new Error('Failed to read directory: ' + e.message);
        }
    },

    copyFileSync: function (src, dest, flags) {
        var srcPath = getPath(src);
        var destPath = getPath(dest);
        try {
            var copyOptions = [];
            if (flags === 1) {
                copyOptions.push(StandardCopyOption.REPLACE_EXISTING);
            }
            if (copyOptions.length > 0) {
                Files.copy(srcPath, destPath, Java.to(copyOptions, StandardCopyOption));
            } else {
                Files.copy(srcPath, destPath);
            }
        } catch (e) {
            throw new Error('Failed to copy file: ' + e.message);
        }
    },

    renameSync: function (oldPath, newPath) {
        var srcPath = getPath(oldPath);
        var destPath = getPath(newPath);
        try {
            Files.move(srcPath, destPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (e) {
            throw new Error('Failed to rename: ' + e.message);
        }
    },

    realpathSync: function (path) {
        var p = getPath(path);
        try {
            return p.toRealPath().toString();
        } catch (e) {
            throw new Error('Failed to resolve real path: ' + e.message);
        }
    },

    readlinkSync: function (path) {
        var p = getPath(path);
        try {
            return Files.readSymbolicLink(p).toString();
        } catch (e) {
            throw new Error('Failed to read link: ' + e.message);
        }
    },

    symlinkSync: function (target, path) {
        var targetPath = getPath(target);
        var linkPath = getPath(path);
        try {
            Files.createSymbolicLink(linkPath, targetPath);
        } catch (e) {
            throw new Error('Failed to create symlink: ' + e.message);
        }
    },

    truncateSync: function (path, len) {
        var p = getPath(path);
        try {
            var channel = java.nio.file.FileChannel.open(p, StandardOpenOption.WRITE);
            channel.truncate(len || 0);
            channel.close();
        } catch (e) {
            throw new Error('Failed to truncate file: ' + e.message);
        }
    },

    chmodSync: function (path, mode) {
    },

    chownSync: function (path, uid, gid) {
    },

    utimesSync: function (path, atime, mtime) {
        var p = getPath(path);
        try {
            var attrs = java.nio.file.attribute.BasicFileAttributes;
            var view = Files.getFileAttributeView(p, java.nio.file.attribute.BasicFileAttributeView.class);
            var atimeFileTime = java.nio.file.FileTime.fromMillis(new Date(atime).getTime());
            var mtimeFileTime = java.nio.file.FileTime.fromMillis(new Date(mtime).getTime());
            view.setTimes(mtimeFileTime, atimeFileTime, null);
        } catch (e) {
            throw new Error('Failed to update times: ' + e.message);
        }
    }
};

var createAsync = function (syncFn) {
    return function () {
        var args = Array.from(arguments);
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    var result = syncFn.apply(sync, args);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    };
};

var async = {
    readFile: createAsync(sync.readFileSync),
    writeFile: createAsync(sync.writeFileSync),
    appendFile: createAsync(sync.appendFileSync),
    exists: createAsync(sync.existsSync),
    mkdir: createAsync(sync.mkdirSync),
    rmdir: createAsync(sync.rmdirSync),
    stat: createAsync(sync.statSync),
    lstat: createAsync(sync.lstatSync),
    unlink: createAsync(sync.unlinkSync),
    readdir: createAsync(sync.readdirSync),
    copyFile: createAsync(sync.copyFileSync),
    rename: createAsync(sync.renameSync),
    realpath: createAsync(sync.realpathSync),
    readlink: createAsync(sync.readlinkSync),
    symlink: createAsync(sync.symlinkSync),
    truncate: createAsync(sync.truncateSync),
    utimes: createAsync(sync.utimesSync)
};

var watchers = [];
var watcherId = 0;

var FSWatcher = function (path, options, listener) {
    this.id = ++watcherId;
    this.path = path;
    this.options = options || {};
    this.listener = listener;
    this.closed = false;
    this.intervalId = null;
    this.lastModified = 0;

    var self = this;
    var p = getPath(path);

    if (sync.existsSync(path)) {
        try {
            var stat = sync.statSync(path);
            self.lastModified = stat.mtime.getTime();
        } catch (e) {
        }
    }

    this.intervalId = setInterval(function () {
        if (self.closed) return;

        try {
            if (sync.existsSync(path)) {
                var stat = sync.statSync(path);
                var currentModified = stat.mtime.getTime();

                if (currentModified !== self.lastModified) {
                    self.lastModified = currentModified;
                    var eventType = 'change';
                    self.listener(eventType, path);
                }
            }
        } catch (e) {
        }
    }, options.interval || 1000);

    watchers.push(this);

    bindEvent('unload', function () {
        self.close();
    });
};

FSWatcher.prototype.close = function () {
    this.closed = true;
    if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    var idx = watchers.indexOf(this);
    if (idx > -1) {
        watchers.splice(idx, 1);
    }
};

var watch = function (path, options, listener) {
    if (typeof options === 'function') {
        listener = options;
        options = {};
    }
    options = options || {};

    return new FSWatcher(path, options, listener);
};

var createReadStream = function (path, options) {
    options = options || {};
    var encoding = options.encoding || null;
    var highWaterMark = options.highWaterMark || 65536;

    var p = getPath(path);
    var inputStream = null;
    var closed = false;
    var paused = false;
    var buffer = [];

    var stream = {
        readable: true,
        encoding: encoding,

        on: function (event, callback) {
            this['_' + event] = callback;
            return this;
        },

        emit: function (event, data) {
            if (this['_' + event]) {
                this['_' + event](data);
            }
            return this;
        },

        pause: function () {
            paused = true;
            return this;
        },

        resume: function () {
            paused = false;
            this._read();
            return this;
        },

        _read: function () {
            var self = this;
            if (closed || paused) return;

            jukkit.runAsync(function () {
                try {
                    if (!inputStream) {
                        inputStream = new BufferedInputStream(new FileInputStream(p.toFile()), highWaterMark);
                    }

                    var chunk = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, highWaterMark);
                    var bytesRead = inputStream.read(chunk);

                    if (bytesRead === -1) {
                        self._end();
                    } else {
                        var actualChunk;
                        if (bytesRead < highWaterMark) {
                            actualChunk = java.util.Arrays.copyOf(chunk, bytesRead);
                        } else {
                            actualChunk = chunk;
                        }

                        if (encoding) {
                            self.emit('data', new java.lang.String(actualChunk, encoding));
                        } else {
                            self.emit('data', actualChunk);
                        }

                        if (!paused) {
                            setTimeout(function () {
                                self._read();
                            }, 0);
                        }
                    }
                } catch (e) {
                    self.emit('error', e);
                }
            });
        },

        _end: function () {
            if (closed) return;
            closed = true;
            if (inputStream) {
                try {
                    inputStream.close();
                } catch (e) {
                }
            }
            this.emit('end');
            this.emit('close');
        },

        close: function () {
            this._end();
        },

        setEncoding: function (enc) {
            this.encoding = enc;
            return this;
        }
    };

    setTimeout(function () {
        stream.emit('open', path);
        stream._read();
    }, 0);

    return stream;
};

var createWriteStream = function (path, options) {
    options = options || {};
    var encoding = options.encoding || 'utf8';
    var flags = options.flags || 'w';

    var p = getPath(path);
    var outputStream = null;
    var closed = false;

    var stream = {
        writable: true,
        encoding: encoding,

        on: function (event, callback) {
            this['_' + event] = callback;
            return this;
        },

        emit: function (event, data) {
            if (this['_' + event]) {
                this['_' + event](data);
            }
            return this;
        },

        write: function (chunk, encoding, callback) {
            var self = this;
            if (closed) {
                self.emit('error', new Error('Stream is closed'));
                return false;
            }

            if (typeof encoding === 'function') {
                callback = encoding;
                encoding = null;
            }

            jukkit.runAsync(function () {
                try {
                    if (!outputStream) {
                        var append = flags === 'a';
                        outputStream = new BufferedOutputStream(new FileOutputStream(p.toFile(), append));
                    }

                    var bytes;
                    if (typeof chunk === 'string' || chunk instanceof java.lang.String) {
                        bytes = new java.lang.String(chunk).getBytes(encoding || self.encoding);
                    } else {
                        bytes = chunk;
                    }

                    outputStream.write(bytes);
                    outputStream.flush();

                    if (callback) callback();
                    self.emit('drain');
                } catch (e) {
                    self.emit('error', e);
                }
            });

            return true;
        },

        end: function (data, encoding, callback) {
            var self = this;
            if (typeof data === 'function') {
                callback = data;
                data = null;
            } else if (typeof encoding === 'function') {
                callback = encoding;
                encoding = null;
            }

            if (data) {
                this.write(data, encoding, function () {
                    self._finish(callback);
                });
            } else {
                this._finish(callback);
            }

            return this;
        },

        _finish: function (callback) {
            if (closed) return;
            closed = true;

            if (outputStream) {
                try {
                    outputStream.flush();
                    outputStream.close();
                } catch (e) {
                }
            }

            this.emit('finish');
            this.emit('close');
            if (callback) callback();
        },

        close: function () {
            this._finish();
        }
    };

    setTimeout(function () {
        stream.emit('open', path);
    }, 0);

    return stream;
};

var promises = {
    readFile: function (path, options) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    resolve(sync.readFileSync(path, options));
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    writeFile: function (path, data, options) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    sync.writeFileSync(path, data, options);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    mkdir: function (path, options) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    sync.mkdirSync(path, options);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    rmdir: function (path, options) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    sync.rmdirSync(path, options);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    stat: function (path) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    resolve(sync.statSync(path));
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    readdir: function (path, options) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    resolve(sync.readdirSync(path, options));
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    copyFile: function (src, dest, flags) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    sync.copyFileSync(src, dest, flags);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    rename: function (oldPath, newPath) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    sync.renameSync(oldPath, newPath);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

    unlink: function (path) {
        return new Promise(function (resolve, reject) {
            jukkit.runAsync(function () {
                try {
                    sync.unlinkSync(path);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
};

module.exports = {
    readFileSync: sync.readFileSync,
    writeFileSync: sync.writeFileSync,
    appendFileSync: sync.appendFileSync,
    existsSync: sync.existsSync,
    mkdirSync: sync.mkdirSync,
    rmdirSync: sync.rmdirSync,
    statSync: sync.statSync,
    lstatSync: sync.lstatSync,
    unlinkSync: sync.unlinkSync,
    readdirSync: sync.readdirSync,
    copyFileSync: sync.copyFileSync,
    renameSync: sync.renameSync,
    realpathSync: sync.realpathSync,
    readlinkSync: sync.readlinkSync,
    symlinkSync: sync.symlinkSync,
    truncateSync: sync.truncateSync,
    utimesSync: sync.utimesSync,

    readFile: async.readFile,
    writeFile: async.writeFile,
    appendFile: async.appendFile,
    exists: async.exists,
    mkdir: async.mkdir,
    rmdir: async.rmdir,
    stat: async.stat,
    lstat: async.lstat,
    unlink: async.unlink,
    readdir: async.readdir,
    copyFile: async.copyFile,
    rename: async.rename,
    realpath: async.realpath,
    readlink: async.readlink,
    symlink: async.symlink,
    truncate: async.truncate,
    utimes: async.utimes,

    watch: watch,
    createReadStream: createReadStream,
    createWriteStream: createWriteStream,

    promises: promises,

    constants: {
        F_OK: 0,
        R_OK: 4,
        W_OK: 2,
        X_OK: 1,
        COPYFILE_EXCL: 0,
        COPYFILE_FICLONE: 0,
        COPYFILE_FICLONE_FORCE: 0
    }
};
