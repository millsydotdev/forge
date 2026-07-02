import { useCallback } from 'react';
import type { Polarity } from '../engine/build-core';
import { encodeBuild, decodeBuild } from '../features/build-planner/services/build-codec';
import type { EncodedWeapon } from '../features/build-planner/services/build-codec';
import type { ArcaneSlot } from '../features/build-planner/model';
import { resolveModTuples, resolveArcaneTuples, resolveShards } from '../features/build-planner/util/resolveModsFromIds';
import { useBuildStore, writeLoadouts } from '../store/buildStore';
import { useProjectStore } from '../store/projectStore';
import { useUiStore } from '../store/uiStore';
import { logger } from '../utils/logger';

const WEAPON_PREFIX_MAP: Record<string, string> = {
  wp: 'primary', ws: 'secondary', wm: 'melee',
  wg: 'arch-gun', wl: 'arch-melee',
};

const WEAPON_SLOTS = ['wp', 'ws', 'wm', 'wg', 'wl'] as const;

function applyDecodedWeapon(
  prefix: string,
  wjson: EncodedWeapon,
  build: ReturnType<typeof useBuildStore.getState>,
) {
  const slot = WEAPON_PREFIX_MAP[prefix] ?? prefix;
  const existing = build.weaponStates[slot] ?? {
    id: '', mods: [], exilus: null, arcanes: [null, null] as [ArcaneSlot | null, ArcaneSlot | null],
    slotPolarities: [] as Polarity[],
  };
  build.setWeaponStates(p => ({ ...p, [slot]: { ...existing, id: wjson.i ?? '' } }));
  if (wjson.m) {
    resolveModTuples(wjson.m).then(mods => {
      build.setWeaponStates(p => ({ ...p, [slot]: { ...p[slot], mods } }));
    });
  }
  if (wjson.p) {
    build.setWeaponStates(p => ({ ...p, [slot]: { ...p[slot], slotPolarities: wjson.p as Polarity[] } }));
  }
}

function applyDecodedCompanion(
  companion: NonNullable<ReturnType<typeof decodeBuild>['c']>,
  build: ReturnType<typeof useBuildStore.getState>,
) {
  build.setComp(p => ({
    ...p,
    id: companion.i ?? '',
    compType: companion.t ?? '',
    slotPolarities: companion.p ?? p.slotPolarities,
    weaponSlotPolarities: companion.w?.p ?? p.weaponSlotPolarities,
  }));
  if (companion.m) {
    resolveModTuples(companion.m).then(mods =>
      build.setComp(p => ({ ...p, mods })),
    );
  }
  if (companion.w) {
    const w = companion.w;
    build.setComp(p => ({ ...p, weaponId: w.i ?? '', weaponSlotPolarities: w.p ?? p.weaponSlotPolarities }));
    if (w.m) {
      resolveModTuples(w.m).then(mods =>
        build.setComp(p => ({ ...p, weaponMods: mods })),
      );
    }
  }
}

/**
 * Apply a decoded EncodedBuild to the build store.
 * Shared between handleImport and loadLoadout.
 */
export function applyDecodedBuild(
  json: ReturnType<typeof decodeBuild>,
  build: ReturnType<typeof useBuildStore.getState>,
): void {
  if (json.f != null) build.setWf(p => ({ ...p, id: json.f ?? '' }));
  if (json.mr !== undefined) build.setMr(json.mr);
  if (json.notes !== undefined) build.setBuildNotes(json.notes);

  if (json.m) {
    resolveModTuples(json.m).then(mods => {
      build.setWf(p => ({ ...p, mods }));
    });
  }
  if (json.a) {
    resolveModTuples([json.a]).then(([mod]) => {
      if (mod) build.setWf(p => ({ ...p, aura: mod }));
    });
  }
  if (json.e) {
    resolveModTuples([json.e]).then(([mod]) => {
      if (mod) build.setWf(p => ({ ...p, exilus: mod }));
    });
  }
  if (json.p) {
    build.setWf(p => ({ ...p, slotPolarities: json.p as Polarity[] }));
  }
  if (json.sh) {
    build.setWf(p => ({ ...p, shards: resolveShards(json.sh) as any }));
  }
  if (json.h) {
    build.setHelminth({ enabled: true, donorId: json.h[0], slotIndex: json.h[1] });
  }
  if (json.ar) {
    resolveArcaneTuples([json.ar[0] ?? null, json.ar[1] ?? null]).then(arcs => {
      build.setWf(p => ({
        ...p,
        arcanes: [arcs[0] ?? null, arcs[1] ?? null] as [ArcaneSlot | null, ArcaneSlot | null],
      }));
    });
  }

  for (const prefix of WEAPON_SLOTS) {
    const wjson = json[prefix];
    if (!wjson) continue;
    applyDecodedWeapon(prefix, wjson, build);
  }

  if (json.c) {
    applyDecodedCompanion(json.c, build);
  }
}

export function useBuildActions() {
  const buildExportCode = useCallback((): string => {
    const build = useBuildStore.getState();
    return encodeBuild({
      mr: build.mr,
      warframe: build.wf,
      weapons: build.weaponStates,
      companion: build.comp,
      helminth: build.helminth,
      notes: build.buildNotes,
    });
  }, []);

  const handleImport = useCallback(() => {
    const ui = useUiStore.getState();
    const raw = ui.importText.trim();
    if (!raw.startsWith('tndx1:')) {
      ui.setToast({ message: 'Invalid build code', type: 'error' });
      return;
    }
    try {
      const json = decodeBuild(raw);
      const build = useBuildStore.getState();
      applyDecodedBuild(json, build);
      ui.setShowImport(false);
      ui.setImportText('');
      ui.setToast({ message: 'Build imported successfully', type: 'success' });
    } catch (e) {
      const ui2 = useUiStore.getState();
      ui2.setToast({
        message: 'Import failed: ' + (e instanceof Error ? e.message : String(e)),
        type: 'error',
      });
    }
  }, []);

  const loadLoadout = useCallback((code: string) => {
    try {
      const json = decodeBuild(code);
      const build = useBuildStore.getState();
      applyDecodedBuild(json, build);
    } catch (e) {
      logger.error('Load loadout failed:', e);
    }
  }, []);

  const saveLoadout = useCallback((name: string) => {
    const code = buildExportCode();
    const build = useBuildStore.getState();
    const updated = { ...build.loadouts, [name]: code };
    build.setLoadouts(updated);
    writeLoadouts(updated);

    const projectStore = useProjectStore.getState();
    if (projectStore.currentProjectId) {
      projectStore.addVariant(projectStore.currentProjectId, name, code);
    } else {
      projectStore.createProject(name).then(pid => {
        useProjectStore.getState().addVariant(pid, name, code);
      });
    }
  }, [buildExportCode]);

  const deleteLoadout = useCallback((name: string) => {
    const build = useBuildStore.getState();
    const rest: Record<string, string> = {};
    for (const key of Object.keys(build.loadouts)) {
      if (key !== name) rest[key] = build.loadouts[key];
    }
    build.setLoadouts(rest);
    writeLoadouts(rest);
  }, []);

  return {
    buildExportCode,
    handleImport,
    loadLoadout,
    saveLoadout,
    deleteLoadout,
  };
}
