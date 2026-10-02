---
name: taste-minimalist-ui
description: 干净的编辑式界面。暖色单色色板、排版对比度、扁平 bento grid、柔和粉彩。无 gradient、无重 shadow。
---

# 协议：高级实用极简主义 UI 架构师

## 1. 绝对负面约束（禁止元素）
AI 必须严格避免以下通用的 Web 开发默认做法：
- 禁止使用 "Inter"、"Roboto" 或 "Open Sans" 字体。
- 禁止使用 "Lucide"、"Feather" 或标准 "Heroicons" 之类的通用细线图标库。
- 禁止使用 Tailwind 默认的重 shadow（例如 `shadow-md`、`shadow-lg`、`shadow-xl`）。shadow 必须几乎不存在，或经过深度定制为超扩散、低 opacity（< 0.05）。
- 禁止为大型元素或区块使用主色背景（例如不要有亮蓝、亮绿或亮红的 hero 区块）。
- 禁止使用 gradient、霓虹色或 3D 玻璃拟态（含蓄的 navbar blur 除外）。
- 禁止为大型容器、card 或主按钮使用 `rounded-full`（胶囊形状）。
- 禁止在代码、标记、文本内容、标题或 alt 文本的任何位置使用表情符号。用合适的图标或干净的 SVG 基元替换。
- 禁止使用 "John Doe"、"Acme Corp" 或 "Lorem Ipsum" 之类的通用占位符名称。使用真实、符合语境的内容。
- 禁止使用 AI 文案陈词滥调："Elevate"、"Seamless"、"Unleash"、"Next-Gen"、"Game-changer"、"Delve"。用平实、具体的语言撰写。

## 2. 排版架构
界面必须依赖极端的排版对比度和高端字体选择来建立编辑感。
- 主要 sans-serif（正文、UI、按钮）：使用干净、几何或系统原生的有特色字体。目标：`font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif`。
- 编辑式 serif（Hero 标题与引语）：目标：`font-family: 'Lyon Text', 'Newsreader', 'Playfair Display', 'Instrument Serif', serif`。应用紧凑 tracking（`letter-spacing: -0.02em` 到 `-0.04em`）与紧凑 line-height（`1.1`）。
- monospace（代码、按键、元数据）：目标：`font-family: 'Geist Mono', 'SF Mono', 'JetBrains Mono', monospace`。
- 文本颜色：正文文本绝不能是纯黑（`#000000`）。使用近黑/炭灰（`#111111` 或 `#2F3437`），并配以宽松的 `line-height` `1.6` 以保证可读性。次要文本应该为柔和的灰色（`#787774`）。

## 3. 色板（暖色单色 + 点缀粉彩）
色彩是稀缺资源，仅用于语义含义或含蓄点缀。
- 画布/背景：纯白 `#FFFFFF` 或暖骨白/米白 `#F7F6F3` / `#FBFBFA`。
- 主表面（card）：`#FFFFFF` 或 `#F9F9F8`。
- 结构边框/分割线：超浅灰 `#EAEAEA` 或 `rgba(0,0,0,0.06)`。
- 强调色：仅为标签、行内代码背景或含蓄图标背景使用高度去饱和、褪色的粉彩。
  - 浅红：`#FDEBEC`（文字：`#9F2F2D`）
  - 浅蓝：`#E1F3FE`（文字：`#1F6C9F`）
  - 浅绿：`#EDF3EC`（文字：`#346538`）
  - 浅黄：`#FBF3DB`（文字：`#956400`）

## 4. component 规范
- Bento Box 特性 grid：
  - 使用非对称的 CSS Grid layout。
  - card 必须恰好具有 `border: 1px solid #EAEAEA`。
  - radius 必须干脆：最多 `8px` 或 `12px`。
  - 内部内边距必须宽松（例如 `24px` 到 `40px`）。
- 主要 CTA（按钮）：
  - 实心背景 `#111111`，文字 `#FFFFFF`。
  - 轻微 radius（`4px` 到 `6px`）。无 box-shadow。
  - hover 状态应该为向 `#333333` 的轻微颜色偏移，或微缩放 `transform: scale(0.98)`。
- 标签与状态 badge：
  - 胶囊形状（`border-radius: 9999px`）、极小的排版（`text-xs`）、大写且 tracking 宽松（`letter-spacing: 0.05em`）。
  - 背景必须使用已定义的柔和粉彩。
- accordion（FAQ）：
  - 去除所有容器框。仅用 `border-bottom: 1px solid #EAEAEA` 分隔各项。
  - 使用干净、锐利的 `+` 和 `-` 图标表示切换状态。
- 按键微 UI：
  - 使用 `<kbd>` 标签将快捷键 render 为实体按键：`border: 1px solid #EAEAEA`、`border-radius: 4px`、`background: #F7F6F3`，使用 monospace 字体。
- 仿 OS 窗口边框：
  - 模拟软件时，用一个极简容器包裹它，容器带白色顶栏，顶栏含三个浅灰色小圆点（复刻 macOS 窗口控件）。

## 5. 图标与图像指令
- 系统图标：使用 "Phosphor Icons（Bold 或 Fill 字重）" 或 "Radix UI Icons"，以获得技术感、略粗 stroke 的美学。在所有图标间统一 stroke 宽度。
- 插画：白底上的单色、粗犷连续线条墨水速写，配以一个偏移的、以柔和粉彩填充的几何形状。
- 摄影：使用高质量、去饱和、暖色调的图像。应用含蓄叠加层（`opacity: 0.04` 暖色颗粒）将照片融入单色色板。禁止使用过度饱和的图库照片。当没有真实 asset 时，使用 `https://picsum.photos/seed/{context}/1200/800` 之类的可靠占位符。
- Hero 与区块背景：区块不应显得空洞而扁平。使用极低 opacity 的含蓄全宽背景图像、柔和的径向光斑（暖色调的 `radial-gradient`，`opacity: 0.03`），或极简几何线条图案来增加深度，同时不破坏干净的美学。

## 6. 含蓄动效与微动画
动效应感觉不可见——存在但从不分散注意力。目标是安静的精致，而非炫技。
- scroll 进入：元素进入 viewport 时轻柔淡入。使用 `translateY(12px)` + `opacity: 0`，在 `600ms` 内以 `cubic-bezier(0.16, 1, 0.3, 1)` 完成。使用 `IntersectionObserver`，禁止使用 `window.addEventListener('scroll')`。
- hover 状态：card 以超含蓄的 shadow 偏移上浮（`box-shadow` 在 `200ms` 内从 `0 0 0` 过渡到 `0 2px 8px rgba(0,0,0,0.04)`）。按钮在 `:active` 时以 `scale(0.98)` 响应。
- 交错显现：列表与 grid 项以级联延迟进入（`animation-delay: calc(var(--index) * 80ms)`）。禁止一次性全部挂载。
- 背景环境动效：可选。一个在 hero 区块后方漂移的、移动极慢的径向 gradient 光斑（`animation-duration: 20s+`、`opacity: 0.02-0.04`）。必须应用于 `position: fixed; pointer-events: none` 图层。禁止用在 scroll 容器上。
- 性能：仅通过 `transform` 和 `opacity` 进行动画。不得使用触发 layout 的属性（`top`、`left`、`width`、`height`）。谨慎使用 `will-change: transform`，且仅用于正在动画的元素。

## 7. 执行协议
当被指派编写前端代码（HTML、React、Tailwind、Vue）或设计 layout 时：
1. 首先建立宏观留白。在区块之间使用巨大的垂直内边距（例如 Tailwind 中的 `py-24` 或 `py-32`）。
2. 将主要排版内容宽度限制为 `max-w-4xl` 或 `max-w-5xl`。
3. 立即应用定制排版层级与单色色彩变量。
4. 确保每张 card、每条分割线和边框都严格遵守 `1px solid #EAEAEA` 规则。
5. 为所有主要内容块添加 scroll 进入动画。
6. 通过图像、环境 gradient 或含蓄纹理确保区块具有视觉深度——不得有空洞的扁平背景。
