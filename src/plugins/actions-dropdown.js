/**
 * Creates a plugin that renders row actions as a compact dropdown.
 *
 * @param {{ placeholder?: string }} [options]
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function actionsDropdownPlugin(options = {}) {
    return (table) => {
        table.registerHook('afterRowRender', ({ element }) => {
            const cell = element.querySelector('.vt-actions-cell');
            if (!cell) return;

            const buttons = [...cell.querySelectorAll('.vt-action-btn')];
            if (buttons.length < 2) return;

            const select = document.createElement('select');
            select.className = table.renderer?.theme?.classOf ? table.renderer.theme.classOf('actionSelect', 'vt-action-select') : 'vt-action-select';

            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = options.placeholder || 'Actions';
            select.appendChild(placeholder);

            buttons.forEach((button) => {
                const option = document.createElement('option');
                option.value = button.dataset.actionId || '';
                option.textContent = button.textContent || button.dataset.actionId || '';
                select.appendChild(option);
            });

            select.addEventListener('change', () => {
                const id = select.value;
                if (!id) return;

                const rowId = element.dataset.rowId;
                const row = table.findRowById(rowId);
                const action = table.options.rowActions.find((item) => item.id === id);
                if (action && row) {
                    Promise.resolve(action.onClick ? action.onClick({ row, rowId, actionId: id, table, event: new Event('change') }) : null).finally(() => {
                        table.emitEvent('row:action', { row, rowId, actionId: id });
                        table.refresh();
                    });
                }

                select.value = '';
            });

            cell.innerHTML = '';
            cell.appendChild(select);
        });
    };
}
