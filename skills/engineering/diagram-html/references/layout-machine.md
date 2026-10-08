# 布局插件：machine（状态机 / 生命周期）

覆盖 `lifecycle`。

**它不是独立引擎**——状态机就是分层有向图，`layered` 已经处理了自环（重试）和回边（回滚）。这里只是换一组更适合状态节点的默认参数。

```js
function layoutMachine(graph, opts) {
  // 状态节点比架构节点矮而窄，横向铺开更贴合"状态流转"的阅读习惯。
  return layoutLayered(graph, { nodeW: 152, nodeH: 46, direction: graph.direction || 'LR' });
}
```

**注意**：它依赖 `layoutLayered` 在同一个 `<script>` 作用域内，所以**粘贴顺序必须是 layered 在前、machine 在后**。

## 用 `kind` 表达状态语义

| kind | 状态含义 |
|---|---|
| `start` | 起始状态（收到请求、订单创建） |
| `success` | 成功终态（已交付、已通过） |
| `failure` | 失败/取消终态（已拒绝、超时） |
| `neutral` | 中间状态 |

终端状态用 `success` / `failure` 会让它在图上自然"落点"，读者一眼能看到流程有几个出口。

## 输入示例

```json
{
  "type": "lifecycle",
  "title": "Deployment release",
  "direction": "LR",
  "nodes": [
    { "id": "queued",   "label": "Queued",    "sub": "waiting",     "kind": "start" },
    { "id": "building", "label": "Building",  "sub": "CI runner",   "kind": "neutral" },
    { "id": "testing",  "label": "Testing",   "sub": "e2e + unit",  "kind": "neutral" },
    { "id": "staging",  "label": "Staging",   "sub": "canary 5%",   "kind": "neutral" },
    { "id": "live",     "label": "Live",      "sub": "100% traffic","kind": "success" },
    { "id": "rolled",   "label": "Rolled back","sub": "alert fired","kind": "failure" }
  ],
  "edges": [
    { "from": "queued",   "to": "building" },
    { "from": "building", "to": "testing" },
    { "from": "testing",  "to": "staging" },
    { "from": "staging",  "to": "live",     "label": "promote" },
    { "from": "staging",  "to": "rolled",   "label": "error rate" },
    { "from": "testing",  "to": "building", "label": "failed", "variant": "dashed" },
    { "from": "building", "to": "building", "label": "retry",  "variant": "dashed" }
  ]
}
```

## 什么时候状态机会画得很难看

`layered` 把回边绕到画布最右侧的通道。**回边超过 3 条时右侧会挤成一束**，因为每条回边占一个通道。

对策，按优先级：

1. **优先表达主路径**——把次要的失败/重试边删掉，或用文字在图例里说明
2. **改成 `TB`**——竖向布局时回边通道变成横向绕行，通常比横向布局宽松
3. **拆图**——把"正常流程"和"异常流程"画成两张

不要试图在一张图里表达所有状态与所有转移。状态机图的价值在于**让人看到主干和出口**，而不是穷举。
