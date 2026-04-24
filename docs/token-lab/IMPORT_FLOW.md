# Token Lab Import Flow

## 目标

定义 `Token Lab` 如何把已确认的 token 草案写入当前 Figma 文件中的 local variables。

这份文档聚焦 MVP 的主链路：

- 图片分析结果已经生成
- 设计师已经在 review 页面完成删重、合并和重命名
- 插件准备把结果写入 Figma Variables

## 为什么优先走 Plugin 导入

MVP 以 Figma Plugin 为主链路，原因很直接：

- 可以直接写入当前文件的 local variables
- 不依赖 Enterprise 计划和额外 API token
- 更适合“分析后立即落地到当前设计文件”的工作流
- 更容易把 review 和 import 放在一个插件里完成

REST API 适合后续扩展：

- 企业级批量同步
- 跨文件分发
- CI 或外部系统集成

## 导入范围

MVP 支持导入：

- collections
- modes
- primitive tokens
- semantic tokens
- alias
- `COLOR` / `FLOAT` / `STRING`

MVP 暂不处理：

- 跨文件库发布
- 团队库拉取和回写
- extended collections
- effect token 自动绑定
- 变量自动绑定到画布现有节点

## 插件内角色分工

### UI 线程

负责：

- 展示分析结果
- 让用户修改名称、分组、mode 值
- 选择导入策略
- 呈现冲突和错误
- 触发导入

不负责：

- 直接操作 Figma Variables API
- 保存导入状态到文档

### Main 线程

负责：

- 调用 `figma.variables` API
- 查重和冲突检测
- 创建 collections / variables / alias
- 汇总导入结果
- 返回成功、警告和失败信息

## 用户流程

1. 用户上传图片并完成分析
2. 用户在 review 页面确认 token 草案
3. 用户点击 `Import to Figma`
4. 插件执行导入前检查
5. 插件展示冲突摘要
6. 用户确认导入策略
7. 插件写入 variables
8. 插件返回导入报告

## 导入前检查

导入前至少执行以下检查：

- collection 名称是否为空
- token 名称是否为空
- 同 collection 内是否存在重复 token 名称
- token 的 `resolvedType` 是否与值结构匹配
- 每个 token 是否存在 default mode 值
- alias 目标是否存在
- mode id 是否完整

如果检查失败，不进入导入阶段。

## 冲突策略

MVP 推荐支持三种策略：

### 1. Skip Existing

如果当前文件中已存在同 collection、同名称、同类型的 variable，则跳过。

适合：

- 安全导入
- 用户不想覆盖现有资产

### 2. Rename Incoming

如果发生重名，自动给新 token 增加后缀，例如：

- `color.gray.100`
- `color.gray.100.copy`

适合：

- 用户想保留两份结果进行对比

### 3. Replace Values

如果重名且类型一致，则复用已有 variable，并更新各 mode 的值。

适合：

- 已经有一套草案，希望新一轮分析覆盖旧值

MVP 默认建议使用 `Skip Existing`，风险最低。

## 导入执行顺序

导入顺序应固定，避免 alias 或 mode 失效。

1. 创建或定位 collection
2. 校正 collection 默认 mode
3. 补充缺失 modes
4. 创建 primitive tokens
5. 写入 primitive mode values
6. 创建 semantic tokens
7. 写入 semantic mode values
8. 建立 alias
9. 输出导入报告

## Collection 导入规则

### 新建

如果 collection 不存在，则直接创建。

### 复用

如果 collection 名称已存在，按导入策略处理：

- 复用已有 collection
- 或提示用户改名后重新导入

MVP 建议通过 collection 名称匹配，不在第一版引入复杂的 key 映射。

## Mode 导入规则

创建 collection 后：

1. 将默认 mode 重命名为文档中的 `defaultMode`
2. 补充其他缺失 modes
3. 建立 `draftModeId -> figmaModeId` 的运行时映射

导入过程中不依赖草案中的 mode id 直接写入 Figma，而是总是以运行时映射为准。

## Token 导入规则

### 创建变量

按 `name + resolvedType + collection` 组合判断是否已存在。

如果不存在：

- 创建 variable
- 设置描述信息

如果存在：

- 根据冲突策略决定跳过、改名或更新值

### 写入值

每个 token 都按 mode 分别写值。

对于未提供的 mode：

- 默认不自动补值
- 在 review 阶段提示用户确认

这样可以避免把 light mode 的值误复制到 dark mode。

## Alias 导入规则

alias 必须最后处理，因为它依赖目标 variable 已存在。

导入方式：

1. 根据 `aliasOf` 找到目标 variable
2. 创建 alias 引用
3. 写入当前 variable 对应 mode 的 alias 值

如果 alias 目标不存在：

- 标记为错误
- 保留在导入报告中
- 不中断其他 token 的导入

## 值类型映射

### Color

中间结构：

```ts
{
  type: "color",
  hex: "#F7F7F8",
  rgba: { r: 0.9686, g: 0.9686, b: 0.9725, a: 1 }
}
```

写入 Figma：

```ts
variable.setValueForMode(modeId, {
  r: 0.9686,
  g: 0.9686,
  b: 0.9725,
  a: 1
});
```

### Float

中间结构：

```ts
{
  type: "float",
  value: 16,
  unit: "px"
}
```

写入 Figma：

```ts
variable.setValueForMode(modeId, 16);
```

### String

中间结构：

```ts
{
  type: "string",
  value: "Inter"
}
```

写入 Figma：

```ts
variable.setValueForMode(modeId, "Inter");
```

## 推荐消息协议

UI 和 main 线程之间建议使用显式 action。

```ts
type ImportRequestMessage = {
  type: "token-lab/import";
  payload: {
    document: TokenLabDocument;
    strategy: "skip-existing" | "rename-incoming" | "replace-values";
  };
};

type ImportResultMessage = {
  type: "token-lab/import-result";
  payload: {
    successCount: number;
    warningCount: number;
    errorCount: number;
    collections: Array<{
      name: string;
      created: boolean;
    }>;
    logs: Array<{
      level: "info" | "warning" | "error";
      message: string;
      tokenName?: string;
    }>;
  };
};
```

## 失败处理原则

- 单个 token 失败，不应终止整个批次
- 单个 collection 创建失败，可终止该 collection 下的导入
- alias 失败不应回滚已成功创建的 primitive tokens
- 错误必须能在 UI 中定位到具体 token

## 导入后的反馈

导入完成后，UI 至少展示：

- 创建了多少 collection
- 创建了多少 token
- 更新了多少 token
- 跳过了多少 token
- 哪些 token 导入失败

同时建议提供：

- `Copy Summary`
- `Export JSON`

方便设计师留档或发给团队成员。

## 推荐实现步骤

1. 先只支持 `Primitives` collection 的导入
2. 再补 `Semantics`
3. 再补 alias
4. 最后再补冲突策略切换

这样更容易先打通一条稳定的主链路。

## MVP 验收标准

- 用户能把一份 review 完成的 token 草案写入当前 Figma 文件
- light / dark modes 能正确创建并写值
- color / space / radius 三类 token 能稳定导入
- 冲突不会导致整个导入批次崩溃
- 错误信息能在 UI 中追踪到具体 token

## 参考

- Figma Plugin Guide: Working with Variables
- Figma Plugin API: `figma.variables`
- Figma REST API: Variables
