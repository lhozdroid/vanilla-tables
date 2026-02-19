import { test, expect } from '@playwright/test';
import { openScenario, readEvents } from './helpers.js';

/**
 * Validates expandable rows, editing, and action plugins.
 */
test.describe('row features', () => {
    test('supports expand, edit, and action dropdown flows', ({ page }) => {
        return openScenario(page, 'row-features')
            .then(() => page.click('.vt-expand-trigger'))
            .then(() => expect(page.locator('.row-detail')).toContainText('Details for'))
            .then(() => page.dblclick('tbody tr.vt-row:first-child .vt-cell-editable[data-key="name"]'))
            .then(() => page.fill('.vt-inline-input', 'Edited User'))
            .then(() => page.keyboard.press('Enter'))
            .then(() => expect(page.locator('tbody tr.vt-row:first-child')).toContainText('Edited User'))
            .then(() => page.selectOption('.vt-action-select', 'approve'))
            .then(() => expect(page.locator('#action-count')).toContainText('1'))
            .then(() => readEvents(page))
            .then((events) => {
                expect(events.some((item) => item.name === 'row:expand')).toBe(true);
                expect(events.some((item) => item.name === 'row:edit')).toBe(true);
                expect(events.some((item) => item.name === 'row:action')).toBe(true);
            });
    });
});
