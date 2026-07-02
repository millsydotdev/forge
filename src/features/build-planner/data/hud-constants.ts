export const DMG_LABELS: Record<string, string> = {
  impact: 'IMP', puncture: 'PUN', slash: 'SLA',
  heat: 'HEAT', cold: 'COLD', electric: 'ELEC', toxin: 'TOX',
  blast: 'BLAST', radiation: 'RAD', gas: 'GAS', magnetic: 'MAG',
  viral: 'VIRAL', corrosive: 'CORR', void: 'VOID',
};

export const DMG_COLORS: Record<string, string> = {
  impact: 'var(--wf-gray-light)', puncture: 'var(--wf-teal-ui)', slash: 'var(--wf-red-ui)',
  heat: 'var(--wf-orange)', cold: 'var(--wf-blue)', electric: 'var(--wf-orange)', toxin: '#60c060',
  blast: '#c08040', radiation: '#c0e040', gas: '#80c040', magnetic: '#4080c0',
  viral: '#c060c0', corrosive: '#80c040', void: '#e0c080',
};

export const PHYSICAL_LABELS = new Set(['impact', 'puncture', 'slash']);

export const DOT_ENTRIES: readonly {
  key: 'slashBleedDps' | 'heatBurnDps' | 'toxinDps' | 'gasDps' | 'electricDps';
  tick: 'slashBleedTick' | 'heatBurnTick' | 'toxinTick' | 'gasTick' | 'electricTick';
  label: string;
  color: string;
  icon: string;
}[] = [
  { key: 'slashBleedDps', tick: 'slashBleedTick', label: 'Slash Bleed', color: 'var(--wf-red-ui)', icon: '✧' },
  { key: 'heatBurnDps', tick: 'heatBurnTick', label: 'Heat Burn', color: 'var(--wf-orange)', icon: '✦' },
  { key: 'toxinDps', tick: 'toxinTick', label: 'Toxin', color: '#60c060', icon: '◆' },
  { key: 'gasDps', tick: 'gasTick', label: 'Gas', color: '#80c040', icon: '⬡' },
  { key: 'electricDps', tick: 'electricTick', label: 'Electric', color: 'var(--wf-orange)', icon: '⚡' },
] as const;
