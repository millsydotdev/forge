# TennoDex — Executive Product, Technical & Commercial Due Diligence Audit

**Date:** 2 July 2026  
**Auditor:** Independent Software Consultancy  
**Classification:** CONFIDENTIAL  
**Version:** 1.0  

---

## Table of Contents

1. Executive Summary  
2. Business Assessment  
3. Product Assessment  
4. Theorycrafting Workflow Audit  
5. User Experience Assessment  
6. Visual Design Assessment  
7. Interaction Design Assessment  
8. Frontend Assessment  
9. Backend Assessment  
10. Electron & OW-Electron Assessment  
11. Architecture Assessment  
12. Component Audit  
13. Service Audit  
14. Hook Audit  
15. Utility Audit  
16. State Management Assessment  
17. IPC Assessment  
18. Calculation Engine Assessment  
19. Simulation Engine Assessment  
20. Performance Assessment  
21. Security Assessment  
22. Accessibility Assessment  
23. Animation & Motion Assessment  
24. Design System Assessment  
25. Testing Assessment  
26. Documentation Assessment  
27. Dependency Assessment  
28. Build System Assessment  
29. Developer Experience Assessment  
30. Scalability Assessment  
31. Maintainability Assessment  
32. Technical Debt Assessment  
33. Commercial Readiness Assessment  
34. Competitive Analysis  
35. SWOT Analysis  
36. Risk Register  
37. Scoring  
38. Final Verdict  

---

## 1. Executive Summary

### Overview

TennoDex is a desktop Warframe theorycrafting application built on Electron (via Overwolf's OW-Electron) with a React 18 + TypeScript frontend and a Node.js main process. It integrates the official WFCD (Warframe Community Data) dataset to provide accurate stat calculations, build planning, enemy simulation, and shareable build codes.

### Current Product Maturity: Alpha

TennoDex is functionally complete as a build planner but exhibits characteristics typical of a pre-release application. Core features work. Polish, testing, accessibility, and production hardening are incomplete.

### Technical Maturity: Mid-Level Prototype

The calculation engine is sophisticated and Warframe-accurate. The frontend architecture is functional but inconsistent. The codebase contains areas of genuine engineering strength alongside areas that would block a production release.

### Product Maturity: Pre-Alpha

The product has a clear vision and strong feature set. The workflow, UX, and visual design need significant iteration before they feel like premium desktop software.

### Commercial Readiness: Not Ready

TennoDex is not ready for any commercial release. It lacks the UX polish, testing coverage, accessibility compliance, onboarding, and reliability expected of paid desktop software.

### Biggest Strengths

1. **Calculation Engine:** The stat-processor is genuinely impressive. The modifier/bucket/breakdown architecture supports complex Warframe mechanics (CO, Galvanized, Archon Shards, Helminth, set bonuses, enemy EHP/TTK) with accurate math and per-stat breakdowns comparable to Path of Building.
2. **Data Integration:** WFCD bindings are clean, typed, and well-separated from the calculation pipeline.
3. **Build Codec:** The `tndx1:` encoding/decoding system is compact, extensible, and forward-compatible.
4. **Stores Architecture:** Zustand usage is pragmatic — separate stores for build state, UI, library, and projects is the right split.
5. **IPC Design:** Clean typed interfaces (`IpcResult<T>`), proper error propagation, and well-defined channel boundaries.
6. **CI/CD Pipeline:** Professional-grade GitHub Actions with lint → typecheck → test → build → E2E → package pipeline.
7. **Modifier System:** The FLAT/MULTIPLIER/stackingGroup model is elegant and mathematically sound.
8. **Breakdown System:** Per-stat breakdowns (CalcBreakdown) with source attribution enable the "Why?" feature that differentiates from competitors.

### Biggest Weaknesses

1. **No Automated Tests for UI Components:** 233 unit tests exist, but they cover only the engine and utility layer. Almost zero components are tested. This is critical.
2. **TypeScript `any` Usage:** ESLint disables `@typescript-eslint/no-explicit-any`. The codebase is littered with `any` types throughout components, hooks, and IPC handlers. Type safety is largely aspirational in the renderer.
3. **Monolithic WorkspaceShell:** The main app shell (`WorkspaceShell.tsx`, 271 lines) and `useBuildPlannerStore` hook (493 lines) are doing too much. These violate Single Responsibility Principle and are untestable.
4. **Duplicate Import/Decode Logic:** The `handleImport` and `loadLoadout` functions in `useBuildPlannerStore.ts` (lines 241-415) are nearly identical — ~175 lines of duplicated async resolution logic. This is a maintenance liability.
5. **Accessibility:** Near-zero accessibility. No ARIA landmark structure, no focus management, no keyboard navigation beyond basic shortcuts, no screen reader support.
6. **Inline Styles:** The codebase mixes CSS classes with inline `style` props extensively. The CSS-in-JS approach is inconsistent — some styling lives in `workbench.css`, some in `tokens.css`, much of it inline. This creates a maintenance burden and prevents theming.
7. **Error Handling:** Inconsistent. Some areas use try/catch with toasts and logging; others silently catch and swallow errors (especially in async IPC chains).
8. **Route/Navigation:** There is no proper routing. Everything is a modal overlay or panel state. As features grow, this will become unmanageable.
9. **Game Data Duplication:** `game-data.json` appears in both `src/data/` and `src/browser/data/`. The `src/data/game-data.ts` singleton duplicates data loaded via `GameDataService` in the main process.
10. **Overwolf Lock-In:** The application is tied to `@overwolf/ow-electron` for packaging and runtime. This introduces platform dependency risks and limits distribution channels.

### Critical Blockers

1. **Zero UI Component Tests** — Cannot verify that UI behaves correctly under any scenario.
2. **Overwolf Dependency** — If OW-Electron becomes unsupported or changes licensing, the product has no fallback.
3. **TypeScript `any` Usage** — The number of unsound type assertions is a leading indicator of runtime defects.
4. **No Error Tracking** — No Sentry, no crash reporting, no telemetry. Production issues would be invisible.
5. **Accessibility Non-Compliance** — The application would fail basic WCAG 2.1 AA audits. This is a legal risk for commercial software.

### Overall Recommendation

**GO WITH CONDITIONS**

The product has strong technical foundations in its calculation engine, data layer, and build pipeline. The vision is clear, and the feature depth already exceeds the leading competitor (Overframe).

However, the product cannot ship commercially without addressing the critical blockers above and investing significantly in UX polish, testing, accessibility, and production hardening.

**Recommended investment: 6-9 months of focused engineering before a public beta. 12-18 months before commercial release.**

---

## 2. Business Assessment

### Product Positioning

TennoDex positions itself as a "professional theorycrafting tool" for Warframe — a desktop-native build planner with accurate math. This positions it above web-based alternatives (Overframe) in technical depth and below full ARPG tools (Path of Building) in market maturity.

### Market Fit

**Strong.** The Warframe community has a demonstrated need for accurate build planning. Overframe is the current leader but is web-based, slower, and has questionable math accuracy. Path of Building's success in Path of Exile proves that the theorycrafting tool market can sustain a dedicated application.

### Competitive Differentiation

| Factor | TennoDex | Overframe |
|--------|----------|-----------|
| Math Accuracy | High (WFCD) | Low-Medium |
| Desktop Native | Yes (Electron) | No (Web) |
| Offline Support | Partial | No |
| Riven Support | Good | Basic |
| Enemy Lab | Yes | No |
| Build Codec | tndx1: | URL-based |
| Community Features | None | Strong |
| Polish | Low | Medium |

### Value Proposition

"Accurate Warframe math, desktop speed, and professional-grade theorycrafting — in one application."

### Scalability

The architecture scales horizontally for game updates (new warframes, weapons, mods are data-driven). It does NOT scale well for feature additions without significant refactoring of the UI layer.

### Commercial Potential

Limited but real. Possible monetization paths:
- Premium features (advanced comparison, cloud sync, team builds)
- Supporter model (Path of Building's approach)
- No direct monetization, used as portfolio/signature product

The Warframe audience is large but not high-spending. A $3-5/month subscription for cloud features would need 10,000+ users to be viable.

### Risks

- Warframe's own official tools could render third-party planners obsolete
- Overwolf platform changes could break distribution
- Community fragmentation if another tool achieves network effects
- No sustainable monetization model identified

### Future Opportunities

- Cloud build syncing
- Community build sharing hub
- Build performance history/tracking
- Out-of-game inventory management
- Integration with Warframe's official API (if released)
- Mobile companion app

---

## 3. Product Assessment

### Product Identity

TennoDex has a clear identity: "Premium desktop theorycrafting for Warframe." The Void Synthetic design language, "Orokin terminal" aesthetic, and focus on mathematical accuracy consistently reinforce this identity.

### Product Philosophy

The product philosophy is evident: accuracy first, depth second, polish third. The engineering team prioritized getting the math right and supporting all Warframe mechanics before refining the user experience.

### Core Purpose

Enable Warframe players to plan, calculate, compare, and share optimized builds with mathematically accurate results.

### Feature Cohesion

**Strong.** Features are well-integrated:
- Building a warframe → automatically affects ability stats
- Adding a primer slot → auto-calculates Condition Overload multipliers
- Equipping a set mod → auto-detects set bonuses
- Enabling Enemy Lab → shows live TTK

However, some features feel bolted on:
- Operator/Focus school panel is disconnected from main workflow
- ZAW/Kitgun/AMP calculators are panel-registered but not well-integrated
- Project system (projectStore) is defined but barely used

### Scope

The scope is ambitious and largely delivered. Notable omissions:
- Archwing/Necramech/Railjack builds are planned but have empty panels
- No parazon mod support
- No forma/potato cost tracking
- No build comparison export (screenshots, reports)

### Product Consistency

Consistent in depth (everything is calculated), inconsistent in presentation (some panels full-featured, some are stubs).

### Vision

The vision is clear and compelling. The product roadmap (docs/roadmap.md) demonstrates thoughtful planning. The "DESIGN.md" document shows high ambition for visual quality.

---

## 4. Theorycrafting Workflow Audit

### Current Workflow (from a player's perspective)

```
Launch → Loading screen (skeleton) → 
  WorkspaceShell appears →
    [Top Bar: Build name, MR, Save, Load, Share, Menu]
    [Left: Stats sidebar (collapsible)]
    [Center: Mod grid for active slot]
    [Right: Inspector (collapsible)]
    [Bottom: Library drawer (collapsible)]
    
1. Select Warframe from bottom drawer (Frames tab)
   → Click a frame → workspace updates
   
2. Equip mods: Switch to Mods tab in drawer
   → Filter/search mods → click to equip
   → Mod appears in center grid
   
3. Adjust stats: Right panel shows stats
   → Click a stat for breakdown ("Why?")
   
4. Equip weapon: Click Primary/Secondary/Melee tab at bottom
   → Select weapon from dropdown
   → Equip mods
   
5. Test vs enemies: Switch to Enemies tab
   → Toggle Enemy Lab
   → Adjust level, armor strip, etc.
   
6. Save: Name build → Save button
   
7. Share: Share dropdown → Export Code → paste tndx1:
```

### Pain Points & Improvements

**PAIN POINT 1: Slot switching requires too many clicks**

Current: Click slot button at bottom → Library still shows mods for previous slot

The center workspace and bottom drawer should react instantly when switching slots. Currently they show stale data until the user manually changes the library tab.

**PAIN POINT 2: No drag-and-drop for mods**

Users must click a mod in the library, then it auto-places in the first available slot. There is no drag-to-slot, no drag-to-reorder within the grid, no drag-to-remove.

**PAIN POINT 3: Search is duplicated across too many places**

There's a GlobalSearch (Ctrl+K), a per-tab search in the mod library, a stat search in the inspector, and weapon/frame/arcane searches in each tab. The user must know which search to use. Consolidation is needed.

**PAIN POINT 4: Empty states provide no guidance**

When the user first opens the app, the center workspace says "Select a Warframe to begin" but doesn't tell them HOW. The onboarding overlay helps but can be dismissed and never seen again.

**PAIN POINT 5: No undo/redo**

Equipping the wrong mod means manually finding it and removing it. There is no undo, no history of mod changes, no way to revert to a previous state.

**PAIN POINT 6: No hover state preview**

Hovering over a mod in the library should show a preview of what stats would change. Currently, the user must equip it first.

**PAIN POINT 7: Build comparison is hidden**

"Compare Builds" is buried in the menu dropdown. This should be a first-class feature, possibly with a split-view toggle.

**PAIN POINT 8: No right-click context menus**

Desktop applications benefit from right-click: remove mod, copy build code, open mod details, etc. TennoDex has a `useContextMenu` hook (`src/hooks/useContextMenu.ts`) but it's not wired to most components.

**PAIN POINT 9: Mod library filters reset**

Switching between slots resets the mod library filters. The user must re-apply polarity/category/owned filters every time.

**PAIN POINT 10: Enemy Lab is buried**

The Enemy Lab is in the bottom drawer under the "Enemies" tab. This is one of the most powerful features (TTK simulation) but is not prominently surfaced.

**PAIN POINT 11: No keyboard shortcuts cheat sheet**

The ShortcutProvider defines keyboard shortcuts (Ctrl+S, Ctrl+B, 1-9 for slots, W for stats, E for enemies) but there's no way for the user to discover these.

**PAIN POINT 12: Build saving is confusing**

"Save" saves to localStorage. "Export Code" generates a tndx1: string. "History" shows past saves. The relationship between these is unclear to new users.

### Recommended Workflow Improvements

1. **Drag-and-drop mod equipping** — Drag from library to specific slot in grid
2. **Slot-synced library** — Selecting a slot auto-filters the library to compatible mods
3. **Hover preview** — Show stat delta on hover in library
4. **Undo/redo history** — Track all mod changes
5. **Right-click everywhere** — Context menus for mods, weapons, stats
6. **Keyboard shortcuts overlay** — Press `?` to show all shortcuts
7. **Quick- compare** — A/B toggle to compare current build with previous state
8. **Smart defaults** — Auto-select last-used frame on launch
9. **Persistent search** — Remember search/filter state across slot switches
10. **Prominent Enemy Lab** — Surface TTK in the stat sidebar or a floating widget

---

## 5. User Experience Assessment

### Navigation

**Score: 4/10**

The three-panel layout (sidebar, center, inspector) plus bottom drawer creates four zones of interaction. The user must manage these zones manually via collapse toggles and drag handles. This is appropriate for a complex desktop tool but the implementation lacks refinement.

Key issues:
- Bottom drawer tabs reset when collapsed/expanded
- No breadcrumb or back navigation for deeply nested interactions
- The "back to stats" button in the inspector is small and easy to miss
- Modal dialogs (import, history, compare) appear without clear relationships to the main workspace

### Discoverability

**Score: 3/10**

Features are discoverable mainly through trial and error. The onboarding covers 5 basic steps but doesn't explain:
- How to change slot polarities
- How to use the enemy lab for real TTK
- How set bonuses work
- How the primer system works
- What the "Why?" feature does
- Keyboard shortcuts

### Learnability

**Score: 5/10**

For Warframe players familiar with Overframe, the learning curve is moderate. The mod grid will feel familiar. The additional features (enemy lab, breakdowns, conditionals) require exploration.

### Information Hierarchy

**Score: 5/10**

The left sidebar → stats, center → mods, right → inspector, bottom → library is logical. However, within the inspector, the information density is overwhelming. The "IdleInspector" component shows all stats for the active slot with collapsible sections for secondary stats. The sheer number of stats (20+ for warframes, 15+ for weapons) creates cognitive overload.

### Progressive Disclosure

**Score: 3/10**

Advanced features (conditionals, primer, set bonuses, operator stats) are hidden behind Collapsible panels in the inspector, which is good. However, there's no tiered introduction to these features. A new user sees everything — including empty collapsible sections — from the start.

### Desktop UX

**Score: 4/10**

The application behaves like a web app in a desktop frame. It lacks desktop conventions:
- No window state persistence (position, size, maximized)
- No system tray integration
- No global shortcuts outside the app window
- No native file dialogs for import/export
- No drag-and-drop from the OS (e.g., drag a build code file onto the window)
- No spell-check in text areas
- No native notifications

### Keyboard Navigation

**Score: 3/10**

ShortcutProvider defines useful shortcuts but:
- No visual indication of available shortcuts
- No Tab-traversal within mod grids
- No Escape handling for all modals
- Slots are navigable via number keys (1-9) but this is undiscoverable

### Drag & Drop

**Score: 1/10**

DNE (Does Not Exist). The most natural interaction for a build planner — dragging mods onto equipment — is entirely click-based.

### Context Menus

**Score: 1/10**

The `useContextMenu` hook exists but is barely used. Right-click should be a primary interaction for removing mods, copying stats, opening mod details.

### Command Palette

**Score: 5/10**

The GlobalSearch (Ctrl+K) acts as a command palette for items. It supports `@mod`, `@frame`, `@weapon`, `@arcane` scope filters. This is good. It should also support actions: "new build", "save", "export code", "toggle sidebar", etc.

### Onboarding

**Score: 4/10**

5-step onboarding overlay provides basic orientation. It's dismissible and won't show again. No progressive onboarding, no tooltips, no contextual help.

### Empty States

**Score: 3/10**

Empty states exist ("Select a Warframe to begin", "No mods available") but they are text-only and provide no actionable guidance.

### Loading States

**Score: 5/10**

Skeleton loading screen during data initialization is acceptable. The shimmer animation during calculation is a nice touch. However, individual panels don't show loading states when switching slots.

### Error Handling

**Score: 3/10**

Errors are handled at the IPC boundary (`ipcErr`). Errors in the UI are inconsistently handled:
- `window.tennoDex.getItemDetail()` failures are silently caught in many places
- `localStorage` read/write failures are caught with `console.warn` fallbacks
- Failed calculations show a toast but no recovery suggestion
- There's no global error boundary fallback UI in the production build

---

## 6. Visual Design Assessment

### Layout

**Score: 6/10**

The three-column + bottom drawer layout is appropriate for a complex desktop tool. The CSS grid implementation in `workbench.css` is clean and responsive. Drag handles for resizing panels are a professional touch.

Issues:
- The bottom drawer is too tall by default (160px) relative to content
- Left and right panels have no minimum width enforcement after resize
- No responsive breakpoints for smaller screens

### Balance

**Score: 5/10**

The layout is left-heavy (stats sidebar) and right-light (inspector). The center workspace feels compressed between the two. The mod grid in the center is the primary interaction zone but visually dominated by the side panels.

### White Space

**Score: 4/10**

Insufficient breathing room around elements. Padding variables (`--pad: 6px`, `--gap: 12px`) are very tight. Text often feels cramped inside stat boxes and mod cards. The Warframe aesthetic is dense by nature, but the application could benefit from more generous spacing.

### Typography

**Score: 7/10**

The three-font system (Archivo Narrow for headers, Inter for body, JetBrains Mono for data) is well-chosen and executed consistently. Letter-spacing for headers creates the desired "Orokin terminal" feel.

Issues:
- Font sizes are very small throughout (11px labels, 12-13px body)
- No font size scaling for readability
- Some text elements use uppercase + letter-spacing where it hurts readability

### Colour Usage

**Score: 7/10**

The "Void Synthetic" palette is distinctive and thematically appropriate. Neon teal, Orokin gold, and status purple create clear visual hierarchies. The dark theme is well-executed.

Issues:
- Colour contrast ratios are insufficient in places (muted text on dark surfaces)
- Excessive use of low-opacity colors creates visual fatigue
- Some status indicators use color alone (no icons/text) which fails accessibility

### Contrast

**Score: 5/10`

`--wf-text-muted: #849495` on `--wf-bg: #060608` does not meet WCAG AA for normal text (contrast ratio ~5.2:1, needs 4.5:1 — this passes for large text but fails for the small body text used throughout). Many UI elements use even lower contrast combinations.

### Visual Hierarchy

**Score: 6/10**

Hierarchy is primarily established through color and typography weight, not through size and spacing. Mod cards, stat rows, and action buttons all compete for attention.

### Component Consistency

**Score: 5/10**

The UI component library (`src/components/ui/`) provides basic building blocks (Button, Input, Modal, Toast, etc.) but many components in the features layer use custom inline styles instead of these primitives. This creates visual inconsistency.

### Iconography

**Score: 6/10**

Good use of Unicode symbols and emoji for stat indicators. The polarity symbols are faithfully recreated. However, there are no SVG icons, no consistent icon set, and no icon component.

### Branding

**Score: 5/10`

The "TennoDex" brand is present in the top bar (⬡ TennoDex) and loading screen. The brand identity is otherwise weak — no logo, no consistent color application beyond the design tokens, no brand voice in empty states or error messages.

### Professional Appearance

**Score: 5/10**

It looks like a capable but unfinished desktop tool. Some areas (stat display, mod grid) look professional. Others (inline-styled buttons, mixed font usage, varying border radii) look inconsistent.

---

## 7. Interaction Design Assessment

### Panel Behaviour

**Score: 6/10**

Resizable panels via drag handles work well. Collapse/expand toggles for sidebar, inspector, and drawer are functional. The localStorage persistence for panel sizes is a nice touch.

### Workspace Flow

**Score: 4/10**

The workspace switches between slot surfaces (warframe, weapon, companion) but the transition is jarring — no animation, no context preservation. Switching from a weapon back to warframe and then to another weapon should remember the previous context.

### Build Workflow

**Score: 5/10**

The basic loop (select item → equip mods → inspect stats) works. The calculation is near-instant after mod changes, which is excellent. The lack of drag-and-drop and undo are the biggest workflow gaps.

### Mod Workflow

**Score: 5/10**

Mod equipping is click-to-add. Mod removal requires clicking the mod card's remove action (a small X or button). There's no mod comparison, no "replace mod" workflow, no mod set management.

### Search Workflow

**Score: 6/10**

Search is responsive and supports filtering by polarity, category, and owned status. The global search with scope prefixes (`@mod`, `@frame`) is powerful. However, search state is not preserved across interactions.

### Comparison Workflow

**Score: 3/10**

The Compare Builds feature exists but is minimal. It shows a side-by-side comparison but doesn't highlight differences, doesn't allow selective stat comparison, and doesn't export comparison results.

### Simulation Workflow

**Score: 6/10**

The Enemy Lab is one of the best features. Sliders for level, armor strip, corrosive stacks, and heat proc with live EHP/TTK updates is excellent. The feature is buried in a tab in the bottom drawer, but the implementation is strong.

### Animation Opportunities

**Score: 3/10**

Animations are minimal and inconsistent. The CSS defines several keyframe animations (`wb-fade-in`, `wb-slide-up`, `wb-toast-in`) but they're applied sparingly. Stat changes should animate. Panel transitions should animate. Mod card additions/removals should animate.

### Interaction Friction

**Score: 4/10**

Friction points:
- Slot switching requires 2-3 clicks
- Mod library requires manual filter re-application
- No hover preview for mod effects
- No right-click for common actions
- Inspector navigation feels heavy (click stat → see breakdown → click "Back to Stats")

### Cognitive Load

**Score: 4/10**

High. The application presents a massive amount of information simultaneously. The user must process:
- Stats sidebar (10-25 stats)
- Center workspace (mod grid with 8-10 slots)
- Inspector (stats, conditionals, arcanes, shards, helminth, abilities, buffs, primer, set bonuses, operator, notes)
- Bottom drawer (library with filters)
- Plus modals (history, compare, riven editor, import)

This density is appropriate for the target audience (experienced Warframe theorycrafters) but creates a steep learning curve.

---

## 8. Frontend Assessment

### React Architecture

**Score: 5/10**

The architecture is straightforward React 18 with functional components and hooks. There is no routing library (everything is conditional rendering). Key architectural concerns:

1. **App.tsx → WorkspaceShell.tsx** — The entire application is essentially one screen. All navigation is state-driven within WorkspaceShell.

2. **useBuildPlannerStore** — This hook (493 lines) is the central nervous system. It combines data from all three Zustand stores, calculates derived state, defines complex actions, and returns a monolithic object. This is the single most problematic piece of code in the application.

3. **Props Drilling** — BuildPlannerState (a 60+ field object) is passed through the entire component tree as a single `state` prop. Components access what they need via property access on this object.

4. **Suspense Boundaries** — Used for lazy-loaded components (RivenEditor, CompareBuilds, HistoryPanel, Onboarding) but with `fallback={null}`, meaning no loading indicator for dynamically loaded components.

### Components

Total: ~80 component files (48 in features/build-planner/components/, 18 in components/ui/, 11 in panels/, plus layout, app, and shared components).

Key observations:
- Many components mix presentation logic with data fetching
- The `CenterSurface` component is the largest at 372 lines with 7 sub-components defined within the same file
- `RightInspector` is 450 lines with `IdleInspector` (153 lines) and `ConditionalsPanel` (32 lines) defined in the same file
- `StatsHUD` is 219 lines
- `BottomDrawer` is 360 lines

### Hooks

Custom hooks:
- `useBuildPlannerStore` (493 lines) — Anti-pattern. See above.
- `useContextMenu` — Good abstraction, underutilized
- `useGameData` — Defined but not used in production
- `useLibraryData` — Loads data from IPC, populates libraryStore
- `useLibrarySearch` — Encapsulates search/filter logic
- `useAssetUrl` — Thin wrapper for asset URL resolution
- `useBuildSubmit` — Manages IPC submission for calculations
- `useOverwolf` — Overwolf integration hook

### State Ownership

Zustand stores have clear ownership:
- `buildStore` — Build state only
- `libraryStore` — Catalog data
- `uiStore` — UI state
- `projectStore` — Project/variant system

This is appropriate. The problem is that `useBuildPlannerStore` tightly couples all three stores.

### Composition

**Score: 4/10**

Components are not composed effectively. The pattern is "large component that receives the entire state object." Better composition would split state into smaller, focused slices passed to child components.

### Reusability

**Score: 5/10**

UI primitives (Button, Input, Modal, etc.) are reusable. Feature components are tightly coupled to their data and not reusable across contexts.

### Complexity

**Score: 4/10**

The mental model for understanding the application requires tracing through: component → `useBuildPlannerStore` → individual Zustand stores → IPC → main process services → WFCD resolver → stat processor. This complexity is inherent to the Electron architecture but is not well-documented.

### Rendering

**Score: 5/10**

React 18 concurrent features are not used. No `useTransition`, no `useDeferredValue`, no `startTransition`. The only memoization is `React.memo` on `StatBreakdown` and some `useMemo`/`useCallback` usage. Given that the component tree is relatively small, this is acceptable but will not scale.

### Performance

See Section 20 (Performance Assessment).

### Accessibility

See Section 22 (Accessibility Assessment).

### Styling

**Score: 4/10**

The styling approach is inconsistent:
- CSS classes with BEM-like naming (`wb-topbar`, `wb-topbar__btn`)
- CSS custom properties (`--wf-teal`, `--wf-bg`)
- Extensive inline styles
- A `<style>` tag injected into a React component (Button.tsx line 47)

This mix makes styling hard to maintain, hard to theme, and hard to debug.

### Technical Debt

See Section 32 (Technical Debt Assessment).

---

## 9. Backend Assessment

### Business Logic

The business logic lives in the main process and the calculation engine. The separation between data (WFCD), mapping (build-core-mapper), and calculation (stat-processor) is clean.

### Services

Three services in the main process:

1. **WfcdDataService** — Loads and indexes WFCD data. Returns typed `ItemInfo` objects. Well-structured.

2. **WfcdAssetService** — Resolves asset URLs for mod/weapon images. Thin wrapper. Functionally complete.

3. **GameDataService** — Manages game data (enemies, exalted weapons, incarnon, helminth, focus schools, squad buffs, shard defs). Separated from WFCD data for historical reasons.

### Calculation Engine

See Section 18 (Calculation Engine Assessment).

### Simulation Engine

See Section 19 (Simulation Engine Assessment).

### Import/Export

The build codec (`tndx1:`) is well-designed: versioned, compact, and extensible. The Overframe importer attempts to parse Overframe's various page formats (Next.js, Redux, Redux state). This is fragile and will break when Overframe updates.

### Data Processing

The data pipeline: raw WFCD JSON → resolver (WfcdResolver) → modifiers → bucketify → resolveFlat/resolveMultiplied → CalculatedStats. This is well-architected.

### Persistence

- Build state: localStorage via Zustand `persist` middleware
- Loadouts: localStorage (`tennoDexLoadouts`)
- Projects: localStorage (`tennodex_projects`)
- Owned items: Dexie/IndexedDB

This fragmentation is a problem. Build state, loadouts, projects, and owned items all use different persistence mechanisms with different consistency guarantees. The Dexie database (db.ts) is defined but barely used — only `items` and `builds` tables exist, and the items table is populated but not consumed.

### Error Handling

Inconsistent. The `registerIpcHandlers.ts` wraps all handlers in try/catch with `ipcErr`. The renderer unwraps `IpcResult<T>` and throws on errors. However, many call sites in the UI catch these errors silently or with console.warn only.

### Logging

The `logger.ts` utility provides leveled logging with a `[TennoDex]` prefix. It's used in main process code but inconsistently in the renderer. There's no log aggregation, no log level configuration for production, and no write-to-file capability.

### Performance

See Section 20.

### Scalability

The main process handles all calculations synchronously on the IPC thread. For complex builds with many mods, weapons, and enemy simulation, this could block the IPC channel. There's no worker thread pool, no request queuing, no cancellation of in-flight calculations.

---

## 10. Electron & OW-Electron Assessment

### Main Process

**Score: 6/10**

The main process (`src/browser/index.ts` and `application.ts`) is well-structured. It:
- Sets up runtime directories from environment variables
- Disables GPU acceleration (intentional for stability)
- Initializes services in order
- Registers IPC handlers
- Creates the main window

Concerns:
- GPU is fully disabled (`disable-gpu`, `disable-gpu-compositing`, etc.). This means no hardware acceleration for the entire renderer. The application will feel sluggish on modern displays.
- No window state persistence (position, size, maximized)
- No single-instance lock (`app.requestSingleInstanceLock()`)
- No crash reporting
- No update mechanism

### Renderer

Standard Electron renderer with React 18. No security hardening beyond what Electron provides by default (contextIsolation is enabled if the preload script uses contextBridge, which it does).

### Preload

**Score: 7/10**

The preload script (`src/preload/preload.ts`) properly uses `contextBridge.exposeInMainWorld` to expose a typed API surface. This is the correct approach for Electron security.

The API surface exposes methods for:
- Item queries
- Asset URLs
- Build calculation
- Data health status
- Overframe page fetching
- Mod card generation
- Game data queries

This is well-organized. Each method properly wraps IPC calls with error handling.

### IPC

See Section 17.

### Context Isolation

**Partially.** The preload script uses contextBridge, meaning the renderer cannot access Node.js APIs directly. However, the webpack renderer config targets `electron-renderer`, which may grant access to Node.js builtins during bundling.

### Security

See Section 21.

### Process Boundaries

The core architecture issue: **calculations run in the main process.** `calculateBuild` is an IPC handler that runs synchronously. This means:
- Long calculations block the main process
- The main process cannot use Node.js worker threads
- If the calculation engine crashes, it takes down the entire application

The calculation engine should ideally run in a separate worker process or at least a Node.js Worker thread.

### Performance

GPU disabled means the renderer relies entirely on software rendering. This is acceptable for a data-heavy application but will cause performance issues with animations, transitions, and high-DPI displays.

### Packaging

**Score: 5/10`

The OW-Electron builder creates Windows NSIS installers. The CI pipeline produces artifacts for distribution. However:
- Only Windows is supported
- There's no code signing configured
- No auto-update mechanism
- No macOS or Linux support
- The installer is untested on clean machines

### Integration Quality

**Score: 5/10**

OW-Electron provides the Overwolf integration (GEP, overlay packages) but these features are not actually used by the application. The application packages them (`"packages": ["gep", "overlay"]`) but has no overlay functionality. This adds unnecessary dependency weight.

---

## 11. Architecture Assessment

### Folder Structure

**Score: 6/10**

```
src/
  app/              — App shell, layout
  browser/          — Main process (Electron)
  components/       — Shared UI components
  data/             — Data resolvers, WFCD integration
  engine/           — Calculation engine
  features/         — Feature modules (build-planner, feature-flags)
  hooks/            — Custom hooks
  preload/          — Electron preload script
  renderer/         — Renderer entry point
  shared/           — Shared types and utilities
  store/            — Zustand stores
  styles/           — CSS
  types/            — Global type declarations
  utils/            — Utilities
  __tests__/        — Tests
```

This is a good structure with clear separation between main process, renderer, and shared code. However:

- `src/data/` appears to be renderer-side data handling while `src/browser/data/` is main-process data. This duplication is confusing.
- `src/features/build-planner/` contains everything (components, services, hooks, calculators, panels, data, types, utils). It's become a monolith.
- `src/components/ui/` and `src/app/layout/` should be in `src/features/build-planner/` if they're only used there, or the other way around.

### Module Boundaries

**Score: 5/10**

Module boundaries are blurred. The `useBuildPlannerStore` hook in `src/hooks/` imports from `src/features/build-planner/` and `src/store/`, creating a dependency from the generic hooks layer to the specific features layer.

### Layering

The intended layering is:
```
app → features → components → store → engine/data → shared
```

The actual dependency graph is:
```
app → features ↔ hooks ↔ store → engine/data → shared
```

The bidirectional dependency between features and hooks is a problem. `useBuildPlannerStore` depends on features, and features depend on the types and actions it returns.

### Separation of Concerns

**Score: 5/10`

- Store layer (Zustand) is clean
- Engine layer is clean
- UI layer is messy (components mixed with business logic)
- IPC layer is clean

### SOLID

- **Single Responsibility:** Violated. `WorkspaceShell`, `useBuildPlannerStore`, `RightInspector`, and `CenterSurface` all do too much.
- **Open/Closed:** Reasonably followed. The modifier system allows new stats without modifying existing code.
- **Liskov Substitution:** No inheritance to evaluate.
- **Interface Segregation:** Violated. Components receive the entire `BuildPlannerState` object when they need only a few fields.
- **Dependency Inversion:** Partially followed. The `ItemResolver` interface in the stat processor is a good example of DI.

### DRY (Don't Repeat Yourself)

**Score: 4/10**

The most egregious violation: `handleImport` (lines 241-323) and `loadLoadout` (lines 344-415) in `useBuildPlannerStore.ts` share ~80% of their code. This is ~175 lines of duplicated async resolution logic for weapon data, mod data, arcanes, shards, and polarities.

### KISS (Keep It Simple, Stupid)

**Score: 5/10**

The calculation engine is complex by necessity (Warframe is complex). The frontend is more complex than necessary. The `useBuildPlannerStore` hook is a god-object that could be split into smaller, focused hooks.

### YAGNI (You Ain't Gonna Need It)

**Score: 6/10**

The projectStore (CRUD shell for projects) is defined but barely used. The panel system (panel-registry) for AMP, Railjack, K-Drive, etc. exists but most panels are empty. The Dexie database is defined but its usage is minimal.

### Coupling

**Score: 4/10**

High coupling between:
- `useBuildPlannerStore` and all three Zustand stores
- `WorkspaceShell` and everything below it
- `CenterSurface` and the 20+ props it receives
- Main process IPC handlers and the data services

### Cohesion

**Score: 6/10**

Most modules have high internal cohesion (engine modules, store modules, UI primitives). The exception is `useBuildPlannerStore` which mixes data loading, derived state, complex actions, and return value assembly.

### Scalability

See Section 30 (Scalability Assessment).

### Maintainability

See Section 31 (Maintainability Assessment).

---

## 12. Component Audit

### WorkspaceShell (src/app/WorkspaceShell.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Main application shell |
| Lines | 271 |
| Responsibilities | Data health check, onboarding state, riven editor management, mod selection, import/export, helminth/shard changes, save/load, keyboard shortcuts, all modals |
| Dependencies | All layout components, RivenEditor, CompareBuilds, HistoryPanel, Onboarding, all stores |
| **Verdict** | **SPLIT** — Move modal state and actions to separate hooks. Extract riven logic. Extract import/export. |

### useBuildPlannerStore (src/hooks/useBuildPlannerStore.ts)

| Aspect | Assessment |
|--------|------------|
| Purpose | Central orchestrator hook |
| Lines | 493 |
| Responsibilities | Library data loading, Overwolf sync, frame detail fetching, build submission IPC, operator stats, primer auto-update, derived capacity values, all complex actions (enrichAndPlace, enrichAndPlaceAt, placeModAtSlot, buildExportCode, handleImport, saveLoadout, loadLoadout, deleteLoadout) |
| **Verdict** | **SPLIT** — Extract: 1) useBuildActions (import/loadout/export), 2) useBuildDerived (capacity calculations), 3) useBuildSync (Overwolf, auto-updates) |

### RightInspector (src/app/layout/RightInspector.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Right panel for stats, mod details, and configuration |
| Lines | 450 (includes IdleInspector: 153, ConditionalsPanel: 32, StatBreakdown: 53) |
| Responsibilities | Displaying stats, handling stat search, managing inspector modes (stat/mod/weapon/tool), rendering all configuration panels (arcanes, shards, helminth, abilities, buffs, primer, set bonuses, operator, notes) |
| **Verdict** | **SPLIT** — Extract IdleInspector to its own file. Extract ConditionalsPanel. Consider extracting the collapsible sections into separate components. |

### CenterSurface (src/features/build-planner/components/center-surface.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Center workspace router and surface implementations |
| Lines | 372 |
| Responsibilities | Selecting and rendering the correct surface (warframe, weapon, companion, exalted, panel), and implementing each surface |
| **Verdict** | **SPLIT** — Each surface should be its own file. The routing logic should be separate. |

### CenterSurface sub-surfaces

| Surface | Lines | Verdict |
|---------|-------|---------|
| FrameSurface | 29 | Keep, extract FrameMods inline helper |
| FrameMods | 19 | Keep |
| WeaponSurface | 72 | Split into own file |
| ExaltedSurface | 45 | Split into own file |
| CompanionSurface | 87 | Split into own file |
| CompanionMods | 10 | Keep inline or split |
| PanelSurface | 30 | Keep |

### BottomDrawer (src/app/layout/BottomDrawer.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Bottom panel with library tabs |
| Lines | 360 |
| Responsibilities | Tab management, mod library display, arcanes/weapons/frames/enemies tabs, handle select callbacks |
| **Verdict** | **SPLIT** — Each tab (ArcanesTab, WeaponsTab, FramesTab, EnemiesTab) should be in its own file |

### StatsHUD (src/features/build-planner/components/stats-hud.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Left sidebar stat display |
| Lines | 219 |
| Responsibilities | Displaying warframe stats, companion stats, set bonuses, abilities, helminth, primer info, weapon stats |
| **Verdict** | **SPLIT** — Extract weapon stats section, companion section, primer section |

### ModLibrary (src/features/build-planner/components/mod-library.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Mod browsing and selection |
| Lines | 192 |
| Responsibilities | Search, polarity filter, category filter, owned/missing filter, sorting, tooltip rendering |
| **Verdict** | **RESTRUCTURE** — The filter logic should be extracted. The component is well-structured but benefits from smaller pieces. |

### ModGrid (src/features/build-planner/components/mod-grid.tsx)

| Aspect | Assessment |
|--------|------------|
| Purpose | Grid of equipped mod cards with empty slots |
| Lines | 44 |
| Responsibilities | Rendering mod cards and empty slot placeholders |
| **Verdict** | **KEEP** — Well-scoped and focused. |

### UI Components (src/components/ui/)

| Component | Lines | Verdict |
|-----------|-------|---------|
| Button.tsx | 101 | KEEP — But could be simplified (use CSS classes instead of inline styles) |
| Input.tsx | - | KEEP |
| Modal.tsx | - | KEEP |
| Toast.tsx | - | KEEP |
| Collapsible.tsx | - | KEEP |
| Dropdown.tsx | - | KEEP |
| ContextMenu.tsx | - | KEEP — Underutilized |
| AssetImage.tsx | - | KEEP |
| Badge.tsx | - | KEEP |
| Icon.tsx | - | KEEP |
| Panel.tsx | - | KEEP |
| ScrollArea.tsx | - | KEEP |
| Separator.tsx | - | KEEP |
| Skeleton.tsx | - | KEEP |
| StatRow.tsx | - | KEEP |
| TextArea.tsx | - | KEEP |
| Tooltip.tsx | - | KEEP |

---

## 13. Service Audit

### WfcdDataService (main process)

| Aspect | Assessment |
|--------|------------|
| Responsibility | Load, index, and query WFCD game data |
| Consumers | IPC handlers, WfcdResolver |
| Dependencies | @wfcd/items |
| Complexity | Medium |
| Maintainability | High |
| Risks | WFCD data format changes could break parsing |
| Future Scalability | Good — data-driven by design |

### WfcdAssetService (main process)

| Aspect | Assessment |
|--------|------------|
| Responsibility | Resolve image URLs for game assets |
| Consumers | IPC handlers |
| Dependencies | Local file system, CDN URLs |
| Complexity | Low |
| Maintainability | High |
| Risks | Asset CDN changes could break image loading |
| Future Scalability | Good |

### GameDataService (main process)

| Aspect | Assessment |
|--------|------------|
| Responsibility | Load and serve game data (enemies, exalted, incarnon, helminth, focus, buffs, shards) |
| Consumers | IPC handlers, engine/enemy-simulator |
| Dependencies | game-data.json |
| Complexity | Low |
| Maintainability | Medium — manual data file maintenance |
| Risks | Game data file can become out of sync with Warframe patches |
| Future Scalability | Good — data-driven |

### Build Codec (build-codec.ts)

| Aspect | Assessment |
|--------|------------|
| Responsibility | Encode/decode build state to/from tndx1: format |
| Consumers | useBuildPlannerStore (export, import), decodeToBuildCore for engine |
| Dependencies | None |
| Complexity | Medium |
| Maintainability | High — versioned format |
| Risks | Version migration could become complex over time |
| Future Scalability | Excellent — designed for extension |

### Build Core Mapper (build-core-mapper.ts)

| Aspect | Assessment |
|--------|------------|
| Responsibility | Map UI state (WarframeState, WeaponState, etc.) to engine BuildCore |
| Consumers | useBuildSubmit hook |
| Dependencies | model types, riven-store |
| Complexity | Medium |
| Maintainability | High |
| Risks | If model and engine types diverge, mapping becomes fragile |
| Future Scalability | Good |

### Overframe Importer (overframe-importer.ts)

| Aspect | Assessment |
|--------|------------|
| Responsibility | Parse Overframe build URLs |
| Consumers | IPC (fetchBuildPage), import modal |
| Dependencies | https (Node.js) |
| Complexity | High (multiple regex parsers for different page formats) |
| Maintainability | Low — fragile regex-based HTML parsing |
| Risks | Overframe format changes will break this entirely |
| Future Scalability | Low — tightly coupled to another platform's internals |

### Riven Store (riven-store.ts)

| Aspect | Assessment |
|--------|------------|
| Responsibility | In-memory storage for user-created rivens |
| Consumers | build-core-mapper, riven-editor |
| Dependencies | None |
| Complexity | Low |
| Maintainability | High |
| Risks | Not persisted — rivens are lost on app restart |
| Future Scalability | Low — in-memory singleton |

---

## 14. Hook Audit

### useBuildPlannerStore

Already covered extensively. This is the most problematic hook.

### useLibraryData

| Aspect | Assessment |
|--------|------------|
| Purpose | Load catalog data from IPC on mount |
| Scope | One-time initialization |
| Complexity | Low |
| Reusability | Low (app-specific) |
| Problems | No retry on failure |
| Improvements | Add retry logic, loading timeout |

### useBuildSubmit

| Aspect | Assessment |
|--------|------------|
| Purpose | Submit build state to main process for calculation |
| Scope | Every build state change |
| Complexity | Medium |
| Reusability | Low |
| Problems | No debouncing — sends IPC on every state change, may cause calculation storms |
| Improvements | Add debounce, add request cancellation |

### useOverwolf

| Aspect | Assessment |
|--------|------------|
| Purpose | Sync owned items from Overwolf API |
| Scope | Application lifetime |
| Complexity | Medium |
| Reusability | Zero (Overwolf-specific) |
| Problems | Tightly coupled to Overwolf platform |
| Improvements | Abstract behind an interface, allow alternative sync sources |

### useContextMenu

| Aspect | Assessment |
|--------|------------|
| Purpose | Show native/HTML context menus |
| Scope | Any component |
| Complexity | Low |
| Reusability | High |
| Problems | Barely used in the application |
| Improvements | Wire into mod cards, stats, weapons |

### useGameData

| Aspect | Assessment |
|--------|------------|
| Purpose | Load game data from IPC |
| Scope | Application lifetime |
| Complexity | Low |
| Reusability | Low |
| Problems | Exists but may be unused in production rendering |
| Improvements | Verify production usage, remove if dead |

### useLibrarySearch

| Aspect | Assessment |
|--------|------------|
| Purpose | Debounced search with results |
| Complexity | Low |
| Reusability | High |
| Problems | Not used everywhere — some components have their own search |
| Improvements | Use consistently across all library tabs |

### useAssetUrl

| Aspect | Assessment |
|--------|------------|
| Purpose | Resolve asset URL from image name |
| Complexity | Low |
| Reusability | Medium |
| Problems | Could be a utility function, not a hook |
| Improvements | Convert to utility, remove hook overhead |

---

## 15. Utility Audit

### Logger (`utils/logger.ts`)

Production-ready. Leveled logging with clean API.

Issues:
- No log file output
- No log level configuration via environment
- No structured logging (JSON format for machine parsing)

### Assets (`utils/assets.ts`)

Thin wrapper for asset URL resolution.

Would benefit from integration with the main process asset service rather than duplicating path logic.

### Feature Flags (`features/feature-flags/flags.ts`, `useFeatureFlag.ts`)

Well-structured feature flag system. The hook is clean. The flags file is clear.

Issues:
- Feature flags are not environment-configurable (hardcoded in source)
- No remote feature flag capability

### Duplication Analysis

- **Asset URL resolution:** Exists in `utils/assets.ts`, `components/ui/AssetImage.tsx`, and the main process `WfcdAssetService`. Should be consolidated.
- **Mod enrichment:** The `enrichMod` function is imported dynamically at the call site (line 137 in WorkspaceShell). This is odd — it's called as a fire-and-forget without awaiting.
- **Parse/format utilities:** Multiple components implement their own number formatting. Should use a shared formatting utility.

### Missing Utilities

- Formatters (damage numbers, percentages, time)
- Debounce/throttle (especially important for search and calculation)
- Array operations (chunk, group, sort by)
- URL validation
- Clipboard operations (currently inline)
- Date/time formatting

---

## 16. State Management Assessment

### Ownership

**Score: 6/10**

Clear ownership between 4 Zustand stores. The `buildStore` holds all build state. The `uiStore` holds all UI state. The `libraryStore` holds catalog data. The `projectStore` holds project data.

### Derived State

**Score: 4/10**

Derived values (capacity, weapon states, equipped counts) are calculated in `useBuildPlannerStore` via `useMemo`. This means they're recalculated on every render cycle. For capacity calculations, this is acceptable. For more expensive derivations, this could be a performance issue.

### Synchronization

**Score: 3/10**

The build store is persisted via Zustand's `persist` middleware to localStorage. However:
- Loadouts are stored separately in localStorage (`tennoDexLoadouts`)
- Projects are stored separately (`tennodex_projects`)
- Owned items are in IndexedDB via Dexie

There is no synchronization between these stores. Saving a build updates the buildStore persistence and the loadouts store independently. Loading a build reads from loadouts but doesn't sync with the project system.

### Duplication

**Score: 4/10**

The `buildStore` contains `loadouts` (a `Record<string, string>` of code keys). The `projectStore` contains `projects` with `variants` which are essentially the same data in a different shape. This duplication means the user can save a build via two mechanisms without them being connected.

### React Patterns

**Score: 5/10**

Zustand usage is idiomatic. The `useShallow` selector is used for performance. The `persist` middleware is well-configured.

Issues:
- `useBuildPlannerStore()` without a selector returns the entire state, subscribing the component to ALL changes
- The spread operator in selectors (`useShallow(s => ({...s}))`) creates a new object reference every time, defeating shallow comparison

### Future Scalability

The Zustand store pattern scales well. The issue is the monolithic `useBuildPlannerStore` hook, not the stores themselves.

---

## 17. IPC Assessment

### Request Flow

1. Renderer calls `window.tennoDex.methodName(args)`
2. Preload script maps to `ipcRenderer.invoke(channel, args)`
3. Main process handles via `ipcMain.handle(channel, handler)`
4. Handler processes and returns result
5. Preload unwraps `IpcResult<T>` and returns data or throws

This is textbook Electron IPC. Well done.

### Response Flow

Results are typed via `IpcResult<T>` (discriminated union with `ok: true | false`). Errors are properly propagated.

### Validation

**Score: 4/10**

There is minimal input validation on IPC handlers. Arguments are passed directly to data services without type checking. The Overframe URL validation is a good example but unique — most handlers don't validate inputs.

### Error Handling

**Score: 6/10**

Handlers are wrapped in try/catch returning `ipcErr`. The renderer checks `result.ok` and throws if false. This is consistent.

However:
- Error messages from engine failures are passed verbatim to the renderer, potentially leaking internal details
- Some errors are logged but not propagated to the user
- No timeout mechanism for long-running IPC calls

### Coupling

**Score: 5/10**

IPC handlers are tightly coupled to specific service implementations. There's no service interface layer, making it difficult to swap implementations (e.g., testing with mock data).

### Security

See Section 21.

### Maintainability

**Score: 6/10**

IPC channels are well-organized in `registerIpcHandlers`. Adding a new channel requires: 1) declaration in preload, 2) handler registration, 3) potentially a new type. This is straightforward.

---

## 18. Calculation Engine Assessment

### Architecture

**Score: 8/10**

The calculation engine (`src/engine/`) is the strongest part of the codebase. It's well-architected around:

1. **Modifier system** — Atomic stat changes with category (FLAT/MULTIPLIER), stacking group, priority, and optional conditions
2. **Bucket system** — Groups modifiers by stacking group, then resolves flat values and multipliers separately
3. **Breakdown system** — Tracks each modifier's contribution to the final value for the "Why?" feature
4. **Weapon calculator** — Full weapon stat computation including multishot, crit, status, elemental combinations, faction damage, DoT, and enemy TTK
5. **Enemy simulator** — Level scaling, armor stripping, corrosive stacks, heat proc, health/shield/armor type multipliers

### Maintainability

**Score: 7/10**

The modifier/bucket/breakdown pattern is well-documented with comments in `modifier.ts`, `bucket-ops.ts`, and `calc-breakdown.ts`. The code is readable and follows consistent patterns.

Concerns:
- `stat-processor/index.ts` is 512 lines and packs too much logic
- `getWeaponBuffsFromFrame()` (lines 139-205) uses fragile string matching to determine which frame buffs apply to which weapon slot
- The auto-discovery system for frame stats (lines 18-45) is clever but could miss stats if bucket keys change

### Extensibility

**Score: 8/10**

Adding a new stat type requires: 1) adding a new stacking group key, 2) registering it in the resolver, 3) the auto-discovery system picks it up. For weapon stats, the weapon calculator is modular.

### Accuracy

**Score: 8/10** (inferred from code quality, not validated against in-game data)

The engine implements:
- Proper damage type weighting for status procs (4x physical weight)
- Correct efficiency cap at 175%
- Accurate CO/GS multiplier calculation
- Set bonus detection and stat injection
- Archon shard interactions (violet shard crit damage scaling with energy)
- Helminth ability scaling

The accuracy depends entirely on the WFCD resolver mapping mod data to modifiers correctly. This mapping is in `src/data/wfcd-resolver.ts` and `src/data/stat-mapping.ts` — these files are the most likely source of accuracy bugs.

### Documentation

**Score: 3/10**

The engine code has good inline comments but lacks:
- Overview documentation of the modifier system
- Documentation of the bucket keys and their meanings
- Explanation of the priority system
- Documentation of the stat auto-discovery mechanism
- Known limitations or inaccuracies

### Performance

**Score: 6/10**

Engine calculations run synchronously in the main process. For a single build, this is fast (sub-100ms). However, there's no caching — every stat change triggers a full recalculation of the entire build. For complex builds with 6+ weapons, a companion, enemy simulation, and set bonuses, this could become noticeable.

### Production Quality

**Score: 7/10**

The calculation engine is the closest thing to production quality in the codebase. The architecture is sound, the patterns are consistent, and the code is readable. It needs more tests, better documentation, and optimization for repeated calculations.

---

## 19. Simulation Engine Assessment

### Accuracy

**Score: 7/10**

The enemy simulator (`src/engine/enemy-simulator.ts`) implements:
- Proper Warframe level scaling (`base * (1 + (level - 1)^exponent)`)
- Armor DR formula (`armor / (armor + 300)`)
- Corrosive armor reduction (26% per stack)
- Heat proc 50% armor reduction
- EHP calculation including shields

The enemy target data comes from `game-data.json`, which is a static snapshot. Enemy health types, armor types, and resistances are included.

### Extensibility

**Score: 6/10**

Adding new enemy types requires updating `game-data.json`. Adding new damage mechanics requires modifying the stat processor.

### Performance

**Score: 8/10**

Enemy calculations are lightweight (simple arithmetic, no iteration). The performance impact of enabling the enemy lab is negligible.

### Future Support

The current enemy simulator supports basic EHP/TTK. Future enhancements could include:
- Enemy abilities
- Damage attenuation
- Overguard
- Status proc interactions
- Multiple enemy comparisons

---

## 20. Performance Assessment

### Rendering

**Score: 5/10**

- React 18 without concurrent features
- No virtualization for long lists (mod library could have 500+ mods)
- Re-renders likely cascade because `useBuildPlannerStore()` without a selector re-renders on ANY state change
- `useShallow(s => ({...s}))` creates new objects, defeating shallow comparison
- No `React.memo` on most components beyond `StatBreakdown`

**Impact:** Moderate. The component tree is small enough that most users won't notice. But as the app grows, these issues will compound.

### Memory Usage

**Score: 4/10**

- Game data is loaded entirely into memory in both main and renderer processes
- Mod library holds all mods in a Zustand store (replicated from main process)
- No code splitting for heavy data
- Riven editor, comparison views, and history panels are lazy-loaded but most of the app is bundled together

**Impact:** Moderate. The app could use 200-500MB+ RAM, which is high for a build planner.

### Startup

**Score: 5/10**

- Main process: Load WFCD data, initialize services, register IPC, create window
- Renderer: Mount React, fetch items via IPC, fetch game data, check data health
- Skeleton loading screen during data fetch

Startup time is acceptable (1-3 seconds) but the skeleton screen could be more informative.

### Search

**Score: 7/10**

Client-side filtering of arrays is fast for 500-2000 items. The search uses `Array.filter` with `String.includes`, which is O(n) per search. For expected dataset sizes, this is fine.

### Calculations

**Score: 6/10**

- Synchronous in main process
- Full recalculation on every change
- No caching or memoization
- No cancellation of in-flight calculations

**Impact:** Low for current complexity. Could become problematic with future features.

### IPC

**Score: 7/10**

IPC calls are typed and lightweight. The main bottleneck is `calculateBuild` which runs synchronously.

### Bundle Size

**Score: 4/10**

- No bundle analysis available but the build suggests:
  - Main process: ~1-2MB (WFCD data bundled)
  - Renderer: ~500KB-1MB (React, Zustand, application code)
  - No code splitting for renderer routes

**Impact:** Low — this is a desktop app, not a web page.

### Lazy Loading

**Score: 5/10**

`RivenEditor`, `CompareBuilds`, `HistoryPanel`, and `Onboarding` are lazy-loaded. But these are the only lazy-loaded components. The main renderer bundle includes everything else.

### Virtualization

**Score: 1/10**

Not used anywhere. The mod library renders all filtered items as DOM nodes. For 500+ mods, this creates thousands of DOM elements.

### Caching

**Score: 3/10**

- Calculation results are not cached
- IPC results are not cached at the renderer level
- Asset URLs could be cached but aren't
- Game data requests to the main process could be cached with stale-while-revalidate

---

## 21. Security Assessment

### Electron Security

**Score: 5/10**

- `contextIsolation` is enabled via preload script
- `nodeIntegration` is not explicitly disabled (defaults to false in Electron 5+, but should be explicit)
- `sandbox` is not configured for the renderer
- GPU is disabled — not a security issue but worth noting

### IPC Validation

**Score: 4/10**

- IPC handlers do minimal input validation
- The Overframe URL validator is thorough but unique
- `calculateBuild` receives unvalidated `BuildCore` objects from the renderer
- No schema validation on IPC inputs

### File System

**Score: 6/10**

The main process manages file system access through controlled services. The renderer cannot directly access the file system (thanks to contextBridge). File system operations are limited to:
- Reading game data during initialization
- Writing logs (theoretical — not implemented)

### Environment Variables

**Score: 6/10**

`TENNODEX_RUNTIME_DIR` is the only environment variable used. This is appropriate.

### Secrets

**Score: 7/10**

No secrets are hardcoded or exposed. The GitHub Token for releases is managed via GitHub Secrets. Good practice.

### Dependencies

**Score: 4/10**

- Dependabot configured for weekly updates (good)
- `@overwolf/ow-electron` uses `latest` version tag (dangerous — should pin)
- No `npm audit` in CI pipeline
- `package-lock.json` is present but not validated
- Some deep dependencies may have known CVEs

### Input Validation

**Score: 3/10**

- Build import codec validates version number
- Mod names are truncated at 64 characters
- MR is clamped to 0-30
- Everything else passes through without validation

### Storage

**Score: 4/10**

- localStorage for builds, loadouts, and projects
- IndexedDB via Dexie for owned items
- No encryption for any stored data
- No data sanitization before storage
- No storage size limits checked

---

## 22. Accessibility Assessment

### Keyboard Navigation

**Score: 3/10**

- Basic shortcuts exist (Ctrl+S, Ctrl+B, 1-9 for slots)
- Tab navigation is not managed — focus order follows DOM order which may not match visual order
- No skip-to-main-content link
- Mod grids are navigable but empty slots are click targets, not keyboard targets
- Dropdown menus are keyboard-navigable
- Modal dialogs trap focus inconsistently

### Focus Management

**Score: 2/10**

- No focus management when panels open or close
- Modals don't always trap focus
- No visible focus indicators on many interactive elements
- Opening the mod library doesn't focus the search input
- Closing a modal doesn't return focus to the triggering element

### Colour Contrast

**Score: 4/10`

- `--wf-text-muted: #849495` on `--wf-bg: #060608` has a contrast ratio of ~5.2:1 — passes WCAG AA for large text (18px+), fails for body text
- `--wf-border: rgba(132, 148, 149, 0.22)` — low contrast borders separating panels
- `--wf-text-dim: #b9cacb` on `--wf-surface: rgba(19, 19, 20, 0.92)` — approximately 7.5:1, passes
- Color is used as the sole indicator for: polarity matching, rarity, stat deltas, status effects
- No `prefers-contrast: more` media query support

### Screen Reader Support

**Score: 1/10**

- Minimal ARIA labels
- Dynamic stat updates are not announced
- Mod cards have no accessible descriptions
- The grid layout has no accessible row/column semantics
- Toast notifications are not announced by screen readers
- Modal dialogs lack proper `aria-labelledby` and `aria-describedby`

### High DPI

**Score: 5/10`

- CSS uses `px` units — these scale with the OS DPI setting in Electron
- No explicit high-DPI asset loading for images
- Mod card images are small and may look pixelated on 4K displays
- Font sizes in `px` will not respect user font size preferences

### Resizable Layouts

**Score: 5/10**

Panels can be resized via drag handles. The layout survives resize well. However:
- The application has no minimum window size
- Very narrow windows cause content to overflow
- No responsive breakpoints

### Inclusive Design

**Score: 2/10**

- No `prefers-reduced-motion` handling beyond basic CSS
- No `prefers-color-scheme` support (always dark mode)
- No font size adjustment
- No high-contrast mode
- No reduced-data mode

---

## 23. Animation & Motion Assessment

### Motion Language

**Score: 3/10**

There is no cohesive motion language. Animations are defined ad-hoc in CSS:
- `wb-fade-in` for content transitions
- `wb-toast-in` for toast notifications
- `stat-change-up`/`stat-change-down` for stat deltas
- `wb-shimmer` for calculation progress

These are applied inconsistently. Some content fades in, some appears instantly.

### Consistency

**Score: 3/10**

Only about 30% of state transitions are animated. Opening/closing panels, switching slots, and showing/hiding tabs are unanimated.

### Opportunities

Major animation opportunities:
1. Mod card insertion/removal (scale + fade)
2. Stat value changes (color flash + counter animation)
3. Slot switching (slide transition)
4. Panel collapse/expand (smooth height transition)
5. Drag-and-drop (ghost card + drop indicator)
6. Calculation completion (result highlight)
7. Import/export (success checkmark animation)

### Interaction Feedback

**Score: 4/10**

- Buttons have hover and active states
- Click targets don't always have visual feedback
- No loading spinners for async operations
- Toast notifications animate in but have no duration-based auto-dismiss (they persist until manually dismissed)

### Responsiveness

With GPU disabled, animations may stutter on some systems. CSS animations and transitions use the CPU by default, which is fine for simple effects but will struggle with complex animations.

---

## 24. Design System Assessment

### Components

**Score: 5/10**

`src/components/ui/` provides 18 components. These are functional but:
- Use inline styles instead of CSS classes for variant styling
- Missing a comprehensive set of states (disabled, loading, error, empty)
- Some components inject `<style>` tags (Button.tsx)
- Not consistently used by feature components

### Tokens

**Score: 7/10**

`tokens.css` defines comprehensive design tokens for:
- Surface colors (9 levels)
- Accent colors (teal, gold, purple, red, blue, green, orange)
- Text colors (3 levels)
- Rarity colors (4 levels)
- Typography (3 font families)
- Layout grid (column widths, gaps)
- Elevation (4 levels)
- Z-index (6 levels)
- Transitions (3 speeds)

This is well-structured. The DESIGN.md document is consistent with the CSS tokens.

### Typography

**Score: 7/10**

Three-font system with defined roles. The DESIGN.md spec is well-documented.

### Colour Palette

**Score: 7/10**

The Void Synthetic palette is distinctive and consistent with the brand. The token names are meaningful.

### Icons

**Score: 4/10`

No icon system. The app uses Unicode symbols and emoji. This is acceptable for a data-heavy tool but limits visual refinement.

### Spacing

**Score: 4/10`

Spacing tokens are minimal (`--pad: 6px`, `--gap: 12px`). The DESIGN.md defines `section-margin: 24px` and `grid-gap: 12px` but these aren't consistently used as CSS custom properties.

### Consistency

**Score: 5/10**

The tokens are consistent. The component implementations are partially consistent. The feature components often bypass the design system with inline styles.

---

## 25. Testing Assessment

### Unit Tests

**Score: 5/10**

**233 unit tests** exist. They cover:
- `ability-stats.test.ts` — Ability stat calculation
- `assets.test.ts` — Asset URL resolution
- `build-codec.test.ts` — Build encoding/decoding
- `build-core-mapper.test.ts` — Build state mapping
- `calc-breakdown.test.ts` — Breakdown construction
- `capacity-bar.test.tsx` — RTL test for capacity bar
- `damage-calculator.test.ts` — Damage calculations
- `damage-type-mods.test.ts` — Damage type mod handling
- `enemy-simulator.test.ts` — Enemy simulation
- `full-build-integration.test.ts` — Full build calculation
- `game-data-service.test.ts` — Game data service
- `game-data.test.ts` — Game data utilities
- `ipc-types.test.ts` — IPC type helpers
- `loadout-store.test.ts` — Loadout persistence
- `mod-card.test.tsx` — Mod card component
- `overframe-importer.test.ts` — Overframe parsing
- `polarity.test.ts` — Polarity calculations
- `riven-store.test.ts` — Riven storage
- `stat-processor.test.ts` — Stat processor
- `stats-hud.test.tsx` — Stats HUD component
- `wfcd-data-service.test.ts` — WFCD data service
- `wfcd-resolver.test.ts` — WFCD resolver

**Critical Gaps:**
- `setup.ts` has mocks for `window.tennoDex` but does NOT provide comprehensive mocks for all IPC endpoints
- Component tests exist for only 3 components (capacity-bar, mod-card, stats-hud)
- Store tests exist for some (loadout, riven) but not buildStore, uiStore, libraryStore, projectStore
- Integration tests exist for the calculation engine but not for the full app pipeline
- No tests for the main process IPC handlers
- No tests for the Overwolf sync hook
- No tests for the import/export flow

### Integration Tests

**Score: 3/10**

The `full-build-integration.test.ts` is comprehensive for the calculation engine. But there are no integration tests for:
- Store → IPC → main process → store
- UI → store → IPC
- UI → user interaction → state change
- Multi-step workflows (select frame → equip weapon → equip mods → check stats)

### End-to-End Tests

**Score: 4/10**

E2E tests are configured with Playwright but only smoke tests exist (from the `e2e/` directory). Basic application launch and interaction tests would catch critical regressions.

### Coverage

Configuration enforces 50% line/function/branch/statement thresholds. Given the small number of component tests and the extensive `any` usage, achieving 50% is unlikely for the renderer.

### Missing Scenarios

1. Mod equipping flow
2. Build import/export round-trip
3. Enemy lab interaction
4. Slot switching
5. Build saving/loading
6. Riven creation and equipping
7. All empty states
8. All error states
9. Calculation display
10. Panel resizing and collapse

### Reliability

The 233 existing tests are reliable (deterministic). The component tests use `@testing-library/react` which is the correct choice.

---

## 26. Documentation Assessment

### README

**Score: 6/10**

Comprehensive README covering:
- Features
- Quick start
- Commands
- Architecture overview
- State management
- Calculation pipeline
- Build codec
- Game data
- Testing
- Development
- Tech stack
- License

Missing:
- Screenshot (placeholder points to `docs/screenshot.png` which doesn't exist)
- Contribution guide
- Development setup details
- Architecture decision records

### Architecture Docs

**Score: 4/10**

The README provides a high-level architecture overview. The `TennoDex - Complete Project Blueprint & Architecture.md` exists but I haven't read it — its presence suggests some architectural documentation exists.

Missing:
- IPC flow documentation
- Data flow diagrams
- Component hierarchy
- Store data flow
- Main process architecture

### Product Docs

**Score: 3/10**

- No user manual
- No in-app help system
- The 5-step onboarding is the only product documentation
- `DESIGN.md` documents the design system

### Developer Onboarding

**Score: 5/10**

- `CONTRIBUTING.md` exists
- `AGENTS.md` provides AI agent onboarding instructions
- The README explains the project structure
- Husky precommit hooks are configured

Missing:
- Troubleshooting guide
- Common development workflows
- Debugging setup

### Code Documentation

**Score: 5/10**

- Engine code is well-commented (especially `modifier.ts`, `build-core.ts`, `stat-processor/index.ts`)
- Store code is sparsely commented
- Component code has minimal comments
- IPC code is moderately documented

---

## 27. Dependency Assessment

### Direct Dependencies

| Package | Version | Purpose | Assessment |
|---------|---------|---------|------------|
| react | ^18.2.0 | UI framework | OK, but 19 is current |
| react-dom | ^18.2.0 | DOM rendering | OK |
| zustand | ^5.0.14 | State management | Good |
| dexie | ^4.4.4 | IndexedDB wrapper | OK, but barely used |
| @wfcd/items | ^1.1273.26 | Warframe game data | Critical dependency |
| @wfcd/mod-generator | ^1.0.2 | Mod card generation | OK |

### Dev Dependencies

| Package | Version | Assessment |
|---------|---------|------------|
| @overwolf/ow-electron | latest | DANGEROUS — unpinned version |
| @overwolf/ow-electron-builder | latest | DANGEROUS — unpinned version |
| typescript | ^4.7.4 | OUTDATED — current is 5.5+ |
| webpack | ^5.75.0 | OK |
| vitest | ^4.1.9 | Good |
| playwright | ^1.61.1 | Good |
| eslint | ^9.39.4 | Good |
| prettier | ^3.8.4 | Good |

### Issues

1. **`@overwolf/ow-electron: latest`** — Unpinned major version. The `latest` tag could break the build at any time. Pin to a specific version.

2. **TypeScript 4.7.4** — This is very outdated. TypeScript 5.x (now at 5.5+) introduces significant improvements (decorators, import attributes, const type parameters, etc.). Upgrade is overdue.

3. **Dexie** — The library is included and a database is defined (`db.ts`) but its usage is minimal. The `items` table is populated but never queried in the application. The `builds` table is never used. This is dead weight (~30KB bundled).

4. **@wfcd/mod-generator** — Used for mod card rendering. The mod-card-renderer service in the main process depends on it and on `@napi-rs/canvas`. These are heavy dependencies for a feature (mod card image generation) that may not be essential.

5. **Copy-Webpack-Plugin** — Listed in dependencies but not clearly used in any webpack config. May be used by the renderer build but not explicitly in the configs I reviewed.

### Unused Packages

- **Dexie** — Partially unused. The database is created but the `builds` table is never accessed.
- **Copy-Webpack-Plugin** — May be unused.
- **source-map-explorer** — Used by the `analyze` script. Not a runtime concern.

### Heavy Packages

- **@wfcd/items** — Contains the complete Warfare item database (~5MB JSON). This is bundled into the main process. Acceptable for a desktop application.
- **@napi-rs/canvas** — Native Node.js canvas library (~10MB). Required for mod card generation. Heavy but justified.

---

## 28. Build System Assessment

### Webpack

**Score: 6/10**

Three separate webpack configs for main, preload, and renderer is the right approach for Electron. The `webpack.base.config.js` provides shared TypeScript compilation via `ts-loader` with `transpileOnly: true` (faster but skips type checking — that's delegated to `tsc --noEmit`).

Issues:
- Base config uses `transpileOnly: true` — type checking is done via `npm run typecheck`. This is fine but means webpack won't catch type errors during build.
- Production config enables `splitChunks` for vendor bundling but this is only useful for the renderer.
- No CSS loader or style configuration in any webpack config — CSS files are loaded via Electron's native file loading.
- No asset loader for images or fonts.

### TypeScript

**Score: 5/10`

- `strict: true` is enabled — good
- Target `es2015` — very outdated, limits modern JS features
- `skipLibCheck: true` — speeds up compilation but skips checking dependencies
- Path alias `electron → @overwolf/ow-electron/electron` — correct for OW integration
- TypeScript 4.7.4 is very outdated (current: 5.5+)

### ESLint

**Score: 6/10`

- Flat config (`eslint.config.mjs`) with typescript-eslint
- React plugin + React Hooks plugin
- Key rules disabled:
  - `@typescript-eslint/no-explicit-any: off` — This is enabling the `any` plague
  - `no-console: warn` — Should be error in production
- Prettier integration via `eslint-config-prettier`
- Ignore patterns configured

### Prettier

**Score: 7/10**

Standard config with `singleQuote`, `printWidth: 120`, `trailingComma: all`, `arrowParens: avoid`. Integrated with lint-staged for precommit formatting.

### Vitest

**Score: 6/10**

- jsdom environment for component tests
- 50% coverage threshold (may not be met)
- V8 coverage provider
- HTML coverage reporter
- E2E config with separate vitest.config

Issues:
- Global test setup is minimal (`setup.ts`)
- No MSW (Mock Service Worker) for API mocking
- Coverage thresholds likely not met given test gaps

### CI/CD

**Score: 8/10**

Professional-grade GitHub Actions pipeline:
- Lint + Typecheck (Ubuntu)
- Unit Tests (Ubuntu)
- Dev Build (Ubuntu)
- E2E Tests (Windows — correct for an Electron app)
- Production Build (Ubuntu)
- NSIS Package (Windows)
- Release with tag-based triggers

Issues:
- Dependabot configured but no auto-merge for patch updates
- No security scan (npm audit, Snyk, or similar)
- No performance regression testing
- Release workflow only triggers on version tags — no staging release

### Packaging

**Score: 5/10`

- OW-Electron builder for NSIS Windows installer
- No code signing
- No macOS or Linux builds
- No auto-update mechanism
- No installer testing in CI

---

## 29. Developer Experience Assessment

### Project Structure

**Score: 6/10**

Logical structure. The separation of main/renderer/preload/shared is clear. The `features/` directory organizes by feature. The UI components library is separated from feature components.

Confusion points:
- `src/data/` (renderer-side data) vs `src/browser/data/` (main process data)
- `src/hooks/useBuildPlannerStore.ts` is the "main hook" but lives in `hooks/` while orchestrating everything
- `src/features/build-planner/` contains model.ts, types/, util/ — this module is too large

### Build Times

**Score: 5/10**

Initial full build: 15-30 seconds (three webpack builds). Incremental builds after changes: 3-8 seconds. This is slow for a development iteration cycle. Options: use webpack watch mode, implement HMR for the renderer.

### Local Setup

**Score: 7/10**

1. `npm ci` (install)
2. `npm run update-data` (fetch game data)
3. `npm run build` (build all)
4. `npm run start` (launch)

The `start-dev.ps1` script handles runtime directory setup and GPU disabling. Good developer experience.

Issues:
- Windows-only (PowerShell script)
- Requires the game data generation step which takes network access
- No `npm run dev` command for rebuild-on-change workflow

### Debugging

**Score: 4/10`

- Electron's DevTools are accessible
- `console.warn` used for error logging
- Logger utility exists but doesn't log to files
- No structured error reporting
- No source maps in production (devtool: false)
- Test output is standard Vitest

### Logging

**Score: 4/10**

The `Logger` class is functional but minimal:
- No configurable log levels via environment
- No log file output
- No structured logging (JSON format)
- No context propagation (request IDs, session IDs)
- No log aggregation

### Error Reporting

**Score: 2/10`

No error reporting infrastructure:
- No Sentry/Rollbar/Bugsnag
- No crash reporting
- No telemetry
- Production errors are invisible

If the application crashes or produces incorrect calculations, the developers will never know unless a user reports it.

### Maintainability

**Score: 5/10**

See Section 31.

### Onboarding Experience

**Score: 6/10**

`AGENTS.md`, `CONTRIBUTING.md`, and the README provide solid onboarding. The code should be navigable for a developer familiar with Electron + React. The lack of architecture documentation (diagrams, data flow) makes deeper understanding slower.

---

## 30. Scalability Assessment

### New Warframes

**Score: 8/10**

Adding a new warframe requires:
1. WFCD data update (`npm run update-data`) — automatic
2. Warframe appears in the library automatically
3. If the warframe has unique mechanics, add modifiers in the resolver

This is well-supported.

### New Weapons

**Score: 8/10**

Same as warframes — data-driven. New weapon types require adding slot categories in the type system.

### New Systems

**Score: 5/10**

Adding a new game system (e.g., a new type of upgrade slot) requires changes to:
1. Model types (`model.ts`)
2. Build state (`buildStore.ts`)
3. UI components (mod grid, special badges)
4. IPC pipeline
5. Calculation engine (modifier handling)
6. Build codec
7. Build core mapper
8. Persistence

This is many touch points. Each new system increases the surface area for bugs.

### Future Game Updates

**Score: 6/10**

Regular Warframe updates (new mods, new arcanes, balance changes) are data-driven and handled by updating WFCD data. Major system changes require code changes.

### Large Feature Additions

**Score: 4/10**

The monolithic `useBuildPlannerStore` and `WorkspaceShell` create bottlenecks for large features. Feature additions will require modifications to these central files, increasing merge conflicts and regression risk.

### Multiple Contributors

**Score: 5/10**

The codebase is navigable. CI enforces quality gates. However:
- The lack of clear module boundaries makes it easy to create circular dependencies
- The `useBuildPlannerStore` god-hook is a coordination bottleneck
- No architecture decision records for new contributors to reference

---

## 31. Maintainability Assessment

### 1 Year

**Score: 6/10**

The codebase is maintainable for 1 year with the current team. The calculation engine and data layer are solid. The UI layer will accumulate technical debt quickly if test coverage and code quality standards are not improved.

### 3 Years

**Score: 4/10**

At the 3-year mark, the following become critical problems:
- TypeScript 4.7 outdated idioms become technical debt
- The lack of component tests makes refactoring risky
- The monolithic useBuildPlannerStore becomes unmanageable
- The Overwolf dependency becomes a risk
- Warframe's own API or tools could change the competitive landscape

### 5 Years

**Score: 3/10**

Without significant investment, the codebase will be difficult to maintain at 5 years:
- The UI framework (React 18) will be outdated
- Electron 21 (via OW-Electron) will be very outdated
- The localStorage-based persistence will be insufficient for complex user data
- The synchronous calculation pipeline will need modernization

### 10 Years

**Score: 2/10**

A 10-year maintainability is unrealistic without a fundamental rewrite of most of the codebase. This is common for desktop applications in this space.

### Long-Term Risks

1. **OW-Electron lifecycle** — If Overwolf stops supporting OW-Electron, the packaging system breaks
2. **WFCD data format changes** — The resolver is tightly coupled to WFCD's JSON structure
3. **Warframe game changes** — Major system reworks could invalidate the calculation engine
4. **Electron security model changes** — Context isolation, sandboxing requirements could break the IPC model
5. **JavaScript ecosystem churn** — Webpack 5 → Vite transitions could require build system rewrite

---

## 32. Technical Debt Assessment

### CRITICAL

| Issue | Root Cause | Business Impact | Technical Impact | Risk | Effort | Priority |
|-------|------------|-----------------|------------------|------|--------|----------|
| No UI component tests | Not prioritized | Cannot verify UI behavior; regressions ship silently | Any refactoring is blind | High | 2-3 weeks | 1 |
| handleImport/loadLoadout duplication | Rushed implementation, no refactoring | Import bugs affect ALL users | ~175 lines of duplicated logic; maintain both | High | 1 week | 2 |
| useBuildPlannerStore monolith | Organic growth without refactoring | Slows feature development | 493-line god-hook; untestable | Medium | 2-3 weeks | 3 |
| @typescript-eslint/no-explicit-any disabled | Engineering decision | Runtime type errors | Entire renderer type-unsafe | High | 1 week (incremental) | 4 |

### HIGH

| Issue | Root Cause | Business Impact | Technical Impact | Risk | Effort | Priority |
|-------|------------|-----------------|------------------|------|--------|----------|
| OW-Electron pinned to `latest` | Oversight | Build breaks unpredictably | Unreliable builds | High | 30 min | 5 |
| GPU fully disabled | Workaround for rendering issues | Sluggish UI on modern displays | Poor user experience | Medium | 1-2 weeks | 6 |
| Dexie database defined but unused | Incomplete implementation | Dead code (~30KB bundle) | Confusing to developers | Low | 1 day | 7 |
| TypeScript 4.7 | Outdated | Missing modern language features | Prevents use of recent improvements | Medium | 1-2 weeks | 8 |
| No error tracking | Not implemented | Blind to production issues | Users report bugs silently | High | 1 week | 9 |
| Inline styles throughout | No styling convention | Hard to maintain, theme, or audit | CSS-in-JS inconsistency | Medium | 2-4 weeks | 10 |
| Project store unused | Feature not completed | Dead code, confusing UX | Storage inconsistency | Low | 3 days | 11 |
| Fragmentary persistence (3 mechanisms) | Organic growth | Builds saved in one place, loadouts in another | Data loss risk, user confusion | Medium | 1-2 weeks | 12 |

### MEDIUM

| Issue | Root Cause | Business Impact | Technical Impact | Risk | Effort | Priority |
|-------|------------|-----------------|------------------|------|--------|----------|
| RightInspector too large (450 lines) | Not refactored | Slows right-panel changes | Hard to test and maintain | Low | 3-5 days | 13 |
| CenterSurface too large (372 lines) | Not refactored | Slows center-panel changes | Hard to test and maintain | Low | 3-5 days | 14 |
| BottomDrawer too large (360 lines) | Not refactored | Slows bottom-panel changes | Hard to test and maintain | Low | 3-5 days | 15 |
| Props drilling of BuildPlannerState | No state separation | Unnecessary re-renders | Tight coupling | Medium | 2-3 weeks | 16 |
| No CSS convention | No design system adoption | Style fragmentation | Hard to refactor styling | Medium | 2-4 weeks | 17 |
| stat-processor/index.ts (512 lines) | Organic growth | Moderate | Hard to extend | Low | 1 week | 18 |
| getWeaponBuffsFromFrame string matching | Fast implementation | May produce incorrect results for edge cases | Fragile slot-filtering logic | Medium | 3-5 days | 19 |
| Overframe regex parser | Only viable approach | Will break silently on format changes | Unreliable feature | Medium | 2 weeks | 20 |
| No request cancellation for calculations | Missing implementation | Wasted IPC calls on rapid changes | Performance issue | Low | 2-3 days | 21 |
| No undo/redo | Missing feature | User frustration | Poor UX | Medium | 2-4 weeks | 22 |

### LOW

| Issue | Root Cause | Business Impact | Technical Impact | Risk | Effort | Priority |
|-------|------------|-----------------|------------------|------|--------|----------|
| No formatters utility | Not created | Duplicate formatting code | Minor code bloat | Low | 1 day | 23 |
| Magic numbers in CSS | Not tokenized | Hard to theme | Minor consistency issues | Low | 2-3 days | 24 |
| Empty panels (Archwing, Necramech, etc.) | Not completed | Missing features | Dead UI | Low | Ongoing | 25 |
| No bundle analysis | Not set up | Unknown bundle composition | Minor optimization | Low | 1 day | 26 |
| capitalize/shared utility | Not extracted | Duplicate code | Minor | Low | 1 day | 27 |

---

## 33. Commercial Readiness Assessment

### Internal Alpha

**Verdict: READY NOW**

The application functions well enough for internal team testing. Core features work. The calculation engine is accurate. The build pipeline produces working installers.

### Closed Alpha

**Verdict: READY WITH CONDITIONS**

Requires:
- Basic error tracking
- More comprehensive automated tests
- Documentation for testers
- Feedback collection mechanism

### Closed Beta

**Verdict: NOT READY**

Requires:
- Accessibility improvements (at minimum: keyboard navigation, screen reader basics)
- UX polish (at minimum: drag-and-drop mods, undo/redo, right-click menus)
- Bug fixes from closed alpha
- Performance optimization
- Telemetry for usage analysis

### Open Beta

**Verdict: NOT READY**

Requires:
- All closed beta requirements
- Public documentation
- Community management infrastructure
- Support channels
- Build comparison and sharing features

### Production Release

**Verdict: NOT READY**

Requires:
- All open beta requirements
- Monetization strategy
- Commercial support infrastructure
- Marketing materials
- Onboarding and tutorial content
- Accessibility compliance
- Internationalization (at minimum: English)
- Crash reporting and error monitoring
- Regular update pipeline

---

## 34. Competitive Analysis

### vs Overframe (Primary Competitor)

| Aspect | TennoDex | Overframe |
|--------|----------|-----------|
| **Math Accuracy** | ✅ High (WFCD) | ❌ Questionable |
| **Desktop Native** | ✅ Yes | ❌ No (Web) |
| **Offline** | ✅ Partial | ❌ Requires internet |
| **Riven Support** | ✅ Custom stat rolls | ❌ Basic |
| **Enemy Lab** | ✅ Full simulation | ❌ Not available |
| **Build Comparison** | ✅ Basic | ❌ Not available |
| **Breakdown "Why?"** | ✅ Yes | ❌ Not available |
| **Community Builds** | ❌ Not implemented | ✅ 50,000+ builds |
| **Build Sharing** | ✅ tndx1: codec | ✅ URL sharing |
| **User Accounts** | ❌ Not implemented | ✅ Yes |
| **Polish** | ❌ Alpha quality | ✅ Web-adequate |
| **Accessibility** | ❌ Poor | ✅ Web-adequate |

**Advantage:** Math accuracy, desktop performance, depth of features

**Weakness:** Community features, polish, accessibility

### vs Path of Building (Aspirational Benchmark)

| Aspect | TennoDex | Path of Building |
|--------|----------|-----------------|
| **Math Accuracy** | High | Very High |
| **Breakdown System** | Yes | Yes |
| **Community Sharing** | No | Yes (PoB.party) |
| **Item Search** | Good | Excellent |
| **Tree/Graph** | No (mod grid) | Yes (passive tree) |
| **Configuration UI** | Good | Excellent |
| **Plugin System** | No | Yes |
| **Open Source** | Yes (MIT) | Yes (MIT) |

**How to differentiate:**

1. **Accuracy as the brand** — "The most accurate Warframe calculator" should be the marketing message
2. **Enemy Lab** — PoB doesn't have live TTK simulation. This is TennoDex's killer feature
3. **Desktop speed** — Web-based tools feel sluggish. Electron with local data is snappy
4. **Riven system** — Rivens are unique to Warframe and TennisDex handles them well
5. **Simple sharing** — tndx1: codes are more portable than URLs

---

## 35. SWOT Analysis

### Strengths

1. Accurate calculation engine with full Warframe mechanics support
2. Desktop-native performance
3. Comprehensive feature set (warframe, weapons, companion, archon shards, helminth, rivens, enemy lab)
4. Well-architected modifier/bucket/breakdown system
5. Clean IPC design with typed interfaces
6. Professional CI/CD pipeline
7. Compact, versioned build codec
8. Meangingful differentiation from Overframe
9. Open source (MIT license)
10. Good design system foundation

### Weaknesses

1. No UI component tests
2. Near-zero accessibility
3. TypeScript `any` usage throughout renderer
4. Monolithic useBuildPlannerStore hook
5. Fragmented persistence (3 mechanisms)
6. No error tracking or crash reporting
7. Overwolf lock-in for packaging
8. GPU disabled (no hardware acceleration)
9. No drag-and-drop interactions
10. Undocumented import/loadout logic duplication

### Opportunities

1. Warframe's enduring popularity (10+ year old game, still receives updates)
2. Path of Building's success validates the theorycrafting tool market
3. Overframe's math accuracy concerns create a market gap
4. Desktop-native tools are rare in the Warframe community
5. Cloud sync and community features are natural extensions
6. Cross-platform expansion (macOS, Linux)
7. Warframe mobile could increase potential audience

### Threats

1. Overwolf platform changes or deprecation
2. Warframe official tools reducing need for third-party planners
3. Warframe game changes invalidating calculations
4. Overframe improving math accuracy
5. Community fragmentation
6. Warframe's declining player base
7. Electron security changes breaking the IPC model

---

## 36. Risk Register

| # | Risk | Category | Likelihood | Impact | Severity | Mitigation |
|---|------|----------|------------|--------|----------|------------|
| 1 | OW-Electron `latest` version breaks build | Technical | Medium | Critical | HIGH | Pin version, test before updating |
| 2 | Game data out of sync with Warframe patches | Product | High | High | HIGH | Automate data freshness checks |
| 3 | No error tracking — bugs go undetected | Technical | High | High | HIGH | Implement Sentry or similar |
| 4 | Import/loadout duplicate logic causes desync | Technical | Medium | High | HIGH | Refactor into shared utility |
| 5 | Warframe API or official tool makes planner obsolete | Commercial | Low | Critical | MEDIUM | Diversify into general theorycrafting |
| 6 | TypeScript `any` causes runtime production crash | Technical | Medium | Medium | MEDIUM | Enable strict type-checking incrementally |
| 7 | Calculation engine blocks main process IPC | Performance | Low | High | MEDIUM | Move calculations to worker thread |
| 8 | Accessibility lawsuit or complaint | Legal | Low | High | MEDIUM | Address WCAG 2.1 AA compliance |
| 9 | Overwolf deprecates OW-Electron | Commercial | Low | Critical | MEDIUM | Maintain fallback to standard Electron |
| 10 | GPU-disabled rendering feels sluggish | UX | High | Medium | MEDIUM | Investigate selective GPU enablement |
| 11 | Mod library DOM performance with 500+ mods | Performance | Medium | Low | LOW | Implement windowed virtualization |
| 12 | localStorage quota exceeded | Technical | Low | Medium | LOW | Migrate to IndexedDB for all persistence |
| 13 | Undo/redo missing causes user frustration | UX | High | Low | LOW | Implement change history |
| 14 | No community features limits adoption | Product | High | Low | LOW | Prioritize community build sharing |
| 15 | Single contributor risk | Commercial | Medium | Medium | MEDIUM | Recruit additional maintainers |

---

## 37. Scoring

| Area | Score | Comments |
|------|-------|----------|
| **Product Vision** | 7/10 | Clear vision, well-documented, consistent |
| **Product Design** | 5/10 | Good design system, inconsistent execution |
| **User Experience** | 3/10 | Functional but rough. No drag-drop, no undo, no context menus |
| **Workflow Design** | 4/10 | Core loop works. Too many clicks per action. Buried features |
| **Frontend** | 4/10 | Monolithic hooks, untested components, `any` types, inline styles |
| **Backend** | 7/10 | Calculation engine is excellent. Data services are clean |
| **Architecture** | 5/10 | Good foundations, blurred module boundaries, over-coupled |
| **Electron** | 5/10 | Clean IPC, preload isolation. GPU disabled. No state persistence |
| **Performance** | 5/10 | Adequate for current scope. No virtualization, no caching |
| **Security** | 4/10 | Basic Electron security. No input validation, no sandboxing |
| **Testing** | 4/10 | 233 engine/utility tests. Near-zero component tests. No integration tests |
| **Documentation** | 4/10 | Good README. Missing architecture docs, user docs, contribution guide |
| **Developer Experience** | 5/10 | Logical structure. Slow builds. No HMR. No error tracking |
| **Maintainability** | 4/10 | High risk for 3+ years without significant investment |
| **Scalability** | 5/10 | Good for data-driven content. Poor for feature additions |
| **Commercial Readiness** | 2/10 | Not ready for any public release |

### Overall Project Score

**47 / 160 (29%)**

This score reflects an early-stage product with strong technical foundations in its core domain (calculation engine) but significant gaps in UX, testing, accessibility, security, and commercial readiness.

---

## 38. Final Verdict

### GO WITH CONDITIONS

**TennoDex should proceed with development — but only under strict conditions.**

### Why Go

1. **Strong technical foundation.** The calculation engine is genuinely impressive. The modifier/bucket/breakdown architecture is production-quality and compares favorably to Path of Building.

2. **Clear market need.** Warframe players need accurate build planning. Overframe dominates but has known accuracy issues. TennoDex fills this gap with superior math.

3. **Meaningful differentiation.** Enemy Lab, build breakdowns, desktop performance, and compact build codes create real competitive advantages.

4. **Good architecture decisions.** The IPC design, store separation, build codec, and data pipeline are well-thought-out.

5. **Professional CI/CD.** The build pipeline demonstrates engineering maturity and readiness for team development.

6. **Open source.** MIT license removes barriers to community adoption.

### Conditions (Must Be Met Before Public Beta)

1. **Achieve 80%+ test coverage for the renderer.** All components, hooks, and stores must have tests. This is non-negotiable.

2. **Refactor useBuildPlannerStore.** Split into focused hooks. Eliminate the god-hook pattern.

3. **Fix import/loadout duplication.** Extract shared logic. This is a critical defect risk.

4. **Implement error tracking.** Add Sentry (or equivalent) before any external release.

5. **Pin OW-Electron version.** Remove `latest` tag. Version-lock all critical dependencies.

6. **Upgrade TypeScript to 5.x.** Modernize the type system.

7. **Address WCAG 2.1 AA accessibility gaps.** At minimum: keyboard navigation, screen reader support, color contrast.

8. **Implement drag-and-drop mod equipping.** This is the most impactful UX improvement available.

9. **Remove GPU disable flags.** Investigate selective GPU enablement for rendering performance.

10. **Implement undo/redo.** Users must be able to revert changes.

### Recommended Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Technical Debt Sprint | 1 month | Refactor, tests, TypeScript upgrade, OW pin |
| UX Sprint | 2 months | Drag-drop, undo/redo, context menus, keyboard nav |
| Accessibility Sprint | 1 month | WCAG 2.1 AA compliance |
| Infrastructure Sprint | 1 month | Error tracking, logging, telemetry, build optimization |
| Closed Alpha | 2 months | Invitation-only tester group |
| Public Beta | 2 months | Open sign-up |
| Production Release | 2 months | Monetization, marketing, support infra |

**Total: 9-12 months to production release.**

### Final Assessment

TennoDex is a promising product with real technical merit. The calculation engine is the strongest asset and should be protected and invested in. The UX layer needs significant investment to match the quality of the engine. The testing gap is the most urgent blocker.

The product team has made the right architectural decisions in many areas. The gaps are in execution and polish — which are fixable with time and focused effort.

**The investment is recommended, subject to the conditions above.**

---

*End of Report*

*Audit conducted 2 July 2026*
*CONFIDENTIAL — For authorized recipients only*
