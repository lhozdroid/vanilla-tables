import { VanillaTable, stripedRowsPlugin, actionsDropdownPlugin } from '/dist/vanilla-tables.js';

const scenario = new URLSearchParams(window.location.search).get('scenario') || 'basic';

/**
 * Builds deterministic fixture rows.
 *
 * @param {number} count
 * @returns {Array<Record<string, any>>}
 */
function createRows(count) {
    const cities = ['London', 'Paris', 'Berlin', 'Madrid', 'Rome'];
    const statuses = ['active', 'pending', 'disabled'];

    return Array.from({ length: count }).map((_, index) => ({
        id: String(index + 1),
        name: `User ${index + 1}`,
        city: cities[index % cities.length],
        age: 20 + (index % 30),
        status: statuses[index % statuses.length]
    }));
}

const rows = createRows(120);
let performanceRowsCache = null;
const eventLog = [];
const actionLog = [];
const fetchLog = [];

const root = document.getElementById('table-root');
const scenarioLabel = document.getElementById('scenario-label');
const eventCount = document.getElementById('event-count');
const actionCount = document.getElementById('action-count');
const fetchCount = document.getElementById('fetch-count');

scenarioLabel.textContent = `scenario: ${scenario}`;

/**
 * Updates fixture counters.
 *
 * @returns {void}
 */
function paintCounters() {
    eventCount.textContent = `events: ${eventLog.length}`;
    actionCount.textContent = `actions: ${actionLog.length}`;
    fetchCount.textContent = `fetches: ${fetchLog.length}`;
}

/**
 * Builds a table instance for the selected scenario.
 *
 * @param {string} key
 * @returns {{ rows: Array<Record<string, any>>, options: Record<string, any>, plugins: Array<(table: VanillaTable) => void> }}
 */
function buildScenario(key) {
    const bootstrapThemeClasses = {
        shell: 'border-0 rounded-0 bg-transparent',
        controls: 'd-flex flex-wrap gap-2 align-items-center justify-content-between w-100',
        searchWrap: 'd-inline-flex align-items-center gap-2',
        sizeWrap: 'd-inline-flex align-items-center gap-2',
        searchInput: 'form-control form-control-sm',
        sizeSelect: 'form-select form-select-sm',
        tableWrap: 'table-responsive',
        table: 'table table-hover table-striped mb-0',
        sortTrigger: 'btn btn-sm p-0 border-0 bg-transparent text-body fw-semibold',
        actionHeader: 'text-body fw-semibold small',
        columnFilter: 'form-control form-control-sm',
        actionSelect: 'form-select form-select-sm w-auto',
        actionButton: 'btn btn-outline-secondary btn-sm',
        footer: 'd-flex justify-content-between align-items-center mt-2',
        paginationGroup: 'd-inline-flex align-items-center gap-2 ms-auto',
        firstButton: 'btn btn-outline-secondary btn-sm',
        prevButton: 'btn btn-outline-secondary btn-sm',
        nextButton: 'btn btn-outline-secondary btn-sm',
        lastButton: 'btn btn-outline-secondary btn-sm',
        expandTrigger: 'btn btn-outline-primary btn-sm'
    };

    const columns = [
        { key: 'id', label: 'ID', editable: false },
        { key: 'name', label: 'Name' },
        { key: 'city', label: 'City' },
        { key: 'age', label: 'Age' },
        { key: 'status', label: 'Status' }
    ];

    const shared = {
        columns,
        pageSizeOptions: [5, 10, 20, 50],
        pageSize: 10,
        debounceMs: 0,
        columnResize: true,
        columnReorder: true,
        rowActions: [],
        themeClasses: bootstrapThemeClasses
    };

    if (key === 'row-features') {
        return {
            rows,
            options: {
                ...shared,
                expandableRows: true,
                expandRow: (row) => `<div class="row-detail">Details for ${row.name}</div>`,
                editableRows: true,
                rowActions: [
                    {
                        id: 'approve',
                        label: 'Approve',
                        className: 'approve-btn',
                        onClick: ({ rowId }) => {
                            actionLog.push({ actionId: 'approve', rowId });
                            paintCounters();
                        }
                    },
                    {
                        id: 'reject',
                        label: 'Reject',
                        className: 'reject-btn',
                        onClick: ({ rowId }) => {
                            actionLog.push({ actionId: 'reject', rowId });
                            paintCounters();
                        }
                    }
                ]
            },
            plugins: [stripedRowsPlugin(), actionsDropdownPlugin({ placeholder: 'Select action' })]
        };
    }

    if (key === 'fixed-layout') {
        return {
            rows,
            options: {
                ...shared,
                pageSize: 20,
                fixedHeader: true,
                fixedFooter: true,
                fixedColumns: 2,
                fixedTopRows: 1
            },
            plugins: []
        };
    }

    if (key === 'virtual') {
        return {
            rows,
            options: {
                ...shared,
                virtualScroll: {
                    enabled: true,
                    rowHeight: 36,
                    overscan: 2,
                    height: 260
                },
                pageSize: 100
            },
            plugins: []
        };
    }

    if (key === 'server') {
        return {
            rows: [],
            options: {
                ...shared,
                serverSide: true,
                pageSize: 10,
                fetchData: (query) => {
                    fetchLog.push(query);
                    paintCounters();

                    const filtered = rows.filter((row) => {
                        const matchesSearch = !query.searchTerm ? true : Object.values(row).some((value) => String(value).toLowerCase().includes(String(query.searchTerm).toLowerCase()));

                        if (!matchesSearch) return false;

                        return Object.entries(query.columnFilters || {}).every(([field, value]) =>
                            String(row[field] || '')
                                .toLowerCase()
                                .includes(String(value || '').toLowerCase())
                        );
                    });

                    const sorted = [...filtered];
                    (query.sorts || []).forEach((sort) => {
                        sorted.sort((a, b) => {
                            const left = a[sort.key];
                            const right = b[sort.key];
                            const base = String(left).localeCompare(String(right), undefined, { numeric: true });
                            return sort.direction === 'desc' ? -base : base;
                        });
                    });

                    const page = Math.max(1, Number(query.page || 1));
                    const size = Math.max(1, Number(query.pageSize || 10));
                    const start = (page - 1) * size;
                    const slice = sorted.slice(start, start + size);

                    return new Promise((resolve) => {
                        window.setTimeout(() => {
                            resolve({
                                rows: slice,
                                totalRows: sorted.length
                            });
                        }, 20);
                    });
                }
            },
            plugins: []
        };
    }

    if (key === 'performance') {
        if (!performanceRowsCache) {
            performanceRowsCache = createRows(40000);
        }

        return {
            rows: performanceRowsCache,
            options: {
                ...shared,
                pageSize: 100,
                virtualScroll: {
                    enabled: true,
                    rowHeight: 36,
                    overscan: 6,
                    height: 360
                }
            },
            plugins: []
        };
    }

    return {
        rows,
        options: shared,
        plugins: []
    };
}

const scenarioConfig = buildScenario(scenario);
const table = new VanillaTable(root, scenarioConfig.rows, scenarioConfig.options);
scenarioConfig.plugins.forEach((plugin) => {
    table.use(plugin);
});

const trackedEvents = ['init', 'change', 'state:change', 'search:change', 'filter:change', 'sort:change', 'page:change', 'row:expand', 'row:collapse', 'row:edit', 'row:action', 'column:reorder', 'column:resize', 'loading:change', 'error'];

trackedEvents.forEach((name) => {
    table.on(name, (payload) => {
        eventLog.push({ name, payload });
        paintCounters();
    });
});

table.init();

window.__e2e = {
    scenario,
    table,
    getState: () => table.getState(),
    getView: () => table.getView(),
    getEvents: () => [...eventLog],
    getActions: () => [...actionLog],
    getFetches: () => [...fetchLog]
};

window.__vtReady = new Promise((resolve) => {
    const finish = () => {
        paintCounters();
        document.body.dataset.ready = 'true';
        resolve();
    };

    const offChange = table.on('change', () => {
        offChange();
        offError();
        finish();
    });

    const offError = table.on('error', () => {
        offChange();
        offError();
        finish();
    });
});
