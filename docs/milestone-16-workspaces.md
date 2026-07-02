# Milestone 16 — Workspaces, Projects & Document Architecture

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 16 establishes the `WorkspaceManager` — a professional document-based workspace architecture that transforms TennoDex from a build planner into a desktop theorycrafting studio. The system features document management, project hierarchy, VS Code-style tabs, command history (undo/redo), autosave sessions, workspace search, and a storage abstraction layer.

---

## Architecture

```
WorkspaceManager (singleton)
  │
  ├── WorkspaceEventBus  (inter-manager communication)
  │
  ├── DocumentManager    (BuildDocument lifecycle)
  ├── ProjectManager     (project hierarchy)
  ├── TabManager         (VS Code-style build tabs)
  ├── CommandHistory     (undo/redo stack)
  ├── SessionManager     (autosave + crash recovery)
  ├── SearchManager      (full-text across user work)
  └── WorkspaceStorage   (persistence abstraction)
```

### Key Design Decisions (ADR-003)

| Decision | Rationale |
|----------|-----------|
| BuildDocument vs BuildFile | Runtime can hold transient data (dirty, cached); file format remains stable |
| WorkspaceManager as root | Single entry point for init, save, session lifecycle |
| Tabs are document-based | VS Code model — tab is a view into a document, not a file |
| Branches replace experiments | Git-inspired naming, inherits parent at creation, stores BranchMeta |
| CommandHistory separate from Timeline | Undo/redo vs audit log — different concerns |
| Storage abstraction | LocalStorage today, SQLite tomorrow, same interface |
| WorkspaceEventBus | Managers never import each other directly — prevents circular deps |
| Granular schema versions | workspace/project/build versions tracked independently |

---

## Files Created (14 new)

| File | Lines | Purpose |
|------|-------|---------|
| `src/services/workspace-manager.ts` | 110+ | Root singleton — initializes all sub-managers |
| `src/services/workspace-event-bus.ts` | 65+ | Typed event dispatch (18 event types) |
| `src/services/document-manager.ts` | 130+ | BuildDocument lifecycle (create, open, close, save, branch) |
| `src/services/build-serializer.ts` | 85+ | BuildDocument ↔ BuildFile, contentHash, schemaVersion |
| `src/services/project-manager.ts` | 130+ | Project CRUD, build membership, pin/archive |
| `src/services/tab-manager.ts` | 90+ | Open tabs, active tab, reorder, close others |
| `src/services/command-history.ts` | 85+ | Undo/redo stack (max 200), execute/undo/redo |
| `src/services/session-manager.ts` | 70+ | Session persistence, crash recovery, autosave timer |
| `src/services/search-manager.ts` | 80+ | Full-text index over projects, builds, notes, timeline |
| `src/services/workspace-storage.ts` | 100+ | localStorage abstraction for all persistent data |
| `src/features/tabs/BuildTabs.tsx` | 100+ | VS Code-style build tab bar with dirty indicators, drag-to-reorder |
| `src/features/projects/ProjectBrowser.tsx` | 180+ | Project grid/list with search, sort, filter, pin, archive |
| `src/features/comparison/NWayComparison.tsx` | 160+ | Multi-build comparison matrix with baseline pinning and deltas |
| `docs/adr/adr-003-workspace-architecture.md` | — | Architecture Decision Record |

---

## Data Model

### BuildDocument (runtime)
```typescript
{ id, slug, name, loadout, config, notes, parentId, branchMeta,
  contentHash, schemaVersion, buildVersion, createdAt, updatedAt,
  dirty (runtime), cachedResult (runtime) }
```

### BuildFile (persistent)
```typescript
{ version, id, slug, name, loadout, config, notes, parentId,
  branchMeta, contentHash, schemaVersion, buildVersion, createdAt, updatedAt }
```

### BranchMeta
```typescript
{ purpose: string, author: string, createdAt: number, changedFields: string[] }
```

---

## Inter-Manager Communication Rule

> Managers may never import each other directly. All communication occurs through the `WorkspaceManager` or `WorkspaceEventBus`.

This prevents circular dependencies and keeps the architecture maintainable.

---

## Performance Budgets

| Operation | Budget |
|-----------|--------|
| WorkspaceManager init | <50ms |
| Document create/open | <5ms |
| Branch operation | <10ms |
| Command execute/undo/redo | <5ms |
| Search query | <50ms |
| Session save | <10ms |
| Full persist (all state) | <50ms |

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```
