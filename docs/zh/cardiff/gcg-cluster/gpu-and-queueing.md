---
draft: false
title: "GPU 使用与独占工作区排队"
description: "验证共享 GPU 任务，准备独占工作区，并在使用后释放资源。"
project: gcg-cluster
section: guide
order: 60
updatedAt: 2026-09-20
---

在 Standard 或共享 Dev Containers 中开始开发和小规模验证。共享 GPU 使用时间切片，不提供 GPU 显存隔离。根据可用资源安排实验，持续或较大的任务提前与管理员协调。

## 验证任务

用 `nvidia-smi` 检查 GPU 可见性，再测试实际框架和具有代表性的小型任务。关注显存使用并保存检查点。项目需要编译 GPU 代码时，选择兼容的 CUDA Toolkit；运行时 GPU 访问本身不提供编译器。

## 准备独占工作区

1. 在共享 Dev Containers 中验证目标项目提交，包括环境检查和一次小型项目运行。
2. 推送代码与配置，将两个工作区都需要的数据放入个人共享存储。
3. 停止共享工作区，再选择当前 Teams 指南中指定的独占 GPU Dev Container 模板。
4. 使用相同的仓库 URL/ref 和 Dev Container 目录。各工作区的持久工作区卷独立，通过 Git 和共享存储转移工作。

预先准备镜像可以帮助复用缓存，减少准入后用于构建的时间。缓存能否复用取决于当前输入，安排任务时仍需为镜像准备留出时间。

## 理解等待与释放

独占队列按先入先出顺序，每次准入一个工作负载，不抢占，也不提供预计开始时间。Coder 可能显示 Running，而 agent 仍在 Connecting 或已经超时。超时也可能来自构建或故障，可请管理员检查状态。

等待时保留工作区。Delete/Create 会失去排队位置，并移除其工作区存储。准入后的镜像准备会占用分配资源；工作区仍在运行时，GPU 空闲也不会释放该分配。

独占任务结束后及时停止工作区。检查该工作区的 Schedule / Autostop 设置，并让长任务可恢复，以应对维护或故障中断。求助方式见[访问与支持](/zh/projects/gcg-cluster/docs/access-and-support/)。
