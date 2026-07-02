import React, { useEffect, useRef, useState } from 'react';
import type { ArcaneSlot, ItemOption } from '../model';



export function ArcaneBadge({ label, arcane, onSelect, onRemove }: {
  label: string; arcane: ArcaneSlot | null;
  onSelect: (m: ItemOption) => void; onRemove: () => void;
}) {
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ItemOption[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setSearching(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (arcane) {
    return (
      <div className="special-badge filled">
        <span className="arcane-badge-name">{arcane.name}</span>
        <button className="mod-card-del arcane-badge-del" onClick={onRemove}>×</button>
      </div>
    );
  }

  return (
    <div ref={ref} className="arcane-badge-wrap">
      <div className="special-badge" onClick={() => setSearching(!searching)}>{label}</div>
      {searching && (
        <div className="arcane-badge-dropdown">
          <input className="palette-search" value={q} onChange={e => {
            setQ(e.target.value);
            window.forge.getItems('Mods').then((all: ItemOption[]) => {
              const arc = all.filter((m: ItemOption) => (m.type ?? '').toLowerCase().includes('arcane') && m.name.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 10);
              setResults(arc);
            });
          }} placeholder="Search arcane…" autoFocus />
          {results.map(r => (
            <div key={r.uniqueName} className="palette-card arcane-badge-result" onClick={() => { onSelect(r); setSearching(false); setQ(''); }}>
              <span className="palette-card-name">{r.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
