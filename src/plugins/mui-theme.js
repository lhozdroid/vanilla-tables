import { themePlugin } from './theme-plugin.js';

/**
 * Creates a Material UI-like utility class theme plugin.
 *
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function muiThemePlugin() {
    return themePlugin({
        shell: 'MuiBox-root',
        controls: 'MuiToolbar-root MuiToolbar-gutters',
        searchWrap: 'MuiFormControl-root',
        sizeWrap: 'MuiFormControl-root',
        searchInput: 'MuiInputBase-input MuiInputBase-sizeSmall',
        sizeSelect: 'MuiNativeSelect-select MuiInputBase-input MuiInputBase-sizeSmall',
        tableWrap: 'MuiTableContainer-root',
        table: 'MuiTable-root',
        headerCell: 'MuiTableCell-root MuiTableCell-head',
        bodyCell: 'MuiTableCell-root',
        sortTrigger: 'mui-sort-trigger',
        columnFilter: 'MuiInputBase-input MuiInputBase-sizeSmall',
        footer: 'MuiToolbar-root MuiToolbar-gutters',
        paginationGroup: 'MuiPagination-root',
        firstButton: 'MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall',
        prevButton: 'MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall',
        nextButton: 'MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall',
        lastButton: 'MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall',
        expandTrigger: 'MuiButtonBase-root MuiButton-root MuiButton-outlined MuiButton-sizeSmall',
        editableCell: 'MuiTableCell-editable',
        actionButton: 'MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-sizeSmall',
        actionSelect: 'MuiNativeSelect-select MuiInputBase-input MuiInputBase-sizeSmall',
        actionHeader: 'MuiTableCell-root MuiTableCell-head',
        fixedHeader: 'MuiTable-stickyHeader',
        fixedFooter: 'MuiTableFooter-root',
        fixedColumn: 'MuiTableCell-sticky'
    });
}
