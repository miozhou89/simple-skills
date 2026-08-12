---
name: officedocs
description: "当用户需要创建、读取、编辑或操作 Microsoft Office 文档时使用本技能，涵盖 Word（.docx）、PowerPoint（.pptx）和 Excel（.xlsx/.xlsm/.csv/.tsv）。触发场景包括：提及 'Word doc'、'.docx'、'deck'、'slides'、'presentation'、'.pptx'、电子表格、'.xlsx'、'.csv' 等内容的任何任务；生成报告、演示文稿或带公式与格式的电子表格等交付物；从这些文件提取或重组内容、编辑修订或评论、插入或替换图片、合并拆分、转换与清理。当主要交付物必须是 docx/pptx/xlsx 文件时使用本技能。请勿用于 PDF、HTML 报告、Google Docs/Sheets API 或与 Office 文档无关的通用编码任务。"
---

# Office 文档（docx/pptx/xlsx）创建、编辑与分析

## 概述

三种格式共用 `scripts/office/` 下的工具：解包（`unpack.py`）、重新打包（`pack.py`）、XML 验证（`validate.py`）、LibreOffice 转换（`soffice.py`）。

## 快速参考

| 任务 | 实现方式 |
| - | - |
| DOCX 读取/分析 | `pandoc` 或解包获取原始 XML |
| DOCX 创建 | 使用 `docx-js`，参考下方「创建新文档」 |
| DOCX 编辑 | 解包 → 编辑 XML → 重新打包 |
| PPTX 读取/分析 | `python -m markitdown presentation.pptx` |
| PPTX 基于模板编辑或创建 | 参考 [editing.md](editing.md) |
| PPTX 从零开始创建 | 参考 [pptxgenjs.md](pptxgenjs.md) |
| XLSX 数据分析 | pandas |
| XLSX 公式/格式 | openpyxl + `scripts/recalc.py` 重新计算 |

## 通用工具

```bash
# 转换为图片（视觉检查）：先 soffice 转 PDF，再 pdftoppm 转图
python scripts/office/soffice.py --headless --convert-to pdf file.docx   # 或 .pptx / .xlsx
pdftoppm -jpeg -r 150 file.pdf page          # 生成 page-01.jpg 等；-f N -l N 可重渲染特定页

# 解包与打包
python scripts/office/unpack.py file.docx unpacked/
python scripts/office/pack.py unpacked/ output.docx --original file.docx
```

---

# DOCX 创建、编辑与分析

## 读取内容

```bash
# 提取包含修订的文本
pandoc --track-changes=all document.docx -o output.md

# 访问原始 XML
python scripts/office/unpack.py document.docx unpacked/

# 旧版 .doc 必须先转换为 .docx 才能编辑
python scripts/office/soffice.py --headless --convert-to docx document.doc

# 生成已接受所有修订的干净文档（需要 LibreOffice）
python scripts/accept_changes.py input.docx output.docx
```

## 创建新文档（docx-js）

用 `npm install -g docx` 安装，构建后运行 `python scripts/office/validate.py doc.docx` 验证；失败则解包、修复 XML、重新打包。

### 页面尺寸

- docx-js 默认 A4，**必须显式设置页面尺寸**。DXA 单位：1440 DXA = 1 英寸。
- US Letter：12240 × 15840 DXA；1 英寸边距下内容宽度 = 9360。
- 横向：传入纵向尺寸 + `orientation: PageOrientation.LANDSCAPE`，docx-js 会内部交换宽高。

### 样式（覆盖内置标题样式）

用精确 ID（`Heading1`、`Heading2`…）覆盖内置样式，标题必须含 `outlineLevel`（H1=0，H2=1），否则目录无效：

```javascript
{ id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
  run: { size: 32, bold: true, font: "Arial" },
  paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
```

### 列表（切勿使用 Unicode 项目符号）

禁止手插 `•` 字符；用 numbering 配置 + `LevelFormat.BULLET` / `LevelFormat.DECIMAL`。相同 `reference` 编号连续，不同则重新开始。

### 表格（双重宽度设置）

同时设置表格 `columnWidths` 和每个单元格 `width`，一律 `WidthType.DXA`（百分比在 Google Docs 失效）。规则：

- 表格宽度 = columnWidths 之和 = 内容宽度
- 底纹用 `ShadingType.CLEAR`（SOLID 会渲染成黑色背景），单元格加 `margins: { top: 80, bottom: 80, left: 120, right: 120 }`
- 分隔线/规则线用 Paragraph 的 `border`，**禁止用表格**（单元格有最小高度，会渲染为空框）

### 图片

`ImageRun` 必须传 `type`（png/jpg 等），`altText` 的 title/description/name 三个属性都必需。

### 其他常用元素

```javascript
new Paragraph({ children: [new PageBreak()] })          // 分页符，PageBreak 必须在 Paragraph 内
new ExternalHyperlink({ children: [new TextRun({ text: "点此", style: "Hyperlink" })], link: "https://..." })
new Bookmark({ id: "c1", children: [new TextRun("第一章")] })   // 内部链接：Bookmark + InternalHyperlink anchor
footnotes: { 1: { children: [new Paragraph("来源")] } }          // 正文用 FootnoteReferenceRun(1)
tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]  // 点引导符用 PositionalTab leader: DOT
column: { count: 2, space: 720, equalWidth: true, separate: true }      // 多列；自定义宽度用 new Column({width, space})
new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" })  // 目录仅支持 HeadingLevel
headers: { default: new Header({ children: [/*…*/] }) }   // 页脚同理，页码用 PageNumber.CURRENT
```

### docx-js 重要规则

- 页面尺寸必须显式设置；横向布局传纵向尺寸
- 切勿使用 `\n`（用独立 Paragraph）、切勿用 Unicode 项目符号
- `PageBreak` 必须放在 Paragraph 内
- 表格宽度用 DXA 且等于 columnWidths 之和；`ShadingType.CLEAR`；单元格加边距
- 目录仅支持 HeadingLevel 标题，不能自定义样式
- 覆盖内置样式用精确 ID 并包含 `outlineLevel`

## 编辑现有文档

按顺序执行全部 3 步：

1. **解包**：`python scripts/office/unpack.py document.docx unpacked/`（合并相邻文本块、智能引号转 XML 实体；`--merge-runs false` 跳过合并）
2. **编辑 XML**：编辑 `unpacked/word/` 中的文件，用 Edit 工具直接字符串替换，不写 Python 脚本。
   - 修订和评论默认作者 "Opencode"，除非用户另有要求
   - 新内容用智能引号实体：`&#x2018;` `&#x2019;` `&#x201C;` `&#x201D;`
   - 添加评论：`python scripts/comment.py unpacked/ 0 "文本"`（`--parent 0` 回复，`--author` 自定义作者），然后在 document.xml 加标记（见「XML 参考」）
3. **打包**：`python scripts/office/pack.py unpacked/ output.docx --original document.docx`（自动修复 durableId 与 `xml:space="preserve"`；`--validate false` 跳过）

### 常见陷阱

- 添加修订时替换整个 `<w:r>` 块为同级的 `<w:del>/<w:ins>`，不在文本块内部注入修订标签
- 保留 `<w:rPr>` 格式：把原始文本块的 `<w:rPr>` 复制到修订文本块，保持粗体、字号等

## XML 参考

### 修订

**插入：**

```xml
<w:ins w:id="1" w:author="Opencode" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>插入的文本</w:t></w:r>
</w:ins>
```

**删除：**

```xml
<w:del w:id="2" w:author="Opencode" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>删除的文本</w:delText></w:r>
</w:del>
```

`<w:del>` 内用 `<w:delText>` 替代 `<w:t>`。**最小化编辑**——仅标记变更部分，如 "30天"→"60天" 拆为 `<w:r>期限为 </w:r> <w:del>30</w:del> <w:ins>60</w:ins> <w:r> 天。</w:r>`。

**删除整个段落/列表项**：移除内容时同时把段落标记标为已删除（`<w:pPr><w:rPr>` 中加 `<w:del/>`），否则接受修订后留下空段落。

**拒绝他人插入**：把 `<w:del>` 嵌套在他们的 `<w:ins>` 内。**恢复他人删除**：在后面添加 `<w:ins>`，不修改他们的 `<w:del>`。

### 评论

`<w:commentRangeStart>` / `<w:commentRangeEnd>` 是 `<w:r>` 的同级元素，**绝不能放进 `<w:r>` 内部**。回复用 `--parent` 并把标记嵌套在父标记内。

### 图片生成

1. 图片放入 `word/media/`，在 `word/_rels/document.xml.rels` 添加关联（`rId5` → `media/image1.png`）
2. `[Content_Types].xml` 添加 `<Default Extension="png" ContentType="image/png"/>`
3. document.xml 中引用：`<wp:extent cx="914400" cy="914400"/>`（EMU：914400 = 1 英寸），`<a:blip r:embed="rId5"/>`

## 依赖

- pandoc（文本提取）、docx（`npm install -g docx`）、LibreOffice（PDF 转换）、Poppler `pdftoppm`（图片转换）

---

# PPTX 创建与编辑

## 读取内容

```bash
python -m markitdown presentation.pptx          # 文本提取
python scripts/thumbnail.py presentation.pptx   # 视觉概览
python scripts/office/unpack.py presentation.pptx unpacked/   # 原始 XML
```

## 编辑工作流（基于模板）

**完整说明见 [editing.md](editing.md)。**

1. 用 `thumbnail.py` 分析模板
2. 解包 → 操作幻灯片 → 编辑内容 → 清理 → 打包

## 设计建议

**禁止做纯文字幻灯片**——每张都需要视觉元素（图片、图表、图标、形状）。布局选项：双栏、图标+文字行、2x2/2x3 网格、半出血图片；数据用大数字标注、对比列、时间线。

### 配色

选择与主题匹配的配色，禁止默认蓝色。主色占 60-70% 视觉权重，配 1-2 种辅助色 + 1 种强调色：

| 主题 | 主色 | 辅助色 | 强调色 |
|-------|---------|-----------|--------|
| **午夜商务** | `1E2761`（海军蓝） | `CADCFC`（冰蓝） | `FFFFFF`（白色） |
| **森林与苔藓** | `2C5F2D`（森林绿） | `97BC62`（苔藓绿） | `F5F5F5`（奶油色） |
| **珊瑚活力** | `F96167`（珊瑚色） | `F9E795`（金色） | `2F3C7E`（海军蓝） |
| **暖陶土** | `B85042`（陶土色） | `E7E8D1`（沙色） | `A7BEAE`（鼠尾草绿） |
| **海洋渐变** | `065A82`（深蓝） | `1C7293`（青色） | `21295C`（午夜蓝） |
| **炭灰极简** | `36454F`（炭灰） | `F2F2F2`（米白） | `212121`（黑色） |
| **青色信赖** | `028090`（青色） | `00A896`（海沫绿） | `02C39A`（薄荷绿） |
| **浆果与奶油** | `6D2E46`（浆果色） | `A26769`（灰玫瑰色） | `ECE2D0`（奶油色） |
| **鼠尾草宁静** | `84B59F`（鼠尾草绿） | `69A297`（桉树叶绿） | `50808E`（石板蓝） |
| **樱桃大胆** | `990011`（樱桃红） | `FCF6F5`（米白） | `2F3C7E`（海军蓝） |

### 排版与间距

- 标题 36-44pt 粗体；章节标题 20-24pt 粗体；正文 14-16pt；图注 10-12pt
- 最小边距 0.5 英寸；内容块间距 0.3-0.5 英寸，选择一种并保持一致

### 避免

- 重复相同布局、居中对齐正文、纯文字幻灯片、默认蓝色、随意混合间距
- 低对比度元素（文字/图标与背景对比不足）
- **标题下方绝对禁止用强调线**（AI 生成幻灯片的典型标志）；用空白或背景色代替

## 质量保证（必须执行）

**假设有问题存在——你的任务是找到它们。** 首次渲染几乎不可能正确；如果检查没发现问题，说明看得不够仔细。

1. **内容检查**：`python -m markitdown output.pptx` 查缺失内容、拼写、顺序。用模板时 grep 残留占位符：
   ```bash
   python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum|this.*(page|slide).*layout"
   ```
   有结果必须先修复再宣布成功。
2. **视觉检查**：**使用子代理**（即使 2-3 张幻灯片，子代理有全新视角）。转图后逐张找：重叠元素、文字溢出/截断、标题换行、间距过近（<0.3 英寸）、边距不足（<0.5 英寸）、对齐不一致、低对比度、过度换行、残留占位符。
3. **验证循环**：生成 → 转图 → 列出问题 → 修复 → **重新验证受影响的幻灯片**（一个修复常引发新问题），直到一轮检查无新问题。**至少完成一次修复-验证循环前，禁止宣布成功。**

## 依赖项

- `pip install "markitdown[pptx]"`（文本提取）、`pip install Pillow`（缩略图）、`npm install -g pptxgenjs`（从零创建）、LibreOffice（PDF 转换）、Poppler（PDF 转图片）

---

# XLSX 创建、编辑和分析

## 输出要求

### 所有 Excel 文件

- 统一专业字体（Arial/Times New Roman），除非用户另有指示
- 交付模型必须零公式错误（#REF!、#DIV/0!、#VALUE!、#N/A、#NAME?）
- 修改现有模板时严格匹配其格式与规范，模板规范优先于本指南

### 财务模型（除非用户或模板另有说明）

**颜色编码**：蓝=硬编码输入值，黑=公式和计算结果，绿=本工作簿内跨表链接，红=指向其他文件的外部链接，黄底=需关注的关键假设

**数字格式**：年份格式化为文本（"2024"而非"2,024"）；货币 `$#,##0` 且表头注明单位；零值显示为 "-"；百分比 0.0%；估值倍数 0.0x；负数用括号 (123)

**公式构建**：假设值放独立单元格，公式用单元格引用（`=B5*(1+$B$6)` 而非 `=B5*1.05`）；验证引用正确、检查差一错误、预测期公式一致、测边界情况（零/负）、无循环引用。硬编码值必须注明来源："来源: [系统/文档], [日期], [具体引用], [URL]"

## 关键要求：使用公式，不要硬编码值

**始终用 Excel 公式，禁止在 Python 中计算后硬编码**（`sheet['B10'] = '=SUM(B2:B9)'` 而非把 sum 结果写死）。电子表格必须在源数据变化时可重新计算——这适用于总计、百分比、比率、差值等所有计算。

## 读取与分析

- 数据分析用 pandas：`pd.read_excel('file.xlsx')`，`sheet_name=None` 取全部工作表；`dtype` 指定类型、`usecols` 只读指定列、`parse_dates` 解析日期
- 公式/格式用 openpyxl：单元格 1 索引（row=1,column=1=A1）；`data_only=True` 读计算值，但**禁止用 data_only 打开后保存**（公式会被替换为值并永久丢失）

## 通用工作流

1. 选工具：数据分析 pandas，公式/格式 openpyxl
2. 创建或加载 → 修改（数据/公式/格式）→ 保存
3. **用公式时必须重新计算**：`python scripts/recalc.py output.xlsx [timeout_seconds]`
4. 验证：脚本返回 JSON，`status` 为 `errors_found` 时按 `error_summary` 的定位修复后重算。常见错误：`#REF!` 无效引用、`#DIV/0!` 除零、`#VALUE!` 类型错误、`#NAME?` 公式名

```python
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font

wb = Workbook(); ws = wb.active                    # 创建
ws['B2'] = '=SUM(A1:A10)'
ws['A1'].font = Font(bold=True, color='FF0000')
ws.column_dimensions['A'].width = 20
wb.save('output.xlsx')                             # 之后必须 recalc.py

wb = load_workbook('existing.xlsx')                # 编辑，保留公式和格式
ws.insert_rows(2); ws.delete_cols(3)
wb.create_sheet('NewSheet'); wb.save('modified.xlsx')
```

## 公式验证检查清单

- [ ] **测试 2-3 个示例引用**：构建完整模型前验证取值正确
- [ ] **列映射**：第 64 列是 BL，不是 BK；**行偏移**：DataFrame 第 5 行 = Excel 第 6 行（1 索引）
- [ ] NaN 用 `pd.notna()` 检查；搜索所有匹配项而非第一个；财年数据常在第 50 列之后
- [ ] 除法前检查分母（#DIV/0!）；所有引用指向目标单元格（#REF!）；跨表引用格式 `Sheet1!A1`
- [ ] 先在小范围（2-3 单元格）测公式再广泛应用；验证引用的单元格存在；测边界情况（零、负数、极大值）

## 最佳实践

- pandas 适合数据分析、批量操作和简单导出；openpyxl 适合复杂格式、公式和 Excel 特有功能
- 大文件：读取用 `read_only=True`，写入用 `write_only=True`
- openpyxl 保留公式但不计算，必须用 recalc.py 更新值

## 代码风格指南

- 简洁 Python，不要无关注释与 print；避免冗长变量名和冗余操作
- 复杂公式或重要假设的单元格加注释；记录硬编码值的数据来源；为关键计算和模型部分添加说明
