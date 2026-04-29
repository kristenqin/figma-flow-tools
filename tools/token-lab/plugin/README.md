# Token Lab Figma Plugin Skeleton

这个目录是 `Token Lab` 的第一版 Figma Plugin 骨架。

当前能力：

- 使用 Figma Plugin API 真实读取当前文件的 local variable collections
- 把快照发送到插件 UI
- 在插件 UI 里基于 sample `TokenLabDocument` 计算导入计划
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
- 用真实分析结果替换 sample `TokenLabDocument`
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
  插件主线程，负责读取真实 variable snapshot
- `ui.html`
  单文件插件 UI，内含 planner、sample document 和 review 编辑逻辑
