/**
 * SessionManager
 *
 * Layer:
 *   Workspace Architecture — Autosave & Crash Recovery
 *
 * Owns:
 *   Session persistence, crash recovery detection
 *
 * Never owns:
 *   Documents, projects, tabs (only references their IDs)
 *
 * Communication:
 *   Emits events via WorkspaceEventBus
 */

import type { WorkspaceEventBus } from './workspace-event-bus';

interface SessionData {
  id: string;
  createdAt: number;
  updatedAt: number;
  openTabIds: string[];
  activeTabId: string | null;
  projectId: string | null;
  panelLayout: { sidebar: number; inspector: number; drawer: number };
  panelCollapsed: { sidebar: boolean; inspector: boolean; drawer: boolean };
  dirtyDocCount: number;
}

const SESSION_KEY = 'tndx_ws_session';

export class SessionManager {
  private eventBus: WorkspaceEventBus;
  private saveInterval: ReturnType<typeof setInterval> | null = null;

  constructor(eventBus: WorkspaceEventBus) {
    this.eventBus = eventBus;
  }

  save(data: Omit<SessionData, 'id' | 'createdAt' | 'updatedAt'>): void {
    const existing = this.load();
    const session: SessionData = {
      ...existing,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      ...data,
    };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* storage unavailable */ }
  }

  load(): SessionData | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; } // silent: private browsing or storage unavailable
  }

  clear(): void {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
  }

  hasUnrecoveredSession(): boolean {
    const session = this.load();
    if (!session) return false;
    // Check if the session has dirty docs — suggests a crash
    return session.dirtyDocCount > 0;
  }

  startAutosave(saveFn: () => void, intervalMs = 30000): void {
    this.stopAutosave();
    this.saveInterval = setInterval(saveFn, intervalMs);
  }

  stopAutosave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  destroy(): void {
    this.stopAutosave();
  }
}
