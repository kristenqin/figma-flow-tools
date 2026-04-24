# Token Lab Analysis Pipeline

## 目标

定义 `Token Lab` 如何从一批界面图片生成“可人工确认、可导入 Figma Variables”的 token 草案。

这份文档不追求图像算法细节的学术完整性，而是聚焦产品可落地的分析流程。

## 核心原则

- 目标不是还原整套设计系统，而是产出可编辑初稿
- 多图求公共模式，优先于单图精确测量
- 先稳定抽取高价值 token，再扩展复杂类型
- 识别值和建议值分层展示
- 人工确认是流程的一部分，不是补丁

## 输入约束

推荐输入：

- 5 到 20 张界面图
- 同一产品、同一平台、同一主题
- 分辨率清晰、压缩不过重

不推荐输入：

- 风格跨度很大的图片混批
- 同时混入营销图、插画图和真实界面图
- 只输入单张截图并期待完整 token 系统

## 输出层次

分析链路的输出分成四层：

1. `raw observations`
2. `clusters`
3. `normalized tokens`
4. `semantic suggestions`

这四层必须同时保留，方便用户追溯。

## Stage 1: Ingest

### 目标

对图片做基础接入和预处理。

### 处理内容

- 读取文件元数据
- 统一缩略图预览
- 检测分辨率和纵横比
- 标记图片类型
- 去除明显重复图片

### 输出

```ts
type InputImage = {
  id: string;
  name: string;
  width: number;
  height: number;
  kind?: "mobile" | "desktop" | "tablet" | "unknown";
  duplicateOf?: string;
};
```

## Stage 2: Raw Extraction

### 目标

从图片中提取未经归并的原始视觉候选值。

### MVP 优先提取对象

- 颜色候选
- 间距候选
- 圆角候选
- 描边粗细候选
- 尺寸候选
- 少量文本候选

### 颜色提取

目标：

- 提取主色、辅色、中性色、背景色、文字色、边框色候选

输出示例：

```ts
type RawColorObservation = {
  imageId: string;
  hex: string;
  rgba: { r: number; g: number; b: number; a: number };
  areaRatio: number;
  context:
    | "background"
    | "surface"
    | "text"
    | "border"
    | "accent"
    | "unknown";
};
```

### 间距提取

目标：

- 从组件内边距、列表项间距、卡片与区块间距中提取候选值

注意：

- 第一版不追求完整版面解析
- 优先识别重复出现的常见距离

输出示例：

```ts
type RawSpaceObservation = {
  imageId: string;
  value: number;
  axis: "x" | "y" | "unknown";
  relation:
    | "inset"
    | "stack-gap"
    | "inline-gap"
    | "section-gap"
    | "unknown";
  confidence: number;
};
```

### 圆角提取

目标：

- 提取按钮、卡片、输入框、弹层等常见 UI 元素的角半径候选

输出示例：

```ts
type RawRadiusObservation = {
  imageId: string;
  value: number;
  shapeKind: "button" | "card" | "input" | "chip" | "unknown";
  confidence: number;
};
```

### 文本候选提取

MVP 只做弱识别：

- 字号层级候选
- 字重层级候选
- `fontFamily` / `fontStyle` 候选

不在第一版强求：

- 完整字体名精确识别
- 全量 typography token 自动生成

## Stage 3: Cleaning

### 目标

清理明显脏值，降低后续聚类噪音。

### 清理规则

- 去掉样本数极低的孤立值
- 去掉接近透明或装饰性极强的颜色
- 去掉极端小面积噪点颜色
- 去掉明显异常间距，例如 1px 截图误差
- 去掉不稳定的圆角识别结果

### 输出

清理后的 raw observations，并保留被过滤原因。

```ts
type FilteredObservation<T> = {
  item: T;
  kept: boolean;
  reason?: string;
};
```

## Stage 4: Clustering

### 目标

把离散候选值聚合成更稳定的档位。

### 颜色聚类

原则：

- 同色相、近亮度的颜色归并
- 保留透明度差异较大的颜色
- 中性色单独聚类，避免和品牌色混合

输出示例：

```ts
type ColorCluster = {
  id: string;
  candidates: string[];
  representativeHex: string;
  sampleCount: number;
  likelyRole:
    | "neutral"
    | "brand"
    | "success"
    | "warning"
    | "danger"
    | "unknown";
};
```

### 数值聚类

适用于：

- space
- radius
- stroke
- size

原则：

- 容忍轻微截图误差
- 候选值向常用档位收敛
- 优先得到“少量稳定值”，而不是保留每个测量值

例如：

- `15 / 16 / 17 -> 16`
- `11 / 12 -> 12`
- `7 / 8 / 8 -> 8`

## Stage 5: Normalization

### 目标

把 cluster 转成适合导入的 token 草案。

### 归一规则

- 使用标准化命名
- 合并重复值
- 对 scale 做顺序排序
- 为每个 token 记录来源样本
- 生成 default mode 值

### 输出类型

- primitive colors
- primitive spaces
- primitive radii
- primitive strokes
- primitive sizes

## Stage 6: Semantic Mapping

### 目标

在 primitive 之上生成语义建议，但不强制自动批准。

### 生成方式

根据颜色上下文和出现位置推测用途：

- 大面积浅色背景 -> `surface.default`
- 主要正文文字 -> `text.primary`
- 次要说明文字 -> `text.secondary`
- 常见描边颜色 -> `border.default`
- 高频品牌强调色 -> `surface.brand` 或 `icon.brand`

### 原则

- semantic token 是建议，不是事实
- 必须可编辑
- 必须保留指向 primitive 的 alias 关系

## Stage 7: Mode Inference

### 目标

在有足够样本时推断 `light / dark` 两套 mode。

### 适用前提

- 输入图片中明确包含两套主题
- 或用户在上传时已分组标记

### MVP 建议

mode 推断不要完全自动化，优先采用：

- 用户手动标记图片属于 `light` 或 `dark`
- 系统在各 mode 内分别聚类

这样可靠性更高。

## Stage 8: Review Draft

### 目标

生成给设计师审阅的草案界面数据。

### review 页面需要展示

- 原始候选值
- 聚类后的建议值
- 建议命名
- 使用样本数
- 置信度
- semantic alias 建议
- mode 差异

### review 页面需要支持

- 删除 token
- 合并 token
- 手动改值
- 改名
- 修改 semantic 映射
- 标记为 alias

## 推荐中间结构

分析阶段推荐在 `VARIABLE_SCHEMA` 之外保留一层更完整的工作数据：

```ts
type AnalysisDraft = {
  images: InputImage[];
  raw: {
    colors: RawColorObservation[];
    spaces: RawSpaceObservation[];
    radii: RawRadiusObservation[];
  };
  clusters: {
    colors: ColorCluster[];
    spaces: NumericCluster[];
    radii: NumericCluster[];
  };
  normalized: TokenLabDocument;
};

type NumericCluster = {
  id: string;
  candidates: number[];
  representativeValue: number;
  sampleCount: number;
  likelyKind: "space" | "radius" | "stroke" | "size";
};
```

## 置信度策略

每类候选值都建议带上 `confidence`。

置信度可来自：

- 样本数
- 跨图片重复度
- 上下文稳定性
- 与其他候选值的聚类距离

用途：

- 排序 review 列表
- 标记高风险值
- 控制默认展示层级

## 建议先实现的顺序

1. 颜色提取与聚类
2. 圆角提取与聚类
3. 间距提取与聚类
4. semantic color mapping
5. light / dark mode 分组
6. 少量 typography string 候选

这个顺序更容易尽快做出“能导入 Figma 且看起来像样”的结果。

## 常见误判

- 把图片阴影当作颜色 token
- 把插画颜色当作品牌主色
- 把截图压缩噪点当成真实灰阶
- 把偶发间距当成标准 spacing
- 把装饰性圆角当成基础半径系统

因此第一版必须强调“建议稿”而不是“真相”。

## MVP 验收标准

- 能稳定输出一组可 review 的 color primitives
- 能输出少量可信的 radius tokens
- 能识别出一套基础 spacing scale 候选
- semantic mapping 至少能覆盖 surface / text / border 三类常见 token
- 输出结果能顺利映射到 `VARIABLE_SCHEMA`
