let currentLanguage = "zh";

figma.showUI(__html__, {
  width: 520,
  height: 720,
  title: "Token Lab",
  themeColors: true
});

figma.ui.onmessage = async (message) => {
  if (!message || !message.type) {
    return;
  }

  syncLanguage(message);

  if (message.type === "token-lab/set-language") {
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
    return;
  }

  if (message.type === "token-lab/analyze-selection") {
    figma.ui.postMessage({
      type: "token-lab/ack",
      payload: {
        action: message.type
      }
    });
    await postSelectionAnalysisInput();
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

async function postSelectionAnalysisInput() {
  try {
    const selectionInput = await collectSelectionAnalysisInput();
    figma.ui.postMessage({
      type: "token-lab/selection-analysis-input",
      payload: selectionInput
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

    figma.notify(t("notify_import_complete", {
      count: String(result.stats.created + result.stats.updated)
    }));
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
    throw new Error(t("error_missing_document"));
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
    logs.push(infoLog(t("log_created_collection", { name: collectionDraft.name })));
  } else {
    stats.reusedCollections += 1;
    logs.push(infoLog(t("log_reused_collection", { name: collectionDraft.name })));
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
        logs.push(infoLog(t("log_added_mode", {
          mode: draftMode.name,
          collection: collectionDraft.name
        })));
      }
    }

    if (!liveMode) {
      throw new Error(t("error_resolve_mode", {
        mode: draftMode.name,
        collection: collectionDraft.name
      }));
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
    throw new Error(t("error_missing_collection_runtime", {
      collection: token.collectionName
    }));
  }

  const figmaName = normalizeFigmaVariableName(token.name);
  const collisionKey = `${figmaName}::${token.resolvedType}`;
  const existingVariable = entry.variableByKey.get(collisionKey) || null;

  if (existingVariable && strategy === "skip-existing") {
    runtime.tokenRefs.set(token.id, existingVariable);
    stats.skipped += 1;
    logs.push(infoLog(t("log_skipped_token", {
      name: figmaName,
      collection: token.collectionName
    })));
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
    logs.push(infoLog(t("log_created_renamed_token", {
      appliedName,
      originalName: token.name
    })));
  } else if (existingVariable && strategy === "replace-values") {
    stats.updated += 1;
    logs.push(infoLog(t("log_updated_existing_token", { name: figmaName })));
  } else if (!existingVariable) {
    variable = figma.variables.createVariable(appliedName, entry.collection, token.resolvedType);
    entry.nameSet.add(appliedName);
    entry.variableByKey.set(`${appliedName}::${token.resolvedType}`, variable);
    stats.created += 1;
    logs.push(infoLog(t("log_created_token", { name: appliedName })));
  }

  if (!variable) {
    throw new Error(t("error_resolve_variable", { name: token.name }));
  }

  variable.description = token.description || "";

  if (isAliasPhase) {
    await applyAliasValues(variable, token, runtime, entry);
    stats.aliases += 1;
    logs.push(infoLog(t("log_bound_alias", { name: appliedName })));
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
    throw new Error(t("error_invalid_variable_name", { name: String(name) }));
  }

  return normalized;
}

function applyDirectValues(variable, token, entry) {
  Object.entries(token.valuesByMode || {}).forEach(([draftModeId, value]) => {
    const figmaModeId = entry.draftModeIdToFigmaModeId.get(draftModeId);
    if (!figmaModeId) {
      throw new Error(t("error_missing_mode_mapping", {
        modeId: draftModeId,
        token: token.name
      }));
    }

    variable.setValueForMode(figmaModeId, serializeDraftValue(value));
  });
}

async function applyAliasValues(variable, token, runtime, entry) {
  const aliasTargetId = token.aliasOf ? token.aliasOf.tokenId : null;
  const target = aliasTargetId ? runtime.tokenRefs.get(aliasTargetId) : null;
  if (!target) {
    throw new Error(t("error_missing_alias_target", { token: token.name }));
  }

  const alias = await figma.variables.createVariableAliasByIdAsync(target.id);
  Object.keys(token.valuesByMode || {}).forEach((draftModeId) => {
    const figmaModeId = entry.draftModeIdToFigmaModeId.get(draftModeId);
    if (!figmaModeId) {
      throw new Error(t("error_missing_alias_mode_mapping", {
        token: token.name
      }));
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
    selection: collectSelectionSummary(),
    collectionCount: serializedCollections.length,
    collections: serializedCollections
  };
}

function collectSelectionSummary() {
  const selection = figma.currentPage.selection || [];

  return {
    count: selection.length,
    items: selection.slice(0, 8).map((node) => serializeSelectionNode(node))
  };
}

async function collectSelectionAnalysisInput() {
  const selection = (figma.currentPage.selection || []).filter((node) => canExportSelectionNode(node));

  if (!selection.length) {
    throw new Error(t("error_missing_selection"));
  }

  if (selection.length > 6) {
    throw new Error(t("error_selection_limit"));
  }

  const images = [];

  for (const node of selection) {
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: {
        type: "WIDTH",
        value: 512
      }
    });

    images.push({
      id: node.id,
      name: node.name,
      type: node.type,
      width: roundNodeDimension(node.width),
      height: roundNodeDimension(node.height),
      modeHint: detectModeHint(node.name),
      pngBase64: encodeBase64(bytes)
    });
  }

  return {
    pageName: figma.currentPage.name,
    selection: collectSelectionSummary(),
    images
  };
}

function canExportSelectionNode(node) {
  return Boolean(node && typeof node.exportAsync === "function");
}

function serializeSelectionNode(node) {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    width: roundNodeDimension(node.width),
    height: roundNodeDimension(node.height),
    modeHint: detectModeHint(node.name)
  };
}

function roundNodeDimension(value) {
  return typeof value === "number" ? Math.round(value) : null;
}

function detectModeHint(name) {
  const normalized = String(name || "").toLowerCase();

  if (normalized.includes("dark")) {
    return "dark";
  }

  if (normalized.includes("light")) {
    return "light";
  }

  return "light";
}

function encodeBase64(bytes) {
  let output = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let index = 0;

  while (index < bytes.length) {
    const byte1 = bytes[index++] || 0;
    const byte2 = index < bytes.length ? bytes[index++] : NaN;
    const byte3 = index < bytes.length ? bytes[index++] : NaN;
    const hasByte2 = !Number.isNaN(byte2);
    const hasByte3 = !Number.isNaN(byte3);

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | ((hasByte2 ? byte2 : 0) >> 4);
    const enc3 = ((hasByte2 ? byte2 : 0) & 15) << 2 | ((hasByte3 ? byte3 : 0) >> 6);
    const enc4 = (hasByte3 ? byte3 : 0) & 63;

    output += alphabet.charAt(enc1);
    output += alphabet.charAt(enc2);
    output += hasByte2 ? alphabet.charAt(enc3) : "=";
    output += hasByte3 ? alphabet.charAt(enc4) : "=";
  }

  return output;
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

function syncLanguage(message) {
  const payload = message && message.payload ? message.payload : null;
  const language = payload && payload.language;

  if (language === "zh" || language === "en") {
    currentLanguage = language;
  }
}

function t(key, params) {
  const table = {
    zh: {
      notify_import_complete: "Token Lab 导入完成：已应用 {count} 项",
      error_missing_document: "导入数据缺少有效的 TokenLabDocument。",
      log_created_collection: "已创建集合：{name}",
      log_reused_collection: "复用已有集合：{name}",
      log_added_mode: "已向 {collection} 添加模式：{mode}",
      error_resolve_mode: "无法解析集合 {collection} 中的模式 {mode}。",
      error_missing_collection_runtime: "缺少集合运行时信息：{collection}。",
      log_skipped_token: "已在 {collection} 中跳过变量：{name}",
      log_created_renamed_token: "已创建重命名变量：{appliedName}，来源于 {originalName}",
      log_updated_existing_token: "已更新现有变量：{name}",
      log_created_token: "已创建变量：{name}",
      error_resolve_variable: "无法解析变量：{name}。",
      log_bound_alias: "已绑定别名值：{name}",
      error_invalid_variable_name: "变量名无效，来源值为：{name}",
      error_missing_mode_mapping: "变量 {token} 缺少模式映射：{modeId}。",
      error_missing_alias_target: "变量 {token} 缺少别名目标。",
      error_missing_alias_mode_mapping: "别名变量 {token} 缺少模式映射。",
      error_missing_selection: "运行 Analyze Selection 前，请至少选中一个画板或可导出图层。",
      error_selection_limit: "Analyze Selection 当前最多支持同时分析 6 个选中图层。"
    },
    en: {
      notify_import_complete: "Token Lab import complete: {count} applied",
      error_missing_document: "Import payload is missing a valid TokenLabDocument.",
      log_created_collection: "Created collection: {name}",
      log_reused_collection: "Reusing collection: {name}",
      log_added_mode: "Added mode {mode} to {collection}",
      error_resolve_mode: "Unable to resolve mode {mode} in collection {collection}.",
      error_missing_collection_runtime: "Missing collection runtime for {collection}.",
      log_skipped_token: "Skipped {name} in {collection}",
      log_created_renamed_token: "Created renamed token {appliedName} from {originalName}",
      log_updated_existing_token: "Updated existing token {name}",
      log_created_token: "Created token {name}",
      error_resolve_variable: "Unable to resolve variable for token {name}.",
      log_bound_alias: "Bound alias values for {name}",
      error_invalid_variable_name: "Invalid empty variable name derived from \"{name}\".",
      error_missing_mode_mapping: "Missing mode mapping for {modeId} on token {token}.",
      error_missing_alias_target: "Alias target missing for {token}.",
      error_missing_alias_mode_mapping: "Missing mode mapping for alias token {token}.",
      error_missing_selection: "Select at least one frame or exportable layer before running Analyze Selection.",
      error_selection_limit: "Analyze Selection currently supports up to 6 selected layers at a time."
    }
  };
  const messages = table[currentLanguage] || table.en;
  const template = messages[key] || table.en[key] || key;

  return template.replace(/\{(\w+)\}/g, (_, name) => {
    return Object.prototype.hasOwnProperty.call(params || {}, name) ? String(params[name]) : "";
  });
}
