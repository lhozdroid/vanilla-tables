import { test, expect } from '@playwright/test';
import { openScenario } from './helpers.js';

/**
 * Validates fixed layout and virtual scrolling behavior.
 */
test.describe('layout and virtual scroll', () => {
    test('applies fixed header/footer/columns in fixed-layout scenario', ({ page }) => {
        return openScenario(page, 'fixed-layout')
            .then(() => expect(page.locator('thead')).toHaveClass(/vt-fixed-header/))
            .then(() => expect(page.locator('.vt-footer')).toHaveClass(/vt-fixed-footer/))
            .then(() => expect(page.locator('.vt-fixed-column').first()).toBeVisible())
            .then(() => expect(page.locator('.vt-fixed-top-row')).toHaveCount(1))
            .then(() => expect(page.locator('.table').first()).toBeVisible());
    });

    test('renders virtual spacers while scrolling', ({ page }) => {
        return openScenario(page, 'virtual')
            .then(() => expect(page.locator('.vt-virtual-bottom')).toHaveCount(1))
            .then(() =>
                page.evaluate(() => {
                    const wrap = document.querySelector('.vt-table-wrap');
                    wrap.scrollTop = 900;
                    wrap.dispatchEvent(new Event('scroll', { bubbles: true }));
                })
            )
            .then(() => page.waitForTimeout(80))
            .then(() => expect(page.locator('.vt-virtual-top')).toHaveCount(1));
    });
});
