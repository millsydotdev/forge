/**
 * Necramech Panel — configure Necramech weapons, mods, and stats.
 *
 * Data from @wfcd/items: Necramech mods, Necramech weapons,
 * Necramech parts. Currently minimal WFCD data — placeholder ready
 * for when data coverage improves.
 */

import React, { useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ModSlot } from '../model';
import { ModGrid } from '../components/mod-workspace';
import type { Polarity } from '../../../engine/build-core';

export interface NecramechState {
  /** Necramech uniqueName. */
  id: string | null;
  /** Primary weapon (arm-mounted gun). */
  primaryId: string | null;
  /** Secondary weapon (shoulder-mounted). */
  secondaryId: string | null;
  mods: ModSlot[];
  slotPolarities: Polarity[];
}

export function defaultNecramechState(): NecramechState {
  return {
    id: null,
    primaryId: null,
    secondaryId: null,
    mods: [],
    slotPolarities: Array(10).fill('UNIVERSAL' as Polarity),
  };
}

function NecramechSurface({ state, onChange, allMods, placeMod }: PanelSurfaceProps<NecramechState>) {
  const necraMods = useMemo(() =>
    allMods.filter(m => m.type === 'Necramech Mod' || m.compatName === 'Necramech'),
    [allMods],
  );

  const setState = (updater: NecramechState | ((prev: NecramechState) => NecramechState)) => {
    onChange(updater as (prev: NecramechState) => NecramechState);
  };

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Necramech Configuration</span></div>
      <div className="special-row">
        <div className="rj-component" style={{ flex: 1 }}>
          <div className="amp-part-label">NECRAMECH</div>
          <select className="dex-select" value={state.id ?? ''}
            onChange={e => setState(prev => ({ ...prev, id: e.target.value || null }))}>
            <option value="">— Select —</option>
            <option value="/Lotus/Powersuits/Necramech/Necramech">Voidrig</option>
            <option value="/Lotus/Powersuits/Necramech/Necramech2">Bonewidow</option>
          </select>
        </div>
      </div>
      <ModGrid
        mods={state.mods}
        slotPols={state.slotPolarities}
        label="Necramech Mods"
        onRemove={i => setState(prev => ({ ...prev, mods: prev.mods.filter((_, j) => j !== i) }))}
        onRankChange={(i, r) => setState(prev => ({
          ...prev, mods: prev.mods.map((m, j) => j === i ? { ...m, rank: r } : m),
        }))}
        onSlotPolChange={(i, p) => setState(prev => ({
          ...prev,
          slotPolarities: prev.slotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[],
        }))}
        onEmptyClick={(i, m) => placeMod(m.uniqueName, i)}
        allMods={necraMods}
        maxSize={10}
      />
    </section>
  );
}

registerPanel<NecramechState>({
  slotKey: 'necramech',
  label: 'Mech',
  icon: 'NM',
  Surface: NecramechSurface,
  initialState: defaultNecramechState,
  order: 50,
});
