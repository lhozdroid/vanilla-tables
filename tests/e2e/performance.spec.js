import { test, expect } from '@playwright/test';
import { openScenario } from './helpers.js';

const MAX_SEARCH_MS = Number(process.env.E2E_PERF_MAX_SEARCH_MS || 100);
const MAX_SORT_MS = Number(process.env.E2E_PERF_MAX_SORT_MS || 100);
const MAX_REFRESH_MS = Number(process.env.E2E_PERF_MAX_REFRESH_MS || 100);

/**
 * Validates large-dataset operation timings in milliseconds.
 */
test.describe('performance', () => {
    test('keeps search, sort, and refresh under strict millisecond limits', ({ page }) => {
        return openScenario(page, 'performance')
            .then(() =>
                page.evaluate(() => {
                    const table = window.__e2e.table;

                    const searchStart = performance.now();
                    return table.search('user 4999').then(() => {
                        const searchMs = performance.now() - searchStart;
                        const sortStart = performance.now();

                        return table.sortBy('age', 'desc').then(() => {
                            const sortMs = performance.now() - sortStart;
                            const refreshStart = performance.now();

                            return table.refresh().then(() => ({
                                searchMs,
                                sortMs,
                                refreshMs: performance.now() - refreshStart,
                                totalRows: table.getView().totalRows
                            }));
                        });
                    });
                })
            )
            .then((metrics) => {
                expect(metrics.totalRows).toBeGreaterThan(0);
                expect(metrics.searchMs).toBeLessThanOrEqual(MAX_SEARCH_MS);
                expect(metrics.sortMs).toBeLessThanOrEqual(MAX_SORT_MS);
                expect(metrics.refreshMs).toBeLessThanOrEqual(MAX_REFRESH_MS);
            });
    });
});
