import { BrowserWindow } from 'electron';
import * as path from 'path';
import { logger } from '../../utils/logger';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cdn.warframestat.us https://raw.githubusercontent.com",
  "connect-src 'self' https://cdn.warframestat.us",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

export function createMainWindow(onClosed: () => void): BrowserWindow {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Set Content-Security-Policy
  window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders ?? {};
    responseHeaders['Content-Security-Policy'] = [CSP];
    callback({ responseHeaders });
  });

  const rendererPath = path.join(__dirname, '..', 'renderer', 'index.html');
  window.loadFile(rendererPath).catch(error => logger.error('[TennoDex] renderer load failed', error));
  window.on('closed', onClosed);
  return window;
}
