---
draft: false
title: "VS Code Ramblings - 1"
date: 2021-08-31
tags:
    - VSCode
    - SSH
category: Ramblings
description: "Normally I just open a local folder in VSCode, but lately I've been developing on a remote server via a jump host during an internship. I ran into some quirks worth documenting."
---

Normally I just open a local folder in VSCode, but lately I've been developing on a remote server via a jump host during an internship. I ran into some quirks worth documenting.

<!--more-->

## vscode-server won't install properly

In enterprise networks, things are complicated with proxies and firewalls, so VSCode often struggles. When you first install the Remote-SSH extension to connect to a remote server, it automatically tries to install server-side components. But if the network hiccups, it might download a corrupted package while thinking it succeeded. Now your VSCode is in limbo—it thinks the server is ready, so it tries to connect, but the connection fails.

The symptom you'll see is VSCode repeatedly popping up a username/password dialog, over and over, never accepting your credentials.

To fix this, you need to manually deploy the server-side components to the correct folder. Usually this is at `~/.vscode-server/bin/`.

Use any SSH client to connect and check what's in there. You'll see a folder with a very long hash name—this is the commit ID. Save it as a variable called `commit_id`:

```
commit_id="<commit id>"
```

Next, download the vscode-server package for that commit ID and install it to that folder. Then reconnect.

```bash
cd ~/.vscode-server/bin/$commit_id
rm vscode-remote-lock.$USER.$commit_id vscode-server.tar.gz
wget -O vscode-server.tar.gz https://update.code.visualstudio.com/commit:$commit_id/server-linux-x64/stable
tar -xvf vscode-server.tar.gz 
mv ./vscode-server-linux-x64/* ./
rmdir ./vscode-server-linux-x64
```

Problem solved.

## How to connect through a jump host

VSCode reads your SSH config to find hosts, so first set up the jump host:

```
Host JumpServer
	HostName <ip-address>
	User <user>
	Port <port>
```

Here's the critical part: make sure you're using real OpenSSH. Many people set everything up correctly but still can't connect, usually because they're using Windows' default ssh, which is... let's just say it's not the real deal, despite calling itself OpenSSH.

To use the real OpenSSH, explicitly point to it in your ProxyCommand. It's usually already installed, but if not, follow [this guide](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse).

Then configure your target server with the ProxyCommand you can find anywhere online:

```
Host TargetServer
	HostName <ip-address>
	User <user>
	Port <port>
	ProxyCommand C:\Windows\System32\OpenSSH\ssh.exe -W %h:%p JumpServer
```

Done. You should be able to connect now.
