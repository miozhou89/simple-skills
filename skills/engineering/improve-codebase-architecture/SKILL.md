---
name: improve-codebase-architecture
description: 扫描代码库以寻找深化机会，将其呈现为可视化 HTML 报告，然后针对你选中的机会进行访谈式追问。
disable-model-invocation: true
---

# 改进代码库架构

暴露架构摩擦点，并提出**深化机会**——将浅层模块重构为深层模块。目标是可测试性与 AI 可导航性。

本命令_参考_项目的领域模型，并建立在共享的设计词汇之上：

- 运行 `/codebase-design` skill 获取架构词汇（**module**、**interface**、**depth**、**seam**、**adapter**、**leverage**、**locality**）及其原则（删除测试、"interface 即测试面"、"一个 adapter = 假设的 seam，两个 = 真实的 seam"）。在每个建议中严格使用这些术语——不要漂移成 "component"、"service"、"API" 或 "boundary"。
- `CONTEXT.md` 中的领域语言为好的 seam 提供了名称；`docs/adr/` 中的 ADR 记录了本命令不应重新争论的决策。

## 流程

### 1. 探索

**先定范围再扫描——YAGNI。** 深化模块的回报在于让未来对它的修改更容易，因此要格外关注代码库中近期改动过的部分。在动手之前先决定*去哪里*看：

- 如果用户给出了方向——某个模块、某个子系统、某个痛点——就采用它，并跳过下面的推断。
- 否则，回溯一段足够长的提交历史（`git log --oneline`）找出代码库的热点——反复出现的文件和区域——让这些路径优先吸引你的注意力。如果改动很分散、没有明显热点，就扩大搜索范围。

先阅读项目的领域术语表（`CONTEXT.md`），以及你要触及区域内的所有 ADR。

然后派生一个 sub-agent 遍历代码库。不要遵循死板的启发式规则——有机地探索，记录你遇到摩擦的地方：

- 哪里理解一个概念需要在许多小模块之间来回跳转？
- 哪些模块是**浅层的**——interface 的复杂度几乎赶上实现？
- 哪些纯函数只是为了可测试性而被抽取出来，但真正的 bug 隐藏在它们的调用方式中（没有 **locality**）？
- 哪些紧密耦合的模块跨 seam 泄漏？
- 代码库哪些部分未被测试，或难以通过其当前 interface 进行测试？

对任何你怀疑是浅层的东西应用**删除测试**：删除它会集中复杂度，还是只是转移复杂度？"会集中"就是你想要的信号。

### 2. 以 HTML 报告呈现候选项

写一个自包含的 HTML 文件到操作系统的临时目录，确保不往 repo 里落任何东西。从 `$TMPDIR` 解析临时目录，回退到 `/tmp`（Windows 上为 `%TEMP%`），写入 `<tmpdir>/architecture-review-<timestamp>.html`，使每次运行都得到一个新文件。为用户打开它——Linux 上 `xdg-open <path>`，macOS 上 `open <path>`，Windows 上 `start <path>`——并告知其绝对路径。

报告使用 **Tailwind（经 CDN）** 进行布局与样式，并在图/流/序列能可靠传达结构的地方使用 **Mermaid（经 CDN）** 绘制图表。将 Mermaid 与手工制作的 CSS/SVG 可视化混合使用——当关系呈图状（调用图、依赖、序列）时用 Mermaid，当你想要更具编辑感的东西（体量图、剖面图、折叠动画）时用手工搭建的 div/SVG。每个候选项都要有**前后对比可视化**。要视觉化。

每个候选项渲染一张卡片，包含：

- **文件**——涉及哪些文件/模块
- **问题**——为什么当前架构造成摩擦
- **方案**——用平实的语言描述会有什么变化
- **收益**——用 locality 和 leverage 来解释，以及测试会如何改善
- **前后对比图**——并排、定制绘制，展示浅层性与深化
- **推荐强度**——`Strong`、`Worth exploring`、`Speculative` 之一，以徽章形式呈现

报告以 **Top recommendation** 部分收尾：你会首先处理哪个候选项，以及原因。

**领域词汇用 CONTEXT.md 的，架构词汇用 `/codebase-design` 的。** 如果 `CONTEXT.md` 定义了 "Order"，就说 "the Order intake module"——而不是 "the FooBarHandler"，也不是 "the Order service"。

**ADR 冲突**：如果某个候选项与现有 ADR 矛盾，只有当摩擦真实到值得重新审视该 ADR 时才提出来。在卡片中清楚标注（例如一个警告提示框：_"与 ADR-0007 矛盾——但值得重新开启，因为…"_）。不要列出 ADR 禁止的每一个理论上的重构。

完整的 HTML 骨架、图表模式和样式指导见 [HTML-REPORT.md](HTML-REPORT.md)。

此时禁止提出 interface 设计。文件写完后，问用户："你想探索其中哪一个？"

### 3. 追问循环

用户选定候选项后，运行 `/grilling` skill 与他们一起走完决策树——约束、依赖、深化后模块的形态、seam 背后是什么、哪些测试能存活。

副作用随决策成形而即时发生——运行 `/domain-modeling` skill 以在过程中保持领域模型为最新：

- **用 `CONTEXT.md` 中不存在的概念为深化模块命名？** 把该术语加入 `CONTEXT.md`。如果文件不存在就惰性创建。
- **对话中某个模糊术语变得更清晰了？** 当场更新 `CONTEXT.md`。
- **用户以一个关键理由否决了候选项？** 提议一个 ADR，表述为：_"要我把这个记录为 ADR，以便未来的架构审查不再重复提出它吗？"_ 只有当理由确实会被未来的探索者需要、以避免重复提出同一建议时才提议——跳过临时性理由（"现在不值得做"）和不言自明的理由。
- **想为深化的模块探索备选 interface？** 运行 `/codebase-design` skill，并使用其 design-it-twice 并行 sub-agent 模式。
