interface ItemInfo {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  imageName?: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
}

interface ItemDetail {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  description?: string;
  imageName?: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
  abilities?: unknown[];
  passiveDescription?: string;
  levelStats?: { stats: string[] }[];
}

interface ForgeAPI {
  getItems(category?: string): Promise<ItemInfo[]>;
  getItemDetail(uniqueName: string): Promise<ItemDetail | null>;
  getAssetUrl(imageName?: string): Promise<string | null>;
  calculateBuild(build: import('../engine/build-core').BuildCore): Promise<import('../shared/ipc-types').IpcResult<import('../engine/stat-processor').CalculatedStats>>;
  getDataHealth(): Promise<import('../shared/ipc-types').IpcResult<{ ok: boolean; warframes: number; weapons: number; mods: number }>>;
  fetchBuildPage(url: string): Promise<{ success: boolean; data?: unknown; error?: string }>;
  generateModCard(input: import('../browser/services/mod-card-renderer').ModCardInput, rank: number, format: string, setBonus?: number): Promise<Uint8Array | null>;
  onDataHealth(cb: (health: { ok: boolean; warframes: number; weapons: number; mods: number }) => void): () => void;

  // Game data IPC channels (replaces game-data.ts singleton)
  getEnemies(): Promise<import('../shared/game-data-types').EnemyDef[]>;
  getExaltedDefs(): Promise<Record<string, import('../shared/game-data-types').ExaltedEntry>>;
  getIncarnonDefs(): Promise<string[]>;
  getHelminthAbilities(): Promise<import('../shared/game-data-types').HelminthAbilityDef[]>;
  getFocusSchools(): Promise<import('../shared/game-data-types').FocusSchoolDef[]>;
  getSquadBuffs(): Promise<import('../shared/game-data-types').SquadBuffDef[]>;
  getShardDefs(): Promise<import('../shared/game-data-types').ShardDef[]>;
  getExaltedForWarframe(uniqueName: string): Promise<import('../shared/game-data-types').ExaltedEntry | null>;
  isIncarnonWeapon(uniqueName: string): Promise<boolean>;
  getGameDataHealth(): Promise<{ ok: boolean }>;
}

interface Window {
  forge: ForgeAPI;
}
