const planner = window.TokenLabImportPlanner;
const sampleDocument = JSON.parse(JSON.stringify(window.TOKEN_LAB_PLUGIN_SAMPLE_DOCUMENT));

const state = {
  strategy: "skip-existing",
  snapshot: null,
  error: null,
  lastResult: null
};

const elements = {
  editorType: document.querySelector("#editorType"),
  currentPage: document.querySelector("#currentPage"),
  collectionCount: document.querySelector("#collectionCount"),
  variableCount: document.querySelector("#variableCount"),
  strategySwitch: document.querySelector("#strategySwitch"),
  statGrid: document.querySelector("#statGrid"),
  collectionList: document.querySelector("#collectionList"),
  conflictList: document.querySelector("#conflictList"),
  refreshButton: document.querySelector("#refreshButton"),
  importButton: document.querySelector("#importButton"),
  statusNote: document.querySelector("#statusNote")
};

window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (!message) {
    return;
  }

  if (message.type === "token-lab/snapshot") {
    state.snapshot = message.payload;
    state.error = null;
    render();
    return;
  }

  if (message.type === "token-lab/import-result") {
    state.lastResult = message.payload.result;
    state.snapshot = message.payload.snapshot;
    state.error = null;
    render();
    return;
  }

  if (message.type === "token-lab/error") {
    state.error = message.payload.message;
    render();
  }
};

elements.refreshButton.addEventListener("click", () => {
  parent.postMessage({ pluginMessage: { type: "token-lab/refresh-snapshot" } }, "*");
});

elements.importButton.addEventListener("click", () => {
  parent.postMessage({
    pluginMessage: {
      type: "token-lab/request-import",
      payload: {
        document: sampleDocument,
        strategy: state.strategy
      }
    }
  }, "*");
});

function init() {
  renderStrategySwitch();
  render();
  parent.postMessage({ pluginMessage: { type: "token-lab/plugin-ready" } }, "*");
}

function render() {
  const snapshot = state.snapshot;
  const plan = snapshot ? planner.buildImportPlan(sampleDocument, normalizeSnapshot(snapshot), state.strategy) : null;

  elements.editorType.textContent = snapshot ? snapshot.editorType : "loading";
  elements.currentPage.textContent = snapshot ? snapshot.pageName : "Loading current page";
  elements.collectionCount.textContent = snapshot ? String(snapshot.collectionCount) : "—";
  elements.variableCount.textContent = snapshot ? String(countVariables(snapshot.collections)) : "—";
  elements.statusNote.textContent = state.error
    ? state.error
    : state.lastResult
      ? `Last import: ${state.lastResult.stats.created} created, ${state.lastResult.stats.updated} updated, ${state.lastResult.stats.aliases} alias bindings.`
    : snapshot
      ? "Current file snapshot loaded from figma.variables."
      : "Waiting for plugin main thread to return the current variable snapshot.";

  renderStatGrid(plan);
  renderCollectionList(snapshot);
  renderConflictList(plan);
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
    button.className = state.strategy === id ? "is-active" : "";
    button.textContent = label;
    button.addEventListener("click", () => {
      state.strategy = id;
      renderStrategySwitch();
      render();
    });
    elements.strategySwitch.append(button);
  });
}

function renderStatGrid(plan) {
  elements.statGrid.innerHTML = "";

  if (!plan) {
    return;
  }

  [
    ["Create Collections", plan.stats.createCollections],
    ["Reuse Collections", plan.stats.reuseCollections],
    ["Create Tokens", plan.stats.createTokens],
    ["Update Tokens", plan.stats.updateTokens],
    ["Skip Tokens", plan.stats.skipTokens],
    ["Alias Bindings", plan.stats.aliasBindings]
  ].forEach(([label, value]) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    elements.statGrid.append(card);
  });
}

function renderCollectionList(snapshot) {
  elements.collectionList.innerHTML = "";

  if (!snapshot) {
    return;
  }

  snapshot.collections.forEach((collection) => {
    const card = document.createElement("article");
    card.className = "collection-card";
    card.innerHTML = `
      <div class="collection-head">
        <strong>${collection.name}</strong>
        <span>${collection.variables.length} vars</span>
      </div>
      <p>Modes: ${collection.modes.map((mode) => mode.name).join(", ")}</p>
      <ul class="mini-list">
        ${collection.variables.slice(0, 4).map((variable) => `<li>${variable.name} · ${variable.resolvedType}</li>`).join("")}
      </ul>
    `;
    elements.collectionList.append(card);
  });
}

function renderConflictList(plan) {
  elements.conflictList.innerHTML = "";

  if (!plan) {
    return;
  }

  const messages = []
    .concat(plan.conflicts)
    .concat(
      plan.validationIssues.map((issue) => ({
        tokenName: issue.code,
        collection: "Validation",
        issue: issue.message,
        suggestion: issue.level === "error" ? "Resolve before import." : "Review before import."
      }))
    );

  if (!messages.length) {
    elements.conflictList.innerHTML = `
      <article class="conflict-card">
        <strong>No blockers</strong>
        <p>Sample draft can be planned against the current file without validation errors.</p>
        <span>Planner</span>
        <small>Main thread import executor is available for create / update / alias runs.</small>
      </article>
    `;
  } else {
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
  }

  if (state.lastResult && state.lastResult.logs && state.lastResult.logs.length) {
    state.lastResult.logs.slice(-6).forEach((log) => {
      const card = document.createElement("article");
      card.className = "conflict-card";
      card.innerHTML = `
        <strong>${log.level.toUpperCase()}</strong>
        <p>${log.message}</p>
        <span>Import Log</span>
        <small>Runtime executor output</small>
      `;
      elements.conflictList.append(card);
    });
  }
}

function countVariables(collections) {
  return collections.reduce((count, collection) => count + collection.variables.length, 0);
}

function normalizeSnapshot(snapshot) {
  return {
    collections: snapshot.collections.map((collection) => ({
      name: collection.name,
      modes: collection.modes.map((mode) => mode.name),
      variables: collection.variables.map((variable) => ({
        name: variable.name,
        resolvedType: variable.resolvedType,
        modes: collection.modes.map((mode) => mode.name),
        isAlias: variable.isAlias
      }))
    }))
  };
}

init();
