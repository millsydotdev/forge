/**
 * SearchIndex
 *
 * Layer:
 *   Performance — Fast Dataset Querying
 *
 * Owns:
 *   Inverted search index over mods, warframes, weapons, arcanes, companions
 *   Fuzzy matching with Levenshtein distance
 *
 * Never owns:
 *   Game data loading (consumes existing data)
 *   UI rendering
 *
 * Input:
 *   ItemOption[] arrays from libraryStore
 *
 * Output:
 *   Query results in <5ms for any input
 *
 * Performance budgets:
 *   Index build: <500ms
 *   Query: <5ms
 *   Index memory: <10MB
 */

import type { ItemOption } from '../features/build-planner/model';

interface InvertedIndex {
  [token: string]: number[];  // token → document IDs
}

interface SearchDocument {
  id: number;
  uniqueName: string;
  name: string;
  type: 'mod' | 'warframe' | 'weapon' | 'arcane' | 'companion';
  category: string;
  subCategory?: string;
  keywords: string[];
  metadata: Record<string, unknown>;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  matchField: 'name' | 'keyword' | 'fuzzy';
}

export class SearchIndex {
  private documents: SearchDocument[] = [];
  private index: InvertedIndex = {};
  private nameIndex: Map<string, number[]> = new Map();  // lowercase name → doc IDs
  private built = false;
  private buildTime = 0;
  private queryCount = 0;
  private totalQueryTime = 0;

  get stats() {
    return {
      documents: this.documents.length,
      indexTerms: Object.keys(this.index).length,
      built: this.built,
      buildTime: this.buildTime,
      queryCount: this.queryCount,
      avgQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
    };
  }

  /**
   * Build or rebuild the index from item arrays.
   * Expected to be called once on data load.
   */
  build(
    mods: ItemOption[],
    warframes: ItemOption[],
    weapons: Record<string, ItemOption[]>,
    arcanes: ItemOption[],
    companions: ItemOption[],
  ): void {
    const start = performance.now();

    this.documents = [];
    this.index = {};
    this.nameIndex = new Map();

    let docId = 0;

    const addDoc = (item: ItemOption, type: SearchDocument['type'], category: string) => {
      const keywords = this.tokenize(item.name);
      const doc: SearchDocument = {
        id: docId,
        uniqueName: item.uniqueName,
        name: item.name,
        type,
        category,
        subCategory: (item as any).type || (item as any).subCategory,
        keywords,
        metadata: {
          polarity: (item as any).polarity,
          rarity: (item as any).rarity,
          drain: (item as any).baseDrain,
          masteryReq: (item as any).masteryReq,
        },
      };
      this.documents.push(doc);

      // Index each keyword
      for (const token of keywords) {
        if (!this.index[token]) this.index[token] = [];
        this.index[token].push(docId);
      }

      // Index name prefixes for fast prefix matching
      const lowerName = item.name.toLowerCase();
      if (!this.nameIndex.has(lowerName)) this.nameIndex.set(lowerName, []);
      this.nameIndex.get(lowerName)!.push(docId);

      docId++;
    };

    for (const m of mods) addDoc(m, 'mod', m.type || 'Mod');
    for (const w of warframes) addDoc(w, 'warframe', 'Warframe');
    for (const [, weps] of Object.entries(weapons)) {
      for (const w of weps) addDoc(w, 'weapon', w.category || 'Weapon');
    }
    for (const a of arcanes) addDoc(a, 'arcane', 'Arcane');
    for (const c of companions) addDoc(c, 'companion', c.type || 'Companion');

    this.built = true;
    this.buildTime = performance.now() - start;
  }

  /**
   * Search the index. Returns results sorted by relevance.
   * Performance budget: <5ms for any input.
   */
  query(q: string, maxResults = 50): SearchResult[] {
    if (!this.built || !q.trim()) return [];
    const start = performance.now();

    const terms = this.tokenize(q);
    const scored = new Map<number, SearchResult>();

    for (const term of terms) {
      // 1. Exact term match
      const exactMatches = this.index[term];
      if (exactMatches) {
        for (const docId of exactMatches) {
          const existing = scored.get(docId);
          const score = (existing?.score ?? 0) + 100;
          scored.set(docId, { document: this.documents[docId], score, matchField: 'keyword' });
        }
      }

      // 2. Name prefix match
      for (const [name, docIds] of this.nameIndex) {
        if (name.startsWith(term)) {
          for (const docId of docIds) {
            const bonus = term.length / name.length * 50;
            const existing = scored.get(docId);
            const score = (existing?.score ?? 0) + 50 + bonus;
            scored.set(docId, { document: this.documents[docId], score, matchField: existing?.matchField === 'keyword' ? 'keyword' : 'name' });
          }
        }
      }

      // 3. Fuzzy match (Levenshtein distance <= 2)
      for (const [indexTerm, docIds] of Object.entries(this.index)) {
        if (this.levenshtein(term, indexTerm) <= 2 && term.length >= 3) {
          for (const docId of docIds) {
            const existing = scored.get(docId);
            if (!existing || existing.matchField === 'fuzzy') {
              const score = (existing?.score ?? 0) + 25;
              scored.set(docId, { document: this.documents[docId], score, matchField: 'fuzzy' });
            }
          }
        }
      }
    }

    // Sort by score descending, limit results
    const results = [...scored.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    this.queryCount++;
    this.totalQueryTime += performance.now() - start;
    return results;
  }

  /** Filter results by type. */
  filterByType(results: SearchResult[], type: SearchDocument['type']): SearchResult[] {
    return results.filter(r => r.document.type === type);
  }

  /** Get a document by uniqueName. */
  getByUniqueName(uniqueName: string): SearchDocument | undefined {
    return this.documents.find(d => d.uniqueName === uniqueName);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }
}

/** Singleton instance */
export const searchIndex = new SearchIndex();
