/**
 * Renders static shell markup and resolves DOM references.
 */
export class ShellRenderer {
    /**
     * Creates a shell renderer instance.
     *
     * @param {{ root: HTMLElement, options: Record<string, any>, theme: import('../themes/theme-manager.js').ThemeManager }} config
     */
    constructor({ root, options, theme }) {
        /** @type {HTMLElement} */
        this.root = root;
        /** @type {Record<string, any>} */
        this.options = options;
        /** @type {import('../themes/theme-manager.js').ThemeManager} */
        this.theme = theme;
    }

    /**
     * Mounts static shell structure.
     *
     * @returns {Record<string, HTMLElement>}
     */
    mount() {
        this.root.innerHTML = `
      <div class="${this.theme.classOf('shell', 'vt-shell')}">
        <div class="${this.theme.classOf('controls', 'vt-controls')}">
          <label class="${this.theme.classOf('sizeWrap', 'vt-size-wrap')}">
            <span>${this.options.labels.rows}</span>
            <select class="${this.theme.classOf('sizeSelect', 'vt-size')}"></select>
          </label>
          <label class="${this.theme.classOf('searchWrap', 'vt-search-wrap')}">
            <span>${this.options.labels.search}</span>
            <input class="${this.theme.classOf('searchInput', 'vt-search')}" type="search" placeholder="Type to filter..." />
          </label>
        </div>
        <div class="${this.theme.classOf('tableWrap', 'vt-table-wrap')}" style="${this.options.virtualScroll.enabled ? `height:${this.options.virtualScroll.height}px;overflow:auto;` : ''}">
          <table class="${this.theme.classOf('table', 'vt-table')}" role="grid" aria-rowcount="-1">
            <thead></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="${this.theme.classOf('footer', 'vt-footer')} ${this.options.fixedFooter ? this.theme.classOf('fixedFooter', 'vt-fixed-footer') : ''}">
          <span class="${this.theme.classOf('info', 'vt-info')}"></span>
          <div class="${this.theme.classOf('paginationGroup', 'vt-pagination-group')}">
            <button class="${this.theme.classOf('firstButton', 'vt-page-btn vt-first')}" type="button">${this.options.labels.first}</button>
            <button class="${this.theme.classOf('prevButton', 'vt-page-btn vt-prev')}" type="button">${this.options.labels.prev}</button>
            <button class="${this.theme.classOf('nextButton', 'vt-page-btn vt-next')}" type="button">${this.options.labels.next}</button>
            <button class="${this.theme.classOf('lastButton', 'vt-page-btn vt-last')}" type="button">${this.options.labels.last}</button>
          </div>
        </div>
      </div>
    `;

        const refs = {
            search: this.root.querySelector('.vt-search'),
            pageSize: this.root.querySelector('.vt-size'),
            tableWrap: this.root.querySelector('.vt-table-wrap'),
            table: this.root.querySelector('.vt-table'),
            thead: this.root.querySelector('thead'),
            tbody: this.root.querySelector('tbody'),
            info: this.root.querySelector('.vt-info'),
            first: this.root.querySelector('.vt-first'),
            prev: this.root.querySelector('.vt-prev'),
            next: this.root.querySelector('.vt-next'),
            last: this.root.querySelector('.vt-last')
        };

        refs.pageSize.innerHTML = this.options.pageSizeOptions.map((size) => `<option value="${size}">${size}</option>`).join('');
        refs.pageSize.value = String(this.options.pageSize);

        if (!this.options.searchable) {
            refs.search.closest('.vt-search-wrap').style.display = 'none';
        }

        if (!this.options.pagination) {
            this.root.querySelector('.vt-footer').style.display = 'none';
        }

        return refs;
    }
}
