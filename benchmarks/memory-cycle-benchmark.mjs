import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { chromium } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = Number(process.env.STRESS_PORT || 4173);
const ROWS = Number(process.env.MEM_BENCH_ROWS || 50000);
const CYCLES = Number(process.env.MEM_BENCH_CYCLES || 20);

/**
 * Waits for fixture server availability.
 *
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
function waitForServer(timeoutMs) {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
        const probe = () => {
            const req = request({ host: HOST, port: PORT, path: '/demo/index.html', method: 'GET' }, (res) => {
                res.resume();
                if (res.statusCode >= 200 && res.statusCode < 500) {
                    resolve();
                    return;
                }
                retry();
            });

            req.on('error', retry);
            req.end();
        };

        const retry = () => {
            if (Date.now() - startedAt > timeoutMs) {
                reject(new Error('timeout waiting for fixture server'));
                return;
            }
            setTimeout(probe, 150);
        };

        probe();
    });
}

/**
 * Starts fixture server process.
 *
 * @returns {{ stop: () => void }}
 */
function startServer() {
    const server = spawn('node', ['tests/e2e/server.mjs'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    server.stdout?.on('data', (chunk) => process.stdout.write(`[mem-server] ${chunk}`));
    server.stderr?.on('data', (chunk) => process.stderr.write(`[mem-server] ${chunk}`));

    return {
        stop: () => {
            if (!server.killed) server.kill('SIGTERM');
        }
    };
}

/**
 * Runs memory stability loop in browser page.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ first: number|null, last: number|null, max: number|null, min: number|null }>}
 */
function runCycles(page) {
    return page.evaluate(
        ({ rowCount, cycles }) => {
            const makeRows = (count) =>
                Array.from({ length: count }).map((_, index) => ({
                    id: String(index + 1),
                    name: `User ${index + 1}`,
                    city: index % 2 ? 'Paris' : 'Rome',
                    score: index % 1000
                }));

            const memoryOf = () => (performance?.memory?.usedJSHeapSize ? Number(performance.memory.usedJSHeapSize) : null);

            return import('/dist/vanilla-tables.js').then((lib) => {
                const root = document.getElementById('stress-root') || document.body.appendChild(document.createElement('div'));
                root.id = 'stress-root';
                root.innerHTML = '';

                const table = lib.createVanillaTable(root, makeRows(rowCount), {
                    pageSize: 50,
                    debounceMs: 0,
                    columns: [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'Name' },
                        { key: 'city', label: 'City' },
                        { key: 'score', label: 'Score' }
                    ]
                });

                const points = [];
                const loop = (left) => {
                    if (left <= 0) return Promise.resolve();
                    return table
                        .search(`user ${left}`)
                        .then(() => table.sortBy('score', left % 2 ? 'asc' : 'desc'))
                        .then(() => table.clearFilters())
                        .then(() => table.refresh())
                        .then(() => {
                            points.push(memoryOf());
                            return loop(left - 1);
                        });
                };

                return loop(cycles).then(() => {
                    table.destroy();
                    const numeric = points.filter((value) => Number.isFinite(value));
                    if (!numeric.length) {
                        return { first: null, last: null, max: null, min: null };
                    }
                    return {
                        first: numeric[0],
                        last: numeric[numeric.length - 1],
                        max: Math.max(...numeric),
                        min: Math.min(...numeric)
                    };
                });
            });
        },
        { rowCount: ROWS, cycles: CYCLES }
    );
}

function run() {
    const server = startServer();
    let browser;

    return waitForServer(20_000)
        .then(() => chromium.launch({ headless: true }))
        .then((instance) => {
            browser = instance;
            return browser.newPage();
        })
        .then((page) => page.goto(`http://${HOST}:${PORT}/demo/index.html`).then(() => runCycles(page)))
        .then((stats) => {
            console.log('\nMemory cycle benchmark\n');
            console.table({
                rows: ROWS,
                cycles: CYCLES,
                first_heap_mb: stats.first ? (stats.first / (1024 * 1024)).toFixed(1) : 'N/A',
                last_heap_mb: stats.last ? (stats.last / (1024 * 1024)).toFixed(1) : 'N/A',
                min_heap_mb: stats.min ? (stats.min / (1024 * 1024)).toFixed(1) : 'N/A',
                max_heap_mb: stats.max ? (stats.max / (1024 * 1024)).toFixed(1) : 'N/A'
            });
        })
        .finally(() => {
            const close = browser ? browser.close().catch(() => {}) : Promise.resolve();
            return close.finally(() => server.stop());
        });
}

run().catch((error) => {
    console.error('\nMemory cycle benchmark failed:\n', error);
    process.exit(1);
});
