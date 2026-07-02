export interface ExaltedEntry {
  name: string;
  slot: string;
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

export interface FocusSchoolDef {
  value: string;
  label: string;
  passives: FocusSchoolPassive[];
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
}
