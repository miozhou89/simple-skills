# 视觉层：调色板与页面外壳

产物 HTML 从这里取两段：`<style>` 里的页面 CSS，以及 `<script>` 顶部的 `PALETTE` 对象。

**颜色分两层，不要混淆：**

- **页面外壳**（工具栏、背景、按钮）走 CSS 自定义属性，由 `<html data-theme>` 驱动。
- **图内元素**（节点、边、标签）的颜色由运行时**烤成 SVG 属性**，不依赖 CSS。

第二层是刻意的：这样导出的 SVG 自带背景与颜色，任何环境打开都正确，**导出时无需内联任何 CSS 或字体**。代价是切换主题要重新渲染——运行时的 `paint()` 已经处理了。

## 1. 页面 CSS

整段粘进产物的 `<style>`。

```css
:root { color-scheme: dark light; }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
html[data-theme="dark"] {
  --bg: #020617; --panel: #0f172a; --ink: #f8fafc; --muted: #94a3b8;
  --dim: #475569; --line: #1e293b; --accent: #22d3ee;
}
html[data-theme="light"] {
  --bg: #f8fafc; --panel: #ffffff; --ink: #0f172a; --muted: #64748b;
  --dim: #94a3b8; --line: #e2e8f0; --accent: #0891b2;
}
body {
  background: var(--bg); color: var(--ink);
  font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  -webkit-font-smoothing: antialiased;
  display: flex; flex-direction: column;
}

header {
  display: flex; align-items: baseline; gap: 1rem;
  padding: 1rem 1.25rem .75rem; border-bottom: 1px solid var(--line);
}
header h1 { font-size: 1rem; font-weight: 600; margin: 0; letter-spacing: -.01em; }
header p { margin: 0; color: var(--muted); font-size: 12px; }

.bar { display: flex; gap: .5rem; margin-left: auto; }
.bar button {
  font: inherit; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
  color: var(--muted); background: var(--panel);
  border: 1px solid var(--line); border-radius: 6px;
  padding: .35rem .6rem; cursor: pointer;
}
.bar button:hover { color: var(--ink); border-color: var(--accent); }
.bar button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

#stage { flex: 1; min-height: 0; overflow: hidden; cursor: grab; }
#stage.dragging { cursor: grabbing; }
#stage svg { display: block; width: 100%; height: 100%; }

/* 聚焦：非邻域元素退到背景。用透明度而非颜色，因此与烤进 SVG 的配色不冲突。 */
#stage svg.has-focus [data-node]:not(.is-lit),
#stage svg.has-focus [data-edge]:not(.is-lit),
#stage svg.has-focus [data-band] { opacity: .18; }
#stage svg [data-node] { cursor: pointer; }

footer { padding: .5rem 1.25rem; color: var(--dim); font-size: 11px;
         border-top: 1px solid var(--line); }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
@media print {
  header .bar, footer { display: none; }
  #stage { overflow: visible; }
}
```

## 2. 调色板

整段粘进产物的 `<script>` **最顶部**（运行时依赖它）。

```js
var PALETTE = {
  dark: {
    bg: '#020617', grid: '#0b1220', nodeFill: '#0f172a',
    ink: '#f8fafc', muted: '#94a3b8', dim: '#475569',
    line: '#334155', band: '#0b1220', bandLine: '#1e293b',
    kind: {
      frontend: '#22d3ee', backend: '#34d399', database: '#a78bfa',
      cloud: '#fbbf24', security: '#fb7185', messagebus: '#fb923c',
      external: '#94a3b8', neutral: '#64748b',
      start: '#38bdf8', success: '#34d399', failure: '#fb7185'
    }
  },
  light: {
    bg: '#f8fafc', grid: '#eef2f7', nodeFill: '#ffffff',
    ink: '#0f172a', muted: '#64748b', dim: '#94a3b8',
    line: '#cbd5e1', band: '#f1f5f9', bandLine: '#e2e8f0',
    kind: {
      frontend: '#0891b2', backend: '#059669', database: '#7c3aed',
      cloud: '#d97706', security: '#e11d48', messagebus: '#ea580c',
      external: '#64748b', neutral: '#94a3b8',
      start: '#0284c7', success: '#059669', failure: '#e11d48'
    }
  }
};
```

## 3. 语义 kind 枚举

`node.kind` 只能取这些值，它决定节点颜色。**不要自造 kind**——自造会静默落到 `neutral`，语义信息就丢了。

| kind | 用途 |
|---|---|
| `frontend` | 界面、客户端、CDN 边缘 |
| `backend` | 服务、进程、worker |
| `database` | 存储、缓存、队列的持久侧 |
| `cloud` | 托管资源、基础设施组件 |
| `security` | 网关、鉴权、策略边界 |
| `messagebus` | 队列、主题、事件总线 |
| `external` | 第三方、系统外的人或系统 |
| `start` | 起始状态、入口（仅 `lifecycle` 用） |
| `success` | 成功终态（仅 `lifecycle` 用） |
| `failure` | 失败/取消终态（仅 `lifecycle` 用） |
| `neutral` | 确实无语义的节点（**最后手段**） |

## 4. 图例

当一张图里出现 **3 种以上 kind** 时，在 `<footer>` 里列出用到的 kind 及其含义，颜色用 `PALETTE[theme].kind[...]`。少于 3 种就不要图例——读者能从上下文看懂。
