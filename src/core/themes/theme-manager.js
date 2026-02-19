/**
 * Resolves theme class names from semantic keys.
 */
export class ThemeManager {
    /**
     * Creates a theme manager instance.
     *
     * @param {Record<string, string>} classes
     */
    constructor(classes = {}) {
        /** @type {Record<string, string>} */
        this.classes = classes;
    }

    /**
     * Replaces stored theme classes.
     *
     * @param {Record<string, string>} classes
     * @returns {void}
     */
    setClasses(classes) {
        this.classes = classes || {};
    }

    /**
     * Returns composed class names for a semantic key.
     *
     * @param {string} key
     * @param {string} base
     * @returns {string}
     */
    classOf(key, base) {
        const extra = this.classes?.[key];
        return extra ? `${base} ${extra}` : base;
    }
}
