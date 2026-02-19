import { expect } from '@playwright/test';

/**
 * Opens the fixture page for the given scenario.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} scenario
 * @returns {Promise<void>}
 */
export function openScenario(page, scenario) {
    return page
        .goto(`/?scenario=${scenario}`)
        .then(() => page.waitForFunction(() => document.body.dataset.ready === 'true'))
        .then(() => expect(page.locator('#scenario-label')).toContainText(`scenario: ${scenario}`));
}

/**
 * Returns the serialized table state from the fixture runtime.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Record<string, any>>}
 */
export function readState(page) {
    return page.evaluate(() => window.__e2e.getState());
}

/**
 * Returns tracked lifecycle events from the fixture runtime.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Array<{ name: string, payload: any }>>}
 */
export function readEvents(page) {
    return page.evaluate(() => window.__e2e.getEvents());
}
