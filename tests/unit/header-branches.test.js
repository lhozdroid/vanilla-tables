import { describe, expect, it } from 'vitest';
import { Renderer } from '../../src/core/renderer.js';
import { defaultOptions } from '../../src/core/default-options.js';
import { deepMerge } from '../../src/utils/deep-merge.js';

/**
 * Covers header-renderer specific conditional branches.
 */
describe('header branch coverage', () => {
    it('covers filterable false and fixedHeader branches', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const options = deepMerge(defaultOptions, {
            fixedHeader: true,
            columnFilters: true,
            rowActions: [{ id: 'x', label: 'X' }],
            columns: [
                { key: 'name', label: 'Name', filterable: false },
                { key: 'city', label: 'City' }
            ]
        });

        const renderer = new Renderer({ root, options, hooks: {} });
        renderer.mount();
        renderer.renderHeader(options.columns, [], {}, {});

        expect(root.querySelector('thead').classList.contains('vt-fixed-header')).toBe(true);
        expect(root.querySelectorAll('.vt-column-filter')).toHaveLength(1);
    });
});
