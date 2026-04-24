window.FIGMA_PROPERTY_LESSONS = [
  {
    id: "direction",
    title: "Direction",
    group: "auto-layout",
    summary: "控制子元素是横向排列还是纵向排列。",
    controlType: "segmented",
    options: ["horizontal", "vertical"],
    defaultValue: "horizontal",
    explanation: {
      whatItControls: "决定容器内部子项沿哪个主轴排列，是 Auto Layout 的基础方向设置。",
      visualEffect: "切换后，子项会从左右排布变成上下排布，Gap 和对齐的作用方向也会一起变化。",
      whenToUse: ["按钮组", "标签列表", "卡片信息流", "表单字段垂直堆叠"],
      commonMistakes: ["只改方向却忽略 alignment 和 gap，导致布局看起来不自然。"],
      cssMapping: ["flex-direction: row", "flex-direction: column"]
    }
  },
  {
    id: "gap",
    title: "Gap",
    group: "auto-layout",
    summary: "控制 Auto Layout 子项之间的间距。",
    controlType: "slider",
    min: 0,
    max: 48,
    step: 4,
    defaultValue: 16,
    explanation: {
      whatItControls: "影响相邻子项之间的距离，不影响容器边缘到内容的距离。",
      visualEffect: "值越大，子项之间越松；值越小，内容越紧凑。",
      whenToUse: ["按钮组", "导航项", "卡片内部模块", "信息列表"],
      commonMistakes: ["把 Gap 当成 Padding 使用。", "只调 Gap 不调 Padding，导致容器边缘留白失衡。"],
      cssMapping: ["gap"]
    }
  },
  {
    id: "padding",
    title: "Padding",
    group: "auto-layout",
    summary: "控制容器边缘与内部内容之间的留白。",
    controlType: "slider",
    min: 0,
    max: 48,
    step: 4,
    defaultValue: 16,
    explanation: {
      whatItControls: "控制容器的内边距，直接影响内容离边框有多远。",
      visualEffect: "值越大，容器看起来越宽松，点击热区通常也会更舒适。",
      whenToUse: ["按钮", "卡片", "表单容器", "标签胶囊"],
      commonMistakes: ["把 Padding 和外部留白混淆。", "内容很多时 padding 太小，界面会显得拥挤。"],
      cssMapping: ["padding"]
    }
  },
  {
    id: "alignment",
    title: "Alignment",
    group: "auto-layout",
    summary: "控制子项在容器中的对齐位置。",
    controlType: "select",
    options: ["start", "center", "end", "space-between"],
    defaultValue: "start",
    explanation: {
      whatItControls: "决定子项在主轴或交叉轴上的对齐表现。",
      visualEffect: "不同的 alignment 会影响内容贴边、居中还是均匀分布。",
      whenToUse: ["顶部工具栏", "按钮组", "卡片头部", "列表内容对齐"],
      commonMistakes: ["没有区分主轴和交叉轴。", "space-between 用在内容太少的场景会显得空。"],
      cssMapping: ["justify-content", "align-items"]
    }
  },
  {
    id: "sizing",
    title: "Sizing",
    group: "auto-layout",
    summary: "解释 Hug / Fill / Fixed 三种尺寸模式的差异。",
    controlType: "segmented",
    options: ["hug", "fill", "fixed"],
    defaultValue: "hug",
    explanation: {
      whatItControls: "决定容器或子项如何响应内容和父级空间。",
      visualEffect: "Hug 会跟着内容变，Fill 会吃掉父级可用空间，Fixed 会保持固定尺寸。",
      whenToUse: ["按钮文本长度变化", "自适应标签", "占满父容器的输入框", "固定尺寸卡片"],
      commonMistakes: ["把 Fill 理解成永远拉满。", "在需要响应内容时使用 Fixed，导致内容溢出或裁切。"],
      cssMapping: ["width: fit-content", "flex-grow", "fixed width / height"]
    }
  },
  {
    id: "wrap",
    title: "Wrap",
    group: "auto-layout",
    summary: "控制子项空间不足时是否换行。",
    controlType: "toggle",
    defaultValue: false,
    explanation: {
      whatItControls: "决定子元素在主轴空间不足时，是继续挤压还是自动分行。",
      visualEffect: "开启后，一行放不下的元素会流到下一行。",
      whenToUse: ["标签云", "筛选项", "多按钮列表"],
      commonMistakes: ["内容数量多却不允许换行，导致布局异常拥挤。"],
      cssMapping: ["flex-wrap: wrap"]
    }
  },
  {
    id: "absolute-position",
    title: "Absolute Position",
    group: "auto-layout",
    summary: "让元素脱离 Auto Layout 的常规流式排列。",
    controlType: "toggle",
    defaultValue: false,
    explanation: {
      whatItControls: "让某个子元素不参与常规的流式布局计算，单独定位。",
      visualEffect: "元素不再挤占原来的排列空间，可以叠在内容之上或独立放置。",
      whenToUse: ["角标", "浮层按钮", "卡片右上角状态标记"],
      commonMistakes: ["把本该通过正常布局实现的结构改成 absolute，导致维护困难。"],
      cssMapping: ["position: absolute"]
    }
  }
];
