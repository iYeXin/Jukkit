// Jukkit API Core Definitions
// Jukkit 核心 API 定义

// 注意：此文件使用环境声明，类型从 events.d.ts 全局可用

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
     * 监听事件（通过事件名称 - 支持类型推断）
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
    command(name: string, executor: CommandExecutor): JukkitAPI;
    
    /**
     * 注册带选项的命令
     * @param name 命令名称
     * @param options 命令选项
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
    
    // ========== 数据存储 ==========
    
    /**
     * 存储数据
     * @param key 键
     * @param value 值
     */
    store(key: string, value: any): JukkitAPI;
    
    /**
     * 获取数据
     * @param key 键
     * @returns 值
     */
    get(key: string): any;
    
    /**
     * 获取数据（带类型）
     * @param key 键
     * @param type 类型，如 Java.type("java.lang.String")
     * @returns 值
     */
    get<T>(key: string, type: new (...args: any[]) => T): T | null;
    
    /**
     * 检查键是否存在
     * @param key 键
     * @returns 是否存在
     */
    has(key: string): boolean;
    
    /**
     * 删除数据
     * @param key 键
     */
    remove(key: string): JukkitAPI;
    
    // ========== 工具方法 ==========
    
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
 * CommandOptions 构造函数
 */
declare const CommandOptions: new () => CommandOptions;
