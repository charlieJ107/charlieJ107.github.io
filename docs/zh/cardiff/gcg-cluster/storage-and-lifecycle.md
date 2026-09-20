---
draft: false
title: "存储与工作区生命周期"
description: "选择持久化路径，理解停止、删除、共享数据和环境变更的影响。"
project: gcg-cluster
section: guide
order: 50
updatedAt: 2026-09-20
---

下载数据或开始实验前，先选择文件位置。以下路径适用于当前 Standard 和 Dev Container 模板；旧模板的行为请单独向管理员确认。

## 选择存储位置

| 用途 | Standard | Dev Containers | Stop/Start | Delete 工作区 |
| --- | --- | --- | --- | --- |
| 工作区代码、环境和设置 | `/home/ubuntu` | `/workspaces` | 保留 | 移除 |
| 自己多个工作区共用的数据 | `/home/ubuntu/shared` | `/shared` | 保留 | 保留 |
| 内存临时文件 | `/dev/shm` | `/dev/shm` | 重建 | 移除 |
| 容器文件系统的其他路径 | 持久挂载之外 | 包括未放在持久挂载上的 HOME | 容器替换后可能丢失 | 移除 |

个人共享存储用于自己的多个工作区。文件删除和覆盖命令会直接影响其中的数据。账户退役按管理员流程处理。重要数据仍需独立备份。

## 检查容量和挂载

Standard 使用：

```bash
df -h /home/ubuntu /home/ubuntu/shared
```

Dev Containers 使用：

```bash
df -h /workspaces /shared
```

检查实际配额和剩余空间。`/workspaces` 下的依赖与缓存和代码共用工作区卷。大型数据集以及跨工作区使用的结果应放在共享存储。大规模传输前通过 Teams 沟通容量需求。

## 正确停止、重启和删除

Stop 会结束运行中的进程，并保留持久文件。通过检查点让中断的工作可以恢复。关闭编辑器后工作区仍在运行；请检查该工作区自己的 Schedule / Autostop 设置。

执行 Delete 前，推送代码，并将需要的工作区文件复制到合适的独立位置，核对副本后再删除。共享文件会在工作区删除后保留，但每个工作区的代码检出和环境卷各自独立。创建新工作区或更换模板不会自动迁移它们。

## 重建环境

系统依赖写入镜像定义，依赖清单纳入 Git。手动创建的项目环境放在相应持久目录中。Dev Containers 的操作见[环境定制](/zh/projects/gcg-cluster/docs/devcontainers-customise/)；重新构建前先同步 Git 变更。
