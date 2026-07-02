import { useState, useEffect } from 'react';
import { useBuildStore } from '../../store/buildStore';
import { gameData } from '../../data/game-data';

type DiagTab = 'performance' | 'memory' | 'engine' | 'cache' | 'system';

export function DiagnosticsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DiagTab>('performance');
  const [fps, setFps] = useState(60);
  const [perfEntries, setPerfEntries] = useState<PerformanceEntryList>([]);
  const result = useBuildStore(s => s.result);
  const calculating = useBuildStore(s => s.calculating);

  // Simple FPS counter
  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    const raf = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round(frames * 1000 / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerfEntries(performance.getEntriesByType('measure').slice(-50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { key: DiagTab; label: string }[] = [
    { key: 'performance', label: 'Performance' },
    { key: 'memory', label: 'Memory' },
    { key: 'engine', label: 'Engine' },
    { key: 'cache', label: 'Cache' },
    { key: 'system', label: 'System' },
  ];

  return (
    <div className="diag-overlay" onClick={onClose}>
      <div className="diag-panel" onClick={e => e.stopPropagation()}>
        <div className="diag-header">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--wf-teal)' }}>
            ⚡ Diagnostics
          </span>
          <button className="diag-close" onClick={onClose}>✕</button>
        </div>
        <div className="diag-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`diag-tab ${activeTab === t.key ? 'diag-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >{t.label}</button>
          ))}
        </div>
        <div className="diag-body">
          {activeTab === 'performance' && <PerfTab fps={fps} entries={perfEntries} />}
          {activeTab === 'memory' && <MemoryTab />}
          {activeTab === 'engine' && <EngineTab result={result} calculating={calculating} />}
          {activeTab === 'cache' && <CacheTab />}
          {activeTab === 'system' && <SystemTab />}
        </div>
      </div>
    </div>
  );
}

function PerfTab({ fps, entries }: { fps: number; entries: PerformanceEntryList }) {
  return (
    <div className="diag-section">
      <div className="diag-section-title">Live Metrics</div>
      <div className="diag-metric-grid">
        <div className="diag-metric">
          <span className="diag-metric-label">FPS</span>
          <span className="diag-metric-value" style={{ color: fps >= 55 ? 'var(--wf-green)' : fps >= 30 ? 'var(--wf-orange)' : 'var(--wf-red)' }}>
            {fps}
          </span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Perf Marks</span>
          <span className="diag-metric-value">{entries.length}</span>
        </div>
      </div>
      <div className="diag-section-title" style={{ marginTop: 12 }}>Recent Measurements</div>
      <div className="diag-list">
        {entries.length === 0 && <div className="diag-empty">No measurements recorded yet. Interact with the app to generate data.</div>}
        {entries.slice().reverse().map((e, i) => (
          <div key={i} className="diag-list-item">
            <span className="diag-list-label">{e.name}</span>
            <span className="diag-list-value">{e.duration.toFixed(2)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryTab() {
  const mem = (performance as any).memory;
  return (
    <div className="diag-section">
      <div className="diag-section-title">Memory Usage</div>
      {mem ? (
        <div className="diag-metric-grid">
          <div className="diag-metric">
            <span className="diag-metric-label">Heap Used</span>
            <span className="diag-metric-value">{(mem.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
          </div>
          <div className="diag-metric">
            <span className="diag-metric-label">Heap Total</span>
            <span className="diag-metric-value">{(mem.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB</span>
          </div>
          <div className="diag-metric">
            <span className="diag-metric-label">Heap Limit</span>
            <span className="diag-metric-value">{(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      ) : (
        <div className="diag-empty">Memory API not available in this environment. Launch with --enable-precise-memory-info flag.</div>
      )}
      <div className="diag-section-title" style={{ marginTop: 12 }}>Data Sizes</div>
      <div className="diag-metric-grid">
        <div className="diag-metric">
          <span className="diag-metric-label">Enemies</span>
          <span className="diag-metric-value">{gameData.enemies.length}</span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Frames</span>
          <span className="diag-metric-value">{Object.keys(gameData.warframeAbilityData).length}</span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Arcanes</span>
          <span className="diag-metric-value">{(gameData.arcaneData || []).length}</span>
        </div>
      </div>
    </div>
  );
}

function EngineTab({ result, calculating }: { result: any; calculating: boolean }) {
  const entries = performance.getEntriesByType('measure').filter(e => e.name === 'build-calculation');
  const lastCalc = entries.length > 0 ? entries[entries.length - 1] : null;

  return (
    <div className="diag-section">
      <div className="diag-section-title">Last Build Calculation</div>
      <div className="diag-metric-grid">
        <div className="diag-metric">
          <span className="diag-metric-label">Status</span>
          <span className="diag-metric-value" style={{ color: calculating ? 'var(--wf-orange)' : 'var(--wf-green)' }}>
            {calculating ? 'Running…' : 'Idle'}
          </span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Duration</span>
          <span className="diag-metric-value">{lastCalc ? `${lastCalc.duration.toFixed(2)}ms` : '—'}</span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Weapons</span>
          <span className="diag-metric-value">{result ? Object.keys(result.weapons).length : 0}</span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Breakdowns</span>
          <span className="diag-metric-value">{result?.breakdowns ? Object.keys(result.breakdowns).length : 0}</span>
        </div>
      </div>
    </div>
  );
}

function CacheTab() {
  return (
    <div className="diag-section">
      <div className="diag-section-title">Asset Cache</div>
      <div className="diag-empty">
        Image cache: in-memory LRU (max 50 entries).<br />
        Disk cache: managed by WfcdAssetService.<br />
        Performance marks cleared: on app restart.
      </div>
      <div className="diag-section-title" style={{ marginTop: 12 }}>Cache Stats</div>
      <div className="diag-metric-grid">
        <div className="diag-metric">
          <span className="diag-metric-label">WFCD Data Version</span>
          <span className="diag-metric-value">{gameData.version || '?'}</span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Generated</span>
          <span className="diag-metric-value">{gameData.generatedAt?.substring(0, 10) || '?'}</span>
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  return (
    <div className="diag-section">
      <div className="diag-section-title">Application</div>
      <div className="diag-metric-grid">
        <div className="diag-metric">
          <span className="diag-metric-label">Platform</span>
          <span className="diag-metric-value">{navigator.platform || 'Unknown'}</span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">User Agent</span>
          <span className="diag-metric-value" style={{ fontSize: 9, wordBreak: 'break-all' }}>
            {navigator.userAgent.substring(0, 100)}
          </span>
        </div>
        <div className="diag-metric">
          <span className="diag-metric-label">Language</span>
          <span className="diag-metric-value">{navigator.language}</span>
        </div>
      </div>
    </div>
  );
}
