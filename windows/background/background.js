const GAME_ID = 8954;
const MAIN_WIN = 'main';
const EE_LOG_PATH = `${overwolf.io.paths.localAppData}\\Warframe\\EE.log`;
const POLL_MS = 2000;
const REQUIRED_FEATURES = ['match_info', 'game_info'];
const SET_FEATURES_RETRIES = 30;
const SET_FEATURES_DELAY_MS = 3000;

let lastFileSize = 0;
let gepRegistered = false;
let lastInventorySig = '';

function ensureMainWindow() {
  overwolf.windows.obtainDeclaredWindow(MAIN_WIN, (result) => {
    if (result.success) {
      overwolf.windows.restore(MAIN_WIN);
    } else {
      overwolf.windows.create(MAIN_WIN);
    }
  });
}

// ── GEP: Game Events Provider ──────────────────────
// Warframe GEP provides:
//   match_info.inventory  — full player inventory (ItemType Lotus paths + ItemCount)
//   match_info.highlighted — currently viewed item in Arsenal
//   game_info.username    — player display name

function setRequiredFeatures(features, retriesLeft) {
  overwolf.games.events.setRequiredFeatures(features, (result) => {
    if (!result || !result.success) {
      if (retriesLeft > 0) {
        setTimeout(() => setRequiredFeatures(features, retriesLeft - 1), SET_FEATURES_DELAY_MS);
      }
      return;
    }
    gepRegistered = true;
  });
}

function normalizeLotusPath(path) {
  if (!path || typeof path !== 'string') return null;
  let p = path.trim();
  if (!p) return null;
  if (p[0] !== '/') p = '/' + p;
  return p;
}

// Recursively extract every ItemType value from the inventory payload.
// The GEP inventory is a large JSON object mixing scalars, nested bins,
// and item entries shaped like { ItemCount, ItemType }.
function extractItemTypes(obj, out) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const entry of obj) extractItemTypes(entry, out);
    return;
  }
  if (typeof obj.ItemType === 'string') {
    const normalized = normalizeLotusPath(obj.ItemType);
    if (normalized) out.add(normalized);
  }
  for (const key of Object.keys(obj)) {
    if (key === 'ItemType') continue;
    const val = obj[key];
    if (val && typeof val === 'object') extractItemTypes(val, out);
  }
}

// ── Equipped loadout extraction ───────────────────
// Warframe's inventory JSON groups equipment into category arrays.
// Each equipment entry can carry a Config with Mods, ArchonCrystalUpgrades,
// and Abilities (helminth). We try to find the currently-equipped item per
// category and build a structured loadout the React app can apply directly.

const SUIT_KEYS = ['Suits', 'SuitBin', 'Warframes'];
const PRIMARY_KEYS = ['LongGuns', 'Rifles', 'PrimaryWeapons'];
const SECONDARY_KEYS = ['Pistols', 'SecondaryWeapons'];
const MELEE_KEYS = ['Melee', 'MeleeWeapons'];
const SENTINEL_KEYS = ['Sentinels', 'Companions', 'Pets'];
const SENTINEL_WEAPON_KEYS = ['SentinelWeapons', 'CompanionWeapons'];

function findCategoryArray(inv, keys) {
  for (const k of keys) {
    if (Array.isArray(inv[k])) return inv[k];
    if (inv[k] && Array.isArray(inv[k].Items)) return inv[k].Items;
  }
  return null;
}

function isEquipped(item) {
  if (!item) return false;
  if (item.Equipped === true || item.equipped === true) return true;
  if (item.Features && /equipped/i.test(String(item.Features))) return true;
  return false;
}

// Extract the first equipped item (or first with a Config) from a category array
function extractEquippedFromCategory(arr) {
  if (!Array.isArray(arr)) return null;
  // Prefer items flagged as equipped
  let equipped = arr.find(isEquipped);
  // Fall back to first item that has a Config
  if (!equipped) equipped = arr.find(i => i && i.Config);
  if (!equipped) return null;
  const type = normalizeLotusPath(equipped.ItemType);
  if (!type) return null;
  return { type, config: equipped.Config || null, raw: equipped };
}

// Map Warframe API ArchonCrystalUpgrades to our ShardColor type
function mapArchonShard(crystal) {
  if (!crystal) return null;
  const t = String(crystal.UpgradeType || crystal.Color || crystal.color || '').toLowerCase();
  if (!t) return null;
  let color = null;
  if (t.includes('crimson') || t.includes('asparity') || t.includes('strength')) color = 'crimson';
  else if (t.includes('azure') || t.includes('empathy') || t.includes('armor') || t.includes('health')) color = 'azure';
  else if (t.includes('amber') || t.includes('energy') || t.includes('orb')) color = 'amber';
  else if (t.includes('violet') || t.includes('critical') || t.includes('crit')) color = 'violet';
  else if (t.includes('topaz') || t.includes('topas')) color = 'topaz';
  else if (t.includes('emerald') || t.includes('melee')) color = 'emerald';
  if (!color) return null;
  const isTau = !!(crystal.IsTau || crystal.tau || /tau/i.test(t));
  return { color, isTau };
}

function extractShards(config) {
  if (!config) return [];
  const crystals = config.ArchonCrystalUpgrades || config.ArchonCrystals || config.Crystals;
  if (!Array.isArray(crystals)) return [];
  const shards = crystals.slice(0, 5).map(mapArchonShard);
  while (shards.length < 5) shards.push(null);
  return shards;
}

// Extract mods from a Config — returns array of { uniqueName, rank? }
function extractModsFromConfig(config) {
  if (!config) return [];
  const modsRaw = config.Mods || config.UpgradeRefs || config.ModRefs;
  if (!Array.isArray(modsRaw)) return [];
  return modsRaw
    .filter(m => m) // skip null/empty slots
    .map(m => {
      if (typeof m === 'string') return { uniqueName: normalizeLotusPath(m), rank: null };
      if (m.ItemType) return { uniqueName: normalizeLotusPath(m.ItemType), rank: m.Rank ?? m.rank ?? null };
      return null;
    })
    .filter(Boolean);
}

// Extract arcanes from a Config
function extractArcanesFromConfig(config) {
  if (!config) return [null, null];
  const arcs = config.Artifacts || config.Arcanes || config.ArcaneRefs;
  if (!Array.isArray(arcs)) return [null, null];
  const result = [null, null];
  for (let i = 0; i < Math.min(2, arcs.length); i++) {
    const a = arcs[i];
    if (!a) continue;
    if (typeof a === 'string') result[i] = { uniqueName: normalizeLotusPath(a), rank: 0 };
    else if (a.ItemType) result[i] = { uniqueName: normalizeLotusPath(a.ItemType), rank: a.Rank ?? a.rank ?? 0 };
  }
  return result;
}

function extractEquippedLoadout(inv) {
  if (!inv || typeof inv !== 'object') return null;

  const loadout = { warframe: null, weapons: {}, companion: null };

  // Warframe (Suits)
  const suits = findCategoryArray(inv, SUIT_KEYS);
  const wfEq = extractEquippedFromCategory(suits);
  if (wfEq) {
    const mods = extractModsFromConfig(wfEq.config);
    const arcanes = extractArcanesFromConfig(wfEq.config);
    const shards = extractShards(wfEq.config);
    // Aura is typically the first mod or in config.Aura
    const auraRaw = wfEq.config?.Aura || wfEq.config?.AuraMod;
    const aura = auraRaw ? { uniqueName: normalizeLotusPath(typeof auraRaw === 'string' ? auraRaw : auraRaw.ItemType), rank: null } : null;
    // Exilus is in config.ExilusMod or similar
    const exilusRaw = wfEq.config?.ExilusMod || wfEq.config?.Exilus;
    const exilus = exilusRaw ? { uniqueName: normalizeLotusPath(typeof exilusRaw === 'string' ? exilusRaw : exilusRaw.ItemType), rank: null } : null;
    // Regular mods (skip first if it's the aura)
    const normalMods = aura ? mods.slice(1) : mods;
    // Helminth ability
    const abilities = wfEq.config?.Abilities || wfEq.config?.AbilityOverride;
    const helminthDonor = abilities && Array.isArray(abilities) && abilities.length > 0
      ? normalizeLotusPath(typeof abilities[0] === 'string' ? abilities[0] : abilities[0]?.ItemType) : null;

    loadout.warframe = {
      id: wfEq.type,
      aura, exilus,
      mods: normalMods.map(m => ({ uniqueName: m.uniqueName, rank: m.rank ?? 0 })),
      arcanes: arcanes.map(a => a ? { uniqueName: a.uniqueName, rank: a.rank } : null),
      shards: shards.map(s => s || { color: null, isTau: false }),
      helminthDonor,
    };
  }

  // Primary (LongGuns)
  const primaries = findCategoryArray(inv, PRIMARY_KEYS);
  const priEq = extractEquippedFromCategory(primaries);
  if (priEq) {
    loadout.weapons.primary = {
      id: priEq.type,
      mods: extractModsFromConfig(priEq.config).map(m => ({ uniqueName: m.uniqueName, rank: m.rank ?? 0 })),
      arcanes: extractArcanesFromConfig(priEq.config).map(a => a ? { uniqueName: a.uniqueName, rank: a.rank } : null),
    };
  }

  // Secondary (Pistols)
  const secondaries = findCategoryArray(inv, SECONDARY_KEYS);
  const secEq = extractEquippedFromCategory(secondaries);
  if (secEq) {
    loadout.weapons.secondary = {
      id: secEq.type,
      mods: extractModsFromConfig(secEq.config).map(m => ({ uniqueName: m.uniqueName, rank: m.rank ?? 0 })),
      arcanes: extractArcanesFromConfig(secEq.config).map(a => a ? { uniqueName: a.uniqueName, rank: a.rank } : null),
    };
  }

  // Melee
  const melees = findCategoryArray(inv, MELEE_KEYS);
  const melEq = extractEquippedFromCategory(melees);
  if (melEq) {
    loadout.weapons.melee = {
      id: melEq.type,
      mods: extractModsFromConfig(melEq.config).map(m => ({ uniqueName: m.uniqueName, rank: m.rank ?? 0 })),
      arcanes: extractArcanesFromConfig(melEq.config).map(a => a ? { uniqueName: a.uniqueName, rank: a.rank } : null),
    };
  }

  // Companion (Sentinels)
  const sentinels = findCategoryArray(inv, SENTINEL_KEYS);
  const sentEq = extractEquippedFromCategory(sentinels);
  if (sentEq) {
    loadout.companion = {
      id: sentEq.type,
      mods: extractModsFromConfig(sentEq.config).map(m => ({ uniqueName: m.uniqueName, rank: m.rank ?? 0 })),
    };
  }

  // Companion weapon
  const sentWeapons = findCategoryArray(inv, SENTINEL_WEAPON_KEYS);
  const sentWepEq = extractEquippedFromCategory(sentWeapons);
  if (sentWepEq && loadout.companion) {
    loadout.companion.weaponId = sentWepEq.type;
    loadout.companion.weaponMods = extractModsFromConfig(sentWepEq.config).map(m => ({ uniqueName: m.uniqueName, rank: m.rank ?? 0 }));
  }

  // Only return if we found at least a warframe
  if (!loadout.warframe) return null;
  return loadout;
}

function handleInfoUpdate(info) {
  if (!info || !info.info) return;

  // match_info.inventory — full player inventory
  const invRaw = info.info.match_info?.inventory ?? info.info.game_info?.inventory;
  if (invRaw) {
    try {
      const parsed = typeof invRaw === 'string' ? JSON.parse(invRaw) : invRaw;
      const uniqueNames = new Set();
      extractItemTypes(parsed, uniqueNames);

      // Extract equipped loadout (warframe + mods + arcanes + shards + weapons + companion)
      const loadout = extractEquippedLoadout(parsed);

      // Dedupe via signature so we don't spam the main window
      const sig = [...uniqueNames].sort().join('|') + '::' + (loadout ? JSON.stringify(loadout) : '');
      if (sig === lastInventorySig) return;
      lastInventorySig = sig;

      // Send owned items for inventory tracking
      if (uniqueNames.size > 0) {
        overwolf.windows.sendMessage(MAIN_WIN, 'inventory-update', {
          uniqueNames: [...uniqueNames],
          source: 'gep',
        });
      }

      // Send equipped loadout for build application
      if (loadout) {
        overwolf.windows.sendMessage(MAIN_WIN, 'loadout-update', loadout);
      }
    } catch (e) {
      // payload wasn't valid JSON — ignore silently
    }
  }

  // match_info.highlighted — currently viewed item in Arsenal
  const hiRaw = info.info.match_info?.highlighted;
  if (hiRaw) {
    try {
      const hi = typeof hiRaw === 'string' ? JSON.parse(hiRaw) : hiRaw;
      const name = hi?.name ?? hi?.uniqueName;
      if (name) {
        overwolf.windows.sendMessage(MAIN_WIN, 'highlighted-item', {
          uniqueName: normalizeLotusPath(name),
          rivenDetails: hi?.riven_details ?? [],
          source: 'gep',
        });
      }
    } catch (e) {
      // ignore
    }
  }

  // game_info.username — player name
  const username = info.info.game_info?.username;
  if (username) {
    overwolf.windows.sendMessage(MAIN_WIN, 'player-name', { name: username });
  }
}

function handleNewEvents(events) {
  if (!events || !events.events) return;
  for (const e of events.events) {
    // Forward any new game events to the main window for future use
    overwolf.windows.sendMessage(MAIN_WIN, 'game-event', {
      name: e.name,
      data: e.data,
    });
  }
}

function handleGEPError(error) {
  // Silently ignore GEP errors — the app still works without live data
}

function startGEPListeners() {
  overwolf.games.events.onError.addListener(handleGEPError);
  overwolf.games.events.onInfoUpdates2.addListener(handleInfoUpdate);
  overwolf.games.events.onNewEvents.addListener(handleNewEvents);
}

function stopGEPListeners() {
  try {
    overwolf.games.events.onError.removeListener(handleGEPError);
    overwolf.games.events.onInfoUpdates2.removeListener(handleInfoUpdate);
    overwolf.games.events.onNewEvents.removeListener(handleNewEvents);
  } catch (e) {
    // ignore
  }
  gepRegistered = false;
  lastInventorySig = '';
}

function onWarframeLaunched() {
  ensureMainWindow();
  startEELogWatcher();
  startGEPListeners();
  setRequiredFeatures(REQUIRED_FEATURES, SET_FEATURES_RETRIES);
}

function onWarframeClosed() {
  stopGEPListeners();
}

// ── EE.log watcher (secondary signal) ──────────────
function tailEELog() {
  overwolf.io.readFileContents(EE_LOG_PATH, 'UTF-8', (result) => {
    if (!result.success) return;
    const content = result.content || '';
    const currentSize = content.length;
    if (currentSize < lastFileSize) lastFileSize = 0;
    if (currentSize > lastFileSize) {
      const newData = content.substring(lastFileSize);
      lastFileSize = currentSize;
      if (/\bArsenal\b/i.test(newData)) {
        overwolf.windows.sendMessage(MAIN_WIN, 'arsenalDetected', {});
      }
    }
  });
}

function startEELogWatcher() {
  overwolf.io.readFileContents(EE_LOG_PATH, 'UTF-8', (result) => {
    if (result.success) lastFileSize = (result.content || '').length;
    setInterval(tailEELog, POLL_MS);
  });
}

// ── Game detection ─────────────────────────────────
overwolf.games.onGameInfoUpdated.addListener((event) => {
  if (!event.gameChanged && !event.runningChanged) return;
  const gi = event.gameInfo;
  if (!gi || gi.classId !== GAME_ID) return;
  if (event.runningChanged) {
    if (gi.isRunning) {
      onWarframeLaunched();
    } else {
      onWarframeClosed();
    }
  }
});

(async () => {
  const info = await overwolf.games.getRunningGameInfo();
  if (info?.classId === GAME_ID && info?.isRunning) {
    onWarframeLaunched();
  }
})();
