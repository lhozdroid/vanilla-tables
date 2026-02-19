import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VanillaTable } from '../../src/core/vanilla-table.js';

/**
 * Exercises public API methods and observable lifecycle events.
 */
describe('VanillaTable API coverage', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="api"></div>';
        window.localStorage.clear();
        window.history.replaceState({}, '', window.location.pathname);
    });

    it('covers public API methods and emits events', () => {
        const root = document.getElementById('api');
        const events = [];
        const table = new VanillaTable(
            root,
            [
                { id: '1', name: 'A', city: 'Rome', score: 10 },
                { id: '2', name: 'B', city: 'Paris', score: 20 },
                { id: '3', name: 'C', city: 'Paris', score: 30 }
            ],
            {
                expandableRows: true,
                expandRow: (row) => `<div>${row.name}</div>`,
                editableRows: true,
                editableColumns: { score: true },
                rowActions: [{ id: 'x', label: 'X', onClick: () => {} }],
                persistence: { enabled: true, storageKey: 'vt-api' },
                urlSync: { enabled: true, param: 'vtapi' },
                virtualScroll: { enabled: true, rowHeight: 40, overscan: 2, height: 120 }
            }
        ).init();

        table.on('row:expand', (payload) => events.push(['expand', payload]));
        table.on('row:collapse', (payload) => events.push(['collapse', payload]));
        table.on('column:visibility', (payload) => events.push(['visibility', payload]));

        return table
            .refresh()
            .then(() => table.search('b'))
            .then(() => table.filterBy('city', 'par'))
            .then(() => table.clearFilters())
            .then(() => table.sortBy('score', 'desc'))
            .then(() => table.clearSort())
            .then(() => table.goToPage(1))
            .then(() => table.setPageSize(2))
            .then(() => table.expandRow('2'))
            .then(() => table.collapseRow('2'))
            .then(() => table.toggleRow('1'))
            .then(() => table.expandAllRows())
            .then(() => table.collapseAllRows())
            .then(() => table.updateCell('1', 'name', 'AA'))
            .then(() => table.setColumnEditable('name', false))
            .then(() => table.setColumnWidth('name', 240))
            .then(() => table.reorderColumns(['score', 'name', 'city']))
            .then(() => table.setColumnVisibility('city', false))
            .then(() => table.toggleColumnVisibility('city'))
            .then(() => table.addRow({ id: '4', name: 'D', city: 'Rome', score: 40 }))
            .then(() => table.removeRowById('4'))
            .then(() => table.setState({ page: 1, expandedRowIds: ['1'], columnVisibility: { city: true } }))
            .then(() => table.setData([{ id: 'n1', name: 'N', city: 'Oslo', score: 50 }]))
            .then(() => {
                expect(table.getRows().length).toBe(1);
                expect(table.getView().totalRows).toBeGreaterThanOrEqual(1);
                const state = table.getState();
                expect(state.expandedRowIds).toContain('1');
                expect(state.columnWidths.name).toBeGreaterThanOrEqual(60);
                expect(events.length).toBeGreaterThan(0);
            });
    });

    it('covers error path when server mode fetch is missing', () => {
        const root = document.getElementById('api');
        const errors = [];
        const table = new VanillaTable(root, [], { serverSide: true }).init();
        table.on('error', (payload) => errors.push(payload));

        return table.refresh().then(() => {
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    it('covers debug emit branch and destroy cleanup', () => {
        const root = document.getElementById('api');
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const table = new VanillaTable(root, [{ id: 1 }], { events: { debug: true } }).init();

        table.emitEvent('custom:event', { ok: true });
        table.destroy();

        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});
