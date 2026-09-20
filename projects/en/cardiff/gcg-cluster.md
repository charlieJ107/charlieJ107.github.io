---
draft: false
title: Cardiff University COMAT GCG Cluster
hub: gcg-cluster
description: "A GPU research platform for the Cardiff University COMAT research group, integrating development workspaces, shared storage and resource scheduling."
updatedAt: 2026-09-20
status: active
group: pinned
tags: [DevOps, Kubernetes, GPU, Research infrastructure]
---

Cardiff University COMAT GCG Cluster provides GPU computing, development environments and persistent storage for the research group, supporting everyday development, debugging and research workloads. The platform brings environment configuration, resource allocation and workspace management into a single workflow.

**For researchers:** begin with the [quick start](/projects/gcg-cluster/docs/quick-start/), then follow the [Dev Containers series](/projects/gcg-cluster/docs/devcontainers-first-workspace/) to customise your environment. The group's Microsoft Teams channels provide the platform address and account arrangements.

**For an engineering overview:** start with [workspace and GPU resource design](/projects/gcg-cluster/docs/workspace-design/), then read [reproducible operations and observability](/projects/gcg-cluster/docs/operations-design/).

## Platform components

The platform brings GPU resources into Coder development workspaces running on MicroK8s. Prepared environments help researchers get started, while Dev Containers let projects define their own dependencies. MicroCeph provides storage for workspace files and data shared across a user's workspaces.

Shared GPU access supports interactive work; Kueue admission controls workspaces that need an exclusive GPU. The design connects environment preparation, resource allocation and data persistence into one workflow for research users.

## Development and maintenance

Zhuoling Jiang built the platform during doctoral research at Cardiff University and continues to operate it. Development and maintenance cover:

- **Platform engineering:** integrate Kubernetes, GPU workloads, development environments and persistent storage.
- **Reproducible environments:** maintain workspace templates, versioned images and repeatable deployment and verification workflows.
- **Operations:** maintain monitoring, investigate failures and carry out controlled maintenance with checks afterwards.
- **Researcher support:** document platform behaviour and help users choose environments and understand resource and storage lifecycles.

These responsibilities require decisions across the whole service: a template affects how a user starts work, a storage policy affects what survives a workspace change, and monitoring needs to connect a platform symptom to the workload involved. The design documents explain those decisions and their trade-offs.

## Using the platform

Access is limited to authorised members of the research group. The group's Microsoft Teams channels provide the platform address, account arrangements, starter files and maintenance notices. The guides below cover workspace creation, environment configuration, storage and GPU use.
