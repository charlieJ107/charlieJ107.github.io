---
draft: false
title: "Quick start: your first GCG workspace"
description: "Create a workspace, open an editor, check storage and GPU access, and finish a session."
project: gcg-cluster
section: guide
order: 0
updatedAt: 2026-09-20
---

This guide is for authorised members of the Cardiff University COMAT research group. Start with the prepared Standard environment; it provides a terminal and browser development tools. The steps describe the current templates, checked against the platform's September 2026 user guide.

## 1. Arrange access

Request the platform address and an account through the group's Microsoft Teams channels. Provide your Cardiff email to the administrator and follow the welcome instructions. Teams membership and a platform account are separate arrangements. See [access and support](/projects/gcg-cluster/docs/access-and-support/) for help and maintenance notices.

## 2. Create a Standard workspace

1. Sign in at the address supplied in Teams and select **New Workspace**.
2. Choose **Ubuntu Standard** and confirm the template identifier is `gcg-standard`. Display names may change.
3. Name the workspace, for example `my-research`. Keep the default Conda preset and the current resource defaults. Leave **Pre-launch Script** empty for your first workspace.
4. Select **Create Workspace**. Wait for the agent to connect, then open Terminal or VS Code Web. Standard also provides Jupyter Notebook and File Browser.

Image preparation and resource availability affect startup time. A Running status alone does not confirm that the agent and editor are ready. For a persistent Connecting state, use the [troubleshooting guide](/projects/gcg-cluster/docs/devcontainers-troubleshooting/).

## 3. Check the environment

Run these commands **inside the workspace terminal**:

```bash
df -h /home/ubuntu /home/ubuntu/shared
nvidia-smi
```

Confirm that both persistent volumes are mounted and the GPU is visible. Create a uniquely named small test file in shared storage and read it back. If a mount is missing or unwritable, ask for help before saving important work there.

`nvidia-smi` checks GPU visibility. Your project's framework and CUDA compilation tools have their own requirements; test a small GPU operation in the framework before a longer experiment. The platform supplies the GPU driver integration.

## 4. Save your work and stop

Keep Standard project files under `/home/ubuntu` and cross-workspace data under `/home/ubuntu/shared`. Commit and push code, and keep separate copies of important results and checkpoints. Read [storage and workspace lifecycle](/projects/gcg-cluster/docs/storage-and-lifecycle/) before changing or deleting a workspace.

Use Coder's **Stop** action when finished. Stopping ends running processes and retains persistent files. Closing a browser or editor leaves the workspace running. Check your workspace's Schedule / Autostop settings and save checkpoints for jobs that may be interrupted.

## Next steps

- For a reproducible project environment, start the [Dev Containers series](/projects/gcg-cluster/docs/devcontainers-first-workspace/).
- For local VS Code, follow the connection instructions on the workspace page. Install Coder Desktop before using its PyCharm connection.
- For compute planning and exclusive workspaces, read [GPU use and queueing](/projects/gcg-cluster/docs/gpu-and-queueing/).
