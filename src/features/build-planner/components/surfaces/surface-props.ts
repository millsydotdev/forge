import type { CalculatedStats } from '../../../../engine/stat-processor';
import type { CapacityBreakdown } from '../../../../engine/polarity';
import type { CompanionState, ItemOption, WarframeState, WeaponState } from '../../model';

export interface CenterSurfaceProps {
  activeSlot: string;
  wf: WarframeState;
  setWf: (updater: WarframeState | ((prev: WarframeState) => WarframeState)) => void;
  weaponStates: Record<string, WeaponState>;
  setWeaponStates: (updater: Record<string, WeaponState> | ((prev: Record<string, WeaponState>) => Record<string, WeaponState>)) => void;
  comp: CompanionState;
  setComp: (updater: CompanionState | ((prev: CompanionState) => CompanionState)) => void;
  warframes: ItemOption[];
  weapons: Record<string, ItemOption[]>;
  companions: ItemOption[];
  companionWeapons: ItemOption[];
  allMods: ItemOption[];
  result: CalculatedStats | null;
  wfCapacity: CapacityBreakdown | null;
  weaponCapFor: (slot: string) => CapacityBreakdown | null;
  compCapacity: CapacityBreakdown | null;
  primerSlot: string | null;
  setPrimerSlot: (s: string | null) => void;
  placeModAtSlot: (slot: string, index: number, item: ItemOption) => void;
  onAddRiven: () => void;
  exaltedDef: { name: string; slot: string } | undefined;
  panelStates: Record<string, unknown>;
  setPanelStates: (updater: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => void;
  compact?: boolean;
}
