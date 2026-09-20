---
draft: false
title: "Storage and workspace lifecycle"
description: "Choose persistent paths and understand Stop, Delete, shared data and environment changes."
project: gcg-cluster
section: guide
order: 50
updatedAt: 2026-09-20
---

Choose file locations before downloading data or starting an experiment. The following paths apply to the current Standard and Dev Container templates; check legacy templates separately with the administrator.

## Choose a location

| Purpose | Standard | Dev Containers | Stop/Start | Delete workspace |
| --- | --- | --- | --- | --- |
| Workspace code, environments and settings | `/home/ubuntu` | `/workspaces` | Preserved | Removed |
| Personal data across your workspaces | `/home/ubuntu/shared` | `/shared` | Preserved | Preserved |
| Memory-backed temporary files | `/dev/shm` | `/dev/shm` | Recreated | Removed |
| Other container filesystem paths | Outside persistent mounts | Includes HOME unless placed on a persistent mount | May be lost on container replacement | Removed |

Personal shared storage is shared between your own workspaces. Your deletion or overwrite commands affect those files directly. Account retirement follows the administrator's process. Persistent storage still needs a backup strategy for important data.

## Check capacity and mounts

For Standard:

```bash
df -h /home/ubuntu /home/ubuntu/shared
```

For Dev Containers:

```bash
df -h /workspaces /shared
```

Check your actual allocation and free space. Dependencies and caches under `/workspaces` use the same workspace volume as code. Use shared storage for large datasets and results needed across workspaces. Discuss capacity needs through Teams before a large transfer.

## Stop, restart and delete deliberately

Stop ends running processes and retains persistent files. Use checkpoints so that interrupted work can resume. Closing an editor leaves the workspace running; check the workspace's own Schedule / Autostop settings.

Before Delete, push code and copy any required workspace files to an appropriate separate location. Review that copy before deleting. Shared files survive workspace deletion, but each workspace's code checkout and environment volume is separate. Creating a new workspace or choosing another template does not migrate them automatically.

## Recreate the environment

Keep system dependencies in the image definition and dependency specifications in Git. Put manually created project environments under the appropriate persistent directory. For Dev Containers, follow [environment customisation](/projects/gcg-cluster/docs/devcontainers-customise/) and synchronise Git changes before rebuilding.
