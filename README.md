# Figma Flow Tools

一个面向 Figma 使用流程优化的小工具集合。第一阶段先解决「快捷键学习、排序、热区可视化、导出 PNG」这个高频需求，后续可以逐步扩展成设计师/团队的效率工具箱。

## 当前工具

### Shortcut Heatmap

将 Figma 快捷键按使用价值排序，并映射到键盘热区上，方便学习、复盘和输出成图片。

位置：`tools/shortcut-heatmap`

能力：

- 按平台切换：macOS / Windows
- 按场景筛选：选择、编辑、视图、文本、组件、协作等
- 按热度排序：高频命令会更突出
- 键盘热区展示：把主要快捷键映射到对应按键
- 导出 PNG / SVG：用于文档、分享、培训材料

### Property Lab

把 Figma 属性面板里的关键参数拆成可视化实验台，直观解释每个属性值控制什么、变化后会产生什么效果。

位置：`tools/property-lab`

第一阶段聚焦 Auto Layout：

- Direction：横向 / 纵向
- Gap：子项间距变化
- Padding：容器内边距变化
- Alignment：内容对齐方式
- Sizing：Hug / Fill / Fixed
- Wrap / Absolute Position：特殊布局行为

### Token Lab

从一批界面图片中提取颜色、间距、圆角等视觉规律，整理为可导入 Figma Variables 的 token 草案。

位置：`tools/token-lab`

当前阶段定位：

- 批量图片分析
- token 聚类与归并
- 命名与语义映射建议
- 导入 Figma local variables

## 项目方向

这个仓库可以逐步沉淀为「Figma workflow optimizer」：

- 快捷键热区与学习卡片
- 命名规范检查器
- 图层/组件整理 checklist
- Token/样式命名转换器
- 图片到 Variables 的 token 生产工具
- 设计交付检查清单生成器
- Figma 文档结构模板生成器
- 批量文案占位/替换工具

## 本地运行

```bash
cd tools/shortcut-heatmap
python3 -m http.server 5173
```

然后打开：

```text
http://localhost:5173
```

也可以直接双击打开 `tools/shortcut-heatmap/index.html`。

`Property Lab` 后续也会采用同样的静态页面方式，方便快速预览和导出讲解图。

## 数据说明

第一版数据放在 `tools/shortcut-heatmap/data/shortcuts.js`。Figma 官方建议在 App 内通过快捷键面板查看完整快捷键，不同平台和键盘布局可能存在差异；因此这里先采用可维护的结构，方便后续补全、校对、导入或接入官方/团队自定义数据。

## Git Hook

仓库内置了一个 `post-commit` hook，提交成功后会自动推送到远程 `origin`。

启用方式：

```bash
git config core.hooksPath .githooks
chmod +x .githooks/post-commit
```

临时跳过自动推送：

```bash
SKIP_AUTO_PUSH=1 git commit -m "your message"
```
