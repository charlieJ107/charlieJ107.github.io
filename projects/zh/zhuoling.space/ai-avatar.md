---
draft: false
title: AI.Zhuoling.Space
hub: ai-avatar
description: "以自建 harness 与 context engine 为基础，探索具有持续身份、记忆与行动能力的 AI Avatar。"
updatedAt: 2026-09-20
group: pinned
badges: [AI Avatar, Harness, Context Engine]
tags: [AI, Avatar, Memory, TypeScript]
---

AI.Zhuoling.Space 是我最重视的个人项目之一，也是我探索 AI Avatar 社会存在（social presence）的实践载体。我希望人在与 Avatar 相处时，能够感受到一个身份持续、记得共同经历、可以一起做事的交互对象。

为此，我围绕模型构建了自己的 harness（运行框架）和 context engine（上下文引擎）：前者组织工具、执行和结果，后者为每一轮对话准备身份、历史与相关记忆。它们共同支撑 Avatar 的连续性。

## 身份、表达与记忆

Avatar 保存持续的身份设定；Persona 描述具体的表达方式、用户背景、技能和工具配置。一个 Avatar 可以拥有多个 Persona，创建会话时选择本次使用的 Persona 和模型。

上下文层将 Avatar 与 Persona 的提示分层组合，并从该 Avatar 的记忆中检索与当前消息有关的信息。记忆支持语义检索，也支持通过新的记录取代过时内容，使后续对话有机会使用更新后的信息。

## 一起完成事情

运行框架将模型选择、工具能力、用户补充输入和结果保存连接起来。项目还包含通用聊天、技能管理、图像生成、翻译和用量记录；具体可用工具取决于所选模型、Persona 配置与服务端集成。

技术上，项目采用 TypeScript、React 和 Hono，使用 PostgreSQL 保存应用状态、S3 兼容对象存储保存文件，当前部署路径以 Node.js 与 Docker 为主。

## 持续演进的方向

当前产品以会话组织交互，已经具备身份配置、记忆检索与上下文组装。围绕每个 Avatar 的持续对话流、随话题变化的 Persona 切换，是后续探索方向。“社会存在”是我希望通过长期交互逐步实现的体验目标。

可以从下方服务入口开始体验，也可以阅读[设计文章](/zh/blogs/ai-avatar-social-presence/)和[上下文架构说明](/zh/projects/ai-avatar/docs/context-and-memory/)。
