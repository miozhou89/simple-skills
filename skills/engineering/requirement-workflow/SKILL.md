---
name: requirement-workflow
description: 用户提出一个需求并要求方案设计或开发时必须使用。作为需求开发流程的编排器，引导用户按阶段推进——设计 → 规格 → 票据 → 实施 → 评审 → 维护，并在每一阶段路由到对应 skill。当用户提出需求、新功能、方案设计、实现请求，或说"我要做个功能/帮我开发/设计一下"时触发。
---

# 需求开发流程编排

用户提出需求并要开发时，不要直接开写。按下面流程走，每阶段落到对应 skill。**用户是流程的主人，每阶段推进前先跟用户确认。**

## 流程总览

```
设计 → 规格 → [票据] → 实施 → 评审 → 维护
```

## 1. 设计

> 只对高风险、高耦合的功能做。节奏快的团队、小改动直接跳过，从规格开始。

- **`/brainstorming`** — 给出多个可行方案，供用户挑选，适用于需求描述较明确或粒度较小的任务。
- **`/explore`** — 通过提问澄清需求，产出文档：`CONTEXT.md`、`docs/adr/*`（`docs/adr` 目录若不存在则使用 `setup-simple-skills` 对项目进行设置）
- **注**：`/explore` 成本较高，只有在当需求描述模糊时，通过提问和探索澄清需求，小改动跳过。

## 2. 编写方案、规格

- **`/to-spec`** — 把当前对话转化为一份 spec 发布到 issue tracker。不做访谈，只综合已讨论内容。

## 3. 拆分成多个可追踪的 ticket（可选）

> 大需求推荐，小需求跳过。

- **`/to-tickets`** — 把 spec 拆成一组 tracer-bullet 票据，每张声明其阻塞边。

## 4. 实施

- **`/implement`** — 构建 spec 或票据描述的工作，内部驱动 `/tdd`，提交前跑 `/code-review`。
- **多 ticket 时一次只 implement 一个**：`/implement #01`、`/implement #02`……

## 5. 代码 review

- **`/code-review`** — 对 diff 做双轴评审：Standards + Spec。以并行子 agent 运行。

## 6. 验证

宣称成功之前，使用 /verification-before-completion 技能。

## 7. 维护

按用户处境路由：

- **重构** → `/improve-codebase-architecture`
- **bug 定位** → `/diagnosing-bugs`（根因调查 + 纪律化诊断：反馈循环 → 最小化 → 假设 → 插桩 → 修复 → 回归）
- **跨会话交接** → `/handoff`，交接后在干净窗口继续

## 用户处境判断

用户消息可能只描述处境而非点名流程。按此路由：

| 用户要求 | 路由到 |
| --- | --- |
| 头脑风暴/多方案 | `/brainstorming` |
| 澄清需求、产出文档 | `/explore` |
| 把讨论写成规格 | `/to-spec` |
| 大需求拆分 | `/to-tickets` |
| 按规格实施 | `/implement` |
| 评审代码 | `/code-review` |
| 重构 | `/improve-codebase-architecture` |
| 排查 bug | `/diagnosing-bugs` |
