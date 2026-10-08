# 变更：新增 diagram-html skill

## 为什么

`archify` 能产出精致的交互式图表，但它的能力建立在 ~47k 行 Node 代码之上：正交路由的 A\* 网格搜索、端口分配、文字宽度测量、四道校验门、1379 行的导出管线。这套东西无法用"只有 `.md` 文件"的 skill 复现——它需要一个构建期运行时。

但 archify 的复杂度里，**只有一小部分在解决"画图"**，绝大部分在解决"在 Node 端把几何算对"。如果把这部分搬到**浏览器运行时**，skill 自身就只需要描述数据契约与粘贴代码块。

## 什么在变

在 `skills/engineering/` 下新增 `diagram-html`：

- `SKILL.md`（121 行）——工作流、组装骨架、写 GRAPH 的规则、交付自检
- `references/styles.md`（124 行）——页面 CSS、调色板、语义 kind 枚举、图例规则
- `references/runtime.md`（226 行）——冻结的渲染与交互代码
- `references/layout-layered.md`（212 行）——architecture / workflow / dataflow
- `references/layout-timeline.md`（104 行）——sequence
- `references/layout-machine.md`（65 行）——lifecycle（layered 的预设）

同步 `skills/engineering/README.md` 与 `skills/engineering/ask-route/SKILL.md`。

## 核心决策

**几何计算搬到浏览器，而不是留在生成端。**

| | archify | diagram-html |
|---|---|---|
| 几何在哪算 | Node 编译期 | 浏览器运行时 |
| LLM 输出 | 完整 JSON IR（含坐标、路由提示） | 仅 `GRAPH`（节点/边/语义 kind） |
| 布局算法 | 自研正交网格 A\* + 端口分配 | 最长路径分层 + 重心排序 + Z 形正交 |
| 文字宽度 | `textUnits × 0.6 × fontSize` 测量 | 固定节点尺寸 + 截断 |
| 主题 | CSS 变量级联 | JS 持有调色板，颜色烤进 SVG 属性 |
| 导出 | 序列化 + CSS 内联 + 4x 栅格化（1379 行） | 直接序列化（颜色已自包含） |
| 校验 | 四道门 + headless Chrome | 无（交付前人工自检清单） |
| 产物体积 | ~760 KB | 15–21 KB |

**颜色烤进属性而非走 CSS 变量**是导出能力的关键：导出的 SVG 自带背景与配色，无需内联任何 CSS 或字体（archify 内联了 728 KB base64 字体，这是它产物体积的主要来源）。代价是切主题要重绘，由 `paint()` 承担。

**路由只有两种情形**，横段只落在层间空隙：

1. 相邻层 → Z 形正交
2. 跨层或回边 → 绕最右侧通道

因为横段只出现在层间空隙，**结构上不可能穿过节点**——这替代了 archify 的 A\* 网格搜索。

## 组件与契约

布局插件返回统一几何，运行时只消费它，因此换图类型不需要动运行时：

```
layout(graph, opts) → {
  width, height,
  nodes:     [{ id, x, y, w, h, label, sub, kind }],
  edges:     [{ from, to, label, points: [[x,y],…], variant }],
  bands:     [{ x, y, w, h, label }],        // 可选，分区/泳道
  lifelines: [{ x, y1, y2 }]                 // 可选，时序图生命线
}
```

**两个引擎 + 一个预设**（原设计预期三个引擎，实现中发现 lifecycle 就是 layered 的预设，遂合并）：

- `layoutLayered` — 覆盖 3/5 类型，168 行
- `layoutTimeline` — 59 行，几何模型与 layered 完全不同
- `layoutMachine` — 5 行，`layoutLayered({ nodeW: 152, nodeH: 46, direction: 'LR' })`

## 错误处理

运行时对残缺数据**降级而非抛错**，图必须出得来：

- `edges` 指向不存在的节点 → 静默丢弃该边（SKILL.md 把这条列为自检项，因为它不报错）
- `kind` 不在枚举内 → 落到 `neutral` 灰色
- 时序图中消息引用了未声明的参与者 → 自动补一列，但无 label 与 kind
- 空图 → 返回 320×240 的空画布

三种必炸拓扑已显式处理并测试：自环、双向往回边、环状依赖。

## 验证

环境没有浏览器，ImageMagick 的 MSVG 渲染器**只渲染 `fill`、完全忽略 `stroke`**，因此无法用它验证连线。采取的替代手段：

1. **几何断言**（Node，真实运行 md 中抽出的代码）：节点重叠、节点越界、边越界、NaN 坐标，以及 **Liang-Barsky 线段-矩形相交检测**判定"边穿过非端点节点"
2. **自绘栅格化器**：把几何直接画成 PPM → PNG，目视检查路由观感
3. **端到端组装 + `node --check`**：按 SKILL.md 骨架产出真实 HTML，抽出 `<script>` 做语法校验（整段粘贴后语法错误会直接白屏，这是首要失败模式）

三份产物（layered / timeline / machine）全部通过，其中 layered 与 machine 同时覆盖了 `TB` 与 `LR` 两个分支。

## 已知限制

- 布局保证不重叠、不越界、边不穿节点；**不保证美观**，交叉不做避让
- 不做端口分配：同节点多条边共用一个出入点，密集处重叠
- 不做文字测量：固定 180×58（layered）/ 152×46（machine）
- 无自动化测试：改动 `references/` 后必须重新生成三张图肉眼比对

## 与设计的偏离

| 设计确认时 | 实际实现 | 原因 |
|---|---|---|
| 运行时 ~160 行 | 203 行（代码行 183） | 增加 lifelines 支持（时序图必需），注释占比更高 |
| 三个布局插件 | 两个引擎 + 一个 5 行预设 | lifecycle 就是 layered 的预设，独立引擎是重复 |
| 插件 50–70 行 | layered 168 行 | 环检测、虚拟坐标、两种路由、分区背景都在其中 |
| 跨层边用虚拟节点 | 跨层边与回边统一走侧通道 | 虚拟节点产生阶梯绕行且画布膨胀；统一后代码更少、结果更可预测 |
