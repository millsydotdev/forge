/**
 * Panels barrel — auto-registers all panels on import.
 */
export { registerPanel, getPanel, getAllPanels, isPanelSlot, getNavEntries } from './panel-registry';
export type { PanelDescriptor, PanelSurfaceProps } from './panel-registry';

// Import panels to trigger registration
import './amp-panel';
import './railjack-panel';
import './kdrive-panel';
import './necramech-panel';
import './archwing-panel';
import './kitgun-panel';
import './operator-panel';
import './parazon-panel';
import './zaw-panel';

export type { AmpState, AmpPartType } from './amp-panel';
export type { RailjackState } from './railjack-panel';
export type { KDriveState } from './kdrive-panel';
export type { NecramechState } from './necramech-panel';
export type { ArchwingState } from './archwing-panel';
export type { KitgunState } from './kitgun-panel';
export type { OperatorState } from './operator-panel';
export type { ParazonState } from './parazon-panel';
export type { ZawState } from './zaw-panel';
