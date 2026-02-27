var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  VanillaTable: () => VanillaTable,
  actionsDropdownPlugin: () => actionsDropdownPlugin,
  bootstrapThemePlugin: () => bootstrapThemePlugin,
  bulmaThemePlugin: () => bulmaThemePlugin,
  createCursorAdapter: () => createCursorAdapter,
  createGraphQLAdapter: () => createGraphQLAdapter,
  createRestAdapter: () => createRestAdapter,
  createVanillaTable: () => createVanillaTable,
  muiThemePlugin: () => muiThemePlugin,
  stripedRowsPlugin: () => stripedRowsPlugin,
  tailwindThemePlugin: () => tailwindThemePlugin,
  themePlugin: () => themePlugin
});
module.exports = __toCommonJS(index_exports);

// src/i18n/default.i18n.js
var defaultI18n = {
  search: "Search",
  filter: "Filter",
  rows: "Rows",
  actions: "Actions",
  loading: "Loading...",
  empty: "No results found",
  pageInfo: "Page {page} of {totalPages} ({totalRows} rows)",
  first: "First",
  prev: "Previous",
  next: "Next",
  last: "Last"
};

// src/core/default-options.js
var defaultOptions = {
  pageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  searchable: true,
  columnFilters: true,
  sortable: true,
  multiSort: true,
  maxSorts: 3,
  pagination: true,
  initialSort: null,
  debounceMs: 120,
  fixedHeader: false,
  fixedFooter: false,
  fixedColumns: 0,
  fixedTopRows: 0,
  expandableRows: false,
  editableRows: false,
  editableColumns: {},
  rowIdKey: "id",
  serverSide: false,
  fetchData: null,
  virtualScroll: {
    enabled: false,
    rowHeight: 40,
    overscan: 6,
    height: 420,
    adaptiveOverscan: true
  },
  virtualColumns: {
    enabled: false,
    width: 180,
    overscan: 2
  },
  parallel: {
    enabled: true,
    threshold: 2e4,
    workers: "auto",
    timeoutMs: 4e3,
    retries: 1,
    typedColumns: true
  },
  persistence: {
    enabled: false,
    storageKey: null
  },
  urlSync: {
    enabled: false,
    param: "vt"
  },
  columnResize: true,
  columnReorder: true,
  rowActions: [],
  events: {
    debug: false
  },
  themeClasses: {},
  expandRow: null,
  sanitizeHtml: null,
  i18n: defaultI18n,
  labels: {
    search: defaultI18n.search,
    filter: defaultI18n.filter,
    rows: defaultI18n.rows,
    actions: defaultI18n.actions,
    loading: defaultI18n.loading,
    pageInfo: ({ page, totalPages, totalRows }) => defaultI18n.pageInfo.replace("{page}", String(page)).replace("{totalPages}", String(totalPages)).replace("{totalRows}", String(totalRows)),
    empty: defaultI18n.empty,
    first: defaultI18n.first,
    prev: defaultI18n.prev,
    next: defaultI18n.next,
    last: defaultI18n.last
  },
  columns: []
};

// src/core/renderers/shell-renderer.js
var ShellRenderer = class {
  /**
   * Creates a shell renderer instance.
   *
   * @param {{ root: HTMLElement, options: Record<string, any>, theme: import('../themes/theme-manager.js').ThemeManager }} config
   */
  constructor({ root, options, theme }) {
    this.root = root;
    this.options = options;
    this.theme = theme;
  }
  /**
   * Mounts static shell structure.
   *
   * @returns {Record<string, HTMLElement>}
   */
  mount() {
    const labels = this.options.labels || {};
    this.root.innerHTML = `
      <div class="${this.theme.classOf("shell", "vt-shell")}">
        <div class="${this.theme.classOf("controls", "vt-controls")}">
          <label class="${this.theme.classOf("sizeWrap", "vt-size-wrap")}">
            <span>${escapeHtml(String(labels.rows ?? ""))}</span>
            <select class="${this.theme.classOf("sizeSelect", "vt-size")}"></select>
          </label>
          <label class="${this.theme.classOf("searchWrap", "vt-search-wrap")}">
            <span>${escapeHtml(String(labels.search ?? ""))}</span>
            <input class="${this.theme.classOf("searchInput", "vt-search")}" type="search" placeholder="Type to filter..." />
          </label>
        </div>
        <div class="${this.theme.classOf("tableWrap", "vt-table-wrap")}" style="${this.options.virtualScroll.enabled ? `height:${this.options.virtualScroll.height}px;overflow:auto;` : ""}">
          <table class="${this.theme.classOf("table", "vt-table")}" role="grid" aria-rowcount="-1">
            <thead></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="${this.theme.classOf("footer", "vt-footer")} ${this.options.fixedFooter ? this.theme.classOf("fixedFooter", "vt-fixed-footer") : ""}">
          <span class="${this.theme.classOf("info", "vt-info")}"></span>
          <div class="${this.theme.classOf("paginationGroup", "vt-pagination-group")}">
            <button class="${this.theme.classOf("firstButton", "vt-page-btn vt-first")}" type="button">${escapeHtml(String(labels.first ?? ""))}</button>
            <button class="${this.theme.classOf("prevButton", "vt-page-btn vt-prev")}" type="button">${escapeHtml(String(labels.prev ?? ""))}</button>
            <button class="${this.theme.classOf("nextButton", "vt-page-btn vt-next")}" type="button">${escapeHtml(String(labels.next ?? ""))}</button>
            <button class="${this.theme.classOf("lastButton", "vt-page-btn vt-last")}" type="button">${escapeHtml(String(labels.last ?? ""))}</button>
          </div>
        </div>
      </div>
    `;
    const refs = {
      search: this.root.querySelector(".vt-search"),
      pageSize: this.root.querySelector(".vt-size"),
      tableWrap: this.root.querySelector(".vt-table-wrap"),
      table: this.root.querySelector(".vt-table"),
      thead: this.root.querySelector("thead"),
      tbody: this.root.querySelector("tbody"),
      info: this.root.querySelector(".vt-info"),
      first: this.root.querySelector(".vt-first"),
      prev: this.root.querySelector(".vt-prev"),
      next: this.root.querySelector(".vt-next"),
      last: this.root.querySelector(".vt-last")
    };
    const pageSizes = normalizePageSizeOptions(this.options.pageSizeOptions);
    refs.pageSize.innerHTML = pageSizes.map((size) => `<option value="${size}">${size}</option>`).join("");
    refs.pageSize.value = String(normalizePageSize(this.options.pageSize));
    if (!this.options.searchable) {
      refs.search.closest(".vt-search-wrap").style.display = "none";
    }
    if (!this.options.pagination) {
      this.root.querySelector(".vt-footer").style.display = "none";
    }
    return refs;
  }
};
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function normalizePageSize(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}
function normalizePageSizeOptions(values) {
  if (!Array.isArray(values) || !values.length) return [10, 25, 50, 100];
  const normalized = values.map((value) => normalizePageSize(value));
  return [...new Set(normalized)];
}

// src/core/renderers/header-renderer.js
var HeaderRenderer = class {
  /**
   * Creates a header renderer instance.
   *
   * @param {{ options: Record<string, any>, theme: import('../themes/theme-manager.js').ThemeManager }} config
   */
  constructor({ options, theme }) {
    this.options = options;
    this.theme = theme;
  }
  /**
   * Renders header rows.
   *
   * @param {HTMLTableSectionElement} thead
   * @param {{ key: string, label: string, sortable?: boolean, filterable?: boolean }[]} columns
   * @param {{ key: string, direction: 'asc'|'desc' }[]} sortState
   * @param {Record<string, string>} columnFilters
   * @param {(cell: HTMLElement, visualIndex: number) => void} applyFixedColumn
   * @param {Record<string, number>} columnWidths
   * @param {{ start: number, end: number, leftWidth: number, rightWidth: number, totalColumns: number, enabled: boolean }} columnWindow
   * @returns {void}
   */
  render(thead, columns, sortState, columnFilters, applyFixedColumn, columnWidths, columnWindow) {
    const headRows = [];
    const sortRow = document.createElement("tr");
    sortRow.setAttribute("role", "row");
    const visibleColumns = columnWindow?.enabled ? columns.slice(columnWindow.start, columnWindow.end) : columns;
    if (this.options.expandableRows) {
      const expandHeader = document.createElement("th");
      expandHeader.className = this.theme.classOf("headerCell", "vt-header-cell");
      sortRow.appendChild(expandHeader);
    }
    if (columnWindow?.enabled && columnWindow.leftWidth > 0) {
      sortRow.appendChild(createSpacerHeader(columnWindow.leftWidth));
    }
    visibleColumns.forEach((column, index) => {
      const th = document.createElement("th");
      th.className = this.theme.classOf("headerCell", "vt-header-cell");
      th.dataset.key = column.key;
      th.draggable = Boolean(this.options.columnReorder);
      th.tabIndex = 0;
      th.setAttribute("role", "columnheader");
      const baseIndex = columnWindow?.enabled ? columnWindow.start + index : index;
      applyFixedColumn(th, baseIndex + (this.options.expandableRows ? 1 : 0));
      if (columnWidths[column.key]) {
        th.style.width = `${columnWidths[column.key]}px`;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = this.theme.classOf("sortTrigger", "vt-sort-trigger");
      button.dataset.key = column.key;
      const sortIndex = sortState.findIndex((item) => item.key === column.key);
      const sortMeta = sortIndex >= 0 ? sortState[sortIndex] : null;
      const marker = sortMeta ? sortMeta.direction === "asc" ? ` \u25B2${sortState.length > 1 ? ` ${sortIndex + 1}` : ""}` : ` \u25BC${sortState.length > 1 ? ` ${sortIndex + 1}` : ""}` : "";
      button.textContent = `${column.label}${marker}`;
      button.disabled = column.sortable === false || !this.options.sortable;
      th.setAttribute("aria-sort", sortMeta ? sortMeta.direction === "asc" ? "ascending" : "descending" : "none");
      th.appendChild(button);
      if (this.options.columnResize) {
        const resizeHandle = document.createElement("span");
        resizeHandle.className = this.theme.classOf("resizeHandle", "vt-resize-handle");
        resizeHandle.dataset.key = column.key;
        resizeHandle.tabIndex = 0;
        resizeHandle.setAttribute("role", "separator");
        resizeHandle.setAttribute("aria-orientation", "vertical");
        th.appendChild(resizeHandle);
      }
      sortRow.appendChild(th);
    });
    if (columnWindow?.enabled && columnWindow.rightWidth > 0) {
      sortRow.appendChild(createSpacerHeader(columnWindow.rightWidth));
    }
    if (this.options.rowActions.length) {
      const actionTh = document.createElement("th");
      actionTh.textContent = this.options.labels.actions;
      actionTh.className = this.theme.classOf("actionHeader", "vt-actions-header");
      sortRow.appendChild(actionTh);
    }
    headRows.push(sortRow);
    if (this.options.columnFilters) {
      const filterRow = document.createElement("tr");
      filterRow.className = this.theme.classOf("filterRow", "vt-filter-row");
      filterRow.setAttribute("role", "row");
      if (this.options.expandableRows) {
        const expandFilterHeader = document.createElement("th");
        expandFilterHeader.className = this.theme.classOf("filterHeaderCell", "vt-filter-header-cell");
        filterRow.appendChild(expandFilterHeader);
      }
      if (columnWindow?.enabled && columnWindow.leftWidth > 0) {
        filterRow.appendChild(createSpacerHeader(columnWindow.leftWidth));
      }
      visibleColumns.forEach((column, index) => {
        const th = document.createElement("th");
        th.className = this.theme.classOf("filterHeaderCell", "vt-filter-header-cell");
        const baseIndex = columnWindow?.enabled ? columnWindow.start + index : index;
        applyFixedColumn(th, baseIndex + (this.options.expandableRows ? 1 : 0));
        if (column.filterable === false) {
          filterRow.appendChild(th);
          return;
        }
        const input = document.createElement("input");
        input.className = this.theme.classOf("columnFilter", "vt-column-filter");
        input.placeholder = `${this.options.labels.filter} ${column.label}`;
        input.value = columnFilters[column.key] || "";
        input.dataset.key = column.key;
        th.appendChild(input);
        filterRow.appendChild(th);
      });
      if (columnWindow?.enabled && columnWindow.rightWidth > 0) {
        filterRow.appendChild(createSpacerHeader(columnWindow.rightWidth));
      }
      if (this.options.rowActions.length) {
        filterRow.appendChild(document.createElement("th"));
      }
      headRows.push(filterRow);
    }
    thead.innerHTML = "";
    headRows.forEach((row) => {
      thead.appendChild(row);
    });
    if (this.options.fixedHeader) {
      appendClassNames(thead, this.theme.classOf("fixedHeader", "vt-fixed-header"));
    }
  }
};
function createSpacerHeader(width) {
  const th = document.createElement("th");
  th.className = "vt-col-spacer";
  th.style.width = `${width}px`;
  th.style.minWidth = `${width}px`;
  th.style.padding = "0";
  th.style.border = "none";
  return th;
}
function appendClassNames(element, classNames) {
  classNames.split(/\s+/).filter(Boolean).forEach((name) => {
    element.classList.add(name);
  });
}

// src/core/renderers/body-renderer.js
var BodyRenderer = class {
  /**
   * Creates a body renderer instance.
   *
   * @param {{ options: Record<string, any>, hooks: Record<string, Function>, theme: import('../themes/theme-manager.js').ThemeManager }} config
   */
  constructor({ options, hooks, theme }) {
    this.options = options;
    this.hooks = hooks;
    this.theme = theme;
    this.rowNodeCache = /* @__PURE__ */ new Map();
  }
  /**
   * Renders visible table body content.
   *
   * @param {HTMLTableSectionElement} tbody
   * @param {{ key: string, render?: (value: any, row: Record<string, any>) => string, editable?: boolean }[]} columns
   * @param {Record<string, any>[]} rows
   * @param {{ expandedRowIds: Set<string>, getRowId: (row: Record<string, any>, index: number) => string, expandRow: ((row: Record<string, any>) => string) | null, editableRows: boolean, editableColumns: Record<string, boolean>, columnWidths: Record<string, number>, virtualization: { enabled: boolean, start: number, end: number, rowHeight: number } }} meta
   * @param {(cell: HTMLElement, visualIndex: number) => void} applyFixedColumn
   * @returns {void}
   */
  render(tbody, columns, rows, meta, applyFixedColumn) {
    const columnWindow = meta.columnWindow || { enabled: false, start: 0, end: columns.length, leftWidth: 0, rightWidth: 0, totalColumns: columns.length };
    const visibleColumns = columnWindow.enabled ? columns.slice(columnWindow.start, columnWindow.end) : columns;
    const fragment = document.createDocumentFragment();
    const postRenderRows = [];
    if (!rows.length) {
      const tr = document.createElement("tr");
      tr.setAttribute("role", "row");
      const td = document.createElement("td");
      td.setAttribute("role", "gridcell");
      td.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
      td.className = this.theme.classOf("emptyCell", "vt-empty");
      td.textContent = this.options.labels.empty;
      tr.appendChild(td);
      fragment.appendChild(tr);
      tbody.replaceChildren(fragment);
      return;
    }
    const renderSlice = meta.virtualization.enabled ? rows.slice(meta.virtualization.start, meta.virtualization.end) : rows;
    if (meta.virtualization.enabled && meta.virtualization.start > 0) {
      const topSpacer = document.createElement("tr");
      topSpacer.className = "vt-virtual-top";
      const topCell = document.createElement("td");
      topCell.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
      topCell.style.height = `${meta.virtualization.start * meta.virtualization.rowHeight}px`;
      topCell.style.padding = "0";
      topCell.style.border = "none";
      topSpacer.appendChild(topCell);
      fragment.appendChild(topSpacer);
    }
    renderSlice.forEach((row, localIndex) => {
      const index = meta.virtualization.enabled ? meta.virtualization.start + localIndex : localIndex;
      const rowId = meta.getRowId(row, index);
      const tr = this.rowNodeCache.get(rowId) || document.createElement("tr");
      tr.className = this.theme.classOf("bodyRow", "vt-row");
      tr.dataset.rowId = rowId;
      tr.setAttribute("role", "row");
      tr.replaceChildren();
      if (this.options.fixedTopRows && index < this.options.fixedTopRows) {
        appendClassNames2(tr, this.theme.classOf("fixedTopRow", "vt-fixed-top-row"));
      }
      if (this.options.expandableRows) {
        const expandTd = document.createElement("td");
        expandTd.className = this.theme.classOf("expandCell", "vt-expand-cell");
        applyFixedColumn(expandTd, 0);
        const expandButton = document.createElement("button");
        expandButton.type = "button";
        expandButton.className = this.theme.classOf("expandTrigger", "vt-expand-trigger");
        expandButton.dataset.rowId = rowId;
        expandButton.textContent = meta.expandedRowIds.has(rowId) ? "\u2212" : "+";
        expandButton.setAttribute("aria-expanded", String(meta.expandedRowIds.has(rowId)));
        expandTd.appendChild(expandButton);
        tr.appendChild(expandTd);
      }
      if (columnWindow.enabled && columnWindow.leftWidth > 0) {
        tr.appendChild(createSpacerCell(columnWindow.leftWidth));
      }
      visibleColumns.forEach((column, columnIndex) => {
        const td = document.createElement("td");
        td.className = this.theme.classOf("bodyCell", "vt-cell");
        td.setAttribute("role", "gridcell");
        td.dataset.key = column.key;
        td.dataset.rowId = rowId;
        const baseIndex = columnWindow.enabled ? columnWindow.start + columnIndex : columnIndex;
        applyFixedColumn(td, baseIndex + (this.options.expandableRows ? 1 : 0));
        if (meta.columnWidths[column.key]) {
          td.style.width = `${meta.columnWidths[column.key]}px`;
        }
        const raw = row[column.key];
        if (column.render) {
          setCellContent(td, column.render(raw, row), this.options.sanitizeHtml);
        } else {
          td.textContent = String(raw ?? "");
        }
        const isEditable = meta.editableRows && column.editable !== false && meta.editableColumns[column.key] !== false;
        if (isEditable) {
          appendClassNames2(td, this.theme.classOf("editableCell", "vt-cell-editable"));
        }
        tr.appendChild(td);
      });
      if (columnWindow.enabled && columnWindow.rightWidth > 0) {
        tr.appendChild(createSpacerCell(columnWindow.rightWidth));
      }
      if (this.options.rowActions.length) {
        const actionTd = document.createElement("td");
        actionTd.className = this.theme.classOf("actionsCell", "vt-actions-cell");
        actionTd.setAttribute("role", "gridcell");
        this.options.rowActions.forEach((action) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `${this.theme.classOf("actionButton", "vt-action-btn")} ${action.className || ""}`.trim();
          button.dataset.actionId = action.id;
          button.dataset.rowId = rowId;
          button.textContent = action.label;
          actionTd.appendChild(button);
        });
        tr.appendChild(actionTd);
      }
      fragment.appendChild(tr);
      this.rowNodeCache.set(rowId, tr);
      postRenderRows.push({ row, element: tr });
      if (this.options.expandableRows && meta.expandedRowIds.has(rowId) && meta.expandRow) {
        const expanded = document.createElement("tr");
        expanded.className = this.theme.classOf("expandRow", "vt-expand-row");
        const expandedCell = document.createElement("td");
        expandedCell.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + 1 + (this.options.rowActions.length ? 1 : 0);
        expandedCell.className = this.theme.classOf("expandContent", "vt-expand-content");
        setCellContent(expandedCell, meta.expandRow(row), this.options.sanitizeHtml);
        expanded.appendChild(expandedCell);
        fragment.appendChild(expanded);
      }
    });
    if (meta.virtualization.enabled && meta.virtualization.end < rows.length) {
      const bottomSpacer = document.createElement("tr");
      bottomSpacer.className = "vt-virtual-bottom";
      const bottomCell = document.createElement("td");
      bottomCell.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
      bottomCell.style.height = `${(rows.length - meta.virtualization.end) * meta.virtualization.rowHeight}px`;
      bottomCell.style.padding = "0";
      bottomCell.style.border = "none";
      bottomSpacer.appendChild(bottomCell);
      fragment.appendChild(bottomSpacer);
    }
    tbody.replaceChildren(fragment);
    postRenderRows.forEach(({ row, element }) => {
      this.hooks.afterRowRender?.({ row, element });
    });
    this.trimRowCache();
  }
  /**
   * Clears stale cached row elements to bound memory growth.
   *
   * @returns {void}
   */
  trimRowCache() {
    if (this.rowNodeCache.size <= 2e3) return;
    const keep = /* @__PURE__ */ new Map();
    for (const [key, value] of this.rowNodeCache.entries()) {
      if (keep.size >= 1e3) break;
      keep.set(key, value);
    }
    this.rowNodeCache = keep;
  }
};
function setCellContent(cell, content, sanitizer) {
  if (content instanceof Node) {
    cell.replaceChildren(content);
    return;
  }
  const html = String(content ?? "");
  if (typeof sanitizer === "function") {
    cell.innerHTML = sanitizer(html);
    return;
  }
  cell.innerHTML = html;
}
function appendClassNames2(element, classNames) {
  classNames.split(/\s+/).filter(Boolean).forEach((name) => {
    element.classList.add(name);
  });
}
function createSpacerCell(width) {
  const td = document.createElement("td");
  td.className = "vt-col-spacer";
  td.style.width = `${width}px`;
  td.style.minWidth = `${width}px`;
  td.style.padding = "0";
  td.style.border = "none";
  return td;
}

// src/core/renderers/footer-renderer.js
var FooterRenderer = class {
  /**
   * Creates a footer renderer instance.
   *
   * @param {{ options: Record<string, any> }} config
   */
  constructor({ options }) {
    this.options = options;
  }
  /**
   * Renders footer state.
   *
   * @param {{ info: HTMLElement, first: HTMLButtonElement, prev: HTMLButtonElement, next: HTMLButtonElement, last: HTMLButtonElement }} refs
   * @param {{ page: number, totalPages: number, totalRows: number, loading?: boolean }} details
   * @returns {void}
   */
  render(refs, { page, totalPages, totalRows, loading }) {
    refs.info.textContent = loading ? this.options.labels.loading : this.options.labels.pageInfo({ page, totalPages, totalRows });
    refs.first.disabled = Boolean(loading) || page <= 1;
    refs.prev.disabled = Boolean(loading) || page <= 1;
    refs.next.disabled = Boolean(loading) || page >= totalPages;
    refs.last.disabled = Boolean(loading) || page >= totalPages;
  }
};

// src/core/themes/theme-manager.js
var ThemeManager = class {
  /**
   * Creates a theme manager instance.
   *
   * @param {Record<string, string>} classes
   */
  constructor(classes = {}) {
    this.classes = classes;
  }
  /**
   * Replaces stored theme classes.
   *
   * @param {Record<string, string>} classes
   * @returns {void}
   */
  setClasses(classes) {
    this.classes = classes || {};
  }
  /**
   * Returns composed class names for a semantic key.
   *
   * @param {string} key
   * @param {string} base
   * @returns {string}
   */
  classOf(key, base) {
    const extra = this.classes?.[key];
    return extra ? `${base} ${extra}` : base;
  }
};

// src/core/renderer.js
var Renderer = class {
  /**
   * Creates a renderer instance.
   *
   * @param {{ root: HTMLElement, options: Record<string, any>, hooks: Record<string, Function> }} config
   */
  constructor({ root, options, hooks }) {
    this.root = root;
    this.options = options;
    this.hooks = hooks;
    this.refs = {};
    this.theme = new ThemeManager(this.options.themeClasses);
    this.shellRenderer = new ShellRenderer({ root: this.root, options: this.options, theme: this.theme });
    this.headerRenderer = new HeaderRenderer({ options: this.options, theme: this.theme });
    this.bodyRenderer = new BodyRenderer({ options: this.options, hooks: this.hooks, theme: this.theme });
    this.footerRenderer = new FooterRenderer({ options: this.options });
  }
  /**
   * Updates renderer options.
   *
   * @param {Record<string, any>} options
   * @returns {void}
   */
  setOptions(options) {
    this.options = options;
    this.theme.setClasses(this.options.themeClasses);
    this.shellRenderer.options = this.options;
    this.headerRenderer.options = this.options;
    this.bodyRenderer.options = this.options;
    this.footerRenderer.options = this.options;
  }
  /**
   * Mounts the base table shell.
   *
   * @returns {void}
   */
  mount() {
    this.refs = this.shellRenderer.mount();
  }
  /**
   * Renders header content.
   *
   * @param {{ key: string, label: string, sortable?: boolean, filterable?: boolean }[]} columns
   * @param {{ key: string, direction: 'asc'|'desc' }[]} sortState
   * @param {Record<string, string>} columnFilters
   * @param {Record<string, number>} columnWidths
   * @param {{ start: number, end: number, leftWidth: number, rightWidth: number, totalColumns: number, enabled: boolean }} columnWindow
   * @returns {void}
   */
  renderHeader(columns, sortState, columnFilters, columnWidths, columnWindow) {
    this.headerRenderer.render(
      this.refs.thead,
      columns,
      sortState,
      columnFilters,
      (cell, visualIndex) => this.applyFixedColumn(cell, visualIndex, columns, columnWidths),
      columnWidths,
      columnWindow
    );
  }
  /**
   * Renders body content.
   *
   * @param {{ key: string, render?: (value: any, row: Record<string, any>) => string, editable?: boolean }[]} columns
   * @param {Record<string, any>[]} rows
   * @param {{ expandedRowIds: Set<string>, getRowId: (row: Record<string, any>, index: number) => string, expandRow: ((row: Record<string, any>) => string) | null, editableRows: boolean, editableColumns: Record<string, boolean>, columnWidths: Record<string, number>, virtualization: { enabled: boolean, start: number, end: number, rowHeight: number }, columnWindow: { start: number, end: number, leftWidth: number, rightWidth: number, totalColumns: number, enabled: boolean } }} meta
   * @returns {void}
   */
  renderBody(columns, rows, meta) {
    this.bodyRenderer.render(this.refs.tbody, columns, rows, meta, (cell, visualIndex) => this.applyFixedColumn(cell, visualIndex, columns, meta.columnWidths));
  }
  /**
   * Renders footer content.
   *
   * @param {{ page: number, totalPages: number, totalRows: number, loading?: boolean }} details
   * @returns {void}
   */
  renderFooter(details) {
    this.footerRenderer.render(
      {
        info: this.refs.info,
        first: this.refs.first,
        prev: this.refs.prev,
        next: this.refs.next,
        last: this.refs.last
      },
      details
    );
  }
  /**
   * Applies sticky positioning for fixed columns.
   *
   * @param {HTMLElement} cell
   * @param {number} visualIndex
   * @param {{ key: string }[]} columns
   * @param {Record<string, number>} columnWidths
   * @returns {void}
   */
  applyFixedColumn(cell, visualIndex, columns, columnWidths) {
    if (!this.options.fixedColumns || visualIndex >= this.options.fixedColumns) {
      return;
    }
    let left = 0;
    for (let i = 0; i < visualIndex; i += 1) {
      const key = columns[i]?.key;
      left += key && columnWidths[key] ? columnWidths[key] : 180;
    }
    cell.style.position = "sticky";
    cell.style.left = `${left}px`;
    cell.style.zIndex = "2";
    appendClassNames3(cell, this.theme.classOf("fixedColumn", "vt-fixed-column"));
  }
};
function appendClassNames3(element, classNames) {
  classNames.split(/\s+/).filter(Boolean).forEach((name) => {
    element.classList.add(name);
  });
}

// src/core/parallel/projection-worker-pool.js
var ProjectionWorkerPool = class {
  /**
   * Creates a worker pool instance.
   *
   * @param {{ size: number, timeoutMs?: number, retries?: number }} config
   */
  constructor({ size, timeoutMs, retries }) {
    this.size = Math.max(1, Number(size || 1));
    this.workers = [];
    this.pending = /* @__PURE__ */ new Map();
    this.nextId = 1;
    this.timeoutMs = Math.max(50, Number(timeoutMs || 4e3));
    this.retries = Math.max(0, Math.floor(Number(retries || 1)));
    this.rows = [];
    for (let i = 0; i < this.size; i += 1) {
      this.workers.push({ worker: this.createWorker() });
    }
  }
  /**
   * Terminates all worker instances.
   *
   * @returns {void}
   */
  destroy() {
    for (const slot of this.workers) {
      slot.worker.terminate();
    }
    this.workers = [];
    this.pending.clear();
  }
  /**
   * Distributes rows across workers.
   *
   * @param {Record<string, any>[]} rows
   * @returns {Promise<void>}
   */
  setRows(rows) {
    const data = Array.isArray(rows) ? rows : [];
    this.rows = data;
    const shardSize = Math.ceil((data.length || 1) / this.workers.length);
    return Promise.all(
      this.workers.map((slot, index) => {
        const start = index * shardSize;
        const end = Math.min(start + shardSize, data.length);
        return this.runTask(slot.worker, {
          type: "setRows",
          rows: data.slice(start, end),
          offset: start
        }).then(() => {
        });
      })
    ).then(() => {
    });
  }
  /**
   * Computes filtered/sorted row indices using worker shards.
   *
   * @param {{ keys: string[], searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[] }} query
   * @returns {Promise<number[]>}
   */
  project(query) {
    return Promise.all(
      this.workers.map(
        (slot) => this.runTask(slot.worker, {
          type: "project",
          keys: query.keys,
          searchTerm: query.searchTerm,
          columnFilters: query.columnFilters,
          sorts: query.sorts
        })
      )
    ).then((chunks) => this.mergeChunks(chunks, query.sorts));
  }
  /**
   * Creates one worker with inline projection logic.
   *
   * @returns {Worker}
   */
  createWorker() {
    const worker = new Worker(getWorkerUrl());
    worker.onmessage = (event) => {
      const payload = event.data || {};
      const pending = this.pending.get(payload.id);
      if (!pending) return;
      this.pending.delete(payload.id);
      if (payload.error) {
        pending.reject(new Error(payload.error));
        return;
      }
      pending.resolve(payload.result);
    };
    worker.onerror = () => {
      this.pending.forEach(({ reject }) => reject(new Error("projection worker failed")));
      this.pending.clear();
    };
    return worker;
  }
  /**
   * Runs one task on a worker and resolves by task id.
   *
   * @param {Worker} worker
   * @param {Record<string, any>} payload
   * @returns {Promise<any>}
   */
  runTask(worker, payload) {
    return this.runTaskAttempt(worker, payload, this.retries);
  }
  /**
   * Runs one task with retry and timeout guards.
   *
   * @param {Worker} worker
   * @param {Record<string, any>} payload
   * @param {number} retriesLeft
   * @returns {Promise<any>}
   */
  runTaskAttempt(worker, payload, retriesLeft) {
    const id = this.nextId;
    this.nextId += 1;
    let timeoutHandle;
    return new Promise((resolve, reject) => {
      const onReject = (error) => {
        clearTimeout(timeoutHandle);
        if (retriesLeft > 0) {
          this.runTaskAttempt(worker, payload, retriesLeft - 1).then(resolve).catch(reject);
          return;
        }
        reject(error);
      };
      const onResolve = (result) => {
        clearTimeout(timeoutHandle);
        resolve(result);
      };
      this.pending.set(id, { resolve: onResolve, reject: onReject });
      timeoutHandle = setTimeout(() => {
        this.pending.delete(id);
        onReject(new Error(`projection worker timeout after ${this.timeoutMs}ms`));
      }, this.timeoutMs);
      worker.postMessage({
        ...payload,
        id
      });
    });
  }
  /**
   * Merges per-shard result chunks into one globally ordered index array.
   *
   * @param {number[][]} chunks
   * @param {{ key: string, direction: 'asc'|'desc' }[]} sorts
   * @returns {number[]}
   */
  mergeChunks(chunks, sorts) {
    if (!Array.isArray(chunks) || !chunks.length) return [];
    if (!Array.isArray(sorts) || !sorts.length) return chunks.flat();
    const pointers = new Int32Array(chunks.length);
    const output = [];
    while (true) {
      let bestChunk = -1;
      let bestIndex = -1;
      for (let i = 0; i < chunks.length; i += 1) {
        const pointer = pointers[i];
        const chunk = chunks[i];
        if (pointer >= chunk.length) continue;
        const currentIndex = chunk[pointer];
        if (bestChunk === -1) {
          bestChunk = i;
          bestIndex = currentIndex;
          continue;
        }
        const comparison = compareRowsBySorts(this.rows[currentIndex], this.rows[bestIndex], sorts);
        if (comparison < 0 || comparison === 0 && currentIndex < bestIndex) {
          bestChunk = i;
          bestIndex = currentIndex;
        }
      }
      if (bestChunk === -1) break;
      output.push(bestIndex);
      pointers[bestChunk] += 1;
    }
    return output;
  }
};
var cachedWorkerUrl = null;
function getWorkerUrl() {
  if (cachedWorkerUrl) return cachedWorkerUrl;
  const source = `
    const toText = (value) => String(value ?? '').toLowerCase();

    let rows = [];
    let offset = 0;
    let textColumns = new Map();
    let numericColumns = new Map();

    const getTextColumn = (key) => {
      if (textColumns.has(key)) return textColumns.get(key);
      const values = new Array(rows.length);
      for (let i = 0; i < rows.length; i += 1) {
        values[i] = toText(rows[i] && rows[i][key]);
      }
      textColumns.set(key, values);
      return values;
    };

    const getNumericColumn = (key) => {
      if (numericColumns.has(key)) return numericColumns.get(key);
      const values = new Float64Array(rows.length);
      const flags = new Uint8Array(rows.length);
      for (let i = 0; i < rows.length; i += 1) {
        const parsed = Number(rows[i] && rows[i][key]);
        if (Number.isFinite(parsed)) {
          values[i] = parsed;
          flags[i] = 1;
        }
      }
      const output = { values, flags };
      numericColumns.set(key, output);
      return output;
    };

    self.onmessage = (event) => {
      const data = event.data || {};

      try {
        if (data.type === 'setRows') {
          rows = Array.isArray(data.rows) ? data.rows : [];
          offset = Number(data.offset || 0);
          textColumns = new Map();
          numericColumns = new Map();
          self.postMessage({ id: data.id, result: true });
          return;
        }

        if (data.type === 'project') {
          const keys = Array.isArray(data.keys) ? data.keys : [];
          const searchTerm = toText(data.searchTerm || '');
          const sorts = Array.isArray(data.sorts) ? data.sorts : [];
          const filters = data.columnFilters && typeof data.columnFilters === 'object'
            ? data.columnFilters
            : {};
          const filterEntries = Object.entries(filters);
          const output = [];
          const textByKey = new Map();
          const numericByKey = new Map();
          const getText = (key) => {
            if (textByKey.has(key)) return textByKey.get(key);
            const values = getTextColumn(key);
            textByKey.set(key, values);
            return values;
          };
          const getNumeric = (key) => {
            if (numericByKey.has(key)) return numericByKey.get(key);
            const values = getNumericColumn(key);
            numericByKey.set(key, values);
            return values;
          };

          for (let i = 0; i < rows.length; i += 1) {
            let matchesFilters = true;

            for (const [key, term] of filterEntries) {
              if (!getText(key)[i].includes(toText(term))) {
                matchesFilters = false;
                break;
              }
            }
            if (!matchesFilters) continue;

            if (!searchTerm) {
              output.push(offset + i);
              continue;
            }

            let matchesSearch = false;
            for (const key of keys) {
              if (getText(key)[i].includes(searchTerm)) {
                matchesSearch = true;
                break;
              }
            }
            if (matchesSearch) output.push(offset + i);
          }

          if (sorts.length > 0) {
            output.sort((leftIndex, rightIndex) => {
              const leftRowIndex = leftIndex - offset;
              const rightRowIndex = rightIndex - offset;
              for (const sort of sorts) {
                const numeric = getNumeric(sort.key);
                const text = getText(sort.key);
                let cmp = 0;
                const bothNumeric = numeric.flags[leftRowIndex] && numeric.flags[rightRowIndex];
                if (bothNumeric) {
                  cmp = numeric.values[leftRowIndex] - numeric.values[rightRowIndex];
                } else {
                  const leftText = text[leftRowIndex];
                  const rightText = text[rightRowIndex];
                  if (leftText < rightText) cmp = -1;
                  else if (leftText > rightText) cmp = 1;
                }

                if (cmp !== 0) return sort.direction === 'desc' ? -cmp : cmp;
              }
              return leftIndex - rightIndex;
            });
          }

          self.postMessage({ id: data.id, result: output });
          return;
        }

        self.postMessage({ id: data.id, result: null });
      } catch (error) {
        self.postMessage({ id: data.id, error: error && error.message ? error.message : 'worker error' });
      }
    };
  `;
  cachedWorkerUrl = URL.createObjectURL(new Blob([source], { type: "application/javascript" }));
  return cachedWorkerUrl;
}
function compareRowsBySorts(leftRow, rightRow, sorts) {
  for (const sort of sorts) {
    const leftRaw = leftRow?.[sort.key];
    const rightRaw = rightRow?.[sort.key];
    const leftNum = Number(leftRaw);
    const rightNum = Number(rightRaw);
    const leftFinite = Number.isFinite(leftNum);
    const rightFinite = Number.isFinite(rightNum);
    let comparison = 0;
    if (leftFinite && rightFinite) {
      comparison = leftNum - rightNum;
    } else {
      const leftText = String(leftRaw ?? "").toLowerCase();
      const rightText = String(rightRaw ?? "").toLowerCase();
      if (leftText < rightText) comparison = -1;
      else if (leftText > rightText) comparison = 1;
    }
    if (comparison !== 0) {
      return sort.direction === "desc" ? -comparison : comparison;
    }
  }
  return 0;
}

// src/core/state-store.js
var StateStore = class {
  /**
   * Creates a state store.
   *
   * @param {{ rows: Record<string, any>[], pageSize: number, initialSort: { key: string, direction?: 'asc'|'desc' } | null, parallel?: { enabled?: boolean, threshold?: number, workers?: number|'auto', timeoutMs?: number, retries?: number } }} config
   */
  constructor({ rows, pageSize, initialSort, parallel }) {
    this.rows = rows;
    this.state = {
      page: 1,
      pageSize: normalizePageSize2(pageSize),
      searchTerm: "",
      columnFilters: {},
      sorts: initialSort ? [{ key: initialSort.key, direction: initialSort.direction || "asc" }] : [],
      columnOrder: [],
      columnWidths: {},
      columnVisibility: {}
    };
    this.rowsVersion = 0;
    this.revision = 0;
    this.filterCache = null;
    this.sortComparatorCache = null;
    this.projectionCache = null;
    this.columnIndexCache = null;
    const parallelWorkers = resolveParallelWorkers(parallel?.workers);
    this.parallel = {
      enabled: parallel?.enabled !== false,
      threshold: Math.max(1e3, Number(parallel?.threshold ?? 2e4)),
      workers: parallelWorkers,
      timeoutMs: Math.max(50, Number(parallel?.timeoutMs ?? 4e3)),
      retries: Math.max(0, Math.floor(Number(parallel?.retries ?? 1)))
    };
    this.projectionWorkerPool = null;
    this.projectionWorkerReady = Promise.resolve();
    if (this.parallel.enabled && typeof Worker !== "undefined") {
      this.projectionWorkerPool = new ProjectionWorkerPool({
        size: this.parallel.workers,
        timeoutMs: this.parallel.timeoutMs,
        retries: this.parallel.retries
      });
      this.projectionWorkerReady = this.projectionWorkerPool.setRows(this.rows).catch(() => {
        this.projectionWorkerPool?.destroy();
        this.projectionWorkerPool = null;
      });
    }
  }
  /**
   * Sets the full rows array.
   *
   * @param {Record<string, any>[]} rows
   * @returns {void}
   */
  setRows(rows) {
    this.rows = Array.isArray(rows) ? rows : [];
    this.rowsVersion += 1;
    this.invalidateFiltersAndProjection();
    this.columnIndexCache = null;
    this.syncWorkerRows();
  }
  /**
   * Sets the global search term.
   *
   * @param {string} searchTerm
   * @returns {void}
   */
  setSearchTerm(searchTerm) {
    this.state.searchTerm = (searchTerm || "").toLowerCase().trim();
    this.state.page = 1;
    this.invalidateFiltersAndProjection();
  }
  /**
   * Sets a per-column filter term.
   *
   * @param {string} key
   * @param {string} value
   * @returns {void}
   */
  setColumnFilter(key, value) {
    const normalized = (value || "").toLowerCase().trim();
    if (!normalized) {
      delete this.state.columnFilters[key];
    } else {
      this.state.columnFilters[key] = normalized;
    }
    this.state.page = 1;
    this.invalidateFiltersAndProjection();
  }
  /**
   * Clears all active filters.
   *
   * @returns {void}
   */
  clearFilters() {
    this.state.searchTerm = "";
    this.state.columnFilters = {};
    this.state.page = 1;
    this.invalidateFiltersAndProjection();
  }
  /**
   * Sets the active page index.
   *
   * @param {number} page
   * @returns {void}
   */
  setPage(page) {
    this.state.page = normalizePage(page);
  }
  /**
   * Sets the page size and resets pagination.
   *
   * @param {number} pageSize
   * @returns {void}
   */
  setPageSize(pageSize) {
    this.state.pageSize = normalizePageSize2(pageSize);
    this.state.page = 1;
  }
  /**
   * Toggles column sort direction.
   *
   * @param {string} key
   * @param {boolean} additive
   * @param {number} maxSorts
   * @returns {void}
   */
  toggleSort(key, additive, maxSorts) {
    const existingIndex = this.state.sorts.findIndex((item) => item.key === key);
    if (!additive) {
      if (existingIndex === -1) {
        this.state.sorts = [{ key, direction: "asc" }];
      } else {
        const current2 = this.state.sorts[existingIndex];
        this.state.sorts = [{ key, direction: current2.direction === "asc" ? "desc" : "asc" }];
      }
      this.invalidateProjection();
      return;
    }
    if (existingIndex === -1) {
      this.state.sorts.push({ key, direction: "asc" });
      if (this.state.sorts.length > maxSorts) {
        this.state.sorts.shift();
      }
      this.invalidateProjection();
      return;
    }
    const current = this.state.sorts[existingIndex];
    this.state.sorts[existingIndex] = {
      key,
      direction: current.direction === "asc" ? "desc" : "asc"
    };
    this.invalidateProjection();
  }
  /**
   * Sets absolute sort state.
   *
   * @param {{ key: string, direction: 'asc'|'desc' }[]} sorts
   * @returns {void}
   */
  setSorts(sorts) {
    this.state.sorts = Array.isArray(sorts) ? sorts : [];
    this.state.page = 1;
    this.invalidateProjection();
  }
  /**
   * Clears active sorts.
   *
   * @returns {void}
   */
  clearSorts() {
    this.state.sorts = [];
    this.state.page = 1;
    this.invalidateProjection();
  }
  /**
   * Sets ordered column keys.
   *
   * @param {string[]} order
   * @returns {void}
   */
  setColumnOrder(order) {
    this.state.columnOrder = Array.isArray(order) ? [...order] : [];
  }
  /**
   * Sets one column width in pixels.
   *
   * @param {string} key
   * @param {number} width
   * @returns {void}
   */
  setColumnWidth(key, width) {
    const normalized = Math.max(60, Math.round(width || 0));
    this.state.columnWidths[key] = normalized;
  }
  /**
   * Sets column visibility by key.
   *
   * @param {string} key
   * @param {boolean} visible
   * @returns {void}
   */
  setColumnVisibility(key, visible) {
    this.state.columnVisibility[key] = Boolean(visible);
  }
  /**
   * Applies a state payload.
   *
   * @param {Partial<{ page: number, pageSize: number, searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[], columnOrder: string[], columnWidths: Record<string, number>, columnVisibility: Record<string, boolean> }>} payload
   * @returns {void}
   */
  setState(payload) {
    if (!payload) return;
    let affectsProjection = false;
    let affectsFilters = false;
    if (typeof payload.page === "number") this.state.page = normalizePage(payload.page);
    if (typeof payload.pageSize === "number") this.state.pageSize = normalizePageSize2(payload.pageSize);
    if (typeof payload.searchTerm === "string") {
      this.state.searchTerm = payload.searchTerm.toLowerCase().trim();
      affectsProjection = true;
      affectsFilters = true;
    }
    if (payload.columnFilters && typeof payload.columnFilters === "object") {
      const nextFilters = {};
      for (const [key, value] of Object.entries(payload.columnFilters)) {
        const normalized = String(value ?? "").toLowerCase().trim();
        if (normalized) {
          nextFilters[key] = normalized;
        }
      }
      this.state.columnFilters = nextFilters;
      affectsProjection = true;
      affectsFilters = true;
    }
    if (Array.isArray(payload.sorts)) {
      this.state.sorts = [...payload.sorts];
      affectsProjection = true;
    }
    if (Array.isArray(payload.columnOrder)) this.state.columnOrder = [...payload.columnOrder];
    if (payload.columnWidths && typeof payload.columnWidths === "object") {
      this.state.columnWidths = { ...payload.columnWidths };
    }
    if (payload.columnVisibility && typeof payload.columnVisibility === "object") {
      this.state.columnVisibility = { ...payload.columnVisibility };
    }
    if (affectsFilters) {
      this.invalidateFiltersAndProjection();
    } else if (affectsProjection) {
      this.invalidateProjection();
    }
  }
  /**
   * Returns serializable state.
   *
   * @returns {{ page: number, pageSize: number, searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[], columnOrder: string[], columnWidths: Record<string, number>, columnVisibility: Record<string, boolean> }}
   */
  getState() {
    return {
      page: this.state.page,
      pageSize: this.state.pageSize,
      searchTerm: this.state.searchTerm,
      columnFilters: { ...this.state.columnFilters },
      sorts: [...this.state.sorts],
      columnOrder: [...this.state.columnOrder],
      columnWidths: { ...this.state.columnWidths },
      columnVisibility: { ...this.state.columnVisibility }
    };
  }
  /**
   * Returns ordered columns based on current state.
   *
   * @param {{ key: string }[]} columns
   * @returns {{ key: string }[]}
   */
  getOrderedColumns(columns) {
    if (!this.state.columnOrder.length) return columns;
    const map = new Map(columns.map((column) => [column.key, column]));
    const ordered = this.state.columnOrder.map((key) => map.get(key)).filter(Boolean);
    const selected = new Set(ordered.map((column) => column.key));
    const rest = columns.filter((column) => !selected.has(column.key));
    return [...ordered, ...rest];
  }
  /**
   * Returns visible columns based on visibility map.
   *
   * @param {{ key: string }[]} columns
   * @returns {{ key: string }[]}
   */
  getVisibleColumns(columns) {
    return columns.filter((column) => this.state.columnVisibility[column.key] !== false);
  }
  /**
   * Returns query payload for server-side fetches.
   *
   * @returns {{ page: number, pageSize: number, searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[] }}
   */
  getQuery() {
    return {
      page: this.state.page,
      pageSize: this.state.pageSize,
      searchTerm: this.state.searchTerm,
      columnFilters: { ...this.state.columnFilters },
      sorts: [...this.state.sorts]
    };
  }
  /**
   * Returns rows visible for the current state.
   *
   * @param {{ key: string }[]} columns
   * @returns {{ rows: Record<string, any>[], totalRows: number, totalPages: number }}
   */
  getVisibleRows(columns) {
    const sorted = this.getProjectedRows(columns);
    const { page, pageSize } = this.state;
    const start = (page - 1) * pageSize;
    return {
      rows: sorted.slice(start, start + pageSize),
      totalRows: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / pageSize))
    };
  }
  /**
   * Returns rows visible for the current state, using worker projection when enabled.
   *
   * @param {{ key: string }[]} columns
   * @returns {Promise<{ rows: Record<string, any>[], totalRows: number, totalPages: number }>}
   */
  getVisibleRowsAsync(columns) {
    return this.getProjectedRowsAsync(columns).then((sorted) => {
      const { page, pageSize } = this.state;
      const start = (page - 1) * pageSize;
      return {
        rows: sorted.slice(start, start + pageSize),
        totalRows: sorted.length,
        totalPages: Math.max(1, Math.ceil(sorted.length / pageSize))
      };
    });
  }
  /**
   * Filters rows using column-level filters.
   *
   * @param {Record<string, any>[]} rows
   * @param {{ key: string }[]} columns
   * @returns {Record<string, any>[]}
   */
  applyColumnFilters(rows, columns) {
    const columnSet = new Set(columns.map((item) => item.key));
    const activeFilters = Object.entries(this.state.columnFilters).filter(([key]) => columnSet.has(key));
    if (!activeFilters.length) return rows;
    if (rows === this.rows) {
      const index = this.getColumnIndex(columns);
      const filterColumns = activeFilters.map(([key, term]) => ({
        term,
        text: this.getIndexedText(index, key)
      }));
      const output2 = [];
      for (let i = 0; i < rows.length; i += 1) {
        let matches = true;
        for (const filterColumn of filterColumns) {
          if (!filterColumn.text[i].includes(filterColumn.term)) {
            matches = false;
            break;
          }
        }
        if (matches) output2.push(rows[i]);
      }
      return output2;
    }
    const output = [];
    for (const row of rows) {
      let matches = true;
      for (const [key, term] of activeFilters) {
        if (!String(row?.[key] ?? "").toLowerCase().includes(term)) {
          matches = false;
          break;
        }
      }
      if (matches) output.push(row);
    }
    return output;
  }
  /**
   * Filters rows using a case-insensitive contains match.
   *
   * @param {Record<string, any>[]} rows
   * @param {{ key: string }[]} columns
   * @returns {Record<string, any>[]}
   */
  applySearch(rows, columns) {
    if (!this.state.searchTerm) return rows;
    const keys = columns.map((column) => column.key);
    if (rows === this.rows) {
      const index = this.getColumnIndex(columns);
      const searchKeys = this.getSearchableKeys(index, keys, this.state.searchTerm);
      const searchColumns = searchKeys.map((key) => this.getIndexedText(index, key));
      const output2 = [];
      for (let i = 0; i < rows.length; i += 1) {
        let matches = false;
        for (const searchColumn of searchColumns) {
          if (searchColumn[i].includes(this.state.searchTerm)) {
            matches = true;
            break;
          }
        }
        if (matches) output2.push(rows[i]);
      }
      return output2;
    }
    const output = [];
    for (const row of rows) {
      let matches = false;
      for (const key of keys) {
        if (String(row?.[key] ?? "").toLowerCase().includes(this.state.searchTerm)) {
          matches = true;
          break;
        }
      }
      if (matches) output.push(row);
    }
    return output;
  }
  /**
   * Sorts rows by the active sort configuration.
   *
   * @param {Record<string, any>[]} rows
   * @param {{ key: string }[]} columns
   * @returns {Record<string, any>[]}
   */
  applySort(rows, columns) {
    return this.applySortWithCache(rows, columns);
  }
  /**
   * Invalidates cached row projections.
   *
   * @returns {void}
   */
  invalidateProjection() {
    this.revision += 1;
    this.projectionCache = null;
    this.sortComparatorCache = null;
  }
  /**
   * Invalidates cached filtered and projected rows.
   *
   * @returns {void}
   */
  invalidateFiltersAndProjection() {
    this.filterCache = null;
    this.invalidateProjection();
  }
  /**
   * Syncs worker shards with current source rows.
   *
   * @returns {void}
   */
  syncWorkerRows() {
    if (!this.projectionWorkerPool) return;
    this.projectionWorkerReady = this.projectionWorkerPool.setRows(this.rows).catch(() => {
      this.projectionWorkerPool?.destroy();
      this.projectionWorkerPool = null;
    });
  }
  /**
   * Returns whether current query should run in worker shards.
   *
   * @returns {boolean}
   */
  canUseWorkerProjection() {
    if (!this.projectionWorkerPool) return false;
    if (this.rows.length < this.parallel.threshold) return false;
    const hasFilters = Boolean(this.state.searchTerm) || Boolean(Object.keys(this.state.columnFilters).length);
    const hasSorts = Boolean(this.state.sorts.length);
    if (!hasFilters && !hasSorts) return false;
    return true;
  }
  /**
   * Disposes worker resources.
   *
   * @returns {void}
   */
  destroy() {
    this.projectionWorkerPool?.destroy();
    this.projectionWorkerPool = null;
  }
  /**
   * Returns sorted+filtered projection for current query state.
   *
   * @param {{ key: string }[]} columns
   * @returns {Record<string, any>[]}
   */
  getProjectedRows(columns) {
    const columnsKey = this.getColumnsKey(columns);
    if (this.projectionCache && this.projectionCache.revision === this.revision && this.projectionCache.columnsKey === columnsKey) {
      return this.projectionCache.rows;
    }
    const filtered = this.getFilteredRows(columns, columnsKey);
    const sorted = this.applySortWithCache(filtered, columns);
    if (!this.state.searchTerm && !Object.keys(this.state.columnFilters).length && this.rows.length > 2e4) {
      const index = this.getColumnIndex(columns);
      for (const column of columns) {
        this.getIndexedText(index, column.key);
        this.getIndexedNumeric(index, column.key);
        this.hasAlphaValues(index, column.key);
      }
    }
    this.projectionCache = {
      revision: this.revision,
      columnsKey,
      rows: sorted
    };
    return sorted;
  }
  /**
   * Returns sorted+filtered projection, optionally using worker projection.
   *
   * @param {{ key: string }[]} columns
   * @returns {Promise<Record<string, any>[]>}
   */
  getProjectedRowsAsync(columns) {
    const columnsKey = this.getColumnsKey(columns);
    if (this.projectionCache && this.projectionCache.revision === this.revision && this.projectionCache.columnsKey === columnsKey) {
      return Promise.resolve(this.projectionCache.rows);
    }
    if (this.canUseWorkerProjection()) {
      return this.getProjectedRowsFromWorkers(columns, columnsKey);
    }
    return this.getFilteredRowsWithWorkersAsync(columns, columnsKey).then((filtered) => {
      const sorted = this.applySortWithCache(filtered, columns);
      if (!this.state.searchTerm && !Object.keys(this.state.columnFilters).length && this.rows.length > 2e4) {
        const index = this.getColumnIndex(columns);
        for (const column of columns) {
          this.getIndexedText(index, column.key);
          this.getIndexedNumeric(index, column.key);
          this.hasAlphaValues(index, column.key);
        }
      }
      this.projectionCache = {
        revision: this.revision,
        columnsKey,
        rows: sorted
      };
      return sorted;
    });
  }
  /**
   * Returns projection rows computed by worker shards.
   *
   * @param {{ key: string }[]} columns
   * @param {string} columnsKey
   * @returns {Promise<Record<string, any>[]>}
   */
  getProjectedRowsFromWorkers(columns, columnsKey) {
    const searchTerm = this.state.searchTerm;
    const filtersKey = this.serializeActiveFilters(columns);
    return this.projectionWorkerReady.then(
      () => this.projectionWorkerPool.project({
        keys: columns.map((column) => column.key),
        searchTerm,
        columnFilters: this.state.columnFilters,
        sorts: this.state.sorts
      })
    ).then((indices) => {
      const rows = indices.map((index) => this.rows[index]).filter(Boolean);
      this.filterCache = {
        rowsVersion: this.rowsVersion,
        columnsKey,
        searchTerm,
        filtersKey,
        rows
      };
      this.projectionCache = {
        revision: this.revision,
        columnsKey,
        rows
      };
      return rows;
    }).catch(() => {
      this.projectionWorkerPool?.destroy();
      this.projectionWorkerPool = null;
      return Promise.resolve(this.getProjectedRows(columns));
    });
  }
  /**
   * Returns filtered rows for active filter/search state.
   *
   * @param {{ key: string }[]} columns
   * @param {string} columnsKey
   * @returns {Record<string, any>[]}
   */
  getFilteredRows(columns, columnsKey) {
    const searchTerm = this.state.searchTerm;
    const filtersKey = this.serializeActiveFilters(columns);
    if (this.filterCache && this.filterCache.rowsVersion === this.rowsVersion && this.filterCache.columnsKey === columnsKey && this.filterCache.searchTerm === searchTerm && this.filterCache.filtersKey === filtersKey) {
      return this.filterCache.rows;
    }
    const baseRows = this.resolveIncrementalBaseRows(columnsKey, searchTerm, filtersKey);
    const rows = this.applyFiltersAndSearch(baseRows, columns);
    this.filterCache = {
      rowsVersion: this.rowsVersion,
      columnsKey,
      searchTerm,
      filtersKey,
      rows
    };
    return rows;
  }
  /**
   * Returns filtered rows, using worker shards when configured.
   *
   * @param {{ key: string }[]} columns
   * @param {string} columnsKey
   * @returns {Promise<Record<string, any>[]>}
   */
  getFilteredRowsWithWorkersAsync(columns, columnsKey) {
    const searchTerm = this.state.searchTerm;
    const filtersKey = this.serializeActiveFilters(columns);
    if (this.filterCache && this.filterCache.rowsVersion === this.rowsVersion && this.filterCache.columnsKey === columnsKey && this.filterCache.searchTerm === searchTerm && this.filterCache.filtersKey === filtersKey) {
      return Promise.resolve(this.filterCache.rows);
    }
    if (!this.canUseWorkerProjection()) {
      const baseRows = this.resolveIncrementalBaseRows(columnsKey, searchTerm, filtersKey);
      const rows = this.applyFiltersAndSearch(baseRows, columns);
      this.filterCache = {
        rowsVersion: this.rowsVersion,
        columnsKey,
        searchTerm,
        filtersKey,
        rows
      };
      return Promise.resolve(rows);
    }
    return this.projectionWorkerReady.then(
      () => this.projectionWorkerPool.project({
        keys: columns.map((column) => column.key),
        searchTerm,
        columnFilters: this.state.columnFilters,
        sorts: []
      })
    ).then((indices) => {
      const rows = indices.map((index) => this.rows[index]).filter(Boolean);
      this.filterCache = {
        rowsVersion: this.rowsVersion,
        columnsKey,
        searchTerm,
        filtersKey,
        rows
      };
      return rows;
    }).catch(() => {
      this.projectionWorkerPool?.destroy();
      this.projectionWorkerPool = null;
      const baseRows = this.resolveIncrementalBaseRows(columnsKey, searchTerm, filtersKey);
      const rows = this.applyFiltersAndSearch(baseRows, columns);
      this.filterCache = {
        rowsVersion: this.rowsVersion,
        columnsKey,
        searchTerm,
        filtersKey,
        rows
      };
      return rows;
    });
  }
  /**
   * Applies column filters and global search in one pass.
   *
   * @param {Record<string, any>[]} rows
   * @param {{ key: string }[]} columns
   * @returns {Record<string, any>[]}
   */
  applyFiltersAndSearch(rows, columns) {
    const keys = columns.map((column) => column.key);
    const columnSet = new Set(keys);
    const activeFilters = Object.entries(this.state.columnFilters).filter(([key]) => columnSet.has(key));
    const searchTerm = this.state.searchTerm;
    if (!activeFilters.length && !searchTerm) return rows;
    if (rows === this.rows) {
      const index = this.getColumnIndex(columns);
      const filterColumns = activeFilters.map(([key, term]) => ({
        term,
        text: this.getIndexedText(index, key)
      }));
      const searchColumns = searchTerm ? this.getSearchableKeys(index, keys, searchTerm).map((key) => this.getIndexedText(index, key)) : null;
      const output2 = [];
      for (let i = 0; i < rows.length; i += 1) {
        let matchesFilters = true;
        for (const filterColumn of filterColumns) {
          if (!filterColumn.text[i].includes(filterColumn.term)) {
            matchesFilters = false;
            break;
          }
        }
        if (!matchesFilters) continue;
        if (!searchColumns) {
          output2.push(rows[i]);
          continue;
        }
        let matchesSearch = false;
        for (const searchColumn of searchColumns) {
          if (searchColumn[i].includes(searchTerm)) {
            matchesSearch = true;
            break;
          }
        }
        if (matchesSearch) output2.push(rows[i]);
      }
      return output2;
    }
    const output = [];
    for (const row of rows) {
      let matchesFilters = true;
      for (const [key, term] of activeFilters) {
        if (!String(row?.[key] ?? "").toLowerCase().includes(term)) {
          matchesFilters = false;
          break;
        }
      }
      if (!matchesFilters) continue;
      if (!searchTerm) {
        output.push(row);
        continue;
      }
      let matchesSearch = false;
      for (const key of keys) {
        if (String(row?.[key] ?? "").toLowerCase().includes(searchTerm)) {
          matchesSearch = true;
          break;
        }
      }
      if (matchesSearch) output.push(row);
    }
    return output;
  }
  /**
   * Applies sort rules using pre-normalized arrays and stable merge sort.
   *
   * @param {Record<string, any>[]} rows
   * @param {{ key: string }[]} columns
   * @returns {Record<string, any>[]}
   */
  applySortWithCache(rows, columns) {
    if (!this.state.sorts.length) return rows;
    const columnSet = new Set(columns.map((item) => item.key));
    const sorts = this.state.sorts.filter((item) => columnSet.has(item.key));
    if (!sorts.length) return rows;
    const rowCount = rows.length;
    const order = Array.from({ length: rowCount }).map((_, index) => index);
    const comparator = this.getCompiledSortComparator(columns, sorts, rows);
    if (rowCount < 5e3) {
      mergeSort(order, comparator);
    } else {
      order.sort(comparator);
    }
    const output = new Array(rowCount);
    for (let i = 0; i < rowCount; i += 1) {
      output[i] = rows[order[i]];
    }
    return output;
  }
  /**
   * Returns a narrowed base row set for incremental query updates when possible.
   *
   * @param {string} columnsKey
   * @param {string} searchTerm
   * @param {string} filtersKey
   * @returns {Record<string, any>[]}
   */
  resolveIncrementalBaseRows(columnsKey, searchTerm, filtersKey) {
    if (!this.filterCache) return this.rows;
    if (this.filterCache.rowsVersion !== this.rowsVersion) return this.rows;
    if (this.filterCache.columnsKey !== columnsKey) return this.rows;
    if (!isIncrementalRefinement(this.filterCache.searchTerm, searchTerm)) return this.rows;
    if (!isIncrementalFilterRefinement(this.filterCache.filtersKey, filtersKey)) return this.rows;
    return this.filterCache.rows;
  }
  /**
   * Returns a compiled row-index comparator for the current sort state.
   *
   * @param {{ key: string }[]} columns
   * @param {{ key: string, direction: 'asc'|'desc' }[]} sorts
   * @param {Record<string, any>[]} rows
   * @returns {(left: number, right: number) => number}
   */
  getCompiledSortComparator(columns, sorts, rows) {
    const columnsKey = this.getColumnsKey(columns);
    const sortsKey = serializeSorts(sorts);
    const index = this.getColumnIndex(columns);
    if (this.sortComparatorCache && this.sortComparatorCache.rowsVersion === this.rowsVersion && this.sortComparatorCache.columnsKey === columnsKey && this.sortComparatorCache.sortsKey === sortsKey) {
      return this.buildLocalComparator(this.sortComparatorCache.comparator, rows, index.rowIndex);
    }
    const sourceText = /* @__PURE__ */ new Map();
    const sourceNumeric = /* @__PURE__ */ new Map();
    for (const sort of sorts) {
      sourceText.set(sort.key, this.getIndexedText(index, sort.key));
      sourceNumeric.set(sort.key, this.getIndexedNumeric(index, sort.key));
    }
    const comparator = (leftSourceIndex, rightSourceIndex) => {
      for (const sort of sorts) {
        const numeric = sourceNumeric.get(sort.key);
        const text = sourceText.get(sort.key);
        const bothNumeric = numeric.flags[leftSourceIndex] && numeric.flags[rightSourceIndex];
        let cmp = 0;
        if (bothNumeric) {
          cmp = numeric.values[leftSourceIndex] - numeric.values[rightSourceIndex];
        } else {
          const leftText = text[leftSourceIndex];
          const rightText = text[rightSourceIndex];
          if (leftText < rightText) cmp = -1;
          else if (leftText > rightText) cmp = 1;
        }
        if (cmp !== 0) return sort.direction === "desc" ? -cmp : cmp;
      }
      return leftSourceIndex - rightSourceIndex;
    };
    this.sortComparatorCache = {
      rowsVersion: this.rowsVersion,
      columnsKey,
      sortsKey,
      comparator,
      sourceText,
      sourceNumeric
    };
    return this.buildLocalComparator(comparator, rows, index.rowIndex);
  }
  /**
   * Maps source-index comparator to local row-order comparator.
   *
   * @param {(leftSourceIndex: number, rightSourceIndex: number) => number} sourceComparator
   * @param {Record<string, any>[]} rows
   * @param {WeakMap<Record<string, any>, number>} rowIndex
   * @returns {(left: number, right: number) => number}
   */
  buildLocalComparator(sourceComparator, rows, rowIndex) {
    return (leftIndex, rightIndex) => {
      const leftSource = rowIndex.get(rows[leftIndex]);
      const rightSource = rowIndex.get(rows[rightIndex]);
      if (leftSource === void 0 || rightSource === void 0) {
        return leftIndex - rightIndex;
      }
      const cmp = sourceComparator(leftSource, rightSource);
      if (cmp !== 0) return cmp;
      return leftIndex - rightIndex;
    };
  }
  /**
   * Returns canonical key string for a column set.
   *
   * @param {{ key: string }[]} columns
   * @returns {string}
   */
  getColumnsKey(columns) {
    return columns.map((column) => column.key).join("|");
  }
  /**
   * Serializes active filters for cache keying.
   *
   * @param {{ key: string }[]} columns
   * @returns {string}
   */
  serializeActiveFilters(columns) {
    const columnSet = new Set(columns.map((item) => item.key));
    const active = Object.entries(this.state.columnFilters).filter(([key]) => columnSet.has(key)).sort(([leftKey], [rightKey]) => compareText(leftKey, rightKey));
    if (!active.length) return "";
    return active.map(([key, value]) => `${key}:${value}`).join("|");
  }
  /**
   * Returns normalized text index for current rows and columns.
   *
   * @param {{ key: string }[]} columns
   * @returns {{ rowsVersion: number, columnsKey: string, rows: Record<string, any>[], rowIndex: WeakMap<Record<string, any>, number>, textByKey: Map<string, string[]>, numericByKey: Map<string, { values: Float64Array, flags: Uint8Array }>, hasAlphaByKey: Map<string, boolean> }}
   */
  getColumnIndex(columns) {
    const columnsKey = this.getColumnsKey(columns);
    if (this.columnIndexCache && this.columnIndexCache.rowsVersion === this.rowsVersion && this.columnIndexCache.columnsKey === columnsKey && this.columnIndexCache.rows === this.rows) {
      return this.columnIndexCache;
    }
    const rowIndex = /* @__PURE__ */ new WeakMap();
    for (let i = 0; i < this.rows.length; i += 1) {
      rowIndex.set(this.rows[i], i);
    }
    this.columnIndexCache = {
      rowsVersion: this.rowsVersion,
      columnsKey,
      rows: this.rows,
      textByKey: /* @__PURE__ */ new Map(),
      rowIndex,
      numericByKey: /* @__PURE__ */ new Map(),
      hasAlphaByKey: /* @__PURE__ */ new Map()
    };
    return this.columnIndexCache;
  }
  /**
   * Returns normalized text values for one indexed column.
   *
   * @param {{ rows: Record<string, any>[], textByKey: Map<string, string[]> }} index
   * @param {string} key
   * @returns {string[]}
   */
  getIndexedText(index, key) {
    const cached = index.textByKey.get(key);
    if (cached) return cached;
    const values = new Array(index.rows.length);
    for (let i = 0; i < index.rows.length; i += 1) {
      values[i] = String(index.rows[i]?.[key] ?? "").toLowerCase();
    }
    index.textByKey.set(key, values);
    return values;
  }
  /**
   * Returns normalized numeric values and finite flags for one indexed column.
   *
   * @param {{ rows: Record<string, any>[], numericByKey: Map<string, { values: Float64Array, flags: Uint8Array }> }} index
   * @param {string} key
   * @returns {{ values: Float64Array, flags: Uint8Array }}
   */
  getIndexedNumeric(index, key) {
    const cached = index.numericByKey.get(key);
    if (cached) return cached;
    const values = new Float64Array(index.rows.length);
    const flags = new Uint8Array(index.rows.length);
    for (let i = 0; i < index.rows.length; i += 1) {
      const parsed = Number(index.rows[i]?.[key]);
      if (Number.isFinite(parsed)) {
        values[i] = parsed;
        flags[i] = 1;
      }
    }
    const next = { values, flags };
    index.numericByKey.set(key, next);
    return next;
  }
  /**
   * Returns search keys optimized for the current term.
   *
   * @param {{ hasAlphaByKey: Map<string, boolean> }} index
   * @param {string[]} keys
   * @param {string} term
   * @returns {string[]}
   */
  getSearchableKeys(index, keys, term) {
    if (!HAS_ALPHA_RE.test(term)) return keys;
    const filtered = keys.filter((key) => this.hasAlphaValues(index, key));
    return filtered.length ? filtered : keys;
  }
  /**
   * Returns whether a column can contain alphabetic characters.
   *
   * @param {{ hasAlphaByKey: Map<string, boolean> }} index
   * @param {string} key
   * @returns {boolean}
   */
  hasAlphaValues(index, key) {
    const cached = index.hasAlphaByKey.get(key);
    if (cached !== void 0) return cached;
    const values = this.getIndexedText(index, key);
    let hasAlpha = false;
    for (let i = 0; i < values.length; i += 1) {
      if (HAS_ALPHA_RE.test(values[i])) {
        hasAlpha = true;
        break;
      }
    }
    index.hasAlphaByKey.set(key, hasAlpha);
    return hasAlpha;
  }
};
function normalizePage(page) {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.floor(page));
}
function normalizePageSize2(pageSize) {
  if (!Number.isFinite(pageSize)) return 1;
  return Math.max(1, Math.floor(pageSize));
}
var HAS_ALPHA_RE = /[a-z]/;
function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
function isIncrementalRefinement(previous, next) {
  return next.startsWith(previous);
}
function isIncrementalFilterRefinement(previous, next) {
  if (!previous) return true;
  if (!next) return false;
  const previousEntries = previous.split("|").filter(Boolean);
  const nextEntries = new Map(next.split("|").filter(Boolean).map((entry) => {
    const separator = entry.indexOf(":");
    const key = separator >= 0 ? entry.slice(0, separator) : entry;
    const value = separator >= 0 ? entry.slice(separator + 1) : "";
    return [key, value];
  }));
  for (const entry of previousEntries) {
    const separator = entry.indexOf(":");
    const key = separator >= 0 ? entry.slice(0, separator) : entry;
    const value = separator >= 0 ? entry.slice(separator + 1) : "";
    const nextValue = nextEntries.get(key);
    if (typeof nextValue !== "string") return false;
    if (!nextValue.startsWith(value)) return false;
  }
  return true;
}
function serializeSorts(sorts) {
  return sorts.map((sort) => `${sort.key}:${sort.direction}`).join("|");
}
function mergeSort(items, compare) {
  const size = items.length;
  if (size < 2) return;
  const buffer = new Array(size);
  let width = 1;
  while (width < size) {
    for (let start = 0; start < size; start += width * 2) {
      const middle = Math.min(start + width, size);
      const end = Math.min(start + width * 2, size);
      let left = start;
      let right = middle;
      let write = start;
      while (left < middle && right < end) {
        if (compare(items[left], items[right]) <= 0) {
          buffer[write] = items[left];
          left += 1;
        } else {
          buffer[write] = items[right];
          right += 1;
        }
        write += 1;
      }
      while (left < middle) {
        buffer[write] = items[left];
        left += 1;
        write += 1;
      }
      while (right < end) {
        buffer[write] = items[right];
        right += 1;
        write += 1;
      }
    }
    for (let i = 0; i < size; i += 1) {
      items[i] = buffer[i];
    }
    width *= 2;
  }
}
function resolveParallelWorkers(input) {
  if (typeof input === "number" && Number.isFinite(input)) {
    return Math.max(1, Math.floor(input));
  }
  if (input === "auto" || input == null) {
    const cores = typeof navigator !== "undefined" && Number.isFinite(navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 4;
    return Math.max(2, Math.min(8, Math.floor(cores) - 1));
  }
  const numeric = Number(input);
  if (Number.isFinite(numeric)) {
    return Math.max(1, Math.floor(numeric));
  }
  return 4;
}

// src/utils/deep-merge.js
function deepMerge(base, extra) {
  const output = { ...base };
  for (const key of Object.keys(extra || {})) {
    const baseValue = output[key];
    const extraValue = extra[key];
    if (isObject(baseValue) && isObject(extraValue)) {
      output[key] = deepMerge(baseValue, extraValue);
    } else {
      output[key] = extraValue;
    }
  }
  return output;
}
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// src/utils/event-emitter.js
var EventEmitter = class {
  /**
   * Creates a new event emitter instance.
   */
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  /**
   * Registers an event callback.
   *
   * @param {string} event
   * @param {(payload: any) => void} callback
   * @returns {() => void}
   */
  on(event, callback) {
    const list = this.listeners.get(event) || [];
    list.push(callback);
    this.listeners.set(event, list);
    return () => this.off(event, callback);
  }
  /**
   * Removes an event callback.
   *
   * @param {string} event
   * @param {(payload: any) => void} callback
   * @returns {void}
   */
  off(event, callback) {
    const list = this.listeners.get(event);
    if (!list) return;
    this.listeners.set(
      event,
      list.filter((item) => item !== callback)
    );
  }
  /**
   * Emits an event payload to registered listeners.
   *
   * @param {string} event
   * @param {any} payload
   * @returns {void}
   */
  emit(event, payload) {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const callback of list) callback(payload);
  }
};

// src/core/data-sources/client-data-source.js
var ClientDataSource = class {
  /**
   * Creates a client data source instance.
   *
   * @param {{ store: import('../state-store.js').StateStore }} config
   */
  constructor({ store }) {
    this.store = store;
  }
  /**
   * Resolves table view data.
   *
   * @param {{ columns: { key: string }[] }} context
   * @returns {Promise<{ rows: Record<string, any>[], totalRows: number, totalPages: number }>}
   */
  getView({ columns }) {
    if (typeof this.store.getVisibleRowsAsync === "function" && typeof this.store.canUseWorkerProjection === "function" && this.store.canUseWorkerProjection()) {
      return this.store.getVisibleRowsAsync(columns);
    }
    return Promise.resolve(this.store.getVisibleRows(columns));
  }
};

// src/core/data-sources/server-data-source.js
var ServerDataSource = class {
  /**
   * Creates a server data source instance.
   *
   * @param {{ store: import('../state-store.js').StateStore, fetchData: Function | null, onLoadingChange: (loading: boolean) => void }} config
   */
  constructor({ store, fetchData, onLoadingChange }) {
    this.store = store;
    this.fetchData = fetchData;
    this.onLoadingChange = onLoadingChange;
  }
  /**
   * Resolves table view data.
   *
   * @returns {Promise<{ rows: Record<string, any>[], totalRows: number, totalPages: number }>}
   */
  getView() {
    if (typeof this.fetchData !== "function") {
      return Promise.reject(new Error("VanillaTable serverSide mode requires options.fetchData(query)."));
    }
    this.onLoadingChange(true);
    const query = this.store.getQuery();
    return Promise.resolve(this.fetchData(query)).then((response) => {
      const rows = Array.isArray(response?.rows) ? response.rows : [];
      const totalRows = Number(response?.totalRows || rows.length);
      this.store.setRows(rows);
      return {
        rows,
        totalRows,
        totalPages: Math.max(1, Math.ceil(totalRows / this.store.state.pageSize))
      };
    }).finally(() => {
      this.onLoadingChange(false);
    });
  }
};

// src/core/data-sources/create-data-source.js
function createDataSource({ options, store, onLoadingChange }) {
  if (options.serverSide) {
    return new ServerDataSource({
      store,
      fetchData: options.fetchData,
      onLoadingChange
    });
  }
  return new ClientDataSource({ store });
}

// src/core/sync/state-sync.js
var StateSync = class {
  /**
   * Creates state sync instance.
   *
   * @param {{ persistence: { enabled: boolean, storageKey: string | null }, urlSync: { enabled: boolean, param: string }, tableId: string }} config
   */
  constructor({ persistence, urlSync, tableId }) {
    this.persistence = persistence;
    this.urlSync = urlSync;
    this.tableId = tableId;
  }
  /**
   * Loads stored or URL state payload.
   *
   * @returns {Record<string, any>}
   */
  load() {
    const fromUrl = this.loadFromUrl();
    const fromStorage = this.loadFromStorage();
    return {
      ...fromStorage,
      ...fromUrl
    };
  }
  /**
   * Persists state to configured sinks.
   *
   * @param {Record<string, any>} state
   * @returns {void}
   */
  save(state) {
    if (this.persistence.enabled) {
      this.saveToStorage(state);
    }
    if (this.urlSync.enabled) {
      this.saveToUrl(state);
    }
  }
  /**
   * Loads state from local storage.
   *
   * @returns {Record<string, any>}
   */
  loadFromStorage() {
    if (!this.persistence.enabled || typeof window === "undefined") return {};
    const key = this.getStorageKey();
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  /**
   * Saves state to local storage.
   *
   * @param {Record<string, any>} state
   * @returns {void}
   */
  saveToStorage(state) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.getStorageKey(), JSON.stringify(state));
    } catch {
    }
  }
  /**
   * Loads state payload from URL param.
   *
   * @returns {Record<string, any>}
   */
  loadFromUrl() {
    if (!this.urlSync.enabled || typeof window === "undefined") return {};
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get(this.urlSync.param || "vt");
      if (!encoded) return {};
      const json = decodeURIComponent(encoded);
      const parsed = JSON.parse(json);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  /**
   * Saves state payload to URL param.
   *
   * @param {Record<string, any>} state
   * @returns {void}
   */
  saveToUrl(state) {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      params.set(this.urlSync.param || "vt", encodeURIComponent(JSON.stringify(state)));
      const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    } catch {
    }
  }
  /**
   * Returns storage key.
   *
   * @returns {string}
   */
  getStorageKey() {
    return this.persistence.storageKey || `vanilla-tables:${this.tableId}`;
  }
};

// src/core/vanilla-table.js
var VanillaTable = class {
  /**
   * Creates a table instance.
   *
   * @param {HTMLElement} element
   * @param {Record<string, any>[]} rows
   * @param {Record<string, any>} [options]
   */
  constructor(element, rows, options = {}) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("VanillaTable requires a valid HTMLElement as first argument.");
    }
    this.root = element;
    this.rows = Array.isArray(rows) ? rows : [];
    this.options = deepMerge(defaultOptions, options);
    this.options.i18n = {
      ...defaultOptions.i18n,
      ...this.options.i18n || {}
    };
    this.options.labels = {
      ...this.options.labels,
      search: this.options.i18n.search || this.options.labels.search,
      filter: this.options.i18n.filter || this.options.labels.filter,
      rows: this.options.i18n.rows || this.options.labels.rows,
      actions: this.options.i18n.actions || this.options.labels.actions,
      loading: this.options.i18n.loading || this.options.labels.loading,
      empty: this.options.i18n.empty || this.options.labels.empty,
      first: this.options.i18n.first || this.options.labels.first,
      prev: this.options.i18n.prev || this.options.labels.prev,
      next: this.options.i18n.next || this.options.labels.next,
      last: this.options.i18n.last || this.options.labels.last,
      pageInfo: typeof this.options.i18n.pageInfo === "string" ? ({ page, totalPages, totalRows }) => this.options.i18n.pageInfo.replace("{page}", String(page)).replace("{totalPages}", String(totalPages)).replace("{totalRows}", String(totalRows)) : this.options.labels.pageInfo
    };
    if (!this.options.columns.length) {
      this.options.columns = inferColumns(this.rows);
    }
    this.events = new EventEmitter();
    this.hooks = {};
    this.store = new StateStore({
      rows: this.rows,
      pageSize: this.options.pageSize,
      initialSort: this.options.initialSort,
      parallel: this.options.parallel
    });
    const initialOrder = this.options.columns.map((column) => column.key);
    this.store.setColumnOrder(initialOrder);
    this.renderer = new Renderer({ root: element, options: this.options, hooks: this.hooks });
    this.dataSource = createDataSource({
      options: this.options,
      store: this.store,
      onLoadingChange: (loading) => this.handleLoadingChange(loading)
    });
    this.stateSync = new StateSync({
      persistence: this.options.persistence,
      urlSync: this.options.urlSync,
      tableId: this.getTableId()
    });
    this.expandedRowIds = /* @__PURE__ */ new Set();
    this.searchTimer = null;
    this.loading = false;
    this.lastView = { rows: [], totalRows: 0, totalPages: 1 };
    this.lastAnimationFrame = null;
    this.virtualization = {
      enabled: Boolean(this.options.virtualScroll.enabled),
      start: 0,
      end: this.options.pageSize,
      rowHeight: this.options.virtualScroll.rowHeight
    };
    this.columnVirtualization = {
      enabled: Boolean(this.options.virtualColumns?.enabled),
      start: 0,
      end: this.options.columns.length,
      leftWidth: 0,
      rightWidth: 0,
      totalColumns: this.options.columns.length
    };
    this.scrollProfile = {
      lastTop: 0,
      lastAt: 0,
      dynamicOverscan: this.options.virtualScroll.overscan
    };
    this.applySyncedState();
  }
  /**
   * Initializes DOM and listeners.
   *
   * @returns {VanillaTable}
   */
  init() {
    this.renderer.mount();
    this.bindEvents();
    void this.refresh();
    this.emitEvent("init", { instance: this });
    return this;
  }
  /**
   * Re-renders current state to the DOM.
   *
   * @returns {Promise<void>}
   */
  refresh() {
    let columns = this.store.getVisibleColumns(this.store.getOrderedColumns(this.options.columns));
    return this.dataSource.getView({ columns }).then((view) => {
      if (!columns.length && view.rows.length) {
        this.options.columns = inferColumns(view.rows);
        this.store.setColumnOrder(this.options.columns.map((column) => column.key));
        columns = this.store.getVisibleColumns(this.store.getOrderedColumns(this.options.columns));
      }
      if (this.store.state.page > view.totalPages) {
        this.store.setPage(view.totalPages);
        return this.refresh();
      }
      this.lastView = view;
      this.virtualization = this.computeVirtualWindow(view.rows.length);
      this.columnVirtualization = this.computeColumnWindow(columns);
      this.renderer.renderHeader(columns, this.store.state.sorts, this.store.state.columnFilters, this.store.state.columnWidths, this.columnVirtualization);
      this.renderer.renderBody(columns, view.rows, {
        expandedRowIds: this.expandedRowIds,
        getRowId: (row, index) => this.getRowId(row, index),
        expandRow: this.options.expandRow,
        editableRows: this.options.editableRows,
        editableColumns: this.options.editableColumns,
        columnWidths: this.store.state.columnWidths,
        virtualization: this.virtualization,
        columnWindow: this.columnVirtualization
      });
      this.renderer.renderFooter({
        page: this.store.state.page,
        totalPages: view.totalPages,
        totalRows: view.totalRows,
        loading: this.loading
      });
      this.renderer.refs.table?.setAttribute("aria-rowcount", String(view.totalRows));
      this.persistState();
      this.emitEvent("change", { state: this.getState(), view });
      this.emitEvent("state:change", this.getState());
    }).catch((error) => {
      this.emitEvent("error", { error });
    });
  }
  /**
   * Handles data loading state transitions.
   *
   * @param {boolean} loading
   * @returns {void}
   */
  handleLoadingChange(loading) {
    this.loading = loading;
    this.renderer.renderFooter({
      page: this.store.state.page,
      totalPages: 1,
      totalRows: 0,
      loading
    });
    this.emitEvent("loading:change", { loading });
  }
  /**
   * Attaches DOM event handlers.
   *
   * @returns {void}
   */
  bindEvents() {
    this.bindSearchEvents();
    this.bindSortEvents();
    this.bindFilterEvents();
    this.bindPaginationEvents();
    this.bindExpandEvents();
    this.bindEditEvents();
    this.bindActionEvents();
    this.bindColumnResizeEvents();
    this.bindColumnReorderEvents();
    this.bindVirtualScrollEvents();
    this.bindKeyboardA11yEvents();
  }
  /**
   * Attaches search input handlers.
   *
   * @returns {void}
   */
  bindSearchEvents() {
    this.renderer.refs.search?.addEventListener("input", (event) => {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      const applySearch = () => {
        this.store.setSearchTerm(event.target.value);
        this.emitEvent("search:change", { term: this.store.state.searchTerm });
        this.scheduleRefresh(false);
      };
      if (this.options.debounceMs <= 0) {
        applySearch();
        return;
      }
      this.searchTimer = setTimeout(applySearch, this.options.debounceMs);
    });
  }
  /**
   * Attaches sort handlers.
   *
   * @returns {void}
   */
  bindSortEvents() {
    this.renderer.refs.thead?.addEventListener("click", (event) => {
      const button = event.target.closest(".vt-sort-trigger");
      if (!button || button.disabled) return;
      this.store.toggleSort(button.dataset.key, this.options.multiSort && event.shiftKey, this.options.maxSorts);
      this.emitEvent("sort:change", { sorts: [...this.store.state.sorts] });
      void this.refresh();
    });
  }
  /**
   * Attaches filter handlers.
   *
   * @returns {void}
   */
  bindFilterEvents() {
    this.renderer.refs.thead?.addEventListener("input", (event) => {
      const input = event.target.closest(".vt-column-filter");
      if (!input) return;
      this.store.setColumnFilter(input.dataset.key, input.value);
      this.emitEvent("filter:change", {
        key: input.dataset.key,
        value: this.store.state.columnFilters[input.dataset.key] || ""
      });
      this.scheduleRefresh(false);
    });
  }
  /**
   * Attaches pagination handlers.
   *
   * @returns {void}
   */
  bindPaginationEvents() {
    this.renderer.refs.pageSize?.addEventListener("change", (event) => {
      this.store.setPageSize(Number(event.target.value));
      this.emitEvent("pagesize:change", { pageSize: this.store.state.pageSize });
      void this.refresh();
    });
    this.renderer.refs.prev?.addEventListener("click", () => {
      this.store.setPage(this.store.state.page - 1);
      this.emitEvent("page:change", { page: this.store.state.page });
      void this.refresh();
    });
    this.renderer.refs.next?.addEventListener("click", () => {
      this.store.setPage(this.store.state.page + 1);
      this.emitEvent("page:change", { page: this.store.state.page });
      void this.refresh();
    });
    this.renderer.refs.first?.addEventListener("click", () => {
      this.store.setPage(1);
      this.emitEvent("page:change", { page: this.store.state.page });
      void this.refresh();
    });
    this.renderer.refs.last?.addEventListener("click", () => {
      this.store.setPage(this.lastView.totalPages || 1);
      this.emitEvent("page:change", { page: this.store.state.page });
      void this.refresh();
    });
  }
  /**
   * Attaches row expansion handlers.
   *
   * @returns {void}
   */
  bindExpandEvents() {
    this.renderer.refs.tbody?.addEventListener("click", (event) => {
      const trigger = event.target.closest(".vt-expand-trigger");
      if (!trigger) return;
      const rowId = trigger.dataset.rowId;
      this.toggleRow(rowId);
    });
  }
  /**
   * Attaches inline edit handlers.
   *
   * @returns {void}
   */
  bindEditEvents() {
    this.renderer.refs.tbody?.addEventListener("dblclick", (event) => {
      if (!this.options.editableRows) return;
      const cell = event.target.closest(".vt-cell-editable");
      if (!cell || cell.querySelector("input")) return;
      const rowId = cell.dataset.rowId;
      const key = cell.dataset.key;
      const row = this.findRowById(rowId);
      if (!row) return;
      const input = document.createElement("input");
      input.type = "text";
      input.value = String(row[key] ?? "");
      input.className = "vt-inline-input";
      cell.innerHTML = "";
      cell.appendChild(input);
      input.focus();
      const submit = () => {
        row[key] = input.value;
        this.emitEvent("edit", { rowId, row, key, value: input.value });
        this.emitEvent("row:edit", { rowId, row, key, value: input.value });
        void this.refresh();
      };
      input.addEventListener("blur", submit, { once: true });
      input.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Enter") {
          input.blur();
        }
      });
    });
  }
  /**
   * Attaches row action handlers.
   *
   * @returns {void}
   */
  bindActionEvents() {
    this.renderer.refs.tbody?.addEventListener("click", (event) => {
      const actionButton = event.target.closest(".vt-action-btn");
      if (!actionButton) return;
      const rowId = actionButton.dataset.rowId;
      const actionId = actionButton.dataset.actionId;
      const row = this.findRowById(rowId);
      const action = this.options.rowActions.find((item) => item.id === actionId);
      if (!action || !row) return;
      Promise.resolve(action.onClick ? action.onClick({ row, rowId, actionId, table: this, event }) : null).finally(() => {
        this.emitEvent("row:action", { row, rowId, actionId });
      });
    });
  }
  /**
   * Attaches column resize handlers.
   *
   * @returns {void}
   */
  bindColumnResizeEvents() {
    if (!this.options.columnResize) return;
    this.renderer.refs.thead?.addEventListener("mousedown", (event) => {
      const handle = event.target.closest(".vt-resize-handle");
      if (!handle) return;
      event.preventDefault();
      const key = handle.dataset.key;
      const startX = event.clientX;
      const startWidth = this.store.state.columnWidths[key] || this.renderer.refs.thead.querySelector(`th[data-key="${key}"]`)?.getBoundingClientRect().width || 180;
      const onMove = (moveEvent) => {
        const nextWidth = startWidth + (moveEvent.clientX - startX);
        this.store.setColumnWidth(key, nextWidth);
        this.emitEvent("column:resize", { key, width: this.store.state.columnWidths[key] });
        void this.refresh();
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        this.persistState();
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });
  }
  /**
   * Attaches column reorder handlers.
   *
   * @returns {void}
   */
  bindColumnReorderEvents() {
    if (!this.options.columnReorder) return;
    let draggingKey = null;
    this.renderer.refs.thead?.addEventListener("dragstart", (event) => {
      const th = event.target.closest("th[data-key]");
      if (!th) return;
      draggingKey = th.dataset.key;
      event.dataTransfer.effectAllowed = "move";
    });
    this.renderer.refs.thead?.addEventListener("dragover", (event) => {
      if (!draggingKey) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    this.renderer.refs.thead?.addEventListener("drop", (event) => {
      if (!draggingKey) return;
      event.preventDefault();
      const targetTh = event.target.closest("th[data-key]");
      if (!targetTh) return;
      const targetKey = targetTh.dataset.key;
      if (!targetKey || targetKey === draggingKey) return;
      const current = this.store.getOrderedColumns(this.options.columns).map((column) => column.key);
      const next = current.filter((key) => key !== draggingKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, draggingKey);
      this.store.setColumnOrder(next);
      this.emitEvent("column:reorder", { order: next });
      void this.refresh();
      draggingKey = null;
    });
    this.renderer.refs.thead?.addEventListener("dragend", () => {
      draggingKey = null;
    });
  }
  /**
   * Attaches virtual scroll handlers.
   *
   * @returns {void}
   */
  bindVirtualScrollEvents() {
    if (!this.options.virtualScroll.enabled && !this.options.virtualColumns?.enabled) return;
    this.renderer.refs.tableWrap?.addEventListener("scroll", () => {
      const wrap = this.renderer.refs.tableWrap;
      if (this.options.virtualScroll.adaptiveOverscan && wrap) {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const deltaTop = Math.abs(wrap.scrollTop - this.scrollProfile.lastTop);
        const deltaTime = Math.max(1, now - this.scrollProfile.lastAt);
        const velocity = deltaTop / deltaTime;
        const boost = Math.min(20, Math.floor(velocity * 16));
        this.scrollProfile.dynamicOverscan = Math.max(this.options.virtualScroll.overscan, this.options.virtualScroll.overscan + boost);
        this.scrollProfile.lastTop = wrap.scrollTop;
        this.scrollProfile.lastAt = now;
      }
      if (this.lastAnimationFrame) {
        cancelAnimationFrame(this.lastAnimationFrame);
      }
      this.lastAnimationFrame = requestAnimationFrame(() => {
        this.scheduleRefresh(true);
      });
    });
  }
  /**
   * Schedules one refresh using animation or idle callbacks.
   *
   * @param {boolean} urgent
   * @returns {void}
   */
  scheduleRefresh(urgent) {
    if (urgent || typeof requestIdleCallback !== "function") {
      void this.refresh();
      return;
    }
    requestIdleCallback(() => {
      void this.refresh();
    });
  }
  /**
   * Attaches keyboard accessibility handlers.
   *
   * @returns {void}
   */
  bindKeyboardA11yEvents() {
    this.renderer.refs.thead?.addEventListener("keydown", (event) => {
      const resizeHandle = event.target.closest(".vt-resize-handle");
      if (resizeHandle && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const key = resizeHandle.dataset.key;
        const current = this.store.state.columnWidths[key] || 180;
        const delta = event.key === "ArrowLeft" ? -16 : 16;
        this.setColumnWidth(key, current + delta);
        return;
      }
      const th = event.target.closest("th[data-key]");
      if (!th || !this.options.columnReorder) return;
      if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const currentOrder = this.store.getOrderedColumns(this.options.columns).map((column) => column.key);
        const key = th.dataset.key;
        const index = currentOrder.indexOf(key);
        if (index < 0) return;
        const targetIndex = event.key === "ArrowLeft" ? Math.max(0, index - 1) : Math.min(currentOrder.length - 1, index + 1);
        if (targetIndex === index) return;
        const next = [...currentOrder];
        next.splice(index, 1);
        next.splice(targetIndex, 0, key);
        this.reorderColumns(next);
      }
    });
  }
  /**
   * Sets table data and refreshes.
   *
   * @param {Record<string, any>[]} rows
   * @returns {Promise<void>}
   */
  setData(rows) {
    this.rows = Array.isArray(rows) ? rows : [];
    this.store.setRows(this.rows);
    this.store.setPage(1);
    this.emitEvent("data:set", { count: this.rows.length });
    return this.refresh();
  }
  /**
   * Adds one row.
   *
   * @param {Record<string, any>} row
   * @returns {Promise<void>}
   */
  addRow(row) {
    this.store.setRows([...this.store.rows, row]);
    this.emitEvent("data:add", { row });
    return this.refresh();
  }
  /**
   * Removes one row by identifier.
   *
   * @param {string} rowId
   * @returns {Promise<void>}
   */
  removeRowById(rowId) {
    this.store.setRows(this.store.rows.filter((row, index) => this.getRowId(row, index) !== String(rowId)));
    this.emitEvent("data:remove", { rowId });
    return this.refresh();
  }
  /**
   * Sets global search term.
   *
   * @param {string} term
   * @returns {Promise<void>}
   */
  search(term) {
    this.store.setSearchTerm(term);
    this.emitEvent("search:change", { term: this.store.state.searchTerm });
    return this.refresh();
  }
  /**
   * Sets one column filter.
   *
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   */
  filterBy(key, value) {
    this.store.setColumnFilter(key, value);
    this.emitEvent("filter:change", { key, value: this.store.state.columnFilters[key] || "" });
    return this.refresh();
  }
  /**
   * Clears all filters.
   *
   * @returns {Promise<void>}
   */
  clearFilters() {
    this.store.clearFilters();
    this.emitEvent("filter:clear", {});
    return this.refresh();
  }
  /**
   * Sets one sort rule.
   *
   * @param {string} key
   * @param {'asc'|'desc'} [direction]
   * @param {boolean} [additive]
   * @returns {Promise<void>}
   */
  sortBy(key, direction = "asc", additive = false) {
    if (!additive) {
      this.store.setSorts([{ key, direction }]);
    } else {
      const next = [...this.store.state.sorts.filter((item) => item.key !== key), { key, direction }];
      this.store.setSorts(next.slice(-this.options.maxSorts));
    }
    this.emitEvent("sort:change", { sorts: [...this.store.state.sorts] });
    return this.refresh();
  }
  /**
   * Clears sort state.
   *
   * @returns {Promise<void>}
   */
  clearSort() {
    this.store.clearSorts();
    this.emitEvent("sort:clear", {});
    return this.refresh();
  }
  /**
   * Goes to one page.
   *
   * @param {number} page
   * @returns {Promise<void>}
   */
  goToPage(page) {
    this.store.setPage(page);
    this.emitEvent("page:change", { page: this.store.state.page });
    return this.refresh();
  }
  /**
   * Sets page size.
   *
   * @param {number} pageSize
   * @returns {Promise<void>}
   */
  setPageSize(pageSize) {
    this.store.setPageSize(pageSize);
    this.emitEvent("pagesize:change", { pageSize: this.store.state.pageSize });
    return this.refresh();
  }
  /**
   * Expands one row.
   *
   * @param {string} rowId
   * @returns {Promise<void>}
   */
  expandRow(rowId) {
    this.expandedRowIds.add(String(rowId));
    this.emitEvent("row:expand", { rowId: String(rowId) });
    return this.refresh();
  }
  /**
   * Collapses one row.
   *
   * @param {string} rowId
   * @returns {Promise<void>}
   */
  collapseRow(rowId) {
    this.expandedRowIds.delete(String(rowId));
    this.emitEvent("row:collapse", { rowId: String(rowId) });
    return this.refresh();
  }
  /**
   * Toggles one row expansion state.
   *
   * @param {string} rowId
   * @returns {Promise<void>}
   */
  toggleRow(rowId) {
    const normalized = String(rowId);
    if (this.expandedRowIds.has(normalized)) {
      return this.collapseRow(normalized);
    }
    return this.expandRow(normalized);
  }
  /**
   * Expands all current rows.
   *
   * @returns {Promise<void>}
   */
  expandAllRows() {
    this.store.rows.forEach((row, index) => {
      this.expandedRowIds.add(this.getRowId(row, index));
    });
    this.emitEvent("row:expandAll", {});
    return this.refresh();
  }
  /**
   * Collapses all rows.
   *
   * @returns {Promise<void>}
   */
  collapseAllRows() {
    this.expandedRowIds.clear();
    this.emitEvent("row:collapseAll", {});
    return this.refresh();
  }
  /**
   * Updates one cell value.
   *
   * @param {string} rowId
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  updateCell(rowId, key, value) {
    const row = this.findRowById(String(rowId));
    if (!row) return Promise.resolve();
    row[key] = value;
    this.emitEvent("edit", { rowId: String(rowId), row, key, value });
    this.emitEvent("row:edit", { rowId: String(rowId), row, key, value });
    return this.refresh();
  }
  /**
   * Sets editable mode for one column.
   *
   * @param {string} key
   * @param {boolean} editable
   * @returns {Promise<void>}
   */
  setColumnEditable(key, editable) {
    this.options.columns = this.options.columns.map((column) => column.key === key ? { ...column, editable } : column);
    this.options.editableColumns[key] = editable;
    this.emitEvent("column:editable", { key, editable });
    return this.refresh();
  }
  /**
   * Sets one column width.
   *
   * @param {string} key
   * @param {number} width
   * @returns {Promise<void>}
   */
  setColumnWidth(key, width) {
    this.store.setColumnWidth(key, width);
    this.emitEvent("column:resize", { key, width: this.store.state.columnWidths[key] });
    return this.refresh();
  }
  /**
   * Reorders columns by key array.
   *
   * @param {string[]} order
   * @returns {Promise<void>}
   */
  reorderColumns(order) {
    this.store.setColumnOrder(order);
    this.emitEvent("column:reorder", { order: [...order] });
    return this.refresh();
  }
  /**
   * Sets visibility for one column.
   *
   * @param {string} key
   * @param {boolean} visible
   * @returns {Promise<void>}
   */
  setColumnVisibility(key, visible) {
    this.store.setColumnVisibility(key, visible);
    this.emitEvent("column:visibility", { key, visible: Boolean(visible) });
    return this.refresh();
  }
  /**
   * Toggles visibility for one column.
   *
   * @param {string} key
   * @returns {Promise<void>}
   */
  toggleColumnVisibility(key) {
    const next = this.store.state.columnVisibility[key] === false;
    return this.setColumnVisibility(key, next);
  }
  /**
   * Applies theme classes and re-renders.
   *
   * @param {Record<string, string>} classes
   * @returns {Promise<VanillaTable>}
   */
  setThemeClasses(classes) {
    this.options.themeClasses = {
      ...this.options.themeClasses,
      ...classes || {}
    };
    this.renderer.setOptions(this.options);
    this.renderer.mount();
    this.bindEvents();
    return this.refresh().then(() => this);
  }
  /**
   * Returns current serializable state.
   *
   * @returns {Record<string, any>}
   */
  getState() {
    return {
      ...this.store.getState(),
      expandedRowIds: [...this.expandedRowIds]
    };
  }
  /**
   * Applies one state payload.
   *
   * @param {Record<string, any>} payload
   * @returns {Promise<void>}
   */
  setState(payload) {
    this.store.setState(payload);
    if (Array.isArray(payload?.expandedRowIds)) {
      this.expandedRowIds = new Set(payload.expandedRowIds.map((value) => String(value)));
    }
    return this.refresh();
  }
  /**
   * Returns latest view payload.
   *
   * @returns {{ rows: Record<string, any>[], totalRows: number, totalPages: number }}
   */
  getView() {
    return this.lastView;
  }
  /**
   * Returns all current source rows.
   *
   * @returns {Record<string, any>[]}
   */
  getRows() {
    return this.store.rows;
  }
  /**
   * Subscribes to lifecycle events.
   *
   * @param {string} event
   * @param {(payload: any) => void} callback
   * @returns {() => void}
   */
  on(event, callback) {
    return this.events.on(event, callback);
  }
  /**
   * Applies a plugin function to the instance.
   *
   * @param {(table: VanillaTable) => void} plugin
   * @returns {VanillaTable}
   */
  use(plugin) {
    plugin(this);
    return this;
  }
  /**
   * Registers a render lifecycle hook.
   *
   * @param {string} name
   * @param {(context: any) => void} callback
   * @returns {VanillaTable}
   */
  registerHook(name, callback) {
    this.hooks[name] = callback;
    return this;
  }
  /**
   * Clears rendered markup and emits destroy event.
   *
   * @returns {void}
   */
  destroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    if (this.lastAnimationFrame) {
      cancelAnimationFrame(this.lastAnimationFrame);
      this.lastAnimationFrame = null;
    }
    this.store.destroy();
    this.root.innerHTML = "";
    this.emitEvent("destroy", {});
  }
  /**
   * Resolves a row identifier.
   *
   * @param {Record<string, any>} row
   * @param {number} index
   * @returns {string}
   */
  getRowId(row, index) {
    const value = row[this.options.rowIdKey];
    return String(value ?? `${index}`);
  }
  /**
   * Finds a row by string identifier.
   *
   * @param {string} rowId
   * @returns {Record<string, any> | undefined}
   */
  findRowById(rowId) {
    return this.store.rows.find((row, index) => this.getRowId(row, index) === rowId);
  }
  /**
   * Emits one event payload.
   *
   * @param {string} event
   * @param {any} payload
   * @returns {void}
   */
  emitEvent(event, payload) {
    this.events.emit(event, payload);
    if (this.options.events.debug && typeof console !== "undefined") {
      console.debug(`[vanilla-tables] ${event}`, payload);
    }
  }
  /**
   * Persists current state via configured sync backends.
   *
   * @returns {void}
   */
  persistState() {
    this.stateSync.save(this.getState());
  }
  /**
   * Applies synced state from storage and URL.
   *
   * @returns {void}
   */
  applySyncedState() {
    const synced = this.stateSync.load();
    this.store.setState(synced);
    if (Array.isArray(synced?.expandedRowIds)) {
      this.expandedRowIds = new Set(synced.expandedRowIds.map((value) => String(value)));
    }
  }
  /**
   * Computes virtual scroll window.
   *
   * @param {number} totalRows
   * @returns {{ enabled: boolean, start: number, end: number, rowHeight: number }}
   */
  computeVirtualWindow(totalRows) {
    if (!this.options.virtualScroll.enabled || !this.renderer.refs.tableWrap) {
      return {
        enabled: false,
        start: 0,
        end: totalRows,
        rowHeight: this.options.virtualScroll.rowHeight
      };
    }
    const wrap = this.renderer.refs.tableWrap;
    const rowHeight = this.options.virtualScroll.rowHeight;
    const overscan = this.options.virtualScroll.adaptiveOverscan ? this.scrollProfile.dynamicOverscan : this.options.virtualScroll.overscan;
    const visibleCount = Math.ceil((wrap.clientHeight || this.options.virtualScroll.height) / rowHeight);
    const start = Math.max(0, Math.floor(wrap.scrollTop / rowHeight) - overscan);
    const end = Math.min(totalRows, start + visibleCount + overscan * 2);
    return {
      enabled: true,
      start,
      end,
      rowHeight
    };
  }
  /**
   * Computes virtual column window.
   *
   * @param {{ key: string }[]} columns
   * @returns {{ enabled: boolean, start: number, end: number, leftWidth: number, rightWidth: number, totalColumns: number }}
   */
  computeColumnWindow(columns) {
    if (!this.options.virtualColumns?.enabled || !this.renderer.refs.tableWrap) {
      return {
        enabled: false,
        start: 0,
        end: columns.length,
        leftWidth: 0,
        rightWidth: 0,
        totalColumns: columns.length
      };
    }
    const wrap = this.renderer.refs.tableWrap;
    const defaultWidth = Math.max(40, Number(this.options.virtualColumns.width || 180));
    const overscan = Math.max(0, Number(this.options.virtualColumns.overscan || 0));
    const widths = columns.map((column) => this.store.state.columnWidths[column.key] || defaultWidth);
    const targetStart = wrap.scrollLeft;
    const targetEnd = wrap.scrollLeft + wrap.clientWidth;
    let acc = 0;
    let firstVisible = 0;
    while (firstVisible < widths.length && acc + widths[firstVisible] < targetStart) {
      acc += widths[firstVisible];
      firstVisible += 1;
    }
    let accEnd = acc;
    let lastVisible = firstVisible;
    while (lastVisible < widths.length && accEnd < targetEnd) {
      accEnd += widths[lastVisible];
      lastVisible += 1;
    }
    const start = Math.max(0, firstVisible - overscan);
    const end = Math.min(widths.length, lastVisible + overscan);
    const leftWidth = widths.slice(0, start).reduce((sum, value) => sum + value, 0);
    const rightWidth = widths.slice(end).reduce((sum, value) => sum + value, 0);
    return {
      enabled: true,
      start,
      end,
      leftWidth,
      rightWidth,
      totalColumns: columns.length
    };
  }
  /**
   * Resolves a stable table id used for state sync.
   *
   * @returns {string}
   */
  getTableId() {
    if (this.root.id) return this.root.id;
    const token = Math.random().toString(36).slice(2, 10);
    return `vt-${token}`;
  }
};
function inferColumns(rows) {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    editable: true
  }));
}

// src/plugins/striped-rows.js
function stripedRowsPlugin(options = {}) {
  const className = options.className || "vt-row-striped";
  return (table) => {
    table.registerHook("afterRowRender", ({ element }) => {
      const index = Array.from(element.parentElement.children).indexOf(element);
      if (index % 2 === 1) {
        element.classList.add(className);
      }
    });
  };
}

// src/plugins/theme-plugin.js
function themePlugin(classes) {
  return (table) => {
    table.setThemeClasses(classes || {});
  };
}

// src/plugins/bootstrap-theme.js
function bootstrapThemePlugin() {
  return themePlugin({
    shell: "border-0 rounded-0 bg-transparent",
    controls: "d-flex flex-wrap gap-2 align-items-center justify-content-between w-100",
    searchWrap: "d-inline-flex align-items-center gap-2",
    sizeWrap: "d-inline-flex align-items-center gap-2",
    searchInput: "form-control form-control-sm",
    sizeSelect: "form-select form-select-sm",
    tableWrap: "table-responsive",
    table: "table table-hover table-striped mb-0",
    sortTrigger: "btn btn-sm p-0 border-0 bg-transparent text-body fw-semibold",
    actionHeader: "text-body fw-semibold small",
    columnFilter: "form-control form-control-sm",
    actionSelect: "form-select form-select-sm w-auto",
    actionButton: "btn btn-outline-secondary btn-sm",
    footer: "d-flex justify-content-between align-items-center mt-2",
    paginationGroup: "d-inline-flex align-items-center gap-2 ms-auto",
    firstButton: "btn btn-outline-secondary btn-sm",
    prevButton: "btn btn-outline-secondary btn-sm",
    nextButton: "btn btn-outline-secondary btn-sm",
    lastButton: "btn btn-outline-secondary btn-sm",
    expandTrigger: "btn btn-outline-primary btn-sm",
    editableCell: "bg-light-subtle"
  });
}

// src/plugins/bulma-theme.js
function bulmaThemePlugin() {
  return themePlugin({
    shell: "is-block",
    controls: "level is-mobile mb-3",
    searchWrap: "field has-addons",
    sizeWrap: "field has-addons",
    searchInput: "input is-small",
    sizeSelect: "select is-small",
    tableWrap: "table-container",
    table: "table is-fullwidth is-hoverable is-striped",
    sortTrigger: "button is-white is-small",
    columnFilter: "input is-small",
    footer: "level mt-3",
    paginationGroup: "buttons are-small",
    firstButton: "button is-light is-small",
    prevButton: "button is-light is-small",
    nextButton: "button is-light is-small",
    lastButton: "button is-light is-small",
    expandTrigger: "button is-info is-light is-small",
    editableCell: "has-background-light",
    actionButton: "button is-small is-primary is-light",
    actionSelect: "select is-small",
    actionHeader: "has-text-weight-semibold",
    fixedHeader: "has-background-white-ter",
    fixedFooter: "has-background-white-ter"
  });
}

// src/plugins/mui-theme.js
function muiThemePlugin() {
  return themePlugin({
    shell: "MuiBox-root",
    controls: "MuiToolbar-root MuiToolbar-gutters",
    searchWrap: "MuiFormControl-root",
    sizeWrap: "MuiFormControl-root",
    searchInput: "MuiInputBase-input MuiInputBase-sizeSmall",
    sizeSelect: "MuiNativeSelect-select MuiInputBase-input MuiInputBase-sizeSmall",
    tableWrap: "MuiTableContainer-root",
    table: "MuiTable-root",
    headerCell: "MuiTableCell-root MuiTableCell-head",
    bodyCell: "MuiTableCell-root",
    sortTrigger: "mui-sort-trigger",
    columnFilter: "MuiInputBase-input MuiInputBase-sizeSmall",
    footer: "MuiToolbar-root MuiToolbar-gutters",
    paginationGroup: "MuiPagination-root",
    firstButton: "MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall",
    prevButton: "MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall",
    nextButton: "MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall",
    lastButton: "MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall",
    expandTrigger: "MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall",
    editableCell: "MuiTableCell-editable",
    actionButton: "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-sizeSmall",
    actionSelect: "MuiNativeSelect-select MuiInputBase-input MuiInputBase-sizeSmall",
    actionHeader: "MuiTableCell-root MuiTableCell-head",
    fixedHeader: "MuiTable-stickyHeader",
    fixedFooter: "MuiTableFooter-root",
    fixedColumn: "MuiTableCell-sticky"
  });
}

// src/plugins/tailwind-theme.js
function tailwindThemePlugin() {
  return themePlugin({
    shell: "block",
    controls: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3",
    searchWrap: "inline-flex items-center gap-2 text-sm text-slate-700",
    sizeWrap: "inline-flex items-center gap-2 text-sm text-slate-700",
    searchInput: "rounded-md border border-slate-300 px-2 py-1 text-sm",
    sizeSelect: "rounded-md border border-slate-300 px-2 py-1 text-sm",
    tableWrap: "overflow-x-auto",
    table: "min-w-full divide-y divide-slate-200",
    headerCell: "bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600",
    bodyRow: "border-b border-slate-100",
    bodyCell: "px-3 py-2 text-sm text-slate-800",
    sortTrigger: "inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900",
    columnFilter: "w-full rounded-md border border-slate-300 px-2 py-1 text-sm",
    filterRow: "bg-white",
    filterHeaderCell: "bg-white px-3 py-2",
    footer: "flex items-center justify-between gap-2 border-t border-slate-200 p-3",
    paginationGroup: "inline-flex items-center gap-2 ml-auto",
    firstButton: "rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50",
    prevButton: "rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50",
    nextButton: "rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50",
    lastButton: "rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50",
    info: "text-sm text-slate-600",
    expandTrigger: "rounded-md border border-slate-300 px-2 py-0.5 text-sm hover:bg-slate-50",
    editableCell: "bg-amber-50",
    actionsCell: "px-3 py-2",
    actionButton: "rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50",
    actionSelect: "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm",
    actionHeader: "bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600",
    emptyCell: "px-3 py-6 text-center text-sm text-slate-500",
    expandContent: "bg-slate-50 px-3 py-2 text-sm text-slate-700",
    fixedHeader: "sticky top-0 z-10",
    fixedFooter: "sticky bottom-0 z-10 bg-white",
    fixedColumn: "bg-white"
  });
}

// src/plugins/actions-dropdown.js
function actionsDropdownPlugin(options = {}) {
  return (table) => {
    table.registerHook("afterRowRender", ({ element }) => {
      const cell = element.querySelector(".vt-actions-cell");
      if (!cell) return;
      const buttons = [...cell.querySelectorAll(".vt-action-btn")];
      if (buttons.length < 2) return;
      const select = document.createElement("select");
      select.className = table.renderer?.theme?.classOf ? table.renderer.theme.classOf("actionSelect", "vt-action-select") : "vt-action-select";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = options.placeholder || "Actions";
      select.appendChild(placeholder);
      buttons.forEach((button) => {
        const option = document.createElement("option");
        option.value = button.dataset.actionId || "";
        option.textContent = button.textContent || button.dataset.actionId || "";
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        const id = select.value;
        if (!id) return;
        const rowId = element.dataset.rowId;
        const row = table.findRowById(rowId);
        const action = table.options.rowActions.find((item) => item.id === id);
        if (action && row) {
          Promise.resolve(action.onClick ? action.onClick({ row, rowId, actionId: id, table, event: new Event("change") }) : null).finally(() => {
            table.emitEvent("row:action", { row, rowId, actionId: id });
            table.refresh();
          });
        }
        select.value = "";
      });
      cell.innerHTML = "";
      cell.appendChild(select);
    });
  };
}

// src/adapters/server-adapters.js
function createRestAdapter({ endpoint, method = "GET", headers = {}, mapResponse }) {
  return (query) => {
    const upper = method.toUpperCase();
    const isGet = upper === "GET";
    let url = endpoint;
    const init = {
      method: upper,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };
    if (isGet) {
      const params = new URLSearchParams({ q: JSON.stringify(query) });
      url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${params.toString()}`;
    } else {
      init.body = JSON.stringify(query);
    }
    return fetch(url, init).then((response) => response.json()).then((payload) => mapResponse ? mapResponse(payload) : payload);
  };
}
function createGraphQLAdapter({ endpoint, query, variablesKey = "tableQuery", headers = {}, mapResponse }) {
  return (tableQuery) => fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify({
      query,
      variables: {
        [variablesKey]: tableQuery
      }
    })
  }).then((response) => response.json()).then((payload) => mapResponse ? mapResponse(payload) : payload);
}
function createCursorAdapter({ fetchPage }) {
  let lastCursor = null;
  return (tableQuery) => {
    if (tableQuery.page <= 1) {
      lastCursor = null;
    }
    return Promise.resolve(
      fetchPage({
        cursor: lastCursor,
        pageSize: tableQuery.pageSize,
        searchTerm: tableQuery.searchTerm,
        columnFilters: tableQuery.columnFilters,
        sorts: tableQuery.sorts
      })
    ).then((result) => {
      lastCursor = result.nextCursor || null;
      return {
        rows: result.rows || [],
        totalRows: Number(result.totalRows || (result.rows || []).length)
      };
    });
  };
}

// src/index.js
function createVanillaTable(element, rows, options) {
  return new VanillaTable(element, rows, options).init();
}
//# sourceMappingURL=vanilla-tables.cjs.map
