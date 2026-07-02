# TennoDex — Information Architecture & Desktop Workflow Redesign

**Date:** 2 July 2026  
**Author:** Chief Product Architect  
**Status:** Architectural Blueprint — READY FOR IMPLEMENTATION  
**Inspired by:** Blender, JetBrains Rider, VS Code, Figma, Photoshop, Unreal Engine

---

## Table of Contents

1. Executive Summary
2. Desktop Philosophy
3. Complete Information Architecture
4. Workspace Architecture
5. Panel Architecture
6. Build Workflow Redesign
7. Information Hierarchy
8. Cognitive Load Analysis
9. Desktop Benchmark Study
10. Migration Plan
11. Implementation Roadmap

---

## 1. Executive Summary

### Audit Validation

The UX Audit was correct on 18 of 20 issues. Two findings are revised:

| Audit Finding | Verdict | Revision |
|--------------|---------|----------|
| P-001: No drag-and-drop | ACCEPTED | Root cause: interaction model is click-to-place instead of drag-to-place |
| P-002: No undo/redo | ACCEPTED | Root cause: no command pattern in the frontend |
| P-003: Overlapping panels | ACCEPTED | Root cause: panels were added incrementally without architectural review |
| P-016: Emoji as icons | **REVISED** | Emoji are acceptable for beta. Replace during icon system build. |

### Core Insight

The fundamental problem is not the visual design. It is not the color scheme. It is not the fonts.

**The fundamental problem is that TennoDex uses a web-page navigation model (slot switching) instead of a desktop editing model (direct manipulation).**

Every other issue — the overlapping panel responsibilities, the hidden features, the excessive clicks, the cognitive load — stems from this single architectural decision.

The solution is not to make the current layout prettier. The solution is to **change the interaction model** from "navigate → select → edit" to "browse → drag → see results."

### Design Principles

```
1. Direct Manipulation over Navigation
2. Persistent Context over Page Switching
3. Keyboard-First over Click-Only
4. Visual Feedback over Silent Calculation
5. Progressive Disclosure over Information Dumping
6. Undo Everything over Permanent Actions
7. Browse and Drag over Search and Select
8. Panels over Pages
9. Workspaces over Modes
10. Explain Everything over Trust Me
```

---

## 2. Desktop Philosophy

### What Should Always Remain Visible

| Element | Rationale |
|---------|-----------|
| Build Canvas | The primary workspace. The user's build should never disappear. |
| Loadout Tree | A compact tree/list of all equipped items. Always visible so users know their full loadout. |
| Quick Stats | The 8 most important stats (HP, Shield, Armor, Energy, EHP, STR, DUR, EFF). Always visible. |
| Menu Bar | File/Edit/View/Help. Standard desktop convention. |
| Status Bar | Build name, save status, calculation status, last saved. |

### What Should Only Appear When Needed

| Element | Trigger |
|---------|---------|
| Equipment Explorer | User wants to change equipment or browse for new items |
| Mod Library | User is adding a mod (triggered by drag gesture or + button) |
| Calculation Explorer | User clicks a stat value |
| Enemy Lab | User enables enemy testing |
| Build Comparison | User selects "Compare" |
| Search | User presses Ctrl+K |
| Command Palette | User presses Ctrl+Shift+P |

### What Deserves Permanent Screen Space

**The Build Canvas** — always. Never hidden. Never replaced by another surface.

**The Loadout Tree** — a compact sidebar element showing the full loadout hierarchy.

**Quick Stats** — a compact bar showing the most important numbers.

### What Deserves Contextual Screen Space

**The Inspector** — contextually shows:
- When selecting a mod: mod details, breakdown, alternatives
- When selecting a stat: full calculation breakdown
- When selecting an enemy: enemy stats, TTK analysis
- In comparison mode: delta view

**The Equipment Explorer** — replaces the current "surface switching" model. Instead of switching the entire center area, the explorer opens as a panel overlay with drag-to-equip.

### What Should Never Become a Popup

- Mod selection (should be drag-and-drop, not popup)
- Stat explanation (should be persistent inspector, not modal)
- Build comparison (should be split workspace, not modal)

### What Should Become Dockable

- Equipment Explorer
- Mod Library
- Calculation Explorer
- Enemy Lab
- Build Comparison

### What Should Become a Workspace

| Workspace | Panels Visible |
|-----------|---------------|
| Theorycraft | Canvas, Loadout Tree, Inspector, Quick Stats |
| Enemy Lab | Canvas, Loadout Tree, Inspector, Enemy Config, Enemy Stats |
| Comparison | Canvas (left), Canvas (right), Delta Inspector |
| Presentation | Canvas only (full screen) |
| Analysis | Canvas, Inspector (full calculation mode), Timeline |
| Minimal | Canvas, Quick Stats |

---

## 3. Complete Information Architecture

### Top-Level Navigation

```
┌─────────────────────────────────────────────────────────┐
│ ⬡ TennoDex  File  Edit  View  Workspace  Help          │
├─────────────────────────────────────────────────────────┤
│ [Loadout Tree]  │  [Build Canvas]  │  [Inspector]      │
│                  │                   │                   │
│  Warframe        │  8 mod slots     │  Context-sensitive │
│  ├─ Aura         │  Arcanes         │  details, stats,   │
│  ├─ Exilus       │  Shards          │  breakdowns        │
│  ├─ Mods (8)     │  Helminth        │                    │
│  ├─ Arcanes (2)  │  Exalted         │                    │
│  ├─ Shards (5)   │                  │                    │
│  ├─ Helminth     │                  │                    │
│  Primary         │                  │                    │
│  Secondary       │                  │                    │
│  Melee           │                  │                    │
│  Companion       │                  │                    │
│  Arch-Gun        │                  │                    │
│  Arch-Melee      │                  │                    │
├─────────────────────────────────────────────────────────┤
│ Status Bar: Build Name │ Saved │ MR 30 │ EHP 42,580      │
└─────────────────────────────────────────────────────────┘
```

### Workspace Hierarchy

```
Desktop
├── Menu Bar (File | Edit | View | Workspace | Help)
├── Workspace (primary grid)
│   ├── Left Zone (collapsible, 220px default)
│   │   ├── Loadout Tree (always visible when expanded)
│   │   └── Equipment Explorer (tab in left zone)
│   ├── Center Zone (flexible)
│   │   └── Build Canvas (always visible)
│   │       ├── Equipment Header (name, capacity, selector)
│   │       ├── Quick Stats (8 core stats, always visible)
│   │       ├── Mod Grid (8 slots)
│   │       ├── Special Sections (Arcanes, Shards, Helminth)
│   │       └── Exalted Indicator
│   ├── Right Zone (collapsible, 300px default)
│   │   └── Inspector
│   │       ├── Context Panel (changes based on selection)
│   │       └── Calculation Explorer (tab in inspector)
│   └── Bottom Zone (collapsible, 120px default)
│       └── Equipment Explorer / Mod Library
│           ├── Browser (category tree + grid)
│           └── Search (universal)
└── Status Bar (always visible, 24px)
```

### Equipment Hierarchy

```
Loadout
├── Warframe
│   ├── Passive (read-only)
│   ├── Abilities (read-only, STR/DUR/RNG/EFF driven)
│   ├── Aura Mod
│   ├── Exilus Mod
│   ├── Normal Mods (8)
│   ├── Arcanes (2)
│   ├── Shards (5)
│   ├── Helminth Ability
│   └── Exalted Weapon (if applicable)
│       ├── Exilus Mod
│       ├── Normal Mods (8)
│       └── Arcanes (1)
├── Primary Weapon
│   ├── Exilus Mod
│   ├── Normal Mods (8)
│   └── Arcanes (2)
├── Secondary Weapon (same structure)
├── Melee Weapon (same structure)
├── Companion
│   ├── Precepts
│   └── Companion Weapon
│       ├── Normal Mods (8)
│       └── Arcanes (1)
├── Arch-Gun
├── Arch-Melee
├── Operator
│   ├── Focus School
│   ├── Focus Nodes
│   └── Operator Arcane
└── Config
    ├── Target Faction
    ├── Enemy Target
    ├── Conditional Triggers
    └── Squad Buffs
```

### Knowledge Hierarchy

```
Knowledge Base
├── Warframe Mechanics (KB-001 to KB-006)
│   ├── Base Stats
│   ├── Final Stats
│   ├── EHP
│   ├── Ability Stats
│   ├── Energy Cost
│   └── Passives
├── Weapon Mechanics (KB-010 to KB-020)
│   ├── Base Damage & CO
│   ├── Faction Multiplier
│   ├── Crit Chance/Mult
│   ├── Status Chance
│   ├── Multishot
│   ├── Fire Rate
│   ├── DPS Formulas
│   └── ...
├── Damage Over Time (KB-030 to KB-034)
│   ├── Slash
│   ├── Heat
│   ├── Toxin
│   ├── Gas
│   └── Electric
├── Enemy Systems (KB-040 to KB-047)
├── Survivability (KB-050 to KB-053)
├── Special Weapons (KB-060 to KB-062)
├── Companion (KB-070 to KB-071)
├── Focus (KB-080 to KB-081)
├── Arcane (KB-090)
├── Effect Engine (KB-100)
├── Polarity & Capacity (KB-110 to KB-111)
└── Modifier Pipeline (KB-120 to KB-122)
```

### Calculation Hierarchy

```
Build Calculation
├── Resolver Pipeline (execution order)
│   ├── Step 1: Base Values (from WFCD)
│   ├── Step 2: Flat Modifiers (summed)
│   ├── Step 3: Multiplier Modifiers (summed)
│   ├── Step 4: Conditional Effects (applied if triggers met)
│   ├── Step 5: Mission Modifiers (faction, Steel Path)
│   ├── Step 6: Enemy Effects (damage type mods, armor, attenuation)
│   └── Step 7: Final Values
│
├── Stat Dependency Graph
│   ├── Health → EHP → Survivability
│   ├── Armor → EHP → Survivability
│   ├── Shields → EHP → Survivability
│   ├── Strength → Ability Damage → Damage Output
│   ├── Crit Chance → Crit Factor → DPS
│   ├── Damage → Multishot → Crit → Fire Rate → Burst DPS → Sustained DPS
│   └── Status Chance → Status Probabilities → DoT DPS
│
└── Effect Pipeline (every modifier)
    ├── Source: Vitality (mod) — +440% Health
    ├── Source: Arcane Blessing (arcane) — +300 Health
    ├── Source: Archon Shard (crimson) — +10% Strength
    └── ...
```

### Command Hierarchy

```
Command Palette Categories
├── File
│   ├── New Build
│   ├── Save Build
│   ├── Load Build
│   ├── Export Code
│   ├── Import Code
│   └── Print Build
├── Edit
│   ├── Undo
│   ├── Redo
│   ├── Clear Build
│   └── Reset Slot
├── View
│   ├── Toggle Loadout Tree
│   ├── Toggle Inspector
│   ├── Toggle Equipment Explorer
│   ├── Toggle Status Bar
│   ├── Full Screen
│   └── Workspace → Theorycraft / Enemy Lab / Comparison / Minimal
├── Navigate
│   ├── Focus Warframe
│   ├── Focus Primary
│   ├── Focus Secondary
│   ├── Focus Melee
│   ├── Focus Companion
│   ├── Focus Mod (by name)
│   ├── Focus Stat (by name)
│   └── Open Search
├── Tools
│   ├── Enemy Lab
│   ├── Build Comparison
│   ├── Calculation Explorer
│   ├── Build Optimizer
│   └── Knowledge Base
└── Help
    ├── About TennoDex
    ├── Keyboard Shortcuts
    └── Knowledge Base
```

---

## 4. Workspace Architecture

### Workspace: Theorycraft (Default)

```
┌──────────────────────────────────────────────────────────────┐
│ ⬡ TennoDex  File  Edit  View  Workspace  Help               │
├──────────────┬────────────────────────────────┬──────────────┤
│ Loadout Tree │ Build Canvas                   │ Inspector     │
│              │                                │              │
│ ☐ Warframe   │ [Excalibur] [Capacity 42/60]   │ → Stats tab  │
│   Aura       │ ❤740 🛡450 ⛨225 ⚡300 🧱42580 │   Health      │
│   Exilus     │ STR 200% DUR 100% RNG 100%    │   Base: 100   │
│   Mods (8)   │                                │   +Vitality   │
│   Arcanes    │ [Aura][Exilus]                 │   +Arcane     │
│   Shards     │ [M][M][M][M][M][M][M][M]       │   Blessing    │
│   Helminth   │                                │   = 740       │
│ ☐ Primary    │ [Arcane 1] [Arcane 2]          │              │
│ ☐ Secondary  │ [Shard][Shard][Shard]...[Tau]  │              │
│ ☐ Melee      │ [Helminth: Roar ▼]             │              │
│ ☐ Companion  │                                │              │
│              │ [Exalted: Exalted Blade →]     │              │
├──────────────┴────────────────────────────────┴──────────────┤
│ Build: My Excal Build  ● Saved  │ MR 30  │ EHP 42,580       │
└──────────────────────────────���───────────────────────────────┘
```

**Target User:** Standard user performing normal build crafting.

**Visible Panels:** Loadout Tree (left), Build Canvas (center), Inspector — Stats tab (right), Status Bar (bottom).

**Hidden Panels:** Equipment Explorer, Mod Library, Enemy Lab.

**Advantages:** Everything needed for build crafting is visible. Loadout tree provides context without switching surfaces. Inspector shows relevant details for the selected item or stat.

**Trade-offs:** Less horizontal space for the canvas. Inspecting a stat requires clicking it.

### Workspace: Theorycraft (Loadout Tree Collapsed)

```
┌──────────────────────────────────────────────────────────────┐
│ ⬡ TennoDex  File  Edit  View  Workspace  Help    [≡] [≡]    │
├──────────────────────────────────┬───────────────────────────┤
│ Build Canvas                     │ Inspector                 │
│                                  │                           │
│ [Excalibur] [Capacity 42/60]     │ → Stats tab               │
│ ❤740 🛡450 ⛨225                 │                           │
│                                  │                           │
│ [M][M][M][M][M][M][M][M]         │                           │
│ [Arcane 1] [Arcane 2]            │                           │
│ [Shards] [Helminth]              │                           │
├──────────────────────────────────┴───────────────────────────┤
│ Status Bar                                                   │
└──────────────────────────────────────────────────────────────┘
```

**Target User:** Experienced users who want maximum canvas space.

**Visible Panels:** Build Canvas (maximized), Inspector (right), Status Bar (bottom).

**Hidden Panels:** Loadout Tree (collapsed to icon rail), Equipment Explorer.

**Navigation:** Loadout tree dots on the left edge expand on hover.

### Workspace: Enemy Lab

```
┌─────────────┬──────────────────────────────────┬──────────────┐
│ Loadout     │ Build Canvas                     │ Enemy Stats   │
│ Tree        │                                  │              │
│             │ [Excalibur] [Stats] [DPS Calc]    │ EHP: 128,500 │
│ ☐ Warframe  │                                  │ Armor: 6,200 │
│ ☐ Primary   │ Weapon stats with enemy          │ DR: 95.4%    │
│ ☐ Secondary │ damage breakdown                 │ TTK: 2.4s    │
│ ☐ Melee     │                                  │ Shots: 17    │
│             │ [Damage Bar] [Enemy Select ▼]    │              │
│             │ [Level: 150] [Armor Strip: 0%]   │              │
│             │ [Corrosive: 0] [Heat Proc: □]    │              │
├─────────────┴──────────────────────────────────┴──────────────┤
│ Status Bar                                                   │
└──────────────────────────────────────────────────────────────┘
```

**Target User:** Users optimizing against specific enemies.

**Visible Panels:** Loadout Tree, Build Canvas (with DPS/enemy overlay), Enemy Stats (inspector), Status Bar.

**Additional Elements:** Enemy configuration at the bottom of the canvas.

**Advantages:** Real-time TTK feedback as enemy parameters change.

### Workspace: Comparison

```
┌────────────────────────┬────────────────────────┬──────────────┐
│ Build A (current)      │ Build B (comparison)   │ Delta        │
│                        │                        │              │
│ [Excalibur Build]      │ [Excalibur Build 2]    │ Health: +200 │
│ ❤740 🛡450            │ ❤940 🛡450            │ EHP: +12,400 │
│                        │                        │ STR: -20%    │
│ [M][M][M][M][M][M]     │ [M][M][M][M][M][M]     │ DUR: +40%    │
│                        │                        │              │
│ [Arcane] [Shards]      │ [Arcane] [Shards]      │ All changes  │
│                        │                        │ highlighted  │
├────────────────────────┴────────────────────────┴──────────────┤
│ Status Bar                                                   │
└──────────────────────────────────────────────────────────────┘
```

**Target User:** Users comparing two build variants.

**Visible Panels:** Two Build Canvases side-by-side, Delta Inspector (right).

**Color Coding:** Green = improvement, Red = regression, Gray = unchanged.

### Workspace: Presentation

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                                                              │
│                    Build Canvas (full screen)                 │
│                                                              │
│   [Excalibur] [Stats] [Mod Grid] [Arcanes] [Shards]         │
│                                                              │
│                                                              │
│                                                              │
│                                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Target User:** Users presenting builds on stream or in screenshots.

**Visible Panels:** Build Canvas only (no chrome).

### Workspace: Minimal

```
┌──────────────────────────────────────────────────────────────┐
│ ⬡ TennoDex                                                   │
├──────────────────────────────────────────────────────────────┤
│ Build Canvas                                                  │
│                                                               │
│ [M][M][M][M][M][M][M][M]                                     │
│                                                               │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ Status Bar                                                    │
└──────────────────────────────────────────────────────────────┘
```

**Target User:** Users who want a clean, distraction-free modding experience.

**Visible Panels:** Build Canvas and Status Bar only.

**Navigation:** Right-click for context menu. Keyboard shortcuts for all operations.

---

## 5. Panel Review

### Panel: Menu Bar

**Verdict:** ADD (new). Current TopBar has no menu bar. Standard desktop convention.

**Design:**
```
File  Edit  View  Workspace  Help
├──New           ├──Undo       ├──Loadout Tree  ├──Theorycraft  ├──About
├──Open          ├──Redo       ├──Inspector     ├──Enemy Lab    ├──Shortcuts
├──Save    Ctrl+S├──Clear      ├──Explorer      ├──Comparison   ├──KB
├──Export        ├──Reset Slot ├──Status Bar    ├──Presentation
├──Import        │             ├──Full Screen   └──Minimal
└──Print         └──Preferences └──Command Palette Ctrl+Shift+P
```

**Implementation:** Native-feeling OS menu bar. On macOS, use the system menu bar. On Windows/Linux, render in the title bar area.

### Panel: Loadout Tree

**Verdict:** NEW. Replaces the concept of "slot switching" with a persistent tree.

**Design:**
```
☐ Warframe                        [click to expand]
  Excalibur                        [current frame name]
  ├─ Aura: Growing Power          [equipped aura]
  ├─ Exilus: Power Drift          [equipped exilus]
  ├─ Mods: 8/8                    [mod count / capacity]
  ├─ Arcanes: 2/2                 [arcane count]
  ├─ Shards: 3/5                  [shard count]
  ├─ Helminth: Roar               [helminth ability]
  └─ Exalted: Exalted Blade       [exalted weapon]
☐ Primary Weapon
  └─ [weapon name]
☐ Secondary Weapon
☐ Melee Weapon
☐ Companion
  └─ [companion name]
    └─ Weapon: [weapon name]
☐ Config
  ├─ Faction: Grineer
  ├─ Enemy: Heavy Gunner
  └─ Buffs: Roar, Eclipse
```

**Behavior:**
- Clicking a category focuses the canvas on that item
- Drag items within the tree to reorder (e.g., swap weapons)
- Right-click for context menu (remove, copy, reset)
- Collapsible groups for compact view
- Equipped items shown with condensed info
- Empty slots shown as dotted outlines

**Collapsed State:** Icon rail on the left edge showing 6 icons (Warf, Prim, Sec, Melee, Comp, Config).

### Panel: Build Canvas

**Verdict:** KEEP but restructure.

**Current Problems:**
- Surface switching (warframe → weapon → etc.) is a web page metaphor
- Sections below the mod grid (arcanes, shards, helminth) are hard to reach
- No drag targets for incoming mods

**New Design:**

```
┌─────────────────────────────────────────────┐
│ [Equipment Name]  [CapacityBar] [Selector ▼] │ ← Equipment Header
├─────────────────────────────────────────────┤
│ ❤740  🛡450  ⛨225  ⚡300  🧱42,580         │ ← Quick Stats (always visible)
│ STR 200%  DUR 100%  RNG 100%  EFF 175%      │
├─────────────────────────────────────────────┤
│ [Aura Badge] [Exilus Badge]    [Polarity: V]│ ← Special Row
├─────────────────────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐                    │
│ │ M │ │ M │ │ M │ │ M │                    │ ← Mod Grid (8 slots)
│ ├───┤ ├───┤ ├───┤ ├───┤                    │    Drag targets
│ │ M │ │ M │ │ M │ │ M │                    │    Visual polarity
│ └───┘ └───┘ └───┘ └───┘                    │    Drain indicator
├─────────────────────────────────────────────┤
│ [Arc] [Arc]  [↕]                           │ ← Collapsible sections
│ [Shard] [Shard] [Shard] [Shard] [Shard]     │    Arcanes, Shards,
│ [Helminth: Roar ▼]                         │    Helminth, Exalted
│ [Exalted: Exalted Blade →]                 │    (collapse by default)
└─────────────────────────────────────────────┘
```

**Canvas Rules:**
1. The canvas is **never replaced** by another surface. The user's build stays visible.
2. Clicking a different item in the Loadout Tree refocuses the canvas on that item.
3. The Quick Stats bar is **always visible** at the top of the canvas (pinned).
4. Mod slots are drag targets. Dropping a mod from the explorer/library places it.
5. Section headers (Arcanes, Shards, Helminth) are collapsible, with fill indicators.
6. The canvas scrolls vertically. The Equipment Header and Quick Stats are sticky.

### Panel: Inspector

**Verdict:** KEEP but make truly contextual.

**Current Problems:**
- Shows a static stat list by default
- Mode switching is confusing (idle → stat → tool → why)
- Duplicates information with the sidebar StatsHUD
- Collapsible sections compete with canvas inline sections

**New Design — Modes:**

The Inspector has exactly 4 modes, determined by what the user has selected:

| Selection | Inspector Mode | Content |
|-----------|---------------|---------|
| Nothing (default) | Build Overview | Core stats, ability bars, set bonuses, build health, warnings |
| Stat (clicked) | Stat Breakdown | Full calculation tree (the current StatExplorer content) |
| Mod (clicked/hovered) | Mod Details | Mod stats, alternatives, comparison with current, KB link |
| Enemy (in enemy lab) | Enemy Analysis | EHP breakdown, TTK analysis, damage type effectiveness |

**Inspector Layout:**
```
┌─────────────────────┐
│ Inspector            │
│                      │
│ [Build Overview]     │ ← Mode tabs (auto-selected)
│ [Stat Breakdown]     │
│ [Mod Details]       │
│                      │
│ ──── Content ────   │
│                      │
│ (changes based on    │
│  selection)          │
│                      │
│ If nothing selected: │
│  Core Stats          │
│  Ability Bars        │
│  Set Bonuses         │
│  Build Health        │
│                      │
│ If stat clicked:     │
│  KB Reference        │
│  Calculation Tree    │
│  All modifiers       │
│  Formula             │
│                      │
│ If mod clicked:      │
│  Mod Stats           │
│  Alternatives        │
│  Remove/Upgrade      │
└─────────────────────┘
```

### Panel: Equipment Explorer

**Verdict:** KEEP but separate into a dedicated browsable panel.

**Current Problems:**
- Lives inside the drawer as a library tab, competing with other tabs
- Click-to-select instead of drag-to-equip
- No multi-select, no compare

**New Design:**

The Equipment Explorer becomes a **dockable panel** (like VS Code's file explorer).

```
┌─────────────────┐
│ 🔍 Search...    │ ← Search bar
├─────────────────┤
│ Warframes     ▶ │ ← Category tree
│ Primary       ▶ │    (expanded = show items)
│ Secondary     ▶ │
│ Melee         ▶ │
│ Companions    ▶ │
│ Favorites     ▶ │
│ Recent        ▶ │
├─────────────────┤
│ (when category   │
│  expanded)       │
│                  │
│ ┌────┐ ┌────┐   │ ← Item grid
│ │Img │ │Img │   │    Drag to canvas
│ │Name│ │Name│   │    Right-click for
│ └────┘ └────┘   │    context menu
│ ┌────┐ ┌────┐   │
│ │Img │ │Img │   │
│ │Name│ │Name│   │
│ └────┘ └────┘   │
└─────────────────┘
```

**Key Improvements:**
- **Drag to equip** — drag any item from the explorer onto the canvas
- **Right-click** — context menu with equip, compare, favorite, view details
- **Dual view** — grid (visual) or list (compact, text-only)
- **Filters** — category, MR range, polarity, faction, search
- **Favorites + Recent** — persistent across sessions
- **Collection** — user-curated sets of equipment

### Panel: Mod Library

**Verdict:** RENAME from "Mod Library" to "Mod Browser." Separate from Equipment Explorer.

**Design:**
```
┌──────────────────────────────────┐
│ Mod Browser     [Search...]      │
├──────────────────────────────────┤
│ All │ Warframe │ Primary │ ...   │ ← Category tabs
├──────────────────────────────────┤
│ [Polarity: All ▼] [Rarity: All] │ ← Filters
│ [Sort: Name ▼]                   │
├──────────────┬───────────────────┤
│ Active filter │  ┌────┐ ┌────┐  │ ← Mod cards
│ indicators    │  │Mod │ │Mod │  │    Drag to canvas
│               │  │Name│ │Name│  │    Right-click menu
│ × Warframe    │  │Drain│ │Drain│  │
│ × Rare        │  └────┘ └────┘  │
│               │  ┌────┐ ┌────┐  │
│               │  │Mod │ │Mod │  │
│               │  │Name│ │Name│  │
│               │  └────┘ └────┘  │
└──────────────┴───────────────────┘
```

**Key Improvements:**
- **Drag to equip** — drag mods directly onto the canvas
- **Visual polarity icons** — color-coded and easy to distinguish
- **"Owned" indicator** — shows if user has the mod in their inventory
- **Set bonus indicator** — shows set name and current count
- **Right-click** — equip, view details, find similar, favorite

### Panel: Calculation Explorer

**Verdict:** KEEP but move from modal to dockable inspector tab.

**Current Problem:** Hidden in a modal. Users can't see the build while exploring calculations.

**New Design:**
The Calculation Explorer becomes a **tab inside the Inspector**. When a user clicks a stat, the Inspector switches to "Stat Breakdown" mode, showing the full calculation inline.

```
Inspector: [Build Overview | Stat Breakdown | Mod Details]
              ↳ Active tab when stat is clicked

┌──────────────────────────┐
│ KB-003: EHP Formula     │ ← Knowledge Base reference
│ EHP = HP × (1+A/300)+SH │
│ Confidence: HIGH         │
├──────────────────────────┤
│                          │
│ ① BASE VALUE            │
│    Warframe Base: 740   │
│                          │
│ ② FLAT ADDITIONS        │
│    + Vitality (+440%)   │ ← Each with source
│    + Arcane Blessing     │
│    Running total: 740    │
│                          │
│ ③ MULTIPLIERS           │
│    × 1.0                 │
│    Mult Total: ×1.000    │
│                          │
│ ④ FINAL                 │
│    740                   │
│                          │
│ Formula: 740 × 1.000    │
│ = 740                   │
├──────────────────────────┤
│ PIPELINE (8 effects)     │ ← Expandable list
│ TIMELINE                 │ ← Visual stepper
│ DEPENDENCIES             │ ← Graph
└──────────────────────────┘
```

**Key Improvements:**
- Persistent in the Inspector — always visible alongside the build
- Updates automatically when the build changes
- KB reference always shown
- Tab system for Breakdown / Pipeline / Timeline / Dependencies
- Each section collapsible for progressive disclosure

### Panel: Enemy Lab

**Verdict:** KEEP but move from drawer tab to dedicated workspace.

**Current Problem:** Enemy config is inside the drawer, far from weapon stats.

**New Design:**
The Enemy Lab becomes a **workspace mode** (available from View → Workspace → Enemy Lab). When active, it adds enemy configuration controls to the bottom of the Build Canvas and the Inspector shows enemy stats.

```
Inspector in Enemy Lab mode:
┌─────────────────────┐
│ Enemy Analysis       │
│                      │
│ Target: Heavy Gunner│
│ Faction: Grineer     │
│ Level: 150           │
│                      │
│ EHP: 128,500         │
│ Armor: 6,200         │
│ DR: 95.4%            │
│                      │
│ Best Damage:         │
│ Corrosive: +75%      │
│ Slash: +25%          │
│ Viral: +75%          │
│                      │
│ Weakest Damage:      │
│ Impact: -50%         │
│                      │
│ TTK Analysis:        │
│ Shots: 17            │
│ Time: 2.4s           │
│ Effective DPS: 52k   │
└─────────────────────┘
```

### Panel: Build Health

**Verdict:** KEEP but integrate into the Inspector's Overview tab.

**Current Problem:** Was an isolated panel.

**New Design:**
Build Health becomes a section within the Inspector's Build Overview tab:

```
Build Health
├── Capacity: 42/60 ✅
├── Polarity Matches: 6/8 ✅
├── Mod Conflicts: None ✅
├── Missing Exilus: ⚠️
└── Overall: 85% — Good
```

### Panel: Command Palette

**Verdict:** KEEP but expand to all commands.

**Current Problem:** Only 20 commands, missing many operations.

**New Design:**
40+ commands across 6 categories. Activated by Ctrl+Shift+P (VS Code convention). All commands searchable.

### Panel: Status Bar

**Verdict:** KEEP with richer content.

**Design:**
```
Build: My Build  ●  MR 30  │  EHP 42,580  │  Weapon: Burst 128k  │  Enemy: Heavy Gunner Lv150  │  v2.0  │  ● Ready
```

Left side: Build name with save indicator (● = saved, ○ = unsaved changes).
Right side: Contextual info (changes per workspace).

### Panel: Search

**Verdict:** KEEP but make universal.

**Current Problem:** Two separate search systems (GlobalSearch for items, Command Palette for actions).

**New Design:**
One search (Ctrl+K) that finds everything:
- Equipment (warframes, weapons, companions)
- Mods (by name, stat, polarity)
- Arcanes (by name, category)
- Knowledge Base entries (by KB-###, keyword)
- Commands (by action name)
- Stats (by name)

Search results are grouped by category:

```
🔍 health
═══════════════════════════════════════
📊 STATS
  Health (warframe) — 740
  Health Regen — 4.0/s
  Health (companion) — 1,200
═══════════════════════════════════════
📖 KNOWLEDGE BASE
  KB-002: Warframe Core Stats
  KB-003: Effective Hit Points
═══════════════════════════════════════
🛠 COMMANDS
  Toggle Build Health panel
═══════════════════════════════════════
📦 MODS
  Vitality (Warframe) — +440% Health
  Primed Vigor (Warframe) — +220% Health, +220% Shields
```

---

## 6. Build Workflow Redesign

### Flow: Creating a Build

**Current (13+ clicks):**
1. Number key (1) → Warframe slot selected
2. Click dropdown → scroll → select warframe
3. Click empty mod slot → popup opens
4. Type mod name → search results appear
5. Click mod → popup closes
6. Repeat 3-5 for each mod
7. Scroll down → arcane section
8. Click arcane dropdown → scroll → select
9. Scroll down → shard section
10. Click shard dropdown → select color
11. Toggle Tau checkbox
12. Scroll down → helminth toggle
13. Select donor from dropdown

**Redesigned (4 actions + drags):**
1. Ctrl+Shift+P → "New Build" → Enter
2. From Equipment Explorer: drag warframe to canvas
3. From Mod Browser: drag mods to canvas slots
4. From Inspector: click any stat to see breakdown

**Key changes:**
- Drag replaces click-search-select for mod placement
- Equipment Explorer replaces dropdown for equipment selection
- Inspector provides real-time feedback
- No popups interrupt the workflow

### Flow: Editing a Build

**Current:**
- Click slot → popup → search → select → popup closes → wait for calc

**Redesigned:**
- Drag mod from slot back to browser (removes)
- Drag new mod from browser to slot (replaces)
- Right-click mod → Rank Up / Rank Down / Remove / Polarity
- Ctrl+Z to undo any action

### Flow: Exploring Calculations

**Current:**
- Notice a stat → click it → modal opens → explore → close modal

**Redesigned:**
- Click any stat → Inspector switches to Stat Breakdown
- Explorer stays visible alongside the canvas
- Clicking different stats updates the Inspector in place
- No modal, no context switch

### Flow: Enemy Testing

**Current:**
- Switch to Enemies tab in drawer → configure → look at weapon stats

**Redesigned:**
- View → Workspace → Enemy Lab
- Enemy controls appear at the bottom of the canvas
- Inspector shows enemy EHP and TTK analysis
- Changing enemy parameters updates everything in real time
- Switch back to Theorycraft to remove enemy overlay

### Flow: Comparing Builds

**Current:**
- Click Compare in menu → modal opens → can't edit

**Redesigned:**
- File → Save → saves current as Version A
- Edit build → File → Save As → Version B
- View → Workspace → Comparison
- Two canvases side-by-side
- Delta Inspector shows all differences
- Click "Apply to A" or "Apply to B" to merge changes

### Flow: Saving/Loading

**Current:**
- Click Save → toast appears
- Load from dropdown

**Redesigned:**
- Auto-save every 30 seconds and on major changes
- Manual save: Ctrl+S
- Unsaved changes indicator in the status bar (● / ○)
- File → Open → shows build list with search, sort, preview
- File → Save As → named versions
- Build history accessible from File → Recent

---

## 7. Information Hierarchy

### Eye-Tracking Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 👀 First glance (0-1s)                                  │
│                                                         │
│ ① Menu Bar — "Where am I?"                             │
│ ② Build Canvas — "What am I building?"                 │
│ ③ Quick Stats — "What are my numbers?"                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 👀 Second glance (1-3s)                                  │
│                                                         │
│ ④ Mod Grid — "What mods do I have?"                    │
│ ⑤ Loadout Tree — "What's my full setup?"               │
│ ⑥ Inspector — "What's selected?"                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 👀 Exploration (3s+)                                     │
│                                                         │
│ ⑦ Click stat → Inspector updates                        │
│ ⑧ Open Mod Browser → browse mods                       │
│ ⑨ Open Equipment Explorer → browse items               │
│ ⑩ Drag item to canvas → see result                     │
└─────────────────────────────────────────────────────────┘
```

### Attention Map

```
HIGH ATTENTION (always visible, largest)
╔═══════════════════════════════════════════════════╗
║ Build Canvas (60% of screen width)               ║
║   Equipment Header                                ║
║   Quick Stats Bar (pinned)                        ║
║   Mod Grid (8 slots)                              ║
╚═══════════════════════════════════════════════════╝

MEDIUM ATTENTION (visible, smaller)
╔═══════════════════════════════════════════════════╗
║ Loadout Tree (20% width)  │ Inspector (20% width)║
║ Warframe                  │ Core Stats            ║
║ Primary                   │ Ability Bars          ║
║ Secondary                 │ Build Health          ║
║ Melee                     │ Set Bonuses           ║
║ Companion                 │                       ║
╚═══════════════════════════════════════════════════╝

LOW ATTENTION (small, peripheral)
╔═══════════════════════════════════════════════════╗
║ Status Bar (24px)                                 ║
║  Build name  ●  MR 30  │  EHP 42,580  │  v2.0    ║
╚═══════════════════════════════════════════════════╝

CONTEXTUAL (appears when needed)
- Mod Browser (bottom panel, ~120px)
- Equipment Explorer (left panel, replaces Loadout Tree)
- Enemy Lab controls (overlay on canvas)
- Command Palette (overlay)
```

---

## 8. Cognitive Load Analysis

### Sources of Cognitive Load (Current App)

| Source | Load | Mitigation in Redesign |
|--------|------|----------------------|
| Slot switching (6+ surfaces) | HIGH | Eliminated — Loadout Tree replaces switching |
| Click → popup → search → select for mods | HIGH | Replaced with drag-and-drop |
| Remembering what changed | HIGH | Auto-detected delta highlighting |
| Tracking state across 5 panels | MEDIUM | Reduced to 3 panels (tree, canvas, inspector) |
| Deciding which panel has which info | MEDIUM | Clear panel responsibilities |
| Finding the right command | MEDIUM | Universal search + categorized palette |
| Understanding formulas | MEDIUM | Calculation Explorer in every stat |
| Finding equipment | MEDIUM | Equipment Explorer with categories + search |
| Comparing builds | HIGH | Dedicated comparison workspace |
| Undoing mistakes | HIGH | Ctrl+Z undo stack |

### Decision Fatigue Analysis

**Current app decisions per build:**
1. Choose warframe (50+ options)
2. Choose aura (30+ options)
3. Choose exilus (10+ options)
4. Choose 8 mods from 1,800+ (8 decisions)
5. Choose 2 arcanes from 168+ (2 decisions)
6. Choose 5 shard colors from 6 (5 decisions)
7. Choose helminth donor (50+ options)
8. Choose weapon slot × 3 (3 decisions)
9. Choose weapons (200+ options)
10. Choose weapon mods (1,800+ options)
11. Configure enemy (optional)

**Total: ~30+ decisions per build**

**Redesign mitigations:**
- **Templates** — 5 starting templates per warframe (tank, DPS, support, speed, hybrid)
- **Favorites** — users can mark preferred mods/weapons
- **Recent** — remembers last used items
- **Auto-fill** — suggest common mods for empty slots (based on warframe/weapon type)
- **Comparison** — see two variants side-by-side before deciding
- **Undo** — experiment freely without fear

---

## 9. Desktop Benchmark Study

### Why Blender's Layout Model Works

Blender uses a **fully customizable workspace** with:
- **Editor types** (3D Viewport, Timeline, Outliner, Properties, Node Editor)
- **Workspace presets** (Modeling, Sculpting, UV Editing, Texture Paint, Animation, Rendering)
- **Editors can be split, joined, floated, or full-screened**
- **Every editor has a header** with mode-specific controls

**Apply to TennoDex:**
- "Editor types" = Panel types (Canvas, Inspector, Explorer, Browser, Enemy Lab)
- "Workspace presets" = Theorycraft, Enemy Lab, Comparison, Presentation, Minimal
- "Split/join/float" = Dockable panels
- "Editor header" = Each panel has a header with specific controls

### Why VS Code's Panel Model Works

VS Code uses:
- **Side Bar** (explorer, search, source control, extensions)
- **Panel** (problems, output, debug console, terminal)
- **Editor** (tabs for open files)
- **Status Bar** (branch, errors, line number, encoding)

**Apply to TennoDex:**
- "Side Bar" = Loadout Tree + Equipment Explorer
- "Panel" = Mod Browser (bottom)
- "Editor" = Build Canvas
- "Status Bar" = Build status, MR, stats

### Why JetBrains Rider's Navigation Works

Rider uses:
- **Project Tree** (solution explorer)
- **Editor Tabs** (open files)
- **Tool Windows** (database, terminal, TODO, structure)
- **Quick Navigation** (Ctrl+Shift+N for files, Ctrl+N for classes)
- **Intention Actions** (Alt+Enter for suggestions)

**Apply to TennoDex:**
- "Quick Navigation" = Ctrl+K universal search
- "Intention Actions" = Context-sensitive suggestions (e.g., "This slot has no arcane. Add one?")
- "Tool Windows" = Dockable panels with show/hide toggles

### Why Photoshop's Panels Work

Photoshop uses:
- **Tools** (vertical toolbar, always visible)
- **Options** (context-sensitive bar below menu)
- **Panels** (Layers, Channels, Paths, Color, Swatches, etc. — all dockable)
- **Workspace Switcher** (Essentials, 3D, Motion, Painting, Photography)

**Apply to TennoDex:**
- "Tools" = Loadout Tree (always visible, narrow)
- "Options" = Context-sensitive controls in the canvas header
- "Panels" = Inspector, Explorer, Browser — all dockable
- "Workspace Switcher" = Workspace presets in View menu

### Why Figma's Collaboration Model Inspires

Figma's approach to **multiplayer editing** and **component libraries**:
- **Assets panel** (components, styles, local variables)
- **Layers panel** (document outline)
- **Design panel** (properties of selected element)
- **Prototype panel** (interactions)

While TennoDex isn't multiplayer, the **component library** concept maps:
- "Assets" = Mod Browser (drag mods from library)
- "Layers" = Loadout Tree (full build outline)
- "Design" = Inspector (selected element properties)

### Why Unreal Engine's Blueprint Inspires

Unreal Engine's **node-based editing** is the ultimate expression of visual calculation. While TennoDex doesn't need a full Blueprint system, the **concept of visible data flow** is powerful:
- Each calculation is a node with inputs and outputs
- Wires show data dependencies
- Users can trace the flow from source to result

**Apply to TennoDex:**
- The Calculation Explorer's "Dependencies" tab should render as a node graph
- Stats are nodes. Modifiers are input pins. Formulas are operations.
- Users can zoom and pan the graph

---

## 10. Migration Plan

### Phase 1: Foundation (2-3 weeks)

**Goal:** Establish the new panel architecture without breaking existing functionality.

1. Add the **Menu Bar** component
2. Add the **Loadout Tree** alongside the existing slot switcher (dual mode)
3. Convert the **Equipment Explorer** from a modal to a dockable panel
4. Add **drag-and-drop** to the mod library (items become draggable)
5. Add **undo/redo** command stack

**Risk:** Low. All new code. Existing functionality untouched.

### Phase 2: Workflow (3-4 weeks)

**Goal:** Replace old workflows with new.

1. Make the Loadout Tree the **primary navigation** (slot switcher becomes secondary)
2. Convert **surface switching** to canvas refocusing
3. Move **arcanes, shards, helminth** to collapsible sections in the canvas
4. Move **Calculation Explorer** from modal to Inspector tab
5. Add **stat delta animations**
6. Add **right-click context menus** everywhere

**Risk:** Medium. Removing old navigation may break muscle memory. Provide both for 1 version.

### Phase 3: Workspaces (3-4 weeks)

**Goal:** Implement workspace presets with full panel configurations.

1. Implement **workspace switching** (Theorycraft, Enemy Lab, Comparison, Presentation, Minimal)
2. Build the **Comparison workspace** with dual canvases
3. Build the **Enemy Lab** workspace
4. Implement **dockable panels** (drag panel headers to rearrange)
5. Implement **panel collapse/expand** with animated transitions

**Risk:** Medium. Workspace logic is complex. Test with real users early.

### Phase 4: Polish (2-3 weeks)

**Goal:** Restore/improve all existing functionality in the new architecture.

1. Universal search
2. Build comparison
3. Build history
4. Project management
5. Auto-save
6. Accessibility pass
7. Performance pass

**Risk:** Low. All features already exist; just need to adapt to the new panel architecture.

---

## 11. Implementation Roadmap

### Priority: P0 — Must Launch With

| Item | Effort | Dependencies |
|------|--------|-------------|
| Drag-and-drop mod placement | 2 weeks | Mod Browser drag support, canvas drop zones |
| Undo/redo command stack | 1 week | None (state machine only) |
| Stat delta animations | 1 week | None (CSS transitions) |
| Right-click context menus | 1 week | Context menu component (exists) |
| Menu bar | 3 days | None (new component) |

### Priority: P1 — Within 1 Month

| Item | Effort | Dependencies |
|------|--------|-------------|
| Loadout Tree | 1 week | Panel architecture |
| Inspector contextual modes | 1 week | Loadout Tree |
| Calculation Explorer in Inspector | 3 days | Inspector contextual modes |
| Auto-save | 2 days | None |
| Universal search | 1 week | None (enhance existing) |

### Priority: P2 — Within 2 Months

| Item | Effort | Dependencies |
|------|--------|-------------|
| Workspace presets | 2 weeks | Panel architecture |
| Comparison workspace | 2 weeks | Workspace presets |
| Enemy Lab workspace | 1 week | Workspace presets |
| Equipment Explorer as panel | 1 week | Panel architecture |
| Dockable panels | 3 weeks | Workspace presets |

### Priority: P3 — Future

| Item | Effort | Dependencies |
|------|--------|-------------|
| Visual calculation tree (node graph) | 4 weeks | Calculation Explorer |
| Plugin architecture | 8 weeks | Architecture decision |
| Multi-window support | 4 weeks | Dockable panels |
| Theme system | 2 weeks | Design tokens |
| Build templates | 2 weeks | Save/load system |

---

## Panel Responsibility Matrix

| Panel | Responsibility | Always Visible | Dockable | Multi-Window |
|-------|---------------|---------------|----------|-------------|
| Menu Bar | Application-level actions (File, Edit, View) | ✅ | ❌ | ❌ |
| Loadout Tree | Build outline, item selection | ✅ (collapsible) | ✅ | ❌ |
| Build Canvas | Primary editing workspace | ✅ | ❌ | ❌ |
| Inspector | Context-sensitive details (stats, mods, breakdowns) | ✅ (collapsible) | ✅ | ✅ |
| Equipment Explorer | Browse and select equipment | ❌ | ✅ | ✅ |
| Mod Browser | Browse and select mods | ❌ | ✅ | ✅ |
| Calculation Explorer | Calculation breakdowns (Inspector tab) | ❌ | ✅ (inspector tab) | ❌ |
| Enemy Lab | Enemy configuration and analysis (workspace) | ❌ | ✅ | ❌ |
| Status Bar | Build status, MR, save indicator, context info | ✅ | ❌ | ❌ |
| Command Palette | Quick command execution | ❌ | ❌ | ❌ |
| Search | Universal search (items, mods, KB, commands) | ❌ | ❌ | ❌ |

## Desktop Interaction Philosophy — Rules

```
1. PERSISTENCE: The build canvas is never replaced. Never. Not for any reason.
2. DIRECTNESS: Drag-and-drop is the primary interaction. Click-select is secondary.
3. CONTEXT: The Inspector always shows what's selected, never a generic default.
4. FEEDBACK: Every action produces a visible response within 100ms.
5. RECOVERY: Every action is undoable. Ctrl+Z always works.
6. DISCOVERY: Every right-click shows a context menu. Every element responds to hover.
7. NAVIGATION: The Loadout Tree is the primary navigation. Keyboard shortcuts are secondary.
8. SEARCH: Ctrl+K finds everything. There is only one search.
9. WORKSPACES: Users can switch between focused workspaces. Each remembers its panel layout.
10. EDUCATION: Every number is clickable. Every click shows the calculation. Every calculation links to the Knowledge Base.
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Drag-and-drop breaks existing click workflow | Medium | High | Support both during migration. Remove click when drag adoption is confirmed. |
| Users resist Loadout Tree replacing slot switching | High | Medium | Provide both navigation methods. Default to tree. |
| Workspace switching confuses new users | Medium | Medium | Default to Theorycraft workspace. Workspace switcher in View menu. |
| Dockable panels increase complexity | Medium | High | Start with fixed panels. Make dockable in Phase 3. |
| Undo/redo memory usage grows too large | Low | Medium | Limit undo stack to 100 entries. Warn at 90. |
| Performance with large mod libraries | Low | Medium | Virtual scroll for mod grid. Lazy-load thumbnails. |

---

This document provides the complete architectural blueprint for the TennoDex frontend redesign. A frontend developer should be able to implement the full application from this specification alone.
