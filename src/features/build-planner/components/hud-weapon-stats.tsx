import React from 'react';
import type { WeaponStats, CalculatedStats } from '../../../engine/stat-processor';
import { StatRow } from './stat-row';
import { DamageBar } from './damage-bar';
import { CalcTreeTooltip } from './calc-tree-tooltip';
import { visualManager } from '../../../services/visual-manager';
import { DMG_LABELS, DMG_COLORS, DOT_ENTRIES } from '../data/hud-constants';

interface Props {
  mainStats: WeaponStats;
  activeSlot: string;
  enemyEnabled: boolean;
  result: CalculatedStats | null;
  enemyMultiTarget: number;
  statusEntries: [string, number][];
  sortedDamage: [string, number][];
  totalDmg: number;
  onStatClick?: (stat: string) => void;
}

export function WeaponStatsSection({
  mainStats,
  activeSlot,
  enemyEnabled,
  result,
  enemyMultiTarget,
  statusEntries,
  sortedDamage,
  totalDmg,
}: Props) {
  return (
    <>
      <div className="hud-title">WEAPON</div>
      <div className="hud-dps">
        <CalcTreeTooltip breakdown={mainStats.breakdowns?.burstDps} color="var(--wf-red-ui)">
          <div className="hud-dps-cursor-help">
            {Math.round(mainStats.burstDps ?? mainStats.avgDps).toLocaleString()}
            <span className="hud-dps-suffix">burst DPS</span>
          </div>
        </CalcTreeTooltip>
        {mainStats.sustainedDps != null && mainStats.magazine > 1 && (
          <CalcTreeTooltip breakdown={mainStats.breakdowns?.sustainedDps} color="var(--wf-orange)">
            <div className="hud-dps-row">
              {Math.round(mainStats.sustainedDps).toLocaleString()}
              <span className="hud-dps-suffix">sustained</span>
            </div>
          </CalcTreeTooltip>
        )}
        {mainStats.headshotDps != null && mainStats.headshotDps > (mainStats.burstDps ?? 0) && (
          <div className="hud-dps-headshot">
            {Math.round(mainStats.headshotDps).toLocaleString()}
            <span className="hud-dps-suffix">headshot</span>
          </div>
        )}
        {mainStats.dot && mainStats.dot.totalDotDps > 0 && (
          <div className="hud-dps-dot-value">
            {Math.round((mainStats.burstDps ?? mainStats.avgDps) + mainStats.dot.totalDotDps).toLocaleString()}
            <span className="hud-dps-suffix">w/ DoT</span>
          </div>
        )}
        {enemyMultiTarget > 1 && (
          <div className="hud-dps-multi-value">
            {Math.round((mainStats.burstDps ?? mainStats.avgDps) * enemyMultiTarget).toLocaleString()}
            <span className="hud-dps-suffix">×{enemyMultiTarget} multi-target</span>
          </div>
        )}
      </div>
      <div className="hud-stat-box">
        <StatRow label="Damage" value={Math.round(mainStats.totalDamage).toLocaleString()} breakdown={mainStats.breakdowns?.baseDamage} />
        <StatRow label="Multishot" value={mainStats.multishot.toFixed(2)} suffix="x" color="var(--wf-teal-ui)" breakdown={mainStats.breakdowns?.multishot} />
        <StatRow label="Fire Rate" value={mainStats.fireRate.toFixed(1)} suffix="/s" breakdown={mainStats.breakdowns?.fireRate} />
        <StatRow label="Magazine" value={String(mainStats.magazine ?? '\u2014')} color="var(--wf-purple)" />
        <StatRow label="Reload" value={mainStats.reloadSpeed.toFixed(1)} suffix="s" color="var(--wf-gold-accent)" breakdown={mainStats.breakdowns?.reloadSpeed} />
        {mainStats.sustainedDps != null && mainStats.burstDps > 0 && mainStats.magazine > 1 && (
          <StatRow
            label="DPS Efficiency"
            value={Math.round((mainStats.sustainedDps / mainStats.burstDps) * 100).toString()}
            suffix="%"
            color={mainStats.sustainedDps / mainStats.burstDps > 0.8 ? 'var(--wf-green-ui)' : mainStats.sustainedDps / mainStats.burstDps > 0.5 ? 'var(--wf-gold-accent)' : 'var(--wf-red-ui)'}
          />
        )}
      </div>

      {/* vs-Enemy damage */}
      {enemyEnabled && mainStats.enemyDamage && result?.enemy && (
        <EnemyStatsSection mainStats={mainStats} result={result} />
      )}

      {/* Heavy Attack Stats */}
      {activeSlot === 'melee' && <HeavyAttackSection mainStats={mainStats} />}

      {/* Utility Panel */}
      <UtilityStatsSection mainStats={mainStats} activeSlot={activeSlot} />

      {/* Damage Bars */}
      {sortedDamage.length > 0 && <DamageBarsSection sortedDamage={sortedDamage} totalDmg={totalDmg} />}

      {/* Critical */}
      {mainStats.critChance > 0 && <CriticalSection mainStats={mainStats} />}

      {/* Status */}
      {mainStats.statusChance > 0 && (
        <StatusSection mainStats={mainStats} statusEntries={statusEntries} />
      )}
    </>
  );
}

function EnemyStatsSection({ mainStats, result }: { mainStats: WeaponStats; result: CalculatedStats }) {
  const enemyResult = mainStats.enemyDamage!;
  return (
    <>
      <div className="hud-title hud-title-enemy">VS {result.enemy!.name.toUpperCase()} (L{result.enemy!.level})</div>
      <div className="hud-enemy-box">
        <div className="hud-enemy-row">
          <span className="hud-enemy-label">Effective DPS</span>
          <span className="hud-enemy-value">{Math.round(enemyResult.effectiveDps).toLocaleString()}</span>
        </div>
        {enemyResult.multiTargetEffectiveDps !== enemyResult.effectiveDps && (
          <div className="hud-enemy-row">
            <span className="hud-enemy-multi-label">×{result.enemy!.multiTarget} targets</span>
            <span className="hud-enemy-multi-value">{Math.round(enemyResult.multiTargetEffectiveDps).toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="hud-stat-box">
        <StatRow label="Shots to Kill" value={enemyResult.shotsToKill.toLocaleString()} color="var(--wf-red-ui)" />
        {enemyResult.shotsToBreakShield > 0 && (
          <StatRow label="  → Shields" value={enemyResult.shotsToBreakShield.toLocaleString()} color="var(--wf-blue)" />
        )}
        <StatRow label="  → Health" value={enemyResult.shotsToKillHealth.toLocaleString()} color="var(--wf-red-ui)" />
        <StatRow label="Burst TTK" value={enemyResult.timeToKill > 0 ? enemyResult.timeToKill.toFixed(2) : '\u221E'} suffix="s" color="var(--wf-gold-accent)" />
        <StatRow label="Sustained TTK" value={enemyResult.sustainedTimeToKill > 0 ? enemyResult.sustainedTimeToKill.toFixed(2) : '\u221E'} suffix="s" color="var(--wf-red-ui)" />
        <StatRow label="Dmg/Shot (HP)" value={Math.round(enemyResult.damagePerShotVsHealth).toLocaleString()} color="var(--wf-green-ui)" />
        {enemyResult.damagePerShotVsShield > 0 && (
          <StatRow label="Dmg/Shot (Shield)" value={Math.round(enemyResult.damagePerShotVsShield).toLocaleString()} color="var(--wf-blue)" />
        )}
      </div>
      {Object.keys(enemyResult.damagePerTypeVsHealth).length > 0 && (
        <div className="hud-damage-bars hud-title-margin">
          {Object.entries(enemyResult.damagePerTypeVsHealth)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([type, val]) => {
              const total = Object.values(enemyResult.damagePerTypeVsHealth).reduce((s, v) => s + Math.max(0, v), 0);
              const pct = total > 0 ? (val / total) * 100 : 0;
              return (
                <DamageBar key={type} label={DMG_LABELS[type] ?? type.slice(0, 4).toUpperCase()} pct={pct} color={DMG_COLORS[type] ?? 'var(--wf-gray-muted)'} iconUrl={visualManager.getDamageIcon(type)} />
              );
            })}
        </div>
      )}
    </>
  );
}

function HeavyAttackSection({ mainStats }: { mainStats: WeaponStats }) {
  return (
    <>
      <div className="hud-title hud-title-margin">HEAVY ATTACK</div>
      <div className="hud-stat-box">
        <StatRow label="Crit Chance" value={((mainStats.heavyCritChance ?? 0) * 100).toFixed(1)} suffix="%" color="var(--wf-gold-accent)" />
        <StatRow label="Wind Up" value={(mainStats.heavyWindUp ?? 1.0).toFixed(2)} suffix="s" />
        <StatRow label="Efficiency" value={Math.round((mainStats.heavyEfficiency ?? 0) * 100).toString()} suffix="%" />
        <StatRow label="Initial Combo" value={Math.round(mainStats.initialCombo ?? 0).toString()} />
        <StatRow label="Combo Dur" value={(mainStats.comboDuration ?? 5.0).toFixed(1)} suffix="s" />
        <StatRow label="Combo Chance" value={Math.round((mainStats.comboChance ?? 0) * 100).toString()} suffix="%" />
      </div>
    </>
  );
}

function UtilityStatsSection({ mainStats, activeSlot }: { mainStats: WeaponStats; activeSlot: string }) {
  const recoilRow = (() => {
    const r = mainStats.recoil ?? 1.0;
    const delta = (r - 1.0) * 100;
    return <StatRow label="Recoil" value={delta >= 0 ? '+' + delta.toFixed(0) : delta.toFixed(0)} suffix="%" color={r < 1.0 ? 'var(--wf-green-ui)' : r > 1.0 ? 'var(--wf-red-ui)' : '#fff'} />;
  })();

  return (
    <details open={false}>
      <summary className="hud-title hud-summary">UTILITY STATS</summary>
      <div className="hud-stat-box hud-title-margin">
        {activeSlot === 'melee' ? (
          <>
            <StatRow label="Melee Range" value={(mainStats.meleeRange ?? 2.5).toFixed(1)} suffix="m" />
            {mainStats.channelingDamage != null && mainStats.channelingDamage > 1 && (
              <StatRow label="Channel Dmg" value={((mainStats.channelingDamage - 1) * 100).toFixed(0)} suffix="%" color="var(--wf-gold-accent)" />
            )}
            {mainStats.channelingCost != null && mainStats.channelingCost !== 1 && (
              <StatRow label="Channel Cost" value={((mainStats.channelingCost - 1) * 100).toFixed(0)} suffix="%" color={mainStats.channelingCost < 1 ? 'var(--wf-green-ui)' : 'var(--wf-red-ui)'} />
            )}
            {mainStats.slamAttack != null && mainStats.slamAttack > 1 && (
              <StatRow label="Slam Dmg" value={((mainStats.slamAttack - 1) * 100).toFixed(0)} suffix="%" color="var(--wf-orange)" />
            )}
            {mainStats.slideAttack != null && mainStats.slideAttack > 1 && (
              <StatRow label="Slide Dmg" value={((mainStats.slideAttack - 1) * 100).toFixed(0)} suffix="%" color="var(--wf-orange)" />
            )}
            {mainStats.finisherDamage != null && mainStats.finisherDamage > 1 && (
              <StatRow label="Finisher" value={((mainStats.finisherDamage - 1) * 100).toFixed(0)} suffix="%" color="var(--wf-red-ui)" />
            )}
          </>
        ) : recoilRow}
        <StatRow label="Zoom" value={(((mainStats.zoom ?? 1.0) - 1.0) * 100).toFixed(0)} suffix="%" />
        <StatRow label="Proj. Speed" value={(((mainStats.projectileSpeed ?? 1.0) - 1.0) * 100).toFixed(0)} suffix="%" />
        <StatRow label="Accuracy" value={Math.round(mainStats.accuracy ?? 100).toString()} />
        {mainStats.punchThrough != null && mainStats.punchThrough > 0 && (
          <StatRow label="Punch Through" value={mainStats.punchThrough.toFixed(1)} suffix="m" color="var(--wf-green-ui)" />
        )}
        {mainStats.maxAmmo != null && mainStats.maxAmmo !== 1 && (
          <StatRow label="Max Ammo" value={((mainStats.maxAmmo - 1) * 100).toFixed(0)} suffix="%" color={mainStats.maxAmmo > 1 ? 'var(--wf-green-ui)' : 'var(--wf-red-ui)'} />
        )}
        {mainStats.blastRadius != null && mainStats.blastRadius !== 1 && (
          <StatRow label="Blast Radius" value={((mainStats.blastRadius - 1) * 100).toFixed(0)} suffix="%" color="var(--wf-orange)" />
        )}
      </div>
    </details>
  );
}

function DamageBarsSection({ sortedDamage, totalDmg }: { sortedDamage: [string, number][]; totalDmg: number }) {
  return (
    <>
      <div className="hud-title hud-title-margin">DAMAGE</div>
      <div className="hud-damage-bars">
        {sortedDamage.map(([type, val]) => {
          const pct = totalDmg > 0 ? (val / totalDmg) * 100 : 0;
          return (
            <DamageBar key={type} label={DMG_LABELS[type] ?? type.slice(0, 4).toUpperCase()} pct={pct} color={DMG_COLORS[type] ?? 'var(--wf-gray-muted)'} iconUrl={visualManager.getDamageIcon(type)} />
          );
        })}
      </div>
    </>
  );
}

function CriticalSection({ mainStats }: { mainStats: WeaponStats }) {
  return (
    <>
      <div className="hud-title hud-title-margin">CRITICAL</div>
      <div className="hud-stat-box">
        <StatRow label="Chance" value={(mainStats.critChance * 100).toFixed(1)} suffix="%" color="var(--wf-gold-accent)" breakdown={mainStats.breakdowns?.critChance} />
        <StatRow label="Multiplier" value={mainStats.critMultiplier.toFixed(2)} suffix="x" color="var(--wf-gold-accent)" breakdown={mainStats.breakdowns?.critMultiplier} />
        <StatRow label="Yellow" value={(mainStats.critTiers.yellow * 100).toFixed(0)} suffix="%" color="var(--wf-gold-accent)" />
        {mainStats.critTiers.orange > 0 && <StatRow label="Orange" value={(mainStats.critTiers.orange * 100).toFixed(0)} suffix="%" color="#e8a030" />}
        {mainStats.critTiers.red > 0 && <StatRow label="Red" value={(mainStats.critTiers.red * 100).toFixed(0)} suffix="%" color="var(--wf-red-ui)" />}
      </div>
    </>
  );
}

function StatusSection({ mainStats, statusEntries }: { mainStats: WeaponStats; statusEntries: [string, number][] }) {
  return (
    <>
      <div className="hud-title hud-title-margin">STATUS</div>
      <div className="hud-stat-box">
        <StatRow label="Chance" value={(mainStats.statusChance * 100).toFixed(1)} suffix="%" color="var(--wf-green-ui)" breakdown={mainStats.breakdowns?.statusChance} />
        <StatRow label="Per sec" value={(mainStats.statusChance * mainStats.fireRate * mainStats.multishot).toFixed(1)} />
        <StatRow label="Multishot" value={mainStats.multishot.toFixed(2)} suffix="x" />
        {mainStats.statusDuration != null && mainStats.statusDuration !== 1 && (
          <StatRow label="Duration" value={((mainStats.statusDuration - 1) * 100).toFixed(0)} suffix="%" color={mainStats.statusDuration > 1 ? 'var(--wf-green-ui)' : 'var(--wf-red-ui)'} />
        )}
        {mainStats.headshotMultiplier != null && mainStats.headshotMultiplier > 2.0 && (
          <StatRow label="Headshot" value={mainStats.headshotMultiplier.toFixed(2)} suffix="x" color="#e8a030" />
        )}
        {mainStats.lifeSteal != null && mainStats.lifeSteal > 0 && (
          <StatRow label="Life Steal" value={(mainStats.lifeSteal * 100).toFixed(1)} suffix="%" color="var(--wf-red-ui)" />
        )}
      </div>
      {statusEntries.length > 0 && (
        <div className="hud-damage-bars">
          {statusEntries.slice(0, 6).map(([type, prob]) => (
            <DamageBar key={type} label={DMG_LABELS[type] ?? type.slice(0, 4).toUpperCase()} pct={prob} color={DMG_COLORS[type] ?? 'var(--wf-gray-muted)'} iconUrl={visualManager.getDamageIcon(type)} />
          ))}
        </div>
      )}
      {mainStats.dot && mainStats.dot.totalDotDps > 0 && <DoTSection mainStats={mainStats} />}
    </>
  );
}

function DoTSection({ mainStats }: { mainStats: WeaponStats }) {
  const dot = mainStats.dot!;
  return (
    <details className="hud-details" open={false}>
      <summary className="hud-title hud-dot-summary">
        <span className="dot-section-header">✦ DoT / STATUS PROCS</span>
      </summary>
      <div className="hud-dot-box">
        <div className="hud-dot-header">
          <span className="hud-dot-header-label">Total DoT DPS</span>
          <span className="hud-dot-header-value">{Math.round(dot.totalDotDps).toLocaleString()}</span>
        </div>
        <div className="hud-dot-list">
          {DOT_ENTRIES.filter(e => dot[e.key] > 0).map(e => {
            const dps = dot[e.key];
            const tick = dot[e.tick];
            const pctOfTotal = dot.totalDotDps > 0 ? (dps / dot.totalDotDps) * 100 : 0;
            return (
              <div key={e.key} className="hud-dot-entry">
                <span className="hud-dot-icon" style={{ color: e.color }}>{e.icon}</span>
                <div className="hud-dot-label-container">
                  <span className="hud-dot-label">{e.label}</span>
                  <div className="hud-dot-bar-track">
                    <div className="hud-dot-bar-fill" style={{ width: `${pctOfTotal}%`, background: e.color }} />
                  </div>
                </div>
                <span className="hud-dot-tick" style={{ color: e.color }}>{Math.round(tick).toLocaleString()}/tick</span>
                <span className="hud-dot-dps">{Math.round(dps).toLocaleString()} dps</span>
              </div>
            );
          })}
        </div>
        {mainStats.statusDuration != null && mainStats.statusDuration !== 1 && (
          <div className="hud-dot-duration">
            Status Duration: +{((mainStats.statusDuration - 1) * 100).toFixed(0)}% → DoT ticks scaled
          </div>
        )}
      </div>
    </details>
  );
}
