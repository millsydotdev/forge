/**
 * types.ts
 *
 * Layer:
 *   Player Synchronisation — Type Definitions
 *
 * Owns:
 *   All interfaces and types for the provider system
 *
 * Never owns:
 *   Implementation logic
 *   Store mutations
 *   Engine access
 *
 * Input:
 *   (none — pure type definitions)
 *
 * Output:
 *   Types consumed by all provider system components
 */

/**
 * What source produced this data.
 * More descriptive than a provider name — describes the data's origin.
 */
export type SyncSource = 'live' | 'imported' | 'manual' | 'recovered' | 'cached' | 'unknown';

/** How fresh the data is. */
export type SyncConfidence = 'live' | 'cached' | 'manual';

/** Overall health of a provider. */
export type ProviderHealth = 'connected' | 'ready' | 'limited' | 'unavailable' | 'error';

// ── Provider Interface ─────────────────────────────────

export interface CapabilityManifest {
  apiVersion: string;
  providerVersion: string;
  gameVersion?: string;
  supportedGameBuild?: string;
  supportsProfile: boolean;
  supportsCollections: boolean;
  supportsLiveLoadout: boolean;
  supportsLiveInventory: boolean;
  supportsBackgroundSync: boolean;
  supportsManualSync: boolean;
  supportsPlayerName: boolean;
  supportedCategories: string[];
}

export interface ProviderStatus {
  health: ProviderHealth;
  lastContact: string | null;
  error?: string;
  capabilities: Partial<Record<keyof CapabilityManifest, boolean>>;
}

export interface IProvider {
  readonly id: string;
  readonly displayName: string;
  readonly priority: number;   // 100=live, 50=import, 10=manual
  readonly source: SyncSource;
  getCapabilities(): CapabilityManifest;
  getStatus(): ProviderStatus;
  getSnapshot(): Promise<IncomingPlayerSnapshot | null>;
  onSnapshotUpdate(cb: (snapshot: IncomingPlayerSnapshot) => void): () => void;
  refresh(): Promise<void>;
  destroy(): void;
}

// ── Data Types ──────────────────────────────────────────

export interface IncomingPlayerSnapshot {
  version: number;
  syncedAt: string;
  source: SyncSource;
  confidence: SyncConfidence;
  provider: string;

  profile?: {
    playerName?: string;
    masteryRank?: number;
  };

  collections?: {
    modIds: string[];
    warframeIds: string[];
    weaponIds: string[];
    companionIds: string[];
    arcaneIds: string[];
    shardCounts: Record<string, number>;
  };

  currentLoadout?: LoadoutSnapshot;
}

export interface LoadoutSnapshot {
  warframe?: {
    id: string;
    aura?: ModData;
    exilus?: ModData;
    mods: ModData[];
    arcanes: ArcaneData[];
    shards: ShardData[];
    helminthDonor?: string;
  };
  weapons: Record<string, {
    id: string;
    mods: ModData[];
    arcanes: ArcaneData[];
  }>;
  companion?: {
    id: string;
    weaponId?: string;
    mods: ModData[];
    weaponMods: ModData[];
  };
}

export interface ModData {
  uniqueName: string;
  rank: number | null;
}

export interface ArcaneData {
  uniqueName: string;
  rank: number;
}

export interface ShardData {
  color: string | null;
  isTau?: boolean;
}

// ── Canonical Player Model ──────────────────────────────

export interface CanonicalPlayerModel {
  version: number;
  normalizedAt: string;
  originalSource: SyncSource;
  originalProvider: string;

  profile: {
    playerName: string | null;
    masteryRank: number;
  };

  collections: {
    modIds: Set<string>;
    warframeIds: Set<string>;
    weaponIds: Set<string>;
    companionIds: Set<string>;
    arcaneIds: Set<string>;
    shardCounts: Record<string, number>;
  };

  currentLoadout: CanonicalLoadout | null;
}

export interface CanonicalLoadout {
  warframe: {
    id: string;
    aura: CanonicalMod | null;
    exilus: CanonicalMod | null;
    mods: CanonicalMod[];
    arcanes: CanonicalArcane[];
    shards: CanonicalShard[];
    helminthDonor: string | null;
  };
  weapons: Record<string, {
    id: string;
    mods: CanonicalMod[];
    arcanes: CanonicalArcane[];
  }>;
  companion: {
    id: string;
    weaponId: string | null;
    mods: CanonicalMod[];
    weaponMods: CanonicalMod[];
  } | null;
}

export interface CanonicalMod {
  uniqueName: string;
  rank: number;
  existsInWFCD: boolean;
}

export interface CanonicalArcane {
  uniqueName: string;
  rank: number;
  existsInWFCD: boolean;
}

export interface CanonicalShard {
  color: string | null;
  isTau: boolean;
  existsInData: boolean;
}

// ── Diff / Change Types ─────────────────────────────────

export interface ChangeSet {
  hasChanges: boolean;
  collectionsChanged: boolean;
  loadoutChanged: boolean;
  profileChanged: boolean;
  collectionChanges: CollectionChanges | null;
  loadoutChanges: LoadoutChanges | null;
  profileChanges: ProfileChanges | null;
}

export interface CollectionChanges {
  modsAdded: string[];
  modsRemoved: string[];
  warframesAdded: string[];
  warframesRemoved: string[];
  weaponsAdded: string[];
  weaponsRemoved: string[];
  companionsAdded: string[];
  companionsRemoved: string[];
  arcanesAdded: string[];
  arcanesRemoved: string[];
}

export interface LoadoutChanges {
  warframeChanged: boolean;
  weaponsChanged: string[];
  companionChanged: boolean;
}

export interface ProfileChanges {
  playerNameChanged: boolean;
  masteryRankChanged: boolean;
}

// ── Event Types ─────────────────────────────────────────

export type PlayerEventType =
  | 'sync-started'
  | 'sync-completed'
  | 'sync-failed'
  | 'inventory-updated'
  | 'loadout-detected'
  | 'loadout-imported'
  | 'profile-changed'
  | 'provider-health-changed'
  | 'game-detected'
  | 'game-closed';

export interface PlayerEvent {
  type: PlayerEventType;
  timestamp: string;
  provider?: string;
  source?: SyncSource;
  data?: Record<string, unknown>;
}

// ── Timeline Types ──────────────────────────────────────

export interface TimelineEntry {
  timestamp: string;
  type: string;
  label: string;
  source: SyncSource;
  confidence: SyncConfidence;
  snapshot?: CanonicalPlayerModel;
  changeSet?: ChangeSet;
}
