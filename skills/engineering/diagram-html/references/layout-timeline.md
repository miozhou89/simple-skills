# 布局插件：timeline（时序图）

覆盖 `sequence`。参与者成列，消息成行，时间自上而下流动。

**它和 layered 是两套完全不同的几何模型**，不能互相替代：layered 里层是"步骤"，这里列是"角色"、行才是"时间"。

```js
function layoutTimeline(graph, opts) {
  var COL = 176, ROW = 46, HEAD = 62, TOP = 34, BOTTOM = 30;
  var DEAD = 34;                       // 顶部参与者框下方、首条消息之前的留白
  // 侧边留白必须容得下参与者框的一半，否则首尾两列会溢出画布。
  var SIDE = (COL - 16) / 2 + 12;

  /* ---------- 1. 参与者：先按声明顺序建列，再让 messages 里出现但未声明的补进来 ---------- */
  var order = [], byId = {};
  function addParticipant(id, label, sub, kind) {
    if (byId[id]) return byId[id];
    byId[id] = { id: id, label: label || id, sub: sub, kind: kind || 'neutral', col: order.length, x: 0, cx: 0 };
    order.push(byId[id]);
    return byId[id];
  }
  (graph.nodes || []).forEach(function (n) {
    if (n && n.id != null) addParticipant(String(n.id), n.label, n.sub, n.kind);
  });
  (graph.edges || []).forEach(function (e) {
    if (!e) return;
    if (e.from != null) addParticipant(String(e.from));
    if (e.to != null) addParticipant(String(e.to));
  });
  if (!order.length) return { width: 360, height: 240, nodes: [], edges: [], bands: [] };

  var width = SIDE * 2 + (order.length - 1) * COL;
  order.forEach(function (p) { p.x = SIDE + p.col * COL; p.cx = p.x; });

  /* ---------- 2. 消息：按数组顺序逐行下落，y 就是时间 ---------- */
  var edges = [], y = TOP + HEAD + DEAD;
  (graph.edges || []).forEach(function (e) {
    if (!e) return;
    var a = byId[String(e.from)], b = byId[String(e.to)];
    if (!a || !b) return;                       // 悬空消息：丢弃
    var pts;
    if (a === b) {
      // 自发自收：从生命线右侧绕一个小回环
      pts = [[a.cx, y], [a.cx + 26, y], [a.cx + 26, y + 20], [a.cx, y + 20]];
    } else {
      pts = [[a.cx, y], [b.cx, y]];
    }
    edges.push({ from: a.id, to: b.id, label: e.label, variant: e.variant, points: pts });
    y += ROW;
  });

  /* ---------- 3. 参与者框 + 生命线 ---------- */
  var bottom = y - ROW + BOTTOM;
  var nodes = order.map(function (p) {
    return { id: p.id, label: p.label, sub: p.sub, kind: p.kind,
             x: p.x - COL / 2 + 8, y: TOP, w: COL - 16, h: HEAD - 18,
             cx: p.cx, cy: TOP + (HEAD - 18) / 2 };
  });
  var lifelines = order.map(function (p) {
    return { x: p.cx, y1: TOP + HEAD - 18, y2: bottom };
  });

  return { width: width, height: bottom + SIDE, nodes: nodes, edges: edges,
           bands: [], lifelines: lifelines };
}
```

## 它和 layered 的三处不同

1. **`nodes` 是参与者，不是流程步骤**；生命线走独立的 `lifelines` 字段
2. **消息顺序 = 数组顺序**，不做任何分层或排序。第 3 条消息永远在第 2 条下面
3. **`edges` 的 `label` 会画在箭头上方**，所以消息标签要短（建议 ≤ 18 字符）

## 输入约定

```json
{
  "type": "sequence",
  "title": "Cache miss request",
  "nodes": [
    { "id": "client", "label": "Client", "sub": "browser", "kind": "external" },
    { "id": "api", "label": "API", "sub": ":8000", "kind": "backend" },
    { "id": "cache", "label": "Redis", "kind": "database" }
  ],
  "edges": [
    { "from": "client", "to": "api", "label": "GET /user/42" },
    { "from": "api", "to": "cache", "label": "GET user:42" },
    { "from": "cache", "to": "api", "label": "miss", "variant": "dashed" },
    { "from": "api", "to": "cache", "label": "SET user:42" },
    { "from": "api", "to": "client", "label": "200 OK" }
  ]
}
```

## 它不会做

- **不做激活条**（activation bar）——那是 archify 的能力，这里省略
- **不做 `alt` / `loop` 分片**——需要表达分支时，把分支写成两条并列消息并在标签里注明
- **不自动补 `nodes`**：消息里出现的 id 若不在 `nodes` 中会自动补一列，但**没有 `label` 和 `kind`**，所以**显式声明所有参与者**才能得到正确配色

## 什么时候该用 layered 而不是它

如果图里有 >2 条回环消息（A→B 之后又 B→A 多次），时序图行数会迅速膨胀。这种情况说明你在画**状态流转**而不是**调用时序**，改用 `lifecycle`。
