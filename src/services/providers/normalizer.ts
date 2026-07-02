/**
 * Normalizer
 *
 * Layer:
 *   Player Synchronisation — Data Normalization
 *
 * Owns:
 *   Converting IncomingPlayerSnapshot → CanonicalPlayerModel
 *   Validation, normalization, migration, ID mapping, repair
 *
 * Never owns:
 *   Provider lifecycle
 *   Store mutations
 *
 * Input:
 *   IncomingPlayerSnapshot
 *
 * Output:
 *   CanonicalPlayerModel
 */

import type { IncomingPlayerSnapshot, CanonicalPlayerModel, CanonicalMod, CanonicalArcane, CanonicalShard } from './types';
import { gameData } from '../../data/game-data';

export class Normalizer {
  /**
   * Normalize an incoming snapshot into the canonical player model.
   * Validates uniqueNames against WFCD data, repairs missing fields,
   * and produces a consistent internal representation.
   */
  normalize(snapshot: IncomingPlayerSnapshot): CanonicalPlayerModel {
    const modIds = new Set<string>();
    for (const id of snapshot.collections?.modIds ?? []) {
      const exists = this.itemExistsInWFCD(id);
      if (exists) modIds.add(id);
    }

    const warframeIds = new Set<string>();
    for (const id of snapshot.collections?.warframeIds ?? []) {
      const exists = this.itemExistsInWFCD(id);
      if (exists) warframeIds.add(id);
    }

    const weaponIds = new Set<string>();
    for (const id of snapshot.collections?.weaponIds ?? []) {
      const exists = this.itemExistsInWFCD(id);
      if (exists) weaponIds.add(id);
    }

    const companionIds = new Set<string>();
    for (const id of snapshot.collections?.companionIds ?? []) {
      const exists = this.itemExistsInWFCD(id);
      if (exists) companionIds.add(id);
    }

    const arcaneIds = new Set<string>();
    for (const id of snapshot.collections?.arcaneIds ?? []) {
      const exists = this.itemExistsInWFCD(id);
      if (exists) arcaneIds.add(id);
    }

    const loadout = snapshot.currentLoadout
      ? {
          warframe: {
            id: snapshot.currentLoadout.warframe?.id ?? '',
            aura: this.normalizeMod(snapshot.currentLoadout.warframe?.aura ?? null),
            exilus: this.normalizeMod(snapshot.currentLoadout.warframe?.exilus ?? null),
            mods: (snapshot.currentLoadout.warframe?.mods ?? []).map(m => this.normalizeMod(m)),
            arcanes: (snapshot.currentLoadout.warframe?.arcanes ?? []).map(a => this.normalizeArcane(a)),
            shards: (snapshot.currentLoadout.warframe?.shards ?? []).map(s => this.normalizeShard(s)),
            helminthDonor: snapshot.currentLoadout.warframe?.helminthDonor ?? null,
          },
          weapons: Object.fromEntries(
            Object.entries(snapshot.currentLoadout.weapons ?? {}).map(([slot, w]) => [
              slot,
              { id: w.id, mods: w.mods.map(m => this.normalizeMod(m)), arcanes: w.arcanes.map(a => this.normalizeArcane(a)) },
            ]),
          ),
          companion: snapshot.currentLoadout.companion
            ? {
                id: snapshot.currentLoadout.companion.id,
                weaponId: snapshot.currentLoadout.companion.weaponId ?? null,
                mods: snapshot.currentLoadout.companion.mods.map(m => this.normalizeMod(m)),
                weaponMods: snapshot.currentLoadout.companion.weaponMods.map(m => this.normalizeMod(m)),
              }
            : null,
        }
      : null;

    return {
      version: snapshot.version,
      normalizedAt: new Date().toISOString(),
      originalSource: snapshot.source,
      originalProvider: snapshot.provider,
      profile: {
        playerName: snapshot.profile?.playerName ?? null,
        masteryRank: snapshot.profile?.masteryRank ?? 0,
      },
      collections: { modIds, warframeIds, weaponIds, companionIds, arcaneIds, shardCounts: snapshot.collections?.shardCounts ?? {} },
      currentLoadout: loadout,
    };
  }

  private normalizeMod(mod: { uniqueName: string; rank: number | null } | null): CanonicalMod {
    if (!mod) return { uniqueName: '', rank: 0, existsInWFCD: false };
    return {
      uniqueName: mod.uniqueName,
      rank: mod.rank ?? 0,
      existsInWFCD: this.itemExistsInWFCD(mod.uniqueName),
    };
  }

  private normalizeArcane(arcane: { uniqueName: string; rank: number } | null): CanonicalArcane {
    if (!arcane) return { uniqueName: '', rank: 0, existsInWFCD: false };
    return {
      uniqueName: arcane.uniqueName,
      rank: arcane.rank,
      existsInWFCD: this.itemExistsInWFCD(arcane.uniqueName),
    };
  }

  private normalizeShard(shard: { color: string | null; isTau?: boolean } | null): CanonicalShard {
    if (!shard || !shard.color) return { color: null, isTau: false, existsInData: false };
    return { color: shard.color, isTau: shard.isTau ?? false, existsInData: true };
  }

  private itemExistsInWFCD(uniqueName: string): boolean {
    if (!uniqueName) return false;
    const data = gameData as any;
    return !!(data.getArcaneData?.(uniqueName) || data.getWarframeAbilityData?.[uniqueName]);
  }
}
