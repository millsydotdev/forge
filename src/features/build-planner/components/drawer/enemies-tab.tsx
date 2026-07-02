import React, { useMemo, useState } from 'react';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import { ENEMY_TARGETS, calcEhp } from '../../../../engine/enemy-simulator';
import { AssetImage } from '../../../../components/ui/AssetImage';
import { RichTooltip } from '../../../../components/ui/RichTooltip';

export function EnemiesTab({ state, result }: { state: BuildPlannerStoreState; result?: any }) {
  const { enemyState, setEnemyState, enemyEnabled, setEnemyEnabled } = state;
  const [search, setSearch] = useState('');
  const [factionFilter, setFactionFilter] = useState('');

  const update = (patch: Partial<typeof enemyState>) => setEnemyState({ ...enemyState, ...patch });

  const factions = useMemo(() => {
    const set = new Set<string>();
    ENEMY_TARGETS.forEach(e => set.add(e.faction));
    return [...set].sort();
  }, []);

  const filteredTargets = useMemo(() => {
    let list = ENEMY_TARGETS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    if (factionFilter) {
      list = list.filter(e => e.faction === factionFilter);
    }
    return list;
  }, [search, factionFilter]);

  const enemyDef = filteredTargets.find(t => t.name === enemyState.targetName)
    ?? ENEMY_TARGETS.find(t => t.name === enemyState.targetName)
    ?? ENEMY_TARGETS[0];

  const enemyEhp = useMemo(() => {
    if (!enemyEnabled) return null;
    const e = ENEMY_TARGETS.find(t => t.name === enemyState.targetName) ?? ENEMY_TARGETS[0];
    const armorStripped = enemyState.heatProc ? 1 - (1 - enemyState.armorStripped) * 0.5 : enemyState.armorStripped;
    return calcEhp(e.baseHealth, e.baseShields, e.baseArmor, enemyState.level, armorStripped, enemyState.corrosiveStacks);
  }, [enemyState, enemyEnabled]);

  const weaponDmg = result?.weapons?.[state.activeSlot]?.enemyDamage;

  return (
    <div className="drawer-tab-content drawer-enemy" style={{ padding: 'var(--pad)' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, color: 'var(--wf-text-dim)', cursor: 'pointer' }}>
        <input type="checkbox" checked={enemyEnabled} onChange={() => setEnemyEnabled(!enemyEnabled)} style={{ accentColor: 'var(--wf-teal)' }} />
        <span style={{ fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase', color: enemyEnabled ? 'var(--wf-teal)' : 'var(--wf-text-dim)' }}>
          Enemy Lab
        </span>
        <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', marginLeft: 'auto' }}>{ENEMY_TARGETS.length} enemies</span>
      </label>

      {enemyEnabled && (
        <>
          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <input
              type="text"
              className="wb-bottom__search"
              placeholder="Search enemies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'var(--wf-panel)', border: '1px solid var(--wf-border)', color: 'var(--wf-text)', fontSize: 11, padding: '3px 6px', borderRadius: 3, outline: 'none' }}
            />
            <select
              className="wb-bottom__search"
              value={factionFilter}
              onChange={e => setFactionFilter(e.target.value)}
              style={{ width: 90, background: 'var(--wf-panel)', border: '1px solid var(--wf-border)', color: 'var(--wf-text)', fontSize: 10, padding: '2px 4px', borderRadius: 3, outline: 'none' }}
            >
              <option value="">All</option>
              {factions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Enemy Selector (filtered) */}
          <div className="enemy-field" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 2, display: 'block' }}>TARGET</span>
            <select className="wb-bottom__search" value={enemyState.targetName}
              onChange={e => update({ targetName: e.target.value })} style={{ width: '100%' }}>
              {filteredTargets.length === 0 && <option value="">— No matches —</option>}
              {filteredTargets.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
            {search && filteredTargets.length > 0 && (
              <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', marginTop: 2, display: 'block' }}>
                {filteredTargets.length} of {ENEMY_TARGETS.length} enemies
              </span>
            )}
          </div>

          {/* Enemy Render + Faction Banner */}
          {enemyDef && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 4, overflow: 'hidden', background: 'var(--wf-panel)', flexShrink: 0 }}>
                <AssetImage
                  imageName={enemyDef.name?.toLowerCase().replace(/ /g, '-') + '.png'}
                  className=""
                  alt={enemyDef.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--wf-text)', fontWeight: 600 }}>{enemyDef.name}</div>
                <div style={{ fontSize: 10, color: 'var(--wf-text-muted)' }}>{enemyDef.faction}</div>
              </div>
              <div style={{
                padding: '2px 8px', borderRadius: 3, fontSize: 10, fontWeight: 600,
                background: enemyDef.faction === 'Grineer' ? 'rgba(160,96,64,0.2)' : enemyDef.faction === 'Corpus' ? 'rgba(96,128,192,0.2)' : enemyDef.faction === 'Infested' ? 'rgba(96,176,96,0.2)' : enemyDef.faction === 'Sentient' ? 'rgba(192,96,192,0.2)' : 'var(--wf-panel)',
                color: enemyDef.faction === 'Grineer' ? '#a06040' : enemyDef.faction === 'Corpus' ? '#6080c0' : enemyDef.faction === 'Infested' ? '#60b060' : enemyDef.faction === 'Sentient' ? '#c060c0' : 'var(--wf-text-dim)',
              }}>
                {enemyDef.faction}
              </div>
            </div>
          )}

          {/* Level + Controls */}
          <div className="enemy-field" style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--wf-text-muted)' }}>
              <span>Level</span>
              <span>{enemyState.level}</span>
            </div>
            <input type="range" min={1} max={9999} value={enemyState.level} onChange={e => update({ level: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--wf-teal)', height: 4 }} />
          </div>

          {/* Enemy Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
            {enemyEhp && (
              <>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>HEALTH</span>
                  <span style={{ fontSize: 11, color: 'var(--wf-text)', fontFamily: 'var(--font-mono)' }}>{enemyEhp.health.toFixed(0)}</span>
                </div>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>SHIELDS</span>
                  <span style={{ fontSize: 11, color: 'var(--wf-blue)', fontFamily: 'var(--font-mono)' }}>{enemyEhp.shields.toFixed(0)}</span>
                </div>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>ARMOR</span>
                  <span style={{ fontSize: 11, color: 'var(--wf-orange)', fontFamily: 'var(--font-mono)' }}>{enemyEhp.armor.toFixed(0)}</span>
                </div>
              </>
            )}
          </div>
          {enemyEhp && (
            <RichTooltip
              tooltip={{
                title: enemyDef.name,
                subtitle: `${enemyDef.faction} · Level ${enemyState.level}`,
                sections: [
                  { label: 'Health', value: enemyEhp.health.toFixed(0) },
                  { label: 'Shields', value: enemyEhp.shields.toFixed(0) },
                  { label: 'Armor', value: enemyEhp.armor.toFixed(0) },
                  { label: 'DR', value: (enemyEhp.dr * 100).toFixed(1) + '%' },
                  { label: 'EHP', value: enemyEhp.ehp.toLocaleString(), color: 'var(--wf-gold)' },
                ],
              }}
            >
            <div className="enemy-stat-card" style={{ marginBottom: 6, cursor: 'pointer' }}>
              <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>EFFECTIVE HP</span>
              <span style={{ fontSize: 14, color: 'var(--wf-gold)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{enemyEhp.ehp.toLocaleString()}</span>
              <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', marginLeft: 6 }}>DR: {(enemyEhp.dr * 100).toFixed(1)}%</span>
            </div>
            </RichTooltip>
          )}

          {/* Enemy Type Badges */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
            {enemyDef.healthType && <span className="enemy-badge">{enemyDef.healthType}</span>}
            {enemyDef.armorType && enemyDef.armorType !== 'None' && <span className="enemy-badge">{enemyDef.armorType}</span>}
            {enemyDef.shieldType && enemyDef.shieldType !== 'None' && <span className="enemy-badge">{enemyDef.shieldType}</span>}
            {enemyDef.faction && <span className="enemy-badge enemy-badge--faction">{enemyDef.faction}</span>}
          </div>

          {/* Weakness / Resistance / Immune */}
          <div style={{ marginBottom: 6 }}>
            {enemyDef.weakness.length > 0 && (
              <div style={{ marginBottom: 2 }}>
                <span style={{ fontSize: 9, color: 'var(--wf-green)', textTransform: 'uppercase', letterSpacing: 1 }}>Weak</span>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                  {enemyDef.weakness.map(w => <span key={w} className="enemy-badge enemy-badge--weak">{w}</span>)}
                </div>
              </div>
            )}
            {enemyDef.resistance.length > 0 && (
              <div style={{ marginBottom: 2 }}>
                <span style={{ fontSize: 9, color: 'var(--wf-orange)', textTransform: 'uppercase', letterSpacing: 1 }}>Resist</span>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                  {enemyDef.resistance.map(r => <span key={r} className="enemy-badge enemy-badge--resist">{r}</span>)}
                </div>
              </div>
            )}
            {enemyDef.immune.length > 0 && (
              <div>
                <span style={{ fontSize: 9, color: 'var(--wf-red)', textTransform: 'uppercase', letterSpacing: 1 }}>Immune</span>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                  {enemyDef.immune.map(i => <span key={i} className="enemy-badge enemy-badge--immune">{i}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Armor Strip Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block', marginBottom: 2 }}>ARMOR STRIP</span>
              <select className="wb-bottom__search" value={enemyState.armorStripped}
                onChange={e => update({ armorStripped: parseFloat(e.target.value) })} style={{ width: '100%' }}>
                {[0, 0.18, 0.25, 0.33, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9, 1].map(v => (
                  <option key={v} value={v}>{(v * 100).toFixed(0)}%</option>
                ))}
              </select>
            </div>
            <div>
              <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block', marginBottom: 2 }}>CORROSIVE</span>
              <select className="wb-bottom__search" value={enemyState.corrosiveStacks}
                onChange={e => update({ corrosiveStacks: parseInt(e.target.value) })} style={{ width: '100%' }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                  <option key={v} value={v}>{v}{v === 10 ? ' (max)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Heat Proc */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--wf-text-dim)', marginBottom: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={enemyState.heatProc} onChange={e => update({ heatProc: e.target.checked })} style={{ accentColor: 'var(--wf-teal)' }} />
            Heat Proc (-50% armor)
          </label>

          {/* Multi-target */}
          <div className="enemy-field" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', marginBottom: 2, display: 'block' }}>MULTI-TARGET</span>
            <select className="wb-bottom__search" value={enemyState.multiTarget}
              onChange={e => update({ multiTarget: parseInt(e.target.value) })} style={{ width: '100%' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v} enemy{ v > 1 ? 'ies' : 'y' }</option>)}
            </select>
          </div>

          {/* TTK / DPS Results */}
          {weaponDmg && (
            <div style={{ borderTop: '1px solid var(--wf-border)', paddingTop: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--wf-text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>TTK Analysis</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>SHOTS</span>
                  <span style={{ fontSize: 12, color: 'var(--wf-text)', fontFamily: 'var(--font-mono)' }}>{weaponDmg.shotsToKill}</span>
                </div>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>TTK</span>
                  <span style={{ fontSize: 12, color: 'var(--wf-gold)', fontFamily: 'var(--font-mono)' }}>{weaponDmg.timeToKill.toFixed(2)}s</span>
                </div>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>SUSTAINED</span>
                  <span style={{ fontSize: 12, color: 'var(--wf-gold)', fontFamily: 'var(--font-mono)' }}>{weaponDmg.sustainedTimeToKill.toFixed(2)}s</span>
                </div>
                <div className="enemy-stat-card">
                  <span style={{ fontSize: 9, color: 'var(--wf-text-muted)', display: 'block' }}>EFF DPS</span>
                  <span style={{ fontSize: 12, color: 'var(--wf-teal)', fontFamily: 'var(--font-mono)' }}>{(weaponDmg.effectiveDps / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
