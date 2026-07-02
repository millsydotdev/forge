import { app } from 'electron';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { logger } from '../../utils/logger';

const CDN_BASE = 'https://cdn.warframestat.us/img/';
const USER_AGENT = 'TennoDex/1.0';
const TIMEOUT_MS = 15000;

export class WfcdAssetService {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(app.getPath('userData'), 'asset-cache');
  }

  async getImageUrl(imageName?: string): Promise<string | null> {
    if (!imageName) return null;
    const safeName = imageName.replace(/[\\/:*?"<>|]/g, '_');
    const cachePath = path.join(this.cacheDir, safeName);

    const cached = await this.tryReadCache(cachePath);
    if (cached) return cached;

    return this.downloadAndCache(imageName, cachePath);
  }

  async getMultipleImageUrls(names: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    await Promise.all(names.map(async name => {
      results.set(name, await this.getImageUrl(name));
    }));
    return results;
  }

  clearCache(): void {
    try { fs.rmSync(this.cacheDir, { recursive: true, force: true }); } catch (e) { logger.error('Failed to clear cache:', e); }
  }

  private async tryReadCache(cachePath: string): Promise<string | null> {
    try {
      await fs.promises.mkdir(this.cacheDir, { recursive: true });
      await fs.promises.access(cachePath, fs.constants.R_OK);
      return pathToFileURL(cachePath).toString();
    } catch {
      return null;
    }
  }

  private async downloadAndCache(imageName: string, cachePath: string): Promise<string | null> {
    const url = `${CDN_BASE}${encodeURIComponent(imageName)}`;
    try {
      await this.download(url, cachePath);
      return pathToFileURL(cachePath).toString();
    } catch (error) {
      logger.warn(`[WfcdAssetService] Failed to cache ${imageName}:`, error);
      return null;
    }
  }

  private download(url: string, targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, response => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          this.download(response.headers.location, targetPath).then(resolve, reject);
          return;
        }
        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(targetPath);
        response.pipe(file);
        file.on('finish', () => file.close(error => error ? reject(error) : resolve()));
        file.on('error', error => fs.promises.rm(targetPath, { force: true }).finally(() => reject(error)));
      });
      request.on('error', reject);
      request.setTimeout(TIMEOUT_MS, () => request.destroy(new Error('Asset request timed out')));
    });
  }
}
