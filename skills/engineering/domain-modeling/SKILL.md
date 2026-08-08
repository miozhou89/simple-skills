---
name: domain-modeling
description: 构建并打磨项目的领域模型。当用户想敲定领域术语或统一语言（ubiquitous language）、记录架构决策时使用，或当其他 skill 需要维护领域模型时使用。
---

# 领域建模（Domain Modeling）

在设计过程中主动构建并打磨项目的领域模型。这是*主动*的纪律——挑战术语、发明边缘场景、在词汇表和决策成形的那一刻把它们写下来。（仅仅*阅读* `CONTEXT.md` 获取词汇不是本 skill——那是任何 skill 都该有的一行习惯。本 skill 用于你在改变模型的时候，而不只是消费它。）

## 文件结构

大多数 repo 只有一个 context：

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

如果根目录存在 `CONTEXT-MAP.md`，说明该 repo 有多个 context。map 会指出每个 context 的位置：

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

惰性创建文件——只在有东西要写时才创建。如果 `CONTEXT.md` 不存在，在第一个术语敲定时创建它。如果 `docs/adr/` 不存在，在需要第一个 ADR 时创建它。

## 会话期间

### 对照词汇表发起挑战

当用户使用的术语与 `CONTEXT.md` 中已有的语言冲突时，立刻指出。"你的词汇表把 'cancellation' 定义为 X，但你似乎指的是 Y——到底是哪个？"

### 磨利模糊语言

当用户使用含糊或一词多义的术语时，提出一个精确的规范术语。"你说的是 'account'——你指的是 Customer 还是 User？它们是不同的东西。"

### 讨论具体场景

讨论领域关系时，用具体场景做压力测试。发明能探测边缘情况的场景，迫使用户把概念之间的边界讲精确。

### 与代码交叉核对

当用户陈述某物如何工作时，检查代码是否同意。如果发现矛盾，摆到台面上："你的代码会取消整个 Order，但你刚说部分取消是可能的——哪个是对的？"

### 就地更新 CONTEXT.md

一个术语敲定时，当场更新 `CONTEXT.md`。不要攒批——随发生随记录。使用 [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应当完全不沾实现细节。不要把 `CONTEXT.md` 当作 spec、草稿纸或实现决策的仓库。它是词汇表，仅此而已。

### 克制地提议 ADR

只有当以下三条全部成立时，才提议创建 ADR：

1. **难以逆转** — 日后改主意的代价是有分量的
2. **没有上下文会令人意外** — 未来的读者会好奇"他们当时为什么这么做？"
3. **真实权衡的产物** — 确实存在过真正的备选方案，而你出于具体原因选了其中一个

三条缺任何一条，就跳过 ADR。使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 中的格式。
