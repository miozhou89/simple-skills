---
name: handoff
description: 将当前对话压缩成一份交接文档，供另一个 agent 接手。
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

撰写一份交接文档，总结当前对话，让一个新的 agent 可以继续这项工作。保存到用户操作系统的临时目录——而不是当前工作区。

在文档中包含一个 "suggested skills" 小节，建议接手的 agent 应该调用哪些 skill。

禁止重复其他工件（spec、plan、ADR、issue、commit、diff）中已有的内容。改用路径或 URL 引用它们。

隐去任何敏感信息，例如 API 密钥、密码或个人身份信息。

如果用户传入了参数，将其视为对下一个会话关注点的描述，并据此调整文档内容。
