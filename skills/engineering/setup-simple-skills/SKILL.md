---
name: setup-simple-skills
description: 为 engineering skills 配置本仓库——设置其 issue tracker和领域文档布局。在首次使用其他 engineering skills 之前运行一次。
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

搭建 engineering skills 所假设的按仓库配置：

- **Issue tracker** — issue 存放的位置（默认为本地 markdown ；也支持github）
- **领域文档** — `CONTEXT.md` 和 ADR 存放的位置，以及阅读它们的消费方规则

这是一个提示驱动的 skill，不是确定性脚本。先探索、呈现你的发现、与用户确认，然后写入。

## 流程

### 1. 探索

查看当前仓库以了解其初始状态。读取已存在的内容；不要假设：

- `git remote -v` 和 `.git/config` — 这是 GitHub 仓库吗？是哪一个？
- 仓库根目录的 `AGENTS.md` 和 `CLAUDE.md` — 是否存在？其中是否已有 `## Agent skills` 小节？
- 仓库根目录的 `CONTEXT.md` 和 `CONTEXT-MAP.md`
- `docs/adr/` 以及任何 `src/*/docs/adr/` 目录
- `docs/agents/` — 此 skill 之前的输出是否已存在？
- `.scratch/` — 表明已在使用的本地 markdown issue tracker 约定的迹象
- Monorepo 信号 — `pnpm-workspace.yaml`、`package.json` 中的 `workspaces` 字段，或填充完整且各包带有自己 `src/` 的 `packages/*`。只在真正的大型多包仓库中出现；它们的缺席意味着单上下文，这几乎是所有仓库的情况。

### 2. 呈现发现并提问

总结存在什么、缺少什么。然后按顺序逐个处理各小节——一次一个小节，得到一个答案，再进入下一个。

每个小节都先给出推荐答案，让用户一个字就能接受。仅在选择真正产生分支时才给出一行解释；当探索已经得出结论时则完全跳过该小节。

**Section A — Issue tracker。**

> 说明："issue tracker" 是本仓库 issue 存放的地方。`to-tickets` 和 `to-spec` 等 skills 会读取和写入它——它们需要知道是调用 `gh issue create`、在 `.scratch/` 下写 markdown 文件，还是遵循你描述的其他工作流。请选择你实际跟踪本仓库工作的地方。

默认本地 markdown。
这些 skills 是为 GitHub 设计的。如果 `git remote` 指向 GitHub，就提议 GitHub。否则（或用户偏好时），提供：

- **本地 markdown** — issue 以文件形式存放在本仓库的 `.scratch/<feature>/` 下
- **GitHub** — issue 存放在仓库的 GitHub Issues 中（使用 `gh` CLI）
- **GitLab** — issue 存放在仓库的 GitLab Issues 中（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **其他**（Jira、Linear 等）— 请用户用一段话描述工作流；skill 会将其记录为自由格式的文字

把选择记录到 `docs/agents/issue-tracker.md`。GitHub 和 GitLab 模板带有一个"PRs as a request surface"标志，默认为**关闭**——保持关闭，不要主动提起。

**Section B — 领域文档。** 默认为**单上下文**——仓库根目录一个 `CONTEXT.md` + `docs/adr/`。这适合几乎所有仓库；无需询问直接写入。

仅当探索发现 monorepo 信号时，才提供**多上下文**——根目录一个 `CONTEXT-MAP.md`，指向各上下文的 `CONTEXT.md` 文件。然后确认他们想要哪种布局。

### 3. 确认并编辑

向用户展示以下草稿：

- 要添加到正在编辑的 `CLAUDE.md` / `AGENTS.md` 中的 `## Agent skills` 块（选择规则见第 4 步）
- `docs/agents/issue-tracker.md`和 `docs/agents/domain.md` 

让他们在写入前编辑。

### 4. 写入

**选择要编辑的文件：**

- 如果 `CLAUDE.md` 存在，编辑它。
- 否则如果 `AGENTS.md` 存在，编辑它。
- 如果两者都不存在，询问用户要创建哪一个——不要替他们选择。

当 `CLAUDE.md` 已存在时绝不创建 `AGENTS.md`（反之亦然）——总是编辑已经存在的那个。

如果所选文件中已存在 `## Agent skills` 块，就地更新其内容，而不是追加重复块。不要覆盖用户对周围小节的编辑。

该块内容：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

然后使用本 skill 文件夹中的种子模板作为起点写入文档文件：

- [issue-tracker-local.md](./issue-tracker-local.md) — 本地 markdown issue tracker
- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab issue tracker
- [domain.md](./domain.md) — 领域文档消费方规则 + 布局

对于"其他" issue tracker，根据用户的描述从零开始编写 `docs/agents/issue-tracker.md`。

### 5. 完成

告诉用户设置已完成，以及哪些 engineering skills 现在会读取这些文件。提醒他们以后可以直接编辑 `docs/agents/*.md`——只有在想更换 issue tracker 或从头开始时才需要重新运行此 skill。
