/**
 * WorkspaceEventBus
 *
 * Layer:
 *   Workspace Architecture — Inter-Manager Communication
 *
 * Owns:
 *   Typed event dispatch between all workspace managers
 *
 * Never owns:
 *   Business logic
 *   State mutations
 *
 * Rule: Managers may never import each other directly.
 *       All communication occurs through this bus.
 */

export type WorkspaceEventType =
  | 'document-opened' | 'document-closed' | 'document-saved'
  | 'project-created' | 'project-deleted' | 'branch-created'
  | 'tab-activated' | 'tab-closed'
  | 'command-executed' | 'undone' | 'redone'
  | 'session-recovered'
  | 'search-index-updated'
  | 'workspace-ready';

export interface WorkspaceEvent {
  type: WorkspaceEventType;
  timestamp: string;
  source: string;
  data?: Record<string, unknown>;
}

export class WorkspaceEventBus {
  private listeners: Map<WorkspaceEventType, Array<(event: WorkspaceEvent) => void>> = new Map();
  private wildcardListeners: Array<(event: WorkspaceEvent) => void> = [];

  on(type: WorkspaceEventType, listener: (event: WorkspaceEvent) => void): () => void {
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

  onAny(listener: (event: WorkspaceEvent) => void): () => void {
    this.wildcardListeners.push(listener);
    return () => {
      const idx = this.wildcardListeners.indexOf(listener);
      if (idx >= 0) this.wildcardListeners.splice(idx, 1);
    };
  }

  emit(type: WorkspaceEventType, source: string, data?: Record<string, unknown>): void {
    const event: WorkspaceEvent = { type, timestamp: new Date().toISOString(), source, data };
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try { listener(event); } catch (e) { console.error('[WorkspaceEventBus] Listener error:', e); } // eslint-disable-line no-console
      }
    }
    for (const listener of this.wildcardListeners) {
      try { listener(event); } catch (e) { console.error('[WorkspaceEventBus] Wildcard error:', e); } // eslint-disable-line no-console
    }
  }

  removeAll(): void {
    this.listeners.clear();
    this.wildcardListeners = [];
  }
}
