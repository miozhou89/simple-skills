---
name: diagram-html
description: 生成自包含的单文件交互式 HTML 图表：架构图、流程图、时序图、数据流图、状态机/生命周期图。当用户要求"画个架构图""把这个流程可视化""生成时序图""把 Mermaid 转成好看的图""做个状态流转图""把这个系统的调用链路画出来"，或提供一个系统/流程/管道的文字描述并希望看到图形时使用。也适用于日常事务：请假流程、旅行计划、报销审批、租房的钱和文件怎么走、申请到哪一步了。产出可直接打开、可缩放、可切主题、可导出 SVG 的 HTML 文件，不需要任何依赖或构建步骤。不适用于数值图表和仪表盘。
---

# Diagram HTML

把一段**语义描述**编译成一个自包含的交互式 HTML 图表。

**核心分工：你只写数据，几何由代码算。** 不要去猜坐标、不要手绘 SVG 路径、不要调整算法。渲染与布局的代码在 `references/` 里，**原样复制粘贴**即可。你唯一要创作的东西是一个 `GRAPH` 对象。

## 快速路径

1. 从问题判断图类型（见下方决策表），歧义时选更贴近"读者要回答什么问题"的那个。
2. 读对应的布局参考：`references/layout-layered.md`（架构/流程/数据流）、`layout-timeline.md`（时序）、`layout-machine.md`（状态机）。**只读相关的那一个**。
3. 写 `GRAPH`——节点、边、语义 kind。**这是唯一需要动脑的步骤。**
4. 按下方骨架组装 HTML：`styles.md` 的 CSS 与 `PALETTE`、`runtime.md` 的整段、布局插件整段、你的 `GRAPH`。
5. 交付前跑一遍自检清单。

## 类型决策表

| 类型 | 回答什么问题 | 布局 | 方向 |
|---|---|---|---|
| `architecture` | 系统由哪些部分组成、谁连着谁 | layered | `TB` |
| `workflow` | 事情按什么顺序发生、在哪一步卡住 | layered | `LR` |
| `dataflow` | 数据从哪来、经过什么、到哪去 | layered | `LR` |
| `sequence` | 谁在什么时刻对谁说了什么 | timeline | 固定自上而下 |
| `lifecycle` | 一个东西现在处于什么状态、能去哪 | machine | `LR` |

判断不准时问自己：**读者要回答的是什么问题？** "有哪些组件"→architecture；"下一步是什么"→workflow/lifecycle；"按时间发生了什么"→sequence。

## 组装骨架

严格照这个结构，**只替换方括号里的内容**：

```html
<!DOCTYPE html>
<html lang="zh" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>[标题]</title>
<style>
[styles.md 第 1 节的 CSS，原样]
</style>
</head>
<body>
<header>
  <h1>[标题]</h1>
  <p>[一句话副标题]</p>
  <div class="bar">
    <button id="b-theme">主题</button>
    <button id="b-fit">适配</button>
    <button id="b-svg">SVG</button>
  </div>
</header>
<div id="stage"></div>
<footer>[图例或说明，见 styles.md 第 4 节]</footer>
<script>
[styles.md 第 2 节的 PALETTE，原样]
[runtime.md 的整段，原样]
[layout-<类型>.md 的整段，原样]
var GRAPH = { /* 你写的 */ };
var app = DiagramLite.boot(GRAPH, layoutLayered, { mount: '#stage' });
document.getElementById('b-theme').onclick = function () {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  app.theme(dark ? 'light' : 'dark');
};
document.getElementById('b-fit').onclick = function () { app.fit(); };
document.getElementById('b-svg').onclick = function () { app.export(); };
</script>
</body>
</html>
```

`boot` 的第二个参数就是布局函数名：`layoutLayered` / `layoutTimeline` / `layoutMachine`。
按钮文案用与用户相同的语言。若用户要的是静态图，删掉 `.bar` 三个按钮即可，其余不动。

## 写好 GRAPH 的六条规则

1. **`kind` 必须来自枚举**（见 `styles.md` 第 3 节）。自造 kind 会静默变成灰色，语义就丢了。
2. **`edges` 的 `from`/`to` 必须存在于 `nodes`**。写错的边会被静默丢弃——图能出来，但信息少了，而你不会收到报错。
3. **`nodes` 数组顺序有语义**（layered/machine）：同层节点的左右次序由它起始。按阅读顺序写。
4. **标签要短**。节点标签建议 ≤ 14 字符、`sub` ≤ 18、边标签 ≤ 18。超长会被截断成 `…`，信息就丢了。
5. **不要写 >2 层跨度的边**。它会绕到画布外侧，读起来费劲。要么补一个中间节点，要么承认这两个东西没有直接关系。
6. **终端状态用 `start`/`success`/`failure`**（lifecycle），让出口一眼可见。

## 交付前自检

逐条核对，**任何一条不过就修 GRAPH 而不是改代码**：

- [ ] 每条 `edges` 的 `from`/`to` 都能在 `nodes` 里找到
- [ ] 每个 `kind` 都在枚举里
- [ ] 没有超过 2 层跨度的边（有就补中间节点）
- [ ] 同层节点 ≤ 6 个，回边 ≤ 3 条（超了就考虑拆图）
- [ ] 节点总数 ≤ 20（超了先问用户是否拆分，而不是硬画）
- [ ] 三种以上 kind 时有图例
- [ ] 标题和副标题说明了这张图回答什么问题
- [ ] **实际在浏览器里打开过**——不要声称看过没看过的效果

## 边界与诚实

- 布局**不保证美观**：它保证不重叠、不越界、边不穿过节点。交叉是允许的，不做避让。
- 长边的外侧绕行、密集处箭头重叠是这个方案的已知代价，别把它们说成特性。
- 没有自动化测试。**改动 `references/` 里的代码后，必须重新生成至少三张图（layered / timeline / machine 各一）肉眼比对**，否则不要改。
- 无法验证视觉效果时（没有浏览器），如实说明"未做视觉确认"，只报告几何约束。

## 参考文件

| 文件 | 何时读 |
|---|---|
| `references/styles.md` | **每次都要**——CSS、调色板、kind 枚举、图例规则 |
| `references/runtime.md` | **每次都要**——冻结的渲染与交互代码，原样粘贴 |
| `references/layout-layered.md` | architecture / workflow / dataflow |
| `references/layout-timeline.md` | sequence |
| `references/layout-machine.md` | lifecycle（依赖 layered，**粘贴顺序在其后**） |

## 输出

返回 HTML 的绝对路径、图类型、节点与边数量、以及你实际验证了什么（几何 / 浏览器 / 都没验）。不要用"已完成"这类无信息量的话收尾。
