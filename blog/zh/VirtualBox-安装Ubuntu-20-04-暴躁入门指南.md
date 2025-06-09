---
title: VirtualBox 安装Ubuntu 20.04 暴躁入门指南
date: 2021-07-20 21:47:37
category: 少说两句
tags: 
    - Linux
    - Ubuntu
    - VirtualBox
description: 这是一篇有关如何使用VirtualBox安装Ubuntu 20.04虚拟机的快速入门指南
---
> 这是一篇有关如何使用VirtualBox安装Ubuntu 20.04虚拟机的快速入门指南
> 主要包含的内容包括一些计算机/虚拟机常识的普及, 以及如何用VirtualBox安装一个Ubuntu 20.04的虚拟机
> 由于写的比较仓促, 内容看起来比较暴躁, 所以叫暴躁入门指南
> 希望能够有所帮助

## 虚拟机Overview
先看电脑的架构，因为图是繁体的，有些东西跟我们的叫法不一样，核心就是系统内核（Kernel），系统呼叫就是系统调用（System call），作业系统就是操作系统（Operating System）
 ![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192241.png)
虚拟机的两个基本概念，主机（Host）是你正在用的主要操作系统，和客户机（Guest）也就是你虚拟机里装的操作系统。
目前市面上常见的虚拟机有两种，第一种 (type 1) 是跑在System Call这一层，就是Kernel上，虚拟机先放了一层Kernel, 然后在Kernel上跑管理程序 (主机Host) 和 虚拟机(客户机Guest). 主流常见的有Windows上的Hyper-V，Linux上的KVM，VMWare的Sphere（一款服务器用的操作系统）.此时主机和客户机是平级的，共同跑在Kernel上。

第二种 (type 2) 是在应用程序层，也就是在操作系统上作为一个普通的应用程序去跑，常见的有VirtualBox，VMWare Workstation。此时Guest在Host上，是Host上的一个应用程序。

如果你使用第一种虚拟机，会导致系统上所有依赖于第二种虚拟化技术的软件用不了，比如各种安卓模拟器，一些安全软件的安全沙箱功能等等。但第一种虚拟机运行效率更高。

考虑到咱们只是为了学习，所以我们选一个免费，开源，并且在Windows上比较好用的第二种虚拟机，也就是VirtualBox

官网: www.virtualbox.org
但是由于一些众所周知的原因, 很多国外的软件下载起来都比较痛苦. 不一定是需要使用魔法, 有可能只是来回路线不太顺畅. 这时候我们需要用一些其他的手段. 在国内有一些大公司他们的做法是, 把一些常用的软件定期下载到部署在国内的服务器上制作成镜像(Mirrors), 然后你作为用户从这些从Mirrors上下载就会快很多. 把这个下载地址从原网站换成Mirrors的过程我们叫做换源, 因为你要换一个下载的源头嘛. 
国内常见的软件源包括以下几个, 你开心用哪个都行
清华源: mirrors.tuna.tsinghua.edu.cn 清华TUNA协会学生运营的源, 技术相当不错, 速度也OK
阿里云的源: mirrors.aliyun.com
腾讯云的源: mirrors.cloud.tencent.com
我个人比较喜欢用腾讯云的源, 主要是因为腾讯云的源齐全一些, 该有的都有. (其实并没有清华源齐全, 但清华源用的人多了容易给服务器造成负担, 想到大家都是同行就别为难自己人了, 薅大公司的羊毛也算是给无产阶级做贡献了不是?) 
厦大原先也有自己的软件源, 后来年久失修, 也没人维护, 就凉了. 希望后辈们有能力的话能重振雄风.:smiley:  

如果你要去腾讯云下载Virtualbox, 直接进他的相应的目录, 找最新的版本即可. 我写这篇文章的时候最新的版本是6.1.18, 你们不要偷懒直接复制粘贴下面的地址, 可以自己动动脑子换一下版本号, 东西都是差不多的. 
主程序：https://mirrors.cloud.tencent.com/virtualbox/6.1.18/VirtualBox-6.1.18-142142-Win.exe
扩展包: 这个东西的功能是让你能够直接从主机复制粘贴到虚拟机里, 以及给虚拟机提供USB3.0的支持. 所以还是有必要的, 下载地址就在主程序隔壁. 
https://mirrors.cloud.tencent.com/virtualbox/6.1.18/Oracle_VM_VirtualBox_Extension_Pack-6.1.18-142142.vbox-extpack


下载后，一路next**先安装主程序**即可.
然后你会看到你的那个扩展包图标变成了绿色方块,直接双击安装..
安装扩展包的时候,要把那个许可协议拉到最底下才能安装.

装好之后大概长这样, 你安装完之后跟我图片里一定会有区别, 包括但不限于我的是英文版(你可以调), 以及我之前装过一些虚拟机而你一个都没有. 不要因为这个地方不一样了就不懂怎么回事了, 要学会举一反三. 
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192266.png)
然后，做一点小小的设置：
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192268.png)
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192269.png)
这个地方改成一个你空间比较大，硬盘读写比较快的地方。如果你C盘够大，最好是在C盘某处。这个地方保存了你虚拟机的文件和虚拟硬盘，在虚拟机运行的时候会频繁读写，如果这个地方读写慢，会导致你的虚拟机非常卡，所以不要放在U盘/SD卡/机械硬盘之类的地方
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192273.png)
这个选一个你电脑键盘上有但是你又不常按到的一个键。之所以说要改掉这个地方，是因为有些笔记本电脑键盘上是没有右边的ctrl的（比如我的电脑），所以得换成一个你有的键。
到这儿基本够了

然后我们来创建虚拟机
首先我们准备一个虚拟机用的系统镜像，Ubuntu是Linux的一个发行版。
这里解释一下发行版的概念。首先，Linux不是一个操作系统，而是一个操作系统内核（Kernel），然后不同的厂商可以在这个内核基础上定制内核之上的系统调用（System Call），形成不同的发行版。 常见的Linux发行版有Ubuntu, Debian, CentOS, RHEL(RedHat Enterprise Linux)等等.
国内的话比较常用的是CentOS, 你在网上搜到的绝大部分CSDN的东西都是CentOS的. 但后来CentOS凉了(其实也不是凉了, 这个事情后面可以慢慢说, 简单说来就是原先比较稳定省钱大家都愿意用, 后来官方把它当作实验平台了很多新功能会加上去, 这对于追求稳定性不追求新功能的企业生产环境来说是不喜欢的, 所以大家就不用了) 所以你需要很仔细地留意CentOS和Ubuntu之间的各种差别, 不要拿着Ubuntu问我为什么`yum install`这种命令跑不起来, 也不要问我为什么不加`sudo`会permission deny, 因为CentOS默认是root用户, Ubuntu为了安全把Root用户禁用掉了. 具体的后面会讲. 总之, 上百度搜是好事, 但看答案要带脑子. 

对于Ubuntu，其每年发行两个大版本，其中每两年发行一个LTS (Long Term Support，长期支持)版本，长期支持版本会在更长的时间周期内提供安全修复和功能更新的补丁。我刚才说过, 公司之类的生产环境其实追求的是稳定, 这也是为什么你到了公司会很神奇地发现很多公司还在用几十年前的技术, 因为"又不是不能用, 换新的出问题了你负责嘛?"

我们现在下载的是Ubuntu最新的LTS版本，Ubuntu 20.04版本，2020年4月发行。其分为服务器版本和桌面版本，服务器版本针对服务器场景强化了开机自检等流程，且不会提供图形化的桌面界面。所以我们使用桌面版本, 提供了图形界面。

装系统都要有一个安装介质的, 把系统拷贝到你的电脑(也可能是虚拟出来的电脑)上, 顺便做一些其他工作, 基本配置啊, 格式化硬盘啊啥的. 这个安装介质通常是`.iso`文件. ISO文件原本的意思是光盘镜像, 就是那种CD光盘, 把它拷贝出来, 就是一个ISO文件. 你要往虚拟机里装系统, 需要这样一个ISO文件. 你可以去[官网](https://ubuntu.com)上下载, 但我这儿直接给镜像下载链接了. 
下载地址：https://mirrors.cloud.tencent.com/ubuntu-releases/20.04.2/ubuntu-20.04.2.0-desktop-amd64.iso

## 创建虚拟机
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192297.png)
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192298.png)
取个名字，选一下类型和版本，以及你要把这个虚拟机放在哪里，默认是我们刚才配置好的那个位置，然后Next

![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192300.png)
设置虚拟机的内存，通常2G（2045MB）足够Linux跑常见任务了。如果你电脑内存够大（8G以上），可以调整到4G（4096MB）
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192302.png)
选择创建新硬盘，除非你有现有的虚拟硬盘使用。

![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192303.png)

如果你不需要与其他虚拟机软件共享虚拟硬盘，也不用把虚拟硬盘挂载你的Host上，就使用VirtualBox默认的格式VDI，否则，如果你知道你在做什么，可以选择自己想要的格式。
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192305.png)
动态分配意味着“用多少，硬盘就开多大“，边用边开，如果是Fixed size，就预先分配这么大，直接占用那么大的硬盘空间。预分配的好处则是在读写性能上略胜一筹，但对我们现在的工作意义不大，所以选择动态分配。
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192307.png)
50 G就可以了，如果你之前跟我一样选的是VDI硬盘，不够后面还可以再加
然后点Create，到这儿就创建好了，可以在界面左边看到
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192310.png)
其实你可以看出来Linux对资源的要求是非常小的, 你应该很长时间没有见过能够在2G内存1核CPU50G硬盘的电脑上流畅运行的操作系统了, 但Linux可以. 
## 做一些调整
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192311.png)
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192313.png)
这两个都选双向，这样可以在Host复制，Guest里粘贴
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192316.png)
把EFI勾选起来
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192318.png)
把处理器调成跟你的电脑处理器一样，我的电脑是4核的，所以调成4.如果你不知道你电脑处理器有几个核心，可以打开任务管理器（开始菜单按钮上右键-任务管理器）
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192321.png)
下面那两个复选框是嵌套虚拟化相关的, 勾上你可以在虚拟机里再开个虚拟机, 但我们这里禁止套娃, 因为慢, 且没必要
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192322.png)
在显示这里，勾选3D加速，并把显存拉满
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192325.png)
差不多了，点下面的OK就行
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192326.png)
点一下这里，然后从这里选出你刚才下载的那个Ubuntu 20.04的iso镜像
 ![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192328.png)
然后就可以点“开始”了。

## 现在开始装系统
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192329.png)
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192338.png)
这一步一行行解释一下满足一些朋友的好奇心
第一个是正常标准没毛病的安装Ubuntu
第二个是以一个比较安全的图形界面来执行第一步, 之所以说比较安全, 是因为第二个在执行的时候图形界面会稍微收敛一点, 牺牲一些性能什么的换取一个比较好的兼容性, 防止在一些奇奇怪怪的设备上出现图形界面跑到一半崩掉的情况
第三个是OEM安装, 如果你是一个电脑制造商,你要给你卖的电脑装系统, 然后装完系统之后要把电脑卖给你真正的用户, 你真正的用户虽然不用自己装系统, 但需要一个激活的过程. 那你作为电脑制造商肯定要把这个激活的过程i路给客户, 所以就走这个模式
第四个是不安装, 从下一个磁盘启动
第五个是UEFI设置, 这个以后会专门说

这一步选第一个就行

![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192349.png)
第一步会让你选语言，这里强烈建议选英文，强烈建议选英文，强烈建议选英文！！！
因为Linux系统绝大部分的设计都是契合着英文的输入和使用方式，如果系统用中文，很多操作会面临奇奇怪怪的问题。
这里选择安装Install Ubuntu
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192350.png)
键盘布局也选择英语-美国，点继续
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192351.png)
这个勾选可以去掉，因为在默认情况下，Ubuntu, 包括Ubuntu的安装程序，下载软件都是从Ubuntu 的官方仓库（http://archive.ubuntu.com）去下载。但由于官方仓库的服务器在国外，国内访问的话非常慢。所以我们先继续，等我们装好系统之后，我们再把软件的安装源换成国内镜像就好。
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192353.png)
除非你知道自己在干什么, 否则这一步选择默认
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192355.png)
这一步是告诉你要格式化硬盘（虚拟的硬盘），然后给你装系统，让你确认一下，点继续就可以
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192356.png)
选个时区
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192359.png)
这一步要填的东西比较多，一个个来
Your Name，你的名字，显示在各个出现你账户名字的场合，类似你的Q名之类的昵称
Computer’s name，选一个简短的，可以代表你的这台虚拟机设备的名字，有时候从别的地方连接这个虚拟机，就要用这个名字
Username， 你的用户名，也是简短的，一个单词就好
Password输入两次，最好容易记而且很容易输入。因为这个密码以后会经常用，所以最好是比较容易输入那种。
输入两次确认，点继续，等，等它装好之后会提示你重启虚拟机，跟着它提示重启就好。
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192361.png)
装好之后大概长这样。

## 换国内软件源
如我们之前所言，把软件的安装源换成国内镜像。首先从开始菜单里找到Terminal（终端），或者直接在桌面按ctrl+alt+T就可以打开终端
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192363.png)
打开之后大概长这样
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192364.png)
首先看到你的电脑名和用户名
工作目录是`~`，表示你的家目录（home)
这里说一下Linux的用户系统
早些年电脑还没那么普及的时候，并不是像现在这样人人都有电脑。有时候一个实验室只有一台电脑，大家都要用，所以就有了不同用户。不同用户在电脑上相对隔离，有自己的空间，也有自己的权限。你不能访问你没有权限访问的东西。
除了用户，还有用户组，比如这一组人都有权限访问这个文件，但其他人又不行，所以就搞了个用户组
此外还有一个超级用户，在这个电脑里无所不能为所欲为，可以随意查看任何文件，也可以添加、删除用户，修改其他用户的密码。
之前说过, 这个超级用户其实就是root, 它是电脑里的天神, 权力很大也很危险, 如果坏人拿到这个账户你电脑就凉了. 所以Ubuntu默认禁用了这个用户. 当你需要这个用户的权限的时候, 就需要在命令前面加一个`sudo`
比如你需要修改的软件源列表是个很重要的东西, 一般只有root用户才能修改(谁都能决定你从哪里下载软件挺可怕的不是吗), 所以你需要用一个sudo权限, 打开gedit这个编辑器(类似记事本)来打开软件源列表, 在/etc/apt/这个目录下, 名字叫sources.list. 所以你的命令就是
```bash
sudo gedit /etc/apt/sources.list
```
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192369.png)
![图片](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Blog/20220401215906-24192375.png)
看到这个东西，然后在这个文件里，把所有的.http://xxxx.ubuntu.com换成https://mirrors.cloud.tencent.com，然后保存，退出

在刚才的终端里，执行
sudo apt update
这个命令，软件源更新完成。