---
draft: false
title: "Dev Containers 1：创建项目工作区"
description: "准备 Git 仓库，创建 Dev Container 工作区并验证环境。"
project: gcg-cluster
section: guide
order: 20
updatedAt: 2026-09-20
---

Dev Container 将开发环境定义与项目代码一起管理。本系列依次介绍[创建工作区](/zh/projects/gcg-cluster/docs/devcontainers-first-workspace/)、[定制依赖](/zh/projects/gcg-cluster/docs/devcontainers-customise/)和[构建排错](/zh/projects/gcg-cluster/docs/devcontainers-troubleshooting/)。首次使用平台时，请先完成[快速开始](/zh/projects/gcg-cluster/docs/quick-start/)。

## 准备仓库

通过研究组 Teams 渠道获取当前 GCG Dev Container starter，将其完整内容复制到项目仓库，包括隐藏的 `.devcontainer` 目录和环境检查脚本。第一次构建使用随附配置。

仓库需要包含 `.devcontainer/devcontainer.json`，以及它引用的 Dockerfile 或镜像配置。创建工作区前先提交并推送这些文件。Coder 读取远端仓库，无法读取仅保存在你电脑上的文件。

私有 Git 仓库优先使用 SSH，并在 Git 托管平台授权 Coder 公钥。私钥和访问令牌应避开 Git URL、源文件和截图。如果需要 HTTPS 认证，先向管理员确认合适的配置方式；模板字段可能明文显示并持久保存输入内容。

## 创建并连接

1. 选择 **DevContainers**，核对标识为 `gcg-devcontainer`。
2. 填写仓库 URL 和 Git ref。使用 starter 时，配置目录填写 `.devcontainer`。
3. 保留当前资源默认值，将 **Pre-launch Script** 留空。
4. 创建工作区，等待构建和 agent 连接；agent 就绪后打开终端。
5. 进入 `/workspaces/<repository-name>` 下的项目检出目录，将占位名称替换为实际仓库目录。

在检出目录中运行 starter 的检查脚本：

```bash
sh scripts/check-environment.sh
```

预期最后一行为 `OK: the GCG Dev Container contract is satisfied.`。通过检查表示满足平台前提条件；项目所需的其他工具和框架仍需单独验证。

## 检查镜像契约

所选 Linux AMD64 镜像需要提供 UID/GID 为 `1000:1000` 的非 root 用户、已存在且可写的 HOME、POSIX `/bin/sh`、`base64`、`mktemp`、Git 和常用核心工具。用户名和 HOME 路径由镜像决定。Python、Conda、uv 和 CUDA 编译工具由项目选择的环境提供。

平台提供 `/workspaces` 下的检出目录、`/shared` 个人共享存储、GPU 集成和 Coder agent。配置应围绕这些挂载和普通非特权开发会话设计。自定义挂载、Docker socket、Docker-in-Docker 和特权模式不属于支持的工作流程。

## 确认项目就绪

开始长任务前，检查启动日志并运行一个小型项目命令。构建失败后可能进入基础 Ubuntu 恢复环境；终端可用本身不足以确认项目镜像已成功构建。可按[故障排查指南](/zh/projects/gcg-cluster/docs/devcontainers-troubleshooting/)修复构建。

下一篇是[定制和复现环境](/zh/projects/gcg-cluster/docs/devcontainers-customise/)。选择依赖安装位置和结果保存路径时，请同时参考[存储行为](/zh/projects/gcg-cluster/docs/storage-and-lifecycle/)。
