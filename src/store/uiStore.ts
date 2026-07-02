import { create } from 'zustand';

export type InspectorMode = 'idle' | 'mod' | 'weapon' | 'stat' | 'ability' | 'tool' | 'why';
export type LayoutPreset = 'balanced' | 'compact' | 'wide' | 'presentation';
export type LibraryTab = 'mods' | 'weapons' | 'frames' | 'arcanes' | 'enemies' | 'abilities' | 'community';

export type ToastType = 'info' | 'success' | 'error';

export interface UiState {
  activeSlot: string;
  activeTool: string | null;
  inspectorMode: InspectorMode;
  inspectorSelection: unknown;
  layoutPreset: LayoutPreset;
  libraryCollapsed: boolean;
  libraryTab: LibraryTab;
  sidebarCollapsed: boolean;
  inspectorCollapsed: boolean;
  drawerCollapsed: boolean;
  showImport: boolean;
  importText: string;
  showCompare: boolean;
  showRivenEditor: boolean;
  showOverframeImport: boolean;
  searchOpen: boolean;
  showHistory: boolean;
  buildHealth: { capacityPct: number; equipped: number; overcap: number; missing: number };
  toast: { message: string; type: ToastType } | null;
}

export interface UiActions {
  setActiveSlot: (slot: string) => void;
  setActiveTool: (tool: string | null) => void;
  setInspectorMode: (mode: InspectorMode, selection?: unknown) => void;
  setLayoutPreset: (preset: LayoutPreset) => void;
  setLibraryCollapsed: (collapsed: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  setDrawerCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  toggleDrawer: () => void;
  setLibraryTab: (tab: LibraryTab) => void;
  setShowImport: (show: boolean) => void;
  setImportText: (text: string) => void;
  setShowCompare: (show: boolean) => void;
  setShowRivenEditor: (show: boolean) => void;
  setShowOverframeImport: (show: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setBuildHealth: (health: { capacityPct: number; equipped: number; overcap: number; missing: number }) => void;
  setToast: (toast: { message: string; type: ToastType } | null) => void;
  toggleLibrary: () => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  activeSlot: 'warframe',
  activeTool: null,
  inspectorMode: 'idle',
  inspectorSelection: null,
  layoutPreset: 'balanced',
  libraryCollapsed: false,
  libraryTab: 'mods',
  sidebarCollapsed: false,
  inspectorCollapsed: false,
  drawerCollapsed: false,
  showImport: false,
  importText: '',
  showCompare: false,
  showRivenEditor: false,
  showOverframeImport: false,
  searchOpen: false,
  showHistory: false,
  buildHealth: { capacityPct: 0, equipped: 0, overcap: 0, missing: 0 },
  toast: null,

  setActiveSlot: (activeSlot) => set({ activeSlot, activeTool: null, inspectorMode: 'idle', inspectorSelection: null }),
  setActiveTool: (activeTool) => set({ activeTool, inspectorMode: activeTool ? 'tool' : 'idle' }),
  setInspectorMode: (inspectorMode, inspectorSelection) => set({ inspectorMode, inspectorSelection, activeTool: null }),
  setLayoutPreset: (layoutPreset) => set({ layoutPreset }),
  setLibraryCollapsed: (libraryCollapsed) => set({ libraryCollapsed }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setInspectorCollapsed: (inspectorCollapsed) => set({ inspectorCollapsed }),
  setDrawerCollapsed: (drawerCollapsed) => set({ drawerCollapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleInspector: () => set((s) => ({ inspectorCollapsed: !s.inspectorCollapsed })),
  toggleDrawer: () => set((s) => ({ drawerCollapsed: !s.drawerCollapsed })),
  setLibraryTab: (libraryTab) => set({ libraryTab }),
  setShowImport: (showImport) => set({ showImport }),
  setImportText: (importText) => set({ importText }),
  setShowCompare: (showCompare) => set({ showCompare }),
  setShowRivenEditor: (showRivenEditor) => set({ showRivenEditor }),
  setShowOverframeImport: (showOverframeImport) => set({ showOverframeImport }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setShowHistory: (showHistory) => set({ showHistory }),
  setBuildHealth: (buildHealth) => set({ buildHealth }),
  setToast: (toast) => set({ toast }),
  toggleLibrary: () => set((s) => ({ libraryCollapsed: !s.libraryCollapsed })),
}));
