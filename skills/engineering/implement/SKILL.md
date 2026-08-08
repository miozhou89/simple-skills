---
name: implement
description: "基于规格说明或一组工单实现一项工作。"
---

实现用户在规格说明或工单中描述的工作。

当在当前会话中执行包含独立任务的实现计划时使用 /subagent-driven-development

尽可能使用 /tdd，限于事先约定的 seam。

定期运行类型检查，定期运行单个测试文件，最后运行一次完整测试套件。

完成后，使用 /code-review 审查这项工作。

宣称成功之前，使用 /verification-before-completion 技能

将你的工作提交到当前分支。
