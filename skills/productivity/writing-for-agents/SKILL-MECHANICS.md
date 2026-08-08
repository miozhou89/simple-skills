# Skill 机制

[`writing-for-agents`](SKILL.md) 中 skill 特有的分支：当文档是一个 skill 时有什么变化——frontmatter、调用方式选择，以及路由 skill。其余所有写法都是 `SKILL.md` 中的通用参考。

## 调用方式

两种选择，在两种负荷之间权衡：

- 一个 **model-invoked** skill 保留 `description`，因此 agent 可以自主触发它——其他 skill 也能触达它。你仍然可以输入它的名字：model-invocation 始终_包含_用户触达；description 只会增加 agent 的发现渠道，从不剥夺人类的。description 是这个 skill 的顶层上下文指针，被迫始终常驻加载——用永久的上下文负荷换取可发现性。一个内容全是参考的 model-invoked skill 也可作为共享参考的存放处：其他 skill 可以调用它，于是多个 skill 都需要的参考可以住在一个地方。机制：省略 `disable-model-invocation`，并撰写一条面向模型的 description，承载各触发分支（`SKILL.md` 中的指针写作规则全部适用）。
- 一个 **user-invoked** skill 把 description 从 agent 的触达范围中剥掉：只有人类输入它的名字才能调用它，其他 skill 也不行。零上下文负荷，但花费认知负荷——你就是那个必须记住它存在的索引。机制：设置 `disable-model-invocation: true`；`description` 变为面向人类——一行摘要，剥掉触发词列表。

只有当 agent 必须自行触达这个 skill，或另一个 skill 必须触达它时，才选 model-invocation。如果它永远只靠手动触发，就做成 user-invoked，不付任何上下文负荷。

两个 user-invoked skill 都需要的共享参考两边都放不下——没有 description，谁也触发不了谁。把它推到 skill 系统之外的普通文件：任何 skill 都能指向的外部参考。

## 按调用方式拆分

拆分中的调用方式切分（顺序切分在 `SKILL.md` 中）：当你有一个应当独立触发它的、与众不同的主导词——一个你确实会在提示中使用的触发词——或另一个 skill 必须触达它时，拆出一个 model-invoked skill。你要为新的常驻 description 支付上下文负荷，所以那份独立触达必须值得这份代价。

## 路由 skill

当 user-invoked skill 多到你记不住时，堆积起来的认知负荷由一个**路由 skill（router skill）**来治愈：一个 user-invoked skill，点名其他 skill 以及何时取用每一个，于是人类只需记住一个 skill 而不是许多个。它只能提示，永远不能触发它们：user-invoked skill 没有 description，所以除了人类没有任何东西能触达它们。
