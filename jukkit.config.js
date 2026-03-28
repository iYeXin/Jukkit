/**
 * Jukkit 项目配置文件
 * 
 * 本配置文件用于定义项目的构建、打包和部署行为。
 * 包含三个主要配置部分：project（项目构建）、pluginPackage（插件打包）、upload（远程部署）
 */

module.exports = {
    /**
     * 项目构建配置
     * 控制源代码的模块合并和输出
     */
    project: {
        /**
         * 默认模块目录
         * "include" 和 "includeAll" 指令会从此目录查找模块
         * 例如："include libs/fs" 会查找 src/modules/libs/fs.js
         */
        defaultModuleDir: 'src/modules',

        /**
         * 入口文件路径
         * 构建时从此文件开始解析 "include" 指令
         * 注意：配置项名称为 "intry"（非标准拼写，保持向后兼容）
         */
        intry: 'src/index.js',

        /**
         * 输出文件路径
         * 合并后的 JavaScript 代码将写入此文件
         */
        output: 'dist/source/main.js',
    },

    /**
     * 插件打包配置
     * 用于生成 Minecraft 插件 JAR 文件
     * 如果不需要打包 JAR，可以将此配置设为 null
     */
    pluginPackage: {
        /**
         * 插件名称
         * 将显示在 /plugins 列表和日志中
         */
        name: 'MyPlugin',

        /**
         * 插件版本号
         */
        version: '1.0.0',

        /**
         * 插件描述
         */
        description: 'A Jukkit plugin',

        /**
         * 插件作者
         */
        author: 'YourName',

        /**
         * JAR 输出路径
         * 最终生成的插件 JAR 文件位置
         */
        output: 'dist/MyPlugin-1.0.0.jar',

        /**
         * JAR 模板文件路径
         * 模板 JAR 包含 Java 运行时类和资源文件
         * 可从 Jukkit-Template 项目构建获取
         */
        templateJar: 'jukkit-template-1.0.0.jar',

        /**
         * 是否启用 Dev 模式
         * 
         * Dev 模式说明：
         * - 首次构建 JAR 并部署到服务器后，插件会在 /plugins/dev_{pluginName}/ 目录生成 main.js
         * - 后续开发时，只需修改并上传 main.js 文件即可热重载，无需重新部署 JAR
         * - 适合快速迭代开发，生产环境应设为 false
         */
        dev: true
    },

    /**
     * 远程上传配置（可选）
     * 用于将构建产物自动上传到 MCSManager 管理的 Minecraft 服务器
     * 
     * 如果不需要自动上传，可以将此配置设为 null 或 enable 设为 false
     * 详细配置说明请参阅 docs/MCSMANAGER_UPLOAD.md
     */
    upload: {
        /**
         * 是否启用上传功能
         * 仅在 Dev 模式下热重载会生效
         */
        enable: false,

        /**
         * 是否自动拉取服务器日志
         * 启用后，上传完成会持续拉取服务器日志并显示在终端
         */
        autoPullLogs: true,

        /**
         * MCSManager 服务器配置
         * 请填写您的实际服务器信息
         */
        server: {
            /**
             * MCSManager 面板地址
             * 例如：'http://localhost:23333'
             */
            url: 'http://your-mcsm-panel:23333',

            /**
             * API 密钥
             * 在 MCSManager 面板的「个人设置」->「API 密钥」中生成
             */
            apiKey: 'your-api-key-here',

            /**
             * 守护进程 ID（也叫节点ID，Daemon ID）
             * 在 MCSManager 面板的实例详情页面可以找到
             */
            daemonId: 'your-daemon-id-here',

            /**
             * 实例 ID（Instance ID）
             * 在 MCSManager 面板的实例详情页面可以找到
             */
            instanceId: 'your-instance-id-here'
        },

        /**
         * 目标文件路径
         * 上传到服务器后的文件存放位置
         * 
         * Dev 模式下通常为：/plugins/dev_{pluginName}/main.js
         */
        targetFile: '/plugins/dev_MyPlugin/main.js'
    }
}
