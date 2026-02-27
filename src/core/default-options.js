import { defaultI18n } from '../i18n/default.i18n.js';

/**
 * Defines baseline plugin options.
 */
export const defaultOptions = {
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
    rowIdKey: 'id',
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
        threshold: 20000,
        workers: 'auto',
        timeoutMs: 4000,
        retries: 1,
        typedColumns: true
    },
    persistence: {
        enabled: false,
        storageKey: null
    },
    urlSync: {
        enabled: false,
        param: 'vt'
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
        pageInfo: ({ page, totalPages, totalRows }) => defaultI18n.pageInfo.replace('{page}', String(page)).replace('{totalPages}', String(totalPages)).replace('{totalRows}', String(totalRows)),
        empty: defaultI18n.empty,
        first: defaultI18n.first,
        prev: defaultI18n.prev,
        next: defaultI18n.next,
        last: defaultI18n.last
    },
    columns: []
};
