import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createCursorAdapter, createGraphQLAdapter, createRestAdapter } from '../../src/adapters/server-adapters.js';

/**
 * Validates primary REST, GraphQL, and cursor adapter flows.
 */
describe('server adapters', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('creates REST GET adapter', () => {
        fetch.mockResolvedValue({
            json: () => Promise.resolve({ rows: [{ id: 1 }], totalRows: 1 })
        });

        const adapter = createRestAdapter({ endpoint: '/api/items' });

        return adapter({ page: 1, pageSize: 10 }).then((result) => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toContain('/api/items?');
            expect(result.totalRows).toBe(1);
        });
    });

    it('creates REST POST adapter', () => {
        fetch.mockResolvedValue({
            json: () => Promise.resolve({ rows: [{ id: 2 }], totalRows: 1 })
        });

        const adapter = createRestAdapter({ endpoint: '/api/items', method: 'POST' });

        return adapter({ page: 2 }).then(() => {
            const init = fetch.mock.calls[0][1];
            expect(init.method).toBe('POST');
            expect(init.body).toContain('"page":2');
        });
    });

    it('creates GraphQL adapter', () => {
        fetch.mockResolvedValue({
            json: () => Promise.resolve({ data: { items: [] } })
        });

        const adapter = createGraphQLAdapter({
            endpoint: '/graphql',
            query: 'query Q($tableQuery: Input!) { items(query: $tableQuery) { id } }',
            mapResponse: () => ({ rows: [], totalRows: 0 })
        });

        return adapter({ page: 1 }).then((result) => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(result.totalRows).toBe(0);
        });
    });

    it('creates cursor adapter and resets cursor on first page', () => {
        const fetchPage = vi
            .fn()
            .mockResolvedValueOnce({ rows: [{ id: 1 }], nextCursor: 'next', totalRows: 5 })
            .mockResolvedValueOnce({ rows: [{ id: 2 }], nextCursor: null, totalRows: 5 })
            .mockResolvedValueOnce({ rows: [{ id: 3 }], nextCursor: null, totalRows: 5 });

        const adapter = createCursorAdapter({ fetchPage });

        return adapter({ page: 1, pageSize: 1, searchTerm: '', columnFilters: {}, sorts: [] })
            .then(() => adapter({ page: 2, pageSize: 1, searchTerm: '', columnFilters: {}, sorts: [] }))
            .then(() => adapter({ page: 1, pageSize: 1, searchTerm: '', columnFilters: {}, sorts: [] }))
            .then((result) => {
                expect(fetchPage).toHaveBeenCalledTimes(3);
                expect(result.rows[0].id).toBe(3);
            });
    });
});
