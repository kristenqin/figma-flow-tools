# Token Lab Figma Plugin Skeleton

这个目录是 `Token Lab` 的第一版 Figma Plugin 骨架。

当前能力：

- 使用 Figma Plugin API 真实读取当前文件的 local variable collections
- 把快照发送到插件 UI
- 在插件 UI 里基于 sample `TokenLabDocument` 计算导入计划
- 切换 `Skip Existing / Rename Incoming / Replace Values`

当前还没做：

- 真正创建 collections / variables
- 真正执行 alias 写入
- 从 UI draft 把编辑后的文档发送给 main thread

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
  插件 UI 外壳
- `ui.js`
  插件 UI 交互和 planner 展示
- `import-planner.js`
  UI 内使用的导入计划器
- `sample-document.js`
  当前用于 planner 的 sample `TokenLabDocument`
