import { themePlugin } from './theme-plugin.js';

/**
 * Creates a Bootstrap-compatible theme plugin.
 *
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function bootstrapThemePlugin() {
    return themePlugin({
        shell: 'border-0 rounded-0 bg-transparent',
        controls: 'd-flex flex-wrap gap-2 align-items-center justify-content-between w-100',
        searchWrap: 'd-inline-flex align-items-center gap-2',
        sizeWrap: 'd-inline-flex align-items-center gap-2',
        searchInput: 'form-control form-control-sm',
        sizeSelect: 'form-select form-select-sm',
        tableWrap: 'table-responsive',
        table: 'table table-hover table-striped mb-0',
        sortTrigger: 'btn btn-sm p-0 border-0 bg-transparent text-body fw-semibold',
        actionHeader: 'text-body fw-semibold small',
        columnFilter: 'form-control form-control-sm',
        actionSelect: 'form-select form-select-sm w-auto',
        actionButton: 'btn btn-outline-secondary btn-sm',
        footer: 'd-flex justify-content-between align-items-center mt-2',
        paginationGroup: 'd-inline-flex align-items-center gap-2 ms-auto',
        firstButton: 'btn btn-outline-secondary btn-sm',
        prevButton: 'btn btn-outline-secondary btn-sm',
        nextButton: 'btn btn-outline-secondary btn-sm',
        lastButton: 'btn btn-outline-secondary btn-sm',
        expandTrigger: 'btn btn-outline-primary btn-sm',
        editableCell: 'bg-light-subtle'
    });
}
