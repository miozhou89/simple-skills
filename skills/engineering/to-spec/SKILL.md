---
name: to-spec
description: 把当前对话转化为一份 spec 并发布到项目 issue tracker——不做访谈，只综合你们已经讨论过的内容。
disable-model-invocation: true
---

本 skill 接收当前对话上下文和代码库理解，产出一份 spec。不要访谈用户——只综合你已经知道的内容。


## 流程

1. 探索仓库以了解代码库当前状态（如果还没有的话）。在整份 spec 中使用项目领域词汇表的词汇，并尊重你所触及区域的任何 ADR。

2. 勾画出你将在哪些 seam 处测试该功能。应优先使用现有 seam 而不是新建。使用尽可能高的 seam。如果需要新 seam，在你能达到的最高点提议它们。整个代码库中 seam 越少越好——理想数量是一个。

与用户确认这些 seam 符合他们的预期。

3. 使用下面的模板编写 spec，然后发布到项目 issue tracker。

<spec-template>

## Problem Statement

用户面临的问题，从用户的视角描述。

## Solution

问题的解决方案，从用户的视角描述。

## User Stories

一个很长的、编号的用户故事列表。每个用户故事应采用如下格式：

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

这个用户故事列表应该极其详尽，覆盖该功能的所有方面。

## Implementation Decisions

已做出的实现决策列表。可以包括：

- 将被构建/修改的模块
- 这些模块将被修改的接口
- 来自开发者的技术澄清
- 架构决策
- Schema 变更
- API 契约
- 具体交互

不要包含具体文件路径或代码片段。它们可能很快就会过时。

例外：如果原型产出了一个比散文更精确地编码决策的片段（状态机、reducer、schema、类型形态），将其内联到相关决策中，并简要注明它来自原型。裁剪到富含决策的部分——不是可运行的 demo，只要重要的部分。

## Testing Decisions

已做出的测试决策列表。包括：

- 对什么是好测试的描述（只测试外部行为，不测试实现细节）
- 哪些模块将被测试
- 测试的既有先例（即代码库中类似类型的测试）

## Out of Scope

对超出本 spec 范围的事物的描述。

## Further Notes

关于该功能的任何其他说明。

</spec-template>
