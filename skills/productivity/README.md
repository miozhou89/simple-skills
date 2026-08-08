# Productivity

通用工作流工具，不特定于代码。

## User-invoked

只能由你手动输入触发（Claude Code：`disable-model-invocation: true`；Codex：`agents/openai.yaml` 中的 `policy.allow_implicit_invocation: false`）。

- **[grill-me](./grill-me/SKILL.md)** — 接受一场毫不留情的盘问，围绕一个计划或设计，直到设计树的每一条分支都有结论。
- **[handoff](./handoff/SKILL.md)** — 将当前对话压缩成一份交接文档，让另一个 agent 可以继续这项工作。
- **[teach](./teach/SKILL.md)** — 跨多个会话教用户一项新技能或概念，以当前目录作为有状态的教学工作区。
- **[wait-what](./wait-what/SKILL.md)** — 在某条消息没听懂的那一刻触发。agent 会补上你缺失的上下文，用平实的语言、借助你 `CONTEXT.md` 中的词汇重新讲述。

## Model-invoked

模型或用户均可触发（带有丰富的触发措辞，便于模型主动取用）。

- **[grilling](./grilling/SKILL.md)** — 围绕一个计划、决策或想法对用户进行毫不留情的盘问，直到设计树的每一条分支都有结论。
- **[writing-for-agents](./writing-for-agents/SKILL.md)** — 为 agent 撰写文档：skill、AGENTS.md/CLAUDE.md，以及任何通过指针触达的文档。
