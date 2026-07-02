/**
 * Kitgun Panel — configure receiver, grip, barrel.
 *
 * Visual card-based part selector showing each Kitgun part with
 * its image, name, and key firearm stats. Data loaded from
 * @wfcd/items via WfcdDataService (Kitgun parts are in Misc category with type "Kitgun").
 */

import React, { useState, useEffect, useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ItemOption } from '../model';
import { AssetImage } from '../../../components/ui/AssetImage';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { calculateKitgunProfile, type KitgunProfile } from '../calculators/kitgun-calc';

// ── Kitgun Part Types ────────────────────────────────────────
export type KitgunPartType = 'receiver' | 'grip' | 'barrel';

export interface KitgunState {
  receiver: string | null; // uniqueName of selected receiver
  grip: string | null;     // uniqueName of selected grip
  barrel: string | null;   // uniqueName of selected barrel
  /** Available part options (loaded from WfcdDataService). */
  parts: {
    receiver: ItemOption[];
    grip: ItemOption[];
    barrel: ItemOption[];
  };
}

export function defaultKitgunState(): KitgunState {
  return {
    receiver: null, grip: null, barrel: null,
    parts: { receiver: [], grip: [], barrel: [] },
  };
}

// ── Data Loading Helpers ─────────────────────────────────────
async function loadKitgunParts(): Promise<{
  receiver: ItemOption[]; grip: ItemOption[]; barrel: ItemOption[];
}> {
  try {
    // Kitgun parts are stored in Misc category with type "Kitgun"
    const all: ItemOption[] = await window.forge.getItems?.() ?? [];
    const isKitgunPart = (u: string) => u.includes('/Kitgun/');
    const kitgunItems = all.filter(i => isKitgunPart(i.uniqueName));

    const receiver: ItemOption[] = [];
    const grip: ItemOption[] = [];
    const barrel: ItemOption[] = [];

    for (const item of kitgunItems) {
      const u = item.uniqueName;
      if (u.includes('/Receiver/')) receiver.push(item);
      else if (u.includes('/Grip/')) grip.push(item);
      else if (u.includes('/Barrel/')) barrel.push(item);
    }

    // Sort by name
    const sort = (a: ItemOption, b: ItemOption) => a.name.localeCompare(b.name);
    receiver.sort(sort);
    grip.sort(sort);
    barrel.sort(sort);

    return { receiver, grip, barrel };
  } catch {
    return { receiver: [], grip: [], barrel: [] };
  }
}

// ── Component ───────────────────────────────────────────────
function KitgunSurface({ state, onChange }: PanelSurfaceProps<KitgunState>) {
  const [loading, setLoading] = useState(true);
  const [receiverDetail, setReceiverDetail] = useState<Record<string, unknown> | null>(null);
  const [gripDetail, setGripDetail] = useState<Record<string, unknown> | null>(null);
  const [barrelDetail, setBarrelDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadKitgunParts().then(data => {
      onChange(prev => ({ ...prev, parts: data }));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load selected part details whenever selection changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!state.receiver) { setReceiverDetail(null); return; }
    const receiverId = state.receiver;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(receiverId);
        setReceiverDetail(d as unknown as Record<string, unknown> | null);
      } catch {
        setReceiverDetail(null);
      }
    };
    fetch();
  }, [state.receiver]);
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
    if (!state.barrel) { setBarrelDetail(null); return; }
    const barrelId = state.barrel;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(barrelId);
        setBarrelDetail(d as unknown as Record<string, unknown> | null);
      } catch {
        setBarrelDetail(null);
      }
    };
    fetch();
  }, [state.barrel]);

  const kitgunProfile = useMemo(() => {
    if (!state.barrel) return null; // need barrel for fire mode
    return calculateKitgunProfile(receiverDetail, gripDetail, barrelDetail);
  }, [receiverDetail, gripDetail, barrelDetail, state.barrel]);

  if (loading) {
    return (
      <section className="surface-section selected">
        <div className="surface-header"><span>Kitgun Builder</span></div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <SkeletonLoader variant="rect" width={48} height={48} borderRadius={8} />
          <SkeletonLoader variant="line" width={160} height={12} />
          <SkeletonLoader variant="line" width={120} height={10} />
        </div>
      </section>
    );
  }

  const setPart = (type: KitgunPartType, id: string | null) => {
    onChange(prev => ({ ...prev, [type]: id }));
  };

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Kitgun Builder</span></div>

      {/* ── Receiver Section ── */}
      <KitgunPartSection
        label="RECEIVER"
        sublabel="Frame"
        parts={state.parts.receiver}
        selected={state.receiver}
        onSelect={id => setPart('receiver', id)}
      />

      {/* ── Grip Section ── */}
      <KitgunPartSection
        label="GRIP"
        sublabel="Handle"
        parts={state.parts.grip}
        selected={state.grip}
        onSelect={id => setPart('grip', id)}
      />

      {/* ── Barrel Section ── */}
      <KitgunPartSection
        label="BARREL"
        sublabel="Barrel"
        parts={state.parts.barrel}
        selected={state.barrel}
        onSelect={id => setPart('barrel', id)}
      />

      {/* ── Kitgun Stats Preview ── */}
      {kitgunProfile && <KitgunStatsDisplay profile={kitgunProfile} />}
    </section>
  );
}

// ── Part Section ────────────────────────────────────────────
function KitgunPartSection({
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
      <div className="amp-section-label">
        {label} <span className="amp-section-sublabel">{sublabel}</span>
        <span className="amp-section-count">{parts.length} parts</span>
      </div>

      {/* Selected part detail bar */}
      {selected && <KitgunPartDetailBar uniqueName={selected} onClear={() => onSelect(null)} />}

      {/* Part card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
        {sorted.map(p => (
          <KitgunPartCard
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

// ── Part Card ───────────────────────────────────────────────
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

function KitgunPartCard({ part, isSelected, onClick }: { part: ItemOption; isSelected: boolean; onClick: () => void }) {
  const style: React.CSSProperties = {
    ...cardBase,
    borderColor: isSelected ? 'var(--wf-teal)' : 'rgba(255,255,255,0.08)',
    boxShadow: isSelected ? '0 0 8px rgba(0,220,245,0.35)' : 'none',
  };

  return (
    <div style={style} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <AssetImage className="kitgun-part-card-img" imageName={part.imageName} />
      <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? 'var(--wf-teal)' : 'var(--wf-text-dim)', marginTop: 4 }}>{part.name}</div>
    </div>
  );
}

// ── Selected Part Detail Bar ────────────────────────────────
function KitgunPartDetailBar({ uniqueName, onClear }: { uniqueName: string; onClear: () => void }) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await window.forge.getItemDetail(uniqueName);
        setDetail(d as Record<string, unknown> | null);
      } catch (e) { console.warn('[KitgunPanel] getItemDetail failed:', e); setDetail(null); } // eslint-disable-line no-console
    })();
  }, [uniqueName]);

  if (!detail) return null;

  const dmg = detail.totalDamage ?? detail.damagePerShot;
  const fireRate = detail.fireRate as number | undefined;
  const reloadTime = detail.reloadTime as number | undefined;
  const magazine = detail.magazine as number | undefined;
  const critChance = detail.criticalChance as number | undefined;
  const critMult = detail.criticalMultiplier as number | undefined;
  const status = detail.procChance as number | undefined;

  const barStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '6px 10px', marginBottom: 8,
    background: 'rgba(0,220,245,0.06)',
    border: '1px solid rgba(0,220,245,0.2)',
    fontSize: 11,
  };

  return (
    <div style={barStyle}>
      <AssetImage className="kitgun-part-card-img" imageName={(detail as unknown as { imageName?: string }).imageName} />
      <div style={{ fontWeight: 700, color: 'var(--wf-teal)', marginRight: 8 }}>{String(detail.name ?? '')}</div>
      {dmg != null && typeof dmg === 'number' && <span style={{ color: 'var(--wf-gold-accent)' }}>DMG: {dmg}</span>}
      {critChance != null && <span style={{ color: 'var(--wf-gold-accent)' }}>Crit: {(critChance * 100).toFixed(1)}% x{critMult}</span>}
      {status != null && <span style={{ color: 'var(--wf-green-ui)' }}>Status: {(status * 100).toFixed(1)}%</span>}
      {fireRate != null && <span style={{ color: 'var(--wf-text-dim)' }}>Fire Rate: {fireRate}/s</span>}
      {reloadTime != null && <span style={{ color: 'var(--wf-text-dim)' }}>Reload: {reloadTime}s</span>}
      {magazine != null && <span style={{ color: 'var(--wf-text-dim)' }}>Mag: {magazine}</span>}
      <button type="button" className="header-btn" onClick={onClear} style={{ marginLeft: 'auto', fontSize: 10 }}>Clear</button>
    </div>
  );
}

// ── Kitgun Stats Display ───────────────────────────────────
const kitgunStatBoxStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 12,
  marginTop: 16,
  padding: 12,
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid var(--wf-border)',
};

function KitgunStatsDisplay({ profile }: { profile: KitgunProfile }) {
  return (
    <div style={kitgunStatBoxStyle}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wf-teal)', marginBottom: 4 }}>
        Kitgun Preview: {profile.receiverName} + {profile.gripName} + {profile.barrelName}
      </div>

      <div style={{ fontSize: 11, color: 'var(--wf-text-dim)' }}>
        <div>Damage: {Object.entries(profile.primary.damage).map(([t, d]) => `${d} ${t}`).join(' + ')}</div>
        <div>Crit: {(profile.primary.critChance * 100).toFixed(1)}% x{profile.primary.critMultiplier.toFixed(1)}</div>
        <div>Status: {(profile.primary.statusChance * 100).toFixed(1)}%</div>
        <div>Fire Rate: {profile.primary.fireRate.toFixed(2)} /s</div>
        <div>Reload: {profile.primary.reloadTime.toFixed(2)} s</div>
        <div>Magazine: {profile.primary.magazine}</div>
        <div>DPS: {profile.primary.dps.toFixed(0)}</div>
        <div>Status/s: {profile.primary.statusPerSecond.toFixed(1)}</div>
      </div>
    </div>
  );
}

// ── Register Panel ─────────────────────────────────────────
registerPanel<KitgunState>({
  slotKey: 'kitgun',
  label: 'KITGUN',
  icon: 'KG',
  Surface: KitgunSurface,
  initialState: defaultKitgunState,
  order: 40,
});
