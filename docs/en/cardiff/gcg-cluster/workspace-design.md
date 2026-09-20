---
draft: false
title: "Workspace, storage and GPU scheduling design"
description: "The trade-offs between environment builds, data lifetimes and GPU allocation in research workspaces."
project: gcg-cluster
section: explanation
order: 20
updatedAt: 2026-09-20
---

Cardiff University COMAT GCG Cluster provides GPU computing, development workspaces and persistent storage for the research group. Research projects need a usable environment quickly, alongside ways to change dependencies, retain data and arrange compute. The workspace design separates these concerns into environments, storage and scheduling, with explicit boundaries between their lifecycles.

## Reusing and customising environments

The platform runs workloads on MicroK8s Kubernetes, with Coder and Terraform managing workspaces. Prepared golden images provide a quick starting point, while Dev Containers support project-specific customisation. Golden images centralise the maintenance of common dependencies; custom environments give projects responsibility for their own software. This choice determines who maintains the environment and when its preparation takes place.

BuildKit builds the base images, and Envbuilder builds custom environments. Golden images are pinned by immutable digest, giving each workspace a traceable reference to its image. An image update becomes an explicit choice. Projects still need to manage their dependency declarations and experiment code to explain the environment used for a particular run.

## Separate lifetimes for data and workspaces

Storage uses MicroCeph / CephFS and distinguishes workspace-lifetime SSD storage from user-lifetime HDD storage. The former follows the workspace lifecycle and suits working data that benefits from faster access. The latter follows the user lifecycle and holds personal data retained across workspaces. A personal shared volume can be used by multiple workspaces belonging to the same user.

This division expresses both performance choices and responsibility for retention. An environment can be rebuilt, while data needs a home chosen according to its purpose. Sharing data across workspaces reduces repeated preparation and requires care with concurrent access and file changes. Explicit data lifetimes make the consequences of creating, replacing and reclaiming a workspace easier to understand.

## GPU allocation and the cost of waiting

Shared GPUs use time slicing to support shared use of compute resources, but provide no GPU memory isolation. Workloads on the same device still need to account for memory contention. The sharing policy therefore describes how the device is used; it does not establish a separate memory boundary for each workspace.

Exclusive GPU workspaces pass through Kueue admission with StrictFIFO. Strict queue ordering makes the waiting rule clear, while later requests may have to wait behind the head of the queue. Image preparation after admission also occupies the exclusive resources, so their cost includes environment preparation time. Stopping the workspace releases its allocation. Convenient interactive access therefore carries a responsibility to end that allocation promptly.

Together, these decisions connect environment traceability, data retention and resource fairness within one workspace model. [Operations design](/projects/gcg-cluster/docs/operations-design/) explains configuration maintenance, observability and recovery evidence; the [project overview](/projects/gcg-cluster/) provides the wider context.
