figma.showUI(__html__, {
  width: 520,
  height: 680,
  title: "Token Lab Snapshot",
  themeColors: true
});

figma.ui.onmessage = async (message) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === "token-lab/plugin-ready" || message.type === "token-lab/refresh-snapshot") {
    await postSnapshot();
    return;
  }

  if (message.type === "token-lab/request-import") {
    figma.notify("Import executor skeleton is ready. Next step is wiring create/update operations.");
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
      variableIds: [...collection.variableIds],
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
