/**
 * Renders table body rows, expansion rows, and editable cell state.
 */
export class BodyRenderer {
    /**
     * Creates a body renderer instance.
     *
     * @param {{ options: Record<string, any>, hooks: Record<string, Function>, theme: import('../themes/theme-manager.js').ThemeManager }} config
     */
    constructor({ options, hooks, theme }) {
        /** @type {Record<string, any>} */
        this.options = options;
        /** @type {Record<string, Function>} */
        this.hooks = hooks;
        /** @type {import('../themes/theme-manager.js').ThemeManager} */
        this.theme = theme;
    }

    /**
     * Renders visible table body content.
     *
     * @param {HTMLTableSectionElement} tbody
     * @param {{ key: string, render?: (value: any, row: Record<string, any>) => string, editable?: boolean }[]} columns
     * @param {Record<string, any>[]} rows
     * @param {{ expandedRowIds: Set<string>, getRowId: (row: Record<string, any>, index: number) => string, expandRow: ((row: Record<string, any>) => string) | null, editableRows: boolean, editableColumns: Record<string, boolean>, columnWidths: Record<string, number>, virtualization: { enabled: boolean, start: number, end: number, rowHeight: number } }} meta
     * @param {(cell: HTMLElement, visualIndex: number) => void} applyFixedColumn
     * @returns {void}
     */
    render(tbody, columns, rows, meta, applyFixedColumn) {
        tbody.innerHTML = '';

        if (!rows.length) {
            const tr = document.createElement('tr');
            tr.setAttribute('role', 'row');
            const td = document.createElement('td');
            td.setAttribute('role', 'gridcell');
            td.colSpan = columns.length + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
            td.className = this.theme.classOf('emptyCell', 'vt-empty');
            td.textContent = this.options.labels.empty;
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        const renderSlice = meta.virtualization.enabled ? rows.slice(meta.virtualization.start, meta.virtualization.end) : rows;

        if (meta.virtualization.enabled && meta.virtualization.start > 0) {
            const topSpacer = document.createElement('tr');
            topSpacer.className = 'vt-virtual-top';
            const topCell = document.createElement('td');
            topCell.colSpan = columns.length + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
            topCell.style.height = `${meta.virtualization.start * meta.virtualization.rowHeight}px`;
            topCell.style.padding = '0';
            topCell.style.border = 'none';
            topSpacer.appendChild(topCell);
            tbody.appendChild(topSpacer);
        }

        renderSlice.forEach((row, localIndex) => {
            const index = meta.virtualization.enabled ? meta.virtualization.start + localIndex : localIndex;
            const rowId = meta.getRowId(row, index);
            const tr = document.createElement('tr');
            tr.className = this.theme.classOf('bodyRow', 'vt-row');
            tr.dataset.rowId = rowId;
            tr.setAttribute('role', 'row');

            if (this.options.fixedTopRows && index < this.options.fixedTopRows) {
                appendClassNames(tr, this.theme.classOf('fixedTopRow', 'vt-fixed-top-row'));
            }

            if (this.options.expandableRows) {
                const expandTd = document.createElement('td');
                expandTd.className = this.theme.classOf('expandCell', 'vt-expand-cell');
                applyFixedColumn(expandTd, 0);

                const expandButton = document.createElement('button');
                expandButton.type = 'button';
                expandButton.className = this.theme.classOf('expandTrigger', 'vt-expand-trigger');
                expandButton.dataset.rowId = rowId;
                expandButton.textContent = meta.expandedRowIds.has(rowId) ? '−' : '+';
                expandButton.setAttribute('aria-expanded', String(meta.expandedRowIds.has(rowId)));
                expandTd.appendChild(expandButton);
                tr.appendChild(expandTd);
            }

            columns.forEach((column, columnIndex) => {
                const td = document.createElement('td');
                td.className = this.theme.classOf('bodyCell', 'vt-cell');
                td.setAttribute('role', 'gridcell');
                td.dataset.key = column.key;
                td.dataset.rowId = rowId;
                applyFixedColumn(td, columnIndex + (this.options.expandableRows ? 1 : 0));

                if (meta.columnWidths[column.key]) {
                    td.style.width = `${meta.columnWidths[column.key]}px`;
                }

                const raw = row[column.key];
                td.innerHTML = column.render ? column.render(raw, row) : escapeHtml(String(raw ?? ''));

                const isEditable = meta.editableRows && column.editable !== false && meta.editableColumns[column.key] !== false;
                if (isEditable) {
                    appendClassNames(td, this.theme.classOf('editableCell', 'vt-cell-editable'));
                }

                tr.appendChild(td);
            });

            if (this.options.rowActions.length) {
                const actionTd = document.createElement('td');
                actionTd.className = this.theme.classOf('actionsCell', 'vt-actions-cell');
                actionTd.setAttribute('role', 'gridcell');
                this.options.rowActions.forEach((action) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `${this.theme.classOf('actionButton', 'vt-action-btn')} ${action.className || ''}`.trim();
                    button.dataset.actionId = action.id;
                    button.dataset.rowId = rowId;
                    button.textContent = action.label;
                    actionTd.appendChild(button);
                });
                tr.appendChild(actionTd);
            }

            tbody.appendChild(tr);
            this.hooks.afterRowRender?.({ row, element: tr });

            if (this.options.expandableRows && meta.expandedRowIds.has(rowId) && meta.expandRow) {
                const expanded = document.createElement('tr');
                expanded.className = this.theme.classOf('expandRow', 'vt-expand-row');
                const expandedCell = document.createElement('td');
                expandedCell.colSpan = columns.length + 1 + (this.options.rowActions.length ? 1 : 0);
                expandedCell.className = this.theme.classOf('expandContent', 'vt-expand-content');
                expandedCell.innerHTML = meta.expandRow(row);
                expanded.appendChild(expandedCell);
                tbody.appendChild(expanded);
            }
        });

        if (meta.virtualization.enabled && meta.virtualization.end < rows.length) {
            const bottomSpacer = document.createElement('tr');
            bottomSpacer.className = 'vt-virtual-bottom';
            const bottomCell = document.createElement('td');
            bottomCell.colSpan = columns.length + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
            bottomCell.style.height = `${(rows.length - meta.virtualization.end) * meta.virtualization.rowHeight}px`;
            bottomCell.style.padding = '0';
            bottomCell.style.border = 'none';
            bottomSpacer.appendChild(bottomCell);
            tbody.appendChild(bottomSpacer);
        }
    }
}

/**
 * Escapes HTML-sensitive characters.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
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
