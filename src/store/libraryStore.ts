import { create } from 'zustand';
import { Brand } from '../services/visual-manager';
import type { ItemOption } from '../features/build-planner/model';

export interface LibraryState {
  warframes: ItemOption[];
  weapons: Record<string, ItemOption[]>;
  allMods: ItemOption[];
  allArcanes: ItemOption[];
  companions: ItemOption[];
  companionWeapons: ItemOption[];
  allFrames: ItemOption[];
  ownedModIds: Set<string> | null;
  ownedWarframeIds: Set<string> | null;
  ownedWeaponIds: Set<string> | null;
  ownedCompanionIds: Set<string> | null;
  ownedArcaneIds: Set<string> | null;
  wishlistedIds: Set<string> | null;
  playerName: string | null;
  loading: boolean;
}

export interface LibraryActions {
  setWarframes: (items: ItemOption[]) => void;
  setWeapons: (weapons: Record<string, ItemOption[]>) => void;
  setAllMods: (mods: ItemOption[]) => void;
  setAllArcanes: (arcanes: ItemOption[]) => void;
  setCompanions: (items: ItemOption[]) => void;
  setCompanionWeapons: (items: ItemOption[]) => void;
  setAllFrames: (frames: ItemOption[]) => void;
  setOwnedModIds: (ids: Set<string> | null) => void;
  setOwnedWarframeIds: (ids: Set<string> | null) => void;
  setOwnedWeaponIds: (ids: Set<string> | null) => void;
  setOwnedCompanionIds: (ids: Set<string> | null) => void;
  setOwnedArcaneIds: (ids: Set<string> | null) => void;
  setWishlistedIds: (ids: Set<string> | null) => void;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  setPlayerName: (name: string | null) => void;
  setLoading: (loading: boolean) => void;
  setLibraryData: (data: {
    warframes: ItemOption[];
    weapons: Record<string, ItemOption[]>;
    allMods: ItemOption[];
    allArcanes: ItemOption[];
    companions: ItemOption[];
    companionWeapons: ItemOption[];
    allFrames: ItemOption[];
  }) => void;
}

export const useLibraryStore = create<LibraryState & LibraryActions>((set) => ({
  warframes: [],
  weapons: { primary: [], secondary: [], melee: [], 'arch-gun': [], 'arch-melee': [] },
  allMods: [],
  allArcanes: [],
  companions: [],
  companionWeapons: [],
  allFrames: [],
  ownedModIds: null,
  ownedWarframeIds: null,
  ownedWeaponIds: null,
  ownedCompanionIds: null,
  ownedArcaneIds: null,
  playerName: null,
  loading: true,

  wishlistedIds: (() => {
    try {
      const raw = localStorage.getItem(Brand.getStorageKey('wishlist'));
      if (raw) return new Set(JSON.parse(raw));
    } catch { /* storage unavailable */ }
    return null;
  })(),

  setWarframes: (warframes) => set({ warframes }),
  setWeapons: (weapons) => set({ weapons }),
  setAllMods: (allMods) => set({ allMods }),
  setAllArcanes: (allArcanes) => set({ allArcanes }),
  setCompanions: (companions) => set({ companions }),
  setCompanionWeapons: (companionWeapons) => set({ companionWeapons }),
  setAllFrames: (allFrames) => set({ allFrames }),
  setOwnedModIds: (ownedModIds) => set({ ownedModIds }),
  setOwnedWarframeIds: (ownedWarframeIds) => set({ ownedWarframeIds }),
  setOwnedWeaponIds: (ownedWeaponIds) => set({ ownedWeaponIds }),
  setOwnedCompanionIds: (ownedCompanionIds) => set({ ownedCompanionIds }),
  setOwnedArcaneIds: (ownedArcaneIds) => set({ ownedArcaneIds }),
  setWishlistedIds: (wishlistedIds) => set({ wishlistedIds }),
  addToWishlist: (id) => set(s => {
    const next = new Set(s.wishlistedIds ?? []);
    next.add(id);
    try { localStorage.setItem(Brand.getStorageKey('wishlist'), JSON.stringify([...next])); } catch { /* storage unavailable */ }
    return { wishlistedIds: next };
  }),
  removeFromWishlist: (id) => set(s => {
    const next = new Set(s.wishlistedIds ?? []);
    next.delete(id);
    try { localStorage.setItem(Brand.getStorageKey('wishlist'), JSON.stringify([...next])); } catch { /* storage unavailable */ }
    return { wishlistedIds: next.size > 0 ? next : null };
  }),
  setPlayerName: (playerName) => set({ playerName }),
  setLoading: (loading) => set({ loading }),

  setLibraryData: (data) => set({ ...data, loading: false }),
}));
