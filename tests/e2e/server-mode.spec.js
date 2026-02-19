import { test, expect } from '@playwright/test';
import { openScenario, readState, readEvents } from './helpers.js';

/**
 * Validates server-side mode query and event behavior.
 */
test.describe('server mode', () => {
    test('requests data on search, sort, and page changes', ({ page }) => {
        return openScenario(page, 'server')
            .then(() => expect(page.locator('#fetch-count')).toContainText('1'))
            .then(() => page.fill('.vt-search', 'user 4'))
            .then(() => expect(page.locator('#fetch-count')).toContainText('2'))
            .then(() => page.click('.vt-sort-trigger[data-key="name"]'))
            .then(() => expect(page.locator('#fetch-count')).toContainText('3'))
            .then(() => page.click('.vt-next'))
            .then(() => expect(page.locator('#fetch-count')).toContainText('4'))
            .then(() => readState(page))
            .then((state) => {
                expect(state.page).toBe(2);
            })
            .then(() => readEvents(page))
            .then((events) => {
                expect(events.some((item) => item.name === 'loading:change')).toBe(true);
                expect(events.some((item) => item.name === 'state:change')).toBe(true);
            });
    });
});
