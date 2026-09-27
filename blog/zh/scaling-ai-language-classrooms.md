---
draft: false
title: "让本地 AI 虚拟角色走进 50 人的语言课堂"
description: "一份面向大学研究组的语音学习服务计划：共享现有 GPU、使用托管网页入口、逐步验收课堂体验，并明确三年新增现金预算。"
date: "2026-09-25"
presentation: classroom-ai
scenario:
  students: 50
  lessonMinutes: 45
  turns: 20
  systemTokens: 600
  userTokens: 40
  replyTokens: 80
  speechSeconds: 15
  lessonsPerWeek: 10
  weeksPerYear: 36
  years: 3
  cloudShare: 20
  inputEuroPerMillion: 0.25
  outputEuroPerMillion: 0.50
  asrEuroPerMinute: 0.003
  monthlyHostingEuro: 0
  ttsEuroPerMillionChars: 0
  charsPerToken: 4
  ttsCloudShare: 0
category: "计划"
tags:
  - AI
  - 教育
  - 基础设施
  - 科研
---

## 1. 让服务适应一节课

让 50 名学生在一节普通外语课上，与 AI 虚拟角色练习口语。这份计划从已经能够本地运行的应用出发，结合大学现有计算资源和可控的小额云预算，逐步形成可供课堂使用的服务。

目标用户是英国和西欧的中学。学生说话、查看转写文本，并听到动画角色的简短回复；教师选择活动，也可以暂停活动。第一版聚焦于一节课内的引导式对话和反馈。

候选前端采用 React，在浏览器内渲染角色、展示字幕并播放语音。WASM 承担经过设备与语音质量验证的客户端计算；大学 GPU 承担对话和适合的语音任务；已批准的云端服务补充设备兼容性、容量和可用性。具体 avatar 与语音组件在试点中选定。

早期本地测试中，四位量化的 Gemma 4 E4B 通过 llama.cpp 展现出了足以支持这项学习任务的对话能力。课堂容量仍需测量。本次提议是开展分阶段试点，以教学质量、响应速度、故障恢复和实际支出作为扩大规模的依据。

## 2. 将 50 名学生转化为可测量的负载

容量目标是一班 50 人，同时区分在场学生人数与某一时刻正在生成回复的请求数。

<!-- pitch:workload -->

以 45 分钟一节课、每名学生完成 20 轮交流为基线：20 条学生消息加 20 条角色回复，共 40 条消息。预算假设是，系统指令 600 tokens、每条学生消息 40 tokens、每次回复 80 tokens，每轮录音 15 秒。Token 是模型处理文本时使用的小单位。

一节课共 1,000 轮交流，平均每分钟约 22 个请求。教师同时发出指令时，仍可能出现 50 个请求集中到达。测试需要同时覆盖平均负载、集中突发，以及临近下课时更长的对话历史。

如果每次请求都发送此前的完整对话，每名学生的累计输入是：

`20 × (600 + 40) + 120 × (0 + 1 + … + 19) = 35,600 tokens`。

因此，一节课对应 **178 万输入 tokens、8 万输出 tokens 和 250 分钟录音**。这些数字是规划假设。试点应记录实际长度，并将重试和模型生成的思考内容计入后续预测。

## 3. 用稳定的服务入口连接共享计算资源

保持网页和会话管理可用，再将推理请求交给能满足响应时限的已批准资源。

<!-- pitch:architecture -->

浏览器界面由 Cloudflare 静态资源托管。Worker 验证学校会话、执行课堂配额并分发请求；小型数据库保存会话归属、已完成的对话轮次和用量记录。API 凭据只保存在服务端。

语音流程依次是：麦克风录音、语音识别、对话模型、语音合成、虚拟角色播放。第一阶段在学生说完后提交短录音。回复文本可以逐步显示；所选语音支持时，以完整短句为单位开始播放。

仅向应用 Worker 授予推理访问权限。[VPC Service binding](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/) 可以经过 Tunnel 连接到固定的私有主机和端口，目前处于 beta。成熟的后备方案是使用受 [Access Service Auth](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) 保护的 Tunnel 域名，仅接受保存在 Worker secrets 中的凭据。大学 IT 需批准 [7844 端口的出站连接](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/tunnel-with-firewall/)与服务身份。调度根据健康状态和容量选择本地节点或已批准的欧洲 API，并用有限队列控制等待。

请求发送前预留其云端额度，完成后按实际用量结算。共享协调器保证多个并发请求不会重复占用同一笔预算。额度用尽时，界面说明等待情况，并让教师决定如何继续。长时间的语音或文本流经过 Worker 转发，协调器仅处理短暂的记账操作。

## 4. 将现有 GPU 变成可用的服务容量

每张可用 GPU 都作为独立测量的服务副本，并为大学科研任务提供明确的资源收回机制。

起步分配一张既有 RTX 4090 处理对话，再用一张 4070 Ti 或 5070 Ti 承担语音识别或溢出负载，具体取决于联合测试。三者显存依次为 24 GB、12 GB 和 16 GB；4070 Ti SUPER 则为 16 GB。应对照 [NVIDIA 官方规格](https://www.nvidia.com/en-gb/geforce/graphics-cards/compare/)核实设备清单。这组候选分配无需新增采购。

Google 的[格式指南](https://ai.google.dev/gemma/docs/core)给出了 E4B Q4_0 约 4.5 GB 的加载估计。需要在每类显卡上测量完整运行时的占用，包括目标并发数下的对话内存。官方为 llama.cpp 提供 GGUF，也为 vLLM 提供后缀为 `-qat-w4a16-ct` 的 E4B QAT compressed tensors。更换量化权重后，应重新检查对话质量。

保留已经运行的 llama.cpp 配置作为基准；它的[服务端支持并行请求和连续批处理](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)。同时，依据 [Gemma 4 部署示例](https://docs.vllm.ai/projects/recipes/en/stable/Google/Gemma4.html)评估 vLLM。**连续批处理**让 GPU 一起推进多段对话，并在前面的回复结束时接入新的工作。**前缀缓存**复用对话开头完全相同时已经完成的计算，可以缩短重复读取历史的时间；新回复仍需要逐步生成。

设置 4,096 tokens 的对话上下文上限，逐步增加并行请求数，并测量延迟与显存。针对教学活动，试验关闭思考模式、将回复限制在 128 tokens 内。KV cache 保存已处理文本的工作记忆，随对话长度和并发量增加。连续轮次优先分配给同一校内节点，同时[隔离不同学生的缓存](https://docs.vllm.ai/en/latest/design/prefix_caching/)。比较将缓存卸载到 CPU 内存、跨节点传输 KV，以及重新计算历史输入的实际效果。持久化保存的已完成对话文本始终是恢复依据。

以平均负载的两倍为容量目标：在语音识别同时运行时，每秒约**处理 1,320 个输入 tokens，并生成 60 个输出 tokens**。这是需要联合验证的验收目标。测试还应覆盖 50 个请求突发和单节点掉线，并确认云端配额足以承接整个班级。

机器被收回前，先停止接收新请求，再完成进行中的工作。意外故障后，从最后一个已完成轮次恢复。重试沿用唯一的轮次标识，并取消旧请求。如果部分语音已经播放，界面提示中断，由学生继续。

## 5. 用课堂体验决定何时扩大使用

建议的课堂目标是：每 100 次交流中，至少 95 次能在学生说完后的四秒内听到回复。

计时从学生停止说话到虚拟角色开始发声，包含识别、排队、生成和语音合成。这是一个 **p95** 目标：大约最慢的 5% 轮次可能超过四秒。失败轮次也计为未达标，完成失败率和中断情况另行报告。教师还需判断，这种交互是否真正支持口语练习。

| 阶段 | 进入下一阶段所需的证据 |
| --- | --- |
| 技术演练 | 回放 50 个会话，覆盖集中开始和最后几轮的长历史；分别测量各 GPU 与云端路径。 |
| 小规模学校试点 | 检查目标语言、麦克风、学校网络过滤、无障碍需求及真实课堂噪声。 |
| 完整班级 | 达到响应目标，完成 GPU 掉线演练，并将支出控制在课堂额度内。 |
| 常规运行 | 保持明确的支持负责人、用量复核和经过演练的恢复步骤。 |

使用版本化仓库、代码审查、独立测试凭据、固定版本的模型与容器，以及可重复的部署流程。自动检查覆盖访问权限、重复轮次、预算预留和恢复。经教师审核的对话样例用于检查语言准确性、年龄适宜性和指令遵循。

在课间发布，检查一次语音交互，并保留上一个版本。记录暂停新请求、切换已批准路径及恢复会话的方法。上课期间安排一名主要联系人和一名后备联系人。

## 6. 将三年现金预算的假设列清楚

基线预算涵盖三年新增服务支出，既有设备、人员时间和电力由大学提供。

<!-- pitch:budget -->

每周 10 节课、每年 36 个教学周、持续三年，共 **1,080 节课**。上述负载累计为 **19.224 亿输入 tokens、8,640 万输出 tokens 和 4,500 小时语音识别**。先假设每类计费负载有 20% 进入云端，再用 GPU 实际可用时段验证这个比例。

[Scaleway 公开价格](https://www.scaleway.com/en/pricing/model-as-a-service/)提供了一个欧洲云端参考：Gemma 4 26B A4B IT 每百万输入 tokens 为 €0.25，每百万输出 tokens 为 €0.50；Whisper large v3 每分钟录音为 €0.003，均为税前价格。这里的 26B 模型用于云成本估算，尚未核实与本地 E4B 同款的欧洲 serverless 报价。

| 三年可变支出 | 20% 使用云端 | 全部负载使用云端 |
| --- | ---: | ---: |
| 对话模型 | €104.76 | €523.80 |
| 语音识别 | €162.00 | €810.00 |
| 以上两项合计 | **€266.76** | **€1,333.80** |

估算按完整历史计费，未计缓存折扣和免费赠额。Whisper 按实际录音时长计费。三年的预计现金差额为 €1,067.04。每次试点课后，记录实际云端占比、用量和剩余预算。

浏览器语音合成只有在**学校设备具备已批准且质量合适的语音**时，才对应零新增 API 支出。需要验证语种覆盖、语音服务所在地和一致性。如果需要付费 TTS 兜底，应按字符数或音频时长单独报价，它不在上表中。域名续费及额外存储也应明确列项。

实测用量符合限制时，可用 Cloudflare 免费套餐开展初期实验。[Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/) 当前最低 **每月 5 美元**，按这一最低价格持续 36 个月为 **180 美元**。美元金额与欧元小计分别列出，并核对套餐包含的用量。这些现价均不代表三年固定报价。

## 7. 为持续运行明确分工

课堂服务需要一套能够持续交接的运作安排。

研究负责人管理学习任务、研究方案和预算。大学 IT 管理经过批准的连接、机器访问、补丁和恢复安排。教师负责课前准备、学生监督及暂停控制。大学数据保护联系人和学校代表应在学生接入前，共同确认数据流、保留期限和供应商安排。

使用假名化的学生标识。建议识别完成后删除原始录音，服务会话文本保留 24 小时用于恢复，具体以已批准的研究方案为准。研究记录使用独立批准的保留计划，同时覆盖导出文件和备份。运维日志主要记录请求标识、时间、错误及用量。

为每个研究轮次记录模型版本、量化方式、提示词版本、语音组件，以及本地或云端路径。从本地 E4B 切换到云端 26B，可能改变学生接受的学习干预。研究方案应批准并明确分析这种切换，或为研究过程选定一致且已批准的推理路径。运行恢复与研究可比性需要一起设计。

## 8. 用明确的检查推动试点

当容量、语音质量、数据处理和支持安排分别通过具体检查后，就可以批准首次课堂试点。

尚需确定的事项包括目标语言和学校设备、GPU 可用时段、各副本实测容量、已批准的云端兜底及账户配额、浏览器语音验收或有预算的 TTS 选项，以及研究对路径变化的处理方法。采购前重新核价，试点后修订预测。

以下一手资料于 2026 年 9 月 25 日查阅，用于支持实现选择：

- [Google Gemma 4 模型格式与显存规划](https://ai.google.dev/gemma/docs/core)。
- [vLLM 的 Gemma 4 部署示例](https://docs.vllm.ai/projects/recipes/en/stable/Google/Gemma4.html)。
- [vLLM 前缀缓存与缓存隔离](https://docs.vllm.ai/en/latest/design/prefix_caching/)。
- [llama.cpp 服务端功能与并行槽位](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)。
- [NVIDIA GPU 规格](https://www.nvidia.com/en-gb/geforce/graphics-cards/compare/)。
- [Cloudflare Workers 价格](https://developers.cloudflare.com/workers/platform/pricing/)。
- [Scaleway 模型与语音识别价格](https://www.scaleway.com/en/pricing/model-as-a-service/)。
- [Scaleway 部署地点、计费及服务行为](https://www.scaleway.com/en/docs/generative-apis/faq/)。
- [Scaleway 组织配额](https://www.scaleway.com/en/docs/organizations-and-projects/organization/organization-quotas/)。
