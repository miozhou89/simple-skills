# Issue tracker: 本地 Markdown

本仓库的变更文档和 issue 以 markdown 文件形式存放在 `docs/changes/<capability-path>/` 中。

## 约定

- 每个变更一个目录：`docs/changes/<capability-path>/`（`<capability-path>` 按变更命名，如 `add-dark-mode`）
- 变更提案是 `docs/changes/<capability-path>/proposal.md`，spec 是 `docs/changes/<capability-path>/spec.md`，设计文档是 `design.md`，实现计划是 `plans.md`
- 实现 issue 是每张票据一个文件，位于 `docs/changes/<capability-path>/issues/<NN>-<slug>.md`，从 `01` 开始编号——绝不使用单个合并的票据文件
- 评论和对话历史追加到文件底部的 `## Comments` 标题下

## 当 skill 说"发布到 issue tracker"时

在 `docs/changes/<capability-path>/issues/` 下创建一个新文件（必要时创建目录）。

## 当 skill 说"获取相关票据"时

读取所引用路径处的文件。用户通常会直接传入路径或 issue 编号。
