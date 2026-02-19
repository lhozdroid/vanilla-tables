/**
 * Creates a theme plugin that maps semantic keys to CSS classes.
 *
 * @param {Record<string, string>} classes
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function themePlugin(classes) {
    return (table) => {
        table.setThemeClasses(classes || {});
    };
}
