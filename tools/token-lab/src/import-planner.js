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

    if (documentDraft.version !== "0.1") {
      issues.push({ level: "warning", code: "version", message: "Document version is not 0.1." });
    }

    const flat = flattenDocument(documentDraft);

    documentDraft.collections.forEach((collection) => {
      if (!collection.name) {
        issues.push({ level: "error", code: "collection-name", message: `Collection ${collection.id} is missing a name.` });
      }

      const modeIds = new Set(collection.modes.map((mode) => mode.id));
      if (!modeIds.has(collection.defaultMode)) {
        issues.push({
          level: "error",
          code: "default-mode",
          message: `Collection ${collection.name} is missing default mode ${collection.defaultMode}.`
        });
      }

      const nameSet = new Set();
      collection.groups.forEach((group) => {
        group.tokens.forEach((token) => {
          const nameKey = `${token.name}::${token.resolvedType}`;

          if (!token.name) {
            issues.push({ level: "error", code: "token-name", message: `Token ${token.id} is missing a name.` });
          }

          if (nameSet.has(nameKey)) {
            issues.push({
              level: "error",
              code: "duplicate-token-name",
              message: `Duplicate token name ${token.name} in collection ${collection.name}.`
            });
          } else {
            nameSet.add(nameKey);
          }

          if (!token.valuesByMode || !token.valuesByMode[collection.defaultMode]) {
            issues.push({
              level: "error",
              code: "default-value",
              message: `Token ${token.name} is missing default mode value for ${collection.defaultMode}.`
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

  function getCollisionKey(token) {
    return `${token.collectionName}::${token.name}::${token.resolvedType}`;
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
    const conflicts = [];
    const aliasOperations = [];

    flat.collections.forEach((collection) => {
      if (!knownNamesByCollection.has(collection.name)) {
        knownNamesByCollection.set(
          collection.name,
          new Set(
            (snapshot.collections.find((entry) => entry.name === collection.name)?.variables || []).map((variable) => variable.name)
          )
        );
      }
    });

    flat.collections.forEach((collection) => {
      operations.push({
        kind: snapshotIndex.collectionNames.has(collection.name) ? "reuse-collection" : "create-collection",
        collectionName: collection.name
      });
    });

    flat.tokens.forEach((token) => {
      const collisionKey = getCollisionKey(token);
      const existingVariable = snapshotIndex.variableIndex.get(collisionKey);
      const collectionNames = knownNamesByCollection.get(token.collectionName) || new Set();

      if (existingVariable) {
        conflicts.push({
          tokenName: token.name,
          collection: token.collectionName,
          issue: "Name already exists in current file",
          suggestion:
            strategy === "replace-values"
              ? "Planner will reuse existing variable and update its values."
              : strategy === "rename-incoming"
                ? "Planner will rename incoming token to keep both versions."
                : "Planner will skip this token to avoid overwriting."
        });

        if (strategy === "replace-values") {
          operations.push({
            kind: "update-token",
            tokenId: token.id,
            tokenName: token.name,
            collectionName: token.collectionName,
            alias: Boolean(token.aliasOf)
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
            collectionName: token.collectionName,
            alias: Boolean(token.aliasOf)
          });
          return;
        }

        operations.push({
          kind: "skip-token",
          tokenId: token.id,
          tokenName: token.name,
          collectionName: token.collectionName,
          alias: Boolean(token.aliasOf)
        });
        return;
      }

      collectionNames.add(token.name);
      operations.push({
        kind: "create-token",
        tokenId: token.id,
        tokenName: token.name,
        collectionName: token.collectionName,
        alias: Boolean(token.aliasOf)
      });
    });

    flat.tokens
      .filter((token) => token.aliasOf)
      .forEach((token) => {
        const target = flat.tokenMap.get(token.aliasOf.tokenId);
        if (!target) {
          conflicts.push({
            tokenName: token.name,
            collection: token.collectionName,
            issue: "Alias target is missing in current draft",
            suggestion: "Fix alias mapping before importing."
          });
          return;
        }

        aliasOperations.push({
          kind: "bind-alias",
          tokenName: token.name,
          collectionName: token.collectionName,
          targetName: target.name,
          targetCollectionName: target.collectionName
        });
      });

    const stats = {
      createCollections: operations.filter((operation) => operation.kind === "create-collection").length,
      reuseCollections: operations.filter((operation) => operation.kind === "reuse-collection").length,
      createTokens: operations.filter((operation) => operation.kind === "create-token").length,
      updateTokens: operations.filter((operation) => operation.kind === "update-token").length,
      skipTokens: operations.filter((operation) => operation.kind === "skip-token").length,
      aliasBindings: aliasOperations.length,
      validationErrors: validationIssues.filter((issue) => issue.level === "error").length,
      validationWarnings: validationIssues.filter((issue) => issue.level === "warning").length
    };

    return {
      strategy,
      stats,
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
