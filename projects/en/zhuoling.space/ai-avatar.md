---
draft: false
title: AI.Zhuoling.Space
hub: ai-avatar
description: "Exploring AI Avatars with persistent identity, memory and the ability to act, built on a custom harness and context engine."
updatedAt: 2026-09-20
group: pinned
badges: [AI Avatar, Harness, Context Engine]
tags: [AI, Avatar, Memory, TypeScript]
---

AI.Zhuoling.Space is one of my most important personal projects and part of my exploration of social presence in AI Avatars. I want interactions to feel like spending time with an entity whose identity persists, which remembers shared experiences and can work alongside you.

I am building a custom harness and context engine around the models to support that continuity. The harness coordinates tools, execution and results. The context engine prepares identity, history and relevant memories for each turn.

## Identity, expression and memory

An Avatar holds a persistent identity. A Persona describes a particular voice, user context, skills and tool configuration. Each Avatar can have multiple Personas; a session starts with a selected Persona and model.

The context layer combines Avatar and Persona prompts, then retrieves memories relevant to the current message from that Avatar's memory. Semantic retrieval and the ability to supersede outdated memories give later conversations access to updated information.

## Working together

The harness connects model selection, tool capabilities, requests for user input and result persistence. The application also includes general chat, skill management, image generation, translation and usage records. Available tools depend on the chosen model, Persona configuration and server integrations.

The project uses TypeScript, React and Hono, with PostgreSQL for application state and S3-compatible object storage for files. Node.js and Docker form the current deployment path.

## Continuing the exploration

The current product organizes interaction into sessions and implements identity configuration, memory retrieval and context preparation. A continuous stream for each Avatar and topic-sensitive Persona switching remain future directions. Social presence is the experience I hope to develop through sustained interaction.

Try the service below, or read the [design essay](/blogs/ai-avatar-social-presence/) and [context architecture notes](/projects/ai-avatar/docs/context-and-memory/).
