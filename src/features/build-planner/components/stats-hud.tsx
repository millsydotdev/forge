import React, { useMemo, useState, useCallback } from 'react';
import type { CalculatedStats, WeaponStats } from '../../../engine/stat-processor';
import type { CalcBreakdown } from '../../../engine/calc-breakdown';
import { countUniqueStatusTypes, type WeaponState } from '../model';
import { StatRow } from './stat-row';
import { CalcTreeTooltip } from './calc-tree-tooltip';
import { PHYSICAL_LABELS } from '../data/hud-constants';
import { DynamicStatsSection } from './hud-dynamic-stats';
import { WeaponStatsSection } from './hud-weapon-stats';
import { STAT_DISPLAY, isStatModified, formatStatValue } from '../data/stat-display';
import { StatExplorer } from './calc-explorer';

export function StatsHUD({ result, activeSlot, curWeapon: _cw, primerSlot, weaponStates: _ws, resultWeapons, enemyMultiTarget = 1, enemyEnabled = false, calculating }: {
   result: CalculatedStats | null; activeSlot: string; curWeapon: WeaponState | null;
   primerSlot: string | null; weaponStates: Record<string, WeaponState>;
   resultWeapons: Record<string, WeaponStats> | undefined;
   enemyMultiTarget?: number;
   enemyEnabled?: boolean;
   calculating?: boolean;
 }) {
  const [exploring, setExploring] = useState<{ statName: string; breakdown: CalcBreakdown | undefined } | null>(null);

  const primerStats = primerSlot && resultWeapons ? resultWeapons[primerSlot] : undefined;
  const mainStats = (activeSlot !== 'companion' && resultWeapons) ? resultWeapons[activeSlot] : undefined;
  const statusTypes = countUniqueStatusTypes(primerStats);
  const coMultiplier = primerStats ? (primerStats.statusDuration ?? 0.8) : 0.8;
  const coMult = 1 + statusTypes * coMultiplier;
  const gsMult = 1 + statusTypes * 0.4;
  const warframeStats = result && activeSlot === 'warframe' ? result : null;
  const companionStats = result?.companion ? result.companion : null;

  const damageEntries = useMemo(() => mainStats?.damagePerType ? Object.entries(mainStats.damagePerType).filter(([, v]) => v > 0) : [], [mainStats]);
  const totalDmg = useMemo(() => damageEntries.reduce((s, [, v]) => s + v, 0), [damageEntries]);
  const topPhys = useMemo(() => damageEntries.filter(([k]) => PHYSICAL_LABELS.has(k)), [damageEntries]);
  const topElem = useMemo(() => damageEntries.filter(([k]) => !PHYSICAL_LABELS.has(k)), [damageEntries]);
  const sortedDamage = useMemo(() => [...topPhys, ...topElem], [topPhys, topElem]);

  const statusEntries = useMemo(() => mainStats?.statusProbs ? Object.entries(mainStats.statusProbs).filter(([, v]) => v > 0) : [], [mainStats]);

  const coreStatEntries = useMemo(() => {
    if (!warframeStats) return [];
    const keys = ['health', 'shields', 'armor', 'energy', 'ehp', 'sprintSpeed'];
    const statRecord = warframeStats as unknown as Record<string, number | undefined>;
    return keys
      .map(key => {
        const def = STAT_DISPLAY[key];
        if (!def) return null;
        const value = statRecord[key];
        if (value === undefined || value === null) return null;
        const formatted = formatStatValue(value, def.format);
        return { key, label: def.label, symbol: def.symbol, value: formatted ?? '', color: def.color, raw: value };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }, [warframeStats]);

  const overguardEntry = useMemo(() => {
    if (!warframeStats || warframeStats.overguard == null || warframeStats.overguard <= 1) return null;
    const def = STAT_DISPLAY.overguard;
    return { label: def.label, symbol: def.symbol, value: ((warframeStats.overguard - 1) * 100).toFixed(0) + '%', color: def.color };
  }, [warframeStats]);

  const movementEntries = useMemo(() => {
    if (!warframeStats) return [];
    const keys = ['shieldRecharge', 'shieldRechargeDelay', 'parkourVelocity', 'aimGlideDuration', 'castingSpeed', 'bulletJump', 'slide', 'jumpHeight', 'healthRegen'];
    const statRecord = warframeStats as unknown as Record<string, number | undefined>;
    return keys
      .map(key => {
        const def = STAT_DISPLAY[key];
        if (!def) return null;
        const value = statRecord[key];
        if (!isStatModified(value, def)) return null;
        const formatted = formatStatValue(value!, def.format);
        return { key, label: def.label, symbol: def.symbol, value: formatted ?? '', color: def.color, raw: value };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);
  }, [warframeStats]);

  const handleStatClick = useCallback((statName: string) => {
    const breakdown = result?.breakdowns?.[statName as keyof typeof result.breakdowns] as CalcBreakdown | undefined;
    setExploring({ statName, breakdown });
  }, [result]);

  const renderClickableStat = useCallback((statKey: string, label: string, symbol: string, value: string, color: string) => (
    <div onClick={() => handleStatClick(statKey)} style={{ cursor: 'pointer' }} title={`Click to explore ${label}`}>
      <StatRow label={label} symbol={symbol} value={value} color={color} />
    </div>
  ), [handleStatClick]);

  return (
    <div className="stats-hud">
      {calculating && <div className="calc-loading-bar" />}

      {!result && !calculating && (
        <div style={{ padding: 16, textAlign: 'center', color: 'var(--wf-text-muted)', fontSize: 12 }}>
          Select items to see stats
        </div>
      )}

      {/* Warframe Core Stats */}
      {/* Warframe Core Stats */}
      {warframeStats && coreStatEntries.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">WARFRAME</div>
          <div className="stat-grid">
            {coreStatEntries.map(s => (
              <CalcTreeTooltip key={s.key} breakdown={result?.breakdowns?.[s.key as keyof typeof result.breakdowns] as CalcBreakdown | undefined} color={s.color}>
                {renderClickableStat(s.key, s.label!, s.symbol!, s.value as string, s.color as string)}
              </CalcTreeTooltip>
            ))}
          </div>
        </div>
      )}

      {/* Overguard */}
      {overguardEntry && (
        <div className="stats-section">
          {renderClickableStat('overguard', overguardEntry.label!, overguardEntry.symbol!, overguardEntry.value!, overguardEntry.color!)}
        </div>
      )}

      {/* Movement & Survival */}
      {movementEntries.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">MOVEMENT & SURVIVAL</div>
          <div className="stat-grid">
            {movementEntries.map(s => <div key={s.key}>{renderClickableStat(s.key, s.label!, s.symbol!, s.value!, s.color!)}</div>)}
          </div>
        </div>
      )}

      {/* Companion */}
      {companionStats && (
        <div className="stats-section">
          <div className="stats-section-title">COMPANION</div>
          <StatRow label="Companion Health" value={companionStats.health.toFixed(0)} color="var(--wf-text-dim)" />
          <StatRow label="Companion Shields" value={companionStats.shields.toFixed(0)} color="var(--wf-blue)" />
          <StatRow label="Companion Armor" value={companionStats.armor.toFixed(0)} color="var(--wf-orange)" />
          <StatRow label="Companion EHP" value={companionStats.ehp.toFixed(0)} color="var(--wf-gold)" />
        </div>
      )}

      {/* Set Bonuses */}
      {result?.setBonuses && result.setBonuses.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">SET BONUSES</div>
          {result.setBonuses.map((sb, i) => (
            <StatRow key={i} label={sb.label} value={`${sb.count}/${sb.maxPieces}`} color="var(--wf-purple)" />
          ))}
        </div>
      )}

      {/* Abilities */}
      {warframeStats && (
        <div className="stats-section">
          <div className="stats-section-title">ABILITIES</div>
          <div className="ability-bars">
            {['strength', 'duration', 'range', 'efficiency'].map(stat => {
              const val = warframeStats[stat as keyof CalculatedStats] as number | undefined;
              const br = result?.breakdowns?.[stat as keyof typeof result.breakdowns] as CalcBreakdown | undefined;
              return (
                <CalcTreeTooltip key={stat} breakdown={br}>
                  <div onClick={() => handleStatClick(stat)} style={{ cursor: 'pointer' }} className="ability-bar-container">
                    <div className="ability-bar-label">{stat[0].toUpperCase() + stat.slice(1, 3)}</div>
                    <div className="ability-bar-track">
                      <div className="ability-bar-fill" style={{ width: `${Math.min((val ?? 1) * 100, 300)}%`, background: stat === 'strength' ? 'var(--wf-red)' : stat === 'duration' ? 'var(--wf-blue)' : stat === 'range' ? 'var(--wf-green)' : 'var(--wf-teal)' }} />
                    </div>
                    <div className="ability-bar-value">{((val ?? 1) * 100).toFixed(0)}%</div>
                  </div>
                </CalcTreeTooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* Helminth Ability */}
      {result?.helminthAbility && (
        <div className="stats-section">
          <div className="stats-section-title">HELMINTH</div>
          <StatRow label={result.helminthAbility.abilityName} value={`${result.helminthAbility.scaledDamage.toFixed(0)} ${result.helminthAbility.damageType}`} color="var(--wf-purple)" />
          <StatRow label="Donor" value={result.helminthAbility.donorName} color="var(--wf-text-dim)" />
        </div>
      )}

      {/* Detailed Stats */}
      {warframeStats && DynamicStatsSection(warframeStats, { onStatClick: handleStatClick })}

      {/* Weapon Stats */}
      {mainStats && (
        <WeaponStatsSection
          mainStats={mainStats}
          activeSlot={activeSlot}
          enemyEnabled={enemyEnabled}
          result={result}
          enemyMultiTarget={enemyMultiTarget}
          statusEntries={statusEntries}
          sortedDamage={sortedDamage}
          totalDmg={totalDmg}
          onStatClick={handleStatClick}
        />
      )}

      {/* Primer stats */}
      {primerStats && (
        <div className="stats-section">
          <div className="stats-section-title">PRIMER</div>
          <StatRow label="Status Types" value={String(statusTypes)} color="var(--wf-teal)" />
          <StatRow label="CO Mult" value={`×${coMult.toFixed(2)}`} color="var(--wf-green)" />
          <StatRow label="GS Mult" value={`×${gsMult.toFixed(2)}`} color="var(--wf-green)" />
        </div>
      )}

      {/* Calculation Explorer Modal */}
      {exploring && (
        <StatExplorer
          statName={exploring.statName}
          breakdown={exploring.breakdown}
          onClose={() => setExploring(null)}
        />
      )}
    </div>
  );
}
