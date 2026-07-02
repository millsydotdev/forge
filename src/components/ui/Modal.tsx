import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number | string;
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  title, 
  children, 
  width = 500, 
  actions 
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKeyDown);
    boxRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onKeyDown]);

  if (!open) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', 
        inset: 0, 
        zIndex: 'var(--z-modal)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', 
        backdropFilter: 'blur(4px)',
        padding: '20px'
      }} 
      onClick={onClose} 
      role="presentation"
    >
      <div
        ref={boxRef}
        style={{ 
          background: 'var(--wf-surface-solid)',
          border: '1px solid var(--wf-border)',
          borderRadius: '6px',
          padding: '24px',
          width,
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: 'var(--elevation-4)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px', 
          fontFamily: 'var(--font-display)',
          fontSize: '18px', 
          color: 'var(--wf-gold)',
          textTransform: 'uppercase', 
          letterSpacing: '0.04em',
        }}>
          <span>{title}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            style={{ padding: '2px 8px', fontSize: '18px', minWidth: 'auto' }}
          >
            ✕
          </Button>
        </div>
        
        <div style={{ color: 'var(--wf-text)', fontFamily: 'var(--font-body)' }}>
          {children}
        </div>

        {actions && (
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'flex-end', 
            marginTop: '24px' 
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
