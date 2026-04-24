window.FIGMA_PROPERTY_LESSONS = [
  {
    id: "direction",
    title: "Direction",
    group: "auto-layout",
    summary: "控制子元素是横向排列还是纵向排列。",
    controlType: "segmented",
    options: ["horizontal", "vertical"],
    defaultValue: "horizontal",
    relatedLessons: ["alignment", "wrap", "gap"],
    commonConfusions: ["Direction 会改变主轴，Gap 和 Alignment 的表现方向也会一起变。"],
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
    relatedLessons: ["padding", "wrap", "direction"],
    commonConfusions: ["Gap 是元素之间的距离，不是容器边缘留白。"],
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
    relatedLessons: ["gap", "min-width", "min-height"],
    commonConfusions: ["Padding 是容器内部留白，不等于外边距，也不等于元素之间的 Gap。"],
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
    relatedLessons: ["direction", "constraints", "wrap"],
    commonConfusions: ["很多人会混淆主轴对齐和交叉轴对齐，Direction 一变，理解角度也要跟着变。"],
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
    relatedLessons: ["parent-width", "min-width", "max-width"],
    commonConfusions: ["Fill 不是“永远拉满”，它仍然会受到父级可用空间和 min/max 限制影响。"],
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
    relatedLessons: ["parent-width", "direction", "gap"],
    commonConfusions: ["Wrap 出现与否，不只取决于元素数量，还取决于父级宽度和每个子项占用空间。"],
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
    relatedLessons: ["clip-content", "constraints"],
    commonConfusions: ["Absolute Position 让元素脱离常规布局流，但不代表它不会被父级裁切。"],
    explanation: {
      whatItControls: "让某个子元素不参与常规的流式布局计算，单独定位。",
      visualEffect: "元素不再挤占原来的排列空间，可以叠在内容之上或独立放置。",
      whenToUse: ["角标", "浮层按钮", "卡片右上角状态标记"],
      commonMistakes: ["把本该通过正常布局实现的结构改成 absolute，导致维护困难。"],
      cssMapping: ["position: absolute"]
    }
  },
  {
    id: "parent-width",
    title: "Parent Width",
    group: "layout-context",
    summary: "控制父级容器宽度，方便观察 Fill、Wrap、Min/Max 等属性的变化。",
    controlType: "slider",
    min: 280,
    max: 760,
    step: 20,
    defaultValue: 520,
    relatedLessons: ["sizing", "constraints", "wrap"],
    commonConfusions: ["很多布局问题不是属性本身错了，而是父级空间变化后才暴露出来。"],
    explanation: {
      whatItControls: "模拟外层可用空间大小，帮助理解子级在不同父容器宽度中的响应方式。",
      visualEffect: "父级越窄，换行、裁切、最大宽度限制等效果会更明显。",
      whenToUse: ["响应式卡片", "按钮组", "窄屏容器测试", "组件自适应检查"],
      commonMistakes: ["只在宽屏下观察布局，忽略父级尺寸变化会如何影响组件。"],
      cssMapping: ["container width", "available inline size"]
    }
  },
  {
    id: "constraints",
    title: "Constraints",
    group: "layout-context",
    summary: "解释元素在父级尺寸变化时，优先贴住哪一侧或如何缩放。",
    controlType: "select",
    options: ["left", "center", "right", "left-right", "scale"],
    defaultValue: "left",
    relatedLessons: ["parent-width", "alignment", "left-right"],
    commonConfusions: ["Constraints 更像父级尺寸变化时的锚定规则，不是普通对齐方式。"],
    explanation: {
      whatItControls: "决定对象在父级尺寸变化时如何保持相对位置或伸缩方式。",
      visualEffect: "不同 constraint 会让内容更偏向左、居中、右侧，或随着父级一起拉伸。",
      whenToUse: ["顶部栏按钮", "固定角标", "自适应输入框", "弹层按钮对齐"],
      commonMistakes: ["以为 constraints 只影响位置，不影响对象随父级变化后的可用空间。"],
      cssMapping: ["left / right anchoring", "stretch", "scale"]
    }
  },
  {
    id: "min-width",
    title: "Min Width",
    group: "size-constraint",
    summary: "为容器设定最小宽度，避免内容太少时过度收缩。",
    controlType: "slider",
    min: 0,
    max: 520,
    step: 20,
    defaultValue: 0,
    relatedLessons: ["sizing", "padding", "max-width"],
    commonConfusions: ["Min Width 常被误以为只在 Fill 模式下有用，其实 Hug 也会被它拦住。"],
    explanation: {
      whatItControls: "限制容器的最小宽度，不允许它比某个阈值更窄。",
      visualEffect: "即使内容很少，Frame 也会保持基本宽度，不会缩成过小的胶囊。",
      whenToUse: ["按钮最小点击面积", "卡片基线宽度", "输入框最小显示宽度"],
      commonMistakes: ["只设置 Hug 而不设 min width，导致内容少时组件过小。"],
      cssMapping: ["min-width"]
    }
  },
  {
    id: "max-width",
    title: "Max Width",
    group: "size-constraint",
    summary: "为容器设定最大宽度，避免在宽容器中无限延展。",
    controlType: "slider",
    min: 0,
    max: 620,
    step: 20,
    defaultValue: 0,
    relatedLessons: ["sizing", "parent-width", "min-width"],
    commonConfusions: ["Max Width 不是让内容不换行，而是限制容器能长到多宽。"],
    explanation: {
      whatItControls: "限制容器的最大宽度，不允许它超过某个阈值继续变宽。",
      visualEffect: "即使父级更宽，Frame 也不会无限扩张，内容阅读宽度更稳定。",
      whenToUse: ["正文容器", "内容卡片", "说明面板", "长标签组"],
      commonMistakes: ["只让容器 Fill，却忘了限制最大宽度，导致信息行太长。"],
      cssMapping: ["max-width"]
    }
  },
  {
    id: "min-height",
    title: "Min Height",
    group: "size-constraint",
    summary: "设定最小高度，避免内容太少时容器显得过薄。",
    controlType: "slider",
    min: 0,
    max: 360,
    step: 20,
    defaultValue: 0,
    relatedLessons: ["padding", "max-height", "clip-content"],
    commonConfusions: ["Min Height 提供的是高度下限，不会自动帮你处理多余内容。"],
    explanation: {
      whatItControls: "限制容器最小高度，保证组件在内容较少时仍有稳定存在感。",
      visualEffect: "即使子内容不高，容器也会维持一定高度。",
      whenToUse: ["卡片封面区", "Banner", "信息块", "按钮高度基线"],
      commonMistakes: ["把 padding 当成 height 使用，结果组件随着内容变化仍然不稳定。"],
      cssMapping: ["min-height"]
    }
  },
  {
    id: "max-height",
    title: "Max Height",
    group: "size-constraint",
    summary: "设定最大高度，避免内容堆叠时无限拉长。",
    controlType: "slider",
    min: 0,
    max: 420,
    step: 20,
    defaultValue: 0,
    relatedLessons: ["clip-content", "min-height", "wrap"],
    commonConfusions: ["Max Height 自身不会制造滚动或裁切效果，通常需要配合 Clip 或滚动策略。"],
    explanation: {
      whatItControls: "限制容器最大高度，超出后通常需要搭配 clip 或滚动处理。",
      visualEffect: "内容继续增加时，容器高度不再无限增长。",
      whenToUse: ["消息面板", "标签区", "说明卡片", "面板折叠区"],
      commonMistakes: ["给了 max height 却没有考虑超出内容如何显示。"],
      cssMapping: ["max-height", "overflow"]
    }
  },
  {
    id: "clip-content",
    title: "Clip Content",
    group: "layout-context",
    summary: "控制超出容器边界的内容是否被裁切。",
    controlType: "toggle",
    defaultValue: false,
    relatedLessons: ["absolute-position", "max-height", "parent-width"],
    commonConfusions: ["Clip Content 只负责边界裁切，不负责决定内容怎么重新排布。"],
    explanation: {
      whatItControls: "决定超出容器边界的子元素、角标或内容是否继续可见。",
      visualEffect: "开启后，边界外的内容会被隐藏；关闭时，溢出的元素仍然能看见。",
      whenToUse: ["卡片裁切图片", "可滚动区域", "标签容器", "带装饰性溢出元素的组件"],
      commonMistakes: ["开启 clip 后忘了有些悬浮元素其实需要露出来。"],
      cssMapping: ["overflow: hidden"]
    }
  }
];
