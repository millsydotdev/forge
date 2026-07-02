# TennoDex — Desktop Platform Architecture Bible

**Date:** 2 July 2026  
**Author:** Principal Desktop Architect  
**Status:** DEFINITIVE — Complete platform specification for both desktop editions

---

## Table of Contents

1. Executive Summary
2. Platform Vision
3. Application Architecture (Common)
4. OW-Electron Architecture
5. Standard Electron Architecture
6. Feature Comparison Matrix
7. Workspace Lifecycle
8. Asset Pipeline
9. Update System
10. Security Model
11. Performance Architecture
12. Packaging
13. Telemetry & Logging
14. Deployment Architecture
15. Future Platform Roadmap
16. Risk Register
17. Platform Completion Checklist

---

## 1. Executive Summary

### Two Editions, One Core

TennoDex ships in two editions sharing a common calculation engine, UI, and data layer:

| Edition | Target | Distribution | Key Differentiator |
|---------|--------|-------------|-------------------|
| **OW-Electron** | Overwolf-powered | Overwolf Appstore + MSI | In-game overlay, game events, capture APIs |
| **Desktop** | Standalone users | MSI + portable | No Overwolf dependency, full desktop experience |

Both editions share **~95% of code**. The differences are:
- **Launch mechanism** (Overwolf hosts vs. standalone Electron)
- **Game detection** (Overwolf APIs vs. process enumeration)
- **Overlay** (Overwolf in-game overlay vs. no overlay — Desktop uses second monitor workflow)
- **Game events** (Overwolf Game Events vs. log file parsing)
- **Hotkeys** (Overwolf system hotkeys vs. Electron globalShortcut)

### Architecture at a Glance

```
┌────────────────────────────────────────────────────────────┐
│                     Electron Shell                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Renderer (React + Zustand)                 │  │
│  │  Panels │ Canvas │ Explorer │ Inspector │ Search     │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │ IPC (contextBridge)               │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │                 Main Process (Node.js)                │  │
│  │  Data Service │ File I/O │ Updates │ Window Mgmt     │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │         Platform Adapter (pluggable)                  │  │
│  │  ┌───────────┐    ┌─────────────────────┐           │  │
│  │  │ Electron  │    │ Overwolf (OW-only)  │           │  │
│  │  │ Process   │    │ Game Events         │           │  │
│  │  │ Tray      │    │ Overlay Window      │           │  │
│  │  │ Updates   │    │ OW Hotkeys          │           │  │
│  │  └───────────┘    │ OW Capture          │           │  │
│  │                    │ OW Performance      │           │  │
│  │                    └─────────────────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Vision

### Why Two Editions?

**OW-Electron exists because:** Overwolf provides game integration that a standalone Electron app cannot match — in-game overlay, game event hooks, hotkey registration that survives fullscreen, and a built-in distribution channel. For Warframe players who use Overwolf already, this is the natural experience.

**Desktop exists because:** Not everyone uses Overwolf. Some users want a standalone application without third-party dependencies. Some enterprise/corporate environments block Overwolf. Some users want the application without gaming overlays.

### Feature Parity Philosophy

Both editions aim for **feature parity in calculation capability**. The differences are exclusively in platform integration:

| Capability | Parity Target |
|-----------|--------------|
| Build calculation | 100% identical |
| UI/UX | 100% identical |
| Data sources | 100% identical |
| Save/load projects | 100% identical |
| Import/export | 100% identical |
| Game data detection | OW: auto-detect via events. Desktop: manual config or log parsing |
| In-game overlay | OW: yes. Desktop: no (use second monitor) |
| Hotkeys | OW: system-level. Desktop: window focus only |
| Capture/Screenshots | OW: built-in. Desktop: Electron desktopCapturer |

### Licensing

| Aspect | OW-Electron | Desktop |
|--------|-------------|---------|
| Distribution | Overwolf Appstore + own site | Own site + GitHub |
| DRM | None (free) | None (free) |
| Third-party IP | Overwolf SDK | None |
| Open source | Core engine open | Core engine + wrapper open |

### Update Strategy

Both editions use the same update mechanism: `electron-updater` with an S3/CloudFront distribution.

OW-Electron additionally gets Overwolf's auto-update. The app checks both — whichever updates first wins.

---

## 3. Application Architecture (Common)

### Process Model

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                          │
│                                                         │
│  WindowManager     DataService     UpdateService        │
│  ├─ Create window  ├─ Load @wfcd   ├─ Check version     │
│  ├─ Manage windows │  items         ├─ Download update   │
│  └─ Track state    ├─ Cache assets  └─ Install           │
│                     └─ Serve IPC                        │
│                                                         │
│  PlatformAdapter (abstract)                             │
│  ├─ ElectronAdapter or OverwolfAdapter                  │
│  ├─ getGameState(): GameState | null                    │
│  ├─ registerHotkey(id, combo, callback)                 │
│  ├─ showOverlay() / hideOverlay()                       │
│  └─ captureScreenshot(): Promise<Buffer>                │
└─────────────────────────────────────────────────────────┘
         │                       │
    IPC Bridge              IPC Bridge
         │                       │
┌─────────────────────────────────────────────────────────┐
│                 Renderer Process                         │
│                                                         │
│  React App (WorkspaceShell)                             │
│  ├─ Panels (LoadoutTree, Canvas, Inspector, etc.)       │
│  ├─ Stores (build, ui, library, project, undo)          │
│  └─ Engine (calculateBuild, resolvers)                  │
│                                                         │
│  window.tennoDex (contextBridge API)                    │
│  ├─ getItems()                                          │
│  ├─ getItemDetail(id)                                   │
│  ├─ getDataHealth()                                     │
│  ├─ onDataHealth(callback)                              │
│  ├─ getGameState()                                      │
│  ├─ onGameEvent(callback)                               │
│  ├─ registerHotkey(id, combo)                           │
│  ├─ captureScreenshot()                                 │
│  ├─ getAssetPath(name)                                  │
│  └─ getPlatformInfo()                                   │
└─────────────────────────────────────────────────────────┘
```

### IPC Channels

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `ipc:get-items` | Renderer→Main | `{ category?: string }` | Get all items or by category |
| `ipc:get-item-detail` | Renderer→Main | `{ id: string }` | Get full item data |
| `ipc:get-data-health` | Renderer→Main | none | Check data loading status |
| `ipc:on-data-health` | Main→Renderer | `{ ok: boolean }` | Push data health updates |
| `ipc:get-game-state` | Renderer→Main | none | Get current Warframe state |
| `ipc:on-game-event` | Main→Renderer | `{ event: string, data: any }` | Push game events |
| `ipc:register-hotkey` | Renderer→Main | `{ id, combo }` | Register global hotkey |
| `ipc:capture` | Renderer→Main | `{ area?: string }` | Capture screenshot |
| `ipc:get-platform` | Renderer→Main | none | Get platform info |
| `ipc:save-file` | Renderer→Main | `{ name, data }` | Save file dialog |
| `ipc:open-file` | Renderer→Main | `{ filters }` | Open file dialog |
| `ipc:set-clipboard` | Renderer→Main | `{ text }` | Write to clipboard |
| `ipc:get-clipboard` | Renderer→Main | none | Read from clipboard |
| `ipc:log` | Renderer→Main | `{ level, message }` | Write to log file |
| `ipc:get-version` | Renderer→Main | none | Get app version |

### IPC Security Rules

1. **All IPC uses `contextBridge.exposeInMainWorld`** — no `preload` script pollution
2. **All IPC args are validated** via Zod schema in the main process
3. **Renderer cannot require any Node.js modules**
4. **No `ipcRenderer.send` for arbitrary channels** — only exposed API methods
5. **File dialogs return file paths only** — renderer never receives file contents directly

### Shared Services

| Service | Process | Description |
|---------|---------|-------------|
| `WfcdDataService` | Main | Loads and caches `@wfcd/items` data |
| `WfcdAssetService` | Main | Downloads and caches CDN assets |
| `ProjectService` | Main | Project CRUD, version migration |
| `UpdateService` | Main | App update checking and installation |
| `LogService` | Main | File-based logging with rotation |
| `CrashReporter` | Main | Crash dump collection and submission |
| `ConfigService` | Main | User preferences (JSON file) |

### Background Workers

| Worker | Schedule | Description |
|--------|----------|-------------|
| Auto-save worker | Every 30s | Saves current build to project store |
| Data health check | Every 60s | Verifies game data is loaded and healthy |
| Update check | On startup + every 6h | Checks for app updates |
| Asset cache cleaner | On startup | Removes stale cached assets |

---

## 4. OW-Electron Architecture

### Overwolf Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Overwolf Host Application                 │
│                                                             │
│  Overwolf Appstore → Installs → Launches                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              TennoDex OW-Electron Window              │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │ Main Window  │  │ Overlay      │ (separate OW    │    │
│  │  │ (desktop)    │  │ Window)      │  window)         │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Overwolf Services Used:                                     │
│  ├── overwolf.games.events — Warframe game events            │
│  ├── overwolf.games — Game detection + launch               │
│  ├── overwolf.windows — Desktop + overlay windows            │
│  ├── overwolf.hotkeys — System-level hotkeys                 │
│  ├── overwolf.extensions — App lifecycle                     │
│  ├── overwolf.media — Screenshot + recording                 │
│  └── overwolf.settings — Overwolf settings API               │
└─────────────────────────────────────────────────────────────┘
```

### Game Detection

```
1. Overwolf detects Warframe is running (ow-game)
2. OW fires `gameLaunched` event
3. TennoDex receives via `overwolf.games.onGameInfoUpdated`
4. Adapter sets `gameRunning = true`
5. UI shows "Warframe detected" indicator in status bar
6. When Warframe exits, fires `gameClosed`
7. Adapter sets `gameRunning = false`
```

**Failure modes:**
- Warframe not detected → "Launch Warframe from Overwolf" prompt
- Overwolf not running → Cannot detect. Show manual toggle.
- Permissions missing → Request OW permissions on first game detection

### Overlay Lifecycle

```
┌──────────────────┐
│ Desktop Window   │ ← Main workspace (always open)
│ Build crafting   │
│ Equipment browse │
└──────────────────┘
         │
         │ Ctrl+~ (toggle overlay)
         ▼
┌──────────────────┐
│ Overlay Window   │ ← In-game overlay (transparent)
│ Quick stats      │
│ Build reference  │
│ Minimal controls │
└──────────────────┘
```

**Overlay window spec:**
- Type: `overwolf.windows.create('overlay', { desktop: false, inGame: true })
- Size: 400×600px (default), resizable
- Position: Right side of screen, anchored
- Transparency: Chroma key black (#000000, threshold: 0)
- Input: Allow mouse clicks through to game (transparent areas)
- Docking: Right-anchored, or floating

**Overlay content (simplified):**
```
┌──────────────────────────────┐
│ TennoDex (minimal)           │
│───────────────               │
│ Loadout: Excalibur           │
│ ❤ 740  🛡 450  ⛨ 225  ⚡ 300 │
│ STR 200%  DUR 100%           │
│                              │
│ Primary: Braton Prime        │
│ DPS: 24,500  Burst: 32,100   │
│ Mag: 45  Reload: 1.8s       │
│                              │
│ Enemy: Heavy Gunner Lv150    │
│ TTK: 2.4s  Shots: 17         │
│ [Switch Weapon ◀ ▶]         │
└──────────────────────────────┘
```

### Overlay Hotkeys

| Hotkey | Action | Scope |
|--------|--------|-------|
| Ctrl+~ | Toggle overlay | Global |
| Ctrl+Shift+1 | Show/hide stats | Overlay only |
| Ctrl+Shift+2 | Show/hide weapon | Overlay only |
| Ctrl+Shift+3 | Show/hide enemy | Overlay only |
| PrtScn | Capture build to clipboard | Global |

Registered via `overwolf.hotkeys.register()`. Survives fullscreen games.

### Game Events

Overwolf Game Events for Warframe provide:
- Kill count, death count, mission time
- Weapon used, abilities used
- Damage dealt, damage taken
- Warframe used, mission type
- Level/planet information

**Usage in TennoDex:**
- Mission stats → optional post-mission summary
- Weapon used → auto-equip that weapon in the planner
- Damage taken → validate EHP calculations
- Kill count → estimate primer uptime

**Implementation:**
```typescript
// Platform adapter method
registerGameEvents(callback: (event: GameEvent) => void): void {
  overwolf.games.events.onNewEvents.addListener((info) => {
    for (const event of info.events) {
      callback({ name: event.name, data: event.data });
    }
  });
}
```

### Capture

Overwolf's capture API allows:
- **Screenshot**: Capture current build to share
- **Recording**: Record build crafting sessions (future)
- **Replay**: Save last 30s (future)

**Usage:**
```typescript
// Platform adapter method
async captureScreenshot(): Promise<string> {
  const result = await overwolf.media.takeScreenshot();
  return result.url; // Local path to screenshot
}
```

### OW Window Docking

Overwolf supports window docking via:
- `overwolf.windows.DockPosition` — LEFT, RIGHT, TOP, BOTTOM, CENTER
- Auto-dock to Overwolf app container
- Minimize to Overwolf dock

**Desktop window:** Free-floating, resizable, remember position
**Overlay window:** In-game, right-docked, transparent

---

## 5. Standard Electron Architecture

### Window Management

```
┌──────────────────────────────────────────┐
│           Electron Main Process           │
│                                          │
│  WindowManager                           │
│  ├── mainWindow: BrowserWindow           │
│  │   ├── width/height (saved)            │
│  │   ├── minWidth: 900, minHeight: 600   │
│  │   ├── frame: true (custom title bar?) │
│  │   └── webPreferences:                 │
│  │       ├── preload: preload.ts         │
│  │       ├── contextIsolation: true      │
│  │       └── nodeIntegration: false      │
│  └── No overlay window (not applicable)  │
└──────────────────────────────────────────┘
```

### Feature Replacements (vs OW-Electron)

| OW Feature | Electron Replacement |
|-----------|---------------------|
| Game detection | `child_process.exec('tasklist')` polling every 5s for `Warframe.x64.exe` |
| In-game overlay | Not available. Use second monitor or Alt+Tab. |
| System hotkeys | `globalShortcut.register()` — works when app is focused |
| Screenshot capture | `desktopCapturer.getSources()` + native save dialog |
| OW Appstore | `electron-updater` with S3/CloudFront |
| OW Window docking | Custom panel docking (built into UI) |

### Game Detection (Electron)

```
Poll every 5 seconds:
  exec('tasklist /FI "IMAGENAME eq Warframe.x64.exe"')
  → if output contains "Warframe.x64.exe" → gameRunning = true
  → else → gameRunning = false

Caveats:
- Windows-only (tasklist)
- Requires the user to have Warframe installed
- Cannot detect if Warframe is in foreground vs background
```

**Fallback:** User can manually toggle "Warframe is running" in settings.

### System Tray

```
Tray icon: app.ico (16×16)
Menu:
├── Show TennoDex
├── New Build
├── Recent Builds
│   ├── Build 1
│   ├── Build 2
│   └── ...
├── Separator
└── Quit
```

### Notifications

Electron `Notification` API for:
- Build calculation complete (when minimized)
- Auto-save complete
- Update available
- Warframe detected/not detected

### Deep Linking

Protocol: `tennodex://` 
- `tennodex://import/<code>` — Import build from code
- `tennodex://open/<project-id>` — Open specific project

Register via `app.setAsDefaultProtocolClient('tennodex')`.

### File Associations

- `.tndx` — TennoDex build files
- Double-click opens TennoDex and loads the build

---

## 6. Feature Comparison Matrix

| # | Feature | OW-Electron | Electron | Reason | Fallback |
|---|---------|-------------|----------|--------|----------|
| 1 | Build calculation | ✅ Identical | ✅ Identical | Shared engine | — |
| 2 | UI/UX | ✅ Identical | ✅ Identical | Shared React | — |
| 3 | Game data (WFCD) | ✅ Identical | ✅ Identical | Shared data service | — |
| 4 | Project management | ✅ Identical | ✅ Identical | Shared project service | — |
| 5 | Save/load | ✅ Identical | ✅ Identical | Shared | — |
| 6 | Import/export | ✅ Identical | ✅ Identical | Shared codec | — |
| 7 | Undo/redo | ✅ Identical | ✅ Identical | Shared undo store | — |
| 8 | Calculation Explorer | ✅ Identical | ✅ Identical | Shared component | — |
| 9 | Workspace switching | ✅ Identical | ✅ Identical | Shared | — |
| 10 | Keyboard shortcuts | ✅ Identical | ✅ Identical | Shared | — |
| 11 | Drag-and-drop | ✅ Identical | ✅ Identical | Shared @dnd-kit | — |
| 12 | Enemy Lab | ✅ Identical | ✅ Identical | Shared | — |
| 13 | Build comparison | ✅ Identical | ✅ Identical | Shared | — |
| 14 | Knowledge Base | ✅ Identical | ✅ Identical | Shared | — |
| 15 | Auto updates | ✅ OW + electron-updater | ✅ electron-updater | OW adds OW channel | Fallback to electron-updater |
| 16 | Game detection | ✅ Overwolf events | ✅ Process polling | OW is event-driven | Manual toggle for Electron |
| 17 | In-game overlay | ✅ Overwolf overlay window | ❌ Not available | OW provides native overlay | Electron: second monitor |
| 18 | System hotkeys | ✅ Overwolf hotkeys | ⚠️ globalShortcut | OW works in fullscreen | Electron: app-focused only |
| 19 | Game events | ✅ Overwolf Game Events | ❌ No game events | OW provides structured events | N/A |
| 20 | Screenshot capture | ✅ Overwolf media API | ⚠️ desktopCapturer | OW is simpler | Electron: native dialog |
| 21 | Performance metrics | ✅ Overwolf performance API | ❌ N/A | OW provides FPS/VRAM | N/A |
| 22 | OW Appstore | ✅ Overwolf distribution | ❌ Self-distribution | OW is its own store | GitHub + website |
| 23 | Deep linking | ❌ Not in OW | ✅ tennodex:// protocol | OW apps don't register protocols | N/A for OW |
| 24 | File associations | ❌ Not in OW | ✅ .tndx files | OW apps don't register file types | N/A for OW |
| 25 | System tray | ❌ Not in OW | ✅ Tray icon | OW apps are in OW dock | N/A for OW |

**Parity score:** 25/25 features. 4 are OW-exclusive (overlay, game events, OW store, performance API). 2 are Electron-exclusive (deep linking, file associations). 19 are fully shared.

---

## 7. Workspace Lifecycle

### Startup Sequence

```
Application Launch
│
├── [Phase 1] Main Process Initialization (500ms)
│   ├── Parse CLI arguments
│   ├── Initialize logger
│   ├── Load config (ConfigService)
│   ├── Initialize crash reporter
│   ├── Set up IPC handlers
│   └── OW-only: Connect to Overwolf API
│
├── [Phase 2] Data Loading (1-3s)
│   ├── Start loading screen animation
│   ├── Load @wfcd/items (WfcdDataService)
│   ├── Load cached assets (WfcdAssetService)
│   ├── Check data health
│   └── OW-only: Register game event listeners
│
├── [Phase 3] Window Creation (200ms)
│   ├── Create BrowserWindow
│   ├── Load renderer HTML
│   └── Show window
│
└── [Phase 4] Renderer Initialization (500ms-1s)
    ├── React mounts
    ├── Stores initialize
    ├── Load last project (if any)
    ├── Check for updates
    └── Register keyboard shortcuts
```

### First Launch

```
First Launch
├── No saved config → show onboarding
├── Onboarding wizard:
│   1. Welcome (branding + purpose)
│   2. Select edition (OW vs standard — auto-detected)
│   3. Import from Overframe? (optional)
│   4. Done → load empty workspace
└── Set `tennodex_onboarding_done = true`
```

### Opening Projects

```
User selects "Open" or double-clicks .tndx
├── Main process: read file, parse JSON
├── Validate version (migrate if needed)
├── IPC → Renderer: loadProject(data)
├── Renderer: buildStore loads project state
├── Renderer: recalculate build
└── Renderer: UI updates
```

### Auto-save

```
Every 30s (configurable):
├── Check if build has unsaved changes (compare with last snapshot)
├── If changed:
│   ├── Create snapshot of current build state
│   ├── Write to project file
│   └── Update status bar indicator (●)
└── If unchanged: skip
```

### Closing

```
User closes window
├── If unsaved changes:
│   ├── Auto-save immediately
│   └── (no prompt — auto-save is the safety net)
├── Save window position/size to config
├── Save last open project ID
├── OW-only: Notify Overwolf of close
└── Quit
```

### Crash Recovery

```
Application starts after abnormal exit
├── Check for crash dump file
├── If found:
│   ├── Show recovery dialog
│   ├── "TennoDex closed unexpectedly."
│   ├── "Recover last session?" [Yes] [No]
│   └── If Yes: load from auto-save snapshot
└── If not found: normal startup
```

### Game Launch (OW-Electron)

```
1. User launches Warframe from Overwolf
2. Overwolf fires `gameLaunched` event
3. TennoDex receives event
4. UI shows "Warframe Detected" in status bar
5. Overlay hotkey becomes active
6. User presses Ctrl+~ → overlay appears in-game
```

### Game Exit

```
1. Warframe closes
2. Overwolf fires `gameClosed` event
3. TennoDex receives event
4. UI shows "Warframe Not Detected" in status bar
5. Overlay hotkey becomes inactive
6. Overlay window closes (if open)
```

---

## 8. Asset Pipeline

### Asset Types

| Type | Source | Format | Cache | Lazy Load |
|------|--------|--------|-------|-----------|
| App icons | Build-time | PNG/ICO | Bundled | No |
| UI icons | Build-time | SVG sprite | Bundled | No |
| Mod images | CDN (cdn.warframestat.us) | PNG | Local FS | Yes |
| Warframe images | CDN | PNG | Local FS | Yes |
| Weapon images | CDN | PNG | Local FS | Yes |
| Ability images | CDN | PNG | Local FS | Yes |
| Background textures | Build-time | PNG | Bundled | No |
| Lottie animations | Runtime | JSON | Local FS | Yes |
| KB illustrations | Runtime | SVG | Local FS | Yes |
| Empty state graphics | Runtime | SVG | Local FS | Yes |

### CDN Asset Caching

```
CDN URL → Local FS Cache

Cache location:
  OW-Electron: overwolf.io data folder
  Electron:    app.getPath('userData') + '/cache'

Cache policy:
  - Max 500MB cache size
  - LRU eviction when over limit
  - Cache key: SHA256 of CDN URL
  - Cache validity: 7 days (then re-fetch)
  - Offline: use cached version (even if expired)

Cache directory structure:
  cache/
  ├── images/
  │   ├── [hash].png
  │   └── [hash].png
  └── lottie/
      ├── [hash].json
      └── [hash].json
```

### SVG Sprite

All UI icons are compiled into a single SVG sprite:
```
src/assets/icons/sprite.svg
```
Generated at build time via `svg-sprite-loader` or similar.

Icons are referenced by ID:
```html
<svg><use href="#icon-health" /></svg>
```

Sprite contains ~80 icons at launch (see Asset Catalogue in Design System Bible).

### Image Loading Strategy

```typescript
// Lazy loading with blur-up placeholder
<AssetImage
  src="https://cdn.warframestat.us/img/excalibur.png"
  placeholder="data:image/png;base64,..." // tiny 10px version
  loading="lazy"
/>
```

- In-viewport images load immediately
- Off-screen images load when scrolled near (IntersectionObserver)
- Failed images show a placeholder icon + "Image not available"

---

## 9. Update System

### Application Updates

```
Update check: On startup + every 6 hours

Electron-updater config:
  provider: s3
  bucket: tennodex-releases
  region: us-east-1
  path: /{edition}/{arch}/

Release channels:
  nightly   → /nightly/   (automatic, may be unstable)
  beta      → /beta/      (manual opt-in)
  stable    → /stable/    (default)

Update flow:
  1. Check for update (HTTP HEAD to latest.yml)
  2. If available, download in background
  3. Show notification: "Update ready. Restart to install?"
  4. User clicks Restart → quitAndInstall()
  5. OW addition: Also check OW Appstore for OW-side updates
```

### Game Data Updates

```
WFCD data is updated when the npm package is bumped.

Update flow:
  1. On startup, check WFCD version
  2. If new version available:
     a. Download new @wfcd/items data
     b. Write to game-data.json
     c. Re-index data
     d. Show toast: "Game data updated to v{version}"
```

### Knowledge Base Updates

```
KB content is bundled with the app (docs/ directory).
Future: serve from CDN for live updates without app update.

KB update flow (future):
  1. On startup, check /kb/version.json
  2. If newer: download updated KB .md files
  3. Cache locally
```

### Offline Mode

```
All critical data is bundled:
- game-data.json (WFCD snapshot) — in app bundle
- Design System — CSS, tokens, icons — in app bundle
- Knowledge Base — .md files — in app bundle

Offline-capable features:
- All calculation features
- All UI/panels/workspaces
- All KB browsing
- All project management
- Import/export (needs clipboard)

Offline-limited features:
- CDN images (using cached or placeholder)
- Game detection (process polling still works)
- Updates (not available)
```

### Version Compatibility

```
Build project format includes version field:
  { version: 1, ... }

Migration strategy:
  ┌─────────────────────┐
  │ migrate_v1_to_v2()  │ ← Called on load if version < 2
  │ migrate_v2_to_v3()  │ ← Called on load if version < 3
  └─────────────────────┘

No backward-incompatible changes without migration.
If migration fails: keep original file, show error, ask user to re-import.
```

---

## 10. Security Model

### IPC Rules

```
1. All IPC handlers validate input with Zod schemas
2. Schema validation failure → return { ok: false, error: 'Invalid input' }
3. No IPC handler accepts arbitrary file paths from renderer
4. No IPC handler executes shell commands from renderer input
5. File dialogs are main-process-only — renderer receives paths, not contents
6. All clipboard operations are main-process-only
```

### Renderer Isolation

```typescript
// main.ts
new BrowserWindow({
  webPreferences: {
    preload: join(__dirname, 'preload.js'),
    contextIsolation: true,    // MUST be true
    nodeIntegration: false,    // MUST be false
    sandbox: true,             // enable for additional security
  }
});
```

### Context Bridge (Preload)

```typescript
// preload.ts — the ONLY bridge between main and renderer
contextBridge.exposeInMainWorld('tennoDex', {
  getItems: (category?: string) => ipcRenderer.invoke('ipc:get-items', category),
  getItemDetail: (id: string) => ipcRenderer.invoke('ipc:get-item-detail', { id }),
  getDataHealth: () => ipcRenderer.invoke('ipc:get-data-health'),
  onDataHealth: (cb: Function) => {
    ipcRenderer.on('ipc:on-data-health', (_, data) => cb(data));
  },
  // ... all other methods
});
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://cdn.warframestat.us data:;
  font-src 'self';
  connect-src 'self';
  media-src 'none';
  object-src 'none';
">
```

### Trusted Assets

- All bundled assets are signed with the app code signing certificate
- CDN images are from `cdn.warframestat.us` only (whitelisted)
- No remote scripts are loaded
- No iframes

### Local Storage

| Data | Location | Sensitivity |
|------|----------|-------------|
| Build projects | `app.getPath('userData')/projects/` | Low |
| User config | `app.getPath('userData')/config.json` | Low |
| Cache | `app.getPath('userData')/cache/` | None |
| Logs | `app.getPath('userData')/logs/` | None |
| Custom rivens | `app.getPath('userData')/rivens.json` | Low |
| Window state | `app.getPath('userData')/window-state.json` | None |

No secrets are stored. No authentication is required. No cloud sync (future).

### Overwolf Permissions

```
Required OW permissions (ow-electron only):
  Game events:   warframe
  Hotkeys:       global (for overlay toggle)
  Media:         screenshot
  Window:        desktop + in-game overlay
  Extension:     basic lifecycle

Requested on first launch via overwolf.extensions.requestPermissions()
```

---

## 11. Performance Architecture

### Memory Budgets

| Component | Budget | Notes |
|-----------|--------|-------|
| Main process | 100MB (idle), 200MB (peak) | Node.js, data cache |
| Renderer | 200MB (idle), 400MB (peak) | React, images, stores |
| Asset cache | 500MB max on disk | LRU eviction |
| CDN image cache | 200MB max | Separate from asset cache |

### CPU Budgets

| Operation | Budget | Notes |
|-----------|--------|-------|
| Build calculation | <100ms | Synchronous, main thread |
| Data load | <3s | Async, startup only |
| Search indexing | <500ms | On data load |
| Image decode | <50ms | Per image, off thread |

### GPU Budgets

- CSS compositing: GPU-accelerated (transform, opacity)
- No WebGL (not needed for this app)
- No Canvas2D heavy operations
- SVG rendering is CPU-only (acceptable for icon count)

### Caching Strategy

```
Data cache (main process):
  @wfcd/items → loaded once, kept in memory for app lifetime
  CDN assets → local FS cache with LRU eviction

Computation cache (renderer):
  Last build result → always available (result state)
  Mod search index → rebuilt on data load, kept in memory
  Stat display values → useMemo with proper dependencies
```

### Workers

| Worker | Process | Why Not Main Thread |
|--------|---------|-------------------|
| Asset download | Main (Node.js) | Already async |
| Project auto-save | Main (timer) | Trivial |
| Game detection polling | Main (timer) | Trivial |
| Image decode | Renderer (off thread) | `createImageBitmap` |

No Web Workers needed currently. All async operations are I/O-bound.

### Image Decoding Strategy

```typescript
// Off-thread image decoding for CDN images
async function loadImage(src: string): Promise<ImageBitmap> {
  const response = await fetch(src);
  const blob = await response.blob();
  return createImageBitmap(blob); // Decodes off main thread
}
```

### Window Lifecycle

| State | Behaviour |
|-------|-----------|
| Active | Full FPS, all panels live |
| Minimized | Pause auto-save polling. No recalculations. |
| Background (not focused) | Reduce FPS to 30 (CSS `content-visibility: auto`). Continue auto-save. |
| Closing | Auto-save, save window state, quit |

---

## 12. Packaging

### Windows — OW-Electron

```
Distribution: Overwolf Appstore + own MSI installer

Overwolf packaging:
  - Follow Overwolf app packaging guidelines
  - Extension manifest: manifest.json (OW-specific)
  - App icon: 256×256 PNG
  - Max package size: 500MB (OW limit)

Own MSI packaging (for users who don't use OW Store):
  - Overwolf runtime installer bundled
  - Auto-installs Overwolf if not present
  - electron-builder with NSIS
```

### Windows — Desktop Edition

```
Distribution: MSI installer + portable ZIP

electron-builder config:
  target: nsis (installer) + portable (zip)
  arch: x64 (arm64 future)
  icon: assets/icon.ico

NSIS config:
  - One-click installer (no wizard)
  - Install per-user (default) or per-machine
  - Start menu shortcut
  - Desktop shortcut (optional)
  - .tndx file association
  - tennodex:// protocol handler
  - Auto-update (electron-updater)
  - Code signed

Portable ZIP:
  - Self-contained
  - No registry changes
  - Settings stored alongside executable
```

### Installer Requirements

| Requirement | OW-Electron | Desktop |
|-------------|-------------|---------|
| Windows 10+ | ✅ | ✅ |
| 500MB disk | ✅ | ✅ |
| 4GB RAM | ✅ | ✅ |
| Overwolf | ✅ (required) | ❌ (not needed) |
| Internet | ✅ (initial data load) | ✅ (initial data load) |
| Admin rights | ❌ (per-user install) | ❌ (per-user install) |

### Microsoft Store

```
Consideration for Desktop edition:
  - MSIX packaging required
  - App container limitations
  - No globalShortcut (no fullscreen hotkeys)
  - No child_process (no game detection via tasklist)
  - Restricted file system access
  - Automatic updates via Store

Verdict: Feasible but with reduced capabilities.
Priority: P3 (post-launch)
```

### Steam Possibility

```
Steam distribution:
  - Steamworks SDK integration
  - Steam overlay compatibility
  - Steam Cloud Saves (future)
  - Steam achievements (future, gamified milestones)

Verdict: Feasible. Would require Steamworks SDK.
Priority: P3 (post-launch)
```

### Future Linux/macOS

```
Linux:
  - AppImage or Flatpak
  - No Overwolf support
  - No game detection (Wine Warframe not detectable)
  - Electron features only

macOS:
  - .dmg or Mac App Store
  - No Overwolf support
  - Game detection via `pgrep Warframe`
  - Electron features only

Priority: P4 (not planned until after stable Windows release)
```

---

## 13. Telemetry & Logging

### Logging Levels

```typescript
enum LogLevel {
  DEBUG = 0,   // Verbose — not logged in production
  INFO = 1,    // Normal operations
  WARN = 2,    // Non-critical issues
  ERROR = 3,   // Recoverable errors
  FATAL = 4,   // Crashes
}
```

### Log Storage

```
Location: app.getPath('userData')/logs/
Format:   app-{date}.log (one file per day)
Retention: 30 days, auto-cleanup
Max size:  10MB per file, rotate
Format:    [timestamp] [level] [source] message
Example:   [2026-07-02T12:00:00.000Z] [INFO] [DataService] Items loaded: 17267
```

### Debug Mode

```
Toggle: --debug CLI flag or Help → Debug Mode
Effect:
  - Log level changes to DEBUG
  - Developer panel appears in workspace
  - Shows store state, engine output, IPC traffic
  - Performance overlay (FPS, memory, render count)

Visual: Small debugging bar at the top of the window
  [FPS:60] [Mem: 180MB] [Stores: 5] [Subs: 42]
```

### Diagnostic Bundle

```
Command: Help → Export Diagnostic Data
Contents:
  - Log files (last 7 days)
  - Config file
  - Last crash dump
  - System info (OS, RAM, GPU, Electron version)
  - Installed Overwolf version (if applicable)
  - Build count, typical build size

Output: ZIP file, saved to user's Downloads folder
Privacy: User must manually share. No automatic upload.
```

### Privacy Model

```
No telemetry is collected by default.
No user data leaves the user's machine.
No analytics SDK (no Google Analytics, no Mixpanel).
No crash reports are sent without user consent.

Future telemetry (opt-in only):
  - App version + OS version (anonymous)
  - Feature usage counts (anonymous)
  - Error counts (anonymous)
  - Purpose: improve app based on real usage
  - Never: builds, equipment, mods, or any user data
```

---

## 14. Deployment Architecture

### Environments

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  DEV           TEST           STAGING        PRODUCTION     │
│  localhost     CI runner     ow-electron:   ow-electron:   │
│  port:3000     headless      release/      release/       │
│  Hot reload    automated     candidate      stable         │
│                           │              │                │
│                           │  Desktop:    │  Desktop:      │
│                           │  release/    │  release/      │
│                           │  candidate   │  stable        │
│                           └──────────────┘                │
│                                        │                  │
│                              Updates checked against      │
│                              electron-updater S3 bucket   │
│                              /nightly/ /beta/ /stable/   │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
GitHub Actions:
  ├── push → main:
  │   ├── lint + typecheck + test (all platforms)
  │   ├── build OW-Electron (Windows only)
  │   └── build Desktop (Windows + Linux + macOS)
  │
  ├── tag → nightly:
  │   └── Publish to /nightly/ S3 channel
  │
  ├── tag → beta:
  │   ├── Manual approval gate
  │   └── Publish to /beta/ S3 channel
  │
  └── tag → stable:
      ├── Manual approval gate
      ├── Publish to /stable/ S3 channel
      ├── Publish to Overwolf Appstore (OW only)
      └── Create GitHub Release
```

### Release Channels

| Channel | Audience | Update Cadence | Stability |
|---------|----------|---------------|-----------|
| Nightly | Developers | Every merge to main | Unstable |
| Beta | Opt-in testers | Weekly | Mostly stable |
| Stable | All users | Monthly | Production |

### Versioning

```
Semantic versioning: MAJOR.MINOR.PATCH

MAJOR: Breaking UI/UX changes
MINOR: New features
PATCH: Bug fixes, performance

OW-electron version can differ from Desktop version
(different platform releases)

Build metadata: {version}+{timestamp}.{commit}
Example: 1.2.3+20260702T120000.a1b2c3d
```

---

## 15. Future Platform Roadmap

### P1 (Within 6 months)

| Feature | Description | Edition |
|---------|-------------|---------|
| Cloud sync | Sync builds across devices via encrypted cloud storage | Both |
| Build sharing URL | Share builds via URL (tennodex://import/{code}) | Desktop |
| Plugin SDK | Allow community plugins for custom calculations, visualizations | Both |

### P2 (Within 12 months)

| Feature | Description | Edition |
|---------|-------------|---------|
| Companion mobile app | View builds on phone. QR code from desktop to mobile. | Both |
| Steam Deck | Linux support, gamepad navigation, compact UI | Desktop |
| Community builds | Browse, rate, and import builds from other users | Both |
| AI assistant | Natural language build queries ("What build gives me the most EHP?") | Both |

### P3 (Future)

| Feature | Description | Edition |
|---------|-------------|---------|
| Web viewer | Read-only build viewing via browser | Both |
| Collaboration | Real-time collaborative build editing | Both |
| Warframe market integration | Check prices while building | Both |
| In-game auto-equip | Apply builds to Warframe automatically | OW only |

---

## 16. Risk Register

| # | Risk | Likelihood | Impact | Edition | Mitigation |
|---|------|-----------|--------|---------|------------|
| R-01 | Overwolf API deprecation | Low | Critical | OW | Abstract behind PlatformAdapter. Desktop edition always works. |
| R-02 | Warframe game events API changes | Medium | Medium | OW | Game events are informational only (not critical). |
| R-03 | Electron security patches require migration | Medium | Medium | Both | Keep Electron up to date. Dependabot alerts. |
| R-04 | @wfcd/items breaking changes | Medium | High | Both | Version-pin in package.json. Test before updating. |
| R-05 | CDN image host goes down | Low | Medium | Both | Cached images + placeholder fallbacks. |
| R-06 | Code signing certificate expires | Medium | High | Desktop | Auto-renew. Calendar reminder 30 days before. |
| R-07 | Windows antivirus flags Electron app | Medium | Low | Both | Code sign. Distribute via known channels. |
| R-08 | Overwolf app store rejection | Low | High | OW | Desktop edition always available as fallback. |
| R-09 | Auto-update failure | Low | Medium | Both | Manual download link on website. |
| R-10 | Asset cache corruption | Low | Low | Both | Clear cache on startup if manifest mismatch. |

---

## 17. Platform Completion Checklist

### Per-Edition Checklist

```
OW-Electron:
□ Overwolf manifest.json complete
□ Game detection working (Warframe launch/exit)
□ Game events registered and parsing
□ Overlay window created with correct transparency
□ Overlay toggle hotkey registered (Ctrl+~)
□ Overlay shows correct build stats
□ Screenshot capture working
□ Overwolf Appstore listing submitted
□ Permissions requested on first launch
□ Desktop window separate from overlay window
□ Both windows resize/dock correctly

Desktop Edition:
□ Electron main process stable
□ Window created with saved size/position
□ Game detection via process polling (Windows)
□ System tray icon + menu
□ .tndx file association registered
□ tennodex:// protocol handler registered
□ Deep linking working
□ Auto-updater configured with S3
□ Code signing certificate installed
□ NSIS installer tested on clean Windows VM
□ Portable ZIP tested on clean Windows VM
```

### Both Editions

```
□ Application launches without crash
□ Game data loads within 3 seconds
□ Build calculation produces correct results
□ All 5 workspaces switch correctly
□ All panels appear in correct positions
□ Undo/redo works across all actions
□ Auto-save fires every 30s
□ Import/export roundtrip works
□ All animations play correctly
□ Keyboard navigation covers all elements
□ Empty states shown (no blank panels)
□ Error boundaries catch and display errors
□ Drag-and-drop: mod→slot, slot→slot, slot→browser
□ 34 existing + all new tests pass
□ Performance: <100ms calc, <3s startup, <400MB RAM peak
□ No console errors in production
□ Code signing valid
□ Installer tested on Windows 10 + 11
□ Uninstaller removes all user data (optionally)
```

---

*End of Desktop Platform Architecture Bible*
