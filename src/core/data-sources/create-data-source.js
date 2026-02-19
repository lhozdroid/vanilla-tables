import { ClientDataSource } from './client-data-source.js';
import { ServerDataSource } from './server-data-source.js';

/**
 * Creates a data source strategy for current options.
 *
 * @param {{ options: Record<string, any>, store: import('../state-store.js').StateStore, onLoadingChange: (loading: boolean) => void }} config
 * @returns {ClientDataSource | ServerDataSource}
 */
export function createDataSource({ options, store, onLoadingChange }) {
    if (options.serverSide) {
        return new ServerDataSource({
            store,
            fetchData: options.fetchData,
            onLoadingChange
        });
    }

    return new ClientDataSource({ store });
}
