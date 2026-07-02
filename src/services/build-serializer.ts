/**
 * BuildSerializer
 *
 * Layer:
 *   Workspace Architecture — BuildDocument ↔ BuildFile conversion
 *
 * Owns:
 *   Converting between runtime BuildDocument and persistent BuildFile
 *   contentHash + schemaVersion management
 *
 * Never owns:
 *   Storage layer
 *   WorkspaceManager lifecycle
 *
 * Input:
 *   BuildDocument (runtime)
 *
 * Output:
 *   BuildFile (persistable JSON)
 */


type Loadout = Record<string, unknown>;
type BuildConfig = Record<string, unknown>;

/** Runtime document — can hold transient state like dirty flag, cached results */
export interface BuildDocument {
  id: string;
  slug: string;
  name: string;
  loadout: Loadout;
  config: BuildConfig;
  notes: string;
  parentId: string | null;
  branchMeta: BranchMeta | null;
  contentHash: string;
  schemaVersion: number;
  buildVersion: number;
  createdAt: number;
  updatedAt: number;

  // Runtime-only fields (not persisted):
  dirty: boolean;
  cachedResult?: unknown;
}

export interface BranchMeta {
  purpose: string;
  author: string;
  createdAt: number;
  changedFields: string[];
}

/** Persistent file format — only persistable fields */
export interface BuildFile {
  version: number;
  id: string;
  slug: string;
  name: string;
  loadout: unknown;
  config: unknown;
  notes: string;
  parentId: string | null;
  branchMeta: BranchMeta | null;
  contentHash: string;
  schemaVersion: number;
  buildVersion: number;
  createdAt: number;
  updatedAt: number;
}

export class BuildSerializer {
  static CURRENT_SCHEMA_VERSION = 1;
  static CURRENT_BUILD_VERSION = 1;

  /** Convert runtime document to persistable file */
  static toFile(doc: BuildDocument): BuildFile {
    return {
      version: 1,
      id: doc.id,
      slug: doc.slug,
      name: doc.name,
      loadout: doc.loadout,
      config: doc.config,
      notes: doc.notes,
      parentId: doc.parentId,
      branchMeta: doc.branchMeta,
      contentHash: doc.contentHash,
      schemaVersion: doc.schemaVersion,
      buildVersion: doc.buildVersion,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /** Convert persisted file to runtime document (with defaults for runtime-only fields) */
  static fromFile(file: BuildFile): BuildDocument {
    return {
      id: file.id,
      slug: file.slug,
      name: file.name,
      loadout: file.loadout as Loadout,
      config: file.config as BuildConfig,
      notes: file.notes || '',
      parentId: file.parentId,
      branchMeta: file.branchMeta,
      contentHash: file.contentHash,
      schemaVersion: file.schemaVersion ?? BuildSerializer.CURRENT_SCHEMA_VERSION,
      buildVersion: file.buildVersion ?? BuildSerializer.CURRENT_BUILD_VERSION,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      dirty: false,
    };
  }

  /** Create a content hash from the loadout (for change detection) */
  static computeHash(loadout: unknown): string {
    const str = JSON.stringify(loadout);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
