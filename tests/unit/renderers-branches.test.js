import { describe, expect, it } from 'vitest';
import { Renderer } from '../../src/core/renderer.js';
import { defaultOptions } from '../../src/core/default-options.js';
import { deepMerge } from '../../src/utils/deep-merge.js';

/**
 * Covers shell/body renderer branch paths not reached by integration tests.
 */
describe('Renderer and shell branches', () => {
    it('covers shell hidden controls and fixed columns fallback widths', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const options = deepMerge(defaultOptions, {
            searchable: false,
            pagination: false,
            fixedFooter: true,
            fixedColumns: 2,
            pageSize: 25,
            pageSizeOptions: [10, 25],
            columns: [
                { key: 'a', label: 'A' },
                { key: 'b', label: 'B' }
            ]
        });

        const renderer = new Renderer({ root, options, hooks: {} });
        renderer.mount();

        expect(renderer.refs.search.closest('.vt-search-wrap').style.display).toBe('none');
        expect(root.querySelector('.vt-footer').style.display).toBe('none');

        const cell = document.createElement('th');
        renderer.applyFixedColumn(cell, 1, options.columns, {});
        expect(cell.style.left).toBe('180px');

        const nonFixedCell = document.createElement('th');
        renderer.applyFixedColumn(nonFixedCell, 3, options.columns, {});
        expect(nonFixedCell.className).toBe('');
    });

    it('covers body renderer empty and virtual spacer branches', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);

        const options = deepMerge(defaultOptions, {
            expandableRows: true,
            rowActions: [{ id: 'x', label: 'X' }],
            fixedTopRows: 1,
            virtualScroll: { enabled: true, rowHeight: 30, overscan: 1, height: 90 }
        });

        const renderer = new Renderer({ root, options, hooks: {} });
        renderer.mount();

        renderer.renderBody([{ key: 'name', label: 'Name', render: () => '<b>x</b>' }], [], {
            expandedRowIds: new Set(),
            getRowId: (_row, index) => String(index),
            expandRow: null,
            editableRows: false,
            editableColumns: {},
            columnWidths: {},
            virtualization: { enabled: false, start: 0, end: 0, rowHeight: 30 },
            columnWindow: { enabled: false, start: 0, end: 1, leftWidth: 0, rightWidth: 0, totalColumns: 1 }
        });

        expect(root.querySelector('.vt-empty')).not.toBeNull();

        renderer.renderBody([{ key: 'name', label: 'Name', editable: false }], [{ name: '<script>' }, { name: 'B' }, { name: 'C' }, { name: 'D' }], {
            expandedRowIds: new Set(['1']),
            getRowId: (_row, index) => String(index),
            expandRow: (row) => `<div>${row.name}</div>`,
            editableRows: true,
            editableColumns: { name: false },
            columnWidths: { name: 210 },
            virtualization: { enabled: true, start: 1, end: 3, rowHeight: 30 },
            columnWindow: { enabled: false, start: 0, end: 1, leftWidth: 0, rightWidth: 0, totalColumns: 1 }
        });

        // Verifies spacer rows used by virtualization windows.
        expect(root.querySelector('.vt-virtual-top')).not.toBeNull();
        expect(root.querySelector('.vt-virtual-bottom')).not.toBeNull();

        renderer.renderBody([{ key: 'name', label: 'Name', editable: false }], [{ name: 'A' }, { name: 'B' }], {
            expandedRowIds: new Set(),
            getRowId: (_row, index) => String(index),
            expandRow: null,
            editableRows: false,
            editableColumns: {},
            columnWidths: {},
            virtualization: { enabled: true, start: 0, end: 2, rowHeight: 30 },
            columnWindow: { enabled: true, start: 0, end: 1, leftWidth: 100, rightWidth: 120, totalColumns: 3 }
        });

        expect(root.querySelector('.vt-fixed-top-row')).not.toBeNull();
        expect(root.querySelectorAll('.vt-col-spacer').length).toBeGreaterThan(0);
    });
});
