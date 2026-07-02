/**
 * DocumentManager
 *
 * Layer:
 *   Workspace Architecture — Build Document Lifecycle
 *
 * Owns:
 *   BuildDocument instances (runtime)
 *   Document creation, opening, closing, saving, branching
 *
 * Never owns:
 *   Storage (delegates to WorkspaceStorage)
 *   UI state (tabs, projects)
 *
 * Communication:
 *   Emits events via WorkspaceEventBus (never imports managers directly)
 */

import type { BuildDocument, BranchMeta, BuildFile } from './build-serializer';
import { BuildSerializer } from './build-serializer';
import type { WorkspaceEventBus } from './workspace-event-bus';

export class DocumentManager {
  private docs = new Map<string, BuildDocument>();
  private eventBus: WorkspaceEventBus;

  constructor(eventBus: WorkspaceEventBus) {
    this.eventBus = eventBus;
  }

  /** Get a document by ID. Returns undefined if not open. */
  get(id: string): BuildDocument | undefined {
    return this.docs.get(id);
  }

  /** Get all open documents. */
  getAll(): BuildDocument[] {
    return [...this.docs.values()];
  }

  /** Create a new document from scratch. */
  create(name: string, loadout?: Partial<BuildDocument['loadout']>): BuildDocument {
    const now = Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'build';
    const doc: BuildDocument = {
      id: crypto.randomUUID(),
      slug,
      name,
      loadout: (loadout || {}) as BuildDocument['loadout'],
      config: {} as BuildDocument['config'],
      notes: '',
      parentId: null,
      branchMeta: null,
      contentHash: '',
      schemaVersion: BuildSerializer.CURRENT_SCHEMA_VERSION,
      buildVersion: BuildSerializer.CURRENT_BUILD_VERSION,
      createdAt: now,
      updatedAt: now,
      dirty: false,
    };
    this.docs.set(doc.id, doc);
    return doc;
  }

  /** Open an existing document from a BuildFile. */
  open(file: BuildFile): BuildDocument {
    const existing = this.docs.get(file.id);
    if (existing) return existing;
    const doc = BuildSerializer.fromFile(file);
    this.docs.set(doc.id, doc);
    this.eventBus.emit('document-opened', 'DocumentManager', { documentId: doc.id, name: doc.name });
    return doc;
  }

  /** Close a document without saving. */
  close(id: string): void {
    this.docs.delete(id);
    this.eventBus.emit('document-closed', 'DocumentManager', { documentId: id });
  }

  /** Mark a document as dirty (has unsaved changes). */
  markDirty(id: string): void {
    const doc = this.docs.get(id);
    if (doc) {
      doc.dirty = true;
      doc.updatedAt = Date.now();
      doc.contentHash = BuildSerializer.computeHash(doc.loadout);
    }
  }

  /** Mark a document as clean (saved). */
  markClean(id: string): void {
    const doc = this.docs.get(id);
    if (doc) {
      doc.dirty = false;
      this.eventBus.emit('document-saved', 'DocumentManager', { documentId: id });
    }
  }

  /** Branch an existing document (creates a copy with parent link). */
  branch(sourceId: string, name: string, branchMeta: BranchMeta): BuildDocument | null {
    const source = this.docs.get(sourceId);
    if (!source) return null;

    const branch = this.create(name, { ...source.loadout });
    branch.parentId = sourceId;
    branch.branchMeta = branchMeta;
    branch.config = { ...source.config };
    branch.notes = `Branch of "${source.name}": ${branchMeta.purpose}\n\n${source.notes}`;

    this.eventBus.emit('branch-created', 'DocumentManager', {
      sourceId,
      branchId: branch.id,
      purpose: branchMeta.purpose,
    });
    return branch;
  }

  /** Get all builds as serializable files. */
  toFiles(): BuildFile[] {
    return [...this.docs.values()].map(d => BuildSerializer.toFile(d));
  }

  /** Load documents from files (e.g., on startup). */
  loadFromFiles(files: BuildFile[]): void {
    for (const file of files) {
      const doc = BuildSerializer.fromFile(file);
      doc.dirty = false;
      this.docs.set(doc.id, doc);
    }
  }

  /** Get count of dirty documents. */
  getDirtyCount(): number {
    return [...this.docs.values()].filter(d => d.dirty).length;
  }

  /** Get IDs of all dirty documents. */
  getDirtyIds(): string[] {
    return [...this.docs.values()].filter(d => d.dirty).map(d => d.id);
  }

  destroy(): void {
    this.docs.clear();
  }
}
