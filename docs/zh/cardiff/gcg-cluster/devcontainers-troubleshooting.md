---
draft: false
title: "Dev Containers 3：排查启动和构建问题"
description: "区分连接、构建、存储与 GPU 问题，并准备有效的求助信息。"
project: gcg-cluster
section: guide
order: 40
updatedAt: 2026-09-20
---

从最后一个成功的步骤开始定位：仓库访问、镜像构建、agent 连接，还是应用启动。明确阶段有助于选择检查方法，也能让管理员更快理解问题。

## 定位失败阶段

| 现象 | 先检查 | 下一步 |
| --- | --- | --- |
| 无法获取仓库 | URL/ref 和 Git 权限 | 确认提交已推送，且所用 Git 认证已获授权并能读取仓库。 |
| 构建失败 | 第一条构建错误及 `.devcontainer` 路径 | 检查引用文件、软件包版本和镜像契约。 |
| 终端进入基础恢复镜像 | 构建日志 | 修复仓库配置，同步检出内容并重新构建。 |
| 修改似乎未生效 | 本地 Git 状态和提交 | 按[第二篇](/zh/projects/gcg-cluster/docs/devcontainers-customise/)的顺序更新。 |
| agent 持续 Connecting 或超时 | 模板、发生时间和构建状态 | 联系管理员；独占工作区可能正在等待准入。 |
| 终端可用但编辑器失败 | 对应应用的启动日志 | 查找第一条错误，确认镜像提供所需工具。 |

反复 Delete/Create 会移除工作区存储，也可能失去排队位置。排查期间保留工作区。

## 检查存储与用户身份

在 Dev Container 终端执行以下只读检查：

```bash
id
printf '%s\n' "$HOME"
df -h /workspaces /shared
git status --short
git rev-parse HEAD
```

Git 命令需在项目检出目录运行。用户需要 UID/GID 为 `1000:1000`，且 HOME 可写。先确认哪个卷已满，再清理自己确定可丢弃的文件。`/shared` 目录存在本身不足以证明共享存储已挂载；挂载缺失时，先求助再写入重要数据。

## 检查 GPU 和项目工具

执行 `nvidia-smi` 检查 GPU 可见性，再用所选框架运行一次小型 GPU 运算。GPU 可见性和 CUDA 编译器是否安装需要分别确认。如果 GPU 不可见，将错误和时间发送给管理员。驱动安装由平台负责。

独占工作区的连接超时可能来自排队、镜像准备或故障。管理员可以检查准入和构建状态。详见 [GPU 使用与排队](/zh/projects/gcg-cluster/docs/gpu-and-queueing/)。

## 修复并验证

在 Git 中修正配置，提交并推送；执行 Update 或 Stop/Start 前，同步工作区检出内容。阅读新的构建日志，重新运行 starter 环境检查和项目验证命令。恢复环境用于协助修复；继续科研任务前，应确认运行的是预期项目镜像。

## 请求支持

通过研究组 Teams 渠道提供工作区、模板、带时区的时间、相关 Git commit、近期修改、第一条错误，以及终端能否打开。分享前检查日志和截图中的凭据及私有数据。诊断细节通过获准的内部渠道提交。[访问与支持](/zh/projects/gcg-cluster/docs/access-and-support/)介绍了当前通知的获取方式。
