---
draft: false
title: 配置 Claude Code CLI
description: 使用 Anthropic 协议连接 Sub2API，配置网关凭据与模型。
project: sub2api
section: guide
order: 50
updatedAt: 2026-09-30
---

## 准备

按照 [Claude Code 官方安装说明](https://code.claude.com/docs/en/setup)安装客户端，确认 `claude --version` 可用。通过 [Zhuoling.Space 统一登录](/zh/projects/sub2api/docs/account/)进入 Sub2API，创建具有所需模型权限的 API Key。

## 使用配置脚本

下载并运行[配置脚本](/zh/projects/sub2api/docs/downloads/)，选择 `claude`。默认 Base URL 为 `https://sub2api.zhuoling.space`；输入 Key 后，从 API 返回的模型列表选择模型，或填写控制台中的完整模型 ID。

在项目目录中运行生成的入口：

```bash
bash "$HOME/.config/sub2api/claude-sub2api.sh"
```

```powershell
& "$HOME\.config\sub2api\claude-sub2api.ps1"
```

启动入口为该进程设置网关地址和认证令牌，并将默认 Opus、Sonnet、Haiku 与子任务模型映射到所选模型。这样首次配置只需要一个已获授权的模型 ID；需要不同模型档位时可按手动方式分别配置。

## 手动配置

在专用于 Sub2API 的终端会话中设置环境变量。先将 `YOUR_MODEL_ID` 替换为当前 Key 支持的模型 ID。

```bash
# 使用 Bash；Key 隐藏输入。
read -rsp 'Sub2API API Key: ' ANTHROPIC_AUTH_TOKEN; printf '\n'
export ANTHROPIC_AUTH_TOKEN
export ANTHROPIC_BASE_URL='https://sub2api.zhuoling.space'
export ANTHROPIC_MODEL='YOUR_MODEL_ID'
unset ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN
unset CLAUDE_CODE_USE_BEDROCK CLAUDE_CODE_USE_VERTEX CLAUDE_CODE_USE_FOUNDRY
claude --model "$ANTHROPIC_MODEL"
unset ANTHROPIC_AUTH_TOKEN
```

```powershell
$secureKey = Read-Host 'Sub2API API Key' -AsSecureString
$env:ANTHROPIC_AUTH_TOKEN = [Net.NetworkCredential]::new('', $secureKey).Password
$env:ANTHROPIC_BASE_URL = 'https://sub2api.zhuoling.space'
$env:ANTHROPIC_MODEL = 'YOUR_MODEL_ID'
'ANTHROPIC_API_KEY','CLAUDE_CODE_OAUTH_TOKEN','CLAUDE_CODE_USE_BEDROCK','CLAUDE_CODE_USE_VERTEX','CLAUDE_CODE_USE_FOUNDRY' |
  ForEach-Object { Remove-Item "Env:$_" -ErrorAction SilentlyContinue }
try { claude --model $env:ANTHROPIC_MODEL }
finally { Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue }
```

按需设置 `ANTHROPIC_DEFAULT_OPUS_MODEL`、`ANTHROPIC_DEFAULT_SONNET_MODEL`、`ANTHROPIC_DEFAULT_HAIKU_MODEL` 和 `CLAUDE_CODE_SUBAGENT_MODEL`。各值必须对应当前分组可用的模型。

Claude Code 需要同时配置网关地址与凭据。已有登录状态、环境变量或项目设置可能影响最终认证方式，参考[官方 LLM Gateway 说明](https://code.claude.com/docs/en/llm-gateway)。

## 验证与恢复

发送一个简短问题，检查 Sub2API 控制台中是否出现对应请求。再在测试项目中确认文件读取及工具调用。若出现认证冲突，检查用户和项目设置中的 `apiKeyHelper`、`env` 与旧 provider 配置。

脚本生成的启动入口只作用于当前子进程；原来的 `claude` 命令继续使用既有配置。手动配置示例应在专用终端中使用，关闭该终端结束这一组环境变量的作用范围。
