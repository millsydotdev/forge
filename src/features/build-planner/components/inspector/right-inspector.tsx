import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUiStore } from '../../../../store/uiStore';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import type { CalcBreakdown } from '../../../../engine/calc-breakdown';
import { AbilityPanel } from '../ability-panel';
import { ArcanePanel } from '../arcane-panel';
import { HelminthPanel } from '../helminth-panel';
import { ShardPanel } from '../shard-panel';
import { BuffsPanel } from '../buffs-panel';
import { useBuildCompletion } from '../../hooks/useBuildCompletion';
import { PrimerPanel } from '../primer-panel';
import { SetBonusPanel } from '../set-bonus-panel';
import { useBuildStore } from '../../../../store/buildStore';
import { BuildHealthPanel } from '../build-health-panel';
import { WhyTree } from '../why-tree';
import { BuildOptimizer } from '../build-optimizer';
import { DpsCalculatorPanel } from '../dps-calculator-panel';
import { Collapsible, Button, TextArea } from '../../../../components/ui';
import { IdleInspector } from './idle-inspector';
import { ConditionalsPanel } from './conditionals-panel';

export function RightInspector({ state, onHelminthChange, onShardChange, onShardTauToggle, enrichMod }: {
  state: BuildPlannerStoreState;
  onHelminthChange: (h: any) => void;
  onShardChange: (i: number, c: any) => void;
  onShardTauToggle: (i: number, t: boolean) => void;
  enrichMod: (m: any) => Promise<any>;
}) {
  const { inspectorCollapsed, toggleInspector, inspectorMode, inspectorSelection, setInspectorMode } = useUiStore(useShallow(s => ({
    inspectorCollapsed: s.inspectorCollapsed, toggleInspector: s.toggleInspector,
    inspectorMode: s.inspectorMode, inspectorSelection: s.inspectorSelection, setInspectorMode: s.setInspectorMode,
  })));

  const {
    result, activeSlot, wf, weaponStates, setWeaponStates, setWf,
    helminth, allFrames, allArcanes, buffs, setBuffs, primerSlot,
    buildNotes, setBuildNotes, frameDetail,
    conditionalTriggers,
  } = state;

  const isFrame = activeSlot === 'warframe';
  const isWeapon = ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee', 'exalted_weapon'].includes(activeSlot);
  const singleArcaneSlots = ['primary', 'secondary', 'melee'].includes(activeSlot);

  const primerCandidates = useMemo(() => {
    const list: { slot: string; label: string; weaponName: string }[] = [];
    for (const slot of ['primary', 'secondary', 'melee'] as const) {
      const ws = weaponStates[slot];
      if (!ws?.id) continue;
      list.push({ slot, label: slot, weaponName: '' });
    }
    return list;
  }, [weaponStates]);

  if (inspectorCollapsed) {
    return (
      <aside className="wb-right" style={{ minWidth: 32, width: 32 }}>
        <div className="wb-right__header" style={{ padding: '4px', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" onClick={toggleInspector} title="Expand inspector" aria-label="Expand inspector">◂</Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="wb-right" role="complementary" aria-label="Build inspector">
      <div className="wb-right__header">
        <span style={{ flex: 1 }}>Inspector</span>
        <button className="wb-right__mode" onClick={toggleInspector} title="Collapse inspector" type="button" aria-label="Collapse inspector">▸</button>
        <button className={`wb-right__mode${inspectorMode === 'idle' ? ' wb-right__mode--active' : ''}`}
          onClick={() => setInspectorMode('idle', null)} type="button">Stats</button>
        <button className={`wb-right__mode${inspectorMode === 'tool' && inspectorSelection === 'optimizer' ? ' wb-right__mode--active' : ''}`}
          onClick={() => setInspectorMode('tool', 'optimizer')} type="button">Optimize</button>
        <button className={`wb-right__mode${inspectorMode === 'tool' && inspectorSelection === 'dps' ? ' wb-right__mode--active' : ''}`}
          onClick={() => setInspectorMode('tool', 'dps')} type="button">DPS</button>
      </div>

      <div className="wb-right__body">
        {inspectorMode === 'stat' && inspectorSelection ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setInspectorMode('idle', null)} style={{ marginBottom: 6 }}>
              ← Back to Stats
            </Button>
            <WhyTree
              breakdown={(inspectorSelection as any)?.breakdown as CalcBreakdown | undefined}
              statName={(inspectorSelection as any)?.label || 'Stat'}
            />
          </>
        ) : (
          <>
            <BuildHealthPanel state={state} />

            {/* Build Completion */}
            <BuildCompletionSection />

            {inspectorMode === 'idle' && <IdleInspector state={state} />}
            {inspectorMode === 'mod' && (
              <div className="inspector-mod" style={{ padding: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--wf-text)', fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>
                  {(inspectorSelection as any)?.name || 'Unknown Mod'}
                </div>
              </div>
            )}
            {inspectorMode === 'weapon' && (
              <div className="inspector-weapon" style={{ padding: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--wf-text)', fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>
                  {(inspectorSelection as any)?.name || 'Unknown Weapon'}
                </div>
              </div>
            )}
            {inspectorMode === 'tool' && inspectorSelection === 'dps' && (
              <DpsCalculatorPanel
                result={result}
                activeSlot={activeSlot}
                curWeapon={isWeapon ? state.curWeapon : null}
                primerSlot={primerSlot}
                weaponStates={weaponStates}
                targetFaction={state.targetFaction}
                setTargetFaction={state.setTargetFaction}
                isAiming={state.isAiming}
                setIsAiming={state.setIsAiming}
                activeStatuses={state.activeStatuses}
                setActiveStatuses={state.setActiveStatuses}
                conditionalTriggers={conditionalTriggers}
                setConditionalTriggers={(val) => state.setConditionalTriggers(val)}
                enemyState={state.enemyState}
                setEnemyState={(val) => state.setEnemyState(val)}
                enemyEnabled={state.enemyEnabled}
                setEnemyEnabled={(val) => state.setEnemyEnabled(val)}
              />
            )}
            {inspectorMode === 'tool' && inspectorSelection === 'optimizer' && (() => {
              const isWeaponSlot = ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee'].includes(activeSlot);
              const ws = isWeaponSlot ? weaponStates[activeSlot] : null;
              const mods = activeSlot === 'warframe' ? wf.mods : (ws?.mods ?? []);
              const capPct = state.wfCapacity ? Math.round((state.wfCapacity.used / state.wfCapacity.total) * 100) : 0;
              return (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', letterSpacing: 1, color: 'var(--wf-text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Suggestions
                  </div>
                  <BuildOptimizer mods={mods} allMods={state.allMods} slot={activeSlot} capacityPct={capPct} />
                </div>
              );
            })()}
          </>
        )}

        {inspectorMode !== 'stat' && (
          <>
            <Collapsible label="Conditionals">
              <ConditionalsPanel state={state} />
            </Collapsible>

            {isFrame && (
              <>
                <Collapsible label="Arcanes">
                  <ArcanePanel
                    arcanes={wf.arcanes}
                    arcanePool={allArcanes}
                    onSelect={async (idx, m) => {
                      const e = await enrichMod(m);
                      if (!e) return;
                      setWf(p => ({ ...p, arcanes: idx === 0 ? [e, p.arcanes[1]] : [p.arcanes[0], e] }));
                    }}
                    onRemove={(idx) => setWf(p => ({ ...p, arcanes: idx === 0 ? [null, p.arcanes[1]] : [p.arcanes[0], null] as any }))}
                    slots={2}
                  />
                </Collapsible>

                <Collapsible label="Shards">
                  <ShardPanel
                    shards={wf.shards}
                    onChange={onShardChange}
                    onTauToggle={onShardTauToggle}
                  />
                </Collapsible>

                <Collapsible label="Helminth">
                  <HelminthPanel
                    helminth={helminth}
                    allFrames={allFrames}
                    onToggle={() => onHelminthChange({ ...helminth, enabled: !helminth.enabled })}
                    onDonorChange={(id) => onHelminthChange({ ...helminth, donorId: id })}
                    onSlotChange={(s) => onHelminthChange({ ...helminth, slotIndex: s })}
                  />
                </Collapsible>

                <Collapsible label="Abilities" defaultOpen={false}>
                  <AbilityPanel
                    frame={frameDetail}
                    result={result}
                    helminth={helminth}
                  />
                </Collapsible>
              </>
            )}

            {isWeapon && singleArcaneSlots && (
              <Collapsible label="Arcane">
                <ArcanePanel
                  arcanes={weaponStates[activeSlot]?.arcanes ?? [null, null] as any}
                  arcanePool={allArcanes}
                  onSelect={async (idx, m) => {
                    const e = await enrichMod(m);
                    if (!e) return;
                    setWeaponStates(p => {
                      const existing = p[activeSlot];
                      if (!existing) return p;
                      const newArcanes: any = [...existing.arcanes];
                      newArcanes[idx] = e;
                      return { ...p, [activeSlot]: { ...existing, arcanes: newArcanes } };
                    });
                  }}
                  onRemove={(idx) => setWeaponStates(p => {
                    const existing = p[activeSlot];
                    if (!existing) return p;
                    const newArcanes: any = [...existing.arcanes];
                    newArcanes[idx] = null;
                    return { ...p, [activeSlot]: { ...existing, arcanes: newArcanes } };
                  })}
                  slots={1}
                />
              </Collapsible>
            )}

            <Collapsible label="Squad Buffs" defaultOpen={false}>
              <BuffsPanel buffs={buffs} onChange={setBuffs} />
            </Collapsible>

            <Collapsible label="Primer" defaultOpen={false}>
              <PrimerPanel
                primerSlot={primerSlot}
                candidates={primerCandidates}
                primerStats={result?.weapons?.[primerSlot ?? '']}
                onSetPrimer={(s) => { useBuildStore.getState().setPrimerSlot(s); }}
              />
            </Collapsible>

            {result?.setBonuses && result.setBonuses.length > 0 && (
              <Collapsible label="Set Bonuses" defaultOpen={false}>
                <SetBonusPanel setBonuses={result.setBonuses} />
              </Collapsible>
            )}

            {state.operatorStats && (
              <Collapsible label="Operator Stats" defaultOpen={false}>
                <OperatorStatsGrid operatorStats={state.operatorStats} />
              </Collapsible>
            )}

            <Collapsible label="Build Notes" defaultOpen={false}>
              <TextArea
                value={buildNotes}
                onChange={e => setBuildNotes(e.target.value)}
                placeholder="Notes about this build…"
                rows={4}
                aria-label="Build notes"
              />
            </Collapsible>
          </>
        )}
      </div>
    </aside>
  );
}

function OperatorStatsGrid({ operatorStats }: { operatorStats: { health: number; shield: number; armor: number; energy: number; sprintSpeed: number; effectiveHealth: number; abilityStrength: number; abilityDuration: number; abilityRange: number } }) {
  const rows = [
    { label: 'Health', value: Math.round(operatorStats.health).toLocaleString(), color: 'var(--wf-teal)' },
    { label: 'Shields', value: Math.round(operatorStats.shield).toLocaleString(), color: 'var(--wf-blue)' },
    { label: 'Armor', value: Math.round(operatorStats.armor).toLocaleString(), color: 'var(--wf-gold)' },
    { label: 'Energy', value: Math.round(operatorStats.energy).toLocaleString(), color: 'var(--wf-blue)' },
    { label: 'Sprint', value: operatorStats.sprintSpeed.toFixed(2), color: 'var(--wf-text)' },
    { label: 'Eff. Health', value: Math.round(operatorStats.effectiveHealth).toLocaleString(), color: 'var(--wf-red)' },
    { label: 'Strength', value: `+${Math.round(operatorStats.abilityStrength * 100)}%`, color: 'var(--wf-teal)' },
    { label: 'Duration', value: `+${Math.round(operatorStats.abilityDuration * 100)}%`, color: 'var(--wf-teal)' },
    { label: 'Range', value: `+${Math.round(operatorStats.abilityRange * 100)}%`, color: 'var(--wf-teal)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: '4px 0' }}>
      {rows.map(r => (
        <React.Fragment key={r.label}>
          <div style={{ fontSize: 11, color: 'var(--wf-text-dim)' }}>{r.label}</div>
          <div style={{ fontSize: 11, color: r.color, textAlign: 'right' }}>{r.value}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Build Completion section — shows what % of the build is owned and what's missing */
function BuildCompletionSection() {
  const completion = useBuildCompletion();

  if (!completion) return null;

  const barColor = completion.percentComplete >= 100 ? 'var(--wf-green)'
    : completion.percentComplete >= 80 ? 'var(--wf-gold)'
    : completion.percentComplete >= 50 ? 'var(--wf-orange)'
    : 'var(--wf-red)';

  return (
    <div className="loadout-section" style={{ marginBottom: 8 }}>
      <div className="section-topline">
        <span>Build Completion</span>
        <span style={{ color: barColor, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          {completion.percentComplete}%
        </span>
      </div>
      <div style={{
        height: 4, background: 'var(--wf-panel)', borderRadius: 2, overflow: 'hidden', marginBottom: 6,
      }}>
        <div style={{
          width: `${completion.percentComplete}%`, height: '100%',
          background: barColor, borderRadius: 2,
          transition: 'width 300ms ease-out',
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 4 }}>
        {completion.completed}/{completion.total} items owned
      </div>
      {completion.missing.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 9, color: 'var(--wf-orange)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
            Missing ({completion.missing.length})
          </div>
          {completion.missing.slice(0, 10).map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '2px 4px',
              fontSize: 10, background: 'var(--wf-panel)', borderRadius: 2,
            }}>
              <span style={{ color: 'var(--wf-text-dim)' }}>{item.name}</span>
              <span style={{ color: 'var(--wf-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                {item.type}
              </span>
            </div>
          ))}
          {completion.missing.length > 10 && (
            <div style={{ fontSize: 9, color: 'var(--wf-text-muted)', textAlign: 'center', marginTop: 2 }}>
              +{completion.missing.length - 10} more items
            </div>
          )}
        </div>
      )}
      {completion.percentComplete >= 100 && (
        <div style={{ fontSize: 10, color: 'var(--wf-green)', textAlign: 'center', marginTop: 4 }}>
          ✓ All items owned
        </div>
      )}
    </div>
  );
}
