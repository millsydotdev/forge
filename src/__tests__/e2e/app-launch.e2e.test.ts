import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { _electron as electron } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import type { ElectronApplication, Page } from 'playwright';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const MAIN_ENTRY = path.join(PROJECT_ROOT, 'dist', 'browser', 'index.js');
const OW_ELECTRON_EXE = path.join(
  PROJECT_ROOT,
  'node_modules',
  '@overwolf',
  'ow-electron',
  'dist',
  'electron.exe',
);

describe('TennoDex App Launch', () => {
  let app: ElectronApplication | null = null;
  let window: Page | null = null;

  beforeAll(async () => {
    // Verify build exists
    if (!fs.existsSync(MAIN_ENTRY)) {
      throw new Error(
        `Build not found at ${MAIN_ENTRY}. Run 'npm run build' first.`,
      );
    }
    if (!fs.existsSync(OW_ELECTRON_EXE)) {
      throw new Error(
        `ow-electron binary not found at ${OW_ELECTRON_EXE}.`,
      );
    }

    app = await electron.launch({
      args: [MAIN_ENTRY],
      executablePath: OW_ELECTRON_EXE,
      env: {
        ...process.env as Record<string, string>,
        ELECTRON_DISABLE_GPU: '1',
        ELECTRON_ENABLE_LOGGING: '1',
        NODE_ENV: 'test',
      },
    });

    window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 10000);

  it('should display the TennoDex title', async () => {
    const title = await window!.title();
    expect(title).toBe('TennoDex');
  });

  it('should have a root element', async () => {
    const root = await window!.$('#root');
    expect(root).not.toBeNull();
  });

  it('should not crash on startup', async () => {
    // Give the app a moment to render, then verify the window is still responsive
    await new Promise(resolve => setTimeout(resolve, 1000));
    const title = await window!.title();
    expect(title).toBe('TennoDex');
  });

  it('should load the renderer app bundle', async () => {
    const hasApp = await window!.evaluate(() => {
      return typeof window.forge !== 'undefined';
    });
    expect(hasApp).toBe(true);
  });
});
