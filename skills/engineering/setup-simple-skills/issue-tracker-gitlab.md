# Issue tracker: GitLab

本仓库的 issue 和 spec 以 GitLab issue 形式存在。所有操作使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI。

## 约定

- **创建 issue**：`glab issue create --title "..." --description "..."`。多行描述使用 heredoc。传 `--description -` 可打开编辑器。
- **读取 issue**：`glab issue view <number> --comments`。用 `-F json` 获取机器可读输出。
- **列出 issue**：`glab issue list -F json`，配合适当的 `--label` 过滤器。
- **评论 issue**：`glab issue note <number> --message "..."`。GitLab 把评论称为 "notes"。
- **添加 / 移除标签**：`glab issue update <number> --label "..."` / `--unlabel "..."`。多个标签可用逗号分隔或重复使用标志。
- **关闭**：`glab issue close <number>`。`glab issue close` 不接受关闭评论，所以先用 `glab issue note <number> --message "..."` 发布说明，然后关闭。
- **Merge request**：GitLab 把 PR 称为 "merge requests"。使用 `glab mr create`、`glab mr view`、`glab mr note` 等——与 `gh pr ...` 形态相同，只是用 `mr` 代替 `pr`，用 `note`/`--message` 代替 `comment`/`--body`。

从 `git remote -v` 推断仓库——在克隆目录内运行时 `glab` 会自动完成。


## 当 skill 说"发布到 issue tracker"时

创建一个 GitLab issue。

## 当 skill 说"获取相关票据"时

运行 `glab issue view <number> --comments`。
