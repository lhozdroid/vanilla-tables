import { VanillaTable } from './core/vanilla-table.js';
import { stripedRowsPlugin } from './plugins/striped-rows.js';
import { themePlugin } from './plugins/theme-plugin.js';
import { bootstrapThemePlugin } from './plugins/bootstrap-theme.js';
import { bulmaThemePlugin } from './plugins/bulma-theme.js';
import { muiThemePlugin } from './plugins/mui-theme.js';
import { tailwindThemePlugin } from './plugins/tailwind-theme.js';
import { actionsDropdownPlugin } from './plugins/actions-dropdown.js';
import { createRestAdapter, createGraphQLAdapter, createCursorAdapter } from './adapters/server-adapters.js';

export { VanillaTable, stripedRowsPlugin, themePlugin, bootstrapThemePlugin, bulmaThemePlugin, muiThemePlugin, tailwindThemePlugin, actionsDropdownPlugin, createRestAdapter, createGraphQLAdapter, createCursorAdapter };

/**
 * Creates and initializes a table instance.
 *
 * @param {HTMLElement} element
 * @param {Record<string, any>[]} rows
 * @param {Record<string, any>} [options]
 * @returns {VanillaTable}
 */
export function createVanillaTable(element, rows, options) {
    return new VanillaTable(element, rows, options).init();
}
