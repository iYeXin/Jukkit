/**
 * 插件编译配置文件
 * 
 * @description 平台相关的编译配置，包括模板、目标平台、插件打包和上传设置
 *              未来可扩展支持其他平台（如 Sponge、Fabric 等）
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
         * - 无需前置插件
         * - 单个 JAR 即可运行
         */
        standalone: 'templateJars/jukkit-template-standalone-1.3.5.jar',
        /**
         * Common 版本
         * - 依赖 Jukkit-Common 前置插件
         * - 共享 Nashorn 引擎
         */
        common: 'templateJars/jukkit-template-common-1.3.5.jar'
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
