# HTML 报告格式

架构审查渲染为操作系统临时目录中的一个自包含 HTML 文件。Tailwind 和 Mermaid 都来自 CDN。Mermaid 能可靠地处理图状图表；手工搭建的 div 和内联 SVG 处理更具编辑感的可视化（体量图、剖面图）。两者混合使用——不要什么都依赖 Mermaid，那样会开始显得千篇一律。

## 骨架

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review — {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* small custom layer for things Tailwind doesn't cover cleanly:
         dashed seam lines, hand-drawn-feeling arrow heads, etc. */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## 页头

repo 名、日期，以及一个紧凑的图例：实线框 = module，虚线 = seam，红色箭头 = 泄漏，粗体深色框 = 深模块。不写引言段落——直接进入候选项。

## 候选项卡片

图表承担主要表达。文字要稀疏、平实，直截了当地使用（来自 `/codebase-design` skill 的）术语表词汇。

每个候选项是一个 `<article>`：

- **标题**——简短，点明这次深化（例如 "Collapse the Order intake pipeline"）。
- **徽章行**——推荐强度（`Strong` = emerald，`Worth exploring` = amber，`Speculative` = slate），外加依赖类别的标签（`in-process`、`local-substitutable`、`ports & adapters`、`mock`）。
- **文件**——等宽字体列表，`font-mono text-sm`。
- **前后对比图**——核心部分。两列并排。模式见下文。
- **问题**——一句话。痛在哪里。
- **方案**——一句话。改什么。
- **收益**——项目符号，每条 ≤6 个词。例如 "Tests hit one interface"、"Pricing logic stops leaking"、"Delete 4 shallow wrappers"。
- **ADR 提示**（如适用）——一行，放在琥珀色调的框中。

不要成段的解释。如果一张图需要一段文字才能看懂，就重画这张图。

## 图表模式

选择适合该候选项的模式。混合使用。不要让每张图都长一个样——多样性本身就是目的的一部分。

### Mermaid 图（依赖/调用流的主力）

当要点是 "X 调用 Y 调用 Z，看看这一团乱麻" 时，使用 Mermaid `flowchart` 或 `graph`。把它包在 Tailwind 样式的卡片里，免得显得像空降的。用 classDef 设置样式：泄漏的边染成红色，深模块用深色。序列图很适合表达 "改前：6 次往返；改后：1 次"。

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### 手工搭建的框与箭头（当 Mermaid 的布局和你作对时）

模块用带边框和标签的 `<div>`。箭头用内联 SVG 的 `<line>` 或 `<path>` 元素，绝对定位在相对容器之上。当你想让 "改后" 图呈现为一个粗边框的深模块、内部细节灰显时用这个——Mermaid 渲染不出那种分量感。

### 剖面图（适合分层浅层性）

堆叠横向条带（`h-12 border-l-4`）展示一次调用穿过的层。改前：6 个薄层，每层什么都没做。改后：1 个厚条带，标注着合并后的职责。

### 体量图（适合 "interface 与实现一样宽"）

每个模块两个矩形——一个代表 interface 表面积，一个代表实现。改前：interface 矩形几乎和实现矩形一样高（浅）。改后：interface 矩形很矮，实现矩形很高（深）。

### 调用图折叠

改前：以嵌套框渲染的函数调用树。改后：同一棵树折叠成一个框，现已内部化的调用以淡化形式显示在其中。

## 样式指导

- 偏编辑感，而非企业仪表盘。留白要大方。标题可选衬线字体（`font-serif` 与 stone/slate 搭配很好）。
- 克制用色：一个强调色（emerald 或 indigo），红色表示泄漏，琥珀色表示警告。
- 图表高度保持 ~320px，让前后对比能舒适地并排、无需滚动。
- 图内模块标签使用 `text-xs uppercase tracking-wider`——它们应读起来像示意图，而不是 UI。
- 仅有的脚本是 Tailwind CDN 和 Mermaid ESM 导入。报告其余部分完全静态——没有应用代码，除了 Mermaid 自身的渲染外没有交互。

## 首要推荐部分

一张更大的卡片。候选项名称、一句话说明原因、指向其卡片的锚点链接。仅此而已。

## 语气

平实的语言，简洁——但架构名词和动词直接取自 `/codebase-design` skill。简洁不是漂移的借口。

**严格使用：** module、interface、implementation、depth、deep、shallow、seam、adapter、leverage、locality。

**绝不可替代：** component、service、unit（替代 module）· API、signature（替代 interface）· boundary（替代 seam）· layer、wrapper（当你意思是 module 时）。

**符合风格的表述：**

- "Order intake module is shallow — interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**收益条目**用术语表词汇点名收益：*"locality: bugs concentrate in one module"*、*"leverage: one interface, N call sites"*、*"interface shrinks; implementation absorbs the wrappers"*。不要写 *"easier to maintain"* 或 *"cleaner code"*——这些词不在术语表里，不配占用位置。

不含糊其辞，不铺垫，不写 "it's worth noting that…"。如果一句话能改成条目，就改成条目。如果一个条目能删，就删掉。如果某个词不在 `/codebase-design` 术语表里，先从表里找一个，而不是发明新词。
