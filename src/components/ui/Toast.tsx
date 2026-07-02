import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
  type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  onDismiss, 
  duration = 3000, 
  type = 'info' 
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!message) return;

    timerRef.current = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const typeStyles = {
    info: { 
      bg: 'var(--wf-teal-soft)', 
      border: 'var(--wf-teal)', 
      color: 'var(--wf-teal-ui)' 
    },
    success: { 
      bg: 'var(--wf-green-soft)', 
      border: 'var(--wf-green)', 
      color: 'var(--wf-green-ui)' 
    },
    error: { 
      bg: 'var(--wf-red-soft)', 
      border: 'var(--wf-red)', 
      color: 'var(--wf-red-ui)' 
    },
    warning: { 
      bg: 'rgba(232, 122, 48, 0.12)', 
      border: 'var(--wf-orange)', 
      color: 'var(--wf-orange)' 
    },
  };

  const currentStyle = typeStyles[type];

  return createPortal(
    <div
      key={message}
      style={{
        position: 'fixed', 
        bottom: '32px', 
        left: '50%', 
        transform: 'translateX(-50%) translateY(0)',
        zIndex: 'var(--z-toast)', 
        padding: '10px 24px',
        borderRadius: '6px', 
        backdropFilter: 'blur(12px)',
        backgroundColor: currentStyle.bg,
        borderLeft: `4px solid ${currentStyle.border}`,
        color: currentStyle.color,
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        fontWeight: 500,
        opacity: 1,
        transition: 'var(--transition-normal)',
        boxShadow: 'var(--elevation-3)',
        pointerEvents: 'none',
        animation: 'wb-fade-in 200ms ease',
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>,
    document.body
  );
};
