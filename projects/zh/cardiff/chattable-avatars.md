---
draft: false
title: "Chattable Avatars · 可对话数字人"
hub: chattable-avatars
description: "面向博物馆与文化遗产的可对话数字人，将 AI 对话、语音交互与实时三维动画结合起来。"
updatedAt: 2026-09-30
group: school
badges: [科研项目, BCS HCI 2025]
tags: [人机交互, Unreal Engine, LLM, 文化遗产]
---

Chattable Avatars 探索让访客通过与数字角色对话来了解文化遗产。研究将可交互原型与文化遗产从业者的参与结合起来，讨论对话式 AI 如何融入展览体验。

**[阅读论文](https://doi.org/10.14236/ewic/BCSHCI2025.10)** · [开放获取 PDF](https://orca.cardiff.ac.uk/id/eprint/180401/1/91-Jiang-BCSHCI25.pdf) · [项目背景与公开介绍](#项目背景与公开介绍)

## 通过对话接触历史

由卡迪夫大学[秦祎鹏博士](https://yipengqin.github.io/)牵头的 GW4 合作研究，探索数字人在博物馆和档案馆中的应用及其伦理、社会影响。卡迪夫大学相关社区项目与英国国民信托（National Trust）管理的巴斯集会厅（Bath Assembly Rooms）合作，通过互动角色呈现乔治王朝时期的巴斯。技术开发与共同设计围绕角色外观、个性及其在参观体验中的作用展开。文末的机构页面介绍了这一研究背景。

## 原型如何工作

论文中的原型将 Unreal Engine 5、MetaHuman 与语言和语音技术结合，形成以下交互流程：

1. 访客按住按键说话，语音识别将录音转为文字。
2. 大语言模型结合角色背景与对话历史生成回答。
3. 语音合成与面部动画让数字角色开口回应。

实现细节和工作坊方法见[论文](https://orca.cardiff.ac.uk/id/eprint/180401/1/91-Jiang-BCSHCI25.pdf)。

## 我的贡献

在 **2023 年 9 月至 2024 年 5 月**担任卡迪夫大学研究助理期间，我开发了整合 Unreal Engine、LLM 与语音识别／合成的初始平台，实现支持持续对话的提示词与系统编排逻辑，并参与 GW4 资助合作研究中的早期研究支持工作。该原型用于用户研究，也成为后续研究的基础平台。

## 研究成果

**Zhuoling Jiang**, Yipeng Qin and Daniel J. Finnegan (2025). *‘Chattable’ Avatars: Using LLMs to Power Visitor Engagement with Historical Persons*. BCS HCI 2025, pp. 91–102.

论文报告了在巴斯集会厅开展的共同设计工作坊。定性分析围绕信任、权威感、社交体验和使用位置展开，探讨数字人在叙事与文化阐释中的作用，同时指出事实可靠性的限制，为后续展览设计提供依据。

[卡迪夫大学 ORCA 论文记录](https://orca.cardiff.ac.uk/id/eprint/180401/) · [出版页面 / DOI](https://doi.org/10.14236/ewic/BCSHCI2025.10)

## 项目背景与公开介绍

- **卡迪夫大学 — [AI-powered chattable avatars in interactive exhibitions](https://www.cardiff.ac.uk/about/organisation/colleges-schools/school-of-computational-and-mathematical-sciences/research/research-in-computer-sciences/projects/unleashing-the-power-of-ai-powered-chattable-avatars-in-interactive-exhibitions)。** 学校的项目介绍页面。
- **GW4 — [Charting New Frontiers](https://gw4.ac.uk/community/charting-new-frontiers-an-exploratory-expedition-and-pilot-study-on-chattable-virtual-avatars-unveiling-ethical-and-social-dimensions-in-content-delivery/)。** 合作研究概览、参与高校及试点关注的社会与伦理问题。
- **卡迪夫大学 — [Revolutionising visitor experiences of cultural heritage](https://www.cardiff.ac.uk/community/our-local-community-projects/community-projects-in-wales-and-further-afield/2025-projects/revolutionizing-visitor-experiences-of-cultural-heritage)。** 社区项目总结，介绍巴斯集会厅合作、共同设计与开发框架。
