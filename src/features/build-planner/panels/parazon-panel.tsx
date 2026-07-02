import React, { useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ModSlot } from '../model';
import { ModGrid } from '../components/mod-workspace';
import type { Polarity } from '../../../engine/build-core';

export interface ParazonState {
  mods: ModSlot[];
  slotPolarities: Polarity[];
}

export function defaultParazonState(): ParazonState {
  return {
    mods: [],
    slotPolarities: Array(3).fill('UNIVERSAL' as Polarity),
  };
}

function ParazonSurface({ state, onChange, allMods, placeMod }: PanelSurfaceProps<ParazonState>) {
  const pzMods = useMemo(() =>
    allMods.filter(m => m.type === 'Parazon Mod' || m.compatName === 'Parazon'),
    [allMods],
  );

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Parazon Configuration</span></div>
      <ModGrid
        mods={state.mods}
        slotPols={state.slotPolarities}
        label="Parazon Mods"
        onRemove={i => onChange((prev: ParazonState) => ({ ...prev, mods: prev.mods.filter((_, j) => j !== i) }))}
        onRankChange={(i, r) => onChange((prev: ParazonState) => ({
          ...prev,
          mods: prev.mods.map((m, j) => j === i ? { ...m, rank: r } : m),
        }))}
        onSlotPolChange={(i, p) => onChange((prev: ParazonState) => ({
          ...prev,
          slotPolarities: prev.slotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[],
        }))}
        onEmptyClick={(i, m) => placeMod(m.uniqueName, i)}
        allMods={pzMods}
        maxSize={3}
      />
    </section>
  );
}

registerPanel<ParazonState>({
  slotKey: 'parazon',
  label: 'Parazon',
  icon: 'PZ',
  Surface: ParazonSurface,
  initialState: defaultParazonState,
  order: 45,
});
