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
