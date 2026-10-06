---
draft: false
title: 下载配置脚本
description: 为 Linux、macOS 和 Windows 上的 Codex 或 Claude Code 创建 Sub2API 启动入口。
project: sub2api
section: guide
order: 70
updatedAt: 2026-09-30
version: "1.0.0"
---

## 下载

| 平台 | 配置脚本 | 校验文件 |
| --- | --- | --- |
| Linux / macOS（Bash） | [setup-sub2api.sh](../../../../downloads/sub2api/setup-sub2api.sh) | [SHA-256](../../../../downloads/sub2api/setup-sub2api.sh.sha256) |
| Windows PowerShell | [setup-sub2api.ps1](../../../../downloads/sub2api/setup-sub2api.ps1) | [SHA-256](../../../../downloads/sub2api/setup-sub2api.ps1.sha256) |

脚本以文本源码提供，可以先在编辑器中查看。下载脚本和对应校验文件到同一目录。需要 [Node.js 22 或更新版本](https://nodejs.org/)，以及已安装的 `codex` 或 `claude` 命令。Windows 支持 PowerShell 5.1 及更新版本；Linux/macOS 使用 Bash 执行。

## 运行脚本

Linux / macOS 在下载目录打开终端。先核对 SHA-256，再运行脚本：

```bash
# Linux
sha256sum -c setup-sub2api.sh.sha256
# macOS
shasum -a 256 -c setup-sub2api.sh.sha256

bash ./setup-sub2api.sh
```

Windows 在下载目录打开 PowerShell：

```powershell
$expected = ((Get-Content .\setup-sub2api.ps1.sha256 -Raw).Trim() -split '\s+')[0]
$actual = (Get-FileHash .\setup-sub2api.ps1 -Algorithm SHA256).Hash
if ($actual -ne $expected) { throw 'SHA-256 校验不一致，请重新下载。' }
Unblock-File -LiteralPath .\setup-sub2api.ps1
.\setup-sub2api.ps1
```

若本机执行策略仍禁止运行已核对的下载脚本，可在单独进程中运行 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\setup-sub2api.ps1`。这仅影响该进程；组织管理的策略仍需遵循设备管理要求。

依次选择 `codex` 或 `claude`，确认 Base URL，隐藏输入 API Key，并从模型列表中选择模型。也可手动填写完整模型 ID。脚本不会替你注册账号，运行前先完成 [OIDC 登录与 Key 创建](/zh/projects/sub2api/docs/account/)。

## 文件保存与启动

默认目录为 `~/.config/sub2api/`，Windows 对应 `$HOME\.config\sub2api\`。目录内包含客户端配置 JSON、启动脚本，以及重新配置时生成的上次配置备份。

配置文件和启动脚本中保存 API Key 明文；Unix 设置目录权限为 `700`、配置文件为 `600`，Windows 限制目录访问权限。备份同样含凭据，不应上传或分享该目录。

运行完毕后，在工作项目目录中执行生成的入口：

```bash
bash "$HOME/.config/sub2api/codex-sub2api.sh"
# 或
bash "$HOME/.config/sub2api/claude-sub2api.sh"
```

```powershell
& "$HOME\.config\sub2api\codex-sub2api.ps1"
# 或
& "$HOME\.config\sub2api\claude-sub2api.ps1"
```

入口会传递你追加的客户端参数。现有 Codex/Claude 配置继续由客户端加载；入口为这次启动设置 Sub2API 参数。Claude 项目或用户设置中若另有 `env` 或认证 helper，需要检查实际请求是否进入 Sub2API。

## 预览、重新配置和恢复

预览仅展示配置目标，不索取 Key，不写文件，也不请求模型接口：

```bash
bash ./setup-sub2api.sh --client codex --model YOUR_MODEL_ID --dry-run
```

```powershell
.\setup-sub2api.ps1 --client codex --model YOUR_MODEL_ID --dry-run
```

再次运行脚本即可更新对应客户端配置。参数和凭据相同时保留现有备份；配置变化时保存修改前的版本。恢复最近一次备份：

```bash
bash ./setup-sub2api.sh --client codex --restore
```

```powershell
.\setup-sub2api.ps1 --client codex --restore
```

恢复 Claude Code 时将 `codex` 改为 `claude`。首次配置没有备份时无法恢复；直接使用原来的客户端命令即可使用原有设置。

## 可选请求验证

默认仅请求模型列表。加上 `--test` 会在保存后发送一个简短推理请求，可能产生 API 用量：

```bash
bash ./setup-sub2api.sh --client codex --test
```

```powershell
.\setup-sub2api.ps1 --client claude --test
```

看到推理响应成功提示后，仍应在实际客户端验证一次，并核对服务用量。若网关不支持模型发现，可加 `--no-model-fetch` 并指定 `--model YOUR_MODEL_ID`。全部选项可通过 `--help` 查看。

Claude Desktop 使用图形界面的[第三方推理配置](/zh/projects/sub2api/docs/claude-desktop/)，本脚本配置两个 CLI。
