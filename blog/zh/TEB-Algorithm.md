---
title: TEB 算法
category: 学了就忘
date: 2021-10-16 20:49:40
tags:
  - algorithm
  - SLAM
description: b站视频：https://www.bilibili.com/video/BV1bQ4y1d7TW?share_source=copy_web
---

b站视频：https://www.bilibili.com/video/BV1bQ4y1d7TW?share_source=copy_web

<!-- more -->

TEB算法全程为Time Elastic Band（时间弹性带) 是一个局部规划器算法，局部规划器是在全局规划的指导下，观察局部的几个步骤实现逐渐向全局目标靠拢，就像比赛赛题是我们所要解决的总问题，而每一周的迭代就是部分目标，每一次迭代的完成，都是在向最终比赛赛题靠拢，全局路径计算出后，某些情况下是不可执行的，例如，它可能从一个狭窄的空间穿过，而现实中，小车无法通过。

有**另一种局部规划算法DWA**，通过模拟速度和角速度，计算出一段时间后的可能轨迹，（在牛顿定律的加持下，给定速度和角速度，容易计算出之后的运动轨迹），假设这段时间足够小，我们可以认为在这段时间内，小车做匀速直线运动，就可以算出该段时间后小车所在点与当前位置连接的小线段的组合就组合出了轨迹，将所有可能的速度和角速度组合在若干段小时间后的轨迹都计算出来（组合一定是有限的，因为小车是物理实体，不可能按照离谱的角速度与速度运行），通过评估函数（各种因素的带权归一求和），评估一个最佳路径，选择它，向下位机下发指令，车就进行移动了。

![c05ee293-94ba-4c53-b738-3d090926e2c6](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/c05ee293-94ba-4c53-b738-3d090926e2c6.jpg)



TEB算法是从橡皮筋上获得的灵感。橡皮筋受到“外力”会产生变形，就像我们的小车遇到障碍的时候，障碍就会作为一种“外力”使他远离，因此，通过对路径的一部分（注意，不是全局路径，局部规划器只管一部分）对各种约束进行计算不断修正，得到执行路径并下发，这就是TEB算法的思想。

TEB算法按**等时间间隔（TEB中的T，也称为时间分辨率）**在全局路径上取点，作为机器人的控制点（姿态），两个点的运动时间为T，控制点可以移动，使得局部路径可以变形， 在时间取得足够短的前提下，将每一小段路径视作直线，于是我们可以通过两控制点间的距离，除以时间，求出小车速度，再对小车速度求导求出加速度，同样的对于角速度角加速度也可以采用相同的处理方式，于是在每一个控制点的机器人姿态信息都可以求出。

那么约束有哪些呢？

1. 小车不能碰撞障碍物，小车与障碍物的距离就是一个约束，通过几何关系，可以设置出小车与障碍物的距离，倘若控制点小于该距离，控制点就应该被障碍物“推开”。

![0bc034b9-e7c6-44e7-8afe-4c301c77f9d5](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/0bc034b9-e7c6-44e7-8afe-4c301c77f9d5.jpg)

1. 相邻若干个控制点之间，存在运动学约束，不能因为某一个控制点推开后，路径发生跳变，即相邻控制点必须发生改变
   $$
   v_{\min}\leq f_v(B) \leq v_\max \\
   a_\min \leq f_a(B) \leq a_\max
   $$

2. 小车的行驶必须在全局路径的指导下，即，小车的行驶不能偏离全局路径太远，全局路径存在“把它拉回来”的作用。

3. 运动学限制，尽可能使小车运动平滑。

4. 最快路径约束，目标函数应该使得小车能获得最快路径，各控制点在时间上均匀分开（各个段相同时间运动的距离差不多)，不能一脚刹车一脚油门。

以上各种约束的综合评估下，目标得到一条能避障、符合运动学原理、在全局路径指导下的平滑的弹性带路径。

TEB使用开源框架“g2o”优化。

ROS自带TEB功能包的工作流程：

**全局路径 --> 加入约束 --> g2o优化 --> 下发指令**

已安装ros的同学可以执行teb功能包提供的测试样例：

```shell
roslaunch teb_local_planner test_optim_node.launch
```

TEB功能包具体参数：

![e1ecae32-3cfc-482c-a0a3-6b8d9c064ae1](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/e1ecae32-3cfc-482c-a0a3-6b8d9c064ae1.jpg)

![26146097-15b3-47c8-a7d5-00b85a2cfb03](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/26146097-15b3-47c8-a7d5-00b85a2cfb03.jpg)

![4207c61c-556d-414e-be57-3f208b860f1c](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/4207c61c-556d-414e-be57-3f208b860f1c.jpg)

```shell
rosrun rqt_reconfigure rqt_reconfigure
```

一个调参工具

