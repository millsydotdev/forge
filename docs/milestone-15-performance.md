# Milestone 15 — Performance, Stability & Production Readiness

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 15 establishes performance instrumentation, a two-level image cache, a diagnostic console, and a benchmarking pipeline. The focus was on **measurement infrastructure** rather than blind optimization — ensuring future work has baselines to compare against.

---

## What Was Built

### 1. Performance Instrumentation (`src/utils/logger.ts`)
Added `logger.mark()`, `logger.measure()`, and `logger.clearMarks()` methods that wrap the `Performance API`. Every `calculateBuild()` call is now instrumented with timing marks (`calc-start` → `calc-end` → `build-calculation` measurement).

### 2. Two-Level Image Cache (`src/components/ui/AssetImage.tsx`)
- **Memory cache:** LRU `Map<string, string>` with max 50 entries. Decoded images are cached in memory and served instantly on repeat access.
- **Failed-image cache:** Failed URLs are cached to prevent repeated 404 attempts.
- **Timing:** Each image load is instrumented with `performance.mark()` for diagnostics.
- **Off-thread decode:** Uses `createImageBitmap` when available.

### 3. Diagnostics Console (`src/features/debug/DiagnosticsPanel.tsx`)
Developer-only panel with 5 tabs:
- **Performance** — Live FPS counter, recent `performance.measure()` entries with durations
- **Memory** — Heap usage (when available), data size counts (enemies, warframes, arcanes)
- **Engine** — Last build calculation timing, weapon count, breakdown count
- **Cache** — Cache configuration info, WFCD data version
- **System** — Platform, user agent, language

Accessible via `Ctrl+Shift+D` or `--debug` flag.

### 4. Benchmarking Baseline (`benchmarks/baseline.json`)
Initial benchmark captured:
- TypeScript compilation: **5,116ms**
- Test suite execution: **1,267ms**

### 5. Performance Budgets (documented)

| Operation | Budget |
|-----------|--------|
| Cold startup | <2.5s |
| Build calculation | <100ms |
| Search response | <50ms |
| Provider sync | <500ms |
| Workspace switch | <50ms |
| Image decode (cached) | <5ms |
| Image decode (CDN) | <16ms |

### 6. Rollback Criteria (engineering rule)

> IF performance improvement <10% AND (complexity increases OR maintainability decreases OR readability decreases) THEN reject the optimization.

---

## Files Added/Modified

| File | Change |
|------|--------|
| `src/utils/logger.ts` | **MODIFIED** — Added `mark()`, `measure()`, `clearMarks()` methods |
| `src/components/ui/AssetImage.tsx` | **MODIFIED** — Added two-level LRU memory cache, load timing, failure caching |
| `src/engine/stat-processor/index.ts` | **MODIFIED** — Added `calc-start`/`calc-end` performance marks around `calculateBuild()` |
| `src/features/debug/DiagnosticsPanel.tsx` | **NEW** — 5-tab developer diagnostics console |
| `src/styles/workbench.css` | **MODIFIED** — Added ~80 lines of diagnostics panel CSS |
| `scripts/benchmark.cjs` | **NEW** — Benchmark runner (saved to benchmarks/) |

---

## Baseline Benchmarks

| Metric | Value |
|--------|-------|
| Test suite | 1,267ms |
| TypeScript check | 5,116ms |
| All tests | 366/366 |
| Typecheck errors | 0 |

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
benchmark ✓ (baseline captured)
```

---

## Remaining (Post-Milestone)

| Item | Status |
|------|--------|
| Performance CI integration | 🔄 Future — benchmark script exists, needs CI wiring |
| Search index optimization | 🔄 Future — depends on Phase 0 measurement |
| Autosave crash recovery | 🔄 Partial — needs cross-session recovery verification |
| Window state memory | 🔄 Future — Electron main process change |
