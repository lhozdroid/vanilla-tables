import { describe, expect, it } from 'vitest';
import { StateStore } from '../../src/core/state-store.js';

/**
 * Validates core state projection features: search, filter, sort, and paging.
 */
const rows = [
    { name: 'Ari', score: 10, city: 'Rome' },
    { name: 'Bea', score: 30, city: 'Paris' },
    { name: 'Cal', score: 20, city: 'Paris' }
];

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score' },
    { key: 'city', label: 'City' }
];

describe('StateStore', () => {
    it('filters rows by search term', () => {
        const store = new StateStore({ rows, pageSize: 10, initialSort: null });
        store.setSearchTerm('be');

        const view = store.getVisibleRows(columns);
        expect(view.rows).toEqual([{ name: 'Bea', score: 30, city: 'Paris' }]);
    });

    it('filters rows by column filters', () => {
        const store = new StateStore({ rows, pageSize: 10, initialSort: null });
        store.setColumnFilter('city', 'paris');

        const view = store.getVisibleRows(columns);
        expect(view.rows).toHaveLength(2);
    });

    it('sorts rows by numeric values', () => {
        const store = new StateStore({ rows, pageSize: 10, initialSort: null });
        store.toggleSort('score', false, 3);

        const view = store.getVisibleRows(columns);
        expect(view.rows.map((row) => row.score)).toEqual([10, 20, 30]);
    });

    it('supports additive multi-sort', () => {
        const store = new StateStore({
            rows: [
                { city: 'A', score: 2 },
                { city: 'A', score: 1 },
                { city: 'B', score: 3 }
            ],
            pageSize: 10,
            initialSort: null
        });

        store.toggleSort('city', false, 3);
        store.toggleSort('score', true, 3);

        const view = store.getVisibleRows([
            { key: 'city', label: 'City' },
            { key: 'score', label: 'Score' }
        ]);

        expect(view.rows.map((row) => row.score)).toEqual([1, 2, 3]);
    });

    it('paginates rows', () => {
        const store = new StateStore({ rows, pageSize: 2, initialSort: null });
        store.setPage(2);

        const view = store.getVisibleRows(columns);
        expect(view.rows).toEqual([{ name: 'Cal', score: 20, city: 'Paris' }]);
    });

    it('orders columns by configured state order', () => {
        const store = new StateStore({ rows, pageSize: 10, initialSort: null });
        store.setColumnOrder(['score', 'name', 'city']);

        const ordered = store.getOrderedColumns(columns);
        expect(ordered.map((column) => column.key)).toEqual(['score', 'name', 'city']);
    });

    it('normalizes invalid page size values to safe integers', () => {
        const store = new StateStore({ rows, pageSize: 0, initialSort: null });
        expect(store.getState().pageSize).toBe(1);

        store.setPageSize(-5);
        expect(store.getState().pageSize).toBe(1);

        store.setState({ pageSize: 2.8 });
        expect(store.getState().pageSize).toBe(2);
    });

    it('normalizes restored search and column filters', () => {
        const store = new StateStore({ rows, pageSize: 10, initialSort: null });
        store.setState({
            searchTerm: '  PAR  ',
            columnFilters: {
                city: '  PARIS ',
                name: '   '
            }
        });

        const state = store.getState();
        expect(state.searchTerm).toBe('par');
        expect(state.columnFilters).toEqual({ city: 'paris' });
    });
});
