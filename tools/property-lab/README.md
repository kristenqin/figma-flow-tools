# Property Lab

一个用于解释 Figma 属性面板参数作用和效果的可视化实验台。

## 第一阶段目标

先做 Auto Layout 模块，重点解释：

- Direction
- Gap
- Padding
- Alignment
- Hug / Fill / Fixed
- Wrap
- Absolute Position

## 扩展原则

优先加入这些属性：

- 变化结果直观
- 容易和其他属性混淆
- 工作中高频
- 新手理解成本高

当前最值得加入的下一批属性：

- Constraints
- Min Width / Max Width
- Min Height / Max Height
- Clip Content
- Corner Radius
- Stroke Align
- Opacity
- Text resizing
- Line Height
- Letter Spacing

## 预期页面结构

1. 左侧：仿 Figma 的属性控制面板
2. 右侧：实时布局预览
3. 下方：属性解释、场景建议、误区、CSS 对照

## 数据文件

- `data/autolayout-lessons.js`

## 本地运行

```bash
cd tools/property-lab
python3 -m http.server 5174
```

打开：

```text
http://localhost:5174
```

## 下一步开发建议

1. 先做单页静态原型。
2. 先只支持一个 demo 组件场景，例如按钮组或卡片容器。
3. 让参数变化和解释文案同步联动。
4. 优先继续扩展布局 / 尺寸类属性，再逐步拆出 `Style Lab` 与 `Component Lab`。

## 未来的模块边界

- `Property Lab`
  继续承担布局、尺寸、文本基础理解
- `Style Lab`
  负责描边、圆角、阴影、模糊、透明度等视觉样式
- `Component Lab`
  负责 variants、component properties、variables 等结构关系
- `Prototype Lab`
  负责滚动、overlay、smart animate 等交互属性
