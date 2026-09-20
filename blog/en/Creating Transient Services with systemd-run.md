---
draft: false
title: "Creating Transient Services with systemd-run"
date: 2022-04-28 15:03:42
tags: 
  - Linux
category: Guides
description: "systemd-run lets you create temporary .service or .scope units under systemd, so processes started with systemd-run won't die when their parent process exits."
---

`systemd-run` lets you create temporary `.service` or `.scope` units under systemd, so processes started with systemd-run won't die when their parent process exits.

<!-- more-->

It's simple to use:

```bash
systemd-run <command>
```

If you need to run a command as a temporary service unit, you can use `systemd-run`. It will be managed by `systemd` just like a regular service unit and will show up in `systemctl list-units`. The command runs in a clean, isolated environment with `systemd` as its parent process.

Why would you want this? Here's an example: suppose you have a process that needs to be restarted by a bash script. The problem is, the process that launched the bash script might get killed, which would also kill the bash script and make it useless.

Another scenario (one I hit) is needing to launch a VirtualBox VM from a remote SSH session using VBoxManage. The VM process ends up under the SSH session. Once the SSH session dies, so does the VM. What you really want is for the VM to be under `systemd` so it survives the SSH disconnect.

```bash
systemd-run --unit="VBox" -r VBoxManage start some-vm
```
