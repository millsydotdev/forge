import type {
  ExaltedEntry,
  EnemyDef,
  HelminthAbilityDef,
  FocusSchoolDef,
  SquadBuffDef,
  ShardDef,
  GameDataJson,
} from '../../shared/game-data-types';
import raw from './game-data.json';

export class GameDataService {
  private data: GameDataJson = raw as unknown as GameDataJson;

  get exaltedWeapons(): Record<string, ExaltedEntry> {
    return this.data.exaltedWeapons;
  }
  get incarnonWeapons(): string[] {
    return this.data.incarnonWeapons;
  }
  get helminthAbilities(): HelminthAbilityDef[] {
    return this.data.helminthAbilities;
  }
  get focusSchools(): FocusSchoolDef[] {
    return this.data.focusSchools;
  }
  get squadBuffs(): SquadBuffDef[] {
    return this.data.squadBuffs;
  }
  get enemies(): EnemyDef[] {
    return this.data.enemies;
  }
  get shardDefs(): ShardDef[] {
    return this.data.shardDefs;
  }

  getExaltedForWarframe(uniqueName: string): ExaltedEntry | undefined {
    return this.data.exaltedWeapons[uniqueName];
  }

  isIncarnonWeapon(uniqueName: string): boolean {
    return this.data.incarnonWeapons.includes(uniqueName);
  }

  getEnemyByName(name: string): EnemyDef | undefined {
    return this.data.enemies.find(e => e.name === name);
  }

  getHelminthByDonor(donorUniqueName: string): HelminthAbilityDef | undefined {
    return this.data.helminthAbilities.find(h => h.donorUniqueName === donorUniqueName);
  }

  getShardDef(color: string): ShardDef | undefined {
    return this.data.shardDefs.find(s => s.color === color);
  }

  getHealth(): { ok: boolean } {
    return { ok: this.data.enemies.length > 0 };
  }
}
