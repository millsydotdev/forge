import React, { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUiStore } from '../../store/uiStore';
import type { BuildPlannerState } from './types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dropdown } from '../../components/ui/Dropdown';
import { Brand } from '../../services/visual-manager';

export function TopBar({ state, onExport, onImport, onNewBuild }: {
  state: BuildPlannerState;
  onExport: () => void;
  onImport: () => void;
  onNewBuild: () => void;
}) {
  const {
    buildName, setBuildName, mr, setMr,
    loadouts, saveLoadout, loadLoadout,
    calculating, setToast, result,
  } = state;

  const ui = useUiStore(useShallow(s => ({ setShowHistory: s.setShowHistory, setShowCompare: s.setShowCompare })));
  
  const handleSave = useCallback(() => {
    saveLoadout(buildName);
    setToast?.({ message: 'Build saved', type: 'success' });
  }, [buildName, saveLoadout, setToast]);

  const handleLoad = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    loadLoadout(loadouts[val]);
    setBuildName(val);
    e.target.value = '';
  }, [loadouts, loadLoadout, setBuildName]);

  return (
    <header className="wb-topbar">
      <div className="wb-topbar__brand" aria-label={Brand.productName}>
        ⬡ {Brand.productName}
      </div>

      <Input
        className="wb-topbar__build-name"
        value={buildName}
        onChange={e => setBuildName(e.target.value.slice(0, 64))}
        placeholder="Untitled Build"
        maxLength={64}
        aria-label="Build name"
        style={{ width: 'auto', flex: 1, margin: '0 12px' }}
      />

      <div className="wb-topbar__stats" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--wf-text-dim)', fontWeight: 600 }}>MR</span>
        <Input
          type="number"
          value={mr}
          onChange={e => setMr(Math.max(0, Math.min(30, +e.target.value || 0)))}
          disabled={calculating}
          aria-label="Mastery Rank"
          style={{ width: 50, textAlign: 'center', margin: 0 }}
        />
      </div>

      <Button 
        variant="primary" 
        size="sm" 
        onClick={handleSave} 
        disabled={calculating}
        className="wb-topbar__btn"
      >
        Save
      </Button>

      {Object.keys(loadouts).length > 0 && (
        <select className="wb-topbar__build-name" style={{ width: 'auto', margin: '0 8px' }} onChange={handleLoad} defaultValue="" aria-label="Load build">
          <option value="" disabled>Load…</option>
          {Object.keys(loadouts).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      )}

      <Dropdown 
        align="left"
        trigger={<Button variant="secondary" size="sm" className="wb-topbar__btn">Share ▾</Button>}
        items={[
          { label: 'Export Code', onClick: onExport },
          { label: 'Import Code', onClick: onImport },
        ]}
      />

      <Dropdown 
        align="right"
        trigger={<Button variant="secondary" size="sm" className="wb-topbar__btn" aria-label="Menu">≡</Button>}
        items={[
          { label: 'New Build', onClick: onNewBuild },
          { label: 'History', onClick: () => ui.setShowHistory(true) },
          { label: 'Compare Builds', onClick: () => ui.setShowCompare(true), disabled: !result },
        ]}
      />
    </header>
  );
}
