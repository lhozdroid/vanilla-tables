import { describe, expect, it } from 'vitest';
import { StateStore } from '../../src/core/state-store.js';

/**
 * Covers state-store edge branches and guard conditions.
 */
const baseRows = [
    { id: 1, name: 'Alpha', score: 10, city: 'Rome' },
    { id: 2, name: 'Beta', score: 20, city: 'Paris' },
    { id: 3, name: null, score: 'x', city: 'Oslo' }
];

const columns = [{ key: 'name' }, { key: 'score' }, { key: 'city' }];

describe('StateStore branch coverage', () => {
    it('covers constructor, setters, and state payload guards', () => {
        const withSort = new StateStore({ rows: baseRows, pageSize: 10, initialSort: { key: 'name' } });
        expect(withSort.getState().sorts[0].direction).toBe('asc');

        withSort.setRows(null);
        expect(withSort.rows).toEqual([]);

        withSort.setSearchTerm(null);
        expect(withSort.getState().searchTerm).toBe('');

        withSort.setColumnFilter('city', ' paris ');
        expect(withSort.getState().columnFilters.city).toBe('paris');
        withSort.setColumnFilter('city', '   ');
        expect(withSort.getState().columnFilters.city).toBeUndefined();

        withSort.setSorts(null);
        expect(withSort.getState().sorts).toEqual([]);

        withSort.setColumnOrder(null);
        expect(withSort.getState().columnOrder).toEqual([]);

        withSort.setColumnWidth('name', 12.2);
        expect(withSort.getState().columnWidths.name).toBe(60);

        withSort.setState(null);
        withSort.setState({
            page: 0,
            pageSize: 5,
            searchTerm: 'x',
            columnFilters: { city: 'os' },
            sorts: [{ key: 'city', direction: 'desc' }],
            columnOrder: ['city', 'name'],
            columnWidths: { city: 200 },
            columnVisibility: { score: false }
        });

        const state = withSort.getState();
        expect(state.page).toBe(1);
        expect(state.pageSize).toBe(5);
        expect(state.columnVisibility.score).toBe(false);
    });

    it('covers toggleSort branches and maxSorts rollover', () => {
        const store = new StateStore({ rows: baseRows, pageSize: 10, initialSort: null });

        store.toggleSort('name', false, 3);
        expect(store.getState().sorts).toEqual([{ key: 'name', direction: 'asc' }]);

        store.toggleSort('name', false, 3);
        expect(store.getState().sorts).toEqual([{ key: 'name', direction: 'desc' }]);

        store.toggleSort('score', true, 2);
        store.toggleSort('city', true, 2);
        expect(store.getState().sorts.map((item) => item.key)).toEqual(['score', 'city']);

        store.toggleSort('name', true, 2);
        expect(store.getState().sorts.map((item) => item.key)).toEqual(['city', 'name']);

        store.toggleSort('name', true, 2);
        expect(store.getState().sorts.find((item) => item.key === 'name').direction).toBe('desc');
    });

    it('covers filter/search/sort edge paths', () => {
        const store = new StateStore({ rows: baseRows, pageSize: 10, initialSort: null });

        store.setColumnFilter('unknown', 'a');
        // Ignores filters for unknown column keys.
        const unchanged = store.applyColumnFilters(baseRows, columns);
        expect(unchanged).toHaveLength(3);

        store.setColumnFilter('name', 'zz');
        const noMatch = store.applyColumnFilters(baseRows, columns);
        expect(noMatch).toHaveLength(0);

        store.clearFilters();
        const passthrough = store.applySearch(baseRows, columns);
        expect(passthrough).toHaveLength(3);

        store.setSearchTerm('beta');
        const searched = store.applySearch(baseRows, columns);
        expect(searched).toEqual([{ id: 2, name: 'Beta', score: 20, city: 'Paris' }]);

        store.setSorts([{ key: 'missing', direction: 'asc' }]);
        const unsorted = store.applySort(baseRows, columns);
        expect(unsorted).toEqual(baseRows);

        store.setSorts([{ key: 'name', direction: 'asc' }]);
        const sorted = store.applySort(baseRows, columns);
        expect(sorted[0].name).toBeNull();
    });

    it('enables worker projection for large sort-only queries', () => {
        const largeRows = Array.from({ length: 1200 }).map((_, index) => ({
            id: index + 1,
            name: `User ${index + 1}`,
            score: 1200 - index
        }));
        const store = new StateStore({
            rows: largeRows,
            pageSize: 10,
            initialSort: null,
            parallel: { enabled: true, threshold: 1, workers: 1 }
        });

        store.projectionWorkerPool = {
            setRows: () => Promise.resolve(),
            project: () => Promise.resolve([0, 1, 2]),
            destroy: () => {}
        };
        store.projectionWorkerReady = Promise.resolve();
        store.setSorts([{ key: 'name', direction: 'asc' }]);

        expect(store.canUseWorkerProjection()).toBe(true);
    });

    it('falls back to sync projection when worker projection fails', () => {
        const rows = Array.from({ length: 1200 }).map((_, index) => ({
            id: index + 1,
            name: `User ${index + 1}`,
            score: 1200 - index
        }));
        const store = new StateStore({
            rows,
            pageSize: 10,
            initialSort: null,
            parallel: { enabled: true, threshold: 1, workers: 1 }
        });

        store.projectionWorkerPool = {
            setRows: () => Promise.resolve(),
            project: () => Promise.reject(new Error('boom')),
            destroy: () => {}
        };
        store.projectionWorkerReady = Promise.resolve();
        store.setSearchTerm('user 3');

        return store.getVisibleRowsAsync([{ key: 'name' }, { key: 'score' }]).then((view) => {
            expect(view.totalRows).toBeGreaterThan(0);
            expect(store.projectionWorkerPool).toBeNull();
        });
    });

    it('supports incremental narrowing without stale broadening results', () => {
        const rows = Array.from({ length: 200 }).map((_, index) => ({
            id: index + 1,
            name: index % 2 === 0 ? `Alpha ${index}` : `Beta ${index}`,
            city: index % 3 === 0 ? 'Paris' : 'Rome'
        }));
        const store = new StateStore({ rows, pageSize: 200, initialSort: null });
        const queryColumns = [{ key: 'name' }, { key: 'city' }];

        store.setSearchTerm('alpha');
        const broad = store.getVisibleRows(queryColumns).rows.length;
        store.setSearchTerm('alpha 1');
        const narrow = store.getVisibleRows(queryColumns).rows.length;
        store.setSearchTerm('beta 19');
        const switched = store.getVisibleRows(queryColumns).rows.length;

        expect(narrow).toBeLessThanOrEqual(broad);
        expect(switched).toBeGreaterThan(0);
        expect(switched).not.toBe(narrow);
    });
});
