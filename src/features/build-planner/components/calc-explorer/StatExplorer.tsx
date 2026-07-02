import { useMemo, useState } from 'react';
import type { CalcBreakdown } from '../../../../engine/calc-breakdown';
import type { Modifier } from '../../../../engine/modifier';
import { useBuildStore } from '../../../../store/buildStore';

interface StatExplorerProps {
  statName: string;
  breakdown: CalcBreakdown | undefined;
  modifiers?: Modifier[];
  onClose: () => void;
}

const KB_LOOKUP: Record<string, { id: string; summary: string; confidence: string }> = {
  'health': { id: 'KB-002', summary: 'Health = baseHealth × healthMult + shardFlat', confidence: 'HIGH' },
  'shields': { id: 'KB-002', summary: 'Shields = baseShield × shieldMult + shardFlat', confidence: 'HIGH' },
  'armor': { id: 'KB-002', summary: 'Armor = baseArmor × armorMult + shardFlat', confidence: 'HIGH' },
  'energy': { id: 'KB-002', summary: 'Energy = baseEnergy × energyMult + shardFlat', confidence: 'HIGH' },
  'ehp': { id: 'KB-003', summary: 'EHP = health × (1 + armor / 300) + shields', confidence: 'HIGH' },
  'strength': { id: 'KB-004', summary: 'STR = base × (1 + sum of bonuses)', confidence: 'HIGH' },
  'duration': { id: 'KB-004', summary: 'DUR = base × (1 + sum of bonuses)', confidence: 'HIGH' },
  'range': { id: 'KB-004', summary: 'RNG = base × (1 + sum of bonuses)', confidence: 'HIGH' },
  'efficiency': { id: 'KB-005', summary: 'EFF = base × (1 + sum), capped at 175%', confidence: 'HIGH' },
  'crit_chance': { id: 'KB-012', summary: 'critChance = baseCrit × (mult + comboBonus)', confidence: 'HIGH' },
  'crit_damage': { id: 'KB-012', summary: 'critMultiplier = critDmgFlat × critDmgMult', confidence: 'HIGH' },
  'multishot': { id: 'KB-014', summary: 'multishot = flat × mult || 1', confidence: 'HIGH' },
  'fire_rate': { id: 'KB-015', summary: 'fireRate = flat × fireRateMult', confidence: 'HIGH' },
  'status_chance': { id: 'KB-016', summary: 'statusChance = flat × (mult + comboBonus)', confidence: 'HIGH' },
  'reload_speed': { id: 'KB-018', summary: 'reload = base / max(mult, 0.01)', confidence: 'HIGH' },
};

type Tab = 'breakdown' | 'pipeline' | 'timeline' | 'dependencies' | 'comparison';

export function StatExplorer({ statName, breakdown, modifiers, onClose }: StatExplorerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('breakdown');
  const [searchQuery, setSearchQuery] = useState('');

  const kbEntry = KB_LOOKUP[statName.toLowerCase()];

  const hasFlats = (breakdown?.flats.length ?? 0) > 0;
  const hasMults = (breakdown?.multipliers.length ?? 0) > 0;

  const sortedModifiers = useMemo(() => {
    if (!modifiers) return [];
    return [...modifiers].sort((a, b) => a.priority - b.priority);
  }, [modifiers]);

  const sourceTypeInfo = useMemo(() => {
    if (!modifiers) return [];
    const counts = new Map<string, { count: number; totalValue: number }>();
    for (const m of modifiers) {
      const st = m.sourceType ?? 'unknown';
      const existing = counts.get(st) ?? { count: 0, totalValue: 0 };
      existing.count++;
      existing.totalValue += m.value;
      counts.set(st, existing);
    }
    return [...counts.entries()];
  }, [modifiers]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'breakdown', label: 'Breakdown' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'dependencies', label: 'Dependencies' },
    { key: 'comparison', label: 'Comparison' },
  ];

  return (
    <div className="calc-explorer-overlay" onClick={onClose}>
      <div className="calc-explorer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="calc-explorer__header">
          <div>
            <div className="calc-explorer__title">{statName}</div>
            <div className="calc-explorer__subtitle">Calculation Explorer</div>
          </div>
          <div className="calc-explorer__search">
            <input
              type="text"
              className="calc-explorer__search-input"
              placeholder="Search stats, effects, KB IDs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="calc-explorer__close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="calc-explorer__tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`calc-explorer__tab ${activeTab === tab.key ? 'calc-explorer__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="calc-explorer__body">
          {activeTab === 'breakdown' && (
            <BreakdownTab
              breakdown={breakdown}
              hasFlats={hasFlats}
              hasMults={hasMults}
              kbEntry={kbEntry}
              sourceTypeInfo={sourceTypeInfo}
            />
          )}
          {activeTab === 'pipeline' && (
            <PipelineTab modifiers={sortedModifiers} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab
              breakdown={breakdown}
              hasFlats={hasFlats}
              hasMults={hasMults}
            />
          )}
          {activeTab === 'dependencies' && (
            <DependenciesTab statName={statName} />
          )}
          {activeTab === 'comparison' && (
            <ComparisonTab statName={statName} />
          )}
        </div>
      </div>
    </div>
  );
}

function BreakdownTab({ breakdown, hasFlats, hasMults, kbEntry, sourceTypeInfo }: {
  breakdown: CalcBreakdown | undefined;
  hasFlats: boolean;
  hasMults: boolean;
  kbEntry: { id: string; summary: string; confidence: string } | undefined;
  sourceTypeInfo: [string, { count: number; totalValue: number }][];
}) {
  if (!breakdown) {
    return (
      <div className="calc-explorer__empty">
        <div className="calc-explorer__empty-icon">📊</div>
        <div>No breakdown data available</div>
        <div className="calc-explorer__empty-hint">Select a stat with modifiers to see its calculation path</div>
      </div>
    );
  }

  return (
    <div className="calc-explorer__scroll">
      {/* KB Link */}
      {kbEntry && (
        <div className="calc-explorer__kb-card">
          <div className="calc-explorer__kb-id">{kbEntry.id}</div>
          <div className="calc-explorer__kb-summary">{kbEntry.summary}</div>
          <div className="calc-explorer__kb-confidence">Confidence: {kbEntry.confidence}</div>
        </div>
      )}

      {/* Source Type Summary */}
      {sourceTypeInfo.length > 0 && (
        <div className="calc-explorer__section">
          <div className="calc-explorer__section-title">CONTRIBUTING SOURCES</div>
          <div className="calc-explorer__source-grid">
            {sourceTypeInfo.map(([type, info]) => (
              <div key={type} className="calc-explorer__source-chip">
                <span className="calc-explorer__source-type">{type}</span>
                <span className="calc-explorer__source-count">{info.count} mods</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Breakdown */}
      <div className="calc-explorer__breakdown">
        {/* Base */}
        <div className="calc-explorer__step calc-explorer__step--base">
          <div className="calc-explorer__step-connector">①</div>
          <div className="calc-explorer__step-content">
            <div className="calc-explorer__step-label">BASE VALUE</div>
            <div className="calc-explorer__step-source">{breakdown.baseSource}</div>
            <div className="calc-explorer__step-value">{formatNum(breakdown.base)}</div>
          </div>
        </div>

        {/* Flats */}
        {hasFlats && (
          <div className="calc-explorer__step calc-explorer__step--flat">
            <div className="calc-explorer__step-connector">②</div>
            <div className="calc-explorer__step-content">
              <div className="calc-explorer__step-label">FLAT ADDITIONS</div>
              {breakdown.flats.map((f, i) => (
                <div key={i} className="calc-explorer__contribution">
                  <span className="calc-explorer__contribution-source" title={f.source}>{f.source}</span>
                  <span className="calc-explorer__contribution-value calc-explorer__contribution-value--flat">
                    +{formatNum(f.value)}
                  </span>
                </div>
              ))}
              <div className="calc-explorer__step-total">
                <span>Running Total</span>
                <span>{formatNum(breakdown.flatSum)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Multipliers */}
        {hasMults && (
          <div className="calc-explorer__step calc-explorer__step--mult">
            <div className="calc-explorer__step-connector">{hasFlats ? '③' : '②'}</div>
            <div className="calc-explorer__step-content">
              <div className="calc-explorer__step-label">MULTIPLIERS</div>
              {breakdown.multipliers.map((m, i) => (
                <div key={i} className="calc-explorer__contribution">
                  <span className="calc-explorer__contribution-source" title={m.source}>{m.source}</span>
                  <span className="calc-explorer__contribution-value calc-explorer__contribution-value--mult">
                    {(m.value >= 0 ? '+' : '')}{(m.value * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              <div className="calc-explorer__step-total">
                <span>Multiplier Total</span>
                <span>×{(1 + breakdown.multiplierSum).toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formula */}
        <div className="calc-explorer__formula">
          {breakdown.formula}
        </div>

        {/* Final */}
        <div className="calc-explorer__step calc-explorer__step--final">
          <div className="calc-explorer__step-connector">✓</div>
          <div className="calc-explorer__step-content">
            <div className="calc-explorer__step-label">FINAL VALUE</div>
            <div className="calc-explorer__final-value">{formatNum(breakdown.final)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineTab({ modifiers }: { modifiers: Modifier[] }) {
  if (modifiers.length === 0) {
    return <div className="calc-explorer__empty">No effects in pipeline for this stat.</div>;
  }

  return (
    <div className="calc-explorer__scroll">
      <div className="calc-explorer__section">
        <div className="calc-explorer__section-title">EFFECT PIPELINE ({modifiers.length} effects)</div>
        <div className="calc-explorer__pipeline">
          {modifiers.map((m, idx) => {
            const displayValue = m.category === 'FLAT'
              ? `+${formatNum(m.value)}`
              : `${m.value >= 0 ? '+' : ''}${(m.value * 100).toFixed(1)}%`;
            return (
              <div key={idx} className="calc-explorer__pipeline-item">
                <div className="calc-explorer__pipeline-order">#{idx + 1}</div>
                <div className="calc-explorer__pipeline-main">
                  <div className="calc-explorer__pipeline-source">
                    <span className="calc-explorer__pipeline-source-type">{m.sourceType ?? 'mod'}</span>
                    {m.source}
                  </div>
                  <div className="calc-explorer__pipeline-stat">{m.stat} = {displayValue}</div>
                  {m.kbRef && <div className="calc-explorer__pipeline-kb">KB: {m.kbRef}</div>}
                  {m.condition && (
                    <div className="calc-explorer__pipeline-condition">
                      Conditional: {m.condition.type}{m.condition.maxStacks ? ` (max ${m.condition.maxStacks} stacks)` : ''}
                    </div>
                  )}
                </div>
                <div className="calc-explorer__pipeline-priority">p{m.priority}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ breakdown, hasFlats, hasMults }: {
  breakdown: CalcBreakdown | undefined;
  hasFlats: boolean;
  hasMults: boolean;
}) {
  const steps: { name: string; detail: string }[] = [];
  if (breakdown) {
    steps.push({ name: 'Base', detail: `${breakdown.baseSource}: ${formatNum(breakdown.base)}` });
    if (hasFlats) steps.push({ name: 'Flat Bonuses', detail: `+${formatNum(breakdown.flatSum - breakdown.base)} total` });
    if (hasMults) steps.push({ name: 'Multipliers', detail: `×${(1 + breakdown.multiplierSum).toFixed(3)} total` });
    steps.push({ name: 'Conditional Effects', detail: 'Conditional triggers applied' });
    steps.push({ name: 'Mission Modifiers', detail: 'Faction, Steel Path, etc.' });
    steps.push({ name: 'Enemy Effects', detail: 'Damage type mods, armor, attenuation' });
    steps.push({ name: 'Final Value', detail: formatNum(breakdown.final) });
  }

  return (
    <div className="calc-explorer__scroll">
      <div className="calc-explorer__section">
        <div className="calc-explorer__section-title">RESOLVER TIMELINE</div>
        <div className="calc-explorer__timeline">
          {steps.map((step, idx) => (
            <div key={idx} className={`calc-explorer__timeline-step ${idx === steps.length - 1 ? 'calc-explorer__timeline-step--final' : ''}`}>
              <div className="calc-explorer__timeline-dot" />
              <div className="calc-explorer__timeline-content">
                <div className="calc-explorer__timeline-name">{step.name}</div>
                <div className="calc-explorer__timeline-detail">{step.detail}</div>
              </div>
              {idx < steps.length - 1 && <div className="calc-explorer__timeline-arrow">↓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DependenciesTab({ statName }: { statName: string }) {
  const deps: { stat: string; influence: string }[] = [];
  const s = statName.toLowerCase();

  // Define dependency chains
  if (s === 'ehp') {
    deps.push({ stat: 'Health', influence: 'Direct multiplier' });
    deps.push({ stat: 'Armor', influence: 'DR via (1 + armor/300)' });
    deps.push({ stat: 'Shields', influence: 'Direct addition' });
  } else if (s === 'strength') {
    deps.push({ stat: 'Ability Damage', influence: 'Scales linearly' });
    deps.push({ stat: 'Roar multiplier', influence: 'Faction damage scaling' });
  } else if (s === 'health') {
    deps.push({ stat: 'Vitality (mod)', influence: '+% health' });
    deps.push({ stat: 'Archon Shards', influence: 'Flat health addition' });
    deps.push({ stat: 'Warframe base', influence: 'Base health value' });
  } else if (s === 'crit_chance' || s === 'crit chance') {
    deps.push({ stat: 'Point Strike (mod)', influence: '+% crit chance' });
    deps.push({ stat: 'Blood Rush', influence: '+% per combo tier' });
    deps.push({ stat: 'Arcane Avenger', influence: 'Flat +45% crit' });
  } else if (s === 'burstdps' || s === 'sustaineddps' || s.endsWith('dps')) {
    deps.push({ stat: 'Total Damage', influence: 'Base × faction mult' });
    deps.push({ stat: 'Multishot', influence: 'Extra projectiles' });
    deps.push({ stat: 'Crit Factor', influence: '1 + cc × (cd - 1)' });
    deps.push({ stat: 'Fire Rate', influence: 'Shots per second' });
    deps.push({ stat: 'Magazine', influence: 'Cycle length' });
    deps.push({ stat: 'Reload Speed', influence: 'Cycle downtime' });
  } else {
    deps.push({ stat: 'Modifiers', influence: 'See Breakdown tab' });
  }

  return (
    <div className="calc-explorer__scroll">
      <div className="calc-explorer__section">
        <div className="calc-explorer__section-title">VALUE DEPENDENCIES</div>
        <div className="calc-explorer__section-subtitle">
          {statName} depends on:
        </div>
        <div className="calc-explorer__dep-graph">
          <div className="calc-explorer__dep-node calc-explorer__dep-node--target">{statName}</div>
          <div className="calc-explorer__dep-arrows">
            {deps.map((d, i) => (
              <div key={i} className="calc-explorer__dep-edge">
                <div className="calc-explorer__dep-arrow">↑</div>
                <div className="calc-explorer__dep-node calc-explorer__dep-node--source">
                  <div className="calc-explorer__dep-name">{d.stat}</div>
                  <div className="calc-explorer__dep-influence">{d.influence}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonTab({ statName }: { statName: string }) {
  const baseline = useBuildStore(s => s.result);
  const br = baseline?.breakdowns?.[statName as keyof typeof baseline.breakdowns] as CalcBreakdown | undefined;

  if (!br) {
    return (
      <div className="calc-explorer__empty">
        <div className="calc-explorer__empty-icon">📋</div>
        <div>No comparison data</div>
        <div className="calc-explorer__empty-hint">Save a build to compare against</div>
      </div>
    );
  }

  return (
    <div className="calc-explorer__scroll">
      <div className="calc-explorer__section">
        <div className="calc-explorer__section-title">WHAT CHANGED?</div>
        <div className="calc-explorer__cmp-card">
          <div className="calc-explorer__cmp-row">
            <span>Current Base</span>
            <span>{formatNum(br.base)}</span>
          </div>
          <div className="calc-explorer__cmp-row">
            <span>Flat Sum</span>
            <span>{formatNum(br.flatSum)}</span>
          </div>
          <div className="calc-explorer__cmp-row">
            <span>Multiplier Total</span>
            <span>×{(1 + br.multiplierSum).toFixed(3)}</span>
          </div>
          <div className="calc-explorer__cmp-divider" />
          <div className="calc-explorer__cmp-row calc-explorer__cmp-row--final">
            <span>Final</span>
            <span>{formatNum(br.final)}</span>
          </div>
        </div>
        <div className="calc-explorer__cmp-formula">{br.formula}</div>
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  if (Math.abs(n) >= 10) return n.toFixed(1);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(3);
}
