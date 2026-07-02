/**
 * AMP Panel — configure prism, scaffold, brace, arcane.
 *
 * Visual card-based part selector showing each AMP part with
 * its image, name, and key combat stats. Data loaded from
 * @wfcd/items via WfcdDataService (24 AMP parts, 13 AMP arcanes).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ItemOption } from '../model';
import { AssetImage } from '../../../components/ui/AssetImage';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { calculateAmpProfile, type AmpProfile, type AmpFireMode, type AmpPassiveBonuses } from '../calculators/amp-calc';

// ── Types ──────────────────────────────────────────────────
export type AmpPartType = 'prism' | 'scaffold' | 'brace';

export interface AmpState {
  prism: string | null;
  scaffold: string | null;
  brace: string | null;
  arcane: string | null;
  parts: { prism: ItemOption[]; scaffold: ItemOption[]; brace: ItemOption[] };
  arcanes: ItemOption[];
}

export function defaultAmpState(): AmpState {
  return {
    prism: null, scaffold: null, brace: null, arcane: null,
    parts: { prism: [], scaffold: [], brace: [] }, arcanes: [],
  };
}

// ── Data Loading ───────────────────────────────────────────
async function loadAmpData(): Promise<AmpState['parts'] & { arcanes: ItemOption[] }> {
  try {
    const ampItems: ItemOption[] = await window.forge.getItems?.('Amp') ?? [];
    const allArcanes: ItemOption[] = await window.forge.getItems?.('Arcanes') ?? [];
    const ampArcanes = allArcanes.filter(a => a.type === 'Amp Arcane');

    const prism: ItemOption[] = [];
    const scaffold: ItemOption[] = [];
    const brace: ItemOption[] = [];

    for (const item of ampItems) {
      const u = item.uniqueName;
      if (u.includes('/Barrel/') || u.includes('/TrainingBarrel')) prism.push(item);
      else if (u.includes('/Chassis/') || u.includes('/TrainingChassis')) scaffold.push(item);
      else if (u.includes('/Grip/') || u.includes('/TrainingGrip')) brace.push(item);
    }

    // Sort by name
    const sort = (a: ItemOption, b: ItemOption) => a.name.localeCompare(b.name);
    prism.sort(sort);
    scaffold.sort(sort);
    brace.sort(sort);

    return { prism, scaffold, brace, arcanes: ampArcanes };
  } catch {
    return { prism: [], scaffold: [], brace: [], arcanes: [] };
  }
}

// ── CSS-in-JS helper for the card grid ─────────────────────
const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 8,
  marginBottom: 8,
};

// ── Main Surface Component ─────────────────────────────────
function AmpSurface({ state, onChange }: PanelSurfaceProps<AmpState>) {
  const [loading, setLoading] = useState(true);
  const [prismDetail, setPrismDetail] = useState<Record<string, unknown> | null>(null);
  const [scaffoldDetail, setScaffoldDetail] = useState<Record<string, unknown> | null>(null);
  const [braceDetail, setBraceDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadAmpData().then(data => {
      onChange(prev => ({ ...prev, parts: { prism: data.prism, scaffold: data.scaffold, brace: data.brace }, arcanes: data.arcanes }));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load selected part details whenever selection changes
  useEffect(() => {
    if (!state.prism) {
      setTimeout(() => setPrismDetail(null), 0);
      return;
    }
    const prismId = state.prism;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(prismId);
        setPrismDetail(d as unknown as Record<string, unknown> | null);
      } catch {
        setPrismDetail(null);
      }
    };
    fetch();
  }, [state.prism]);
  useEffect(() => {
    if (!state.scaffold) {
      setTimeout(() => setScaffoldDetail(null), 0);
      return;
    }
    const scaffoldId = state.scaffold;
    window.forge.getItemDetail(scaffoldId).then(d => setScaffoldDetail(d as unknown as Record<string, unknown> | null)).catch(() => setScaffoldDetail(null));
  }, [state.scaffold]);
  useEffect(() => {
    if (!state.brace) {
      setTimeout(() => setBraceDetail(null), 0);
      return;
    }
    const braceId = state.brace;
    window.forge.getItemDetail(braceId).then(d => setBraceDetail(d as unknown as Record<string, unknown> | null)).catch(() => setBraceDetail(null));
  }, [state.brace]);

  const profile = useMemo(() => {
    if (!state.prism && !state.scaffold) return null;
    return calculateAmpProfile(prismDetail, scaffoldDetail, braceDetail, state.arcane);
  }, [state.prism, state.scaffold, prismDetail, scaffoldDetail, braceDetail, state.arcane]);

  if (loading) {
    return (
      <section className="surface-section selected">
        <div className="surface-header"><span>AMP Configuration</span></div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <SkeletonLoader variant="rect" width={48} height={48} borderRadius={8} />
          <SkeletonLoader variant="line" width={160} height={12} />
          <SkeletonLoader variant="line" width={120} height={10} />
        </div>
      </section>
    );
  }

  const setPart = (type: AmpPartType, id: string | null) => {
    onChange(prev => ({ ...prev, [type]: id }));
  };

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>AMP Configuration</span></div>

      {/* ── Prism Section ── */}
      <AmpPartSection
        label="PRISM"
        sublabel="Primary Fire"
        parts={state.parts.prism}
        selected={state.prism}
        onSelect={id => setPart('prism', id)}
      />

      {/* ── Scaffold Section ── */}
      <AmpPartSection
        label="SCAFFOLD"
        sublabel="Secondary Fire"
        parts={state.parts.scaffold}
        selected={state.scaffold}
        onSelect={id => setPart('scaffold', id)}
      />

      {/* ── Brace Section ── */}
      <AmpPartSection
        label="BRACE"
        sublabel="Passive Bonus"
        parts={state.parts.brace}
        selected={state.brace}
        onSelect={id => setPart('brace', id)}
      />

      {/* ── Arcane Selector ── */}
      <div style={{ marginTop: 16 }}>
        <div className="amp-section-label">ARCANE</div>
        <select
          className="dex-select"
          value={state.arcane ?? ''}
          onChange={e => onChange(prev => ({ ...prev, arcane: e.target.value || null }))}
          style={{ maxWidth: 300 }}
        >
          <option value="">— None —</option>
          {state.arcanes.map(a => (
            <option key={a.uniqueName} value={a.uniqueName}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* ── Computed AMP Stats ── */}
      {profile && <AmpStatsDisplay profile={profile} />}
    </section>
  );
}

// ── AMP Stats Display ─────────────────────────────────────
const statBoxStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  marginTop: 16,
  padding: 12,
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid var(--wf-border)',
};

const fireModeStyle: React.CSSProperties = {};

const statLineStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  fontSize: 11, padding: '2px 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
};

function AmpStatsDisplay({ profile }: { profile: AmpProfile }) {
  return (
    <div style={statBoxStyle}>
      <div style={fireModeStyle}>
        <FireModeCard label="Primary" prefix="[P]" mode={profile.primary} />
      </div>
      <div style={fireModeStyle}>
        <FireModeCard label="Secondary" prefix="[S]" mode={profile.secondary} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <PassiveBar passives={profile.passives} />
      </div>
      <div style={{ gridColumn: '1 / -1', fontSize: 10, color: 'var(--wf-text-dim)' }}>
        Combined eDPS: <span className="gold">{(profile.primary.critScaledDps + profile.secondary.critScaledDps).toFixed(0)}</span>
        {' | '}Burst: <span className="gold">{(profile.primary.burstDps + profile.secondary.burstDps).toFixed(0)}</span>
        {profile.arcaneName && <span> | Arcane: {profile.arcaneName}</span>}
      </div>
    </div>
  );
}

function FireModeCard({ label, prefix, mode }: { label: string; prefix: string; mode: AmpFireMode }) {
  const dmgStr = Object.entries(mode.damage)
    .map(([t, d]) => `${d} ${t.charAt(0).toUpperCase() + t.slice(1)}`)
    .join(' + ') || '—';

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--wf-teal)', marginBottom: 4, letterSpacing: 1 }}>
        {prefix} {label}
      </div>
      <div style={statLineStyle}><span>Damage</span><span style={{ color: 'var(--wf-gold-accent)' }}>{dmgStr}</span></div>
      <div style={statLineStyle}><span>Crit</span><span>{(mode.critChance * 100).toFixed(1)}% x{mode.critMultiplier.toFixed(1)}</span></div>
      <div style={statLineStyle}><span>Status</span><span>{(mode.statusChance * 100).toFixed(1)}%</span></div>
      <div style={statLineStyle}><span>Fire Rate</span><span>{mode.fireRate.toFixed(1)}/s</span></div>
      <div style={statLineStyle}><span>Burst DPS</span><span style={{ color: 'var(--wf-gold-accent)' }}>{mode.burstDps.toFixed(0)}</span></div>
      <div style={statLineStyle}><span>Sustained DPS</span><span style={{ color: 'var(--wf-gold-accent)' }}>{mode.sustainedDps.toFixed(0)}</span></div>
      <div style={statLineStyle}><span>Crit-e DPS</span><span style={{ color: 'var(--wf-teal)' }}>{mode.critScaledDps.toFixed(0)}</span></div>
    </div>
  );
}

function PassiveBar({ passives }: { passives: AmpPassiveBonuses }) {
  const items: string[] = [];
  if (passives.maxAmmo) items.push(`+${passives.maxAmmo} Max Ammo`);
  if (passives.energyRegen) items.push(`+${passives.energyRegen} Energy Regen`);
  if (passives.magazineBonus) items.push(`+${passives.magazineBonus} Magazine`);
  if (passives.reloadBonus) items.push(`+${(passives.reloadBonus * 100).toFixed(0)}% Reload Speed`);

  if (items.length === 0) return null;

  return (
    <div style={{ fontSize: 10, color: 'var(--wf-text-dim)', padding: '4px 0' }}>
      <span style={{ fontWeight: 700, color: 'var(--wf-gold-accent)', marginRight: 8 }}>Passives:</span>
      {items.join(' | ')}
    </div>
  );
}

// ── Part Section ───────────────────────────────────────────
function AmpPartSection({
  label, sublabel, parts, selected, onSelect,
}: {
  label: string; sublabel: string;
  parts: ItemOption[]; selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  // Group parts: selected first, then by name
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
      <div className="amp-section-label">
        {label} <span className="amp-section-sublabel">{sublabel}</span>
        <span className="amp-section-count">{parts.length} parts</span>
      </div>

      {/* Selected part detail bar */}
      {selected && <AmpPartDetailBar uniqueName={selected} onClear={() => onSelect(null)} />}

      {/* Part card grid */}
      <div style={cardGridStyle}>
        {sorted.map(p => (
          <AmpPartCard
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

function AmpPartCard({ part, isSelected, onClick }: { part: ItemOption; isSelected: boolean; onClick: () => void }) {
  const style: React.CSSProperties = {
    ...cardBase,
    borderColor: isSelected ? 'var(--wf-teal)' : 'rgba(255,255,255,0.08)',
    boxShadow: isSelected ? '0 0 8px rgba(0,220,245,0.35)' : 'none',
  };

  return (
    <div style={style} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <AssetImage className="amp-part-card-img" imageName={part.imageName} />
      <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? 'var(--wf-teal)' : 'var(--wf-text-dim)', marginTop: 4 }}>{part.name}</div>
    </div>
  );
}

// ── Selected Part Detail Bar ───────────────────────────────
function AmpPartDetailBar({ uniqueName, onClear }: { uniqueName: string; onClear: () => void }) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await window.forge.getItemDetail(uniqueName);
        setDetail(d as Record<string, unknown> | null);
      } catch (e) { console.warn('[AmpPanel] getItemDetail failed:', e); setDetail(null); } // eslint-disable-line no-console
    })();
  }, [uniqueName]);

  if (!detail) return null;

  const dmg = detail.totalDamage ?? detail.damagePerShot;
  const critChance = detail.criticalChance as number | undefined;
  const critMult = detail.criticalMultiplier as number | undefined;
  const status = detail.procChance as number | undefined;
  const fireRate = detail.fireRate as number | undefined;
  const attacks = detail.attacks as { name: string; damage: Record<string, number> }[] | undefined;

  const barStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '6px 10px', marginBottom: 8,
    background: 'rgba(0,220,245,0.06)',
    border: '1px solid rgba(0,220,245,0.2)',
    fontSize: 11,
  };

  return (
    <div style={barStyle}>
      <AssetImage className="amp-part-card-img" imageName={(detail as unknown as { imageName?: string }).imageName} />
      <div style={{ fontWeight: 700, color: 'var(--wf-teal)', marginRight: 8 }}>{String(detail.name ?? '')}</div>
      {attacks && attacks.length > 0 && (
        <span style={{ color: 'var(--wf-text-dim)' }}>
          {attacks.map(a => `${a.name}: ${Object.entries(a.damage).map(([t,d]) => `${d} ${t}`).join(' + ')}`).join(' | ')}
        </span>
      )}
      {dmg != null && typeof dmg === 'number' && <span style={{ color: 'var(--wf-gold-accent)' }}>DMG: {dmg}</span>}
      {critChance != null && <span style={{ color: 'var(--wf-gold-accent)' }}>Crit: {(critChance * 100).toFixed(1)}% x{critMult}</span>}
      {status != null && <span style={{ color: 'var(--wf-green-ui)' }}>Status: {(status * 100).toFixed(1)}%</span>}
      {fireRate != null && <span style={{ color: 'var(--wf-text-dim)' }}>Fire Rate: {fireRate}/s</span>}
      <button type="button" className="header-btn" onClick={onClear} style={{ marginLeft: 'auto', fontSize: 10 }}>Clear</button>
    </div>
  );
}

// ── Register ───────────────────────────────────────────────
registerPanel<AmpState>({
  slotKey: 'amp',
  label: 'AMP',
  icon: 'AP',
  Surface: AmpSurface,
  initialState: defaultAmpState,
  order: 20,
});
