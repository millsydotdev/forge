import { useMemo, useState } from 'react';
import type { ItemOption } from '../features/build-planner/model';

export type OwnershipFilter = 'all' | 'owned' | 'missing';

export interface SortOption {
  key: 'name' | 'rarity' | 'drain' | 'type';
  dir: 'asc' | 'desc';
}

const RARITY_ORDER: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, legendary: 3,
};

export interface UseLibrarySearchReturn {
  query: string; setQuery: (q: string) => void;
  categoryFilter: string; setCategoryFilter: (f: string) => void;
  polarityFilter: string; setPolarityFilter: (f: string) => void;
  ownershipFilter: OwnershipFilter; setOwnershipFilter: (f: OwnershipFilter) => void;
  sortOption: SortOption; setSortOption: (s: SortOption) => void;
  filtered: ItemOption[];
  resultCount: number;
}

export function useLibrarySearch(items: ItemOption[], ownedIds: Set<string> | null): UseLibrarySearchReturn {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [polarityFilter, setPolarityFilter] = useState('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>({ key: 'name', dir: 'asc' });

  const filtered = useMemo(() => {
    let result = items;

    if (categoryFilter !== 'All') {
      result = result.filter(
        (m) => m.type?.includes(categoryFilter) || m.category?.includes(categoryFilter),
      );
    }

    if (polarityFilter !== 'ALL') {
      result = result.filter((m) => (m.polarity ?? '') === polarityFilter);
    }

    if (ownedIds && ownershipFilter !== 'all') {
      const owned = ownershipFilter === 'owned';
      result = result.filter((m) => ownedIds.has(m.uniqueName) === owned);
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((m) => m.name?.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortOption.key) {
        case 'name':
          cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        case 'rarity': {
          const ra = RARITY_ORDER[(a.rarity ?? '').toLowerCase()] ?? 0;
          const rb = RARITY_ORDER[(b.rarity ?? '').toLowerCase()] ?? 0;
          cmp = ra - rb;
          break;
        }
        case 'drain':
          cmp = (a.baseDrain ?? 0) - (b.baseDrain ?? 0);
          break;
        case 'type':
          cmp = (a.type ?? '').localeCompare(b.type ?? '');
          break;
      }
      return sortOption.dir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [items, ownedIds, query, categoryFilter, polarityFilter, ownershipFilter, sortOption]);

  return {
    query, setQuery,
    categoryFilter, setCategoryFilter,
    polarityFilter, setPolarityFilter,
    ownershipFilter, setOwnershipFilter,
    sortOption, setSortOption,
    filtered,
    resultCount: filtered.length,
  };
}
