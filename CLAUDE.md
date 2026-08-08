Skills 按 bucket 目录组织在 `skills/` 下：

- `engineering/` — 日常代码工作
- `productivity/` — 日常非代码工作流工具

`engineering/` 或 `productivity/`（即 **promoted** bucket）中的每个 skill 必须在顶层 `README.md` 中有引用，且在 `.claude-plugin/plugin.json` 的 `skills` 数组中有条目（Claude Code 插件恰好发布 promoted 集合）。

安装命令逐字复制自 [.agents/install-block.md](./.agents/install-block.md)。`.claude-plugin/marketplace.json` 使本 repo 成为自身的单插件 marketplace —— 这是 install block 中说明的备用方案，而非官方文档路径。修改任一 manifest 后必须运行 `claude plugin validate . --strict`。

顶层 `README.md` 中的每个 skill 条目必须将 skill name 链接到其 `SKILL.md`。

每个 bucket 目录都有一个 `README.md`，以一行描述列出该 bucket 中所有 skill，并将 skill name 链接到其 `SKILL.md`。promoted bucket 的 `README.md` 及顶层 `README.md` 将条目分为 **User-invoked** 和 **Model-invoked** 两组。

`engineering/` 和 `productivity/` 中的 skill 还需在 `docs/<bucket>/<skill-name>.md` 提供面向人类的文档页（docs 目录树镜像 `skills/` 下这两个 bucket 目录）。

每个 `SKILL.md` 必为以下二者之一：user-invoked（`disable-model-invocation: true` 且 `agents/openai.yaml` 中 `policy.allow_implicit_invocation: false`，仅人类可触达）或 model-invoked（模型或人类均可触达）。

[`ask-route`](./skills/engineering/ask-route/SKILL.md) 是路由器，映射所有 user-reachable skill 及其相互关系。重新同步文档页的触发条件同样适用于它：每当新增、重命名、移除 skill 或改变某个 user-reachable skill 在流程中的角色时，必须重读 `ask-route` 的 `SKILL.md` 并更新，确保映射准确 —— 新 skill 未被提及，或仍路由到已失效的 skill，即为路由器失效。

要将所有 skill （重新）链接到本地 harness skill 目录（`~/.claude/skills`、`~/.agents/skills`），运行 `scripts/link-skills.sh`。每个条目是指向本 repo 的符号链接，因此 `git pull` 即可保持已安装 skill 为最新；新增、移除或重命名 skill 后必须重新运行该脚本。
