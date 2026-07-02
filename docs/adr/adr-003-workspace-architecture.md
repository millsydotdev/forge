# ADR-003 — Workspace & Document Architecture

**Date:** 2 July 2026
**Status:** ACCEPTED
**Context:** Milestone 16 — Workspaces, Projects & Document Management

## Decision

TennoDex uses a `WorkspaceManager` as the single authority for the editing session, with sub-managers for documents, projects, tabs, command history, sessions, and search. All inter-manager communication flows through a `WorkspaceEventBus`.

## Why BuildDocument and BuildFile are separate

`BuildDocument` is the runtime object — it can hold transient state (dirty flag, cached calculations, selected tab). `BuildFile` is the persistent format — only contains serializable data. The `BuildSerializer` converts between them. This separation means the runtime can change without affecting the file format, and vice versa.

## Why WorkspaceManager exists

Without a root authority, every UI component would need to coordinate between DocumentManager, ProjectManager, and TabManager. WorkspaceManager provides a single entry point for initialization, save, session management, and cleanup. Sub-managers are accessed as properties (`workspaceManager.documents`, `workspaceManager.tabs`).

## Why tabs are document-based

Each tab corresponds to an open `BuildDocument`. This is the VS Code model — the tab is a view into a document, not a file on disk. Closing a tab does not delete the document. Tabs persist their IDs across sessions for crash recovery.

## Why branches replace experiments

"Branch" is Git-inspired terminology that is instantly understood. A branch stores a `parentId` reference and `BranchMeta` (purpose, changed fields). It inherits the parent's loadout at creation but can diverge freely. Promoting a branch copies its data over the parent.

## Why CommandHistory is separate from Timeline

CommandHistory is the undo/redo system — it tracks every mutation in order with forward/inverse pairs. The Timeline is an audit log of significant events (created, saved, branched). They serve different purposes: undo is for the user's current session; timeline is for long-term history.

## Why storage is abstracted

`WorkspaceStorage` provides a uniform interface over localStorage. The interface is designed so a future implementation could use IndexedDB or SQLite without changing any manager. This prevents storage coupling.

## Why WorkspaceEventBus exists

Sub-managers must never import each other directly. All communication flows through the event bus. This prevents circular dependencies and keeps the architecture maintainable as it grows. Managers emit events; other managers subscribe.

## Why granular schema versions exist

`workspaceVersion`, `projectVersion`, and `buildVersion` are tracked independently. A build schema migration doesn't require migrating the entire workspace. Version numbers are checked on load; mismatches trigger per-subsystem migration.

## Consequences

- All build mutations go through `workspaceManager.documents`
- All project mutations go through `workspaceManager.projects`
- Undo/redo goes through `workspaceManager.history`
- Tabs are managed by `workspaceManager.tabs`
- Session persistence goes through `workspaceManager.sessions`
- Cross-cutting search goes through `workspaceManager.search`
- No sub-manager imports another sub-manager
- Storage can be swapped without changing business logic
