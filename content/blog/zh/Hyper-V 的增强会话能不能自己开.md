---
title: 'Hyper-V 的增强会话能不能自己开?'
date: 2020-05-16
category: 少说两句
tags: 
    - Windows
    - Hyper-V
    - Virtualizations
    - Linux
    - Ubuntu
description: 可以
---
可以
<!--more-->

### 啥?

微软买系统送了一个虚拟机平台叫Hyper-V, 其实这个东西跑起来性能比VirtualBox 啥的快, 还有docker支持. 但是问题在于, 很多必要的功能, 比如共享剪贴板, USB设备, 都需要Hyper-V的增强回话模式才能用. 

其实用过之后你会发现, 这个增强会话模式其实就是用远程桌面的方式连接到虚拟机. 也就是要用到RDP协议来连接. 这对于Windows虚拟机当然是很香的, 但是对于Linux就很痛苦. 

微软在Hyper-V管理器的"快速创建"这个栏目中是给了一些常用的镜像, 比如Ubuntu 18.04的镜像, 帮你配好了xrdp, 可以用来跟Linux进行RDP协议的链接. 人家给你配好了, 你直接用就可以了. 

当然也不是没有别的问题. 下载太慢了. 而且是预配好的, 你自己可以定制的东西不多. 所以我自己研究了一下, 其实你自己装的ubuntu系统, 也是可以配置的, 而且人家微软也帮你写好了脚本, 就是有些地方跑起来不太灵光, 得自己弄一下就好了. 

### 搞! 

首先找到微软这个VM-tool的git仓库, 里面有我们想要的配置脚本. 在[这儿](https://github.com/microsoft/linux-vm-tools).

我们现在假定你装好了Ubuntu, 1804版本, 注意不管是18.04.2, 18.04.3, 18.04.4他们都不一样, 只不过大概可以通用. 其实后面的版本也差不多, 因为桌面环境没什么太大变化. 唯独就是16.04和18.04的桌面环境换了, 所以会有所区别. 

现在你可以用你熟悉的git把它的脚本clone下来

```bash
git clone https://github.com/microsoft/linux-vm-tools
```

然后就是跑一遍`linux-vm-tools/18.04/instal.sh`这个脚本, 跑之前记得先给它加个运行的权限: 

```bash
sudo chmod +x ./install.sh
sudo ./install.sh
```

这时候微软已经觉得OK了, 但其实还不行, 你看到它让你先重启一轮, 你就先重启

```bash
reboot
```

然后再跑一次

```bash
sudo ./install.sh
```

然后再关机

```bash
shutdown now
```

现在你可以用powershell设定一下给这个虚拟机用上增强会话的RDP协议了: 

用Powershell(管理员)跑一下:

```powershell
Set-VM -VMName '你的虚拟机名称' -EnhancedSessionTransportType HvSocket
#设置完成之后可以通过以下命令查看是否设置成功
(Get-VM -VMName '你的虚拟机名称').EnhancedSessionTransportType
```

这个时候, 按道理你可以用上增强会话了, 但其实还不行, 根据[这篇文章](http://c-nergy.be/blog/?p=13390), 你还是会遇到登录不了的问题. 

这个时候你需要这样: 

先装一个依赖: 

```bash
sudo apt-get install xserver-xorg-core
```

再补上这个依赖挤掉的一些包, 因为据说这个依赖安装上去的时候会导致有些包被挤掉, 然后会导致鼠标用不了, 然鹅我并没有遇到这个问题, 还是装上吧. 

```bash
sudo apt-get -y install xserver-xorg-input-all
```

安装缺少的依赖项之后，需要手动安装xorgxrdp软件包以恢复xRDP功能 

```bash
apt-get install xorgxrdp
```

现在你终于可以愉快地用增强会话来连接了. 