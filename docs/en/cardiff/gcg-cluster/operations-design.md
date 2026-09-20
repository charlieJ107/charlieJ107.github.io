---
draft: false
title: "Operations design: configuration, observability and recovery evidence"
description: "How research infrastructure organises rebuildable configuration, observability, maintenance and backup validation."
project: gcg-cluster
section: explanation
order: 30
updatedAt: 2026-09-20
---

Cardiff University COMAT GCG Cluster provides GPU computing, development workspaces and persistent storage for the research group. Keeping it running requires connecting the intended system state, what is happening now, and how to confirm the result of maintenance. The operations design organises configuration, observability and validation evidence around these questions.

## Rebuildable configuration and runtime resources

Version-controlled current manifests, Helm values and operator resources describe the configuration needed to rebuild the system. Scripts handle preflight checks, orchestration and acceptance checks, connecting maintenance steps to their completion criteria. Coder / Terraform manage dynamic workspace resources, giving infrastructure configuration and workspace lifecycles explicit areas of responsibility.

Documentation distinguishes current operating guidance, historical evidence and future plans. Current guidance supports daily decisions; historical evidence explains changes already carried out and their results; plans record subsequent intentions. This organisation helps maintainers understand the time and evidence associated with a statement, and review operating guidance alongside configuration changes.

## Connecting system metrics to workspaces

Prometheus / Grafana provide observability across Kubernetes, Ceph, GPUs, Coder and PostgreSQL. System metrics describe resources and service health. Attributing workspace usage to users and workspaces adds context for investigating contention, unusual consumption and the scope of their effects.

Metrics are useful when they support a concrete decision. Changes in resource use need interpretation alongside workspace activity and service state; collecting data still leaves the work of connecting symptoms to causes. Regular read-only inspections help identify deviations, rolling maintenance controls the scope of changes as they proceed, and acceptance checks confirm the expected result after execution. These steps form a feedback process for ongoing maintenance.

## Backup coverage and recovery validation

CloudNativePG manages PostgreSQL. Native PostgreSQL WAL and base backups are complemented by logical backups stored in Ceph RGW. These approaches provide different recovery materials: a base backup and WAL support a chain for recovering database state, while logical backups offer another representation of database contents. Maintaining complementary materials also adds maintenance and validation work.

Backup design must also account for failure domains. The number of copies and their independence when facing the same kind of failure are separate questions. Assessing recovery capability requires examining dependencies between backups, storage and database services, and understanding which recovery materials a single failure could affect.

Configuration validation checks whether system definitions meet expectations. Backup integrity checks examine the consistency of the backup materials. Recovery capability needs evidence from an actual restore and checks of both data and services. This distinction guides how recovery procedures and their acceptance criteria are designed.

See [workspace design](/projects/gcg-cluster/docs/workspace-design/) for the related trade-offs in environments, data lifetimes and GPU allocation, and the [project overview](/projects/gcg-cluster/) for the scope of platform development and operations.
