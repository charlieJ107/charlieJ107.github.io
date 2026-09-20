---
draft: false
title: Cardiff University COMAT GCG Cluster
hub: gcg-cluster
description: "面向 Cardiff University COMAT 研究组的 GPU 科研平台，整合开发工作区、共享存储与资源调度。"
updatedAt: 2026-09-20
status: active
group: pinned
tags: [DevOps, Kubernetes, GPU, 科研基础设施]
---

Cardiff University COMAT GCG Cluster 为研究组提供 GPU 计算资源、开发环境与持久存储，支持日常开发、调试和科研计算。平台将环境配置、资源分配与工作区管理整合到统一的使用流程中。

**研究组用户**：请从[快速开始](/zh/projects/gcg-cluster/docs/quick-start/)入门，再通过 [Dev Containers 系列](/zh/projects/gcg-cluster/docs/devcontainers-first-workspace/)定制环境。平台地址和账户安排通过研究组的 Microsoft Teams 渠道获取。

**了解工程设计**：可以先读[工作区与 GPU 资源设计](/zh/projects/gcg-cluster/docs/workspace-design/)，再读[可复现运维与可观测性](/zh/projects/gcg-cluster/docs/operations-design/)。

## 平台组成

平台通过 Coder 将 MicroK8s 上的 GPU 资源提供为开发工作区。预制环境帮助研究人员快速开始，Dev Containers 支持项目定义自己的依赖；MicroCeph 为工作区文件和用户跨工作区的数据提供存储。

共享 GPU 支持交互式工作，需要独占 GPU 的工作区则通过 Kueue 控制准入。环境准备、资源分配和数据持久化共同构成研究人员的日常使用流程。

## 建设与维护

项目由 Zhuoling Jiang 在 Cardiff University 博士研究期间搭建，并持续负责运维。建设与维护工作包括：

- **平台建设**：整合 Kubernetes、GPU 工作负载、开发环境和持久存储。
- **环境复现**：维护工作区模板、版本化镜像，以及可重复执行的部署和验证流程。
- **运行维护**：维护监控、调查故障，并在受控维护后检查平台状态。
- **用户支持**：编写平台说明，帮助研究人员选择环境、理解资源与存储的生命周期。

这些职责需要贯通服务的各个环节：模板影响用户如何开始工作，存储策略影响工作区变更后保留哪些数据，监控则需要将平台异常关联到具体工作负载。设计文档介绍了这些决策及其取舍。

## 使用平台

平台面向获授权的研究组成员。访问地址、账户安排、starter 文件和维护通知通过研究组的 Microsoft Teams 渠道提供。下方指南介绍工作区创建、环境配置、存储和 GPU 使用。
