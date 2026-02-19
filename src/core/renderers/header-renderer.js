/**
 * Renders table header with sort and filter controls.
 */
export class HeaderRenderer {
    /**
     * Creates a header renderer instance.
     *
     * @param {{ options: Record<string, any>, theme: import('../themes/theme-manager.js').ThemeManager }} config
     */
    constructor({ options, theme }) {
        /** @type {Record<string, any>} */
        this.options = options;
        /** @type {import('../themes/theme-manager.js').ThemeManager} */
        this.theme = theme;
    }

    /**
     * Renders header rows.
     *
     * @param {HTMLTableSectionElement} thead
     * @param {{ key: string, label: string, sortable?: boolean, filterable?: boolean }[]} columns
     * @param {{ key: string, direction: 'asc'|'desc' }[]} sortState
     * @param {Record<string, string>} columnFilters
     * @param {(cell: HTMLElement, visualIndex: number) => void} applyFixedColumn
     * @param {Record<string, number>} columnWidths
     * @returns {void}
     */
    render(thead, columns, sortState, columnFilters, applyFixedColumn, columnWidths) {
        const headRows = [];
        const sortRow = document.createElement('tr');
        sortRow.setAttribute('role', 'row');

        if (this.options.expandableRows) {
            const expandHeader = document.createElement('th');
            expandHeader.className = this.theme.classOf('headerCell', 'vt-header-cell');
            sortRow.appendChild(expandHeader);
        }

        columns.forEach((column, index) => {
            const th = document.createElement('th');
            th.className = this.theme.classOf('headerCell', 'vt-header-cell');
            th.dataset.key = column.key;
            th.draggable = Boolean(this.options.columnReorder);
            th.tabIndex = 0;
            th.setAttribute('role', 'columnheader');
            applyFixedColumn(th, index + (this.options.expandableRows ? 1 : 0));

            if (columnWidths[column.key]) {
                th.style.width = `${columnWidths[column.key]}px`;
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.className = this.theme.classOf('sortTrigger', 'vt-sort-trigger');
            button.dataset.key = column.key;

            const sortIndex = sortState.findIndex((item) => item.key === column.key);
            const sortMeta = sortIndex >= 0 ? sortState[sortIndex] : null;
            const marker = sortMeta ? (sortMeta.direction === 'asc' ? ` ▲${sortState.length > 1 ? ` ${sortIndex + 1}` : ''}` : ` ▼${sortState.length > 1 ? ` ${sortIndex + 1}` : ''}`) : '';

            button.textContent = `${column.label}${marker}`;
            button.disabled = column.sortable === false || !this.options.sortable;
            th.setAttribute('aria-sort', sortMeta ? (sortMeta.direction === 'asc' ? 'ascending' : 'descending') : 'none');
            th.appendChild(button);

            if (this.options.columnResize) {
                const resizeHandle = document.createElement('span');
                resizeHandle.className = this.theme.classOf('resizeHandle', 'vt-resize-handle');
                resizeHandle.dataset.key = column.key;
                resizeHandle.tabIndex = 0;
                resizeHandle.setAttribute('role', 'separator');
                resizeHandle.setAttribute('aria-orientation', 'vertical');
                th.appendChild(resizeHandle);
            }

            sortRow.appendChild(th);
        });

        if (this.options.rowActions.length) {
            const actionTh = document.createElement('th');
            actionTh.textContent = this.options.labels.actions;
            actionTh.className = this.theme.classOf('actionHeader', 'vt-actions-header');
            sortRow.appendChild(actionTh);
        }

        headRows.push(sortRow);

        if (this.options.columnFilters) {
            const filterRow = document.createElement('tr');
            filterRow.className = this.theme.classOf('filterRow', 'vt-filter-row');
            filterRow.setAttribute('role', 'row');

            if (this.options.expandableRows) {
                const expandFilterHeader = document.createElement('th');
                expandFilterHeader.className = this.theme.classOf('filterHeaderCell', 'vt-filter-header-cell');
                filterRow.appendChild(expandFilterHeader);
            }

            columns.forEach((column, index) => {
                const th = document.createElement('th');
                th.className = this.theme.classOf('filterHeaderCell', 'vt-filter-header-cell');
                applyFixedColumn(th, index + (this.options.expandableRows ? 1 : 0));
                if (column.filterable === false) {
                    filterRow.appendChild(th);
                    return;
                }

                const input = document.createElement('input');
                input.className = this.theme.classOf('columnFilter', 'vt-column-filter');
                input.placeholder = `${this.options.labels.filter} ${column.label}`;
                input.value = columnFilters[column.key] || '';
                input.dataset.key = column.key;
                th.appendChild(input);
                filterRow.appendChild(th);
            });

            if (this.options.rowActions.length) {
                filterRow.appendChild(document.createElement('th'));
            }

            headRows.push(filterRow);
        }

        thead.innerHTML = '';
        headRows.forEach((row) => {
            thead.appendChild(row);
        });

        if (this.options.fixedHeader) {
            appendClassNames(thead, this.theme.classOf('fixedHeader', 'vt-fixed-header'));
        }
    }
}

/**
 * Appends one or more class tokens to an element.
 *
 * @param {HTMLElement} element
 * @param {string} classNames
 * @returns {void}
 */
function appendClassNames(element, classNames) {
    classNames
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => {
            element.classList.add(name);
        });
}
