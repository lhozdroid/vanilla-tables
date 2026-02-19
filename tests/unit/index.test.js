import { describe, expect, it } from 'vitest';
import * as lib from '../../src/index.js';

/**
 * Validates top-level package exports and factory bootstrap.
 */
describe('index exports', () => {
    it('exports core constructors and helpers', () => {
        expect(typeof lib.VanillaTable).toBe('function');
        expect(typeof lib.createVanillaTable).toBe('function');
        expect(typeof lib.stripedRowsPlugin).toBe('function');
        expect(typeof lib.themePlugin).toBe('function');
        expect(typeof lib.bootstrapThemePlugin).toBe('function');
        expect(typeof lib.bulmaThemePlugin).toBe('function');
        expect(typeof lib.muiThemePlugin).toBe('function');
        expect(typeof lib.tailwindThemePlugin).toBe('function');
        expect(typeof lib.actionsDropdownPlugin).toBe('function');
        expect(typeof lib.createRestAdapter).toBe('function');
        expect(typeof lib.createGraphQLAdapter).toBe('function');
        expect(typeof lib.createCursorAdapter).toBe('function');
    });

    it('creates an initialized table instance', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const table = lib.createVanillaTable(root, [{ id: 1, name: 'x' }]);
        expect(table).toBeInstanceOf(lib.VanillaTable);
        expect(root.querySelector('.vt-table')).not.toBeNull();
    });
});
