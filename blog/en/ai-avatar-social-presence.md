---
draft: false
title: "Building social presence for an AI Avatar: identity, memory and action"
description: "The design of the harness and context engine in AI.Zhuoling.Space, and how they support continuity in interaction."
date: 2026-09-20
updatedAt: 2026-09-20
category: Project design
projects: [ai-avatar]
tags: [AI, Avatar, Harness, Context Engine, Social Presence]
---

AI.Zhuoling.Space explores how an AI Avatar can develop a sense of social presence through continued interaction. This goal calls for later conversations to carry forward shared background and for the Avatar to participate in new tasks with a relatively stable identity.

In this project, social presence describes an experiential goal: feeling that you are interacting with an entity that has continuity. Identity, memory, action and feedback all contribute to that continuity. These engineering problems motivate the design of the harness and context engine.

## Identity needs to extend across conversations

A discussion might involve code, the next might concern writing, and a later one might return to everyday plans. For those interactions to belong to the same Avatar, it needs a persistent identity and a way to adapt its expression to the situation.

The project places these concerns in Avatar and Persona respectively. The Avatar stores identity and background; the Persona defines prompts, voice, skills and tool configuration. When creating a session, the user selects a Persona and model, which guide preparation of the interaction.

This separation lets one Avatar use different capability configurations in different situations while retaining a stable home for its identity. Technical collaboration can guide a requirements discussion; a writing partner's voice can suit an article discussion. Configuration supports these uses, while the quality of the experience still needs refinement through real conversations.

## The context engine selects what matters now

Continuity requires bringing relevant information back at the right time. Every turn therefore involves a selection problem: which history, memories and identity layers does this topic need?

The current context layer combines Avatar and Persona prompts, includes session history, and uses the current user message to retrieve memories belonging to that Avatar. Retrieved content enters the model input as transient context for the turn. The persisted original user message and runtime input are handled separately, allowing relevant background to be selected afresh on subsequent turns.

The intent is concrete: recall should respond to the current need. Suppose a stored memory says that a project primarily targets phones. That may help when discussing its interface again; retrieval should change when the discussion moves elsewhere.

Memory also needs to accommodate updates. The project supports writing a new memory that explicitly supersedes an outdated record, with default retrieval using the active set. Continuity can then include correction and change. Actual recall quality still depends on the records, query and model behavior, so important facts need confirmation during interaction.

## The harness connects expression to action

The harness is the layer that organizes execution around the model. It connects context, models, tools and results so that an interaction can accomplish something concrete.

In AI.Zhuoling.Space, Persona configuration helps select tool capabilities. Within the available capabilities, a model can search, use skills or work with files. A tool can ask for further information, with the system storing the pending input and continuing execution when the user answers. Specific tools depend on model and server integration configuration.

These flows also require reliable persistence. Conversation messages, execution steps, memory hits and usage records describe what happened during an interaction. Continuing a task and understanding its existing results contribute to the experience of sustained collaboration.

The harness and context engine therefore have connected responsibilities: the context layer prepares what an interaction needs to know, the harness organizes what it can do next, and the resulting state is saved.

## Current implementation and further exploration

At the time of writing, the project implements Avatar and Persona management, session interaction, memory retrieval and writing, context preparation, tool execution and requests for additional user input. The product still organizes discussion into sessions, with a Persona chosen when a session starts.

Future directions include a continuous conversation stream centered on each Avatar, context selection that connects topics, and Personas that adapt to the situation during an ongoing interaction. These directions require further design and validation.

Ultimately, social presence has to be explored through repeated use: whether identity remains consistent, shared background returns when useful, changed information is accepted, and activities can continue naturally. The harness and context engine can be evaluated and refined around those questions.

## Read more and try it

Visit the [AI.Zhuoling.Space project page](/projects/ai-avatar/) to enter the service, or start with the [user guide](/projects/ai-avatar/docs/getting-started/) and [context and memory explanation](/projects/ai-avatar/docs/context-and-memory/). Registration is open, with access available after signing up.

