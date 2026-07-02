import React, { useState, useEffect, useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ModSlot } from '../model';
import { ModGrid } from '../components/mod-workspace';
import { AssetImage } from '../../../components/ui/AssetImage';
import { RichTooltip } from '../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../components/ui/PresentationModel';
import type { Polarity } from '../../../engine/build-core';

export interface ArchwingState {
  id: string | null;
  mods: ModSlot[];
  slotPolarities: Polarity[];
}

export function defaultArchwingState(): ArchwingState {
  return {
    id: null,
    mods: [],
    slotPolarities: Array(8).fill('UNIVERSAL' as Polarity),
  };
}

interface ArchwingAbility {
  name: string;
  description: string;
  imageName?: string;
}

interface ArchwingDetail {
  uniqueName: string;
  name: string;
  health: number;
  shield: number;
  armor: number;
  power: number;
  sprintSpeed: number;
  abilities?: ArchwingAbility[];
  polarities?: string[];
  imageName?: string;
}

function ArchwingSurface({ state, onChange, allMods, placeMod }: PanelSurfaceProps<ArchwingState>) {
  const [archwings, setArchwings] = useState<{ uniqueName: string; name: string }[]>([]);
  const [detail, setDetail] = useState<ArchwingDetail | null>(null);

  useEffect(() => {
    window.forge.getItems('Archwing').then(setArchwings).catch(() => {});
  }, []);

  useEffect(() => {
    if (!state.id) return;
    let cancelled = false;
    window.forge.getItemDetail(state.id).then((d: unknown) => {
      if (!cancelled) setDetail(d ? (d as ArchwingDetail) : null);
    }).catch(() => { if (!cancelled) setDetail(null); });
    return () => { cancelled = true; };
  }, [state.id]);

  const awMods = useMemo(() =>
    allMods.filter(m => m.type === 'Archwing Mod' || m.compatName === 'Archwing'),
    [allMods],
  );

  const setState = (updater: ArchwingState | ((prev: ArchwingState) => ArchwingState)) => {
    onChange(updater as (prev: ArchwingState) => ArchwingState);
  };

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Archwing Configuration</span></div>

      <div className="special-row">
        <div className="rj-component" style={{ flex: 1 }}>
          <div className="amp-part-label">ARCHWING</div>
          <select className="dex-select" value={state.id ?? ''}
            onChange={e => setState(prev => ({ ...prev, id: e.target.value || null }))}>
            <option value="">— Select Archwing —</option>
            {archwings.map(a => <option key={a.uniqueName} value={a.uniqueName}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {detail && (
        <div className="hud-stat-box" style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '4px 0' }}>
            <span>HP: <strong>{detail.health}</strong></span>
            <span>Shield: <strong>{detail.shield}</strong></span>
            <span>Armor: <strong>{detail.armor}</strong></span>
            <span>Energy: <strong>{detail.power}</strong></span>
            <span>Sprint: <strong>{detail.sprintSpeed}x</strong></span>
            {detail.polarities && (
              <span>Pol: <strong>{detail.polarities.map(p => p.toUpperCase()).join(' · ')}</strong></span>
            )}
          </div>
        </div>
      )}

      {detail?.abilities && detail.abilities.length > 0 && (
        <div className="section-topline" style={{ marginTop: 12 }}><span>Abilities</span></div>
      )}
      {(() => {
        const abilities = detail?.abilities?.slice(0, 4) ?? [];
        const models = abilities.map(a => buildPresentationModel({ ...a, description: a.description || '' }, 'warframe'));
        return abilities.map((a, i) => (
          <RichTooltip key={a.name} tooltip={models[i].tooltip}>
            <div className="ability-card" style={{ marginTop: 4 }}>
              <AssetImage className="ability-icon" imageName={a.imageName} />
              <div className="ability-card-body">
                <div className="ability-card-header">
                  <span className="ability-num">{i + 1}</span>
                  <strong style={{ fontSize: 11, color: 'var(--wf-gray-light)' }}>{a.name}</strong>
                </div>
                <p className="ability-description">{a.description}</p>
              </div>
            </div>
          </RichTooltip>
        ));
      })()}

      <div className="section-topline" style={{ marginTop: 12 }}><span>Archwing Mods</span></div>
      <ModGrid
        mods={state.mods}
        slotPols={state.slotPolarities}
        label="Archwing Mods"
        onRemove={i => setState(prev => ({ ...prev, mods: prev.mods.filter((_, j) => j !== i) }))}
        onRankChange={(i, r) => setState(prev => ({
          ...prev,
          mods: prev.mods.map((m, j) => j === i ? { ...m, rank: r } : m),
        }))}
        onSlotPolChange={(i, p) => setState(prev => ({
          ...prev,
          slotPolarities: prev.slotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[],
        }))}
        onEmptyClick={(i, m) => placeMod(m.uniqueName, i)}
        allMods={awMods}
        maxSize={8}
      />
    </section>
  );
}

registerPanel<ArchwingState>({
  slotKey: 'archwing',
  label: 'Archwing',
  icon: 'AW',
  Surface: ArchwingSurface,
  initialState: defaultArchwingState,
  order: 25,
});
