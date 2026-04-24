const workspace = window.TOKEN_LAB_WORKSPACE;
const planner = window.TokenLabImportPlanner;

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
  activeMode: workspace.batch.defaultMode,
  selectedImageId: workspace.analysis.images[0]?.id || null,
  selectedGroupId: "primitive-color",
  selectedItemId: "token-color-surface-0",
  strategy: "skip-existing",
  draftDocument: structuredClone(workspace.document),
  removedTokenIds: new Set()
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
    state.activeMode = workspace.batch.defaultMode;
    state.selectedImageId = workspace.analysis.images[0]?.id || null;
    state.selectedGroupId = "primitive-color";
    state.selectedItemId = "token-color-surface-0";
    state.strategy = "skip-existing";
    state.draftDocument = structuredClone(workspace.document);
    state.removedTokenIds = new Set();
    render();
  });
}

function getVisibleDraftDocument() {
  const documentDraft = structuredClone(state.draftDocument);
  documentDraft.collections.forEach((collection) => {
    collection.groups.forEach((group) => {
      group.tokens = group.tokens.filter((token) => !state.removedTokenIds.has(token.id));
    });
  });
  return documentDraft;
}

function getReviewDocument() {
  return state.draftDocument;
}

function getReviewFlattenedDocument() {
  return planner.flattenDocument(getReviewDocument());
}

function getPlanningDocument() {
  const documentDraft = structuredClone(state.draftDocument);
  documentDraft.collections.forEach((collection) => {
    collection.groups.forEach((group) => {
      group.tokens = group.tokens.filter((token) => !state.removedTokenIds.has(token.id));
    });
  });
  return documentDraft;
}

function getImportPlan() {
  return planner.buildImportPlan(getPlanningDocument(), workspace.currentFileSnapshot, state.strategy);
}

function getFlattenedDocument() {
  return planner.flattenDocument(getPlanningDocument());
}

function getTokenById(tokenId) {
  return getReviewFlattenedDocument().tokenMap.get(tokenId) || null;
}

function updateToken(tokenId, updater) {
  state.draftDocument.collections.forEach((collection) => {
    collection.groups.forEach((group) => {
      group.tokens.forEach((token) => {
        if (token.id === tokenId) {
          updater(token, collection, group);
        }
      });
    });
  });
}

function toggleTokenRemoved(tokenId) {
  if (state.removedTokenIds.has(tokenId)) {
    state.removedTokenIds.delete(tokenId);
  } else {
    state.removedTokenIds.add(tokenId);
  }
}

function isSemanticToken(token) {
  return token.collectionId === "semantics";
}

function getSemanticSuggestionGroups() {
  return getReviewDocument().collections
    .filter((collection) => collection.id === "semantics")
    .flatMap((collection) =>
      collection.groups.map((group) => ({
        id: `${group.id}-suggestions`,
        name: group.name.replace("Semantic / ", "") + " Suggestions",
        eyebrow: `${group.tokens.length} alias proposals`,
        summary: "从 normalized semantic tokens 派生的导入建议。",
        items: group.tokens.map((token) => ({
          id: token.id,
          label: token.name,
          removed: state.removedTokenIds.has(token.id),
          meta: token.aliasOf
            ? `alias -> ${getReviewFlattenedDocument().tokenMap.get(token.aliasOf.tokenId)?.name || token.aliasOf.tokenId}`
            : "direct semantic token",
          confidence: token.source?.confidence || 0,
          swatch: token.valuesByMode?.light?.hex
        }))
      }))
    );
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
  elements.batchName.textContent = workspace.batch.name;
  elements.consistencyScore.textContent = `Consistency ${workspace.batch.consistencyScore}`;
  elements.batchSummary.innerHTML = "";

  const planningDocument = getPlanningDocument();
  const visibleTokenCount = planningDocument.collections.reduce(
    (count, collection) =>
      count + collection.groups.reduce((groupCount, group) => groupCount + group.tokens.length, 0),
    0
  );

  const entries = [
    ["Source", workspace.batch.sourceType],
    ["Platform", workspace.batch.platform],
    ["Area", workspace.batch.productArea],
    ["Default Mode", workspace.batch.defaultMode],
    ["Images", String(workspace.batch.imageCount)],
    ["Doc Version", planningDocument.version],
    ["Visible Tokens", String(visibleTokenCount)]
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
  elements.imageCountBadge.textContent = `${workspace.analysis.images.length} images`;
  elements.imageQueue.innerHTML = "";

  workspace.analysis.images.forEach((image) => {
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
  const plan = getImportPlan();
  elements.stageRail.innerHTML = "";

  workspace.analysis.stages.forEach((stage) => {
    const article = document.createElement("article");
    article.className = "stage-card";
    article.dataset.status = stage.status;

    const summary =
      stage.id === "import"
        ? `${plan.stats.createTokens} create / ${plan.stats.updateTokens} update / ${plan.stats.skipTokens} skip`
        : stage.summary;

    article.innerHTML = `
      <p>${stage.label}</p>
      <strong>${stage.metric}</strong>
      <span>${summary}</span>
    `;
    elements.stageRail.append(article);
  });
}

function renderModes() {
  const modes = getReviewDocument().collections[0].modes.map((mode) => mode.id);
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
  const plan = getImportPlan();
  const items = getItemsForGroup(group);
  const metrics = [
    `${items.length} items`,
    `Mode: ${formatLabel(state.activeMode)}`,
    `Strategy: ${formatLabel(state.strategy)}`,
    `Validation: ${plan.stats.validationErrors} errors / ${plan.stats.validationWarnings} warnings`
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
  const plan = getImportPlan();
  const operationMap = new Map(plan.operations.filter((operation) => operation.tokenId).map((operation) => [operation.tokenId, operation]));
  const wrap = document.createElement("div");
  wrap.className = "token-table editable-token-table";

  const header = document.createElement("div");
  header.className = "token-row token-row-head token-row-edit-head";
  header.innerHTML = `
    <span>Name</span>
    <span>Light</span>
    <span>Dark</span>
    <span>Review</span>
    <span>Plan</span>
  `;
  wrap.append(header);

  tokens.forEach((token) => {
    const operation = operationMap.get(token.id);
    const isRemoved = state.removedTokenIds.has(token.id);
    const row = document.createElement("div");
    row.className = "token-row token-row-edit";
    row.dataset.active = String(token.id === state.selectedItemId);
    row.dataset.removed = String(isRemoved);

    const nameCell = document.createElement("div");
    nameCell.className = "token-name editor-cell";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "token-input";
    nameInput.value = token.name;
    nameInput.setAttribute("aria-label", `${token.name} name`);
    nameInput.addEventListener("focus", () => {
      state.selectedItemId = token.id;
      renderInspector();
      renderDetails();
    });
    nameInput.addEventListener("input", (event) => {
      updateToken(token.id, (draftToken) => {
        draftToken.name = event.target.value.trim();
      });
      render();
    });

    const description = document.createElement("small");
    description.textContent = token.description || "";
    nameCell.append(nameInput, description);

    const lightCell = document.createElement("span");
    lightCell.textContent = formatTokenValue(token.valuesByMode.light);

    const darkCell = document.createElement("span");
    darkCell.textContent = formatTokenValue(token.valuesByMode.dark);

    const reviewCell = document.createElement("div");
    reviewCell.className = "review-actions";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = `review-chip${isRemoved ? " is-danger" : ""}`;
    removeButton.textContent = isRemoved ? "Restore" : "Remove";
    removeButton.addEventListener("click", () => {
      toggleTokenRemoved(token.id);
      if (state.removedTokenIds.has(state.selectedItemId) && token.id === state.selectedItemId) {
        state.selectedItemId = getFirstVisibleTokenIdInGroup(group) || state.selectedItemId;
      }
      render();
    });
    reviewCell.append(removeButton);

    if (isSemanticToken(token)) {
      const aliasButton = document.createElement("button");
      aliasButton.type = "button";
      aliasButton.className = `review-chip${token.aliasOf ? " is-active" : ""}`;
      aliasButton.textContent = token.aliasOf ? "Alias On" : "Alias Off";
      aliasButton.addEventListener("click", () => {
        updateToken(token.id, (draftToken) => {
          if (draftToken.aliasOf) {
            delete draftToken.aliasOf;
          } else {
            const fallbackTarget = getAliasFallbackTarget(draftToken);
            if (fallbackTarget) {
              draftToken.aliasOf = fallbackTarget;
            }
          }
        });
        render();
      });
      reviewCell.append(aliasButton);
    }

    const planCell = document.createElement("span");
    planCell.className = "plan-cell";
    planCell.innerHTML = `<i class="status-dot" data-status="${token.status}"></i>${formatOperationLabel(operation, token.id)}`;

    row.addEventListener("click", (event) => {
      if (event.target.closest("input, button")) {
        return;
      }
      state.selectedItemId = token.id;
      renderInspector();
      renderDetails();
    });

    row.append(nameCell, lightCell, darkCell, reviewCell, planCell);
    wrap.append(row);
  });

  elements.detailPane.append(wrap);
}

function renderInspector() {
  const item = getSelectedItem();
  const image = workspace.analysis.images.find((entry) => entry.id === state.selectedImageId);
  const plan = getImportPlan();

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
  elements.selectedMeta.textContent = buildSelectedMeta(item, image, plan);

  renderModeValues(item);
  renderSourceSignals(item, image, plan);
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

function renderSourceSignals(item, image, plan) {
  const operation = plan.operations.find((entry) => entry.tokenId === item.id);
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
  if (item.source?.notes?.length) {
    lines.push(`Notes: ${item.source.notes.join("; ")}`);
  }
  if (item.aliasOf) {
    const target = getReviewFlattenedDocument().tokenMap.get(item.aliasOf.tokenId);
    lines.push(`Alias: ${item.aliasOf.collectionId} -> ${target?.name || item.aliasOf.tokenId}`);
  } else if (isSemanticToken(item)) {
    lines.push("Alias: disabled");
  }
  if (state.removedTokenIds.has(item.id)) {
    lines.push("Review status: removed from current import draft");
  }
  if (operation) {
    lines.push(`Import plan: ${formatOperationLabel(operation)}`);
    if (operation.originalName) {
      lines.push(`Renamed from: ${operation.originalName}`);
    }
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
      renderStages();
      renderGroups();
      renderDetails();
      renderInspector();
    });
    elements.strategySwitch.append(button);
  });
}

function renderImportStats() {
  const plan = getImportPlan();
  elements.importStats.innerHTML = "";

  [
    ["Create Collections", plan.stats.createCollections],
    ["Reuse Collections", plan.stats.reuseCollections],
    ["Create Tokens", plan.stats.createTokens],
    ["Update Tokens", plan.stats.updateTokens],
    ["Skip Tokens", plan.stats.skipTokens],
    ["Alias Bindings", plan.stats.aliasBindings],
    ["Validation Errors", plan.stats.validationErrors]
  ].forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    elements.importStats.append(card);
  });
}

function renderConflictList() {
  const plan = getImportPlan();
  elements.conflictList.innerHTML = "";

  const messages = [
    ...plan.conflicts,
    ...plan.validationIssues.map((issue) => ({
      tokenName: issue.code,
      collection: "Validation",
      issue: issue.message,
      suggestion: issue.level === "error" ? "Resolve before import." : "Review before shipping."
    }))
  ];

  messages.forEach((conflict) => {
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

  if (!messages.length) {
    elements.conflictList.innerHTML = `<article class="conflict-card"><strong>No blockers</strong><p>当前策略下没有命名冲突或校验错误。</p><span>Planner</span><small>可以继续实现真实 Figma 导入逻辑。</small></article>`;
  }
}

function syncSelectionForView(viewId) {
  if (viewId === "raw") {
    state.selectedGroupId = workspace.analysis.rawGroups[0].id;
    state.selectedItemId = workspace.analysis.rawGroups[0].items[0].id;
    return;
  }

  if (viewId === "clusters") {
    state.selectedGroupId = workspace.analysis.clusterGroups[0].id;
    state.selectedItemId = workspace.analysis.clusterGroups[0].items[0].id;
    return;
  }

  if (viewId === "normalized") {
    state.selectedGroupId = getReviewDocument().collections[0].groups[0].id;
    state.selectedItemId = getReviewDocument().collections[0].groups[0].tokens[0]?.id || null;
    return;
  }

  const semanticGroups = getSemanticSuggestionGroups();
  state.selectedGroupId = semanticGroups[0]?.id || null;
  state.selectedItemId = semanticGroups[0]?.items[0]?.id || null;
}

function getGroupsForActiveView() {
  if (state.activeView === "raw") {
    return workspace.analysis.rawGroups;
  }

  if (state.activeView === "clusters") {
    return workspace.analysis.clusterGroups;
  }

  if (state.activeView === "normalized") {
    const reviewFlat = getReviewFlattenedDocument();
    return getReviewDocument().collections.flatMap((collection) =>
      collection.groups.map((group) => ({
        ...group,
        tokens: group.tokens.map((token) => reviewFlat.tokenMap.get(token.id) || token),
        summary:
          collection.name === "Primitives"
            ? "基于 VARIABLE_SCHEMA 的真实 token 草案，可直接进入导入计划。"
            : "语义 token 仍保留 alias 和人工确认信息。"
      }))
    );
  }

  return getSemanticSuggestionGroups();
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

function getFirstVisibleTokenIdInGroup(group) {
  return getItemsForGroup(group).find((item) => !state.removedTokenIds.has(item.id))?.id || null;
}

function getSelectedItem() {
  const group = getSelectedGroup();
  if (!group) return null;
  return getItemsForGroup(group).find((item) => item.id === state.selectedItemId) || null;
}

function getAliasFallbackTarget(token) {
  if (!token.collectionId || token.collectionId !== "semantics") {
    return null;
  }

  const flattened = getReviewFlattenedDocument();
  const semanticMappings = {
    "surface.default": "token-color-surface-0",
    "surface.brand": "token-color-brand-500",
    "text.primary": "token-color-text-900"
  };

  const targetId = semanticMappings[token.name];
  if (targetId && flattened.tokenMap.has(targetId)) {
    return { collectionId: "primitives", tokenId: targetId };
  }

  const firstColorPrimitive = flattened.tokens.find(
    (candidate) => candidate.collectionId === "primitives" && candidate.resolvedType === token.resolvedType
  );

  return firstColorPrimitive ? { collectionId: firstColorPrimitive.collectionId, tokenId: firstColorPrimitive.id } : null;
}

function formatTokenValue(value) {
  if (!value) return "—";
  if (value.type === "color") return value.hex;
  if (value.type === "float") return `${value.value}px`;
  if (value.type === "string") return value.value;
  if (value.type === "boolean") return value.value ? "true" : "false";
  return "—";
}

function formatOperationLabel(operation, tokenId) {
  if (tokenId && state.removedTokenIds.has(tokenId)) return "Removed";
  if (!operation) return "Pending";
  if (operation.kind === "create-token") return "Create";
  if (operation.kind === "update-token") return "Update";
  if (operation.kind === "skip-token") return "Skip";
  return formatLabel(operation.kind);
}

function buildSelectedMeta(item, image, plan) {
  const parts = [];
  const operation = plan.operations.find((entry) => entry.tokenId === item.id);

  if (item.description) {
    parts.push(item.description);
  }
  if (item.meta) {
    parts.push(item.meta);
  }
  if (operation) {
    parts.push(`Planner: ${formatOperationLabel(operation, item.id)}`);
  }
  if (image) {
    parts.push(`Reference: ${image.frame} / ${formatLabel(image.mode)}`);
  }

  return parts.join(" · ");
}

function currentReviewCopy() {
  return "在这里确认 token 命名、删除、alias 开关和导入前的冲突策略。";
}

function formatLabel(value) {
  return String(value)
    .replace(/\./g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

init();
