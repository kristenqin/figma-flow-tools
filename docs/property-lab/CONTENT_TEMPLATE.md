# Property Lab Content Template

每个属性模块尽量保持统一结构，方便后续扩展更多属性。

## 内容结构

```ts
type PropertyLesson = {
  id: string;
  title: string;
  group: string;
  summary: string;
  controlType: "segmented" | "slider" | "toggle" | "select";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number | boolean;
  explanation: {
    whatItControls: string;
    visualEffect: string;
    whenToUse: string[];
    commonMistakes: string[];
    cssMapping?: string[];
  };
};
```

## 写作模板

### 标题

例如：`Padding`

### 一句话解释

例如：控制容器边缘与内部内容之间的留白距离。

### 它控制什么

说明这个属性实际影响的是容器、子项、对齐还是尺寸计算。

### 变化效果

说明当值变大、变小、切换不同模式时，画面会怎样变化。

### 适用场景

- 按钮
- 卡片
- 表单组
- 导航条

### 常见误区

- 把 Gap 误以为是容器外边距
- 把 Fill 理解成固定宽度拉满

### CSS 对照

- `padding`
- `gap`
- `justify-content`
- `align-items`
- `flex-wrap`

## 首批模块建议

- Direction
- Gap
- Padding
- Alignment
- Sizing
- Wrap
- Absolute Position

## 展示模式分层

不是所有属性都适合用同一种交互方式解释。建议按以下模式组织内容。

### 1. 实验台型

适合“参数变化后，布局或尺寸实时变化”的属性。

典型属性：

- Direction
- Gap
- Padding
- Alignment
- Sizing
- Constraints
- Text resizing

### 2. 对比型

适合“两个相近属性容易混淆，需要并排比较”的属性。

典型属性：

- Stroke Align
- Layer Blur vs Background Blur
- Opacity vs Fill Opacity
- Corner Radius vs Corner Smoothing

### 3. 结构关系型

适合“不是单个数值变化，而是对象关系变化”的属性。

典型属性：

- Variants
- Component Properties
- Variables
- Modes
- Alias

### 4. 场景演示型

适合“需要放到具体界面情境里才容易理解”的属性。

典型属性：

- Clip Content
- Overflow Scrolling
- Fixed Position When Scrolling
- Absolute Position

## 属性路线图

### Phase 1：Auto Layout 扩展

- Constraints
- Min Width
- Max Width
- Min Height
- Max Height
- Clip Content

### Phase 2：Style 理解

- Corner Radius
- Independent Corners
- Stroke Weight
- Stroke Align
- Opacity
- Blend Mode
- Layer Blur
- Background Blur
- Shadow

### Phase 3：Text 理解

- Auto Width / Auto Height / Fixed Size
- Line Height
- Letter Spacing
- Paragraph Spacing
- Truncate
- Alignment

### Phase 4：Component / Variables 理解

- Variants
- Component Properties
- Exposed nested instances
- Variables
- Modes
- Alias
