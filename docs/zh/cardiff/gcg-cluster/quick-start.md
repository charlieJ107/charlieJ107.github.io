---
draft: false
title: "快速开始：创建第一个 GCG 工作区"
description: "创建工作区、打开编辑器、检查存储和 GPU，并正确结束一次工作。"
project: gcg-cluster
section: guide
order: 0
updatedAt: 2026-09-20
---

本指南面向 Cardiff University COMAT 研究组获授权的成员。首次使用建议选择预制的 Standard 环境，通过终端和浏览器开发工具开始工作。以下步骤适用于当前模板，依据平台 2026 年 9 月的用户指南核对。

## 1. 获取访问权限

通过研究组 Microsoft Teams 渠道申请平台地址和账户，向管理员提供 Cardiff 邮箱，并按欢迎邮件中的说明操作。Teams 成员身份和平台账户需要分别安排。[访问与支持](/zh/projects/gcg-cluster/docs/access-and-support/)介绍了求助方式和维护通知的获取渠道。

## 2. 创建 Standard 工作区

1. 使用 Teams 提供的地址登录，选择 **New Workspace**。
2. 选择 **Ubuntu Standard**，核对模板标识为 `gcg-standard`。界面显示名称可能调整。
3. 为工作区命名，例如 `my-research`。保留默认 Conda 预设和当前资源默认值；第一次创建时将 **Pre-launch Script** 留空。
4. 选择 **Create Workspace**，等待 agent 连接，再打开 Terminal 或 VS Code Web。Standard 还提供 Jupyter Notebook 和 File Browser。

镜像准备和资源可用性会影响启动时间。Running 状态本身不足以确认 agent 和编辑器已就绪。如果持续显示 Connecting，请查看[故障排查指南](/zh/projects/gcg-cluster/docs/devcontainers-troubleshooting/)。

## 3. 检查环境

在**工作区内的终端**执行：

```bash
df -h /home/ubuntu /home/ubuntu/shared
nvidia-smi
```

确认两个持久卷均已挂载，且 GPU 可见。在共享存储中创建一个名称唯一的小测试文件，再读取它。如果挂载缺失或目录不可写，先向管理员求助，再存入重要文件。

`nvidia-smi` 用于检查 GPU 可见性。项目框架和 CUDA 编译工具各有依赖要求；正式实验前，先用实际框架运行一次小型 GPU 运算。GPU 驱动集成由平台提供。

## 4. 保存工作并停止工作区

Standard 的项目文件放在 `/home/ubuntu`，跨工作区数据放在 `/home/ubuntu/shared`。提交并推送代码，为重要结果和检查点保留独立副本。变更或删除工作区前，阅读[存储与工作区生命周期](/zh/projects/gcg-cluster/docs/storage-and-lifecycle/)。

工作结束后使用 Coder 的 **Stop**。停止会结束运行中的进程，并保留持久文件。关闭浏览器或编辑器后，工作区仍在运行。检查工作区的 Schedule / Autostop 设置，为可能中断的任务保存检查点。

## 接下来

- 需要可复现的项目环境时，从 [Dev Containers 系列](/zh/projects/gcg-cluster/docs/devcontainers-first-workspace/)开始。
- 连接本地 VS Code 时，遵循工作区页面的连接说明。使用 PyCharm 连接前先安装 Coder Desktop。
- 规划计算任务和独占工作区时，阅读 [GPU 使用与排队](/zh/projects/gcg-cluster/docs/gpu-and-queueing/)。
