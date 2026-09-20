---
draft: false
title: "Dev Containers 2：定制和复现环境"
description: "管理系统依赖和 Python 环境的版本，并正确应用配置变更。"
project: gcg-cluster
section: guide
order: 30
updatedAt: 2026-09-20
---

从一个可用的 [starter 工作区](/zh/projects/gcg-cluster/docs/devcontainers-first-workspace/)开始。每次只修改一项环境配置，并保留一个用于验证结果的小型命令。

## 选择并记录基础镜像

使用当前 starter 镜像，或满足第一篇中用户、HOME 和工具要求的 Linux AMD64 镜像。平台当前镜像选项可通过 Teams 获取。在仓库中记录镜像和依赖版本；需要可重复性时，固定不可变镜像 digest。

项目需要编译 CUDA 扩展等功能时，再选择相应 CUDA Toolkit。检查框架兼容性，并验证一次真实 GPU 运算。平台提供宿主 GPU 驱动，开发镜像内安装内核驱动不属于支持的配置。

## 将系统依赖写入镜像

在 `devcontainer.json` 引用的 Dockerfile 中加入系统软件包和可重复执行的配置步骤。保留 starter 最终的非 root 用户和可写 HOME。认证信息应保存在镜像层和已提交配置之外。

对于 Ubuntu 或 Debian 基础镜像，可在 Dockerfile 以 root 身份执行的阶段参考以下安装步骤：

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
```

按项目需要调整软件包，并在后续恢复镜像要求的非 root 用户。这段示例用于扩展兼容的 Dockerfile，基础镜像仍需完整定义。在终端中手动安装的系统软件可能在容器替换后消失，因此应将最终配置记录到仓库。

## 创建项目 Python 环境

所选镜像提供 Python 和 `venv` 时，在 **`/workspaces` 下的项目检出目录**执行以下命令。示例假设项目已经维护了 `requirements.txt`：

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m pip check
```

模板不会自动创建 `.venv`。将 `.venv/` 加入 `.gitignore`，对依赖清单或锁文件进行版本管理，需要时据此重建环境。要求更强可复现性时，同时固定直接依赖和间接依赖。

常用 pip、uv、Hugging Face、Conda 缓存和命名 Conda 环境默认位于 `/workspaces` 下，会占用工作区存储配额。大型数据集和跨工作区结果放在 `/shared`；详见[存储与生命周期](/zh/projects/gcg-cluster/docs/storage-and-lifecycle/)。

## 应用并验证变更

1. 提交并推送配置修改。如果在其他地方编辑，先在工作区通过 `git status --short` 检查并处理本地变更，再对分支检出运行 `git pull --ff-only`。固定到某个提交的检出需要主动更新 ref。
2. 使用 Coder **Update** 或 Stop/Start 应用配置。重启和 Update 不会替你执行 `git pull`。
3. 阅读构建日志；使用 starter 时运行 `sh scripts/check-environment.sh`，再执行项目的小型验证命令。
4. 记录可用的 Git commit。在共享工作区验证该提交后，再迁移到独占 GPU 工作区。

缓存输入匹配时，平台可以复用已准备的镜像。Git commit 或平台镜像依赖的变化可能触发冷构建。为构建预留时间；如果出现的环境与预期不符，继续阅读[故障排查](/zh/projects/gcg-cluster/docs/devcontainers-troubleshooting/)。
