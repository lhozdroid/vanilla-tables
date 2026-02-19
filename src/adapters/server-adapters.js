/**
 * Creates a REST fetch adapter.
 *
 * @param {{ endpoint: string, method?: 'GET'|'POST', headers?: Record<string, string>, mapResponse?: (response: any) => { rows: any[], totalRows: number } }} config
 * @returns {(query: Record<string, any>) => Promise<{ rows: any[], totalRows: number }>}
 */
export function createRestAdapter({ endpoint, method = 'GET', headers = {}, mapResponse }) {
    return (query) => {
        const upper = method.toUpperCase();
        const isGet = upper === 'GET';

        let url = endpoint;
        const init = {
            method: upper,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (isGet) {
            const params = new URLSearchParams({ q: JSON.stringify(query) });
            url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${params.toString()}`;
        } else {
            init.body = JSON.stringify(query);
        }

        return fetch(url, init)
            .then((response) => response.json())
            .then((payload) => (mapResponse ? mapResponse(payload) : payload));
    };
}

/**
 * Creates a GraphQL fetch adapter.
 *
 * @param {{ endpoint: string, query: string, variablesKey?: string, headers?: Record<string, string>, mapResponse?: (response: any) => { rows: any[], totalRows: number } }} config
 * @returns {(tableQuery: Record<string, any>) => Promise<{ rows: any[], totalRows: number }>}
 */
export function createGraphQLAdapter({ endpoint, query, variablesKey = 'tableQuery', headers = {}, mapResponse }) {
    return (tableQuery) =>
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                query,
                variables: {
                    [variablesKey]: tableQuery
                }
            })
        })
            .then((response) => response.json())
            .then((payload) => (mapResponse ? mapResponse(payload) : payload));
}

/**
 * Creates a cursor pagination adapter.
 *
 * @param {{ fetchPage: (args: { cursor: string | null, pageSize: number, searchTerm: string, columnFilters: Record<string, string>, sorts: { key: string, direction: 'asc'|'desc' }[] }) => Promise<{ rows: any[], nextCursor: string | null, totalRows?: number }> }} config
 * @returns {(tableQuery: Record<string, any>) => Promise<{ rows: any[], totalRows: number }>}
 */
export function createCursorAdapter({ fetchPage }) {
    let lastCursor = null;

    return (tableQuery) => {
        if (tableQuery.page <= 1) {
            lastCursor = null;
        }

        return Promise.resolve(
            fetchPage({
                cursor: lastCursor,
                pageSize: tableQuery.pageSize,
                searchTerm: tableQuery.searchTerm,
                columnFilters: tableQuery.columnFilters,
                sorts: tableQuery.sorts
            })
        ).then((result) => {
            lastCursor = result.nextCursor || null;
            return {
                rows: result.rows || [],
                totalRows: Number(result.totalRows || (result.rows || []).length)
            };
        });
    };
}
