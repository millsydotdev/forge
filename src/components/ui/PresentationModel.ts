/**
 * PresentationModel — standard interface for every item type.
 *
 * Every screen consumes PresentationModel.
 * No duplicated presentation logic.
 */

export interface PresentationAction {
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface PresentationBadge {
  label: string;
  color: string;
  icon?: string;
}

export interface PresentationTooltip {
  title: string;
  subtitle?: string;
  artwork?: string;
  sections: { label: string; value: string; color?: string }[];
  drops?: { location: string; chance: number }[];
  wikiUrl?: string;
  kbRef?: string;
}

export interface PresentationModel {
  id: string;
  name: string;
  subtitle: string;
  artwork: string;
  render: string | null;
  icon: string | null;
  badges: PresentationBadge[];
  tags: string[];
  metadata: Record<string, string>;
  actions: PresentationAction[];
  tooltip: PresentationTooltip;
  preview?: string;
}

export type ItemCategory = 'mod' | 'warframe' | 'weapon' | 'arcane' | 'shard' | 'companion' | 'enemy' | 'focus' | 'relic';

const RARITY_COLORS: Record<string, string> = {
  Common: '#b9cacb', Uncommon: '#70c0e0', Rare: '#e0c060', Legendary: '#c070ff',
};

export function buildPresentationModel(
  item: any,
  category: ItemCategory,
  owned?: boolean,
  wishlisted?: boolean,
): PresentationModel {
  const badges: PresentationBadge[] = [];
  if (owned === true) badges.push({ label: '✓', color: '#50d080' });
  else if (owned === false) badges.push({ label: '○', color: '#849495' });
  if (wishlisted) badges.push({ label: '▲', color: '#ffba30' });
  if (item.rarity && RARITY_COLORS[item.rarity]) {
    badges.push({ label: item.rarity, color: RARITY_COLORS[item.rarity] });
  }
  if (item.polarity) badges.push({ label: item.polarity, color: '#849495' });

  const metadata: Record<string, string> = {};
  if (item.masteryReq != null) metadata['MR'] = String(item.masteryReq);
  if (item.baseDrain != null) metadata['Drain'] = String(item.baseDrain);
  if (item.type) metadata['Type'] = item.type;
  if (item.category) metadata['Category'] = item.category;

  return {
    id: item.uniqueName || item.id || '',
    name: item.name || '',
    subtitle: item.type || item.category || category,
    artwork: item.imageName || '',
    render: null,
    icon: null,
    badges,
    tags: [],
    metadata,
    actions: [],
    tooltip: {
      title: item.name || '',
      subtitle: item.description?.substring(0, 120) || item.type || '',
      artwork: item.imageName,
      sections: Object.entries(metadata).map(([k, v]) => ({ label: k, value: v })),
      drops: item.drops?.slice(0, 3) || undefined,
    },
  };
}
