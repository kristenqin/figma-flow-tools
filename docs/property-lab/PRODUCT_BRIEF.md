# Property Lab Product Brief

## 一句话定义

一个把 Figma 属性面板参数“翻译成人话并可视化演示”的实验工具。

## 解决的问题

很多用户知道属性名称，但不知道：

- 它到底控制什么
- 数值变化为什么会导致当前结果
- 哪些值是常用、安全、推荐的
- 什么情况下应该用另一种设置

## 核心用户

- 正在学习 Figma 的设计师
- 刚接触 Auto Layout 的初中级设计师
- 需要培训团队的负责人
- 希望减少设计沟通成本的设计系统维护者

## MVP 范围

只做 Auto Layout 实验台。

页面包括：

1. 控制面板
2. 实时预览
3. 属性解释卡片
4. 场景建议
5. 常见误区
6. CSS 对照说明

## MVP 的成功标准

- 用户修改属性后能立即看到明显差异
- 用户能够理解 Hug / Fill / Fixed 的区别
- 用户能理解 Padding 与 Gap 的区别
- 用户能理解 Alignment 如何影响内容排布
- 页面可用于截图、分享和培训

## 后续扩展方向

- Constraints Lab
- Text Properties Lab
- Effect / Stroke / Radius 可视化解释
- Component Properties 教学模式
- Variables / Tokens 映射模式

## 属性扩展策略

不是所有 Figma 属性都应该直接塞进同一个页面。

更合理的方式是：

- 先建立一个统一入口：`Property Lab`
- 再根据属性特性分成不同演示模式
- 当某一类属性足够多时，再拆成独立子实验室

### 适合优先做的属性特征

- 调整后画面结果明显变化
- 容易和其他属性混淆
- 在真实工作中高频
- 新手理解成本高

### 第一批扩展优先级

1. `Constraints`
2. `Min Width / Max Width`
3. `Min Height / Max Height`
4. `Clip Content`
5. `Corner Radius`
6. `Stroke Align`
7. `Opacity`
8. `Text resizing`
9. `Line Height`
10. `Letter Spacing`

### 后续方向建议

- 当前页面继续扩展布局与尺寸类属性
- 样式类属性逐步沉淀为 `Style Lab`
- 组件类属性逐步沉淀为 `Component Lab`
- 原型与滚动类属性逐步沉淀为 `Prototype Lab`
