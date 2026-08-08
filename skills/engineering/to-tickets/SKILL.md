---
name: to-tickets
description: 把计划、spec 或当前对话拆解为一组 tracer-bullet 票据，每张票据声明其阻塞边，发布到配置好的 tracker——本地以文本形式每票据一个文件，或在真实 tracker 上使用原生阻塞链接。
disable-model-invocation: true
---

# To Tickets

把计划、spec 或对话拆解为一组**票据**——tracer-bullet 垂直切片，每张票据声明**阻塞**它的其他票据。


## 流程

### 1. 收集上下文

利用对话上下文中已有的内容。如果用户作为参数传入了引用（spec 路径、issue 编号或 URL），获取它并阅读其完整正文和评论。

### 2. 探索代码库（可选）

如果你还没有探索过代码库，去探索以了解代码的当前状态。票据标题和描述应使用项目领域词汇表的词汇，并尊重你所触及区域的 ADR。

寻找对代码做预重构（prefactor）的机会，让实现更容易。"让变更变容易，然后做那个容易的变更。"

### 3. 起草垂直切片

把工作拆解成 **tracer bullet** 票据。

<vertical-slice-rules>

- 每个切片切出一条穿过每一层（schema、API、UI、测试）的窄而完整的路径——垂直的，而不是某一层的水平切片
- 一个完成的切片可以独立演示或验证
- 每个切片的大小适配单个全新上下文窗口
- 任何预重构都应该先做

</vertical-slice-rules>

给每张票据标注它的**阻塞边**——必须先完成它才能开始的其他票据。没有阻塞方的票据可以立即开始。

**宽重构是垂直切片的例外。** **宽重构**是一个机械性变更——重命名一列、改一个共享符号的类型——其**爆炸半径**（blast radius）扩散到整个代码库，因此单次编辑会同时破坏数千个调用点，任何垂直切片都无法落地为绿色。不要强行把它塞进 tracer bullet；按 **expand–contract**（扩张–收缩）来排序。先扩张：在旧形式旁边添加新形式，什么都不破坏。然后按爆炸半径分批迁移调用点（按包、按目录），每批一张票据、被扩张票据阻塞，批次之间保持 CI 绿色，因为旧形式仍然存在。最后收缩：在没有任何调用者残留后删除旧形式，这张票据被所有迁移批次阻塞。当连批次都无法单独保持绿色时，保留这个顺序，但让它们共享一个集成分支，共同阻塞一张最终的集成验证票据——绿色只在那里被承诺。

### 4. 考问用户

把提议的拆解呈现为编号列表。对每张票据，展示：

- **标题**：简短的描述性名称
- **Blocked by**：必须先完成哪些其他票据（如果有）
- **交付内容**：这张票据使之工作的端到端行为

问用户：

- 粒度感觉合适吗？（太粗 / 太细）
- 阻塞边正确吗——每张票据是否只依赖真正卡住它的票据？
- 有没有票据应该合并或进一步拆分？

迭代直到用户批准该拆解。

### 5. 发布票据到配置好的 tracker

发布批准的票据。**方式**取决于 `/setup-simple-skills` 配置的 tracker——无论哪种方式票据都相同，只有阻塞边的形态会变化：

- **本地文件** → 在 `.scratch/<feature-slug>/issues/<NN>-<slug>.md` 下每票据写一个文件，按依赖顺序从 `01` 开始编号（阻塞方在前）。每个文件的 "Blocked by" 列出它依赖的编号/标题。使用下面的单票据文件模板——每票据一个文件，绝不使用单个合并文件。
- **真实 issue tracker（GitHub、Linear……）** → 按依赖顺序（阻塞方在前）每票据发布一个 issue，使每张票据的阻塞边可以引用真实标识符。平台有原生阻塞 / 子 issue 关系时使用它；否则把每张票据的 "Blocked by" 设为阻塞它的 issue。

从 **frontier** 开始工作：所有阻塞方都已完成的任何票据。对于纯线性链条，这意味着从上到下。

不要关闭或修改任何父 issue。

<local-ticket-template>

# <NN> — <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective — not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None — can start immediately".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

对 tracker 上父 issue 的引用（如果来源是现有 issue，否则省略本节）。

## What to build

这张票据使之工作的端到端行为，从用户的视角描述——不是逐层实现。

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- 对每个阻塞票据的引用，或 "None — can start immediately"。

</issue-template>

无论哪种形式，都避免具体文件路径或代码片段——它们很快就会过时。例外：如果原型产出了一个比散文更精确地编码决策的片段（状态机、reducer、schema、类型形态），将其内联并简要注明它来自原型。裁剪到富含决策的部分——不是可运行的 demo，只要重要的部分。
