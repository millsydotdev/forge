export interface IWfcdDataService {
  getMod(uniqueName: string): any;
  getWarframe(uniqueName: string): any;
  getWeapon(uniqueName: string): any;
  getArcane(uniqueName: string): any;
  getCompanion(uniqueName: string): any;
  getSetDef(modSetPath: string): any;
  getOperator(uniqueName: string): any;
  getItems(category?: string): any[];
  getItemDetail(uniqueName: string): any;
  getHealth(): { ok: boolean; warframes: number; weapons: number; mods: number };
}
