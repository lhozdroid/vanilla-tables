/**
 * Provides a minimal publish-subscribe event bus.
 */
export class EventEmitter {
    /**
     * Creates a new event emitter instance.
     */
    constructor() {
        /** @type {Map<string, Function[]>} */
        this.listeners = new Map();
    }

    /**
     * Registers an event callback.
     *
     * @param {string} event
     * @param {(payload: any) => void} callback
     * @returns {() => void}
     */
    on(event, callback) {
        const list = this.listeners.get(event) || [];
        list.push(callback);
        this.listeners.set(event, list);
        return () => this.off(event, callback);
    }

    /**
     * Removes an event callback.
     *
     * @param {string} event
     * @param {(payload: any) => void} callback
     * @returns {void}
     */
    off(event, callback) {
        const list = this.listeners.get(event);
        if (!list) return;
        this.listeners.set(
            event,
            list.filter((item) => item !== callback)
        );
    }

    /**
     * Emits an event payload to registered listeners.
     *
     * @param {string} event
     * @param {any} payload
     * @returns {void}
     */
    emit(event, payload) {
        const list = this.listeners.get(event);
        if (!list) return;
        for (const callback of list) callback(payload);
    }
}
