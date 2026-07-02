/**
 * PlayerEventBus
 *
 * Layer:
 *   Player Synchronisation — Event Distribution
 *
 * Owns:
 *   Event dispatch and listener management
 *
 * Never owns:
 *   Provider lifecycle
 *   Store mutations directly (triggers them via events)
 *
 * Input:
 *   Events from SynchronizationManager
 *
 * Output:
 *   Dispatched events to all registered listeners
 */

import type { PlayerEvent, PlayerEventType } from './types';

export class PlayerEventBus {
  private listeners: Map<PlayerEventType, Array<(event: PlayerEvent) => void>> = new Map();
  private wildcardListeners: Array<(event: PlayerEvent) => void> = [];

  on(type: PlayerEventType, listener: (event: PlayerEvent) => void): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
    return () => {
      const list = this.listeners.get(type);
      if (list) {
        const idx = list.indexOf(listener);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  onAny(listener: (event: PlayerEvent) => void): () => void {
    this.wildcardListeners.push(listener);
    return () => {
      const idx = this.wildcardListeners.indexOf(listener);
      if (idx >= 0) this.wildcardListeners.splice(idx, 1);
    };
  }

  emit(type: PlayerEventType, event: Partial<PlayerEvent>): void {
    const full: PlayerEvent = {
      type,
      timestamp: new Date().toISOString(),
      ...event,
    };

    // Dispatch to type-specific listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try { listener(full); } catch (e) { console.error('[PlayerEventBus] Listener error:', e); } // eslint-disable-line no-console
      }
    }

    // Dispatch to wildcard listeners
    for (const listener of this.wildcardListeners) {
      try { listener(full); } catch (e) { console.error('[PlayerEventBus] Wildcard listener error:', e); } // eslint-disable-line no-console
    }
  }

  removeAll(): void {
    this.listeners.clear();
    this.wildcardListeners = [];
  }
}
