---
draft: false
title: "Natural Language Interface for Directing Virtual Character Performances"
hub: xr-nl-performance
description: "An Unreal Engine plugin that translates natural language direction into MetaHuman performances through Control Rig."
updatedAt: 2026-09-30
group: school
badges: [Research, XR Network+]
tags: [Unreal Engine, MetaHuman, Control Rig, Natural Language, Virtual Production]
video:
  youtubeId: ACI_u3hTnVc
  title: "XR Network+ online seminar: Natural language processing tools and XR"
  caption: "XR Network+ seminar featuring this project alongside StyleCap. Published by XR Stories and XR Network+."
---

This project explores natural language as an interface for directing virtual character performances. An Unreal Engine plugin connects language-based direction to MetaHuman animation through Control Rig, bringing creative intent into the character-control workflow.

## From direction to performance

The prototype accepts spoken or written directions about emotion, expression and lip movement, mapping them to facial animation in real time. A director can request an expression and refine it through further instructions. This offers a way to work with virtual characters using familiar language during creative production.

## System design and findings

The initial research stage focuses on translating language into valid, executable rig operations under production constraints. This establishes a foundation for expressive character direction through a controlled interface.

### A validated action workflow

The workflow passes through four stages: **language input → LLM action planner → validator → Unreal Engine bridge**. Each planned action identifies a target control, a value and its timing. Validation checks control names, value ranges and execution safety before passing actions to the engine. The structured representation supports inspection and rollback, making it possible to examine failures at each stage.

### Evaluation and findings

Evaluation considers structural validity, references to real rig controls and whether an action meets the intended task. Tasks include single and multiple controls, constraints on facial regions, and adjustments to existing expressions. Initial findings indicate reliable behaviour for concrete facial actions, with ambiguity in descriptions and control references emerging as the dominant failure mode. Richer rig metadata, retrieval-based grounding and interactive clarification are proposed as future work.

## My contribution

As lead developer, I developed the Unreal Engine plugin for controlling MetaHuman performances through Control Rig and analysed common failure modes in language-driven performance control.

## Collaboration and support

XR Network+ supported the Cardiff University and Megaverse collaboration through its second Embedded R&D funding round, with expertise from Bournemouth University, Buckinghamshire New University and Media Cymru Innovation Space.

## Project resources

- [XR Network+ official project profile](https://xrnetworkplus.xrstories.co.uk/project/a-natural-language-interface-for-directing-virtual-character-performances/)
- [Full seminar on YouTube](https://www.youtube.com/watch?v=ACI_u3hTnVc)
