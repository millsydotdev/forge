import Dexie from 'dexie';
import type { ItemOption as BaseItemOption } from '../../features/build-planner/model';

export interface ItemOption extends BaseItemOption {
  count?: number;
}

export interface SavedBuild {
  id?: number;
  name: string;
  data: unknown;
}

export class TennoDexDB extends Dexie {
  items!: Dexie.Table<ItemOption, string>;
  builds!: Dexie.Table<SavedBuild, number>;

  constructor() {
    super('TennoDexDB');
    this.version(1).stores({
      items: 'uniqueName, category, type',
      builds: '++id, name',
    });
  }
}

export const db = new TennoDexDB();
