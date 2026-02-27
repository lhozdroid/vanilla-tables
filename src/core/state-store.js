import { ProjectionWorkerPool } from './parallel/projection-worker-pool.js';

/**
 * Stores and computes table state projections.
 */
export class StateStore {
    /**
     * Creates a state store.
     *
     * @param {{ rows: Record<string, any>[], pageSize: number, initialSort: { key: string, direction?: 'asc'|'desc' } | null, parallel?: { enabled?: boolean, threshold?: number, workers?: number|'auto', timeoutMs?: number, retries?: number } }} config
     */
    constructor({ rows, pageSize, initialSort, parallel }) {
        /** @type {Record<string, any>[]} */
        this.rows = rows;
        /** @type {{ page: number, pageSize: number, searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[], columnOrder: string[], columnWidths: Record<string, number>, columnVisibility: Record<string, boolean> }} */
        this.state = {
            page: 1,
            pageSize: normalizePageSize(pageSize),
            searchTerm: '',
            columnFilters: {},
            sorts: initialSort ? [{ key: initialSort.key, direction: initialSort.direction || 'asc' }] : [],
            columnOrder: [],
            columnWidths: {},
            columnVisibility: {}
        };

        /** @type {number} */
        this.rowsVersion = 0;
        /** @type {number} */
        this.revision = 0;
        /** @type {{ rowsVersion: number, columnsKey: string, searchTerm: string, filtersKey: string, rows: Record<string, any>[] } | null} */
        this.filterCache = null;
        /** @type {{ rowsVersion: number, columnsKey: string, sortsKey: string, comparator: (left: number, right: number) => number, sourceText: Map<string, string[]>, sourceNumeric: Map<string, { values: Float64Array, flags: Uint8Array }> } | null} */
        this.sortComparatorCache = null;
        /** @type {{ revision: number, columnsKey: string, rows: Record<string, any>[] } | null} */
        this.projectionCache = null;
        /** @type {{ rowsVersion: number, columnsKey: string, rows: Record<string, any>[], rowIndex: WeakMap<Record<string, any>, number>, textByKey: Map<string, string[]>, numericByKey: Map<string, { values: Float64Array, flags: Uint8Array }>, hasAlphaByKey: Map<string, boolean> } | null} */
        this.columnIndexCache = null;
        const parallelWorkers = resolveParallelWorkers(parallel?.workers);
        /** @type {{ enabled: boolean, threshold: number, workers: number, timeoutMs: number, retries: number }} */
        this.parallel = {
            enabled: parallel?.enabled !== false,
            threshold: Math.max(1000, Number(parallel?.threshold ?? 20000)),
            workers: parallelWorkers,
            timeoutMs: Math.max(50, Number(parallel?.timeoutMs ?? 4000)),
            retries: Math.max(0, Math.floor(Number(parallel?.retries ?? 1)))
        };
        /** @type {ProjectionWorkerPool | null} */
        this.projectionWorkerPool = null;
        /** @type {Promise<void>} */
        this.projectionWorkerReady = Promise.resolve();

        if (this.parallel.enabled && typeof Worker !== 'undefined') {
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
        this.state.searchTerm = (searchTerm || '').toLowerCase().trim();
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
        const normalized = (value || '').toLowerCase().trim();
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
        this.state.searchTerm = '';
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
        this.state.pageSize = normalizePageSize(pageSize);
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
                this.state.sorts = [{ key, direction: 'asc' }];
            } else {
                const current = this.state.sorts[existingIndex];
                this.state.sorts = [{ key, direction: current.direction === 'asc' ? 'desc' : 'asc' }];
            }
            this.invalidateProjection();
            return;
        }

        if (existingIndex === -1) {
            this.state.sorts.push({ key, direction: 'asc' });
            if (this.state.sorts.length > maxSorts) {
                this.state.sorts.shift();
            }
            this.invalidateProjection();
            return;
        }

        const current = this.state.sorts[existingIndex];
        this.state.sorts[existingIndex] = {
            key,
            direction: current.direction === 'asc' ? 'desc' : 'asc'
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
        if (typeof payload.page === 'number') this.state.page = normalizePage(payload.page);
        if (typeof payload.pageSize === 'number') this.state.pageSize = normalizePageSize(payload.pageSize);
        if (typeof payload.searchTerm === 'string') {
            this.state.searchTerm = payload.searchTerm.toLowerCase().trim();
            affectsProjection = true;
            affectsFilters = true;
        }
        if (payload.columnFilters && typeof payload.columnFilters === 'object') {
            const nextFilters = {};
            for (const [key, value] of Object.entries(payload.columnFilters)) {
                const normalized = String(value ?? '')
                    .toLowerCase()
                    .trim();
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
        if (payload.columnWidths && typeof payload.columnWidths === 'object') {
            this.state.columnWidths = { ...payload.columnWidths };
        }
        if (payload.columnVisibility && typeof payload.columnVisibility === 'object') {
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
            const output = [];

            for (let i = 0; i < rows.length; i += 1) {
                let matches = true;
                for (const filterColumn of filterColumns) {
                    if (!filterColumn.text[i].includes(filterColumn.term)) {
                        matches = false;
                        break;
                    }
                }
                if (matches) output.push(rows[i]);
            }
            return output;
        }

        const output = [];
        for (const row of rows) {
            let matches = true;
            for (const [key, term] of activeFilters) {
                if (
                    !String(row?.[key] ?? '')
                        .toLowerCase()
                        .includes(term)
                ) {
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
            const output = [];

            for (let i = 0; i < rows.length; i += 1) {
                let matches = false;
                for (const searchColumn of searchColumns) {
                    if (searchColumn[i].includes(this.state.searchTerm)) {
                        matches = true;
                        break;
                    }
                }
                if (matches) output.push(rows[i]);
            }
            return output;
        }

        const output = [];
        for (const row of rows) {
            let matches = false;
            for (const key of keys) {
                if (
                    String(row?.[key] ?? '')
                        .toLowerCase()
                        .includes(this.state.searchTerm)
                ) {
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
        if (!this.state.searchTerm && !Object.keys(this.state.columnFilters).length && this.rows.length > 20000) {
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
            if (!this.state.searchTerm && !Object.keys(this.state.columnFilters).length && this.rows.length > 20000) {
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

        return this.projectionWorkerReady
            .then(() =>
                this.projectionWorkerPool.project({
                    keys: columns.map((column) => column.key),
                    searchTerm,
                    columnFilters: this.state.columnFilters,
                    sorts: this.state.sorts
                })
            )
            .then((indices) => {
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
            })
            .catch(() => {
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

        return this.projectionWorkerReady
            .then(() =>
                this.projectionWorkerPool.project({
                    keys: columns.map((column) => column.key),
                    searchTerm,
                    columnFilters: this.state.columnFilters,
                    sorts: []
                })
            )
            .then((indices) => {
                const rows = indices.map((index) => this.rows[index]).filter(Boolean);
                this.filterCache = {
                    rowsVersion: this.rowsVersion,
                    columnsKey,
                    searchTerm,
                    filtersKey,
                    rows
                };
                return rows;
            })
            .catch(() => {
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
            const output = [];

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
                    output.push(rows[i]);
                    continue;
                }

                let matchesSearch = false;
                for (const searchColumn of searchColumns) {
                    if (searchColumn[i].includes(searchTerm)) {
                        matchesSearch = true;
                        break;
                    }
                }
                if (matchesSearch) output.push(rows[i]);
            }
            return output;
        }

        const output = [];
        for (const row of rows) {
            let matchesFilters = true;
            for (const [key, term] of activeFilters) {
                if (
                    !String(row?.[key] ?? '')
                        .toLowerCase()
                        .includes(term)
                ) {
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
                if (
                    String(row?.[key] ?? '')
                        .toLowerCase()
                        .includes(searchTerm)
                ) {
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

        if (rowCount < 5000) {
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

        const sourceText = new Map();
        const sourceNumeric = new Map();
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
                if (cmp !== 0) return sort.direction === 'desc' ? -cmp : cmp;
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
            if (leftSource === undefined || rightSource === undefined) {
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
        return columns.map((column) => column.key).join('|');
    }

    /**
     * Serializes active filters for cache keying.
     *
     * @param {{ key: string }[]} columns
     * @returns {string}
     */
    serializeActiveFilters(columns) {
        const columnSet = new Set(columns.map((item) => item.key));
        const active = Object.entries(this.state.columnFilters)
            .filter(([key]) => columnSet.has(key))
            .sort(([leftKey], [rightKey]) => compareText(leftKey, rightKey));
        if (!active.length) return '';
        return active.map(([key, value]) => `${key}:${value}`).join('|');
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

        const rowIndex = new WeakMap();
        for (let i = 0; i < this.rows.length; i += 1) {
            rowIndex.set(this.rows[i], i);
        }

        this.columnIndexCache = {
            rowsVersion: this.rowsVersion,
            columnsKey,
            rows: this.rows,
            textByKey: new Map(),
            rowIndex,
            numericByKey: new Map(),
            hasAlphaByKey: new Map()
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
            values[i] = String(index.rows[i]?.[key] ?? '').toLowerCase();
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
        if (cached !== undefined) return cached;

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
}

/**
 * Normalizes a page number into a valid positive integer.
 *
 * @param {number} page
 * @returns {number}
 */
function normalizePage(page) {
    if (!Number.isFinite(page)) return 1;
    return Math.max(1, Math.floor(page));
}

/**
 * Normalizes a page size into a valid positive integer.
 *
 * @param {number} pageSize
 * @returns {number}
 */
function normalizePageSize(pageSize) {
    if (!Number.isFinite(pageSize)) return 1;
    return Math.max(1, Math.floor(pageSize));
}

/** @type {RegExp} */
const HAS_ALPHA_RE = /[a-z]/;

/**
 * Compares two lowercase text values.
 *
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function compareText(left, right) {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
}

/**
 * Returns whether next query is a narrowing form of previous.
 *
 * @param {string} previous
 * @param {string} next
 * @returns {boolean}
 */
function isIncrementalRefinement(previous, next) {
    return next.startsWith(previous);
}

/**
 * Returns whether next active filter set refines previous.
 *
 * @param {string} previous
 * @param {string} next
 * @returns {boolean}
 */
function isIncrementalFilterRefinement(previous, next) {
    if (!previous) return true;
    if (!next) return false;
    const previousEntries = previous.split('|').filter(Boolean);
    const nextEntries = new Map(next.split('|').filter(Boolean).map((entry) => {
        const separator = entry.indexOf(':');
        const key = separator >= 0 ? entry.slice(0, separator) : entry;
        const value = separator >= 0 ? entry.slice(separator + 1) : '';
        return [key, value];
    }));
    for (const entry of previousEntries) {
        const separator = entry.indexOf(':');
        const key = separator >= 0 ? entry.slice(0, separator) : entry;
        const value = separator >= 0 ? entry.slice(separator + 1) : '';
        const nextValue = nextEntries.get(key);
        if (typeof nextValue !== 'string') return false;
        if (!nextValue.startsWith(value)) return false;
    }
    return true;
}

/**
 * Serializes sort definitions for cache keying.
 *
 * @param {{ key: string, direction: 'asc'|'desc' }[]} sorts
 * @returns {string}
 */
function serializeSorts(sorts) {
    return sorts.map((sort) => `${sort.key}:${sort.direction}`).join('|');
}

/**
 * Performs stable merge sort on index arrays using a shared scratch buffer.
 *
 * @param {number[]} items
 * @param {(left: number, right: number) => number} compare
 * @returns {void}
 */
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

/**
 * Resolves configured parallel worker count.
 *
 * @param {number | string | undefined} input
 * @returns {number}
 */
function resolveParallelWorkers(input) {
    if (typeof input === 'number' && Number.isFinite(input)) {
        return Math.max(1, Math.floor(input));
    }

    if (input === 'auto' || input == null) {
        const cores = typeof navigator !== 'undefined' && Number.isFinite(navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 4;
        return Math.max(2, Math.min(8, Math.floor(cores) - 1));
    }

    const numeric = Number(input);
    if (Number.isFinite(numeric)) {
        return Math.max(1, Math.floor(numeric));
    }
    return 4;
}
