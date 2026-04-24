(function bootstrapImportPlanner() {
  function flattenDocument(documentDraft) {
    const collectionMap = new Map();
    const tokenMap = new Map();
    const tokens = [];

    documentDraft.collections.forEach((collection) => {
      collectionMap.set(collection.id, collection);

      collection.groups.forEach((group) => {
        group.tokens.forEach((token) => {
          const enriched = {
            ...token,
            collectionId: collection.id,
            collectionName: collection.name,
            collectionDefaultMode: collection.defaultMode,
            modeIds: collection.modes.map((mode) => mode.id),
            groupId: group.id,
            groupName: group.name,
            kind: group.kind
          };

          tokens.push(enriched);
          tokenMap.set(token.id, enriched);
        });
      });
    });

    return {
      collections: documentDraft.collections,
      collectionMap,
      tokenMap,
      tokens
    };
  }

  function validateTokenDocument(documentDraft) {
    const issues = [];
    const flat = flattenDocument(documentDraft);

    documentDraft.collections.forEach((collection) => {
      const modeIds = new Set(collection.modes.map((mode) => mode.id));
      const nameSet = new Set();

      if (!modeIds.has(collection.defaultMode)) {
        issues.push({
          level: "error",
          code: "default-mode",
          message: `Collection ${collection.name} is missing default mode ${collection.defaultMode}.`
        });
      }

      collection.groups.forEach((group) => {
        group.tokens.forEach((token) => {
          const key = `${token.name}::${token.resolvedType}`;

          if (!token.name) {
            issues.push({
              level: "error",
              code: "token-name",
              message: `Token ${token.id} is missing a name.`
            });
          }

          if (nameSet.has(key)) {
            issues.push({
              level: "error",
              code: "duplicate-token-name",
              message: `Duplicate token name ${token.name} in collection ${collection.name}.`
            });
          } else {
            nameSet.add(key);
          }

          if (!token.valuesByMode || !token.valuesByMode[collection.defaultMode]) {
            issues.push({
              level: "error",
              code: "default-value",
              message: `Token ${token.name} is missing a default mode value.`
            });
          }

          Object.keys(token.valuesByMode || {}).forEach((modeId) => {
            if (!modeIds.has(modeId)) {
              issues.push({
                level: "error",
                code: "unknown-mode",
                message: `Token ${token.name} references unknown mode ${modeId}.`
              });
            }
          });

          if (token.aliasOf && !flat.tokenMap.has(token.aliasOf.tokenId)) {
            issues.push({
              level: "error",
              code: "missing-alias-target",
              message: `Token ${token.name} references missing alias target ${token.aliasOf.tokenId}.`
            });
          }
        });
      });
    });

    return issues;
  }

  function buildSnapshotIndex(snapshot) {
    const collectionNames = new Set();
    const variableIndex = new Map();

    snapshot.collections.forEach((collection) => {
      collectionNames.add(collection.name);
      collection.variables.forEach((variable) => {
        variableIndex.set(`${collection.name}::${variable.name}::${variable.resolvedType}`, {
          collectionName: collection.name,
          ...variable
        });
      });
    });

    return {
      collectionNames,
      variableIndex
    };
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

  function buildImportPlan(documentDraft, snapshot, strategy) {
    const validationIssues = validateTokenDocument(documentDraft);
    const flat = flattenDocument(documentDraft);
    const snapshotIndex = buildSnapshotIndex(snapshot);
    const knownNamesByCollection = new Map();
    const operations = [];
    const aliasOperations = [];
    const conflicts = [];

    flat.collections.forEach((collection) => {
      knownNamesByCollection.set(
        collection.name,
        new Set((snapshot.collections.find((entry) => entry.name === collection.name)?.variables || []).map((variable) => variable.name))
      );

      operations.push({
        kind: snapshotIndex.collectionNames.has(collection.name) ? "reuse-collection" : "create-collection",
        collectionName: collection.name
      });
    });

    flat.tokens.forEach((token) => {
      const collisionKey = `${token.collectionName}::${token.name}::${token.resolvedType}`;
      const existingVariable = snapshotIndex.variableIndex.get(collisionKey);
      const collectionNames = knownNamesByCollection.get(token.collectionName) || new Set();

      if (existingVariable) {
        conflicts.push({
          tokenName: token.name,
          collection: token.collectionName,
          issue: "Name already exists in current file",
          suggestion:
            strategy === "replace-values"
              ? "Planner will reuse existing variable and update values."
              : strategy === "rename-incoming"
                ? "Planner will rename incoming token."
                : "Planner will skip this token."
        });

        if (strategy === "replace-values") {
          operations.push({
            kind: "update-token",
            tokenId: token.id,
            tokenName: token.name,
            collectionName: token.collectionName
          });
          return;
        }

        if (strategy === "rename-incoming") {
          const renamed = buildRename(token.name, collectionNames);
          collectionNames.add(renamed);
          operations.push({
            kind: "create-token",
            tokenId: token.id,
            tokenName: renamed,
            originalName: token.name,
            collectionName: token.collectionName
          });
          return;
        }

        operations.push({
          kind: "skip-token",
          tokenId: token.id,
          tokenName: token.name,
          collectionName: token.collectionName
        });
        return;
      }

      collectionNames.add(token.name);
      operations.push({
        kind: "create-token",
        tokenId: token.id,
        tokenName: token.name,
        collectionName: token.collectionName
      });
    });

    flat.tokens
      .filter((token) => token.aliasOf)
      .forEach((token) => {
        const target = flat.tokenMap.get(token.aliasOf.tokenId);
        if (!target) {
          return;
        }

        aliasOperations.push({
          kind: "bind-alias",
          tokenName: token.name,
          targetName: target.name,
          collectionName: token.collectionName
        });
      });

    return {
      strategy,
      stats: {
        createCollections: operations.filter((operation) => operation.kind === "create-collection").length,
        reuseCollections: operations.filter((operation) => operation.kind === "reuse-collection").length,
        createTokens: operations.filter((operation) => operation.kind === "create-token").length,
        updateTokens: operations.filter((operation) => operation.kind === "update-token").length,
        skipTokens: operations.filter((operation) => operation.kind === "skip-token").length,
        aliasBindings: aliasOperations.length,
        validationErrors: validationIssues.filter((issue) => issue.level === "error").length,
        validationWarnings: validationIssues.filter((issue) => issue.level === "warning").length
      },
      operations,
      aliasOperations,
      conflicts,
      validationIssues
    };
  }

  window.TokenLabImportPlanner = {
    flattenDocument,
    validateTokenDocument,
    buildImportPlan
  };
}());
