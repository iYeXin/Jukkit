# Jukkit API 文档

Jukkit 是一个基于 JavaScript 的 Minecraft 插件开发框架，通过全局 `jukkit` 对象提供简洁的 API。

Jukkit 框架提供了较为完整的 TypeScript 类型定义，现代编辑器（如 VS Code）通常可自动识别并启动代码补全和类型检查。

## 目录

- [全局对象](#全局对象)
- [模块系统](#模块系统)
- [生命周期](#生命周期)
- [事件监听](#事件监听)
- [命令注册](#命令注册)
- [任务调度](#任务调度)
- [数据存储](#数据存储)
- [资源访问](#资源访问)
- [工具方法](#工具方法)
- [TypeScript 类型支持](#typescript-类型支持)

---

## 全局对象

脚本执行环境中可用的全局对象：

### 引擎内置（Nashorn）

| 对象       | 说明                                                 |
| ---------- | ---------------------------------------------------- |
| `Java`     | Java 类型访问，如 `Java.type("java.util.ArrayList")` |
| `java`     | Java 包根，如 `java.lang.System.out.println()`       |
| `org`      | Java 包根，如 `org.bukkit.Bukkit`                    |
| `Packages` | 访问任意 Java 包                                     |

### 环境提供

| 对象     | 说明                             |
| -------- | -------------------------------- |
| `jukkit` | Jukkit API 主对象（详见下文）    |
| `bukkit` | `org.bukkit.Bukkit` 类引用       |
| `server` | 当前 Bukkit Server 实例          |
| `plugin` | 当前插件实例（JsPluginTemplate） |

### Common 版本额外变量

| 变量    | 类型       | 说明                            |
| ------- | ---------- | ------------------------------- |
| `vertx` | Vertx 实例 | 共享实例，多插件共用 event loop |
| `Vertx` | Class      | Vertx 类，可创建独立实例        |

---

## 模块系统

Jukkit 支持标准的 CommonJS 模块语法。

### modules 目录

`modules/` 目录下的文件可以直接通过模块名引入，不经过 Rspack 编译：

```javascript
// modules/Logger.js
function Logger(prefix) {
    this.prefix = prefix;
    this.javaLogger = java.util.logging.Logger.getLogger(prefix);
}

Logger.prototype.info = function(msg) {
    this.javaLogger.info(msg);
};

module.exports = Logger;
```

```javascript
// src/index.js
const Logger = require('Logger');  // 直接通过模块名引入
const logger = new Logger('MyPlugin');
```

### 相对路径引入

```javascript
// src/utils.js
module.exports = {
    log: (msg) => jukkit.log(msg)
};

// src/index.js
const utils = require('./utils');  // 相对路径引入
```

### 模块解析规则

| 引入方式               | 解析位置            | 是否编译 |
| ---------------------- | ------------------- | -------- |
| `require('Logger')`    | `modules/Logger.js` | ❌ 不编译 |
| `require('./utils')`   | `src/utils.js`      | ✅ 编译   |
| `require('../config')` | 上级目录            | ✅ 编译   |

### 模块缓存

模块在首次加载后会被缓存，后续 `require()` 返回相同的导出对象。

---

## 生命周期

### jukkit.onLoad(handler)

设置插件加载时的回调函数。

```javascript
jukkit.onLoad(function(plugin) {
    jukkit.log("Plugin loading...");
});
```

### jukkit.onEnable(handler)

设置插件启用时的回调函数。返回 `true` 表示启用成功。

```javascript
jukkit.onEnable(function(plugin) {
    jukkit.log("Plugin enabled!");
    return true;  // 必须返回 true
});
```

### jukkit.onDisable(handler)

设置插件禁用时的回调函数。

```javascript
jukkit.onDisable(function(plugin) {
    jukkit.log("Plugin disabled");
});
```

### jukkit.onUnload(handler)

设置插件卸载时的回调函数。在 `onDisable` 之后调用。

```javascript
jukkit.onUnload(function() {
    jukkit.log("Plugin unloading...");
});
```

---

## 事件监听

### jukkit.on(eventName, handler)

监听指定事件（支持类型推断）。

```javascript
jukkit.on("PlayerJoinEvent", function(event) {
    var player = event.getPlayer();
    player.sendMessage("Welcome!");
});
```

### jukkit.on(eventName, priority, handler)

带优先级监听事件。

```javascript
// 优先级："LOWEST", "LOW", "NORMAL", "HIGH", "HIGHEST", "MONITOR"
jukkit.on("BlockBreakEvent", "HIGH", function(event) {
    event.setCancelled(true);
});
```

### 使用事件类

```javascript
var PlayerJoinEvent = Java.type("org.bukkit.event.player.PlayerJoinEvent");

jukkit.on(PlayerJoinEvent, function(event) {
    var player = event.getPlayer();
    player.sendMessage("Welcome!");
});
```

### 支持的事件类型

**玩家事件：**
- `PlayerJoinEvent`, `PlayerQuitEvent`, `PlayerDeathEvent`
- `PlayerRespawnEvent`, `PlayerMoveEvent`, `PlayerTeleportEvent`
- `PlayerInteractEvent`, `PlayerChatEvent`, `PlayerCommandPreprocessEvent`
- `PlayerDropItemEvent`, `PlayerPickupItemEvent`

**方块事件：**
- `BlockPlaceEvent`, `BlockBreakEvent`, `BlockBurnEvent`
- `BlockDispenseEvent`, `BlockRedstoneEvent`

**实体事件：**
- `CreatureSpawnEvent`, `EntityDeathEvent`, `EntityDamageEvent`
- `EntityTargetEvent`, `EntityExplodeEvent`

**库存事件：**
- `InventoryClickEvent`, `InventoryDragEvent`, `CraftItemEvent`

**世界事件：**
- `WeatherChangeEvent`, `LightningStrikeEvent`, `StructureGrowEvent`

---

## 命令注册

### jukkit.command(name, executor)

简单命令注册。

```javascript
jukkit.command("ping", function(sender, cmd, label, args) {
    sender.sendMessage("Pong!");
    return true;
});
```

### jukkit.command(name, options)

完整命令注册。

```javascript
var CommandOptions = Java.type("iyexin.jukkit.core.JukkitAPI$CommandOptions");

jukkit.command("hello", new CommandOptions()
    .description("Say hello")
    .usage("/hello [player]")
    .permission("myplugin.hello")
    .aliases("hi", "hey")
    .executor(function(sender, cmd, label, args) {
        sender.sendMessage("Hello!");
        return true;
    })
    .tabComplete(function(sender, cmd, alias, args) {
        return ["world", "server"];
    })
);
```

---

## 任务调度

所有任务方法都返回任务 ID，可通过 `jukkit.cancelTask(id)` 取消。

### Tick 级任务（主线程）

基于 Minecraft Tick，1 tick = 50ms。回调在主线程执行。

```javascript
// 立即执行
var taskId = jukkit.runTask(function() { });

// 延迟执行（ticks）
var delayId = jukkit.runTaskLater(20, function() { });  // 1秒后

// 定时执行（ticks）
var timerId = jukkit.runTaskTimer(20, function() { });  // 每秒

// 取消任务
jukkit.cancelTask(timerId);
```

### 毫秒级任务（异步线程）

独立于 Minecraft Tick。回调在异步线程执行。

```javascript
// 异步执行
var asyncId = jukkit.runAsync(function() { });

// 延迟执行（毫秒）
var delayId = jukkit.runAsyncLater(100, function() { });  // 100ms后

// 定时执行（毫秒）
var timerId = jukkit.runAsyncTimer(50, function() { });  // 每50ms

// 取消任务
jukkit.cancelTask(timerId);
```

### 线程安全

异步任务中不能直接调用 Bukkit API，需要切换回主线程：

```javascript
jukkit.runAsync(function() {
    // 异步执行耗时操作
    var result = heavyComputation();
    
    // 切换回主线程
    jukkit.runTask(function() {
        jukkit.getServer().broadcastMessage("Result: " + result);
    });
});
```

---

## 数据存储

运行时数据存储（无持久化）：

```javascript
// 存储
jukkit.store("key", value);
jukkit.store("counter", 0);
jukkit.store("players", ["Alice", "Bob"]);

// 获取
var counter = jukkit.get("counter");

// 检查
if (jukkit.has("key")) { }

// 删除
jukkit.remove("key");
```

---

## 资源访问

资源文件放在 `src/assets` 目录下，打包后可通过 `jukkit.resource` API 访问。

### 读取资源

```javascript
// 读取文本资源
const config = jukkit.resource.getAsString('config/default.yml');
const messages = JSON.parse(jukkit.resource.getAsString('config/messages.json'));

// 按行读取
const lines = jukkit.resource.readLines('data/items.csv');

// 获取字节数组
const data = jukkit.resource.get('images/logo.png');
```

### 检查资源

```javascript
// 检查是否存在
if (jukkit.resource.exists('config/default.yml')) { }

// 检查是否有资源
if (jukkit.resource.hasAssets()) { }

// 获取资源数量和大小
jukkit.resource.count();
jukkit.resource.totalSize();
```

### 列出资源

```javascript
// 列出目录下的所有文件和子目录
const items = jukkit.resource.list('config');

// 只列出文件
const files = jukkit.resource.listFiles('config');

// 只列出子目录
const dirs = jukkit.resource.listDirectories('config');

// 获取所有资源路径
const allPaths = jukkit.resource.getAllPaths();
```

### 提取资源

```javascript
// 提取单个资源到指定路径
jukkit.resource.extract('config/default.yml', '/path/to/config.yml');

// 提取资源到插件数据目录
jukkit.resource.extractToDataFolder('config/default.yml', 'config.yml');

// 提取整个目录
const count = jukkit.resource.extractDirectory('templates', '/path/to/templates');

// 提取所有资源到插件数据目录
const total = jukkit.resource.extractAllToDataFolder();
```

---

## 工具方法

### 日志

```javascript
jukkit.log("Info message");      // INFO
jukkit.warn("Warning message");  // WARNING
jukkit.error("Error message");   // SEVERE
```

### 获取实例

```javascript
// 获取插件实例
var plugin = jukkit.getPlugin();
jukkit.log(plugin.getPluginName());    // 插件名
jukkit.log(plugin.getPluginVersion()); // 版本号

// 获取 Bukkit 服务器
var server = jukkit.getServer();
jukkit.log(server.getVersion());
```

### 注入全局变量

```javascript
jukkit.injectGlobalVariable('myGlobal', { foo: 'bar' });
// 之后可以直接使用 myGlobal
```

---

## TypeScript 类型支持

Jukkit 提供完整的 TypeScript 类型定义，支持两种使用方式。

### 方式一：JavaScript + 类型提示

在 `.js` 文件顶部添加三斜线指令：

```javascript
/// <reference path="../index.d.ts" />
```

只需要用编辑器打开一次包含该指令的文件，即可在整个项目中启用类型支持。

### 方式二：TypeScript 编译

启用 TypeScript 编译获得完整的类型检查：

```javascript
// jukkit.config.js
project: {
    typescript: {
        enable: true
    }
}
```

详见 [进阶知识 - TypeScript 支持](./进阶知识.md#typescript-支持)。

### 类型推断

`jukkit.on()` 方法会根据事件名称自动推断回调函数中 `event` 参数的类型：

```javascript
/// <reference path="../index.d.ts" />

// event 自动推断为 PlayerJoinEvent 类型
jukkit.on("PlayerJoinEvent", function(event) {
    var player = event.getPlayer();      // Player 类型
    var message = event.getJoinMessage(); // string 类型
});

// 带优先级时同样支持类型推断
jukkit.on("BlockBreakEvent", "HIGH", function(event) {
    var player = event.getPlayer();  // Player 类型
    var block = event.getBlock();    // Block 类型
    event.setCancelled(true);
});
```

### 类型定义文件结构

```
index.d.ts              # 入口文件
types/
├── global.d.ts         # 全局对象定义
├── jukkit.d.ts         # Jukkit API 核心定义
├── classes.d.ts        # Bukkit 核心类定义
├── events.d.ts         # 事件定义
└── config.d.ts         # 配置类型定义
```

---

## 完整示例

```javascript
/// <reference path="../index.d.ts" />

const Logger = require('Logger');
const logger = new Logger('MyPlugin');

var timerId = null;

jukkit.onLoad(function(plugin) {
    logger.info("Loading...");
});

jukkit.onEnable(function(plugin) {
    logger.info("Plugin enabled!");
    
    // 注册命令
    jukkit.command("hello", function(sender, cmd, label, args) {
        sender.sendMessage("§aHello, " + sender.getName() + "!");
        return true;
    });
    
    // 监听事件
    jukkit.on("PlayerJoinEvent", function(event) {
        event.getPlayer().sendMessage("§eWelcome!");
    });
    
    // 定时任务
    timerId = jukkit.runAsyncTimer(1000, function() {
        logger.info("Timer tick");
    });
    
    return true;
});

jukkit.onDisable(function(plugin) {
    logger.info("Plugin disabled");
    
    if (timerId !== null) {
        jukkit.cancelTask(timerId);
    }
});
```
