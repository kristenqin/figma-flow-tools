# Property Lab Roadmap

## 目标

让 `Property Lab` 从 Auto Layout 单页原型，逐步成长为一套可持续扩展的 Figma 属性理解平台。

## 设计原则

- 不追求一次性覆盖所有属性
- 先覆盖“最值得解释”的属性
- 每类属性使用最适合自己的展示方式
- 当某类属性过多时，及时拆出独立子实验室

## 优先级矩阵

### P0：继续扩当前 Auto Layout 页面

- Constraints
- Min Width
- Max Width
- Min Height
- Max Height
- Clip Content

原因：

- 和当前预览框架最兼容
- 最适合继续强化“参数变化 -> 结果变化”
- 对实际文件搭建最有帮助

### P1：样式属性

- Corner Radius
- Independent Corners
- Stroke Align
- Opacity
- Layer Blur
- Background Blur
- Shadow

建议形态：

- 对比卡片
- 滑杆实验台
- 并排 before / after 预览

### P2：文本属性

- Text resizing
- Line Height
- Letter Spacing
- Paragraph Spacing
- Truncate

建议形态：

- 文本块演示器
- 多语言 / 多行内容场景
- 标题、正文、按钮文案的对比预览

### P3：组件与变量

- Variants
- Component Properties
- Variables
- Modes
- Alias

建议形态：

- 结构关系图
- 依赖关系演示
- 切换状态与实例映射

### P4：原型属性

- Overflow Scrolling
- Fixed Position When Scrolling
- Overlay
- Smart Animate

建议形态：

- 场景驱动演示
- 简化页面流转
- 滚动容器和悬浮元素对比

## 最近两步建议

1. 先把 `Constraints`、`Min/Max`、`Clip Content` 加进当前 Auto Layout 页面
2. 然后再开启一个更独立的 `Style Lab` 页面
