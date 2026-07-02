import type { RivenData } from '../components/riven-editor';
import { logger } from '../../../utils/logger';
import { Brand } from '../../../services/visual-manager';

const STORAGE_KEY = Brand.getStorageKey('rivens');

const rivenMap = new Map<string, RivenData>();
let nextId = 1;

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const entries: [string, RivenData][] = JSON.parse(saved);
      for (const [id, data] of entries) {
        rivenMap.set(id, data);
        const numPart = parseInt(id.replace('riven_custom_', ''), 10);
        if (!isNaN(numPart) && numPart >= nextId) nextId = numPart + 1;
      }
    }
  } catch (e) { logger.warn('[RivenStore] load failed:', e); }
}

loadFromStorage();

function saveToStorage() {
  try {
    const entries = [...rivenMap.entries()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) { logger.warn('[RivenStore] save failed:', e); }
}

export function addRiven(data: RivenData): string {
  const id = `riven_custom_${nextId++}`;
  rivenMap.set(id, data);
  saveToStorage();
  return id;
}

export function getRiven(id: string): RivenData | undefined {
  return rivenMap.get(id);
}

export function getAllRivens(): Map<string, RivenData> {
  return rivenMap;
}

export function deleteRiven(id: string): void {
  rivenMap.delete(id);
  saveToStorage();
}
