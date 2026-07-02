# TennoDex — Design System, Visual Language & Art Direction Bible

**Date:** 2 July 2026  
**Author:** Creative Director / Design Systems Architect  
**Status:** DEFINITIVE — Single source of truth for all visual design decisions

---

## Table of Contents

1. Design Philosophy & Brand Identity
2. Art Direction
3. Visual Language
4. Colour System
5. Typography System
6. Iconography System
7. Illustration Language
8. Component Catalogue
9. Motion Language
10. Microinteractions
11. Empty States
12. Accessibility
13. Asset Inventory
14. Design Tokens
15. Production Standards

---

## 1. Design Philosophy & Brand Identity

### Brand Soul

TennoDex is not a calculator. It is a **theorycrafting laboratory**.

The user is not a player looking up a build. They are an **engineer, scientist, and artist** — deconstructing Warframe's systems to discover what is possible.

### Emotional Target

| After 5 minutes | After 50 hours | After 500 hours |
|----------------|----------------|-----------------|
| Intrigued | Empowered | Indispensable |
| Curious | Confident | Invisible |
| Slightly overwhelmed | Competent | Masterful |
| "What can this do?" | "I understand now." | "I can't build without it." |

### Emotional Keywords

Precision, Depth, Power, Clarity, Control, Discovery, Mastery, Elegance, Authority

### Anti-Keywords

Playful, Cute, Cartoonish, Noisy, Chaotic, Gamified, Cluttered, Casual

### Tone of Voice

- **Precise** — Every number, label, and tooltip is accurate and intentional
- **Authoritative** — The app knows Warframe. It speaks with confidence.
- **Educational** — It explains, not just displays. It teaches the user.
- **Calm** — No panic. No alerts unless truly critical. The app breathes.
- **Minimal** — Every word earns its place. No marketing copy. No fluff.

### Personality Spectrum

```
Serious ──────────────────── Playful
  ↑ TennoDex sits here
  ↑ (technical, precise, authoritative)

Minimal ──────────────────── Ornate
  ↑ TennoDex
  ↑ (clean, functional, intentional)

Dark ─────────────────────── Light
  ↑ TennoDex
  ↑ (void-black foundation)

Warm ─────────────────────── Cold
  ↑ TennoDex (neutral-warm)
  ↑ (gold accents on dark)

Traditional ──────────────── Experimental
  ↑ TennoDex
  ↑ (familiar desktop patterns, Warframe-inspired visuals)
```

### Product Pillars

1. **Complete Trust** — Every calculation is accurate. Every formula is referenced. Every number can be explored.
2. **Desktop Mastery** — Keyboard-first. Drag-and-drop. Undo everything. Multiple workspaces. Feels like creative software.
3. **Deep Understanding** — Not just what the numbers are, but why. Knowledge Base integration in every interaction.
4. **Personal Workspace** — Customizable panels, saved layouts, themes, your builds, your discoveries.

---

## 2. Art Direction

### Concept Evaluation

#### Direction A: Orbiter Engineering

**Concept:** The interior of a Tenno Orbiter. Warm metals, Orokin gold accents, holographic displays, organic-mechanical hybrid surfaces.

**Strengths:**
- Immediately recognizable as Warframe
- Warm gold + dark metal palette is distinctive
- Holographic elements create natural UI separation
- Deep connection to Warframe lore

**Weaknesses:**
- Risk of copying DE's UI rather than being inspired by it
- Organic shapes may conflict with clean desktop layout
- Over-familiar — needs to differentiate from Orbiter Arsenal

**Visual Language:** Curved panels with gold trim, holographic stat projections, warm brass/bronze materials

**When to use:** Background artwork, loading screens, branding elements

#### Direction B: Cephalon Intelligence

**Concept:** A Sentient/Cephalon data analysis suite. Crystal-clear glass panels, neon cyan data streams, extruded holographic geometry, precision scientific instrumentation.

**Strengths:**
- Strong visual identity (cyan + dark = instantly recognizable)
- Scientific/analytical tone matches theorycrafting purpose
- Glass panels create natural depth hierarchy
- Feels intelligent and authoritative

**Weaknesses:**
- May feel cold and clinical
- Overuse of cyan is common in "sci-fi UI" concepts
- Risk of looking generic

**Visual Language:** Sharp angles, translucent glass surfaces, cyan energy lines, floating data modules

**When to use:** Panel backgrounds, active selection states, data visualization, loading animations

#### Direction C: Entrati Research Lab

**Concept:** A laboratory mixed with ancient Orokin technology. Weathered stone meets golden circuitry. Bioluminescent accents. Ancient-yet-advanced.

**Strengths:**
- Unique visual identity (no other Warframe tool uses this)
- Warm + organic = approachable but serious
- Texture-rich surfaces feel premium
- Tells a story

**Weaknesses:**
- High texture complexity may conflict with UI readability
- Thematic but may not scale to all UI states
- Execution risk — easy to get wrong

**Visual Language:** Weathered metal surfaces, golden inlay lines, amber/orange accents, textured backgrounds

**When to use:** Special sections (Knowledge Base, about screens), decorative elements

### Recommended Direction: Hybrid — Orbiter Engineering + Cephalon Intelligence

**Primary:** Orbiter Engineering (warm gold + dark metal) for the foundation — this grounds TennoDex in the Warframe universe without copying DE's UI.

**Secondary:** Cephalon Intelligence (cyan glass + precision) for interactive elements — this communicates analytical precision and separates TennoDex from "just another Warframe tool."

**Visual Rules:**
- Background surfaces: Orbiter Engineering (warm, metallic, dark)
- Interactive elements: Cephalon Intelligence (glass, cyan, precise)
- Data displays: Cephalon Intelligence (crisp, technical, glowing)
- Accents/highlights: Orokin gold from Orbiter Engineering
- Loading/empty states: Entrati Lab (textured, story-driven)

---

## 3. Visual Language

### Surface Philosophy

```
BACKGROUND LAYER (deepest)
  Void-black (#060608)
  └─ Subtle noise texture (0.5% opacity)
  
SURFACE LAYER (panels)
  Dark metallic (rgba(19,19,20,0.92))
  └─ 1px top highlight (rgba(255,255,255,0.03))
  └─ Slight warm tint from gold reflection
  
PANEL LAYER (cards, mod slots)
  Medium dark (rgba(32,31,32,0.88))
  └─ Glass effect when interactive
  └─ Subtle border glow when active
  
ELEVATED LAYER (tooltips, dropdowns, modals)
  Solid dark (#0e0e0f)
  └─ stronger shadow
  └─ brighter border
  
FOREGROUND LAYER (text, icons)
  White spectrum (#e5e2e3 → #849495)
```

### Glass Language

Glass effects are used on **interactive elements only** — never on static backgrounds.

```
Inactive glass:   rgba(32,31,32,0.88) + 1px border rgba(132,148,149,0.22)
Hover glass:      rgba(42,41,42,0.80) + border rgba(0,242,255,0.25)
Active glass:     rgba(53,52,54,0.90) + border rgba(0,242,255,0.45)
Selected glass:   rgba(0,242,255,0.08) + border rgba(0,242,255,0.65)
```

Glass surfaces use `backdrop-filter: blur(8px)` when over content.

### Metal Language

Metal is used on **structural elements** — headers, panel frames, dividers.

```
Dark metal:   background linear-gradient(180deg, #0e0e0f, #0a0a0b)
  + 1px top edge: rgba(200,164,94,0.08)
  + 1px bottom edge: rgba(0,0,0,0.3)

Gold metal:   background linear-gradient(180deg, rgba(200,164,94,0.12), rgba(200,164,94,0.04))
  + border: rgba(200,164,94,0.25)
```

### Shadow Philosophy

Shadows are subtle. They exist to create depth, not drama.

```
Level 0 (surface):  No shadow
Level 1 (panel):    box-shadow: 0 1px 3px rgba(0,0,0,0.3)
Level 2 (elevated): box-shadow: 0 4px 12px rgba(0,0,0,0.4)
Level 3 (modal):    box-shadow: 0 8px 32px rgba(0,0,0,0.5)
Level 4 (tooltip):  box-shadow: 0 12px 48px rgba(0,0,0,0.6)
```

Shadows are cool-toned (rgba(0,0,0,...)), never warm. Warm light comes from content (gold text, cyan glows).

### Glow Philosophy

Glows are reserved for **active, selected, or interactive states**.

```
Subtle glow (hover):  box-shadow: 0 0 6px rgba(0,242,255,0.15)
Active glow (selected): box-shadow: 0 0 12px rgba(0,242,255,0.25), 0 0 1px rgba(0,242,255,0.5)
Gold glow (special):   box-shadow: 0 0 8px rgba(200,164,94,0.2)
```

### Border Philosophy

```
Default:    1px solid rgba(132,148,149,0.22)
Hover:      1px solid rgba(132,148,149,0.35)
Active:     1px solid rgba(0,242,255,0.45)
Bright:     1px solid rgba(0,242,255,0.55)
Gold:       1px solid rgba(200,164,94,0.35)
Error:      1px solid rgba(255,180,171,0.35)
```

Borders are **always 1px**. Never use thicker borders for emphasis — use color or glow instead.

### Corner Radius

```
None:        0px     — Cards, panels in grid layouts
Small:       2px     — Inputs, buttons, small controls
Medium:      4px     — Modals, dropdowns, tooltips
Large:       8px     — Command palette, calculation explorer
X-Large:     12px    — Floating panels, detached modals (future)
Pill:        9999px  — Badges, tags, filter chips
```

### Spacing Rhythm

TennoDex uses a **4px base grid** with an **8px rhythm** for layout.

```
Micro:   2px    — Between icon and label
Tight:   4px    — Between related elements (stat rows)
Compact: 8px    — Between grouped elements (mod grid)
Normal:  12px   — Between sections
Relaxed: 16px   — Panel padding
Spacious: 24px  — Section groups
XL:      32px   — Page-level padding
```

### Panel Width System

```
Narrow sidebar:   220px  (Loadout Tree)
Wide sidebar:     280px  (Equipment Explorer)
Default inspector: 300px  (Inspector)
Wide inspector:   360px  (Inspector with stat breakdown)
Compact drawer:   120px  (Mod Browser collapsed)
Default drawer:   200px  (Mod Browser)
```

---

## 4. Colour System

### Semantic Colour Architecture

```
ACCENT (primary interactive)
  Teal (#00f2ff) 
  └─ Hover: #33f5ff
  └─ Active: #00d9e6
  └─ Muted: rgba(0,242,255,0.6)
  └─ Subtle: rgba(0,242,255,0.12)
  └─ Glow: rgba(0,242,255,0.25)

GOLD (special/highlight)
  Gold (#ffba30)
  └─ Hover: #ffc84d
  └─ Dim: #c8a45e
  └─ Subtle: rgba(255,186,48,0.10)
  └─ Glow: rgba(255,186,48,0.20)

PURPLE (exalted/exotic)
  Purple (#b347ff)
  └─ Hover: #c470ff
  └─ Dim: #8a3ccc
  └─ Subtle: rgba(179,71,255,0.10)

RED (error/danger)
  Red (#ffb4ab)
  └─ Dark: #e06c60
  └─ Subtle: rgba(255,180,171,0.10)

GREEN (success)
  Green (#50d080)
  └─ Dark: #3aa060

BLUE (shield/info)
  Blue (#5098e0)
  └─ Dark: #3a78b8

ORANGE (warning)
  Orange (#e87a30)
  └─ Dark: #c06020
```

### Surface Colours

```
Background:       #060608     (deep void)
Surface:          rgba(19,19,20,0.92)
Surface Solid:    #0e0e0f
Panel:            rgba(32,31,32,0.88)
Panel Hover:      rgba(42,41,42,0.80)
Panel Active:     rgba(53,52,54,0.90)
Border:           rgba(132,148,149,0.22)
Border Hover:     rgba(132,148,149,0.35)
Border Active:    rgba(0,242,255,0.45)
```

### Text Hierarchy

```
Text Primary:     #e5e2e3     (slightly warm white)
Text Secondary:   #b9cacb     (cool grey-white)
Text Muted:       #849495     (mid grey)
Text Dim:         #5a6a6b     (dark grey)
Text Inverse:     #0e0e0f     (for light-on-dark)
```

### Damage Type Colours

```
Impact:     #d0c8c0     (warm grey)
Puncture:   #6ad0a0     (teal-green)
Slash:      #e8b0a0     (warm pink)

Heat:       #f07030     (orange-red)
Cold:       #70b8f0     (ice blue)
Electric:   #ffe040     (bright yellow)
Toxin:      #80d060     (green)

Blast:      #d0a060     (brown-gold)
Corrosive:  #b0d040     (yellow-green)
Gas:        #80d0b0     (mint)
Magnetic:   #a080e0     (purple-blue)
Radiation:  #e0d040     (amber)
Viral:      #d060a0     (magenta)

Void:       #ffe080     (warm gold-white)
True:       #ffffff     (white)
Tau:        #c0a0ff     (lavender)
```

### Rarity Colours

```
Common:     #b9cacb     (text secondary)
Uncommon:   #70c0e0     (cerulean)
Rare:       #e0c060     (gold)
Legendary:  #c070ff     (purple)
```

### Polarity Colours

```
Madurai (V):    #d0a060     (warm amber)
Vazarin (—):    #60b8d0     (sky blue)
Nairu (D):      #60d090     (emerald)
Umbra (◆):      #c06060     (crimson)
Penjaga (□):    #d0a0d0     (lavender)
Universal (★):  #ffe080     (gold-white)
```

### Faction Colours

```
Grineer:    #a06040     (rust brown)
Corpus:     #6080c0     (steel blue)
Infested:   #60b060     (mottled green)
Sentient:   #c060c0     (purple-magenta)
Orokin:     #d0b060     (aged gold)
Corrupted:  #c0a060     (tarnished gold)
Tenno:      #00f2ff     (teal — our accent)
```

### Archon Shard Colours

```
Crimson:    #f44336     (strength/red)
Azure:      #00aeff     (armor/blue)
Amber:      #ff9800     (energy/orange)
Violet:     #a050e0     (crit/purple)
Topaz:      #c8a45e     (heat/gold)
Emerald:    #41dc78     (corrosive/green)
```

### Focus School Colours

```
Madurai:    #ff6040     (red-orange — aggression)
Zenurik:    #40a0ff     (blue — energy/knowledge)
Naramon:    #40d080     (green — growth/melee)
Unairu:     #d08040     (brown — earth/armor)
Vazarin:    #40c0d0     (cyan — healing/support)
```

### Status Effect Colours

```
Health:   #50d080     (green)
Shields:  #5098e0     (blue)
Armor:    #e87a30     (orange)
Energy:   #50d0e0     (cyan)
Overguard:#d0a060     (gold)
Shield Gate: #00f2ff  (teal)
Adaptation:  #d060d0  (purple)
```

---

## 5. Typography System

### Font Selection

| Role | Font | Fallback | Weight | Use |
|------|------|----------|--------|-----|
| Display | Archivo Narrow | sans-serif | 700 (Bold) | Section titles, panel headers, large numbers |
| Body | Inter | sans-serif | 400, 500, 600 | All body text, labels, tooltips |
| Mono | JetBrains Mono | monospace | 400, 500 | Numbers, formulas, code, calculations |
| Numeric | JetBrains Mono | monospace | 500 | Stat values, DPS numbers, percentages |

### Size Scale

```
Caption:    9px  / 12px line-height  / 400 weight  —  Status bar items, badges
Micro:      10px / 14px line-height  / 500 weight  —  Small labels, tab text
Small:      11px / 16px line-height  / 400 weight  —  Tooltips, dropdown items
Body:       12px / 18px line-height  / 400 weight  —  Most UI text
Body Large: 13px / 20px line-height  / 400 weight  —  Important labels
Heading:    15px / 22px line-height  / 600 weight  —  Panel titles
Large:      18px / 26px line-height  / 700 weight  —  Hero numbers
Display:    24px / 30px line-height  / 700 weight  —  Page titles
Mono Body:  11px / 16px line-height  / 400 weight  —  Code/formula text
Mono Large: 14px / 20px line-height  / 500 weight  —  Stat values, big numbers
Mono Display: 20px / 26px line-height / 700 weight  —  Final stat values in explorer
```

### Reading Rhythm

```
Body paragraphs:  max-width 600px (never full-width)
Line length:      45-75 characters
List spacing:     6px between items
Section spacing:  16px between sections
```

### Typography Rules

1. **Never use all-caps for body text.** Only for labels, section headers, and badges.
2. **Letter-spacing** is 0.5-2px for uppercase text only. Never for lowercase.
3. **Numbers always use JetBrains Mono** for alignment and readability.
4. **Formula text** uses JetBrains Mono with `word-break: break-all` for long formulas.
5. **Stat values** are right-aligned. Stat labels are left-aligned.
6. **Line height** for stat rows is tight (14px for 11px text) to maximize density.

---

## 6. Iconography System

### Icon Style

```
Stroke:     1.5px (24px grid), 1.25px (20px grid), 1px (16px grid)
Corners:    Rounded 1.5px (matching UI corner radius)
Style:      Outlined — filled only for active/selected states
Grid:       24×24px standard, 20×20px for inline, 16×16px for badges
Alignment:  Pixel-snapped to 4px grid
```

### Icon Categories

| Category | Style | Size | Colour |
|----------|-------|------|--------|
| Navigation | Outlined | 20×20 | Text secondary |
| Actions | Outlined | 20×20 | Text primary |
| Stats | Outlined | 16×16 | Stat-specific colour |
| Damage Types | Filled | 16×16 | Damage type colour |
| Status Effects | Outlined | 16×16 | Status colour |
| Factions | Filled | 20×20 | Faction colour |
| Rarities | Filled | 12×12 | Rarity colour |
| Polarity | Filled | 16×16 | Polarity colour |
| Schools | Filled | 20×20 | School colour |
| Shards | Filled | 16×16 | Shard colour |

### Required Icons (partial list)

**Navigation:** Warframe, Primary, Secondary, Melee, Companion, Arch-Gun, Operator, Config, Search, Command, Menu, Back, Forward, Close, Expand, Collapse

**Actions:** Save, Load, Export, Import, Compare, Share, Print, Undo, Redo, Reset, Delete, Edit, Copy, Paste, Pin, Favorite, Filter, Sort, Add, Remove

**Stats:** Health, Shield, Armor, Energy, EHP, Sprint, Crit Chance, Crit Damage, Status, Fire Rate, Multishot, Magazine, Reload, Damage, Strength, Duration, Range, Efficiency

**Damage:** All 14 damage types

**Status:** Slash, Heat, Cold, Electric, Toxin, Blast, Corrosive, Gas, Magnetic, Radiation, Viral

**Factions:** Grineer, Corpus, Infested, Sentient, Orokin, Corrupted, Tenno

**UI:** Chevron, Arrow, Star, Circle, Square, Diamond, Triangle, Dot, Dash, Plus, Minus, X, Check, Warning, Error, Info, Question, External Link

---

## 7. Illustration Language

### Recommended Approach

TennoDex should use **blueprint/technical illustration style** — not rendered 3D, not photographic.

**Blueprint style:**
- Line art on dark backgrounds
- Cyan/gold wireframe aesthetic
- Orthographic projection
- Technical annotation lines
- Grid backgrounds

**When to use:**
- Empty states (blueprint of a warframe, floating)
- Loading screens (wireframe assembly animation)
- Knowledge Base (technical diagrams with annotations)
- About screen (full technical illustration)
- Background accents (subtle wireframe elements)

**Not recommended for TennoDex:**
- 3D renders (too heavy, conflicts with UI)
- Photographic assets (too generic)
- Hand-drawn illustrations (wrong tone)
- Character art (distracting, implies narrative)

### Illustration Examples

**Empty State — No Build Selected:**
A wireframe warframe silhouette in the center, with cyan construction lines radiating outward. Annotations like "MOD_SLOT_1: EMPTY" in mono font. The warframe is 50% opacity, the annotations are 30% opacity. White text below: "Your builds start here."

**Loading Screen:**
A four-phase animation. 1) Cyan grid appears from center. 2) Wireframe outlines of common mods fade in. 3) A warframe wireframe assembles line by line. 4) The UI fades in as the wireframe fades to background.

**Knowledge Base — Formula Illustration:**
For each formula (e.g., EHP), an annotated diagram showing the components. EHP = Health × (1 + Armor/300) + Shields — each term is a labeled box with arrows showing the flow.

---

## 8. Component Catalogue

### 8.1 Buttons

| Prop | Values |
|------|--------|
| Size | sm (24px), md (28px), lg (34px) |
| Variant | primary, secondary, ghost, danger, holographic |
| State | default, hover, active, disabled, loading |
| Icon | optional leading icon |
| Label | required (text or icon-only) |

**Primary button:** Teal background, white text. Hover: brighter teal. Active: pressed teal.

**Secondary button:** Transparent background, teal border. Hover: teal background at 10% opacity.

**Ghost button:** No border. Hover: subtle background fill. Used in tight spaces (toolbars).

**Danger button:** Red accent. Used for destructive actions (clear build, remove mod).

**Holographic button:** For special actions (Knowledge Base links, external references). Cyan glow on hover.

### 8.2 Panels

Panels are the fundamental container. Every section of the UI is a panel.

```
Panel anatomy:
┌──────────────────────────────┐
│ Header (28px)                │ ← Optional. Has title + actions.
│──────────────────────────────│
│ Body (flexible)              │ ← Scrollable if content overflows.
│                              │
│                              │
└──────────────────────────────┘
```

**Panel variants:**
- **Default** — Standard panel with optional collapsible header
- **Card** — Smaller, border-only, no header. Used for stat rows, mod cards.
- **Modal** — Elevated, centered, backdrop blur. For focused actions.
- **Tooltip** — Floating, no header, auto-positioning. For hover information.
- **Dropdown** — Floating, anchored to a trigger. For menus.
- **Toast** — Fixed position, auto-dismiss. For notifications.

### 8.3 Mod Slot

```
┌─────────┐
│  [icon] │  ← Polarity symbol (colored)
│  Name   │  ← Mod name (truncated to 1 line)
│  Drain  │  ← Drain cost (with polarity match indicator)
│  [×]    │  ← Remove button (on hover)
├─────────┤
│ Rank    │  ← Rank dots (● ● ● ○ ○)
└─────────┘
Size: 52×64px
Border radius: 4px
Background: Panel level
```

**States:**
- **Empty:** Dashed border, polarity symbol faded (+). Cursor: pointer.
- **Filled:** Solid border, mod info. Drop zone indicator on hover.
- **Matched polarity:** Green-tinted border. Drain value in green.
- **Mismatched polarity:** Red-tinted border. Drain value in red.
- **Dragging:** Raised elevation, 0.9 scale, 30% opacity.
- **Drag target:** Cyan glow border, pulsing.

### 8.4 Capacity Bar

```
┌────────────────────────────────────┐
│ Capacity: 42/60   ████████████░░░  │
│                                    │
│ Drain per slot:  [8] [6] [4] [12] │
└────────────────────────────────────┘
```

**Color coding:**
- <80%: Teal (normal)
- 80-99%: Orange (warning)
- 100%: Red (full)
- >100%: Red with pulse animation (overloaded)

### 8.5 Stat Row

```
❤ Health          740     ← clickable
  ↑ icon           ↑ value   ↑ click opens
  (stat-specific)  (mono font)  calculation
```

**Height:** 20px (compact) or 24px (comfortable)
**Animation:** Value changes animate with a brief highlight flash (0.3s) in the stat's color.

### 8.6 Tabs

```
[MODS] [WEAPONS] [FRAMES] [ARCANES] [ENEMIES]
   ↑ Active tab: bottom border accent color, text accent color
   ↑ Inactive tab: muted text, no border
   ↑ Hover: subtle background fill
```

Tab height: 28px. Active indicator: 2px bottom border.

### 8.7 Badges

Used for: polarity, rarity, faction, status, damage type, equipped count.

| Size | Usage |
|------|-------|
| 14×14 | Inline with text (polarity in mod card) |
| 18×18 | Small indicator (status on stat row) |
| 22×22 | Standard badge (section header) |
| 28×28 | Large badge (category header) |

### 8.8 Progress Bars

Used in: ability stat bars, capacity, loading, build health.

Height: 4px (inline) or 8px (featured).
Border radius: 2px.
Fill animation: 0.3s ease-out.

### 8.9 Scrollbars

Custom webkit scrollbars matching the design system:

```
Width: 6px
Track: transparent
Thumb: rgba(132,148,149,0.3)
Thumb hover: rgba(132,148,149,0.5)
Border radius: 3px
```

### 8.10 Splitters (Drag Handles)

```
Width: 3px (vertical), 4px (horizontal)
Color: transparent (default), rgba(0,242,255,0.3) (hover)
Cursor: col-resize / row-resize
```

---

## 9. Motion Language

### Motion Principles

1. **Purposeful** — Every animation communicates something: state change, hierarchy, feedback.
2. **Fast** — UI motion is 120-200ms. Never longer than 300ms for UI elements.
3. **Subtle** — If the user notices the animation before the information, it's too slow or too loud.
4. **Consistent** — Same easing, same duration for same type of interaction.

### Duration Scale

```
Micro-interaction:  80ms     (hover, focus ring)
Fast:               120ms    (button press, tab switch)
Normal:             200ms    (panel expand, dropdown open)
Slow:               300ms    (modal open, workspace transition)
Loading:            500ms+   (shimmer, progress)
```

### Easing

```
Standard:  cubic-bezier(0.4, 0, 0.2, 1)  —  All UI transitions
Decelerate: cubic-bezier(0, 0, 0.2, 1)   —  Elements entering
Accelerate: cubic-bezier(0.4, 0, 1, 1)   —  Elements leaving
Spring:     cubic-bezier(0.34, 1.56, 0.64, 1)  —  Celebratory (rare)
```

### Transition Map

| Interaction | Property | Duration | Easing |
|------------|----------|----------|--------|
| Button hover | background-color | 80ms | Standard |
| Button press | transform: scale | 80ms | Standard |
| Panel expand | max-height, opacity | 200ms | Decelerate |
| Panel collapse | max-height, opacity | 150ms | Accelerate |
| Dropdown open | opacity, transform | 120ms | Decelerate |
| Dropdown close | opacity | 80ms | Accelerate |
| Modal open | opacity, transform | 200ms | Decelerate |
| Modal close | opacity | 150ms | Accelerate |
| Stat change | color, background | 300ms | Standard |
| Drag start | transform: scale, opacity | 120ms | Standard |
| Drag end | transform, opacity | 200ms | Spring |
| Search results | opacity, transform | 120ms | Decelerate |
| Workspace switch | opacity | 200ms | Standard |
| Tab switch | color | 120ms | Standard |

---

## 10. Microinteractions

### Stat Hover
- Cursor changes to pointer
- Value text gets a subtle underline (1px, same color as stat)
- Tooltip with quick breakdown appears after 400ms delay

### Mod Drag
- Mod lifts (scale: 1.05, elevation +1)
- Ghost follows cursor at 0.7 opacity
- Drop zone candidates glow with cyan border
- On drop: brief scale bounce (spring easing)
- On invalid drop: shake (50ms left/right × 3)

### Capacity Warning
- When capacity exceeds 80%: bar starts shifting toward orange (1s gradient transition)
- At 100%: bar pulses orange (1s cycle)
- Over 100%: bar pulses red, drain values flash

### Save
- Brief checkmark animation (200ms)
- Status bar dot turns green
- Toast: "Build saved" — 2s auto-dismiss

### Calculation Complete
- No animation (calculation should be <100ms)
- If >100ms: loading bar appears in status bar
- On complete: subtle flash on values that changed

### Knowledge Base Reference
- KB link appears as a small tag on stat rows (KB-003)
- Click opens KB card in inspector with expand animation

---

## 11. Empty States

Every empty state follows this pattern:

```
┌─────────────────────────────────────┐
│                                     │
│         [Wireframe Illustration]    │
│                                     │
│      [Title: What's missing]        │
│                                     │
│   [Explanation: why it's empty]     │
│                                     │
│   [Action: what to do next]         │
│                                     │
│   (Don't show this without purpose) │
│                                     │
└─────────────────────────────────────┘
```

### Empty State: No Build

```
┌─────────────────────────────────────┐
│         (Wireframe Warframe)         │
│                                     │
│      Your Arsenal Awaits            │
│                                     │
│   Select a Warframe from the        │
│   Equipment Explorer or press       │
│   Ctrl+K to search.                 │
│                                     │
│   [Browse Warframes]                │
└─────────────────────────────────────┘
```

### Empty State: No Search Results

```
┌─────────────────────────────────────┐
│         (Wireframe Magnifying Glass) │
│                                     │
│      No Results Found               │
│                                     │
│   "ArbitraryModName" didn't match   │
│   any mods, weapons, or arcanes.    │
│                                     │
│   Try a different search term.      │
│   Mods are searched by name, stat,  │
│   polarity, and set.                │
│                                     │
│   [Clear Search]                    │
└─────────────────────────────────────┘
```

### Empty State: No Enemy Selected

```
┌─────────────────────────────────────┐
│         (Wireframe Enemy Silhouette) │
│                                     │
│      No Target Selected             │
│                                     │
│   Enable Enemy Lab from View →      │
│   Workspace → Enemy Lab, or select  │
│   an enemy from the Enemy tab.      │
│                                     │
│   [Open Enemy Lab]                  │
└─────────────────────────────────────┘
```

---

## 12. Accessibility

### WCAG Compliance Goals

| Level | Target | Current Status |
|-------|--------|---------------|
| AA | All text | ✅ Implemented |
| AA | Interactive elements | ✅ Implemented |
| AA | Color contrast | ⚠️ Verify muted text (4.5:1 ratio) |
| AAA | Enhanced contrast | 🔲 Future |
| AA | Keyboard navigation | ⚠️ Partial (Milestone 8 scope) |
| AA | Screen reader support | 🔲 Future |

### Keyboard Navigation

Every interactive element must be reachable via Tab. Focus order follows reading order (left to right, top to bottom).

```
Tab stops in Build Canvas (in order):
1. Equipment selector
2. Capacity bar (expand details)
3. Aura slot
4. Exilus slot
5. Mod slot 1-8
6. Arcane slot 1-2
7. Shard slot 1-5
8. Helminth toggle
9. Helminth donor selector
10. Exalted indicator

Every mod slot:
Tab → focus
Enter/Space → open mod selector
Arrow keys → navigate results
Enter → confirm
Escape → cancel
Delete → remove mod
+/- → rank up/down
```

### Colour Blindness

- Never use color alone to convey information
- All colored indicators have a secondary differentiator:
  - Polarity: color + symbol (V, —, D, ◆, □, ★)
  - Damage type: color + name label
  - Rarity: color + border style + label
  - Stat delta: color + arrow direction (↑ green, ↓ red)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All animations must be safe to disable. No animation should be critical to understanding.

### Screen Reader Support

- All icons: `aria-hidden="true"` with label in parent element
- All stat values: `aria-label="Health: 740"`
- All mod slots: `role="button"` with `aria-label="Mod slot 1. Empty. Madurai polarity."`
- All panels: `role="region"` with `aria-label`
- Live region (`aria-live="polite"`) for stat change announcements

---

## 13. Asset Inventory

| Asset | Format | Resolution | Animated | Priority |
|-------|--------|-----------|----------|----------|
| Application icon | PNG + ICO | 256×256, 64×64, 32×32, 16×16 | No | P0 |
| Splash screen | PNG | 800×600 | No | P0 |
| Empty state: no build | SVG | Responsive | No | P0 |
| Empty state: no results | SVG | Responsive | No | P0 |
| Empty state: no enemy | SVG | Responsive | No | P1 |
| Loading wireframe | Lottie | 400×400 | Yes | P1 |
| Warframe icon (nav) | SVG | 20×20 | No | P0 |
| Weapon icons (nav) | SVG ×6 | 20×20 | No | P0 |
| Damage type icons | SVG ×14 | 16×16 | No | P0 |
| Status effect icons | SVG ×11 | 16×16 | No | P1 |
| Polarity symbols | SVG ×6 | 16×16 | No | P0 |
| Faction icons | SVG ×7 | 20×20 | No | P1 |
| Focus school icons | SVG ×5 | 20×20 | No | P1 |
| Shard color swatches | SVG ×6 | 12×12 | No | P0 |
| Rarity indicators | SVG ×4 | 12×48 | No | P0 |
| Stat icons | SVG ×30+ | 16×16 | No | P1 |
| KB illustrations | SVG ×10 | Responsive | No | P2 |
| Background texture | PNG | 2048×2048, tileable | No | P1 |
| Noise overlay | PNG | 512×512, tileable | No | P2 |

---

## 14. Design Tokens

### Spacing Tokens

```css
--space-2:   2px
--space-4:   4px
--space-6:   6px
--space-8:   8px
--space-10:  10px
--space-12: 12px
--space-14: 14px  /* only for icon centering */
--space-16: 16px
--space-20: 20px
--space-24: 24px
--space-28: 28px  /* header heights */
--space-32: 32px
--space-40: 40px
--space-48: 48px
```

### Radius Tokens

```css
--radius-none:   0px
--radius-sm:     2px
--radius-md:     4px
--radius-lg:     8px
--radius-xl:     12px
--radius-pill:   9999px
```

### Elevation Tokens

```css
--elevation-0:   none
--elevation-1:   0 1px 3px rgba(0,0,0,0.3)
--elevation-2:   0 4px 12px rgba(0,0,0,0.4)
--elevation-3:   0 8px 32px rgba(0,0,0,0.5)
--elevation-4:   0 12px 48px rgba(0,0,0,0.6)
```

### Animation Tokens

```css
--duration-micro:  80ms
--duration-fast:   120ms
--duration-normal: 200ms
--duration-slow:   300ms

--easing-standard:   cubic-bezier(0.4, 0, 0.2, 1)
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1)
--easing-accelerate: cubic-bezier(0.4, 0, 1, 1)
--easing-spring:     cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Z-Index Tokens

```css
--z-base:     1
--z-hover:    5
--z-sticky:   10
--z-dropdown: 50
--z-drawer:   80
--z-modal:    100
--z-toast:    200
```

### Sizing Tokens

```css
--header-h:     44px
--status-bar-h: 24px
--sidebar-w:    220px
--inspector-w:  300px
--drawer-h:     200px

--icon-sm:   16px
--icon-md:   20px
--icon-lg:   24px

--btn-sm:    24px
--btn-md:    28px
--btn-lg:    34px

--panel-header-h: 28px
--stat-row-h:     20px
--mod-slot-w:     52px
--mod-slot-h:     64px
```

---

## 15. Production Standards

### Design Deliverable Checklist

Before any UI component is considered "done":

```
□ Visual mockup exists in the design system's format
□ All states documented (default, hover, active, disabled, loading, error, focus)
□ Responsive behavior defined
□ Animation defined (enter, exit, state change)
□ Accessibility verified (keyboard, screen reader, contrast)
□ Dark theme tested (no light theme until P2)
□ Empty state defined (if applicable)
□ Error state defined (if applicable)
□ Loading state defined (if applicable)
□ Design tokens used (no hardcoded values)
```

### Component Review Checklist

```
□ Does this component exist in the design system?
□ If not, should it be added to the system, or can an existing component be extended?
□ Does it follow the 4px grid?
□ Does it use the correct elevation level?
□ Does it use the correct radius?
□ Does it handle text overflow?
□ Does it handle RTL (future)?
□ Does it respect reduced motion?
```

### Quality Gates

| Gate | Required For | Review By |
|------|-------------|-----------|
| Design review | All UI changes | Creative Director |
| Accessibility review | All UI changes | Accessibility lead |
| Motion review | Animated components | Motion designer |
| Token audit | All color/spacing changes | Design systems architect |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Design system not followed | Medium | High | Enforce via linting + component library |
| Token inconsistency | Medium | Medium | Automated token audit in CI |
| Motion makes app feel slow | Low | High | All animations ≤200ms by default |
| Icon inconsistencies | Medium | Medium | SVG sprite with automated export |
| Accessibility gaps | High | Medium | Screen reader testing in QA pipeline |

---

## Design Quality Checklist (pre-launch)

```
□ Every interactive element has hover + focus + active states
□ Every stat is clickable (opens Calculation Explorer)
□ Every action is undoable
□ Every empty state has an illustration + explanation + action
□ Every panel has a clear purpose (no orphaned panels)
□ Loadout tree shows full build at a glance
□ Drag-and-drop works for all equipment types
□ Right-click context menus on mods, equipment, stats
□ Command palette has 40+ commands
□ Keyboard navigation reaches everything
□ No animation >300ms for UI transitions
□ No color-only indicators
□ Reduced motion respected
□ All icons are SVG (no emoji, no PNG)
□ Typography scale is consistent (no orphaned sizes)
```

---

*End of TennoDex Design System, Visual Language & Art Direction Bible*
