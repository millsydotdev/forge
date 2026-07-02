import { contextBridge, ipcRenderer } from 'electron';
import type { BuildCore } from '../engine/build-core';
import type { ModCardInput } from '../browser/services/mod-card-renderer';
import type { ItemInfo, ItemDetail } from '../shared/item-info';
import type { IpcResult } from '../shared/ipc-types';
import type { CalculatedStats } from '../engine/stat-processor';
import type { EnemyDef, ExaltedEntry, HelminthAbilityDef, FocusSchoolDef, SquadBuffDef, ShardDef } from '../shared/game-data-types';

async function unwrap<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await ipcRenderer.invoke(channel, ...args) as IpcResult<T>;
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

contextBridge.exposeInMainWorld('forge', {
  getItems: (category?: string): Promise<ItemInfo[]> =>
    unwrap('getItems', category),
  getItemDetail: (uniqueName: string): Promise<ItemDetail | null> =>
    unwrap('getItemDetail', uniqueName),
  getAssetUrl: (imageName?: string): Promise<string | null> =>
    unwrap('getAssetUrl', imageName),
  calculateBuild: (build: BuildCore): Promise<IpcResult<CalculatedStats>> =>
    ipcRenderer.invoke('calculateBuild', build),
  getDataHealth: (): Promise<IpcResult<{ ok: boolean; warframes: number; weapons: number; mods: number }>> =>
    ipcRenderer.invoke('getDataHealth'),
  fetchBuildPage: (url: string): Promise<{ success: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('fetchBuildPage', url),
  generateModCard: (input: ModCardInput, rank: number, format: string, setBonus?: number): Promise<Uint8Array | null> =>
    unwrap('generateModCard', input, rank, format, setBonus),
  onDataHealth: (cb: (health: { ok: boolean; warframes: number; weapons: number; mods: number }) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, health: { ok: boolean; warframes: number; weapons: number; mods: number }) => cb(health);
    ipcRenderer.on('data-health', handler);
    return () => ipcRenderer.removeListener('data-health', handler);
  },

  // ── Game Data (replacing game-data.ts singleton) ──
  getEnemies: (): Promise<EnemyDef[]> =>
    unwrap('getEnemies'),
  getExaltedDefs: (): Promise<Record<string, ExaltedEntry>> =>
    unwrap('getExaltedDefs'),
  getIncarnonDefs: (): Promise<string[]> =>
    unwrap('getIncarnonDefs'),
  getHelminthAbilities: (): Promise<HelminthAbilityDef[]> =>
    unwrap('getHelminthAbilities'),
  getFocusSchools: (): Promise<FocusSchoolDef[]> =>
    unwrap('getFocusSchools'),
  getSquadBuffs: (): Promise<SquadBuffDef[]> =>
    unwrap('getSquadBuffs'),
  getShardDefs: (): Promise<ShardDef[]> =>
    unwrap('getShardDefs'),
  getExaltedForWarframe: (uniqueName: string): Promise<ExaltedEntry | null> =>
    unwrap('getExaltedForWarframe', uniqueName),
  isIncarnonWeapon: (uniqueName: string): Promise<boolean> =>
    unwrap('isIncarnonWeapon', uniqueName),
  getGameDataHealth: (): Promise<{ ok: boolean }> =>
    unwrap('getGameDataHealth'),
});
