# Jukkit

**Jukkit** 是一个用于使用 JavaScript 开发 Minecraft 服务器插件的框架。

## 特性

- **无需 Java 环境** - 仅需 JavaScript 即可开发插件
- **Dev 模式** - 开发时支持热重载，无需重复部署 JAR
- **现代 API** - 简洁优雅的 API 设计，支持 Promise
- **TypeScript 类型支持** - 拥有较为完整的类型定义，支持编辑器代码补全
- **产物为标准 JAR** - 生成的 JAR 文件可直接加载到 Minecraft 服务器
- **远程部署** - 支持 MCSManager 自动上传
- **产物兼容性** - 生成的 Jar 可直接在 Paper/Spigot/Bukkit 等服务器上运行，理论上支持 Minecraft 1.13+ 版本。

![编辑器自动补全](./docs/img/1.png)

## 快速开始

### 环境要求

- Node.js 16+
- Minecraft 服务器（支持 Bukkit/Spigot/Paper 等）

### 开发流程

#### 1. 克隆仓库并安装依赖

```bash
git clone https://github.com/iYeXin/Jukkit.git
cd Jukkit
npm install
```

#### 2. 配置项目

编辑 `jukkit.config.js` 文件，修改插件信息：

```javascript
module.exports = {
    project: {
        defaultModuleDir: 'src/modules',
        intry: 'src/index.js',
        output: 'dist/source/main.js',
    },
    pluginPackage: {
        name: 'MyPlugin',           // 改成你的插件名称
        version: '1.0.0',
        description: 'My plugin',
        author: 'YourName',         // 改成你的名字
        output: 'dist/MyPlugin-1.0.0.jar',
        templateJar: 'jukkit-template-1.0.0.jar',
        dev: true
    },
    upload: {
        enable: false,              // 需要自动上传时改为 true
        // ... 更多配置见 docs/MCSMANAGER_UPLOAD.md
    }
}
```

#### 3. 编写插件功能

**只需修改 `src/modules/functions/hello.js` 文件即可开始开发！**

```javascript
// src/modules/functions/hello.js
(() => {
    const logger = new Logger('Hello');

    // 注册一个命令
    jukkit.command('hello', (sender, cmd, label, args) => {
        sender.sendMessage('§aHello, ' + sender.getName() + '!');
        return true;
    });

    // 监听玩家加入事件
    jukkit.on('PlayerJoinEvent', (event) => {
        const player = event.getPlayer();
        player.sendMessage('§e欢迎来到服务器!');
    });

    logger.info('Hello 模块已加载');
})();
```

#### 4. 构建项目

```bash
npm run build
```

构建完成后，`dist/` 目录下会生成：
- `source/main.js` - 合并后的脚本文件
- `MyPlugin-1.0.0.jar` - 可直接使用的插件 JAR

## 项目结构

```
Jukkit/
├── src/
│   ├── index.js              # 入口文件
│   └── modules/
│       ├── libs/             # 核心库（无需修改）
│       ├── functions/        # 功能模块（在这里编写你的插件）
│       │   └── hello.js      # 示例：你的第一个功能
├── types/                    # TypeScript 类型定义
├── docs/                     # 文档
├── dist/                     # 构建产物
├── jukkit-build.js           # 构建脚本
└── jukkit.config.js          # 项目配置
```

## 模块系统

项目使用 `include` 和 `includeAll` 指令组织代码：

Note: `include` 和 `includeAll` 指令在语法上是单行的字符串

```javascript
// 引入单个模块
"include libs/fs"

// 引入模块索引文件（展开其中的所有 include）
"includeAll functions"
```

### 创建新功能模块

1. 在 `src/modules/functions/` 创建新文件，如 `myFeature.js`
2. 在 `src/modules/functions.js` 中添加引用：

```javascript
jukkit.onEnable(() => {
    "include functions/hello"       // 已有模块
    "include functions/myFeature"   // 新增模块
});
```

### 运行时语法支持

支持大部分 ES6 语法：`Promise`、`箭头函数`、`let/const` 等。

不支持：`class`、`async/await`。如需使用，建议配合 Babel 编译。

## API 文档

详细 Jukkit API 文档请参阅 [API.md](./API.md)。

### 核心全局对象

| 对象     | 说明              |
| -------- | ----------------- |
| `jukkit` | Jukkit API 主对象 |
| `bukkit` | Bukkit 类引用     |
| `server` | 当前服务器实例    |
| `plugin` | 当前插件实例      |

### 生命周期

```javascript
jukkit.onLoad((plugin) => { /* 加载时 */ });
jukkit.onEnable((plugin) => { return true; });  // 必须返回 true
jukkit.onDisable((plugin) => { /* 禁用时 */ });
jukkit.onUnload(() => { /* 卸载时 */ });
```

### 事件监听

```javascript
jukkit.on("PlayerJoinEvent", (event) => {
    event.getPlayer().sendMessage("欢迎!");
});

jukkit.on("BlockBreakEvent", "HIGH", (event) => {
    event.setCancelled(true);  // 取消事件
});
```

### 命令注册

```javascript
jukkit.command("hello", (sender, cmd, label, args) => {
    sender.sendMessage("Hello!");
    return true;
});
```

### 任务调度

```javascript
// 主线程（Tick 级，1 tick = 50ms）
jukkit.runTask(() => { });
jukkit.runTaskLater(20, () => { });      // 1秒后
jukkit.runTaskTimer(20, () => { });      // 每秒

// 异步线程（毫秒级）
jukkit.runAsync(() => { });
jukkit.runAsyncLater(1000, () => { });   // 1秒后
jukkit.runAsyncTimer(1000, () => { });   // 每秒

// 取消任务
const id = jukkit.runTaskTimer(20, () => {});
jukkit.cancelTask(id);
```

### 数据存储

```javascript
jukkit.store("key", value);
const data = jukkit.get("key");
jukkit.has("key");
jukkit.remove("key");
```

## 内置能力

Jukkit 提供以下开箱即用的能力：

| 能力                                  | 说明                                           |
| ------------------------------------- | ---------------------------------------------- |
| `fetch(url)`                          | HTTP 请求，返回 Promise                        |
| `http.createServer(port, handler)`    | 创建 HTTP 服务器                               |
| `fs.readFileSync()` / `fs.readFile()` | 文件读写（类似 Node.js fs 模块，支持同步读写） |
| `setTimeout()` / `setInterval()`      | 定时器                                         |
| `Promise`                             | 异步编程支持                                   |
| `Logger(name)`                        | 日志工具类                                     |
| `bindEvent('unload', fn)`             | 注册卸载回调                                   |

上述能力均已在全局暴露，可直接使用。

### 示例：HTTP 请求

```javascript
fetch('https://api.example.com/data')
    .then(res => res.json())
    .then(data => {
        jukkit.runTask(() => {
            player.sendMessage(data.message);
        });
    });
```

### 示例：定时任务

```javascript
let taskId = null;

jukkit.onEnable(() => {
    taskId = jukkit.runTaskTimer(20, () => {
        // 每秒执行
    });
    return true;
});

jukkit.onDisable(() => {
    if (taskId) jukkit.cancelTask(taskId);
});
```

### 示例：文件读写

```javascript
// 读取文件
const data = fs.readFileSync("plugins/myPlugin/config.json"); // 相对路径的基准是服务器根目录
console.log(data);

// 写入文件
fs.writeFileSync("plugins/myPlugin/config.json", JSON.stringify({ key: "value" })); // 相对路径的基准是服务器根目录
```

### 示例：日志

```javascript
// logger.js
const logger = new Logger("MyPlugin-Function1");
logger.info("这是一条 info 日志");

/*
输出类似：
[12:00:00] [MyPlugin-Function1] 这是一条 info 日志
*/
```

## Dev 模式

Dev 模式支持热重载，无需重复部署 JAR：

1. 首次构建 JAR 并部署到服务器
2. 插件启动时在 `/plugins/dev_{pluginName}/` 生成 `main.js`
3. 后续只需上传新的 `main.js` 即可热重载

## 远程部署

支持 MCSManager 自动上传，详见 [MCSManager 上传指南](./docs/MCSMANAGER_UPLOAD.md)。

## TypeScript 支持

```javascript
/// <reference path="./index.d.ts" />

jukkit.on("PlayerJoinEvent", (event) => {
    // event 类型自动推断，支持代码补全
    const player = event.getPlayer();
});
```

## TODO

### 模块系统

- [ ] 引入 CJS/ESM 模块系统，支持 `require()` 和 `import`
- [ ] 使用 Java 实现 Node.js 核心模块，复用 NPM 生态
- [ ] 支持 `node_modules` 和 `package.json` 依赖管理

### JavaScript 引擎

- [ ] 引入可选引擎支持，如 GraalJS（高性能，支持最新 ES 标准）

### 开发体验

- [ ] Source Map 调试支持
- [ ] 集成测试框架
- [ ] 热重载时保留插件状态

## 相关项目

- **Jukkit-Template** - JAR 模板项目，包含 Java 运行时类

## 致谢

本项目的理念源于 **OpenJavascript** 插件（https://gitlab.com/spidermodders/openjs），这是一个允许运行 JavaScript 脚本以控制服务器逻辑的创新项目。

## 作者

iYeXin

## 许可证

MIT
