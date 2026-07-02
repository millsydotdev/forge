# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc.1] - 2026-07-02

### Added
- Complete Visual Platform (VisualManager, PresentationModel, CardRenderer, RichTooltip, SkeletonLoader)
- Asset coverage system with 14 categories, 1,324 items tracked (M19)
- Migration dashboard for adoption tracking (M19)
- Workspace identity presentation (FramesTab, WeaponsTab, ArchwingPanel, ShardBadge)
- SkeletonLoader loading states for 9 asynchronous surfaces (M19)
- RichTooltip hover data on all item-displaying surfaces (M19)
- Benchmark infrastructure with before.json baseline (M20)
- Diagnostic panel with FPS, memory, engine, cache, system tabs (M20)
- Release Certification at 100/100 engineering score (M21)
- axe-core-ready accessibility verification across all surfaces (M21)
- Triple-chain storage migration: `tennodex_* → tdx_* → frg_*` (M22)
- Cross-platform compatibility verification (M23)
- GitHub community health files: CODEOWNERS, issue/PR templates, Dependabot (M24)

### Changed
- Rebranded from "TennoDex" to "Forge" — all user-facing touchpoints, package metadata, storage keys (M22)
- Renamed IPC bridge from `window.tennoDex` to `window.forge` (M22)
- Renamed environment variable to `FORGE_RUNTIME_DIR` (with legacy fallback) (M22)
- ESLint: 96→0 warnings across 28 files cleaned (M21)
- Production webpack: 1.16 MiB renderer, 140 KiB vendor, code splitting verified (M21)
- Repository root: 44→33 clean entries, assets organized (M23)

### Fixed
- 30 ESLint errors across 11 categories (M20)
- 4 React render violations (components created during render, refs during render, cascading setState) (M20)
- 16 empty catch blocks documented and commented (M20)
- Hardcoded CDN URLs in RichTooltip and CardRenderer (M19)
- Browser title tooltips migrated to RichTooltip on 4 surfaces (M19)
- 2 dead no-op expression statements removed (M21)
- 6 missing React hook dependencies fixed (M21)

### Removed
- Legacy `utils/assets` from production code (test-only remains) (M19)
- 7 temp files and 8 old design docs/blueprints from repository root (M23)
- 15 unused variables/imports across engine, services, and hooks (M21)
- Falloff calculation dead code in weapon-calc.ts (M21)
- `SIZE_MAP` dead constant in CardRenderer (M21)

### Architecture
- ADR-001: Provider Architecture (ACCEPTED)
- ADR-002: Synchronization Rules (ACCEPTED)
- ADR-003: Workspace Architecture (ACCEPTED)
- ADR-004: Visual Platform Freeze (ACCEPTED) (M18)

## [1.0.0.0] - 2026-06-27

### Added
- Complete feature set (P1–P11):
  - Polarity & Capacity (P1)
  - Three-panel UI overhaul (P2)
  - Set Bonuses UI + stat injection (P3)
  - Riven Mod editor + persistence (P4)
  - Helminth ability injection (P5)
  - Exalted weapons auto-detection + mod grids (P6)
  - Companion stats + weapon support (P7)
  - Condition Overload / Galvanized multipliers (P8)
  - Archon Shards (6 colors, Tauforged) (P9)
  - Comprehensive StatsHUD overhaul (P10)
  - Build Import/Export with tndx1: codec (P11)
- Testing foundation: Vitest + RTL, 233 tests (F1)
- TypeScript strict mode (F2)
- Error Boundary, removed console.log (F3)
- lint-staged config, webpack-merge (F4)
- CI/CD: GitHub Actions full pipeline, NSIS packaging, release workflow (F5)
- README, CHANGELOG, build codec spec (F6)

---

*Generated with [Keep a Changelog](https://keepachangelog.com/) format.*