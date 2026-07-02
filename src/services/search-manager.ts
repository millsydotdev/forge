/**
 * SearchManager
 *
 * Layer:
 *   Workspace Architecture — Full-Text Search Across User Work
 *
 * Owns:
 *   Index of project names, build names, branch names, notes, tags, timeline labels
 *
 * Never owns:
 *   Documents or projects (indexes references only)
 *
 * Communication:
 *   Emits events via WorkspaceEventBus
 */

import type { WorkspaceEventBus } from './workspace-event-bus';

interface SearchDocument {
  id: string;
  type: 'project' | 'build' | 'branch' | 'note' | 'tag' | 'timeline';
  parentId: string;
  text: string;
  scope: string;  // e.g., project name for context
}

interface SearchResult {
  document: SearchDocument;
  score: number;
}

export class SearchManager {
  private docs: SearchDocument[] = [];
  private eventBus: WorkspaceEventBus;

  constructor(eventBus: WorkspaceEventBus) {
    this.eventBus = eventBus;
  }

  index(type: SearchDocument['type'], id: string, parentId: string, text: string, scope: string): void {
    // Remove old entry for same id
    this.docs = this.docs.filter(d => !(d.id === id && d.type === type));
    this.docs.push({ id, type, parentId, text: text.toLowerCase(), scope });
  }

  remove(type: SearchDocument['type'], id: string): void {
    this.docs = this.docs.filter(d => !(d.id === id && d.type === type));
  }

  query(q: string): SearchResult[] {
    if (!q.trim()) return [];
    const terms = q.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const scored = new Map<string, SearchResult>();

    for (const doc of this.docs) {
      let score = 0;
      for (const term of terms) {
        if (doc.text.includes(term)) {
          score += term.length / doc.text.length * 100;
        }
        if (doc.scope.toLowerCase().includes(term)) {
          score += 25;
        }
      }
      if (score > 0) {
        scored.set(doc.id + doc.type, { document: doc, score });
      }
    }

    return [...scored.values()].sort((a, b) => b.score - a.score).slice(0, 50);
  }

  rebuild(docs: SearchDocument[]): void {
    this.docs = [...docs];
    this.eventBus.emit('search-index-updated', 'SearchManager', { count: this.docs.length });
  }

  clear(): void {
    this.docs = [];
  }

  get stats() {
    return { indexed: this.docs.length };
  }
}
