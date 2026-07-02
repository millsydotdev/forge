/**
 * ImportFramework
 *
 * Layer:
 *   Player Synchronisation — Data Import
 *
 * Owns:
 *   Importing data from JSON, clipboard, build codec into IncomingPlayerSnapshot
 *
 * Never owns:
 *   Provider lifecycle (importers are transient producers, not persistent providers)
 *   Store mutations
 *
 * Input:
 *   Raw data (JSON string, clipboard text, build code)
 *
 * Output:
 *   IncomingPlayerSnapshot (feeds into SynchronizationManager)
 */

import type { IncomingPlayerSnapshot, SyncSource } from './types';

export class ImportFramework {
  /**
   * Import from a raw JSON string (e.g., exported build file).
   */
  importFromJson(json: string): IncomingPlayerSnapshot | { error: string } {
    try {
      const parsed = JSON.parse(json);
      return this.toSnapshot(parsed, 'imported');
    } catch {
      return { error: 'Invalid JSON' };
    }
  }

  /**
   * Import from the tndx1: clipboard format.
   */
  importFromClipboardCode(code: string): IncomingPlayerSnapshot | { error: string } {
    try {
      if (!code.startsWith('tndx1:')) return { error: 'Invalid build code format' };
      const base64 = code.slice(6);
      const json = atob(base64);
      const parsed = JSON.parse(json);
      return this.toSnapshot(parsed, 'imported');
    } catch {
      return { error: 'Failed to decode build code' };
    }
  }

  /**
   * Create a manual ownership snapshot.
   */
  createManualSnapshot(
    ownedModIds: string[],
    ownedWarframeIds: string[],
    ownedWeaponIds: string[],
    ownedCompanionIds: string[],
    ownedArcaneIds: string[],
  ): IncomingPlayerSnapshot {
    return {
      version: 1,
      syncedAt: new Date().toISOString(),
      source: 'manual',
      confidence: 'manual',
      provider: 'local',
      collections: {
        modIds: ownedModIds,
        warframeIds: ownedWarframeIds,
        weaponIds: ownedWeaponIds,
        companionIds: ownedCompanionIds,
        arcaneIds: ownedArcaneIds,
        shardCounts: {},
      },
    };
  }

  private toSnapshot(data: Record<string, unknown>, source: SyncSource): IncomingPlayerSnapshot {
    return {
      version: 1,
      syncedAt: new Date().toISOString(),
      source,
      confidence: 'manual',
      provider: 'import',
      profile: data.profile as IncomingPlayerSnapshot['profile'],
      collections: data.collections as IncomingPlayerSnapshot['collections'],
      currentLoadout: data.currentLoadout as IncomingPlayerSnapshot['currentLoadout'],
    };
  }
}
