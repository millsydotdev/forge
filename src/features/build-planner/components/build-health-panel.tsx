import React, { useMemo } from 'react';
import type { BuildPlannerState } from '../../../app/layout/types';
import { polarityMatches } from '../../../engine/polarity';
import type { Polarity } from '../../../engine/build-core';

interface PolaritySuggestion {
  slotIndex: number;
  modName: string;
  modPolarity: Polarity;
  slotPolarity: Polarity;
  currentCost: number;
  idealCost: number;
  savings: number;
}

export function BuildHealthPanel({ state }: { state: BuildPlannerState }) {
  const { wf, wfCapacity, weaponCapFor, activeSlot, equippedCount, allMods, ownedModIds, weaponStates } = state;

  const missedMods = allMods.length - (ownedModIds?.size ?? 0);
  const cap = activeSlot === 'warframe' ? wfCapacity : weaponCapFor(activeSlot);

  const overcap = cap ? cap.used - cap.total : 0;
  const pct = cap && cap.total > 0 ? Math.round((cap.used / cap.total) * 100) : 0;
  const remaining = cap ? cap.total - cap.used : 0;

  const polaritySuggs: PolaritySuggestion[] = useMemo(() => {
    const sug: PolaritySuggestion[] = [];
    const mods = activeSlot === 'warframe' ? wf.mods : weaponStates[activeSlot]?.mods ?? [];
    const polarities = activeSlot === 'warframe' ? wf.slotPolarities : weaponStates[activeSlot]?.slotPolarities ?? [];

    mods.forEach((mod, i) => {
      const slotPol = polarities[i] || 'UNIVERSAL' as Polarity;
      const modPol = mod.polarity as Polarity || 'UNIVERSAL' as Polarity;
      const matched = polarityMatches(modPol, slotPol);
      const drain = (mod.baseDrain ?? 0) + (mod.rank ?? 0);
      const currentCost = matched ? Math.ceil(drain / 2) : drain;
      const idealCost = Math.ceil(drain / 2);

      if (!matched && currentCost !== idealCost) {
        sug.push({
          slotIndex: i,
          modName: mod.name,
          modPolarity: modPol,
          slotPolarity: slotPol,
          currentCost,
          idealCost,
          savings: currentCost - idealCost,
        });
      }
    });
    return sug;
  }, [activeSlot, wf.mods, wf.slotPolarities, weaponStates]);

  const healthScore = useMemo(() => {
    if (!cap || cap.total === 0) return 0;
    const capScore = pct <= 80 ? 100 : pct <= 100 ? 50 : 0;
    const polarityScore = polaritySuggs.length === 0 ? 100 : Math.max(0, 100 - polaritySuggs.length * 20);
    return Math.round((capScore + polarityScore) / 2);
  }, [cap, pct, polaritySuggs]);

  const healthLabel = healthScore >= 80 ? 'Good' : healthScore >= 50 ? 'Needs Work' : 'Critical';
  const healthColor = healthScore >= 80 ? 'var(--wf-green)' : healthScore >= 50 ? 'var(--wf-gold)' : 'var(--wf-red)';

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Health score ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `2px solid ${healthColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: healthColor,
          fontFamily: 'var(--font-mono)',
          transition: 'border-color var(--transition-normal), color var(--transition-normal)',
        }}>
          {healthScore}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--wf-text)', fontWeight: 500 }}>Build Health</div>
          <div style={{ fontSize: 10, color: healthColor }}>{healthLabel}</div>
        </div>
      </div>

      {/* Capacity bar */}
      {cap && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 2 }}>
            <span>Capacity</span>
            <span>
              {cap.used}/{cap.total}
              {remaining >= 0 ? ` (${remaining} free)` : ` (${-remaining} over)`}
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--wf-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(pct, 100)}%`, height: '100%',
              background: pct > 100 ? 'var(--wf-red)' : pct > 80 ? 'var(--wf-gold)' : 'var(--wf-teal)',
              borderRadius: 3, transition: 'width var(--transition-normal), background var(--transition-normal)',
            }} />
          </div>
        </>
      )}

      {/* Polarity mismatches */}
      {polaritySuggs.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 10, color: 'var(--wf-gold)', marginBottom: 3, fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>
            Polarity Mismatches ({polaritySuggs.length})
          </div>
          {polaritySuggs.slice(0, 3).map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 10,
              color: 'var(--wf-text-dim)', padding: '1px 4px',
              background: 'rgba(200,164,94,0.06)', borderRadius: 2, marginBottom: 1,
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.modName}</span>
              <span style={{ color: 'var(--wf-red)', marginLeft: 4, flexShrink: 0 }}>
                +{s.savings} cap
              </span>
            </div>
          ))}
          {polaritySuggs.length > 3 && (
            <div style={{ fontSize: 9, color: 'var(--wf-text-muted)', textAlign: 'center', marginTop: 2 }}>
              +{polaritySuggs.length - 3} more mismatches
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--wf-text-muted)', marginTop: 6, flexWrap: 'wrap' }}>
        <span>Equipped: {equippedCount}</span>
        {overcap > 0 && <span style={{ color: 'var(--wf-red)' }}>Overcap: +{overcap}</span>}
        <span>Missing: {missedMods}</span>
      </div>
    </div>
  );
}
