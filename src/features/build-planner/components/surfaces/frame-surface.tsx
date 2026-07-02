import React, { useCallback } from 'react';
import type { CenterSurfaceProps } from './surface-props';
import { CapacityBar } from '../capacity-bar';
import { ModGrid } from '../mod-grid';
import { SpecialBadge } from '../special-badge';
import { WeaponSlotSelect } from '../weapon-slot-select';
import { AssetImage } from '../../../../components/ui/AssetImage';
import { RichTooltip } from '../../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../../components/ui/PresentationModel';
import { SkeletonLoader } from '../../../../components/ui/SkeletonLoader';
import { useBuildStore } from '../../../../store/buildStore';
import { useLibraryStore } from '../../../../store/libraryStore';
import { useUiStore } from '../../../../store/uiStore';
import { gameData } from '../../../../data/game-data';
import { SHARD_COLORS, SHARD_STAT_LABEL } from '../../model';
import type { Polarity } from '../../../../engine/build-core';
import type { ShardColor } from '../../model';

const SHARD_HEX: Record<string, string> = {
  crimson: '#f44336', azure: '#00aeff', amber: '#ff9800',
  violet: '#a050e0', topaz: '#c8a45e', emerald: '#41dc78',
};

export function FrameSurface({ wf, setWf, warframes, wfCapacity, allMods, placeModAtSlot }: CenterSurfaceProps) {
  const weaponName = wf.id ? warframes.find(w => w.uniqueName === wf.id)?.name ?? '' : '';
  const hasFrame = !!wf.id;
  const result = useBuildStore(s => s.result);
  const helminth = useBuildStore(s => s.helminth);
  const setHelminth = useBuildStore(s => s.setHelminth);
  const allFrames = useLibraryStore(s => s.allFrames);
  const arcanePool = useLibraryStore(s => s.allArcanes);
  const setActiveSlot = useUiStore(s => s.setActiveSlot);
  const exaltedDef = gameData.getExaltedForWarframe(wf.id);

  const handleArcaneSelect = useCallback((idx: number, m: any) => {
    setWf(p => ({
      ...p,
      arcanes: p.arcanes.map((a, i) => i === idx
        ? { uniqueName: m.uniqueName, name: m.name, rank: 0, maxRank: m.fusionLimit ?? 3 }
        : a) as [any, any],
    }));
  }, [setWf]);

  const handleArcaneRemove = useCallback((idx: number) => {
    setWf(p => ({
      ...p,
      arcanes: p.arcanes.map((a, i) => i === idx ? null : a) as [any, any],
    }));
  }, [setWf]);

  const handleShardChange = useCallback((idx: number, color: ShardColor | null) => {
    setWf(p => ({
      ...p,
      shards: p.shards.map((s, i) => i === idx ? { ...s, color } : s),
    }));
  }, [setWf]);

  const handleTauToggle = useCallback((idx: number, isTau: boolean) => {
    setWf(p => ({
      ...p,
      shards: p.shards.map((s, i) => i === idx ? { ...s, isTau } : s),
    }));
  }, [setWf]);

  return (
    <>
      <div className="workspace-header">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wf-text)' }}>
          {weaponName || 'Select Warframe'}
        </span>
        <div className="workspace-header-actions">
          {wfCapacity && <CapacityBar cap={wfCapacity} />}
          <WeaponSlotSelect slots={warframes} current={wf.id} onChange={id => setWf(p => ({ ...p, id }))} label="Frame" />
        </div>
      </div>

      {hasFrame && (
        <>
          {/* Warframe Hero Render + Abilities */}
          {wf.id && (
            <div className="wf-hero">
              <div className="wf-hero__render">
                <AssetImage
                  imageName={wf.id.split('/').pop() + '.png'}
                  className="wf-hero__img"
                  alt={weaponName}
                />
              </div>
              <div className="wf-hero__info">
                <div className="wf-hero__name">{weaponName}</div>
                <div className="wf-hero__abilities">
                  {(() => {
                    const abilities = gameData.getWarframeAbilities(wf.id);
                    const models = abilities.slice(0, 4).map(a => buildPresentationModel(a, 'warframe'));
                    return abilities.slice(0, 4).map((ab, i) => (
                      <RichTooltip key={i} tooltip={models[i].tooltip}>
                        <div className="wf-ability-icon">
                          <AssetImage
                            imageName={'Power0' + (ab.slotIndex) + '.png'}
                            className="wf-ability-img"
                            alt={ab.name}
                          />
                          <span className="wf-ability-key">{i + 1}</span>
                        </div>
                      </RichTooltip>
                    ));
                  })()}
                </div>
                {(() => {
                  const datum = gameData.warframeAbilityData[wf.id];
                  return datum?.passiveDescription ? (
                    <div className="wf-passive">
                      <span className="wf-passive__label">PASSIVE</span>
                      <span className="wf-passive__text">{(datum.passiveDescription || '').substring(0, 120)}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Quick Stats Overview */}
          {result && (
            <div className="workspace-quick-stats">
              <div className="qs-item qs-item--health"><span className="qs-label">HP</span><span className="qs-value">{result.health.toFixed(0)}</span></div>
              <div className="qs-item qs-item--shield"><span className="qs-label">SH</span><span className="qs-value">{result.shields.toFixed(0)}</span></div>
              <div className="qs-item qs-item--armor"><span className="qs-label">AR</span><span className="qs-value">{result.armor.toFixed(0)}</span></div>
              <div className="qs-item qs-item--energy"><span className="qs-label">EN</span><span className="qs-value">{result.energy.toFixed(0)}</span></div>
              <div className="qs-item qs-item--ehp"><span className="qs-label">EHP</span><span className="qs-value">{result.ehp.toFixed(0)}</span></div>
              <div className="qs-item qs-item--str"><span className="qs-label">STR</span><span className="qs-value">{((result.strength - 1) * 100).toFixed(0)}%</span></div>
              <div className="qs-item qs-item--dur"><span className="qs-label">DUR</span><span className="qs-value">{((result.duration - 1) * 100).toFixed(0)}%</span></div>
              <div className="qs-item qs-item--rng"><span className="qs-label">RNG</span><span className="qs-value">{((result.range - 1) * 100).toFixed(0)}%</span></div>
              <div className="qs-item qs-item--eff"><span className="qs-label">EFF</span><span className="qs-value">{((result.efficiency - 1) * 100).toFixed(0)}%</span></div>
            </div>
          )}

          {/* Aura + Exilus */}
          <div className="workspace-body">
            <div className="special-row" style={{ padding: 0, marginBottom: 4 }}>
              <SpecialBadge label="Aura" mod={wf.aura} slotPol={wf.slotPolarities[0]}
                onRemove={() => setWf(p => ({ ...p, aura: null }))}
                onRankChange={r => setWf(p => p.aura ? { ...p, aura: { ...p.aura, rank: r } } : p)} />
              <SpecialBadge label="Exilus" mod={wf.exilus} slotPol={wf.slotPolarities[1]}
                onRemove={() => setWf(p => ({ ...p, exilus: null }))}
                onRankChange={r => setWf(p => p.exilus ? { ...p, exilus: { ...p.exilus, rank: r } } : p)} />
            </div>

            {/* Mod Grid */}
            <ModGrid mods={wf.mods} slotPols={wf.slotPolarities.slice(2)} label="Mods"
              onRemove={i => setWf(p => ({ ...p, mods: p.mods.filter((_, j) => j !== i) }))}
              onRankChange={(i, r) => setWf(p => ({ ...p, mods: p.mods.map((m, j) => j === i ? { ...m, rank: r } : m) }))}
              onSlotPolChange={(i, p) => setWf(prev => ({ ...prev, slotPolarities: prev.slotPolarities.map((sp, j) => j === i + 2 ? p : sp) as Polarity[] }))}
              onEmptyClick={(i, m) => placeModAtSlot('warframe', i, m)}
              allMods={allMods} maxSize={8} />

            {/* Arcanes — inline */}
            <div className="loadout-section">
              <div className="section-topline"><span>Arcanes</span></div>
              <div className="inline-arcane-grid">
                {wf.arcanes.map((arc, idx) => (
                  <div key={idx} className={`inline-arcane-slot ${arc ? 'inline-arcane-slot--filled' : ''}`}>
                    {arc ? (
                      <>
                        <span className="arcane-name">{arc.name}</span>
                        <span className="arcane-rank">{'●'.repeat(arc.rank)}{'○'.repeat((arc as any).maxRank - arc.rank)}</span>
                        <button className="mod-card-del" onClick={() => handleArcaneRemove(idx)}>×</button>
                      </>
                    ) : (
                      <select className="dex-select" defaultValue="" onChange={e => {
                        const f = arcanePool.find(a => a.uniqueName === e.target.value);
                        if (f) handleArcaneSelect(idx, f);
                      }}>
                        <option value="" disabled>Arcane {idx + 1}</option>
                        {arcanePool.map(a => (
                          <option key={a.uniqueName} value={a.uniqueName}>{a.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shards — inline */}
            <div className="loadout-section">
              <div className="section-topline"><span>Archon Shards ({wf.shards.filter(s => s.color).length}/5)</span></div>
              <div className="inline-shard-grid">
                {wf.shards.map((slot, i) => (
                  <div key={i} className="inline-shard-slot" style={{ borderColor: slot.color ? (SHARD_HEX[slot.color] ?? '#555') : 'var(--wf-border)' }}>
                    <select className="dex-select shard-select" value={slot.color ?? ''} onChange={e => handleShardChange(i, (e.target.value || null) as any)}>
                      <option value="">—</option>
                      {SHARD_COLORS.map(c => (
                        <option key={String(c)} value={String(c)}>{SHARD_STAT_LABEL[String(c)] ?? String(c)}</option>
                      ))}
                    </select>
                    {slot.color && (
                      <label className="shard-tau-toggle">
                        <input type="checkbox" checked={slot.isTau} onChange={e => handleTauToggle(i, e.target.checked)} />
                        <span style={{ fontSize: 10, color: 'var(--wf-gold)' }}>Tau</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Helminth — inline */}
            <div className="loadout-section">
              <div className="section-topline">
                <span>Helminth</span>
                <label className="helminth-toggle">
                  <input type="checkbox" checked={helminth?.enabled ?? false}
                    onChange={() => setHelminth({ ...helminth, enabled: !helminth?.enabled } as any)} />
                  <span>{helminth?.enabled ? 'On' : 'Off'}</span>
                </label>
              </div>
              {helminth?.enabled && (
                <div className="helminth-row">
                  <select className="dex-select" value={helminth.donorId ?? ''}
                    onChange={e => setHelminth({ ...helminth, donorId: e.target.value } as any)}>
                    <option value="">Select donor...</option>
                    {allFrames.map(f => {
                      const hasAbility = gameData.getHelminthByDonor(f.uniqueName);
                      return hasAbility ? (
                        <option key={f.uniqueName} value={f.uniqueName}>{f.name} — {hasAbility.abilityName}</option>
                      ) : null;
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* Exalted Weapon Indicator */}
            {exaltedDef && (
              <div className="exalted-indicator" onClick={() => setActiveSlot('exalted_weapon')} style={{ cursor: 'pointer' }}>
                <span className="exalted-indicator__label">Exalted: {exaltedDef.name}</span>
                <span className="exalted-indicator__hint">Click to mod</span>
              </div>
            )}
          </div>
        </>
      )}

      {!hasFrame && (
        <div className="workspace-empty">
          <SkeletonLoader variant="rect" width={48} height={48} borderRadius={8} />
          <div style={{ height: 12 }} />
          <SkeletonLoader variant="line" width={180} height={16} />
          <div style={{ height: 8 }} />
          <SkeletonLoader variant="line" width={300} height={12} />
          <div style={{ height: 4 }} />
          <SkeletonLoader variant="line" width={240} height={10} />
          <div className="workspace-empty__text" style={{ marginTop: 16, textAlign: 'center', color: 'var(--wf-text-muted)', fontSize: 12 }}>
            Choose a Warframe from the Equipment Explorer or press <kbd>Ctrl+K</kbd> to search.
          </div>
        </div>
      )}
    </>
  );
}
