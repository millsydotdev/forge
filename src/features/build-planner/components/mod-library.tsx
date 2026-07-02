import React, { useMemo, useState } from 'react';
import { parsePolarity, POLARITY_COLOR, POLARITY_SYMBOL } from '../../../engine/polarity';
import { ALL_POLARITIES } from '../model';
import type { ItemOption } from '../model';
import { AssetImage } from '../../../components/ui/AssetImage';
import { RichTooltip } from '../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../components/ui/PresentationModel';
const POL_TABS: { key: string; sym: string }[] = [
  { key: 'ALL', sym: 'All' },
  ...ALL_POLARITIES.map(p => ({ key: p, sym: POLARITY_SYMBOL[p] })),
];
const CATEGORY_TABS = ['All', 'Warframe', 'Primary', 'Shotgun', 'Secondary', 'Melee', 'Stance', 'Companion', 'Arcane'];

const RARITY_ORDER: Record<string, number> = {
  Common: 0, Uncommon: 1, Rare: 2, Legendary: 3,
};

export function ModLibrary({
  allMods,
  activeSlot,
  ownedModIds,
  onSelect,
  onRefreshOwned,
  onAddRiven,
  collapsed,
  onToggleCollapse,
}: {
  allMods: ItemOption[];
  activeSlot: string;
  ownedModIds: Set<string> | null;
  onSelect: (m: ItemOption) => void;
  onRefreshOwned?: () => void;
  onAddRiven: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [polFilter, setPolFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('All');
  const [filterOwned, setFilterOwned] = useState<'all' | 'owned' | 'missing'>('all');

  const results = useMemo(() => {
    let list = allMods;
    if (catFilter !== 'All') {
      const cf = catFilter.toLowerCase();
      list = list.filter(m => (m.type ?? '').toLowerCase().includes(cf) || m.category.toLowerCase().includes(cf));
    }
    if (polFilter !== 'ALL') {
      list = list.filter(m => parsePolarity(m.polarity ?? 'universal') === polFilter);
    }
    if (filterOwned === 'owned' && ownedModIds) {
      list = list.filter(m => ownedModIds.has(m.uniqueName));
    } else if (filterOwned === 'missing' && ownedModIds) {
      list = list.filter(m => !ownedModIds.has(m.uniqueName));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => (RARITY_ORDER[b.rarity ?? ''] ?? 0) - (RARITY_ORDER[a.rarity ?? ''] ?? 0));
  }, [allMods, query, polFilter, catFilter, filterOwned, ownedModIds]);

  return (
    <div className={'mod-library' + (collapsed ? ' collapsed' : '')}>
      <div className="mod-library-header">
        {onToggleCollapse && (
          <button
            className="lib-tab"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand library' : 'Collapse library'}
            style={{ marginRight: 4 }}
          >
            {collapsed ? '▲' : '▼'}
          </button>
        )}
        <span className="mod-library-title">
          Mod Library
          <span style={{ color: 'var(--wf-text-muted)', fontWeight: 400 }}>— {activeSlot.replace(/_/g, ' ')}</span>
        </span>

        <input
          className="mod-library-search"
          type="text"
          placeholder="Search mods…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <div className="mod-library-tabs">
          {POL_TABS.map(t => (
            <button
              key={t.key}
              className={'lib-tab' + (polFilter === t.key ? ' active' : '')}
              onClick={() => setPolFilter(t.key)}
              style={t.key !== 'ALL' ? {
                color: polFilter === t.key ? POLARITY_COLOR[t.key as keyof typeof POLARITY_COLOR] : undefined,
                borderColor: polFilter === t.key ? POLARITY_COLOR[t.key as keyof typeof POLARITY_COLOR] : undefined,
              } : {}}
            >
              {t.sym}
            </button>
          ))}
        </div>

        <div className="mod-library-tabs">
          {(['all', 'owned', 'missing'] as const).map(f => (
            <button
              key={f}
              className={'lib-tab' + (filterOwned === f ? ' active' : '')}
              onClick={() => setFilterOwned(f)}
            >
              {f === 'all' ? 'All' : f === 'owned' ? 'Owned' : 'Missing'}
            </button>
          ))}
        </div>

        <div className="mod-library-tabs" style={{ marginLeft: 'auto' }}>
          {CATEGORY_TABS.map(c => (
            <button
              key={c}
              className={'lib-tab' + (catFilter === c ? ' active' : '')}
              onClick={() => setCatFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {onRefreshOwned && (
          <button className="lib-tab" onClick={onRefreshOwned} title="Sync owned mods">⟳</button>
        )}

        <button className="btn btn-sm" onClick={onAddRiven}>+ Riven</button>
      </div>

      {!collapsed && <div className="mod-library-body">
        {results.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px', textAlign: 'center', color: 'var(--wf-text-dim)' }}>
            {query.trim() || polFilter !== 'ALL' || catFilter !== 'All' || filterOwned !== 'all'
              ? 'No mods match your filters'
              : 'No mods available'}
          </div>
        ) : (
        <div className="mod-library-grid">
          {results.map(m => {
            const missing = !!ownedModIds && !ownedModIds.has(m.uniqueName);
            const model = buildPresentationModel(m, 'mod', !missing);
            return (
              <RichTooltip
                key={m.uniqueName}
                tooltip={model.tooltip}
                color={m.rarity === 'Legendary' ? 'var(--wf-gold)' : m.rarity === 'Rare' ? '#fae7be' : m.rarity === 'Uncommon' ? '#ffffff' : '#ca9a87'}
              >
                <div
                  className={'lib-card' + (missing ? ' missing' : '') + ' rarity-' + (m.rarity ?? 'Common')}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(m)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(m);
                    }
                  }}
                >
                <AssetImage className="lib-card-img" imageName={m.imageName} />
                <div className="lib-card-img-bg" />
                <div className="lib-card-top">
                  <span
                    className="lib-card-pol"
                    style={{ color: POLARITY_COLOR[parsePolarity(m.polarity ?? 'universal')], borderColor: POLARITY_COLOR[parsePolarity(m.polarity ?? 'universal')] }}
                  >
                    {POLARITY_SYMBOL[parsePolarity(m.polarity ?? 'universal')]}
                  </span>
                  <span className="lib-card-drain">{m.baseDrain ?? ''}</span>
                </div>
                {!missing && ownedModIds && <span className="lib-card-owned">✓</span>}
                <span className="lib-card-name">{m.name}</span>
              </div>
            </RichTooltip>
            );
          })}
        </div>
      )}
      </div>}
    </div>
  );
}
