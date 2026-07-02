import type { BrowserWindow } from 'electron';
import { WfcdDataService } from './services/wfcd-data-service';
import { WfcdAssetService } from './services/wfcd-asset-service';
import { GameDataService } from './data/game-data-service';
import { WfcdResolver } from '../data/wfcd-resolver';
import { registerIpcHandlers } from './ipc/register-ipc-handlers';
import { createMainWindow } from './window/create-main-window';
import { logger } from '../utils/logger';

export class Application {
  private mainWindow: BrowserWindow | null = null;

  run(): void {
    // Global unhandled rejection handler
    process.on('unhandledRejection', (reason) => {
      logger.error('[Application] Unhandled rejection:', reason);
    });

    logger.info('loading WFCD data via data service');
    const dataService = new WfcdDataService();
    dataService.load();
    const health = dataService.getHealth();
    if (!health.ok) {
      logger.error('[Application] WFCD data failed to load — catalog is empty');
    }
    const assetService = new WfcdAssetService();
    const gameDataService = new GameDataService();
    const resolver = new WfcdResolver(dataService);
    registerIpcHandlers(dataService, resolver, assetService, gameDataService);
    logger.info('creating main window');
    this.mainWindow = createMainWindow(() => {
      logger.info('main window closed');
      this.mainWindow = null;
    });
    this.mainWindow.webContents.on('did-finish-load', () => {
      this.mainWindow?.webContents.send('data-health', health);
    });
  }
}
