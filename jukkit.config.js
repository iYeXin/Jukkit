/**
 * Jukkit 项目配置文件
 * 
 * @description 平台无关的项目配置，定义源码目录、入口文件、输出路径等
 */
module.exports = {
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
         * 初始化脚本配置（框架内部使用）
         * @description 涉及框架内部实现，公开接口未来再实现
         */
        init: {
            /** init 目录路径（相对于项目根目录） */
            dir: '.jukkit/init',
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
         * 模块目录路径（框架内部使用）
         * @description 涉及框架内部实现，公开接口未来再实现
         */
        modulesDir: '.jukkit/modules',
        /** 输出的模块 ZIP 包路径，包含所有源码文件 */
        output: 'dist/modules.zip',
        /**
         * 编译目标配置
         * @description 指定使用哪个模板进行编译
         * - 'standalone': 使用 Standalone 版本（内嵌 Nashorn）
         * - 'common': 使用 Common 版本（依赖 Jukkit-Common）
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
    }
};
