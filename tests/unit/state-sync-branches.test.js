import { describe, expect, it, vi } from 'vitest';
import { StateSync } from '../../src/core/sync/state-sync.js';

/**
 * Covers state sync parser failures and sink error handling branches.
 */
describe('StateSync branch coverage', () => {
    it('covers disabled modes and parse fallback branches', () => {
        const disabled = new StateSync({
            persistence: { enabled: false, storageKey: null },
            urlSync: { enabled: false, param: 'vt' },
            tableId: 'a'
        });

        expect(disabled.loadFromStorage()).toEqual({});
        expect(disabled.loadFromUrl()).toEqual({});

        const sync = new StateSync({
            persistence: { enabled: true, storageKey: 'vt-sync-branches' },
            urlSync: { enabled: true, param: 'vtb' },
            tableId: 'b'
        });

        window.localStorage.setItem('vt-sync-branches', 'not-json');
        expect(sync.loadFromStorage()).toEqual({});

        window.localStorage.setItem('vt-sync-branches', JSON.stringify('x'));
        expect(sync.loadFromStorage()).toEqual({});

        window.history.replaceState({}, '', `${window.location.pathname}?vtb=%7Bbad`);
        expect(sync.loadFromUrl()).toEqual({});

        window.history.replaceState({}, '', window.location.pathname);
        expect(sync.loadFromUrl()).toEqual({});
    });

    it('covers save catch branches and url param fallback key', () => {
        const sync = new StateSync({
            persistence: { enabled: true, storageKey: null },
            urlSync: { enabled: true, param: '' },
            tableId: 'fallback-key'
        });

        expect(sync.getStorageKey()).toBe('vanilla-tables:fallback-key');

        const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        sync.saveToStorage({ ok: true });
        setItemSpy.mockRestore();

        const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
            throw new Error('blocked');
        });
        sync.saveToUrl({ ok: true });
        replaceStateSpy.mockRestore();

        const circular = {};
        circular.self = circular;
        sync.saveToUrl(circular);

        sync.save({ page: 2 });
        expect(window.location.search.includes('vt=')).toBe(true);
    });
});
