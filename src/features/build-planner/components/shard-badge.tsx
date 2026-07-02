import React from 'react';
import { SHARD_COLORS, SHARD_STAT_LABEL } from '../model';
import { RichTooltip } from '../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../components/ui/PresentationModel';
import type { ShardColor } from '../model';

export function ShardBadge({ shards, onChange }: { shards: (ShardColor | null)[]; onChange: (idx: number, color: ShardColor | null) => void }) {
  return (
    <div className="shard-rack">
      <span className="shard-rack-title">Archon Shards</span>
      {shards.map((s, i) => {
        const label = s ? `${SHARD_COLORS.find(sc => sc.value === s)?.label}: ${SHARD_STAT_LABEL[s]}` : 'Empty shard socket';
        const model = s ? buildPresentationModel({ name: label, uniqueName: `shard-${i}` }, 'shard') : null;
        return (
        <RichTooltip key={i} tooltip={model?.tooltip ?? { title: 'Empty Shard Socket', subtitle: 'Select a shard color to equip', sections: [] }}>
          <label className={'shard-socket' + (s ? ` ${s}` : '')}>
            <span className="shard-gem">{s ? SHARD_COLORS.find(sc => sc.value === s)?.label[0] : '+'}</span>
            <select value={s ?? ''} onChange={e => onChange(i, (e.target.value || null) as ShardColor | null)}>
              <option value="">Empty</option>
              {SHARD_COLORS.map(sc => <option key={sc.value} value={sc.value}>{sc.label} - {SHARD_STAT_LABEL[sc.value]}</option>)}
            </select>
            <small>{s ? SHARD_STAT_LABEL[s] : 'Open'}</small>
          </label>
        </RichTooltip>
        );
      })}
    </div>
  );
}
