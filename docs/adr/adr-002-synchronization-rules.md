# ADR-002: Synchronization Rules

**Date:** 2 July 2026  
**Status:** ACCEPTED  
**Context:** Milestone 14 — defines the "constitution" of the synchronisation subsystem

## Rules

### Rule 1: The calculation engine never accesses ownership.
The engine (`src/engine/`) must never import from `libraryStore`, `buildStore`, or any provider. Ownership is UI-layer data only.

### Rule 2: Providers never modify engine state directly.
Providers emit `IncomingPlayerSnapshot`. They never call `calculateBuild()`, `setWf()`, or any engine function. State changes happen only through the synchronization pipeline.

### Rule 3: Every provider emits IncomingPlayerSnapshot.
All providers — Overwolf, Local, Import — produce the same type. The Normalizer is the single point of conversion.

### Rule 4: Every snapshot must be normalized.
No `IncomingPlayerSnapshot` reaches the diff engine or conflict resolver without passing through the Normalizer.

### Rule 5: Only CanonicalPlayerModel enters the synchronization pipeline.
The Normalizer converts `IncomingPlayerSnapshot` → `CanonicalPlayerModel`. Everything downstream works with the canonical model only.

### Rule 6: Conflict resolution occurs before any store mutation.
If a provider snapshot conflicts with the current state (e.g., unsaved manual changes), the Conflict Resolver must produce a resolution before any data is applied.

### Rule 7: PlayerTimeline is event-derived.
The timeline listens to `PlayerEventBus` events. It does not query providers directly. Session boundaries (game start/exit) are inferred from event patterns.

### Rule 8: Imports are producers, not providers.
JSON import, clipboard import, and build codec import all produce `IncomingPlayerSnapshot`. They register as transient producers, not persistent providers.

### Rule 9: Game Data is reference data, never player data.
WFCD, Knowledge Base, Formula Registry, and Coverage Matrix describe the game. They are not providers. They never mix with player synchronisation.

### Rule 10: UI never depends on provider implementation.
UI components read from `libraryStore` (ownership) and `ProviderManager.getCapabilities()` (what's available). No UI component imports Overwolf, Electron, or any provider-specific module.
