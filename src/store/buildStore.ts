import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WarframeState, WeaponState, CompanionState, HelminthState, ConditionalTriggers, WarframeDetail } from '../features/build-planner/model';
import type { CalculatedStats } from '../engine/stat-processor';
import type { EnemyTargetState, Polarity } from '../engine/build-core';
import type { BuffsState } from '../features/build-planner/components/buffs-panel';
import type { OperatorStats } from '../features/build-planner/calculators/operator-calc';
import { DEFAULT_CONDITIONAL_TRIGGERS, DEFAULT_POLARITY } from '../features/build-planner/model';
import { DEFAULT_BUFFS } from '../features/build-planner/components/buffs-panel';
import { DEFAULT_ENEMY_STATE } from '../engine/enemy-simulator';
import { logger } from '../utils/logger';
import { Brand } from '../services/visual-manager';

export interface BuildState {
  wf: WarframeState;
  weaponStates: Record<string, WeaponState>;
  comp: CompanionState;
  helminth: HelminthState;
  buffs: BuffsState;
  conditionalTriggers: ConditionalTriggers;
  mr: number;
  primerSlot: string | null;
  targetFaction: string;
  isAiming: boolean;
  activeStatuses: number;
  enemyState: EnemyTargetState;
  enemyEnabled: boolean;
  result: CalculatedStats | null;
  calculating: boolean;
  operatorId: string | null;
  focusNodes: string[];
  arcane: string | null;
  buildNotes: string;
  buildName: string;
  frameDetail: WarframeDetail | null;
  loadouts: Record<string, string>;
  operatorStats: OperatorStats | null;
  /** Track unsaved changes for auto-save and status indicator */
  isDirty: boolean;
  lastSavedName: string;
}

export interface BuildActions {
  setWf: (updater: WarframeState | ((prev: WarframeState) => WarframeState)) => void;
  setWeaponStates: (updater: Record<string, WeaponState> | ((prev: Record<string, WeaponState>) => Record<string, WeaponState>)) => void;
  setComp: (updater: CompanionState | ((prev: CompanionState) => CompanionState)) => void;
  setHelminth: (updater: HelminthState | ((prev: HelminthState) => HelminthState)) => void;
  setBuffs: (updater: BuffsState | ((prev: BuffsState) => BuffsState)) => void;
  setConditionalTriggers: (updater: ConditionalTriggers | ((prev: ConditionalTriggers) => ConditionalTriggers)) => void;
  setMr: (mr: number) => void;
  setDirty: (dirty: boolean) => void;
  markSaved: (name: string) => void;
  setPrimerSlot: (s: string | null) => void;
  setTargetFaction: (f: string) => void;
  setIsAiming: (a: boolean) => void;
  setActiveStatuses: (s: number) => void;
  setEnemyState: (e: EnemyTargetState) => void;
  setEnemyEnabled: (e: boolean) => void;
  setResult: (r: CalculatedStats | null) => void;
  setCalculating: (c: boolean) => void;
  setOperatorId: (id: string | null) => void;
  setFocusNodes: (n: string[]) => void;
  setArcane: (a: string | null) => void;
  setBuildNotes: (n: string) => void;
  setBuildName: (n: string) => void;
  setFrameDetail: (d: WarframeDetail | null) => void;
  setLoadouts: (l: Record<string, string>) => void;
  setOperatorStats: (s: OperatorStats | null) => void;
  resetBuild: () => void;
}

const DEFAULT_WF: WarframeState = {
  id: '', aura: null, exilus: null, mods: [],
  arcanes: [null, null], shards: Array.from({ length: 5 }, () => ({ color: null, isTau: false })),
  slotPolarities: Array(10).fill(DEFAULT_POLARITY) as Polarity[],
  exaltedWeapon: null,
};

const DEFAULT_WEAPON_STATE: WeaponState = {
  id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill(DEFAULT_POLARITY) as Polarity[],
};

const DEFAULT_COMP: CompanionState = {
  id: '', compType: 'sentinel', mods: [], slotPolarities: Array(8).fill(DEFAULT_POLARITY) as Polarity[],
  weaponId: '', weaponMods: [], weaponSlotPolarities: Array(8).fill(DEFAULT_POLARITY) as Polarity[],
};

const DEFAULT_HELMINTH: HelminthState = { enabled: false, donorId: '', slotIndex: 0 };

const INITIAL_STATE: BuildState = {
  wf: { ...DEFAULT_WF },
  weaponStates: {
    primary: { ...DEFAULT_WEAPON_STATE },
    secondary: { ...DEFAULT_WEAPON_STATE },
    melee: { ...DEFAULT_WEAPON_STATE },
    'arch-gun': { ...DEFAULT_WEAPON_STATE },
    'arch-melee': { ...DEFAULT_WEAPON_STATE },
    companion: { ...DEFAULT_WEAPON_STATE },
    exalted_weapon: { ...DEFAULT_WEAPON_STATE },
  },
  comp: { ...DEFAULT_COMP },
  helminth: { ...DEFAULT_HELMINTH },
  buffs: { ...DEFAULT_BUFFS },
  conditionalTriggers: { ...DEFAULT_CONDITIONAL_TRIGGERS },
  mr: 0,
  primerSlot: null,
  targetFaction: '',
  isAiming: false,
  activeStatuses: 0,
  enemyState: {
    targetName: DEFAULT_ENEMY_STATE.target.name,
    level: DEFAULT_ENEMY_STATE.level,
    armorStripped: DEFAULT_ENEMY_STATE.armorStripped,
    corrosiveStacks: DEFAULT_ENEMY_STATE.activeCorrosiveStacks,
    heatProc: DEFAULT_ENEMY_STATE.activeHeatProc,
    multiTarget: DEFAULT_ENEMY_STATE.multiTarget,
    electricStacks: 0,
  },
  enemyEnabled: false,
  result: null,
  calculating: false,
  operatorId: null,
  focusNodes: [],
  arcane: null,
  buildNotes: '',
  buildName: 'My Loadout',
  frameDetail: null,
  loadouts: readLoadouts(),
  operatorStats: null,
  isDirty: false,
  lastSavedName: '',
};

export const useBuildStore = create<BuildState & BuildActions>()(
  persist(
    (set) => ({
  ...INITIAL_STATE,

  setDirty: (dirty) => set({ isDirty: dirty }),
  markSaved: (name) => set({ isDirty: false, lastSavedName: name, buildName: name }),

  setWf: (updater) => set((s) => ({ wf: typeof updater === 'function' ? updater(s.wf) : updater, isDirty: true })),
  setWeaponStates: (updater) => set((s) => ({ weaponStates: typeof updater === 'function' ? updater(s.weaponStates) : updater, isDirty: true })),
  setComp: (updater) => set((s) => ({ comp: typeof updater === 'function' ? updater(s.comp) : updater, isDirty: true })),
  setHelminth: (updater) => set((s) => ({ helminth: typeof updater === 'function' ? updater(s.helminth) : updater, isDirty: true })),
  setBuffs: (updater) => set((s) => ({ buffs: typeof updater === 'function' ? updater(s.buffs) : updater, isDirty: true })),
  setConditionalTriggers: (updater) => set((s) => ({ conditionalTriggers: typeof updater === 'function' ? updater(s.conditionalTriggers) : updater, isDirty: true })),
  setMr: (mr) => set({ mr, isDirty: true }),
  setPrimerSlot: (s) => set({ primerSlot: s, isDirty: true }),
  setTargetFaction: (f) => set({ targetFaction: f, isDirty: true }),
  setIsAiming: (a) => set({ isAiming: a, isDirty: true }),
  setActiveStatuses: (s) => set({ activeStatuses: s, isDirty: true }),
  setEnemyState: (e) => set({ enemyState: e, isDirty: true }),
  setEnemyEnabled: (e) => set({ enemyEnabled: e, isDirty: true }),
  setResult: (r) => set({ result: r }),
  setCalculating: (c) => set({ calculating: c }),
  setOperatorId: (id) => set({ operatorId: id }),
  setFocusNodes: (n) => set({ focusNodes: n }),
  setArcane: (a) => set({ arcane: a }),
  setBuildNotes: (n) => set({ buildNotes: n }),
  setBuildName: (n) => set({ buildName: n }),
  setFrameDetail: (frameDetail) => set({ frameDetail }),
  setLoadouts: (loadouts) => set({ loadouts }),
  setOperatorStats: (operatorStats) => set({ operatorStats }),

  resetBuild: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: Brand.getStorageKey('active-build'),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['loadouts', 'result', 'calculating', 'frameDetail'].includes(key)
          )
        ) as any,
    }
  )
);

const LOADOUT_KEY = Brand.getStorageKey('loadouts');

export function readLoadouts(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LOADOUT_KEY) ?? '{}'); }
  catch (e) { logger.warn('[buildStore] readLoadouts failed:', e); return {}; }
}

export function writeLoadouts(loadouts: Record<string, string>): void {
  localStorage.setItem(LOADOUT_KEY, JSON.stringify(loadouts));
}

export function initLoadouts(): Record<string, string> {
  return readLoadouts();
}
