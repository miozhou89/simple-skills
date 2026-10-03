---
name: ship
description: 用户提出一个需求并要求方案设计或开发时必须使用。作为需求开发流程的编排器，引导用户按阶段推进——设计 → 规格 → 票据 → 实施 → 评审 → 维护，并在每一阶段路由到对应 skill。当用户提出需求、新功能、方案设计、实现请求，或说"我要做个功能/帮我开发/设计一下"时触发。
---

# 需求开发流程编排

用户提出需求并要开发时，不要直接开写。按下面流程走，每阶段落到对应 skill。**用户是流程的主人，每阶段推进前先跟用户确认。**

## 流程总览

```
设计 → 规格 → [票据] → 实施 → 评审 → 验证
```

## 变更文档目录

每个需求变更的所有产出文档集中存放在 `docs/changes/<capability-path>/`：

- 开始一个新变更时，根据对话上下文为它命名 `<capability-path>`（如 `add-dark-mode`），创建目录 `docs/changes/<capability-path>/`。
- 起草 `proposal.md`（为什么要做这个、什么在变）放入该目录，与用户确认后作为本次变更的入口文档。
- 同一会话中后续各阶段 skill 的输出文档都写入同一目录：

| 文件 | 内容 | 由谁产出 |
| --- | --- | --- |
| `proposal.md` | 为什么要做这个、什么在变 | 本流程（需求确认时起草） |
| `design.md` | 技术方案 | `/brainstorming` 或 `/explore` |
| `spec.md` | 需求和场景 | `/to-spec` |
| `plans.md` | 实现清单 | `/to-plans` |
| `issues/<NN>-<slug>.md` | 拆分的票据（本地 tracker 时） | `/to-tickets` |

- 不要把变更文档散落到 `docs/spec/`、`docs/plans/` 等其他目录；跨变更的领域词汇与 ADR 仍归 `CONTEXT.md` 和 `docs/adr/` 管。

## 1. 设计

> 只对高风险、高耦合的功能做。节奏快的团队、小改动直接跳过，从规格开始。

- **`/brainstorming`** — 给出多个可行方案，供用户挑选，适用于需求描述较明确或粒度较小的任务。设计定稿后写入 `docs/changes/<capability-path>/design.md`。
- **`/explore`** — 通过提问澄清需求，产出文档：`CONTEXT.md`、`docs/adr/*`（`docs/adr` 目录若不存在则使用 `setup-simple-skills` 对项目进行设置）
- **注**：`/explore` 成本较高，只有在当需求描述模糊时，通过提问和探索澄清需求，小改动跳过。

## 2. 编写方案、规格

- **`/to-spec`** — 把当前对话转化为一份 spec 文档，写入 `docs/changes/<capability-path>/spec.md`。不做访谈，只综合已讨论内容。

## 3. 拆分成多个可追踪的 plan 或 ticket（可选）

> 大需求推荐，小需求跳过。

- **`/to-plans`** - 把 spec 拆成可执行的实现步骤，写入 `docs/changes/<capability-path>/plans.md`，并在实现过程中更新进度。
- **`/to-tickets`** - 对于复杂的需求，可能需要新建多个 agent 会话去实施，这种情况下，可以把 spec 拆成一组 tracer-bullet 票据，每张声明其阻塞边。本地 tracker 时写入 `docs/changes/<capability-path>/issues/`。

## 4. 实施

- **`/implement`** — 构建 spec 或票据描述的工作，内部驱动 `/tdd`，提交前跑 `/code-review`。
- **多 ticket 时一次只 implement 一个**：`/implement #01`、`/implement #02`……

对每个任务：

1. 宣布："正在处理任务 N：[描述]"
2. 自然地引用 specs/design："Spec 说 X，所以我做 Y"
3. TDD 测试驱动开发
4. 在 plans.md 或 ticket 中标记完成：`- [ ]` → `- [x]`
5. 简要状态："✓ 任务 N 完成"

所有任务完成后：

```
## 实现完成

所有任务完成：
- [x] 任务 1
- [x] 任务 2
- [x] ...

变更已实现！<简要总结>
```

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
| 根据规格生成任务规划 | `/to-plans` |
| 大需求拆分 | `/to-tickets` |
| 按规格实施 | `/implement` |
| 评审代码 | `/code-review` |
| 重构 | `/improve-codebase-architecture` |
| 排查 bug | `/diagnosing-bugs` |
