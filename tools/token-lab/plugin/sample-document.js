window.TOKEN_LAB_PLUGIN_SAMPLE_DOCUMENT = {
  version: "0.1",
  meta: {
    projectName: "Acme Mobile",
    sourceType: "screenshots",
    imageCount: 8,
    generatedAt: "2026-04-24T10:30:00Z"
  },
  collections: [
    {
      id: "primitives",
      name: "Primitives",
      defaultMode: "light",
      modes: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark" }
      ],
      groups: [
        {
          id: "primitive-color",
          name: "Primitive / Color",
          kind: "color",
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
              source: { origin: "merged", confidence: 0.95, sampleCount: 28 }
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
              source: { origin: "merged", confidence: 0.93, sampleCount: 22 }
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
              source: { origin: "merged", confidence: 0.9, sampleCount: 19 }
            }
          ]
        },
        {
          id: "primitive-space",
          name: "Primitive / Space",
          kind: "space",
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
              source: { origin: "merged", confidence: 0.78, sampleCount: 7 }
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
              source: { origin: "merged", confidence: 0.96, sampleCount: 11 }
            }
          ]
        }
      ]
    },
    {
      id: "semantics",
      name: "Semantics",
      defaultMode: "light",
      modes: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark" }
      ],
      groups: [
        {
          id: "semantic-surface",
          name: "Semantic / Surface",
          kind: "color",
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
              source: { origin: "manual", confidence: 0.87, sampleCount: 12 }
            },
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
              source: { origin: "manual", confidence: 0.9, sampleCount: 16 }
            }
          ]
        }
      ]
    }
  ]
};
