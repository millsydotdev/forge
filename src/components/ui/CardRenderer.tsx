/**
 * CardRenderer — renders any item as a card.
 *
 * Templates: mod, arcane, shard, focus, companion, relic, default
 * All consume PresentationModel.
 */

import type { PresentationModel } from './PresentationModel';
import { visualManager } from '../../services/visual-manager';

interface CardRendererProps {
  model: PresentationModel;
  template?: 'mod' | 'arcane' | 'shard' | 'focus' | 'companion' | 'relic' | 'default';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onContextMenu?: () => void;
}

export function CardRenderer({ model, template = 'default', size = 'md', onClick, onContextMenu }: CardRendererProps) {
  return (
    <div
      className={`card-renderer card-renderer--${template} card-renderer--${size}`}
      onClick={onClick}
      onContextMenu={e => { e.preventDefault(); onContextMenu?.(); }}
      role="button"
      tabIndex={0}
      title={model.tooltip.title}
    >
      {/* Badge strip */}
      {model.badges.length > 0 && (
        <div className="card-renderer__badges">
          {model.badges.slice(0, 3).map((b, i) => (
            <span key={i} className="card-renderer__badge" style={{ color: b.color, borderColor: b.color }}>
              {b.icon ? <img src={b.icon} alt="" className="card-renderer__badge-icon" /> : null}
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Artwork */}
      <div className="card-renderer__artwork">
        {model.artwork ? (
          <img
            src={visualManager.getImageUrl(model.artwork)}
            alt={model.name}
            className="card-renderer__img"
            loading="lazy"
            onError={e => { visualManager.markFailed(model.artwork, 'card'); (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="card-renderer__placeholder">{model.name[0] || '?'}</div>
        )}
      </div>

      {/* Name */}
      <div className="card-renderer__name" title={model.name}>
        {model.name}
      </div>

      {/* Metadata */}
      {size === 'lg' && Object.keys(model.metadata).length > 0 && (
        <div className="card-renderer__meta">
          {Object.entries(model.metadata).slice(0, 3).map(([k, v]) => (
            <span key={k} className="card-renderer__meta-item">
              <span className="card-renderer__meta-label">{k}</span>
              <span className="card-renderer__meta-value">{v}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
