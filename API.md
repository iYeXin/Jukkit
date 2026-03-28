# Jukkit API 文档

Jukkit 是一个基于 JavaScript 的 Minecraft 插件开发框架，通过全局 `jukkit` 对象提供简洁的 API。

Jukkit 框架提供了较为完整的 [Typescript 类型定义](#typescript-类型补全)，现代编辑器（如 VS Code）通常可自动识别并启动代码补全和类型检查。

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
设置插件卸载时的回调函数。在 `onDisable` 之后、资源清理之前调用。

```javascript
jukkit.onUnload(function() {
    jukkit.log("Plugin unloading, final cleanup...");
});
```

## 事件监听

### jukkit.on(eventName, handler)
监听指定事件（支持类型推断）。

```javascript
// 使用事件名称（有类型提示）
jukkit.on("PlayerJoinEvent", function(event) {
    var player = event.getPlayer(); // Player 类型
    player.sendMessage("Welcome!");
});

// 使用事件类
var PlayerJoinEvent = Java.type("org.bukkit.event.player.PlayerJoinEvent");
jukkit.on(PlayerJoinEvent, function(event) {
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
    .aliases(["hi", "hey"])
    .executor(function(sender, cmd, label, args) {
        sender.sendMessage("Hello!");
        return true;
    })
    .tabCompleter(function(sender, cmd, alias, args) {
        return ["world", "server"];
    })
);
```

## 任务调度

所有任务方法都返回任务 ID，可通过 `jukkit.cancelTask(id)` 取消。

### Tick 级任务（主线程）

基于 Minecraft Tick，1 tick = 50ms。

回调将在主线程执行。

```javascript
// 立即执行
var taskId = jukkit.runTask(function() {
    // 在主线程执行
});

// 延迟执行（ticks），返回 ID
var delayId = jukkit.runTaskLater(20, function() {
    // 20 ticks (1秒) 后执行
});

// 定时执行（ticks），返回 ID
var timerId = jukkit.runTaskTimer(20, function() {
    // 每 20 ticks (1秒) 执行一次
});

// 取消任务
jukkit.cancelTask(timerId);
```

### 毫秒级任务（异步线程）

独立于 Minecraft Tick。

回调将在异步线程执行。

```javascript
// 异步执行（低开销）
var asyncId = jukkit.runAsync(function() {
    // 在异步线程执行
});

// 延迟执行（毫秒），返回 ID
var delayId = jukkit.runAsyncLater(100, function() {
    // 100ms 后执行
});

// 定时执行（毫秒），返回 ID
var timerId = jukkit.runAsyncTimer(50, function() {
    // 每 50ms 执行一次
});

// 取消任务
jukkit.cancelTask(timerId);
```

**注意**：异步任务中不能直接调用 Bukkit API，需要切换回主线程：

```javascript
jukkit.runAsync(function() {
    // 异步执行耗时操作
    var result = heavyComputation();
    
    // 切换回主线程
    jukkit.runTask(function() {
        // 安全调用 Bukkit API
        jukkit.getServer().broadcastMessage("Result: " + result);
    });
});
```

## 数据存储

```javascript
// 存储（无持久化）
jukkit.store("key", value);
jukkit.store("counter", 0);
jukkit.store("players", ["Alice", "Bob"]);

// 获取
var counter = jukkit.get("counter");
var players = jukkit.get("players");

// 检查
if (jukkit.has("key")) {
    // 存在
}

// 删除
jukkit.remove("key");
```

## 工具方法

### 日志

```javascript
jukkit.log("Info message");      // INFO
jukkit.warn("Warning message");  // WARNING
jukkit.error("Error message");   // SEVERE
```

### 获取实例

```javascript
// 获取插件描述信息
var plugin = jukkit.getPlugin();
jukkit.log(plugin.getPluginName());    // 插件名
jukkit.log(plugin.getPluginVersion()); // 版本号

// 获取 Bukkit 服务器
var server = jukkit.getServer();
jukkit.log(server.getVersion());
```

## 完整示例

```javascript
var timerId = null;

jukkit.onLoad(function(plugin) {
    jukkit.log("Loading " + jukkit.getPlugin().getPluginName() + "...");
});

jukkit.onEnable(function(plugin) {
    jukkit.log("Plugin enabled!");
    
    // 注册命令
    jukkit.command("test", function(sender, cmd, label, args) {
        sender.sendMessage("Test command executed!");
        return true;
    });
    
    // 监听事件
    jukkit.on("PlayerJoinEvent", function(event) {
        var player = event.getPlayer();
        player.sendMessage("Welcome to the server!");
    });
    
    // 毫秒级定时器
    var counter = 0;
    timerId = jukkit.runAsyncTimer(1000, function() {
        counter++;
        jukkit.store("counter", counter);
        jukkit.log("Counter: " + counter);
    });
    
    return true;
});

jukkit.onDisable(function(plugin) {
    jukkit.log("Plugin disabled");
    
    // 取消定时器
    if (timerId !== null) {
        jukkit.cancelTask(timerId);
    }
});

jukkit.onUnload(function() {
    jukkit.log("Plugin unloading, goodbye!");
});
```


## TypeScript 类型补全

Jukkit 提供完整的 TypeScript 类型定义，支持智能代码补全和类型检查。

### 启用方式

许多现代编辑器可以自动加载`index.d.ts`。

#### 方式一：三斜线指令（推荐）
在 `.js` 文件顶部添加：
```javascript
/// <reference path="./index.d.ts" />
```

### 类型定义文件结构

```
index.d.ts              # 入口文件（使用三斜线指令引入所有类型）
jsconfig.json           # JavaScript 项目配置（可选）
types/
├── global.d.ts         # 全局对象定义（java/org/bukkit/server 等）
├── jukkit.d.ts         # Jukkit API 核心定义（含事件监听类型推断）
├── classes.d.ts        # Bukkit 核心类定义（Player/Entity/Block/ItemStack 等）
└── events.d.ts         # 事件定义（PlayerJoinEvent 等，含 EventMap）
```

### 全局对象类型

#### 引擎内置（Nashorn）
- `Java` - Java 类型访问
- `java` - Java 包根
- `org` - Java 包根
- `Packages` - 访问任意 Java 包

#### 环境提供
- `jukkit` - Jukkit API 主对象
- `bukkit` - Bukkit 类引用（完整类型定义，支持所有 Bukkit 静态方法）
- `server` - Bukkit Server 实例
- `plugin` - 当前插件实例

### 主要类型类别

#### 1. 核心类
- `Plugin`, `Server`, `World`
- `Player`, `Entity`, `LivingEntity`, `HumanEntity`
- `Block`, `ItemStack`, `Material`, `Location`, `Vector`
- `Inventory`, `Chunk`

#### 2. 管理类
- `PluginManager` - 插件管理器
- `BukkitScheduler` - 任务调度器
- `Command` - 命令
- `Scoreboard`, `ScoreboardManager` - 记分板

#### 3. 配置类
- `ConfigurationSection`, `FileConfiguration`
- `ConfigurationOptions`

#### 4. 权限类
- `Permission`, `PermissionAttachment`
- `PermissionAttachmentInfo`, `Permissible`

#### 5. 枚举类型
- `GameMode`, `Difficulty`, `Environment`
- `WorldType`, `Biome`, `BlockFace`
- `InventoryType`, `PotionEffectType`
- `Particle`, `Sound`, `Effect`, `EntityType`
- `PermissionDefault`, `DisplaySlot`

### 类型推断特性

#### 1. 事件监听自动类型推断

`jukkit.on()` 方法会根据事件名称自动推断回调函数中 `event` 参数的类型：

```javascript
/// <reference path="./index.d.ts" />

// PlayerJoinEvent - event 自动推断为 PlayerJoinEvent 类型
jukkit.on("PlayerJoinEvent", function(event) {
    var player = event.getPlayer();      // Player 类型
    var message = event.getJoinMessage(); // string 类型
});

// BlockBreakEvent - event 自动推断为 BlockBreakEvent 类型
jukkit.on("BlockBreakEvent", function(event) {
    var player = event.getPlayer();  // Player 类型
    var block = event.getBlock();    // Block 类型
    event.setCancelled(true);        // 方法自动补全
});

// InventoryClickEvent - event 自动推断为 InventoryClickEvent 类型
jukkit.on("InventoryClickEvent", function(event) {
    var whoClicked = event.getWhoClicked(); // HumanEntity 类型
    var cursor = event.getCursor();         // ItemStack 类型
    var slot = event.getSlot();             // number 类型
});
```

#### 2. 带优先级的事件监听

```javascript
// 带优先级时同样支持类型推断
jukkit.on("PlayerInteractEvent", "HIGH", function(event) {
    var player = event.getPlayer();     // Player 类型
    var action = event.getAction();     // Action 枚举
    var block = event.getClickedBlock(); // Block 类型
});
```

#### 3. 使用事件类（通用方式）

```javascript
// 使用 Java.type 获取事件类（适用于所有事件）
var PlayerJoinEvent = Java.type("org.bukkit.event.player.PlayerJoinEvent");

jukkit.on(PlayerJoinEvent, function(event) {
    var player = event.getPlayer(); // Player 类型
});
```

#### 4. 核心类类型补全

所有 Bukkit 核心类都有完整的类型定义：

```javascript
// Player 对象的方法补全
jukkit.on("PlayerJoinEvent", function(event) {
    var player = event.getPlayer();
    
    // 玩家属性
    var name = player.getName();           // string
    var health = player.getHealth();       // number
    var gameMode = player.getGameMode();   // GameMode 枚举
    
    // 位置信息
    var location = player.getLocation();   // Location 类型
    var world = player.getWorld();         // World 类型
    var x = location.getX();               // number
    
    // 物品栏
    var inventory = player.getInventory(); // PlayerInventory 类型
    var helmet = inventory.getHelmet();    // ItemStack 类型
    
    // 所有方法都有类型提示！
});

// Block 对象的方法补全
jukkit.on("BlockBreakEvent", function(event) {
    var block = event.getBlock();
    
    var type = block.getType();            // Material 类型
    var x = block.getX();                  // number
    var y = block.getY();                  // number
    var z = block.getZ();                  // number
    var light = block.getLightLevel();     // number
    var data = block.getBlockData();       // BlockData 类型
});

// ItemStack 对象的方法补全
var item = Java.type("org.bukkit.item.ItemStack");
var stack = new item(Material.DIAMOND_SWORD, 1);

stack.getType();          // Material 类型
stack.getAmount();        // number
stack.getDurability();    // number
stack.hasItemMeta();      // boolean
stack.getItemMeta();      // ItemMeta 类型
```

#### 5. 枚举类型补全

所有 Bukkit 枚举类型都有完整定义：

```javascript
// GameMode 枚举
jukkit.onEnable(function(plugin) {
    var mode = org.bukkit.GameMode.CREATIVE;
    var mode2 = org.bukkit.GameMode.SURVIVAL;
    // CREATIVE, SURVIVAL, ADVENTURE, SPECTATOR
});

// Material 枚举
var diamond = org.bukkit.Material.DIAMOND;
var stone = org.bukkit.Material.STONE;
// 所有方块和物品都有补全

// 事件优先级
jukkit.on("PlayerMoveEvent", "MONITOR", function(event) {
    // "LOWEST", "LOW", "NORMAL", "HIGH", "HIGHEST", "MONITOR"
});
```

### 支持的事件类型（EventMap）

以下事件名称在 `jukkit.on()` 中使用时会自动推断类型：

**玩家事件：**
- `PlayerJoinEvent`, `PlayerQuitEvent`, `PlayerDeathEvent`
- `PlayerRespawnEvent`, `PlayerMoveEvent`, `PlayerTeleportEvent`
- `PlayerInteractEvent`, `PlayerChatEvent`, `PlayerCommandPreprocessEvent`
- `PlayerDropItemEvent`, `PlayerPickupItemEvent`, `BlockPlaceEvent`, `BlockBreakEvent`

**实体事件：**
- `CreatureSpawnEvent`, `EntityDeathEvent`, `EntityDamageEvent`
- `EntityTargetEvent`, `EntityExplodeEvent`

**方块事件：**
- `BlockBurnEvent`, `BlockDispenseEvent`, `BlockRedstoneEvent`

**库存事件：**
- `InventoryClickEvent`, `InventoryDragEvent`, `CraftItemEvent`

**世界事件：**
- `WeatherChangeEvent`, `LightningStrikeEvent`, `StructureGrowEvent`

**车辆事件：**
- `VehicleEnterEvent`, `VehicleExitEvent`, `VehicleDamageEvent`

**其他事件：**
- `ServerCommandEvent`, `PluginEnableEvent`, `PluginDisableEvent`

> 提示：使用不在列表中的事件名称时，类型会回退到 `any`，但仍可正常使用。

### 全局对象使用示例

#### bukkit 对象（Bukkit 类引用）

```javascript
/// <reference path="./index.d.ts" />

jukkit.onEnable(function(plugin) {
    // 获取所有在线玩家
    var players = bukkit.getOnlinePlayers();
    
    // 广播消息
    bukkit.broadcastMessage("欢迎新玩家加入！");
    
    // 获取世界
    var world = bukkit.getWorld("world");
    if (world) {
        jukkit.log("世界名称：" + world.getName());
    }
    
    // 创建物品栏
    var chest = bukkit.createInventory(null, 54, "箱子");
    
    // 获取玩家
    var player = bukkit.getPlayer("Notch");
    if (player) {
        player.sendMessage("找到你了！");
    }
    
    // 服务器信息
    jukkit.log("服务器版本：" + bukkit.getVersion());
    jukkit.log("最大玩家数：" + bukkit.getMaxPlayers());
});
```

#### server 对象（Server 实例）

```javascript
/// <reference path="./index.d.ts" />

jukkit.onEnable(function(plugin) {
    // server 等同于 bukkit.getServer()
    var onlinePlayers = server.getOnlinePlayers();
    var worlds = server.getWorlds();
    var version = server.getVersion();
    
    // 发送广播
    server.broadcast("服务器消息", "broadcast.admin");
    
    // 获取插件命令
    var cmd = server.getPluginCommand("help");
});
```

#### plugin 对象（插件实例）

```javascript
/// <reference path="./index.d.ts" />

jukkit.onEnable(function(plugin) {
    // plugin 是当前 JsPluginTemplate 实例
    var name = plugin.getPluginName();
    var version = plugin.getPluginVersion();
    var dataFolder = plugin.getDataFolder();
    var logger = plugin.getLogger();
    var isDev = plugin.isDevMode();
    
    jukkit.log("插件：" + name + " v" + version);
    jukkit.log("开发模式：" + isDev);
});
```

### 类型安全示例

```javascript
/// <reference path="./index.d.ts" />

jukkit.onEnable(function(plugin) {
    // 类型安全的玩家操作
    jukkit.on("PlayerJoinEvent", function(event) {
        var player = event.getPlayer();  // Player 类型
        
        // 这些方法都有类型提示
        player.sendMessage("欢迎！");
        player.setHealth(20);
        player.setFoodLevel(20);
        player.setGameMode(org.bukkit.GameMode.SURVIVAL);
        
        // 位置信息
        var loc = player.getLocation();  // Location 类型
        var x = loc.getX();
        var y = loc.getY();
        var z = loc.getZ();
        var world = loc.getWorld();  // World 类型
        
        // 物品栏操作
        var inv = player.getInventory();  // PlayerInventory 类型
        var helmet = inv.getHelmet();     // ItemStack 类型
        var heldItem = inv.getItemInMainHand();
        
        if (helmet && helmet.getType() === org.bukkit.Material.DIAMOND_HELMET) {
            player.sendMessage("你戴着钻石头盔！");
        }
    });
    
    // 类型安全的方块操作
    jukkit.on("BlockBreakEvent", function(event) {
        var block = event.getBlock();  // Block 类型
        var type = block.getType();    // Material 类型
        
        jukkit.log("方块类型：" + type.name());
        jukkit.log("方块坐标：" + block.getX() + ", " + block.getY() + ", " + block.getZ());
        
        // 设置新方块
        block.setType(org.bukkit.Material.STONE);
    });
    
    // 类型安全的记分板操作
    var scoreboard = bukkit.getScoreboardManager().getMainScoreboard();
    var objective = scoreboard.registerNewObjective("health", "health", "生命值");
    objective.setDisplaySlot(org.bukkit.scoreboard.DisplaySlot.SIDEBAR);
});
```