# CONTEXT.md 格式

## 结构

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## 规则

- **要有主见。** 同一个概念存在多个词时，挑出最好的那个，把其余列在 `_Avoid_` 下。
- **定义要收紧。** 最多一两句话。定义它*是什么*，而不是它*做什么*。
- **只收录本项目 context 特有的术语。** 通用编程概念（超时、错误类型、工具模式）即使项目大量使用也不收录。添加术语前先问：这是这个 context 独有的概念，还是通用编程概念？只有前者够格。
- **出现自然簇时用子标题分组。** 如果所有术语都属于单一聚合的领域，平铺列表也可以。

## 单 context vs 多 context 的 repo

**单 context（大多数 repo）：** repo 根目录一个 `CONTEXT.md`。

**多 context：** repo 根目录的 `CONTEXT-MAP.md` 列出各个 context、它们的位置以及相互关系：

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

skill 会推断适用哪种结构：

- 如果 `CONTEXT-MAP.md` 存在，读它来定位各个 context
- 如果只有根目录的 `CONTEXT.md`，就是单 context
- 如果都不存在，在第一个术语敲定时惰性创建根目录的 `CONTEXT.md`

存在多个 context 时，推断当前话题与哪个相关。不清楚就问。
