# Product Notes

## 愿景

把 Figma 工作流中那些「重复、靠记忆、难标准化」的环节拆成小工具，每个工具都能独立使用，也能组合成团队效率系统。

## 近期优先级

1. 快捷键热区图：解决学习、分享、输出 PNG 的急用需求。
2. 快捷键数据补全：建立一套可持续维护的快捷键数据库。
3. 学习模式：按场景生成练习卡片，例如「快速整理画布」「组件编辑」「原型连线」。
4. 团队模板：把常用工具输出成分享页或图片，方便团队 onboarding。

## Shortcut Heatmap 的核心假设

- 用户不是只想查快捷键，而是想知道「哪些最值得先记」。
- 键盘热区比纯表格更适合做学习和培训图。
- 排序逻辑应该可解释，至少包含频率、影响力、学习难度、场景标签。
- 输出图片是第一阶段的关键能力，后续再考虑 Figma Plugin 或浏览器扩展。

## 数据模型草案

```ts
type Shortcut = {
  id: string;
  command: string;
  category: string;
  description: string;
  mac: string[];
  win: string[];
  primaryKey: string;
  score: number;
  frequency: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
};
```

## 后续可以讨论的产品形态

- 单页工具站：最快上线，适合多个小工具共用导航。
- Figma Plugin：更贴近使用场景，但开发、审核和权限边界更复杂。
- Chrome Extension：适合增强 Figma Web，但维护成本更高。
- CLI/数据包：适合把规范、快捷键、模板做成团队资产。
