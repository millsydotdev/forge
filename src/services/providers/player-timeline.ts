/**
 * PlayerTimeline
 *
 * Layer:
 *   Player Synchronisation — History & Session Tracking
 *
 * Owns:
 *   Synchronisation history with session boundaries
 *   Derived events: game started, game closed, sync milestones
 *
 * Never owns:
 *   Provider lifecycle
 *   Store mutations
 *
 * Input:
 *   PlayerEventBus events
 *
 * Output:
 *   Timeline query API for UI
 */

import type { TimelineEntry, CanonicalPlayerModel, ChangeSet, PlayerEvent, SyncSource, SyncConfidence } from './types';
import { Brand } from '../../services/visual-manager';

const STORAGE_KEY = Brand.getStorageKey('player_timeline');
const MAX_ENTRIES = 30;

export class PlayerTimeline {
  private entries: TimelineEntry[] = [];
  private sessionCount = 0;
  private lastEventTime = 0;

  constructor() {
    this.load();
  }

  recordSync(
    label: string,
    source: SyncSource,
    confidence: SyncConfidence,
    snapshot?: CanonicalPlayerModel,
    changeSet?: ChangeSet,
  ): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      type: 'sync',
      label,
      source,
      confidence,
      snapshot,
      changeSet,
    });
  }

  recordEvent(event: PlayerEvent, snapshot?: CanonicalPlayerModel): void {
    const now = Date.now();

    // Detect game session boundaries from event patterns
    if (event.type === 'sync-started') {
      // If more than 10 minutes since last event, consider it a new session
      if (now - this.lastEventTime > 10 * 60 * 1000) {
        this.sessionCount++;
      }
    }

    this.lastEventTime = now;
    this.addEntry({
      timestamp: event.timestamp,
      type: event.type,
      label: this.labelForEvent(event),
      source: event.source ?? 'unknown',
      confidence: 'live',
      snapshot,
    });
  }

  getRecent(count = 10): TimelineEntry[] {
    return this.entries.slice(0, Math.min(count, this.entries.length));
  }

  getSessionCount(): number {
    return this.sessionCount;
  }

  getAll(): TimelineEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.save();
  }

  private addEntry(entry: TimelineEntry): void {
    this.entries.unshift(entry);
    if (this.entries.length > MAX_ENTRIES) {
      this.entries = this.entries.slice(0, MAX_ENTRIES);
    }
    this.save();
  }

  private labelForEvent(event: PlayerEvent): string {
    switch (event.type) {
      case 'sync-started': return 'Sync Started';
      case 'sync-completed': return event.data?.changed ? 'Synced' : 'No Changes';
      case 'sync-failed': return 'Sync Failed';
      case 'inventory-updated': return 'Inventory Updated';
      case 'loadout-detected': return `Session ${this.sessionCount} — Loadout Detected`;
      case 'loadout-imported': return 'Loadout Imported';
      case 'profile-changed': return 'Profile Updated';
      case 'provider-health-changed': return 'Provider Status Changed';
      case 'game-detected': return 'Game Started';
      case 'game-closed': return 'Game Closed';
      default: return event.type;
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.entries = JSON.parse(raw);
    } catch { /* storage unavailable */ }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch { /* storage unavailable */ }
  }
}
