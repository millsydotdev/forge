/**
 * Stat Display Metadata — labels, symbols, grouping, formatting.
 *
 * Each entry defines how a computed stat from `CalculatedStats` should
 * be displayed in the HUD: its human-readable label, unicode symbol/icon,
 * group (which collapsible section it lives in), default value (stats at
 * default are hidden), formatting rule, and optional color.
 */

export type DisplayValueFormatter = 'percent' | 'decimal' | 'integer' | 'time' | 'multiplier' | 'raw';

export interface StatDisplayDef {
  label: string;
  symbol: string;
  group: 'warframe' | 'abilities' | 'movement' | 'survival' | 'block' | 'resistances' | 'weapon';
  /** Default value. Stats matching this are hidden. */
  default: number;
  /** How to format the display value. Defaults to 'percent'. */
  format?: DisplayValueFormatter;
  /** Optional CSS color var or hex. */
  color?: string;
  /** Higher = later display order within group. */
  order?: number;
  /** Unit suffix text. */
  suffix?: string;
}

/** All known stats that the engine can produce, keyed by CalculatedStats field name. */
export const STAT_DISPLAY: Record<string, StatDisplayDef> = {
  // ── Warframe Core ─────────────────────────────────────
  health:           { label: 'Health',          symbol: '♥',    group: 'warframe',    default: 0,    format: 'integer', color: 'var(--wf-teal-ui)', order: 1 },
  shields:          { label: 'Shields',         symbol: '◇',    group: 'warframe',    default: 0,    format: 'integer', color: 'var(--wf-blue)', order: 2 },
  armor:            { label: 'Armor',           symbol: '◆',    group: 'warframe',    default: 0,    format: 'integer', color: 'var(--wf-gold-accent)', order: 3 },
  energy:           { label: 'Energy',          symbol: '⬟',    group: 'warframe',    default: 0,    format: 'integer', color: 'var(--wf-purple)', order: 4 },
  ehp:              { label: 'EHP',             symbol: '⛊',    group: 'warframe',    default: 0,    format: 'integer', color: 'var(--wf-red-ui)', order: 5 },
  sprintSpeed:      { label: 'Sprint Speed',    symbol: '⚡',    group: 'warframe',    default: 1,    format: 'multiplier', color: 'var(--wf-gold-accent)', order: 6 },
  overguard:        { label: 'Overguard',       symbol: '⬠',    group: 'warframe',    default: 1,    format: 'percent', color: '#60c0c0', order: 7 },
  healthRegen:      { label: 'Health Regen',    symbol: '+',    group: 'warframe',    default: 0,    format: 'decimal', color: 'var(--wf-teal-ui)', order: 8, suffix: '/s' },

  // ── Abilities ─────────────────────────────────────────
  strength:         { label: 'Ability Str.',    symbol: '⤊',    group: 'abilities',   default: 1,    format: 'percent', color: 'var(--wf-red-ui)', order: 1 },
  duration:         { label: 'Duration',        symbol: '⏱',    group: 'abilities',   default: 1,    format: 'percent', color: 'var(--wf-teal-ui)', order: 2 },
  range:            { label: 'Range',           symbol: '◎',    group: 'abilities',   default: 1,    format: 'percent', color: 'var(--wf-green-ui)', order: 3 },
  efficiency:       { label: 'Efficiency',      symbol: '◈',    group: 'abilities',   default: 1,    format: 'percent', color: 'var(--wf-gold-accent)', order: 4 },
  castingSpeed:     { label: 'Casting Speed',   symbol: '➤',    group: 'abilities',   default: 1,    format: 'percent', color: 'var(--wf-purple)', order: 5 },

  // ── Movement ──────────────────────────────────────────
  shieldRecharge:       { label: 'Shield Recharge',     symbol: '↻', group: 'movement', default: 1, format: 'percent', color: 'var(--wf-blue)', order: 1 },
  shieldRechargeDelay:  { label: 'Recharge Delay',      symbol: '↻', group: 'movement', default: 1, format: 'percent', color: 'var(--wf-red-ui)', order: 2 },
  parkourVelocity:      { label: 'Parkour Vel.',        symbol: '⇶', group: 'movement', default: 1, format: 'percent', color: 'var(--wf-green-ui)', order: 3 },
  aimGlideDuration:     { label: 'Aim Glide Dur.',      symbol: '▽', group: 'movement', default: 1, format: 'percent', order: 4 },
  bulletJump:           { label: 'Bullet Jump',         symbol: '↗', group: 'movement', default: 1, format: 'percent', order: 5 },
  slide:                { label: 'Slide',               symbol: '⇄', group: 'movement', default: 1, format: 'percent', order: 6 },
  friction:             { label: 'Friction',            symbol: '—', group: 'movement', default: 1, format: 'percent', order: 7 },
  jumpHeight:           { label: 'Jump Height',         symbol: '↑', group: 'movement', default: 1, format: 'percent', order: 8 },
  dodgeSpeed:           { label: 'Dodge Speed',         symbol: '⇠', group: 'movement', default: 1, format: 'percent', order: 9 },
  mobility:             { label: 'Mobility',            symbol: '✦', group: 'movement', default: 1, format: 'percent', order: 10 },

  // ── Survival ──────────────────────────────────────────
  bleedoutReduction:    { label: 'Bleedout Reduction',  symbol: '✚', group: 'survival', default: 1, format: 'percent', color: 'var(--wf-red-ui)', order: 1 },
  reviveSpeed:          { label: 'Revive Speed',        symbol: '↺', group: 'survival', default: 1, format: 'percent', color: 'var(--wf-teal-ui)', order: 2 },
  bleedoutDamage:       { label: 'Bleedout Dmg',        symbol: '⚔', group: 'survival', default: 1, format: 'percent', color: 'var(--wf-red-ui)', order: 3 },
  reviveDamageTaken:    { label: 'Revive Dmg Taken',    symbol: '✖', group: 'survival', default: 1, format: 'percent', color: 'var(--wf-orange)', order: 4 },
  shieldGateDuration:   { label: 'Shield Gate',         symbol: '◈', group: 'survival', default: 1, format: 'percent', color: 'var(--wf-blue)', order: 5 },
  knockdownChance:      { label: 'Knockdown Resist',    symbol: '⎔', group: 'survival', default: 0, format: 'percent', color: 'var(--wf-gold-accent)', order: 6 },
  knockdownRecovery:    { label: 'KD Recovery',         symbol: '↥', group: 'survival', default: 1, format: 'percent', order: 7 },
  staggerRecovery:      { label: 'Stagger Recovery',    symbol: '↥', group: 'survival', default: 1, format: 'percent', order: 8 },

  // ── Block / Parry ─────────────────────────────────────
  damageBlock:          { label: 'Damage Block',        symbol: '⊡', group: 'block', default: 1, format: 'percent', color: 'var(--wf-teal-ui)', order: 1 },
  parryAngle:           { label: 'Parry Angle',         symbol: '⊞', group: 'block', default: 1, format: 'percent', color: 'var(--wf-gold-accent)', order: 2 },
  staggerOnBlock:       { label: 'Stagger on Block',    symbol: '⚠', group: 'block', default: 0, format: 'percent', color: 'var(--wf-orange)', order: 3 },
  stunOnBlock:          { label: 'Stun on Block',       symbol: '✱', group: 'block', default: 0, format: 'percent', color: 'var(--wf-red-ui)', order: 4 },
  dodgeDr:              { label: 'Dodge DR',            symbol: '⊡', group: 'block', default: 0, format: 'percent', color: 'var(--wf-green-ui)', order: 5 },
  bulletJumpDr:         { label: 'Bullet Jump DR',      symbol: '⊡', group: 'block', default: 0, format: 'percent', color: 'var(--wf-green-ui)', order: 6 },

  // ── Weapon Stats ────────────────────────────────────────
  // (These live in the STAT_DISPLAY map for symbol resolution
  //  but are rendered by the hard-coded weapon section, not the
  //  dynamic warframe section.)
  damage:             { label: 'Damage',          symbol: '⊕',  group: 'weapon', default: 0, format: 'integer', color: 'var(--wf-red-ui)', order: 1 },
  multishot:          { label: 'Multishot',       symbol: '⊕',  group: 'weapon', default: 1, format: 'multiplier', color: 'var(--wf-teal-ui)', order: 2 },
  fireRate:           { label: 'Fire Rate',       symbol: '⚡',  group: 'weapon', default: 0, format: 'decimal', order: 3, suffix: '/s' },
  magazine:           { label: 'Magazine',        symbol: '◻',  group: 'weapon', default: 0, format: 'integer', color: 'var(--wf-purple)', order: 4 },
  reloadSpeed:        { label: 'Reload',          symbol: '↻',  group: 'weapon', default: 0, format: 'time', color: 'var(--wf-gold-accent)', order: 5 },
  burstDps:           { label: 'Burst DPS',       symbol: '⚡',  group: 'weapon', default: 0, format: 'integer', color: 'var(--wf-red-ui)', order: 6 },
  sustainedDps:       { label: 'Sustained DPS',   symbol: '⚡',  group: 'weapon', default: 0, format: 'integer', color: 'var(--wf-gold-accent)', order: 7 },
  critChance:         { label: 'Crit Chance',     symbol: '◎',  group: 'weapon', default: 0, format: 'percent', color: 'var(--wf-gold-accent)', order: 10 },
  critMultiplier:     { label: 'Crit Multiplier', symbol: '✖',  group: 'weapon', default: 1, format: 'multiplier', color: 'var(--wf-gold-accent)', order: 11 },
  statusChance:       { label: 'Status Chance',   symbol: '◈',  group: 'weapon', default: 0, format: 'percent', color: 'var(--wf-green-ui)', order: 12 },
  statusDuration:     { label: 'Duration',        symbol: '⏱',  group: 'weapon', default: 1, format: 'percent', order: 13 },
  headshotMultiplier: { label: 'Headshot',        symbol: '◎',  group: 'weapon', default: 2.0, format: 'multiplier', color: '#e8a030', order: 14 },
  accuracy:           { label: 'Accuracy',        symbol: '◎',  group: 'weapon', default: 100, format: 'integer', order: 20 },
  recoil:             { label: 'Recoil',          symbol: '↕',  group: 'weapon', default: 1.0, format: 'percent', order: 21 },
  zoom:               { label: 'Zoom',            symbol: '◉',  group: 'weapon', default: 1.0, format: 'percent', order: 22 },
  projectileSpeed:    { label: 'Proj. Speed',     symbol: '⚡',  group: 'weapon', default: 1.0, format: 'percent', order: 23 },
  punchThrough:       { label: 'Punch Through',   symbol: '→',  group: 'weapon', default: 0, format: 'decimal', color: 'var(--wf-green-ui)', order: 24, suffix: 'm' },
  maxAmmo:            { label: 'Max Ammo',        symbol: '◻',  group: 'weapon', default: 1, format: 'percent', order: 25 },
  blastRadius:        { label: 'Blast Radius',    symbol: '◎',  group: 'weapon', default: 1, format: 'percent', color: 'var(--wf-orange)', order: 26 },
  lifeSteal:          { label: 'Life Steal',      symbol: '♥',  group: 'weapon', default: 0, format: 'percent', color: 'var(--wf-red-ui)', order: 27 },
  meleeRange:         { label: 'Melee Range',     symbol: '↔',  group: 'weapon', default: 2.5, format: 'decimal', order: 30, suffix: 'm' },
  initialCombo:       { label: 'Initial Combo',   symbol: '⊕',  group: 'weapon', default: 0, format: 'integer', order: 31 },
  comboDuration:      { label: 'Combo Dur',       symbol: '⏱',  group: 'weapon', default: 5.0, format: 'time', order: 32 },
  comboChance:        { label: 'Combo Chance',    symbol: '⊕',  group: 'weapon', default: 0, format: 'percent', order: 33 },
  heavyEfficiency:    { label: 'Efficiency',      symbol: '◈',  group: 'weapon', default: 0, format: 'percent', order: 34 },
  heavyWindUp:        { label: 'Wind Up',         symbol: '⏱',  group: 'weapon', default: 1.0, format: 'time', order: 35 },
  channelingDamage:   { label: 'Channel Dmg',     symbol: '⚔',  group: 'weapon', default: 1, format: 'percent', color: 'var(--wf-gold-accent)', order: 36 },
  channelingCost:     { label: 'Channel Cost',    symbol: '◈',  group: 'weapon', default: 1, format: 'percent', order: 37 },
  slamAttack:         { label: 'Slam Dmg',        symbol: '⬇',  group: 'weapon', default: 1, format: 'percent', color: 'var(--wf-orange)', order: 38 },
  slideAttack:        { label: 'Slide Dmg',       symbol: '⇄',  group: 'weapon', default: 1, format: 'percent', color: 'var(--wf-orange)', order: 39 },
  finisherDamage:     { label: 'Finisher',        symbol: '✦',  group: 'weapon', default: 1, format: 'percent', color: 'var(--wf-red-ui)', order: 40 },
};

/** Reverse lookup: label → symbol from STAT_DISPLAY + overrides. */
const LABEL_SYMBOL_MAP: Record<string, string> = {
  'Sprint': '⚡',
  'Energy Regen': '+',
  'Shots to Kill': '⊘',
  '  → Shields': '◇',
  '  → Health': '♥',
  'Burst TTK': '⏱',
  'Sustained TTK': '⏱',
  'Dmg/Shot (HP)': '⊕',
  'Dmg/Shot (Shield)': '⊕',
  'Chance': '◎',        // matches both crit and status sub-rows
  'Multiplier': '✖',
  'Yellow': '☆',
  'Orange': '☆',
  'Red': '☆',
  'Per sec': '/s',
  'Headshot': '◎',
  'Weapon': '⊚',
  'Status types': '◈',
  'CO multiplier': '⊕',
  'GS multiplier': '⊕',
  'DPS Efficiency': '⊡',
  '  → ' : '',           // indent marker → no symbol
  'Ability Str.': '⤊',
  'Duration': '⏱',
  'Range': '◎',
  'Efficiency': '◈',
  'Casting Speed': '➤',
};
// Build from STAT_DISPLAY entries
for (const def of Object.values(STAT_DISPLAY)) {
  LABEL_SYMBOL_MAP[def.label] = def.symbol;
}

/**
 * Resolve a display symbol for a given label string.
 * Used by StatRow to auto-show symbols without explicit prop.
 */
export function resolveSymbol(label: string): string | undefined {
  return LABEL_SYMBOL_MAP[label];
}

/**
 * Resistance type display info.
 * These are dynamically populated from the `resistances` Record on CalculatedStats.
 */
export const RESISTANCE_DISPLAY: Record<string, { label: string; symbol: string; color: string }> = {
  heat:       { label: 'Heat',       symbol: '◉', color: 'var(--wf-orange)' },
  cold:       { label: 'Cold',       symbol: '◈', color: 'var(--wf-blue)' },
  electricity: { label: 'Electric',  symbol: '⚡', color: 'var(--wf-orange)' },
  toxin:      { label: 'Toxin',      symbol: '☠', color: '#60c060' },
  radiation:  { label: 'Radiation',  symbol: '☢', color: '#c0e040' },
  viral:      { label: 'Viral',      symbol: '◈', color: '#c060c0' },
  corrosive:  { label: 'Corrosive',  symbol: '◈', color: '#80c040' },
  blast:      { label: 'Blast',      symbol: '⊘', color: '#c08040' },
  gas:        { label: 'Gas',        symbol: '◌', color: '#80c040' },
  magnetic:   { label: 'Magnetic',   symbol: '⊡', color: '#4080c0' },
  tau:        { label: 'Tau',        symbol: '✦', color: '#e0c080' },
  elemental:  { label: 'Elemental',  symbol: '✦', color: 'var(--wf-purple)' },
  physical:   { label: 'Physical',   symbol: '◆', color: 'var(--wf-gray-light)' },
};

/**
 * Format a stat value for display based on its formatter type.
 */
export function formatStatValue(
  value: number,
  format: DisplayValueFormatter = 'percent',
): string {
  switch (format) {
    case 'percent':
      return ((value - 1) * 100).toFixed(value >= 10 ? 0 : 1) + '%';
    case 'multiplier':
      return value.toFixed(2) + 'x';
    case 'integer':
      return Math.round(value).toLocaleString();
    case 'decimal':
      return value.toFixed(1);
    case 'time':
      return value.toFixed(2) + 's';
    case 'raw':
    default:
      return String(value);
  }
}

/**
 * Check if a stat value differs from its default, meaning it should be shown.
 */
export function isStatModified(value: number | undefined | null, def: StatDisplayDef): boolean {
  if (value === undefined || value === null) return false;
  return Math.abs(value - def.default) > 0.001;
}
