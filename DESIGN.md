---
name: Void Synthetic
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ffba30'
  on-secondary: '#422c00'
  secondary-container: '#e19f00'
  on-secondary-container: '#563a00'
  tertiary: '#fff4ff'
  on-tertiary: '#4d007a'
  tertiary-container: '#eed0ff'
  on-tertiary-container: '#9013dc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffdeab'
  secondary-fixed-dim: '#ffba30'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#f3daff'
  tertiary-fixed-dim: '#e2b6ff'
  on-tertiary-fixed: '#2f004d'
  on-tertiary-fixed-variant: '#6e00ab'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
  stat-value:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-gap: 12px
  section-margin: 24px
  mod-width: 160px
  mod-height: 220px
  sidebar-width: 280px
---

## Brand & Style

This design system is a high-fidelity "Void-inspired" interface designed for maximum data density and immersion. It merges **Glassmorphism** with a **Corporate/Modern** systematic approach to handle complex mathematical builds. The aesthetic is "Digital Occult"—clean, precise, but with an underlying energy that mimics the holographic displays of the Orokin era.

The visual narrative relies on deep obsidian layering, where information "floats" on translucent panes. Tactile feedback is conveyed through neon glows and micro-interactions, making the companion feel like a physical diagnostic tool within the game universe.

## Colors

The palette is anchored in **Obsidian** and **Deep Charcoal** to ensure the OLED blacks provide a limitless backdrop. 
- **Neon Teal (#00f2ff):** Used for primary actions, energy levels, and common stat indicators. It represents active power.
- **Orokin Gold (#ffb929):** Reserved for high-tier data—Prime mods, rare items, and critical success states.
- **Status Purple (#b347ff):** Used for auxiliary systems, status effects, and "Void" energy markers.
- **Glass Overlays:** Utilize low-opacity white tints with a high `backdrop-filter: blur(20px)` to create depth without sacrificing legibility against the dark background.

## Typography

Typography is focused on **utility and information density**. 
- **Headers:** Archivo Narrow provides a condensed, authoritative feel for titles and section headings, maximizing horizontal space.
- **Body & Tables:** Inter is the workhorse for statistics and descriptions, chosen for its exceptional legibility at small sizes.
- **Mono Accents:** JetBrains Mono is utilized for technical data points (Capacity, Drain, Polarity), providing a "hacker" or "diagnostic" aesthetic.
- **Contrast:** Headers should always use uppercase with slight letter spacing to mimic Orokin terminal displays.

## Layout & Spacing

The layout follows a **structured grid hierarchy** derived from the in-game upgrade screen:

1.  **Sidebar (Left):** A fixed-width column containing the primary stat breakdown (Health, Shield, Armor, etc.) and ability scaling.
2.  **The Mod Matrix (Center):** 
    - **Header Row:** Contains the Aura slot (top left) and Exilus slot (top right) separated by a configuration selector.
    - **Primary Grid:** A 2x4 grid of "Mod Slots." Each slot is a fixed aspect ratio container.
3.  **Arcane Column (Right):** A vertical stack of two specialized sockets.
4.  **Inventory Drawer (Bottom):** A fluid horizontal scroll area containing the available mod library.

**Responsive Behavior:** On tablet, the sidebar collapses into a top-level toggle. On mobile, the mod grid reflows to a 4x2 vertical scroll with the sidebar tucked into a bottom-sheet.

## Elevation & Depth

This system ignores traditional shadows in favor of **Luminous Layers** and **Backdrop Blurs**:

- **Level 0 (Base):** Obsidian background (#060608).
- **Level 1 (Panels):** Surface glass overlays with a 1px inner border (`rgba(255, 255, 255, 0.1)`).
- **Level 2 (Interactive):** Active mods or hovered cards gain an outer glow (0px 0px 15px) using the Teal or Gold accent colors depending on rarity.
- **Depth Perception:** Use "Depth-of-field" blurs. When a mod is selected for editing, the background grid should increase in blur while the active mod scales slightly (1.05x) and remains sharp.

## Shapes

The shape language is **Technical & Angular**.
- **Cards & Containers:** Use a subtle 0.25rem (Soft) radius to maintain a high-tech feel.
- **Mod Frames:** Feature "clipped" or notched corners (45-degree cuts) rather than standard rounding to mimic the physical Warframe mod design.
- **Progress Bars:** Flat caps with no rounding, utilizing segmented blocks for a "digital" energy-bar aesthetic.

## Components

### Mod Cards
The core component. Each card must include:
- **Header:** Polarity icon and Drain cost (top right).
- **Visual:** A central glass container for the mod art.
- **Rank Indicator:** A series of small teal pips at the bottom to represent current rank.
- **Rarity Border:** A 2px gradient border—Common (Bronze), Uncommon (Silver), Rare/Prime (Gold).

### Stat Readouts
- **Label:** Left-aligned, `data-label` typography.
- **Value:** Right-aligned, `stat-value` typography.
- **Bar:** A thin background track with a neon teal fill. If a mod increases a stat, the increase is shown as a secondary teal segment; if it decreases, that segment turns red.

### Holographic Buttons
Ghost-style buttons with a teal border and no background. On hover, the background fills with a 10% teal tint and the border glows.

### Inputs & Search
Obsidion backgrounds with a 1px bottom-only teal border. The text should glow slightly as it is typed, maintaining the "light-based interface" theme.