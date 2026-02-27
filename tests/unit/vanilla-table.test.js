import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VanillaTable } from '../../src/core/vanilla-table.js';
import { bootstrapThemePlugin } from '../../src/plugins/bootstrap-theme.js';
import { stripedRowsPlugin } from '../../src/plugins/striped-rows.js';
import { actionsDropdownPlugin } from '../../src/plugins/actions-dropdown.js';

/**
 * Validates end-to-end table behaviors across core features and plugins.
 */
const rows = [
    { id: 1, name: 'Alice', age: 25, city: 'London' },
    { id: 2, name: 'Bob', age: 30, city: 'Paris' },
    { id: 3, name: 'Carol', age: 22, city: 'Berlin' }
];

describe('VanillaTable', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    it('renders initial rows', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows).init();

        return table.refresh().then(() => {
            expect(root.querySelectorAll('tbody tr.vt-row')).toHaveLength(3);
            expect(root.querySelector('table[role=\"grid\"]')).not.toBeNull();
        });
    });

    it('filters rows via search input', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, { debounceMs: 0 }).init();

        const search = root.querySelector('.vt-search');
        search.value = 'bob';
        search.dispatchEvent(new Event('input', { bubbles: true }));

        return Promise.resolve()
            .then(() => table.refresh())
            .then(() => {
                const bodyRows = root.querySelectorAll('tbody tr.vt-row');
                expect(bodyRows).toHaveLength(1);
                expect(bodyRows[0].textContent).toContain('Bob');
            });
    });

    it('filters rows via column filter', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows).init();

        return table.refresh().then(() => {
            const cityFilter = [...root.querySelectorAll('.vt-column-filter')].find((node) => node.dataset.key === 'city');
            cityFilter.value = 'paris';
            cityFilter.dispatchEvent(new Event('input', { bubbles: true }));

            return table.refresh().then(() => {
                const bodyRows = root.querySelectorAll('tbody tr.vt-row');
                expect(bodyRows).toHaveLength(1);
                expect(bodyRows[0].textContent).toContain('Bob');
            });
        });
    });

    it('supports multi-sort with shift click', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, [
            { id: 1, city: 'A', age: 2 },
            { id: 2, city: 'A', age: 1 },
            { id: 3, city: 'B', age: 1 }
        ]).init();

        return table.refresh().then(() => {
            const headers = [...root.querySelectorAll('.vt-sort-trigger')];
            const cityHeader = headers.find((node) => node.dataset.key === 'city');
            const ageHeader = headers.find((node) => node.dataset.key === 'age');

            cityHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            ageHeader.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));

            return table.refresh().then(() => {
                const firstRow = root.querySelector('tbody tr.vt-row');
                expect(firstRow.textContent).toContain('1');
            });
        });
    });

    it('loads server-side rows', () => {
        const root = document.getElementById('app');
        const fetchData = vi.fn().mockResolvedValue({
            rows: [{ id: 88, name: 'Server', age: 40, city: 'NYC' }],
            totalRows: 1
        });

        const table = new VanillaTable(root, [], {
            serverSide: true,
            fetchData
        }).init();

        return table.refresh().then(() => {
            expect(fetchData).toHaveBeenCalled();
            expect(root.textContent).toContain('Server');
        });
    });

    it('toggles expandable rows', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            expandableRows: true,
            expandRow: (row) => `<div class="extra">Details ${row.name}</div>`
        }).init();

        return table.refresh().then(() => {
            const trigger = root.querySelector('.vt-expand-trigger');
            trigger.dispatchEvent(new Event('click', { bubbles: true }));

            return table.refresh().then(() => {
                expect(root.querySelector('.vt-expand-row')).not.toBeNull();
            });
        });
    });

    it('edits rows through inline editor', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            editableRows: true
        }).init();

        const edits = [];
        table.on('edit', (payload) => edits.push(payload));

        return table.refresh().then(() => {
            const editableCell = root.querySelector('.vt-cell-editable');
            editableCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

            const input = editableCell.querySelector('input');
            input.value = 'Alice-Edited';
            input.dispatchEvent(new Event('blur', { bubbles: true }));

            return table.refresh().then(() => {
                expect(edits).toHaveLength(1);
                expect(root.textContent).toContain('Alice-Edited');
            });
        });
    });

    it('applies striped plugin classes', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows).use(stripedRowsPlugin()).init();

        return table.refresh().then(() => {
            const striped = root.querySelectorAll('.vt-row-striped');
            expect(striped.length).toBeGreaterThan(0);
        });
    });

    it('applies bootstrap theme classes', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows).use(bootstrapThemePlugin()).init();

        return table.refresh().then(() => {
            expect(root.querySelector('.table')).not.toBeNull();
            expect(root.querySelector('.form-control')).not.toBeNull();
        });
    });

    it('applies fixed column classes', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            fixedColumns: 1
        }).init();

        return table.refresh().then(() => {
            expect(root.querySelector('.vt-fixed-column')).not.toBeNull();
        });
    });

    it('runs row action buttons and emits row action event', () => {
        const root = document.getElementById('app');
        const actionSpy = vi.fn();
        const events = [];
        const table = new VanillaTable(root, rows, {
            rowActions: [
                {
                    id: 'approve',
                    label: 'Approve',
                    onClick: actionSpy
                }
            ]
        }).init();

        table.on('row:action', (payload) => events.push(payload));

        return table.refresh().then(() => {
            const actionButton = root.querySelector('.vt-action-btn');
            actionButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            return Promise.resolve().then(() => {
                expect(actionSpy).toHaveBeenCalled();
                expect(events).toHaveLength(1);
                expect(events[0].actionId).toBe('approve');
            });
        });
    });

    it('supports API state transitions and expansion methods', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            expandableRows: true,
            expandRow: (row) => `<div>Details ${row.name}</div>`
        }).init();

        return table
            .search('bob')
            .then(() => table.sortBy('age', 'desc'))
            .then(() => table.goToPage(1))
            .then(() => table.expandRow('2'))
            .then(() => {
                const state = table.getState();
                expect(state.searchTerm).toContain('bob');
                expect(state.sorts[0].key).toBe('age');
                expect(root.querySelector('.vt-expand-row')).not.toBeNull();
            });
    });

    it('syncs state to localStorage when persistence is enabled', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            persistence: {
                enabled: true,
                storageKey: 'vt-test'
            }
        }).init();

        return table.search('alice').then(() => {
            const raw = window.localStorage.getItem('vt-test');
            expect(raw).toContain('alice');
        });
    });

    it('toggles column visibility through API', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows).init();

        return table.setColumnVisibility('city', false).then(() => {
            const headers = [...root.querySelectorAll('th[data-key]')];
            expect(headers.some((node) => node.dataset.key === 'city')).toBe(false);
        });
    });

    it('persists expanded rows in state', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            expandableRows: true,
            expandRow: (row) => `<div>${row.name}</div>`
        }).init();

        return table.expandRow('1').then(() => {
            const state = table.getState();
            expect(state.expandedRowIds).toContain('1');
        });
    });

    it('supports keyboard resize and reorder', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(root, rows, {
            columnResize: true,
            columnReorder: true
        }).init();

        return table.refresh().then(() => {
            const handle = root.querySelector('.vt-resize-handle');
            handle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));

            const firstHeader = root.querySelector('th[data-key]');
            firstHeader.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight', altKey: true }));

            const state = table.getState();
            expect(Object.keys(state.columnWidths).length).toBeGreaterThan(0);
            expect(state.columnOrder.length).toBeGreaterThan(0);
        });
    });

    it('renders dropdown actions through plugin', () => {
        const root = document.getElementById('app');
        const actionSpy = vi.fn();
        const table = new VanillaTable(root, rows, {
            rowActions: [
                { id: 'edit', label: 'Edit', onClick: actionSpy },
                { id: 'delete', label: 'Delete', onClick: actionSpy }
            ]
        })
            .use(actionsDropdownPlugin())
            .init();

        return table.refresh().then(() => {
            expect(root.querySelector('.vt-action-select')).not.toBeNull();
        });
    });

    it('sanitizes render and expand HTML when sanitizeHtml is provided', () => {
        const root = document.getElementById('app');
        const table = new VanillaTable(
            root,
            [{ id: 1, name: 'Alice' }],
            {
                columns: [
                    {
                        key: 'name',
                        label: 'Name',
                        render: (value) => `<strong>${value}</strong>`
                    }
                ],
                expandableRows: true,
                expandRow: () => '<em>Details</em>',
                sanitizeHtml: (html) => html.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
            }
        ).init();

        return table.expandRow('1').then(() => {
            const bodyCell = root.querySelector('tbody tr.vt-row td[data-key="name"]');
            const expandedCell = root.querySelector('.vt-expand-content');
            expect(bodyCell.innerHTML).toContain('&lt;strong&gt;Alice&lt;/strong&gt;');
            expect(expandedCell.innerHTML).toContain('&lt;em&gt;Details&lt;/em&gt;');
        });
    });

    it('escapes shell labels to prevent markup injection', () => {
        const root = document.getElementById('app');
        new VanillaTable(root, rows, {
            i18n: {
                rows: '<img src=x onerror=alert(1)>',
                search: '<script>bad()</script>',
                first: '<b>First</b>',
                prev: '<b>Prev</b>',
                next: '<b>Next</b>',
                last: '<b>Last</b>'
            }
        }).init();

        expect(root.querySelector('.vt-controls span').textContent).toContain('<img src=x onerror=alert(1)>');
        expect(root.querySelectorAll('script')).toHaveLength(0);
        expect(root.querySelector('.vt-first').textContent).toBe('<b>First</b>');
    });
});
