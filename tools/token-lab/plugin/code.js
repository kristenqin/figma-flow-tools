figma.showUI(__html__, {
  width: 520,
  height: 720,
  title: "Token Lab Snapshot",
  themeColors: true
});

figma.ui.onmessage = async (message) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === "token-lab/plugin-ready" || message.type === "token-lab/refresh-snapshot") {
    figma.ui.postMessage({
      type: "token-lab/ack",
      payload: {
        action: message.type
      }
    });
    await postSnapshot();
    return;
  }

  if (message.type === "token-lab/request-import") {
    const payload = message.payload || {};
    figma.ui.postMessage({
      type: "token-lab/ack",
      payload: {
        action: message.type
      }
    });
    await runImport(payload.document, payload.strategy || "skip-existing");
  }
};

async function postSnapshot() {
  try {
    const snapshot = await collectCurrentFileSnapshot();
    figma.ui.postMessage({
      type: "token-lab/snapshot",
      payload: snapshot
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "token-lab/error",
      payload: {
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

async function runImport(documentDraft, strategy) {
  try {
    validateImportDocument(documentDraft);

    const result = await executeImport(documentDraft, strategy);
    const snapshot = await collectCurrentFileSnapshot();

    figma.notify(`Token Lab import complete: ${result.stats.created + result.stats.updated} applied`);
    figma.ui.postMessage({
      type: "token-lab/import-result",
      payload: {
        result,
        snapshot
      }
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "token-lab/error",
      payload: {
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

function validateImportDocument(documentDraft) {
  if (!documentDraft || !Array.isArray(documentDraft.collections)) {
    throw new Error("Import payload is missing a valid TokenLabDocument.");
  }
}

async function executeImport(documentDraft, strategy) {
  const logs = [];
  const stats = {
    createdCollections: 0,
    reusedCollections: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    aliases: 0
  };
  const runtime = {
    collectionEntries: new Map(),
    tokenRefs: new Map()
  };

  const orderedTokens = flattenDocumentTokens(documentDraft);
  const baseTokens = orderedTokens.filter((token) => !token.aliasOf);
  const aliasTokens = orderedTokens.filter((token) => token.aliasOf);

  for (const collectionDraft of documentDraft.collections) {
    await ensureCollectionEntry(collectionDraft, runtime, logs, stats);
  }

  for (const token of baseTokens) {
    await applyToken(token, strategy, runtime, logs, stats, false);
  }

  for (const token of aliasTokens) {
    await applyToken(token, strategy, runtime, logs, stats, true);
  }

  return {
    strategy,
    stats,
    logs
  };
}

function flattenDocumentTokens(documentDraft) {
  const tokens = [];

  documentDraft.collections.forEach((collection) => {
    collection.groups.forEach((group) => {
      group.tokens.forEach((token) => {
        const enriched = Object.assign({}, token, {
          collectionId: collection.id,
          collectionName: collection.name,
          draftDefaultMode: collection.defaultMode,
          draftModes: collection.modes,
          groupId: group.id,
          groupName: group.name,
          groupKind: group.kind
        });
        tokens.push(enriched);
      });
    });
  });

  return tokens;
}

async function ensureCollectionEntry(collectionDraft, runtime, logs, stats) {
  if (runtime.collectionEntries.has(collectionDraft.id)) {
    return runtime.collectionEntries.get(collectionDraft.id);
  }

  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = localCollections.find((item) => item.name === collectionDraft.name) || null;
  const created = !collection;

  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionDraft.name);
    stats.createdCollections += 1;
    logs.push(infoLog(`Created collection ${collectionDraft.name}`));
  } else {
    stats.reusedCollections += 1;
    logs.push(infoLog(`Reusing collection ${collectionDraft.name}`));
  }

  if (created) {
    const defaultMode = collectionDraft.modes.find((mode) => mode.id === collectionDraft.defaultMode);
    if (defaultMode) {
      collection.renameMode(collection.defaultModeId, defaultMode.name);
    }
  }

  const draftModeIdToFigmaModeId = new Map();

  collectionDraft.modes.forEach((draftMode) => {
    let liveMode = collection.modes.find((mode) => mode.name === draftMode.name) || null;

    if (!liveMode) {
      if (created && draftMode.id === collectionDraft.defaultMode) {
        liveMode = collection.modes.find((mode) => mode.modeId === collection.defaultModeId) || null;
      } else {
        const modeId = collection.addMode(draftMode.name);
        liveMode = collection.modes.find((mode) => mode.modeId === modeId) || null;
        logs.push(infoLog(`Added mode ${draftMode.name} to ${collectionDraft.name}`));
      }
    }

    if (!liveMode) {
      throw new Error(`Unable to resolve mode ${draftMode.name} in collection ${collectionDraft.name}.`);
    }

    draftModeIdToFigmaModeId.set(draftMode.id, liveMode.modeId);
  });

  const variables = await Promise.all(
    collection.variableIds.map((variableId) => figma.variables.getVariableByIdAsync(variableId))
  );
  const variableByKey = new Map();
  const nameSet = new Set();

  variables.filter(Boolean).forEach((variable) => {
    const collisionKey = `${variable.name}::${variable.resolvedType}`;
    variableByKey.set(collisionKey, variable);
    nameSet.add(variable.name);
  });

  const entry = {
    collection,
    collectionDraft,
    draftModeIdToFigmaModeId,
    variableByKey,
    nameSet
  };

  runtime.collectionEntries.set(collectionDraft.id, entry);
  return entry;
}

async function applyToken(token, strategy, runtime, logs, stats, isAliasPhase) {
  const entry = runtime.collectionEntries.get(token.collectionId);
  if (!entry) {
    throw new Error(`Missing collection runtime for ${token.collectionName}.`);
  }

  const figmaName = normalizeFigmaVariableName(token.name);
  const collisionKey = `${figmaName}::${token.resolvedType}`;
  const existingVariable = entry.variableByKey.get(collisionKey) || null;

  if (existingVariable && strategy === "skip-existing") {
    runtime.tokenRefs.set(token.id, existingVariable);
    stats.skipped += 1;
    logs.push(infoLog(`Skipped ${figmaName} in ${token.collectionName}`));
    return;
  }

  let variable = existingVariable;
  let appliedName = figmaName;

  if (existingVariable && strategy === "rename-incoming") {
    appliedName = buildRename(figmaName, entry.nameSet);
    variable = figma.variables.createVariable(appliedName, entry.collection, token.resolvedType);
    entry.nameSet.add(appliedName);
    entry.variableByKey.set(`${appliedName}::${token.resolvedType}`, variable);
    stats.created += 1;
    logs.push(infoLog(`Created renamed token ${appliedName} from ${token.name}`));
  } else if (existingVariable && strategy === "replace-values") {
    stats.updated += 1;
    logs.push(infoLog(`Updated existing token ${figmaName}`));
  } else if (!existingVariable) {
    variable = figma.variables.createVariable(appliedName, entry.collection, token.resolvedType);
    entry.nameSet.add(appliedName);
    entry.variableByKey.set(`${appliedName}::${token.resolvedType}`, variable);
    stats.created += 1;
    logs.push(infoLog(`Created token ${appliedName}`));
  }

  if (!variable) {
    throw new Error(`Unable to resolve variable for token ${token.name}.`);
  }

  variable.description = token.description || "";

  if (isAliasPhase) {
    await applyAliasValues(variable, token, runtime, entry);
    stats.aliases += 1;
    logs.push(infoLog(`Bound alias values for ${appliedName}`));
  } else {
    applyDirectValues(variable, token, entry);
  }

  runtime.tokenRefs.set(token.id, variable);
}

function normalizeFigmaVariableName(name) {
  const segments = String(name || "")
    .split(/[./]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const normalized = segments.join("/");
  if (!normalized) {
    throw new Error(`Invalid empty variable name derived from "${name}".`);
  }

  return normalized;
}

function applyDirectValues(variable, token, entry) {
  Object.entries(token.valuesByMode || {}).forEach(([draftModeId, value]) => {
    const figmaModeId = entry.draftModeIdToFigmaModeId.get(draftModeId);
    if (!figmaModeId) {
      throw new Error(`Missing mode mapping for ${draftModeId} on token ${token.name}.`);
    }

    variable.setValueForMode(figmaModeId, serializeDraftValue(value));
  });
}

async function applyAliasValues(variable, token, runtime, entry) {
  const aliasTargetId = token.aliasOf ? token.aliasOf.tokenId : null;
  const target = aliasTargetId ? runtime.tokenRefs.get(aliasTargetId) : null;
  if (!target) {
    throw new Error(`Alias target missing for ${token.name}.`);
  }

  const alias = await figma.variables.createVariableAliasByIdAsync(target.id);
  Object.keys(token.valuesByMode || {}).forEach((draftModeId) => {
    const figmaModeId = entry.draftModeIdToFigmaModeId.get(draftModeId);
    if (!figmaModeId) {
      throw new Error(`Missing mode mapping for alias token ${token.name}.`);
    }

    variable.setValueForMode(figmaModeId, alias);
  });
}

function serializeDraftValue(value) {
  if (!value) {
    return value;
  }

  if (value.type === "color") {
    return value.rgba;
  }

  if (value.type === "float" || value.type === "string" || value.type === "boolean") {
    return value.value;
  }

  return value;
}

function buildRename(name, existingNames) {
  let candidate = `${name}.copy`;
  let index = 2;

  while (existingNames.has(candidate)) {
    candidate = `${name}.copy${index}`;
    index += 1;
  }

  return candidate;
}

async function collectCurrentFileSnapshot() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const serializedCollections = [];

  for (const collection of collections) {
    const serializedVariables = [];

    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (!variable || variable.remote) {
        continue;
      }

      serializedVariables.push({
        id: variable.id,
        name: variable.name,
        description: variable.description,
        resolvedType: variable.resolvedType,
        key: variable.key,
        valuesByMode: serializeValuesByMode(variable.valuesByMode),
        modes: collection.modes.map((mode) => mode.name),
        isAlias: Object.values(variable.valuesByMode).some(isAliasValue)
      });
    }

    serializedCollections.push({
      id: collection.id,
      key: collection.key,
      name: collection.name,
      defaultModeId: collection.defaultModeId,
      modes: collection.modes.map((mode) => ({
        modeId: mode.modeId,
        name: mode.name
      })),
      variableIds: collection.variableIds.slice(),
      variables: serializedVariables
    });
  }

  return {
    editorType: figma.editorType,
    pageName: figma.currentPage.name,
    collectionCount: serializedCollections.length,
    collections: serializedCollections
  };
}

function serializeValuesByMode(valuesByMode) {
  const result = {};

  for (const [modeId, value] of Object.entries(valuesByMode)) {
    result[modeId] = serializeVariableValue(value);
  }

  return result;
}

function serializeVariableValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (isAliasValue(value)) {
    return {
      type: "VARIABLE_ALIAS",
      id: value.id
    };
  }

  if (typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    return {
      r: value.r,
      g: value.g,
      b: value.b,
      a: "a" in value ? value.a : 1
    };
  }

  return value;
}

function isAliasValue(value) {
  return typeof value === "object" && value !== null && value.type === "VARIABLE_ALIAS" && typeof value.id === "string";
}

function infoLog(message) {
  return {
    level: "info",
    message
  };
}
