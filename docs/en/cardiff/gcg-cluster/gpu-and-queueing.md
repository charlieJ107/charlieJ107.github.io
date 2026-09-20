---
draft: false
title: "GPU use and exclusive workspace queueing"
description: "Validate shared GPU workloads, prepare an exclusive workspace and release resources after use."
project: gcg-cluster
section: guide
order: 60
updatedAt: 2026-09-20
---

Start development and small validation runs in Standard or shared Dev Containers. Shared GPU access uses time slicing and provides no GPU-memory isolation. Size your experiment for available resources and coordinate sustained or large workloads with the administrators.

## Validate the workload

Check GPU visibility with `nvidia-smi`, then test your actual framework and a representative small workload. Monitor memory use and save checkpoints. Select a compatible CUDA Toolkit if the project compiles GPU code; runtime GPU access alone does not supply a compiler.

## Prepare an exclusive workspace

1. Validate the exact project commit in shared Dev Containers, including the environment check and a small project run.
2. Push code and configuration. Put data needed by both workspaces in personal shared storage.
3. Stop the shared workspace, then select the exclusive GPU Dev Container template identified in the current Teams guide.
4. Use the same repository URL/ref and Dev Container directory. Each workspace has its own persistent workspace volume, so use Git and shared storage to transfer work.

Preparing the image first can allow cache reuse and reduce time spent building after admission. Cache reuse depends on the current inputs; leave room for image preparation when planning the task.

## Understand waiting and release

The exclusive queue admits one workload at a time, in first-in-first-out order, with no preemption or estimated start time. Coder may show Running while the agent is Connecting or timed out. A timeout can also reflect a build or a fault; ask the administrator to check its state.

Keep the queued workspace while waiting. Delete/Create loses the queue position and removes its workspace storage. Image preparation after admission occupies the allocation. An idle GPU does not release it while the workspace remains running.

Stop the workspace promptly when the exclusive task finishes. Check Schedule / Autostop for that workspace, and make long jobs restartable because maintenance or faults can interrupt them. For help, use [access and support](/projects/gcg-cluster/docs/access-and-support/).
