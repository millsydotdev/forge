/**
 * K-Drive Panel — configure mods for K-Drive (6+ unique stats).
 *
 * Data from @wfcd/items: K-Drive mods (type "K-Drive Mod" or compatName "KDRIVE").
 * Currently ~0 found in WFCD data — this panel is a placeholder ready 
 * for when the data becomes available.
 */

import React, { useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ModSlot } from '../model';
import { ModGrid } from '../components/mod-workspace';
import type { Polarity } from '../../../engine/build-core';

export interface KDriveState {
  mods: ModSlot[];
  slotPolarities: Polarity[];
}

export function defaultKDriveState(): KDriveState {
  return {
    mods: [],
    slotPolarities: Array(8).fill('UNIVERSAL' as Polarity),
  };
}

function KDriveSurface({ state, onChange, allMods, placeMod }: PanelSurfaceProps<KDriveState>) {
  const kdMods = useMemo(() =>
    allMods.filter(m => m.type === 'K-Drive Mod' || m.compatName === 'K-Drive' || m.uniqueName?.toLowerCase().includes('kdrive')),
    [allMods],
  );

  const setState = (updater: KDriveState | ((prev: KDriveState) => KDriveState)) => {
    onChange(updater as (prev: KDriveState) => KDriveState);
  };

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>K-Drive Configuration</span></div>
      <ModGrid
        mods={state.mods}
        slotPols={state.slotPolarities}
        label="K-Drive Mods"
        onRemove={i => setState(prev => ({ ...prev, mods: prev.mods.filter((_, j) => j !== i) }))}
        onRankChange={(i, r) => setState(prev => ({
          ...prev, mods: prev.mods.map((m, j) => j === i ? { ...m, rank: r } : m),
        }))}
        onSlotPolChange={(i, p) => setState(prev => ({
          ...prev,
          slotPolarities: prev.slotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[],
        }))}
        onEmptyClick={(i, m) => placeMod(m.uniqueName, i)}
        allMods={kdMods}
        maxSize={8}
      />
    </section>
  );
}

registerPanel<KDriveState>({
  slotKey: 'kdrive',
  label: 'K-Drive',
  icon: 'KD',
  Surface: KDriveSurface,
  initialState: defaultKDriveState,
  order: 40,
});
