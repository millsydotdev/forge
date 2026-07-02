/**
 * LocalProvider
 *
 * Layer:
 *   Player Synchronisation — Local/Manual Implementation
 *
 * Owns:
 *   Manual ownership marking
 *   Bridging ImportFramework snapshots into the provider system
 *
 * Never owns:
 *   Normalization, diffing, conflict resolution
 *   Engine state
 *
 * Input:
 *   Manual ownership toggles from UI
 *   ImportFramework snapshots
 *
 * Output:
 *   IncomingPlayerSnapshot
 */

import type { IProvider, CapabilityManifest, ProviderStatus, ProviderHealth, IncomingPlayerSnapshot, SyncSource } from '../types';

export class LocalProvider implements IProvider {
  readonly id = 'local';
  readonly displayName = 'Local';
  readonly priority = 50;
  readonly source: SyncSource = 'manual';

  private _health: ProviderHealth = 'ready';
  private snapshotListeners: Array<(snapshot: IncomingPlayerSnapshot) => void> = [];

  getCapabilities(): CapabilityManifest {
    return {
      apiVersion: '1.0',
      providerVersion: '1.0',
      supportsProfile: true,
      supportsCollections: true,
      supportsLiveLoadout: false,
      supportsLiveInventory: false,
      supportsBackgroundSync: false,
      supportsManualSync: true,
      supportsPlayerName: true,
      supportedCategories: ['Mods', 'Warframes', 'Primary', 'Secondary', 'Melee', 'Companion'],
    };
  }

  getStatus(): ProviderStatus {
    return {
      health: this._health,
      lastContact: null,
      capabilities: {
        supportsProfile: true,
        supportsCollections: true,
        supportsManualSync: true,
      },
    };
  }

  async getSnapshot(): Promise<IncomingPlayerSnapshot | null> {
    return null; // Local is not auto-sync — manual or import-based
  }

  onSnapshotUpdate(cb: (snapshot: IncomingPlayerSnapshot) => void): () => void {
    this.snapshotListeners.push(cb);
    return () => {
      const idx = this.snapshotListeners.indexOf(cb);
      if (idx >= 0) this.snapshotListeners.splice(idx, 1);
    };
  }

  async refresh(): Promise<void> {}

  destroy(): void {
    this.snapshotListeners = [];
  }

  /**
   * Manually emit a snapshot (called from UI when user marks ownership or uses ImportFramework).
   */
  emitSnapshot(snapshot: IncomingPlayerSnapshot): void {
    this.snapshotListeners.forEach(l => l(snapshot));
  }
}
