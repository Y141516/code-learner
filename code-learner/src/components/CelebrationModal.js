import React, { useEffect, useState } from 'react';

const LANG_NAMES = {
  python: 'Python', javascript: 'JavaScript', htmlcss: 'HTML & CSS', fullstack: 'Full Stack Web',
};

export default function CelebrationModal({ data, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const isLang    = data.type === 'language_complete';
  const isLevel   = data.type === 'level_complete';

  const LEVEL_COLORS = { beginner: '#10b981', intermediate: '#f59e0b', expert: '#ef4444' };
  const levelColor = LEVEL_COLORS[data.level] || '#6366f1';

  return (
    <div style={{ ...s.backdrop, opacity: visible ? 1 : 0 }} onClick={close}>
      <div
        style={{ ...s.modal, transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(40px)', opacity: visible ? 1 : 0 }}
        onClick={e => e.stopPropagation()}>

        {/* Confetti dots */}
        <div style={s.confettiWrap} aria-hidden>
          {[...Array(18)].map((_, i) => (
            <div key={i} style={{ ...s.confettiDot, background: CONFETTI_COLORS[i % CONFETTI_COLORS.length], left: `${(i / 18) * 100}%`, animationDelay: `${(i * 0.08).toFixed(2)}s`, animationDuration: `${0.9 + (i % 4) * 0.2}s` }} />
          ))}
        </div>

        {isLang && (
          <>
            <div style={s.bigEmoji}>🏆</div>
            <h2 style={s.title}>Language Complete!</h2>
            <p style={s.sub}>
              You've mastered <strong style={{ color: '#818cf8' }}>{LANG_NAMES[data.langId] || data.langId}</strong> — all three levels done!
            </p>
            <div style={s.badgeRow}>
              <div style={s.badge}>🌱</div>
              <div style={s.badgeConnector} />
              <div style={s.badge}>🔥</div>
              <div style={s.badgeConnector} />
              <div style={s.badge}>💎</div>
            </div>
            <p style={s.detail}>That's a huge achievement. Your XP has been fully credited. Pick your next language to keep the momentum!</p>
          </>
        )}

        {isLevel && (
          <>
            <div style={s.bigEmoji}>
              {data.level === 'beginner' ? '🌱' : data.level === 'intermediate' ? '🔥' : '💎'}
            </div>
            <h2 style={s.title}>Level Complete!</h2>
            <p style={s.sub}>
              You finished the <span style={{ color: levelColor, fontWeight: 700 }}>{data.level?.charAt(0).toUpperCase() + data.level?.slice(1)}</span> level!
            </p>
            <div style={{ ...s.unlockBanner, borderColor: `${LEVEL_COLORS[data.nextLevel]}50`, background: `${LEVEL_COLORS[data.nextLevel]}0d` }}>
              <span style={{ fontSize: 22 }}>🔓</span>
              <div>
                <div style={{ fontWeight: 700, color: LEVEL_COLORS[data.nextLevel], marginBottom: 2 }}>
                  {data.nextLevel?.charAt(0).toUpperCase() + data.nextLevel?.slice(1)} Unlocked!
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  The next level is now available. Keep going!
                </div>
              </div>
            </div>
          </>
        )}

        <button onClick={close} style={s.closeBtn}>
          {isLang ? '🚀 Pick Next Language' : '🔥 Start Next Level'}
        </button>
        <button onClick={close} style={s.skipBtn}>Continue</button>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6','#f97316'];

const s = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(6,9,18,0.82)', zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 0.3s ease',
  },
  modal: {
    background: 'linear-gradient(145deg,#111827,#0d1117)',
    border: '1px solid #1e2d45',
    borderRadius: 28,
    padding: '52px 48px',
    maxWidth: 500,
    width: '90%',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
    transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
  },
  confettiWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, overflow: 'hidden', pointerEvents: 'none' },
  confettiDot: {
    position: 'absolute',
    top: -10,
    width: 8,
    height: 8,
    borderRadius: 2,
    animation: 'confetti 1s ease forwards',
  },
  bigEmoji:  { fontSize: 72, lineHeight: 1, animation: 'bounceIn 0.6s cubic-bezier(.34,1.56,.64,1)' },
  title:     { fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: '#e8edf5', marginBottom: 4 },
  sub:       { color: '#94a3b8', fontSize: 16, lineHeight: 1.7 },
  badgeRow:  { display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' },
  badge:     { width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  badgeConnector: { width: 32, height: 2, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 1 },
  detail:    { color: '#64748b', fontSize: 14, lineHeight: 1.7, maxWidth: 360 },
  unlockBanner: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, border: '1px solid', textAlign: 'left', width: '100%' },
  closeBtn:  { padding: '14px 40px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.45)', width: '100%' },
  skipBtn:   { color: '#475569', fontSize: 14, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer', background: 'none', border: 'none' },
};
