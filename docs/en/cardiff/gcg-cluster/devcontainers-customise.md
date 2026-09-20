---
draft: false
title: "Dev Containers 2: customise and reproduce the environment"
description: "Version system dependencies and Python environments, then apply configuration changes deliberately."
project: gcg-cluster
section: guide
order: 30
updatedAt: 2026-09-20
---

Start with a working [starter workspace](/projects/gcg-cluster/docs/devcontainers-first-workspace/). Make one environment change at a time and keep a small command that verifies the result.

## Choose and record a base image

Use the current starter image or a compatible Linux AMD64 image that satisfies the user, HOME and utility requirements in the first guide. Ask in Teams for the platform's current image choices. Record the selected image and dependency versions in your repository; pin an immutable image digest when repeatability matters.

Choose a CUDA Toolkit only when your project needs it, such as compiling CUDA extensions. Check framework compatibility and validate a real GPU operation. The platform supplies host GPU drivers; installing kernel drivers inside the development image is unsupported.

## Put system dependencies in the image

Add operating-system packages and repeatable setup to the Dockerfile referenced by `devcontainer.json`. Preserve the starter's final non-root user and writable HOME. Keep authentication material out of image layers and committed configuration.

For an Ubuntu or Debian base, this is an illustrative package-installation step to place while the Dockerfile is running as root:

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
```

Adapt packages to your project and return to the image's required non-root user afterwards. This snippet extends a compatible Dockerfile; it is not a complete base-image definition. Manually installed system packages can disappear when the container is replaced, so capture the final setup in the repository.

## Create a project Python environment

If the chosen image provides Python with `venv`, run the following **from the project checkout under `/workspaces`**. The example assumes your project contains a maintained `requirements.txt`:

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m pip check
```

The template does not create `.venv` automatically. Add `.venv/` to `.gitignore`, version the dependency specification or lockfile, and recreate the environment from it when needed. For stronger reproducibility, pin transitive dependencies as well as direct dependencies.

Common pip, uv, Hugging Face and Conda caches, and named Conda environments, default to locations under `/workspaces`. They consume the workspace's storage allocation. Keep large datasets and cross-workspace results under `/shared`; see [storage and lifecycle](/projects/gcg-cluster/docs/storage-and-lifecycle/).

## Apply and verify a change

1. Commit and push configuration edits. If you edited elsewhere, inspect the workspace checkout with `git status --short`, resolve local changes, then update the branch checkout with `git pull --ff-only`. A checkout pinned to a commit needs an intentional ref update instead.
2. Use Coder **Update** or Stop/Start to apply the configuration. Restart and Update do not perform `git pull` for you.
3. Read build logs, run `sh scripts/check-environment.sh` when using the starter, and repeat your project smoke check.
4. Record the working Git commit. Validate that commit in a shared workspace before moving to an exclusive GPU workspace.

The platform can reuse a prepared image when its cache inputs match. Changes to the Git commit or platform image dependencies may require a cold build. Allow time for that build and use [troubleshooting](/projects/gcg-cluster/docs/devcontainers-troubleshooting/) if the expected environment does not appear.
