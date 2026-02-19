import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from '../../src/utils/event-emitter.js';

/**
 * Validates event subscription, emission, and teardown behavior.
 */
describe('EventEmitter', () => {
    it('subscribes and emits payloads', () => {
        const bus = new EventEmitter();
        const callback = vi.fn();

        bus.on('change', callback);
        bus.emit('change', { ok: true });

        expect(callback).toHaveBeenCalledWith({ ok: true });
    });

    it('unsubscribes listeners', () => {
        const bus = new EventEmitter();
        const callback = vi.fn();

        const off = bus.on('change', callback);
        off();
        bus.emit('change', { ok: true });

        expect(callback).not.toHaveBeenCalled();
    });
});
