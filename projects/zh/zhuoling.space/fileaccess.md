---
draft: false
title: FileAccess
hub: fileaccess
description: "面向个人 NAS 的 Android 原生文件客户端，提供 SMB 文件管理、媒体预览与照片视频增量备份。"
updatedAt: 2026-09-20
group: personal
url: https://github.com/charlieJ107/file-access-app-android
badges: [Android, SMB, MPL-2.0]
tags: [Android, Kotlin, NAS, Backup]
---

FileAccess 将个人 NAS 上的文件带到 Android 手机：浏览目录、预览媒体、上传下载，并将手机照片和视频备份到自己的存储空间。

## 当前可以做什么

- 保存和测试 SMB 连接，浏览、筛选和排序当前目录，批量选择文件。
- 新建目录、重命名、删除文件或空目录；使用系统文件选择器上传和下载。
- 在列表或自适应网格中查看缩略图，预览文本、图片、PDF，播放设备支持的音视频。
- 查看持久化传输队列，暂停、继续或取消任务；SMB 上传支持断点恢复与提交前完整校验。
- 为相机照片视频或授权文件夹设置增量备份，并按网络、充电条件执行。

备份采用单向保留副本的方式：本机删除文件后，NAS 上已经保存的副本继续保留。

## 面向原生 Android 的实现

界面使用 Kotlin、Jetpack Compose 和 Material 3。Room 保存传输任务；自动备份使用 WorkManager，用户主动发起的传输使用 Android 用户发起的数据传输任务。连接凭据由 Android Keystore 加密保护，SMB 签名默认开启，也可以要求 SMB3 加密。

## 下载与阶段

截至 2026-09-20，已发布 [v0.1.0 开发预览](https://github.com/charlieJ107/file-access-app-android/releases/tag/v0.1.0)，最低要求 Android 15，主要验证环境为 Android 16 模拟器。真实手机、NAS 与厂商后台调度仍需进一步验收。

当前协议为 SMB；WebDAV、S3、私有 API、双向同步和端到端加密属于后续方向。后台备份的执行时间受 Android 调度及授权条件影响。

项目源码采用 MPL-2.0 许可。访问 [GitHub 仓库](https://github.com/charlieJ107/file-access-app-android)，或从[安装与首次备份](/zh/projects/fileaccess/docs/getting-started/)开始。
