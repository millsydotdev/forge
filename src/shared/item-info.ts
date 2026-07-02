export interface ItemInfo {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  imageName?: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
}

export interface ItemDetail {
  uniqueName: string;
  name: string;
  category: string;
  type?: string;
  description?: string;
  imageName?: string;
  baseDrain?: number;
  fusionLimit?: number;
  polarity?: string;
  rarity?: string;
  abilities?: unknown[];
  passiveDescription?: string;
  levelStats?: { stats: string[] }[];
}
