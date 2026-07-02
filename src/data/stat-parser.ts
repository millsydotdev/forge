const STAT_RE = /([+-]?\d+(?:\.\d+)?)%?\s*(.*)/;
const COLOR_TAG = /<[^>]+>/g;

export function parseStatLine(line: string): { name: string; value: number; isPercent: boolean } | null {
  const cleaned = line.replace(COLOR_TAG, '').trim();
  const m = STAT_RE.exec(cleaned);
  if (!m) return null;
  const isPercent = cleaned.includes('%');
  return { name: m[2].trim(), value: +m[1], isPercent };
}

export function splitStatBlob(raw: string): string[] {
  const SHARED_CONDITIONS = [
    'when Aiming', 'when Airborne', 'when Crouching', 'while Blocking',
    'while Invisible', 'on Lifted enemies', 'on Heavy Attack',
    'on Slide Attack', 'on Slash Proc', 'on Kill', 'on Headshot',
    'on Critical Hit', 'on Status Effect', 'when below 50% Hull',
  ];

  const lines: string[] = [];
  for (const newlineSplit of raw.split('\n')) {
    const trimmed = newlineSplit.trim();
    if (!trimmed) continue;
    const andSplit = trimmed.split(/\s+and\s+(?=[+-]\d)/);
    for (const part of andSplit) {
      const m = STAT_RE.exec(part.replace(COLOR_TAG, '').trim());
      if (!m) {
        lines.push(part);
        continue;
      }
      const valuePart = m[1];
      const namePart = m[2].trim();
      const subHalves = namePart.split(/\s+and\s+/);
      if (subHalves.length > 1) {
        const lastHalf = subHalves[subHalves.length - 1];
        let sharedCondition = '';
        for (const cond of SHARED_CONDITIONS) {
          if (lastHalf.endsWith(cond) && lastHalf.length > cond.length) {
            sharedCondition = ' ' + cond;
            subHalves[subHalves.length - 1] = lastHalf.slice(0, -cond.length).trim();
            break;
          }
        }
        for (const half of subHalves) {
          lines.push(`${valuePart}% ${half.trim()}${sharedCondition}`);
        }
      } else {
        lines.push(part);
      }
    }
  }
  return lines;
}
