import React, { useState, useCallback } from 'react';
import { fetchOverframeBuild, parseBuildCode } from '../services/overframe-importer';
import type { OverframeImportResult } from '../services/overframe-importer';

interface ImportModalProps {
  onClose: () => void;
  onImport: (result: OverframeImportResult) => void;
}

export function ImportOverframeModal({ onClose, onImport }: ImportModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<OverframeImportResult | null>(null);

  const handleFetch = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      let result: OverframeImportResult;
      if (trimmed.startsWith('http')) {
        result = await fetchOverframeBuild(trimmed);
      } else {
        result = parseBuildCode(trimmed);
      }

      if (result.success) {
        setPreview(result);
      } else {
        setError(result.warnings.join('\n'));
      }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleConfirm = useCallback(() => {
    if (preview) {
      onImport(preview);
      onClose();
    }
  }, [preview, onImport, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box overframe-import-modal" role="dialog" aria-modal="true" aria-label="Import from Overframe" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-title import-modal-header">
          <span>Import from Overframe</span>
          <button type="button" className="modal-btn secondary import-modal-close-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="import-modal-info">
          Paste an Overframe share link or build code below.
        </div>
        <textarea
          className="modal-textarea"
          value={input}
          onChange={e => { setInput(e.target.value); setError(null); setPreview(null); }}
          placeholder="https://overframe.gg/build/123456/..."
          rows={3}
          autoFocus
        />
        <button type="button" className="modal-btn primary import-modal-input-row" onClick={handleFetch} disabled={loading || !input.trim()}>
          {loading ? 'Fetching…' : 'Fetch & Preview'}
        </button>

        {error && <div className="modal-error import-modal-error-row">⚠ {error}</div>}

        {preview && (
          <div className="modal-preview">
            <div className="modal-preview-title">✓ Build parsed successfully</div>
            <div className="modal-preview-body">
              {preview.warframe && <div>Frame: <span className="v-gold">{preview.warframe.name}</span></div>}
              {preview.mods && preview.mods.length > 0 &&
                <div>Mods: <span className="v-teal">{preview.mods.length} warframe mods</span></div>}
              {preview.arcanes && preview.arcanes.length > 0 &&
                <div>Arcanes: <span className="v-purple">{preview.arcanes.length}</span></div>}
              {preview.shards && preview.shards.length > 0 &&
                <div>Shards: <span className="v-red">{preview.shards.length} equipped</span></div>}
              {preview.primary && <div>Primary: <span className="v-text-dim">{preview.primary.name}</span></div>}
              {preview.secondary && <div>Secondary: <span className="v-text-dim">{preview.secondary.name}</span></div>}
              {preview.melee && <div>Melee: <span className="v-text-dim">{preview.melee.name}</span></div>}
              {preview.helminth && <div>Helminth: <span className="v-green">{preview.helminth.abilityName}</span></div>}
              {preview.warnings.length > 0 && (
                <div className="v-red import-modal-validation">
                  ⚠ {preview.warnings.length} warning(s)
                </div>
              )}
            </div>
            <button type="button" className="modal-btn primary import-modal-confirm-btn" onClick={handleConfirm}>
              ✓ Apply Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
