# 布局插件：layered（分层有向图）

覆盖 `architecture` / `workflow` / `dataflow`。产出分层图，方向由 `direction` 决定。

**路由只有两种情形**，这是它这么短的原因：

1. **相邻层** → Z 形正交（下、横、下），横段走层间空隙中线
2. **跨层或回边** → 绕到最右侧通道，横段只走层间空隙

两种情形的横段都**只出现在层间空隙里**，所以结构上不可能穿过节点——不需要 A\* 网格搜索，也不需要端口分配。

代价：它不做美观优化。**节点在同层内的次序由 `nodes` 数组顺序决定**（再经重心法微调），所以数组顺序是有意义的输入。

```js
function layoutLayered(graph, opts) {
  opts = opts || {};
  var TB = (opts.direction || graph.direction || 'TB') !== 'LR';
  var NW = opts.nodeW || 180, NH = opts.nodeH || 58;
  var ADV = TB ? NH + 78 : NW + 90;      // 层间距（含节点自身尺寸）
  var CROSS = TB ? NW + 34 : NH + 26;    // 同层间距
  var NODE_CROSS = TB ? NW : NH;
  var GAP = ADV - (TB ? NH : NW);        // 层间空隙
  var PAD = 34, CHAN = 30, CHAN_GAP = 12;

  /* ---------- 1. 建节点表；悬空边直接丢弃 ---------- */
  var byId = {}, real = [];
  (graph.nodes || []).forEach(function (n) {
    if (!n || n.id == null) return;
    var id = String(n.id);
    byId[id] = { id: id, label: n.label || id, sub: n.sub, kind: n.kind || 'neutral',
                 w: NW, h: NH, x: 0, y: 0, cx: 0, cy: 0 };
    real.push(byId[id]);
  });
  if (!real.length) return { width: 320, height: 240, nodes: [], edges: [], bands: [] };

  var out = {}, inn = {};
  real.forEach(function (n) { out[n.id] = []; inn[n.id] = []; });
  var links = [];
  (graph.edges || []).forEach(function (e) {
    if (!e || !byId[e.from] || !byId[e.to]) return;
    var lk = { from: String(e.from), to: String(e.to), label: e.label, variant: e.variant };
    out[lk.from].push(lk.to); inn[lk.to].push(lk.from);
    links.push(lk);
  });

  /* ---------- 2. DFS 找回边，同时得到拓扑序 ---------- */
  var color = {}, back = {}, topo = [];
  function dfs(u) {
    color[u] = 1;
    out[u].forEach(function (v) {
      if (color[v] === 1) { back[u + '>' + v] = 1; return; }
      if (!color[v]) dfs(v);
    });
    color[u] = 2; topo.push(u);
  }
  real.forEach(function (n) { if (!color[n.id]) dfs(n.id); });
  topo.reverse();

  /* ---------- 3. 最长路径分层：忽略回边，环自然断开 ---------- */
  var layer = {};
  topo.forEach(function (v) {
    var L = 0;
    inn[v].forEach(function (u) { if (!back[u + '>' + v]) L = Math.max(L, (layer[u] || 0) + 1); });
    layer[v] = L;
  });

  /* ---------- 4. 同层排序：重心法，四趟上下交替 ---------- */
  var maxL = 0;
  Object.keys(layer).forEach(function (id) { maxL = Math.max(maxL, layer[id]); });
  var layers = [];
  for (var i = 0; i <= maxL; i++) layers.push([]);
  real.forEach(function (n) { layers[layer[n.id]].push(n.id); });

  // 只有相邻层边参与排序，跨层边不左右排序结果。
  var pred = {}, succ = {};
  real.forEach(function (n) { pred[n.id] = []; succ[n.id] = []; });
  links.forEach(function (lk) {
    if (lk.from === lk.to || back[lk.from + '>' + lk.to]) return;
    if (layer[lk.to] !== layer[lk.from] + 1) return;
    succ[lk.from].push(lk.to); pred[lk.to].push(lk.from);
  });
  for (var pass = 0; pass < 4; pass++) {
    var down = pass % 2 === 0;
    for (var k = 0; k <= maxL; k++) {
      var li = down ? k : maxL - k, ref = down ? li - 1 : li + 1;
      if (ref < 0 || ref > maxL) continue;
      var idx = {};
      layers[ref].forEach(function (id, j) { idx[id] = j; });
      layers[li].forEach(function (id, j) {
        var nb = (down ? pred : succ)[id].filter(function (x) { return idx[x] != null; });
        // 无邻居时保持原位：赋一个极大值会把它一路沉底，破坏已收敛的次序。
        id._b = nb.length ? nb.reduce(function (s, x) { return s + idx[x]; }, 0) / nb.length : j;
      });
      // 稳定排序处理并列。不要在这里读回 indexOf——数组正在被排序。
      layers[li].sort(function (a, b) { return byId[a]._b - byId[b]._b; });
    }
  }

  /* ---------- 5. 坐标：主轴按层推进，副轴层内居中 ---------- */
  var extent = layers.map(function (ids) {
    return ids.length ? (ids.length - 1) * CROSS + NODE_CROSS : 0;
  });
  var maxExt = Math.max.apply(null, extent.concat([NODE_CROSS]));
  layers.forEach(function (ids, li) {
    var shift = PAD + (maxExt - extent[li]) / 2;
    ids.forEach(function (id, j) {
      var n = byId[id];
      n.x = TB ? shift + j * CROSS : PAD + li * ADV;
      n.y = TB ? PAD + li * ADV : shift + j * CROSS;
      n.cx = n.x + NW / 2;
      n.cy = n.y + NH / 2;
    });
  });

  /* ---------- 6. 路由 ---------- */
  var edges = [], chan = 0;
  function dedupe(pts) {
    var out = [];
    pts.forEach(function (p) {
      var q = out[out.length - 1];
      if (!q || Math.abs(q[0] - p[0]) > 0.5 || Math.abs(q[1] - p[1]) > 0.5) out.push(p);
    });
    return out;
  }
  // 层 L 上/下方空隙的中线
  function above(L) { return PAD + L * ADV - GAP / 2; }
  function below(L) { return PAD + L * ADV + (TB ? NH : NW) + GAP / 2; }
  function channel() { chan += 1; return PAD + maxExt + CHAN + chan * CHAN_GAP; }

  links.forEach(function (lk) {
    var u = byId[lk.from], v = byId[lk.to], pts, ch;
    if (lk.from === lk.to) {
      // 自环：走节点前方的层间空隙，紧贴节点，不会撞到同层邻居。
      pts = TB
        ? [[u.cx + u.w * 0.22, u.y + u.h], [u.cx + u.w * 0.22, u.y + u.h + 24],
           [u.cx - u.w * 0.22, u.y + u.h + 24], [u.cx - u.w * 0.22, u.y + u.h]]
        : [[u.x + u.w, u.cy - u.h * 0.22], [u.x + u.w + 24, u.cy - u.h * 0.22],
           [u.x + u.w + 24, u.cy + u.h * 0.22], [u.x + u.w, u.cy + u.h * 0.22]];
    } else if (!back[lk.from + '>' + lk.to] && layer[lk.to] === layer[lk.from] + 1) {
      // 相邻层：Z 形。横段落在两层的空隙中线上。
      var s = TB ? [u.cx, u.y + u.h] : [u.x + u.w, u.cy];
      var t = TB ? [v.cx, v.y] : [v.x, v.cy];
      var mid = TB ? (s[1] + t[1]) / 2 : (s[0] + t[0]) / 2;
      pts = [s];
      var offset = TB ? Math.abs(s[0] - t[0]) : Math.abs(s[1] - t[1]);
      if (offset > 0.5) pts.push(TB ? [s[0], mid] : [mid, s[1]], TB ? [t[0], mid] : [mid, t[1]]);
      pts.push(t);
    } else {
      // 跨层或回边：绕最右侧通道。竖段在画布外沿，横段全部落在层间空隙里。
      var start = layer[lk.to] > layer[lk.from]
        ? (TB ? [u.cx, u.y + u.h] : [u.x + u.w, u.cy])      // 向下：从底边出
        : (TB ? [u.cx, u.y] : [u.x, u.cy]);                 // 向上：从顶边出
      var startGap = layer[lk.to] > layer[lk.from] ? below(layer[lk.from]) : above(layer[lk.from]);
      var endGap = above(layer[lk.to]);
      ch = channel();
      pts = TB
        ? [start, [u.cx, startGap], [ch, startGap], [ch, endGap], [v.cx, endGap], [v.cx, v.y]]
        : [start, [startGap, u.cy], [startGap, ch], [endGap, ch], [endGap, v.cy], [v.x, v.cy]];
    }
    edges.push({ from: lk.from, to: lk.to, label: lk.label, variant: lk.variant, points: dedupe(pts) });
  });

  /* ---------- 7. 泳道/分区背景 ---------- */
  var bands = [];
  (graph.bands || []).forEach(function (b) {
    if (!b || !b.layers) return;
    var lo = Math.max(0, Math.min(b.layers[0], b.layers[1]));
    var hi = Math.min(maxL, Math.max(b.layers[0], b.layers[1]));
    if (hi < lo) return;
    var a = PAD + lo * ADV - 20, z = PAD + hi * ADV + (TB ? NH : NW) + 20;
    bands.push(TB
      ? { x: PAD - 18, y: a, w: maxExt + 36, h: z - a, label: b.label }
      : { x: a, y: PAD - 18, w: z - a, h: maxExt + 36, label: b.label });
  });

  var selfLoops = links.filter(function (l) { return l.from === l.to; }).length;
  var W = PAD * 2 + maxExt + (chan ? chan * CHAN_GAP + CHAN : 0);
  var H = PAD * 2 + maxL * ADV + (TB ? NH : NW);
  if (selfLoops && TB) H += 24;   // 自环从末层节点下方探出，画布要给够
  return { width: TB ? W : H, height: TB ? H : W, nodes: real, edges: edges, bands: bands };
}
```

## 输入约定

| 字段 | 作用 |
|---|---|
| `direction` | `"TB"`（默认，自上而下）或 `"LR"`（从左到右）。**流程与数据流用 `LR` 更易读**，架构图用 `TB` |
| `nodes[].kind` | 决定颜色，取值见 styles.md 的枚举 |
| `nodes[].sub` | 节点副标题，一行小字，例如端口、技术栈 |
| `nodes` 顺序 | **有语义**：同层节点的左右次序由它起始 |
| `bands[]` | 可选分区：`{ label, layers: [起始层, 结束层] }`，层号从 0 起 |
| `edges[].variant` | 可选 `"emphasis"`（加粗）或 `"dashed"`（虚线） |

## 它会替你处理

自环、双向往返边、跨越任意层的长边、环状依赖（DFS 自动断环并把回边绕到外侧通道）。

## 它不会做

- **不让线互相避让**——两条线交叉就是交叉，不做 archify 那种"遮断"处理
- **不做端口分配**——同一节点上多条边共用同一个出入点，密集处会重叠
- **不做文字测量**——节点固定 180×58，超长标签由运行时截断为 `…`

## 什么时候该换写法

| 症状 | 对策 |
|---|---|
| 跨 2 层以上的边多，右侧通道挤成一团 | 给长边补一个显式中间节点，让它变成两段相邻层边 |
| 同层超过 6 个节点 | 拆成两张图，或改用 `LR` |
| 回边超过 3 条 | 考虑改用 `lifecycle` 类型表达状态流转 |
