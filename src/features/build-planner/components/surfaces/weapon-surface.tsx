import React, { useMemo, useCallback } from 'react';
import type { CenterSurfaceProps } from './surface-props';
import { ModGrid } from '../mod-grid';
import { SpecialBadge } from '../special-badge';
import { useLibraryStore } from '../../../../store/libraryStore';
import { gameData } from '../../../../data/game-data';
import type { Polarity } from '../../../../engine/build-core';
import type { ArcaneSlot } from '../../model';

interface WeaponSurfaceProps extends CenterSurfaceProps {
  slot: string;
}

const WEAPON_STAT_KEYS = ['burstDps', 'sustainedDps', 'critChance', 'statusChance', 'magazine', 'fireRate', 'reloadSpeed', 'multishot'];

export function WeaponSurface({ slot, weaponStates, setWeaponStates, weapons, allMods, placeModAtSlot, result }: WeaponSurfaceProps) {
  const ws = weaponStates[slot];
  const weaponId = ws?.id;
  const allWeapons = useMemo(() => Object.values(weapons).flat(), [weapons]);
  const weaponData = useMemo(() => weaponId ? allWeapons.find(w => w.uniqueName === weaponId) ?? null : null, [weaponId, allWeapons]);
  const weaponName = weaponData?.name ?? '';
  const hasWeapon = !!weaponId;
  const allArcanes = useLibraryStore(s => s.allArcanes);
  const arcanePool = allArcanes.filter(a => {
    if (slot === 'melee') return a.category === 'Melee Arcane';
    if (slot === 'primary') return a.category === 'Primary Arcane' || a.category === 'Shotgun Arcane';
    if (slot === 'secondary') return a.category === 'Secondary Arcane';
    return true;
  });

  const weaponStats = result?.weapons?.[slot];
  const isIncarnon = weaponId ? gameData.isIncarnonWeapon(weaponId) : false;
  const slotPols = ws?.slotPolarities ?? Array(9).fill('UNIVERSAL' as Polarity);
  const attackMode = ws?.attackMode ?? 'normal';
  const attackModes: { key: string; label: string }[] = [];
  if (isIncarnon) attackModes.push({ key: 'incarnon', label: 'Incarnon' });
  // Default mode always available
  attackModes.unshift({ key: 'normal', label: 'Normal' });

  const handleAttackModeChange = useCallback((mode: string) => {
    setWeaponStates(p => ({
      ...p,
      [slot]: { ...p[slot], attackMode: mode as 'normal' | 'alt' | 'incarnon' },
    }));
  }, [slot, setWeaponStates]);

  const stats = useMemo(() => {
    if (!weaponStats) return null;
    return WEAPON_STAT_KEYS.map(key => {
      const val = (weaponStats as any)[key];
      if (val == null) return null;
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      const value = typeof val === 'number' ? (val > 100 ? val.toFixed(0) : (val * 100 > 10 ? val.toFixed(2) : val.toFixed(4))) : String(val);
      return { label, key, value };
    }).filter(Boolean);
  }, [weaponStats]);

  return (
    <>
      <div className="workspace-header">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wf-text)' }}>
          {weaponName || `Select ${slot}`}
          {isIncarnon && <span className="incarnon-badge" style={{ marginLeft: 6, fontSize: 9, color: 'var(--wf-purple)' }}>INCARNON</span>}
        </span>
        <div className="workspace-header-actions">
          <select className="workspace-select" value={weaponId ?? ''}
            onChange={e => setWeaponStates(p => ({ ...p, [slot]: { ...(p[slot] ?? { id: '', mods: [], arcanes: [null, null] as unknown as [ArcaneSlot | null, ArcaneSlot | null], exilus: null, slotPolarities: Array(9).fill('UNIVERSAL' as Polarity) }), id: e.target.value } }))}>
            <option value="">— Select —</option>
            {allWeapons.filter(w => {
              if (slot === 'melee') return w.category === 'Melee';
              if (slot === 'primary') return w.category === 'Primary' || w.category === 'Shotgun';
              if (slot === 'secondary') return w.category === 'Secondary';
              if (slot === 'arch-gun') return w.category === 'Arch-Gun';
              if (slot === 'arch-melee') return w.category === 'Arch-Melee';
              return true;
            }).map(w => (
              <option key={w.uniqueName} value={w.uniqueName}>{w.name}</option>
            ))}
          </select>
          {isIncarnon && (
            <select className="workspace-select" style={{ width: 48 }} value={ws?.incarnonStage ?? 0}
              onChange={e => setWeaponStates(p => ({ ...p, [slot]: { ...p[slot], incarnonStage: parseInt(e.target.value) } as any }))}>
              {[0, 1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {attackModes.length > 1 && (
            <div className="attack-mode-selector">
              {attackModes.map(m => (
                <button
                  key={m.key}
                  className={`attack-mode-btn ${attackMode === m.key ? 'attack-mode-btn--active' : ''}`}
                  onClick={() => handleAttackModeChange(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div className="workspace-quick-stats">
          {stats.map(s => s && (
            <div key={s.key} className="qs-item" title={s.label}>
              <span className="qs-label">{s.label.split(' ').map((w: string) => w[0]).join('')}</span>
              <span className="qs-value" style={{ fontSize: 11 }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {hasWeapon && (
        <div className="workspace-body">
          <div className="special-row" style={{ padding: 0, marginBottom: 4 }}>
            <SpecialBadge label="Exilus" mod={ws?.exilus ?? null} slotPol={slotPols[0]}
              onRemove={() => setWeaponStates(p => ({ ...p, [slot]: { ...p[slot], exilus: null } }))}
              onRankChange={r => setWeaponStates(p => p[slot]?.exilus ? { ...p, [slot]: { ...p[slot], exilus: { ...p[slot]!.exilus!, rank: r } } } : p)}
            />
          </div>

          <ModGrid mods={ws?.mods ?? []} slotPols={slotPols.slice(1)}
            onRemove={i => setWeaponStates(p => ({ ...p, [slot]: { ...p[slot], mods: (p[slot]?.mods ?? []).filter((_, j) => j !== i) } }))}
            onRankChange={(i, r) => setWeaponStates(p => ({ ...p, [slot]: { ...p[slot], mods: (p[slot]?.mods ?? []).map((m, j) => j === i ? { ...m, rank: r } : m) } }))}
            onSlotPolChange={(i, p) => setWeaponStates(prev => {
              const cur = prev[slot];
              if (!cur) return prev;
              return { ...prev, [slot]: { ...cur, slotPolarities: cur.slotPolarities.map((sp, j) => j === i + 1 ? p : sp) } };
            })}
            onEmptyClick={(i, m) => placeModAtSlot(slot, i, m)}
            allMods={allMods} maxSize={8} />

          {/* Arcanes */}
          <div className="loadout-section">
            <div className="section-topline"><span>Arcanes</span></div>
            <div className="inline-arcane-grid">
              {(ws?.arcanes ?? [null, null]).map((arc: ArcaneSlot | null, idx: number) => (
                <div key={idx} className={`inline-arcane-slot ${arc ? 'inline-arcane-slot--filled' : ''}`}>
                  {arc ? (
                    <>
                      <span className="arcane-name">{arc.name}</span>
                      <button className="mod-card-del" onClick={() => setWeaponStates(p => {
                        const cur = p[slot];
                        if (!cur) return p;
                        const newArcanes = [...(cur.arcanes ?? [null, null])] as [ArcaneSlot | null, ArcaneSlot | null];
                        newArcanes[idx] = null;
                        return { ...p, [slot]: { ...cur, arcanes: newArcanes } };
                      })}>×</button>
                    </>
                  ) : (
                    <select className="dex-select" defaultValue="" onChange={e => {
                      const f = arcanePool.find(a => a.uniqueName === e.target.value);
                      if (f) {
                        setWeaponStates(p => {
                          const cur = p[slot];
                          if (!cur) return p;
                          const newArcanes = [...(cur.arcanes ?? [null, null])] as [ArcaneSlot | null, ArcaneSlot | null];
                          newArcanes[idx] = { uniqueName: f.uniqueName, name: f.name, rank: 0, maxRank: 3 };
                          return { ...p, [slot]: { ...cur, arcanes: newArcanes } };
                        });
                      }
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
        </div>
      )}

      {!hasWeapon && (
        <div className="workspace-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, padding: 24 }}>
          <div style={{ textAlign: 'center', color: 'var(--wf-text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: 2 }}>
            <span style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>No Weapon Selected</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>Choose a weapon from the library</span>
          </div>
        </div>
      )}
    </>
  );
}
