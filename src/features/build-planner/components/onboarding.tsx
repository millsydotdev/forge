import React, { useState } from 'react';
import { Brand } from '../../../services/visual-manager';

const STORAGE_KEY = Brand.getStorageKey('onboarding_done');
const STEPS = [
  { title: 'Select Equipment', text: 'Choose a Warframe and weapons from the left sidebar or BottomDrawer.', icon: '1' },
  { title: 'Equip Mods', text: 'Browse mods in the library below and click to equip them. Match polarities to save capacity.', icon: '2' },
  { title: 'Adjust Enemy Lab', text: 'Toggle the Enemies tab to set target level, armor strip, and see real TTK.', icon: '3' },
  { title: 'Inspect Stats', text: 'Click any stat in the right panel to see its breakdown. Hover "Why?" for detail.', icon: '4' },
  { title: 'Save & Share', text: 'Save your build with a name, export a shareable code, or load a previous version from history.', icon: '5' },
];

export function Onboarding({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onDismiss();
  };

  if (step >= STEPS.length) {
    dismiss();
    return null;
  }

  const s = STEPS[step];
  return (
    <div className="modal-overlay" onClick={dismiss}
      style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div className="history-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={s.title}
        style={{ width: 400, padding: 20 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--wf-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'var(--wf-bg)', marginBottom: 10, fontFamily: 'var(--font-mono)',
        }}>
          {s.icon}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wf-text)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>{s.title}</div>
        <div style={{ fontSize: 12, color: 'var(--wf-text-dim)', lineHeight: '1.5', marginBottom: 16 }}>{s.text}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === step ? 'var(--wf-gold)' : 'var(--wf-border)',
                transition: 'background var(--transition-fast)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={dismiss}
              style={{ padding: '3px 10px', border: '1px solid var(--wf-border)', borderRadius: 3, background: 'transparent', color: 'var(--wf-text-muted)', cursor: 'pointer', fontSize: 11 }}>
              Skip
            </button>
            <button type="button" onClick={() => setStep(s => s + 1)}
              style={{ padding: '3px 14px', border: '1px solid var(--wf-gold-dim)', borderRadius: 3, background: 'rgba(200,164,94,0.15)', color: 'var(--wf-gold)', cursor: 'pointer', fontSize: 11 }}>
              {step < STEPS.length - 1 ? 'Next' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
