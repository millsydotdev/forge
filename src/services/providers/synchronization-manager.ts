/**
 * SynchronizationManager
 *
 * Layer:
 *   Player Synchronisation — Pipeline Orchestration
 *
 * Owns:
 *   The sync pipeline: receive → normalize → diff → resolve → emit
 *
 * Never owns:
 *   Game calculations
 *   Ownership UI
 *   Provider-specific APIs (Overwolf, Electron, etc.)
 *
 * Input:
 *   IncomingPlayerSnapshot (from any provider)
 *
 * Output:
 *   PlayerEventBus events
 */

import type { IncomingPlayerSnapshot, CanonicalPlayerModel, ChangeSet } from './types';
import { Normalizer } from './normalizer';
import { DiffEngine } from './diff-engine';
import { ConflictResolver, type ConflictStrategy } from './conflict-resolver';
import { PlayerEventBus } from './player-event-bus';

export class SynchronizationManager {
  private normalizer: Normalizer;
  private diffEngine: DiffEngine;
  private conflictResolver: ConflictResolver;
  private eventBus: PlayerEventBus;
  private currentModel: CanonicalPlayerModel | null = null;

  constructor(eventBus: PlayerEventBus, strategy: ConflictStrategy = 'auto-merge') {
    this.normalizer = new Normalizer();
    this.diffEngine = new DiffEngine();
    this.conflictResolver = new ConflictResolver(strategy);
    this.eventBus = eventBus;
  }

  setConflictStrategy(strategy: ConflictStrategy): void {
    this.conflictResolver.setStrategy(strategy);
  }

  getCurrentModel(): CanonicalPlayerModel | null {
    return this.currentModel;
  }

  getEventBus(): PlayerEventBus {
    return this.eventBus;
  }

  async processSnapshot(
    snapshot: IncomingPlayerSnapshot,
    hasUnsavedChanges: () => boolean,
    onConfirm?: (changeSet: ChangeSet) => Promise<boolean>,
  ): Promise<void> {
    this.eventBus.emit('sync-started', { provider: snapshot.provider, source: snapshot.source });

    try {
      // 1. Normalize
      const canonical = this.normalizer.normalize(snapshot);

      // 2. Diff
      const changeSet = this.diffEngine.diff(canonical, this.currentModel);

      if (!changeSet.hasChanges) {
        this.eventBus.emit('sync-completed', { provider: snapshot.provider, data: { changed: false } });
        return;
      }

      // 3. Resolve conflicts
      const applied = await this.conflictResolver.resolve(canonical, changeSet, hasUnsavedChanges, onConfirm);

      if (applied) {
        this.currentModel = canonical;

        // Emit specific events
        if (changeSet.collectionsChanged) {
          this.eventBus.emit('inventory-updated', { provider: snapshot.provider, data: { changeSet: changeSet.collectionChanges } });
        }
        if (changeSet.loadoutChanged) {
          this.eventBus.emit('loadout-detected', { provider: snapshot.provider, data: { changeSet: changeSet.loadoutChanges } });
        }
        if (changeSet.profileChanged) {
          this.eventBus.emit('profile-changed', { provider: snapshot.provider, data: { changeSet: changeSet.profileChanges } });
        }

        this.eventBus.emit('sync-completed', { provider: snapshot.provider, data: { changed: true } });
      } else {
        this.eventBus.emit('sync-completed', { provider: snapshot.provider, data: { changed: false, skipped: true } });
      }
    } catch (error) {
      this.eventBus.emit('sync-failed', { provider: snapshot.provider, data: { error: String(error) } });
    }
  }
}
