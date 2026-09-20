---
draft: false
title: "安装 FileAccess 并完成首次备份"
description: "从下载 APK、连接 SMB 共享到检查照片视频备份结果。"
project: fileaccess
section: guide
order: 10
updatedAt: 2026-09-20
---

## 准备手机与 NAS

需要 Android 15 或更新版本，以及手机可以访问的 SMB 共享。准备 NAS 主机地址、共享名、用户名和密码；上传与备份需要目标目录的写入权限。当前通过手动填写连接信息接入 NAS。

v0.1.0 属于开发预览，先用少量测试文件验证手机与 NAS 的组合，并保留重要文件的其他副本。项目当前主要在 Android 16 模拟器与隔离 SMB 环境验证。

## 安装应用

从 [GitHub Releases](https://github.com/charlieJ107/file-access-app-android/releases) 获取安装包及同版本的 `SHA256SUMS`。截至 2026-09-20，v0.1.0 页面提供 `fileaccess-1.apk`。按照 Android 安装界面为所用浏览器或文件管理器授予安装权限，再确认安装。

应用提供版本检查与更新包下载、校验功能，安装更新仍由系统界面确认。

## 添加 SMB 连接

1. 打开“空间 → 添加 SMB 连接”。
2. 填写主机、共享名和账号；主机字段填写主机名或地址，例如 `192.168.1.10`。
3. 按需填写端口、根目录和域。NAS 支持时，可以选择要求 SMB3 加密。
4. 测试并保存连接，打开一个测试目录，验证浏览、预览和小文件上传。

SMB 签名默认开启。若选择要求 SMB3 加密，需要服务器具备相应支持。凭据在设备上由 Android Keystore 加密保存。

## 创建备份规则

在 NAS 的目标目录中创建备份规则，选择相机照片视频，或通过系统目录选择器授权一个本机文件夹。按需要设置 Wi-Fi、计费网络和充电条件，再从“备份 → 立即备份”启动首次扫描。

相机备份只能访问系统已经授权的媒体；授予部分照片权限时，备份范围也限于这些照片。

## 检查传输与副本

在“传输”查看进度和失败原因。先确认任务成功，再到 NAS 检查文件是否可打开。较大的文件在复制后还需要校验，校验阶段同样属于任务的一部分。

后续扫描会增量处理文件。本机删除操作保留 NAS 副本；文件变化可以产生新的副本。自动备份受 Android 后台调度、网络与授权影响，执行时间可能延后。

当前版本支持 SMB 和单向备份。更多边界见[实现状态](https://github.com/charlieJ107/file-access-app-android/blob/master/docs/implementation-status.md)，恢复机制见[设计文章](/zh/blogs/fileaccess-reliable-nas-backup/)。
