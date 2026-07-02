/**
 * TabManager
 *
 * Layer:
 *   Workspace Architecture — Build Tab Lifecycle
 *
 * Owns:
 *   Open tabs, tab ordering, active tab state
 *
 * Never owns:
 *   Build documents (delegates to DocumentManager)
 *
 * Communication:
 *   Emits events via WorkspaceEventBus
 */

import type { WorkspaceEventBus } from './workspace-event-bus';

export interface Tab {
  buildId: string;
  title: string;
  pinned: boolean;
}

export class TabManager {
  private tabs: Tab[] = [];
  private activeTabId: string | null = null;
  private eventBus: WorkspaceEventBus;

  constructor(eventBus: WorkspaceEventBus) {
    this.eventBus = eventBus;
  }

  getTabs(): Tab[] {
    return [...this.tabs];
  }

  getActiveTabId(): string | null {
    return this.activeTabId;
  }

  open(buildId: string, title: string): void {
    const existing = this.tabs.find(t => t.buildId === buildId);
    if (!existing) {
      this.tabs.push({ buildId, title, pinned: false });
    }
    this.activeTabId = buildId;
    this.eventBus.emit('tab-activated', 'TabManager', { buildId });
  }

  close(buildId: string): void {
    const idx = this.tabs.findIndex(t => t.buildId === buildId);
    if (idx >= 0) {
      this.tabs.splice(idx, 1);
      if (this.activeTabId === buildId) {
        this.activeTabId = this.tabs.length > 0 ? this.tabs[Math.min(idx, this.tabs.length - 1)].buildId : null;
      }
      this.eventBus.emit('tab-closed', 'TabManager', { buildId });
    }
  }

  activate(buildId: string): void {
    if (this.tabs.find(t => t.buildId === buildId)) {
      this.activeTabId = buildId;
      this.eventBus.emit('tab-activated', 'TabManager', { buildId });
    }
  }

  closeOthers(buildId: string): void {
    this.tabs = this.tabs.filter(t => t.buildId === buildId);
    this.activeTabId = buildId;
  }

  closeAll(): void {
    this.tabs = [];
    this.activeTabId = null;
  }

  togglePin(buildId: string): void {
    const tab = this.tabs.find(t => t.buildId === buildId);
    if (tab) tab.pinned = !tab.pinned;
  }

  reorder(fromIndex: number, toIndex: number): void {
    const [moved] = this.tabs.splice(fromIndex, 1);
    if (moved) this.tabs.splice(toIndex, 0, moved);
  }

  getTabsByBuildId(buildId: string): Tab | undefined {
    return this.tabs.find(t => t.buildId === buildId);
  }

  toData(): { tabs: Tab[]; activeTabId: string | null } {
    return { tabs: [...this.tabs], activeTabId: this.activeTabId };
  }

  loadFromData(data: { tabs: Tab[]; activeTabId: string | null }): void {
    this.tabs = data.tabs;
    this.activeTabId = data.activeTabId;
  }

  destroy(): void {
    this.tabs = [];
    this.activeTabId = null;
  }
}
