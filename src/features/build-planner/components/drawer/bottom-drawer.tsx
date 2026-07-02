import React, { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUiStore, type LibraryTab } from '../../../../store/uiStore';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import { ModLibrary } from '../mod-library';
import { Button } from '../../../../components/ui';
import { ArcanesTab } from './arcanes-tab';
import { WeaponsTab } from './weapons-tab';
import { FramesTab } from './frames-tab';
import { EnemiesTab } from './enemies-tab';

const DRAWER_TABS: { key: LibraryTab; label: string }[] = [
  { key: 'mods', label: 'Mods' },
  { key: 'arcanes', label: 'Arcanes' },
  { key: 'weapons', label: 'Weapons' },
  { key: 'frames', label: 'Frames' },
  { key: 'enemies', label: 'Enemies' },
];

export function BottomDrawer({ state, onAddRiven, onModSelect }: {
  state: BuildPlannerStoreState;
  onAddRiven: () => void;
  onModSelect: (m: any) => void;
}) {
  const { result } = state;
  const { drawerCollapsed, toggleDrawer, libraryTab, setLibraryTab } = useUiStore(useShallow(s => ({
    drawerCollapsed: s.drawerCollapsed, toggleDrawer: s.toggleDrawer,
    libraryTab: s.libraryTab, setLibraryTab: s.setLibraryTab,
  })));
  const { activeSlot, allMods, ownedModIds, setWf, setWeaponStates } = state;

  const handleFrameSelect = useCallback((m: any) => {
    setWf(p => ({ ...p, id: m.uniqueName }));
  }, [setWf]);

  const handleWeaponSelect = useCallback((m: any) => {
    setWeaponStates(p => {
      const existing = p[activeSlot];
      if (!existing) return p;
      return { ...p, [activeSlot]: { ...existing, id: m.uniqueName } };
    });
  }, [activeSlot, setWeaponStates]);

  const handleArcaneSelect = useCallback((m: any) => {
    onModSelect(m);
  }, [onModSelect]);

  return (
    <div className={`wb-bottom${drawerCollapsed ? '' : ''}`} style={drawerCollapsed ? { gridRow: 'bottom', height: 32, minHeight: 32 } : undefined}>
      <div className="wb-bottom__header">
        <Button variant="ghost" size="sm" onClick={toggleDrawer} title={drawerCollapsed ? 'Expand drawer' : 'Collapse drawer'} aria-label={drawerCollapsed ? 'Expand drawer' : 'Collapse drawer'}>
          {drawerCollapsed ? '▲' : '▼'}
        </Button>
        <div className="wb-bottom__tabs" style={{ display: 'flex', gap: 4 }}>
          {DRAWER_TABS.map(t => (
            <Button key={t.key} variant={libraryTab === t.key ? 'secondary' : 'ghost'} size="sm"
              onClick={() => setLibraryTab(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {!drawerCollapsed && (
        <div className="wb-bottom__body" style={{ animation: 'wb-fade-in var(--transition-normal)' }}>
          {libraryTab === 'mods' && (
            <ModLibrary
              allMods={allMods}
              activeSlot={activeSlot}
              ownedModIds={ownedModIds}
              onSelect={onModSelect}
              onAddRiven={onAddRiven}
              collapsed={false}
            />
          )}
          {libraryTab === 'arcanes' && <ArcanesTab state={state} onSelect={handleArcaneSelect} />}
          {libraryTab === 'weapons' && <WeaponsTab state={state} onSelect={handleWeaponSelect} />}
          {libraryTab === 'frames' && <FramesTab state={state} onSelect={handleFrameSelect} />}
          {libraryTab === 'enemies' && <EnemiesTab state={state} result={result} />}
        </div>
      )}
    </div>
  );
}
