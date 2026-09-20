---
draft: false
title: "Dev Containers 3: diagnose startup and build problems"
description: "Distinguish connection, build, storage and GPU problems and collect useful support information."
project: gcg-cluster
section: guide
order: 40
updatedAt: 2026-09-20
---

Begin with the last successful step: repository access, image build, agent connection or application startup. That distinction helps you choose a useful check and gives administrators a clearer report.

## Locate the failure

| Symptom | First check | Next action |
| --- | --- | --- |
| Repository cannot be fetched | URL/ref and Git access | Verify that the pushed commit exists and your approved Git authentication can read it. |
| Build fails | First build error and `.devcontainer` path | Check referenced files, package versions and the image contract. |
| Terminal opens into a basic recovery image | Build logs | Repair the repository configuration, synchronise the checkout and rebuild. |
| Changes seem absent | Local Git status and commit | Follow the update sequence in [part 2](/projects/gcg-cluster/docs/devcontainers-customise/). |
| Agent remains Connecting or times out | Template, time and build state | Report to the administrator; an exclusive workspace may be waiting for admission. |
| Editor fails but terminal works | The application's startup log | Find its first error and confirm the image provides the required tools. |

Repeated Delete/Create attempts remove workspace storage and can lose a queue position. Preserve the workspace while diagnosing the problem.

## Inspect storage and identity

In a Dev Container terminal, run these read-only checks:

```bash
id
printf '%s\n' "$HOME"
df -h /workspaces /shared
git status --short
git rev-parse HEAD
```

Run the Git commands from the project checkout. The user needs UID/GID `1000:1000` and a writable HOME. Check which volume is full before removing any of your own disposable files. A directory existing at `/shared` is not by itself proof that shared storage is mounted; if the mount is missing, ask for help before writing important data.

## Check GPU and project tools

Run `nvidia-smi` to check GPU visibility, then a small GPU operation in your chosen framework. A visible GPU and an installed CUDA compiler are separate checks. If GPU visibility fails, send the error and time to the administrator. Driver installation is handled by the platform.

In an exclusive workspace, a connection timeout can mean queueing, image preparation or a fault. Administrators can inspect admission and build state. See [GPU use and queueing](/projects/gcg-cluster/docs/gpu-and-queueing/).

## Repair and verify

Correct configuration in Git, commit and push, then synchronise the workspace checkout before Update or Stop/Start. Read the new build log and rerun the starter's environment check and your project smoke check. A successful login to a recovery environment is a repair opportunity; confirm the intended image before resuming research work.

## Ask for support

Use the group's Teams channel. Include the workspace and template, time with timezone, Git commit if relevant, recent changes, first error and whether the terminal opens. Review logs and screenshots for credentials and private data before sharing. Send diagnostic details through the approved internal channel. [Access and support](/projects/gcg-cluster/docs/access-and-support/) explains where to find current notices.
