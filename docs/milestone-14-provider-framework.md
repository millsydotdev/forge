# Milestone 14 — Live Player Synchronisation & Provider Framework

**Date:** 2 July 2026  
**Status:** BUILD COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 14 builds the complete provider-based synchronisation framework for TennoDex. The architecture cleanly separates player data (ownership, inventory, loadout) from the calculation engine. Providers are swappable implementations — Overwolf is just one provider. No engine files were modified.

---

## Architecture Delivered

```
                    TennoDex

Game Data Layer                  Player Synchronisation
├── WFCD                          ProviderManager
├── Knowledge Base                 ├── OverwolfProvider (live, priority 100)
├── Formula Registry               ├── LocalProvider (imports, priority 50)
├── Evidence Register              └── Future (extensible)
└── Coverage Matrix
                                          │
                                   ImportFramework
                                   JSON • Clipboard • Build Codec
                                          │
                                   IncomingPlayerSnapshot
                                          │
                                   SynchronizationManager
                                          │
                                   Normalizer → CanonicalPlayerModel
                                          │
                                   Diff Engine → ChangeSet
                                          │
                                   Conflict Resolver
                                          │
                                   Player Event Bus
                                          │
                              ┌───────────┼────────────┐
                              │           │            │
                        Ownership      Player       Future
                         Layer        Timeline     Systems
                          (libraryStore)
                              │
                         Existing UI

              (Engine never sees ownership or providers)
```

---

## Files Created (11 files)

| File | Lines | Purpose |
|------|-------|---------|
| `src/services/providers/types.ts` | 230+ | All interfaces: IProvider, IncomingPlayerSnapshot, CanonicalPlayerModel, ChangeSet, PlayerEvent, TimelineEntry |
| `src/services/providers/provider-manager.ts` | 100+ | Provider registration, capability discovery, health monitoring |
| `src/services/providers/normalizer.ts` | 110+ | WFCD-backed validation + conversion to canonical model |
| `src/services/providers/diff-engine.ts` | 100+ | ChangeSet generation (collections, loadout, profile) |
| `src/services/providers/conflict-resolver.ts` | 80+ | Merge strategies with confirmation support |
| `src/services/providers/synchronization-manager.ts` | 80+ | Pipeline orchestration: normalize → diff → resolve → emit |
| `src/services/providers/player-event-bus.ts` | 70+ | Typed event dispatch with wildcard listeners |
| `src/services/providers/player-timeline.ts` | 130+ | LocalStorage-persisted timeline with session detection |
| `src/services/providers/import-framework.ts` | 80+ | JSON, clipboard, build codec importers |
| `src/services/providers/overwolf/overwolf-provider.ts` | 160+ | Overwolf GEP implementation (priority 100, live) |
| `src/services/providers/local/local-provider.ts` | 80+ | Local/manual implementation (priority 50, manual) |

## ADR Documents Created (2 files)

| File | Purpose |
|------|---------|
| `docs/adr/adr-001-provider-architecture.md` | Why providers exist, engine isolation, canonical model |
| `docs/adr/adr-002-synchronization-rules.md` | 10 "constitutional" rules for the subsystem |

---

## Architecture Decisions (from ADR)

| Rule | Summary |
|------|---------|
| 1 | Engine never accesses ownership |
| 2 | Providers never modify engine state directly |
| 3 | Every provider emits IncomingPlayerSnapshot |
| 4 | Every snapshot must be normalized |
| 5 | Only CanonicalPlayerModel enters the sync pipeline |
| 6 | Conflict resolution before store mutation |
| 7 | PlayerTimeline is event-derived |
| 8 | Imports are producers, not providers |
| 9 | Game Data is reference data, never player data |
| 10 | UI never depends on provider implementation |

---

## Provider Comparison

| Feature | OverwolfProvider | LocalProvider |
|---------|----------------|---------------|
| Priority | 100 (live) | 50 (import) |
| Source | `live` | `manual` / `imported` |
| Collections | ✅ GEP inventory-update | ✅ Manual toggle / Import |
| Live loadout | ✅ GEP loadout-update | ❌ Manual import only |
| Background sync | ✅ Event-driven | ❌ Manual trigger |
| Profile | ❌ Partial | ✅ Manual |
| Health detection | Overwolf presence | Always ready |

---

## Files NOT Modified

All engine files, buildStore, libraryStore, preload, IPC handlers — zero changes.

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```

---

## Remaining (Post-Milestone)

| Item | Status |
|------|--------|
| Wire SynchronizationManager into app startup | 🔄 Pending (requires hook integration) |
| Settings UI for sync preferences | 🔄 Pending (UI component) |
| OverwolfProvider auto-start on app launch | 🔄 Pending (requires Overwolf detection) |
| PlayerTimeline UI in settings | 🔄 Pending (data exists, needs viewer) |
| Full E2E test with Overwolf mock | 🔄 Pending |
