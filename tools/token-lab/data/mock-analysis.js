window.TOKEN_LAB_FIXTURES = {
  batch: {
    id: "acme-mobile-spring",
    name: "Acme Mobile / Spring Refresh",
    sourceType: "screenshots",
    platform: "iOS",
    productArea: "Commerce App",
    imageCount: 8,
    consistencyScore: 87,
    defaultMode: "light"
  },
  stages: [
    {
      id: "ingest",
      label: "Ingest",
      status: "done",
      metric: "8 images",
      summary: "批次接入完成，重复截图已清理。"
    },
    {
      id: "extract",
      label: "Raw",
      status: "done",
      metric: "96 signals",
      summary: "颜色、间距、圆角和少量文本候选已抽取。"
    },
    {
      id: "cluster",
      label: "Cluster",
      status: "done",
      metric: "21 groups",
      summary: "离散候选已归并为更稳定的视觉档位。"
    },
    {
      id: "normalize",
      label: "Normalize",
      status: "active",
      metric: "19 tokens",
      summary: "当前正在 review primitives 和 semantic aliases。"
    },
    {
      id: "import",
      label: "Import",
      status: "pending",
      metric: "Preview ready",
      summary: "导入前检查已通过，等待策略确认。"
    }
  ],
  images: [
    { id: "img-home-light", name: "Home / Light", kind: "mobile", mode: "light", frame: "Home", note: "主要品牌层级和卡片容器", accent: "#0F7A5C" },
    { id: "img-detail-light", name: "Detail / Light", kind: "mobile", mode: "light", frame: "Detail", note: "正文层级和分组边距最稳定", accent: "#1A1A1C" },
    { id: "img-cart-light", name: "Cart / Light", kind: "mobile", mode: "light", frame: "Cart", note: "表单、stepper、列表密度", accent: "#F6F5F1" },
    { id: "img-profile-light", name: "Profile / Light", kind: "mobile", mode: "light", frame: "Profile", note: "二级文字和分隔线", accent: "#7C7D84" },
    { id: "img-home-dark", name: "Home / Dark", kind: "mobile", mode: "dark", frame: "Home", note: "dark surface 与品牌高亮", accent: "#E9FFF6" },
    { id: "img-detail-dark", name: "Detail / Dark", kind: "mobile", mode: "dark", frame: "Detail", note: "边框和 elevated surface", accent: "#121315" },
    { id: "img-cart-dark", name: "Cart / Dark", kind: "mobile", mode: "dark", frame: "Cart", note: "状态色和禁用文本", accent: "#2A2B31" },
    { id: "img-orders-dark", name: "Orders / Dark", kind: "mobile", mode: "dark", frame: "Orders", note: "列表 gap 与 chips", accent: "#FFD166" }
  ],
  rawGroups: [
    {
      id: "raw-colors",
      name: "Raw Colors",
      eyebrow: "96 observations",
      summary: "按上下文提取的颜色候选，包含 surface、text、border、accent。",
      items: [
        { id: "raw-color-1", label: "#F6F5F1", meta: "surface / 18 samples", confidence: 0.97, swatch: "#F6F5F1" },
        { id: "raw-color-2", label: "#FFFFFF", meta: "surface / 10 samples", confidence: 0.84, swatch: "#FFFFFF" },
        { id: "raw-color-3", label: "#1A1A1C", meta: "text / 16 samples", confidence: 0.93, swatch: "#1A1A1C" },
        { id: "raw-color-4", label: "#7C7D84", meta: "text-secondary / 9 samples", confidence: 0.79, swatch: "#7C7D84" },
        { id: "raw-color-5", label: "#0F7A5C", meta: "accent / 12 samples", confidence: 0.89, swatch: "#0F7A5C" }
      ]
    },
    {
      id: "raw-spacing",
      name: "Raw Spacing",
      eyebrow: "31 observations",
      summary: "从卡片 inset、列表堆叠和 section gap 中提取的候选值。",
      items: [
        { id: "raw-space-1", label: "8 px", meta: "inline-gap / 7 samples", confidence: 0.72 },
        { id: "raw-space-2", label: "12 px", meta: "stack-gap / 6 samples", confidence: 0.77 },
        { id: "raw-space-3", label: "16 px", meta: "inset / 9 samples", confidence: 0.95 },
        { id: "raw-space-4", label: "24 px", meta: "section-gap / 5 samples", confidence: 0.83 }
      ]
    },
    {
      id: "raw-radius",
      name: "Raw Radius",
      eyebrow: "12 observations",
      summary: "按钮、卡片、筛选 chips 的圆角候选。",
      items: [
        { id: "raw-radius-1", label: "10 px", meta: "button / 4 samples", confidence: 0.69 },
        { id: "raw-radius-2", label: "12 px", meta: "card / 5 samples", confidence: 0.92 },
        { id: "raw-radius-3", label: "16 px", meta: "chip / 3 samples", confidence: 0.66 }
      ]
    }
  ],
  clusterGroups: [
    {
      id: "cluster-color",
      name: "Color Clusters",
      eyebrow: "6 stable groups",
      summary: "颜色按中性色、品牌色和状态色完成归并。",
      items: [
        { id: "cluster-color-1", label: "Neutral / 100", meta: "#F6F5F1 + #FFFFFF", confidence: 0.91, swatch: "#F6F5F1" },
        { id: "cluster-color-2", label: "Neutral / 900", meta: "#1A1A1C + #121315", confidence: 0.94, swatch: "#1A1A1C" },
        { id: "cluster-color-3", label: "Brand / 500", meta: "#0F7A5C + #1B8E6D", confidence: 0.9, swatch: "#0F7A5C" }
      ]
    },
    {
      id: "cluster-space",
      name: "Space Clusters",
      eyebrow: "4 scale stops",
      summary: "离散值已收敛为基础 spacing scale。",
      items: [
        { id: "cluster-space-1", label: "space.2 -> 8", meta: "7 / 8 / 8", confidence: 0.78 },
        { id: "cluster-space-2", label: "space.3 -> 12", meta: "11 / 12 / 12", confidence: 0.82 },
        { id: "cluster-space-3", label: "space.4 -> 16", meta: "15 / 16 / 17", confidence: 0.96 },
        { id: "cluster-space-4", label: "space.6 -> 24", meta: "24 / 24 / 25", confidence: 0.88 }
      ]
    },
    {
      id: "cluster-radius",
      name: "Radius Clusters",
      eyebrow: "3 stable sizes",
      summary: "大多数容器和按钮收敛到 md 与 lg 两档。",
      items: [
        { id: "cluster-radius-1", label: "radius.sm -> 8", meta: "utility surfaces", confidence: 0.63 },
        { id: "cluster-radius-2", label: "radius.md -> 12", meta: "cards / inputs", confidence: 0.93 },
        { id: "cluster-radius-3", label: "radius.lg -> 16", meta: "chips / promo blocks", confidence: 0.71 }
      ]
    }
  ],
  normalizedCollections: [
    {
      id: "primitives",
      name: "Primitives",
      description: "基础颜色、间距、圆角和少量 string 值。",
      groups: [
        {
          id: "primitive-color",
          name: "Primitive / Color",
          kind: "color",
          summary: "从 raw color cluster 中沉淀的基础色板。",
          tokens: [
            {
              id: "token-color-surface-0",
              name: "color.neutral.0",
              resolvedType: "COLOR",
              status: "approved",
              description: "Primary light surface",
              valuesByMode: {
                light: { type: "color", hex: "#F6F5F1", rgba: { r: 0.9647, g: 0.9608, b: 0.9451, a: 1 } },
                dark: { type: "color", hex: "#121315", rgba: { r: 0.0706, g: 0.0745, b: 0.0824, a: 1 } }
              },
              source: { origin: "merged", confidence: 0.95, sampleCount: 28, rawCandidates: ["#F6F5F1", "#FFFFFF", "#121315"] }
            },
            {
              id: "token-color-text-900",
              name: "color.neutral.900",
              resolvedType: "COLOR",
              status: "approved",
              description: "Primary body text",
              valuesByMode: {
                light: { type: "color", hex: "#1A1A1C", rgba: { r: 0.102, g: 0.102, b: 0.1098, a: 1 } },
                dark: { type: "color", hex: "#E9FFF6", rgba: { r: 0.9137, g: 1, b: 0.9647, a: 1 } }
              },
              source: { origin: "merged", confidence: 0.93, sampleCount: 22, rawCandidates: ["#1A1A1C", "#18181B", "#E9FFF6"] }
            },
            {
              id: "token-color-brand-500",
              name: "color.brand.500",
              resolvedType: "COLOR",
              status: "reviewed",
              description: "Primary action and accent",
              valuesByMode: {
                light: { type: "color", hex: "#0F7A5C", rgba: { r: 0.0588, g: 0.4784, b: 0.3608, a: 1 } },
                dark: { type: "color", hex: "#34D3A3", rgba: { r: 0.2039, g: 0.8275, b: 0.6392, a: 1 } }
              },
              source: { origin: "merged", confidence: 0.9, sampleCount: 19, rawCandidates: ["#0F7A5C", "#1B8E6D", "#34D3A3"] }
            }
          ]
        },
        {
          id: "primitive-space",
          name: "Primitive / Space",
          kind: "space",
          summary: "主要来自列表间距、卡片 inset 和 section gap。",
          tokens: [
            {
              id: "token-space-2",
              name: "space.2",
              resolvedType: "FLOAT",
              status: "approved",
              description: "Tight inline gap",
              valuesByMode: {
                light: { type: "float", value: 8, unit: "px" },
                dark: { type: "float", value: 8, unit: "px" }
              },
              source: { origin: "merged", confidence: 0.78, sampleCount: 7, rawCandidates: [7, 8, 8] }
            },
            {
              id: "token-space-4",
              name: "space.4",
              resolvedType: "FLOAT",
              status: "approved",
              description: "Primary card inset",
              valuesByMode: {
                light: { type: "float", value: 16, unit: "px" },
                dark: { type: "float", value: 16, unit: "px" }
              },
              source: { origin: "merged", confidence: 0.96, sampleCount: 11, rawCandidates: [15, 16, 17] }
            },
            {
              id: "token-space-6",
              name: "space.6",
              resolvedType: "FLOAT",
              status: "reviewed",
              description: "Section separation",
              valuesByMode: {
                light: { type: "float", value: 24, unit: "px" },
                dark: { type: "float", value: 24, unit: "px" }
              },
              source: { origin: "merged", confidence: 0.88, sampleCount: 5, rawCandidates: [24, 24, 25] }
            }
          ]
        },
        {
          id: "primitive-radius",
          name: "Primitive / Radius",
          kind: "radius",
          summary: "按钮、输入框和卡片容器的基础圆角档位。",
          tokens: [
            {
              id: "token-radius-md",
              name: "radius.md",
              resolvedType: "FLOAT",
              status: "approved",
              description: "Card and input radius",
              valuesByMode: {
                light: { type: "float", value: 12, unit: "px" },
                dark: { type: "float", value: 12, unit: "px" }
              },
              source: { origin: "merged", confidence: 0.93, sampleCount: 5, rawCandidates: [12, 12, 13] }
            },
            {
              id: "token-radius-lg",
              name: "radius.lg",
              resolvedType: "FLOAT",
              status: "normalized",
              description: "Promotional chips and elevated panels",
              valuesByMode: {
                light: { type: "float", value: 16, unit: "px" },
                dark: { type: "float", value: 16, unit: "px" }
              },
              source: { origin: "merged", confidence: 0.71, sampleCount: 3, rawCandidates: [15, 16, 16] }
            }
          ]
        }
      ]
    },
    {
      id: "semantics",
      name: "Semantics",
      description: "表达界面用途的语义 token，优先用 alias 连接 primitives。",
      groups: [
        {
          id: "semantic-surface",
          name: "Semantic / Surface",
          kind: "color",
          summary: "基于 surface 和 elevated context 生成的 alias 建议。",
          tokens: [
            {
              id: "token-surface-default",
              name: "surface.default",
              resolvedType: "COLOR",
              status: "reviewed",
              description: "Default app surface",
              aliasOf: { collectionId: "primitives", tokenId: "token-color-surface-0" },
              valuesByMode: {
                light: { type: "color", hex: "#F6F5F1", rgba: { r: 0.9647, g: 0.9608, b: 0.9451, a: 1 } },
                dark: { type: "color", hex: "#121315", rgba: { r: 0.0706, g: 0.0745, b: 0.0824, a: 1 } }
              },
              source: { origin: "manual", confidence: 0.87, sampleCount: 12, notes: ["Suggested from background context"] }
            },
            {
              id: "token-surface-brand",
              name: "surface.brand",
              resolvedType: "COLOR",
              status: "reviewed",
              aliasOf: { collectionId: "primitives", tokenId: "token-color-brand-500" },
              description: "Primary action background",
              valuesByMode: {
                light: { type: "color", hex: "#0F7A5C", rgba: { r: 0.0588, g: 0.4784, b: 0.3608, a: 1 } },
                dark: { type: "color", hex: "#34D3A3", rgba: { r: 0.2039, g: 0.8275, b: 0.6392, a: 1 } }
              },
              source: { origin: "manual", confidence: 0.82, sampleCount: 10, notes: ["Mapped from CTA buttons and selected chips"] }
            }
          ]
        },
        {
          id: "semantic-text",
          name: "Semantic / Text",
          kind: "color",
          summary: "正文和辅助文字的 alias 层。",
          tokens: [
            {
              id: "token-text-primary",
              name: "text.primary",
              resolvedType: "COLOR",
              status: "approved",
              aliasOf: { collectionId: "primitives", tokenId: "token-color-text-900" },
              description: "Main body text",
              valuesByMode: {
                light: { type: "color", hex: "#1A1A1C", rgba: { r: 0.102, g: 0.102, b: 0.1098, a: 1 } },
                dark: { type: "color", hex: "#E9FFF6", rgba: { r: 0.9137, g: 1, b: 0.9647, a: 1 } }
              },
              source: { origin: "manual", confidence: 0.9, sampleCount: 16, notes: ["Most frequent paragraph color"] }
            },
            {
              id: "token-text-secondary",
              name: "text.secondary",
              resolvedType: "COLOR",
              status: "reviewed",
              description: "Supporting labels and metadata",
              valuesByMode: {
                light: { type: "color", hex: "#7C7D84", rgba: { r: 0.4863, g: 0.4902, b: 0.5176, a: 1 } },
                dark: { type: "color", hex: "#BFC2CC", rgba: { r: 0.749, g: 0.7608, b: 0.8, a: 1 } }
              },
              source: { origin: "detected", confidence: 0.76, sampleCount: 9, rawCandidates: ["#7C7D84", "#83858E", "#BFC2CC"] }
            }
          ]
        }
      ]
    }
  ],
  semanticSuggestions: [
    {
      id: "suggestion-surface",
      name: "Surface Suggestions",
      eyebrow: "2 alias proposals",
      summary: "高频背景和 CTA 容器已经有较稳定的 alias 建议。",
      items: [
        { id: "semantic-item-1", label: "surface.default", meta: "alias -> color.neutral.0", confidence: 0.87, swatch: "#F6F5F1" },
        { id: "semantic-item-2", label: "surface.brand", meta: "alias -> color.brand.500", confidence: 0.82, swatch: "#0F7A5C" }
      ]
    },
    {
      id: "suggestion-text",
      name: "Text Suggestions",
      eyebrow: "2 alias proposals",
      summary: "正文和辅助文本的语义层最适合先落地。",
      items: [
        { id: "semantic-item-3", label: "text.primary", meta: "alias -> color.neutral.900", confidence: 0.9, swatch: "#1A1A1C" },
        { id: "semantic-item-4", label: "text.secondary", meta: "candidate -> neutral support", confidence: 0.76, swatch: "#7C7D84" }
      ]
    }
  ],
  importPreview: {
    stats: {
      "skip-existing": { createCollections: 2, createTokens: 17, updateTokens: 0, skipTokens: 2 },
      "rename-incoming": { createCollections: 2, createTokens: 19, updateTokens: 0, skipTokens: 0 },
      "replace-values": { createCollections: 1, createTokens: 12, updateTokens: 7, skipTokens: 0 }
    },
    conflicts: [
      {
        tokenName: "color.brand.500",
        collection: "Primitives",
        issue: "Name already exists in current file",
        suggestion: "Replace values or rename incoming token"
      },
      {
        tokenName: "text.primary",
        collection: "Semantics",
        issue: "Alias target exists but semantic token already present",
        suggestion: "Skip existing if current semantic layer is already stable"
      }
    ]
  }
};
