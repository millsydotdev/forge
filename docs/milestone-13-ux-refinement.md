# Milestone 13 — Product Experience, Workflow Refinement & Desktop Excellence

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 13 refines the TennoDex product experience with professional desktop features: auto-save, unsaved changes indicator, undo/redo keyboard shortcuts, and a comprehensive UX audit with implementation plan for remaining improvements.

---

## What Was Built

### 1. Auto-Save System
- Build auto-saves every **30 seconds** when there are unsaved changes
- Uses `setInterval` in `WorkspaceShell` with cleanup on unmount
- Only triggers when `isDirty` is true and a warframe is selected
- Calls the same `saveLoadout`/`markSaved` pipeline as manual save
- No user-facing notification (silent to avoid interruption)

### 2. Unsaved Changes Indicator
- `isDirty: boolean` state added to `buildStore`
- **Every mutation action** (setWf, setWeaponStates, setComp, setHelminth, etc.) sets `isDirty: true`
- `markSaved(name)` resets `isDirty: false`
- Status bar shows **●** (green, saved) or **○** (orange, unsaved) next to build name
- Tooltip on indicator shows "Saved" or "Unsaved changes"

### 3. Undo/Redo Keyboard Shortcuts
- `Ctrl+Z` — Trigger undo handler
- `Ctrl+Shift+Z` — Trigger redo handler
- Wired through `ShortcutProvider` with `onUndo`/`onRedo` callbacks
- Basic snapshot-based undo (stores last 20 build states)
- Snapshot includes: wf, weaponStates, comp, helminth, buffs, conditionalTriggers, mr, enemyState, enemyEnabled

### 4. Dirty State in BuildStore
Actions that now mark `isDirty: true`:
- `setWf`, `setWeaponStates`, `setComp`, `setHelminth`, `setBuffs`
- `setConditionalTriggers`, `setMr`, `setPrimerSlot`
- `setTargetFaction`, `setIsAiming`, `setActiveStatuses`
- `setEnemyState`, `setEnemyEnabled`

---

## Files Modified

| File | Change |
|------|--------|
| `src/store/buildStore.ts` | **MODIFIED** — Added `isDirty`, `lastSavedName`, `setDirty`, `markSaved`. All mutation actions now set `isDirty: true`. |
| `src/app/layout/StatusBar.tsx` | **MODIFIED** — Unsaved indicator (●/○) next to build name with color coding |
| `src/app/layout/ShortcutProvider.tsx` | **MODIFIED** — Added `onUndo`/`onRedo` callbacks, `Ctrl+Z`/`Ctrl+Shift+Z` handlers |
| `src/app/WorkspaceShell.tsx` | **MODIFIED** — Added auto-save (30s interval), undo/redo handlers, snapshot state |

---

## UX Audit Summary

### Scores (Target: 8.5/10)

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Efficiency | 6/10 | 8/10 | Weapon selector, mod replacement |
| Discoverability | 5/10 | 8/10 | Tooltips, empty states |
| Consistency | 7/10 | 9/10 | Uniform patterns |
| Desktop quality | 7/10 | 8/10 | Auto-save, undo/redo (now addressed) |
| Accessibility | 5/10 | 7/10 | aria-labels, Tab order |
| **Overall** | **6/10** | **8.5/10** | |

---

## Remaining UX Work (Documented)

| Item | Priority | Effort | Phase |
|------|----------|--------|-------|
| Replace weapon dropdown with Equipment Explorer | High | 1 day | Phase 2 |
| Add "Replace Mod" to right-click context menu | High | 0.5 day | Phase 2 |
| Recently used mods in Mod Browser | Medium | 0.5 day | Phase 4 |
| Quick rank +/- buttons on mod cards | Medium | 0.5 day | Phase 4 |
| Mod sorting (name, drain, rarity) | Medium | 0.5 day | Phase 4 |
| Auto-focus search on Mod Browser open | Low | 0.25 day | Phase 4 |
| Enhanced build summary (strengths, weaknesses) | Medium | 1 day | Phase 5 |
| Accessibility: aria-labels and Tab order | Medium | 0.5 day | Phase 8 |

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```
