/**
 * VisualManager — single visual authority for the entire application.
 *
 * Owns: Brand, Theme, Tokens, Icons, Assets, CDN, Placeholders, Animation
 * Never owns: Engine state, workspace architecture, providers
 *
 * All visual decisions flow through this manager.
 */

// ── Brand ──────────────────────────────────────────────
export const Brand = {
  productName: 'Forge',
  shortName: 'FRG',
  subtitle: 'Warframe Theorycrafting Studio',
  tagline: 'Design. Discover. Dominate.',
  version: '1.0.0',
  copyright: `© ${new Date().getFullYear()} Forge`,
  author: 'millsydotdev',

  website: 'https://github.com/millsydotdev/forge',
  repository: 'https://github.com/millsydotdev/forge',
  discord: 'https://discord.gg/TVmaw9354z',
  issues: 'https://github.com/millsydotdev/forge/issues',
  docs: 'https://github.com/millsydotdev/forge/tree/main/docs',

  storagePrefix: 'frg_',
  oldStoragePrefix: 'tdx_',
  /** Legacy prefixes to check during migration (in order). */
  legacyPrefixes: ['tennodex_'],

  getWindowTitle: (buildName?: string) =>
    buildName ? `${buildName} — ${Brand.productName}` : Brand.productName,

  getAboutText: () =>
    `${Brand.productName} v${Brand.version}\n${Brand.subtitle}\n${Brand.copyright}`,

  getStorageKey: (key: string) => `${Brand.storagePrefix}${key}`,

  /** Migrate all keys from old prefixes to new prefix, preserving values. */
  migrateStorage: () => {
    const prefixesToCheck = [...Brand.legacyPrefixes, Brand.oldStoragePrefix]
      .filter(p => p !== Brand.storagePrefix);
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        for (const oldPrefix of prefixesToCheck) {
          if (key.startsWith(oldPrefix)) {
            keysToMigrate.push(key);
            break;
          }
        }
      }
    }
    for (const key of keysToMigrate) {
      const suffix = key.slice(
        [...Brand.legacyPrefixes, Brand.oldStoragePrefix]
          .find(p => key.startsWith(p))!.length
      );
      const newKey = Brand.storagePrefix + suffix;
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, localStorage.getItem(key)!);
      }
      localStorage.removeItem(key);
    }
  },
};

// ── Visual Tokens ──────────────────────────────────────
export const Tokens = {
  spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24 },
  radius: { none: 0, sm: 2, md: 4, lg: 8, xl: 12, pill: 9999 },
  shadow: {
    0: 'none',
    1: '0 1px 3px rgba(0,0,0,0.3)',
    2: '0 4px 12px rgba(0,0,0,0.4)',
    3: '0 8px 32px rgba(0,0,0,0.5)',
    4: '0 12px 48px rgba(0,0,0,0.6)',
  },
  animation: { micro: 80, fast: 120, normal: 200, slow: 300 },
  font: {
    heading: "'Archivo Narrow', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  zIndex: { base: 1, hover: 5, sticky: 10, dropdown: 50, drawer: 80, modal: 100, toast: 200 },
};

// ── Theme ──────────────────────────────────────────────
export type ThemeMode = 'dark' | 'light' | 'oled' | 'highContrast';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceSolid: string;
  panel: string;
  panelHover: string;
  panelActive: string;
  border: string;
  borderHover: string;
  borderActive: string;
  text: string;
  textDim: string;
  textMuted: string;
  accent: string;
  gold: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export const Themes: Record<ThemeMode, ThemeColors> = {
  dark: {
    bg: '#060608', surface: 'rgba(19,19,20,0.92)', surfaceSolid: '#0e0e0f',
    panel: 'rgba(32,31,32,0.88)', panelHover: 'rgba(42,41,42,0.80)', panelActive: 'rgba(53,52,54,0.90)',
    border: 'rgba(132,148,149,0.22)', borderHover: 'rgba(132,148,149,0.35)', borderActive: 'rgba(0,242,255,0.45)',
    text: '#e5e2e3', textDim: '#b9cacb', textMuted: '#849495',
    accent: '#00f2ff', gold: '#ffba30',
    error: '#ffb4ab', success: '#50d080', warning: '#e87a30', info: '#5098e0',
  },
  light: {
    bg: '#f5f5f5', surface: 'rgba(255,255,255,0.95)', surfaceSolid: '#ffffff',
    panel: 'rgba(240,240,240,0.90)', panelHover: 'rgba(235,235,235,0.85)', panelActive: 'rgba(230,230,230,0.95)',
    border: 'rgba(0,0,0,0.12)', borderHover: 'rgba(0,0,0,0.20)', borderActive: 'rgba(0,242,255,0.60)',
    text: '#1a1a1a', textDim: '#555555', textMuted: '#999999',
    accent: '#0098a0', gold: '#c8962a',
    error: '#d32f2f', success: '#388e3c', warning: '#f57c00', info: '#1976d2',
  },
  oled: {
    bg: '#000000', surface: 'rgba(10,10,10,0.95)', surfaceSolid: '#050505',
    panel: 'rgba(15,15,15,0.90)', panelHover: 'rgba(20,20,20,0.85)', panelActive: 'rgba(25,25,25,0.95)',
    border: 'rgba(132,148,149,0.15)', borderHover: 'rgba(132,148,149,0.25)', borderActive: 'rgba(0,242,255,0.50)',
    text: '#e5e2e3', textDim: '#b9cacb', textMuted: '#666666',
    accent: '#00f2ff', gold: '#ffba30',
    error: '#ffb4ab', success: '#50d080', warning: '#e87a30', info: '#5098e0',
  },
  highContrast: {
    bg: '#000000', surface: '#000000', surfaceSolid: '#000000',
    panel: '#000000', panelHover: '#111111', panelActive: '#222222',
    border: '#ffffff', borderHover: '#ffffff', borderActive: '#00f2ff',
    text: '#ffffff', textDim: '#cccccc', textMuted: '#aaaaaa',
    accent: '#00f2ff', gold: '#ffdd00',
    error: '#ff4444', success: '#44ff44', warning: '#ffaa00', info: '#44aaff',
  },
};

// ── Icons ──────────────────────────────────────────────
export const IconPaths = {
  damage: {
    impact: 'M...', puncture: 'M...', slash: 'M...',
    heat: 'M...', cold: 'M...', electric: 'M...', toxin: 'M...',
    blast: 'M...', corrosive: 'M...', gas: 'M...', magnetic: 'M...',
    radiation: 'M...', viral: 'M...', void: 'M...', tau: 'M...',
  },
  polarity: {
    madurai: 'M...', vazarin: 'M...', nairu: 'M...',
    umbra: 'M...', penjaga: 'M...', universal: 'M...',
  },
};

// ── Asset Resolution ──────────────────────────────────
const CDN_BASE = 'https://cdn.warframestat.us/img/';
const memoryCache = new Map<string, string>();
const failedCache = new Set<string>();
const MAX_MEMORY_CACHE = 200;

export class VisualManager {
  private _theme: ThemeMode = 'dark';

  get theme(): ThemeMode { return this._theme; }

  setTheme(mode: ThemeMode): void {
    this._theme = mode;
    const t = Themes[mode];
    const root = document.documentElement;
    root.style.setProperty('--wf-bg', t.bg);
    root.style.setProperty('--wf-surface', t.surface);
    root.style.setProperty('--wf-text', t.text);
    root.style.setProperty('--wf-teal', t.accent);
    root.style.setProperty('--wf-gold', t.gold);
    root.style.setProperty('--wf-red', t.error);
    root.style.setProperty('--wf-green', t.success);
    root.style.setProperty('--wf-orange', t.warning);
    root.style.setProperty('--wf-blue', t.info);
    try { localStorage.setItem(Brand.getStorageKey('theme'), mode); } catch { /* storage unavailable */ }
  }

  loadTheme(): void {
    try {
      const saved = localStorage.getItem(Brand.getStorageKey('theme'));
      if (saved && (saved === 'dark' || saved === 'light' || saved === 'oled' || saved === 'highContrast')) {
        this.setTheme(saved);
      }
    } catch { /* storage unavailable */ }
  }

  /** Resolve any asset URL with full fallback chain. */
  getAssetUrl(key: string, type: string): string {
    const cacheKey = `${type}:${key}`;

    // 1. Memory cache
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    // 2. Failed cache (don't retry broken URLs)
    if (failedCache.has(cacheKey)) return this.getPlaceholder(type);

    // 3. CDN URL
    const url = this.buildCdnUrl(key, type);
    return url;
  }

  /** Mark an asset as failed (caches failure). */
  markFailed(key: string, type: string): void {
    failedCache.add(`${type}:${key}`);
  }

  /** Cache a successfully loaded asset. */
  cacheAsset(key: string, type: string, url: string): void {
    const cacheKey = `${type}:${key}`;
    memoryCache.set(cacheKey, url);
    if (memoryCache.size > MAX_MEMORY_CACHE) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
  }

  /** Get a branded placeholder for any asset type. */
  getPlaceholder(_type: string): string {
    return `${CDN_BASE}placeholder.png`;
  }

  /** Build a CDN URL for a given key and asset type. */
  private buildCdnUrl(key: string, type: string): string {
    const filename = this.filenameForKey(key, type);
    return `${CDN_BASE}${encodeURIComponent(filename)}`;
  }

  /** Get a shard CDN URL from color and tau status. */
  getShardImage(color: string, isTau: boolean = false): string {
    const base = `Shard_${this.capitalize(color)}`;
    const name = isTau ? `${base}_Tau.png` : `${base}.png`;
    return this.buildCdnUrl(name, 'shard');
  }

  /** Get a damage-type icon CDN URL. */
  getDamageIcon(type: string): string {
    const clean = this.capitalize(type.trim());
    return this.buildCdnUrl(clean, 'damage-icon');
  }

  /** Get a polarity icon CDN URL. */
  getPolarityIcon(polarity: string): string {
    const clean = polarity.charAt(0).toUpperCase() + polarity.slice(1).toLowerCase();
    return this.buildCdnUrl(`Polarity_${clean}`, 'polarity-icon');
  }

  /** Get a generic item CDN URL from imageName. */
  getImageUrl(imageName?: string): string {
    if (!imageName) return this.getPlaceholder('generic');
    return this.buildCdnUrl(imageName, 'generic');
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private filenameForKey(key: string, type: string): string {
    // Map common patterns
    if (type === 'warframe-render' || type === 'warframe-portrait') return `${key}.png`;
    if (type === 'weapon-render') return `${key}.png`;
    if (type === 'mod-card') return key;
    if (type === 'arcane') return key;
    if (type === 'ability-icon') return key;
    if (type === 'shard') return key;
    if (type === 'damage-icon') return `${key}.png`;
    if (type === 'polarity-icon') return `${key}.png`;
    if (type === 'generic') return key;
    return `${key}.png`;
  }
}

export const visualManager = new VisualManager();
