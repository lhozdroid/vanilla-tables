import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCursorAdapter, createGraphQLAdapter, createRestAdapter } from '../../src/adapters/server-adapters.js';

/**
 * Covers server adapter branch and fallback response paths.
 */
describe('server adapters branch coverage', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('covers REST GET endpoint with existing query string and default payload mapping', () => {
        fetch.mockResolvedValue({
            json: () => Promise.resolve({ rows: [{ id: 1 }], totalRows: 1 })
        });

        const adapter = createRestAdapter({ endpoint: '/api/items?tenant=1' });

        return adapter({ page: 1 }).then((result) => {
            expect(fetch.mock.calls[0][0]).toContain('&q=');
            expect(result.rows[0].id).toBe(1);
        });
    });

    it('covers GraphQL default payload branch without mapResponse', () => {
        fetch.mockResolvedValue({
            json: () => Promise.resolve({ data: { items: [{ id: 1 }] } })
        });

        const adapter = createGraphQLAdapter({
            endpoint: '/graphql',
            query: 'query Q($tableQuery: Input!) { items(query: $tableQuery) { id } }'
        });

        return adapter({ page: 1 }).then((result) => {
            expect(result.data.items[0].id).toBe(1);
        });
    });

    it('covers cursor fallback rows/totalRows branches', () => {
        const fetchPage = vi.fn().mockResolvedValue({ nextCursor: null });
        const adapter = createCursorAdapter({ fetchPage });

        return adapter({ page: 2, pageSize: 10, searchTerm: '', columnFilters: {}, sorts: [] }).then((result) => {
            expect(result.rows).toEqual([]);
            expect(result.totalRows).toBe(0);
        });
    });
});
