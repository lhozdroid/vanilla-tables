import { describe, expect, it, vi } from 'vitest';
import { actionsDropdownPlugin } from '../../src/plugins/actions-dropdown.js';

/**
 * Validates dropdown action plugin behavior and guard paths.
 */
describe('actionsDropdownPlugin', () => {
    /**
     * Creates a minimal table double for plugin hook testing.
     *
     * @param {Array<{ id: string, label: string, onClick?: Function }>} rowActions
     * @param {Record<string, any> | null} row
     * @returns {Record<string, any>}
     */
    function createTable(rowActions, row) {
        const hooks = {};
        return {
            options: { rowActions },
            registerHook: (name, cb) => {
                hooks[name] = cb;
            },
            hooks,
            findRowById: () => row,
            emitEvent: vi.fn(),
            refresh: vi.fn(() => Promise.resolve())
        };
    }

    it('returns early when no action cell or not enough buttons', () => {
        const tableA = createTable([], null);
        actionsDropdownPlugin()(tableA);

        const rowA = document.createElement('tr');
        tableA.hooks.afterRowRender({ element: rowA });

        const tableB = createTable([{ id: 'a', label: 'A' }], { id: 1 });
        actionsDropdownPlugin()(tableB);
        const rowB = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'vt-actions-cell';
        const button = document.createElement('button');
        button.className = 'vt-action-btn';
        button.dataset.actionId = 'a';
        button.textContent = 'A';
        cell.appendChild(button);
        rowB.appendChild(cell);

        tableB.hooks.afterRowRender({ element: rowB });
        expect(rowB.querySelector('.vt-action-select')).toBeNull();
    });

    it('renders dropdown and executes selected action branches', () => {
        const clickSpy = vi.fn(() => Promise.resolve());
        const table = createTable(
            [
                { id: 'approve', label: 'Approve', onClick: clickSpy },
                { id: 'delete', label: 'Delete' }
            ],
            { id: '1' }
        );

        actionsDropdownPlugin({ placeholder: 'Pick one' })(table);

        const element = document.createElement('tr');
        element.dataset.rowId = '1';
        const cell = document.createElement('td');
        cell.className = 'vt-actions-cell';

        const buttonA = document.createElement('button');
        buttonA.className = 'vt-action-btn';
        buttonA.dataset.actionId = 'approve';
        buttonA.textContent = 'Approve';

        const buttonB = document.createElement('button');
        buttonB.className = 'vt-action-btn';
        buttonB.dataset.actionId = '';
        buttonB.textContent = '';

        cell.appendChild(buttonA);
        cell.appendChild(buttonB);
        element.appendChild(cell);

        table.hooks.afterRowRender({ element });

        const select = element.querySelector('.vt-action-select');
        expect(select).not.toBeNull();
        expect(select.firstElementChild.textContent).toBe('Pick one');

        select.value = '';
        select.dispatchEvent(new Event('change'));

        select.value = 'approve';
        select.dispatchEvent(new Event('change'));

        return Promise.resolve().then(() => {
            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(table.emitEvent).toHaveBeenCalledWith('row:action', expect.objectContaining({ actionId: 'approve' }));
            expect(table.refresh).toHaveBeenCalled();
        });
    });

    it('skips action execution when action or row is missing', () => {
        const table = createTable(
            [
                { id: 'approve', label: 'Approve', onClick: vi.fn() },
                { id: 'delete', label: 'Delete' }
            ],
            null
        );
        actionsDropdownPlugin()(table);

        const element = document.createElement('tr');
        element.dataset.rowId = '1';
        const cell = document.createElement('td');
        cell.className = 'vt-actions-cell';

        const buttonA = document.createElement('button');
        buttonA.className = 'vt-action-btn';
        buttonA.dataset.actionId = 'approve';
        buttonA.textContent = 'Approve';

        const buttonB = document.createElement('button');
        buttonB.className = 'vt-action-btn';
        buttonB.dataset.actionId = 'delete';
        buttonB.textContent = '';

        cell.appendChild(buttonA);
        cell.appendChild(buttonB);
        element.appendChild(cell);

        table.hooks.afterRowRender({ element });

        const select = element.querySelector('.vt-action-select');
        select.value = 'delete';
        select.dispatchEvent(new Event('change'));

        expect(table.emitEvent).not.toHaveBeenCalled();
    });
});
