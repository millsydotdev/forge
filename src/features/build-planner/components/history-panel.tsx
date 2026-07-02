import React, { useMemo } from 'react';
import { useProjectStore } from '../../../store/projectStore';

export function HistoryPanel({ onLoadBuild, onClose }: {
  onLoadBuild: (code: string) => void;
  onClose: () => void;
}) {
  const { projects, currentProjectId } = useProjectStore();

  const currentProject = useMemo(
    () => projects.find(p => p.id === currentProjectId),
    [projects, currentProjectId],
  );

  const variants = currentProject?.variants ?? [];

  return (
    <div className="history-overlay" onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div className="history-panel" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--wf-surface)', border: '1px solid var(--wf-border)', borderRadius: 8, padding: 16, width: 500, maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--elevation-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--wf-gold)', fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase' }}>
              Build History
            </div>
            {currentProject && (
              <div style={{ fontSize: 11, color: 'var(--wf-text-muted)' }}>{currentProject.name}</div>
            )}
          </div>
          <button onClick={onClose} style={btnStyle}>Close</button>
        </div>

        {variants.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--wf-text-muted)', padding: 32 }}>
            <div style={{ fontSize: 24, opacity: 0.5, marginBottom: 8 }}>◈</div>
            <div style={{ fontSize: 12 }}>No build history yet.</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Save your build to create a version snapshot.</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {[...variants].reverse().map(v => (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', marginBottom: 4,
                background: 'rgba(0,0,0,0.15)', borderRadius: 4,
                border: '1px solid var(--wf-border)',
                transition: 'border-color var(--transition-fast)',
                cursor: 'pointer',
              }}
                onClick={() => { onLoadBuild(v.buildCode); onClose(); }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--wf-teal)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--wf-border)'}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--wf-text)' }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--wf-text-muted)' }}>
                    {new Date(v.createdAt).toLocaleDateString()} {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--wf-teal)' }}>Load ▸</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '3px 10px', border: '1px solid var(--wf-border)', borderRadius: 3,
  background: 'var(--wf-panel)', color: 'var(--wf-text)',
  fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer',
};
