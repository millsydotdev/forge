/**
 * Panel Registry — extensible system for adding new domain panels.
 *
 * Each panel (Railjack, AMP, K-Drive, Necramech, etc.) registers itself
 * with the registry. The infrastructure (nav tabs, CenterSurface routing,
 * state management) is auto-generated from the registry.
 *
 * To add a new domain:
 *   1. Create a state interface + default factory
 *   2. Create a React surface component
 *   3. Call `registerPanel(...)` with the descriptor
 *   4. Add its slot to BuildSlot type in model.ts
 *   5. The nav tab, CenterSurface route, and state are auto-handled
 */

import React from 'react';
import { logger } from '../../../utils/logger';

/** Shape of a single registered panel. */
export interface PanelDescriptor<S = unknown> {
  /** Unique slot key matching BuildSlot. */
  slotKey: string;
  /** Nav label (short, e.g. "Railjack"). */
  label: string;
  /** Icon glyph for the nav tab. */
  icon: string;
  /** React component rendered in the center surface. */
  Surface: React.ComponentType<PanelSurfaceProps<S>>;
  /** Factory for blank state. */
  initialState: () => S;
  /** Optional: display order in nav (lower = earlier). Default 99. */
  order?: number;
}

/** Props passed to every panel surface. */
export interface PanelSurfaceProps<S> {
  state: S;
  onChange: (updater: S | ((prev: S) => S)) => void;
  allMods: import('../model').ItemOption[];
  placeMod: (uniqueName: string, index: number) => void;
  onAddRiven?: () => void;
}

// ── Registry ──────────────────────────────────────────────

const _registry = new Map<string, PanelDescriptor>();

export function registerPanel<S>(desc: PanelDescriptor<S>): void {
  if (_registry.has(desc.slotKey)) {
    logger.warn(`[PanelRegistry] Overwriting panel "${desc.slotKey}"`);
  }
  _registry.set(desc.slotKey, desc as PanelDescriptor);
}

export function getPanel(slotKey: string): PanelDescriptor | undefined {
  return _registry.get(slotKey);
}

export function getAllPanels(): PanelDescriptor[] {
  return [..._registry.values()].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function isPanelSlot(slotKey: string): boolean {
  return _registry.has(slotKey);
}

export function getNavEntries(): { key: string; icon: string; label: string }[] {
  return getAllPanels().map(p => ({ key: p.slotKey, icon: p.icon, label: p.label }));
}
