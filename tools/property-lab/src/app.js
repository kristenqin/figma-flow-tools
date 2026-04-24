const lessons = window.FIGMA_PROPERTY_LESSONS || [];

const demoItems = [
  { label: "Filter", tone: "fern" },
  { label: "Primary CTA", tone: "sun" },
  { label: "Design Review", tone: "clay" },
  { label: "Ready To Ship", tone: "sky" },
  { label: "Specs", tone: "lavender" }
];

const state = {
  focusedLessonId: lessons[0]?.id || null,
  values: Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson.defaultValue])),
  collapsedGroups: {
    "auto-layout": false,
    "layout-context": false,
    "size-constraint": false
  }
};

const elements = {
  topFocusTitle: document.querySelector("#topFocusTitle"),
  groupAutoLayout: document.querySelector("#groupAutoLayout"),
  groupLayoutContext: document.querySelector("#groupLayoutContext"),
  groupSizeConstraint: document.querySelector("#groupSizeConstraint"),
  activeLessonTitle: document.querySelector("#activeLessonTitle"),
  activeLessonSummary: document.querySelector("#activeLessonSummary"),
  stateChips: document.querySelector("#stateChips"),
  parentShell: document.querySelector("#parentShell"),
  parentStatus: document.querySelector("#parentStatus"),
  demoFrame: document.querySelector("#demoFrame"),
  demoFrameShell: document.querySelector("#demoFrameShell"),
  axisHint: document.querySelector("#axisHint"),
  frameMeasure: document.querySelector("#frameMeasure"),
  layoutStatus: document.querySelector("#layoutStatus"),
  activeNarrative: document.querySelector("#activeNarrative"),
  inspectorTitle: document.querySelector("#inspectorTitle"),
  whatItControls: document.querySelector("#whatItControls"),
  visualEffect: document.querySelector("#visualEffect"),
  whenToUse: document.querySelector("#whenToUse"),
  commonMistakes: document.querySelector("#commonMistakes"),
  relatedLessons: document.querySelector("#relatedLessons"),
  commonConfusions: document.querySelector("#commonConfusions"),
  cssMapping: document.querySelector("#cssMapping"),
  cssSnapshot: document.querySelector("#cssSnapshot")
};

function init() {
  bindGroupToggles();
  renderControls();
  render();
}

function bindGroupToggles() {
  document.querySelectorAll("[data-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.groupToggle;
      state.collapsedGroups[group] = !state.collapsedGroups[group];
      renderGroupStates();
    });
  });
}

function renderControls() {
  elements.groupAutoLayout.innerHTML = "";
  elements.groupLayoutContext.innerHTML = "";
  elements.groupSizeConstraint.innerHTML = "";

  lessons.forEach((lesson) => {
    const card = document.createElement("article");
    card.className = "control-card";
    card.dataset.lessonId = lesson.id;
    card.tabIndex = 0;

    const head = document.createElement("div");
    head.className = "control-card-head";

    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = lesson.title;
    const summary = document.createElement("p");
    summary.textContent = lesson.summary;
    copy.append(title, summary);

    const value = document.createElement("span");
    value.className = "control-value";
    value.dataset.valueFor = lesson.id;

    head.append(copy, value);

    const ui = document.createElement("div");
    ui.className = "control-ui";
    ui.append(buildControl(lesson));

    card.addEventListener("click", () => {
      state.focusedLessonId = lesson.id;
      render();
    });

    card.addEventListener("focus", () => {
      state.focusedLessonId = lesson.id;
      render();
    });

    card.append(head, ui);
    getControlGroupContainer(lesson.group).append(card);
  });
}

function buildControl(lesson) {
  if (lesson.controlType === "segmented") {
    return buildSegmentedControl(lesson);
  }

  if (lesson.controlType === "slider") {
    return buildSliderControl(lesson);
  }

  if (lesson.controlType === "select") {
    return buildSelectControl(lesson);
  }

  if (lesson.controlType === "toggle") {
    return buildToggleControl(lesson);
  }

  return document.createElement("div");
}

function buildSegmentedControl(lesson) {
  const wrap = document.createElement("div");
  wrap.className = "segmented";

  lesson.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = formatOptionLabel(option);
    button.dataset.controlLesson = lesson.id;
    button.dataset.controlOption = option;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      updateValue(lesson.id, option);
    });
    wrap.append(button);
  });

  return wrap;
}

function buildSliderControl(lesson) {
  const wrap = document.createElement("div");
  wrap.className = "slider-wrap";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(lesson.min);
  slider.max = String(lesson.max);
  slider.step = String(lesson.step);
  slider.value = String(state.values[lesson.id]);
  slider.dataset.controlLesson = lesson.id;
  slider.addEventListener("input", (event) => {
    updateValue(lesson.id, Number(event.target.value));
  });

  const row = document.createElement("div");
  row.className = "slider-row";
  row.innerHTML = `<span>${lesson.min}px</span><span>${lesson.max}px</span>`;

  wrap.append(slider, row);
  return wrap;
}

function buildSelectControl(lesson) {
  const select = document.createElement("select");
  select.dataset.controlLesson = lesson.id;

  lesson.options.forEach((option) => {
    const choice = document.createElement("option");
    choice.value = option;
    choice.textContent = formatOptionLabel(option);
    select.append(choice);
  });

  select.value = String(state.values[lesson.id]);
  select.addEventListener("change", (event) => {
    updateValue(lesson.id, event.target.value);
  });

  return select;
}

function buildToggleControl(lesson) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "toggle-button";
  button.dataset.controlLesson = lesson.id;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    updateValue(lesson.id, !state.values[lesson.id]);
  });
  return button;
}

function updateValue(lessonId, value) {
  state.values[lessonId] = value;
  state.focusedLessonId = lessonId;
  render();
}

function render() {
  const focusedLesson = getFocusedLesson();
  renderGroupStates();
  updateControlStates();
  renderPreview(focusedLesson);
  renderDetails(focusedLesson);
  renderMapping();
}

function renderGroupStates() {
  Object.entries(state.collapsedGroups).forEach(([group, collapsed]) => {
    const block = document.querySelector(`[data-group-block="${group}"]`);
    const toggle = document.querySelector(`[data-group-toggle="${group}"]`);
    if (block) block.classList.toggle("is-collapsed", collapsed);
    if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
  });
}

function updateControlStates() {
  lessons.forEach((lesson) => {
    const value = state.values[lesson.id];
    const card = document.querySelector(`[data-lesson-id="${lesson.id}"]`);
    const valueNode = document.querySelector(`[data-value-for="${lesson.id}"]`);
    if (card) {
      card.classList.toggle("is-focused", state.focusedLessonId === lesson.id);
    }
    if (valueNode) {
      valueNode.textContent = formatValue(lesson.id, value);
    }

    document
      .querySelectorAll(`[data-control-lesson="${lesson.id}"][data-control-option]`)
      .forEach((button) => {
        button.classList.toggle("is-active", button.dataset.controlOption === String(value));
      });

    const slider = document.querySelector(`input[data-control-lesson="${lesson.id}"]`);
    if (slider) slider.value = String(value);

    const select = document.querySelector(`select[data-control-lesson="${lesson.id}"]`);
    if (select) select.value = String(value);

    const toggle = document.querySelector(`button.toggle-button[data-control-lesson="${lesson.id}"]`);
    if (toggle) {
      const isOn = Boolean(value);
      toggle.classList.toggle("is-on", isOn);
      toggle.classList.toggle("is-off", !isOn);
      toggle.textContent = isOn ? "On" : "Off";
      toggle.setAttribute("aria-pressed", String(isOn));
    }
  });
}

function renderPreview(focusedLesson) {
  const model = getPreviewModel();

  elements.topFocusTitle.textContent = focusedLesson.title;
  elements.activeLessonTitle.textContent = focusedLesson.title;
  elements.activeLessonSummary.textContent = focusedLesson.summary;
  elements.axisHint.textContent = model.direction === "row" ? "Main axis ->" : "Main axis ↓";
  elements.frameMeasure.textContent = getFrameMeasureLabel(model);
  elements.layoutStatus.textContent = getLayoutStatus(model);
  elements.parentStatus.textContent = `${model.parentWidth}px / Constraint ${formatOptionLabel(state.values.constraints)}`;

  elements.parentShell.dataset.focusLesson = focusedLesson.id;
  elements.parentShell.dataset.constraint = state.values.constraints;
  elements.parentShell.style.width = `${model.parentWidth}px`;
  elements.demoFrameShell.dataset.focusLesson = focusedLesson.id;
  elements.demoFrame.dataset.focusLesson = focusedLesson.id;
  elements.demoFrame.dataset.direction = model.direction;
  elements.demoFrame.dataset.sizeMode = model.sizing;
  elements.demoFrame.classList.toggle("is-clipped", state.values["clip-content"]);
  elements.demoFrame.classList.toggle("has-padding-highlight", focusedLesson.id === "padding");
  elements.demoFrame.style.flexDirection = model.direction;
  elements.demoFrame.style.flexWrap = model.wrap;
  elements.demoFrame.style.justifyContent = model.justifyContent;
  elements.demoFrame.style.alignItems = model.alignItems;
  elements.demoFrame.style.gap = `${model.gap}px`;
  elements.demoFrame.style.padding = `${model.padding}px`;
  elements.demoFrame.style.width = model.width;
  elements.demoFrame.style.maxWidth = model.maxWidth;
  elements.demoFrame.style.minWidth = model.minWidth;
  elements.demoFrame.style.minHeight = model.minHeight;
  elements.demoFrame.style.maxHeight = model.maxHeight;
  elements.demoFrameShell.style.justifySelf = model.justifySelf;
  elements.demoFrameShell.style.width = model.shellWidth;
  elements.demoFrame.style.setProperty("--gap-size", `${model.gap}px`);

  renderStateChips(model);
  renderDemoItems(model, focusedLesson);
}

function renderStateChips(model) {
  const chips = [
    `Parent: ${state.values["parent-width"]}px`,
    `Direction: ${formatOptionLabel(state.values.direction)}`,
    `Gap: ${state.values.gap}px`,
    `Padding: ${state.values.padding}px`,
    `Alignment: ${formatOptionLabel(state.values.alignment)}`,
    `Sizing: ${formatOptionLabel(state.values.sizing)}`,
    `Wrap: ${state.values.wrap ? "On" : "Off"}`,
    `Absolute: ${state.values["absolute-position"] ? "On" : "Off"}`,
    `Constraint: ${formatOptionLabel(state.values.constraints)}`,
    `Min W: ${state.values["min-width"] || 0}px`,
    `Max W: ${state.values["max-width"] || 0}px`,
    `Min H: ${state.values["min-height"] || 0}px`,
    `Max H: ${state.values["max-height"] || 0}px`,
    `Clip: ${state.values["clip-content"] ? "On" : "Off"}`
  ];

  elements.stateChips.innerHTML = "";
  chips.forEach((chip) => {
    const node = document.createElement("span");
    node.className = "state-chip";
    node.textContent = chip;
    elements.stateChips.append(node);
  });
}

function renderDemoItems(model, focusedLesson) {
  elements.demoFrame.innerHTML = "";
  const existing = elements.parentShell.querySelector(".constraint-guide");
  if (existing) existing.remove();
  elements.parentShell.querySelectorAll(".size-guide, .clip-boundary, .axis-guide, .constraint-anchor, .constraint-arrows, .wrap-guide, .wrap-break-marker").forEach((node) => node.remove());

  demoItems.forEach((item) => {
    const node = document.createElement("div");
    node.className = "demo-item";
    node.dataset.tone = item.tone;
    node.dataset.gap = `${model.gap}px`;
    node.textContent = item.label;
    elements.demoFrame.append(node);
  });

  if (state.values["absolute-position"]) {
    const badge = document.createElement("div");
    badge.className = "absolute-badge";
    badge.textContent = "Floating Badge";
    elements.demoFrame.append(badge);
  }

  if (focusedLesson.id === "constraints") {
    const guide = document.createElement("div");
    guide.className = "constraint-guide";
    const pill = document.createElement("span");
    pill.className = "constraint-pill";
    pill.textContent = getConstraintNarrative(state.values.constraints);
    guide.append(pill);
    elements.parentShell.append(guide);
    renderConstraintArrows();
  }

  if (focusedLesson.id === "min-width" || focusedLesson.id === "max-width") {
    const widthGuide = document.createElement("div");
    widthGuide.className = "size-guide width";
    widthGuide.textContent = `${focusedLesson.title}: ${state.values[focusedLesson.id] || 0}px`;
    elements.parentShell.append(widthGuide);
  }

  if (focusedLesson.id === "min-height" || focusedLesson.id === "max-height") {
    const heightGuide = document.createElement("div");
    heightGuide.className = "size-guide height";
    heightGuide.textContent = `${focusedLesson.title}: ${state.values[focusedLesson.id] || 0}px`;
    elements.parentShell.append(heightGuide);
  }

  if (focusedLesson.id === "clip-content") {
    const boundary = document.createElement("div");
    boundary.className = "clip-boundary";
    elements.demoFrame.append(boundary);
  }

  if (focusedLesson.id === "alignment") {
    renderAlignmentGuides(model);
  }

  if (focusedLesson.id === "wrap") {
    renderWrapGuide();
  }
}

function renderDetails(focusedLesson) {
  const explanation = focusedLesson.explanation;
  elements.inspectorTitle.textContent = focusedLesson.title;
  elements.activeNarrative.textContent = getNarrative(focusedLesson.id);
  elements.whatItControls.textContent = explanation.whatItControls;
  elements.visualEffect.textContent = explanation.visualEffect;

  fillList(elements.whenToUse, explanation.whenToUse, "tag");
  fillList(elements.commonMistakes, explanation.commonMistakes, "text");
  fillList(elements.relatedLessons, buildRelatedLabels(focusedLesson.relatedLessons || []), "tag");
  fillList(elements.commonConfusions, focusedLesson.commonConfusions || [], "text");
  fillList(elements.cssMapping, explanation.cssMapping || [], "mapping");
}

function renderMapping() {
  const model = getPreviewModel();
  const css = [
    ".parent {",
    `  width: ${model.parentWidth}px;`,
    "}",
    "",
    ".frame {",
    "  display: flex;",
    `  flex-direction: ${model.direction};`,
    `  gap: ${model.gap}px;`,
    `  padding: ${model.padding}px;`,
    `  justify-content: ${model.justifyContent};`,
    `  align-items: ${model.alignItems};`,
    `  flex-wrap: ${model.wrap};`,
    `  width: ${getWidthCss(model)};`,
    `  min-width: ${getConstraintCssValue(state.values["min-width"])};`,
    `  max-width: ${getConstraintCssValue(state.values["max-width"])};`,
    `  min-height: ${getConstraintCssValue(state.values["min-height"])};`,
    `  max-height: ${getConstraintCssValue(state.values["max-height"])};`,
    `  overflow: ${state.values["clip-content"] ? "hidden" : "visible"};`,
    "}",
    "",
    `/* Constraint intent: ${getConstraintNarrative(state.values.constraints)} */`,
    "",
    state.values["absolute-position"]
      ? ".badge { position: absolute; top: 12px; right: 12px; }"
      : "/* No absolute-positioned child in the current state */"
  ].join("\n");

  elements.cssSnapshot.textContent = css;
}

function fillList(element, values, mode) {
  element.innerHTML = "";
  values.forEach((value) => {
    const item = document.createElement("li");
    if (mode === "tag" || mode === "mapping") {
      item.textContent = value;
    } else {
      item.textContent = value;
    }
    element.append(item);
  });
}

function getFocusedLesson() {
  return lessons.find((lesson) => lesson.id === state.focusedLessonId) || lessons[0];
}

function buildRelatedLabels(ids) {
  return ids
    .map((id) => lessons.find((lesson) => lesson.id === id)?.title)
    .filter(Boolean);
}

function renderAlignmentGuides(model) {
  const main = document.createElement("div");
  main.className = "axis-guide main";
  main.innerHTML = `<span class="axis-line"></span><span class="axis-text">Main Axis / ${formatOptionLabel(state.values.alignment)}</span>`;

  const cross = document.createElement("div");
  cross.className = "axis-guide cross";
  cross.innerHTML = `<span class="axis-line"></span><span class="axis-text">Cross Axis / ${model.alignItems.replace("flex-", "")}</span>`;

  if (model.direction === "column") {
    main.style.top = "18px";
    main.style.left = "18px";
    main.querySelector(".axis-line").style.width = "6px";
    main.querySelector(".axis-line").style.height = "82px";
    cross.querySelector(".axis-line").style.width = "96px";
    cross.querySelector(".axis-line").style.height = "6px";
  }

  elements.parentShell.append(main, cross);
}

function renderConstraintArrows() {
  const arrows = document.createElement("div");
  arrows.className = "constraint-arrows";

  const anchor = document.createElement("div");
  anchor.className = "constraint-anchor";
  anchor.textContent = getConstraintAnchorLabel(state.values.constraints);
  elements.parentShell.append(anchor);

  if (state.values.constraints === "left" || state.values.constraints === "left-right") {
    const line = document.createElement("div");
    line.className = "constraint-line horizontal";
    line.style.left = "18px";
    line.style.top = "78px";
    line.style.width = "84px";
    arrows.append(line);
  }

  if (state.values.constraints === "right" || state.values.constraints === "left-right") {
    const line = document.createElement("div");
    line.className = "constraint-line horizontal";
    line.style.right = "18px";
    line.style.top = "78px";
    line.style.width = "84px";
    arrows.append(line);
  }

  if (state.values.constraints === "center") {
    const line = document.createElement("div");
    line.className = "constraint-line vertical";
    line.style.left = "50%";
    line.style.top = "44px";
    line.style.height = "88px";
    arrows.append(line);
  }

  if (state.values.constraints === "scale") {
    const left = document.createElement("div");
    left.className = "constraint-line horizontal";
    left.style.left = "18px";
    left.style.top = "78px";
    left.style.width = "64px";

    const right = document.createElement("div");
    right.className = "constraint-line horizontal";
    right.style.right = "18px";
    right.style.top = "78px";
    right.style.width = "64px";

    arrows.append(left, right);
  }

  elements.parentShell.append(arrows);
}

function renderWrapGuide() {
  const note = document.createElement("div");
  note.className = "wrap-guide";
  note.textContent = state.values.wrap
    ? "Wrap is enabled, items can flow to a new line"
    : "Wrap is off, all items stay on one line";
  elements.parentShell.append(note);

  if (!state.values.wrap) return;

  const marker = document.createElement("div");
  marker.className = "wrap-break-marker";
  marker.style.right = "160px";
  marker.style.top = "96px";
  marker.style.height = "160px";
  elements.parentShell.append(marker);
}

function getConstraintAnchorLabel(value) {
  const labels = {
    left: "Anchor: Left",
    center: "Anchor: Center",
    right: "Anchor: Right",
    "left-right": "Anchor: Left + Right",
    scale: "Anchor: Scale"
  };

  return labels[value] || "";
}

function getControlGroupContainer(group) {
  if (group === "auto-layout") return elements.groupAutoLayout;
  if (group === "layout-context") return elements.groupLayoutContext;
  if (group === "size-constraint") return elements.groupSizeConstraint;
  return elements.groupAutoLayout;
}

function getPreviewModel() {
  const alignmentMap = {
    start: { justifyContent: "flex-start", alignItems: "flex-start" },
    center: { justifyContent: "center", alignItems: "center" },
    end: { justifyContent: "flex-end", alignItems: "flex-end" },
    "space-between": { justifyContent: "space-between", alignItems: "center" }
  };

  const direction = state.values.direction === "vertical" ? "column" : "row";
  const alignment = alignmentMap[state.values.alignment];
  const sizing = state.values.sizing;
  const constraint = state.values.constraints;
  const parentWidth = Number(state.values["parent-width"]);
  const minWidth = Number(state.values["min-width"]);
  const maxWidth = Number(state.values["max-width"]);
  const minHeight = Number(state.values["min-height"]);
  const maxHeight = Number(state.values["max-height"]);

  return {
    direction,
    parentWidth,
    gap: Number(state.values.gap),
    padding: Number(state.values.padding),
    justifyContent: alignment.justifyContent,
    alignItems: alignment.alignItems,
    wrap: state.values.wrap ? "wrap" : "nowrap",
    sizing,
    width: getWidthStyle(sizing),
    minWidth: minWidth > 0 ? `${minWidth}px` : "",
    maxWidth: maxWidth > 0 ? `${maxWidth}px` : "",
    minHeight: minHeight > 0 ? `${minHeight}px` : direction === "column" ? "320px" : "220px",
    maxHeight: maxHeight > 0 ? `${maxHeight}px` : "",
    justifySelf: getConstraintJustifySelf(constraint),
    shellWidth: getConstraintShellWidth(constraint)
  };
}

function getWidthStyle(sizing) {
  if (sizing === "fill") return "100%";
  if (sizing === "fixed") return "min(420px, 100%)";
  return "fit-content";
}

function getWidthCss(model) {
  if (model.sizing === "fill") return "100%";
  if (model.sizing === "fixed") return "420px";
  return "fit-content";
}

function getConstraintCssValue(value) {
  return Number(value) > 0 ? `${value}px` : "none";
}

function getConstraintJustifySelf(value) {
  if (value === "left") return "start";
  if (value === "center") return "center";
  if (value === "right") return "end";
  if (value === "left-right" || value === "scale") return "stretch";
  return "start";
}

function getConstraintShellWidth(value) {
  if (value === "left-right" || value === "scale") return "100%";
  return "fit-content";
}

function getFrameMeasureLabel(model) {
  if (model.sizing === "fill") return "Frame stretches to available width";
  if (model.sizing === "fixed") return "Frame keeps a stable width";
  return "Frame hugs its content width";
}

function getLayoutStatus(model) {
  const direction = state.values.direction === "horizontal" ? "Horizontal" : "Vertical";
  const wrap = state.values.wrap ? "Wrap" : "No Wrap";
  return `${direction} / ${formatOptionLabel(state.values.sizing)} / ${wrap}`;
}

function formatValue(lessonId, value) {
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (["gap", "padding", "parent-width", "min-width", "max-width", "min-height", "max-height"].includes(lessonId)) {
    return `${value}px`;
  }
  return formatOptionLabel(String(value));
}

function formatOptionLabel(value) {
  const labels = {
    horizontal: "Horizontal",
    vertical: "Vertical",
    start: "Start",
    center: "Center",
    end: "End",
    "space-between": "Space Between",
    "left-right": "Left & Right",
    scale: "Scale",
    hug: "Hug",
    fill: "Fill",
    fixed: "Fixed"
  };

  return labels[value] || value.replace(/(^|-)([a-z])/g, (_, dash, char) => `${dash ? " " : ""}${char.toUpperCase()}`);
}

function getNarrative(lessonId) {
  const value = state.values[lessonId];
  const direction = state.values.direction;

  if (lessonId === "direction") {
    return value === "horizontal"
      ? "当前主轴从左到右延展，按钮组或标签条会沿水平方向排列。"
      : "当前主轴从上到下延展，信息块会更像表单、说明列表或卡片流。";
  }

  if (lessonId === "gap") {
    return `当前子项之间保持 ${value}px 的间距。注意这只影响元素彼此之间的距离，不会改变容器边缘留白。`;
  }

  if (lessonId === "padding") {
    return `当前容器内边距为 ${value}px。值越大，内容离边框越远，整体会更舒展。`;
  }

  if (lessonId === "alignment") {
    return `当前内容按 ${formatOptionLabel(value)} 对齐。因为主轴是 ${formatOptionLabel(direction)}，这个设置会先影响主轴分布，再影响交叉轴停靠。`;
  }

  if (lessonId === "sizing") {
    return value === "hug"
      ? "当前 Frame 会跟着内容变化，内容增加时容器一起长大。"
      : value === "fill"
        ? "当前 Frame 会尽量占满父级可用空间，更适合输入框、导航条或整行容器。"
        : "当前 Frame 使用固定宽度，适合稳定结构，但不够适合内容频繁变化的场景。";
  }

  if (lessonId === "wrap") {
    return value
      ? "当前允许换行。空间不足时，子项会流到下一行或下一列。"
      : "当前不允许换行。空间不足时，内容只能继续压缩或溢出在同一主轴上。";
  }

  if (lessonId === "absolute-position") {
    return value
      ? "当前有一个元素脱离了正常 Auto Layout 流程，它不会再参与常规的排列与占位。"
      : "当前所有元素都在正常布局流里，容器会统一计算它们的尺寸、间距和位置。";
  }

  if (lessonId === "parent-width") {
    return `当前父级容器宽度为 ${value}px。它决定了 Fill、Wrap、Min/Max 和 Constraints 到底有没有机会表现出来。`;
  }

  if (lessonId === "constraints") {
    return `当前约束策略是 ${formatOptionLabel(value)}。当父级宽度变化时，Frame 会优先遵守这个锚定方式。`;
  }

  if (lessonId === "min-width") {
    return Number(value) > 0
      ? `当前最小宽度是 ${value}px。即使内容较少，Frame 也不会再缩得比这个值更窄。`
      : "当前没有最小宽度限制，Frame 可以继续随内容缩小。";
  }

  if (lessonId === "max-width") {
    return Number(value) > 0
      ? `当前最大宽度是 ${value}px。即使父级更宽，Frame 也不会无限继续拉长。`
      : "当前没有最大宽度限制，Frame 可以继续根据 Fill 或父级空间变宽。";
  }

  if (lessonId === "min-height") {
    return Number(value) > 0
      ? `当前最小高度是 ${value}px。哪怕内容较少，容器也会保留基础高度。`
      : "当前没有最小高度限制，高度主要由内容和 padding 决定。";
  }

  if (lessonId === "max-height") {
    return Number(value) > 0
      ? `当前最大高度是 ${value}px。内容继续增加时，高度不会无上限增长。`
      : "当前没有最大高度限制，高度会继续随着内容扩展。";
  }

  if (lessonId === "clip-content") {
    return value
      ? "当前超出边界的内容会被裁切隐藏，更适合做卡片图片、可控边界和封闭容器。"
      : "当前即使内容超出边界，仍然会继续显示出来，适合角标或装饰元素露出。";
  }

  return "";
}

function getConstraintNarrative(value) {
  const map = {
    left: "Stays anchored to the left edge",
    center: "Stays centered as parent width changes",
    right: "Stays anchored to the right edge",
    "left-right": "Pins to both sides and stretches horizontally",
    scale: "Scales relative to the parent width"
  };

  return map[value] || "";
}

init();
