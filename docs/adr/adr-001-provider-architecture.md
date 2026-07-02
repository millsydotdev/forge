# ADR-001: Provider Architecture

**Date:** 2 July 2026  
**Status:** ACCEPTED  
**Context:** Milestone 14 — Live Player Synchronisation & Provider Framework

## Decision

Forge uses a provider-based architecture for player data synchronisation. Providers are swappable implementations of platform-specific data sources (Overwolf GEP, JSON import, manual mark, etc.) that all emit a standardised `IncomingPlayerSnapshot`.

## Rationale

1. **Engine isolation** — The calculation engine must never depend on player-specific data. Ownership, inventory, and player profile are informational only.
2. **Platform independence** — Forge ships in two editions (OW-Electron and standalone Electron). Providers abstract the difference so the engine and UI never know which edition is running.
3. **Future-proofing** — Adding Steam, official Warframe API, or cloud sync support means adding one provider implementation, not rewriting the synchronisation pipeline.
4. **Testability** — Providers can be mocked, stubbed, or replaced in tests without affecting engine or UI tests.

## Architecture

```
Provider implementations → IncomingPlayerSnapshot → Normalizer → CanonicalPlayerModel
  → Diff Engine → Conflict Resolver → Player Event Bus → Ownership Layer → UI
```

## Key decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Provider count | Arbitrary | No fixed limit. Manager discovers at runtime. |
| Provider interface | IProvider | One contract, many implementations |
| Internal model | CanonicalPlayerModel | One representation the entire system understands |
| Data flow | Snapshot → Normalize → Diff → Resolve → Apply | Immutable pipeline with validation at every step |
| Event distribution | PlayerEventBus | Future features hook into events, not sync pipeline |

## Consequences

- Adding a new provider requires implementing IProvider and registering it with ProviderManager
- The engine never accesses any provider data
- The UI reads ownership from libraryStore, not from providers
- PlayerTimeline is event-derived, not provider-derived
