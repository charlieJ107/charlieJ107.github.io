---
draft: false
title: "Context and memory for an Avatar"
description: "How identity, Persona, session history and memory become the input to a model call."
project: ai-avatar
section: explanation
order: 20
updatedAt: 2026-09-20
---

## Four kinds of information

| Information | Purpose | Lifetime |
| --- | --- | --- |
| Avatar | Identity and shared background | Persists across sessions |
| Persona | Voice, prompts and capability configuration | Configured separately, chosen at session creation |
| Session history | The course of the current discussion | Persists with the session |
| Avatar memory | Relevant information recalled from past records | Persists across sessions, retrieved for the current query |

This separation lets stable identity, current expression and temporary topics evolve independently, while leaving room for future changes.

## Preparing each turn

The current implementation loads the session's Avatar and Persona, combining base instructions, Avatar identity and Persona prompts into the system prompt. It then uses text from the current user message to retrieve Avatar memories and injects the results into the model input as transient context for that turn.

This temporary input is handled separately from the user's stored original message. The next turn can select relevant memories again, allowing retrieval to follow the discussion. Memory hits are also recorded to help explain which background informed a response.

## Retrieval and updates

The memory service supports vector similarity search, with keyword overlap and recency scoring as a fallback when embeddings are unavailable. Memories belong to their Avatar; general chat uses a separate user-scoped memory boundary.

Default retrieval uses memories that remain active. When writing a new record, a tool can explicitly identify an older record to supersede. The update checks ownership and active status before transactionally storing the new memory and replacement relationship. This supports correction of outdated information.

Recall still depends on the quality of stored memories and the current query. Explicit confirmation and correction remain part of interacting around important facts.

## Connecting to the harness

Prepared prompts, messages and memory information enter the model execution layer. Persona tool configuration helps determine available capabilities. Execution can invoke tools or ask the user for additional input. Conversation messages, execution steps and usage records then enter the persistence flow.

This description reflects implementation reviewed on September 20, 2026. An Avatar-centered continuous conversation stream and automatic Persona switching within a session remain areas for further exploration. The [social presence essay](/blogs/ai-avatar-social-presence/) explains their intended purpose.
