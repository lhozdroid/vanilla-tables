/**
 * Synchronizes table state with URL and local storage.
 */
export class StateSync {
    /**
     * Creates state sync instance.
     *
     * @param {{ persistence: { enabled: boolean, storageKey: string | null }, urlSync: { enabled: boolean, param: string }, tableId: string }} config
     */
    constructor({ persistence, urlSync, tableId }) {
        /** @type {{ enabled: boolean, storageKey: string | null }} */
        this.persistence = persistence;
        /** @type {{ enabled: boolean, param: string }} */
        this.urlSync = urlSync;
        /** @type {string} */
        this.tableId = tableId;
    }

    /**
     * Loads stored or URL state payload.
     *
     * @returns {Record<string, any>}
     */
    load() {
        const fromUrl = this.loadFromUrl();
        const fromStorage = this.loadFromStorage();
        return {
            ...fromStorage,
            ...fromUrl
        };
    }

    /**
     * Persists state to configured sinks.
     *
     * @param {Record<string, any>} state
     * @returns {void}
     */
    save(state) {
        if (this.persistence.enabled) {
            this.saveToStorage(state);
        }

        if (this.urlSync.enabled) {
            this.saveToUrl(state);
        }
    }

    /**
     * Loads state from local storage.
     *
     * @returns {Record<string, any>}
     */
    loadFromStorage() {
        if (!this.persistence.enabled || typeof window === 'undefined') return {};
        const key = this.getStorageKey();

        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    /**
     * Saves state to local storage.
     *
     * @param {Record<string, any>} state
     * @returns {void}
     */
    saveToStorage(state) {
        if (typeof window === 'undefined') return;

        try {
            window.localStorage.setItem(this.getStorageKey(), JSON.stringify(state));
        } catch {
            // Ignores storage write failures.
        }
    }

    /**
     * Loads state payload from URL param.
     *
     * @returns {Record<string, any>}
     */
    loadFromUrl() {
        if (!this.urlSync.enabled || typeof window === 'undefined') return {};

        try {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get(this.urlSync.param || 'vt');
            if (!encoded) return {};
            const json = decodeURIComponent(encoded);
            const parsed = JSON.parse(json);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    /**
     * Saves state payload to URL param.
     *
     * @param {Record<string, any>} state
     * @returns {void}
     */
    saveToUrl(state) {
        if (typeof window === 'undefined') return;

        try {
            const params = new URLSearchParams(window.location.search);
            params.set(this.urlSync.param || 'vt', encodeURIComponent(JSON.stringify(state)));
            const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
            window.history.replaceState({}, '', next);
        } catch {
            // Ignores URL sync failures.
        }
    }

    /**
     * Returns storage key.
     *
     * @returns {string}
     */
    getStorageKey() {
        return this.persistence.storageKey || `vanilla-tables:${this.tableId}`;
    }
}
