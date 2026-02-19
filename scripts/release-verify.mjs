import { createRequire } from 'node:module';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';

const MAX_MIN_KB = Number(process.env.MAX_MIN_KB || 180);
const MAX_CSS_KB = Number(process.env.MAX_CSS_KB || 80);
const MAX_MIN_GZIP_KB = Number(process.env.MAX_MIN_GZIP_KB || 50);
const MAX_CSS_GZIP_KB = Number(process.env.MAX_CSS_GZIP_KB || 20);

const requiredFiles = ['dist/vanilla-tables.js', 'dist/vanilla-tables.cjs', 'dist/vanilla-tables.min.js', 'dist/vanilla-tables.css'];

for (const file of requiredFiles) {
    if (!existsSync(file)) {
        throw new Error(`Missing required build artifact: ${file}`);
    }
}

checkSize('dist/vanilla-tables.min.js', MAX_MIN_KB, MAX_MIN_GZIP_KB);
checkSize('dist/vanilla-tables.css', MAX_CSS_KB, MAX_CSS_GZIP_KB);

const require = createRequire(import.meta.url);
const cjs = require('../dist/vanilla-tables.cjs');
if (typeof cjs.VanillaTable !== 'function' || typeof cjs.createVanillaTable !== 'function') {
    throw new Error('CJS export smoke check failed for VanillaTable/createVanillaTable');
}

import('../dist/vanilla-tables.js')
    .then((esm) => {
        if (typeof esm.VanillaTable !== 'function' || typeof esm.createVanillaTable !== 'function') {
            throw new Error('ESM export smoke check failed for VanillaTable/createVanillaTable');
        }
        return runPackCheck();
    })
    .then(() => {
        console.log('Release verify passed');
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
 * Runs npm pack and validates packed files.
 *
 * @returns {Promise<void>}
 */
function runPackCheck() {
    const pack = spawnSync('npm', ['pack', '--json'], { encoding: 'utf8' });
    if (pack.status !== 0) {
        return Promise.reject(new Error(`npm pack failed:\n${pack.stderr || pack.stdout}`));
    }

    const packInfo = JSON.parse(pack.stdout || '[]')[0];
    if (!packInfo?.filename) {
        return Promise.reject(new Error('npm pack returned no filename'));
    }

    const tarList = spawnSync('tar', ['-tf', packInfo.filename], { encoding: 'utf8' });
    if (tarList.status !== 0) {
        unlinkIfExists(packInfo.filename);
        return Promise.reject(new Error(`Unable to inspect packed tarball ${packInfo.filename}`));
    }

    const listed = tarList.stdout || '';
    for (const expected of ['package/dist/vanilla-tables.js', 'package/dist/vanilla-tables.cjs', 'package/README.md']) {
        if (!listed.includes(expected)) {
            unlinkIfExists(packInfo.filename);
            return Promise.reject(new Error(`Packed tarball missing expected file: ${expected}`));
        }
    }

    unlinkIfExists(packInfo.filename);
    return Promise.resolve();
}

/**
 * Validates raw and gzip bundle size limits.
 *
 * @param {string} file
 * @param {number} maxRawKb
 * @param {number} maxGzipKb
 * @returns {void}
 */
function checkSize(file, maxRawKb, maxGzipKb) {
    const content = readFileSync(file);
    const rawKb = content.length / 1024;
    const gzipKb = gzipSync(content).length / 1024;

    if (rawKb > maxRawKb) {
        throw new Error(`${file} exceeds raw budget: ${rawKb.toFixed(1)}kb > ${maxRawKb}kb`);
    }
    if (gzipKb > maxGzipKb) {
        throw new Error(`${file} exceeds gzip budget: ${gzipKb.toFixed(1)}kb > ${maxGzipKb}kb`);
    }
}

/**
 * Removes one file if present.
 *
 * @param {string} file
 * @returns {void}
 */
function unlinkIfExists(file) {
    if (existsSync(file)) unlinkSync(file);
}
