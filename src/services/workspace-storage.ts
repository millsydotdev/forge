/**
 * WorkspaceStorage
 *
 * Layer:
 *   Workspace Architecture — Persistence Abstraction
 *
 * Owns:
 *   All persistent data: projects, builds, sessions, templates, timelines
 *
 * Never owns:
 *   Business logic
 *   Runtime document state
 *
 * Input:
 *   BuildFile, Project data, Session data
 *
 * Output:
 *   localStorage (today) — designed for IndexedDB/SQLite future
 */

import type { BuildFile } from './build-serializer';

interface StoredProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  buildIds: string[];
  workspaceVersion: number;
  projectVersion: number;
}

interface StoredSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  openTabIds: string[];
  activeTabId: string | null;
  projectId: string | null;
  panelLayout: { sidebar: number; inspector: number; drawer: number };
  panelCollapsed: { sidebar: boolean; inspector: boolean; drawer: boolean };
}

const KEYS = {
  projects: 'tndx_ws_projects',
  builds: 'tndx_ws_builds',
  session: 'tndx_ws_session',
  templates: 'tndx_ws_templates',
  workspaceVersion: 'tndx_ws_version',
};

export class WorkspaceStorage {
  private loaded = false;

  // ── Projects ─────────────────────────────────

  loadProjects(): StoredProject[] {
    try {
      const raw = localStorage.getItem(KEYS.projects);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  saveProjects(projects: StoredProject[]): void {
    try { localStorage.setItem(KEYS.projects, JSON.stringify(projects)); } catch { /* silent */ }
  }

  // ── Builds ───────────────────────────────────

  loadBuilds(): BuildFile[] {
    try {
      const raw = localStorage.getItem(KEYS.builds);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  saveBuilds(builds: BuildFile[]): void {
    try { localStorage.setItem(KEYS.builds, JSON.stringify(builds)); } catch { /* storage unavailable */ }
  }

  // ── Session ──────────────────────────────────

  loadSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEYS.session);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  saveSession(session: StoredSession): void {
    try { localStorage.setItem(KEYS.session, JSON.stringify(session)); } catch { /* storage unavailable */ }
  }

  clearSession(): void {
    try { localStorage.removeItem(KEYS.session); } catch { /* storage unavailable */ }
  }

  // ── Workspace Version ────────────────────────

  getWorkspaceVersion(): number {
    try { return parseInt(localStorage.getItem(KEYS.workspaceVersion) || '0', 10); }
    catch { return 0; }
  }

  setWorkspaceVersion(v: number): void {
    try { localStorage.setItem(KEYS.workspaceVersion, String(v)); } catch { /* storage unavailable */ }
  }

  // ── Bulk operations ──────────────────────────

  clearAll(): void {
    for (const key of Object.values(KEYS)) {
      try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
    }
  }
}
