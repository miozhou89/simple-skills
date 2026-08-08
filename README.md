# simple-skills

简洁有效的 agent skills。 

模型越强，skill提示词要越简洁、限制要越少，避免对模型造成干扰或对强模型的推理效果构成限制。 

本仓库收集+原创对工程师有用的中文版 agent skills，并随着模型能力的增强持续精简和优化。 

为什么skills要用中文版？因为中文表达同样的意思，文本能更简短、更省token，而省token就是省钱。

## 安装

```bash
npx -y simple-skills@latest
```

安装到 `~/.agents/skills`；若 `~/.claude` 存在，则同时安装到 `~/.claude/skills`。技能是复制而非链接（npx 缓存会被清理），重新执行命令即可更新。


## 卸载

npx 不会把包安装进项目，只是临时下载缓存。卸载分两步：

**1. 清除 npx 缓存**

```bash
npm cache clean --force
# 或只删 npx 缓存目录
rm -rf ~/.npm/_npx
```

**2. 删除已复制的技能副本**

技能是复制到本地的，清缓存不会删除它们：

```bash
rm -rf ~/.agents/skills
rm -rf ~/.claude/skills   # 若当初装了这份
```

## skills


| Skill | 用途 |
| --- | --- |
| [ask-route](./skills/engineering/ask-route/SKILL.md) | 询问哪个 skill 或流程适合你的情况。user-invoked skills 之上的路由器 |
| [grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md) | 盘问式会话，同时构建项目的领域模型，打磨术语并就地更新 `CONTEXT.md` 和 ADR |
| [brainstorming](./skills/engineering/brainstorming/SKILL.md) | 在任何创造性工作之前通过协作对话把想法打磨成设计，获用户批准后才进入实现 |
| [improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md) | 扫描代码库寻找深化机会，以可视化 HTML 报告呈现，再对选中的机会进行盘问 |
| [setup-simple-skills](./skills/engineering/setup-simple-skills/SKILL.md) | 为 engineering skills 配置本仓库（issue tracker、领域文档布局）。每个仓库运行一次 |
| [to-spec](./skills/engineering/to-spec/SKILL.md) | 把当前对话转化为一份 spec 并发布到 issue tracker |
| [to-tickets](./skills/engineering/to-tickets/SKILL.md) | 把任何计划、spec 或对话拆解为一组 tracer-bullet 票据，每张票据声明其阻塞边 |
| [implement](./skills/engineering/implement/SKILL.md) | 构建 spec 或一组票据描述的工作，在约定 seam 处驱动 `/tdd`，提交前以 `/code-review` 收尾 |
| [wayfinder](./skills/engineering/wayfinder/SKILL.md) | 规划超出一个 agent 会话容量的工作——以决策票据共享地图的形式，一次解决一张 |
| [systematic-debugging](./skills/engineering/systematic-debugging/SKILL.md) | 修复前先系统化定位根本原因：复现、假设、验证、修复、回归 |
| [diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md) | 针对疑难 bug 和性能回退的纪律化诊断循环：变红反馈回路 → 最小化 → 假设 → 插桩 → 修复 → 回归测试 |
| [prototype](./skills/engineering/prototype/SKILL.md) | 构建一次性原型来回答设计问题：用一个可分享的 HTML 文件承载状态/逻辑，或多个可切换的 UI 变体 |
| [research](./skills/engineering/research/SKILL.md) | 对照高可信度 primary source 调查问题，把结果以带引用的 Markdown 文件存入 repo，以后台 agent 方式运行 |
| [tdd](./skills/engineering/tdd/SKILL.md) | 采用 red-green-refactor 循环的测试驱动开发，一次构建一个垂直切片的功能或修复一个 bug |
| [domain-modeling](./skills/engineering/domain-modeling/SKILL.md) | 主动构建并打磨项目的领域模型——挑战术语、用场景压力测试、就地更新 `CONTEXT.md` 和 ADR |
| [codebase-design](./skills/engineering/codebase-design/SKILL.md) | 设计深模块的共享纪律与词汇：小接口、干净的 seam、可经由接口测试 |
| [code-review](./skills/engineering/code-review/SKILL.md) | 对 diff 做双轴评审：**Standards**（编码规范 + Fowler 坏味道基线）与 **Spec**（是否忠实实现原始 issue/spec），以并行子 agent 运行 |
| [resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md) | 逐块处理进行中的 git merge 或 rebase 冲突，追溯各方一手来源意图解决，绝不 `--abort` |
| [canvas-design](./skills/engineering/canvas-design/SKILL.md) | 基于设计哲学在 .png/.pdf 画布上创作海报、艺术品等静态视觉作品 |
| [chart-generator](./skills/engineering/chart-generator/SKILL.md) | 生成数据可视化图表：antv 轻量图表，或按用户 matplotlib 规范输出定制 PNG |
| [dispatching-parallel-agents](./skills/engineering/dispatching-parallel-agents/SKILL.md) | 面对 2 个以上可独立进行的任务时，并行分派带隔离上下文的子 agent |
| [doc-coauthoring](./skills/engineering/doc-coauthoring/SKILL.md) | 引导结构化文档协作流程：上下文收集 → 优化与结构化 → 读者测试 |
| [finishing-a-development-branch](./skills/engineering/finishing-a-development-branch/SKILL.md) | 收尾开发分支：验证测试、检测环境、展示集成选项、执行并清理 |
| [frontend-design](./skills/engineering/frontend-design/SKILL.md) | 创建有设计感、生产级的前端界面，视觉与代码质量并重 |
| [image-to-code](./skills/engineering/image-to-code/SKILL.md) | 把设计稿截图转成生产级代码，自动检测框架、复用现有组件 |
| [pdf](./skills/engineering/pdf/SKILL.md) | 处理 PDF 的一切操作：读取/提取、合并、拆分、旋转、水印、表单、加密解密、OCR |
| [playwright-cli](./skills/engineering/playwright-cli/SKILL.md) | 用 playwright-cli 自动化浏览器交互、测试网页并生成测试代码 |
| [pptx](./skills/engineering/pptx/SKILL.md) | 处理一切涉及 .pptx 的工作：创建、读取、提取、编辑、合并拆分演示文稿 |
| [skill-creator](./skills/engineering/skill-creator/SKILL.md) | 创建、迭代改进 skill，并用 eval 与方差分析基准衡量性能 |
| [software-architecture](./skills/engineering/software-architecture/SKILL.md) | 基于 Clean Architecture 与 DDD 的质量导向架构与编码指导 |
| [subagent-driven-development](./skills/engineering/subagent-driven-development/SKILL.md) | 为计划中每个任务分派全新实现子 agent，配任务审查与结尾宽范围审查 |
| [theme-factory](./skills/engineering/theme-factory/SKILL.md) | 用预设专业配色/字体主题或即时生成的新主题为工件添加一致样式 |
| [using-git-worktrees](./skills/engineering/using-git-worktrees/SKILL.md) | 确保工作在隔离工作区中——优先原生 worktree 工具，必要时回退 git worktree |
| [verification-before-completion](./skills/engineering/verification-before-completion/SKILL.md) | 宣称完成或修复前必须运行验证命令，始终用证据支撑断言 |
| [xlsx](./skills/engineering/xlsx/SKILL.md) | 处理电子表格（.xlsx/.xlsm/.csv/.tsv）：读写编辑、创建、转换与清理 |

## 基本工作流

```
# 初始化项目，在项目打开agent，调用skill
/setup-simple-skills

# 设计
/brainstorming <需求> # 指定一个需求，进行头脑风暴，给出多个可能的解决方案 
/grill-with-docs  # 通过提问澄清需求，产出文档：CONTEXT.md、docs/adr/*
/grill-me
# 注：/grill-* 的成本比你想象的高。
# 如果你在一个节奏很快的团队里，每个功能开始前都要做这个流程，
# 会遭到抵触。更实际的做法是：只对高风险、高耦合的功能模块使用，小改动跳过。

# 编写方案、规格
/to-spec

# 拆分成多个可追踪的 ticket   (可选,大需求推荐加这一步)
/to-tickets

# 实施
/implement
#多 ticket 时,一次只 implement 一个
/implement #01

# 也可以指定使用测试驱动开发，产出模式与 /implement 根本不同——是"红→绿"多轮交替:
# 一条 spec issue(含 seams 定义、user stories、testing decisions),
# 用于指导后续 TDD 的测试点位
/tdd

# 差别：
# /implement:一次改到位、结束跑全量测试
# /tdd:先写红色测试 → 只写让它变绿的最少代码 → 再写下一个红色测试——每一步都必须先看到测试失败(避免"测试写完就绿"的假象)

# 代码review
/code-review

# 重构
/improve-codebase-architecture

# bug定位
/systematic-debugging
/diagnosing-bugs

# 跨需求平滑交接与上下文清理(防止对话污染)
# 开发完一个需求准备换到下一个需求时:
# 1. 在当前对话框输入 /handoff,导出当前需求的成果总结。Windows 通常在 %TEMP%\ 下,macOS/Linux 在 $TMPDIR/ 或 /tmp/ 下。
# 2. 直接关闭当前对话窗口,新建一个干净的窗口。
# 3. 新窗口第一句话把 handoff 文件路径丢给 AI(比如"读一下 /tmp/handoff-20260807-153000.md,继续上次的工作")。

```