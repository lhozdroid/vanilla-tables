import { describe, expect, it, vi } from 'vitest';
import { deepMerge } from '../../src/utils/deep-merge.js';
import { EventEmitter } from '../../src/utils/event-emitter.js';
import { themePlugin } from '../../src/plugins/theme-plugin.js';
import { ThemeManager } from '../../src/core/themes/theme-manager.js';

/**
 * Covers remaining utility and plugin fallback branches.
 */
describe('misc branch coverage', () => {
    it('covers deepMerge null extra branch', () => {
        expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
    });

    it('covers EventEmitter no-listener branches', () => {
        const bus = new EventEmitter();
        bus.off('missing', () => {});
        bus.emit('missing', { ok: true });
        expect(bus.listeners.has('missing')).toBe(false);
    });

    it('covers theme plugin and theme manager fallbacks', () => {
        const table = { setThemeClasses: vi.fn(() => Promise.resolve()) };
        themePlugin()(table);
        expect(table.setThemeClasses).toHaveBeenCalledWith({});

        const manager = new ThemeManager({ x: 'y' });
        manager.setClasses(null);
        expect(manager.classOf('x', 'base')).toBe('base');
    });
});
