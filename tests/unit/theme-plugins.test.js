import { beforeEach, describe, expect, it } from 'vitest';
import { VanillaTable } from '../../src/core/vanilla-table.js';
import { bootstrapThemePlugin } from '../../src/plugins/bootstrap-theme.js';
import { bulmaThemePlugin } from '../../src/plugins/bulma-theme.js';
import { muiThemePlugin } from '../../src/plugins/mui-theme.js';
import { tailwindThemePlugin } from '../../src/plugins/tailwind-theme.js';

/**
 * Validates first-party framework theme plugins.
 */
describe('theme plugins', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="theme"></div>';
    });

    /**
     * Creates a table instance with baseline row data.
     *
     * @returns {VanillaTable}
     */
    function createTable() {
        const root = document.getElementById('theme');
        return new VanillaTable(root, [{ id: '1', name: 'Alice', city: 'Rome' }]);
    }

    it('applies bootstrap theme classes', () => {
        const table = createTable().use(bootstrapThemePlugin()).init();

        return table.refresh().then(() => {
            expect(table.root.querySelector('.card')).toBeNull();
            expect(table.root.querySelector('.form-control')).not.toBeNull();
            expect(table.root.querySelector('.table.table-hover')).not.toBeNull();
        });
    });

    it('applies bulma theme classes', () => {
        const table = createTable().use(bulmaThemePlugin()).init();

        return table.refresh().then(() => {
            expect(table.root.querySelector('.box')).toBeNull();
            expect(table.root.querySelector('.input.is-small')).not.toBeNull();
            expect(table.root.querySelector('.table.is-fullwidth')).not.toBeNull();
        });
    });

    it('applies mui theme classes', () => {
        const table = createTable().use(muiThemePlugin()).init();

        return table.refresh().then(() => {
            expect(table.root.querySelector('.MuiBox-root')).not.toBeNull();
            expect(table.root.querySelector('.MuiTable-root')).not.toBeNull();
            expect(table.root.querySelector('.MuiButton-root')).not.toBeNull();
        });
    });

    it('applies tailwind theme classes', () => {
        const table = createTable().use(tailwindThemePlugin()).init();

        return table.refresh().then(() => {
            expect(table.root.querySelector('.rounded-xl')).toBeNull();
            expect(table.root.querySelector('.min-w-full')).not.toBeNull();
            expect(table.root.querySelector('.text-sm')).not.toBeNull();
        });
    });
});
