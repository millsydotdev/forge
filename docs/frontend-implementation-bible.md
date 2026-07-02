# TennoDex — Frontend Implementation Bible

**Date:** 2 July 2026  
**Author:** Principal Frontend Architect  
**Status:** DEFINITIVE IMPLEMENTATION SPECIFICATION  
**Depends on:** IA Redesign, Design System Bible, UX Audit

---

## Table of Contents

1. Executive Summary
2. Frontend Architecture
3. Complete Screen Catalogue
4. Complete Panel Specification
5. Complete Component Catalogue
6. Drag & Drop System
7. Interaction Catalogue
8. Animation Catalogue
9. Complete User Journeys
10. Error Handling
11. Asset Placement Guide
12. Frontend Folder Architecture
13. Performance Rules
14. Accessibility Specification
15. Testing Strategy
16. Implementation Order
17. Risk Register
18. Frontend Completion Checklist

---

## 1. Executive Summary

### What This Document Is

This is the definitive implementation specification for the TennoDex frontend. A team of frontend developers should be able to build every screen, panel, component, and interaction from this document alone. No design decisions remain ambiguous.

### What This Document Is Not

This is not a coding guide. It does not contain React, CSS, or TypeScript. It specifies **what** to build, **how** it should behave, and **why** — not the implementation details.

### Architecture Summary

```
                      ┌─────────────────────┐
                      │   Zustand Stores     │
                      │ (build, ui, library, │
                      │  project, undo)      │
                      └──────────┬──────────┘
                                 │ subscribes
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │  Menu Bar    │  │  Workspace   │  │  Status Bar  │
      │  (always)    │  │  (flexible)  │  │  (always)    │
      └──────────────┘  └──────┬───────┘  └──────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │ Left Zone    │ │ Center Zone  │ │ Right Zone   │
      │ Loadout Tree │ │ Build Canvas │ │ Inspector    │
      │ Explorer     │ │              │ │ Calc Explorer│
      └──────────────┘ └──────────────┘ └──────────────┘
```

### Key Implementation Principles

1. **Stores are the source of truth** — UI never holds derived state
2. **Panels subscribe to store slices** — not the entire store
3. **Drag-and-drop is the primary interaction** — click is fallback
4. **Every mutation is undoable** — all writes go through a command stack
5. **Read engine output, never duplicate** — stats come from `result` only
6. **Workspace determines visible panels** — not user toggling

---

## 2. Frontend Architecture

### Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18+ | Existing codebase, ecosystem |
| State | Zustand | Existing, lightweight, no boilerplate |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Battle-tested, accessible |
| Panels | Custom (no library) | Desktop-specific behaviour |
| Icons | Custom SVG sprite | Performance, consistency |
| Animations | CSS transitions + Framer Motion | Declarative, performant |
| Virtualization | react-virtuoso | Lists, mod grids, search results |
| Modal | createPortal | Escape capture, focus trap |
| Testing | Vitest + Testing Library | Existing setup |

### Store Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Zustand Stores                     │
│                                                     │
│  buildStore      uiStore       libraryStore          │
│  ├─ build state  ├─ UI state    ├─ items             │
│  ├─ equipment    ├─ panels      ├─ mods              │
│  ├─ mods         ├─ workspace   ├─ arcanes           │
│  ├─ arcanes      ├─ search      ├─ companions        │
│  ├─ shards       ├─ toasts      └─ focus             │
│  ├─ helminth     └─ modals                           │
│  ├─ enemy                                            │
│  ├─ buffs                projectStore                 │
│  └─ result      ────────┼─ projects                  │
│                          ├─ variants                  │
│  undoStore               └─ meta                     │
│  ├─ commands                                          │
│  ├─ currentIdx                                         │
│  └─ maxHistory                                        │
└─────────────────────────────────────────────────────┘
```

### Store Subscription Rules

```
Components subscribe to the MINIMUM slice they need:

// ✅ Correct — subscribes to one stat
const health = useBuildStore(s => s.result?.health);

// ❌ Wrong — subscribes to entire store
const result = useBuildStore(s => s.result);
```

### Command Stack (Undo/Redo)

Every mutation goes through this pipeline:

```
User Action → Command.create(type, payload, inverse)
  → push to undoStore.commands
  → execute forward()
  → update buildStore
  → trigger recalculate
  → UI reacts

Ctrl+Z → undoStore.undo()
  → execute inverse() of current command
  → restore previous buildStore state
  → trigger recalculate

Ctrl+Shift+Z → undoStore.redo()
  → execute forward() of next command
  → restore next buildStore state
  → trigger recalculate
```

**Command types:**
- `SET_EQUIPMENT` — change warframe/weapon/companion
- `PLACE_MOD` — add mod to slot
- `REMOVE_MOD` — remove mod from slot
- `RANK_MOD` — change mod rank
- `CHANGE_POLARITY` — change slot polarity
- `SET_ARCANE` — equip/unequip arcane
- `SET_SHARD` — change shard color/tau
- `SET_HELMINTH` — toggle/change helminth
- `SET_BUFF` — toggle/change squad buff
- `SET_ENEMY` — change enemy target/params

---

## 3. Complete Screen Catalogue

### Screen: Application Startup

| Property | Value |
|----------|-------|
| **Purpose** | Initialize engine, load data, check health |
| **Entry** | App launches |
| **Exit** | Data loaded OR error screen |
| **Visible panels** | Full-screen loading overlay (centered) |
| **Navigation paths** | Auto → Loading → Workspace or Error |
| **Keyboard shortcuts** | None (no UI yet) |
| **Loading states** | Shimmer skeleton, "Loading arsenal data…", progress dots |
| **Empty states** | N/A (always loads data) |
| **Failure states** | "Game data failed to load" banner + retry |

**Implementation:**
```
┌──────────────────────────────────────────────┐
│                                              │
│              ⬡ TennoDex                     │
│         Warframe Theorycrafting Studio       │
│                                              │
│         ████████████░░░░░░░░░░               │
│                                              │
│         Loading arsenal data…                │
│                                              │
└──────────────────────────────────────────────┘
```

Data health check: Loads `@wfcd/items` via IPC. If items.length === 0, shows error. If ok, transitions to workspace.

### Screen: Workspace (Default — Theorycraft)

| Property | Value |
|----------|-------|
| **Purpose** | Main editing environment |
| **Entry** | Startup complete OR workspace switch |
| **Exit** | Close app, workspace switch, error |
| **Visible panels** | Menu Bar, Loadout Tree, Build Canvas, Inspector, Status Bar |
| **Hidden panels** | Equipment Explorer, Mod Browser, Enemy Lab |
| **Navigation paths** | Ctrl+K search, command palette, workspace switcher, panel toggles |
| **Keyboard shortcuts** | See Interaction Catalogue |
| **Loading states** | Building calculation (small bar in status bar) |
| **Empty states** | "No Build" empty state on canvas |
| **Failure states** | Error boundary per panel (panel shows error, others remain) |

### Screen: Workspace (Enemy Lab)

| Property | Value |
|----------|-------|
| **Purpose** | Build optimization against specific enemies |
| **Entry** | View → Workspace → Enemy Lab |
| **Exit** | Workspace switcher |
| **Visible panels** | Menu Bar, Loadout Tree, Build Canvas (with enemy overlay), Inspector (enemy analysis), Status Bar |
| **Additional elements** | Enemy config controls below quick stats |
| **Keyboard shortcuts** | Same as Theorycraft + enemy-specific |

### Screen: Workspace (Comparison)

| Property | Value |
|----------|-------|
| **Purpose** | Compare two builds side by side |
| **Entry** | View → Workspace → Comparison or from build history |
| **Exit** | Workspace switcher |
| **Visible panels** | Menu Bar, Canvas A, Canvas B, Delta Inspector, Status Bar |
| **Navigations** | "Apply to A", "Apply to B" buttons in delta inspector |

### Screen: Workspace (Presentation)

| Property | Value |
|----------|-------|
| **Purpose** | Full-screen build display for streaming/screenshots |
| **Entry** | View → Workspace → Presentation |
| **Exit** | Escape → Theorycraft |
| **Visible panels** | Build Canvas only (full screen, no chrome) |
| **Navigations** | Escape only |

### Screen: Workspace (Minimal)

| Property | Value |
|----------|-------|
| **Purpose** | Distraction-free modding |
| **Entry** | View → Workspace → Minimal |
| **Exit** | Workspace switcher |
| **Visible panels** | Build Canvas + Status Bar |

### Screen: Global Search

| Property | Value |
|----------|-------|
| **Purpose** | Find anything — equipment, mods, KB entries, commands |
| **Entry** | Ctrl+K |
| **Exit** | Escape, selecting a result |
| **Visible** | Overlay centered, 600px wide |
| **Animation** | Fade in + scale up (200ms) |

### Screen: Command Palette

| Property | Value |
|----------|-------|
| **Purpose** | Execute commands by name |
| **Entry** | Ctrl+Shift+P |
| **Exit** | Escape, executing a command |
| **Visible** | Overlay centered, 560px wide |

### Screen: Settings (Future)

| Property | Value |
|----------|-------|
| **Purpose** | Configure application preferences |
| **Entry** | File → Settings |
| **Exit** | Close |
| **Visible** | Modal with tabbed sections |

### Screen: About

| Property | Value |
|----------|-------|
| **Purpose** | Version info, credits, KB link |
| **Entry** | Help → About |
| **Exit** | Close |
| **Visible** | Modal with illustration + version |

### Screen: First Launch

| Property | Value |
|----------|-------|
| **Purpose** | Onboarding for new users |
| **Entry** | First launch (no saved preference) |
| **Exit** | Completing 3-step wizard |
| **Visible** | Full-screen overlay |

---

## 4. Complete Panel Specification

### Panel: Menu Bar

| Property | Value |
|----------|-------|
| **Purpose** | Application-level actions |
| **Contents** | File, Edit, View, Workspace, Help |
| **Height** | 28px (fixed) |
| **Layout** | Horizontal. File | Edit | View | Workspace | Help |
| **Collapse** | Never |
| **Scrolling** | Never |
| **Context menus** | Each menu opens a dropdown |
| **Keyboard** | Alt+F, Alt+E, Alt+V, Alt+W, Alt+H |

**Menu contents:**

```
File                Edit              View              Workspace           Help
├── New Build       ├── Undo          ├── Loadout Tree   ├── Theorycraft     ├── About
├── Open Build      ├── Redo          ├── Inspector      ├── Enemy Lab       ├── Shortcuts
├── Save      Ctrl+S├── Clear Build   ├── Explorer       ├── Comparison      ├── Knowledge Base
├── Save As         ├── Reset Slot    ├── Mod Browser    ├── Presentation    └── Report Issue
├── Export Code     │                ├── Status Bar
├── Import Code     │                ├── Full Screen     F11
├── Recent          │                └── Command Palette Ctrl+Shift+P
└── Exit
```

### Panel: Loadout Tree

| Property | Value |
|----------|-------|
| **Purpose** | Show full build outline. Navigate to any slot. |
| **Width** | 220px default, collapsible to 40px icon rail |
| **Height** | Full window height (minus menu + status bar) |
| **Layout** | Vertical tree with expandable categories |
| **Scrolling** | Yes (when tree exceeds height) |
| **Collapse** | Click collapse button → icon rail (40px). Animate width. |
| **Context menus** | Right-click any item → context menu |
| **Drag behaviour** | Items are NOT rearrangeable. Drag focus item to canvas? No — click focuses. |
| **Keyboard** | Up/Down arrows, Enter to focus, Space to expand/collapse |
| **Empty state** | "No build loaded" text |

**Tree structure:**
```
☐ Warframe
  ├── [Equipped Name]                    ← Current item, clickable
  ├── Aura: [name or "Empty"]            ← Click to focus canvas on aura
  ├── Exilus: [name or "Empty"]
  ├── Mods: [count]/8
  ├── Arcanes: [count]/2
  ├── Shards: [count]/5
  ├── Helminth: [name or "Empty"]
  └── Exalted: [name or "None"]
☐ Primary
  └── [Weapon Name or "Empty"]
☐ Secondary
  └── ...
☐ Melee
  └── ...
☐ Companion
  └── [Comp Name or "Empty"]
    └── Weapon: [name or "Empty"]
☐ Config
  ├── Faction: [faction]
  ├── Enemy: [enemy or "None"]
  └── Buffs: [count]
```

**Visual:**
- Active item: highlighted with teal left border (2px)
- Empty slots: gray text, italic
- Equipped count badges: small circles with count

### Panel: Equipment Explorer

| Property | Value |
|----------|-------|
| **Purpose** | Browse and select equipment via drag or click |
| **Location** | Left zone (replaces Loadout Tree when expanded) |
| **Width** | 280px |
| **Layout** | Category sidebar (160px) + Item grid (flex) |
| **Scrolling** | Yes (item grid) |
| **Entry** | Button in loadout tree: "Browse" or search shortcut |
| **Context menus** | Right-click item → Equip, Favorite, View Details |
| **Drag behaviour** | Drag item from grid → drop on canvas or loadout tree |
| **Keyboard** | Arrow keys, Enter to select, Tab to leave |

**Empty states:**
- No warframes: "Game data not loaded"
- No results: "No results matching [query]"
- Empty category: "Nothing in this category"

### Panel: Build Canvas

| Property | Value |
|----------|-------|
| **Purpose** | Primary editing workspace. Never replaced. |
| **Layout** | Vertical stack (scrollable) |
| **Sections** | Header (sticky) → Quick Stats (sticky) → Special Row → Mod Grid → Arcanes → Shards → Helminth → Exalted |
| **Scrolling** | Yes (body only). Header + Quick Stats are sticky. |
| **Collapse** | Never (but Arcanes/Shards/Helminth sections are collapsible) |
| **Drop targets** | Mod slots, arcane slots, shard slots, helminth donor |
| **Keyboard** | Tab through all slots. Arrow keys within mod grid. |
| **Empty state** | Full-screen "No Build" illustration |

**Responsive behaviour:**
- Min width: 400px. Panel collapses shown as icon-only.
- Max width: unlimited (content is centered at 800px max)

### Panel: Inspector

| Property | Value |
|----------|-------|
| **Purpose** | Context-sensitive details for selected element |
| **Width** | 300px default, 360px when showing calc breakdown |
| **Layout** | Mode tabs + scrollable content |
| **Modes** | Overview (default), Stat Breakdown, Mod Details, Enemy Analysis |
| **Scrolling** | Yes |
| **Collapse** | Toggle button → 0px (animate width) |
| **Keyboard** | Tab through content. Up/Down within sections. |

**Mode: Overview (no selection)**
```
┌─────────────────────┐
│ Inspector            │
│ [Overview] [... ]   │
│                      │
│ Core Stats           │
│ ❤ 740  🛡 450       │
│ ⛨ 225  ⚡ 300       │
│ 🧱 42,580           │
│                      │
│ Ability Stats        │
│ STR ██████████ 200%  │
│ DUR █████    100%    │
│ RNG █████    100%    │
│ EFF ████████ 175%    │
│                      │
│ Set Bonuses          │
│ Augur: 2/4 (shield)  │
│                      │
│ Build Health         │
│ Capacity: 42/60 ✅   │
│ Matches: 6/8 ✅      │
│ Empty exilus: ⚠️    │
└─────────────────────┘
```

**Mode: Stat Breakdown (stat clicked)**
```
┌─────────────────────┐
│ Inspector            │
│ [Overview] [Stat]   │ ← "Stat" is active
│                      │
│ KB-003: EHP Formula  │
│ EHP = HP ×(1+A/300) │
│ + Shields             │
│                      │
│ ① Base: 740         │
│ ② Flat: +0          │
│ ③ Mult: ×1.000      │
│ ④ Final: 740        │
│                      │
│ Formula: 740 × 1.000 │
│ = 740                │
│                      │
│ Pipeline (8 effects) │ → expandable
│ Timeline             │ → expandable
└─────────────────────┘
```

### Panel: Status Bar

| Property | Value |
|----------|-------|
| **Purpose** | Build status and contextual info |
| **Height** | 24px (fixed) |
| **Layout** | Flexbox. Left: build name + save indicator. Right: contextual info |
| **Collapse** | Never |
| **Keyboard** | Not focusable (read-only) |

**Left:**
```
Build: My Excal Build  ●  |  MR 30
```
- Build name (clickable → rename)
- ● = saved, ○ = unsaved changes

**Right:**
```
EHP 42,580  |  Burst 128k  |  Enemy: Heavy Gunner  |  v2.0
```
- Dynamic — changes based on workspace and selected item

### Panel: Mod Browser

| Property | Value |
|----------|-------|
| **Purpose** | Browse, search, and drag mods onto the canvas |
| **Location** | Bottom zone |
| **Height** | 200px default, resizable |
| **Layout** | Horizontal: category tabs + filter bar + scrollable mod grid |
| **Scrolling** | Yes (mod grid) |
| **Entry** | Click "Mod Browser" in View menu, or drag to trigger area |
| **Source** | Drag mod cards from grid to canvas mod slots |
| **Keyboard** | Tab into grid, Arrow keys, Enter to select (places in first empty slot) |

**Mod card:**
```
┌──────────┐
│ [pole]   │ ← Polarity symbol (small, top-left)
│ Name     │ ← Truncated to one line
│ Drain 6  │ ← Drain cost
│          │
│ [owned]  │ ← Owned checkmark (if in inventory)
└──────────┘
Size: 48×56px
```

---

## 5. Complete Component Catalogue

### Component: Button

| Property | Specification |
|----------|--------------|
| **Sizes** | sm (24px), md (28px), lg (34px) |
| **Variants** | primary (teal bg), secondary (border), ghost (transparent), danger (red), holographic (cyan glow) |
| **States** | default, hover, active/pressed, disabled, loading |
| **Content** | Label + optional leading icon |
| **Keyboard** | Enter/Space to activate |
| **Accessibility** | `role="button"`, `aria-label` if icon-only, `aria-disabled` |
| **Animation** | Hover: 80ms bg transition. Active: scale(0.97). Loading: spinner replaces icon. |

### Component: Dropdown

| Property | Specification |
|----------|--------------|
| **Trigger** | Button or icon that opens menu |
| **Menu** | Floating panel, 200px min-width, 300px max |
| **Items** | Label + optional icon + optional shortcut + optional divider |
| **Position** | Below trigger, left-aligned |
| **States** | Item: default, hover, active, disabled |
| **Keyboard** | Arrow keys, Enter to select, Escape to close |
| **Accessibility** | `role="menu"`, `role="menuitem"` |
| **Animation** | Open: 120ms fade + translateY(-4px). Close: 80ms fade. |

### Component: Mod Slot

| Property | Specification |
|----------|--------------|
| **Size** | 52×64px |
| **States** | Empty, Filled, Matched Polarity, Mismatched, Drag Target, Dragging |
| **Empty** | Dashed border, polarity symbol faded, "+" indicator |
| **Filled** | Solid border, mod name (truncated), drain, rank dots, remove on hover |
| **Matched** | Green tint, green drain value |
| **Mismatched** | Red tint, red drain value |
| **Drag Target** | Cyan glow border, pulse animation |
| **Dragging** | Scale 0.9, opacity 0.3, elevated shadow |
| **Drop zones** | Every empty and filled slot is a drop target |
| **Keyboard** | Tab to focus, Enter to open selector, Delete to remove, +/- to rank |
| **Accessibility** | `role="button"`, `aria-label="Mod slot N. [mod name or Empty]. [polarity] polarity. Drain [N]."` |

**Rank dots:**
```
● ● ● ○ ○   (3 ranks out of 5 max)
```
● = filled, ○ = empty. Color = rarity color.

### Component: Capacity Bar

| Property | Specification |
|----------|--------------|
| **Layout** | Label + bar + numerical value |
| **Bar** | 4px height, rounded, teal fill. |
| **Colors** | <80% teal, 80-99% orange, 100% red, >100% red pulse |
| **Animation** | Fill transitions at 200ms ease-out. Color shifts at 1s. |
| **Keyboard** | Not interactive (display only). |
| **Accessibility** | `role="progressbar"`, `aria-valuenow`, `aria-valuemax` |

### Component: Stat Row

| Property | Specification |
|----------|--------------|
| **Height** | 20px (compact) or 24px (comfortable) |
| **Layout** | [icon] [label] [spacer] [value] |
| **States** | Default, Hover (pointer + subtle underline), Clicked (opens explorer) |
| **Animation** | Value changes flash in stat's color for 300ms |
| **Accessibility** | `role="button"`, `aria-label="{label}: {value}". Click to explore.` |

### Component: Search

| Property | Specification |
|----------|--------------|
| **Layout** | Icon + input + clear button |
| **States** | Default, Focused, Has results, No results, Loading |
| **Debounce** | 200ms after typing stops |
| **Results** | Grouped by category. Each result: icon + label + description |
| **Keyboard** | Type to search. Arrow keys. Enter to select. Escape to close. |
| **Accessibility** | `role="combobox"`, `aria-expanded`, listbox of results |

### Component: Tabs

| Property | Specification |
|----------|--------------|
| **Height** | 28px |
| **Active indicator** | 2px bottom border in accent color |
| **Layout** | Horizontal row, scrollable if overflow |
| **States** | Default (muted), Hover (subtle bg), Active (accent text + border) |
| **Animation** | 120ms color transition on tab switch |
| **Keyboard** | Arrow keys to switch, Home/End for first/last |

### Component: Tooltip

| Property | Specification |
|----------|--------------|
| **Delay** | 400ms (appear), 200ms (disappear) |
| **Position** | Auto — prefers top, falls back to bottom, left, right |
| **Width** | Max 260px |
| **Content** | Text only (can include line breaks). No interactive elements. |
| **Animation** | Fade in 120ms |
| **Accessibility** | Tooltip content must be available via `aria-describedby` |

### Component: Context Menu

| Property | Specification |
|----------|--------------|
| **Trigger** | Right-click on supported elements |
| **Position** | At cursor position, clamped to viewport |
| **Items** | Actions (label + optional icon + optional shortcut) + disabled items + dividers |
| **Keyboard** | Arrow keys, Enter, Escape |
| **Animation** | 120ms fade + translate |
| **Accessibility** | `role="menu"`, `role="menuitem"` |

### Component: Modal

| Property | Specification |
|----------|--------------|
| **Backdrop** | rgba(0,0,0,0.6), backdrop-filter: blur(3px) |
| **Position** | Center screen |
| **Width** | Varies (400px for small, 600px for medium, 800px for large) |
| **Max height** | 80vh |
| **Content** | Title bar + body + optional footer |
| **Keyboard** | Escape to close. Tab trap inside. Enter on primary action. |
| **Animation** | Open: 200ms fade + scale(0.95→1). Close: 150ms fade. |
| **Accessibility** | Focus trap, `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |

### Component: Progress Bar

| Property | Specification |
|----------|--------------|
| **Height** | 4px (inline) or 8px (featured) |
| **Fill** | Animated width at 300ms ease-out |
| **Colors** | Teal (normal), Orange (warning), Red (critical) |
| **Accessibility** | `role="progressbar"` |

### Component: Badge

| Property | Specification |
|----------|--------------|
| **Sizes** | 14px, 18px, 22px, 28px |
| **Variants** | Polarity, Rarity, Faction, Damage, Status, Count |
| **Layout** | Icon or text, centered in container |
| **States** | Default, Active (colored), Inactive (muted) |

### Component: Drag Handle (Splitter)

| Property | Specification |
|----------|--------------|
| **Orientation** | Vertical (between left/center, center/right) and Horizontal (center/bottom) |
| **Width** | 3px vertical, 4px horizontal |
| **Visual** | Invisible (default). On hover: cyan line (1px). On drag: cyan line + glow. |
| **Cursor** | col-resize / row-resize |
| **Range** | Configurable min/max per panel |
| **Keyboard** | Arrow keys on focus (±1px, ±10px with Shift) |
| **Persistence** | Width saved to localStorage per panel |

---

## 6. Drag & Drop System

### Drag Sources

| Element | Type | Behaviour |
|---------|------|-----------|
| Mod card (Mod Browser) | `MOD_CARD` | Ghost follows cursor. Snaps to slot. |
| Equipment thumbnail (Explorer) | `EQUIPMENT` | Ghost follows cursor. Lands on canvas header. |
| Mod slot (filled, on canvas) | `MOD_CARD` | Can drag to reorder. Can drag back to browser to remove. |

### Drop Targets

| Target | Accepts | Behaviour |
|--------|---------|-----------|
| Empty mod slot | `MOD_CARD` | Places mod. Highlights if polarity matches. |
| Filled mod slot | `MOD_CARD` | Swaps mods. Old mod returns to browser. |
| Equipment header | `EQUIPMENT` | Changes equipped item. |
| Mod Browser | `MOD_CARD` (from canvas) | Removes mod from slot. |

### Visual Feedback

| State | Visual |
|-------|--------|
| Drag start | Source: scale(0.9), opacity(0.3), elevated. Ghost: under cursor, opacity(0.7). |
| Drag over valid target | Target: cyan border glow, pulse. |
| Drag over invalid target | Target: no change. Cursor: not-allowed. |
| Drop on valid target | Brief spring bounce. |
| Drop on invalid target | Ghost returns to origin with spring. |
| Keyboard move | Same visual as drag, but no ghost (mod teleports). |

### Undo Integration

Every drag operation creates an undo command:
- `PLACE_MOD` — records slot index + previous content (if swap)
- `REMOVE_MOD` — records slot index + mod data
- `SWAP_MOD` — records both slots' content

---

## 7. Interaction Catalogue

| # | Interaction | Trigger | Response | Visual Feedback | Keyboard Alt |
|---|-------------|---------|----------|-----------------|-------------|
| 1 | Hover stat | Mouse enter | Pointer cursor + subtle underline | 80ms color change | Focus via Tab |
| 2 | Click stat | Mouse click | Open Stat Breakdown in Inspector | Inspector switches mode, 200ms | Enter when focused |
| 3 | Hover mod slot | Mouse enter | Highlight border, show rank controls | 80ms border change | Focus via Tab |
| 4 | Click empty slot | Mouse click | Open Mod Browser if not in drag mode | Browser opens in bottom zone | Enter when focused |
| 5 | Right-click mod | Mouse right-click | Context menu with actions | Menu appears at cursor position | Shift+F10 |
| 6 | Click filled slot | Mouse click | Select mod, show details in Inspector | Inspector switches to Mod Details | Enter |
| 7 | Double-click slot | Mouse double-click | Remove mod (quick action) | Mod animates out, 200ms | Delete key |
| 8 | Drag mod from browser | Mouse drag + drop | Place mod in target slot | Ghost + drop animation | Arrow + Enter |
| 9 | Ctrl+Z | Keyboard | Undo last action | Brief flash on affected value | — |
| 10 | Ctrl+Shift+Z | Keyboard | Redo last action | Brief flash on affected value | — |
| 11 | Ctrl+S | Keyboard | Save build | Status bar dot turns green, toast | — |
| 12 | Ctrl+K | Keyboard | Open Global Search | Overlay appears | — |
| 13 | Ctrl+Shift+P | Keyboard | Open Command Palette | Overlay appears | — |
| 14 | Escape | Keyboard | Close overlay or reset inspector | Reverse animation | — |
| 15 | 1-7 (no mod) | Keyboard | Switch focus slot | Canvas updates, Loadout Tree highlights | — |
| 16 | Arrow keys (explorer) | Keyboard | Navigate item grid | Scroll into view, highlight | — |
| 17 | Enter (explorer) | Keyboard | Select item | Focuses canvas on item | — |
| 18 | Scroll wheel | Mouse wheel | Scroll panel content | Native scroll | Page Up/Down |
| 19 | Right-click stat | Mouse right-click | Context menu: "Explore", "Copy Value", "Pin to Sidebar" | Menu appears | — |
| 20 | Right-click panel header | Mouse right-click | Context menu: "Collapse", "Dock Left", "Dock Right", "Close" | Menu appears | — |

---

## 8. Animation Catalogue

| # | Animation | Trigger | Duration | Easing | Property | Accessibility |
|---|-----------|---------|----------|--------|----------|---------------|
| A-01 | Panel expand | Open panel | 200ms | Decelerate | max-height, opacity | Respect reduced motion |
| A-02 | Panel collapse | Close panel | 150ms | Accelerate | max-height, opacity | Respect reduced motion |
| A-03 | Dropdown open | Click trigger | 120ms | Decelerate | opacity, transform | None |
| A-04 | Dropdown close | Click away | 80ms | Accelerate | opacity | None |
| A-05 | Modal open | Trigger | 200ms | Decelerate | opacity, transform | Respect reduced motion |
| A-06 | Modal close | Escape/action | 150ms | Accelerate | opacity | Respect reduced motion |
| A-07 | Stat change | Build updates | 300ms | Standard | color | None |
| A-08 | Mod drag start | Begin drag | 120ms | Standard | transform, opacity | None |
| A-09 | Mod drag end | Drop | 200ms | Spring | transform, opacity | None |
| A-10 | Tab switch | Click tab | 120ms | Standard | color | None |
| A-11 | Search results | Typing (200ms debounce) | 120ms | Decelerate | opacity, transform | None |
| A-12 | Workspace switch | Menu command | 200ms | Standard | opacity | Respect reduced motion |
| A-13 | Save indicator | Save | 200ms | Standard | color | None |
| A-14 | Toast appear | Action | 200ms | Decelerate | opacity, transform | None |
| A-15 | Toast disappear | Auto (2s) | 200ms | Accelerate | opacity | None |
| A-16 | Capacity fill | Mod change | 200ms | Standard | width | None |
| A-17 | Loadout Tree expand | Click arrow | 150ms | Decelerate | max-height | Respect reduced motion |
| A-18 | Loadout Tree collapse | Click arrow | 100ms | Accelerate | max-height | Respect reduced motion |
| A-19 | Error boundary | Error caught | 200ms | Standard | opacity | None |
| A-20 | Loading shimmer | Data loading | 1.5s loop | Linear | background-position | `prefers-reduced-motion: stop` |

---

## 9. Complete User Journeys

### Journey 1: Create First Build

```
1. User opens TennoDex
   → Splash screen → loading → Theorycraft workspace (empty)
   
2. User sees "No Build" empty state
   → "Select a Warframe from the Equipment Explorer or press Ctrl+K to search."
   
3. User presses Ctrl+K
   → Global Search overlay opens, focused on input
   
4. User types "Excalibur"
   → Results: Warframe > Excalibur, Excalibur Prime, Excalibur Umbra
   
5. User clicks "Excalibur"
   → Search closes
   → buildStore.setWf({ id: '/Lotus/Powersuits/Excalibur/Excalibur' })
   → Canvas updates: shows Excalibur header + empty mod grid
   → Loadout Tree updates: Warframe → Excalibur
   → Inspector shows: Overview tab with Excalibur base stats
   → Status bar updates: EHP changes
   
6. User opens Mod Browser (Ctrl+B?)
   → Bottom zone opens with Mod Browser
   → Shows mods filtered by Warframe category
   
7. User finds "Vitality", drags to empty mod slot
   → Mod snaps to slot
   → Drain appears (14)
   → Capacity bar updates (14/60)
   → Stats recalculate: Health shows 740
   → Inspector shows Health: 740 in Overview
   
8. User clicks the Health stat
   → Inspector switches to Stat Breakdown
   → Shows: Base 100 → +640 (Vitality) → Final 740
   → KB-002 reference displayed
   
9. User is delighted
```

**Key interactions**: Search → Click → Drag → Click → Explore
**Total clicks**: 5 (search, click result, drag, drop, click stat)
**vs Current**: 13+ clicks

### Journey 2: Replace Mod

```
1. User right-click on a filled mod slot
   → Context menu: [Rank Up] [Rank Down] [Remove] [Replace] [Polarity]
   
2. User clicks "Replace"
   → Mod Browser opens, filtered to compatible mods
   → Current mod highlighted as "selected"
   
3. User finds new mod, clicks it
   → Old mod removed (undoable)
   → New mod placed
   → Stats recalculate
   → Delta indicator shows changes
```

### Journey 3: Change Weapon

```
1. In Loadout Tree, user clicks "Primary"
   → Canvas focuses on Primary slot
   → Shows empty weapon state
   
2. User drags "Braton Prime" from Equipment Explorer to canvas header
   → Weapon equipped
   → Canvas shows Braton Prime with empty mod grid
   → Mod Browser filters to primary mods
```

### Journey 4: Compare Builds

```
1. File → Save As → "Excal Tank Build"
   → Build saved to project store
   
2. User makes changes (swap mods, change arcane)
   
3. File → Save As → "Excal DPS Build"
   → Second build saved
   
4. View → Workspace → Comparison
   → Two canvases appear side by side
   → Left: "Excal Tank Build" (current), Right: "Excal DPS Build"
   → Delta Inspector shows differences
   → Green = improvement, Red = regression
   
5. User decides Tank build is better
   → Clicks "Apply Left to Right" or closes without saving
```

### Journey 5: Simulate Against Enemy

```
1. View → Workspace → Enemy Lab
   → Enemy config appears below canvas quick stats
   → Inspector shows Enemy Analysis tab
   
2. User selects "Heavy Gunner" from enemy dropdown
   → Enemy stats populate
   → Weapon TTK updates
   
3. User adjusts enemy level to 150
   → EHP recalculates
   → TTK recalculates in real time
   → Damage type effectiveness updates
   
4. User sees Corrosive is most effective (+75%)
   → User considers swapping mods for more Corrosive damage
```

---

## 10. Error Handling

### Error: No Internet

| Property | Value |
|----------|-------|
| **Detect** | WFCD data fails to load, CDN images fail |
| **User message** | "Some features require an internet connection. Game data is cached." |
| **Fallback** | Use cached game-data.json. Show placeholder for images. |
| **Recovery** | Retry connection every 30s. When restored, show toast: "Connection restored." |

### Error: Corrupt Project

| Property | Value |
|----------|-------|
| **Detect** | JSON parse failure in localStorage project |
| **User message** | "One of your saved builds could not be loaded. It may be corrupted." |
| **Fallback** | Delete corrupt entry. Show remaining projects. |
| **Recovery** | User can re-import from backup code. |

### Error: Missing Game Data

| Property | Value |
|----------|-------|
| **Detect** | `@wfcd/items` returns 0 items |
| **User message** | "Game data failed to load. The app cannot function without it." |
| **Fallback** | Show error screen with "Retry" and "Report" buttons. |
| **Recovery** | Retry loads data. If still fails, restart the application. |

### Error: Import Failure

| Property | Value |
|----------|-------|
| **Detect** | Build codec fails to parse tndx1: string |
| **User message** | "This code could not be imported. It may be from a different version." |
| **Fallback** | Show error in import modal. Do not clear input. |
| **Recovery** | User can edit code and retry. |

### Error: Calculation Error

| Property | Value |
|----------|-------|
| **Detect** | Exception in calculateBuild() |
| **User message** | No user-facing message. Stat shows "—" or "ERR" |
| **Fallback** | Catch error, log to console, show stale result if available |
| **Recovery** | Undo last action. |

### Error Boundary Strategy

```
App
└── ErrorBoundary (catches all, shows "Something went wrong" + reload)
    ├── MenuBar (no boundary — if broken, app is broken)
    ├── Workspace
    │   ├── LeftZone (ErrorBoundary per panel)
    │   │   ├── LoadoutTree (isolated error)
    │   │   └── EquipmentExplorer (isolated error)
    │   ├── CenterZone
    │   │   └── BuildCanvas (ErrorBoundary — shows "Canvas error" + reset)
    │   └── RightZone
    │       └── Inspector (ErrorBoundary — shows "Inspector error")
    ├── BottomZone
    │   └── ModBrowser (ErrorBoundary)
    └── StatusBar (no boundary — too small)
```

Each ErrorBoundary shows: error icon + "This panel encountered an error" + [Reload Panel] button.

---

## 11. Asset Placement Guide

| Asset | Location | Format | Notes |
|-------|----------|--------|-------|
| App icon | Electron assets/installer | PNG/ICO | 256/64/32/16px |
| Splash | Start screen background | PNG 800×600 | Dark, logo centered |
| Empty build | Canvas empty state | SVG | Wireframe warframe |
| Empty results | Search empty state | SVG | Wireframe magnifier |
| Empty enemy | Enemy Lab empty | SVG | Wireframe enemy |
| Loading wireframe | Loading screens | Lottie | 4-phase assembly |
| Background noise | Panel backgrounds | PNG 512×512 tile | 0.5% opacity |
| KB diagrams | Knowledge Base | SVG | Formula illustrations |
| Stat icons | Every stat row | SVG 16×16 | All 30+ stats |
| Damage icons | Damage displays | SVG 16×16 | All 14 types |
| Polarity symbols | Mod slots | SVG 16×16 | 6 symbols |
| Faction icons | Enemy config | SVG 20×20 | 7 factions |
| School icons | Focus config | SVG 20×20 | 5 schools |
| Shard swatches | Shard config | SVG 12×12 | 6 colors |
| Rarity indicators | Mod cards | SVG 12×48 | 4 rarities |

---

## 12. Frontend Folder Architecture

```
src/
├── app/                          # Application root
│   ├── App.tsx                   # Root component
│   └── WorkspaceShell.tsx         # Workspace orchestrator
│
├── components/                   # Shared UI primitives
│   ├── ui/                       # Design System components
│   │   ├── Button/
│   │   ├── Dropdown/
│   │   ├── Input/
│   │   ├── Search/
│   │   ├── Modal/
│   │   ├── Tooltip/
│   │   ├── Toast/
│   │   ├── Badge/
│   │   ├── ProgressBar/
│   │   ├── StatRow/
│   │   ├── Tabs/
│   │   ├── Panel/
│   │   ├── DragHandle/
│   │   ├── ScrollArea/
│   │   ├── Separator/
│   │   ├── ContextMenu/
│   │   ├── Collapsible/
│   │   └── Skeleton/
│   └── icons/                    # SVG sprite + icon components
│       ├── sprite.svg
│       └── Icon.tsx
│
├── features/                     # Feature modules
│   ├── build-planner/            # Primary feature
│   │   ├── panels/               # Registered panels
│   │   ├── surfaces/             # Build canvas surfaces
│   │   ├── components/           # Build-specific components
│   │   ├── hooks/                # Build-specific hooks
│   │   ├── services/             # Build codec, riven store
│   │   ├── data/                 # Display constants, stat maps
│   │   └── model.ts              # Feature types
│   ├── loadout-tree/             # Loadout Tree panel
│   ├── equipment-explorer/       # Equipment Explorer panel
│   ├── mod-browser/              # Mod Browser panel
│   ├── inspector/                # Inspector panel
│   ├── calc-explorer/            # Calculation Explorer
│   ├── enemy-lab/                # Enemy Lab feature
│   ├── comparison/               # Build Comparison
│   ├── command-palette/          # Command Palette
│   ├── global-search/            # Global Search
│   ├── knowledge-base/           # Knowledge Base viewer
│   └── settings/                 # Settings (future)
│
├── engine/                       # Calculation engine (FROZEN)
│   ├── stat-processor/
│   └── systems/
│
├── data/                         # Game data
│   ├── game-data.json
│   └── game-data.ts
│
├── store/                        # Zustand stores
│   ├── buildStore.ts
│   ├── uiStore.ts
│   ├── libraryStore.ts
│   ├── projectStore.ts
│   └── undoStore.ts
│
├── hooks/                        # Shared hooks
│   ├── useBuildPlannerStore.ts
│   └── useGameData.ts
│
├── styles/                       # Global styles
│   ├── tokens.css                # Design tokens
│   ├── reset.css                 # CSS reset
│   ├── workbench.css             # Layout grid
│   └── animations.css            # Keyframes
│
├── utils/                        # Utilities
│   ├── assets.ts
│   └── logger.ts
│
└── __tests__/                    # Test files
    ├── components/
    ├── features/
    ├── stores/
    └── integration/
```

---

## 13. Performance Rules

### Rule 1: Store Slice Subscriptions

Components must subscribe to the minimum store slice. A component that needs `result.health` must NOT re-render when `result.energy` changes.

```typescript
// ✅ Correct
const health = useBuildStore(s => s.result?.health);

// ❌ Wrong
const result = useBuildStore(s => s.result);
```

### Rule 2: Virtual Scrolling

Lists over 50 items must use virtualization. This applies to:
- Mod Browser grid (1800+ mods)
- Equipment Explorer grid (500+ items)
- Search results (any number)

Use `react-virtuoso` with estimated item sizes.

### Rule 3: Lazy Loading

Lazy load everything that is not visible on first render:
- Equipment Explorer panel
- Mod Browser panel
- Enemy Lab controls
- Comparison workspace
- History panel
- Settings
- Knowledge Base

Use React.lazy() + Suspense.

### Rule 4: Memoisation

Memoise:
- All panel components (React.memo)
- All callback handlers (useCallback)
- All computed values (useMemo)
- All store selectors (useShallow for object selectors)

### Rule 5: Image Loading

- CDN images: `loading="lazy"` + blur-up placeholder
- SVG icons: Inline SVG sprite (no HTTP requests per icon)
- Background textures: CSS background-image with `image-set`

### Rule 6: Render Boundaries

Keep each panel as an independent render root. A change in the Inspector must NOT cause the Build Canvas to re-render.

This is achieved by:
- Panels subscribe to store slices independently
- React components are wrapped in React.memo
- Store selectors return primitive values when possible

### Rule 7: Animation Performance

- Use CSS transforms and opacity only (no layout-triggering properties)
- Use `will-change: transform` on animated elements
- GPU-accelerated properties: transform, opacity
- Avoid animating: width, height, top, left, margin, padding

---

## 14. Accessibility Specification

### Keyboard Navigation Order

Global Tab order (top to bottom, left to right):

```
1. Menu Bar (File | Edit | View | Workspace | Help)
2. Loadout Tree (first visible item)
3. Build Canvas (header → quick stats → mod slots → arcanes → shards → helminth)
4. Inspector tabs
5. Inspector content
6. Status Bar (not tabbable, read-only)
```

When a panel is focused, Tab cycles within that panel before moving to the next.

### Focus Indicators

Every focusable element must have a visible focus ring:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

Focus rings must have a minimum 3:1 contrast ratio against the background.

### Screen Reader Labels

| Element | ARIA | Label |
|---------|------|-------|
| Mod slot | `role="button"` | `aria-label="Mod slot 1. Empty. Madurai polarity."` |
| Stat value | — | `aria-label="Health: 740"` |
| Stat row | `role="button"` | `aria-label="{label}: {value}. Click to explore calculation."` |
| Panel | `role="region"` | `aria-label="Inspector"` |
| Tab list | `role="tablist"` | — |
| Tab | `role="tab"` | `aria-selected` |
| Search | `role="combobox"` | `aria-expanded` |
| Results | `role="listbox"` | — |
| Result item | `role="option"` | `aria-selected` |
| Progress bar | `role="progressbar"` | `aria-valuenow`, `aria-valuemax` |
| Drag source | `role="button"` | `aria-label="Drag to reorder"` + `aria-dropeffect` |
| Toast | `role="alert"` | `aria-live="assertive"` |
| Modal | `role="dialog"` | `aria-modal="true"`, `aria-labelledby` |

### Live Region

Stat changes should be announced:

```html
<div aria-live="polite" aria-atomic="true">
  <!-- Updated stat values render here -->
</div>
```

Only announce the stat that changed, not all stats.

---

## 15. Testing Strategy

### Unit Tests (Vitest)

| Target | Coverage Goal | Examples |
|--------|---------------|----------|
| Stores | 100% of actions | `buildStore.setWf`, `uiStore.toggleSidebar` |
| Utils | 100% | `formatStatValue`, `calcModCost` |
| Components | 80% | Button states, Modal open/close, StatRow click |
| Drag logic | 100% | Mod placement, swap, remove |

### Integration Tests

| Target | Coverage | Examples |
|--------|----------|----------|
| Mod placement flow | 1 happy path | Drag mod → slot → stat updates → inspector updates |
| Workspace switching | 1 per workspace | Switch to Enemy Lab → panels change |
| Save/Load | 1 per action | Save build → reload → same stats |
| Import/Export | 1 per codec | Export tndx1 → import → same build |

### E2E Tests (Playwright)

| Flow | Priority |
|------|----------|
| Create full build | P0 |
| Save and reload | P0 |
| Compare two builds | P1 |
| Import from code | P1 |
| Keyboard navigation | P2 |

### Testing Best Practices

- Use Testing Library queries (getByRole, getByText) — not test IDs
- Test user behaviour, not implementation details
- Store tests: dispatch action → assert state change
- Component tests: render → simulate interaction → assert DOM change

---

## 16. Implementation Order

### Phase 1: Foundation (Weeks 1-2)

```
Priority Order:
1. Menu Bar component + File menu actions
2. Store architecture (undoStore, fix all store subscriptions)
3. Command stack (undo/redo)
4. Drag and drop (@dnd-kit integration)
5. Mod Browser (bottom zone) with drag source
6. Mod Slot component (all states)
```

**Risks:** Drag-and-drop may need iteration. Start with simple cases (mod→slot).

### Phase 2: Core Workspace (Weeks 3-5)

```
7. Loadout Tree panel (left zone)
8. Build Canvas (center zone) — static layout
9. Canvas drop targets (mod slots accept drops)
10. Equipment Explorer panel
11. Equipment drag-to-equip
12. Inspector panel (Overview mode)
```

**Risks:** Loadout Tree and new navigation must coexist with old slot switcher initially.

### Phase 3: Inspector & Explorer (Weeks 6-7)

```
13. Inspector — Stat Breakdown mode
14. Inspector — Mod Details mode
15. Global Search
16. Command Palette
17. Context menus (mods, equipment, stats, panels)
```

**Risks:** Context menus on 4 element types is significant. Build generically.

### Phase 4: Workspaces (Weeks 8-9)

```
18. Workspace switching (state management)
19. Enemy Lab workspace
20. Comparison workspace
21. Presentation workspace
22. Minimal workspace
23. Panel collapse/expand/dock
```

### Phase 5: Polish (Weeks 10-11)

```
24. All animations and transitions
25. Empty states
26. Error boundaries
27. Accessibility pass
28. Performance pass (virtual scrolling, memoisation)
29. SVG icon sprite
```

### Phase 6: Remaining Features (Weeks 12-14)

```
30. Knowledge Base panel
31. Build history
32. Auto-save
33. Settings (future)
34. Bug fixes, edge cases, final QA
```

---

## 17. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R-01 | Drag-and-drop flakiness in Electron | Medium | High | Add click-to-place as fallback. Test on Windows/macOS/Linux. |
| R-02 | Undo stack memory usage | Low | Medium | Cap at 100 entries. Warn at 90. |
| R-03 | Mod Browser performance with 1800+ items | Medium | High | Virtual scroll + category pre-filter. Test with worst case. |
| R-04 | Store subscription leaks cause re-render storms | Medium | High | Use Zustand `useShallow`. Audit with React DevTools. |
| R-05 | Workspace switching causes flicker | Medium | Medium | Pre-render panels off-screen. Transition opacity only. |
| R-06 | Keyboard-only users blocked | Medium | High | Test full Tab flow each sprint. Screen reader test before release. |
| R-07 | SVG icon sprite too large | Low | Medium | Remove unused icons. Lazy-load rarely-used icons. |
| R-08 | Backward compatibility with old save format | Low | Medium | Version migration in build codec. |

---

## 18. Frontend Completion Checklist

### Per-Component Checklist

```
□ All visual states implemented (default, hover, active, disabled, loading, error)
□ Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
□ Screen reader label present
□ Focus ring visible
□ Respects reduced motion
□ Correct design tokens used (no hardcoded values)
□ Handles text overflow
□ Handles missing data (null/undefined props)
```

### Per-Panel Checklist

```
□ Purpose documented and clear
□ All empty states implemented
□ All error states implemented
□ Loading state implemented (where applicable)
□ Workspace switching handled
□ Collapse/expand animated
□ Keyboard navigation full (Tab in → Tab out)
□ Drag targets accept correct types
```

### Per-Feature Checklist

```
□ Store actions all create undo commands
□ All errors caught (try/catch or error boundary)
□ Feature-flagged (can be disabled without breaking other features)
□ Tested on Windows + macOS
□ No console warnings in production
□ Performance profiled (< 16ms per frame)
```

### Pre-Release Checklist

```
□ All 34 existing tests pass
□ All new feature tests pass
□ Keyboard navigation full pass (no Tab traps)
□ Screen reader full pass (ChromeVox or NVDA)
□ Reduced motion respected (Windows setting)
□ 200% zoom does not break layout
□ Color blindness simulation passes (no color-only indicators)
□ All empty states shown (no blank panels)
□ All error boundaries tested (force error per panel)
□ Drag-and-drop tested: mod→slot, slot→slot, slot→browser
□ Undo/redo tested: 100 operations in sequence
□ Save/Load roundtrip tested
□ Import/Export roundtrip tested
□ All 5 workspaces switch correctly
□ SVG icons render correctly (no missing icons)
```

---

*End of Frontend Implementation Bible*
