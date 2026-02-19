/**
 * Renders footer pagination summary and control state.
 */
export class FooterRenderer {
    /**
     * Creates a footer renderer instance.
     *
     * @param {{ options: Record<string, any> }} config
     */
    constructor({ options }) {
        /** @type {Record<string, any>} */
        this.options = options;
    }

    /**
     * Renders footer state.
     *
     * @param {{ info: HTMLElement, first: HTMLButtonElement, prev: HTMLButtonElement, next: HTMLButtonElement, last: HTMLButtonElement }} refs
     * @param {{ page: number, totalPages: number, totalRows: number, loading?: boolean }} details
     * @returns {void}
     */
    render(refs, { page, totalPages, totalRows, loading }) {
        refs.info.textContent = loading ? this.options.labels.loading : this.options.labels.pageInfo({ page, totalPages, totalRows });
        refs.first.disabled = Boolean(loading) || page <= 1;
        refs.prev.disabled = Boolean(loading) || page <= 1;
        refs.next.disabled = Boolean(loading) || page >= totalPages;
        refs.last.disabled = Boolean(loading) || page >= totalPages;
    }
}
