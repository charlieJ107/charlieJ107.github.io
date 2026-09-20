---
draft: false
title: "开始使用 FlareDrive"
description: "登录、创建文件库，并完成一次上传和下载。"
project: flaredrive
section: guide
order: 10
updatedAt: 2026-09-20
version: "2026-09-20 · 2b4db7a"
---

## 登录与文件库

打开 [FlareDrive](https://flaredrive.zhuoling.space)，选择 Sign In，通过 [auth.zhuoling.space](https://auth.zhuoling.space) 登录。认证服务开放注册，注册后即可使用。

登录后进入文件界面。文件库（repository）可以理解为一块独立的盘，里面存放目录和文件。你可以创建多个文件库，分别组织不同用途的内容。

## 创建第一个文件库

在文件库列表选择 New repository，填写名称。第一次使用时，建议准备一个小测试文件，完成创建、上传和下载的流程。

创建加密文件库前，先到 Settings 设置并保存加密口令，再在创建窗口勾选 Enable end-to-end encryption。账号用于登录和访问授权，加密口令用于解锁文件库密钥。

请妥善保存加密口令。口令丢失后，服务端无法恢复加密文件。已有文件库仍需使用创建时对应的口令；修改 Settings 中保存的口令不会自动更新已有文件库的密钥。

## 上传与下载

打开文件库，进入目标目录，使用上传入口选择测试文件。在上传队列或传输中心查看进度，等待任务完成，并确认文件出现在目录列表中。

下载该文件，与本地原文件比较。下载加密文件时，浏览器需要使用对应口令解锁文件库密钥，并解密文件内容。

完成测试文件的上传和下载后，即可按相同流程管理其他文件。

## 遇到问题时

- 登录失败：检查 auth.zhuoling.space 账号的登录状态。
- 解密失败：确认当前使用的是目标文件库对应的加密口令。
- 上传失败：查看任务错误信息，检查目标目录和写入权限后重试。
- 共享文件的读取：确认账号拥有访问权限，并具备解密所需的密钥。

关于密钥与权限的工作方式，见[加密、权限与文件元数据](/zh/projects/flaredrive/docs/encryption-and-access/)。
