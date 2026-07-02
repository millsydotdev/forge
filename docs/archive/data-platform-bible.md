# TennoDex — Data Platform & Project System Bible

**Date:** 2 July 2026  
**Author:** Principal Data Architect  
**Status:** DEFINITIVE — Complete data architecture specification

---

## Table of Contents

1. Executive Summary
2. Data Philosophy
3. Complete Data Model
4. Entity Relationship Diagrams
5. Project System
6. File Formats
7. Import / Export Architecture
8. Asset Database
9. Caching Architecture
10. Search Architecture
11. History System
12. Future Cloud Sync
13. Migration System
14. Performance Budgets
15. Testing Strategy
16. Future Expansion
17. Risk Register
18. Data Completion Checklist

---

## 1. Executive Summary

### Data Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA ARCHITECTURE                         │
│                                                             │
│  PERMANENT STORAGE          VOLATILE STORAGE                │
│  (File System)              (Memory)                        │
│                                                             │
│  projects/                  Zustand Stores                  │
│  ├── {id}/project.json     ├── buildStore (current build)   │
│  │   ├── builds/            ├── uiStore (UI state)          │
│  │   └── assets/            ├── libraryStore (catalog)      │
│  ├── templates/             ├── projectStore (projects)     │
│  └── archives/              └── undoStore (command stack)   │
│                                                             │
│  config.json                Engine Output                   │
│  window-state.json          ├── CalculatedStats (last calc) │
│  cache/                     └── breakdowns (per stat)       │
│  ├── images/                                               │
│  ├── lottie/               Game Data (WFCD)                │
│  └── kb/                   ├── Items (indexed)             │
│                             ├── Stat Map                    │
│  logs/                      └── Damage Type Mods            │
│  diagnostics/                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **File system is the primary store** — no embedded database. JSON files are human-readable, debuggable, and git-friendly.
2. **Stores are ephemeral** — Zustand stores hold runtime state only. They hydrate from disk on startup and persist on save.
3. **Engine output is read-only** — `CalculatedStats` is never modified after creation. UI derives display values from it.
4. **Offline-first** — All data is local. Cloud sync is additive (future), never required.
5. **Versioned formats** — Every file format has a version field. Migration pipeline handles upgrades.

---

## 2. Data Philosophy

### Single Source of Truth

The **project file** is the single source of truth for user data. Everything else (store state, UI state, window positions) is derived or ephemeral.

```
Project File (source of truth)
  → hydrate Zustand stores on load
  → calculateBuild() → CalculatedStats
  → UI renders from stores
  → stores persist back to project file on save
```

### Immutable Engine Output

`CalculatedStats` produced by `calculateBuild()` is never mutated. The UI reads it, derives display values from it, but never writes to it. This guarantees:

- **Reproducibility** — Same input → Same output, always
- **Cacheability** — Result can be safely cached
- **Debuggability** — Engine output can be logged and compared

### Mutable Workspace State

Zustand stores hold the **mutable** workspace state. They are:
- Hydrated from file on load
- Mutated by user actions (mod placement, equipment change, etc.)
- Debounced and persisted on save/auto-save
- Reset on new build

### Offline-First

All application features work without internet:
- Build calculation (always)
- Project management (always)
- Knowledge Base (bundled)
- Game data (bundled snapshot + cache)
- Import/export (requires clipboard — works offline)

Internet is required only for:
- Initial game data download
- CDN images (cached after first load)
- App updates
- Future cloud sync

### Future Cloud-Ready

The data model supports cloud sync from day one:
- Every project has a UUID
- Every change is timestamped
- Conflict resolution uses last-writer-wins (first version)
- Future: CRDT-based merge for collaborative editing

---

## 3. Complete Data Model

### Primitive Types

```typescript
type UUID = string;          // crypto.randomUUID()
type Timestamp = string;     // ISO 8601
type Version = number;       // Format version (monotonic)
type UniqueName = string;    // WFCD item path

interface Metadata {
  created: Timestamp;
  updated: Timestamp;
  version: Version;
  appVersion: string;        // SemVer of creating app
}

interface TndxFile<T> {
  magic: 'TNDX';             // File signature
  version: Version;
  metadata: Metadata;
  data: T;
}
```

### Core Entities

```
Project
├── id: UUID
├── name: string
├── metadata: Metadata
├── builds: Build[]
├── templates: Build[]
├── archived: boolean
├── tags: string[]
└── notes: string

Build (also called Variant)
├── id: UUID
├── name: string
├── description: string
├── loadout: Loadout
├── config: BuildConfig
├── result: CalculatedStats | null  (runtime only, not stored)
├── parentBuildId: UUID | null      (variant lineage)
├── createdAt: Timestamp
└── updatedAt: Timestamp

Loadout
├── warframe: WarframeSlot
├── primary: WeaponSlot | null
├── secondary: WeaponSlot | null
├── melee: WeaponSlot | null
├── archGun: WeaponSlot | null
├── archMelee: WeaponSlot | null
├── companion: CompanionSlot | null
├── operator: OperatorSlot | null
├── config: BuildConfig
└── buffs: SquadBuff[]

BuildConfig
├── targetFaction: string | null
├── enemy: EnemyTarget | null
├── conditionalTriggers: ConditionalTriggerState
├── isAiming: boolean
├── activeStatuses: number
├── multiTarget: number
├── primerSlot: string | null
└── difficulty: 'normal' | 'steel_path' | 'sortie' | 'archon_hunt'

WarframeSlot
├── uniqueName: UniqueName
├── aura: EquippedMod | null
├── exilus: EquippedMod | null
├── mods: EquippedMod[]
├── arcanes: [EquippedArcane | null, EquippedArcane | null]
├── shards: EquippedShard[]
├── helminth: HelminthAbility | null
├── slotPolarities: Polarity[]
└── exaltedWeapon: WeaponSlot | null

WeaponSlot
├── uniqueName: UniqueName
├── slot: 'primary' | 'secondary' | 'melee' | 'arch-gun' | 'arch-melee'
├── exilus: EquippedMod | null
├── mods: EquippedMod[]
├── arcanes: [EquippedArcane | null, EquippedArcane | null]
├── slotPolarities: Polarity[]
└── incarnonStage: number

CompanionSlot
├── uniqueName: UniqueName
├── type: 'sentinel' | 'beast' | 'moa' | 'hound' | 'predasite' | 'vulpaphyla'
├── mods: EquippedMod[]
├── slotPolarities: Polarity[]
└── weapon: {
    uniqueName: UniqueName
    mods: EquippedMod[]
    slotPolarities: Polarity[]
  } | null

OperatorSlot
├── uniqueName: UniqueName
├── focusNodes: string[]
└── arcane: EquippedArcane | null

EquippedMod
├── uniqueName: UniqueName
├── rank: number
├── slotPolarity: Polarity
└── rivenData?: RivenData

EquippedArcane
├── uniqueName: UniqueName
├── rank: number
└── maxRank: number

EquippedShard
├── color: 'crimson' | 'azure' | 'amber' | 'violet' | 'topaz' | 'emerald'
└── isTau: boolean

HelminthAbility
├── donorUniqueName: UniqueName
├── slotIndex: number
└── replacesAbilityIndex: number
```

### Supporting Entities

```
UserPreferences
├── theme: 'dark' (only theme for v1)
├── layoutPreset: 'balanced' | 'compact' | 'wide' | 'presentation'
├── workspace: 'theorycraft' | 'enemyLab' | 'comparison' | 'presentation' | 'minimal'
├── panelWidths: { sidebar: number, inspector: number, drawer: number }
├── panelCollapsed: { sidebar: boolean, inspector: boolean, drawer: boolean }
├── autoSaveInterval: number (ms, default 30000)
├── recentFiles: string[]
├── lastOpenProject: UUID | null
├── mr: number
├── shortcuts: Record<string, string>  // custom keybindings
└── telemetryOptIn: boolean

Collection
├── id: UUID
├── name: string
├── description: string
├── items: UniqueName[]
├── metadata: Metadata
└── tags: string[]

ComparisonState
├── buildA: Build
├── buildB: Build
├── resultA: CalculatedStats | null
├── resultB: CalculatedStats | null
└── pinnedStats: string[]
```

---

## 4. Entity Relationship Diagrams

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECT                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  id: UUID (PK)                                          │   │
│  │  name: string                                           │   │
│  │  version: number                                        │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │ has many                              │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BUILD (Variant)                                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  id: UUID (PK)                                          │   │
│  │  projectId: UUID (FK → Project)                         │   │
│  │  parentBuildId: UUID (FK → Build, nullable)             │   │
│  │  name: string                                           │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │ has one                               │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LOADOUT                                                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ WarframeSlot │  │ WeaponSlot   │  │ WeaponSlot   │  │   │
│  │  │ (1)          │  │ (1-6)         │  │ (1-6)        │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │   │
│  │         │                 │                  │          │   │
│  │         ▼                 ▼                  ▼          │   │
│  │  ┌──────────┐     ┌──────────┐     ┌──────────┐       │   │
│  │  │Mods[8]   │     │Mods[8]   │     │Mods[8]   │       │   │
│  │  │Arcanes[2]│     │Arcanes[2]│     │Arcanes[2]│       │   │
│  │  │Shards[5] │     │Exilus    │     │Exilus    │       │   │
│  │  │Helminth  │     │Polarities│     │Polarities│       │   │
│  │  │Exalted   │     └──────────┘     └──────────┘       │   │
│  │  │Polarities│                                         │   │
│  │  └──────────┘                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  LOADOUT also has:                                              │
│  ├── CompanionSlot (0-1)                                        │
│  ├── OperatorSlot (0-1)                                         │
│  └── BuildConfig                                                │
│       ├── EnemyTarget                                           │
│       ├── ConditionalTriggers                                   │
│       └── SquadBuff[]                                           │
└─────────────────────────────────────────────────────────────────┘

CALCULATION FLOW:
┌──────────┐    ┌──────────────┐    ┌────────────────┐
│ Loadout  │ →  │ calculate()  │ →  │ CalculatedStats│
│ (input)  │    │ (engine)     │    │ (immutable)    │
└──────────┘    └──────────────┘    └───────┬────────┘
                                           │
                    ┌───────────────────────┼───────────────────┐
                    ▼                       ▼                   ▼
            ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
            │ WeaponStats  │     │ Warframe     │     │ Breakdowns   │
            │ (per weapon) │     │ Stats        │     │ (audit trail)│
            └──────────────┘     └──────────────┘     └──────────────┘

HISTORY:
┌──────────┐    ┌──────────┐    ┌──────────┐         ┌──────────┐
│Command 1 │ →  │Command 2 │ →  │Command 3 │ → ... → │Command N │
└──────────┘    └──────────┘    └──────────┘         └──────────┘
     │               │               │                    │
     └───────────────┴───────────────┴────────────────────┘
                             │
                     applies to Loadout
                             │
                             ▼
                     triggers calculate()
                             │
                             ▼
                     UI re-renders
```

---

## 5. Project System

### Directory Structure

```
%APPDATA%/TennoDex/
├── projects/                       # Project root
│   ├── {project-uuid}/
│   │   ├── project.json            # Project metadata + build list
│   │   ├── builds/
│   │   │   ├── {build-uuid}.json   # Individual build file
│   │   │   └── {build-uuid}.json
│   │   ├── autosave/
│   │   │   └── {build-uuid}.json   # Auto-save snapshot
│   │   └── assets/                 # Project-specific assets (future)
│   ├── templates/                  # Build templates
│   │   └── warframe-name.json
│   └── archives/                   # Archived/old projects
├── config.json                     # User preferences
├── window-state.json               # Window size/position
├── cache/
│   ├── images/                     # CDN image cache
│   ├── lottie/                     # Lottie animation cache
│   └── kb/                         # Knowledge Base cache
├── logs/
│   └── app-{date}.log
├── diagnostics/
│   └── tennodex-diagnostics-{date}.zip
└── rivens.json                     # Custom riven mods
```

### Project File

```json
{
  "magic": "TNDX",
  "version": 1,
  "metadata": {
    "created": "2026-07-02T12:00:00.000Z",
    "updated": "2026-07-02T14:30:00.000Z",
    "appVersion": "1.0.0"
  },
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Excalibur Build Collection",
    "description": "My Excalibur builds for Steel Path",
    "tags": ["excalibur", "steel-path", "umbra"],
    "archived": false,
    "builds": [
      {
        "id": "e5f6g7h8-...",
        "name": "Excal Tank",
        "description": "High survival Excalibur for Steel Path",
        "parentBuildId": null,
        "loadout": { ... },
        "config": { ... }
      },
      {
        "id": "i9j0k1l2-...",
        "name": "Excal DPS",
        "description": "Max damage Excalibur",
        "parentBuildId": "e5f6g7h8-...",
        "loadout": { ... },
        "config": { ... }
      }
    ]
  }
}
```

### Multiple Builds Per Project

Each project contains multiple builds (variants) sharing a common theme (e.g., "all Excalibur builds"). Builds within a project can be compared, cloned, and archived.

### Variants

A variant is a build derived from another build. It tracks its parent via `parentBuildId`. Variants support:
- **Fork** — Create a copy of a build to experiment
- **Merge** — Copy specific slots from one variant to another
- **Compare** — Side-by-side comparison of two variants

### Snapshots

Snapshots are automatic checkpoints created before significant changes:
- Before switching builds (snapshot → switch → restore on undo)
- Before major config changes (toggle Steel Path, change enemy)
- Manual snapshots (user-triggered)

### Auto-Save

```
Every 30 seconds:
  ├── Check if buildStore has changes since last snapshot
  ├── If changed:
  │   ├── Serialize current build state
  │   ├── Write to projects/{id}/autosave/{build-id}.json
  │   └── Update lastAutoSave timestamp
  └── If unchanged: skip
```

Auto-save files are deleted on manual save. If the app crashes, the auto-save file is used for recovery.

### Templates

Templates are read-only builds used as starting points:
```
projects/templates/{name}.json
```
- Bundled with the app (updated with app releases)
- Can be created from any build (File → Save as Template)
- Not editable (copy to a project to modify)

### Naming Conventions

```
Project names:   Max 100 chars, free text
Build names:     Max 64 chars, free text
File names:      {uuid}.json (never user-facing)
Project folders: {uuid} (never user-facing)
```

---

## 6. File Formats

### .tndx — Build Export Format

The `.tndx` format is used for sharing individual builds.

```typescript
interface TndxFile {
  magic: 'TNDX';                   // 4-byte ASCII signature
  version: 1;                      // Format version
  metadata: {
    created: string;               // ISO 8601
    appVersion: string;            // SemVer
    author?: string;               // Optional author name
    notes?: string;                // Optional build notes
  };
  data: {
    buildName: string;
    loadout: Loadout;
    config: BuildConfig;
    checksum: string;              // SHA256 of loadout (for validation)
  };
}
```

File extension: `.tndx`
MIME type: `application/x-tennodex-build`

### tndx1: — Clipboard Code Format

Compact format for sharing via clipboard/chat.

```
tndx1:{base64url-encoded JSON}

Format:
  Base64url (no padding) of minified JSON
  Prefix: "tndx1:"
  Max length: ~4KB (fits in a Discord message)

Schema (minified keys):
{
  v: 1,                    // version
  n: "Build Name",         // name
  w: "/Lotus/...",         // warframe uniqueName
  ws: {                    // weapon slots
    p: { i: "...", m: [...], e: "...", ... },  // primary
    s: { ... },                                 // secondary
    m: { ... }                                  // melee
  },
  c: { i: "...", m: [...] },   // companion
  b: [...],                    // buffs
  e: { n: "...", l: 100 }      // enemy config (optional)
}
```

### Project File Format

File: `projects/{uuid}/project.json`
See Section 5 for schema.

### Build File Format (individual)

File: `projects/{uuid}/builds/{build-uuid}.json`

```json
{
  "magic": "TNDX-BUILD",
  "version": 1,
  "metadata": { ... },
  "data": {
    "id": "uuid",
    "name": "Build Name",
    "loadout": { ... },
    "config": { ... }
  }
}
```

Storing builds as individual files enables:
- Read/write one build without loading the entire project
- Git-friendly diffs (if users version control their builds)
- Concurrent access (future cloud sync)

### Config File Format

File: `config.json`

```json
{
  "version": 1,
  "theme": "dark",
  "layoutPreset": "balanced",
  "panelWidths": { "sidebar": 220, "inspector": 300, "drawer": 200 },
  "panelCollapsed": { "sidebar": false, "inspector": false, "drawer": false },
  "autoSaveInterval": 30000,
  "mr": 30,
  "recentFiles": [],
  "lastOpenProject": null,
  "shortcuts": {},
  "telemetryOptIn": false
}
```

### Window State Format

File: `window-state.json`

```json
{
  "version": 1,
  "x": 100,
  "y": 100,
  "width": 1280,
  "height": 800,
  "maximized": false,
  "fullscreen": false
}
```

### Cache Format

Image cache:
```
cache/images/{sha256-of-url}.png
Metadata: cache/images/{sha256-of-url}.json
  { "url": "...", "cachedAt": "...", "expiresAt": "...", "size": 12345 }
```

### Log Format

```
logs/app-2026-07-02.log
[2026-07-02T12:00:00.000Z] [INFO] [DataService] Items loaded: 17267
[2026-07-02T12:00:01.000Z] [INFO] [WindowManager] Window created
[2026-07-02T12:00:05.000Z] [DEBUG] [Engine] calculateBuild() completed in 45ms
```

### Diagnostic Bundle Format

```
diagnostics/tennodex-diagnostics-{date}-{time}.zip
├── logs/
│   ├── app-2026-07-01.log
│   └── app-2026-07-02.log
├── config.json
├── window-state.json
├── system-info.txt
│   ├── OS: Windows 11 Pro 23H2
│   ├── RAM: 32GB
│   ├── GPU: NVIDIA RTX 4080
│   ├── Electron: 28.0.0
│   ├── Overwolf: 0.200.0.0 (if applicable)
│   └── App: 1.0.0
├── last-crash.dmp (if available)
└── projects-index.json (list of projects, no build data)
```

---

## 7. Import / Export Architecture

### Import Sources

| Source | Format | Implementation |
|--------|--------|---------------|
| Clipboard | `tndx1:` string | Parse prefix, base64 decode, validate JSON |
| .tndx file | `.tndx` binary | Read file, parse JSON, validate magic + version |
| Overframe URL | URL | Fetch URL, parse HTML, extract build data |
| Overframe JSON | JSON | Direct JSON import (if user has exported from Overframe) |
| Plain text | Free text | Attempt fuzzy parse (for manual entry) |

### Export Destinations

| Destination | Format | Implementation |
|-------------|--------|---------------|
| Clipboard | `tndx1:` string | Serialize, base64url encode, add prefix, copy |
| .tndx file | `.tndx` binary | Serialize, write with magic + checksum |
| Image | PNG | Render build card, save to file |
| Text | Plain text | Human-readable build summary |
| Markdown | `.md` | Formatted for forums/Reddit |
| Discord | Plain text | `tndx1:` code + formatted summary |

### Import Validation Pipeline

```
Raw input
  │
  ▼
[Format Detector]
  ├── starts with "tndx1:" → Clipboard format
  ├── starts with "{" → JSON format
  ├── starts with "TNDX" → Binary file format
  ├── contains "overframe.gg" → Overframe URL
  └── else → Unknown format → show error
  │
  ▼
[Parser]
  ├── Parse into intermediate BuildData
  ├── Validate all uniqueNames exist in WFCD data
  ├── Validate mod ranks are within bounds
  └── Validate polarity values
  │
  ▼
[Preview]
  ├── Show parsed build to user
  ├── Show warnings (unknown mods, outdated data)
  └── Confirm import
  │
  ▼
[Import]
  ├── Load build into workspace
  ├── Trigger calculation
  └── Show result
```

### Export Pipeline

```
Current build state
  │
  ▼
[Serialize]
  ├── Build Loadout → JSON
  ├── Strip runtime-only data (result, breakdowns)
  ├── Calculate checksum
  └── Format for target destination
  │
  ▼
[Export]
  ├── Clipboard: write to system clipboard
  ├── File: show save dialog, write file
  ├── Image: render SVG → PNG, save/show
  └── Text: format as markdown, copy or save
```

### Overframe Import

```
Overframe URL (https://overframe.gg/build/{id}/)
  │
  ▼
[Fetch]
  ├── Download HTML page
  └── (Future: use Overframe API if available)
  │
  ▼
[Parse HTML]
  ├── Extract warframe name
  ├── Extract weapon names
  ├── Extract mod names + ranks
  ├── Extract arcane names + ranks
  ├── Extract shard colors
  └── Extract helminth ability
  │
  ▼
[Resolve]
  ├── Map names to WFCD uniqueNames
  ├── Mark unresolved items as warnings
  └── Return BuildData
  │
  ▼
[Preview + Import]
```

---

## 8. Asset Database

### Asset Sources

| Source | Type | Access | Update Cadence |
|--------|------|--------|---------------|
| @wfcd/items | Structured game data | npm package | Per Warframe update |
| cdn.warframestat.us | Images (mods, warframes, weapons) | HTTP | On demand + cache |
| Bundled assets | Icons, illustrations, textures | App package | Per app release |
| Knowledge Base | Markdown docs | App package | Per app release |
| Lottie animations | JSON animations | CDN + cache | Per app release |

### Asset Index

```typescript
interface AssetIndex {
  version: number;
  updatedAt: string;
  items: AssetEntry[];
}

interface AssetEntry {
  uniqueName: string;        // WFCD path or internal ID
  name: string;              // Display name
  type: 'warframe' | 'primary' | 'secondary' | 'melee' |
        'companion' | 'mod' | 'arcane' | 'enemy' |
        'icon' | 'illustration' | 'lottie' | 'texture' |
        'kb' | 'font';
  imageName?: string;        // CDN image name
  category: string;          // WFCD category
  subCategory?: string;      // Sub-category for filtering
  tags: string[];
  metadata: Record<string, any>;  // Type-specific data
}
```

### Asset Lifecycle

```
1. APP STARTUP
   ├── Load bundled asset index
   ├── Verify cached assets against index
   └── Queue missing assets for download

2. ON DEMAND
   ├── User navigates to a panel needing an asset
   ├── Check cache → hit (load from cache)
   ├── Check cache → miss (download from CDN)
   ├── Decode image off main thread (createImageBitmap)
   └── Display with blur-up placeholder while loading

3. CACHE CLEANUP
   ├── On startup: remove assets not in current index
   ├── When over limit: LRU eviction
   └── On app update: clear any format-incompatible assets
```

---

## 9. Caching Architecture

### Cache Levels

```
Level 0: In-memory (Zustand stores)
  ├── Build state (current)
  ├── Library data (WFCD items)
  ├── Last calculation result
  ├── Search index
  └── UI state
  Size: ~50MB typical
  Eviction: On app quit (rebuilt on startup)

Level 1: Fast disk cache
  ├── Search index (prebuilt)
  ├── Recent build results
  └── KB content
  Location: cache/index/ or cache/kb/
  Size: ~20MB
  Eviction: On app update

Level 2: Slow disk cache
  ├── CDN images
  ├── Lottie animations
  └── Historical calculation results
  Location: cache/images/, cache/lottie/
  Size: Max 500MB (configurable)
  Eviction: LRU when over limit

Level 3: Bundled (read-only)
  ├── Game data snapshot
  ├── Design System assets
  ├── Core KB entries
  └── App icons
  Location: App resources (read-only)
  Size: ~10MB
  Eviction: Never (updated with app)
```

### Cache Invalidation

| Trigger | Action |
|---------|--------|
| App update | Clear Level 0 + 1. Verify Level 2 index. |
| WFCD data update | Rebuild search index. Clear Level 1. |
| Asset index update | Remove Level 2 entries not in new index. |
| Manual clear | User-triggered (Settings → Clear Cache). Clears all caches except Level 3. |
| Over size limit | LRU eviction from Level 2 until under limit. |

### Cache Compression

```
Level 2 images:  WebP format (if supported) or PNG
Level 2 Lottie:  gzip compressed JSON
Search index:    msgpack or compressed JSON
Logs:            Not compressed (text readability)
```

---

## 10. Search Architecture

### Searchable Content

| Source | Type | Documents | Index Strategy |
|--------|------|-----------|---------------|
| Mods | Equipment | ~1,800 | Prebuilt on data load (Level 1) |
| Warframes | Equipment | ~55 | On-demand (Level 0) |
| Weapons | Equipment | ~500 | On-demand (Level 0) |
| Arcanes | Equipment | ~168 | On-demand (Level 0) |
| Companions | Equipment | ~60 | On-demand (Level 0) |
| Commands | Actions | ~40 | Static (bundled) |
| Knowledge Base | Documentation | ~100 | Prebuilt on data load (Level 1) |
| Builds | User data | Variable | On-demand (iterate project files) |

### Index Structure

```typescript
interface SearchIndex {
  version: number;
  builtAt: string;
  appVersion: string;
  documents: SearchDocument[];
  index: InvertedIndex;           // term → document IDs
  categories: Record<string, number[]>;  // category → document IDs
  aliases: Record<string, string>;       // common misspellings
}

interface SearchDocument {
  id: string;                    // uniqueName or internal ID
  type: 'mod' | 'warframe' | 'weapon' | 'arcane' |
        'companion' | 'command' | 'kb' | 'build';
  name: string;                  // Display name
  keywords: string[];            // Searchable keywords
  category: string;              // Category for grouping
  subCategory?: string;          // Sub-category
  description?: string;          // Short description
  metadata: Record<string, any>; // Type-specific (polarity, rarity, etc.)
}

interface InvertedIndex {
  [term: string]: number[];      // Term → document IDs
}
```

### Search Algorithm

```
1. Normalize query (lowercase, trim, remove special chars)
2. Tokenize query into terms
3. For each term:
   a. Exact match in inverted index → collect document IDs
   b. Prefix match (term + "*") → collect document IDs
   c. Fuzzy match (Levenshtein distance ≤ 2) → collect document IDs
   d. Check aliases → collect document IDs
4. Union all document IDs with scoring:
   - Exact name match: +100
   - Prefix match: +50
   - Fuzzy match: +25
   - Keyword match: +10
   - Category match: +5
5. Sort by score (descending), group by type
6. Return top 50 results
```

### Search Performance Targets

| Metric | Target |
|--------|--------|
| Index build time | <500ms (on data load) |
| Index memory | <10MB |
| Query time (first result) | <50ms |
| Query time (all results) | <100ms |
| Searchable documents | ~2,700 (static) + user builds |

---

## 11. History System

### Undo/Redo Stack

```typescript
interface UndoStore {
  commands: Command[];           // Command history
  currentIndex: number;          // Current position (0 = initial state)
  maxHistory: number;            // Max commands to store (default 100)
}

interface Command {
  id: string;                    // UUID
  type: CommandType;
  timestamp: number;             // Date.now()
  description: string;           // Human-readable ("Place Vitality")
  forward: () => void;           // Apply the command
  inverse: () => void;           // Undo the command
  affectedStats: string[];       // Stats that changed (for delta display)
}

type CommandType =
  | 'SET_EQUIPMENT'
  | 'PLACE_MOD'
  | 'REMOVE_MOD'
  | 'RANK_MOD'
  | 'CHANGE_POLARITY'
  | 'SET_ARCANE'
  | 'SET_SHARD'
  | 'SET_HELMINTH'
  | 'SET_BUFF'
  | 'SET_ENEMY'
  | 'SET_CONFIG'
  | 'SET_AIMING'
  | 'SET_STATUSES'
  | 'SWAP_MODS';
```

### Snapshot System

```
Before every significant operation:
  ├── Take a snapshot of the current loadout
  ├── Store in snapshot ring buffer (last 10)
  └── If operation fails → restore from snapshot

Snapshots are used for:
  - Undo/redo (command stack is the primary mechanism)
  - Auto-recovery on crash (auto-save file)
  - Comparison (marker snapshots for diffing)
```

### Revision History

Each build tracks its lineage:

```
Build V1 (initial)
  └── Build V2 (modified)
       └── Build V3 (current)
```

The `parentBuildId` field tracks the direct ancestor. Combined with snapshots, this enables:
- **Timeline view** — Show all versions of a build
- **Diff view** — Compare any two versions
- **Branch view** — Show forked lineages (future)

---

## 12. Future Cloud Sync

### Architecture (Future, Not Implemented)

```
┌─────────────────┐         ┌─────────────────────┐
│  Local Storage  │         │   Cloud Storage     │
│                 │         │   (AWS S3/DynamoDB) │
│  projects/      │ ◄────► │  /users/{id}/       │
│  config.json    │  sync  │  /projects/{id}/    │
│  rivens.json    │        │  /builds/{id}/      │
└─────────────────┘        └─────────────────────┘
```

### Sync Strategy

- **Last-writer-wins** (v1) — Simple, predictable
- **CRDT-based merge** (v2 future) — Conflict-free for collaborative editing
- **Sync triggers**: On save, on startup, on connection restore
- **Conflict resolution**: If local and remote differ, show conflict dialog:
  - "Keep local"
  - "Accept remote"
  - "Merge" (future, shows diff)

### Data for Sync

```
Projects (full)
  ├── Build files
  └── Project metadata

User preferences (cross-device)
  ├── MR
  ├── Favorites
  ├── Shortcuts
  └── Collections

Rivens (custom riven storage)
```

### Not Synced

```
Cache (rebuilt per device)
Logs (local only)
Window state (device-specific)
Engine data (loaded per device)
```

### Encryption

```
Local: No encryption (files on user's machine)
In transit: TLS 1.3
At rest (cloud): AES-256-GCM with user-provided key (optional)
```

### Privacy

```
- No builds are ever shared without explicit user action
- Cloud sync is opt-in
- User can delete all cloud data at any time
- No data mining. No analytics sync.
```

---

## 13. Migration System

### Version Detection

Every data file includes a `version` field. On load, the app checks:

```
if (file.version < currentVersion) → migrate
if (file.version > currentVersion) → error (newer app required)
if (file.version === currentVersion) → load
```

### Migration Pipeline

```typescript
const MIGRATIONS: Record<string, MigrationFn[]> = {
  'project': [
    migrate_v1_to_v2,
    migrate_v2_to_v3,
    // Future migrations append here
  ],
  'config': [
    migrate_config_v1_to_v2,
  ],
  'tndx': [
    migrate_tndx_v1_to_v2,
  ],
};

function migrate(type: string, data: any, fromVersion: number): any {
  let current = data;
  for (const fn of MIGRATIONS[type].slice(fromVersion)) {
    current = fn(current);
  }
  return current;
}
```

### Migration Rules

1. **Every migration function is idempotent** — running it twice produces the same result
2. **Migration never deletes data** — it transforms or extends, never removes
3. **Migration is synchronous** — completes before the file is loaded
4. **Failed migration raises an error** — the original file is never modified
5. **Migration is validated** — after migration, the result must pass the schema validator

### Rollback

If a migration fails:
1. Keep the original file unchanged
2. Log the error
3. Show user: "This file was created by a newer/older version of TennoDex and could not be loaded."
4. Offer: "Continue with empty build" or "Open in external editor"

### Integrity Checking

On load, every project file is checked:
```
✓ File is valid JSON
✓ File has required fields (magic, version, data)
✓ version is within supported range
✓ All referenced uniqueNames exist in WFCD data
✓ All mod ranks are within max rank
✓ All polarity values are valid
✓ Checksum matches (tndx files only)
```

If integrity check fails:
- Log specific failure
- Show user warning with details
- Attempt to load with warnings (skip invalid entries)
- Offer repair option (remove invalid entries)

---

## 14. Performance Budgets

| Resource | Budget | Notes |
|----------|--------|-------|
| Project file size | <1MB per project | Builds are text JSON, not binary |
| Build file size | <50KB per build | Compact JSON |
| Cache size (disk) | Max 500MB | Configurable |
| Cache size (memory) | Max 70MB | Stores + indexes |
| Search index | <10MB | Inverted index |
| Startup read | <1MB | Config + last project |
| Startup parse | <100ms | JSON parse of last project |
| Auto-save write | <50ms | Async, non-blocking |
| Import parse | <500ms | For tndx1: codes |
| Export serialize | <100ms | For clipboard export |
| Project list load | <500ms | Scan projects directory |

---

## 15. Testing Strategy

### Migration Tests

| Test | Description |
|------|-------------|
| migrate_v1_to_v2 | Load v1 file, verify v2 output |
| migrate_concurrent | Migrate 100 files, verify all succeed |
| migrate_rollback | Verify original file unchanged on failure |
| migrate_idempotent | Run migration twice, verify same result |
| migrate_invalid | Feed invalid version, verify error |

### Import Tests

| Test | Description |
|------|-------------|
| import_tndx1 | Valid code, verify build matches |
| import_tndx1_invalid | Invalid code, verify error |
| import_tndx_file | Valid .tndx file, verify build |
| import_overframe | Overframe URL, verify parsed correctly |
| import_corrupted | Corrupted file, verify graceful error |

### Export Tests

| Test | Description |
|------|-------------|
| export_tndx1 | Export build, verify roundtrip |
| export_tndx_file | Export file, verify magic + checksum |
| export_clipboard | Export to clipboard, verify string format |

### Corruption Tests

| Test | Description |
|------|-------------|
| corrupted_json | Partially written JSON, verify recovery |
| missing_fields | File missing required fields, verify error |
| wrong_version | File with unknown version, verify error |
| bad_checksum | tndx file with wrong checksum, verify error |

### Recovery Tests

| Test | Description |
|------|-------------|
| crash_recovery | Simulate crash, verify auto-save recovery |
| project_recovery | Corrupt project file, verify fallback |
| config_recovery | Corrupt config, verify defaults |

### Stress Tests

| Test | Description |
|------|-------------|
| 1000_builds | Project with 1000 builds, verify load time |
| 100_projects | 100 projects in directory, verify list load time |
| large_cache | Cache at 90% limit, verify LRU eviction |
| deep_lineage | Build with 100 ancestors, verify timeline load |

### Performance Tests

| Test | Target |
|------|--------|
| Load last project | <500ms |
| Auto-save | <50ms |
| Search index build | <500ms |
| Search query | <50ms |
| Import tndx1 | <500ms |
| Export tndx1 | <100ms |
| Migrate 100 files | <1s |

---

## 16. Future Expansion

### Plugin Data (Future)

```typescript
interface PluginData {
  id: string;                    // Plugin UUID
  pluginId: string;              // Plugin manifest name
  version: number;
  data: any;                     // Plugin-specific JSON
}
```

Plugin data is stored alongside build data:
```
projects/{id}/plugin-data/{plugin-id}.json
```

### Marketplace (Future)

Community build sharing would store:
```
/marketplace/
├── builds/{id}.json            # Shared builds
├── collections/{id}.json       # Curated collections
└── ratings/{build-id}.json     # User ratings
```

### AI Assistant Memory (Future)

The AI assistant would store user-specific memory:
```
ai-memory.json
├── frequentlyUsedMods: string[]
├── frequentlyUsedWarframes: string[]
├── userPreferences: Record<string, any>
└── learnedPatterns: any[]
```

---

## 17. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R-01 | Project file corruption from crash during write | Medium | High | Write to temp file, then atomic rename |
| R-02 | WFCD uniqueName changes breaking existing builds | Medium | High | Store uniqueName + name. On load, if name doesn't match, re-resolve. |
| R-03 | JSON file size grows too large for large projects | Low | Medium | Split builds into individual files (already designed) |
| R-04 | Cache directory fills user's disk | Low | Medium | Max 500MB default. Configurable. Warning at 90%. |
| R-05 | Migration run fails on user data | Low | High | Never modify original file on failure. Always rollback. |
| R-06 | Overframe import breaks when website changes | High | Low | Warn on import. Update parser in next release. |
| R-07 | tndx1: code too long for Discord/chat | Low | Medium | Compress with gzip before base64 (future v2) |
| R-08 | Riven data format needs migration | Low | Low | Add version field to rivens.json |

---

## 18. Data Completion Checklist

### File Formats

```
□ .tndx build export format specified
□ tndx1: clipboard code format specified
□ Project file format specified
□ Build file format specified
□ Config file format specified
□ Window state format specified
□ Log format specified
□ Diagnostic bundle format specified
□ Cache metadata format specified
□ All formats include version field
□ All formats include magic bytes (where applicable)
```

### Storage

```
□ Project directory structure specified
□ File naming conventions specified
□ Auto-save mechanism specified
□ Recovery mechanism specified
□ Cache directory structure specified
□ Cache eviction policy specified
□ Config file location specified
□ Log file location + rotation specified
```

### Import/Export

```
□ Clipboard import specified
□ File import specified
□ Overframe import specified
□ Clipboard export specified
□ File export specified
□ Image export specified
□ Markdown export specified
□ Import validation pipeline specified
□ Export pipeline specified
```

### Search

```
□ Search index structure specified
□ Index build strategy specified
□ Search algorithm specified
□ Performance targets specified
□ All searchable content types listed
```

### History

```
□ Undo/redo stack specified
□ Command types listed
□ Snapshot system specified
□ Revision lineage specified
□ Auto-save frequency specified
```

### Migration

```
□ Migration pipeline specified
□ Migration rules defined
□ Rollback strategy specified
□ Integrity checking specified
□ Version detection specified
```

### Testing

```
□ Migration tests specified
□ Import/export tests specified
□ Corruption tests specified
□ Recovery tests specified
□ Stress tests specified
□ Performance tests specified
```

---

*End of Data Platform & Project System Bible*
