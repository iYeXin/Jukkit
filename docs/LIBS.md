# Jukkit 库模块文档

Jukkit 提供了一系列内置的库，方便开发者进行文件操作、HTTP 请求、日志记录等，部分库模仿了 Node.js 的核心模块 API 风格。

## 目录

- [fs - 文件系统](#fs---文件系统)
- [http - HTTP 服务器](#http---http-服务器)
- [fetch - HTTP 请求](#fetch---http-请求)
- [polyfill - Promise 与定时器](#polyfill---promise-与定时器)
  - [Promise](#promise)
  - [定时器](#定时器)
  - [console](#console)
- [Logger - 日志工具](#logger---日志工具)
- [bindEvent - 事件绑定](#bindevent---事件绑定)

---

## fs - 文件系统

类似 Node.js 的 `fs` 模块，提供文件和目录操作功能。

> **提示**：`fs` 相对路径的解析基于工作目录（即服务器根目录），插件目录是 `plugins/plugin-name`。

### 引入方式

```javascript
const fs = require('./libs/fs');
```

### 同步方法

#### 文件读写

```javascript
// 读取文件（文本）
const content = fs.readFileSync('/path/to/file.txt');
const content = fs.readFileSync('/path/to/file.txt', 'utf8');

// 读取文件（二进制）
const bytes = fs.readFileSync('/path/to/image.png', 'binary');

// 写入文件
fs.writeFileSync('/path/to/file.txt', 'Hello World');
fs.writeFileSync('/path/to/file.txt', 'Hello World', { encoding: 'utf8', flag: 'w' });

// 追加文件
fs.appendFileSync('/path/to/file.txt', '\nNew line');
```

#### 目录操作

```javascript
// 创建目录
fs.mkdirSync('/path/to/dir');
fs.mkdirSync('/path/to/dir', { recursive: true }); // 递归创建

// 读取目录
const files = fs.readdirSync('/path/to/dir');

// 读取目录（带文件类型）
const entries = fs.readdirSync('/path/to/dir', { withFileTypes: true });
entries.forEach(entry => {
    console.log(entry.name, entry.isFile(), entry.isDirectory());
});

// 删除目录
fs.rmdirSync('/path/to/dir');
fs.rmdirSync('/path/to/dir', { recursive: true }); // 递归删除
```

#### 文件信息

```javascript
// 检查文件是否存在
const exists = fs.existsSync('/path/to/file');

// 获取文件状态
const stat = fs.statSync('/path/to/file');
console.log(stat.size);        // 文件大小
console.log(stat.isFile());    // 是否为文件
console.log(stat.isDirectory()); // 是否为目录
console.log(stat.mtime);       // 修改时间 (Date 对象)
console.log(stat.atime);       // 访问时间
console.log(stat.ctime);       // 创建时间
```

#### 文件操作

```javascript
// 复制文件
fs.copyFileSync('/src/file.txt', '/dest/file.txt');
fs.copyFileSync('/src/file.txt', '/dest/file.txt', 1); // 覆盖已存在的文件

// 重命名/移动
fs.renameSync('/old/path.txt', '/new/path.txt');

// 删除文件
fs.unlinkSync('/path/to/file');

// 截断文件
fs.truncateSync('/path/to/file', 1024); // 截断到 1024 字节

// 获取真实路径
const realPath = fs.realpathSync('/path/to/link');

// 符号链接
fs.symlinkSync('/target/path', '/link/path');
const target = fs.readlinkSync('/link/path');

// 修改文件时间
fs.utimesSync('/path/to/file', new Date(), new Date());
```

### 异步方法

所有同步方法都有对应的异步版本，返回 Promise：

```javascript
// 异步读取
const content = await fs.readFile('/path/to/file.txt');

// 异步写入
await fs.writeFile('/path/to/file.txt', 'Hello World');

// 异步创建目录
await fs.mkdir('/path/to/dir', { recursive: true });

// 异步获取状态
const stat = await fs.stat('/path/to/file');

// 异步读取目录
const files = await fs.readdir('/path/to/dir');

// 异步复制
await fs.copyFile('/src/file.txt', '/dest/file.txt');

// 异步重命名
await fs.rename('/old/path.txt', '/new/path.txt');

// 异步删除
await fs.unlink('/path/to/file');
await fs.rmdir('/path/to/dir', { recursive: true });
```

### Promise API

```javascript
const { promises } = fs;

await promises.readFile('/path/to/file.txt');
await promises.writeFile('/path/to/file.txt', 'content');
await promises.mkdir('/path/to/dir');
await promises.stat('/path/to/file');
await promises.readdir('/path/to/dir');
```

### 文件监听

```javascript
const watcher = fs.watch('/path/to/file', (eventType, filename) => {
    console.log(`Event: ${eventType}, File: ${filename}`);
});

// 自定义轮询间隔（默认 1000ms）
const watcher = fs.watch('/path/to/file', { interval: 500 }, (eventType, filename) => {
    console.log(eventType, filename);
});

// 关闭监听
watcher.close();
```

### 文件流

#### 可读流

```javascript
const rs = fs.createReadStream('/path/to/file', {
    encoding: 'utf8',
    highWaterMark: 65536  // 缓冲区大小
});

rs.on('open', () => console.log('File opened'));
rs.on('data', chunk => console.log('Received chunk:', chunk));
rs.on('end', () => console.log('Read complete'));
rs.on('error', err => console.error('Error:', err));
rs.on('close', () => console.log('Stream closed'));

// 暂停/恢复
rs.pause();
rs.resume();

// 设置编码
rs.setEncoding('utf8');
```

#### 可写流

```javascript
const ws = fs.createWriteStream('/path/to/file', {
    encoding: 'utf8',
    flags: 'w'  // 'w' 写入, 'a' 追加
});

ws.on('open', () => console.log('File opened'));
ws.on('drain', () => console.log('Buffer drained'));
ws.on('finish', () => console.log('Write complete'));
ws.on('error', err => console.error('Error:', err));
ws.on('close', () => console.log('Stream closed'));

// 写入数据
ws.write('Hello ');
ws.write('World!\n');

// 结束写入
ws.end('Final data');
ws.end();  // 或直接结束
```

---

## http - HTTP 服务器

类似 Node.js 的 `http` 模块，提供 HTTP 服务器功能。

### 引入方式

```javascript
const http = require('./libs/http');
```

### 创建服务器

```javascript
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.path}`);
    res.json({ message: 'Hello World' });
});

server.listen(8080, () => {
    console.log('Server running on port 8080');
});
```

### 请求对象 (IncomingMessage)

```javascript
http.createServer((req, res) => {
    // 基本信息
    console.log(req.method);      // 'GET', 'POST', etc.
    console.log(req.url);         // 完整 URL
    console.log(req.path);        // 路径部分
    console.log(req.queryString); // 查询字符串
    console.log(req.query);       // 解析后的查询参数对象
    console.log(req.headers);     // 请求头对象
    console.log(req.host);        // Host 头
    console.log(req.protocol);    // 'HTTP/1.1'

    // 读取请求体
    req.text().then(body => {
        console.log('Request body:', body);
    });

    // 解析 JSON 请求体
    req.json().then(data => {
        console.log('JSON data:', data);
    });
});
```

### 响应对象 (ServerResponse)

```javascript
http.createServer((req, res) => {
    // 设置状态码
    res.statusCode = 200;

    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Custom-Header', 'value');

    // 获取/检查响应头
    res.getHeader('Content-Type');
    res.hasHeader('Content-Type');
    res.getHeaders();
    res.removeHeader('X-Custom-Header');

    // 写入响应头
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // 写入响应体
    res.write('<html>');
    res.write('<body>Hello</body>');
    res.write('</html>');

    // 结束响应
    res.end();

    // 或一次性发送
    res.end('Hello World');

    // 发送 JSON
    res.json({ message: 'Success', data: [] });

    // 发送文本/对象
    res.send('Plain text');
    res.send({ message: 'Auto JSON' });

    // 重定向
    res.redirect('/new-path');
    res.redirect(301, '/permanent-redirect');
});
```

### 路由示例

```javascript
const server = http.createServer((req, res) => {
    const { method, path, query } = req;

    // 路由匹配
    if (path === '/' && method === 'GET') {
        res.json({ message: 'Home' });
    }
    else if (path === '/api/users' && method === 'GET') {
        res.json({ users: ['Alice', 'Bob'] });
    }
    else if (path === '/api/users' && method === 'POST') {
        req.json().then(data => {
            res.json({ message: 'User created', data });
        });
    }
    else if (path.startsWith('/api/users/')) {
        const id = path.split('/')[3];
        res.json({ userId: id });
    }
    else {
        res.writeHead(404);
        res.json({ error: 'Not Found' });
    }
});
```

### 服务器控制

```javascript
const server = http.createServer(handler);

// 监听端口
server.listen(8080);
server.listen(8080, 'localhost');
server.listen(8080, () => console.log('Started'));

// 获取地址信息
const addr = server.address();
console.log(addr.port, addr.address);

// 关闭服务器
server.close(() => console.log('Server closed'));

// 事件
server.on('listening', () => console.log('Listening'));
server.on('close', () => console.log('Closed'));
server.on('error', err => console.error('Error:', err));
```

### HTTP 客户端

```javascript
// GET 请求
http.get('https://api.example.com/data', (res, body) => {
    console.log(res.statusCode);
    console.log(body);
});

// POST 请求
http.post('https://api.example.com/users', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice' })
}, (res, body) => {
    console.log(body);
});

// 通用请求
http.request({
    protocol: 'https:',
    hostname: 'api.example.com',
    port: 443,
    path: '/users',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice' })
}, (res, body) => {
    console.log(res.statusCode, body);
});
```

### 常量

```javascript
// HTTP 方法
console.log(http.METHODS);
// ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

// 状态码
console.log(http.STATUS_CODES[200]);  // 'OK'
console.log(http.STATUS_CODES[404]);  // 'Not Found'
console.log(http.STATUS_CODES[500]);  // 'Internal Server Error'
```

---

## fetch - HTTP 请求

类似 `fetch` API，用于发起 HTTP 请求。已通过 `init.js` 预挂载为全局对象。

> **实现说明**：`fetch` 的实现位于 `init/fetch.js`，在初始化脚本中挂载到 `globalThis._fetch`。`src/libs/fetch.js` 只是导出该引用。

### 引入方式

```javascript
// 方式一：使用全局对象（推荐）
const response = await fetch('https://api.example.com/data');

// 方式二：手动引入
const fetch = require('./libs/fetch');
```

### 基本用法

```javascript
// GET 请求
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// POST 请求
const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'Alice' })
});
```

### 请求选项

```javascript
const response = await fetch('https://api.example.com/data', {
    method: 'POST',           // 请求方法
    headers: {                // 请求头
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
    },
    body: JSON.stringify({}), // 请求体
    timeout: 10000            // 超时时间（毫秒）
});
```

### 响应对象

```javascript
const response = await fetch('https://api.example.com/data');

// 基本信息
console.log(response.status);      // 状态码
console.log(response.ok);          // 是否成功 (200-299)
console.log(response.headers);     // 响应头对象

// 获取响应头
response.getHeader('Content-Type');

// 解析响应体
const text = await response.text();     // 文本
const json = await response.json();     // JSON 对象
const base64 = await response.base64(); // Base64 编码
const bytes = await response.arrayBuffer(); // 原始字节数组
const blob = await response.blob();     // Blob 对象
```

### 处理错误

```javascript
try {
    const response = await fetch('https://api.example.com/data');

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
} catch (error) {
    console.error('Request failed:', error);
}
```

### 下载二进制文件

```javascript
// 下载图片
const response = await fetch('https://example.com/image.png');
const base64 = await response.base64();

// 保存到文件
const fs = require('./libs/fs');
const bytes = await response.arrayBuffer();
fs.writeFileSync('/path/to/image.png', bytes, 'binary');
```

### 示例：API 调用

```javascript
// REST API 封装
const api = {
    async get(path) {
        const res = await fetch(`https://api.example.com${path}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    },

    async post(path, data) {
        const res = await fetch(`https://api.example.com${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }
};

// 使用
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'Alice' });
```

---

## polyfill - Promise 与定时器

提供 Promise、setTimeout、setInterval、console 等支持。已通过 `init.js` 预挂载为全局对象。

> **实现说明**：polyfill 的实现位于 `init/polyfill.js`，在初始化脚本中挂载全局对象。

### 引入方式

```javascript
// 方式一：使用全局对象（推荐）
setTimeout(() => console.log('Hello'), 1000);
const result = await Promise.all([p1, p2]);

// 方式二：手动引入
const { setTimeout, setInterval, console } = require('./libs/polyfill');
```

### Promise

> **注意**：Promise 由 Nashorn 引擎原生提供，polyfill 不再提供 Promise 实现。

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Success!');
    }, 1000);
});

// 使用 Promise
promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log('Done'));

// 静态方法
Promise.resolve('value');
Promise.reject(new Error('failed'));
Promise.all([promise1, promise2, promise3]);
Promise.race([promise1, promise2]);
Promise.allSettled([promise1, promise2]);
```

### 定时器

```javascript
// setTimeout
const timeoutId = setTimeout(() => {
    console.log('Delayed message');
}, 1000);

clearTimeout(timeoutId);

// setInterval
const intervalId = setInterval(() => {
    console.log('Repeated message');
}, 1000);

clearInterval(intervalId);

// 传递参数
setTimeout((a, b, c) => {
    console.log(a, b, c);
}, 1000, 'arg1', 'arg2', 'arg3');
```

### console

> **注意**：`console` 对象仅用于快速调试，功能有限。生产环境建议使用 `Logger` 类或 `jukkit.log` 等方法。

```javascript
// 基础日志
console.log('Hello World');
console.info('Info message');
console.warn('Warning message');
console.error('Error message');

// 格式化输出（支持占位符）
console.log('Player %s has %d points', 'Steve', 100);
// 输出: Player Steve has 100 points

// 支持的占位符:
// %s - 字符串
// %d, %i - 整数
// %f - 浮点数
// %j - JSON
// %o, %O - 对象
// %% - 百分号

// 对象输出（自动 JSON 序列化）
console.log({ name: 'Steve', level: 10 });
// 输出: {"name":"Steve","level":10}

// 多参数输出
console.log('User:', player.getName(), 'Level:', player.getLevel());
```

---

## Logger - 日志工具

提供格式化的日志输出，**推荐用于生产环境**。

### 引入方式

```javascript
const Logger = require('./libs/Logger');
const logger = new Logger('MyPlugin');
```

### 使用方法

```javascript
const logger = new Logger('MyPlugin');

// 日志级别
logger.info('This is an info message');
logger.warn('This is a warning');
logger.error('This is an error');
logger.debug('This is a debug message');

// 别名
logger.warning('Same as warn');
logger.severe('Same as error');
logger.fine('Same as debug');
logger.finer('Finer debug');
logger.finest('Finest debug');

// 获取/设置前缀
console.log(logger.getPrefix()); // 'MyPlugin'
logger.setPrefix('NewPrefix');
```

### 输出示例

```
[12:00:00 INFO]: [MyPlugin] This is an info message
[12:00:01 WARN]: [MyPlugin] This is a warning
[12:00:02 ERROR]: [MyPlugin] This is an error
```

---

## bindEvent - 事件绑定

用于注册插件卸载时的清理回调。

> **实现说明**：`bindEvent` 的实现位于 `init/bindEvent.js`，在初始化脚本中挂载到 `globalThis._bindEvent`。`src/libs/bindEvent.js` 只是导出该引用。

### 引入方式

```javascript
const bindEvent = require('./libs/bindEvent');
```

### 使用方法

```javascript
// 注册卸载回调
bindEvent('unload', () => {
    console.log('Plugin is unloading...');
    // 清理资源
});
```

### 使用场景

```javascript
const bindEvent = require('./libs/bindEvent');

// 清理定时器
const timerId = setInterval(() => {}, 1000);
bindEvent('unload', () => clearInterval(timerId));

// 关闭服务器
const server = createServer();
bindEvent('unload', () => server.close());

// 保存数据
bindEvent('unload', () => {
    fs.writeFileSync('data.json', JSON.stringify(cache));
});
```

---

## 聚合引入

可以通过 `libs.js` 一次性引入所有模块：

```javascript
const { Logger, fs, http, fetch, polyfill, bindEvent } = require('./libs');

// 使用
const logger = new Logger('MyPlugin');
const content = fs.readFileSync('file.txt');
const server = http.createServer(handler);
const response = await fetch('https://api.example.com');
```

---

## jukkit.resource - 资源访问 (v1.2.0+)

用于访问打包在插件中的资源文件。资源文件放在 `src/assets` 目录下，打包后可通过此 API 访问。

### 配置资源目录

在 `jukkit.config.js` 中配置：

```javascript
module.exports = {
    project: {
        srcDir: 'src',
        entry: 'index.js',
        assetsDir: 'src/assets',  // 资源目录路径
    },
    // ...
};
```

### 资源目录结构示例

```
my-plugin/
├── src/
│   ├── index.js
│   └── assets/
│       ├── config/
│       │   ├── default.yml
│       │   └── messages.json
│       ├── data/
│       │   └── items.csv
│       └── templates/
│           └── welcome.txt
└── jukkit.config.js
```

### 读取资源

```javascript
// 读取文本资源
const config = jukkit.resource.getAsString('config/default.yml');
const messages = JSON.parse(jukkit.resource.getAsString('config/messages.json'));

// 按行读取
const lines = jukkit.resource.readLines('data/items.csv');
lines.forEach(line => {
    jukkit.log('Item: ' + line);
});

// 获取字节数组（适用于二进制文件）
const data = jukkit.resource.get('images/logo.png');

// 获取输入流
const stream = jukkit.resource.getStream('data/large.bin');
```

### 检查资源

```javascript
// 检查资源是否存在
if (jukkit.resource.exists('config/default.yml')) {
    jukkit.log('Config found');
}

// 检查是否有资源
if (jukkit.resource.hasAssets()) {
    jukkit.log('Assets loaded');
}

// 获取资源数量和大小
jukkit.log('Asset count: ' + jukkit.resource.count());
jukkit.log('Total size: ' + jukkit.resource.totalSize() + ' bytes');

// 获取单个资源大小
const size = jukkit.resource.size('config/default.yml');
```

### 列出资源

```javascript
// 列出目录下的所有文件和子目录
const items = jukkit.resource.list('config');
items.forEach(item => jukkit.log(' - ' + item));

// 只列出文件
const files = jukkit.resource.listFiles('config');
files.forEach(file => jukkit.log('File: ' + file));

// 只列出子目录
const dirs = jukkit.resource.listDirectories('config');
dirs.forEach(dir => jukkit.log('Dir: ' + dir));

// 获取所有资源路径
const allPaths = jukkit.resource.getAllPaths();
allPaths.forEach(path => jukkit.log('Asset: ' + path));
```

### 提取资源

```javascript
// 提取单个资源到指定路径
jukkit.resource.extract('config/default.yml', '/path/to/config.yml');

// 提取资源到插件数据目录
jukkit.resource.extractToDataFolder('config/default.yml', 'config.yml');
// 文件将被提取到 plugins/MyPlugin/config.yml

// 提取整个目录
const count = jukkit.resource.extractDirectory('templates', '/path/to/templates');
jukkit.log('Extracted ' + count + ' files');

// 提取所有资源到指定目录
const total = jukkit.resource.extractAll('/path/to/output');
jukkit.log('Extracted ' + total + ' assets');

// 提取所有资源到插件数据目录
const total = jukkit.resource.extractAllToDataFolder();
jukkit.log('Extracted ' + total + ' assets');
```

### 完整示例：配置文件初始化

```javascript
const fs = require('./libs/fs');

jukkit.onEnable(() => {
    const dataFolder = plugin.getDataFolder();
    const configFile = new java.io.File(dataFolder, 'config.yml');
    
    // 如果配置文件不存在，从资源中提取默认配置
    if (!configFile.exists()) {
        jukkit.resource.extractToDataFolder('config/default.yml', 'config.yml');
        jukkit.log('Default config extracted');
    }
    
    // 读取配置
    const configContent = fs.readFileSync(configFile.getAbsolutePath(), 'utf8');
    // 解析配置...
    
    return true;
});
```

### 完整示例：多语言支持

```javascript
// src/assets/lang/en.json
// src/assets/lang/zh_cn.json

let messages = {};

jukkit.onEnable(() => {
    // 加载语言文件
    const lang = 'zh_cn'; // 从配置中获取
    const langFile = 'lang/' + lang + '.json';
    
    if (jukkit.resource.exists(langFile)) {
        messages = JSON.parse(jukkit.resource.getAsString(langFile));
        jukkit.log('Loaded language: ' + lang);
    } else {
        // 回退到英语
        messages = JSON.parse(jukkit.resource.getAsString('lang/en.json'));
        jukkit.warn('Language file not found, using English');
    }
    
    return true;
});

function getMessage(key) {
    return messages[key] || key;
}

// 使用
jukkit.on('PlayerJoinEvent', (event) => {
    const player = event.getPlayer();
    player.sendMessage(getMessage('welcome'));
});
```

> **提示**：项目默认通过 `init.js` 预挂载了 `Promise`、`setTimeout`、`setInterval`、`console`、`fetch` 等全局对象，无需手动引入即可直接使用。
