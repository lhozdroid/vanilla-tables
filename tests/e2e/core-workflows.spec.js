import { test, expect } from '@playwright/test';
import { openScenario, readState, readEvents } from './helpers.js';

/**
 * Validates core table workflows in a real browser context.
 */
test.describe('core workflows', () => {
    test('handles search, filter, sort, multi-sort, and pagination', ({ page }) => {
        return openScenario(page, 'basic')
            .then(() => page.fill('.vt-search', 'user 120'))
            .then(() => expect(page.locator('tbody tr.vt-row')).toHaveCount(1))
            .then(() => page.fill('.vt-search', ''))
            .then(() => page.locator('.vt-column-filter[data-key="city"]').fill('paris'))
            .then(() => expect(page.locator('tbody tr.vt-row')).toHaveCount(10))
            .then(() => page.locator('.vt-column-filter[data-key="city"]').fill(''))
            .then(() => page.locator('.vt-sort-trigger[data-key="age"]').click())
            .then(() => page.locator('.vt-sort-trigger[data-key="name"]').click({ modifiers: ['Shift'] }))
            .then(() => readState(page))
            .then((state) => {
                expect(state.sorts).toHaveLength(2);
                expect(state.sorts[0].key).toBe('age');
            })
            .then(() => page.selectOption('.vt-size', '20'))
            .then(() => expect(page.locator('.vt-info')).toContainText('20'))
            .then(() => page.click('.vt-next'))
            .then(() => readState(page))
            .then((state) => {
                expect(state.page).toBe(2);
            })
            .then(() => readEvents(page))
            .then((events) => {
                expect(events.some((item) => item.name === 'search:change')).toBe(true);
                expect(events.some((item) => item.name === 'sort:change')).toBe(true);
                expect(events.some((item) => item.name === 'page:change')).toBe(true);
            });
    });
});
