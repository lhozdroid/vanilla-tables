import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VanillaTable } from '../../src/core/vanilla-table.js';

/**
 * Covers table-level branches that are hard to hit from happy-path tests.
 */
describe('VanillaTable branch coverage', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="tb"></div><div id="tb2"></div>';
        window.localStorage.clear();
        window.history.replaceState({}, '', window.location.pathname);
    });

    it('covers constructor guard, i18n page template, and id fallback', () => {
        expect(() => new VanillaTable(null, [])).toThrow(/HTMLElement/);

        const root = document.getElementById('tb');
        const table = new VanillaTable(root, [{ id: 1, name: 'A' }], {
            i18n: { pageInfo: 'Page {page}/{totalPages} ({totalRows})' }
        });

        expect(table.options.labels.pageInfo({ page: 1, totalPages: 2, totalRows: 3 })).toContain('Page 1/2 (3)');
        expect(table.getTableId()).toBe('tb');

        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
        const root2 = document.getElementById('tb2');
        root2.removeAttribute('id');
        const table2 = new VanillaTable(root2, [{ id: 1 }]);
        expect(table2.getTableId().startsWith('vt-')).toBe(true);
        randomSpy.mockRestore();
    });

    it('covers refresh recursive page correction and non-array setData', () => {
        const root = document.getElementById('tb');
        const table = new VanillaTable(root, [{ id: 1, name: 'A' }], { pageSize: 1 }).init();

        table.store.setPage(10);
        return table.refresh().then(() => {
            expect(table.store.state.page).toBe(1);
            return table.setData(null).then(() => {
                expect(table.getRows()).toEqual([]);
            });
        });
    });

    it('covers action guard, updateCell miss, computeVirtualWindow branches, and destroy branches', () => {
        const root = document.getElementById('tb');
        const table = new VanillaTable(root, [{ id: '1', name: 'A' }], {
            rowActions: [{ id: 'ok', label: 'Ok' }],
            editableRows: false,
            columnResize: false,
            virtualScroll: { enabled: true, rowHeight: 40, overscan: 1, height: 80 }
        }).init();

        return table.refresh().then(() => {
            // Triggers action flow where action exists but onClick is not provided.
            const actionCell = root.querySelector('.vt-actions-cell');
            actionCell.querySelector('.vt-action-btn').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            return table.updateCell('404', 'name', 'Z').then(() => {
                const wrap = table.renderer.refs.tableWrap;
                Object.defineProperty(wrap, 'clientHeight', { value: 80, configurable: true });
                Object.defineProperty(wrap, 'scrollTop', { value: 40, configurable: true });
                const withWrapWindow = table.computeVirtualWindow(20);
                expect(withWrapWindow.start).toBeGreaterThanOrEqual(0);

                const ctSpy = vi.spyOn(globalThis, 'clearTimeout');
                const cafSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
                table.searchTimer = 1;
                table.lastAnimationFrame = 2;
                table.destroy();

                expect(ctSpy).toHaveBeenCalled();
                expect(cafSpy).toHaveBeenCalled();

                ctSpy.mockRestore();
                cafSpy.mockRestore();
            });
        });
    });

    it('covers debounced search, keyboard resize/reorder boundaries, and getRowId fallback', () => {
        vi.useFakeTimers();

        const root = document.getElementById('tb');
        const table = new VanillaTable(
            root,
            [
                { id: '1', name: 'A', city: 'Rome' },
                { id: '2', name: 'B', city: 'Paris' }
            ],
            {
                debounceMs: 15,
                columnResize: true,
                columnReorder: true,
                fixedColumns: 0,
                columns: [
                    { key: 'name', label: 'Name' },
                    { key: 'city', label: 'City' }
                ]
            }
        ).init();

        const refreshSpy = vi.spyOn(table, 'refresh').mockImplementation(() => Promise.resolve());

        return table.refresh().then(() => {
            const search = root.querySelector('.vt-search');
            search.value = 'B';
            search.dispatchEvent(new Event('input', { bubbles: true }));
            vi.advanceTimersByTime(20);

            const resizeHandle = root.querySelector('.vt-resize-handle');
            resizeHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

            const header = root.querySelector('th[data-key="name"]');
            header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));

            table.store.setColumnOrder(['city', 'name']);
            header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));

            expect(refreshSpy).toHaveBeenCalled();
            expect(table.getRowId({ name: 'X' }, 5)).toBe('5');

            refreshSpy.mockRestore();
            vi.useRealTimers();
        });
    });
});
