import { createVanillaTable, bootstrapThemePlugin, bulmaThemePlugin, muiThemePlugin, tailwindThemePlugin, actionsDropdownPlugin, stripedRowsPlugin } from '../dist/vanilla-tables.js';

const theme = document.body.dataset.theme || 'vanilla';

/**
 * Builds fixture rows.
 *
 * @returns {Array<Record<string, any>>}
 */
function buildRows() {
    const cities = ['London', 'Paris', 'Berlin', 'Madrid', 'Rome'];
    return Array.from({ length: 24 }).map((_, index) => ({
        id: String(index + 1),
        name: `User ${index + 1}`,
        city: cities[index % cities.length],
        score: 50 + (index % 40)
    }));
}

/**
 * Creates one independent row array.
 *
 * @param {Array<Record<string, any>>} rows
 * @returns {Array<Record<string, any>>}
 */
function cloneRows(rows) {
    return rows.map((row) => ({ ...row }));
}

/**
 * Returns base options for demo tables.
 *
 * @returns {Record<string, any>}
 */
function createBaseOptions() {
    return {
        pageSize: 5,
        pageSizeOptions: [5, 10, 20],
        debounceMs: 0,
        expandableRows: true,
        editableRows: true,
        expandRow: (row) => `<div>Details for <strong>${row.name}</strong> from ${row.city}</div>`,
        rowActions: [
            {
                id: 'approve',
                label: 'Approve',
                onClick: ({ row }) => {
                    row.status = 'approved';
                }
            },
            {
                id: 'archive',
                label: 'Archive',
                onClick: ({ row }) => {
                    row.status = 'archived';
                }
            }
        ]
    };
}

/**
 * Resolves plugins for a theme.
 *
 * @param {string} key
 * @returns {Array<(table: any) => void>}
 */
function pluginsForTheme(key) {
    const shared = [actionsDropdownPlugin({ placeholder: 'Actions' })];

    if (key === 'bootstrap') return [bootstrapThemePlugin(), ...shared];
    if (key === 'bulma') return [bulmaThemePlugin(), ...shared];
    if (key === 'mui') return [muiThemePlugin(), ...shared];
    if (key === 'tailwind') return [tailwindThemePlugin(), stripedRowsPlugin(), ...shared];
    return shared;
}

const root = document.getElementById('table-root');
const rows = cloneRows(buildRows());
const table = createVanillaTable(root, rows, createBaseOptions());
pluginsForTheme(theme).forEach((plugin) => table.use(plugin));
