import { defaultOptions } from './default-options.js';
import { Renderer } from './renderer.js';
import { StateStore } from './state-store.js';
import { deepMerge } from '../utils/deep-merge.js';
import { EventEmitter } from '../utils/event-emitter.js';
import { createDataSource } from './data-sources/create-data-source.js';
import { StateSync } from './sync/state-sync.js';

/**
 * Coordinates state, rendering, and plugin extensions.
 */
export class VanillaTable {
    /**
     * Creates a table instance.
     *
     * @param {HTMLElement} element
     * @param {Record<string, any>[]} rows
     * @param {Record<string, any>} [options]
     */
    constructor(element, rows, options = {}) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('VanillaTable requires a valid HTMLElement as first argument.');
        }

        /** @type {HTMLElement} */
        this.root = element;
        /** @type {Record<string, any>[]} */
        this.rows = Array.isArray(rows) ? rows : [];
        /** @type {Record<string, any>} */
        this.options = deepMerge(defaultOptions, options);
        this.options.i18n = {
            ...defaultOptions.i18n,
            ...(this.options.i18n || {})
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
            pageInfo:
                typeof this.options.i18n.pageInfo === 'string'
                    ? ({ page, totalPages, totalRows }) => this.options.i18n.pageInfo.replace('{page}', String(page)).replace('{totalPages}', String(totalPages)).replace('{totalRows}', String(totalRows))
                    : this.options.labels.pageInfo
        };

        if (!this.options.columns.length) {
            this.options.columns = inferColumns(this.rows);
        }

        /** @type {EventEmitter} */
        this.events = new EventEmitter();
        /** @type {Record<string, Function>} */
        this.hooks = {};
        /** @type {StateStore} */
        this.store = new StateStore({
            rows: this.rows,
            pageSize: this.options.pageSize,
            initialSort: this.options.initialSort,
            parallel: this.options.parallel
        });

        const initialOrder = this.options.columns.map((column) => column.key);
        this.store.setColumnOrder(initialOrder);

        /** @type {Renderer} */
        this.renderer = new Renderer({ root: element, options: this.options, hooks: this.hooks });
        /** @type {ReturnType<typeof createDataSource>} */
        this.dataSource = createDataSource({
            options: this.options,
            store: this.store,
            onLoadingChange: (loading) => this.handleLoadingChange(loading)
        });

        /** @type {StateSync} */
        this.stateSync = new StateSync({
            persistence: this.options.persistence,
            urlSync: this.options.urlSync,
            tableId: this.getTableId()
        });

        /** @type {Set<string>} */
        this.expandedRowIds = new Set();
        /** @type {number | null} */
        this.searchTimer = null;
        /** @type {boolean} */
        this.loading = false;
        /** @type {Record<string, any>} */
        this.lastView = { rows: [], totalRows: 0, totalPages: 1 };
        /** @type {number | null} */
        this.lastAnimationFrame = null;
        /** @type {{ enabled: boolean, start: number, end: number, rowHeight: number }} */
        this.virtualization = {
            enabled: Boolean(this.options.virtualScroll.enabled),
            start: 0,
            end: this.options.pageSize,
            rowHeight: this.options.virtualScroll.rowHeight
        };
        /** @type {{ enabled: boolean, start: number, end: number, leftWidth: number, rightWidth: number, totalColumns: number }} */
        this.columnVirtualization = {
            enabled: Boolean(this.options.virtualColumns?.enabled),
            start: 0,
            end: this.options.columns.length,
            leftWidth: 0,
            rightWidth: 0,
            totalColumns: this.options.columns.length
        };
        /** @type {{ lastTop: number, lastAt: number, dynamicOverscan: number }} */
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
        this.emitEvent('init', { instance: this });
        return this;
    }

    /**
     * Re-renders current state to the DOM.
     *
     * @returns {Promise<void>}
     */
    refresh() {
        let columns = this.store.getVisibleColumns(this.store.getOrderedColumns(this.options.columns));

        return this.dataSource
            .getView({ columns })
            .then((view) => {
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
                this.renderer.refs.table?.setAttribute('aria-rowcount', String(view.totalRows));

                this.persistState();
                this.emitEvent('change', { state: this.getState(), view });
                this.emitEvent('state:change', this.getState());
            })
            .catch((error) => {
                this.emitEvent('error', { error });
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
        this.emitEvent('loading:change', { loading });
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
        this.renderer.refs.search?.addEventListener('input', (event) => {
            if (this.searchTimer) clearTimeout(this.searchTimer);

            const applySearch = () => {
                this.store.setSearchTerm(event.target.value);
                this.emitEvent('search:change', { term: this.store.state.searchTerm });
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
        this.renderer.refs.thead?.addEventListener('click', (event) => {
            const button = event.target.closest('.vt-sort-trigger');
            if (!button || button.disabled) return;
            this.store.toggleSort(button.dataset.key, this.options.multiSort && event.shiftKey, this.options.maxSorts);
            this.emitEvent('sort:change', { sorts: [...this.store.state.sorts] });
            void this.refresh();
        });
    }

    /**
     * Attaches filter handlers.
     *
     * @returns {void}
     */
    bindFilterEvents() {
        this.renderer.refs.thead?.addEventListener('input', (event) => {
            const input = event.target.closest('.vt-column-filter');
            if (!input) return;
            this.store.setColumnFilter(input.dataset.key, input.value);
            this.emitEvent('filter:change', {
                key: input.dataset.key,
                value: this.store.state.columnFilters[input.dataset.key] || ''
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
        this.renderer.refs.pageSize?.addEventListener('change', (event) => {
            this.store.setPageSize(Number(event.target.value));
            this.emitEvent('pagesize:change', { pageSize: this.store.state.pageSize });
            void this.refresh();
        });

        this.renderer.refs.prev?.addEventListener('click', () => {
            this.store.setPage(this.store.state.page - 1);
            this.emitEvent('page:change', { page: this.store.state.page });
            void this.refresh();
        });

        this.renderer.refs.next?.addEventListener('click', () => {
            this.store.setPage(this.store.state.page + 1);
            this.emitEvent('page:change', { page: this.store.state.page });
            void this.refresh();
        });

        this.renderer.refs.first?.addEventListener('click', () => {
            this.store.setPage(1);
            this.emitEvent('page:change', { page: this.store.state.page });
            void this.refresh();
        });

        this.renderer.refs.last?.addEventListener('click', () => {
            this.store.setPage(this.lastView.totalPages || 1);
            this.emitEvent('page:change', { page: this.store.state.page });
            void this.refresh();
        });
    }

    /**
     * Attaches row expansion handlers.
     *
     * @returns {void}
     */
    bindExpandEvents() {
        this.renderer.refs.tbody?.addEventListener('click', (event) => {
            const trigger = event.target.closest('.vt-expand-trigger');
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
        this.renderer.refs.tbody?.addEventListener('dblclick', (event) => {
            if (!this.options.editableRows) return;

            const cell = event.target.closest('.vt-cell-editable');
            if (!cell || cell.querySelector('input')) return;

            const rowId = cell.dataset.rowId;
            const key = cell.dataset.key;
            const row = this.findRowById(rowId);
            if (!row) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = String(row[key] ?? '');
            input.className = 'vt-inline-input';
            cell.innerHTML = '';
            cell.appendChild(input);
            input.focus();

            const submit = () => {
                row[key] = input.value;
                this.emitEvent('edit', { rowId, row, key, value: input.value });
                this.emitEvent('row:edit', { rowId, row, key, value: input.value });
                void this.refresh();
            };

            input.addEventListener('blur', submit, { once: true });
            input.addEventListener('keydown', (keyboardEvent) => {
                if (keyboardEvent.key === 'Enter') {
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
        this.renderer.refs.tbody?.addEventListener('click', (event) => {
            const actionButton = event.target.closest('.vt-action-btn');
            if (!actionButton) return;

            const rowId = actionButton.dataset.rowId;
            const actionId = actionButton.dataset.actionId;
            const row = this.findRowById(rowId);
            const action = this.options.rowActions.find((item) => item.id === actionId);
            if (!action || !row) return;

            Promise.resolve(action.onClick ? action.onClick({ row, rowId, actionId, table: this, event }) : null).finally(() => {
                this.emitEvent('row:action', { row, rowId, actionId });
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

        this.renderer.refs.thead?.addEventListener('mousedown', (event) => {
            const handle = event.target.closest('.vt-resize-handle');
            if (!handle) return;

            event.preventDefault();

            const key = handle.dataset.key;
            const startX = event.clientX;
            const startWidth = this.store.state.columnWidths[key] || this.renderer.refs.thead.querySelector(`th[data-key="${key}"]`)?.getBoundingClientRect().width || 180;

            const onMove = (moveEvent) => {
                const nextWidth = startWidth + (moveEvent.clientX - startX);
                this.store.setColumnWidth(key, nextWidth);
                this.emitEvent('column:resize', { key, width: this.store.state.columnWidths[key] });
                void this.refresh();
            };

            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                this.persistState();
            };

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
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

        this.renderer.refs.thead?.addEventListener('dragstart', (event) => {
            const th = event.target.closest('th[data-key]');
            if (!th) return;
            draggingKey = th.dataset.key;
            event.dataTransfer.effectAllowed = 'move';
        });

        this.renderer.refs.thead?.addEventListener('dragover', (event) => {
            if (!draggingKey) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        });

        this.renderer.refs.thead?.addEventListener('drop', (event) => {
            if (!draggingKey) return;
            event.preventDefault();

            const targetTh = event.target.closest('th[data-key]');
            if (!targetTh) return;

            const targetKey = targetTh.dataset.key;
            if (!targetKey || targetKey === draggingKey) return;

            const current = this.store.getOrderedColumns(this.options.columns).map((column) => column.key);
            const next = current.filter((key) => key !== draggingKey);
            const targetIndex = next.indexOf(targetKey);
            next.splice(targetIndex, 0, draggingKey);

            this.store.setColumnOrder(next);
            this.emitEvent('column:reorder', { order: next });
            void this.refresh();
            draggingKey = null;
        });

        this.renderer.refs.thead?.addEventListener('dragend', () => {
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

        this.renderer.refs.tableWrap?.addEventListener('scroll', () => {
            const wrap = this.renderer.refs.tableWrap;
            if (this.options.virtualScroll.adaptiveOverscan && wrap) {
                const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
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
        if (urgent || typeof requestIdleCallback !== 'function') {
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
        this.renderer.refs.thead?.addEventListener('keydown', (event) => {
            const resizeHandle = event.target.closest('.vt-resize-handle');
            if (resizeHandle && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                event.preventDefault();
                const key = resizeHandle.dataset.key;
                const current = this.store.state.columnWidths[key] || 180;
                const delta = event.key === 'ArrowLeft' ? -16 : 16;
                this.setColumnWidth(key, current + delta);
                return;
            }

            const th = event.target.closest('th[data-key]');
            if (!th || !this.options.columnReorder) return;

            if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                event.preventDefault();
                const currentOrder = this.store.getOrderedColumns(this.options.columns).map((column) => column.key);
                const key = th.dataset.key;
                const index = currentOrder.indexOf(key);
                if (index < 0) return;

                const targetIndex = event.key === 'ArrowLeft' ? Math.max(0, index - 1) : Math.min(currentOrder.length - 1, index + 1);
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
        this.emitEvent('data:set', { count: this.rows.length });
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
        this.emitEvent('data:add', { row });
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
        this.emitEvent('data:remove', { rowId });
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
        this.emitEvent('search:change', { term: this.store.state.searchTerm });
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
        this.emitEvent('filter:change', { key, value: this.store.state.columnFilters[key] || '' });
        return this.refresh();
    }

    /**
     * Clears all filters.
     *
     * @returns {Promise<void>}
     */
    clearFilters() {
        this.store.clearFilters();
        this.emitEvent('filter:clear', {});
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
    sortBy(key, direction = 'asc', additive = false) {
        if (!additive) {
            this.store.setSorts([{ key, direction }]);
        } else {
            const next = [...this.store.state.sorts.filter((item) => item.key !== key), { key, direction }];
            this.store.setSorts(next.slice(-this.options.maxSorts));
        }
        this.emitEvent('sort:change', { sorts: [...this.store.state.sorts] });
        return this.refresh();
    }

    /**
     * Clears sort state.
     *
     * @returns {Promise<void>}
     */
    clearSort() {
        this.store.clearSorts();
        this.emitEvent('sort:clear', {});
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
        this.emitEvent('page:change', { page: this.store.state.page });
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
        this.emitEvent('pagesize:change', { pageSize: this.store.state.pageSize });
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
        this.emitEvent('row:expand', { rowId: String(rowId) });
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
        this.emitEvent('row:collapse', { rowId: String(rowId) });
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
        this.emitEvent('row:expandAll', {});
        return this.refresh();
    }

    /**
     * Collapses all rows.
     *
     * @returns {Promise<void>}
     */
    collapseAllRows() {
        this.expandedRowIds.clear();
        this.emitEvent('row:collapseAll', {});
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
        this.emitEvent('edit', { rowId: String(rowId), row, key, value });
        this.emitEvent('row:edit', { rowId: String(rowId), row, key, value });
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
        this.options.columns = this.options.columns.map((column) => (column.key === key ? { ...column, editable } : column));
        this.options.editableColumns[key] = editable;
        this.emitEvent('column:editable', { key, editable });
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
        this.emitEvent('column:resize', { key, width: this.store.state.columnWidths[key] });
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
        this.emitEvent('column:reorder', { order: [...order] });
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
        this.emitEvent('column:visibility', { key, visible: Boolean(visible) });
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
            ...(classes || {})
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
        this.root.innerHTML = '';
        this.emitEvent('destroy', {});
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
        if (this.options.events.debug && typeof console !== 'undefined') {
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
}

/**
 * Infers column metadata from the first data row.
 *
 * @param {Record<string, any>[]} rows
 * @returns {{ key: string, label: string, editable: boolean }[]}
 */
function inferColumns(rows) {
    if (!rows.length) return [];

    return Object.keys(rows[0]).map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        editable: true
    }));
}
