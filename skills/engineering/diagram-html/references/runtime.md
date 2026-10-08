# 运行时：渲染与交互

**这是冻结代码。整段原样粘贴进产物的 `<script>`，不要改写、不要"顺手优化"。**
它只消费 `layout()` 的返回值，因此换图类型时这段永远不用动。

粘贴顺序（同一 `<script>` 内，自上而下）：`PALETTE` → 下面这段 → `layout()` 插件 → `DiagramLite.boot(...)`。

```js
var DiagramLite = (function () {
  'use strict';
  var st = { graph: null, geo: null, layout: null, theme: 'dark', k: 1, tx: 0, ty: 0, focus: null };
  var stage = null;

  /* ---------- 文本：粗估宽度，不做测量 ---------- */
  function wide(c) {
    return /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/.test(c) ? 2 : 1;
  }
  function textW(s, size) {
    var u = 0, t = String(s == null ? '' : s);
    for (var i = 0; i < t.length; i++) u += wide(t[i]);
    return u * size * 0.6;
  }
  function clip(s, size, max) {
    s = String(s == null ? '' : s);
    if (textW(s, size) <= max) return s;
    var out = '';
    for (var i = 0; i < s.length; i++) {
      if (textW(out + s[i] + '\u2026', size) > max) break;
      out += s[i];
    }
    return out + '\u2026';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- 调色：颜色烤进属性，主题切换靠重绘 ---------- */
  function P() { return PALETTE[st.theme] || PALETTE.dark; }
  function kindColor(k) { var p = P(); return p.kind[k] || p.kind.neutral; }
  function d(pts) {
    var s = '';
    for (var i = 0; i < pts.length; i++) s += (i ? ' L ' : 'M ') + pts[i][0] + ' ' + pts[i][1];
    return s;
  }

  /* ---------- 拼 SVG ---------- */
  function svgText() {
    var p = P(), g = st.geo, out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + g.width + ' ' + g.height +
      '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(st.graph.title || 'diagram') + '">');
    out.push('<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M0 0 L10 5 L0 10 z" fill="' + p.line + '"/></marker></defs>');
    out.push('<rect width="' + g.width + '" height="' + g.height + '" fill="' + p.bg + '"/>');

    (g.lifelines || []).forEach(function (l) {
      out.push('<line x1="' + l.x + '" y1="' + l.y1 + '" x2="' + l.x + '" y2="' + l.y2 +
        '" stroke="' + p.bandLine + '" stroke-width="1" stroke-dasharray="3 4"/>');
    });

    (g.bands || []).forEach(function (b) {
      out.push('<g data-band="1"><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h +
        '" rx="10" fill="' + p.band + '" stroke="' + p.bandLine + '" stroke-dasharray="4 4"/>' +
        '<text x="' + (b.x + 12) + '" y="' + (b.y + 18) + '" font-size="10" letter-spacing="1" fill="' + p.muted +
        '" font-family="ui-monospace,monospace">' + esc(String(b.label || '').toUpperCase()) + '</text></g>');
    });

    g.edges.forEach(function (e, i) {
      var dash = e.variant === 'dashed' ? ' stroke-dasharray="5 4"' : '';
      out.push('<g data-edge="' + i + '" data-from="' + esc(e.from) + '" data-to="' + esc(e.to) + '">' +
        '<path d="' + d(e.points) + '" fill="none" stroke="' + p.line + '" stroke-width="' +
        (e.variant === 'emphasis' ? 2.4 : 1.6) + '" stroke-linejoin="round"' + dash + ' marker-end="url(#ah)"/>');
      if (e.label) {
        var m = e.points[Math.floor(e.points.length / 2)];
        out.push('<text x="' + m[0] + '" y="' + (m[1] - 5) + '" font-size="10" text-anchor="middle" fill="' + p.muted +
          '" font-family="ui-monospace,monospace" stroke="' + p.bg + '" stroke-width="3" paint-order="stroke">' +
          esc(clip(e.label, 10, 130)) + '</text>');
      }
      out.push('</g>');
    });

    g.nodes.forEach(function (n) {
      var c = kindColor(n.kind), cx = n.x + n.w / 2, two = n.sub ? 6 : 0;
      out.push('<g data-node="' + esc(n.id) + '"><title>' + esc(n.label + (n.sub ? ' — ' + n.sub : '')) + '</title>' +
        '<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="8" fill="' + c +
        '" fill-opacity="0.10" stroke="' + c + '" stroke-width="1.5"/>' +
        '<text x="' + cx + '" y="' + (n.y + n.h / 2 - 1 + two / 2) + '" font-size="13" text-anchor="middle" fill="' + p.ink +
        '" font-family="ui-monospace,monospace">' + esc(clip(n.label, 13, n.w - 16)) + '</text>');
      if (n.sub) {
        out.push('<text x="' + cx + '" y="' + (n.y + n.h / 2 + 15) + '" font-size="10" text-anchor="middle" fill="' + p.muted +
          '" font-family="ui-monospace,monospace">' + esc(clip(n.sub, 10, n.w - 16)) + '</text>');
      }
      out.push('</g>');
    });
    return out.join('') + '</svg>';
  }

  /* ---------- 聚焦：邻域高亮 ---------- */
  function applyFocus() {
    var svg = stage.querySelector('svg');
    if (!svg) return;
    var lit = {};
    svg.classList.toggle('has-focus', !!st.focus);
    if (st.focus) {
      lit[st.focus] = 1;
      Array.prototype.forEach.call(svg.querySelectorAll('[data-edge]'), function (g) {
        if (g.getAttribute('data-from') === st.focus || g.getAttribute('data-to') === st.focus) {
          lit[g.getAttribute('data-from')] = lit[g.getAttribute('data-to')] = 1;
          g.classList.add('is-lit');
        } else g.classList.remove('is-lit');
      });
    }
    Array.prototype.forEach.call(svg.querySelectorAll('[data-node]'), function (g) {
      g.classList.toggle('is-lit', !!lit[g.getAttribute('data-node')]);
    });
  }
  function focus(id) { st.focus = st.focus === id ? null : id; applyFocus(); }

  /* ---------- 相机 ---------- */
  function cam() {
    var g = stage.querySelector('#cam');
    if (g) g.setAttribute('transform', 'translate(' + st.tx + ' ' + st.ty + ') scale(' + st.k + ')');
  }
  function fit() {
    var svg = stage.querySelector('svg');
    if (!svg) return;
    var w = svg.clientWidth || 900, h = svg.clientHeight || 600;
    st.k = Math.min(w / st.geo.width, h / st.geo.height, 1) || 1;
    st.tx = (w - st.geo.width * st.k) / 2;
    st.ty = (h - st.geo.height * st.k) / 2;
    cam();
  }
  function toUser(e) {
    var svg = stage.querySelector('svg'), m = svg && svg.getScreenCTM();
    if (!m) return { x: e.clientX, y: e.clientY };
    var p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
  function zoom(f, at) {
    var k2 = Math.max(0.25, Math.min(4, st.k * f));
    var p = at || { x: (stage.clientWidth || 900) / 2, y: (stage.clientHeight || 600) / 2 };
    st.tx = p.x - (p.x - st.tx) * (k2 / st.k);
    st.ty = p.y - (p.y - st.ty) * (k2 / st.k);
    st.k = k2; cam();
  }

  /* ---------- 重绘 / 导出 ---------- */
  function paint() {
    st.geo = st.layout(st.graph, { theme: st.theme });
    stage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + st.geo.width + ' ' + st.geo.height +
      '" width="100%" height="100%"><g id="cam">' + svgText().replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g></svg>';
    st.focus = null; fit();
  }
  function exportSvg() {
    var svg = stage.querySelector('svg').cloneNode(true);
    svg.removeAttribute('class');
    var g = svg.querySelector('#cam');
    if (g) g.removeAttribute('transform');
    svg.setAttribute('width', st.geo.width);
    svg.setAttribute('height', st.geo.height);
    var blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (st.graph.title || 'diagram').replace(/[^\w\u4e00-\u9fa5-]+/g, '-').toLowerCase() + '.svg';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function setTheme(t) {
    st.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    paint();
  }

  /* ---------- 启动 ---------- */
  function boot(graph, layout, opts) {
    st.graph = graph; st.layout = layout;
    stage = document.querySelector((opts && opts.mount) || '#stage');
    setTheme((opts && opts.theme) || (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

    stage.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('[data-node]');
      if (g) focus(g.getAttribute('data-node'));
      else if (st.focus) focus(st.focus);
    });
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, toUser(e));
    }, { passive: false });
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      drag = toUser(e); stage.classList.add('dragging');
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = toUser(e);
      st.tx += p.x - drag.x; st.ty += p.y - drag.y;
      drag = p; cam();
    });
    stage.addEventListener('pointerup', function () { drag = null; stage.classList.remove('dragging'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '0') fit();
      if (e.key === 'Escape') { st.focus = null; applyFocus(); }
    });
    return { fit: fit, zoom: zoom, export: exportSvg, theme: setTheme, focus: focus, repaint: paint };
  }
  return { boot: boot };
})();
```

## 与布局插件的接口

运行时对 `layout(graph, opts)` 的返回值有严格要求：

| 字段 | 含义 |
|---|---|
| `width` / `height` | 画布尺寸，决定 `viewBox` |
| `nodes[]` | `{ id, x, y, w, h, label, sub, kind }`，`x,y` 是**左上角** |
| `edges[]` | `{ from, to, label, points: [[x,y], …], variant }`，`variant` 取 `emphasis` / `dashed` |
| `bands[]` | 可选，泳道/分区背景，渲染在所有元素之下 |
| `lifelines[]` | 可选，`{ x, y1, y2 }`，时序图的生命线，渲染在分区之上、连线之下 |

运行时**不做任何几何计算**，也不校验 `points` 是否合理——越界或穿过节点的线会原样画出来。布局插件必须自己保证几何正确。
