---
name: taste-flutter
description: taste-skill 的 Flutter 平台 overlay（Dart）。提供 Material/Cupertino 设计系统映射、pubspec 架构约定、sliver 动画骨架、帧预算护栏、ThemeData dark mode token 策略与 Flutter 专属起飞前检查。必须先读 ../taste-common/SKILL.md。
---

# tasteskill Flutter overlay（Dart）

> **必须先读 `../taste-common/SKILL.md`。** 本文件只含 Flutter 平台差异：设计系统映射、技术栈约定、动画骨架、性能机制、token 策略、Flutter 专属检查项与附录。设计判断（简报推断、旋钮、§4 设计工程指令、破绽清单、改版协议、起飞前检查的平台无关部分）全部在 common 中。

**编号与 common 对齐。** 本文件使用与 common 相同的节号；缺失的节号（0、1、4、7、10 词汇表、11-13）说明该节内容平台无关，在 common 中。common 中标注「见平台 overlay」处的对接关系：

| common 引用点 | 本文件对接节 |
|---|---|
| 第 2 节设计系统映射表与审美实现 | §2.A / §2.B |
| 第 3 节平台架构约定 | §3.A-3.F |
| 第 5 节标准骨架与禁止的动画模式 | §5.A-5.D |
| 第 6 节性能机制 | §6.B、§6.D、§6.E |
| 第 8.A 节 token 策略 | §8.A |
| 第 9.E 节图标库 | §3.C |
| 第 10 节动画库选择 | §10 |
| 第 11.B 节改版的平台对应物 | §11（Flutter 补充） |
| 第 13 节原生移动端的适用边界 | §13（Flutter 覆盖） |
| 第 14 节平台专属检查项 | §14（Flutter 补充） |
| 安装命令与官方来源 | 附录 A / B |

---

## 2. 简报 → 设计系统映射（Flutter 实现）

### 2.A 何时使用真实设计系统
| 简报读作… | 选用 | 原因 |
|---|---|---|
| 类 Google 界面、Material 风格产品、Android 优先 | **内置 Material widgets**（M3）+ `ColorScheme.fromSeed` | Flutter 官方，主题系统完整 |
| Apple 风格、iOS 优先 | **内置 Cupertino widgets** | Flutter 官方，匹配 HIG |
| 微软 / Fluent 风格桌面 | `fluent_ui`（**社区包，非微软官方**——诚实标注） | 最接近 Fluent 的 Flutter 实现 |
| 高定制品牌界面（落地页 / 作品集 / 代理商） | Material 基底 + 深度定制 `ThemeData` / `ThemeExtension` | Material 是最完整的可定制基底 |
| 公共部门（GOV.UK / USWDS 类） | **无官方 Flutter 实现。** 用 `ThemeExtension` token 手动对齐其官方设计规范，代码注释说明这是对齐而非官方包 | 不存在可安装的官方系统 |

common 第 2 节的诚实规则在此严格执行：**禁止**用第三方"UI kit 杂烩包"冒充设计系统；`fluent_ui` 必须标注为社区实现；每个项目一个系统——不要在 Material 界面里混进 Cupertino 组件树（除非按平台自适应且有文档化规则）。

### 2.B 当简报是一种审美而非系统时
| 审美 | 诚实的 Flutter 实现方式 |
|---|---|
| 玻璃拟态 / "磨砂玻璃" | `BackdropFilter`（`ImageFilter.blur`）+ 半透明容器 + 1px 内边框。**注意：`BackdropFilter` 触发 saveLayer，昂贵——只用在小的静态区域，禁止用在 scroll 列表内反复出现的卡片上。** |
| Bento（磁贴 grid） | `GridView` 配 `flutter_staggered_grid_view`，或 `CustomMultiChildLayout`。 |
| 粗野主义 | 生硬 `Border.all`、monospace、零 radius。无库。 |
| 编辑 / 杂志 | serif（`google_fonts` 池）、非对称 `Row`/`Column` 组合、充足留白。无库。 |
| 极光 / mesh gradient | `CustomPainter` 多层径向 gradient，或 `mesh_gradient` 包。 |
| 动感字体排版 | `AnimatedBuilder` + `AnimationController` 驱动文字变换。无库。 |
| Liquid Glass | 同玻璃拟态，标注为近似实现。Apple 官方 Liquid Glass 仅限 Apple 平台原生 API。 |

---

## 3. 默认架构与约定（Flutter）

### 3.A 技术栈
* **框架：** Flutter stable，Material 3（`useMaterial3` 现为默认）。
* **语言：** Dart，开启严格 lint（`flutter_lints` 或更严的 `very_good_analysis`）。
* **样式：** 无 Tailwind 等价物。间距、radius、字号的刻度集中定义在常量类或 `ThemeExtension` 中——**禁止**在 widget 树里散落魔术数字。

### 3.B 状态
* 局部 UI 状态用 `StatefulWidget` + `setState`。
* 全局状态仅用于避免深层传递——**Riverpod**（推荐）或 Bloc。
* **禁止**用 `setState` 跟踪由用户输入驱动的连续值（scroll 进度、指针物理、拖拽位置）。使用 `AnimationController` / `ValueNotifier` + `AnimatedBuilder`。`setState` 会重建整棵子树，每帧一次重建在移动端直接掉帧。

### 3.C 图标
* **允许的库（优先级顺序）：** `phosphor_flutter`、`hugeicons`、`icons_plus`。
* **不推荐：** `lucide_icons`。仅当用户明确要求或项目已依赖它时才可接受。
* **禁止手写图标。** 禁止用 `CustomPainter` 从零画图标路径。如果缺少某个图形，安装第二个库。
* **每个项目一个图标家族。** 不要在同一棵 widget 树里混用 Phosphor 和 Lucide。
* **全局统一 `strokeWidth` / 线宽**（例如 1.5 或 2.0）。
* 品牌 / 插画 SVG 用 `flutter_svg` render。

### 3.D Emoji 策略
默认不使用。用图标库图形替代符号。**覆盖：** 仅当用户明确要求俏皮 / 聊天风格 / 社交原生氛围时才允许，且克制使用。

### 3.E 响应式与 layout 机制
* 用 `LayoutBuilder` / `MediaQuery.sizeOf` 声明断点。统一断点常量（如 `600` / `1024` / `1440` 逻辑像素）。
* 用 `Center` + `ConstrainedBox(maxWidth: 1200)` 约束宽屏内容宽度。
* **grid 优先于手动百分比计算：** 禁止用 `MediaQuery.sizeOf(context).width * 0.33` 这类裸算分栏。用 `Expanded` 的 flex 比、`GridView` 或 `Wrap`。
* **窄屏折叠必须显式：** 对每个多列 layout，在断点处显式切换为单列 `Column` / `ListView`。

### 3.F 依赖校验（强制）
见 common 第 3.A 节。Flutter 下依赖清单是 `pubspec.yaml`。缺少的包先输出 `flutter pub add <package>` 命令。

common 第 4 节规则在 Flutter 下的常用具体表达：hero 顶部内边距上限 = `EdgeInsets.only(top: 96)`；hero 默认字号区间 = 36-60 逻辑像素；斜体下降部 = `height: 1.1` + 底部预留 4px；输入块间距 = `SizedBox(height: 8)`；eyebrow 典型签名 = 11px、`letterSpacing: 0.18 * 11`、全大写文本；按压态 = `GestureDetector` + 下移 1px 或 `Transform.scale(0.98)`。

---

## 5. 标准骨架与禁令（Flutter 实现）

common 第 5 节的通用原则在此落地为代码。

### 5.A 粘性堆叠——标准骨架

用 `CustomScrollView` + 固定的 `SliverPersistentHeader`：除最后一张外每张 card 都被固定（`pinned: true`），前一张的 scale/opacity 由其 `shrinkOffset` 驱动——这就是"下一张到来时上一张缩小"的 Flutter 表达。

```dart
class StickyStack extends StatelessWidget {
  const StickyStack({super.key, required this.cards});

  final List<Widget> cards;

  @override
  Widget build(BuildContext context) {
    final extent = MediaQuery.sizeOf(context).height;
    final reduce = MediaQuery.of(context).disableAnimations;
    if (reduce) {
      // 减弱动效：退化为普通纵向列表
      return ListView(children: cards);
    }
    return CustomScrollView(
      slivers: [
        for (var i = 0; i < cards.length; i++)
          SliverPersistentHeader(
            pinned: i < cards.length - 1, // 最后一张不固定，自然滑入收尾
            delegate: _StackCardDelegate(extent: extent, child: cards[i]),
          ),
      ],
    );
  }
}

class _StackCardDelegate extends SliverPersistentHeaderDelegate {
  _StackCardDelegate({required this.extent, required this.child});

  final double extent;
  final Widget child;

  @override
  double get minExtent => extent;
  @override
  double get maxExtent => extent;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    // shrinkOffset: 0..extent。被后续内容压过时驱动缩小与淡出
    final t = (shrinkOffset / extent).clamp(0.0, 1.0);
    return Transform.scale(
      scale: 1.0 - 0.08 * t, // 1.0 -> 0.92
      child: Opacity(opacity: 1.0 - 0.45 * t, child: child),
    );
  }

  @override
  bool shouldRebuild(_StackCardDelegate oldDelegate) =>
      oldDelegate.extent != extent || oldDelegate.child != child;
}
```

关键点：`pinned: true`（除最后一张）、缩放与淡出由 `shrinkOffset` 驱动（不引入额外 controller）、减弱动效坍缩为普通列表。

### 5.B 横向平移——标准骨架

垂直 scroll 进度映射为横向位移。外层区块高度 = viewport 高 + 轨道溢出宽度；监听 `ScrollController` 时**禁止 `setState`**，用 `AnimatedBuilder`：

```dart
class HorizontalPan extends StatefulWidget {
  const HorizontalPan({super.key, required this.children});

  final List<Widget> children;

  @override
  State<HorizontalPan> createState() => _HorizontalPanState();
}

class _HorizontalPanState extends State<HorizontalPan> {
  final _outer = ScrollController();
  final _trackKey = GlobalKey();

  @override
  void dispose() {
    _outer.dispose(); // controller 必须 dispose
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final viewportW = MediaQuery.sizeOf(context).width;
    final viewportH = MediaQuery.sizeOf(context).height;
    final trackW = viewportW * widget.children.length;
    final distance = trackW - viewportW;

    return SizedBox(
      height: viewportH + distance, // scroll 长度 = 所需横向位移
      child: AnimatedBuilder(
        animation: _outer, // 直接监听 controller，不 setState
        builder: (context, _) {
          final start = /* 区块在 scroll 中的起始偏移，由外层传入或测量 */;
          final t = ((_outer.offset - start) / distance).clamp(0.0, 1.0);
          return OverflowBox(
            child: Transform.translate(
              offset: Offset(-distance * t, 0),
              child: Row(key: _trackKey, children: widget.children),
            ),
          );
        },
      ),
    );
  }
}
```

关键点：`AnimatedBuilder` 监听 controller（零重建）、`Transform.translate` 只动 transform、controller 必须 `dispose`。**桌面 / web 端优先真实横向 scroll**（横向 `ListView` + 鼠标滚轮映射），scroll 劫持在指针设备上体验差——仅在 `MOTION_INTENSITY > 5` 且简报明确要求时用劫持。

### 5.C scroll 显现错峰——标准骨架（更轻量的替代）

对于简单的"进入 viewport 时显现"，用 `flutter_animate` 的声明式错峰，或 `VisibilityDetector` + 隐式动画：

```dart
class RevealStagger extends StatelessWidget {
  const RevealStagger({super.key, required this.items});

  final List<Widget> items;

  @override
  Widget build(BuildContext context) {
    if (MediaQuery.of(context).disableAnimations) {
      return Column(children: items); // 减弱动效：直接静态
    }
    return Column(
      children: [
        for (var i = 0; i < items.length; i++)
          items[i]
              .animate() // flutter_animate
              .fadeIn(duration: 600.ms, delay: (i * 60).ms)
              .slideY(begin: 0.1, end: 0, curve: const Cubic(0.16, 1, 0.3, 1)),
      ],
    );
  }
}
```

用于：特性列表、证言 grid、标志墙。把 `AnimationController` 编排留给真正的固定 / scrub 工作。需要"进入 viewport 才触发"时，用 `VisibilityDetector` 包一层并记忆"已触发"状态（只播一次）。

### 5.D 禁止的动画模式（Flutter）

* **禁止在 `ScrollController` listener 或 `ScrollNotification` 回调里逐帧 `setState`。** 每一帧重建整棵子树。用 `AnimatedBuilder` + 直接监听 controller / `ValueNotifier`。
* **禁止在 `build` 方法里启动动画或做重计算。** `build` 必须纯；动画在 `initState` 或事件回调中启动。
* **`AnimationController` 必须 `dispose`。** 用 `SingleTickerProviderStateMixin`，在 `dispose` 中释放。泄漏的 controller 是 Flutter 动效的第一大内存问题。
* **不要对静态半透明用 `Opacity` widget。** `Opacity` 触发 saveLayer，昂贵。静态半透明直接在颜色里写 alpha（`Color(0x80FFFFFF)` / `withValues(alpha: 0.5)`）；`Opacity` / `AnimatedOpacity` 只用于真正在变化的透明度。
* **隐式动画与显式编排不要混用同一个值。** 简单状态变化用 `AnimatedContainer` / `AnimatedFoo`；多段编排用 `AnimationController` + `AnimatedBuilder`。同一属性两套机制会打架。
* **错峰编排**用 `flutter_animate` 的 `delay` 链（见 5.C），不要手写 `Future.delayed` 链——它不听从减弱动效，也无法取消。

---

## 6. 性能与无障碍护栏（Flutter 机制）

### 6.A 硬件加速
common 原则（只动画化 transform / opacity 类属性）在 Flutter 下的表达：动画化 `Transform`、`Opacity`、`ScaleTransition` 等；**禁止**动画化 width/height 类 layout 参数（会触发每帧 layout）。需要尺寸变化时用 `AnimatedSize` 并接受其成本，或改用 transform。

### 6.B 减弱动效（Flutter 机制）
* 用 `MediaQuery.of(context).disableAnimations` 检测。**Flutter 不会自动替你降级**——必须显式检查，并把无限循环、视差、scroll 劫持、磁吸物理坍缩为静态 / 瞬时（见 5.A / 5.C 骨架中的回退写法）。

### 6.D 重建成本
* **帧预算：60Hz 设备 16ms，120Hz 设备 8ms。** 用 DevTools 的 Performance 视图定位 jank；`debugProfileBuildsEnabled` 找多余 rebuild。
* **const 纪律（强制）：** 静态子树必须 `const`。一个深 widget 树里漏掉的 const 会让上层 setState 重建整棵树。
* **长列表必须 `ListView.builder` / `GridView.builder`。** 禁止在 `SingleChildScrollView` + `Column` 里堆长列表——一次性构建全部子项。
* **`RepaintBoundary`** 隔离高频重绘的部件（动画、CustomPainter），防止波及整页。
* **图片解码成本：** `Image` 用 `cacheWidth` / `cacheHeight` 限制解码尺寸；禁止把 4000px 原图解码成 300px 缩略图。
* **颗粒 / 噪点 overlay** 只应用于固定层，禁止包在 scroll 内容里逐帧重绘。

### 6.E 层级克制
* `Stack` / `Overlay` 只用于系统性的层级场景（粘性 navbar、modal、遮罩、颗粒层）。禁止用 `Stack` 叠罗汉来"修"layout——那是结构没设计对。

---

## 8. dark mode 协议（Flutter token 策略）

### 8.A Token 策略
* **定义两套完整主题：** `ThemeData.light()` 与 `ThemeData.dark()`，各配 `ColorScheme`。**禁止**在 widget 里散落硬编码颜色（`Color(0xFF...)` 裸用）；颜色必须来自 `Theme.of(context).colorScheme` 或自定义 `ThemeExtension`。
* **自定义语义 token 用 `ThemeExtension`：** surface-elevated、text-primary 之类超出现有 `ColorScheme` 槽位的 token，定义一个 `ThemeExtension` 子类并在两套主题中各给一份值。
* **`ColorScheme.fromSeed` 谨慎使用：** seed 必须是品牌色，生成后审计输出。不要接受默认紫色 seed 产物——那是 common 第 4.2 节 LILA 规则的 Flutter 形态。
* **默认 `themeMode: ThemeMode.system`**（跟随 `MediaQuery.platformBrightness`），除非品牌坚持单一模式。
* 在应用根部（`MaterialApp` 的 `theme` / `darkTheme`）设置一次。禁止单个区块用局部 `Theme` 覆盖翻转模式（common 第 4.11 节）。

---

## 9. AI 破绽（Flutter 补充）

### 9.E 外部资源与 component（Flutter 补充）
* 图标库允许清单见 §3.C（phosphor_flutter / hugeicons / icons_plus；lucide_icons 仅明确要求时）。
* **网络图片必须有加载与失败状态：** `Image.network` 配 `loadingBuilder` + `errorBuilder`（skeleton 与重试提示），或直接用 `cached_network_image`。空白区域不是加载态。

---

## 10. 动画库选择（Flutter）

* **内置动画**（`ImplicitlyAnimatedWidget` / `AnimatedBuilder` + `AnimationController`）——默认，无需依赖。
* **`flutter_animate`**——声明式微交互、入场与错峰（见 5.C）。
* **Rive / Lottie**——复杂插画级动画（加载、空状态插画）。
* **禁止在同一棵子树里用多套编排机制驱动同一属性。** 它们会争夺同一批帧。

---

## 11. 改版协议（Flutter 补充）

common 第 11.B 节的 SEO 基线在 Flutter 应用下的对应物：**应用商店素材与深链**（App Store / Play 截图、预览视频、深链路由表、 deferred deep link）。改版前记录当前深链路由，禁止静默修改（对应 common 11.F 的 URL slug 条款）。

---

## 13. 超出范围（Flutter 覆盖条款）

common 第 13 节"原生移动端直接用 Apple HIG / Material"一条在 Flutter 下的解释：**Flutter 内置的 Material / Cupertino widgets 就是这两个系统的官方跨平台实现**，Flutter 简报不属于"超出范围"。

**但注意简报类型差异：** Flutter 简报通常是 **app 界面**（移动 / 桌面 / 嵌入式），而不是落地页。此时：
* common 第 4.7 节（hero 纪律）、第 4.9 节（内容密度）等营销页规则**仅对 Flutter web 营销页全量适用**；
* app 界面按屏幕流程处理——common 的旋钮（第 1/7 节）、色彩校准（4.2）、排版纪律（4.1）、AI 破绽清单（第 9 节）、dark mode 协议（第 8 节）仍然全量适用；界面品类思路可参考 `imagegen-frontend-mobile` skill。

---

## 14. 最终起飞前检查（Flutter 补充项）

先运行 common 第 14 节的平台无关检查矩阵，再运行以下 Flutter 专属项：

- [ ] **`flutter analyze` 零 issue**（lint 开启）？
- [ ] **const 纪律**：静态子树全部 `const`，无因缺 const 导致的大范围 rebuild？
- [ ] **无逐帧 `setState`**：grep `addListener` / `onNotification` 回调，确认其中无 `setState`；连续值走 `AnimatedBuilder` / `ValueNotifier`？
- [ ] **所有 `AnimationController` 已 `dispose`**？
- [ ] **减弱动效**：`MediaQuery.of(context).disableAnimations` 下，所有 `MOTION_INTENSITY > 3` 的动效坍缩为静态 / 瞬时？
- [ ] **长列表用 builder**：无 `SingleChildScrollView` + `Column` 堆长列表？
- [ ] **无滥用 `Opacity` widget**：静态半透明用颜色 alpha？
- [ ] **粘性堆叠 / 横向平移**按第 5.A / 5.B 节骨架实现（`pinned`、`shrinkOffset` 驱动、零 setState）？
- [ ] **dark mode**：light / dark 两套 `ThemeData` 齐备，widget 内无硬编码颜色，两种模式都实际看过？
- [ ] **网络图片**全部有 `loadingBuilder` + `errorBuilder`（或 `cached_network_image`）？
- [ ] **图片解码**：大图设了 `cacheWidth` / `cacheHeight`？
- [ ] **窄屏折叠**显式（断点处显式切单列）？
- [ ] **图标**仅来自允许的库，无 `CustomPainter` 手绘图标？
- [ ] **字体**：`google_fonts` 收录的字体可用；未收录的已打包进 `assets` 并在 `pubspec.yaml` 声明？生产路径不依赖运行时字体下载？
- [ ] 每项目**一个设计系统**（不混用 Material + fluent_ui）？

---

# 附录——真实来源支持的参考材料

## 附录 A——安装命令

```bash
# 字体 / 图标 / 图片
flutter pub add google_fonts
flutter pub add phosphor_flutter        # 或 hugeicons / icons_plus
flutter pub add flutter_svg
flutter pub add cached_network_image

# 动画
flutter pub add flutter_animate
flutter pub add rive                    # 或 lottie

# 状态管理
flutter pub add flutter_riverpod        # 或 flutter_bloc

# 布局与 scroll
flutter pub add flutter_staggered_grid_view
flutter pub add visibility_detector

# Fluent 风格（社区包，非微软官方，用时诚实标注）
flutter pub add fluent_ui
```

## 附录 B——官方来源（在重新造轮子前先读这些）

### Flutter 框架与 Material 3
- https://docs.flutter.dev/ui
- https://docs.flutter.dev/ui/widgets
- https://api.flutter.dev/flutter/material/material-library.html
- https://m3.material.io/develop/flutter
- https://api.flutter.dev/flutter/material/ThemeData-class.html
- https://api.flutter.dev/flutter/material/ColorScheme-class.html

### Cupertino（HIG 对齐）
- https://api.flutter.dev/flutter/cupertino/cupertino-library.html
- https://developer.apple.com/design/human-interface-guidelines

### 动画与性能
- https://docs.flutter.dev/ui/animations
- https://api.flutter.dev/flutter/widgets/SliverPersistentHeader-class.html
- https://docs.flutter.dev/perf
- https://docs.flutter.dev/perf/rendering-performance
- https://docs.flutter.dev/tools/devtools/performance

### 主题与无障碍
- https://api.flutter.dev/flutter/material/ThemeExtension-class.html
- https://docs.flutter.dev/ui/accessibility-and-localization/accessibility
- https://api.flutter.dev/flutter/widgets/MediaQuery/disableAnimations.html

### 包仓库
- https://pub.dev（搜索前先看包是否 Flutter Favorite、维护是否活跃）

---

**附录结束。** 上述安装命令是现实锚点。`fluent_ui` 为社区实现，非微软官方；Material / Cupertino 为 Flutter 官方内置。官方文档以 docs.flutter.dev 与 m3.material.io 为准。
