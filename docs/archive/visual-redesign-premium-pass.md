# TennoDex — Visual Identity, Artwork Integration & Premium UI Pass

**Date:** 2 July 2026  
**Author:** Creative Director / Lead Visual Designer  
**Status:** DEFINITIVE VISUAL REDESIGN SPECIFICATION

---

## Table of Contents

1. Executive Summary
2. Artwork Integration Plan
3. Build Canvas Redesign
4. Equipment Library Redesign
5. Inspector Redesign
6. Enemy Lab Redesign
7. Calculation Explorer Redesign
8. Build Notes System
9. Backgrounds & Atmosphere
10. Empty States
11. Visual Hierarchy Guide
12. Professional Desktop Polish
13. Component Refinements
14. Asset Replacement Plan
15. Implementation Roadmap

---

## 1. Executive Summary

### The Problem

TennoDex currently functions but looks like an internal admin tool. Large areas of empty black space, generic dropdowns, tiny thumbnails, missing official artwork, weak visual hierarchy, and flat panels all contribute to an experience that feels like an Electron settings page rather than a professional Warframe theorycrafting studio.

### The Solution

This document specifies a comprehensive visual upgrade across every surface of the application. The changes fall into three categories:

1. **Artwork Integration** — Replace text, generic dropdowns, and tiny thumbnails with rich, properly-scaled official Warframe artwork
2. **Visual Hierarchy** — Redesign every panel to guide the eye naturally, eliminate empty space, and make important information immediately visible
3. **Desktop Polish** — Refine spacing, borders, glass effects, animations, and states to meet the quality bar of Blender, Figma, and JetBrains

### Design Principles for This Pass

```
1. ARTWORK FIRST — Never show a text label when artwork can communicate faster
2. HIERARCHY THROUGH SIZE — Important things are big. Secondary things are small.
3. EMPTY SPACE IS WASTED SPACE — Every panel should communicate something
4. CONTEXT IS KING — The Inspector transforms based on what's selected
5. CONSISTENCY — Same visual language, same spacing, same quality everywhere
```

---

## 2. Artwork Integration Plan

### 2.1 Warframes

**Current state:** Text dropdown to select, small name in the header, generic `<select>` element.

**Target state:**

```
┌─────────────────────────────────────────────┐
│  ┌──────────────────────────────────┐       │
│  │        [Full Warframe Render]     │       │
│  │        (320×480px, prominent)     │       │
│  └──────────────────────────────────┘       │
│                                             │
│  EXCALIBUR              [Change ▲▼]        │
│  Prime Access available                      │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │Skill│ │Skill│ │Skill│ │Skill│          │
│  │  1  │ │  2  │ │  3  │ │  4  │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  Passive: +10% attack speed with swords     │
└─────────────────────────────────────────────┘
```

**Changes:**
- Warframe render taken from `cdn.warframestat.us/img/{uniqueName}.png`
- Displayed at 320×480px (or proportional, filling the left column of the canvas header)
- Name displayed in large display font with Prime/non-Prime indicator
- Change button opens a visual picker (grid of warframes with renders, not a dropdown)
- Ability icons shown as small squares with tooltips
- Passive description displayed below

**Picker redesign:**
```
┌────────────────────────────────────────────┐
│  Select Warframe                    [🔍]   │
│                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │    │ │    │ │    │ │    │ │    │      │
│  │Exca│ │Volt│ │Mag │ │Loki│ │Ash │      │
│  └────┘ └────┘ └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │    │ │    │ │    │ │    │ │    │      │
│  │Rhino│ │Sary│ │Nova│ │... │ │    │      │
│  └────┘ └────┘ └────┘ └────┘ └────┘      │
│                                             │
│  [Grid view]  [List view]  [Favorites]      │
└────────────────────────────────────────────┘
```

Each picker item: 80×100px card with warframe render thumbnail + name. Search filters in real time.

### 2.2 Weapons

**Current state:** Text dropdown, small stat strip, generic.

**Target state:**
```
┌──────────────────────────────────────────────┐
│  ┌──────────┐  BRATON PRIME          [Change]│
│  │ Weapon   │  Primary  ·  Rifle  ·  MR 10  │
│  │ Render   │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│  │ 200×120  │  │IPS│ │EL │ │CR │ │ST │ │...│
│  └──────────┘  └──┘ └──┘ └──┘ └──┘ └──┘   │
│                                               │
│  INCARNON [Stage 4 ▼]  ·  PRIMER [off]       │
└──────────────────────────────────────────────┘
```

**Changes:**
- Weapon render from CDN at 200×120px
- Weapon type, class, and MR displayed as metadata chips
- Quick-stat icons across the top (damage, crit chance, status, fire rate as clickable badges)
- Incarnon stage selector as a visual badge, not hidden in a tiny select
- Primer toggle as a proper toggle button

### 2.3 Mods

**Current state:** Generic mod cards with tiny thumbnails, poor artwork quality.

**Target state:**
```
┌──────────────────────┐
│ ┌────────────────────┐│
│ │                    ││
│ │   Full mod card    ││
│ │   artwork from     ││
│ │   game data        ││
│ │                    ││
│ │   [Rarity border]  ││
│ │   [Polarity icon]  ││
│ │   [Name]           ││
│ │   [Drain] [Rank]   ││
│ └────────────────────┘│
│                        │
│ Hover: enlarge to 2×  │
│ Show: full stats       │
│ Polarity · Rarity · Set│
└──────────────────────┘
```

**Changes:**
- Mod cards rendered at 64×84px (minimum) — significantly larger than current
- Full in-game mod artwork from CDN
- Rarity-colored borders (Common/Uncommon/Rare/Legendary)
- Polarity icon overlaid top-left
- Drain cost bottom-right
- Hover preview enlarges to 128×168px with full stats tooltip
- Mod Browser grid uses a comfortable 6-column layout

### 2.4 Arcanes

**Current state:** Plain `<select>` dropdown, no artwork, no visual hierarchy.

**Target state:**
```
┌──────────────────────────────────────────────┐
│  Arcane Slot 1                    [Remove]   │
│  ┌────────────────────────────────────────┐ │
│  │ [Arcane Artwork]  Arcane Energize      │ │
│  │ 64×64px           Legendary · Warframe  │ │
│  │                   Trigger: Energy Pickup│ │
│  │                   Rank: ●●●●○           │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Empty state:                                │
│  ┌────────────────────────────────────────┐ │
│  │  [Dashed border]  + Select Arcane     │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Changes:**
- Arcane artwork from CDN at 64×64px
- Rich card showing name, rarity, category, trigger, and rank
- Rank dots use rarity color
- Empty state is a dashed-border card with a clear "+" action
- Picker is a visual grid (like mod picker), not a dropdown

### 2.5 Archon Shards

**Current state:** Inline `<select>` dropdowns with text-based color names.

**Target state:**
```
┌──────────────────────────────────────────────┐
│  Archon Shards                       [3/5]   │
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌─┐│
│  │      │  │      │  │      │  │      │  │ ││
│  │Crimson│  │ Azure│  │Amber │  │Empty │  │+││
│  │ +10%  │  │+225  │  │+7.5% │  │      │  │ ││
│  │ STR   │  │ Armor│  │Energy│  │      │  │ ││
│  └──────┘  └──────┘  └──────┘  └──────┘  └─┘│
│  [Tau]      [Tau]      [Tau]                 │
└──────────────────────────────────────────────┘
```

**Changes:**
- Shards displayed as visual gems with actual color swatches, not text dropdowns
- Each shard shows its color name, stat bonus, and value
- Tauforged indicator is a gold glow overlay on the shard
- Empty slots show a "+" action
- The shard picker is a visual color grid with stat previews
- Shard cards are 64×80px with a colored top half and info bottom half

### 2.6 Focus Schools

**Current state:** Text or minimal icons.

**Target state:**
```
┌──────────────────────────────────────────────┐
│  Focus School                     [Change ▼] │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │              MADURAI                    │ │
│  │    [School icon – large, 80×80]         │ │
│  │    +20% Ability Strength               │ │
│  │    +20% Physical Damage                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Active Nodes:                               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │Node│ │Node│ │Node│ │Node│ │Node│       │
│  │  1 │ │  2 │ │  3 │ │  4 │ │  5 │       │
│  └────┘ └────┘ └────┘ └────┘ └────┘       │
│  [Waybound] [Waybound]                      │
└──────────────────────────────────────────────┘
```

**Changes:**
- Focus school displayed with its official icon at 80×80px
- School color identity used as accent
- Passive effects listed below
- Active nodes shown as connected progression path
- Waybound passives clearly marked

### 2.7 Helminth

**Current state:** Inline checkbox + dropdown.

**Target state:**
```
┌──────────────────────────────────────────────┐
│  Helminth Infusion              [● Active]  │
│                                              │
│  Donor: Rhino                                 │
│  Ability: Roar                                │
│  Replaces: Ability 3 (Slash Dash)             │
│                                              │
│  [Donor Warframe icon]  Roars roar description│
│  48×48px                                      │
│                                              │
│  [Change Donor]  [Remove Infusion]            │
└──────────────────────────────────────────────┘
```

**Changes:**
- Helminth section has its own visual identity (Infested/Helminth styling — greenish bio-accent)
- Donor warframe shown with icon + name
- Ability described with full text
- Clear "replaces" indicator showing which ability is overwritten
- Toggle is a proper switch, not a checkbox

### 2.8 Damage Types

**Current state:** Mostly text. Some color coding.

**Target state — Every damage type has:**

```
┌──────────┐
│  🔥 Heat │
│  Orange  │
└──────────┘

Each damage type icon = 20×20px SVG
Each damage type badge = icon + name + color
Color matched to damage type identity
```

Icons needed for all 14 damage types:
Impact, Puncture, Slash, Heat, Cold, Electric, Toxin, Blast, Corrosive, Gas, Magnetic, Radiation, Viral, Void

Damage bars in the weapon stats section use these icons + proportional colored bars.

---

## 3. Build Canvas Redesign

### 3.1 Current Problems

- Large empty areas of black space
- Warframe is just text
- Mod grid is the only visual element
- Arcanes/Shards/Helminth are pushed below the fold
- Quick stats float with no visual anchor
- No sense of the Warframe being present

### 3.2 New Layout

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐  EXCALIBUR                        [Change]│
│  │ Warframe │  Prime · Male · Sword Master              │
│  │ Render   │  ┌────────────────────────────────────┐  │
│  │ 280×420  │  │ ❤ 740  🛡 450  ⛨ 225  ⚡ 300     │  │
│  │          │  │ 🧱 42,580                           │  │
│  │          │  │ STR 200%  DUR 100%  RNG 100%  EFF  │  │
│  └──────────┘  └────────────────────────────────────┘  │
│                                                         │
│  ┌──Ability Icons──┬──Passive text────────────────────┐ │
│  │ [1][2][3][4]    │ +10% attack speed with swords    │ │
│  └─────────────────┴──────────────────────────────────┘ │
│                                                         │
│  [Aura: Growing Power ▼] [Exilus: Power Drift ▼]      │
│                                                         │
│  ┌────┬────┬────┬────┐                                 │
│  │ M  │ M  │ M  │ M  │   ← Mod grid (4×2)             │
│  ├────┼────┼────┼────┤                                  │
│  │ M  │ M  │ M  │ M  │                                 │
│  └────┴────┴────┴────┘                                 │
│                                                         │
│  Capacity: ████████████░░░░  42/60                      │
│                                                         │
│  ── Arcanes ──────────────────────────────────────      │
│  [Arcane Slot] [Arcane Slot]                             │
│                                                         │
│  ── Archon Shards ────────────────────────────────      │
│  [●][●][●][○][○]  3/5                                   │
│                                                         │
│  ── Helminth ─────────────────────────────────────      │
│  [Roar from Rhino]                                       │
│                                                         │
│  ── Exalted Weapon ───────────────────────────────      │
│  [Exalted Blade →]  Click to mod                        │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Key Changes

| Element | Before | After |
|---------|--------|-------|
| Warframe display | Text name in header | 280×420px full render |
| Quick stats | Inline text strip | Glass card with icons |
| Abilities | Not shown on canvas | 4 ability icons with tooltips |
| Passive | Not shown | Text below abilities |
| Aura/Exilus | Small badges | Prominent dropdown cards |
| Mod grid | 52×64px slots | 64×80px slots |
| Capacity bar | Small text | Visual bar with per-slot breakdown |
| Arcanes | Hidden below fold | Proper cards with artwork |
| Shards | Inline dropdowns | Visual gem cards |
| Helminth | Inline checkbox | Proper infusion card |
| Exalted | Small text | Visual card with click action |

### 3.4 Mod Grid

**Current:** 52×64px slots with tiny text.

**Target:**
```
┌──────────┐
│ [Polarity]│  ← Polarity icon, colored
│          │
│  Name    │  ← Mod name, 11px
│          │
│  Drain 6 │  ← Drain cost, colored by match
│ [●●●○○] │  ← Rank dots
└──────────┘
Size: 64×80px
Gap: 6px
```

**Changes:**
- Larger slots (64×80px from 52×64)
- More vertical space for name and rank
- Clear polarity indication
- Drain cost colored green (matched) or red (mismatched)
- Drag target zone clearly indicated with subtle glow

### 3.5 Quick Stats Redesign

**Current:** Inline text strip with emoji icons.

**Target:**
```
┌──────────────────────────────────────────────────────┐
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│  │❤ │ │🛡│ │⛨│ │⚡│ │🧱│ │STR│ │DUR│ │RNG│   │
│  │740│ │450│ │225│ │300│ │42k│ │200│ │100│ │100│   │
│  └──┘ └──┘ └──┘ └──┘ └───┘ └───┘ └───┘ └───┘   │
│  Health Shield Armor Energy EHP  Str  Dur  Rng     │
└──────────────────────────────────────────────────────┘
```

Each stat is a small glass card (56×48px) with:
- Icon at top (16px SVG)
- Value in mono font (14px, bold)
- Label below (8px, muted)

Cards are interactively clickable → opens calculation in Inspector.

### 3.6 Polarity Display

**Current:** Small symbol, same color for all types.

**Target — Distinct visual identity per polarity:**

```
Madurai (V)  — Warm amber/gold  #d0a060
Vazarin (—)  — Sky blue          #60b8d0
Nairu (D)    — Emerald green     #60d090
Umbra (◆)    — Crimson red       #c06060
Penjaga (□)  — Lavender          #d0a0d0
Universal (★)— White-gold        #ffe080
```

Each polarity symbol is rendered at 16×16px with its distinct color. When matched, the slot border takes the polarity color at 30% opacity. When mismatched, the border is red-tinted.

---

## 4. Equipment Library Redesign

### 4.1 Current Problems

- Cards are too small
- Artwork is tiny or missing
- No visual hierarchy between items
- Too much scrolling for too little information
- Feels like a file explorer, not a content browser

### 4.2 Target State — Unreal Engine Content Browser Feel

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Search...              [All] [Warframes] [Primary] ... │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │      │ │      │ │      │ │      │ │      │ │      │  │
│  │Render│ │Render│ │Render│ │Render│ │Render│ │Render│  │
│  │      │ │      │ │      │ │      │ │      │ │      │  │
│  │Name  │ │Name  │ │Name  │ │Name  │ │Name  │ │Name  │  │
│  │Meta  │ │Meta  │ │Meta  │ │Meta  │ │Meta  │ │Meta  │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│  ┌──────┐ ┌──────┐ ┌──────┐                               │
│  │      │ │      │ │      │                               │
│  │ ...  │ │ ...  │ │ ...  │                               │
│  └──────┘ └──────┘ └──────┘                               │
└────────────────────────────────────────────────────────────┘
```

**Card size:** 96×120px minimum (up from ~48×56px)
**Artwork:** 80×80px render or icon, centered
**Metadata:** Name (truncated), type badge, polarity/rarity indicator

**Context menu on right-click:**
```
Equip
Compare
Favorite ★
View Details
Copy Name
──────────────
Show in Explorer
```

### 4.3 View Modes

| Mode | Card Size | Best For |
|------|-----------|----------|
| Grid (default) | 96×120px | Browsing, visual discovery |
| Compact Grid | 72×88px | Dense browsing, power users |
| List | Full width | Sorting, comparing many items |

### 4.4 Library Artwork

Every item in the library must display proper artwork:
- **Warframes:** Full body render from CDN
- **Weapons:** Weapon render from CDN
- **Mods:** Mod card artwork from CDN
- **Arcanes:** Arcane artwork from CDN
- **Companions:** Companion render from CDN
- **Enemies:** Enemy silhouette or render

All artwork loads lazily with a blur-up placeholder. Failed images show a styled placeholder with the item's first letter.

---

## 5. Inspector Redesign

### 5.1 Current Problems

- Behaves like a property settings panel
- Generic stat list by default
- Doesn't react to what's selected
- No artwork
- Too much text, not enough visual communication

### 5.2 New Behaviour

The Inspector has **5 visual modes**, triggered by selection:

| Selection | Inspector Shows |
|-----------|----------------|
| Nothing | Build Overview (stats, abilities, health) |
| Stat value | Full calculation breakdown with formula tree |
| Mod | Mod card artwork + full stats + alternatives |
| Weapon/Warframe | Render + metadata + key stats |
| Enemy | Enemy analysis with damage effectiveness |

### 5.3 Mod Inspector Mode

```
┌────────────────────────────────┐
│ MOD DETAILS                    │
│                                │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │    Full mod card artwork   │ │
│ │    (128×168px)             │ │
│ │                            │ │
│ └────────────────────────────┘ │
│                                │
│ Vitality                       │
│ Warframe Mod · Rare            │
│ Polarity: Vazarin              │
│                                │
│ Max Rank: 10                   │
│ Drain: 14 (matched: 7)        │
│                                │
│ +440% Health at max rank       │
│                                │
│ ── Alternatives ──             │
│ [Primed Vigor] [+220%/+220%]  │
│ [Umbral Vitality] [+440%/+77%]│
│ [Physique Aura] [+18%]        │
│                                │
│ [Remove] [Rank Up] [Polarity]  │
└────────────────────────────────┘
```

### 5.4 Stat Inspector Mode

```
┌────────────────────────────────┐
│ HEALTH                  [740] │
│                                │
│ KB-002: Warframe Core Stats   │
│ Confidence: HIGH               │
│                                │
│ ① Base: 100 (Excalibur)       │
│                                │
│ ② Flat Bonuses                │
│    +640  Vitality (+440%)     │
│    ─────────────────────       │
│    Sum:  +640                  │
│                                │
│ ③ Running Total: 740          │
│                                │
│ Formula: 100 × (1 + 4.4)       │
│ = 740                          │
│                                │
│ [Pipeline: 2 effects] [Timeline] [Dependencies] │
└────────────────────────────────┘
```

---

## 6. Enemy Lab Redesign

### 6.1 Current Problems
- Enemy is a text dropdown
- No enemy artwork
- Faction not visually represented
- Damage effectiveness is just text numbers
- No visual sense of "this is a tactical analysis"

### 6.2 Target State — Tactical Analysis Screen

```
┌─────────────────────────────────────────────────────────┐
│  ┌────────────────┐  HEAVY GUNNER              [Change]│
│  │ Enemy Render   │  Grineer · Cloned Flesh · Ferrite  │
│  │ 200×300px      │  Level 150                          │
│  │                │                                     │
│  │ [Faction      │  ┌─── EHP: 128,500 ───────────────┐ │
│  │  Banner]      │  │ Armor: 6,200 │ DR: 95.4%       │ │
│  └────────────────┘  └─────────────────────────────────┘ │
│                                                         │
│  ── Damage Effectiveness ────────────────────────       │
│                                                         │
│  Corrosive  ████████████░░░░░░░░  +75%     ✅ Best    │
│  Slash      ██████████░░░░░░░░░░░  +25%               │
│  Viral      ██████████░░░░░░░░░░░  +75%               │
│  Impact     ░░░░░░░░░░░░░░░░░░░░   -50%    ❌ Worst   │
│  ...                                                     │
│                                                         │
│  ── Configuration ───────────────────────────────       │
│  [Level: 150] [Armor Strip: 0%] [Corrosive: 0]         │
│  [Heat Proc: □] [Steel Path: ☑]                        │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Enemy render at 200×300px
- Faction banner with identity colors
- Health/Armor/Shield type badges
- EHP breakdown in a glass card
- Damage effectiveness as visual bars with color-coded best/worst
- All configuration controls grouped in a single panel section
- Each damage type bar is clickable → opens calculation explanation

### 6.3 Damage Effectiveness Bars

Each damage type is shown as a horizontal bar:
- Bar width proportional to effectiveness (capped at +100% / -100%)
- Color: green (effective) → yellow (neutral) → red (resisted)
- Icon + name on the left
- Percentage value on the right
- "Best" and "Worst" callouts

```
Corrosive  ████████████████████░░  +75%  ✅ BEST
Slash      ██████████████████░░░░  +25%
Viral      ████████████████████░░  +75%
Impact     ░░░░░░░░░░░░░░░░░░░░  -50%  ❌ WORST
```

---

## 7. Calculation Explorer Visuals

### 7.1 Current
- Text-based modal
- Functional but dry
- No visual flow

### 7.2 Target — Visual Calculation Tree

```
┌────────────────────────────────────────────────────────────┐
│  EHP CALCULATION                                           │
│  KB-003 · Confidence: HIGH                                 │
│                                                            │
│  ┌─────────────┐                                           │
│  │  BASE: 740  │──┐                                        │
│  │  Health     │  │                                        │
│  └─────────────┘  │    ┌────────────────┐                  │
│                   ├───→│  RUNNING       │                  │
│  ┌─────────────┐  │    │  TOTAL: 740    │                  │
│  │  FLAT: +0   │──┘    └───────┬────────┘                  │
│  └─────────────┘              │                           │
│                               │    ┌────────────────┐     │
│  ┌─────────────┐              ├───→│  RUNNING       │     │
│  │  MULT: ×1.0 │─────────────→│    │  TOTAL: 740    │     │
│  └─────────────┘              │    └───────┬────────┘     │
│                               │           │               │
│  ┌─────────────┐              │           ▼               │
│  │  FORMULA    │─────────────→│   ┌──────────────┐       │
│  │  740 × 1.0  │              │   │  FINAL: 740  │       │
│  └─────────────┘              │   │              │       │
│                               │   └──────────────┘       │
│  [Modifiers] [Timeline] [KB] │                           │
└────────────────────────────────────────────────────────────┘
```

Each step is a visual node with connectors showing the flow from base → flats → multipliers → final. Nodes are color-coded (gold for base, teal for flats, green for multipliers, bright gold for final).

---

## 8. Build Notes System

### 8.1 Current Problems
- Notes panel permanently occupies UI space
- Competes with important information
- Often empty — wastes space

### 8.2 Solution

Build Notes are **removed from permanent workspace real estate**.

Instead:
- A small **Notes icon** (📝) appears next to the build name in the header
- When clicked, opens a **floating notes panel** (400×300px)
- The panel is draggable and can be positioned anywhere
- Panel supports Markdown (bold, italic, lists, code blocks)
- Auto-saves on every change (debounced 500ms)
- When closed, an indicator dot shows notes exist

```
┌─────────────────────────────────────┐
│ [Build Name] 📝 ●                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📝 Build Notes                  │ │
│ │─────────────────────────────────│ │
│ │                                 │ │
│ │ **Steel Path build**            │ │
│ │ - Uses Arcane Grace for sustain │ │
│ │ - Replace Aura with Corrosive   │ │
│ │   Projection for high level     │ │
│ │                                 │ │
│ │ [Auto-saved ✓]                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

The notes panel is also available as a dockable panel (default: floating).

---

## 9. Backgrounds & Atmosphere

### 9.1 Current Problems
- Pure black (#060608) background everywhere
- No sense of place or atmosphere
- Feels empty and cheap

### 9.2 Solution — Subtle Environmental Layers

Introduce three background layers:

**Layer 1: Void-depth gradient (deepest)**
- Radial gradient from center to edges
- Center: slightly warm dark (#0a0a0c)
- Edges: void black (#060608)
- Adds depth without distraction

**Layer 2: Subtle pattern**
- Very faint hexagonal grid or circuit-board pattern
- Opacity: 2%
- Color: teal (#00f2ff) at 2% opacity
- Creates texture without being visible as a pattern

**Layer 3: Environmental vignette**
- Radial gradient from center (transparent) to edges (30% black)
- Slightly warmer at the top (simulating ambient light)
- Changes subtly between workspaces
  - Theorycraft: warm amber undertone
  - Enemy Lab: cool tactical blue undertone
  - Comparison: neutral

**Workspace-specific background themes:**

| Workspace | Undertone | Accent | Feeling |
|-----------|-----------|--------|---------|
| Theorycraft | Warm amber | Gold | Creative, focused |
| Enemy Lab | Cool blue-teal | Cyan | Analytical, tactical |
| Comparison | Neutral | White | Objective, precise |
| Presentation | Pure dark | None | Clean, undistracted |

These are not wallpapers. They are 3-layer CSS gradients that create atmosphere through subtle color shifts.

---

## 10. Empty States

### 10.1 Design Pattern

Every empty state follows this pattern:

```
┌──────────────────────────────────────────────┐
│                                              │
│           [Wireframe Illustration]            │
│              200×200px, centered              │
│                                              │
│               No Warframe Selected            │
│           (Display font, gold, 18px)          │
│                                              │
│       Select a Warframe from the library      │
│          to begin building your loadout.      │
│          (Body text, muted, 12px)             │
│                                              │
│       [Browse Warframes]  [Ctrl+K to Search] │
│            (Primary button)  (Hint)           │
│                                              │
└──────────────────────────────────────────────┘
```

### 10.2 All Empty States

| State | Illustration | Title | Action |
|-------|-------------|-------|--------|
| No Build | Wireframe warframe | "Your Arsenal Awaits" | Browse Warframes |
| No Weapon | Wireframe rifle | "No Weapon Equipped" | Browse Weapons |
| No Mods | Wireframe mod | "No Mods Installed" | Browse Mods |
| No Enemy | Wireframe enemy | "No Target Selected" | Open Enemy Lab |
| No Search Results | Wireframe magnifier | "No Results Found" | Clear Search |
| No Notes | Wireframe notepad | "No Build Notes" | Add Note |
| No Comparison | Two wireframes | "No Comparison" | Select Builds |
| No Projects | Wireframe folder | "No Saved Builds" | New Build |
| No History | Wireframe clock | "No History" | Start Building |

Each illustration is an SVG wireframe in the blueprint style (cyan/gold line art on dark background).

---

## 11. Visual Hierarchy Guide

### 11.1 Eye Flow — Theorycraft Workspace

```
┌────────────────────────────────────────────────────────────┐
│ 👀 1. Warframe Render (left, large, high contrast)         │
│     → The eye lands here first                             │
│                                                            │
│ 👀 2. Quick Stats (right of render, bright colored values) │
│     → Then reads the numbers                               │
│                                                            │
│ 👀 3. Mod Grid (center, dense, patterned)                  │
│     → Then examines the mods                               │
│                                                            │
│ 👀 4. Capacity Bar (below mods, colored fill)              │
│     → Checks build health                                  │
│                                                            │
│ 👀 5. Special Sections (Arcanes, Shards, Helminth)         │
│     → Reviews remaining config                             │
│                                                            │
│ 👀 6. Inspector (right panel, if expanded)                 │
│     → Digs into details                                    │
└────────────────────────────────────────────────────────────┘
```

### 11.2 Visual Weight Rules

```
1. Equipment renders are the heaviest visual element
   → 280-420px, full color, high contrast

2. Stat values are the second heaviest
   → Mono font, bright colors, large (14px)

3. Mod slots are the third heaviest
   → 64×80px, bordered, with polarity colors

4. Text labels are the lightest
   → 11px, muted colors, never compete with values

5. Never have two elements with equal visual weight
   → Every section has a clear primary element
```

### 11.3 What to Remove Visual Competition From

| Element | Current Visual Weight | Target Visual Weight |
|---------|----------------------|---------------------|
| Warframe name | Medium (uppercase, 12px) | High (render + name, 18px) |
| Quick stats | Low (inline text) | Medium (glass cards) |
| Mod grid | High (only visual) | High (still primary) |
| Arcanes | Low (dropdown) | Medium (artwork cards) |
| Shards | Very low (inline select) | Medium (gem cards) |
| Helminth | Very low (checkbox) | Low-medium (card) |
| Inspector title | Medium | Low (secondary to content) |
| Build name | Medium | Low (header, not content) |

---

## 12. Professional Desktop Polish

### 12.1 Spacing Audit

| Element | Current | Target |
|---------|---------|--------|
| Panel padding | 8-10px inconsistent | 16px (uniform) |
| Section spacing | 4-8px | 12px |
| Card spacing | 4px | 8px |
| Text to border | 4-8px | 12px |
| Icon to text | 2-4px | 6px |
| Header height | 36-44px | 40px (uniform) |

### 12.2 Border Refinements

| Element | Current | Target |
|---------|---------|--------|
| Panel borders | rgba(132,148,149,0.22) | Same (correct) |
| Active borders | rgba(0,242,255,0.45) | Same (correct) |
| Card borders | Same as panel | Lighter (0.15 opacity) |
| Drag handle hover | Cyan line | Same + 2px width |

### 12.3 Glass Effect Standardisation

Every interactive panel or card uses a consistent glass effect:

```css
/* Standard glass card */
.glass-card {
  background: rgba(32, 31, 32, 0.88);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(132, 148, 149, 0.22);
  border-radius: 4px;
}

/* Glass card (hovered) */
.glass-card:hover {
  background: rgba(42, 41, 42, 0.80);
  border-color: rgba(0, 242, 255, 0.25);
}

/* Glass card (active/selected) */
.glass-card--active {
  background: rgba(53, 52, 54, 0.90);
  border-color: rgba(0, 242, 255, 0.45);
}
```

### 12.4 Elevation Standardisation

| Level | Use | Shadow |
|-------|-----|--------|
| 0 | Surface-level | None |
| 1 | Panel | `0 1px 3px rgba(0,0,0,0.3)` |
| 2 | Cards, dropdowns | `0 4px 12px rgba(0,0,0,0.4)` |
| 3 | Modals, floating panels | `0 8px 32px rgba(0,0,0,0.5)` |
| 4 | Tooltips, context menus | `0 12px 48px rgba(0,0,0,0.6)` |

### 12.5 Animation Standards

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover state | 80ms | ease-out |
| Panel expand/collapse | 200ms | ease-out |
| Modal open | 200ms | ease-out |
| Value change flash | 300ms | ease-out |
| Drag ghost | 120ms | ease-out |
| Drop snap | 200ms | spring |

All animations use `transform` and `opacity` only — never layout-triggering properties. All animations respect `prefers-reduced-motion`.

### 12.6 Scrollbar Styling

```css
/* Webkit scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(132, 148, 149, 0.3);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(132, 148, 149, 0.5);
}
```

---

## 13. Component Refinements

### 13.1 Buttons

| Variant | Use | Visual |
|---------|-----|--------|
| Primary | Main actions (Save, Import) | Teal fill, white text |
| Secondary | Secondary actions (Browse, Cancel) | Transparent, teal border |
| Ghost | Toolbar actions | Transparent, no border, hover fill |
| Danger | Destructive (Remove, Clear) | Red accent |

Button sizes: sm (24px), md (28px), lg (34px)
All buttons have consistent 2px border-radius and `focus-visible` ring.

### 13.2 Dropdowns

Replace all native `<select>` elements with styled custom dropdowns:

```
┌──────────────────────┐
│  Current Selection  ▼│  ← Click to open
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Option 1            │  ← Hover: highlight
│  Option 2            │  ← Active: teal check
│  Option 3         ✓  │
│  ─────────           │
│  Option 4 (disabled) │  ← Disabled: muted
└──────────────────────┘
```

### 13.3 Tabs

```
[MODS] [WEAPONS] [FRAMES] [ARCANES] [ENEMIES]
   ↑ 2px bottom border, teal, active tab
   ↑ Text: 11px uppercase, muted (inactive) / teal (active)
   ↑ No background change on hover (only text color)
```

### 13.4 Search

```
🔍 Search mods, warframes, KB...           [⌘K]
  ↑ 20px icon     ↑ placeholder text          ↑ shortcut hint
```

Search input has:
- 32px height
- Teal underline focus
- Clear button when text is present
- Results appear in a glass dropdown below

---

## 14. Asset Replacement Plan

### 14.1 Assets to Add

| Asset | Source | Priority | Size |
|-------|--------|----------|------|
| Warframe renders | cdn.warframestat.us | P0 | 280×420px |
| Warframe thumbnails | cdn.warframestat.us | P0 | 80×100px |
| Weapon renders | cdn.warframestat.us | P0 | 200×120px |
| Weapon thumbnails | cdn.warframestat.us | P0 | 80×60px |
| Mod card artwork | cdn.warframestat.us | P0 | 64×84px |
| Arcane artwork | cdn.warframestat.us | P0 | 64×64px |
| Companion renders | cdn.warframestat.us | P1 | 160×160px |
| Enemy renders | cdn.warframestat.us | P1 | 200×300px |
| Damage type icons | SVG (custom) | P0 | 20×20px |
| Polarity icons | SVG (custom) | P0 | 16×16px |
| Faction icons | SVG (custom) | P1 | 24×24px |
| Focus school icons | SVG (custom) | P1 | 40×40px |
| Shard gem artwork | CSS (custom) | P0 | 48×56px |
| Empty state illustrations | SVG (custom) | P1 | 200×200px |
| Ability icons | cdn.warframestat.us | P1 | 32×32px |

### 14.2 Assets to Replace

| Current Asset | Problem | Replacement |
|---------------|---------|-------------|
| Mod thumbnails | Too small, cropped | Full mod card from CDN at 64×84px |
| Warframe thumbnails | Tiny, low quality | Full render at 280×420px |
| Arcane dropdowns | No visual | Arcane artwork card at 64×64px |
| Emoji stat icons | Inconsistent rendering | SVG icons at 16×16px |
| Shard text selectors | No color | CSS gem cards with actual colors |
| Enemy text | No visual | Enemy render + faction banner |

### 14.3 Asset Format Standards

| Type | Format | Max Size | Load Strategy |
|------|--------|----------|---------------|
| Warframe renders | PNG | 150KB | Lazy, CDN cache |
| Weapon renders | PNG | 80KB | Lazy, CDN cache |
| Mod cards | PNG | 40KB | Grid: eager. Search: lazy |
| Arcane artwork | PNG | 30KB | Lazy |
| Icons | SVG | 2KB | Sprite (bundled) |
| Illustrations | SVG | 10KB | Lazy, bundle cache |
| Shard gems | CSS/HTML | N/A | Generated inline |

---

## 15. Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

| Task | Effort | Impact |
|------|--------|--------|
| Replace native `<select>` with styled dropdowns | 1 day | High |
| Increase mod card size to 64×84px | 0.5 day | High |
| Add faction banners to Enemy Lab | 0.5 day | Medium |
| Add damage type icons | 1 day | Medium |
| Add polarity color coding | 0.5 day | Medium |
| Fix spacing inconsistencies | 0.5 day | Low |

### Phase 2: Artwork Integration (Weeks 2-3)

| Task | Effort | Impact |
|------|--------|--------|
| Warframe render in canvas header (280×420px) | 1 day | Very High |
| Weapon render in canvas header | 0.5 day | High |
| Mod artwork from CDN | 1 day | High |
| Arcane artwork cards | 1 day | High |
| Enemy render in Enemy Lab | 0.5 day | High |
| Shard gem cards (CSS) | 0.5 day | Medium |
| Library card resizing | 1 day | Medium |

### Phase 3: Visual Hierarchy (Week 4)

| Task | Effort | Impact |
|------|--------|--------|
| Quick stats glass card redesign | 1 day | High |
| Mod grid layout refinement | 0.5 day | Medium |
| Ability icons on canvas | 0.5 day | Medium |
| Passive text display | 0.5 day | Low |
| Background layers (CSS gradients) | 0.5 day | Medium |

### Phase 4: Inspector & Empty States (Week 5)

| Task | Effort | Impact |
|------|--------|--------|
| Inspector contextual modes | 2 days | Very High |
| Mod inspector with artwork | 1 day | High |
| Stat inspector with visual tree | 1 day | High |
| Empty state illustrations | 1 day | Medium |
| Build notes panel | 0.5 day | Medium |

### Phase 5: Polish (Week 6)

| Task | Effort | Impact |
|------|--------|--------|
| Scrollbar styling | 0.5 day | Low |
| Animation tuning | 1 day | Medium |
| Hover/active state review | 0.5 day | Low |
| Visual timeline for explorer | 1 day | Medium |
| Workspace-specific undertones | 0.5 day | Low |

---

## Before/After Comparison Summary

| Aspect | Before | After |
|--------|--------|-------|
| Warframe | Text in header | 280×420px render |
| Mods | 52×64px cards, tiny | 64×80px cards, clear |
| Arcanes | `<select>` dropdown | Artwork card with stats |
| Shards | `<select>` by color name | Visual gem with color |
| Quick Stats | Inline text strip | Glass cards with icons |
| Enemy | Text dropdown | Render + faction + analysis |
| Inspector | Generic settings panel | Context-aware, artwork-rich |
| Empty states | Black void | Illustration + guidance |
| Notes | Permanent panel space | Floating, on-demand |
| Background | Flat black | 3-layer depth + atmosphere |
| Hierarchy | Flat, everything equal | Clear visual weight system |
| Polish | Inconsistent spacing | Uniform 16px grid |

---

*End of Visual Identity, Artwork Integration & Premium UI Pass specification*
