## What it does

用户提出需求时引导其走完整个开发流程的编排器。它把「设计 → 规格 → 票据 → 实施 → 评审 → 维护」这条流水线映射到对应 skill，在每一步告诉 agent 该调用哪个 `/skill`。它不是又一层工作，而是一张将现有 skills 按开发阶段组织起来的地图。

**定义性约束**：它只负责路由，不亲自干活——每个阶段的实际工作由被路由到的 skill 完成。

## When to reach for it

- **调用方式**：键入 `/<name>`，或当用户提出需求、新功能、方案设计、实现请求时，agent 自动取用它。
- **触发边界**：用户提出一个需求并要方案设计或开发时。若是纯 brainstorm 想法、临时 bug、或代码评审请求，直接使用对应的 skill，不必先过整条流程。

## It's working if

- 用户提出需求后，对话被带入清晰的阶段推进，而不是直接开始写代码。
- 每阶段都落在具体 skill 上，用户知道下一步该运行什么。
- 小改动被合理地跳过设计与票据阶段，而不是机械地走完全程。

## Where it fits

- **角色**：主流程的**链式编排**（`requirement-workflow` → `implement` → `code-review`），与 ask-route 同级但更具体——ask-route 回答"该用哪个 skill"，它回答"这个需求该怎么走"。
- **邻居**：to-spec 承接设计产物，to-tickets 把 spec 拆成票据，implement 消费票据。
- **地图**：整套路由由 ask-route 统领；本 skill 是这条主流程的具象化。
