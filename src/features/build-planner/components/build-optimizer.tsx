import React, { useMemo, useState } from 'react';
import type { ModSlot, ItemOption } from '../model';

interface Suggestion {
  label: string;
  reason: string;
  impact: string;
  modName?: string;
  type?: string;
}

export function BuildOptimizer({ mods, allMods: _allMods, slot, capacityPct }: {
  mods: ModSlot[];
  allMods: ItemOption[];
  slot: string;
  capacityPct: number;
}) {
  const [target, setTarget] = useState<'dps' | 'survival' | 'balanced'>('balanced');

  const suggestions = useMemo<Suggestion[]>(() => {
    const out: Suggestion[] = [];

    if (slot === 'warframe') {
      if (mods.length < 8) {
        out.push({ label: `${8 - mods.length} empty slots`, reason: 'Fill with survivability or ability mods', impact: 'medium', type: 'info' });
      }
      const hasVitality = mods.some(m => m.name.includes('Vitality') || m.name.includes('Health'));
      const hasShield = mods.some(m => m.name.includes('Redirection') || m.name.includes('Shield'));
      const hasArmor = mods.some(m => m.name.includes('Steel Fiber') || m.name.includes('Armor'));
      const hasStretch = mods.some(m => m.name.includes('Stretch') || m.name.includes('Range'));
      const hasIntensify = mods.some(m => m.name.includes('Intensify') || m.name.includes('Strength'));
      const hasContinuity = mods.some(m => m.name.includes('Continuity') || m.name.includes('Duration'));
      const hasEfficiency = mods.some(m => m.name.includes('Streamline') || m.name.includes('Efficiency'));

      if (!hasVitality) out.push({ label: 'Add Vitality', reason: 'Significant EHP boost for any frame', impact: 'high', modName: 'Vitality', type: 'survival' });
      if (!hasShield && target === 'survival') out.push({ label: 'Add Redirection', reason: 'Shield gating + EHP for shield-based frames', impact: 'high', modName: 'Redirection', type: 'survival' });
      if (!hasArmor && target === 'survival') out.push({ label: 'Add Steel Fiber', reason: 'Armor DR for health-tank frames', impact: 'medium', modName: 'Steel Fiber', type: 'survival' });
      if (!hasStretch) out.push({ label: 'Add Stretch', reason: 'Ability range for CC and buffs', impact: 'high', modName: 'Stretch', type: 'balanced' });
      if (!hasIntensify) out.push({ label: 'Add Intensify', reason: 'Ability strength for damage and buffs', impact: 'high', modName: 'Intensify', type: 'dps' });
      if (!hasContinuity) out.push({ label: 'Add Continuity', reason: 'Ability duration for sustained buffs', impact: 'high', modName: 'Continuity', type: 'balanced' });
      if (!hasEfficiency) out.push({ label: 'Add Streamline', reason: 'Cast more abilities before running out of energy', impact: 'high', modName: 'Streamline', type: 'balanced' });
    } else {
      // Weapon
      if (mods.length < 8) {
        out.push({ label: `${8 - mods.length} empty slots`, reason: 'Fill with damage, multishot, or elementals', impact: 'medium', type: 'info' });
      }
      const hasDamage = mods.some(m => m.name.includes('Pressure') || m.name.includes('Hornet') || m.name.includes('Serration'));
      const hasMultishot = mods.some(m => m.name.includes('Split') || m.name.includes('Barrel') || m.name.includes('Multishot') || m.name.includes('Galv'));
      const hasCritChance = mods.some(m => m.name.includes('Point Strike') || m.name.includes('Pistol Gambit') || m.name.includes('True Steel') || m.name.includes('Critical'));
      const hasCritDmg = mods.some(m => m.name.includes('Vital Sense') || m.name.includes('Target Cracker') || m.name.includes('Organ Shatter') || m.name.includes('Primed'));
      const hasElemental = mods.some(m => m.name.includes('Toxin') || m.name.includes('Electric') || m.name.includes('Heat') || m.name.includes('Cold') || m.name.includes('60/60') || m.name.includes('Dual'));

      if (!hasDamage) out.push({ label: 'Add base damage mod', reason: 'Foundation of all weapon damage', impact: 'high', type: 'dps' });
      if (!hasMultishot) out.push({ label: 'Add multishot mod', reason: 'Multiplicative DPS increase', impact: 'high', type: 'dps' });
      if (!hasCritChance) out.push({ label: 'Add crit chance mod', reason: 'Critical multiplier synergy', impact: 'high', type: 'dps' });
      if (!hasCritDmg) out.push({ label: 'Add crit damage mod', reason: 'Multiplies crit damage', impact: 'high', type: 'dps' });
      if (!hasElemental) out.push({ label: 'Add elemental mod(s)', reason: 'Damage type coverage + status', impact: 'high', type: 'dps' });
    }

    if (capacityPct > 80) {
      out.push({ label: 'Near capacity limit', reason: 'Consider forma or a reactor/catalyst', impact: 'low', type: 'warning' });
    }

    return out.filter(s => target === 'balanced' || s.type === target || s.type === 'warning' || s.type === 'info');
  }, [mods, slot, capacityPct, target]);

  return (
    <div style={{ padding: 4 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {(['dps', 'survival', 'balanced'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTarget(t)}
            style={{
              padding: '2px 8px', fontSize: 10, border: '1px solid var(--wf-border)', borderRadius: 3,
              background: target === t ? 'rgba(200,164,94,0.15)' : 'transparent',
              color: target === t ? 'var(--wf-gold)' : 'var(--wf-text-muted)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
            {t}
          </button>
        ))}
      </div>
      {suggestions.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--wf-text-muted)', textAlign: 'center', padding: 12 }}>
          No suggestions — build looks solid
        </div>
      )}
      {suggestions.map((s, i) => (
        <div key={i} style={{
          display: 'flex', gap: 6, padding: '3px 6px', marginBottom: 2,
          fontSize: 11, borderRadius: 2,
          borderLeft: `2px solid ${
            s.impact === 'high' ? 'var(--wf-gold)' :
            s.impact === 'medium' ? 'var(--wf-teal)' :
            'var(--wf-text-muted)'
          }`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'var(--wf-text)', fontWeight: 500 }}>{s.label}</div>
            <div style={{ color: 'var(--wf-text-muted)', fontSize: 10 }}>{s.reason}</div>
          </div>
          <span style={{
            fontSize: 9, padding: '1px 4px', borderRadius: 2,
            background: s.impact === 'high' ? 'rgba(200,164,94,0.2)' : 'rgba(128,128,128,0.15)',
            color: s.impact === 'high' ? 'var(--wf-gold)' : 'var(--wf-text-muted)',
            alignSelf: 'flex-start',
          }}>
            {s.impact}
          </span>
        </div>
      ))}
    </div>
  );
}
