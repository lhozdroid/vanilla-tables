import { themePlugin } from './theme-plugin.js';

/**
 * Creates a Tailwind-compatible theme plugin.
 *
 * @returns {(table: import('../core/vanilla-table.js').VanillaTable) => void}
 */
export function tailwindThemePlugin() {
    return themePlugin({
        shell: 'block',
        controls: 'flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3',
        searchWrap: 'inline-flex items-center gap-2 text-sm text-slate-700',
        sizeWrap: 'inline-flex items-center gap-2 text-sm text-slate-700',
        searchInput: 'rounded-md border border-slate-300 px-2 py-1 text-sm',
        sizeSelect: 'rounded-md border border-slate-300 px-2 py-1 text-sm',
        tableWrap: 'overflow-x-auto',
        table: 'min-w-full divide-y divide-slate-200',
        headerCell: 'bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600',
        bodyRow: 'border-b border-slate-100',
        bodyCell: 'px-3 py-2 text-sm text-slate-800',
        sortTrigger: 'inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900',
        columnFilter: 'w-full rounded-md border border-slate-300 px-2 py-1 text-sm',
        filterRow: 'bg-white',
        filterHeaderCell: 'bg-white px-3 py-2',
        footer: 'flex items-center justify-between gap-2 border-t border-slate-200 p-3',
        paginationGroup: 'inline-flex items-center gap-2 ml-auto',
        firstButton: 'rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50',
        prevButton: 'rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50',
        nextButton: 'rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50',
        lastButton: 'rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50',
        info: 'text-sm text-slate-600',
        expandTrigger: 'rounded-md border border-slate-300 px-2 py-0.5 text-sm hover:bg-slate-50',
        editableCell: 'bg-amber-50',
        actionsCell: 'px-3 py-2',
        actionButton: 'rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50',
        actionSelect: 'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm',
        actionHeader: 'bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600',
        emptyCell: 'px-3 py-6 text-center text-sm text-slate-500',
        expandContent: 'bg-slate-50 px-3 py-2 text-sm text-slate-700',
        fixedHeader: 'sticky top-0 z-10',
        fixedFooter: 'sticky bottom-0 z-10 bg-white',
        fixedColumn: 'bg-white'
    });
}
