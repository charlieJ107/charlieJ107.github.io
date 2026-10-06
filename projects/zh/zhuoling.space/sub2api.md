---
draft: false
title: Sub2API 接入与使用指南
hub: sub2api
description: 通过统一账号使用 Sub2API，为 Codex、Claude Code 和 Claude Desktop 配置 API 接入。
updatedAt: 2026-09-30
group: personal
tags: [API, OIDC, Codex, Claude]
---

Sub2API 是部署在 [sub2api.zhuoling.space](https://sub2api.zhuoling.space) 的 AI API 服务。本页汇集该实例的登录说明、客户端配置和下载脚本；Sub2API 软件及各客户端的开发归属于各自上游项目。

网页账号统一通过 [auth.zhuoling.space](https://auth.zhuoling.space) 注册，并使用服务登录页的 **Zhuoling.Space** 入口完成 OIDC 登录。客户端使用登录后创建的 API Key。

## 选择你的接入方式

- 第一次使用：从[快速开始](/zh/projects/sub2api/docs/getting-started/)进入。
- 命令行工具：阅读 [Codex](/zh/projects/sub2api/docs/codex/) 或 [Claude Code](/zh/projects/sub2api/docs/claude-code/) 配置指南。
- 图形界面：阅读 [Claude Desktop 第三方推理](/zh/projects/sub2api/docs/claude-desktop/)指南。
- 自动配置：下载 [Linux / macOS 与 Windows PowerShell 脚本](/zh/projects/sub2api/docs/downloads/)。

可用模型、分组、额度与用量以当前账号的服务控制台为准。模型列表表示该 Key 可见的模型，具体客户端功能还取决于模型和协议支持。
