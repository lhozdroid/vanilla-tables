import { describe, expect, it } from 'vitest';
import { deepMerge } from '../../src/utils/deep-merge.js';

/**
 * Validates recursive object merge behavior.
 */
describe('deepMerge', () => {
    it('merges nested objects', () => {
        const result = deepMerge({ a: 1, nested: { enabled: true, size: 10 } }, { nested: { size: 20 }, b: 2 });

        expect(result).toEqual({ a: 1, b: 2, nested: { enabled: true, size: 20 } });
    });
});
