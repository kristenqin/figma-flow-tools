# Token Lab Product Brief

## 一句话定义

一个把一批界面图片半自动整理成可导入 Figma Variables 的生产工具。

## 解决的问题

很多团队手上有大量现成界面图、营销图、历史版本截图，但没有成型的 token 资产。设计师常见的痛点不是“看不出风格”，而是：

- 看得出规律，但提炼不成系统
- 能提炼出值，但命名不统一
- 能命名，但难以快速导入 Figma Variables
- 图片里有很多脏值，缺少归并和人工确认环节

`Token Lab` 的目标不是完美识别每一个像素，而是把截图中的视觉规律整理成一份“足够好、可继续维护”的变量初稿。

## 核心用户

- 需要从现有产品界面反推设计基础资产的设计师
- 需要快速建立变量基础层的设计系统维护者
- 接手旧项目、需要补建设计规范的团队
- 需要把品牌视觉快速沉淀到 Figma 的项目负责人

## 核心场景

1. 团队已有多个页面截图，但没有系统化变量
2. 旧产品改版前，需要先整理颜色、间距、圆角等基础 token
3. 新设计师入场，需要先把历史资产转为可复用变量
4. 团队想在 Figma 中快速建立 light / dark 两套基础 mode

## 产品目标

把“图片分析”变成“变量生产”流程。

输出结果应该满足：

- 能直接在 Figma 文件中创建 local variables
- 命名结构尽量接近后续设计系统可维护形态
- 支持人工确认、删减、合并、重命名
- 保留 primitive 与 semantic 两层结构

## 非目标

第一版不追求：

- 从单张图精准还原完整设计系统
- 无人工介入地自动生成高质量 semantic naming
- 完整的字体识别与 typography 系统
- 动效、模糊、透明、混合模式等复杂视觉属性
- 团队库同步、企业级多文件分发

## MVP 范围

### 输入

- 5 到 20 张风格相对一致的界面图片
- 同一产品、同一端、同一主题优先

### 支持的 token 类型

- Color
- Space
- Radius
- Stroke Width
- Size
- 少量 String 类型文本字段，例如 `fontFamily`、`fontStyle`
- Modes，先支持 `light` 和 `dark`

### 页面流程

1. 上传图片
2. 批量分析
3. 展示 raw values
4. 自动聚类归并
5. 生成人工可编辑的 token 草案
6. 预览导入结果
7. 一键写入当前 Figma 文件

## 推荐输出结构

### Primitive Tokens

用于沉淀基础值：

- `color.gray.100`
- `color.blue.500`
- `space.4`
- `radius.md`
- `stroke.1`

### Semantic Tokens

用于表达界面用途：

- `surface.default`
- `surface.brand`
- `text.primary`
- `text.secondary`
- `border.subtle`

## 为什么优先做 Figma Plugin

如果目标是“可直接导入 Figma”，插件是第一版最稳的路径，因为可以直接在当前文件里创建 variable collection、variable、mode 和具体值。

相比之下，REST API 更适合后续做企业级同步、跨文件批处理和外部系统集成，不适合作为 MVP 的唯一主链路。

## MVP 成功标准

- 设计师能从一批图片中生成一套可用的 local variables 初稿
- 设计师能在导入前完成删重、合并、重命名
- 导入后的变量结构可以直接在 Figma 中被使用
- Color、Space、Radius 三类 token 的质量足以支持后续继续整理

## 关键风险

- 图片批次风格不一致，导致结果脏乱
- 单张图信息不足，语义判断不稳定
- 文本与间距推断精度不如颜色稳定
- 自动命名质量不足，必须保留人工确认
- 用户误以为工具能完整替代设计系统建设

## 产品原则

- 先产出“可编辑初稿”，再追求“自动化完美”
- 先稳定支持少量高价值 token 类型
- 识别值和建议值分层展示，避免误导
- 永远保留人工确认环节
- 输出优先围绕 Figma Variables 的落地结构设计

## 后续扩展方向

- Typography token 拆解
- Shadow token 识别
- 多品牌 / 多主题 mode 扩展
- JSON import / export
- 命名规范转换
- 团队库同步和批量更新
