# Token Lab Variable Schema

## 目标

定义 `Token Lab` 在导入 Figma Variables 前使用的中间数据结构。

这个结构不是最终算法输出的全部信息，而是“可供人工确认和导入”的生产格式。

## 设计原则

- 对齐 Figma Variables 的基础能力
- 区分 raw values、normalized values、semantic mapping
- 支持人工改名、合并、删除和 mode 补值
- 能映射到 plugin 导入流程

## 支持的 Figma Variable 类型

- `COLOR`
- `FLOAT`
- `STRING`
- `BOOLEAN`

MVP 中优先使用：

- `COLOR`
- `FLOAT`
- `STRING`

## 顶层结构

```ts
type TokenLabDocument = {
  version: "0.1";
  meta: {
    projectName: string;
    sourceType: "screenshots" | "ui-mocks" | "marketing";
    imageCount: number;
    generatedAt: string;
  };
  collections: TokenCollectionDraft[];
};
```

## Collection 结构

```ts
type TokenCollectionDraft = {
  id: string;
  name: string;
  defaultMode: string;
  modes: TokenMode[];
  groups: TokenGroupDraft[];
};

type TokenMode = {
  id: string;
  name: string;
};
```

推荐 MVP collection：

- `Primitives`
- `Semantics`

## Group 结构

```ts
type TokenGroupDraft = {
  id: string;
  name: string;
  kind:
    | "color"
    | "space"
    | "radius"
    | "stroke"
    | "size"
    | "typography-string";
  tokens: TokenDraft[];
};
```

## Token 结构

```ts
type TokenDraft = {
  id: string;
  name: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  description?: string;
  valuesByMode: Record<string, TokenValue>;
  source: TokenSourceMeta;
  status: "raw" | "normalized" | "reviewed" | "approved";
  aliasOf?: {
    collectionId: string;
    tokenId: string;
  };
};

type TokenValue =
  | ColorValue
  | FloatValue
  | StringValue
  | BooleanValue;
```

## 值结构

```ts
type ColorValue = {
  type: "color";
  hex: string;
  rgba: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
};

type FloatValue = {
  type: "float";
  value: number;
  unit: "px";
};

type StringValue = {
  type: "string";
  value: string;
};

type BooleanValue = {
  type: "boolean";
  value: boolean;
};
```

## 来源信息

```ts
type TokenSourceMeta = {
  origin: "detected" | "merged" | "manual";
  confidence?: number;
  sampleCount?: number;
  rawCandidates?: Array<string | number>;
  notes?: string[];
};
```

## 推荐命名结构

### Primitive

```text
color.gray.100
color.gray.900
color.brand.500
space.2
space.4
space.6
radius.sm
radius.md
stroke.1
size.icon.md
```

### Semantic

```text
surface.default
surface.elevated
surface.brand
text.primary
text.secondary
text.inverse
border.default
border.subtle
icon.primary
```

## 示例

```json
{
  "version": "0.1",
  "meta": {
    "projectName": "Acme Mobile",
    "sourceType": "screenshots",
    "imageCount": 12,
    "generatedAt": "2026-04-24T10:30:00Z"
  },
  "collections": [
    {
      "id": "primitives",
      "name": "Primitives",
      "defaultMode": "light",
      "modes": [
        { "id": "light", "name": "Light" },
        { "id": "dark", "name": "Dark" }
      ],
      "groups": [
        {
          "id": "primitive-color",
          "name": "Color",
          "kind": "color",
          "tokens": [
            {
              "id": "color-gray-100",
              "name": "color.gray.100",
              "resolvedType": "COLOR",
              "valuesByMode": {
                "light": {
                  "type": "color",
                  "hex": "#F7F7F8",
                  "rgba": { "r": 0.9686, "g": 0.9686, "b": 0.9725, "a": 1 }
                },
                "dark": {
                  "type": "color",
                  "hex": "#1C1C1E",
                  "rgba": { "r": 0.1098, "g": 0.1098, "b": 0.1176, "a": 1 }
                }
              },
              "source": {
                "origin": "merged",
                "confidence": 0.91,
                "sampleCount": 18,
                "rawCandidates": ["#F6F6F7", "#F7F7F8", "#F8F8F9"]
              },
              "status": "approved"
            }
          ]
        }
      ]
    }
  ]
}
```

## 导入映射建议

插件导入时按以下顺序处理：

1. 创建 collection
2. 创建 default mode
3. 补充其他 modes
4. 创建 primitive tokens
5. 创建 semantic tokens
6. 为每个 mode 写入值
7. 最后再处理 alias

## 人工确认页需要支持的操作

- 修改 collection 名称
- 修改 token 名称
- 删除脏值
- 合并重复 token
- 修改 mode 值
- 把 token 标记为 alias
- 调整 token 状态为 `reviewed` 或 `approved`

## 暂不纳入 MVP 的结构

- 复杂 typography object
- effect token
- motion token
- gradient token
- 多单位系统
- 跨 collection 的大规模自动 alias 推理
