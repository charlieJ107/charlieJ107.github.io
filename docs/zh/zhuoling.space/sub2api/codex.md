---
draft: false
title: 配置 Codex CLI
description: 使用 Sub2API 的 Responses 接口配置 Codex，并验证第一次请求。
project: sub2api
section: guide
order: 40
updatedAt: 2026-10-06
---

## 准备

先安装 [Codex CLI](https://developers.openai.com/codex/cli/)，确认终端中 `codex --version` 可用，再通过统一登录创建 [Sub2API API Key](/zh/projects/sub2api/docs/api-keys/)。准备该 Key 可用的模型 ID。

本页面向 Codex CLI。桌面端与其他运行环境的配置应按对应产品文档核对。

## 使用配置脚本

在[下载页](/zh/projects/sub2api/docs/downloads/)获取对应平台的脚本。运行后选择 `codex`，核对 Base URL，输入 Key，并从模型列表选择模型。

脚本创建 `~/.config/sub2api/codex-sub2api.sh`，Windows 则创建 `$HOME\.config\sub2api\codex-sub2api.ps1`。进入需要处理的项目目录后运行该入口：

```bash
bash "$HOME/.config/sub2api/codex-sub2api.sh"
```

```powershell
& "$HOME\.config\sub2api\codex-sub2api.ps1"
```

这些入口通过当前进程的环境变量传入 Key，并通过 Codex 的配置覆盖参数选择 Sub2API。其他现有客户端设置继续由 Codex 正常加载。

## 手动配置

`config.toml` 是 Codex 读取的纯文本设置文件，用记事本等文本编辑器即可修改。下面按“打开文件 → 备份 → 修改两处 → 保存”的顺序操作。若希望自动完成配置，可以使用上面的配置脚本。

### 1. 打开自己的配置文件

这里修改的是**用户配置文件**。默认位置是用户主目录下的 `.codex/config.toml`；项目文件夹里也可能有同名文件，请核对位置。如果你曾设置 `CODEX_HOME`，请使用该目录里的 `config.toml`。

**Windows：**在开始菜单搜索并打开 PowerShell，粘贴下面整段命令，按回车。它会找到配置目录，用记事本打开文件；首次使用时会创建目录和空文件。

```powershell
$codexConfigDir = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }
New-Item -ItemType Directory -Force -Path $codexConfigDir | Out-Null
$codexConfigFile = Join-Path $codexConfigDir 'config.toml'
if (-not (Test-Path -LiteralPath $codexConfigFile)) {
    New-Item -ItemType File -Path $codexConfigFile | Out-Null
} else {
    Copy-Item -LiteralPath $codexConfigFile -Destination "$codexConfigFile.$(Get-Date -Format 'yyyyMMdd-HHmmssfff').bak"
}
notepad.exe $codexConfigFile
```

**macOS：**打开“终端”，粘贴下面整段命令，按回车，用“文本编辑”打开文件。编辑时保持纯文本格式；如果“格式”菜单显示“制作纯文本”，先选择它。

```bash
codex_config_dir="${CODEX_HOME:-$HOME/.codex}"
mkdir -p "$codex_config_dir"
if [ -f "$codex_config_dir/config.toml" ]; then
  cp -p "$codex_config_dir/config.toml" "$codex_config_dir/config.toml.$(date +%Y%m%d-%H%M%S)-$$.bak"
fi
touch "$codex_config_dir/config.toml"
open -a TextEdit "$codex_config_dir/config.toml"
```

**Linux：**打开终端，运行下面的命令，用 Nano 编辑。完成后按 `Ctrl+O`、回车保存，再按 `Ctrl+X` 退出。如果未安装 Nano，也可以用系统的纯文本编辑器打开同一路径。

```bash
codex_config_dir="${CODEX_HOME:-$HOME/.codex}"
mkdir -p "$codex_config_dir"
if [ -f "$codex_config_dir/config.toml" ]; then
  cp -p "$codex_config_dir/config.toml" "$codex_config_dir/config.toml.$(date +%Y%m%d-%H%M%S)-$$.bak"
fi
nano "$codex_config_dir/config.toml"
```

### 2. 备份，并认清文件中的两种内容

上面的打开命令会先把已有文件备份到同一个目录，备份名含日期时间并以 `.bak` 结尾。若你通过其他方式打开文件，请先复制一份作为备份。编辑器中继续修改原来的 `config.toml`。首次创建的空文件可以直接开始编辑。

TOML 只需先了解这几条规则：

- `名称 = 值` 是一项设置。文字通常放在英文引号中；复制时保留原来的引号、反斜杠和标点。
- `[marketplaces.openai-bundled]` 这样的独立标题行表示一个配置区块。后面的设置属于这个区块，直到出现下一个区块标题。**空行和缩进不会结束区块。**
- 第一个区块标题之前是文件的“顶层”。本教程的 `model_provider` 要写在这里。
- `notify = [...]` 的方括号表示一组值，可能跨好几行；它本身是一项设置，不是区块标题。请完整保留它，包括很长的路径和结尾的 `]`。
- 以 `#` 开头的是说明文字。相同位置的同名设置只能有一份；已有设置时修改原行即可。

如果文件中有 `notify`、`[marketplaces.openai-bundled]`、`[mcp_servers.…]` 等内容，保留原来的内容和顺序。接下来只需要调整两处。

### 3. 在文件顶部选择 Sub2API

搜索 `model_provider`。如果**第一个区块标题之前**已有这一项，把那一行改为下面的内容；如果没有，在文件最上面新增这一行。编辑器里的“查找”通常可以用 `Ctrl+F`（macOS 为 `Command+F`）打开。

```toml
model_provider = "sub2api"
```

这行必须放在所有 `[区块标题]` 前面，也不要插入跨行的 `notify = [...]` 中间。若搜索结果位于 `[profiles.…]` 等区块内，保留那里的设置，仍按上面的规则处理顶层。

已有的 `model = "…"` 可以保留，前提是你的 Sub2API Key 支持该模型。首次配置时可先省略这一项；若启动后提示模型不可用，在 Codex 中输入 `/model` 选择受支持的模型，或按 [API Key 文档](/zh/projects/sub2api/docs/api-keys/)核对可用模型 ID。省略这一项不会自动从 Sub2API 获取模型列表。

### 4. 在文件末尾添加 Sub2API 区块

先搜索 `[model_providers.sub2api]`。**如果已经存在，就在原区块中更新下面这些设置，并保留其他设置；如果不存在，移到文件末尾，另起一行，粘贴整段。** 区块标题也要一起复制。

```toml
[model_providers.sub2api]
name = "Sub2API"
base_url = "https://sub2api.zhuoling.space/v1"
env_key = "SUB2API_API_KEY"
wire_api = "responses"
requires_openai_auth = false
```

可以按下面的顺序核对文件。这个示意图只表示位置，省略号代表你自己的原有内容，**不要把示意图复制到配置文件里**：

```text
文件顶部
│ model_provider = "sub2api"       ← 第 3 步：顶层设置
│ 原有的 model、notify 等设置……   ← 完整保留
│
│ [marketplaces.openai-bundled]    ← 原有区块
│ 原有的 source_type、source……
│ 其他原有区块及内容……
│
│ [model_providers.sub2api]        ← 第 4 步：新增完整区块
│ name、base_url、env_key 等设置……
文件末尾
```

### 5. 保存，并在终端中启动

Windows / Linux 按 `Ctrl+S`，macOS 按 `Command+S` 保存（Nano 的保存方式见第 1 步）。文件名应保持为 `config.toml`，不要另存为 `config.toml.txt` 或富文本文件。关闭旧的 Codex CLI 会话，再从终端重新启动，让它读取保存后的配置。

在运行 Codex 的终端中设置 `SUB2API_API_KEY`。隐藏输入可避免 Key 出现在命令历史里：

```bash
# 在 Bash 中执行；macOS 默认 zsh 用户可先运行 bash。
read -rsp 'Sub2API API Key: ' SUB2API_API_KEY; printf '\n'
export SUB2API_API_KEY
codex
unset SUB2API_API_KEY
```

```powershell
$secureKey = Read-Host 'Sub2API API Key' -AsSecureString
$env:SUB2API_API_KEY = [Net.NetworkCredential]::new('', $secureKey).Password
try { codex } finally { Remove-Item Env:SUB2API_API_KEY -ErrorAction SilentlyContinue }
```

自定义 provider 的字段定义见 [OpenAI 官方配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)。

若启动时提示 TOML 解析错误，先按报错的行号检查引号、方括号以及是否重复添加了设置或区块。需要恢复时，关闭 Codex，将备份文件复制回原位置并恢复名称 `config.toml`，然后重新启动。配置文件可能含本机路径和其他服务的凭据；求助时只分享已脱敏的相关几行。

## 验证与排错

在一个测试项目中启动 Codex，发送简短问题，并在 Sub2API 控制台核对用量。随后让 Codex读取一个无敏感内容的文件，确认你需要的工具调用行为。

若仍出现其他 provider 的登录提示，检查启动入口、`CODEX_HOME` 和是否存在覆盖 provider 的配置；若请求 404，检查 `/v1` 是否重复。模型或额度问题见 [API 排错表](/zh/projects/sub2api/docs/api-keys/)。

使用脚本时，直接运行原来的 `codex` 命令即可使用原有配置；重新配置或恢复 Sub2API 入口的方法见下载页。
