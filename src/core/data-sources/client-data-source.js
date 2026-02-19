/**
 * Resolves client-side table view projections.
 */
export class ClientDataSource {
    /**
     * Creates a client data source instance.
     *
     * @param {{ store: import('../state-store.js').StateStore }} config
     */
    constructor({ store }) {
        /** @type {import('../state-store.js').StateStore} */
        this.store = store;
    }

    /**
     * Resolves table view data.
     *
     * @param {{ columns: { key: string }[] }} context
     * @returns {Promise<{ rows: Record<string, any>[], totalRows: number, totalPages: number }>}
     */
    getView({ columns }) {
        if (typeof this.store.getVisibleRowsAsync === 'function' && typeof this.store.canUseWorkerProjection === 'function' && this.store.canUseWorkerProjection()) {
            return this.store.getVisibleRowsAsync(columns);
        }
        return Promise.resolve(this.store.getVisibleRows(columns));
    }
}
