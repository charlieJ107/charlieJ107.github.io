---
draft: false
title: "From a local AI avatar to a classroom of 50"
description: "A proposal for affordable spoken language practice: shared university GPUs, a managed web service, measurable classroom trials, and a three-year cash budget."
date: "2026-09-25"
presentation: classroom-ai
scenario:
  students: 50
  lessonMinutes: 45
  turns: 20
  systemTokens: 600
  userTokens: 40
  replyTokens: 80
  speechSeconds: 15
  lessonsPerWeek: 10
  weeksPerYear: 36
  years: 3
  cloudShare: 20
  inputEuroPerMillion: 0.25
  outputEuroPerMillion: 0.50
  asrEuroPerMinute: 0.003
  monthlyHostingEuro: 0
  ttsEuroPerMillionChars: 0
  charsPerToken: 4
  ttsCloudShare: 0
category: "Plans"
tags:
  - AI
  - Education
  - Infrastructure
  - Research
---

## 1. A service that fits the lesson

Fifty pupils should be able to practise speaking with an AI avatar during an ordinary language lesson. This proposal takes a working local application towards that classroom service, using university computing resources and a small, controlled cloud budget.

The proposed users are secondary schools in the UK and Western Europe. Pupils speak, read a transcript, and hear a short reply from an animated character. Teachers choose the activity and can pause it. The first release covers guided conversation and feedback within a lesson.

The proposed React frontend renders the avatar, shows captions and plays audio in the browser. WASM handles suitable client computation after device and speech-quality validation; university GPUs handle dialogue and suitable speech tasks; approved cloud services supplement device compatibility, capacity and availability. The specific avatar and speech components will be selected during the pilot.

Early local testing with Gemma 4 E4B in four-bit form through llama.cpp established sufficient conversational capability for this learning task. Classroom capacity remains to be measured. The proposal is a staged pilot, with expansion tied to teaching quality, response time, recovery and spending evidence.

## 2. Turn fifty pupils into a measurable workload

The capacity target is one class of 50, with a clear distinction between pupils present and requests being generated at the same instant.

<!-- pitch:workload -->

Use a 45-minute lesson containing 20 exchanges per pupil: 20 pupil messages and 20 avatar replies, or 40 messages in total. For budgeting, assume a 600-token instruction, 40 tokens per pupil message, 80 per reply, and 15 seconds of recorded speech per exchange. A token is a small unit of text processed by the model.

That gives 1,000 exchanges per class, averaging about 22 requests per minute. Whole-class prompts can still produce a burst of 50 requests. Both patterns belong in testing, together with longer conversations near the end of the lesson.

If every request includes the full conversation so far, input per pupil is:

`20 × (600 + 40) + 120 × (0 + 1 + … + 19) = 35,600 tokens`.

One class therefore uses **1.78 million input tokens, 80,000 output tokens and 250 audio minutes**. These are planning assumptions. Record actual lengths during the pilot and update the forecast, including retries and any generated reasoning.

## 3. Put a reliable front door around shared computing

Keep the website and session controls available while routing inference to whichever approved resource can meet the response deadline.

<!-- pitch:architecture -->

Serve the browser interface through Cloudflare static assets. A Worker validates school sessions, enforces lesson quotas and routes each request. A small database holds session ownership, completed turns and usage records. API credentials stay on the server.

The speech pipeline is straightforward: microphone recording, speech recognition, conversational model, speech synthesis, then avatar playback. Start with short recordings submitted when the pupil finishes speaking. Stream the reply text and begin speech at a complete phrase when the selected voice supports it.

Restrict inference access to the application Worker. A [VPC Service binding](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/) connects through Tunnel to a fixed private host and port; this option is currently beta. The established alternative is a Tunnel hostname protected by [Access Service Auth](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/), accepting only credentials held in Worker secrets. University IT must approve [outbound port 7844](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/tunnel-with-firewall/) and the service identity. Health and capacity signals select a local worker or approved European API; a bounded queue controls waiting.

Reserve a request's cloud allowance before dispatch and reconcile recorded usage afterwards. A shared coordinator makes concurrent reservations atomic. When the allowance is exhausted, the interface explains the delay and gives the teacher control. The long speech or text stream passes through the Worker; the coordinator only handles short accounting operations.

## 4. Make useful capacity from the GPUs we have

Use each available GPU as a measured service replica, and give university research jobs a clear way to reclaim it.

Start with one existing RTX 4090 for dialogue, plus one 4070 Ti or 5070 Ti for speech recognition or overflow, subject to joint testing. Their memory capacities are 24 GB, 12 GB and 16 GB respectively; a 4070 Ti SUPER has 16 GB. Check the inventory against [NVIDIA's specifications](https://www.nvidia.com/en-gb/geforce/graphics-cards/compare/). This candidate allocation requires no purchase.

Google's [format guide](https://ai.google.dev/gemma/docs/core) gives an approximate 4.5 GB loading estimate for E4B Q4_0. Measure the complete runtime footprint, including conversation memory at the intended concurrency, on each card. The guide provides GGUF for llama.cpp and E4B QAT compressed tensors, `-qat-w4a16-ct`, for vLLM. Recheck dialogue quality when changing the quantized checkpoint.

Keep the working llama.cpp setup as a benchmark. Its [server supports parallel requests and continuous batching](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md). Evaluate vLLM as a production candidate using its [Gemma 4 recipe](https://docs.vllm.ai/projects/recipes/en/stable/Google/Gemma4.html). **Continuous batching** lets the GPU advance several conversations together, admitting new work as earlier replies finish. **Prefix caching** reuses computation for an identical beginning of a conversation. It can shorten repeated prompt processing; fresh answers still require generation.

Set a 4,096-token conversation ceiling and increase active slots gradually, measuring latency and memory. Trial 128-token replies with thinking disabled against the teaching activities. KV cache remembers processed text and grows with conversation length and concurrency. Prefer the same university replica for successive turns, with [cache isolation between pupils](https://docs.vllm.ai/en/latest/design/prefix_caching/). Benchmark CPU-memory offload and cross-node KV transfer against recomputing the prompt. Persisted completed text remains the recovery source.

Target twice the average load: approximately **1,320 input tokens processed and 60 output tokens generated per second**, with speech recognition running. These are joint acceptance targets. Test 50-request bursts and a lost node, including cloud quotas sufficient for the whole class.

Before reclaiming a machine, stop admission and drain active work. Recover unexpected failures from the last completed turn. Reuse its unique identifier on retry and cancel the abandoned attempt. If audio already played, show an interruption and let the pupil resume.

## 5. Prove the experience before widening access

The proposed classroom target is audible feedback within four seconds for at least 95 out of every 100 turns.

Measure from the end of the pupil's speech to the start of the avatar's audible reply, including recognition, queuing, generation and speech synthesis. This is a **p95** target: roughly the slowest five turns in a hundred may exceed it. Failed turns count as misses. Report completion failures and interruptions separately, and have teachers judge whether the interaction supports speaking practice.

| Stage | Evidence required to proceed |
| --- | --- |
| Bench rehearsal | Replay 50 sessions, including simultaneous starts and final-turn histories; measure each GPU and cloud route. |
| Small school pilot | Check target languages, microphones, school filtering, accessibility and actual classroom noise. |
| Full class | Meet the response target, complete a GPU-loss exercise and stay within the lesson allowance. |
| Routine delivery | Keep a named support owner, usage review and a rehearsed recovery procedure. |

Use a versioned repository, reviewed changes, separate test credentials, pinned models and containers, and repeatable deployments. Automated checks cover access, duplicate turns, budget reservations and recovery. Teacher-reviewed dialogues check language accuracy, age suitability and instruction following.

Release between lessons, check one spoken interaction and retain the previous version. Document how to pause admission, switch approved routes and recover sessions. Name a primary and backup contact for lesson-time support.

## 6. A three-year cash request with visible assumptions

The baseline request covers additional service spending over three years, with existing equipment, staff time and electricity provided by the university.

<!-- pitch:budget -->

Ten classes per week, 36 teaching weeks per year, for three years means **1,080 classes**. The workload above totals **1.9224 billion input tokens, 86.4 million output tokens and 4,500 hours of speech recognition**. Assume 20% of each billable workload reaches the cloud; this is a forecast to test against actual GPU availability.

[Scaleway's published prices](https://www.scaleway.com/en/pricing/model-as-a-service/) provide a European reference: Gemma 4 26B A4B IT costs €0.25 per million input tokens and €0.50 per million output tokens; Whisper large v3 costs €0.003 per audio minute. Prices are before tax. The 26B model is a cloud cost reference; a matching E4B European serverless price has not been verified.

| Three-year variable spending | 20% cloud use | Entire workload in cloud |
| --- | ---: | ---: |
| Conversation model | €104.76 | €523.80 |
| Speech recognition | €162.00 | €810.00 |
| Total for these two services | **€266.76** | **€1,333.80** |

The estimate assumes full-history billing without cache discounts or free credits. Whisper bills actual audio duration. The projected cash difference is €1,067.04 across three years. Track cloud share, actual usage and remaining budget after each pilot lesson.

Browser speech synthesis contributes zero additional API spending **only if school devices provide an approved voice of sufficient quality**. Verify language coverage, service location and consistency. A paid TTS fallback needs a separate quote based on characters or audio duration; it is outside the table. Domain renewal and any additional storage also need explicit line items.

Cloudflare's free tier can support the initial experiment if measured usage fits its limits. [Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/) starts at **US$5 per month**, or **US$180 for 36 months** at the current minimum. Keep this dollar amount separate from the euro subtotal and verify included usage. None of these prices is a three-year commitment.

## 7. Give the service clear owners

A classroom service needs an agreed operating arrangement that survives beyond the person who built the prototype.

The research lead owns the learning task, study protocol and budget. University IT owns approved connectivity, machine access, patching and recovery arrangements. Teachers own lesson readiness, participant supervision and the pause control. The university data protection contact and school representatives agree the data flows, retention and supplier arrangements before pupil access.

Use pseudonymous pupil identifiers. Propose deletion of raw audio after recognition and a 24-hour recovery window for service transcripts, subject to the agreed study protocol. Research records follow a separately approved retention schedule, including exports and backups. Keep operational logs focused on request IDs, timings, errors and quantities.

Record model version, quantization, prompt version, speech components and local or cloud route with each research turn. A switch from local E4B to cloud 26B may alter the learning intervention. Approve that switch in the protocol, analyse it explicitly, or use a consistent approved route for the study. Operational recovery and research comparability must be designed together.

## 8. Decisions that unlock the pilot

Approve the first classroom trial once capacity, voice quality, data handling and named support have each passed a concrete check.

The outstanding decisions are the target languages and school devices; available GPU windows; measured capacity per replica; an approved cloud fallback and its account quotas; the browser voice test or a funded TTS option; and the study's treatment of route changes. Recheck prices before procurement and revise the forecast after the pilot.

The primary references consulted on 25 September 2026 support the implementation choices:

- [Google Gemma 4 model formats and memory planning](https://ai.google.dev/gemma/docs/core).
- [vLLM's Gemma 4 deployment recipe](https://docs.vllm.ai/projects/recipes/en/stable/Google/Gemma4.html).
- [vLLM prefix caching and cache isolation](https://docs.vllm.ai/en/latest/design/prefix_caching/).
- [llama.cpp server features and parallel slots](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md).
- [NVIDIA GPU specifications](https://www.nvidia.com/en-gb/geforce/graphics-cards/compare/).
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
- [Scaleway model and speech recognition pricing](https://www.scaleway.com/en/pricing/model-as-a-service/).
- [Scaleway hosting location, billing and service behaviour](https://www.scaleway.com/en/docs/generative-apis/faq/).
- [Scaleway organisation quotas](https://www.scaleway.com/en/docs/organizations-and-projects/organization/organization-quotas/).
