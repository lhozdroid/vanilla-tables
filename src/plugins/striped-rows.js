/**
 * Creates a plugin that applies striping classes to rendered rows.
 *
 * @param {{ className?: string }} [options]
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function stripedRowsPlugin(options = {}) {
    const className = options.className || 'vt-row-striped';

    return (table) => {
        table.registerHook('afterRowRender', ({ element }) => {
            const index = Array.from(element.parentElement.children).indexOf(element);
            if (index % 2 === 1) {
                element.classList.add(className);
            }
        });
    };
}
