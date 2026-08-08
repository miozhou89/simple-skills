# Issue tracker: 本地 Markdown

本仓库的 issue 和 spec 以 markdown 文件形式存放在 `.scratch/` 中。

## 约定

- 每个功能一个目录：`.scratch/<feature-slug>/`
- spec 是 `.scratch/<feature-slug>/spec.md`
- 实现 issue 是每张票据一个文件，位于 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 开始编号——绝不使用单个合并的票据文件
- 评论和对话历史追加到文件底部的 `## Comments` 标题下

## 当 skill 说"发布到 issue tracker"时

在 `.scratch/<feature-slug>/` 下创建一个新文件（必要时创建目录）。

## 当 skill 说"获取相关票据"时

读取所引用路径处的文件。用户通常会直接传入路径或 issue 编号。
