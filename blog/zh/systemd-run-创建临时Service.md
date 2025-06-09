---
title: systemd-run 创建临时Service
date: 2022-04-28 15:03:42
tags: 
  - Linux
category: 少说两句
description: systemd-run可以创建一个临时的.service或.scope服务，挂在systemd下，使得使用systemd-run运行的进程不受启动它的进程退出与否的影响。
---

`systemd-run`可以创建一个临时的`.service`或`.scope`服务，挂在`systemd`下，使得使用`systemd-run`运行的进程不受启动它的进程退出与否的影响。

<!-- more-->

用起来很简单：

```bash
systemd-run <command>
```

如果你需要将某个命令作为临时服务单元来运行，那么你可以使用`systemd-run`来运行它它将像普通的服务单元一样接受 `systemd `的管理， 并且与其他单元一样，也会在 `systemctl list-units `的输出中被显示出来。 该命令将会运行在一个干净的、独立的执行环境中，并以 `systemd` 进程作为其父进程。

这个东西为什么会想到要用它呢？举个例子，比如你的一个进程需要用一个bash脚本来启动重启这个进程的程序。注意，此时调用这个bash的进程会被kill掉，以至于，作为子进程的这个bash脚本的运行也会被kill掉。这就导致你的bash脚本失效。

另外一个场景（我遇到的）是，我需要从远程ssh会话中使用VBoxManage来启动一个Virtual Box虚拟机。而这个虚拟机的进程（竟然）是挂在这个ssh会话之下。一旦我的ssh会话挂掉，这个虚拟机就挂掉了。我是希望这个虚拟机启动起来是挂在`systemd`之下，这样就不会随着SSH退出而挂掉了。

```bash
systemd-run --unit="VBox" -r VBoxMannage start some-vm
```



