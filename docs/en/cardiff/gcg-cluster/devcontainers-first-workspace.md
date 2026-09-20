---
draft: false
title: "Dev Containers 1: create a project workspace"
description: "Prepare a Git repository, create a Dev Container workspace and verify its environment."
project: gcg-cluster
section: guide
order: 20
updatedAt: 2026-09-20
---

A Dev Container keeps the development environment definition with your project. This series covers [creating a workspace](/projects/gcg-cluster/docs/devcontainers-first-workspace/), [customising dependencies](/projects/gcg-cluster/docs/devcontainers-customise/) and [troubleshooting builds](/projects/gcg-cluster/docs/devcontainers-troubleshooting/). For your first platform session, complete the [quick start](/projects/gcg-cluster/docs/quick-start/) first.

## Prepare the repository

Obtain the current GCG Dev Container starter through the research group's Teams channel. Copy its complete contents into your project repository, including the hidden `.devcontainer` directory and the environment-check script. Use the supplied configuration for the first build.

The repository needs `.devcontainer/devcontainer.json` and the Dockerfile or image configuration it references. Commit and push the files before creating the workspace. Coder reads the remote repository; files remaining only on your computer are unavailable to it.

For a private Git repository, prefer SSH and authorise your Coder public key with the Git provider. Keep private keys and access tokens out of Git URLs, source files and screenshots. If HTTPS authentication is required, ask the administrator about the approved setup before entering credentials into template fields, which may be visible and stored persistently.

## Create and connect

1. Choose **DevContainers**, checking the identifier `gcg-devcontainer`.
2. Enter your repository URL and Git ref. Use `.devcontainer` as the configuration directory for the starter.
3. Keep the current resource defaults and leave **Pre-launch Script** empty.
4. Create the workspace and wait for the build and agent connection. Open a terminal when the agent is ready.
5. Open the project checkout under `/workspaces/<repository-name>`. Replace the placeholder with your repository's actual directory.

From that checkout, run the starter's check:

```bash
sh scripts/check-environment.sh
```

The expected final line is `OK: the GCG Dev Container contract is satisfied.` A successful check establishes the platform prerequisites. Test your project's additional tools and framework separately.

## Check the image contract

The selected Linux AMD64 image must provide a non-root user with UID/GID `1000:1000`, an existing writable HOME, POSIX `/bin/sh`, `base64`, `mktemp`, Git and common core utilities. The username and HOME path depend on the image. Python, Conda, uv and CUDA compilation tools depend on the project's chosen environment.

The platform provides the checkout below `/workspaces`, personal shared storage at `/shared`, GPU integration and the Coder agent. Design your configuration around these mounts and a regular unprivileged development session. Custom mounts, a Docker socket, Docker-in-Docker and privileged mode are outside the supported workflow.

## Confirm the project is ready

Check the startup logs and run a small project command before a long task. A failed build can open a basic Ubuntu recovery environment; a working terminal alone does not establish that your image built successfully. Use [troubleshooting](/projects/gcg-cluster/docs/devcontainers-troubleshooting/) to repair the build.

Next, [customise and reproduce the environment](/projects/gcg-cluster/docs/devcontainers-customise/). Keep [storage behaviour](/projects/gcg-cluster/docs/storage-and-lifecycle/) in mind when choosing where to install dependencies and save results.
