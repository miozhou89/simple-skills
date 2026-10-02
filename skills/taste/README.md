# taste

用于升级AI生成的界面的技能：提供更强的布局、排版、动画和间距设计，取代千篇一律的UI模板。

- taste-common: 平台无关的「反低质」设计核心。taste-skill 的平台无关核心：简介推断、三个旋钮、设计工程规则、AI 低质禁令清单、重设计协议、交付前检查。必须与某个平台 overlay 一起阅读。
- taste-web: taste-skill 的 Web 平台 overlay（React / Next.js / Tailwind / Motion / GSAP）。设计系统 npm 映射、架构约定、GSAP/Motion 代码骨架、性能护栏、Web 交付前检查、附录。先读 taste-common。
- taste-flutter: taste-skill 的 Flutter 平台 overlay（Dart）。Material/Cupertino 映射、pubspec 约定、sliver 动画骨架、帧预算护栏、ThemeData tokens、Flutter 交付前检查。先读 taste-common。
- taste-redesign: 用于升级现有项目：审计并修复设计问题。
- taste-soft: 专注于昂贵、柔和的 UI 观感：高级字体、留白、层次感与流畅动画。
- taste-minimalist-ui: 强制干净、编辑风格的界面（Notion/Linear 风格），严格单色配色。
- taste-brutalist-ui: 原始机械感界面、瑞士排版、极端尺度对比。（Beta）
- taste-brandkit: 品牌套件板：logo 方向、配色、字体、跨品类的身份应用。
