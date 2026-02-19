/**
 * Resolves server-side table view projections.
 */
export class ServerDataSource {
    /**
     * Creates a server data source instance.
     *
     * @param {{ store: import('../state-store.js').StateStore, fetchData: Function | null, onLoadingChange: (loading: boolean) => void }} config
     */
    constructor({ store, fetchData, onLoadingChange }) {
        /** @type {import('../state-store.js').StateStore} */
        this.store = store;
        /** @type {Function | null} */
        this.fetchData = fetchData;
        /** @type {(loading: boolean) => void} */
        this.onLoadingChange = onLoadingChange;
    }

    /**
     * Resolves table view data.
     *
     * @returns {Promise<{ rows: Record<string, any>[], totalRows: number, totalPages: number }>}
     */
    getView() {
        if (typeof this.fetchData !== 'function') {
            return Promise.reject(new Error('VanillaTable serverSide mode requires options.fetchData(query).'));
        }

        this.onLoadingChange(true);

        const query = this.store.getQuery();
        return Promise.resolve(this.fetchData(query))
            .then((response) => {
                const rows = Array.isArray(response?.rows) ? response.rows : [];
                const totalRows = Number(response?.totalRows || rows.length);
                this.store.setRows(rows);

                return {
                    rows,
                    totalRows,
                    totalPages: Math.max(1, Math.ceil(totalRows / this.store.state.pageSize))
                };
            })
            .finally(() => {
                this.onLoadingChange(false);
            });
    }
}
