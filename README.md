# simple-skills

简洁有效的 agent skills。 

模型越强，skill提示词要越简洁、限制要越少，避免对模型造成干扰或对强模型的推理效果构成限制。 

本仓库收集+原创对工程师有用的中文版 agent skills，并随着模型能力的增强持续精简和优化。 

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
