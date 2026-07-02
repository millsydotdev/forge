# Build Codec Specification (`tndx1:`)

## Overview

The `tndx1:` codec is a compact, versioned, base64-encoded JSON string representing a complete Warframe build snapshot. It is used for:
- Copy/paste build sharing
- Overframe link import
- Build persistence in IndexedDB

Format: `tndx1:<base64(JSON)>`

## Version

Current version: `v = 1`

## Type Definitions

```typescript
interface EncodedBuild {
  v: 1;                          // Codec version
  mr: number;                    // Mastery Rank (0-30)
  notes: string;                 // Free-text notes
  f?: string;                    // Warframe uniqueName
  a?: [string, number];          // Aura: [uniqueName, rank]
  e?: [string, number];          // Exilus: [uniqueName, rank]
  m?: [string, number][];        // Warframe mods: [[uniqueName, rank], ...]
  p?: Polarity[];                // Warframe slot polarities (10 slots)
  ar?: ([string, number] | null)[]; // Warframe arcanes (2 slots)
  sh?: ({ color: string | null; isTau: boolean } | null)[]; // Archon shards (5-6 slots)
  h?: [string, number];          // Helminth: [donorWarframeId, slotIndex]
  wp?: EncodedWeapon;            // Primary
  ws?: EncodedWeapon;            // Secondary
  wm?: EncodedWeapon;            // Melee
  wg?: EncodedWeapon;            // Arch-gun
  wl?: EncodedWeapon;            // Arch-melee
  c?: EncodedCompanion;          // Companion + weapon
}

interface EncodedWeapon {
  i: string;                     // Weapon uniqueName
  m?: [string, number][];        // Mods: [[uniqueName, rank], ...]
  p?: Polarity[];                // Slot polarities (9 slots)
  ar?: ([string, number] | null)[]; // Arcanes (1-2 slots)
  e?: [string, number];          // Exilus: [uniqueName, rank]
}

interface EncodedCompanion {
  i: string;                     // Companion uniqueName
  t: string;                     // Companion type (sentinel/moa/hound/predasite/vulpaphyla)
  m?: [string, number][];        // Companion mods
  p?: Polarity[];                // Companion slot polarities (8 slots)
  w?: {                          // Companion weapon
    i: string;
    m?: [string, number][];
    p?: Polarity[];
  };
}

type Polarity = 'MADURAI' | 'VAZARIN' | 'NAIRU' | 'UMBRA' | 'PENJAGA' | 'UNIVERSAL';
```

## Field Details

### Warframe (`f`, `a`, `e`, `m`, `p`, `ar`, `sh`)

| Field | Slots | Description |
|-------|-------|-------------|
| `f` | 1 | Warframe uniqueName (e.g., `excalibur-prime`) |
| `a` | 1 | Aura mod + rank |
| `e` | 1 | Exilus mod + rank |
| `m` | 8 | Normal mods (slot order = polarities index 2-9) |
| `p` | 10 | Slot polarities [aura, exilus, mod1...mod8] |
| `ar` | 2 | Warframe arcane pair |
| `sh` | 5-6 | Archon shards (color + isTau) |

### Helminth (`h`)

- `[donorWarframeId, slotIndex]` — donor warframe uniqueName, ability slot index (0-3)

### Weapons (`wp`, `ws`, `wm`, `wg`, `wl`)

| Slot | Key | Arcanes | Exilus |
|------|-----|---------|--------|
| Primary | `wp` | 1 | Yes |
| Secondary | `ws` | 1 | Yes |
| Melee | `wm` | 1 | Yes |
| Arch-gun | `wg` | 0 | No |
| Arch-melee | `wl` | 0 | No |

Each weapon: `i` (id), `m` (mods), `p` (9 polarities), `ar` (arcanes), `e` (exilus)

### Companion (`c`)

- `i` — companion uniqueName
- `t` — type (`sentinel` | `moa` | `hound` | `predasite` | `vulpaphyla`)
- `m`, `p` — companion mods + polarities (8 slots)
- `w` — companion weapon (id, mods, polarities)

### Polarity

`MADURAI` (red), `VAZARIN` (blue), `NAIRU` (gold), `UMBRA` (black), `PENJAGA` (teal), `UNIVERSAL` (white)

Default for missing: `UNIVERSAL`

## Encoding

```typescript
function encode(snapshot: BuildSnapshot): string {
  const output: EncodedBuild = { v: 1, mr: snapshot.mr, notes: snapshot.notes || '' };
  // ... populate fields ...
  return `tndx1:${btoa(JSON.stringify(output))}`;
}
```

## Decoding

```typescript
function decode(code: string): EncodedBuild {
  if (!code.startsWith('tndx1:')) throw new Error('Invalid build code');
  const snapshot = JSON.parse(atob(code.slice(6)));
  if (snapshot.v !== 1) throw new Error('Unknown build version');
  return snapshot as EncodedBuild;
}
```

## Example

```json
{
  "v": 1,
  "mr": 30,
  "f": "excalibur-prime",
  "a": ["growing-power", 5],
  "e": ["primed-animal-instinct", 10],
  "m": [["vitality", 10], ["steel-fiber", 10], ["intensify", 5], ["stretch", 5], ["streamline", 5], ["flow", 5], ["continuity", 5], ["constitution", 5]],
  "p": ["MADURAI", "UNIVERSAL", "MADURAI", "VAZARIN", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL"],
  "ar": [["arcane-energize", 5], ["arcane-grace", 5]],
  "sh": [{"color": "crimson", "isTau": true}, {"color": "azure", "isTau": false}],
  "wp": {"i": "tenet-tetra", "m": [["serration", 10], ["split-chamber", 10], ["vital-sense", 10], ["point-strike", 10], ["vital-sense", 10], ["hammer-shot", 5], ["primed-cryo-rounds", 10], ["galvanized-aptitude", 10]], "p": ["MADURAI", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL"], "ar": [["arcane-deadhead", 5], null], "e": ["primed-firestorm", 10]},
  "c": {"i": "carrier-prime", "t": "sentinel", "m": [["vacuum", 5], ["primed-animal-instinct", 10]], "p": ["UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL"], "w": {"i": "sweeper-prime", "m": [["primed-target-cracker", 10], ["critical-delay", 10]], "p": ["UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL", "UNIVERSAL"]}},
  "notes": "Steel Path endurance"
}
```

## Migration

Future versions (`v > 1`) will:
- Keep `v` as first field
- Decoder checks `v` and migrates or rejects
- Encoder always writes current version

## Implementation

- `src/features/build-planner/services/build-codec.ts`
- `encodeBuild(snapshot)` → string
- `decodeBuild(code)` → EncodedBuild
- `decodeToBuildCore(code, mr)` → BuildCore (for calculation engine)