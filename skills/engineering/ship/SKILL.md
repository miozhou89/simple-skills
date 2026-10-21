---
name: ship
description: 用户提出一个需求并要求方案设计或开发时必须使用。当用户提出需求、新功能、方案设计、实现请求，或说"我要做个功能/帮我开发/设计一下"时触发。
---

# 需求开发流程编排

作为需求开发流程的编排器，引导用户按阶段推进——设计 → 规格 → 计划 → 实施 → 评审 → 验证，并在每一阶段路由到对应 skill。
用户提出需求并要开发时，不要直接开始实施，按下面流程走，每阶段落到对应 skill。

## 流程总览

```
设计 → 规格 → 计划 → 实施 → 评审 → 验证
```

## 变更文档目录

每个需求变更的所有产出文档集中存放在 `docs/changes/<capability-path>/`：

- 开始一个新变更时，根据对话上下文为它命名 `<capability-path>`（如 `add-dark-mode`），创建目录 `docs/changes/<capability-path>/`。
- 起草 `docs/changes/<capability-path>/spec.md`（为什么要做这个、什么在变）放入该目录，与用户确认后作为本次变更的入口文档。
- 同一会话中后续各阶段 skill 的输出文档都写入同一目录：

| 文件 | 内容 | 由谁产出 |
| --- | --- | --- |
| `CONTEXT.md`、`docs/adr/*` | 领域模型、术语、技术方案 | `/domain-modeling` |
| `docs/changes/<capability-path>/` | 为什么要做这个、什么在变 | 本流程（需求确认时起草） |
| `spec.md` | 需求和场景 | `/to-spec` |
| `plans.md` | 实现清单 | `/to-plans` |

- 不要把变更文档散落到 `docs/spec/`、`docs/plans/` 等其他目录；跨变更的领域词汇与 ADR 仍归 `CONTEXT.md` 和 `docs/adr/` 管。

## 流程

### 1. 设计

- **`/req-explore`** — 通过提问澄清需求，形成方案，产出文档：`CONTEXT.md`、`docs/adr/*`

执行下一步流程前必须先跟用户确认。

### 2. 规格

- **`/to-spec`** — 把当前对话转化为一份 spec 文档，写入 `docs/changes/<capability-path>/spec.md`。不做访谈，只综合已讨论内容。

执行下一步流程前必须先跟用户确认。

### 3. 计划

- **`/to-plans`** - 把 spec 拆成可执行的实现步骤，写入 `docs/changes/<capability-path>/plans.md`，并在实现过程中更新进度。

### 4. 实施

- **`/implement`** — 构建 spec 或票据描述的工作，内部驱动 `/tdd`，提交前跑 `/code-review`。

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

### 5. 评审

- **`/code-review`** — 对 diff 做双轴评审：Standards + Spec。以并行子 agent 运行。

### 6. 验证

宣称成功之前，使用 `/verification-before-completion` 技能。

