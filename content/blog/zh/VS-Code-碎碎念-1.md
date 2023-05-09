---
title: VS Code 碎碎念 - 1
date: 2021-08-31
tags:
    - VSCode
    - SSH
category: 碎碎念
description: 平时自己用VSCode的时候都是在本地随手打开一个文件夹. 最近实习要架着跳板机到远程服务器做开发, 遇到了一些小问题, 这里稍微记录一下. 
---

平时自己用VSCode的时候都是在本地随手打开一个文件夹. 最近实习要架着跳板机到远程服务器做开发, 遇到了一些小问题, 这里稍微记录一下. 

<!--more-->

## vscode-server无法正常安装

企业环境下的网络比较特殊, 又是代理又是防火墙的, 所以vscode往往会有点水土不服. 以往首次用VSCode安装remote-ssh插件去连接远程服务器的时候, 会自动在远程服务器上安装它的server side的一些东西. 但由于网络问题, 它的下载步骤启动了, 下载了个坏的包, 但是它又以为你下载了. 这个时候你的VSCode就处在装好和没装好的中间态, 它以为你装好了, 所以开始往上连, 但是连又连不上. 

这个时候你的VSCode常见的症状是, 弹出用户名和密码的输入框, 你输入之后, 再弹一遍, 不停地弹密码输入框. 

要解决这个问题, 就需要手动把它的server-side部署到它的文件夹. 通常来说, 这个文件夹在`~/.vscode-server/bin/`下面. 

你如果手动通过其他渠道(比如一个正常的ssh客户端)连上去看看, 可以看到里面有一个很长的hash值指代的文件夹, 这个hash值姑且先存下来, 保存成变量`commit_id`

```
commit_id="<commit id>"
```

接下来的事情很简单, 我们先下载它这个commit_id对应版本的vscode server side 包, 然后再安装到它这个文件夹里, 重新连接就可以了. 

```bash
cd ~/.vscode-server/bin/$commit_id
rm vscode-remote-lock.$USER.$commit_id vscode-server.tar.gz
wget -O vscode-server.tar.gz https://update.code.visualstudio.com/commit:$commit_id/server-linux-x64/stable
tar -xvf vscode-server.tar.gz 
mv ./vscode-server-linux-x64/* ./
rmdir ./vscode-server-linux-x64
```

至此, 问题解决

## 如何架着跳板机连接远程服务器

你应该知道VSCode在用ssh连接的时候, 是读取你ssh config里存的host. 所以, 你需要先给跳板机设一个host. 

```
Host JumpServer
	HostName <ip-address>
	User <user>
	Port <port>
```

接下来这个步骤非常重要, 你需要保证你的电脑上用的是OpenSSH. 很多人配置对了但是连不上, 通常的原因都是因为他们用的是Windows默认的ssh. Emmm怎么说呢, 虽然它也号称是openssh, 但....我只能说这是个假的OpenSSH. 

如果你想用上真的OpenSSH, 请你再你的ProxyCommand中明确标注出, 你要用真正的OpenSSH. 通常应该是装好了的. 如果没有, 请按照这个文档装一下

:point_right:https://docs.microsoft.com/zh-cn/windows-server/administration/openssh/openssh_install_firstuse

然后就配好你的目标机器, 以及你随时可以在网上其他地方搜到的ProxyCommand, 就可以正常连上了

```
Host TargetServer
	HostName <ip-address>
	User <user>
	Port <port>
	ProxyCommand C:\Windows\System32\OpenSSH\ssh.exe -W %h:%p JumpServer
```

搞定了, 大概率你就能连上了. 
