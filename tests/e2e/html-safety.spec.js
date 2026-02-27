import { test, expect } from '@playwright/test';
import { openScenario } from './helpers.js';

/**
 * Validates sanitizeHtml behavior for HTML-producing extension points.
 */
test.describe('html safety', () => {
    test('sanitizes HTML from column.render and expandRow', ({ page }) => {
        return openScenario(page, 'html-safety')
            .then(() => expect(page.locator('tbody tr.vt-row td[data-key="name"]')).toContainText('<strong>Alice</strong>'))
            .then(() => expect(page.locator('tbody tr.vt-row td[data-key="name"] img')).toHaveCount(0))
            .then(() => page.click('.vt-expand-trigger'))
            .then(() => expect(page.locator('.vt-expand-content')).toContainText('<em>Details</em>'))
            .then(() => expect(page.locator('.vt-expand-content script')).toHaveCount(0))
            .then(() =>
                page.evaluate(() => {
                    return {
                        cellXss: Boolean(window.__xssCell),
                        expandXss: Boolean(window.__xssExpand)
                    };
                })
            )
            .then((flags) => {
                expect(flags.cellXss).toBe(false);
                expect(flags.expandXss).toBe(false);
            });
    });
});
