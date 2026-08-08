---
name: codebase-design
description: 设计深模块的共享词汇。当用户想设计或改进模块接口、寻找深化机会、决定 seam 位置、让代码更可测试或更适合 AI 导航时使用，或当其他 skill 需要深模块词汇时使用。
---

# Codebase Design

设计**深模块（deep modules）**：在干净的 seam（接缝）处，用小接口承载大量行为，并且可以通过该接口测试。在任何设计或重构代码的地方使用这套语言和这些原则。目标是为调用方提供 leverage，为维护者提供 locality，为所有人提供可测试性。

## 词汇表

严格使用这些术语——不要替换成 "component"、"service"、"API" 或 "boundary"。语言一致就是全部意义所在。

**Module** — 任何有接口和实现的东西。刻意做到与规模无关：可以是函数、类、包，或横跨多个层级的切片。_避免_：unit、component、service。

**Interface** — 调用方要正确使用模块所必须知道的一切：类型签名，还有不变量、顺序约束、错误模式、所需配置和性能特征。_避免_：API、signature（太窄——它们只指类型层面的表面）。

**Implementation** — 模块内部的东西，它的代码主体。与 **Adapter** 不同：一个东西可以是「小 adapter、大实现」（一个 Postgres repo），也可以是「大 adapter、小实现」（一个内存 fake）。当话题是 seam 时用 "adapter"；否则用 "implementation"。

**Depth** — 接口处的 leverage：调用方（或测试）每学习一单位接口，能驱动多少行为。当一个模块在小接口背后坐着大量行为时，它是**深（deep）**的；当接口几乎和实现一样复杂时，它是**浅（shallow）**的。

**Seam** _（Michael Feathers）_ — 一个可以在不改动该处代码的情况下改变行为的位置；模块接口所在的*位置*。把 seam 放在哪里是一个独立的设计决策，与 seam 背后放什么相互独立。_避免_：boundary（与 DDD 的 bounded context 含义重叠）。

**Adapter** — 在 seam 处满足某个接口的具体物。它描述的是*角色*（填了哪个槽位），而不是实质（里面是什么）。

**Leverage** — 调用方从 depth 中得到的东西：每学习一单位接口，获得更多能力。一份实现在 N 个调用点和 M 个测试上获得回报。

**Locality** — 维护者从 depth 中得到的东西：变更、bug、知识和验证集中在一处，而不是散布到各个调用方。修一次，处处修好。

## 深 vs 浅

**深模块** = 小接口 + 大量实现：

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**浅模块** = 大接口 + 少量实现（应避免）：

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

设计接口时，问自己：

- 我能减少方法数量吗？
- 我能简化参数吗？
- 我能把更多复杂度藏进内部吗？

## 原则

- **Depth 是接口的属性，不是实现的属性。** 一个深模块内部可以由小的、可 mock 的、可替换的部件组合而成——它们只是不属于接口。一个模块除了在接口处的**外部 seam**之外，还可以有**内部 seam**（私属于实现，供自己的测试使用）。
- **删除测试（deletion test）。** 想象删掉这个模块。如果复杂度随之消失，它只是个透传层。如果复杂度在 N 个调用方身上重新冒出来，它就是物有所值的。
- **接口就是测试表面。** 调用方和测试穿过同一个 seam。如果你想测到接口*之后*的东西，这个模块的形状大概是错的。
- **一个 adapter 意味着假想的 seam，两个 adapter 才意味着真实的 seam。** 除非确实有东西在 seam 两侧变化，否则不要引入 seam。

## 为可测试性而设计

好的接口让测试自然发生：

1. **接受依赖，而不是创建依赖。**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **返回结果，而不是产生副作用。**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **小表面积。** 方法越少 = 需要的测试越少。参数越少 = 测试 setup 越简单。

## 关系

- 一个 **Module** 恰好有一个 **Interface**（它呈现给调用方和测试的表面）。
- **Depth** 是 **Module** 的属性，相对于其 **Interface** 度量。
- **Seam** 是 **Module** 的 **Interface** 所在的位置。
- **Adapter** 位于 **Seam** 上并满足 **Interface**。
- **Depth** 为调用方产出 **Leverage**，为维护者产出 **Locality**。

## 已否定的框架

- **把 depth 定义为实现行数与接口行数之比**（Ousterhout）：这会奖励给实现注水。我们改用 depth-as-leverage。
- **把 "interface" 理解为 TypeScript 的 `interface` 关键字或类的公有方法**：太窄——这里的 interface 包括调用方必须知道的每一个事实。
- **"Boundary"**：与 DDD 的 bounded context 含义重叠。说 **seam** 或 **interface**。

## 深入阅读

- **在依赖已定的前提下深化一个模块簇** — 见 [DEEPENING.md](DEEPENING.md)：依赖分类、seam 纪律，以及「替换而非叠加」的测试策略。
- **探索备选接口** — 见 [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md)：并行启动多个 sub-agent，用几种截然不同的方式设计接口，然后从 depth、locality 和 seam 位置上做比较。
