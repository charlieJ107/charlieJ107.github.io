---
draft: false
title: "自然语言驱动的虚拟角色表演接口"
hub: xr-nl-performance
description: "通过 Unreal Engine 插件，将自然语言导演指令转化为由 Control Rig 驱动的 MetaHuman 表演。"
updatedAt: 2026-09-30
group: school
badges: [科研项目, XR Network+]
tags: [Unreal Engine, MetaHuman, Control Rig, 自然语言, 虚拟制作]
video:
  youtubeId: ACI_u3hTnVc
  title: "XR Network+ 在线研讨会：自然语言处理工具与 XR"
  caption: "XR Network+ 研讨会，涵盖本项目与 StyleCap，由 XR Stories and XR Network+ 发布。"
---

本项目探索以自然语言指导虚拟角色表演。通过 Unreal Engine 插件，将语言指令接入 Control Rig 驱动的 MetaHuman 动画流程，让创作意图能够直接参与角色控制。

## 从导演指令到角色表演

原型接受有关情绪、表情与嘴唇动作的语音或文字指令，并实时映射为面部动画。导演可以提出表情要求，再用后续指令逐步调整，为虚拟制作提供一种以日常语言指导角色的交互方式。

## 系统设计与研究发现

初期研究聚焦于在制作流程的约束下，将自然语言转化为有效、可执行的角色绑定操作，为通过可控接口指导富有表现力的角色表演建立基础。

### 经过校验的动作流程

系统采用四步流程：**语言输入 → LLM 动作规划 → 校验器 → Unreal Engine 桥接层**。每个动作指定目标控件、数值和执行时间；校验器检查控件名称、数值范围与执行安全，再将动作传入引擎。结构化表示支持检查与回滚，也便于定位各阶段的失败原因。

### 评估与发现

评估关注输出结构是否有效、是否引用真实控件，以及动作是否符合任务意图。任务涵盖单个和多个控件、面部区域约束，以及对已有表情的调整。初步结果显示，具体面部动作的执行较为可靠，描述与控件指代中的语义歧义是主要失败模式。更丰富的绑定元数据、基于检索的语义落地和交互式澄清被列为后续研究方向。

## 我的贡献

作为主要开发者，我开发了通过 Control Rig 控制 MetaHuman 表演的 Unreal Engine 插件，并分析了语言驱动表演控制中的常见失败模式。

## 合作与支持

该项目由 XR Network+ 第二轮 Embedded R&D 计划支持，合作方包括卡迪夫大学与 Megaverse，并有来自伯恩茅斯大学、白金汉郡新大学及 Media Cymru Innovation Space 的专家参与。

## 项目资料

- [XR Network+ 官方项目介绍](https://xrnetworkplus.xrstories.co.uk/project/a-natural-language-interface-for-directing-virtual-character-performances/)
- [YouTube 完整研讨会](https://www.youtube.com/watch?v=ACI_u3hTnVc)
