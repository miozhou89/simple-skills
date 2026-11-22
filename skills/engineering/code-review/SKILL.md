---
name: code-review
description: 沿两个轴评审某个固定点（commit、branch、tag 或 merge-base）以来的变更——Standards（代码是否遵循本 repo 文档化的编码规范？）与 Spec（代码是否符合发起 issue/spec 的要求？）。两个评审以并行 sub-agent 运行，结果并排汇报。当用户想评审一个分支、一个 PR、进行中的变更，或要求「review since X」时使用。
---

# Code Review

对固定点与 `HEAD` 之间的 diff 做双轴评审：

- **Standards** — 代码是否符合本 repo 文档化的编码规范，以及 Fowler 坏味道基线？
- **Spec** — 代码是否忠实实现了发起 issue / spec 的要求？

两个轴以**并行 sub-agent** 运行，以免互相污染上下文，最后由本 skill 汇总。

## 流程

### 1. 钉住固定点

用户指定的就是固定点——commit SHA、分支名、tag、`main`、`HEAD~5` 等等。如果没指定，审查范围就是当前完成的任务或进行中的变更；如果不存在进行中的任务，就问。

把 diff 命令一次性记录下来：`git diff <fixed-point>...HEAD`（三点语法，即与 merge-base 比较）。同时用 `git log <fixed-point>..HEAD --oneline` 记下提交列表。

在继续之前，确认固定点可解析（`git rev-parse <fixed-point>`）且 diff 非空。坏引用或空 diff 在这里失败，而不是等到两个并行 sub-agent 内部才失败。

### 2. 确定 spec 来源

按以下顺序寻找发起 spec：

1. 提交信息中的 issue 引用（`#123`、`Closes #45`、GitLab `!67` 等）——按 `docs/agents/issue-tracker.md` 中的工作流抓取。
2. 用户作为参数传入的路径。
3. `docs/changes/<capability-path>/` 下与分支名或功能匹配的变更文档（如 `spec.md`、`plans.md`）。
4. 如果都找不到，问用户 spec 在哪。用户说没有 spec 时，**Spec** sub-agent 就跳过并报告 "no spec available"。

### 3. 确定规范来源

repo 中任何记录「代码应该怎么写」的文档，如 `CODING_STANDARDS.md` 或 `CONTRIBUTING.md`。

在 repo 文档之上，Standards 轴永远携带下面的**坏味道基线（smell baseline）**——一组固定的 Fowler 代码坏味道（《重构》第 3 章），即使 repo 什么都没写也适用。它受两条规则约束：

- **repo 规范优先。** 文档化的 repo 规范永远胜出；当它认可了基线会标记的东西时，压制该坏味道。
- **永远是判断题。** 每个坏味道都是带标签的启发式（"possible Feature Envy"），绝不是硬性违规；工具已经强制的事一律跳过。

对照 diff 逐项检查：

- **Mysterious Name** — 函数、变量或类型的名字没有揭示它做什么或装什么。
- **Duplicated Code** — 同样的逻辑形状出现在变更的多个 hunk 或文件中。
- **Feature Envy** — 一个方法伸进另一个对象的数据比用自己的还多。
- **Data Clumps** — 同样几个字段或参数总是结伴出行（一个想诞生的类型）。
- **Primitive Obsession** — 用原始类型或字符串顶替一个本该有自己类型的领域概念。
- **Repeated Switches** — 针对同一类型的同一个 `switch`/`if` 级联在变更中反复出现。
- **Shotgun Surgery** — 一个逻辑变更迫使 diff 中许多文件被零散修改。
- **Divergent Change** — 一个文件或模块因为多个不相关的原因被修改。
- **Speculative Generality** — 为 spec 并不存在的需求添加的抽象、参数或钩子。
- **Message Chains** — 调用方不该依赖的长 `a.b().c().d()` 导航链。
- **Middle Man** — 一个基本上只做转发的类或函数。
- **Refused Bequest** — 忽略或重写掉大部分继承物的子类或实现者。

### 4. 并行启动两个 sub-agent

**Standards sub-agent 的 prompt** — 包含：

- 完整的 diff 命令和提交列表。
- 第 3 步找到的规范来源文件列表，**外加第 3 步的坏味道基线** 全文粘贴——sub-agent 没有其他途径获取它。
- 简报："汇报——在相关的文件/hunk 级别——(a) diff 违反文档化规范的每一处：引用该规范（文件 + 规则）；(b) 你发现的所有基线坏味道：点名并引用该 hunk。区分硬性违规与判断题——文档化规范的违反可以是硬性违规，但基线坏味道永远是判断题，且文档化的 repo 规范优先于基线。工具已经强制的事一律跳过。400 词以内。"

**Spec sub-agent 的 prompt** — 包含：

- diff 命令和提交列表。
- spec 的路径或抓取到的内容，外加下面的检查清单（逐项对照）：计划对齐（实现匹配需求、偏差合理、功能齐全）；代码质量（关注点分离、错误处理、类型安全、DRY、边界情况）；架构（设计合理、可扩展性与性能、安全、与周边集成）；测试（验证真实行为而非 mock、边界与集成覆盖、全部通过）；生产就绪（schema 迁移、向后兼容、文档、明显 bug）。
- 简报："汇报：(a) spec 要求但缺失或只完成了一部分的需求；(b) diff 中没人要求的行为（范围蔓延）；(c) 看似已实现但实现看起来不对的需求。每条发现都要引用对应的 spec 原文行。400 词以内。"

如果 spec 缺失，跳过 Spec sub-agent，并在最终报告中注明。

### 5. 汇总

把两份报告放在 `## Standards` 和 `## Spec` 标题下呈现，原样或稍加清理。**不要**合并或重排发现——两个轴是刻意分开的（见「为什么是双轴」）。

最后用一行总结收尾：每个轴的发现总数，以及*每个轴内部*最严重的问题（如果有）。不要跨轴选出唯一的胜出者——那正是轴分离要防止的重排。

## 为什么是双轴

一个变更可能过一个轴、挂另一个轴：

- 符合每条规范但实现错了东西的代码 → **Standards 过，Spec 挂。**
- 完全做了 issue 要求的事但破坏项目惯例的代码 → **Spec 过，Standards 挂。**

分开汇报可以阻止一个轴掩盖另一个轴。
