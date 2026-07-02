import React, { useState, useMemo } from 'react';
import type { CalcBreakdown } from '../../../../engine/calc-breakdown';
import { StatBreakdownRow } from './stat-breakdown-row';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import { Input } from '../../../../components/ui/Input';

type IdleInspectorProps = {
  state: BuildPlannerStoreState;
};

export function IdleInspector({ state }: IdleInspectorProps) {
  const [search, setSearch] = useState('');
  const { result, activeSlot, wf, calculating } = state;

  const isWarframe = activeSlot === 'warframe';
  const isWeapon = ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee', 'exalted_weapon'].includes(activeSlot);

  const displayStats = useMemo(() => {
    if (!result) return [];
    if (isWarframe) {
      const bd = result.breakdowns as any;
      return [
        { key: 'health', label: 'Health', value: Math.round(result.health ?? 0).toLocaleString(), breakdown: bd?.health as CalcBreakdown | undefined },
        { key: 'shields', label: 'Shields', value: Math.round(result.shields ?? 0).toLocaleString(), breakdown: bd?.shields as CalcBreakdown | undefined },
        { key: 'armor', label: 'Armor', value: Math.round(result.armor ?? 0).toLocaleString(), breakdown: bd?.armor as CalcBreakdown | undefined },
        { key: 'energy', label: 'Energy', value: Math.round(result.energy ?? 0).toLocaleString(), breakdown: bd?.energy as CalcBreakdown | undefined },
        { key: 'ehp', label: 'EHP', value: Math.round(result.ehp ?? 0).toLocaleString(), breakdown: bd?.ehp as CalcBreakdown | undefined },
        { key: 'sprintSpeed', label: 'Sprint', value: (result.sprintSpeed ?? 1).toFixed(2), breakdown: bd?.sprintSpeed as CalcBreakdown | undefined },
        { key: 'strength', label: 'Strength', value: (result.strength ?? 1).toFixed(2) + 'x', breakdown: bd?.strength as CalcBreakdown | undefined },
        { key: 'duration', label: 'Duration', value: (result.duration ?? 1).toFixed(2) + 'x', breakdown: bd?.duration as CalcBreakdown | undefined },
        { key: 'range', label: 'Range', value: (result.range ?? 1).toFixed(2) + 'x', breakdown: bd?.range as CalcBreakdown | undefined },
        { key: 'efficiency', label: 'Efficiency', value: (result.efficiency ?? 1).toFixed(2) + 'x', breakdown: bd?.efficiency as CalcBreakdown | undefined },
      ];
    }
    if (isWeapon) {
      const ws = result.weapons?.[activeSlot];
      if (!ws) return [];
      const wbd = ws.breakdowns as any;
      return [
        { key: 'totalDamage', label: 'Damage', value: Math.round(ws.totalDamage ?? 0).toLocaleString(), breakdown: wbd?.totalDamage as CalcBreakdown | undefined },
        { key: 'burstDps', label: 'Burst DPS', value: Math.round(ws.burstDps ?? 0).toLocaleString(), breakdown: wbd?.burstDps as CalcBreakdown | undefined },
        { key: 'sustainedDps', label: 'Sustained', value: Math.round(ws.sustainedDps ?? 0).toLocaleString(), breakdown: wbd?.sustainedDps as CalcBreakdown | undefined },
        { key: 'critChance', label: 'Crit Chance', value: ((ws.critChance ?? 0) * 100).toFixed(0) + '%', breakdown: wbd?.critChance as CalcBreakdown | undefined },
        { key: 'critMultiplier', label: 'Crit Multi', value: (ws.critMultiplier ?? 2).toFixed(1) + 'x', breakdown: wbd?.critMultiplier as CalcBreakdown | undefined },
        { key: 'multishot', label: 'Multishot', value: (ws.multishot ?? 1).toFixed(1) + 'x', breakdown: wbd?.multishot as CalcBreakdown | undefined },
        { key: 'fireRate', label: 'Fire Rate', value: (ws.fireRate ?? 0).toFixed(1), breakdown: wbd?.fireRate as CalcBreakdown | undefined },
        { key: 'statusChance', label: 'Status', value: ((ws.statusChance ?? 0) * 100).toFixed(0) + '%', breakdown: wbd?.statusChance as CalcBreakdown | undefined },
        { key: 'reloadSpeed', label: 'Reload', value: (ws.reloadSpeed ?? 1).toFixed(1) + 's', breakdown: wbd?.reloadSpeed as CalcBreakdown | undefined },
        { key: 'magazine', label: 'Magazine', value: String(ws.magazine ?? 0), breakdown: wbd?.magazine as CalcBreakdown | undefined },
      ];
    }
    return [];
  }, [result, activeSlot, isWarframe, isWeapon]);

  const filteredStats = useMemo(() => {
    if (!search.trim()) return displayStats;
    const q = search.toLowerCase();
    return displayStats.filter(s => s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q));
  }, [displayStats, search]);

  const hasFrame = !!wf.id;

  return (
    <div className="inspector-idle">
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search a stat…"
        aria-label="Quick stat search"
      />

      {calculating && (
        <div style={{ height: 2, background: 'var(--wf-border)', borderRadius: 1, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: '30%', background: 'var(--wf-teal)', borderRadius: 1, animation: 'wb-shimmer 1.5s linear infinite', backgroundImage: 'linear-gradient(90deg, transparent, rgba(0,220,245,0.4), transparent)', backgroundSize: '200% 100%' }} />
        </div>
      )}

      {result && (
        <>
          {(search.trim() || displayStats.length > 0) && (
            <div className="inspector-stat-list" style={{ animation: 'wb-fade-in var(--transition-normal)' }}>
              {(search.trim() ? filteredStats : displayStats).map(s => (
                <StatBreakdownRow key={s.key} statName={s.label} value={s.value} statKey={s.key} breakdown={s.breakdown} />
              ))}
              {search.trim() && filteredStats.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--wf-text-muted)', fontSize: 12, padding: 12 }}>
                  No matching stats
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!result && hasFrame && (
        <div style={{ textAlign: 'center', color: 'var(--wf-text-muted)', fontSize: 12, padding: 12 }}>
          <div style={{ marginBottom: 6, opacity: 0.5, fontSize: 18 }}>⟳</div>
          Calculating…
        </div>
      )}
      {!hasFrame && (
        <div style={{ textAlign: 'center', color: 'var(--wf-text-muted)', fontSize: 12, padding: 12 }}>
          <div style={{ marginBottom: 6, opacity: 0.5, fontSize: 18 }}>◈</div>
          Select a Warframe to begin
        </div>
      )}
    </div>
  );
}
