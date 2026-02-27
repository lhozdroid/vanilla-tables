import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { chromium } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = Number(process.env.STRESS_PORT || 4173);
const SIZES = parseSizes(process.env.STRESS_SIZES) || [10000, 25000, 50000, 100000, 200000, 300000];
const MAX_RENDER_MS = Number(process.env.STRESS_MAX_RENDER_MS || 100);
const MAX_REFRESH_HIT_MS = Number(process.env.STRESS_MAX_REFRESH_HIT_MS || 100);
const MAX_SEARCH_MS = Number(process.env.STRESS_MAX_SEARCH_MS || 100);
const MAX_SORT_MS = Number(process.env.STRESS_MAX_SORT_MS || 100);
const WARMUP_RUNS = Math.max(0, Number(process.env.STRESS_WARMUP_RUNS || 1));
const REPEAT_RUNS = Math.max(1, Number(process.env.STRESS_REPEAT_RUNS || 1));

/**
 * Parses a comma-separated sizes list.
 *
 * @param {string | undefined} raw
 * @returns {number[] | null}
 */
function parseSizes(raw) {
    if (!raw) return null;

    const values = raw
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);

    return values.length ? values : null;
}

/**
 * Waits until the local fixture server is reachable.
 *
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
function waitForServer(timeoutMs) {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
        const tryConnect = () => {
            const req = request(
                {
                    host: HOST,
                    port: PORT,
                    path: '/demo/index.html',
                    method: 'GET'
                },
                (res) => {
                    res.resume();
                    if (res.statusCode >= 200 && res.statusCode < 500) {
                        resolve();
                        return;
                    }
                    retry();
                }
            );

            req.on('error', retry);
            req.end();
        };

        const retry = () => {
            if (Date.now() - startedAt > timeoutMs) {
                reject(new Error(`Timeout waiting for fixture server on http://${HOST}:${PORT}`));
                return;
            }
            setTimeout(tryConnect, 150);
        };

        tryConnect();
    });
}

/**
 * Starts the local fixture server process.
 *
 * @returns {{ server: import('node:child_process').ChildProcess, stop: () => void }}
 */
function startServer() {
    const server = spawn('node', ['tests/e2e/server.mjs'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    server.stdout?.on('data', (chunk) => {
        process.stdout.write(`[stress-server] ${chunk}`);
    });
    server.stderr?.on('data', (chunk) => {
        process.stderr.write(`[stress-server] ${chunk}`);
    });

    const stop = () => {
        if (!server.killed) {
            server.kill('SIGTERM');
        }
    };

    process.on('exit', stop);
    process.on('SIGINT', () => {
        stop();
        process.exit(130);
    });

    return { server, stop };
}

/**
 * Runs one stress iteration in the browser page.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} size
 * @returns {Promise<{ size: number, renderMs: number, refreshHitMs: number, searchMs: number, sortMs: number, totalRows: number, ok: boolean, reason: string }>}
 */
function runIteration(page, size) {
    return page.evaluate((rowCount) => {
        const buildRows = (count) => {
            const cities = ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Lisbon'];
            return Array.from({ length: count }).map((_, index) => ({
                id: String(index + 1),
                name: `User ${index + 1}`,
                city: cities[index % cities.length],
                score: index % 1000,
                active: index % 2 === 0
            }));
        };

        const ensureRoot = () => {
            const existing = document.getElementById('stress-root');
            if (existing) {
                existing.innerHTML = '';
                return existing;
            }
            const root = document.createElement('div');
            root.id = 'stress-root';
            document.body.innerHTML = '';
            document.body.appendChild(root);
            return root;
        };

        return import('/dist/vanilla-tables.js').then((lib) => {
            const root = ensureRoot();
            const rows = buildRows(rowCount);
            const startedAt = performance.now();
            const table = lib.createVanillaTable(root, rows, {
                pageSize: 50,
                debounceMs: 0,
                columns: [
                    { key: 'id', label: 'ID' },
                    { key: 'name', label: 'Name' },
                    { key: 'city', label: 'City' },
                    { key: 'score', label: 'Score' },
                    { key: 'active', label: 'Active' }
                ]
            });

            return table.refresh().then(() => {
                const renderMs = performance.now() - startedAt;
                const refreshHitAt = performance.now();
                return table.refresh().then(() => {
                    const refreshHitMs = performance.now() - refreshHitAt;
                    const initialView = table.getView();
                    const searchAt = performance.now();

                    return table.search('user 9').then(() => {
                        const searchMs = performance.now() - searchAt;
                        const sortAt = performance.now();

                        return table.sortBy('score', 'desc').then(() => {
                            const sortMs = performance.now() - sortAt;
                            const view = table.getView();
                            table.destroy();

                            return {
                                size: rowCount,
                                renderMs,
                                refreshHitMs,
                                searchMs,
                                sortMs,
                                totalRows: initialView.totalRows,
                                ok: true,
                                reason: ''
                            };
                        });
                    });
                });
            });
        });
    }, size);
}

/**
 * Evaluates whether iteration timings are within stability thresholds.
 *
 * @param {{ renderMs: number, refreshHitMs: number, searchMs: number, sortMs: number }} result
 * @returns {{ ok: boolean, reason: string }}
 */
function evaluateThresholds(result) {
    if (result.renderMs > MAX_RENDER_MS) {
        return { ok: false, reason: `render ${Math.round(result.renderMs)}ms > ${MAX_RENDER_MS}ms` };
    }
    if (result.refreshHitMs > MAX_REFRESH_HIT_MS) {
        return {
            ok: false,
            reason: `refresh-hit ${Math.round(result.refreshHitMs)}ms > ${MAX_REFRESH_HIT_MS}ms`
        };
    }
    if (result.searchMs > MAX_SEARCH_MS) {
        return { ok: false, reason: `search ${Math.round(result.searchMs)}ms > ${MAX_SEARCH_MS}ms` };
    }
    if (result.sortMs > MAX_SORT_MS) {
        return { ok: false, reason: `sort ${Math.round(result.sortMs)}ms > ${MAX_SORT_MS}ms` };
    }
    return { ok: true, reason: '' };
}

/**
 * Returns median value from a numeric list.
 *
 * @param {number[]} values
 * @returns {number}
 */
function median(values) {
    const sorted = [...values].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
}

/**
 * Runs warmups plus repeated measured iterations and returns median metrics.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} size
 * @returns {Promise<{ size: number, renderMs: number, refreshHitMs: number, searchMs: number, sortMs: number, totalRows: number, ok: boolean, reason: string }>}
 */
function runMeasuredIteration(page, size) {
    const warmup = (remaining) => {
        if (remaining <= 0) return Promise.resolve();
        return runIteration(page, size).then(() => warmup(remaining - 1));
    };

    const measured = [];
    const runMeasured = (remaining) => {
        if (remaining <= 0) return Promise.resolve();
        return runIteration(page, size).then((result) => {
            measured.push(result);
            return runMeasured(remaining - 1);
        });
    };

    return warmup(WARMUP_RUNS).then(() =>
        runMeasured(REPEAT_RUNS).then(() => {
            return {
                size,
                renderMs: median(measured.map((item) => item.renderMs)),
                refreshHitMs: median(measured.map((item) => item.refreshHitMs)),
                searchMs: median(measured.map((item) => item.searchMs)),
                sortMs: median(measured.map((item) => item.sortMs)),
                totalRows: measured[measured.length - 1]?.totalRows || 0,
                ok: true,
                reason: ''
            };
        })
    );
}

/**
 * Runs the stress benchmark sequence.
 *
 * @returns {Promise<void>}
 */
function run() {
    const serverCtl = startServer();
    let browser;
    let page;

    const results = [];
    let maxStable = 0;

    return waitForServer(20_000)
        .then(() => chromium.launch({ headless: true }))
        .then((instance) => {
            browser = instance;
            return browser.newPage();
        })
        .then((createdPage) => {
            page = createdPage;
            return page.goto(`http://${HOST}:${PORT}/demo/index.html`);
        })
        .then(() => {
            const iterate = (index) => {
                if (index >= SIZES.length) return Promise.resolve();

                const size = SIZES[index];
                return runMeasuredIteration(page, size)
                    .then((result) => {
                        const verdict = evaluateThresholds(result);
                        const merged = {
                            ...result,
                            ok: verdict.ok,
                            reason: verdict.reason
                        };

                        results.push(merged);
                        if (merged.ok) {
                            maxStable = size;
                            return iterate(index + 1);
                        }
                        return Promise.resolve();
                    })
                    .catch((error) => {
                        results.push({
                            size,
                            renderMs: Number.NaN,
                            refreshHitMs: Number.NaN,
                            searchMs: Number.NaN,
                            sortMs: Number.NaN,
                            totalRows: 0,
                            ok: false,
                            reason: `error: ${error.message}`
                        });
                        return Promise.resolve();
                    });
            };

            return iterate(0);
        })
        .then(() => {
            const printable = results.map((item) => ({
                rows: item.size,
                render_ms: Number.isFinite(item.renderMs) ? Math.round(item.renderMs) : 'ERR',
                refresh_hit_ms: Number.isFinite(item.refreshHitMs) ? Math.round(item.refreshHitMs) : 'ERR',
                search_ms: Number.isFinite(item.searchMs) ? Math.round(item.searchMs) : 'ERR',
                sort_ms: Number.isFinite(item.sortMs) ? Math.round(item.sortMs) : 'ERR',
                total_rows: item.totalRows,
                status: item.ok ? 'OK' : `STOP (${item.reason})`
            }));

            console.log('\nStress benchmark results\n');
            console.table(printable);
            console.log(`Largest stable dataset: ${maxStable} rows`);
            console.log(`Thresholds: render<=${MAX_RENDER_MS}ms, refresh-hit<=${MAX_REFRESH_HIT_MS}ms, search<=${MAX_SEARCH_MS}ms, sort<=${MAX_SORT_MS}ms`);
            console.log(`Sampling: warmup-runs=${WARMUP_RUNS}, repeat-runs=${REPEAT_RUNS} (median)`);
        })
        .finally(() => {
            const closeBrowser = browser ? browser.close().catch(() => {}) : Promise.resolve();
            return closeBrowser.finally(() => {
                serverCtl.stop();
            });
        });
}

run().catch((error) => {
    console.error('\nStress benchmark failed:\n', error);
    process.exit(1);
});
