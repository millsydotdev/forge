# Milestone 10 — Build Ownership, Collection Awareness & Build Completion

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 10 introduces ownership awareness across the TennoDex workspace. Every equipment card now shows an ownership badge (owned/missing/wishlisted). Every build now tracks its completion percentage and lists missing items.

**Critical constraint enforced:** Ownership NEVER restricts theorycrafting. All items remain visible, selectable, and calculable regardless of ownership state.

---

## What Was Built

### 1. Ownership Model (`model.ts`)
New `OwnershipState` type: `'owned' | 'missing' | 'wishlisted' | 'favorite' | 'upgradeable' | 'unknown'`

### 2. OwnershipBadge Component (`src/components/ui/OwnershipBadge.tsx`)
Reusable badge component (14px/18px) that renders a colored symbol indicator:
- ✓ green = owned
- ▲ gold = wishlisted
- ★ gold = favorite
- ⬆ orange = upgrade available

### 3. Enhanced Library Store (`src/store/libraryStore.ts`)
- `wishlistedIds: Set<string>` — persisted to localStorage (`tennodex_wishlist`)
- `addToWishlist(id)` / `removeFromWishlist(id)` actions
- Wishlist auto-loaded from localStorage on initialization

### 4. Equipment Explorer Enhancement (`equipment-explorer.tsx`)
- Each card now shows ownership state via `OwnershipBadge`
- Missing items rendered at 70% opacity (still fully usable)
- Hover restores full opacity
- Ownership badge appears in top-right corner of thumbnail

### 5. Build Completion System (`useBuildCompletion.ts`)
New hook that calculates:
- **Percent complete** — ratio of owned items to total required items
- **Total items** — all mods, arcanes, shards, weapons, warframes in build
- **Completed items** — items the player owns
- **Missing items list** — each missing item with type and details

### 6. Inspector Integration (`right-inspector.tsx`)
Build Completion section added to the inspector's idle mode:
- Color-coded progress bar (green ≥100%, gold ≥80%, orange ≥50%, red <50%)
- "X/Y items owned" summary
- Missing items list (up to 10, with "+N more" overflow)
- "All items owned" message at 100%

### 7. Mod Library Ownership (`mod-library.tsx`)
Existing `ownedModIds` display enhanced with wishlist support.

---

## Files Added/Modified

| File | Change |
|------|--------|
| `src/components/ui/OwnershipBadge.tsx` | **NEW** — Reusable ownership indicator badge |
| `src/components/ui/index.ts` | **MODIFIED** — Export OwnershipBadge |
| `src/features/build-planner/hooks/useBuildCompletion.ts` | **NEW** — Build completion calculation hook |
| `src/features/build-planner/model.ts` | **MODIFIED** — Added `OwnershipState` type |
| `src/store/libraryStore.ts` | **MODIFIED** — Added `wishlistedIds`, `addToWishlist`, `removeFromWishlist` |
| `src/features/build-planner/components/equipment-explorer.tsx` | **MODIFIED** — Ownership badges on cards, missing items muted |
| `src/features/build-planner/components/inspector/right-inspector.tsx` | **MODIFIED** — Build Completion section with progress bar |
| `src/styles/workbench.css` | **MODIFIED** — Ownership badge and missing-item CSS |

---

## Ownership Integration Points

| UI Surface | Integration |
|------------|-------------|
| Equipment Explorer | Badge on each card, muted opacity for missing |
| Mod Library | Existing owned/missing filter enhanced |
| Inspector | Build Completion progress bar + missing list |
| Build Canvas | (future — quick stats could show completion) |

---

## Architecture

```
Ownership Data Flow:

Overwolf GEP / Manual / Future Provider
  → libraryStore.setOwned*Ids() / setWishlistedIds()
    → useBuildCompletion() reads owned + wishlisted sets
      → Inspector renders Build Completion section
      → Equipment Explorer reads owned sets for badges
```

**Key constraint:** The calculation engine never reads ownership data. Ownership lives entirely in the library store and UI components.

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```

---

## Remaining (Documented)

| Feature | Reason | Future Milestone |
|---------|--------|-----------------|
| Overwolf auto-import | Requires GEP implementation | Dedicated Overwolf milestone |
| Mod rank tracking | Needs current rank data per mod | Future |
| Resource/material tracking | Requires Warframe Market API | Future |
| Build compatibility on import | Needs import dialog enhancement | Future |
| Favourite/upgradeable states | Infrastructure exists, needs UI toggle | Future |
