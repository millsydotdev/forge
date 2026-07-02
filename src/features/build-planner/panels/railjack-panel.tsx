/**
 * Railjack Panel — configure Plexus/Avionics mods.
 *
 * Data from @wfcd/items: 82 Plexus Mod entries + 116 Railjack weapons.
 */

import React, { useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ModSlot } from '../model';
import { ModGrid } from '../components/mod-workspace';
import type { Polarity } from '../../../engine/build-core';

// ── Railjack State ────────────────────────────────────────
export interface RailjackState {
  /** Avionics mods (integrated, battle, tactical — all stored together). */
  mods: ModSlot[];
  slotPolarities: Polarity[];
}

export function defaultRailjackState(): RailjackState {
  return {
    mods: [],
    slotPolarities: Array(12).fill('UNIVERSAL' as Polarity),
  };
}

// ── Component ──────────────────────────────────────────────
function RailjackSurface({ state, onChange, allMods, placeMod }: PanelSurfaceProps<RailjackState>) {
  // Filter mods to only show Railjack/Plexus mods
  const rjMods = useMemo(() =>
    allMods.filter(m => m.type === 'Plexus Mod' || m.type === 'Railjack Mod' || m.uniqueName?.includes('/Railjack/')),
    [allMods],
  );

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Railjack Configuration</span></div>

      {/* ── Avionics Grid (Integrated + Battle + Tactical) ── */}
      <div className="section-topline" style={{ marginTop: 12 }}><span>Avionics</span></div>
      <ModGrid
        mods={state.mods}
        slotPols={state.slotPolarities}
        label="Avionics"
        onRemove={i => onChange((prev: RailjackState) => ({ ...prev, mods: prev.mods.filter((_, j) => j !== i) }))}
        onRankChange={(i, r) => onChange((prev: RailjackState) => ({
          ...prev,
          mods: prev.mods.map((m, j) => j === i ? { ...m, rank: r } : m),
        }))}
        onSlotPolChange={(i, p) => onChange((prev: RailjackState) => ({
          ...prev,
          slotPolarities: prev.slotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[],
        }))}
        onEmptyClick={(i, m) => placeMod(m.uniqueName, i)}
        allMods={rjMods}
        maxSize={12}
      />
    </section>
  );
}

// ── Register Panel ─────────────────────────────────────────
registerPanel<RailjackState>({
  slotKey: 'railjack',
  label: 'Railjack',
  icon: 'RJ',
  Surface: RailjackSurface,
  initialState: defaultRailjackState,
  order: 30,
});
