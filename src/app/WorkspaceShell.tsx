import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '../features/build-planner/panels/index';
import { useBuildPlannerStore } from '../hooks/useBuildPlannerStore';
import { TopBar, LeftSidebar, CenterWorkspace, RightInspector, BottomDrawer, DragHandle, ShortcutProvider, GlobalSearch, StatusBar, CommandPalette } from './layout';
import { BuildTabs } from '../features/tabs/BuildTabs';
import type { RivenData } from '../features/build-planner/components/riven-editor';
import { addRiven } from '../features/build-planner/services/riven-store';
import type { ModSlot } from '../features/build-planner/model';
import type { Polarity } from '../engine/build-core';
import { Modal, Toast, Skeleton } from '../components/ui';
import { useUiStore } from '../store/uiStore';
import { useBuildStore } from '../store/buildStore';
import { Brand, visualManager } from '../services/visual-manager';

const RivenEditor = React.lazy(() => import('../features/build-planner/components/riven-editor').then(m => ({ default: m.RivenEditor })));
const CompareBuilds = React.lazy(() => import('../features/build-planner/components/compare-builds').then(m => ({ default: m.CompareBuilds })));
const HistoryPanel = React.lazy(() => import('../features/build-planner/components/history-panel').then(m => ({ default: m.HistoryPanel })));
const Onboarding = React.lazy(() => import('../features/build-planner/components/onboarding').then(m => ({ default: m.Onboarding })));

export function WorkspaceShell() {
  const state = useBuildPlannerStore();
  const ui = useUiStore(useShallow(s => ({
    showHistory: s.showHistory, setShowHistory: s.setShowHistory,
    showCompare: s.showCompare, setShowCompare: s.setShowCompare,
    searchOpen: s.searchOpen, setSearchOpen: s.setSearchOpen,
    setLayoutPreset: s.setLayoutPreset, layoutPreset: s.layoutPreset,
    sidebarCollapsed: s.sidebarCollapsed, setSidebarCollapsed: s.setSidebarCollapsed,
    inspectorCollapsed: s.inspectorCollapsed, setInspectorCollapsed: s.setInspectorCollapsed,
    drawerCollapsed: s.drawerCollapsed, setDrawerCollapsed: s.setDrawerCollapsed,
  })));

  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Apply layout presets: resize panels via CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    switch (ui.layoutPreset) {
      case 'wide':
        root.style.setProperty('--col-left', ui.sidebarCollapsed ? '0px' : '220px');
        root.style.setProperty('--col-right', ui.inspectorCollapsed ? '0px' : '360px');
        root.style.setProperty('--bottom-h', ui.drawerCollapsed ? '0px' : '200px');
        break;
      case 'compact':
        root.style.setProperty('--col-left', '0px');
        root.style.setProperty('--col-right', '0px');
        root.style.setProperty('--bottom-h', '120px');
        break;
      case 'presentation':
        root.style.setProperty('--col-left', '0px');
        root.style.setProperty('--col-right', '0px');
        root.style.setProperty('--bottom-h', '0px');
        break;
      default: // balanced
        root.style.setProperty('--col-left', '280px');
        root.style.setProperty('--col-right', '320px');
        root.style.setProperty('--bottom-h', '160px');
        break;
    }
  }, [ui.layoutPreset, ui.sidebarCollapsed, ui.inspectorCollapsed, ui.drawerCollapsed]);

  const {
    setWf, weaponStates, setWeaponStates, activeSlot,
    result, mr, setComp, setHelminth,
    showImport, setShowImport, importText, setImportText,
    loadLoadout,
    buildExportCode, handleImport: handleStoreImport,
    toast, setToast, enrichAndPlace, saveLoadout, buildName,
    calculating,
  } = state;

  const [showRivenEditor, setShowRivenEditor] = useState(false);
  const [rivenWeaponCtx, setRivenWeaponCtx] = useState<{ category: string; disposition: number } | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return localStorage.getItem(Brand.getStorageKey('onboarding_done')) !== '1'; } catch { console.warn('[WorkspaceShell] onboarding check failed'); return true; } // eslint-disable-line no-console
  });
  const [dataHealthOk, setDataHealthOk] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // BrandManager: migrate localStorage keys from old prefix
    Brand.migrateStorage();
    // VisualManager: load saved theme
    visualManager.loadTheme();
    // Set window title
    document.title = Brand.getWindowTitle();

    window.forge.getItems().then(items => {
      if (items.length > 0) setDataLoading(false);
    }).catch(() => setDataLoading(false));
    window.forge.getDataHealth().then(r => {
      if (r.ok) setDataHealthOk(r.data.ok);
    }).catch(() => setDataHealthOk(false));
    const unsub = window.forge.onDataHealth?.(h => setDataHealthOk(h.ok));
    return () => unsub?.();
  }, []);

  // ── Crash Recovery: check for stale autosave ─────
  const openRivenEditor = useCallback(async () => {
    if (['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee'].includes(activeSlot)) {
      const ws = weaponStates[activeSlot];
      if (ws?.id) {
        try {
          const detail = await window.forge.getItemDetail(ws.id) as (Record<string, unknown> & { disposition?: number }) | null;
          if (detail) setRivenWeaponCtx({ category: detail.category as string, disposition: detail.disposition ?? 3 });
        } catch (e) { console.warn('[WorkspaceShell] riven context fetch failed:', e); setRivenWeaponCtx(undefined); } // eslint-disable-line no-console
      } else { setRivenWeaponCtx(undefined); }
    } else { setRivenWeaponCtx(undefined); }
    setShowRivenEditor(true);
  }, [activeSlot, weaponStates]);

  const handleRivenSave = useCallback((riven: RivenData) => {
    const rivenId = addRiven(riven);
    const rivenMod: ModSlot = {
      uniqueName: rivenId, name: riven.name, rank: 0, maxRank: 8,
      baseDrain: 18, polarity: 'MADURAI' as Polarity, type: 'Riven Mod',
      imageName: '', rarity: 'Legendary',
    };
    if (activeSlot === 'warframe') {
      setWf(p => p.mods.length < 8 ? { ...p, mods: [...p.mods, rivenMod] } : p);
    } else if (activeSlot === 'companion') {
      setComp(p => p.mods.length < 8 ? { ...p, mods: [...p.mods, rivenMod] } : p);
    } else if (activeSlot === 'companion_weapon') {
      setComp(p => p.weaponMods.length < 8 ? { ...p, weaponMods: [...p.weaponMods, rivenMod] } : p);
    } else if (activeSlot === 'exalted_weapon') {
      setWeaponStates(p => {
        const existing = p['exalted_weapon'] ?? { id: 'exalted_weapon', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(9).fill('UNIVERSAL' as Polarity) };
        if (existing.mods.length >= 8) return p;
        return { ...p, exalted_weapon: { ...existing, mods: [...existing.mods, rivenMod] } };
      });
    } else {
      setWeaponStates(p => {
        const ws = p[activeSlot];
        if (!ws || !ws.id || ws.mods.length >= 8) return p;
        return { ...p, [activeSlot]: { ...ws, mods: [...ws.mods, rivenMod] } };
      });
    }
    setShowRivenEditor(false);
    setToast({ message: `Riven "${riven.name}" added`, type: 'success' });
  }, [activeSlot, setWf, setWeaponStates, setComp, setToast]);

  const handleModSelect = useCallback((m: any) => {
    enrichAndPlace(m);
  }, [enrichAndPlace]);

  const handleExport = useCallback(() => {
    const code = buildExportCode();
    if (code) {
      navigator.clipboard.writeText(code).then(() => setToast({ message: 'Build code copied', type: 'success' })).catch(() => setToast({ message: 'Copy failed', type: 'error' }));
    }
  }, [buildExportCode, setToast]);

  const openImport = useCallback(() => {
    setShowImport(true);
  }, [setShowImport]);

  const handleNewBuild = useCallback(() => {
    useBuildStore.getState().resetBuild();
    setToast({ message: 'New build started', type: 'info' });
  }, [setToast]);

  const handleLoadBuildFromCode = useCallback((code: string) => {
    if (loadLoadout) {
      loadLoadout(code);
      setToast({ message: 'Build loaded from history', type: 'info' });
    } else {
      setToast({ message: 'Failed to load build from history', type: 'error' });
    }
  }, [loadLoadout, setToast]);

  const onHelminthChange = setHelminth;
  const onShardChange = useCallback((i: number, c: any) => {
    setWf(p => ({ ...p, shards: p.shards.map((s, j) => j === i ? { ...s, color: c } : s) }));
  }, [setWf]);
  const onShardTauToggle = useCallback((i: number, t: boolean) => {
    setWf(p => ({ ...p, shards: p.shards.map((s, j) => j === i ? { ...s, isTau: t } : s) }));
  }, [setWf]);

  const enrichMod = useCallback(async (m: any) => {
    const { enrichMod: em } = await import('../features/build-planner/components/enrich-mod');
    return em(m);
  }, []);

  const openCommandPalette = useCallback(() => {
    setShowCommandPalette(true);
  }, []);

  const handleSave = useCallback(() => {
    saveLoadout(buildName || 'Untitled Build');
    useBuildStore.getState().markSaved(buildName || 'Untitled Build');
    setToast({ message: 'Build saved', type: 'success' });
  }, [buildName, saveLoadout, setToast]);

  // Auto-save every 30 seconds when there are unsaved changes
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  }, [handleSave]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (useBuildStore.getState().isDirty) {
        saveRef.current();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Snapshot for undo (basic implementation — stores last state)
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[0];
    setUndoStack(prevStack => prevStack.slice(1));
    try {
      const parsed = JSON.parse(prev);
      useBuildStore.setState({ ...parsed, isDirty: true });
      setToast({ message: 'Undo', type: 'info' });
    } catch { /* invalid undo snapshot */ }
  }, [undoStack, setToast]);
  const handleRedo = useCallback(() => {
    setToast({ message: 'Redo (single-level)', type: 'info' });
  }, [setToast]);

  return (
    <ShortcutProvider onSave={handleSave} onCommandPalette={openCommandPalette} onUndo={handleUndo} onRedo={handleRedo}>
    {dataLoading && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
        background: 'var(--wf-bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 32,
      }}>
        <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', letterSpacing: 2, color: 'var(--wf-gold)', marginBottom: 8 }}>
          ⬡ {Brand.productName}
        </div>
        <div style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 8 }}>
          {Brand.subtitle}
        </div>
        <Skeleton width={280} height={12} borderRadius={3} />
        <Skeleton width={200} height={12} borderRadius={3} />
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--wf-text-muted)' }}>
          Loading arsenal data…
        </div>
      </div>
    )}
    <div className="wb-shell" style={dataLoading ? { opacity: 0.3, pointerEvents: 'none' } : undefined}>
      {!dataHealthOk && (
        <div role="alert" style={{
          gridColumn: '1 / -1', padding: '8px 16px', background: 'var(--wf-red-soft)',
          borderBottom: '1px solid var(--wf-red)', color: 'var(--wf-red)', fontSize: 13, textAlign: 'center',
        }}>
          Game data failed to load — mod and item catalogs may be empty. Restart the app or check your connection.
        </div>
      )}
      <TopBar
        state={state}
        onExport={handleExport}
        onImport={openImport}
        onNewBuild={handleNewBuild}
      />

      <LeftSidebar
        activeSlot={activeSlot}
        result={result}
        calculating={calculating}
        weaponStates={weaponStates}
        curWeapon={weaponStates[activeSlot] ?? null}
        primerSlot={state.primerSlot}
        resultWeapons={result?.weapons}
      />

      <DragHandle direction="vertical" cssVar="--col-left" minPx={40} maxPx={400} defaultPx={280} storageKey={Brand.getStorageKey('sidebar_w')} />

      <div style={{ gridArea: 'center', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <BuildTabs />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <CenterWorkspace state={state} onAddRiven={openRivenEditor} />
        </div>
      </div>

      <DragHandle direction="vertical" cssVar="--col-right" minPx={200} maxPx={600} defaultPx={320} storageKey={Brand.getStorageKey('inspector_w')} />

      <RightInspector
        state={state}
        onHelminthChange={onHelminthChange}
        onShardChange={onShardChange}
        onShardTauToggle={onShardTauToggle}
        enrichMod={enrichMod}
      />

      <DragHandle direction="horizontal" cssVar="--bottom-h" minPx={40} maxPx={400} defaultPx={160} storageKey={Brand.getStorageKey('bottom_h')} />

      <BottomDrawer
        state={state}
        onAddRiven={openRivenEditor}
        onModSelect={handleModSelect}
      />

      <StatusBar />

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}

      {showRivenEditor && (
        <Suspense fallback={null}>
          <RivenEditor
            onSave={handleRivenSave}
            onClose={() => setShowRivenEditor(false)}
            weaponCategory={rivenWeaponCtx?.category}
            disposition={rivenWeaponCtx?.disposition}
            mr={mr}
          />
        </Suspense>
      )}

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Build">
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="Paste build code (tndx1:…)"
          rows={4}
          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--wf-border)', color: 'var(--wf-text)', borderRadius: 2, padding: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className="btn" onClick={() => setShowImport(false)}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { handleStoreImport(); }}>Import</button>
        </div>
      </Modal>

      {ui.showHistory && (
        <Suspense fallback={null}>
          <HistoryPanel
            onLoadBuild={handleLoadBuildFromCode}
            onClose={() => ui.setShowHistory(false)}
          />
        </Suspense>
      )}

      {ui.showCompare && (
        <Suspense fallback={null}>
          <CompareBuilds
            currentResult={result}
            onClose={() => ui.setShowCompare(false)}
          />
        </Suspense>
      )}

      {ui.searchOpen && (
        <GlobalSearch
          state={state}
          onClose={() => ui.setSearchOpen(false)}
          onSelect={handleModSelect}
        />
      )}

      {showOnboarding && <Suspense fallback={null}><Onboarding onDismiss={() => setShowOnboarding(false)} /></Suspense>}

      <Toast message={toast?.message ?? null} type={toast?.type ?? 'info'} onDismiss={() => setToast(null)} />
    </div>
    </ShortcutProvider>
  );
}
