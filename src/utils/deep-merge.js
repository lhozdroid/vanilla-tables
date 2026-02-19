/**
 * Merges two plain objects recursively.
 *
 * @param {Record<string, any>} base
 * @param {Record<string, any>} extra
 * @returns {Record<string, any>}
 */
export function deepMerge(base, extra) {
    const output = { ...base };

    for (const key of Object.keys(extra || {})) {
        const baseValue = output[key];
        const extraValue = extra[key];

        if (isObject(baseValue) && isObject(extraValue)) {
            output[key] = deepMerge(baseValue, extraValue);
        } else {
            output[key] = extraValue;
        }
    }

    return output;
}

/**
 * Checks whether a value is a non-array object.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
