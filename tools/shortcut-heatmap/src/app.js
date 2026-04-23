const shortcuts = window.FIGMA_SHORTCUTS || [];

const categories = [
  ["all", "全部场景"],
  ["select", "选择"],
  ["create", "创建"],
  ["edit", "编辑"],
  ["view", "视图"],
  ["text", "文本"],
  ["component", "组件"],
  ["arrange", "层级"],
  ["organize", "整理"],
  ["collab", "协作"],
  ["navigation", "导航"],
  ["export", "导出"]
];

const keyboardRows = [
  [
    ["esc", "Esc"],
    ["1", "1"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["6", "6"],
    ["7", "7"],
    ["8", "8"],
    ["9", "9"],
    ["0", "0"],
    ["-", "-"],
    ["=", "+ / ="],
    ["delete", "Delete", "wide-2"]
  ],
  [
    ["tab", "Tab", "wide-2"],
    ["q", "Q"],
    ["w", "W"],
    ["e", "E"],
    ["r", "R"],
    ["t", "T"],
    ["y", "Y"],
    ["u", "U"],
    ["i", "I"],
    ["o", "O"],
    ["p", "P"],
    ["[", "["],
    ["]", "]"]
  ],
  [
    ["caps", "Caps", "wide-2"],
    ["a", "A"],
    ["s", "S"],
    ["d", "D"],
    ["f", "F"],
    ["g", "G"],
    ["h", "H"],
    ["j", "J"],
    ["k", "K"],
    ["l", "L"],
    [";", ";"],
    ["'", "'"],
    ["enter", "Enter"]
  ],
  [
    ["shift", "Shift", "wide-3"],
    ["z", "Z"],
    ["x", "X"],
    ["c", "C"],
    ["v", "V"],
    ["b", "B"],
    ["n", "N"],
    ["m", "M"],
    [",", ","],
    [".", "."],
    ["/", "/"],
    ["shift-r", "Shift", "wide-2"]
  ],
  [
    ["control", "Ctrl"],
    ["option", "Opt / Alt"],
    ["command", "Cmd / Ctrl", "wide-2"],
    ["space", "Space", "wide-4"],
    ["command-r", "Cmd / Ctrl", "wide-2"],
    ["option-r", "Opt / Alt"],
    ["arrow", "Arrows", "wide-3"]
  ]
];

const state = {
  platform: "mac",
  category: "all",
  search: "",
  hoveredShortcutId: null,
  lockedShortcutId: null
};

const elements = {
  platform: document.querySelector("#platform"),
  category: document.querySelector("#category"),
  search: document.querySelector("#search"),
  keyboard: document.querySelector("#keyboard"),
  list: document.querySelector("#shortcutList"),
  listMeta: document.querySelector("#listMeta"),
  topKey: document.querySelector("#topKey"),
  activeCount: document.querySelector("#activeCount"),
  shortcutCount: document.querySelector("#shortcutCount"),
  exportBoard: document.querySelector("#exportBoard"),
  exportPngButton: document.querySelector("#exportPngButton"),
  exportSvgButton: document.querySelector("#exportSvgButton"),
  focusTitle: document.querySelector("#focusTitle"),
  focusDescription: document.querySelector("#focusDescription"),
  clearFocusButton: document.querySelector("#clearFocusButton")
};

function init() {
  elements.shortcutCount.textContent = shortcuts.length;
  categories.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    elements.category.append(option);
  });

  elements.platform.addEventListener("change", (event) => {
    state.platform = event.target.value;
    render();
  });

  elements.category.addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });

  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.clearFocusButton.addEventListener("click", () => {
    state.lockedShortcutId = null;
    state.hoveredShortcutId = null;
    render();
  });

  elements.exportPngButton.addEventListener("click", exportPng);
  elements.exportSvgButton.addEventListener("click", exportSvg);

  render();
}

function getFilteredShortcuts() {
  return shortcuts
    .filter((shortcut) => state.category === "all" || shortcut.category === state.category)
    .filter((shortcut) => {
      if (!state.search) return true;
      const combo = shortcut[state.platform].join(" ");
      return [
        shortcut.command,
        shortcut.description,
        shortcut.category,
        combo,
        ...shortcut.tags
      ].join(" ").toLowerCase().includes(state.search);
    })
    .sort((a, b) => b.score - a.score || a.command.localeCompare(b.command));
}

function buildKeyStats(activeShortcuts) {
  return activeShortcuts.reduce((stats, shortcut) => {
    const key = normalizeKey(shortcut.primaryKey);
    if (!stats[key]) {
      stats[key] = {
        score: 0,
        count: 0,
        top: shortcut
      };
    }

    stats[key].score += shortcut.score;
    stats[key].count += 1;
    if (shortcut.score > stats[key].top.score) {
      stats[key].top = shortcut;
    }

    return stats;
  }, {});
}

function render() {
  const activeShortcuts = getFilteredShortcuts();
  const keyStats = buildKeyStats(activeShortcuts);
  const focusedShortcut = getFocusedShortcut(activeShortcuts);
  renderKeyboard(keyStats, focusedShortcut);
  renderList(activeShortcuts, focusedShortcut);
  renderMetrics(activeShortcuts, keyStats);
  renderFocusStrip(focusedShortcut);
}

function renderKeyboard(keyStats, focusedShortcut) {
  elements.keyboard.innerHTML = "";
  const focusState = getFocusState(focusedShortcut);
  elements.keyboard.classList.toggle("is-focus-mode", Boolean(focusState));

  keyboardRows.flat().forEach(([id, label, widthClass]) => {
    const key = document.createElement("article");
    const stats = keyStats[normalizeKey(id)];
    const heatClass = getHeatClass(stats?.score || 0);
    const focusClass = getFocusClass(id, focusState);
    key.className = ["key", widthClass, heatClass, focusClass, stats ? "" : "empty"].filter(Boolean).join(" ");

    const labelNode = document.createElement("span");
    labelNode.className = "key-label";
    labelNode.textContent = label;

    const commandNode = document.createElement("span");
    commandNode.className = "key-command";
    commandNode.textContent = stats ? stats.top.command : " ";

    const scoreNode = document.createElement("span");
    scoreNode.className = "key-score";
    scoreNode.textContent = stats ? `${stats.count} cmd / ${stats.score}` : " ";

    key.append(labelNode, commandNode, scoreNode);
    elements.keyboard.append(key);
  });
}

function renderList(activeShortcuts, focusedShortcut) {
  elements.list.innerHTML = "";
  elements.listMeta.textContent = `${activeShortcuts.length} items`;

  activeShortcuts.forEach((shortcut, index) => {
    const card = document.createElement("article");
    const isFocused = focusedShortcut?.id === shortcut.id;
    const isLocked = state.lockedShortcutId === shortcut.id;
    card.className = ["shortcut-card", isFocused ? "is-focused" : "", isLocked ? "is-locked" : ""].filter(Boolean).join(" ");
    card.tabIndex = 0;

    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = String(index + 1).padStart(2, "0");

    const body = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = shortcut.command;
    const description = document.createElement("p");
    description.textContent = `${shortcut.description} 评分 ${shortcut.score} / 频率 ${shortcut.frequency} / 影响 ${shortcut.impact}`;
    body.append(title, description);

    const combo = document.createElement("div");
    combo.className = "combo";
    shortcut[state.platform].forEach((key) => {
      const keyNode = document.createElement("kbd");
      keyNode.textContent = formatComboKey(key);
      combo.append(keyNode);
    });

    card.addEventListener("mouseenter", () => {
      state.hoveredShortcutId = shortcut.id;
      render();
    });

    card.addEventListener("mouseleave", () => {
      state.hoveredShortcutId = null;
      render();
    });

    card.addEventListener("focus", () => {
      state.hoveredShortcutId = shortcut.id;
      render();
    });

    card.addEventListener("blur", () => {
      state.hoveredShortcutId = null;
      render();
    });

    card.addEventListener("click", () => {
      state.lockedShortcutId = state.lockedShortcutId === shortcut.id ? null : shortcut.id;
      state.hoveredShortcutId = shortcut.id;
      render();
    });

    card.append(rank, body, combo);
    elements.list.append(card);
  });
}

function renderMetrics(activeShortcuts, keyStats) {
  elements.activeCount.textContent = activeShortcuts.length;
  const top = Object.entries(keyStats).sort((a, b) => b[1].score - a[1].score)[0];
  elements.topKey.textContent = top ? `${top[0].toUpperCase()} / ${top[1].score}` : "-";
}

function renderFocusStrip(focusedShortcut) {
  if (!focusedShortcut) {
    elements.focusTitle.textContent = "默认热区";
    elements.focusDescription.textContent = "悬停或点击下方快捷键，热区会同时点亮主键和修饰键，帮助用户更快理解完整组合键。";
    elements.clearFocusButton.hidden = true;
    return;
  }

  const combo = focusedShortcut[state.platform].map(formatComboKey).join(" + ");
  const isLocked = state.lockedShortcutId === focusedShortcut.id;
  elements.focusTitle.textContent = `${focusedShortcut.command} / ${combo}`;
  elements.focusDescription.textContent = isLocked
    ? "当前为锁定模式，导出 PNG 或 SVG 时会保留这组主键与修饰键高亮。"
    : "当前为临时预览模式，移开鼠标后会恢复默认热区。点击卡片可锁定高亮。";
  elements.clearFocusButton.hidden = !isLocked;
}

function getHeatClass(score) {
  if (score >= 170) return "hot";
  if (score >= 90) return "warm";
  if (score > 0) return "cool";
  return "";
}

function getFocusedShortcut(activeShortcuts) {
  const focusedId = state.lockedShortcutId || state.hoveredShortcutId;
  return activeShortcuts.find((shortcut) => shortcut.id === focusedId) || null;
}

function getFocusState(shortcut) {
  if (!shortcut) return null;
  const combo = shortcut[state.platform].map(normalizeKey);
  return {
    modifierKeys: combo.filter(isModifierKey),
    primaryKeys: combo.filter((key) => !isModifierKey(key))
  };
}

function getFocusClass(keyId, focusState) {
  if (!focusState) return "";
  const normalizedKey = normalizeKey(keyId);
  if (focusState.primaryKeys.includes(normalizedKey)) return "focus-primary";

  const modifierAliases = getModifierAliases(normalizedKey);
  if (modifierAliases.some((alias) => focusState.modifierKeys.includes(alias))) {
    return "focus-modifier";
  }

  return "";
}

function isModifierKey(key) {
  return ["command", "control", "option", "shift"].includes(key);
}

function getModifierAliases(key) {
  const aliases = {
    command: ["command", "control"],
    "command-r": ["command", "control"],
    control: ["control"],
    option: ["option"],
    "option-r": ["option"],
    shift: ["shift"],
    "shift-r": ["shift"]
  };
  return aliases[key] || [key];
}

function normalizeKey(key) {
  const map = {
    "+": "=",
    cmd: "command",
    command: "command",
    control: "control",
    ctrl: "control",
    option: "option",
    alt: "option",
    delete: "delete",
    enter: "enter",
    esc: "esc",
    space: "space"
  };
  return map[key.toLowerCase()] || key.toLowerCase();
}

function formatComboKey(key) {
  const labels = {
    Command: "Cmd",
    Control: "Ctrl",
    Option: "Opt",
    Alt: "Alt",
    Shift: "Shift"
  };
  return labels[key] || key;
}

async function exportPng() {
  const svg = buildExportSvg();
  const image = await loadSvgImage(svg);
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f5f0e6";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  downloadUrl(canvas.toDataURL("image/png"), "figma-shortcut-heatmap.png");
}

function exportSvg() {
  const svg = buildExportSvg();
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadUrl(url, "figma-shortcut-heatmap.svg");
  URL.revokeObjectURL(url);
}

function buildExportSvg() {
  const board = elements.exportBoard.cloneNode(true);
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  const width = 1320;
  const height = Math.max(760, elements.exportBoard.scrollHeight + 40);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>
            ${styles}
            body { margin: 0; background: #f5f0e6; }
            .export-board { width: ${width - 40}px; margin: 20px; box-shadow: none; }
            .keyboard-wrap { overflow: visible; }
          </style>
          ${board.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `.trim();
}

function loadSvgImage(svg) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = reject;
    image.src = url;
  });
}

function downloadUrl(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

init();
