// Jukkit API Core Definitions
// Jukkit 核心 API 定义

// 注意：此文件使用环境声明，类型从 events.d.ts 全局可用

// ========== 平台信息接口 ==========

/**
 * 平台信息接口
 * 提供当前运行平台的相关信息
 */
interface PlatformInfo {
    /**
     * 平台类型
     * - "BUKKIT": Bukkit/Spigot/Paper 等基于 Bukkit API 的服务器
     */
    readonly type: "BUKKIT";

    /**
     * Minecraft 版本号
     * 如 "1.20.4"，解析失败时为 "unknown"
     */
    readonly mcVersion: string;

    /**
     * 获取平台类型
     * @returns 平台类型字符串
     */
    getType(): "BUKKIT";

    /**
     * 获取 Minecraft 版本号
     * @returns Minecraft 版本号字符串
     */
    getMcVersion(): string;
}

// ========== 资源处理器接口 ==========

/**
 * 资源处理器接口
 * 用于访问打包在插件中的资源文件
 */
interface ResourceHandler {
    /**
     * 获取资源内容（字节数组）
     * @param path 资源路径（相对于 assets 目录）
     * @returns 资源内容的字节数组，不存在则返回 null
     */
    get(path: string): number[] | null;

    /**
     * 获取资源内容（字符串）
     * @param path 资源路径
     * @returns 资源内容的字符串，不存在则返回 null
     */
    getAsString(path: string): string | null;

    /**
     * 获取资源流
     * @param path 资源路径
     * @returns InputStream，不存在则返回 null
     */
    getStream(path: string): any | null;

    /**
     * 检查资源是否存在
     * @param path 资源路径
     * @returns 是否存在
     */
    exists(path: string): boolean;

    /**
     * 检查是否有资源
     * @returns 是否有资源
     */
    hasAssets(): boolean;

    /**
     * 列出目录下的所有文件和目录
     * @param dirPath 目录路径
     * @returns 文件和目录名称列表
     */
    list(dirPath: string): string[];

    /**
     * 列出目录下的所有文件
     * @param dirPath 目录路径
     * @returns 文件名称列表
     */
    listFiles(dirPath: string): string[];

    /**
     * 列出目录下的所有子目录
     * @param dirPath 目录路径
     * @returns 目录名称列表
     */
    listDirectories(dirPath: string): string[];

    /**
     * 获取所有资源路径
     * @returns 所有资源路径集合
     */
    getAllPaths(): string[];

    /**
     * 提取资源到指定路径
     * @param source 资源路径
     * @param destination 目标文件路径
     * @returns 是否成功
     */
    extract(source: string, destination: string): boolean;

    /**
     * 提取资源到插件数据目录
     * @param source 资源路径
     * @param relativeDest 相对于插件数据目录的目标路径
     * @returns 是否成功
     */
    extractToDataFolder(source: string, relativeDest: string): boolean;

    /**
     * 提取整个目录
     * @param sourceDir 源目录路径
     * @param destinationDir 目标目录路径
     * @returns 提取的文件数量
     */
    extractDirectory(sourceDir: string, destinationDir: string): number;

    /**
     * 提取所有资源到指定目录
     * @param destinationDir 目标目录路径
     * @returns 提取的文件数量
     */
    extractAll(destinationDir: string): number;

    /**
     * 提取所有资源到插件数据目录
     * @returns 提取的文件数量
     */
    extractAllToDataFolder(): number;

    /**
     * 读取文本资源
     * @param path 资源路径
     * @returns 文本内容，不存在则返回 null
     */
    readText(path: string): string | null;

    /**
     * 按行读取文本资源
     * @param path 资源路径
     * @returns 行数组，不存在则返回 null
     */
    readLines(path: string): string[] | null;

    /**
     * 获取资源大小
     * @param path 资源路径
     * @returns 资源大小（字节），不存在则返回 -1
     */
    size(path: string): number;

    /**
     * 获取所有资源的总大小
     * @returns 总大小（字节）
     */
    totalSize(): number;

    /**
     * 获取资源数量
     * @returns 资源数量
     */
    count(): number;
}

// ========== Jukkit API 接口 ==========

/**
 * Jukkit API 主接口
 * 提供所有 Jukkit 框架 API
 */
interface JukkitAPI {
    // ========== 生命周期钩子 ==========

    /**
     * 设置插件加载时的回调函数
     * @param handler 回调函数，接收 plugin 实例
     */
    onLoad(handler: (plugin: JsPluginTemplate) => void): void;

    /**
     * 设置插件启用时的回调函数
     * @param handler 回调函数，接收 plugin 实例，可返回 boolean
     */
    onEnable(handler: (plugin: JsPluginTemplate) => boolean | void): void;

    /**
     * 设置插件启用时的回调函数（明确返回值）
     * @param handler 回调函数，接收 plugin 实例，返回 boolean 表示是否启用成功
     */
    onEnableWithResult(handler: (plugin: JsPluginTemplate) => boolean): void;

    /**
     * 设置插件禁用时的回调函数
     * @param handler 回调函数，接收 plugin 实例
     */
    onDisable(handler: (plugin: JsPluginTemplate) => void): void;

    /**
     * 设置插件卸载时的回调函数（在 onDisable 之后调用）
     * @param handler 回调函数
     */
    onUnload(handler: () => void): void;

    // ========== 事件监听 ==========

    /**
     * 添加事件监听器（通过事件名称 - 支持类型推断）
     * jukkit.on 是此方法的简写形式
     * @param eventName 事件名称，如 "PlayerJoinEvent"
     * @param handler 事件处理函数，event 参数会自动推断为对应的事件类型
     * @example
     * jukkit.addEventListener("PlayerJoinEvent", function(event) {
     *     var player = event.getPlayer(); // Player 类型
     * });
     */
    addEventListener<K extends keyof EventMap>(eventName: K, handler: (event: EventMap[K]) => void): JukkitAPI;

    /**
     * 添加事件监听器（通过事件名称 + 优先级 - 支持类型推断）
     * @param eventName 事件名称
     * @param priority 优先级："LOWEST", "LOW", "NORMAL", "HIGH", "HIGHEST", "MONITOR"
     * @param handler 事件处理函数，event 参数会自动推断为对应的事件类型
     */
    addEventListener<K extends keyof EventMap>(eventName: K, priority: EventPriority, handler: (event: EventMap[K]) => void): JukkitAPI;

    /**
     * 添加事件监听器（通过事件名称 - 通用字符串，无类型推断）
     * @param eventName 任意事件名称字符串
     * @param handler 事件处理函数
     */
    addEventListener(eventName: string, handler: (event: any) => void): JukkitAPI;

    /**
     * 添加事件监听器（通过事件名称 + 优先级 - 通用字符串，无类型推断）
     * @param eventName 任意事件名称字符串
     * @param priority 优先级
     * @param handler 事件处理函数
     */
    addEventListener(eventName: string, priority: EventPriority, handler: (event: any) => void): JukkitAPI;

    /**
     * 监听事件（通过事件名称 - 支持类型推断）
     * jukkit.addEventListener 的简写形式
     * @param eventName 事件名称，如 "PlayerJoinEvent"
     * @param handler 事件处理函数，event 参数会自动推断为对应的事件类型
     * @example
     * jukkit.on("PlayerJoinEvent", function(event) {
     *     var player = event.getPlayer(); // Player 类型
     * });
     */
    on<K extends keyof EventMap>(eventName: K, handler: (event: EventMap[K]) => void): JukkitAPI;

    /**
     * 监听事件（通过事件名称 + 优先级 - 支持类型推断）
     * @param eventName 事件名称
     * @param priority 优先级："LOWEST", "LOW", "NORMAL", "HIGH", "HIGHEST", "MONITOR"
     * @param handler 事件处理函数，event 参数会自动推断为对应的事件类型
     */
    on<K extends keyof EventMap>(eventName: K, priority: EventPriority, handler: (event: EventMap[K]) => void): JukkitAPI;

    /**
     * 监听事件（通过事件名称 - 通用字符串，无类型推断）
     * @param eventName 任意事件名称字符串
     * @param handler 事件处理函数
     */
    on(eventName: string, handler: (event: any) => void): JukkitAPI;

    /**
     * 监听事件（通过事件名称 + 优先级 - 通用字符串，无类型推断）
     * @param eventName 任意事件名称字符串
     * @param priority 优先级
     * @param handler 事件处理函数
     */
    on(eventName: string, priority: EventPriority, handler: (event: any) => void): JukkitAPI;

    /**
     * 监听事件（通过事件类）
     * @param eventClass 事件类，如 Java.type("org.bukkit.event.player.PlayerJoinEvent")
     * @param handler 事件处理函数
     */
    on<T extends Event>(eventClass: new (...args: any[]) => T, handler: (event: T) => void): JukkitAPI;

    /**
     * 监听事件（通过事件类 + 优先级）
     * @param eventClass 事件类
     * @param priority 优先级
     * @param handler 事件处理函数
     */
    on<T extends Event>(eventClass: new (...args: any[]) => T, priority: EventPriority, handler: (event: T) => void): JukkitAPI;

    // ========== 命令注册 ==========

    /**
     * 注册简单命令
     * @param name 命令名称
     * @param executor 命令执行函数
     */
    registerCommand(name: string, executor: CommandExecutor): JukkitAPI;

    /**
     * 注册带 Tab 补全的命令
     * @param name 命令名称
     * @param executor 命令执行函数
     * @param tabCompleter Tab 补全函数
     */
    registerCommand(name: string, executor: CommandExecutor, tabCompleter: TabCompleter): JukkitAPI;

    /**
     * 注册带选项的命令
     * @param name 命令名称
     * @param options 命令选项
     */
    registerCommand(name: string, options: CommandOptions): JukkitAPI;

    /**
     * @deprecated 使用 registerCommand 代替
     */
    command(name: string, executor: CommandExecutor): JukkitAPI;

    /**
     * @deprecated 使用 registerCommand 代替
     */
    command(name: string, options: CommandOptions): JukkitAPI;

    // ========== 任务调度（Tick 级，主线程） ==========

    /**
     * 立即执行任务（主线程）
     * @param task 任务函数
     * @returns 任务 ID，可用于取消
     */
    runTask(task: () => void): number;

    /**
     * 延迟执行任务（主线程）
     * @param delay 延迟 tick 数（20 ticks = 1 秒）
     * @param task 任务函数
     * @returns 任务 ID
     */
    runTaskLater(delay: number, task: () => void): number;

    /**
     * 定时执行任务（主线程）
     * @param period 周期 tick 数
     * @param task 任务函数
     * @returns 任务 ID
     */
    runTaskTimer(period: number, task: () => void): number;

    /**
     * 定时执行任务（主线程，带延迟）
     * @param delay 延迟 tick 数
     * @param period 周期 tick 数
     * @param task 任务函数
     * @returns 任务 ID
     */
    runTaskTimer(delay: number, period: number, task: () => void): number;

    // ========== 任务调度（毫秒级，异步线程） ==========

    /**
     * 异步执行任务（低开销）
     * @param task 任务函数
     * @returns 任务 ID
     */
    runAsync(task: () => void): number;

    /**
     * 延迟执行任务（异步，毫秒）
     * @param delayMs 延迟毫秒数
     * @param task 任务函数
     * @returns 任务 ID
     */
    runAsyncLater(delayMs: number, task: () => void): number;

    /**
     * 定时执行任务（异步，毫秒）
     * @param periodMs 周期毫秒数
     * @param task 任务函数
     * @returns 任务 ID
     */
    runAsyncTimer(periodMs: number, task: () => void): number;

    /**
     * 定时执行任务（异步，毫秒，带延迟）
     * @param delayMs 延迟毫秒数
     * @param periodMs 周期毫秒数
     * @param task 任务函数
     * @returns 任务 ID
     */
    runAsyncTimer(delayMs: number, periodMs: number, task: () => void): number;

    /**
     * 取消任务
     * @param taskId 任务 ID
     * @returns 是否成功取消
     */
    cancelTask(taskId: number): boolean;

    // ========== 资源访问 ==========

    /**
     * 资源处理器
     * 用于访问打包在插件中的资源文件
     * @example
     * // 读取配置文件
     * const config = jukkit.resource.getAsString('config.json');
     * 
     * // 提取资源到数据目录
     * jukkit.resource.extractToDataFolder('default-config.yml', 'config.yml');
     */
    readonly resource: ResourceHandler;

    /**
     * 平台信息
     * 提供当前运行平台的相关信息
     * @example
     * if (jukkit.platform.type === 'BUKKIT') {
     *     // Bukkit 平台特定逻辑
     * }
     */
    readonly platform: PlatformInfo;

    // ========== 工具方法 ==========

    /**
     * 获取插件数据目录路径
     * @returns 插件数据目录路径，格式为 "plugins/插件名"
     */
    getDataDirPath(): string;

    /**
     * 记录日志（INFO 级别）
     * @param message 日志内容
     */
    log(message: string): void;

    /**
     * 记录日志（指定级别）
     * @param level 日志级别，如 java.util.logging.Level.INFO
     * @param message 日志内容
     */
    log(level: any, message: string): void;

    /**
     * 记录警告日志
     * @param message 日志内容
     */
    warn(message: string): void;

    /**
     * 记录错误日志
     * @param message 日志内容
     */
    error(message: string): void;

    /**
     * 获取插件实例
     * @returns JsPluginTemplate 实例
     */
    getPlugin(): JsPluginTemplate;

    /**
     * 获取服务器实例
     * @returns Bukkit Server 实例
     */
    getServer(): Server;

    /**
     * 注入全局变量到 JS 上下文
     * @param id 变量名
     * @param value 变量值
     * @returns JukkitAPI 实例（支持链式调用）
     * @example
     * jukkit.injectGlobalVariable('myGlobal', { foo: 'bar' });
     * // 之后可以直接使用 myGlobal
     * 
     * @description 一般情况下推荐使用 globalThis 挂载全局变量，更简洁直观：
     * globalThis.myGlobal = { foo: 'bar' };
     */
    injectGlobalVariable(id: string, value: any): JukkitAPI;

    /**
     * 获取 JS 脚本引擎实例
     * @returns Nashorn ScriptEngine 实例
     */
    getJsContext(): any;
}

// ========== 插件模板接口 ==========

/**
 * JsPluginTemplate 接口
 * 当前插件实例的类型
 */
interface JsPluginTemplate {
    getPluginName(): string;
    getPluginVersion(): string;
    getServer(): Server;
    getLogger(): any;
    isDevMode(): boolean;
    getDataFolder(): File;
    getFile(): File;
    isEnabled(): boolean;
}

// ========== 命令相关接口 ==========

/**
 * 命令执行函数
 */
interface CommandExecutor {
    (sender: CommandSender, cmd: Command, label: string, args: string[]): boolean;
}

/**
 * 命令选项接口
 */
interface CommandOptions {
    description(desc: string): CommandOptions;
    usage(usage: string): CommandOptions;
    aliases(...aliases: string[]): CommandOptions;
    permission(perm: string): CommandOptions;
    permissionMessage(msg: string): CommandOptions;
    executor(executor: CommandExecutor): CommandOptions;
    tabComplete(completer: TabCompleterFunction): CommandOptions;
}

/**
 * Tab 补全函数
 */
interface TabCompleterFunction {
    (sender: CommandSender, cmd: Command, alias: string, args: string[]): string[] | null;
}

/**
 * Tab 补全接口（Bukkit 标准）
 */
interface TabCompleter {
    onTabComplete(sender: CommandSender, cmd: Command, alias: string, args: string[]): string[] | null;
}

/**
 * CommandOptions 构造函数
 */
declare const CommandOptions: new () => CommandOptions;
