/**
 * WorkspaceManager
 *
 * Layer:
 *   Workspace Architecture — Root Authority
 *
 * Owns:
 *   All sub-managers, event bus, session lifecycle
 *   Single entry point for the entire editing session
 *
 * Never owns:
 *   Calculation engine (separate layer)
 *   UI rendering (separate layer)
 *
 * Rule: Sub-managers never import each other directly.
 *       All communication occurs through the WorkspaceEventBus.
 */

import { WorkspaceEventBus } from './workspace-event-bus';
import { DocumentManager } from './document-manager';
import { ProjectManager } from './project-manager';
import { TabManager, type Tab } from './tab-manager';
import { CommandHistory } from './command-history';
import { SessionManager } from './session-manager';
import { SearchManager } from './search-manager';
import { WorkspaceStorage } from './workspace-storage';

export interface WorkspaceState {
  version: number;
  tabs: { tabs: Tab[]; activeTabId: string | null };
  projectData: ReturnType<ProjectManager['toData']>;
}

export class WorkspaceManager {
  readonly events: WorkspaceEventBus;
  readonly documents: DocumentManager;
  readonly projects: ProjectManager;
  readonly tabs: TabManager;
  readonly history: CommandHistory;
  readonly sessions: SessionManager;
  readonly search: SearchManager;
  readonly storage: WorkspaceStorage;

  private initialized = false;

  constructor() {
    this.events = new WorkspaceEventBus();
    this.storage = new WorkspaceStorage();
    this.documents = new DocumentManager(this.events);
    this.projects = new ProjectManager(this.events);
    this.tabs = new TabManager(this.events);
    this.history = new CommandHistory(this.events);
    this.sessions = new SessionManager(this.events);
    this.search = new SearchManager(this.events);
  }

  /** Initialize the workspace — load persisted data, restore session */
  initialize(): void {
    if (this.initialized) return;

    // Load projects and builds from storage
    const projects = this.storage.loadProjects();
    const buildFiles = this.storage.loadBuilds();

    this.projects.loadFromData(projects);
    this.documents.loadFromFiles(buildFiles);

    // Restore last session if available
    const session = this.storage.loadSession();
    if (session) {
      this.tabs.loadFromData({ tabs: session.openTabIds.map(id => ({ buildId: id, title: '', pinned: false })), activeTabId: session.activeTabId });
    }

    this.initialized = true;
    this.events.emit('workspace-ready', 'WorkspaceManager');
  }

  /** Persist all state to storage */
  save(): void {
    this.storage.saveBuilds(this.documents.toFiles());
    this.storage.saveProjects(this.projects.toData());
    this.saveSession();
  }

  /** Save current session (tabs, layout, active document) */
  saveSession(): void {
    const tabs = this.tabs.toData();
    const dirtyCount = this.documents.getDirtyCount();
    this.sessions.save({
      openTabIds: tabs.tabs.map(t => t.buildId),
      activeTabId: tabs.activeTabId,
      projectId: null,
      panelLayout: { sidebar: 220, inspector: 300, drawer: 160 },
      panelCollapsed: { sidebar: false, inspector: false, drawer: false },
      dirtyDocCount: dirtyCount,
    });
  }

  /** Start auto-save */
  startAutosave(intervalMs = 30000): void {
    this.sessions.startAutosave(() => this.save(), intervalMs);
  }

  /** Stop auto-save */
  stopAutosave(): void {
    this.sessions.stopAutosave();
  }

  /** Check if there's an unrecovered session (crash recovery) */
  hasUnrecoveredSession(): boolean {
    return this.sessions.hasUnrecoveredSession();
  }

  /** Clear session state (on clean exit) */
  clearSession(): void {
    this.sessions.clear();
  }

  /** Clean up all resources */
  destroy(): void {
    this.stopAutosave();
    this.documents.destroy();
    this.projects.destroy();
    this.tabs.destroy();
    this.history.destroy();
    this.sessions.destroy();
    this.events.removeAll();
    this.initialized = false;
  }
}

/** Singleton instance */
export const workspaceManager = new WorkspaceManager();
