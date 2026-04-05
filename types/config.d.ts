// Jukkit Config Definitions
// Jukkit 配置类型定义

/**
 * Jukkit 构建配置
 */
interface JukkitConfig {
    /**
     * 模板配置
     * 定义不同版本的模板 JAR 文件路径
     */
    templates: {
        /**
         * Standalone 版本
         * - 内嵌 Nashorn 引擎
         * - 不支持 Vert.x
         * - 无需前置插件
         */
        standalone: string;
        /**
         * Common 版本
         * - 依赖 Jukkit-Common 前置插件
         * - 支持 Vert.x
         */
        common: string;
        [key: string]: string;
    };

    /**
     * 项目配置
     */
    project: {
        /** 源码目录 */
        srcDir: string;
        /** 入口文件路径 */
        entry: string;
        /** 初始化脚本配置 */
        init?: {
            /** init 目录路径 */
            dir: string;
            /** 入口文件路径 */
            entry: string;
        };
        /** 资源目录路径 */
        assetsDir: string;
        /** 模块目录路径 */
        modulesDir: string;
        /** 输出的模块 ZIP 包路径 */
        output: string;
        /**
         * 编译目标
         * - 'standalone': 使用 Standalone 版本
         * - 'common': 使用 Common 版本
         * - 数组格式: 同时编译多个版本
         */
        target: string | string[];
        /**
         * TypeScript 配置
         */
        typescript?: TypeScriptConfig;
    };

    /**
     * 插件打包配置（基础配置）
     * 所有 target 共享此配置
     */
    pluginPackage: PluginPackageConfig;

    /**
     * 目标特定配置
     * 为每个编译目标提供特定的配置，会覆盖 pluginPackage 中的对应字段
     */
    targets?: {
        [targetName: string]: Partial<PluginPackageConfig>;
    };

    /**
     * 远程上传配置
     */
    upload?: UploadConfig;
}

/**
 * TypeScript 配置
 */
interface TypeScriptConfig {
    /** 是否启用 TypeScript 编译 */
    enable: boolean;
    /** tsconfig.json 路径（可选，默认 'tsconfig.json'） */
    configPath?: string;
    /** TypeScript 入口文件（可选，默认使用 entry 替换为 .ts） */
    entry?: string;
}

/**
 * 插件打包配置
 */
interface PluginPackageConfig {
    /** 插件名称 */
    name: string;
    /** 插件版本号 */
    version: string;
    /** 插件描述信息 */
    description?: string;
    /** 插件作者 */
    author?: string;
    /** 插件作者列表 */
    authors?: string[];
    /** 插件网站 */
    website?: string;
    /** 日志前缀 */
    prefix?: string;
    /** API 版本 */
    apiVersion: string;
    /** 加载顺序 */
    load?: 'STARTUP' | 'POSTWORLD';
    /** 硬依赖列表 */
    depend?: string[];
    /** 软依赖列表 */
    softdepend?: string[];
    /** 在此插件之前加载的插件列表 */
    loadbefore?: string[];
    /** 输出的 JAR 文件路径 */
    output?: string;
    /** 开发模式开关 */
    dev?: boolean;
}

/**
 * 远程上传配置
 */
interface UploadConfig {
    /** 是否启用自动上传功能 */
    enable: boolean;
    /** 上传后是否自动拉取服务器日志 */
    autoPullLogs?: boolean;
    /** MCSManager 服务器配置 */
    server: {
        /** 面板地址 */
        url: string;
        /** API 密钥 */
        apiKey: string;
        /** 守护进程 ID */
        daemonId: string;
        /** 实例 ID */
        instanceId: string;
    };
    /** 目标文件路径 */
    targetFile: string;
}
