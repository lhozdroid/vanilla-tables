import { describe, expect, it } from 'vitest';
import { StateSync } from '../../src/core/sync/state-sync.js';

/**
 * Validates storage and URL synchronization behavior.
 */
describe('StateSync', () => {
    it('loads and saves from localStorage', () => {
        const sync = new StateSync({
            persistence: { enabled: true, storageKey: 'vt-sync-test' },
            urlSync: { enabled: false, param: 'vt' },
            tableId: 'tbl'
        });

        sync.save({ page: 3 });
        const state = sync.load();

        expect(state.page).toBe(3);
    });

    it('loads and saves from URL params', () => {
        const sync = new StateSync({
            persistence: { enabled: false, storageKey: null },
            urlSync: { enabled: true, param: 'vt' },
            tableId: 'tbl'
        });

        sync.save({ page: 2, searchTerm: 'abc' });
        const loaded = sync.load();

        expect(loaded.page).toBe(2);
        expect(loaded.searchTerm).toBe('abc');
    });

    it('merges storage and URL with URL precedence', () => {
        const sync = new StateSync({
            persistence: { enabled: true, storageKey: 'vt-sync-merge' },
            urlSync: { enabled: true, param: 'vtmerge' },
            tableId: 'tbl'
        });

        window.localStorage.setItem('vt-sync-merge', JSON.stringify({ page: 1, searchTerm: 'storage' }));

        const encoded = encodeURIComponent(JSON.stringify({ page: 9 }));
        const url = `${window.location.pathname}?vtmerge=${encoded}`;
        window.history.replaceState({}, '', url);

        const loaded = sync.load();
        expect(loaded.page).toBe(9);
        expect(loaded.searchTerm).toBe('storage');
    });

    it('uses generated storage key fallback', () => {
        const sync = new StateSync({
            persistence: { enabled: true, storageKey: null },
            urlSync: { enabled: false, param: 'vt' },
            tableId: 'table-abc'
        });

        expect(sync.getStorageKey()).toBe('vanilla-tables:table-abc');
    });
});
