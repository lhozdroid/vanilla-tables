import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.env.E2E_PORT || 4173);

/**
 * Resolves the absolute file path for a request URL.
 *
 * @param {string} path
 * @returns {string}
 */
function resolvePath(path) {
    if (path === '/' || path === '/index.html') {
        return join(ROOT, 'tests/e2e/fixtures/index.html');
    }

    if (path.startsWith('/fixtures/')) {
        return join(ROOT, 'tests/e2e', normalize(path).replace(/^\//, ''));
    }

    return join(ROOT, normalize(path).replace(/^\//, ''));
}

/**
 * Returns MIME type by file extension.
 *
 * @param {string} path
 * @returns {string}
 */
function contentType(path) {
    const ext = extname(path);
    const map = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.mjs': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.map': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png'
    };
    return map[ext] || 'application/octet-stream';
}

createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = resolvePath(url.pathname);

    readFile(path)
        .then((body) => {
            res.writeHead(200, { 'Content-Type': contentType(path) });
            res.end(body);
        })
        .catch(() => {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found');
        });
}).listen(PORT, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`E2E fixture server listening on http://127.0.0.1:${PORT}`);
});
