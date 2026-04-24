const fixture = window.TOKEN_LAB_FIXTURES;

const views = [
  {
    id: "raw",
    title: "Raw Observations",
    summary: "先看未经归并的视觉候选，判断输入批次是否足够一致。"
  },
  {
    id: "clusters",
    title: "Clusters",
    summary: "检查离散候选如何收敛成更稳定的档位。"
  },
  {
    id: "normalized",
    title: "Normalized Tokens",
    summary: "这是最接近 Figma Variables 导入结构的一层。"
  },
  {
    id: "semantic",
    title: "Semantic Suggestions",
    summary: "语义层默认作为 alias 建议，保留人工确认。"
  }
];

const state = {
  activeView: "normalized",
  activeMode: fixture.batch.defaultMode,
  selectedImageId: fixture.images[0]?.id || null,
  selectedGroupId: "primitive-color",
  selectedItemId: "token-color-surface-0",
  strategy: "skip-existing"
};

const elements = {
  batchName: document.querySelector("#batchName"),
  consistencyScore: document.querySelector("#consistencyScore"),
  batchSummary: document.querySelector("#batchSummary"),
  imageCountBadge: document.querySelector("#imageCountBadge"),
  imageQueue: document.querySelector("#imageQueue"),
  activeViewTitle: document.querySelector("#activeViewTitle"),
  activeViewSummary: document.querySelector("#activeViewSummary"),
  stageRail: document.querySelector("#stageRail"),
  reviewFocusTitle: document.querySelector("#reviewFocusTitle"),
  reviewFocusCopy: document.querySelector("#reviewFocusCopy"),
  heroMetrics: document.querySelector("#heroMetrics"),
  modeSwitch: document.querySelector("#modeSwitch"),
  viewTabs: document.querySelector("#viewTabs"),
  selectionBadge: document.querySelector("#selectionBadge"),
  groupList: document.querySelector("#groupList"),
  detailPane: document.querySelector("#detailPane"),
  inspectorTitle: document.querySelector("#inspectorTitle"),
  inspectorTypeBadge: document.querySelector("#inspectorTypeBadge"),
  selectedName: document.querySelector("#selectedName"),
  selectedMeta: document.querySelector("#selectedMeta"),
  modeValues: document.querySelector("#modeValues"),
  sourceSignals: document.querySelector("#sourceSignals"),
  strategySwitch: document.querySelector("#strategySwitch"),
  importStats: document.querySelector("#importStats"),
  conflictList: document.querySelector("#conflictList"),
  useSampleButton: document.querySelector("#useSampleButton")
};

function init() {
  bindEvents();
  render();
}

function bindEvents() {
  elements.useSampleButton.addEventListener("click", () => {
    state.activeView = "normalized";
    state.activeMode = fixture.batch.defaultMode;
    state.selectedImageId = fixture.images[0]?.id || null;
    state.selectedGroupId = "primitive-color";
    state.selectedItemId = "token-color-surface-0";
    state.strategy = "skip-existing";
    render();
  });
}

function render() {
  renderBatch();
  renderImages();
  renderStages();
  renderModes();
  renderTabs();
  renderGroups();
  renderDetails();
  renderInspector();
  renderImportPreview();
}

function renderBatch() {
  elements.batchName.textContent = fixture.batch.name;
  elements.consistencyScore.textContent = `Consistency ${fixture.batch.consistencyScore}`;
  elements.batchSummary.innerHTML = "";

  const entries = [
    ["Source", fixture.batch.sourceType],
    ["Platform", fixture.batch.platform],
    ["Area", fixture.batch.productArea],
    ["Default Mode", fixture.batch.defaultMode],
    ["Images", String(fixture.batch.imageCount)]
  ];

  entries.forEach(([label, value]) => {
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    elements.batchSummary.append(term, detail);
  });
}

function renderImages() {
  elements.imageCountBadge.textContent = `${fixture.images.length} images`;
  elements.imageQueue.innerHTML = "";

  fixture.images.forEach((image) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "image-card";
    button.dataset.active = String(image.id === state.selectedImageId);
    button.addEventListener("click", () => {
      state.selectedImageId = image.id;
      renderImages();
      renderInspector();
    });

    const thumb = document.createElement("div");
    thumb.className = "image-thumb";
    thumb.style.setProperty("--accent", image.accent);
    thumb.innerHTML = `<span>${image.frame}</span><strong>${image.mode}</strong>`;

    const meta = document.createElement("div");
    meta.className = "image-meta";
    meta.innerHTML = `
      <div class="image-meta-head">
        <strong>${image.name}</strong>
        <span class="mini-badge">${image.kind}</span>
      </div>
      <p>${image.note}</p>
    `;

    button.append(thumb, meta);
    elements.imageQueue.append(button);
  });
}

function renderStages() {
  elements.stageRail.innerHTML = "";

  fixture.stages.forEach((stage) => {
    const article = document.createElement("article");
    article.className = "stage-card";
    article.dataset.status = stage.status;
    article.innerHTML = `
      <p>${stage.label}</p>
      <strong>${stage.metric}</strong>
      <span>${stage.summary}</span>
    `;
    elements.stageRail.append(article);
  });
}

function renderModes() {
  const modes = ["light", "dark"];
  elements.modeSwitch.innerHTML = "";

  modes.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = formatLabel(mode);
    button.className = state.activeMode === mode ? "is-active" : "";
    button.addEventListener("click", () => {
      state.activeMode = mode;
      renderGroups();
      renderDetails();
      renderInspector();
    });
    elements.modeSwitch.append(button);
  });
}

function renderTabs() {
  const currentView = views.find((view) => view.id === state.activeView);
  elements.activeViewTitle.textContent = currentView.title;
  elements.activeViewSummary.textContent = currentView.summary;
  elements.viewTabs.innerHTML = "";

  views.forEach((view) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab-button${view.id === state.activeView ? " is-active" : ""}`;
    button.textContent = view.title;
    button.addEventListener("click", () => {
      state.activeView = view.id;
      syncSelectionForView(view.id);
      render();
    });
    elements.viewTabs.append(button);
  });
}

function renderGroups() {
  const groups = getGroupsForActiveView();
  elements.groupList.innerHTML = "";
  elements.selectionBadge.textContent = `${groups.length} groups`;

  groups.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "group-card";
    button.dataset.active = String(group.id === state.selectedGroupId);
    button.addEventListener("click", () => {
      state.selectedGroupId = group.id;
      state.selectedItemId = getFirstItemId(group);
      renderDetails();
      renderInspector();
    });

    const eyebrow = group.eyebrow || `${getItemsForGroup(group).length} items`;
    button.innerHTML = `
      <p class="group-eyebrow">${eyebrow}</p>
      <strong>${group.name}</strong>
      <span>${group.summary || ""}</span>
    `;
    elements.groupList.append(button);
  });

  const selectedGroup = groups.find((group) => group.id === state.selectedGroupId);
  if (selectedGroup) {
    elements.reviewFocusTitle.textContent = selectedGroup.name;
    elements.reviewFocusCopy.textContent = selectedGroup.summary || currentReviewCopy();
    renderHeroMetrics(selectedGroup);
  }
}

function renderHeroMetrics(group) {
  const items = getItemsForGroup(group);
  const metrics = [
    `${items.length} items`,
    `Mode: ${formatLabel(state.activeMode)}`,
    `Strategy: ${formatLabel(state.strategy)}`
  ];
  elements.heroMetrics.innerHTML = "";
  metrics.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "metric-chip";
    chip.textContent = label;
    elements.heroMetrics.append(chip);
  });
}

function renderDetails() {
  const selectedGroup = getSelectedGroup();
  const items = selectedGroup ? getItemsForGroup(selectedGroup) : [];
  elements.detailPane.innerHTML = "";

  if (!selectedGroup) {
    elements.detailPane.innerHTML = `<div class="empty-state">No group selected.</div>`;
    return;
  }

  if (state.activeView === "normalized") {
    renderTokenTable(selectedGroup, items);
    return;
  }

  const list = document.createElement("div");
  list.className = "observation-list";

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "observation-card";
    button.dataset.active = String(item.id === state.selectedItemId);
    button.addEventListener("click", () => {
      state.selectedItemId = item.id;
      renderInspector();
      renderDetails();
    });

    const swatch = item.swatch
      ? `<span class="swatch" style="--swatch:${item.swatch}"></span>`
      : `<span class="confidence-tag">${Math.round((item.confidence || 0) * 100)}%</span>`;

    button.innerHTML = `
      <div class="observation-head">
        ${swatch}
        <div>
          <strong>${item.label}</strong>
          <p>${item.meta || ""}</p>
        </div>
      </div>
      <span class="observation-foot">Confidence ${Math.round((item.confidence || 0) * 100)}</span>
    `;
    list.append(button);
  });

  elements.detailPane.append(list);
}

function renderTokenTable(group, tokens) {
  const wrap = document.createElement("div");
  wrap.className = "token-table";

  const header = document.createElement("div");
  header.className = "token-row token-row-head";
  header.innerHTML = `
    <span>Name</span>
    <span>Light</span>
    <span>Dark</span>
    <span>Status</span>
  `;
  wrap.append(header);

  tokens.forEach((token) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "token-row";
    row.dataset.active = String(token.id === state.selectedItemId);
    row.addEventListener("click", () => {
      state.selectedItemId = token.id;
      renderInspector();
      renderDetails();
    });

    row.innerHTML = `
      <span class="token-name">
        <strong>${token.name}</strong>
        <small>${token.description || ""}</small>
      </span>
      <span>${formatTokenValue(token.valuesByMode.light)}</span>
      <span>${formatTokenValue(token.valuesByMode.dark)}</span>
      <span><i class="status-dot" data-status="${token.status}"></i>${formatLabel(token.status)}</span>
    `;
    wrap.append(row);
  });

  elements.detailPane.append(wrap);
}

function renderInspector() {
  const item = getSelectedItem();
  const image = fixture.images.find((entry) => entry.id === state.selectedImageId);

  if (!item) {
    elements.inspectorTitle.textContent = "Token Detail";
    elements.inspectorTypeBadge.textContent = "N/A";
    elements.selectedName.textContent = "Select a token";
    elements.selectedMeta.textContent = "";
    elements.modeValues.innerHTML = "";
    elements.sourceSignals.innerHTML = "";
    return;
  }

  elements.inspectorTitle.textContent = state.activeView === "normalized" ? "Token Detail" : "Signal Detail";
  elements.inspectorTypeBadge.textContent = item.resolvedType || "OBS";
  elements.selectedName.textContent = item.name || item.label;
  elements.selectedMeta.textContent = buildSelectedMeta(item, image);

  renderModeValues(item);
  renderSourceSignals(item, image);
}

function renderModeValues(item) {
  elements.modeValues.innerHTML = "";

  if (!item.valuesByMode) {
    const card = document.createElement("div");
    card.className = "mode-value-card";
    card.innerHTML = `<strong>${formatLabel(state.activeMode)}</strong><span>${item.meta || "No mode-specific value"}</span>`;
    elements.modeValues.append(card);
    return;
  }

  Object.entries(item.valuesByMode).forEach(([mode, value]) => {
    const card = document.createElement("div");
    card.className = "mode-value-card";
    card.dataset.active = String(mode === state.activeMode);
    card.innerHTML = `
      <strong>${formatLabel(mode)}</strong>
      <span>${formatTokenValue(value)}</span>
    `;
    elements.modeValues.append(card);
  });
}

function renderSourceSignals(item, image) {
  elements.sourceSignals.innerHTML = "";
  const lines = [];

  if (item.source?.origin) {
    lines.push(`Origin: ${item.source.origin}`);
  }
  if (item.source?.confidence) {
    lines.push(`Confidence: ${Math.round(item.source.confidence * 100)}%`);
  }
  if (item.source?.sampleCount) {
    lines.push(`Samples: ${item.source.sampleCount}`);
  }
  if (item.source?.rawCandidates?.length) {
    lines.push(`Candidates: ${item.source.rawCandidates.join(", ")}`);
  }
  if (item.aliasOf) {
    lines.push(`Alias: ${item.aliasOf.collectionId} -> ${item.aliasOf.tokenId}`);
  }
  if (!item.source && item.meta) {
    lines.push(item.meta);
  }
  if (image) {
    lines.push(`Selected image: ${image.name}`);
  }

  lines.forEach((line) => {
    const entry = document.createElement("li");
    entry.textContent = line;
    elements.sourceSignals.append(entry);
  });
}

function renderImportPreview() {
  renderStrategySwitch();
  renderImportStats();
  renderConflictList();
}

function renderStrategySwitch() {
  const strategies = [
    ["skip-existing", "Skip Existing"],
    ["rename-incoming", "Rename Incoming"],
    ["replace-values", "Replace Values"]
  ];

  elements.strategySwitch.innerHTML = "";
  strategies.forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = state.strategy === id ? "is-active" : "";
    button.addEventListener("click", () => {
      state.strategy = id;
      renderImportPreview();
      renderGroups();
    });
    elements.strategySwitch.append(button);
  });
}

function renderImportStats() {
  const stats = fixture.importPreview.stats[state.strategy];
  elements.importStats.innerHTML = "";

  [
    ["Create Collections", stats.createCollections],
    ["Create Tokens", stats.createTokens],
    ["Update Tokens", stats.updateTokens],
    ["Skip Tokens", stats.skipTokens]
  ].forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    elements.importStats.append(card);
  });
}

function renderConflictList() {
  elements.conflictList.innerHTML = "";

  fixture.importPreview.conflicts.forEach((conflict) => {
    const card = document.createElement("article");
    card.className = "conflict-card";
    card.innerHTML = `
      <strong>${conflict.tokenName}</strong>
      <p>${conflict.issue}</p>
      <span>${conflict.collection}</span>
      <small>${conflict.suggestion}</small>
    `;
    elements.conflictList.append(card);
  });
}

function syncSelectionForView(viewId) {
  if (viewId === "raw") {
    state.selectedGroupId = fixture.rawGroups[0].id;
    state.selectedItemId = fixture.rawGroups[0].items[0].id;
    return;
  }

  if (viewId === "clusters") {
    state.selectedGroupId = fixture.clusterGroups[0].id;
    state.selectedItemId = fixture.clusterGroups[0].items[0].id;
    return;
  }

  if (viewId === "normalized") {
    state.selectedGroupId = fixture.normalizedCollections[0].groups[0].id;
    state.selectedItemId = fixture.normalizedCollections[0].groups[0].tokens[0].id;
    return;
  }

  state.selectedGroupId = fixture.semanticSuggestions[0].id;
  state.selectedItemId = fixture.semanticSuggestions[0].items[0].id;
}

function getGroupsForActiveView() {
  if (state.activeView === "raw") {
    return fixture.rawGroups;
  }

  if (state.activeView === "clusters") {
    return fixture.clusterGroups;
  }

  if (state.activeView === "normalized") {
    return fixture.normalizedCollections.flatMap((collection) => collection.groups);
  }

  return fixture.semanticSuggestions;
}

function getSelectedGroup() {
  return getGroupsForActiveView().find((group) => group.id === state.selectedGroupId) || null;
}

function getItemsForGroup(group) {
  if (group.tokens) {
    return group.tokens;
  }

  return group.items || [];
}

function getFirstItemId(group) {
  const items = getItemsForGroup(group);
  return items[0]?.id || null;
}

function getSelectedItem() {
  const group = getSelectedGroup();
  if (!group) return null;
  return getItemsForGroup(group).find((item) => item.id === state.selectedItemId) || null;
}

function formatTokenValue(value) {
  if (!value) return "—";
  if (value.type === "color") return value.hex;
  if (value.type === "float") return `${value.value}px`;
  if (value.type === "string") return value.value;
  if (value.type === "boolean") return value.value ? "true" : "false";
  return "—";
}

function buildSelectedMeta(item, image) {
  const parts = [];

  if (item.description) {
    parts.push(item.description);
  }
  if (item.meta) {
    parts.push(item.meta);
  }
  if (image) {
    parts.push(`Reference: ${image.frame} / ${formatLabel(image.mode)}`);
  }

  return parts.join(" · ");
}

function currentReviewCopy() {
  return "在这里确认 token 命名、状态和导入前的 mode 差异。";
}

function formatLabel(value) {
  return String(value)
    .replace(/\./g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

init();
