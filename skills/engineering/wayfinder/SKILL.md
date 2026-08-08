---
name: wayfinder
description: 把一大块超出一个 agent 会话容量的工作，规划为 issue tracker 上的决策票据共享地图，一次解决一张，直到通往目标的路径清晰。
disable-model-invocation: true
---

一个模糊的想法出现了——大到一个 agent 会话装不下，且被迷雾包裹：从这里到**目标**（destination）的路还看不见。Wayfinding 是关于找到那条路，而不是直接向目标冲锋。本 skill 把这条路绘制成仓库 issue tracker 上的**共享地图**，然后处理它的**决策票据**——解决结果是一个决定的问题，而不是要执行的构建切片——一次一张，直到路线清晰。

目标随每次努力（effort）而不同，命名它是绘制地图的第一步——它塑造每张票据。它可能是要交付并迭代的 spec、计划开始前要锁定的决定，或是像数据结构迁移这样就地完成的变更。地图是领域无关的——工程工作、课程内容，任何符合这个形态的东西都行。

## 规划，而非执行

Wayfinder 默认是**规划**：每张票据解决一个决定，当路径清晰时地图即完成——在有人去真正做那件事之前，没有剩下要决定的东西。想直接动手做工作的冲动，通常就是你已到达地图边缘、该交接了的信号。一次努力可以在其 **Notes** 中覆盖这一点——把执行带入地图本身——但在没有这种覆盖时，产出决定，而不是交付物。

## 以名字引用

每张地图和票据都是一个 issue，所以它有一个**名字**——它的标题。在人类阅读的一切内容中——叙述、地图的 Decisions-so-far——用那个名字引用它，绝不用裸 id、编号或 slug。一面 `#42, #43, #44` 的墙难以辨认；名字一目了然。id 和 URL 不会消失——名字包裹它的链接——但它们藏在名字_之内_，绝不取而代之。

## 地图

地图是仓库 issue tracker 上的单个 issue，带 `wayfinder:map` 标签——规范工件。它的票据是地图的 child issue。

地图是**索引**，不是存储。它列出已做的决定，并指向保存其细节的票据；一个决定只存在于一个地方——它的票据——所以地图从不复述它，只做摘要并链接。

**地图、它的 child 票据、阻塞和 frontier 查询在物理上存放在哪里，取决于具体 tracker。** issue tracker 应该已经提供给你了——如果没有，运行 `/setup-matt-pocock-skills`。查阅 tracker 文档的 "Wayfinding operations" 小节，了解_这个_仓库如何表达它们。如果没有提供 tracker，默认使用本地 markdown tracker。

### 地图正文

整幅地图的低分辨率视图，每个会话加载一次。未关闭的票据**不**列出——它们是未关闭的 child issue，通过查询找到。

```markdown
## Destination

<what reaching the end of this map looks like — the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a ticket.>

## Notes

<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [<closed ticket title>](link) — <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't ticket yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; closed, never graduates -->
```

### 票据

每张票据是地图的一个 **child issue**；tracker 的 issue id 是它的身份。它的正文是问题，大小适配一个 100K token 的 agent 会话：

```markdown
## Question

<the decision or investigation this ticket resolves>
```

每张票据携带一个 `wayfinder:<type>` 标签——`research`、`prototype`、`grilling`、`task` 之一（见[票据类型](#ticket-types)）。

会话通过把票据指派给驱动地图的开发者来**认领**它，**首先**，在任何工作之前，这样并发会话会跳过它。那个 assignee _就是_认领：一个未关闭、未指派的票据是未认领的。

阻塞使用 tracker 的**原生**依赖关系——这很关键，因为它在 tracker 自己的 UI 中_可视化地_呈现 frontier，让人类无需打开地图就能看到什么可以取。只有缺少原生阻塞的 tracker 才回退到正文约定。当阻塞一张票据的所有票据都关闭时，它即**解除阻塞**；**frontier** 是未关闭、未阻塞、未认领的 child——已知的边缘。

答案不是正文的一部分——它在解决时记录（见[走遍地图](#走遍地图)）。解决票据过程中产出的资产从 issue 链接，而不是粘贴进去。

## 票据类型

每张票据要么是 **HITL**——human in the loop，与为自己发言的人类_一起_处理——要么是 **AFK**，由 agent 单独驱动。HITL 票据只能通过那次实时交流来解决；agent 绝不代替人类那一方（一个自问自答的盘问 agent 已经破坏了这一点）。

- **Research**（AFK）：阅读文档、第三方 API 或知识库等本地资源，浮现一个决定所等待的事实。由 `/research` **子 agent** 解决。当需要当前工作目录之外的知识时使用。
- **Prototype**（HITL）：通过制作一个廉价、粗糙、具体的工件来提高讨论的保真度——一个大纲、一个粗略的尝试、一个 stub，或经由 /prototype skill 的 UI/逻辑代码。把原型链接为资产。当"它应该长什么样"或"它应该如何表现"是关键问题时使用。
- **Grilling**（HITL）：对话。默认情况。总是调用 /grilling 和 /domain-modeling skills。
- **Task**（HITL 或 AFK）：在_决定_做出之前必须完成的手工工作——没有什么要决定、原型化或研究的，但讨论在它完成之前被阻塞。注册一个服务以便评估它的 API、开通访问权限、移动数据以便看清它的形态。这是唯一一个_做_而不是_决定_的类型——它凭解除一个决定的阻塞而赢得位置，而不是靠交付目标。agent 能单独驱动时就单独驱动（AFK）；否则给人类一份精确的清单（HITL）。工作完成时即解决；答案记录做了什么以及后续票据依赖的任何事实（凭据位置、新 URL、行数）。

## 战争迷雾

地图是_刻意_不完整的：不要绘制你还看不见的东西。在活票据之外是**战争迷雾**——你能感觉到即将到来但还无法钉死的决定和调查的模糊视野，因为它们悬在仍未解决的问题上。解决一张票据会清除它前方的迷雾，把现在可以明确表述的东西毕业为新票据——一次一张，直到通往目标的路清晰、不再有票据剩余。

地图的 **Not yet specified** 小节是写下那个模糊视野的地方：疑似的问题、以后要重访的区域。它是_朝向_目标的未发现 frontier——这里的一切都在范围内，只是还不够清晰到能成为票据。视野允许多松就写多松、多全就写多全；它兼作给协作者阅读这次努力走向何方的路标。

**迷雾还是票据？** 检验标准是你现在能否精确陈述问题——_而不是_你现在能否回答它。

- 当问题已经足够锐利时**开票据**——即使它被阻塞、你还无法行动。
- 当你还无法那么锐利地表述时放入 **Not yet specified**。不要预先把迷雾切成票据大小的块：它比票据粗，而且当 frontier 到达时，一片迷雾可能毕业成几张票据，也可能一张都没有。

**Not yet specified** 排除已决定的（Decisions so far）、已是活票据的，以及超出范围的（下一节）。

## 超出范围

迷雾只会_朝向_目标聚集。目标固定了范围，所以超出它的工作是**超出范围的**——它不是迷雾，也不属于 **Not yet specified**。它在地图上有自己的 **Out of scope** 小节：你有意识地排除在_这次_努力之外的工作。是范围，而不是清晰度，把它放在这里。

超出范围的工作永不毕业——frontier 止于目标——所以它只有在目标被重绘时才回来，而且是作为一次新的努力，而不是恢复。

把某物判定为超出范围是一个划定范围的行为，不是路线的一步。当一张已存在的票据被发现位于目标之外——绘制时被错误地划进来，或被某个解决暴露——**关闭它**（关闭的票据明确脱离 frontier），并在 **Out of scope** 小节留一行：摘要加上为什么超出范围，链接已关闭的票据。它留在 **Decisions so far** 之外，后者记录的是实际走过的路线——范围边界不是路线上的一步。

## 调用方式

两种模式。无论哪种，**每个会话绝不多解决一张票据**——research 票据除外。

### 绘制地图

用户带着一个模糊的想法调用。

1. **命名目标。** 运行 `/grilling` 和 `/domain-modeling` 会话，钉住这幅地图要找到的路通往什么——spec、决定或变更。目标固定范围，所以最先确定。
2. **绘制 frontier。** 再次盘问，这次是**广度优先**：在整个空间上扇开，而不是在任何一条线上深入，浮现悬而未决的决定和现在就能迈出的第一步。**如果这没有浮现任何迷雾**——通往目标的路已经清晰，整个旅程小到一个会话能装下——你不需要地图。停下来问用户想如何继续。
3. **创建地图**（标签 `wayfinder:map`）：填好 Destination 和 Notes，Decisions-so-far 为空，迷雾草绘进 **Not yet specified**。
4. **创建你现在能明确的票据**，作为地图的 child issue——然后在**第二遍**中接好阻塞边（issue 需要先有 id 才能互相引用）。接线把它们分成 frontier 和被阻塞的；一切你还不能明确的留在迷雾中——**Not yet specified** 小节。
5. **发射 research 子 agent。** 对你刚创建的每张 `research` 票据，启动一个 `/research` 子 agent 并行解决它，把发现捕获在一次性的 `research/<name>` 分支上，并从票据留一个上下文指针。
6. 停下——绘制是一个会话的工作；它不亲手解决任何东西。

### 走遍地图

用户带着一幅地图（URL 或编号）调用。票据是**可选的**——没有指定时，由你来挑下一个决定，而不是用户。

1. 加载**地图**——低分辨率视图，不是每张票据的正文。
2. 选择票据。如果用户点名了一张，用它。否则按顺序取第一张 frontier 票据。**认领它**：在任何工作之前把它指派给自己。
3. 解决它——**按需放大**：按需获取任何相关或已关闭票据的完整正文；调用 `## Notes` 块点名的 skills。如有疑问，使用 `/grilling` 和 `/domain-modeling`。
4. 记录解决结果：把答案发布为**解决评论**，**关闭** issue，并向地图的 Decisions-so-far **追加一个上下文指针**。
5. 添加新浮现的票据（先创建再接边）；把答案使其可明确的任何迷雾毕业，从 **Not yet specified** 中清除每片已毕业的迷雾，让它只以新票据的形式存在。如果答案揭示某张票据——这张或另一张——位于目标之外，**把它判定为超出范围**，而不是在路线上解决它。如果该决定使地图的其他部分失效，更新或删除那些票据。

用户可能并行处理未阻塞的票据，所以要预期其他会话正在并发编辑 tracker。
