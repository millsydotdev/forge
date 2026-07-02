import React, { useCallback, useMemo, useState } from 'react';
import type { BuildPlannerState } from './types';
import { AssetImage } from '../../components/ui/AssetImage';
import { Input } from '../../components/ui/Input';
import { RichTooltip } from '../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../components/ui/PresentationModel';
import type { ItemOption } from '../../features/build-planner/model';

type SearchScope = 'all' | 'mod' | 'frame' | 'weapon' | 'arcane';

function parseScope(query: string): { scope: SearchScope; text: string } {
  const m = query.match(/^@(mod|frame|weapon|arcane)\s*(.*)/i);
  if (!m) return { scope: 'all', text: query };
  return { scope: m[1].toLowerCase() as SearchScope, text: m[2] };
}

export function GlobalSearch({
  state,
  onClose,
  onSelect,
}: {
  state: BuildPlannerState;
  onClose: () => void;
  onSelect: (item: ItemOption) => void;
}) {
  const [rawQuery, setRawQuery] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const { scope, text } = parseScope(rawQuery);

  const itemCategory = useCallback((item: ItemOption, s: SearchScope): 'mod' | 'warframe' | 'weapon' | 'arcane' => {
    if (s === 'mod' || item.category === 'Mod') return 'mod';
    if (s === 'frame' || item.category === 'Warframe') return 'warframe';
    if (s === 'arcane' || item.category === 'Arcane') return 'arcane';
    return 'weapon';
  }, []);

  const pool = useMemo(() => {
    const mods = state.allMods ?? [];
    const frames = state.warframes ?? [];
    const weapons = Object.values(state.weapons ?? {}).flat();
    const arcanes = state.allArcanes ?? [];
    switch (scope) {
      case 'mod': return mods;
      case 'frame': return frames;
      case 'weapon': return weapons;
      case 'arcane': return arcanes;
      default: return [...mods, ...frames, ...weapons, ...arcanes];
    }
  }, [scope, state.allMods, state.warframes, state.weapons, state.allArcanes]);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    const items = q
      ? pool.filter(item => item.name?.toLowerCase().includes(q))
      : pool;
    return items.slice(0, 24);
  }, [pool, text]);

  const handlePick = useCallback((item: ItemOption) => {
    onSelect(item);
    onClose();
  }, [onSelect, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIdx(i => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIdx(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[focusedIdx]) handlePick(filtered[focusedIdx]);
      return;
    }
  }, [filtered, focusedIdx, handlePick, onClose]);

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh', background: 'rgba(0,0,0,0.6)',
      }}
    >
      <div
        className="search-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        style={{
          background: 'var(--wf-surface)', border: '1px solid var(--wf-border)',
          borderRadius: 8, padding: 16, width: 480, maxWidth: '90vw',
          boxShadow: 'var(--elevation-4)',
        }}
      >
        <Input
          type="text"
          value={rawQuery}
          onChange={e => setRawQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search mods, warframes, weapons… (@mod, @frame, @weapon, @arcane)"
          aria-label="Search items"
          autoFocus
          style={{ width: '100%' }}
        />
        <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, maxHeight: 320, overflow: 'auto' }}>
          {filtered.map((item, i) => {
            const cat = itemCategory(item, scope);
            const model = buildPresentationModel(item, cat);
            return (
            <li key={item.uniqueName}>
              <RichTooltip tooltip={model.tooltip}>
              <button
                type="button"
                className="dropdown-menu__item"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: i === focusedIdx ? 'var(--wf-teal-soft)' : undefined,
                  outline: i === focusedIdx ? '1px solid var(--wf-teal)' : undefined,
                }}
                onClick={() => handlePick(item)}
                onMouseEnter={() => setFocusedIdx(i)}
              >
                <AssetImage className="lib-card-img" imageName={item.imageName} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                <span>{item.name}</span>
                {item.type && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--wf-text-muted)' }}>{item.type}</span>
                )}
              </button>
              </RichTooltip>
            </li>
            );
          })}
          {filtered.length === 0 && (
            <li style={{ padding: '12px 14px', color: 'var(--wf-text-muted)', fontSize: 13 }}>No results</li>
          )}
        </ul>
        <div className="search-hints" style={{ marginTop: 8, fontSize: 11, color: 'var(--wf-text-muted)' }}>
          Type <kbd>@mod</kbd>, <kbd>@frame</kbd>, <kbd>@weapon</kbd>, or <kbd>@arcane</kbd> to filter. Arrow keys to navigate, <kbd>Enter</kbd> to select.
        </div>
      </div>
    </div>
  );
}
