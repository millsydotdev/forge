import { useBuildStore } from '../../store/buildStore';
import { useUiStore } from '../../store/uiStore';
import { gameData } from '../../data/game-data';

export function StatusBar() {
  const buildName = useBuildStore(s => s.buildName);
  const calculating = useBuildStore(s => s.calculating);
  const enemyEnabled = useBuildStore(s => s.enemyEnabled);
  const mr = useBuildStore(s => s.mr);
  const result = useBuildStore(s => s.result);
  const isDirty = useBuildStore(s => s.isDirty);
  const activeSlot = useUiStore(s => s.activeSlot);

  const dataVersion = gameData.version ?? '?';
  const slotCount = Object.keys(result?.weapons ?? {}).length;
  const enemyLabel = enemyEnabled ? 'ENABLED' : '—';

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className="status-bar__item" title={isDirty ? 'Unsaved changes' : 'Saved'}>
          <span className="status-bar__label">BUILD</span>
          <span className="status-bar__label" style={{ color: isDirty ? 'var(--wf-orange)' : 'var(--wf-green)', marginRight: 4 }}>
            {isDirty ? '○' : '●'}
          </span>
          <span className="status-bar__value">{buildName || 'Untitled'}</span>
        </span>
        {typeof mr === 'number' && mr > 0 && (
          <span className="status-bar__item">
            <span className="status-bar__label">MR</span>
            <span className="status-bar__value">{mr}</span>
          </span>
        )}
        {result && (
          <span className="status-bar__item">
            <span className="status-bar__label">EHP</span>
            <span className="status-bar__value">{result.ehp.toFixed(0)}</span>
          </span>
        )}
      </div>
      <div className="status-bar__center">
        {calculating && <span className="status-bar__item status-bar__item--pulse">Calculating…</span>}
      </div>
      <div className="status-bar__right">
        <span className="status-bar__item">
          <span className="status-bar__label">SLOT</span>
          <span className="status-bar__value">{activeSlot}</span>
        </span>
        <span className="status-bar__item">
          <span className="status-bar__label">ENEMY</span>
          <span className="status-bar__value">{enemyLabel}</span>
        </span>
        <span className="status-bar__item">
          <span className="status-bar__label">WEAPONS</span>
          <span className="status-bar__value">{slotCount}</span>
        </span>
        <span className="status-bar__item">
          <span className="status-bar__label">DATA v{dataVersion}</span>
        </span>
      </div>
    </div>
  );
}
