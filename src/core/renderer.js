import { ShellRenderer } from './renderers/shell-renderer.js';
import { HeaderRenderer } from './renderers/header-renderer.js';
import { BodyRenderer } from './renderers/body-renderer.js';
import { FooterRenderer } from './renderers/footer-renderer.js';
import { ThemeManager } from './themes/theme-manager.js';

/**
 * Coordinates specialized renderers for shell, header, body, and footer.
 */
export class Renderer {
    /**
     * Creates a renderer instance.
     *
     * @param {{ root: HTMLElement, options: Record<string, any>, hooks: Record<string, Function> }} config
     */
    constructor({ root, options, hooks }) {
        /** @type {HTMLElement} */
        this.root = root;
        /** @type {Record<string, any>} */
        this.options = options;
        /** @type {Record<string, Function>} */
        this.hooks = hooks;
        /** @type {Record<string, HTMLElement>} */
        this.refs = {};

        /** @type {ThemeManager} */
        this.theme = new ThemeManager(this.options.themeClasses);
        /** @type {ShellRenderer} */
        this.shellRenderer = new ShellRenderer({ root: this.root, options: this.options, theme: this.theme });
        /** @type {HeaderRenderer} */
        this.headerRenderer = new HeaderRenderer({ options: this.options, theme: this.theme });
        /** @type {BodyRenderer} */
        this.bodyRenderer = new BodyRenderer({ options: this.options, hooks: this.hooks, theme: this.theme });
        /** @type {FooterRenderer} */
        this.footerRenderer = new FooterRenderer({ options: this.options });
    }

    /**
     * Updates renderer options.
     *
     * @param {Record<string, any>} options
     * @returns {void}
     */
    setOptions(options) {
        this.options = options;
        this.theme.setClasses(this.options.themeClasses);
        this.shellRenderer.options = this.options;
        this.headerRenderer.options = this.options;
        this.bodyRenderer.options = this.options;
        this.footerRenderer.options = this.options;
    }

    /**
     * Mounts the base table shell.
     *
     * @returns {void}
     */
    mount() {
        this.refs = this.shellRenderer.mount();
    }

    /**
     * Renders header content.
     *
     * @param {{ key: string, label: string, sortable?: boolean, filterable?: boolean }[]} columns
     * @param {{ key: string, direction: 'asc'|'desc' }[]} sortState
     * @param {Record<string, string>} columnFilters
     * @param {Record<string, number>} columnWidths
     * @returns {void}
     */
    renderHeader(columns, sortState, columnFilters, columnWidths) {
        this.headerRenderer.render(this.refs.thead, columns, sortState, columnFilters, (cell, visualIndex) => this.applyFixedColumn(cell, visualIndex, columns, columnWidths), columnWidths);
    }

    /**
     * Renders body content.
     *
     * @param {{ key: string, render?: (value: any, row: Record<string, any>) => string, editable?: boolean }[]} columns
     * @param {Record<string, any>[]} rows
     * @param {{ expandedRowIds: Set<string>, getRowId: (row: Record<string, any>, index: number) => string, expandRow: ((row: Record<string, any>) => string) | null, editableRows: boolean, editableColumns: Record<string, boolean>, columnWidths: Record<string, number>, virtualization: { enabled: boolean, start: number, end: number, rowHeight: number } }} meta
     * @returns {void}
     */
    renderBody(columns, rows, meta) {
        this.bodyRenderer.render(this.refs.tbody, columns, rows, meta, (cell, visualIndex) => this.applyFixedColumn(cell, visualIndex, columns, meta.columnWidths));
    }

    /**
     * Renders footer content.
     *
     * @param {{ page: number, totalPages: number, totalRows: number, loading?: boolean }} details
     * @returns {void}
     */
    renderFooter(details) {
        this.footerRenderer.render(
            {
                info: this.refs.info,
                first: this.refs.first,
                prev: this.refs.prev,
                next: this.refs.next,
                last: this.refs.last
            },
            details
        );
    }

    /**
     * Applies sticky positioning for fixed columns.
     *
     * @param {HTMLElement} cell
     * @param {number} visualIndex
     * @param {{ key: string }[]} columns
     * @param {Record<string, number>} columnWidths
     * @returns {void}
     */
    applyFixedColumn(cell, visualIndex, columns, columnWidths) {
        if (!this.options.fixedColumns || visualIndex >= this.options.fixedColumns) {
            return;
        }

        let left = 0;
        for (let i = 0; i < visualIndex; i += 1) {
            const key = columns[i]?.key;
            left += key && columnWidths[key] ? columnWidths[key] : 180;
        }

        cell.style.position = 'sticky';
        cell.style.left = `${left}px`;
        cell.style.zIndex = '2';
        appendClassNames(cell, this.theme.classOf('fixedColumn', 'vt-fixed-column'));
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
