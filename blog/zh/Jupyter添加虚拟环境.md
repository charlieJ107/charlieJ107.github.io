---
title: Jupyter添加虚拟环境
category: 少说两句
date: 2022-04-09 17:53:23
tags:
    - Python
    - Jupyter
description: 如果你也有一个Jupyter Lab, 你应该会想要跟我一样在Lab里用不同的虚拟环境解决不同的问题. 这篇文章记录在Jupyter Lab里添加虚拟环境作为Kernel的方法. 
---

如果你也有一个Jupyter Lab, 你应该会想要跟我一样在Lab里用不同的虚拟环境解决不同的问题. 这篇文章记录在Jupyter Lab里添加虚拟环境作为Kernel的方法. 

<!---more-->

首先你需要创建一个虚拟环境, 既然你有Jupyter Lab了, 想必开个Terminal搞个虚拟环境应该不难. 

然后激活这个虚拟环境, 在这个环境中安装`ipykernel`和`ipython`. 事实上安装`ipykernel`就够了. 

```bash
pip install ipykernel
```

然后在这个虚拟环境里, 把kernel安装到user home下的 Jupyter 配置文件. 注意, 此时一定要加`--user`参数. 

```bash
ipython kernel install --user --name <kernel_name> 
```

如果告诉你安装成功就完事了. 
