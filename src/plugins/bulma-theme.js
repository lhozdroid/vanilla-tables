import { themePlugin } from './theme-plugin.js';

/**
 * Creates a Bulma-compatible theme plugin.
 *
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function bulmaThemePlugin() {
    return themePlugin({
        shell: 'is-block',
        controls: 'level is-mobile mb-3',
        searchWrap: 'field has-addons',
        sizeWrap: 'field has-addons',
        searchInput: 'input is-small',
        sizeSelect: 'select is-small',
        tableWrap: 'table-container',
        table: 'table is-fullwidth is-hoverable is-striped',
        sortTrigger: 'button is-white is-small',
        columnFilter: 'input is-small',
        footer: 'level mt-3',
        paginationGroup: 'buttons are-small',
        firstButton: 'button is-light is-small',
        prevButton: 'button is-light is-small',
        nextButton: 'button is-light is-small',
        lastButton: 'button is-light is-small',
        expandTrigger: 'button is-info is-light is-small',
        editableCell: 'has-background-light',
        actionButton: 'button is-small is-primary is-light',
        actionSelect: 'select is-small',
        actionHeader: 'has-text-weight-semibold',
        fixedHeader: 'has-background-white-ter',
        fixedFooter: 'has-background-white-ter'
    });
}
