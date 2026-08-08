# Engineering

我日常代码工作中使用的 skills。

## User-invoked

只有当你手动输入时才可触达（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[ask-route](./ask-route/SKILL.md)** — 询问哪个 skill 或流程适合你的情况。这是本仓库中 user-invoked skills 之上的路由器。
- **[grill-with-docs](./grill-with-docs/SKILL.md)** — 盘问式会话，同时构建项目的领域模型，在过程中打磨术语并就地更新 `CONTEXT.md` 和 ADR。
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)** — 扫描代码库寻找深化（deepening）机会，以可视化 HTML 报告呈现，然后对你选中的机会进行盘问。
- **[setup-simple-skills](./setup-simple-skills/SKILL.md)** — 为 engineering skills 配置本仓库（issue tracker、领域文档布局）。每个仓库运行一次。
- **[to-spec](./to-spec/SKILL.md)** — 把当前对话转化为一份 spec 并发布到 issue tracker。
- **[to-tickets](./to-tickets/SKILL.md)** — 把任何计划、spec 或对话拆解为一组 tracer-bullet 票据，每张票据声明其阻塞边——本地以文本形式写在一个文件中，或在真实 tracker 上使用原生阻塞链接。
- **[implement](./implement/SKILL.md)** — 构建 spec 或一组票据所描述的工作，在预先约定的 seam 处驱动 `/tdd`，并在提交前以 `/code-review` 收尾。
- **[wayfinder](./wayfinder/SKILL.md)** — 规划一大块超出一个 agent 会话容量的工作——在 issue tracker 上以决策票据共享地图的形式呈现，一次解决一张，直到通往目标的路径清晰。

## Model-invoked

模型或用户均可触达（具备丰富的触发措辞，模型可以主动取用）。

- **[prototype](./prototype/SKILL.md)** — 构建一次性原型来回答设计问题：用一个可分享的 HTML 文件承载状态/逻辑，或多个可切换的 UI 变体。

- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** — 针对疑难 bug 和性能回退的纪律化诊断循环：构建一个对该 bug 变红的反馈回路 → 最小化 → 假设 → 插桩 → 修复 → 回归测试。
- **[research](./research/SKILL.md)** — 对照高可信度的 primary source 调查问题，把结果以带引用的 Markdown 文件存入 repo，以后台 agent 方式运行。
- **[tdd](./tdd/SKILL.md)** — 采用 red-green-refactor 循环的测试驱动开发。一次构建一个垂直切片的功能或修复一个 bug。
- **[domain-modeling](./domain-modeling/SKILL.md)** — 主动构建并打磨项目的领域模型——挑战术语、用场景压力测试、就地更新 `CONTEXT.md` 和 ADR。
- **[codebase-design](./codebase-design/SKILL.md)** — 设计深模块的共享纪律与词汇：小接口、干净的 seam、可经由接口测试。
- **[code-review](./code-review/SKILL.md)** — 对某个固定时间点以来的 diff 做双轴评审：**Standards**（是否遵循仓库的编码规范，外加 Fowler 坏味道基线？）和 **Spec**（是否忠实实现了原始 issue/spec？），以并行子 agent 运行。
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)** — 逐块处理进行中的 git merge 或 rebase 冲突，通过追溯到每一方一手来源的意图来解决，然后完成该操作——绝不 `--abort`。
- **[brainstorming](./brainstorming/SKILL.md)** — 在任何创造性工作之前通过协作对话把想法打磨成设计，获用户批准后才进入实现。
- **[requirement-workflow](./requirement-workflow/SKILL.md)** — 需求开发流程编排：设计 → 规格 → 票据 → 实施 → 评审 → 维护，每阶段路由到对应 skill。
- **[canvas-design](./canvas-design/SKILL.md)** — 基于设计哲学在 .png/.pdf 画布上创作海报、艺术品等静态视觉作品。
- **[chart-generator](./chart-generator/SKILL.md)** — 生成数据可视化图表：antv 轻量图表，或按用户 matplotlib 规范输出定制 PNG。
- **[doc-coauthoring](./doc-coauthoring/SKILL.md)** — 引导结构化文档协作流程：上下文收集 → 优化与结构化 → 读者测试。
- **[finishing-a-development-branch](./finishing-a-development-branch/SKILL.md)** — 收尾开发分支：验证测试、检测环境、展示集成选项、执行并清理。
- **[frontend-design](./frontend-design/SKILL.md)** — 创建有设计感、生产级的前端界面，视觉与代码质量并重。
- **[image-to-code](./image-to-code/SKILL.md)** — 把设计稿截图转成生产级代码，自动检测框架、复用现有组件。
- **[pdf](./pdf/SKILL.md)** — 处理 PDF 的一切操作：读取/提取、合并、拆分、旋转、水印、表单、加密解密、OCR。
- **[playwright-cli](./playwright-cli/SKILL.md)** — 用 playwright-cli 自动化浏览器交互、测试网页并生成测试代码。
- **[pptx](./pptx/SKILL.md)** — 处理一切涉及 .pptx 的工作：创建、读取、提取、编辑、合并拆分演示文稿。
- **[skill-creator](./skill-creator/SKILL.md)** — 创建、迭代改进 skill，并用 eval 与方差分析基准衡量性能。
- **[software-architecture](./software-architecture/SKILL.md)** — 基于 Clean Architecture 与 DDD 的质量导向架构与编码指导。
- **[subagent-driven-development](./subagent-driven-development/SKILL.md)** — 为计划中每个任务分派全新实现子 agent，配任务审查与结尾宽范围审查。
- **[theme-factory](./theme-factory/SKILL.md)** — 用预设专业配色/字体主题或即时生成的新主题为工件添加一致样式。
- **[using-git-worktrees](./using-git-worktrees/SKILL.md)** — 确保工作在隔离工作区中——优先原生 worktree 工具，必要时回退 git worktree。
- **[verification-before-completion](./verification-before-completion/SKILL.md)** — 宣称完成或修复前必须运行验证命令，始终用证据支撑断言。
- **[xlsx](./xlsx/SKILL.md)** — 处理电子表格（.xlsx/.xlsm/.csv/.tsv）：读写编辑、创建、转换与清理。
