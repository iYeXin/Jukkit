# MCSManager 自动上传配置指南

Jukkit 支持将构建产物自动上传到由 [MCSManager](https://github.com/MCSManager/MCSManager) 管理的 Minecraft 服务器，实现开发流程自动化。

## 前提条件

- 已安装并配置好 Jukkit 插件
- 使用 MCSManager 管理 Minecraft 服务器
- 插件设置为 Dev 模式

## 功能概述

- **自动上传**：构建完成后自动将 `main.js` 上传到远程服务器
- **日志拉取**：上传后自动拉取服务器日志，实时查看插件运行状态
- **Dev 模式联动**：配合 Dev 模式实现热重载开发

## 配置步骤

### 1. 获取 MCSManager API 密钥

1. 登录 MCSManager 面板
2. 点击右上角头像 -> 「个人设置」
3. 找到「API 密钥」部分，点击「生成新密钥」
4. 复制生成的 API 密钥

### 2. 获取守护进程 ID 和实例 ID

1. 进入 MCSManager 面板
2. 点击目标 Minecraft 实例
3. 在实例详情页面找到「守护进程 ID」（也叫节点ID，Daemon ID）和「实例 ID」（Instance ID）

```### 3. 配置 jukkit.config.js

```javascript
module.exports = {
    // ... 其他配置 ...

    upload: {
        enable: true,
        autoPullLogs: true,
        server: {
            url: 'http://your-panel:23333',    // MCSManager 面板地址
            apiKey: 'your-api-key',            // API 密钥
            daemonId: 'daemon-uuid',           // 守护进程 ID
            instanceId: 'instance-uuid'        // 实例 ID
        },
        targetFile: '/plugins/dev_MyPlugin/main.js'
    }
}
```

## 配置项说明

| 配置项              | 类型    | 说明                   |
| ------------------- | ------- | ---------------------- |
| `enable`            | boolean | 是否启用上传功能       |
| `autoPullLogs`      | boolean | 是否自动拉取服务器日志 |
| `server.url`        | string  | MCSManager 面板地址    |
| `server.apiKey`     | string  | API 密钥               |
| `server.daemonId`   | string  | 守护进程 ID            |
| `server.instanceId` | string  | 实例 ID                |
| `targetFile`        | string  | 目标文件路径           |

## 工作原理

### 上传流程

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   jukkit-build  │────▶│  MCSManager API  │────▶│  Minecraft 服务器 │
│   构建产物        │     │   获取上传凭证     │     │   接收文件        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **构建产物**：`jukkit-build.js` 生成 `main.js`
2. **获取凭证**：调用 MCSManager API 获取临时上传凭证
3. **上传文件**：使用凭证将文件上传到服务器指定位置

### 日志拉取

上传完成后，如果 `autoPullLogs` 为 `true`，会持续拉取服务器日志：

- 每 3 秒拉取一次最新日志
- 自动过滤已显示的日志行
- 按 `Ctrl+C` 可停止日志拉取

## Dev 模式工作流

Dev 模式下，推荐的开发流程：

```
首次部署：
1. npm run build          # 构建 JAR
2. 手动上传 JAR 到服务器    # 仅首次需要
3. 重启服务器              # 加载插件

后续开发：
1. 修改代码
2. npm run build          # 自动上传 main.js
3. 查看日志确认热重载
```

### Dev 模式目录结构

```
服务器 plugins 目录/
├── dev_MyPlugin/          # Dev 模式目录
│   └── main.js            # 热重载脚本（自动生成）
└── MyPlugin-1.0.0.jar     # 插件 JAR
```

## 安全建议

1. **不要提交敏感信息**：将 `jukkit.config.js` 中的真实 API 密钥等信息替换为占位符后再提交到版本控制
2. **使用环境变量**：生产环境建议使用环境变量存储敏感信息
3. **限制 API 权限**：MCSManager API 密钥应只授予必要的权限

## 常见问题

### Q: 上传失败，提示"远程目录不存在"

A: Dev 模式下，首次需要先上传 JAR 并重启服务器，插件会自动创建 `dev_{pluginName}` 目录。

### Q: 如何禁用上传但保留配置？

A: 将 `upload.enable` 设为 `false`，或将整个 `upload` 配置设为 `null`。

## API 参考

上传功能使用 MCSManager 的以下 API：

- `POST /api/files/upload` - 获取上传凭证
- `GET /api/protected_instance/outputlog` - 获取实例日志

详细信息请参考 [MCSManager 官方文档](https://docs.mcsmanager.com/)。
