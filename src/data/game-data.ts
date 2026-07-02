/**
 * Data-driven game data loaded from game-data.json.
 * Source: @wfcd/items
 *
 * MILESTONE 3: Extended with warframe ability data, arcane data,
 * companion ability data, and all WFCD-extracted fields.
 */
import raw from './game-data.json';

export interface ExaltedEntry {
  name: string;
  slot: string;
  source?: string;
}

export interface HelminthAbilityDef {
  donorUniqueName: string;
  donorName: string;
  abilityName: string;
  baseDamage: number;
  scalingStat: string;
  scalingFactor: number;
  damageType: string;
}

export interface FocusSchoolPassive {
  stat: string;
  value: number;
  description: string;
}

export interface FocusNodeDef {
  uniqueName: string;
  name: string;
  maxRank: number;
  description: string;
}

export interface FocusSchoolDef {
  value: string;
  label: string;
  passives: FocusSchoolPassive[];
  nodes?: FocusNodeDef[];
  nodeCount?: number;
}

export interface SquadBuffModifier {
  stat: string;
  value: number;
  type: 'FLAT' | 'MULTIPLIER';
}

export interface SquadBuffDef {
  name: string;
  description: string;
  modifiers: SquadBuffModifier[];
}

export interface WfcdResistanceAffector {
  element: string;
  modifier: number;
}

export interface WfcdResistanceEntry {
  amount: number;
  type: string;
  affectors: WfcdResistanceAffector[];
}

export interface EnemyDef {
  name: string;
  faction: string;
  baseHealth: number;
  baseShields: number;
  baseArmor: number;
  armorType: string;
  healthType: string;
  shieldType: string;
  weakness: string[];
  resistance: string[];
  immune: string[];
  /** WFCD game-file sourced resistance data — authoritative damage type modifiers */
  resistances?: WfcdResistanceEntry[];
}

export interface ShardStatDef {
  stat: string;
  value: number;
  group: string;
  category: 'FLAT' | 'MULTIPLIER';
}

export interface ShardDef {
  color: string;
  label: string;
  stats: ShardStatDef[];
}

export interface WfcdAbilityEntry {
  name: string;
  description: string;
  uniqueName: string;
  slotIndex: number;
}

export interface WarframeAbilityDatum {
  name: string;
  passiveDescription: string;
  abilities: WfcdAbilityEntry[];
  exaltedCount: number;
}

export interface ArcaneDatum {
  uniqueName: string;
  name: string;
  category: string;
  rarity: string;
  maxRank: number;
  statLines: string[];
  isOperatorArcane: boolean;
  school: string | null;
}

export interface CompanionAbilityDatum {
  uniqueName: string;
  name: string;
  type: string;
  abilities: { name: string; description: string }[];
  health: number;
  shield: number;
  armor: number;
  petWeapon: {
    totalDamage: number;
    criticalChance: number;
    criticalMultiplier: number;
    fireRate: number;
    statusChance: number;
    multishot: number;
    damageTypes: Record<string, number> | null;
  } | null;
}

export interface GameDataJson {
  version: string;
  generatedAt: string;
  exaltedWeapons: Record<string, ExaltedEntry>;
  incarnonWeapons: string[];
  helminthAbilities: HelminthAbilityDef[];
  focusSchools: FocusSchoolDef[];
  squadBuffs: SquadBuffDef[];
  enemies: EnemyDef[];
  shardDefs: ShardDef[];
  warframeAbilityData: Record<string, WarframeAbilityDatum>;
  arcaneData: ArcaneDatum[];
  companionAbilityData: CompanionAbilityDatum[];
}

class GameData {
  private data: GameDataJson = raw as unknown as GameDataJson;

  get exaltedWeapons(): Record<string, ExaltedEntry> { return this.data.exaltedWeapons; }
  get incarnonWeapons(): Set<string> { return new Set(this.data.incarnonWeapons); }
  get helminthAbilities(): HelminthAbilityDef[] { return this.data.helminthAbilities; }
  get focusSchools(): FocusSchoolDef[] { return this.data.focusSchools; }
  get squadBuffs(): SquadBuffDef[] { return this.data.squadBuffs; }
  get enemies(): EnemyDef[] { return this.data.enemies; }
  get shardDefs(): ShardDef[] { return this.data.shardDefs; }

  // ── Milestone 3: Data-Driven Lookups ──────────────────
  get warframeAbilityData(): Record<string, WarframeAbilityDatum> { return this.data.warframeAbilityData || {}; }
  get arcaneData(): ArcaneDatum[] { return this.data.arcaneData || []; }
  get companionAbilityData(): CompanionAbilityDatum[] { return this.data.companionAbilityData || []; }

  getExaltedForWarframe(uniqueName: string): ExaltedEntry | undefined {
    return this.data.exaltedWeapons[uniqueName];
  }

  isIncarnonWeapon(uniqueName: string): boolean {
    return this.incarnonWeapons.has(uniqueName);
  }

  getHelminthByDonor(donorUniqueName: string): HelminthAbilityDef | undefined {
    return this.data.helminthAbilities.find(h => h.donorUniqueName === donorUniqueName);
  }

  getEnemyByName(name: string): EnemyDef | undefined {
    return this.data.enemies.find(e => e.name === name);
  }

  getShardDef(color: string): ShardDef | undefined {
    return this.data.shardDefs.find(s => s.color === color);
  }

  /** Get ability names list for a warframe (data-driven from WFCD) */
  getWarframeAbilities(uniqueName: string): WfcdAbilityEntry[] {
    return this.warframeAbilityData[uniqueName]?.abilities ?? [];
  }

  /** Get warframe passive description (data-driven from WFCD) */
  getWarframePassiveDescription(uniqueName: string): string {
    return this.warframeAbilityData[uniqueName]?.passiveDescription ?? '';
  }

  /** Get arcane data by uniqueName */
  getArcaneData(uniqueName: string): ArcaneDatum | undefined {
    return this.data.arcaneData?.find(a => a.uniqueName === uniqueName);
  }

  /** Get companion ability data */
  getCompanionAbilities(uniqueName: string): { name: string; description: string }[] {
    return this.data.companionAbilityData?.find(c => c.uniqueName === uniqueName)?.abilities ?? [];
  }

  /** Get all arcanes for a category */
  getArcanesByCategory(category: string): ArcaneDatum[] {
    return (this.data.arcaneData || []).filter(a => a.category === category);
  }

  /** Find warframe uniqueName by display name */
  getWarframeByDisplayName(name: string): string | undefined {
    for (const [uid, data] of Object.entries(this.warframeAbilityData)) {
      if (data.name === name) return uid;
    }
    return undefined;
  }

  /** Check if a warframe has an exalted weapon */
  warframeHasExalted(uniqueName: string): boolean {
    return !!this.data.exaltedWeapons[uniqueName];
  }

  /** Version info */
  get version(): string { return this.data.version; }
  get generatedAt(): string { return this.data.generatedAt; }
}

export const gameData = new GameData();
