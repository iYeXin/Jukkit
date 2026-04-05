/**
 * Jukkit 构建配置文件
 * 
 * @description 用于配置 Jukkit 插件的构建、打包和上传行为
 */
module.exports = {
    /**
     * 模板配置
     * @description 定义不同版本的模板 JAR 文件路径
     */
    templates: {
        /**
         * Standalone 版本
         * - 内嵌 Nashorn 引擎
         * - 不支持 Vert.x
         * - 无需前置插件
         * - 适合简单插件
         */
        standalone: 'templateJars/jukkit-template-standalone-1.3.0.jar',
        /**
         * Common 版本
         * - 依赖 Jukkit-Common 前置插件
         * - 支持 Vert.x
         */
        common: 'templateJars/jukkit-template-common-1.3.0.jar'
    },

    /**
     * 项目配置
     * @description 定义项目的源码目录、入口文件和输出路径
     */
    project: {
        /** 源码目录，该目录下的所有文件会被打包到 modules.zip */
        srcDir: 'src',
        /** 入口文件路径（相对于 srcDir），插件加载时首先执行此文件 */
        entry: 'index.js',
        /**
         * 初始化脚本配置
         * @description init 目录独立于 srcDir，不会被 Rspack 编译，直接打包
         * 在 JS context 创建和 require 注入后、entry 执行前执行
         * 可用于挂载全局对象、注入 polyfill 等
         */
        init: {
            /** init 目录路径（相对于项目根目录） */
            dir: 'init',
            /** 入口文件路径（相对于 init 目录） */
            entry: 'init.js'
        },
        /**
         * 资源目录路径（相对于项目根目录）
         * @description 该目录下的所有文件会被打包到 assets.zip
         * 可通过 jukkit.resource API 访问这些资源文件
         * @example
         * // 访问资源
         * const content = jukkit.resource.getAsString('config.json');
         * jukkit.resource.extract('data/default.yml', 'plugins/MyPlugin/data/default.yml');
         */
        assetsDir: 'src/assets',
        /**
         * 模块目录路径（相对于项目根目录）
         * @description 该目录下的 JS 文件可直接通过 require('modulename') 引入
         * 不经过 Rspack 编译，保持原始结构
         * @example
         * // modules/utils.js
         * module.exports = { hello: () => 'world' };
         * 
         * // src/index.js
         * const utils = require('utils');  // 直接通过模块名引入
         */
        modulesDir: 'modules',
        /** 输出的模块 ZIP 包路径，包含所有源码文件 */
        output: 'dist/modules.zip',
        /**
         * 编译目标配置
         * @description 指定使用哪个模板进行编译
         * - 'standalone': 使用 Standalone 版本（内嵌 Nashorn，无 Vert.x）
         * - 'common': 使用 Common 版本（依赖 Jukkit-Common，支持 Vert.x）
         * - 数组格式: 同时编译多个版本
         * @example
         * // 单一目标
         * target: 'common'
         * // 多目标
         * target: ['standalone', 'common']
         */
        target: ['standalone', 'common'],
        /**
         * TypeScript 配置
         * @description 启用 TypeScript 支持（可选功能，默认关闭）
         * @example
         * typescript: {
         *     enable: true,           // 启用 TypeScript 编译
         *     configPath: 'tsconfig.json',  // tsconfig.json 路径（可选）
         *     entry: 'index.ts'       // TypeScript 入口文件（可选，默认使用 entry）
         * }
         */
        typescript: {
            /** 是否启用 TypeScript 编译 */
            enable: false
        }
    },

    /**
     * 插件打包配置（基础配置）
     * @description 用于生成可部署的 JAR 插件文件，所有 target 共享此配置
     */
    pluginPackage: {
        /** 插件名称，将显示在服务器插件列表中 */
        name: 'MyPlugin',
        /** 插件版本号 */
        version: '1.1.0',
        /** 插件描述信息 */
        description: 'A Jukkit plugin',
        /** 插件作者（单个作者时使用） */
        author: 'iyexin',
        /** 插件作者列表（多个作者时使用，优先于 author） */
        authors: [],
        /** 插件网站 */
        website: '',
        /** 日志前缀，默认使用插件名称 */
        prefix: '',
        /** API 版本 */
        apiVersion: '1.20',
        /**
         * 加载顺序
         * - STARTUP: 服务器启动时加载
         * - POSTWORLD: 世界加载后加载（默认）
         */
        load: 'POSTWORLD',
        /** 硬依赖列表（缺少时插件不会加载） */
        depend: [],
        /** 软依赖列表（缺少时插件仍可加载） */
        softdepend: [],
        /** 在此插件之前加载的插件列表 */
        loadbefore: [],
        /** 输出的 JAR 文件路径 */
        output: 'dist/MyPlugin-1.1.0.jar',
        /**
         * 开发模式开关
         * - true: 启用热重载，插件会在 plugins/dev_{name}/ 目录下监听文件变化
         * - false: 生产模式，关闭热重载功能
         */
        dev: true
    },

    /**
     * 目标特定配置
     * @description 为每个编译目标提供特定的配置，会覆盖 pluginPackage 中的对应字段
     */
    targets: {
        /**
         * Standalone 目标配置
         * - 无需任何前置插件
         */
        standalone: {
            /** 无依赖 */
            depend: []
        },
        /**
         * Common 目标配置
         * - 需要 Jukkit-Common 前置插件
         */
        common: {
            /** 依赖 Jukkit-Common */
            depend: ['Jukkit-Common']
        }
    },

    /**
     * 远程上传配置
     * @description 配置 MCSManager 面板的自动上传功能
     */
    upload: {
        /** 是否启用自动上传功能 */
        enable: false,
        /** 上传后是否自动拉取服务器日志 */
        autoPullLogs: true,
        /**
         * MCSManager 服务器配置
         * @description 连接 MCSManager 面板所需的参数
         */
        server: {
            /** 面板地址，包含端口号 */
            url: 'http://example.com/',
            /** API 密钥，在面板设置中生成 */
            apiKey: 'your-api-key',
            /** 守护进程 ID（节点 ID） */
            daemonId: 'your-daemon-id',
            /** 实例 ID */
            instanceId: 'your-instance-id'
        },
        /**
         * 目标文件路径
         * @description 上传到服务器后的文件存放位置
         * - 开发模式: /plugins/dev_{pluginName}/.jukkit/modules.zip
         * - 生产模式: 通常不需要配置此项
         */
        targetFile: '/plugins/dev_MyPlugin/.jukkit/modules.zip'
    }
};
