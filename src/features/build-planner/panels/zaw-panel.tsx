/**
 * Zaw Panel — configure grip, strike, link.
 *
 * Visual card-based part selector showing each Zaw part with
 * its image, name, and key melee stats. Data loaded from
 * @wfcd/items via WfcdDataService (Zaw parts are in Misc category with type "Zaw").
 */

import React, { useState, useEffect, useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ItemOption } from '../model';
import { AssetImage } from '../../../components/ui/AssetImage';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { calculateZawProfile, type ZawProfile } from '../calculators/zaw-calc';

// ── Zaw Part Types ────────────────────────────────────────
export type ZawPartType = 'grip' | 'strike' | 'link';

export interface ZawState {
  grip: string | null;      // uniqueName of selected grip
  strike: string | null;    // uniqueName of selected strike
  link: string | null;      // uniqueName of selected link
  /** Available part options (loaded from WfcdDataService). */
  parts: {
    grip: ItemOption[];
    strike: ItemOption[];
    link: ItemOption[];
  };
}

export function defaultZawState(): ZawState {
  return {
    grip: null, strike: null, link: null,
    parts: { grip: [], strike: [], link: [] },
  };
}

// ── Data Loading Helpers ──────────────────────────────────
async function loadZawParts(): Promise<{
  grip: ItemOption[]; strike: ItemOption[]; link: ItemOption[];
}> {
  try {
    // Zaw parts are stored in Misc category with type "Zaw"
    const all: ItemOption[] = await window.forge.getItems?.() ?? [];
    const isZawPart = (u: string) => u.includes('/Zaw/');
    const zawItems = all.filter(i => isZawPart(i.uniqueName));

    const grip: ItemOption[] = [];
    const strike: ItemOption[] = [];
    const link: ItemOption[] = [];

    for (const item of zawItems) {
      const u = item.uniqueName;
      if (u.includes('/Grip/')) grip.push(item);
      else if (u.includes('/Strike/')) strike.push(item);
      else if (u.includes('/Link/')) link.push(item);
    }

    // Sort by name
    const sort = (a: ItemOption, b: ItemOption) => a.name.localeCompare(b.name);
    grip.sort(sort);
    strike.sort(sort);
    link.sort(sort);

    return { grip, strike, link };
  } catch {
    return { grip: [], strike: [], link: [] };
  }
}

// ── Component ─────────────────────────────────────────────
function ZawSurface({ state, onChange }: PanelSurfaceProps<ZawState>) {
  const [loading, setLoading] = useState(true);
  const [gripDetail, setGripDetail] = useState<Record<string, unknown> | null>(null);
  const [strikeDetail, setStrikeDetail] = useState<Record<string, unknown> | null>(null);
  const [linkDetail, setLinkDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadZawParts().then(data => {
      onChange(prev => ({ ...prev, parts: data }));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load selected part details whenever selection changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!state.grip) { setGripDetail(null); return; }
    const gripId = state.grip;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(gripId);
        setGripDetail(d as unknown as Record<string, unknown> | null);
      } catch {
        setGripDetail(null);
      }
    };
    fetch();
  }, [state.grip]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!state.strike) { setStrikeDetail(null); return; }
    const strikeId = state.strike;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(strikeId);
        setStrikeDetail(d as unknown as Record<string, unknown> | null);
      } catch {
        setStrikeDetail(null);
      }
    };
    fetch();
  }, [state.strike]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!state.link) { setLinkDetail(null); return; }
    const linkId = state.link;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(linkId);
        setLinkDetail(d as unknown as Record<string, unknown> | null);
      } catch {
        setLinkDetail(null);
      }
    };
    fetch();
  }, [state.link]);

  const zawProfile = useMemo(() => {
    if (!state.strike) return null; // need at least strike to compute attack
    return calculateZawProfile(gripDetail, strikeDetail, linkDetail);
  }, [gripDetail, strikeDetail, linkDetail, state.strike]);

  if (loading) {
    return (
      <section className="surface-section selected">
        <div className="surface-header"><span>Zaw Builder</span></div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <SkeletonLoader variant="rect" width={48} height={48} borderRadius={8} />
          <SkeletonLoader variant="line" width={160} height={12} />
          <SkeletonLoader variant="line" width={120} height={10} />
        </div>
      </section>
    );
  }

  const setPart = (type: ZawPartType, id: string | null) => {
    onChange(prev => ({ ...prev, [type]: id }));
  };

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Zaw Builder</span></div>

      {/* ── Grip Section ── */}
      <ZawPartSection
        label="GRIP"
        sublabel="Handle"
        parts={state.parts.grip}
        selected={state.grip}
        onSelect={id => setPart('grip', id)}
      />

      {/* ── Strike Section ── */}
      <ZawPartSection
        label="STRIKE"
        sublabel="Blade"
        parts={state.parts.strike}
        selected={state.strike}
        onSelect={id => setPart('strike', id)}
      />

      {/* ── Link Section ── */}
      <ZawPartSection
        label="LINK"
        sublabel="Connector"
        parts={state.parts.link}
        selected={state.link}
        onSelect={id => setPart('link', id)}
      />

      {/* ── Zaw Stats Preview ── */}
      {zawProfile && <ZawStatsDisplay profile={zawProfile} />}
    </section>
  );
}

// ── Part Section ───────────────────────────────────────────
function ZawPartSection({
  label, sublabel, parts, selected, onSelect,
}: {
  label: string; sublabel: string;
  parts: ItemOption[]; selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  // Sort: selected first, then by name
  const sorted = useMemo(() => {
    const copy = [...parts];
    if (selected) {
      const idx = copy.findIndex(p => p.uniqueName === selected);
      if (idx > 0) {
        const [item] = copy.splice(idx, 1);
        copy.unshift(item);
      }
    }
    return copy;
  }, [parts, selected]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="amp-section-label"> {/* reuse AMP label styling for consistency */}
        {label} <span className="amp-section-sublabel">{sublabel}</span>
        <span className="amp-section-count">{parts.length} parts</span>
      </div>

      {/* Selected part detail bar */}
      {selected && <ZawPartDetailBar uniqueName={selected} onClear={() => onSelect(null)} />}

      {/* Part card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
        {sorted.map(p => (
          <ZawPartCard
            key={p.uniqueName}
            part={p}
            isSelected={p.uniqueName === selected}
            onClick={() => onSelect(p.uniqueName)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Part Card ──────────────────────────────────────────────
const cardBase: React.CSSProperties = {
  cursor: 'pointer',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 2,
  padding: 6,
  textAlign: 'center',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  userSelect: 'none',
};

function ZawPartCard({ part, isSelected, onClick }: { part: ItemOption; isSelected: boolean; onClick: () => void }) {
  const style: React.CSSProperties = {
    ...cardBase,
    borderColor: isSelected ? 'var(--wf-teal)' : 'rgba(255,255,255,0.08)',
    boxShadow: isSelected ? '0 0 8px rgba(0,220,245,0.35)' : 'none',
  };

  return (
    <div style={style} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <AssetImage className="zaw-part-card-img" imageName={part.imageName} />
      <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? 'var(--wf-teal)' : 'var(--wf-text-dim)', marginTop: 4 }}>{part.name}</div>
    </div>
  );
}

// ── Selected Part Detail Bar ───────────────────────────────
function ZawPartDetailBar({ uniqueName, onClear }: { uniqueName: string; onClear: () => void }) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await window.forge.getItemDetail(uniqueName);
        setDetail(d as Record<string, unknown> | null);
      } catch (e) { console.warn('[ZawPanel] getItemDetail failed:', e); setDetail(null); } // eslint-disable-line no-console
    })();
  }, [uniqueName]);

  if (!detail) return null;

  const dmg = detail.totalDamage ?? detail.damagePerShot;
  const atkSpeed = detail.attackSpeed as number | undefined;
  const slideSpeed = detail.slideAttackSpeed as number | undefined;
  const critChance = detail.criticalChance as number | undefined;
  const critMult = detail.criticalMultiplier as number | undefined;
  const status = detail.statusChance as number | undefined;

  const barStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '6px 10px', marginBottom: 8,
    background: 'rgba(0,220,245,0.06)',
    border: '1px solid rgba(0,220,245,0.2)',
    fontSize: 11,
  };

  return (
    <div style={barStyle}>
      <AssetImage className="zaw-part-card-img" imageName={(detail as unknown as { imageName?: string }).imageName} />
      <div style={{ fontWeight: 700, color: 'var(--wf-teal)', marginRight: 8 }}>{String(detail.name ?? '')}</div>
      {dmg != null && typeof dmg === 'number' && <span style={{ color: 'var(--wf-gold-accent)' }}>DMG: {dmg}</span>}
      {critChance != null && <span style={{ color: 'var(--wf-gold-accent)' }}>Crit: {(critChance * 100).toFixed(1)}% x{critMult}</span>}
      {status != null && <span style={{ color: 'var(--wf-green-ui)' }}>Status: {(status * 100).toFixed(1)}%</span>}
      {atkSpeed != null && <span style={{ color: 'var(--wf-text-dim)' }}>Atk Spd: {atkSpeed}/s</span>}
      {slideSpeed != null && <span style={{ color: 'var(--wf-text-dim)' }}>Slide Spd: {slideSpeed}/s</span>}
      <button type="button" className="header-btn" onClick={onClear} style={{ marginLeft: 'auto', fontSize: 10 }}>Clear</button>
    </div>
  );
}

// ── Zaw Stats Display ─────────────────────────────────────
const zawStatBoxStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 12,
  marginTop: 16,
  padding: 12,
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid var(--wf-border)',
};

function ZawStatsDisplay({ profile }: { profile: ZawProfile }) {
  return (
    <div style={zawStatBoxStyle}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wf-teal)', marginBottom: 4 }}>
        Zaw Preview: {profile.gripName} + {profile.strikeName} + {profile.linkName}
      </div>

      <div style={{ fontSize: 11, color: 'var(--wf-text-dim)' }}>
        <div>Damage: {Object.entries(profile.primary.damage).map(([t, d]) => `${d} ${t}`).join(' + ')}</div>
        <div>Crit: {(profile.primary.critChance * 100).toFixed(1)}% x{profile.primary.critMultiplier.toFixed(1)}</div>
        <div>Status: {(profile.primary.statusChance * 100).toFixed(1)}%</div>
        <div>Attack Speed: {profile.primary.attackSpeed.toFixed(2)} /s</div>
        <div>Slide Speed: {profile.primary.slideAttackSpeed.toFixed(2)} /s</div>
        <div>DPS: {profile.primary.dps.toFixed(0)}</div>
        <div>Status/s: {profile.primary.statusPerSecond.toFixed(1)}</div>
      </div>
    </div>
  );
}

// ── Register Panel ─────────────────────────────────────────
registerPanel<ZawState>({
  slotKey: 'zaw',
  label: 'ZAW',
  icon: 'ZW',
  Surface: ZawSurface,
  initialState: defaultZawState,
  order: 30,
});
