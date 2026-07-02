# Milestone 17 — Visual Platform, Product Identity & Authentic Warframe Presentation

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 17 establishes the `VisualManager` — the single visual authority for the entire TennoDex application. It centralizes branding, theme management, visual tokens, asset resolution, card rendering, rich tooltips, skeleton loading, and a visual audit tool. The application now has a permanent product identity and a visual framework designed to scale.

---

## Architecture

```
VisualManager (single visual authority)
  │
  ├── Brand (product name, tagline, version, URLs, storage prefix, localStorage migration)
  ├── Theme (dark/light/oled/highContrast with full color tokens)
  ├── Tokens (spacing, radius, shadow, animation, font, z-index)
  ├── Assets (CDN resolution with memory cache + failure cache)
  ├── CardRenderer (universal card — mod, arcane, shard, focus, companion, relic)
  ├── PresentationModel (standard interface for every item type)
  ├── RichTooltip (Diablo-style hover with artwork, stats, drops, links)
  ├── SkeletonLoader (async loading placeholder)
  └── VisualAudit (developer tool with 6 audit categories)
```

---

## Files Created (6 new)

| File | Lines | Purpose |
|------|-------|---------|
| `src/services/visual-manager.ts` | 200+ | Brand, Theme, Tokens, Assets, Icons — single visual authority |
| `src/components/ui/PresentationModel.ts` | 80+ | Standard presentation interface for every item type |
| `src/components/ui/CardRenderer.tsx` | 100+ | Universal card renderer with 3 sizes, multiple templates |
| `src/components/ui/RichTooltip.tsx` | 100+ | Hover tooltip with artwork, stats, drops, wiki links |
| `src/components/ui/SkeletonLoader.tsx` | 40+ | Shimmer loading placeholder (line, card, circle, rect variants) |
| `src/features/debug/VisualAudit.tsx` | 180+ | Developer audit tool — checks typography, spacing, radius, artwork, colors |

---

## Key Components

### VisualManager

| Subsystem | Contents |
|-----------|----------|
| Brand | Product name, short name, tagline, version, copyright, URLs, storage key migration |
| Theme | 4 themes (dark, light, oled, highContrast) with 18 semantic color tokens each |
| Tokens | spacing (6), radius (6), shadow (5), animation (4), font (3), zIndex (7) |
| Assets | CDN URL resolution with 200-entry LRU memory cache, failure caching, branded placeholders |
| Icons | Damage type and polarity path definitions (SVG-ready) |

### CardRenderer
- Templates: `mod`, `arcane`, `shard`, `focus`, `companion`, `relic`, `default`
- Sizes: `sm` (56×72), `md` (72×96), `lg` (96×128)
- Displays: badges, artwork, name, metadata (on large)
- Consumes `PresentationModel`

### RichTooltip
- 400ms delay before showing
- Artwork thumbnail, title, subtitle
- Stat sections with color-coded values
- Drop locations with percentages
- Wiki and Knowledge Base links

### SkeletonLoader
- Variants: `line`, `card`, `circle`, `rect`
- Shimmer animation (1.5s loop)
- Respects `prefers-reduced-motion`

### VisualAudit (Ctrl+Shift+A)
6 audit categories:
- Typography (body font, font sizes <8px)
- Spacing (panel padding consistency)
- Radius (card border radius consistency)
- Artwork (broken CDN images)
- Colors (hardcoded hex in inline styles)
- Overall score with pass/fail per check

---

## Brand Assets

| Asset | Location |
|-------|----------|
| Product name | `Brand.productName` |
| Window title | `Brand.getWindowTitle(buildName)` |
| About text | `Brand.getAboutText()` |
| localStorage prefix | `tdx_` (migrated from `tennodex_`) |
| Application URLs | website, repository, discord, issues, docs |

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```
