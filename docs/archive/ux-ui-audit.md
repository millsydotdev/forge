# TennoDex — Executive UX/UI Due Diligence Audit

**Date:** 2 July 2026  
**Auditor:** External UX Consultancy  
**Status:** BETA READINESS REVIEW

---

## Executive Summary

### Scores

| Dimension | Score | Interpretation |
|-----------|-------|---------------|
| Overall UX | 5.5/10 | Functional but not delightful. Learning curve is steep. |
| Overall UI | 6.0/10 | Custom design system exists but lacks refinement. |
| Desktop Experience | 4.5/10 | Feels like a web app in an Electron wrapper, not a native desktop app. |
| Product Design | 5.0/10 | Core concept is strong. Execution lacks vision. |
| Information Architecture | 5.5/10 | Functional hierarchy but poor discoverability. |
| Accessibility | 3.0/10 | Keyboard nav exists but is incomplete. Screen reader support minimal. |
| Interaction Design | 4.0/10 | Click-heavy. No drag-and-drop. Limited feedback. |
| Visual Design | 6.5/10 | Dark theme is appealing. Inconsistencies in spacing and density. |
| Cognitive Load | 4.5/10 | Too many panels, too much text, not enough visual hierarchy. |
| Beta Readiness | 5.0/10 | Technically functional. UX needs significant iteration before beta. |

### The Ten Biggest Problems

1. **No drag-and-drop mod placement.** Every mod is placed by clicking an empty slot, searching a popup, and selecting. Path of Building has had drag-and-drop for a decade. This alone makes the app feel amateur.

2. **Workspace is a web app grid, not a native desktop.** The CSS Grid layout with DragHandles works technically but creates visual friction. Panels snap to grid positions rather than floating/docking naturally. Resizing is implemented with custom mouse handlers that feel dated.

3. **Information density is inconsistent.** The StatsHUD crams tiny text entries together. The Build Canvas has generous spacing. Different parts of the app use different densities, creating visual whiplash.

4. **The Bottom Drawer and Left Sidebar fight for attention.** Both contain overlapping functionality (the drawer has mods/weapons/frames/arcanes/enemies; the sidebar has stats). Users must mentally track which panel has what.

5. **No visual feedback many operations.** Mod placement triggers no animation. Stat changes appear silently. There's no "something happened" signal. Users must scan numbers to detect changes.

6. **Calculation Explorer is hidden.** Despite being the flagship feature (Milestone 7), it's only reachable by clicking stats. There is no menu item, no keyboard shortcut, no toolbar button. Users won't discover it.

7. **Typography scale is flat.** The design system has `--font-body` and `--font-display` but uses tiny sizes (9-13px) everywhere. No visual hierarchy through size. Everything looks the same size.

8. **Empty states are hostile.** "No Warframe Selected" with no guidance. "Select a weapon from the library" but the library is in a different panel. Users must infer workflows.

9. **No undo/redo.** Every mod placement, arcane change, and shard toggle is permanent. Users fear experimenting. This is the single highest-impact UX improvement available.

10. **The application identity is unclear.** The name "TennoDex" suggests a database/wiki. The brand is "TennoDex" with a subtitle "Warframe Build Planner" — but it's actually a full theorycrafting studio. The identity undersells the product.

### The Ten Biggest Opportunities

1. **Drag-and-drop modding from the Equipment Explorer.** Transform the entire interaction model. Users drag mods from the explorer directly onto the build canvas. This alone would elevate the app from "functional" to "professional."

2. **Unified floating panel architecture.** Replace CSS Grid panels with a true floating/docking system. Users can tear off panels, rearrange them, group them. This is what desktop software does.

3. **Live stat delta on every interaction.** When a mod is placed or removed, animate the stats that changed. Highlight the changed values. Show +X or -X with direction arrows. Make the app reactive visually, not just computationally.

4. **Undo/redo command stack.** Every user action goes on a stack. Ctrl+Z undoes. The stack is displayed as a "History" panel. Users can step through changes. This enables experimentation and builds confidence.

5. **Progressive disclosure for the Calculation Explorer.** Instead of a modal, make the explorer a persistent panel that updates as users interact. Show the breakdown for the most recently changed stat automatically.

6. **Structured onboarding flow.** First-time users are guided through: select a warframe → add a mod → see stats change → explore a calculation → save the build. This teaches the workflow and demonstrates the app's value immediately.

7. **Unified search.** One search that finds everything: mods, warframes, weapons, arcanes, Knowledge Base entries, settings. Ctrl+K should be the universal entry point. Currently there are two separate search systems.

8. **Comparison as a first-class view.** Instead of a modal, make build comparison a split-panel workspace view. Users should be able to see two builds side-by-side with delta highlighting on every stat.

9. **Visual calculation trees.** Instead of text-based stat breakdowns, render actual tree diagrams. Each modifier is a node. Arrows show the flow. The user can expand/collapse subtrees. Make the math visual.

10. **Plugin/theming architecture.** Allow users to customize colors, panel layouts, and keyboard shortcuts. This is what premium desktop software offers. It turns users into advocates.

---

## 1. Product Identity

### Current State
TennoDex presents as a dark-themed Warframe build calculator. The logo is the text "⬡ TennoDex" in gold. The tagline is absent from the UI — the branding in the TopBar is minimal.

### Problems
- **The name "TennoDex" implies a database/dex (like Pokédex), not a theorycrafting studio.** Users expecting a reference guide will be confused by the build planner focus.
- **No visual identity beyond the color scheme.** There is no mascot, no icon system, no loading animation, no signature element that says "this is TennoDex."
- **The .exe/window title is not customized.** Electron apps that look professional customize their window frame, title bar, and taskbar presence.
- **The application lacks a "why this exists" message.** There's no about screen, no mission statement, no "built for theorycrafters" signal.

### Recommendations
- Add a tagline: "Warframe Theorycrafting Studio" or "Build Lab"
- Design a proper logo mark (not just text) — a geometric Warframe-inspired icon
- Customize the Electron window chrome (title bar color, taskbar icon overlay)
- Add a welcome/onboarding screen that explains the product's purpose

---

## 2. Information Architecture

### Current State
The workspace has 5 zones: TopBar, Left Sidebar, Center Canvas, Right Inspector, Bottom Drawer. Navigation is via number keys (1-7) or command palette. Content is distributed across these zones based on an editorial decision, not user research.

### Problems
- **The Left Sidebar and Bottom Drawer overlap in purpose.** The sidebar shows stats (StatsHUD). The drawer has tabs for Mods, Weapons, Frames, Arcanes, Enemies. Stats and browsing are separated but should be connected.
- **The Equipment Explorer lives in the workspace center (as a surface), competing with the build canvas.** Users must switch between "build" mode and "browse" mode via slot switching. This is a page metaphor, not a desktop metaphor.
- **Three levels of navigation exist side-by-side:** slot switching (1-7), drawer tabs (library, arcanes, enemies), inspector modes (idle, stat, tool). This is confusing.
- **The command palette has 20 commands but no user-extensibility.** It covers basics but not deep operations.
- **No global navigation bar.** The TopBar has build name, MR, save button, and two dropdowns. There is no file/edit/view/help menu bar (standard in desktop apps).

### Recommendations
- **Consolidate the sidebar and drawer.** Move stats into a dedicated panel. Make browsing a first-class panel. Users should be able to see equipment and stats simultaneously without mental toggling.
- **Replace slot switching with a persistent equipment tree.** Users should see their full loadout in a sidebar tree and click items to edit them inline.
- **Replace the "surface" routing with contextual panels.** Instead of switching the entire center area between FrameSurface/WeaponSurface/etc., make the canvas zoom into the selected item.
- **Add a traditional menu bar** (File → New/Save/Export/Import, Edit → Undo/Redo, View → Panels, Help → About/KB).

---

## 3. Build Workflow Audit

### Creating a Build
**Current flow:** Select slot (1-7) → Choose item from dropdown → Add mods via popup → Build computes.
**Problems:**
- **6-8 clicks to add a single mod.** Click slot → click mod grid empty space → popup opens → search/filter → click mod → popup closes. Path of Building: drag mod from list to slot. 1 action.
- **Equipment selection is a `<select>` dropdown.** In a desktop app with 50+ warframes and 200+ weapons, a dropdown with scrolling is painful. It should be a visual picker with categories, search, and thumbnails.
- **No visual indication of what changed.** After placing a mod, the stats update silently. Users must remember previous values and scan for differences.

### Arcanes
**Current flow:** Scroll down the canvas → find the Arcane section → use a `<select>` dropdown to pick from 168 arcanes.
**Problems:**
- Arcanes are hidden below the mod grid. Users must scroll past 8 mod slots to reach them.
- The arcane pool is not filtered by category. Warframe arcanes show alongside weapon arcanes.
- No rarity indicator, no arcane set bonus info inline.

### Shards
**Current flow:** Scroll down → find Shard section → use dropdown per slot → toggle Tau checkbox.
**Problems:**
- Shard colors are shown as dropdown text, not visual swatches.
- No indication of which shard bonuses are active on the stats.
- No way to see total shard contribution to stats.

### Helminth
**Current flow:** Scroll down → toggle Helminth on → select donor from dropdown.
**Problems:**
- Dropdown shows all warframes, most of which don't have Helminth abilities. The list is 50+ items long.
- No indication of which ability will be replaced.
- No preview of the ability's effects before selecting.

### Saving/Loading
**Current flow:** Click Save → toast appears. Loading from the TopBar dropdown.
**Problems:**
- Save dialog has no name validation. Users can save with empty names.
- Load dropdown truncates long build names.
- No auto-save. All work is lost on crash.
- No "unsaved changes" indicator.

### Enemy Testing
**Current flow:** Switch to Enemies tab in drawer → configure → view TTK in weapon stats.
**Problems:**
- Enemy configuration is in a completely different panel from weapon stats.
- Changing enemy parameters doesn't auto-update the weapon stats view.
- No enemy EHP display in the weapon stats section.

---

## 4. Workspace Layout

### TopBar
- **Build name input is unstyled.** It looks like a plain HTML input. Desktop apps use styled title bars.
- **MR input has no label, no placeholder.** New users won't know what "MR" means.
- **The dropdown menus (Save, Share, Menu) use custom dropdown components** that look disconnected from the TopBar. Menu bar would be more appropriate.
- **No application icon/menu in the window title area.** Standard desktop convention.

### Left Sidebar
- **Collapsed state shows an icon rail with no labels.** Users can't tell what icons do without hovering.
- **The sidebar shows stats that are also visible in the inspector** (when inspecting warframe stats). Duplicate information.
- **No way to pin specific stats** to the sidebar for quick reference.

### Center Canvas
- **Surface switching (warframe→primary→secondary→melee→etc.) feels like tabbed browsing**, not desktop editing.
- **The SlotSwitcher at the bottom is small and easy to miss.**
- **No breadcrumb navigation** — users can't see where they are in the build hierarchy.

### Right Inspector
- **Scrolls independently from the canvas**, which is good, but means users must coordinate two scroll positions.
- **The idle inspector shows a generic stat list** that duplicates the sidebar.
- **Collapsible sections (Conditionals, Arcanes, Shards, etc.) compete with the canvas's own inline sections.** Same information in two places.
- **Mode switching (idle → stat → tool) is unclear.** Users don't know what these modes do.

### Bottom Drawer
- **The drawer is too tall by default (160px) relative to its content.** The mod library shows only ~4 rows before scrolling.
- **Tab switching requires precise clicks** on small tab labels at the top.
- **The drawer and sidebar feel like competing navigation systems.** Users must decide which panel to use for browsing.

### Status Bar
- **Good addition** (Milestone 5) but underutilized.
- Shows build name, MR, EHP, slot, enemy state — but this is mostly redundant with other panels.
- Could show calculation status, memory usage, last saved time, error counts.

---

## 5. Build Canvas (Micro-Audit)

### Mod Placement
- **Click → popup → search → select is 4+ interactions per mod.** With 8 mod slots per weapon, that's 32+ interactions per build.
- **No drag-and-drop.** The single highest-impact UX improvement available.
- **No right-click context menu** on mods for quick actions (remove, rank up/down, polarity change).

### Slot Arrangement
- **8 mod slots in a 4x2 grid is reasonable**, but the Aura and Exilus special badges sit awkwardly above the grid.
- **Special badges look different from mod slots** (they're inline bars, not grid cells). Visual inconsistency.

### Capacity Display
- **CapacityBar appears in the header** but uses `current/max` format without showing drain per mod.
- **No warning colors** when approaching capacity limit.
- **No "overcapacity" state** shown when mods exceed capacity (though the engine computes it).

### Polarity Display
- **Polarity symbols are small and use the same color** regardless of type. Hard to distinguish at a glance.
- **No polarity match/mismatch indicator** on filled mod slots.
- **Changing polarity requires finding the right slot in an array** — not intuitive.

### Quick Stats
- **Inline stat strip at the top of the canvas is useful** but uses emoji as stat icons (❤🛡⛨⚡🧱). These render differently across platforms and may not have consistent meaning.
- **Percentage values (STR 200%, DUR 100%) are in the same strip as absolute values (Health 740).** Mixing units in the same line is confusing.

### Arcanes (Inline)
- **Dropdown with 168 arcanes is overwhelming.** No search, no category filter.
- **Arcane rank display uses bullet characters (●○)** which are small and hard to read.

### Shards (Inline)
- **5 dropdowns in a row** — takes significant vertical space.
- **Color selector is text-based** instead of visual color swatches.
- **Tau checkbox is tiny** and easy to miss.

### Helminth (Inline)
- **Dropdown with 50+ items**, most of which are disabled (no Helminth ability). User must scroll through all warframes to find eligible donors.
- **No search/filter for Helminth donors.**

---

## 6. Equipment Explorer

### Search
- **Filters only by name.** No polarity filter, no MR filter, no category refinement.
- **Search debouncing not implemented** — every keystroke triggers a filter. With 500+ items, this can feel slow.

### Browsing
- **Grid layout is reasonable** but thumbnail loading from CDN can be slow.
- **No list/compact view option.** Some users prefer text-only dense lists.
- **No sort options** (alphabetical, MR, type, etc.).

### Categories
- **Category switching is instantaneous** but loses scroll position. Users who scroll down in Warframes then switch to Primary start at the top again.
- **The "Favorites" and "Recent" categories are useful** but have no way to clear individual items.

### Selection
- **Single-click selects, double-click navigates.** This is non-standard (most apps use single-click to navigate, double-click for details). Inconsistent mental model.
- **No visual distinction between equipped and unequipped items** in the explorer.

---

## 7. Calculation Explorer

### Strengths
- **Comprehensive breakdown with 5 tabs** is genuinely useful.
- **Color-coded sections** help distinguish base/flat/multiplier values.
- **Knowledge Base integration** is a strong differentiator — no other Warframe tool does this.

### Problems
- **Only reachable by clicking stats.** No menu entry, no keyboard shortcut, no toolbar button. Users won't discover it.
- **Modal overlay hides the build canvas.** Users can't see the build while exploring calculations.
- **The "Dependencies" tab uses a static lookup table** with only ~8 stats mapped. Most stats show a generic "see Breakdown tab" message.
- **The "Comparison" tab compares against the current build's own breakdowns**, which is always identical. It should compare against a saved baseline or another build.
- **No way to export/print a calculation breakdown** for sharing.
- **Search doesn't filter tab content** — it's a visual filter with no visible effect.

---

## 8. Visual Design

### Typography
- **Uses three fonts: Archivo Narrow (display), Inter (body), JetBrains Mono (mono).** Good selection.
- **Sizes are too small.** 9-13px for body text. Desktop apps typically use 13-15px. The tiny text contributes to cognitive load.
- **No type scale system** visible — differents seem arbitrary between components.
- **Letter-spacing is used excessively** (uppercase labels get 1-2px spacing). This is a style choice but reduces readability at small sizes.

### Color
- **Dark void theme is appropriate and well-executed.** The teal accent (cyan) against dark backgrounds is legible.
- **Color semantics exist** (teal = interactive, gold = special, red = danger, green = success) but aren't consistently applied.
- **Low contrast in some areas** — text-muted against surface backgrounds can be hard to read.

### Spacing
- **Inconsistent.** Some sections have generous padding (workspace-body: 8-10px), others are cramped (inline shard grid, mod grid).
- **No consistent 4px/8px grid system visible.** Spacing values appear to be chosen per-component.

### Borders & Radius
- **Border radius is small (2-4px) which is correct for desktop.** Larger radii feel web-app-ish.
- **Borders are consistently rgba with 0.22 opacity** — subtle but visible.

### Visual Hierarchy
- **Weak.** Section titles (uppercase, small, muted) don't create enough visual separation.
- **The mod grid is the visual centerpiece** but has no visual weight advantage over arcane/shard sections below it.
- **The quick stats bar and mod grid are separated by an Aura/Exilus row** that adds visual noise.

---

## 9. Interaction Design

### Hover
- **Mod slots highlight on hover** — good.
- **Stats don't change cursor on hover** unless the StatExplorer was wired (Milestone 7). Most of the app has `cursor: default` everywhere.

### Selection
- **Clicking a stat opens the Calculation Explorer** — good. But no visual indication that stats are clickable (no underline, no color change, no hover effect on the value).

### Drag & Drop
- **Not implemented anywhere.** This is the single biggest interaction gap compared to Path of Building, Blender, or any professional desktop creative tool.

### Right Click
- **Context menu component exists** but is not used for mods, equipment, or stats. Right-click does nothing in most of the app.

### Double Click
- **Equipment Explorer uses double-click for slot navigation.** Non-standard. Most desktop apps use single-click to select/activate.

### Keyboard Shortcuts
- **Good foundation** (Ctrl+S/B/J/`/F/P/K, 1-7, W, E, Escape).
- **No shortcut for** Calculation Explorer, toggle explorer panel, cycle through weapons, or quick-save.
- **Shortcuts are not discoverable** — no shortcut hints in menus or tooltips.

### Command Palette
- **Well-implemented but limited to 20 commands.** Missing: toggle enemy lab, show calculation explorer, open settings, reset build, cycle layout preset.

### Animation/Feedback
- **Minimal.** The loading skeleton is the only significant animation.
- **No transition when panels collapse/expand** — instant snaps.
- **No animation when stats change** — numbers just update in place.
- **No confirmation dialogs** for destructive actions (reset build, delete save).

---

## 10. Competitive Analysis

### vs Overframe.gg
| Dimension | TennoDex | Overframe |
|-----------|----------|-----------|
| Calculation accuracy | ✅ Superior | ❌ Known inaccuracies |
| Build sharing | ❌ tndx1 codes | ✅ URL sharing |
| Community | ❌ None | ✅ Builds, ratings, comments |
| Equipment database | ✅ WFCD-sourced | ❌ Manual entry |
| DPS calculation | ✅ Superior | ❌ Basic |
| Ease of use | ❌ Steep learning curve | ✅ Simple web form |
| Visual design | ✅ Custom dark theme | ❌ Generic web |

### vs Path of Building (PoB)
| Dimension | TennoDex | Path of Building |
|-----------|----------|------------------|
| Calculation depth | ✅ Comparable | ✅ Deep |
| Drag-and-drop modding | ❌ Not implemented | ✅ Drag mods to slots |
| Item comparison | ❌ Basic | ✅ Side-by-side with delta |
| Build sharing | ❌ Code-only | ✅ Pastebin integration |
| Tree/Passive visualization | ❌ N/A (no tree) | ✅ Visual passive tree |
| Community features | ❌ None | ✅ Build browser |
| Undo/redo | ❌ Not implemented | ✅ Full undo stack |
| Desktop feel | ⚠️ Electron web | ✅ Native-ish Electron |

### vs Figma/Blender/VS Code (Desktop Standards)
| Dimension | TennoDex | Desktop Standard |
|-----------|----------|------------------|
| Docking system | ❌ CSS Grid | ✅ Floating/docking panels |
| Plugin architecture | ❌ | ✅ (all three have plugins) |
| Theme system | ⚠️ CSS variables | ✅ Full theme support |
| Undo history | ❌ | ✅ Extensive |
| Keyboard customization | ❌ | ✅ |
| Multi-window support | ❌ | ✅ |
| Drag-and-drop | ❌ | ✅ Core interaction |
| Right-click context menus | ❌ Unused | ✅ Everywhere |
| Menu bar | ❌ | ✅ File/Edit/View/Help |
| Auto-save | ❌ | ✅ |

---

## 11. Design System Audit

### What Exists
- CSS custom properties for colors, typography, spacing, elevation, z-index, transitions
- UI primitives: Button, Input, Panel, Badge, Tooltip, ScrollArea, Separator, Modal, Toast, Dropdown, ContextMenu, Collapsible, TextArea, StatRow, AssetImage, Icon, Skeleton
- Surface components: FrameSurface, WeaponSurface, CompanionSurface, ExaltedSurface, PanelSurface

### What's Missing
- **Design token documentation.** No single source of truth for tokens, their usage, or their relationships.
- **Component states** (hover, active, disabled, focus, error, loading) are inconsistently implemented.
- **Form patterns** (labels, validation, error messages, help text) don't exist as a system.
- **Animation tokens** (duration, easing, stagger) exist in CSS but aren't used consistently.
- **Icon system** relies on emoji, unicode characters, and CDN images. No consistent icon font or SVG sprite.
- **Terminology inconsistency.** "Mod", "Modification", "Mod Slot", "Mod Card" are used interchangeably.
- **Density system** — no compact/comfortable spacing mode.

---

## 12. Accessibility Audit

### Keyboard Navigation
- **Partial implementation.** Number keys (1-7) for slots, Ctrl+ shortcuts for panels, Escape for modals.
- **No Tab navigation through the build canvas.** Users can't Tab from Aura → Exilus → Mod 1 → Mod 2 → etc.
- **Equipment Explorer supports Arrow keys but** focus management is fragile (scrollIntoView can conflict with scroll containers).
- **No Skip-to-content or Skip-to-main links.**
- **Modals trap focus inconsistently.**

### Screen Reader Support
- **Custom components use divs and spans** without proper ARIA roles.
- **Stat values are plain text** — no `aria-label` or `aria-describedby` to provide context.
- **The mod grid uses `button` elements for remove/rank-change** but the interactive region isn't labelled.
- **No live region** (`aria-live="polite"`) for stat changes.

### Color Independence
- **Color is used as the only indicator** for some state (e.g., stat modified/not modified).
- **The stat delta uses ▲/▼ characters** with green/red coloring — the character alone is sufficient.
- **Empty vs filled states for mod slots rely on visual borders and icons** — distinguishable without color.

### Reduced Motion
- **No `prefers-reduced-motion` queries.** Animations and transitions don't respect accessibility settings.
- **The loading shimmer animation** may cause discomfort for some users.

---

## 13. User Psychology Analysis

### Cognitive Load
- **Too many panels fighting for attention.** The eye doesn't know where to look first.
- **No clear primary action.** "What should I do first?" — users must discover the workflow.
- **Information is spread across** the canvas, sidebar, inspector, drawer, and status bar. Users must track state across 5 zones.

### Decision Fatigue
- **Building a Warframe involves 100+ decisions** (which frame, which weapon, 8 mods, 2 arcanes, 5 shards, helminth, polarities). The app should simplify, not add decisions.
- **No starting templates or suggested builds** for new users.
- **Every slot starts empty.** Users face a blank canvas with no guidance.

### Flow State
- **Interruptions break flow.** Opening a popup to select a mod removes focus from the canvas.
- **Recalculation delay** (even if fast) creates a pause between action and feedback.
- **No "recent mods" quick-pick** — users who use the same mods repeatedly must search each time.

### Trust & Confidence
- **The engine is accurate, but the UI doesn't communicate that.** Users have no way to verify calculations.
- **The Calculation Explorer builds trust** but is hidden.
- **No visual "calculation completed" signal** — the loading bar disappears but there's no confirmation.

---

## 14. Problems Register

| ID | Severity | Category | Description | User Impact | Recommended Solution | Effort |
|----|----------|----------|-------------|-------------|---------------------|--------|
| P-001 | CRITICAL | Interaction | No drag-and-drop mod placement | 32+ clicks per build vs ~8 with drag | Implement drag-and-drop from explorer/library to mod grid | Large |
| P-002 | CRITICAL | Workflow | No undo/redo | Users fear changes, cannot experiment | Implement command stack with Ctrl+Z/Y | Large |
| P-003 | HIGH | Information Architecture | Overlapping panel responsibilities | Cognitive load, confusion about where to find things | Consolidate sidebar/drawer/inspector into 3 clear zones | Medium |
| P-004 | HIGH | Navigation | Slot switching feels like page navigation | Disconnected experience, not desktop-like | Replace with persistent tree + context zoom | Large |
| P-005 | HIGH | Interaction | No visual feedback on stat changes | Users miss what changed | Animate stat deltas with color-coded direction arrows | Medium |
| P-006 | HIGH | Discovery | Calculation Explorer is hidden | Flagship feature is undiscoverable | Add toolbar button, keyboard shortcut, contextual hint | Small |
| P-007 | HIGH | Visual Design | Typography too small (9-13px body) | Eye strain, readability issues | Increase base body size to 13-14px, audit all sizes | Medium |
| P-008 | HIGH | Interaction | No right-click context menus | Missed opportunity for power-user workflows | Add context menus to mods, equipment, stats, panels | Medium |
| P-009 | MEDIUM | Workflow | Equipment selection via `<select>` dropdown | Painful with 50+ items | Replace with visual picker/grid | Medium |
| P-010 | MEDIUM | Information Architecture | No menu bar | Non-standard desktop pattern | Add File/Edit/View/Help menu bar | Medium |
| P-011 | MEDIUM | Workflow | Arcanes/Shards/Helminth buried below mod grid | Users must scroll past mods to find them | Reorder canvas or make sections collapsible with persistent headers | Small |
| P-012 | MEDIUM | Visual Design | Inconsistent spacing and density | Visual whiplash between sections | Implement 4px grid system across all components | Medium |
| P-013 | MEDIUM | Accessibility | Partial keyboard navigation | Users who cannot use mouse are blocked | Audit full Tab flow, add ARIA roles, focus management | Large |
| P-014 | MEDIUM | Discovery | No onboarding flow | New users don't know where to start | Build 3-step guided onboarding | Medium |
| P-015 | MEDIUM | Workflow | No auto-save | Work lost on crash | Add auto-save with recovery prompt | Medium |
| P-166 | LOW | Visual Design | Emoji as stat icons (❤🛡⛨⚡🧱) | Inconsistent rendering across platforms | Replace with SVG icons | Small |
| P-017 | LOW | Interaction | Double-click for slot navigation | Non-standard interaction model | Single-click to activate | Small |
| P-018 | LOW | Workflow | No unsaved changes indicator | Users don't know if build was saved | Add dot indicator in TopBar, warn before close | Small |
| P-019 | LOW | Information Architecture | Command palette missing key commands | Limited usability | Add all panel toggles and mode switches | Small |
| P-020 | LOW | Visual Design | Shard color dropdown is text-based | Hard to distinguish colors | Replace with color swatches | Small |

---

## 15. Opportunities Register

| ID | Opportunity | Impact | Effort | Description |
|----|-------------|--------|--------|-------------|
| O-001 | Drag-and-drop modding | Transformative | Large | The single interaction that separates professional tools from web apps |
| O-002 | Undo/redo stack | Transformative | Large | Enables experimentation, builds confidence |
| O-003 | Floating/docking panel system | Transformative | Very Large | Makes TennoDex feel like a desktop app |
| O-004 | Live stat delta on every change | High | Medium | Makes the app reactive and responsive |
| O-005 | Visual calculation trees | High | Medium | Makes Warframe math accessible and educational |
| O-006 | Unified search | High | Medium | One search for everything |
| O-007 | Build comparison as workspace view | High | Medium | First-class diffing |
| O-008 | Persistent Calculation Explorer panel | High | Medium | Always-visible breakdown |
| O-009 | Onboarding flow | High | Medium | Reduces time-to-value |
| O-010 | Plugin/theme architecture | Medium | Very Large | Turns users into advocates |
| O-011 | Visual color swatch picker for shards | Medium | Small | Immediate visual feedback |
| O-012 | Right-click context menus everywhere | Medium | Medium | Power-user efficiency |
| O-013 | Mod template/auto-fill suggestions | Medium | Medium | Helps new users |
| O-014 | Export calculation breakdown as image | Medium | Small | Shareable proofs |
| O-015 | MR-based capacity auto-compute | Medium | Small | Reduces input friction |
| O-016 | Audio feedback on calc complete | Low | Small | Adds personality |
| O-017 | "Explain this build" button (generates natural language summary) | Medium | Medium | Educational value |
| O-018 | Popout panels to separate windows | Medium | Large | Multi-monitor support |
| O-019 | Custom stat pinning in sidebar | Low | Small | User personalization |
| O-020 | Build health gamification (score, milestones) | Low | Medium | Engagement |

---

## 16. Summary of Recommendations by Priority

### Before Beta (CRITICAL — must fix)
1. **Implement undo/redo** (P-002) — users must be able to experiment
2. **Add stat delta feedback** (P-005) — users must see what changed
3. **Make Calculation Explorer discoverable** (P-006) — flagship feature is hidden
4. **Fix typography scale** (P-007) — readability baseline
5. **Add right-click context menus** (P-008) — power-user expectation
6. **Improve keyboard navigation** (P-013) — accessibility baseline
7. **Consolidate panel responsibilities** (P-003) — cognitive load reduction

### Within 3 Months (HIGH — should fix)
8. **Drag-and-drop mod placement** (O-001) — transformative
9. **Visual picker for equipment selection** (P-009) — replaces dropdown
10. **Onboarding flow** (P-014) — reduces learning curve
11. **Unified search** (O-006) — one search to find everything
12. **Auto-save** (P-015) — crash recovery
13. **Replace emoji with SVG icons** (P-016) — consistent rendering
14. **Visual shard color swatches** (P-020) — immediate recognition

### Within 6 Months (MEDIUM — should plan)
15. **Floating/docking panel system** (O-003) — desktop feel
16. **Persistent Calculation Explorer** (O-008) — always-on education
17. **Build comparison workspace** (O-007) — first-class diffing
18. **Plugin/theme architecture** (O-010) — user advocacy
19. **Multi-window support** (O-018) — pro workflow

---

## 17. Conclusion

TennoDex has an exceptional engineering foundation. The calculation engine is arguably the most accurate Warframe build calculator available. The Knowledge Base, Formula Validation, and Calculation Explorer are features no competitor has.

**The gap is not engineering. The gap is UX execution.**

The application currently functions as a web app styled to look like a desktop app. To compete with Path of Building, Figma, or Blender, it needs to **behave** like a desktop app — drag-and-drop, undo/redo, floating panels, right-click everywhere, keyboard-driven workflows, visual feedback on every interaction.

The good news: the engineering foundation is solid enough to support all of these improvements. None require backend changes. All are frontend/interaction work.

**The recommendation is clear:** freeze all feature work. Spend the next development cycle solely on interaction quality. Drag-and-drop. Undo/redo. Stat feedback. Right-click menus. These three things alone would transform TennoDex from "promising" to "professional."

---

*Report generated 2 July 2026*
*End of Executive UX/UI Due Diligence Audit*
