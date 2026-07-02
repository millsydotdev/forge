import React, { useMemo, useState } from 'react';
import type { CalculatedStats } from '../../../engine/stat-processor';
import type { EnemyTargetState } from '../../../engine/build-core';
import { ENEMY_TARGETS, calcEhp } from '../../../engine/enemy-simulator';
import type { ConditionalTriggers, WeaponState } from '../model';
import { DEFAULT_CONDITIONAL_TRIGGERS, TRIGGER_LABELS } from '../model';
import { StatsHUD } from './stats-hud';

export function DpsCalculatorPanel({
  result, activeSlot, curWeapon, primerSlot, weaponStates,
  targetFaction, setTargetFaction, isAiming, setIsAiming, activeStatuses, setActiveStatuses,
  conditionalTriggers, setConditionalTriggers,
  enemyState, setEnemyState, enemyEnabled, setEnemyEnabled,
}: {
  result: CalculatedStats | null; activeSlot: string; curWeapon: WeaponState | null;
  primerSlot: string | null; weaponStates: Record<string, WeaponState>;
  targetFaction: string; setTargetFaction: (val: string) => void;
  isAiming: boolean; setIsAiming: (val: boolean) => void;
  activeStatuses: number; setActiveStatuses: (val: number) => void;
  conditionalTriggers: ConditionalTriggers; setConditionalTriggers: (val: ConditionalTriggers) => void;
  enemyState: EnemyTargetState; setEnemyState: (val: EnemyTargetState) => void;
  enemyEnabled: boolean; setEnemyEnabled: (val: boolean) => void;
}) {
  const [showEnemyLab, setShowEnemyLab] = useState(false);
  const [showConditions, setShowConditions] = useState(false);

  const enemyEhp = useMemo(() => {
    const e = ENEMY_TARGETS.find(t => t.name === enemyState.targetName) ?? ENEMY_TARGETS[0];
    const armorStripped = enemyState.heatProc ? 1 - (1 - enemyState.armorStripped) * 0.5 : enemyState.armorStripped;
    const result = calcEhp(e.baseHealth, e.baseShields, e.baseArmor, enemyState.level, armorStripped, enemyState.corrosiveStacks);
    return result;
  }, [enemyState]);

  const enemyDef = ENEMY_TARGETS.find(t => t.name === enemyState.targetName) ?? ENEMY_TARGETS[0];

  return (
    <div className="dps-calculator-panel">
      <div className="section-topline"><span>DPS Calculator</span><small>offline build calc</small></div>
      
      {/* Active Conditions - collapsible */}
      <div className="active-conditions-panel">
        <div className="active-conditions-header">
          <div className="active-conditions-title">
            Active Conditions
            {activeStatuses > 0 || isAiming || conditionalTriggers.galvanizedStacks > 0 || enemyEnabled ? (
              <span className="active-conditions-dot" style={{ color: 'var(--wf-green-ui)' }}>●</span>
            ) : (
              <span className="active-conditions-dot" style={{ color: 'var(--wf-gray-muted)' }}>○</span>
            )}
          </div>
          <button onClick={() => setShowConditions(!showConditions)}
            className="active-conditions-button">
            {showConditions ? '▲ Less' : '▼ More'}
          </button>
        </div>
        <div className="active-conditions-grid">
          <div className="active-conditions-col">
            <label className="active-conditions-label">Target Faction</label>
            <select className="dex-select active-conditions-select" value={targetFaction} onChange={e => setTargetFaction(e.target.value)}>
              <option value="">None</option>
              <option value="Grineer">Grineer</option>
              <option value="Corpus">Corpus</option>
              <option value="Infested">Infested</option>
              <option value="Orokin">Orokin</option>
              <option value="Murmur">Murmur</option>
              <option value="Sentients">Sentients</option>
            </select>
          </div>
          <div className="active-conditions-aim">
            <input type="checkbox" id="cond-aiming" checked={isAiming} onChange={e => setIsAiming(e.target.checked)} className="active-conditions-aim-checkbox" />
            <label htmlFor="cond-aiming" className="active-conditions-aim-label">Aiming</label>
          </div>
          <div className="active-conditions-status">
            <label className="active-conditions-label">Status Types</label>
            <input type="number" min="0" max="16" className="active-conditions-status-input" value={activeStatuses} onChange={e => setActiveStatuses(Math.max(0, Math.min(16, +e.target.value)))} />
          </div>
        </div>

        {/* Conditional Triggers (collapsible) */}
        {showConditions && (
          <div className="conditional-triggers-panel">
            <div className="conditional-triggers-title">Conditional Mod Triggers</div>
            <div className="conditional-triggers-grid">
              {(Object.keys(DEFAULT_CONDITIONAL_TRIGGERS) as (keyof ConditionalTriggers)[])
                .filter(k => typeof DEFAULT_CONDITIONAL_TRIGGERS[k] === 'boolean')
                .map(key => {
                  const active = Boolean(conditionalTriggers[key]);
                  const triggerStyle = {
                    color: active ? 'var(--wf-green-ui)' : 'var(--wf-gray-muted)',
                    background: active ? 'var(--wf-green-ui)10' : 'transparent',
                    border: `1px solid ${active ? 'var(--wf-green-ui)40' : 'var(--wf-border-dark)'}`,
                  };

                  return (
                    <label
                      key={key}
                      className={`conditional-trigger-item${active ? ' active' : ''}`}
                      style={triggerStyle}
                    >
                      <input
                        type="checkbox"
                        checked={conditionalTriggers[key] as boolean}
                        onChange={e => setConditionalTriggers({ ...conditionalTriggers, [key]: e.target.checked })}
                        className="conditional-trigger-checkbox"
                      />
                    {TRIGGER_LABELS[key]}
                  </label>
                  );
                })}
            </div>
            <div className="conditional-triggers-number-row">
              {(['galvanizedStacks', 'primaryDecrees', 'comboTier'] as (keyof ConditionalTriggers)[]).map(key => (
                <div key={key} className="conditional-triggers-number-item">
                  <label className="conditional-triggers-number-label">{TRIGGER_LABELS[key]}</label>
                   <input type="number" min="0" max={key === 'comboTier' ? 4 : 12} value={conditionalTriggers[key] as number} onChange={e => setConditionalTriggers({ ...conditionalTriggers, [key]: +e.target.value })}
                    className="conditional-triggers-number-input" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enemy Lab toggle */}
      <div className="enemy-lab-panel">
        <div className="enemy-lab-header">
          <label className="enemy-lab-apply-label" style={{ color: enemyEnabled ? 'var(--wf-green-ui)' : 'var(--wf-gray-muted)' }}>
            <input type="checkbox" checked={enemyEnabled} onChange={e => setEnemyEnabled(e.target.checked)} className="enemy-lab-checkbox" />
            Apply vs Enemy
          </label>
          {enemyEnabled && result?.enemy && (
            <span className="enemy-lab-info">→ DPS now factors armor DR + type mods + TTK</span>
          )}
        </div>
        <button onClick={() => setShowEnemyLab(!showEnemyLab)} className="enemy-lab-toggle" style={{
          border: `1px solid ${showEnemyLab ? 'var(--wf-gold-accent)60' : 'var(--wf-border-dark)'}`,
          color: showEnemyLab ? 'var(--wf-gold-accent)' : 'var(--wf-gray-muted)',
        }}>
          <span>🎯 Enemy Lab</span>
          <span>{showEnemyLab ? '▲' : '▼'}</span>
        </button>
        {showEnemyLab && (
          <div className="enemy-lab-content">
            <div className="enemy-lab-row">
              <label className="enemy-lab-label">Target</label>
              <select className="dex-select enemy-lab-select" value={enemyState.targetName}
                onChange={e => setEnemyState({ ...enemyState, targetName: e.target.value })}>
                {ENEMY_TARGETS.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="enemy-lab-row">
              <label className="enemy-lab-label">Level</label>
              <input type="range" min="1" max="999" value={enemyState.level}
                onChange={e => setEnemyState({ ...enemyState, level: +e.target.value })}
                className="enemy-lab-range" />
              <span className="enemy-lab-value">{enemyState.level}</span>
            </div>
            <div className="enemy-lab-row">
              <label className="enemy-lab-label">Armor Strip</label>
              <input type="range" min="0" max="100" value={enemyState.armorStripped * 100}
                onChange={e => setEnemyState({ ...enemyState, armorStripped: +e.target.value / 100 })}
                className="enemy-lab-range" />
              <span className="enemy-lab-value-gold">{Math.round(enemyState.armorStripped * 100)}%</span>
            </div>
            <div className="enemy-lab-row">
              <label className="enemy-lab-label">Corrosive</label>
              <input type="number" min="0" max="10" value={enemyState.corrosiveStacks}
                onChange={e => setEnemyState({ ...enemyState, corrosiveStacks: +e.target.value })}
                className="enemy-lab-number-input" style={{ color: 'var(--wf-green)' }} />
              <label className="enemy-lab-label heat-proc">Heat Proc</label>
              <input type="checkbox" checked={enemyState.heatProc} onChange={e => setEnemyState({ ...enemyState, heatProc: e.target.checked })} className="enemy-lab-checkbox" />
              <label className="enemy-lab-label" style={{ marginLeft: 8 }}>Electric</label>
              <input type="number" min="0" max="10" value={enemyState.electricStacks ?? 0}
                onChange={e => setEnemyState({ ...enemyState, electricStacks: +e.target.value })}
                className="enemy-lab-number-input" style={{ color: 'var(--wf-blue)' }} />
            </div>
            <div className="enemy-lab-row">
              <label className="enemy-lab-label">Targets</label>
              <input type="number" min="1" max="20" value={enemyState.multiTarget}
                onChange={e => setEnemyState({ ...enemyState, multiTarget: +e.target.value })}
                className="enemy-lab-number-input" />
            </div>
            {/* EHP Display */}
            <div className="enemy-lab-ehp">
              <span className="enemy-lab-ehp-hp">HP: {Math.round(enemyEhp.health).toLocaleString()}</span>
              <span className="enemy-lab-ehp-shield">Shield: {Math.round(enemyEhp.shields).toLocaleString()}</span>
              <span className="enemy-lab-ehp-armor">Armor: {Math.round(enemyEhp.armor).toLocaleString()} ({Math.round(enemyEhp.dr * 100)}% DR)</span>
              <span className="enemy-lab-ehp-total">EHP: {enemyEhp.ehp.toLocaleString()}</span>
            </div>
            {/* Weakness / Resistance */}
            <div className="enemy-lab-weakness">
              {enemyDef.weakness.length > 0 && (
                <div className="enemy-lab-weak">Weak: {enemyDef.weakness.join(', ')}</div>
              )}
              {enemyDef.resistance.length > 0 && (
                <div className="enemy-lab-resist">Resists: {enemyDef.resistance.join(', ')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <StatsHUD result={result} activeSlot={activeSlot} curWeapon={curWeapon}
                primerSlot={primerSlot} weaponStates={weaponStates}
                resultWeapons={result?.weapons} enemyMultiTarget={enemyState.multiTarget} enemyEnabled={enemyEnabled} />
    </div>
  );
}
