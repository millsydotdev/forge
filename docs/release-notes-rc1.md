# Forge v1.0.0-rc.1 — Release Candidate

## About

Forge is a Warframe theory-crafting build planner. Design, optimise, and share weapon and warframe builds.

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| OS | Windows 10/11, macOS 13+, Linux (x64) |
| RAM | 4 GB |
| Storage | 500 MB |
| Display | 1280×720 |
| Internet | Required for initial data load |

## Supported Platforms

| Platform | Status |
|----------|:------:|
| Windows (NSIS installer) | ✅ Verified |
| Windows (portable) | ✅ Verified |
| macOS (DMG) | ⚠️ Requires macOS for verification |
| Linux (AppImage) | ⚠️ Requires Linux for verification |

## Key Features

- **Build Engine**: Full warframe, weapon, companion, helminth calculation
- **Visual Platform**: Presentation model, card rendering, rich tooltips
- **Workspace Architecture**: VS Code-style layout with drawer/inspector/sidebar
- **Enemy Lab**: Configure enemy level, armor strip, health type
- **Provider Framework**: Overwolf integration, auto-sync player inventory
- **Project System**: Save, version, compare builds
- **Export/Import**: `tndx1:` build code format

## Known Issues

1. **Falloff modeling**: Range-based damage falloff is not yet implemented (noted in code for v2)
2. **macOS/Linux packaging**: Verified via webpack; DMG/AppImage testing requires native hardware
3. **Auto-update**: Not yet implemented (planned post-RC)

## Changelog

See `CHANGELOG.md` for the full history.

## Installation

```
git clone https://github.com/forgebuild/forge.git
cd forge
npm ci
npm run build
npm start
```
