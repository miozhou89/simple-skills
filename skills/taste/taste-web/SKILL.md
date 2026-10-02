---
name: taste-web
description: taste-skill 的 Web 平台 overlay（React / Next.js / Tailwind / Motion / GSAP）。提供设计系统 npm 映射、架构约定、动画代码骨架、性能护栏、dark mode token 策略与 Web 专属起飞前检查。必须先读 ../taste-common/SKILL.md。
---

# tasteskill Web overlay（React / Next.js）

> **必须先读 `../taste-common/SKILL.md`。** 本文件只含 Web 平台差异：设计系统映射、技术栈约定、动画骨架、性能机制、token 策略、Web 专属检查项与附录。设计判断（简报推断、旋钮、§4 设计工程指令、破绽清单、改版协议、起飞前检查的平台无关部分）全部在 common 中。

**编号与 common 对齐。** 本文件使用与 common 相同的节号；缺失的节号（0、1、4、7、10-13）说明该节内容平台无关，在 common 中。common 中标注「见平台 overlay」处的对接关系：

| common 引用点 | 本文件对接节 |
|---|---|
| 第 2 节设计系统映射表与审美实现 | §2.A / §2.B |
| 第 3 节平台架构约定 | §3.A-3.E |
| 第 5 节标准骨架与禁止的动画模式 | §5.A-5.D |
| 第 6 节性能机制 | §6.B、§6.D、§6.E |
| 第 8.A 节 token 策略 | §8.A |
| 第 9.E 节图标库 | §3.C、§9.E |
| 第 10 节动画库选择 | §10 |
| 第 14 节平台专属检查项 | §14（Web 补充） |
| 安装命令与官方来源 | 附录 A / B / C |

---

## 2. 简报 → 设计系统映射（Web 实现）

### 2.A 何时使用真实设计系统（使用官方包）
| 简报读作… | 选用 | 原因 |
|---|---|---|
| 微软 / 企业 SaaS / 仪表盘 | `@fluentui/react-components` 或 `@fluentui/web-components` | 官方 Fluent UI、微软 token、无障碍已就绪 |
| 类 Google 界面、Material 风格产品 | `@material/web` + Material 3 tokens | 官方，可通过 Material Theming 定制主题 |
| IBM 风格 B2B / 企业分析 | `@carbon/react` + `@carbon/styles` | 官方 Carbon，成熟的数据密度模式 |
| Shopify 应用界面 | `polaris.js` web components / Polaris React | Shopify 管理界面所必需 |
| Atlassian / Jira 风格产品 | `@atlaskit/*` + `@atlaskit/tokens` | 官方 Atlassian DS |
| GitHub 风格开发者工具 / 社区页面 | `@primer/css` 或 `@primer/react-brand` | 官方 Primer；Brand 变体用于营销 |
| 英国公共部门服务 | `govuk-frontend` | 法律 / 监管所期望 |
| 美国公共部门 / 信任优先 | `uswds` | 同上 |
| 快速的本地商家 / 代理商 MVP | Bootstrap 5.3 | 平庸、快、能用 |
| 现代无障碍 React 基础 | `@radix-ui/themes` | 原语 + 精致主题 |
| component 归你所有的现代 SaaS | shadcn/ui（`npx shadcn@latest add ...`） | 代码归你所有，易于定制；绝不以默认状态交付 |
| 基于 Tailwind 的现代 SaaS / AI 营销 | Tailwind v4 工具类 + `dark:` 变体 | 独立开发者 + 小团队的默认选择 |

common 第 2 节的诚实规则与「每个项目一个系统」在此严格执行：不要在同一个依赖树里混用 Fluent React 和 Carbon；不要往 Material 3 应用里引入 shadcn/ui component。

### 2.B 当简报是一种审美而非系统时
对于这些方向，**没有单一官方包**。用原生 CSS + Tailwind + 一个维护良好的 component 库来构建。在代码注释中诚实说明哪些是借鉴的灵感、哪些是官方 asset。

| 审美 | 诚实的实现方式 |
|---|---|
| 玻璃拟态 / "磨砂玻璃" | `backdrop-filter`、分层边框、高光叠加。为 `prefers-reduced-transparency` 提供纯色填充回退。 |
| Bento（苹果风格磁贴 grid） | 混合单元格尺寸的 CSS Grid。没有单一库独占它。 |
| 粗野主义 | 原生 CSS、monospace、生硬边框。无库。 |
| 编辑 / 杂志 | serif、非对称 grid、充足留白。无库。 |
| 暗黑科技 / 黑客 | monospace + 强调霓虹色、终端母题。无库。 |
| 极光 / mesh gradient | SVG 或分层径向 gradient。无库。 |
| 动感字体排版 | 原生 CSS 动画、scroll 驱动动画、劫持 scroll 用 GSAP。无库。 |
| **Apple Liquid Glass** | Apple 只针对 Apple 平台记录了这个效果。**不存在官方的 `liquid-glass.css`。** Web 实现都是使用 `backdrop-filter` + 分层边框 + 高光的近似实现。要明确标注为近似（见附录 C）。 |

---

## 3. 默认架构与约定（Web）

除非设计解读选择了真实设计系统（第 2.A 节），否则使用以下默认值：

### 3.A 技术栈
* **框架：** React 或 Next.js。默认使用服务器 component（RSC）。
  * **RSC 安全：** 全局状态只在客户端 component 中有效。在 Next.js 中，用 `"use client"` component 包裹 provider。
  * **交互隔离：** 任何使用 Motion、scroll 监听器或指针物理的 component 都必须是顶部带 `'use client'` 的独立叶子 component。服务器 component 只 render 静态 layout。
* **样式：** **Tailwind v4**（默认）。仅当现有项目要求时才用 Tailwind v3。
  * v4 下：不要在 `postcss.config.js` 中使用 `tailwindcss` 插件。使用 `@tailwindcss/postcss` 或 Vite 插件。
* **动画：** **Motion**（前身是 Framer Motion 的库）。从 `motion/react` 导入（`import { motion } from "motion/react"`）。`framer-motion` 包仍可作为旧版别名使用——新代码中优先用 `motion/react`。
* **字体：** 总是使用 `next/font`（Next.js）或通过 `@font-face` + `font-display: swap` 自托管。生产环境禁止通过 `<link>` 引用 Google Fonts。

### 3.B 状态
* 本地 `useState` / `useReducer` 用于隔离的 UI。
* 全局状态仅用于避免深层 prop 传递——Zustand、Jotai 或 React context。
* **禁止**用 `useState` 跟踪由用户输入驱动的连续值（鼠标位置、scroll 进度、指针物理、磁吸 hover）。使用 Motion 的 `useMotionValue` / `useTransform` / `useScroll`。`useState` 会在每次变化时重 render 整个 React 树，在移动端会崩溃。

### 3.C 图标
* **允许的库（优先级顺序）：** `@phosphor-icons/react`、`hugeicons-react`、`@radix-ui/react-icons`、`@tabler/icons-react`。
* **不推荐：** `lucide-react`。仅当用户明确要求或项目已依赖它时才可接受。
* **禁止手写 SVG 图标。** 如果缺少某个图形，安装第二个库或从原语组合——不要从头画图标路径。
* **每个项目一个图标家族。** 不要在同一个 component 树里混用 Phosphor 和 Lucide。
* **全局统一 `strokeWidth`**（例如 `1.5` 或 `2.0`）。

### 3.D Emoji 策略
默认在代码、标记和可见文本中不推荐使用。用图标库图形替代符号。**覆盖：** 仅当用户明确要求俏皮 / 聊天风格 / 社交原生氛围时才允许使用 emoji——即便如此也要有意识地克制使用。

### 3.E 响应式与 layout 机制
* 统一 breakpoint（`sm 640`、`md 768`、`lg 1024`、`xl 1280`、`2xl 1536`）。
* 用 `max-w-[1400px] mx-auto` 或 `max-w-7xl` 约束页面 layout。
* **viewport 稳定性：** 全高 Hero 区域禁止用 `h-screen`。总是用 `min-h-[100dvh]` 以防移动端（iOS Safari 地址栏）layout 跳动。
* **grid 优先于 Flex 计算：** 禁止用复杂的 flexbox 百分比计算（`w-[calc(33%-1rem)]`）。总是用 CSS Grid（`grid grid-cols-1 md:grid-cols-3 gap-6`）。

### 3.F 依赖校验（强制）
见 common 第 3.A 节。Web 下依赖清单是 `package.json`。

common 第 4 节规则在 Web 下的常用具体表达：hero 顶部内边距上限 = `pt-24`（96px）；hero 默认字号区间 = `text-4xl md:text-5xl lg:text-6xl`；斜体下降部 = `leading-[1.1]` + `pb-1`；输入块间距 = `gap-2`；eyebrow 典型签名 = `text-[11px] uppercase tracking-[0.18em]`；窄屏折叠 = `w-full px-4 py-8` + `max-w-7xl mx-auto`；按压态 = `:active` 上 `-translate-y-[1px]` 或 `scale-[0.98]`。

---

## 5. 标准骨架与禁令（Web 实现）

common 第 5 节的通用原则在此落地为代码。

### 5.A 粘性堆叠——标准骨架

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",                              // pin at viewport top
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div
          key={i}
          className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center"
        >
          {card}
        </div>
      ))}
    </div>
  );
}
```

关键点：`start: "top top"`、`pin: true`、除最后一张外每张 card 都被固定，scale/opacity 变换由下一张 card 的 scroll 触发器驱动（这样上一张 card 会在下一张到来时缩小）。

### 5.B 横向平移——标准骨架

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",                              // pin starts when section top hits viewport top
          end: () => `+=${distance}`,                    // scroll distance = track width minus viewport
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  );
}
```

关键点：`start: "top top"`、`pin: true`、`end: "+=${distance}"`（scroll 长度 = 所需横向位移）、`scrub: 1`。外层包裹被固定，内层轨道随用户垂直 scroll 而横向滑动。

### 5.C scroll 显现错峰——标准骨架（更轻量的替代）

对于简单的"项目进入 viewport 时显现"（无固定），优先用 Motion 的 `whileInView` 而不是 GSAP——更轻量，无需 ScrollTrigger：

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

用于：特性列表、证言 grid、标志墙，以及任何只需要"scroll 进入"的场景。把 GSAP 留给真正的固定 / scrub 工作。

### 5.D 禁止的动画模式（Web）

* **`window.addEventListener("scroll", ...)`** 被禁止。它在每一帧 scroll 都运行，易卡顿，无批处理。使用 Motion 的 `useScroll()`、GSAP 的 `ScrollTrigger`、IntersectionObserver 或 CSS `scroll-driven animations`（`animation-timeline: view()`）。
* **在 React state 中用 `window.scrollY` 做自定义 scroll 进度计算**。同理。每一帧都重 render。
* **触碰 React state 的 `requestAnimationFrame` 循环。** 改用 motion values（`useMotionValue` + `useTransform`）。
* **layout 过渡：** 对于可见的状态变化（列表重排序、展开 modal、路由间共享元素），使用 Motion 的 `layout` 和 `layoutId` props。不要"为了保险"给静态内容包裹 `layout` props——那会付出测量成本。
* **错峰编排：** 对于顺序重要的显现时刻，使用 `staggerChildren`（Motion）或 CSS 级联（`animation-delay: calc(var(--index) * 100ms)`）。使用 `staggerChildren` 时，父级（`variants`）和子级必须共享同一个客户端 component 树。

---

## 6. 性能与无障碍护栏（Web 机制）

### 6.A 硬件加速
common 原则（只动画化 `transform` 和 `opacity`；禁止 `top`、`left`、`width`、`height`）在 Web 下的补充：谨慎使用 `will-change: transform`——只用在真正会动画化的元素上。

### 6.B 减弱动效（Web 机制）
* 在 Motion 中：用 `useReducedMotion()` 包裹并降级为静态。
* 在 CSS 中：把动画放在 `@media (prefers-reduced-motion: no-preference)` 之后，或在 `@media (prefers-reduced-motion: reduce)` 下提供禁用的覆盖块。

### 6.D DOM 成本
* 颗粒 / 噪点滤镜只应用在固定的、`pointer-events-none` 的伪元素上（例如 `fixed inset-0 z-[60] pointer-events-none`）。禁止用在 scroll 容器上——持续的 GPU 重绘会摧毁移动端帧率。

### 6.E Z-Index 克制
禁止随意滥用 `z-50` 或 `z-10`。z-index 只严格用于系统性的层级场景（粘性 navbar、modal、遮罩、颗粒层）。在项目常量文件中记录 z-index 刻度。

---

## 8. dark mode 协议（Web token 策略）

### 8.A Token 策略（选一种，坚持到底）
* **Tailwind `dark:` 变体**（工具类优先项目的默认）：每个颜色工具类都配上深色变体（`bg-white dark:bg-zinc-950`、`text-gray-900 dark:text-gray-100`）。
* **CSS 变量**（用于 shadcn/ui、Radix Themes 或带主题功能的 component 库）：定义语义 token（`--surface`、`--surface-elevated`、`--text-primary`、`--accent`），并在 `[data-theme="dark"]` 或 `@media (prefers-color-scheme: dark)` 下交换值。
* 使用内置主题功能的设计系统时（Radix Themes、带 `<Theme>` 的 shadcn/ui），在 `layout.tsx` 或页面根部设置一次主题。不要让单个区块覆盖。
* 尊重 `prefers-color-scheme: dark`。默认跟随系统偏好，除非品牌坚持单一模式。

---

## 9. AI 破绽（Web 补充）

### 9.E 外部资源与 component（Web 补充）
* **shadcn/ui 定制：** 允许，但禁止处于默认状态。按项目审美定制 radius、颜色、shadow、字体排版。
* 图标库允许清单见 §3.C（Phosphor / HugeIcons / Radix / Tabler；Lucide 仅明确要求时）。

---

## 10. 动画库选择（Web）

* **Motion（`motion/react`）**——UI / Bento / 状态变化动效的默认。
* **GSAP + ScrollTrigger**——用于全页 scroll 叙事和 scroll 劫持。隔离在带 `useEffect` 清理的专用叶子 component 中。
* **Three.js / WebGL**——用于 canvas 背景和 3D 场景。同样隔离规则。
* **禁止在同一个 component 树里混用 GSAP / Three.js 与 Motion。** 它们会争夺同一批帧。

---

## 14. 最终起飞前检查（Web 补充项）

先运行 common 第 14 节的平台无关检查矩阵，再运行以下 Web 专属项：

- [ ] **GSAP 粘性堆叠 / 横向平移**按第 5.A / 5.B 节标准骨架实现（`start: "top top"`、`pin: true`、正确的 scrub）？
- [ ] **无 `window.addEventListener('scroll')`**——只用 Motion `useScroll()` / ScrollTrigger / IntersectionObserver / CSS scroll 驱动动画？
- [ ] **`useEffect` 动画**有严格的清理函数？
- [ ] **viewport 稳定性**：`min-h-[100dvh]`，禁止 `h-screen`？
- [ ] 高变化 layout 的**移动端折叠**显式（`w-full`、`px-4`、`max-w-7xl mx-auto`）？
- [ ] **Motion** 隔离在顶部带 `'use client'` 的客户端叶子 component 中，并已 memo？
- [ ] **图标**仅来自允许的库（Phosphor / HugeIcons / Radix / Tabler），无手写 SVG 路径？
- [ ] **核心 Web 指标**可信达标（LCP < 2.5s、INP < 200ms、CLS < 0.1）？
- [ ] EYEBROW 机械计数：grep 所有 component 中 `uppercase tracking` 的出现次数，≤ ceil(区块数 / 3)？
- [ ] 每项目**一个设计系统**（不混用 Material + shadcn）？

---

# 附录——真实来源支持的参考材料

以下各节是收录的参考内容。它们为第 2 节中提到的每个设计系统提供真实的安装命令、真实的官方文档链接和真实可用的起始代码片段。用它们把决策锚定在生产现实中，而非训练数据虚构。

## 附录 A——每个设计系统的安装命令

```bash
# Material Web (Material 3)
npm install @material/web

# Fluent UI React (v9)
npm install @fluentui/react-components

# Fluent UI Web Components (framework-free)
npm install @fluentui/web-components @fluentui/tokens

# IBM Carbon
npm install @carbon/react @carbon/styles

# Radix Themes
npm install @radix-ui/themes

# shadcn/ui (open code, owned components)
npx shadcn@latest init
npx shadcn@latest add button card badge separator input

# Primer CSS (GitHub product/devtool UI)
npm install --save @primer/css

# Primer Brand (GitHub marketing UI)
npm install @primer/react-brand

# GOV.UK Frontend
npm install govuk-frontend

# USWDS (US Web Design System)
npm install uswds

# Atlassian Design System (Atlaskit)
yarn add @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/badge @atlaskit/section-message @atlaskit/card

# Bootstrap 5.3
npm install bootstrap

# Shopify Polaris Web Components (Shopify apps only)
# Add this to your app HTML head:
#   <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
#   <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
```

## 附录 B——官方来源（在重新造轮子前先读这些）

### Material Web
- https://github.com/material-components/material-web
- https://material-web.dev/theming/material-theming/
- https://m3.material.io/develop/web

### Fluent UI
- https://fluent2.microsoft.design/get-started/develop
- https://fluent2.microsoft.design/components/web/react/
- https://github.com/microsoft/fluentui
- https://learn.microsoft.com/en-us/fluent-ui/web-components/

### Carbon
- https://carbondesignsystem.com/
- https://github.com/carbon-design-system/carbon
- https://carbondesignsystem.com/developing/react-tutorial/overview/
- https://carbondesignsystem.com/developing/web-components-tutorial/overview/

### Shopify Polaris
- https://shopify.dev/docs/api/app-home/web-components
- https://github.com/Shopify/polaris-react
- https://polaris-react.shopify.com/components

### Atlassian
- https://atlassian.design/get-started/develop
- https://atlassian.design/components/button/examples
- https://atlaskit.atlassian.com/packages/design-system/button/example/disabled
- https://atlassian.design/tokens/design-tokens

### Primer
- https://primer.style/
- https://github.com/primer/css
- https://github.com/primer/brand

### GOV.UK
- https://design-system.service.gov.uk/components/button/
- https://design-system.service.gov.uk/styles/layout/
- https://github.com/alphagov/govuk-frontend

### USWDS
- https://designsystem.digital.gov/documentation/developers/
- https://designsystem.digital.gov/components/button/
- https://designsystem.digital.gov/components/card/
- https://github.com/uswds/uswds

### Bootstrap
- https://getbootstrap.com/docs/5.3/layout/grid/
- https://getbootstrap.com/docs/5.3/components/card/

### Tailwind
- https://tailwindcss.com/docs/dark-mode
- https://tailwindcss.com/blog/tailwindcss-v4

### Radix
- https://www.radix-ui.com/themes/docs/components/theme
- https://www.radix-ui.com/themes/docs/components/card
- https://github.com/radix-ui/themes

### shadcn/ui
- https://ui.shadcn.com/docs
- https://ui.shadcn.com/docs/components/card
- https://github.com/shadcn-ui/ui

### Native CSS / W3C standards
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- https://drafts.csswg.org/scroll-animations-1/

### Apple Liquid Glass（仅限 Apple 平台）
- https://developer.apple.com/design/human-interface-guidelines/materials
- https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass
- https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
- https://developer.apple.com/documentation/SwiftUI/Material

---

## 附录 C——Apple Liquid Glass：诚实的 Web 近似实现

**不要**把随机 CSS 片段当作官方 Apple Liquid Glass。

### 什么是官方的
Apple 在 Apple 平台的 Human Interface Guidelines 和 Developer Documentation 中记录了 Liquid Glass。它是一种跨 Apple 平台 UI 使用的动态材质。Apple 的原生实现属于 Apple 平台 API 和系统 component，**而不是公开的 Web CSS 包**。

相关官方文档：
- Apple Human Interface Guidelines → Materials
- Apple Developer Documentation → Liquid Glass
- Apple Developer Documentation → Adopting Liquid Glass
- SwiftUI → Material

### 什么不是官方的
普通网站不存在 Apple 出的 `liquid-glass.css`。

Web 近似实现可以使用：
- `backdrop-filter`
- 透明背景
- 分层边框
- 高光叠加
- gradient
- 动效
- 强对比回退

但那是 **Web 玻璃拟态 / 磨砂玻璃近似**，不是官方 Apple Liquid Glass。在注释中照此标注。

### 更安全的 Web 近似骨架

```css
.liquid-glass-web-approx {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background:
    linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)),
    rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .48),
    inset 0 -1px 0 rgb(255 255 255 / .12),
    0 18px 60px rgb(0 0 0 / .18);
}

.liquid-glass-web-approx::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background:
    radial-gradient(circle at 20% 0%, rgb(255 255 255 / .55), transparent 34%),
    linear-gradient(90deg, rgb(255 255 255 / .18), transparent 42%, rgb(255 255 255 / .14));
  pointer-events: none;
}

.liquid-glass-web-approx::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / .14);
  pointer-events: none;
}

@media (prefers-color-scheme: dark) {
  .liquid-glass-web-approx {
    border-color: rgb(255 255 255 / .18);
    background:
      linear-gradient(135deg, rgb(255 255 255 / .16), rgb(255 255 255 / .04)),
      rgb(15 23 42 / .42);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / .22),
      0 18px 60px rgb(0 0 0 / .42);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx {
    background: rgb(255 255 255 / .96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

**重要：** `prefers-reduced-transparency` 的浏览器支持参差不齐；要测试它。即便没有 blur，也总是提供足够的对比度。

---

**附录结束。** 上述安装命令是现实锚点。Apple Liquid Glass 骨架是标注过的近似实现，不是 Apple 发布的包。每个设计系统的官方文档，请查阅该系统官方文档（第 2 节中的链接加附录 B）。
