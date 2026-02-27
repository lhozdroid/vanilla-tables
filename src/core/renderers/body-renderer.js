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
        /** @type {Map<string, HTMLTableRowElement>} */
        this.rowNodeCache = new Map();
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
        const columnWindow = meta.columnWindow || { enabled: false, start: 0, end: columns.length, leftWidth: 0, rightWidth: 0, totalColumns: columns.length };
        const visibleColumns = columnWindow.enabled ? columns.slice(columnWindow.start, columnWindow.end) : columns;
        const fragment = document.createDocumentFragment();
        const postRenderRows = [];

        if (!rows.length) {
            const tr = document.createElement('tr');
            tr.setAttribute('role', 'row');
            const td = document.createElement('td');
            td.setAttribute('role', 'gridcell');
            td.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
            td.className = this.theme.classOf('emptyCell', 'vt-empty');
            td.textContent = this.options.labels.empty;
            tr.appendChild(td);
            fragment.appendChild(tr);
            tbody.replaceChildren(fragment);
            return;
        }

        const renderSlice = meta.virtualization.enabled ? rows.slice(meta.virtualization.start, meta.virtualization.end) : rows;

        if (meta.virtualization.enabled && meta.virtualization.start > 0) {
            const topSpacer = document.createElement('tr');
            topSpacer.className = 'vt-virtual-top';
            const topCell = document.createElement('td');
            topCell.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
            topCell.style.height = `${meta.virtualization.start * meta.virtualization.rowHeight}px`;
            topCell.style.padding = '0';
            topCell.style.border = 'none';
            topSpacer.appendChild(topCell);
            fragment.appendChild(topSpacer);
        }

        renderSlice.forEach((row, localIndex) => {
            const index = meta.virtualization.enabled ? meta.virtualization.start + localIndex : localIndex;
            const rowId = meta.getRowId(row, index);
            const tr = this.rowNodeCache.get(rowId) || document.createElement('tr');
            tr.className = this.theme.classOf('bodyRow', 'vt-row');
            tr.dataset.rowId = rowId;
            tr.setAttribute('role', 'row');
            tr.replaceChildren();

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

            if (columnWindow.enabled && columnWindow.leftWidth > 0) {
                tr.appendChild(createSpacerCell(columnWindow.leftWidth));
            }

            visibleColumns.forEach((column, columnIndex) => {
                const td = document.createElement('td');
                td.className = this.theme.classOf('bodyCell', 'vt-cell');
                td.setAttribute('role', 'gridcell');
                td.dataset.key = column.key;
                td.dataset.rowId = rowId;
                const baseIndex = columnWindow.enabled ? columnWindow.start + columnIndex : columnIndex;
                applyFixedColumn(td, baseIndex + (this.options.expandableRows ? 1 : 0));

                if (meta.columnWidths[column.key]) {
                    td.style.width = `${meta.columnWidths[column.key]}px`;
                }

                const raw = row[column.key];
                if (column.render) {
                    setCellContent(td, column.render(raw, row), this.options.sanitizeHtml);
                } else {
                    td.textContent = String(raw ?? '');
                }

                const isEditable = meta.editableRows && column.editable !== false && meta.editableColumns[column.key] !== false;
                if (isEditable) {
                    appendClassNames(td, this.theme.classOf('editableCell', 'vt-cell-editable'));
                }

                tr.appendChild(td);
            });

            if (columnWindow.enabled && columnWindow.rightWidth > 0) {
                tr.appendChild(createSpacerCell(columnWindow.rightWidth));
            }

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

            fragment.appendChild(tr);
            this.rowNodeCache.set(rowId, tr);
            postRenderRows.push({ row, element: tr });

            if (this.options.expandableRows && meta.expandedRowIds.has(rowId) && meta.expandRow) {
                const expanded = document.createElement('tr');
                expanded.className = this.theme.classOf('expandRow', 'vt-expand-row');
                const expandedCell = document.createElement('td');
                expandedCell.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + 1 + (this.options.rowActions.length ? 1 : 0);
                expandedCell.className = this.theme.classOf('expandContent', 'vt-expand-content');
                setCellContent(expandedCell, meta.expandRow(row), this.options.sanitizeHtml);
                expanded.appendChild(expandedCell);
                fragment.appendChild(expanded);
            }
        });

        if (meta.virtualization.enabled && meta.virtualization.end < rows.length) {
            const bottomSpacer = document.createElement('tr');
            bottomSpacer.className = 'vt-virtual-bottom';
            const bottomCell = document.createElement('td');
            bottomCell.colSpan = visibleColumns.length + (columnWindow.enabled ? 2 : 0) + (this.options.expandableRows ? 1 : 0) + (this.options.rowActions.length ? 1 : 0);
            bottomCell.style.height = `${(rows.length - meta.virtualization.end) * meta.virtualization.rowHeight}px`;
            bottomCell.style.padding = '0';
            bottomCell.style.border = 'none';
            bottomSpacer.appendChild(bottomCell);
            fragment.appendChild(bottomSpacer);
        }

        tbody.replaceChildren(fragment);
        postRenderRows.forEach(({ row, element }) => {
            this.hooks.afterRowRender?.({ row, element });
        });
        this.trimRowCache();
    }

    /**
     * Clears stale cached row elements to bound memory growth.
     *
     * @returns {void}
     */
    trimRowCache() {
        if (this.rowNodeCache.size <= 2000) return;
        const keep = new Map();
        for (const [key, value] of this.rowNodeCache.entries()) {
            if (keep.size >= 1000) break;
            keep.set(key, value);
        }
        this.rowNodeCache = keep;
    }
}

/**
 * Sets cell content using optional sanitization for HTML string values.
 *
 * @param {HTMLElement} cell
 * @param {string | Node | null | undefined} content
 * @param {((html: string) => string) | null | undefined} sanitizer
 * @returns {void}
 */
function setCellContent(cell, content, sanitizer) {
    if (content instanceof Node) {
        cell.replaceChildren(content);
        return;
    }

    const html = String(content ?? '');
    if (typeof sanitizer === 'function') {
        cell.innerHTML = sanitizer(html);
        return;
    }

    cell.innerHTML = html;
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

/**
 * Creates one body spacer cell for virtualized columns.
 *
 * @param {number} width
 * @returns {HTMLTableCellElement}
 */
function createSpacerCell(width) {
    const td = document.createElement('td');
    td.className = 'vt-col-spacer';
    td.style.width = `${width}px`;
    td.style.minWidth = `${width}px`;
    td.style.padding = '0';
    td.style.border = 'none';
    return td;
}
