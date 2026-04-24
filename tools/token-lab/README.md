# Token Lab

一个把一批界面图片整理成可 review、可命名、可导入 Figma Variables 草案的静态原型。

## 当前原型目标

- 模拟上传批次
- 展示分析流水线
- 展示 raw / cluster / normalized / semantic 四层数据
- 提供 import preview 与冲突策略切换
- 基于 `TokenLabDocument + currentFileSnapshot + strategy` 实时计算导入计划

## 本地运行

```bash
cd tools/token-lab
python3 -m http.server 5175
```

打开：

```text
http://localhost:5175
```
