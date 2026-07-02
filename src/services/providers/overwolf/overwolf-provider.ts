/**
 * OverwolfProvider
 *
 * Layer:
 *   Player Synchronisation — Overwolf Implementation
 *
 * Owns:
 *   GEP message handling, inventory sync, loadout detection
 *
 * Never owns:
 *   Normalization, diffing, conflict resolution
 *   Engine state
 *
 * Input:
 *   Overwolf GEP window messages
 *
 * Output:
 *   IncomingPlayerSnapshot
 */

import type { IProvider, CapabilityManifest, ProviderStatus, ProviderHealth, IncomingPlayerSnapshot, SyncSource } from '../types';

declare const overwolf: any;

export class OverwolfProvider implements IProvider {
  readonly id = 'overwolf';
  readonly displayName = 'Overwolf';
  readonly priority = 100;
  readonly source: SyncSource = 'live';

  private _health: ProviderHealth = 'unavailable';
  private _lastContact: string | null = null;
  private _error: string | undefined;
  private snapshotListeners: Array<(snapshot: IncomingPlayerSnapshot) => void> = [];
  private messageHandler: ((msg: any) => void) | null = null;

  getCapabilities(): CapabilityManifest {
    return {
      apiVersion: '1.0',
      providerVersion: '1.0',
      supportsProfile: false,
      supportsCollections: true,
      supportsLiveLoadout: true,
      supportsLiveInventory: true,
      supportsBackgroundSync: true,
      supportsManualSync: false,
      supportsPlayerName: true,
      supportedCategories: ['Mods', 'Warframes', 'Primary', 'Secondary', 'Melee', 'Companion'],
    };
  }

  getStatus(): ProviderStatus {
    return {
      health: this._health,
      lastContact: this._lastContact,
      error: this._error,
      capabilities: {
        supportsProfile: false,
        supportsCollections: true,
        supportsLiveLoadout: true,
        supportsLiveInventory: true,
        supportsBackgroundSync: true,
        supportsPlayerName: true,
      },
    };
  }

  async getSnapshot(): Promise<IncomingPlayerSnapshot | null> {
    return null; // Overwolf is push-based via GEP events, not pull
  }

  onSnapshotUpdate(cb: (snapshot: IncomingPlayerSnapshot) => void): () => void {
    this.snapshotListeners.push(cb);
    return () => {
      const idx = this.snapshotListeners.indexOf(cb);
      if (idx >= 0) this.snapshotListeners.splice(idx, 1);
    };
  }

  async refresh(): Promise<void> {
    // Overwolf GEP pushes data — explicit refresh is a no-op
  }

  destroy(): void {
    this.removeMessageHandler();
    this.snapshotListeners = [];
  }

  start(): void {
    if (typeof overwolf === 'undefined') {
      this._health = 'unavailable';
      this._error = 'Overwolf not detected';
      return;
    }

    this._health = 'ready';
    this.installMessageHandler();
  }

  private installMessageHandler(): void {
    this.messageHandler = (msg: any) => {
      this._lastContact = new Date().toISOString();
      this._health = 'connected';

      if (msg.id === 'inventory-update') {
        const snapshot = this.buildInventorySnapshot(msg.data);
        if (snapshot) {
          this.snapshotListeners.forEach(l => l(snapshot));
        }
      }

      if (msg.id === 'loadout-update' && msg.data?.warframe?.id) {
        const snapshot = this.buildLoadoutSnapshot(msg.data);
        if (snapshot) {
          this.snapshotListeners.forEach(l => l(snapshot));
        }
      }

      if (msg.id === 'player-name' && msg.data?.name) {
        // Player name is handled separately
      }
    };

    try {
      overwolf.windows.onMessageReceived.addListener(this.messageHandler);
    } catch (e) {
      this._health = 'error';
      this._error = String(e);
    }
  }

  private removeMessageHandler(): void {
    if (this.messageHandler) {
      try {
        overwolf.windows.onMessageReceived.removeListener(this.messageHandler);
      } catch { /* overwolf API may not be available */ }
      this.messageHandler = null;
    }
  }

  private buildInventorySnapshot(data: any): IncomingPlayerSnapshot | null {
    if (!data?.uniqueNames && !Array.isArray(data)) return null;

    const uniqueNames: string[] = data.uniqueNames ?? data ?? [];
    if (uniqueNames.length === 0) return null;

    return {
      version: 1,
      syncedAt: new Date().toISOString(),
      source: 'live',
      confidence: 'live',
      provider: 'overwolf',
      collections: {
        modIds: uniqueNames,
        warframeIds: uniqueNames,
        weaponIds: uniqueNames,
        companionIds: uniqueNames,
        arcaneIds: uniqueNames,
        shardCounts: {},
      },
    };
  }

  private buildLoadoutSnapshot(data: any): IncomingPlayerSnapshot | null {
    if (!data?.warframe?.id) return null;

    const lo = data;
    return {
      version: 1,
      syncedAt: new Date().toISOString(),
      source: 'live',
      confidence: 'live',
      provider: 'overwolf',
      currentLoadout: {
        warframe: {
          id: lo.warframe.id,
          aura: lo.warframe.aura ?? null,
          exilus: lo.warframe.exilus ?? null,
          mods: lo.warframe.mods ?? [],
          arcanes: (lo.warframe.arcanes ?? []).filter(Boolean),
          shards: (lo.warframe.shards ?? []).slice(0, 5),
          helminthDonor: lo.warframe.helminthDonor,
        },
        weapons: {
          primary: lo.weapons?.primary ?? { id: '', mods: [], arcanes: [] },
          secondary: lo.weapons?.secondary ?? { id: '', mods: [], arcanes: [] },
          melee: lo.weapons?.melee ?? { id: '', mods: [], arcanes: [] },
        },
        companion: lo.companion?.id ? lo.companion : undefined,
      },
    };
  }
}
