---
draft: false
title: Sub2API 快速开始
description: 从统一账号登录到客户端第一次请求。
project: sub2api
section: guide
order: 10
updatedAt: 2026-09-30
---

## 1. 通过统一账号进入服务

打开 [Sub2API](https://sub2api.zhuoling.space)，在登录页选择 **Zhuoling.Space**。按照 [统一账号注册与登录](/zh/projects/sub2api/docs/account/)的说明，在 auth.zhuoling.space 注册或登录，完成授权并返回服务。

本服务要求使用该 OIDC 入口。不要使用 Sub2API 自带的邮箱、密码表单注册或登录。

## 2. 查看权限并创建 API Key

登录后先查看控制台中的分组、额度和可用模型，再创建 API Key。新账号的可用权限以控制台实际分配结果为准；若没有可选分组或可用额度，先联系服务管理员安排权限。

按设备或客户端分别创建 Key，便于查看用量和单独撤销。具体步骤见 [API Key 与接入参数](/zh/projects/sub2api/docs/api-keys/)。

## 3. 配置客户端

| 客户端 | 接入方式 | 指南 |
| --- | --- | --- |
| Codex CLI | OpenAI Responses 协议 | [配置 Codex](/zh/projects/sub2api/docs/codex/) |
| Claude Code CLI | Anthropic Messages 协议 | [配置 Claude Code](/zh/projects/sub2api/docs/claude-code/) |
| Claude Desktop | 第三方推理 Gateway | [配置桌面客户端](/zh/projects/sub2api/docs/claude-desktop/) |

Linux、macOS 和 Windows 用户可使用[配置脚本](/zh/projects/sub2api/docs/downloads/)为两个 CLI 创建 Sub2API 启动入口。脚本需要 Node.js 22 或更新版本，并尝试从 API 获取模型列表。

## 4. 验证第一次请求

发送一个简短问题，例如“请回复 OK”。收到结果后，在 Sub2API 用量记录中核对请求时间、模型和用量。模型列表可访问与推理请求可用是两个不同检查项；首次配置应完成一次实际请求。

首次请求会产生 API 用量。随后再验证你需要的文件读取、工具调用或长对话行为。
