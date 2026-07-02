/**
 * WFCD warframe-items JSON shape (the fields we care about).
 * Full spec: https://github.com/WFCD/warframe-items
 */

export interface WfcdLevelStat {
  stats: string[];
}

export interface WfcdMod {
  uniqueName: string;
  name: string;
  type: string;
  polarity: string;
  rarity: string;
  baseDrain: number;
  fusionLimit: number;
  levelStats: WfcdLevelStat[];
  compatName?: string;
  category: string;
  tradable?: boolean;
  imageName?: string;
  drops?: unknown[];
  modSet?: string;
}

export interface WfcdAbility {
  uniqueName: string;
  name: string;
  description: string;
  imageName?: string;
}

export interface WfcdWarframe {
  uniqueName: string;
  name: string;
  category: string;
  description: string;
  health: number;
  shield: number;
  armor: number;
  power: number;
  sprintSpeed: number;
  masteryReq: number;
  abilities: WfcdAbility[];
  passiveDescription?: string;
  exalted?: string[];
  productCategory: string;
  buildPrice?: number;
  buildTime?: number;
}

export interface WfcdWeapon {
  uniqueName: string;
  name: string;
  type: string;
  category: string;
  damagePerShot?: number[];
  totalDamage?: number;
  damageTypes?: Record<string, number>;
  criticalChance?: number;
  criticalMultiplier?: number;
  multishot?: number;
  fireRate?: number;
  procChance?: number;
  reloadTime?: number;
  masteryrReq?: number;
  trigger?: string;
  polarity?: string;
  accuracy?: number;
  noise?: string;
  imageName?: string;
  disposition?: number;
}

export interface WfcdArcane {
  uniqueName: string;
  name: string;
  type: string;
  category: string;
  levelStats?: WfcdLevelStat[];
  fusionLimit?: number;
  rarity?: string;
}

export interface WfcdDataSet {
  Mods: WfcdMod[];
  Warframes: WfcdWarframe[];
  Weapons: WfcdWeapon[];
  Arcanes?: WfcdArcane[];
}
