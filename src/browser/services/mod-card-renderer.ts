import { logger } from '../../utils/logger';

let modGenerator: typeof import('@wfcd/mod-generator') | null = null;

async function getModGenerator() {
  if (!modGenerator) {
    modGenerator = await import('@wfcd/mod-generator');
  }
  return modGenerator;
}

// ── Types ──────────────────────────────────────
export interface ModCardInput {
  uniqueName?: string;
  displayName: string;
  description?: string;
  rarity: string;
  polarity: string;
  baseDrain: number;
  fusionLimit: number;
  iconName?: string;
  compatName?: string;
  modSet?: string;
}

export type CardFormat = 'expanded' | 'collapsed';

/**
 * Map our ModCardInput to the shape @wfcd/mod-generator's `generate` expects.
 * We provide all fields the Mod type requires plus the subset the package actually reads.
 */
function toModShape(input: ModCardInput): Record<string, unknown> {
  return {
    name: input.displayName,
    type: input.rarity === 'riven' ? 'Riven Mod' : (`${input.rarity} Mod` as string),
    rarity: input.rarity?.toLowerCase() ?? 'common',
    polarity: input.polarity?.toLowerCase() ?? 'universal',
    baseDrain: input.baseDrain,
    fusionLimit: input.fusionLimit,
    imageName: input.iconName,
    compatName: input.compatName,
    modSet: input.modSet,
    description: input.description ?? '',
    levelStats: undefined,
    // Satisfy the Mod type shape minimally
    category: 'Mods' as string,
    tradable: false,
    masterable: false,
    isPrime: false,
    uniqueName: input.uniqueName ?? '',
  };
}

export async function renderModCard(
  input: ModCardInput,
  rank: number,
  format: CardFormat,
  setBonus?: number,
): Promise<Buffer | null> {
  try {
    const mod = toModShape(input);
    const modGen = await getModGenerator();
    const generate = modGen.default;
    const { generateCollapsed } = modGen;
    
    if (format === 'collapsed') {
      const buf = await generateCollapsed({ mod: mod as never, rank });
      return (buf as Buffer | null) ?? null;
    }
    const buf = await generate({ mod: mod as never, rank, setBonus });
    return (buf as Buffer | null) ?? null;
  } catch (e) {
    logger.error('[mod-card-renderer] renderModCard error:', e);
    return null;
  }
}
