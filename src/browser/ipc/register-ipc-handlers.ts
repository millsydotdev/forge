import { ipcMain } from 'electron';
import * as https from 'https';
import type { BuildCore } from '../../engine/build-core';
import type { WfcdResolver } from '../../data/wfcd-resolver';
import { calculateBuild } from '../../engine/stat-processor';
import type { WfcdAssetService } from '../services/wfcd-asset-service';
import type { WfcdDataService } from '../services/wfcd-data-service';
import type { GameDataService } from '../data/game-data-service';
import { renderModCard } from '../services/mod-card-renderer';
import type { ModCardInput, CardFormat } from '../services/mod-card-renderer';
import { logger } from '../../utils/logger';
import { ipcOk, ipcErr } from '../../shared/ipc-types';

const ALLOWED_OVERFRAME_HOSTS = ['overframe.gg', 'www.overframe.gg'];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    if (!ALLOWED_OVERFRAME_HOSTS.includes(u.hostname)) return false;
    // Block private IPs / localhost
    const hostname = u.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;
    if (/^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return false;
    if (/^169\.254\./.test(hostname)) return false; // link-local
    return true;
  } catch {
    return false;
  }
}

function httpFetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'TennoDex/1.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location;
        if (!isAllowedUrl(redirectUrl)) {
          res.resume();
          return reject(new Error('Redirect to disallowed URL'));
        }
        httpFetch(redirectUrl).then(resolve, reject);
        return;
      }
      let data = '';
      let size = 0;
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      res.on('data', (chunk: string) => {
        data += chunk;
        size += chunk.length;
        if (size > MAX_SIZE) {
          req.destroy(new Error('Response too large'));
          res.resume();
        }
      });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timed out')); });
  });
}

/** Extract Overframe build JSON from page HTML */
function extractOverframeBuildJson(html: string): Record<string, unknown> | null {
  // Try __NEXT_DATA__ first (Next.js pages)
  const nextMatch = /<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  if (nextMatch) {
    try { return JSON.parse(nextMatch[1]); } catch { /* fall through */ }
  }
  // Try __INITIAL_STATE__
  const stateMatch = /<script>window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/.exec(html);
  if (stateMatch) {
    try { return JSON.parse(stateMatch[1]); } catch { /* fall through */ }
  }
  // Try Redux store
  const reduxMatch = /<script>window\.__REDUX_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/.exec(html);
  if (reduxMatch) {
    try { return JSON.parse(reduxMatch[1]); } catch { /* fall through */ }
  }
  // Try finding a JSON blob in a script tag with build data
  const buildMatch = /"build"\s*:\s*({[\s\S]*?})\s*[,}]/.exec(html);
  if (buildMatch) {
    try { return JSON.parse('{' + buildMatch[0] + '}'); } catch { /* fall through */ }
  }
  return null;
}

export function registerIpcHandlers(dataService: WfcdDataService, resolver: WfcdResolver, assets: WfcdAssetService, gameData: GameDataService): void {
  ipcMain.handle('getAssetUrl', async (_event, imageName?: string) => {
    try { return ipcOk(await assets.getImageUrl(imageName)); }
    catch (e) { logger.error('[IPC] getAssetUrl error:', e); return ipcErr(e); }
  });
  ipcMain.handle('getItems', (_event, category?: string) => {
    try {
      const items = dataService.getItems(category);
      logger.info(`[IPC] getItems(${category}) returned ${items.length} items`);
      return ipcOk(items);
    } catch (e) { logger.error('[IPC] getItems error:', e); return ipcErr(e); }
  });
  ipcMain.handle('getItemDetail', (_event, uniqueName: string) => {
    try {
      const detail = dataService.getItemDetail(uniqueName);
      logger.info(`[IPC] getItemDetail(${uniqueName}) ${detail ? 'found' : 'not found'}`);
      return ipcOk(detail);
    } catch (e) { logger.error('[IPC] getItemDetail error:', e); return ipcErr(e); }
  });
  ipcMain.handle('generateModCard', async (_event, input: ModCardInput, rank: number, format: CardFormat, setBonus?: number) => {
    try {
      const buf = await renderModCard(input, rank, format, setBonus);
      return ipcOk(buf);
    } catch (e) {
      logger.error('[IPC] generateModCard error:', e);
      return ipcErr(e);
    }
  });
  ipcMain.handle('calculateBuild', (_event, build: BuildCore) => {
    try {
      const result = calculateBuild(build, resolver);
      logger.info('[IPC] calculateBuild completed');
      return ipcOk(result);
    } catch (e) {
      logger.error('[IPC] calculateBuild error:', e);
      return ipcErr(e);
    }
  });
  ipcMain.handle('getDataHealth', () => {
    try {
      const health = dataService.getHealth();
      return ipcOk(health);
    } catch (e) {
      return ipcErr(e);
    }
  });
  ipcMain.handle('getEnemies', () => { try { return ipcOk(gameData.enemies); } catch (e) { logger.error('[IPC] getEnemies error:', e); return ipcErr(e); } });
  ipcMain.handle('getExaltedDefs', () => { try { return ipcOk(gameData.exaltedWeapons); } catch (e) { logger.error('[IPC] getExaltedDefs error:', e); return ipcErr(e); } });
  ipcMain.handle('getIncarnonDefs', () => { try { return ipcOk(gameData.incarnonWeapons); } catch (e) { logger.error('[IPC] getIncarnonDefs error:', e); return ipcErr(e); } });
  ipcMain.handle('getHelminthAbilities', () => { try { return ipcOk(gameData.helminthAbilities); } catch (e) { logger.error('[IPC] getHelminthAbilities error:', e); return ipcErr(e); } });
  ipcMain.handle('getFocusSchools', () => { try { return ipcOk(gameData.focusSchools); } catch (e) { logger.error('[IPC] getFocusSchools error:', e); return ipcErr(e); } });
  ipcMain.handle('getSquadBuffs', () => { try { return ipcOk(gameData.squadBuffs); } catch (e) { logger.error('[IPC] getSquadBuffs error:', e); return ipcErr(e); } });
  ipcMain.handle('getShardDefs', () => { try { return ipcOk(gameData.shardDefs); } catch (e) { logger.error('[IPC] getShardDefs error:', e); return ipcErr(e); } });
  ipcMain.handle('getExaltedForWarframe', (_event, uniqueName: string) => { try { return ipcOk(gameData.getExaltedForWarframe(uniqueName) ?? null); } catch (e) { logger.error('[IPC] getExaltedForWarframe error:', e); return ipcErr(e); } });
  ipcMain.handle('isIncarnonWeapon', (_event, uniqueName: string) => { try { return ipcOk(gameData.isIncarnonWeapon(uniqueName)); } catch (e) { logger.error('[IPC] isIncarnonWeapon error:', e); return ipcErr(e); } });
  ipcMain.handle('getGameDataHealth', () => { try { return ipcOk(gameData.getHealth()); } catch (e) { logger.error('[IPC] getGameDataHealth error:', e); return ipcErr(e); } });
  ipcMain.handle('fetchBuildPage', async (_event, url: string) => {
    try {
      if (!isAllowedUrl(url)) {
        logger.warn('[IPC] fetchBuildPage blocked disallowed URL:', url);
        return { success: false as const, error: 'Only overframe.gg HTTPS URLs are allowed' };
      }
      logger.info('[IPC] fetchBuildPage:', url);
      const html = await httpFetch(url);
      const json = extractOverframeBuildJson(html);
      if (json) {
        return { success: true as const, data: json };
      }
      // Fallback: try Overframe API format
      const apiUrl = url.replace('/build/', '/api/builds/').replace(/\?.*$/, '');
      if (!isAllowedUrl(apiUrl)) {
        return { success: false as const, error: 'Could not extract build data from page. Overframe may have changed its format.' };
      }
      try {
        const apiHtml = await httpFetch(apiUrl);
        try { return { success: true as const, data: JSON.parse(apiHtml) }; }
        catch { logger.warn('[IPC] fetchBuildPage: JSON parse failed for API response'); }
      } catch (e) { logger.warn('[IPC] fetchBuildPage: API fallback failed:', e); }
      return { success: false as const, error: 'Could not extract build data from page. Overframe may have changed its format.' };
    } catch (e: unknown) {
      logger.error('[IPC] fetchBuildPage error:', e);
      return { success: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  });
}
