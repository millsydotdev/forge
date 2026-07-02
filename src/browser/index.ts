import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Application } from './application';
import { logger } from '../utils/logger';

const runtimeRoot = process.env.FORGE_RUNTIME_DIR || process.env.TENNODEX_RUNTIME_DIR;
if (runtimeRoot) {
  const userDataPath = path.join(runtimeRoot, 'userData');
  const cachePath = path.join(runtimeRoot, 'cache');
  fs.mkdirSync(userDataPath, { recursive: true });
  fs.mkdirSync(cachePath, { recursive: true });
  app.setPath('userData', userDataPath);
  app.setPath('sessionData', cachePath);
  app.commandLine.appendSwitch('user-data-dir', userDataPath);
  app.commandLine.appendSwitch('disk-cache-dir', cachePath);
}

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-d3d11');
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion,VizDisplayCompositor');

const application = new Application();

logger.info('main process starting');

app.whenReady().then(() => {
  logger.info('electron ready');
  application.run();
}).catch(error => {
  logger.error('startup failed', error);
});

app.on('window-all-closed', () => {
  logger.info('window-all-closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  logger.error('[FATAL] Uncaught exception:', error);
});
process.on('unhandledRejection', (reason) => {
  logger.error('[FATAL] Unhandled rejection:', reason);
});
