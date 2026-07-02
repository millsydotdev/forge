import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Brand } from '../../../services/visual-manager';
import { useLibraryStore } from '../../../store/libraryStore';
import { useUiStore } from '../../../store/uiStore';
import type { ItemOption, OwnershipState } from '../model';
import { OwnershipBadge } from '../../../components/ui/OwnershipBadge';
import { CardRenderer } from '../../../components/ui/CardRenderer';
import { buildPresentationModel } from '../../../components/ui/PresentationModel';
import { RichTooltip } from '../../../components/ui/RichTooltip';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

interface EquipmentExplorerProps {
  onSelect?: (item: ItemOption) => void;
}

type ExplorerCategory = 'warframes' | 'primary' | 'secondary' | 'melee' | 'companions' | 'arch-gun' | 'arch-melee' | 'favorites' | 'recent';

const CATEGORIES: { key: ExplorerCategory; label: string }[] = [
  { key: 'warframes', label: 'Warframes' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'melee', label: 'Melee' },
  { key: 'companions', label: 'Companions' },
  { key: 'arch-gun', label: 'Arch-Gun' },
  { key: 'arch-melee', label: 'Arch-Melee' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'recent', label: 'Recent' },
];

const RECENT_KEY = Brand.getStorageKey('explorer_recent');
const FAVORITES_KEY = Brand.getStorageKey('explorer_favorites');

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(ids: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 50))); } catch { /* storage unavailable */ }
}
function loadFavorites(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')); } catch { return new Set(); }
}
function saveFavorites(favs: Set<string>) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs])); } catch { /* storage unavailable */ }
}

export function EquipmentExplorer({ onSelect }: EquipmentExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<ExplorerCategory>('warframes');
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Simulate loading for SkeletonLoader demo
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [activeCategory]);

  const libraryWarframes = useLibraryStore(s => s.warframes);
  const weapons = useLibraryStore(s => s.weapons);
  const companions = useLibraryStore(s => s.companions);
  const setActiveSlot = useUiStore(s => s.setActiveSlot);

  const ownedWarframeIds = useLibraryStore(s => s.ownedWarframeIds);
  const ownedWeaponIds = useLibraryStore(s => s.ownedWeaponIds);
  const ownedCompanionIds = useLibraryStore(s => s.ownedCompanionIds);
  const wishlistedIds = useLibraryStore(s => s.wishlistedIds);

  const getOwnership = useCallback((item: ItemOption): OwnershipState => {
    const uid = item.uniqueName;
    let ownedSet: Set<string> | null = null;
    if (activeCategory === 'warframes' || item.category === 'Warframe') ownedSet = ownedWarframeIds;
    else if (item.category === 'Companion' || item.category === 'Sentinel' || item.category === 'Pet') ownedSet = ownedCompanionIds;
    else ownedSet = ownedWeaponIds;
    if (wishlistedIds?.has(uid)) return 'wishlisted';
    if (ownedSet === null) return 'unknown';
    return ownedSet.has(uid) ? 'owned' : 'missing';
  }, [activeCategory, ownedWarframeIds, ownedWeaponIds, ownedCompanionIds, wishlistedIds]);

  const allWeapons = useMemo(() => Object.values(weapons).flat(), [weapons]);

  const items = useMemo(() => {
    let list: ItemOption[] = [];
    switch (activeCategory) {
      case 'warframes': list = libraryWarframes; break;
      case 'primary': list = allWeapons.filter(w => w.category === 'Primary' || w.category === 'Shotgun'); break;
      case 'secondary': list = allWeapons.filter(w => w.category === 'Secondary'); break;
      case 'melee': list = allWeapons.filter(w => w.category === 'Melee'); break;
      case 'companions': list = companions; break;
      case 'arch-gun': list = allWeapons.filter(w => w.category === 'Arch-Gun'); break;
      case 'arch-melee': list = allWeapons.filter(w => w.category === 'Arch-Melee'); break;
      case 'favorites':
        list = [...libraryWarframes, ...allWeapons, ...companions].filter(i => favorites.has(i.uniqueName));
        break;
      case 'recent':
        list = [...libraryWarframes, ...allWeapons, ...companions].filter(i => recent.includes(i.uniqueName));
        break;
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }
    const seen = new Set<string>();
    return list.filter(i => { if (seen.has(i.uniqueName)) return false; seen.add(i.uniqueName); return true; });
  }, [activeCategory, search, libraryWarframes, allWeapons, companions, favorites, recent]);

  // Reset selection when category or search changes — handled reactively via keyed list
  const toggleFavorite = useCallback((uniqueName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(uniqueName)) next.delete(uniqueName);
      else next.add(uniqueName);
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleSelect = useCallback((item: ItemOption) => {
    const updatedRecent = [item.uniqueName, ...recent.filter(id => id !== item.uniqueName)];
    setRecent(updatedRecent);
    saveRecent(updatedRecent);
    onSelect?.(item);
  }, [recent, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const cols = 5;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, items.length - 1)); break;
      case 'ArrowLeft': e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); break;
      case 'ArrowDown': e.preventDefault(); setSelectedIdx(i => Math.min(i + cols, items.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); setSelectedIdx(i => Math.max(i - cols, 0)); break;
      case 'Enter': if (items[selectedIdx]) handleSelect(items[selectedIdx]); break;
    }
  }, [items, selectedIdx, handleSelect]);

  useEffect(() => {
    if (gridRef.current) {
      const el = gridRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIdx]);

  return (
    <div className="equipment-explorer" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="explorer__sidebar">
        <div className="explorer__search">
          <input className="explorer__search-input" type="text" value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIdx(0); }} placeholder="Search equipment…" />
        </div>
        <nav className="explorer__nav">
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              className={`explorer__nav-item ${activeCategory === cat.key ? 'explorer__nav-item--active' : ''}`}
              onClick={() => { setActiveCategory(cat.key); setSelectedIdx(0); }}>
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="explorer__content" ref={gridRef}>
        {loading && (
          <div className="explorer__grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ padding: 8, background: 'var(--wf-surface)', borderRadius: 6, border: '1px solid var(--wf-border)' }}>
                <SkeletonLoader variant="rect" width="100%" height={80} borderRadius={4} />
                <div style={{ height: 6 }} />
                <SkeletonLoader variant="line" width="70%" height={10} />
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="explorer__empty">
            {search ? 'No results match your search.' : 'No items in this category.'}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="explorer__grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
            {items.map((item, idx) => {
              const ownership = getOwnership(item);
              const isMissing = ownership === 'missing';
              const cat: 'warframe' | 'weapon' | 'companion' =
                activeCategory === 'warframes' ? 'warframe' : activeCategory === 'companions' ? 'companion' : 'weapon';
              const model = buildPresentationModel(item, cat, ownership === 'owned', ownership === 'wishlisted');
              return (
                <RichTooltip key={item.uniqueName} tooltip={model.tooltip}>
                <div data-idx={idx}
                  className={`explorer__card ${idx === selectedIdx ? 'explorer__card--selected' : ''} ${isMissing ? 'explorer__card--missing' : ''}`}
                  onClick={() => handleSelect(item)}
                  onDoubleClick={() => {
                    const slot = activeCategory === 'warframes' ? 'warframe'
                      : activeCategory === 'companions' ? 'companion' : activeCategory;
                    setActiveSlot(slot);
                  }}
                >
                  <button className={`explorer__fav ${favorites.has(item.uniqueName) ? 'explorer__fav--active' : ''}`}
                    onClick={e => toggleFavorite(item.uniqueName, e)}>
                    {favorites.has(item.uniqueName) ? '★' : '☆'}
                  </button>
                  <div className="explorer__card-img" style={{ position: 'relative' }}>
                    <CardRenderer model={model} template="default" size="sm" />
                    <div style={{ position: 'absolute', top: 2, right: 2 }}>
                      <OwnershipBadge state={ownership} size="sm" />
                    </div>
                  </div>
                </div>
                </RichTooltip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
