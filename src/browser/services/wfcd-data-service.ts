import Items from '@wfcd/items';
import type { ItemInfo } from '../../shared/item-info';
import type { WfcdMod, WfcdWarframe, WfcdWeapon } from '../../data/wfcd-types';
import { logger } from '../../utils/logger';
import type { IWfcdDataService } from '../../data/wfcd-service-interface';

interface IndexedItem {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  modSet?: string;
  school?: string;
}
function isMod(item: IndexedItem): item is WfcdMod & { imageName?: string } { return item.category === 'Mods'; }
function isWarframe(item: IndexedItem): item is WfcdWarframe { return item.category === 'Warframes'; }
function isWeapon(item: IndexedItem): item is WfcdWeapon & { imageName?: string } {
  return ['Primary', 'Secondary', 'Melee', 'Arch-Gun', 'Arch-Melee'].includes(item.category);
}
function isCompanion(item: IndexedItem): boolean { return ['Pets', 'Sentinels'].includes(item.category); }
function isCompanionWeapon(item: IndexedItem): boolean { return item.type === 'Companion Weapon'; }

interface WfcdCompanion { uniqueName: string; name: string; category: string; type: string; health: number; shield: number; armor: number; imageName?: string; }

interface WfcdSetDef {
  uniqueName: string;
  name: string;
  modSetPath: string;
  numUpgradesInSet: number;
  stats: string[];
  imageName?: string;
}
/** Focus node (e.g., from /Lotus/Upgrades/Focus/) */
interface WfcdFocusNode {
  uniqueName: string;
  name: string;
  category: string; // should be "Focus"
  type?: string;
  // focus nodes have a "nodeStats" or similar; we'll use levelStats like arcanes
  levelStat?: { stats: string[] }[];
  school?: string; // e.g., "Madurai"
  imageName?: string;
}

/** Generic Misc item (AMP parts, kitgun parts, etc.) */
interface WfcdMiscItem {
  uniqueName: string;
  name: string;
  category: string;
  type: string;
  imageName?: string;
  totalDamage?: number;
  damagePerShot?: number[];
  criticalChance?: number;
  criticalMultiplier?: number;
  procChance?: number;
  fireRate?: number;
  attacks?: { name: string; damage: Record<string, number>; speed?: number; crit_chance?: number; crit_mult?: number; status_chance?: number }[];
  tags?: string[];
  masteryReq?: number;
  disposition?: number;
}

interface WfcdArcaneItem { uniqueName: string; name: string; category: string; type: string; rarity: string; levelStats: { stats: string[] }[]; imageName?: string; school?: string; }
/** Archwing suit (like a Warframe with health, shield, armor, abilities, polarities) */
interface WfcdArchwing {
  uniqueName: string;
  name: string;
  category: string;
  description?: string;
  health: number;
  shield: number;
  armor: number;
  power: number;
  sprintSpeed: number;
  abilities: { name: string; description: string; imageName?: string }[];
  polarities: string[];
  masteryReq?: number;
  imageName?: string;
}

/** Operator definition (like a warframe but for the player) */
interface WfcdOperator {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  health?: number;
  shield?: number;
  armor?: number;
  power?: number; // energy
  sprintSpeed?: number;
  imageName?: string;
}

export class WfcdDataService implements IWfcdDataService {
  private mods = new Map<string, WfcdMod>();
  private modsByName = new Map<string, WfcdMod[]>();
  private warframes = new Map<string, WfcdWarframe>();
  private weapons = new Map<string, WfcdWeapon>();
  private arcanes = new Map<string, WfcdArcaneItem>();
  private operators = new Map<string, WfcdOperator>();
  private operatorArcanes = new Map<string, WfcdArcaneItem>();
  private companions = new Map<string, WfcdCompanion>();
  private companionWeapons = new Map<string, WfcdWeapon>();
  private ampParts = new Map<string, WfcdMiscItem>();
  private zawParts = new Map<string, WfcdMiscItem>();
  private kitgunParts = new Map<string, WfcdMiscItem>();
  private focusNodes = new Map<string, WfcdFocusNode>();
  private setDefs = new Map<string, WfcdSetDef>();
  private archwings = new Map<string, WfcdArchwing>();
  private railjackItems = new Map<string, { uniqueName: string; name: string; category: string; type: string; imageName?: string }>();

  load(): void {
    logger.info('[WfcdDataService] loading data...');
    let all;
    try {
      all = new Items();
    } catch (e) {
      logger.error('[WfcdDataService] failed to create Items:', e);
      return;
    }
    logger.info('[WfcdDataService] Items loaded, processing', all.length, 'entries');
    const allByUniqueName = new Map<string, IndexedItem>();
    for (const item of all) {
      const idx = item as IndexedItem;
      allByUniqueName.set(idx.uniqueName, idx);
    }
    for (const item of all) {
      const typed = item as IndexedItem;
      if (isMod(typed)) {
        this.mods.set(typed.uniqueName, typed);
        const arr = this.modsByName.get(typed.name) ?? [];
        arr.push(typed);
        this.modsByName.set(typed.name, arr);
        const modSet = typed.modSet;
        if (modSet && !this.setDefs.has(modSet)) {
          const setDefItem = allByUniqueName.get(modSet) as unknown as WfcdSetDef | undefined;
          if (setDefItem && Array.isArray(setDefItem.stats)) {
            this.setDefs.set(modSet, {
              uniqueName: setDefItem.uniqueName,
              name: setDefItem.name,
              modSetPath: modSet,
              numUpgradesInSet: setDefItem.numUpgradesInSet ?? 0,
              stats: setDefItem.stats,
              imageName: setDefItem.imageName,
            });
          }
        }
      } else if (isWarframe(typed)) {
        this.warframes.set(typed.uniqueName, typed);
      } else if (typed.category === 'Arcanes' && typed.school) {
        this.operatorArcanes.set(typed.uniqueName, typed as unknown as WfcdArcaneItem);
      } else if (typed.category === 'Arcanes') {
        this.arcanes.set(typed.uniqueName, typed as unknown as WfcdArcaneItem);
      } else if (isWeapon(typed)) {
        this.weapons.set(typed.uniqueName, typed);
        if (isCompanionWeapon(typed)) this.companionWeapons.set(typed.uniqueName, typed);
      } else if (isCompanion(typed)) {
        this.companions.set(typed.uniqueName, {
          uniqueName: typed.uniqueName,
          name: typed.name,
          category: typed.category,
          type: typed.type ?? '',
          health: ((typed as unknown) as { health?: number }).health ?? 0,
          shield: ((typed as unknown) as { shield?: number }).shield ?? 0,
          armor: ((typed as unknown) as { armor?: number }).armor ?? 0,
          imageName: ((typed as unknown) as { imageName?: string }).imageName,
        });
      } else if (typed.type === 'Amp') {
        // AMP parts (Prism, Scaffold, Brace) stored in Misc category
        this.ampParts.set(typed.uniqueName, typed as unknown as WfcdMiscItem);
      } else if (typed.type === 'Zaw') {
        // Zaw parts (Grip, Strike, Link) stored in Misc category
        this.zawParts.set(typed.uniqueName, typed as unknown as WfcdMiscItem);
      } else if (typed.type === 'Kitgun') {
        // Kitgun parts (Receiver, Grip, Barrel) stored in Misc category
        this.kitgunParts.set(typed.uniqueName, typed as unknown as WfcdMiscItem);
      } else if (typed.category === 'Operator') {
        this.operators.set(typed.uniqueName, typed as unknown as WfcdOperator);
      } else if (typed.category === 'Focus') {
        this.focusNodes.set(typed.uniqueName, typed as unknown as WfcdFocusNode);
      } else if (typed.category === 'Archwing') {
        this.archwings.set(typed.uniqueName, typed as unknown as WfcdArchwing);
      } else if (typed.category === 'Railjack') {
        this.railjackItems.set(typed.uniqueName, { uniqueName: typed.uniqueName, name: typed.name, category: 'Railjack', type: typed.type ?? '', imageName: (typed as unknown as { imageName?: string }).imageName });
      }
    }
    logger.info('[WfcdDataService] data loaded:',
      this.warframes.size, 'warframes,',
      this.weapons.size, 'weapons,',
      this.mods.size, 'mods,',
      this.arcanes.size, 'arcanes,',
      this.operators.size, 'operators,',
      this.operatorArcanes.size, 'operator arcanes,',
      this.focusNodes.size, 'focus nodes,',
      this.companions.size, 'companions,',
      this.setDefs.size, 'set defs,',
      this.archwings.size, 'archwings,',
      this.railjackItems.size, 'railjack items');
  }

  getItems(category?: string): ItemInfo[] {
    const items: ItemInfo[] = [];
    if (!category || category === 'Warframes') {
      for (const f of this.warframes.values()) {
        items.push({
          uniqueName: f.uniqueName,
          name: f.name,
          category: 'Warframes',
          imageName: ((f as unknown) as { imageName?: string }).imageName,
        });
      }
    }
    if (!category || ['Primary', 'Secondary', 'Melee', 'Arch-Gun', 'Arch-Melee'].includes(category)) {
      for (const w of this.weapons.values()) {
        if (!category || w.category === category) {
          items.push({ uniqueName: w.uniqueName, name: w.name, category: w.category, type: w.type, imageName: w.imageName });
        }
      }
    }
    if (!category || category === 'Mods') {
      for (const m of this.mods.values()) {
        items.push({ uniqueName: m.uniqueName, name: m.name, category: 'Mods', type: m.type, imageName: m.imageName, baseDrain: m.baseDrain, fusionLimit: m.fusionLimit, polarity: m.polarity, rarity: m.rarity });
      }
    }
    if (!category || category === 'Arcanes') {
      for (const a of this.arcanes.values()) {
        items.push({ uniqueName: a.uniqueName, name: a.name, category: 'Arcanes', type: a.type, imageName: a.imageName });
      }
    }
    if (!category || category === 'Companions') {
      for (const c of this.companions.values()) {
        items.push({ uniqueName: c.uniqueName, name: c.name, category: c.category === 'Sentinels' ? 'Sentinels' : 'Pets', type: c.type, imageName: c.imageName });
      }
    }
    if (!category || category === 'CompanionWeapons') {
      for (const w of this.companionWeapons.values()) {
        items.push({ uniqueName: w.uniqueName, name: w.name, category: 'CompanionWeapons', type: w.type, imageName: w.imageName });
      }
    }
    if (!category || category === 'Amp') {
      for (const a of this.ampParts.values()) {
        items.push({ uniqueName: a.uniqueName, name: a.name, category: 'Amp', type: a.type, imageName: a.imageName });
      }
    }
    if (!category || category === 'Zaw') {
      for (const z of this.zawParts.values()) {
        items.push({ uniqueName: z.uniqueName, name: z.name, category: 'Zaw', type: z.type, imageName: z.imageName });
      }
    }
    if (!category || category === 'Kitgun') {
      for (const k of this.kitgunParts.values()) {
        items.push({ uniqueName: k.uniqueName, name: k.name, category: 'Kitgun', type: k.type, imageName: k.imageName });
      }
    }
    if (!category || category === 'Operators') {
      for (const op of this.operators.values()) {
        items.push({ uniqueName: op.uniqueName, name: op.name, category: 'Operators', type: op.type, imageName: op.imageName });
      }
    }
    if (!category || category === 'OperatorArcanes') {
      for (const a of this.operatorArcanes.values()) {
        items.push({ uniqueName: a.uniqueName, name: a.name, category: 'OperatorArcanes', type: a.type, imageName: a.imageName });
      }
    }
    if (!category || category === 'Focus') {
      for (const fn of this.focusNodes.values()) {
        items.push({ uniqueName: fn.uniqueName, name: fn.name, category: 'Focus', type: fn.type, imageName: fn.imageName });
      }
    }
    if (!category || category === 'Archwing') {
      for (const a of this.archwings.values()) {
        items.push({ uniqueName: a.uniqueName, name: a.name, category: 'Archwing', imageName: a.imageName });
      }
    }
    if (!category || category === 'Railjack') {
      for (const r of this.railjackItems.values()) {
        items.push({ uniqueName: r.uniqueName, name: r.name, category: 'Railjack', type: r.type, imageName: r.imageName });
      }
    }
    return items;
  }

  getItemDetail(uniqueName: string): unknown {
    return this.mods.get(uniqueName) ?? this.warframes.get(uniqueName) ?? this.weapons.get(uniqueName) ?? this.arcanes.get(uniqueName) ?? this.companions.get(uniqueName) ?? this.operators.get(uniqueName) ?? this.operatorArcanes.get(uniqueName) ?? this.focusNodes.get(uniqueName) ?? this.ampParts.get(uniqueName) ?? this.zawParts.get(uniqueName) ?? this.kitgunParts.get(uniqueName) ?? this.archwings.get(uniqueName) ?? this.railjackItems.get(uniqueName) ?? null;
  }

  getMod(uniqueName: string): WfcdMod | undefined { return this.mods.get(uniqueName); }
  getWarframe(uniqueName: string): WfcdWarframe | undefined { return this.warframes.get(uniqueName); }
  getWeapon(uniqueName: string): WfcdWeapon | undefined { return this.weapons.get(uniqueName); }
  getArcane(uniqueName: string): WfcdArcaneItem | undefined { return this.arcanes.get(uniqueName); }
  getCompanion(uniqueName: string): WfcdCompanion | undefined { return this.companions.get(uniqueName); }
  getModSetPath(uniqueName: string): string | undefined { return this.mods.get(uniqueName)?.modSet; }
  getSetDef(modSetPath: string): WfcdSetDef | undefined { return this.setDefs.get(modSetPath); }
  getOperator(uniqueName: string): WfcdOperator | undefined { return this.operators.get(uniqueName); }
  getOperatorArcane(uniqueName: string): WfcdArcaneItem | undefined { return this.operatorArcanes.get(uniqueName); }

  getAllSets(): WfcdSetDef[] { return [...this.setDefs.values()]; }
  getAllOperators(): WfcdOperator[] { return [...this.operators.values()]; }
  getAllOperatorArcanes(): WfcdArcaneItem[] { return [...this.operatorArcanes.values()]; }

  getAllMods(): WfcdMod[] { return [...this.mods.values()]; }
  getAllWarframes(): WfcdWarframe[] { return [...this.warframes.values()]; }
  getAllWeapons(): WfcdWeapon[] { return [...this.weapons.values()]; }
  getAllCompanions(): WfcdCompanion[] { return [...this.companions.values()]; }

  getModsByName(name: string): WfcdMod[] { return this.modsByName.get(name) ?? []; }

  getArchwing(uniqueName: string): WfcdArchwing | undefined { return this.archwings.get(uniqueName); }
  getAllArchwings(): WfcdArchwing[] { return [...this.archwings.values()]; }

  getHealth(): { ok: boolean; warframes: number; weapons: number; mods: number } {
    return {
      ok: this.warframes.size > 0,
      warframes: this.warframes.size,
      weapons: this.weapons.size,
      mods: this.mods.size,
    };
  }
}

export type { WfcdMod, WfcdWarframe, WfcdWeapon, WfcdCompanion, WfcdOperator, WfcdFocusNode, WfcdArchwing };
