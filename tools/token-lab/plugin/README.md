# Token Lab Figma Plugin Skeleton

这个目录是 `Token Lab` 的第一版 Figma Plugin 骨架。

当前能力：

- 使用 Figma Plugin API 真实读取当前文件的 local variable collections
- 把快照发送到插件 UI
- 从用户当前选中的画布 / Frame 导出 PNG，作为分析输入
- 在插件 UI 里把选区图片分析成真实 draft `TokenLabDocument`
- 支持 draft review 编辑：
  - 重命名 token
  - Remove / Restore
  - Alias On / Off
- 导入按钮会发送“当前编辑后的 draft document”给 main thread
- 切换 `Skip Existing / Rename Incoming / Replace Values`
- 在主线程执行基础导入：创建 / 复用 collection、创建 / 更新普通 token、绑定 alias
- UI 已改为单文件内联脚本，避免 Figma 插件环境下本地 `script src` 不加载导致“打开但无交互”
- 导入时会把 draft 名称从 `color.brand.500` 规范成 Figma 更稳定的层级名 `color/brand/500`

当前还没做：

- 更细的失败回滚和批次事务控制
- 除颜色外的更多真实分析类型接入，例如 space / radius / stroke
- 把浏览器版完整的多视图分析工作台也迁到 plugin

## 在 Figma 里加载

1. 打开 Figma Desktop
2. 进入 `Plugins > Development > Import plugin from manifest...`
3. 选择这个文件：

```text
tools/token-lab/plugin/manifest.json
```

## 目录说明

- `manifest.json`
  Figma plugin manifest
- `code.js`
  插件主线程，负责读取 variable snapshot 与导出选区图片
- `ui.html`
  单文件插件 UI，内含 planner、选区分析、draft review 和 import 编辑逻辑

## 当前测试方式

1. 在 Figma 里选中 1 到 6 个包含界面图片的 Frame 或可导出图层
2. 如果有明暗两套，建议在图层名里带上 `Light` / `Dark`
3. 打开插件后点击 `Analyze Selection`
4. 确认 review 区从 sample draft 切换成当前选区生成的 draft
5. 按需重命名、Remove / Restore、Alias On / Off
6. 点击 `Import Current Draft`

当前期望结果：

- 状态区会显示 `Draft source: selection analysis`
- `Primitives` 和 `Semantics` 中的颜色 token 会根据所选画布重建
- 导入计划会基于当前 Figma 文件实际变量快照实时重算
