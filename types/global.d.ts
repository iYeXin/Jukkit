// Global Objects Definitions
// 全局对象定义 - Nashorn 引擎和环境提供

// ========== Nashorn 引擎内置对象 ==========

/**
 * Java 类型访问入口
 * @example
 * const ArrayList = Java.type("java.util.ArrayList");
 * const list = new ArrayList();
 */
declare const Java: {
    type(className: string): any;
    fromJava(obj: any): any;
    toJava(obj: any, targetType?: any): any;
    isJavaObject(obj: any): boolean;
    super(type: any, obj?: any): any;
    synchronized(lock: any, func: () => any): any;
};

/**
 * Java 包根 - java 包
 * @example
 * java.lang.System.out.println("Hello");
 * java.util.UUID.randomUUID();
 */
declare namespace java {
    namespace lang {
        const System: any;
        const String: any;
        const Object: any;
        const Class: any;
        const Thread: any;
        const Runnable: any;
        const Exception: any;
        const RuntimeException: any;
    }
    namespace util {
        const ArrayList: any;
        const HashMap: any;
        const HashSet: any;
        const UUID: any;
        const Random: any;
        const Date: any;
        const Timer: any;
    }
    namespace io {
        const File: any;
        const FileInputStream: any;
        const FileOutputStream: any;
    }
    namespace nio {
        namespace file {
            const Files: any;
            const Paths: any;
            const Path: any;
        }
    }
}

/**
 * Java 包根 - org 包
 * @example
 * org.bukkit.Bukkit.getServer();
 * org.bukkit.Material.STONE;
 */
declare namespace org {
    namespace bukkit {
        const Bukkit: any;
        const Material: any;
        const ChatColor: any;
        const Location: any;
        const World: any;
        const Server: any;
        const PluginManager: any;
        const Scheduler: any;
        const command: any;
        const event: any;
        const entity: any;
        const block: any;
        const inventory: any;
        const potion: any;
        const enchantment: any;
        const scoreboard: any;
        const bossbar: any;
        const advancement: any;
        const attribute: any;
        const configuration: any;
        const conversations: any;
        const effects: any;
        const enchantments: any;
        const gameMode: any;
        const generator: any;
        const help: any;
        const map: any;
        const metadata: any;
        const namespaced: any;
        const offline: any;
        const permissions: any;
        const persistence: any;
        const plugin: any;
        const profile: any;
        const projectiles: any;
        const scheduler: any;
        const services: any;
        const skill: any;
        const statistics: any;
        const structure: any;
        const util: any;
        const village: any;
        const WorldBorder: any;
        const WorldCreator: any;
        const WorldType: any;
    }
}

/**
 * Java 包根 - Packages 对象（访问任意 Java 包）
 * @example
 * Packages.java.lang.System.out.println("Hello");
 */
declare const Packages: {
    java: typeof java;
    org: typeof org;
    [packageName: string]: any;
};

// ========== 环境提供对象 ==========

/**
 * Bukkit 类引用
 * 等同于 org.bukkit.Bukkit 类本身
 * @example
 * bukkit.getServer().getOnlinePlayers();
 * bukkit.createWorld(worldCreator);
 * bukkit.broadcastMessage("Hello!");
 */
declare const bukkit: {
    // Server 管理
    getServer(): Server;
    
    // 插件管理
    getPluginManager(): PluginManager;
    getScheduler(): BukkitScheduler;
    getServicesManager(): any;
    
    // 世界管理
    getWorlds(): World[];
    getWorld(name: string): World | null;
    getWorld(uid: string): World | null;
    createWorld(worldCreator: any): World | null;
    unloadWorld(world: World, save: boolean): boolean;
    unloadWorld(name: string, save: boolean): boolean;
    
    // 玩家管理
    getOnlinePlayers(): Player[];
    getPlayer(name: string): Player | null;
    getPlayer(uuid: string): Player | null;
    getPlayerExact(name: string): Player | null;
    matchPlayer(name: string): Player[];
    getOfflinePlayer(name: string): OfflinePlayer;
    getOfflinePlayers(): OfflinePlayer[];
    
    // 命令相关
    getPluginCommand(name: string): Command | null;
    dispatchCommand(sender: CommandSender, commandLine: string): boolean;
    
    // 广播
    broadcast(message: string): void;
    broadcastMessage(message: string): void;
    
    // 服务器信息
    getName(): string;
    getVersion(): string;
    getBukkitVersion(): string;
    getPort(): number;
    getIp(): string;
    getMaxPlayers(): number;
    getServerId(): string;
    getServerName(): string;
    
    // 配置
    getDefaultGameMode(): GameMode;
    setDefaultGameMode(mode: GameMode): void;
    getDifficulty(): Difficulty;
    setDifficulty(difficulty: Difficulty): void;
    hasWhitelist(): boolean;
    setWhitelist(value: boolean): void;
    getWhitelistedPlayers(): OfflinePlayer[];
    
    // 其他工具
    createInventory(holder: any, size: number, title?: string): Inventory;
    createLocation(world: World, x: number, y: number, z: number): Location;
    spawnLocation(location: Location, type: EntityType): Entity;
    
    // 服务器操作
    reload(): void;
    reloadCommands(): void;
    shutdown(): void;
    
    // 计分板
    getScoreboardManager(): ScoreboardManager;
    getMainScoreboard(): Scoreboard;
    
    // 注册表
    getRegistry(): any;
};

/**
 * Bukkit Server 实例
 * 当前服务器的实例对象，等同于 bukkit.getServer()
 * @example
 * server.getOnlinePlayers();
 * server.broadcastMessage("Hello!");
 */
declare const server: Server;

/**
 * 当前插件实例
 * JsPluginTemplate 的实例
 */
declare const plugin: JsPluginTemplate;

/**
 * Jukkit API 主对象
 * 提供所有 Jukkit 框架 API
 */
declare const jukkit: JukkitAPI;

// ========== Polyfill 全局对象（通过 init.js 预挂载） ==========

/**
 * 全局对象，用于挂载全局变量
 * @example
 * globalThis.myHelper = function() { ... };
 * globalThis.API_BASE = 'https://api.example.com';
 */
declare var globalThis: typeof globalThis & {
    [key: string]: any;
};

/**
 * Promise 构造函数（通过 polyfill 提供）
 * @example
 * new Promise((resolve, reject) => { ... });
 * Promise.all([p1, p2, p3]);
 * Promise.resolve(value);
 */
declare var Promise: PromiseConstructor;

/**
 * 延迟执行函数（通过 polyfill 提供）
 * @param callback 回调函数
 * @param delay 延迟毫秒数
 * @param args 传递给回调的参数
 * @returns 定时器 ID
 */
declare function setTimeout(callback: (...args: any[]) => void, delay: number, ...args: any[]): number;

/**
 * 定时执行函数（通过 polyfill 提供）
 * @param callback 回调函数
 * @param delay 间隔毫秒数
 * @param args 传递给回调的参数
 * @returns 定时器 ID
 */
declare function setInterval(callback: (...args: any[]) => void, delay: number, ...args: any[]): number;

/**
 * 清除延迟定时器
 * @param timerId 定时器 ID
 */
declare function clearTimeout(timerId: number): void;

/**
 * 清除间隔定时器
 * @param timerId 定时器 ID
 */
declare function clearInterval(timerId: number): void;

/**
 * 立即执行函数（通过 polyfill 提供）
 * @param callback 回调函数
 * @param args 传递给回调的参数
 * @returns 立即执行 ID
 */
declare function setImmediate(callback: (...args: any[]) => void, ...args: any[]): number;

/**
 * 清除立即执行
 * @param immediateId 立即执行 ID
 */
declare function clearImmediate(immediateId: number): void;

/**
 * fetch 函数（通过 init.js 预挂载）
 * @param url 请求 URL
 * @param options 请求选项
 * @returns Promise<Response>
 */
declare function fetch(url: string, options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string | object;
    timeout?: number;
}): Promise<Response>;

/**
 * console 对象（通过 init.js 预挂载）
 * 仅用于快速调试，生产环境建议使用 Logger 类或 jukkit.log 方法
 */
declare var console: {
    log(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
};

/**
 * Response 对象（fetch 返回）
 */
interface Response {
    status: number;
    statusText: string;
    ok: boolean;
    headers: Record<string, string>;
    text(): Promise<string>;
    json(): Promise<any>;
    base64(): Promise<string>;
    arrayBuffer(): Promise<any>;
    blob(): Promise<{ type: string; size: number; data: any }>;
    getHeader(name: string): string | null;
}
