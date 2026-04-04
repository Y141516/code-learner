import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import LessonsTab from './LessonsTab';
import CelebrationModal from '../components/CelebrationModal';

const TABS = [
  { id: 'lessons', label: 'Coding Lessons', icon: '📚', ready: true },
  { id: 'code',    label: 'Code Experiment', icon: '⚡', ready: false },
  { id: 'skills',  label: 'Skill Enhance',   icon: '🧠', ready: false },
  { id: 'quizzes', label: 'Quizzes',          icon: '🎯', ready: false },
  { id: 'ai',      label: 'AI Update',        icon: '🤖', ready: false },
];

const BADGE_META = {
  first_lesson: { icon: '🌟', label: 'First Lesson!' },
  rising_coder: { icon: '🚀', label: 'Rising Coder' },
  code_warrior:  { icon: '⚔️', label: 'Code Warrior' },
  legend:        { icon: '👑', label: 'Legend' },
  lesson_5:      { icon: '📖', label: '5 Lessons Done' },
  lesson_15:     { icon: '🏆', label: '15 Lessons Done' },
};

export default function MainLayout() {
  const {
    user, logout,
    xp, level, xpInLevel, xpToNext,
    badges, streak,
    activeTab, setActiveTab,
    celebration, dismissCelebration,
    getCompletedSkillsCount,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleTabClick = (tab) => {
    if (!tab.ready) return; // tab not built yet — do nothing
    setActiveTab(tab.id);
    setProfileOpen(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'lessons': return <LessonsTab />;
      default:        return <LessonsTab />;
    }
  };

  return (
    <div style={s.app}>
      {/* top accent line */}
      <div style={s.topLine} />

      {/* ── Sidebar ───────────────────────── */}
      <aside style={s.sidebar}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.logo}><span style={{ fontSize: 22 }}>⚡</span></div>
          <div>
            <div style={s.brandName}>Code Learner</div>
            <div style={s.brandSub}>v1.0 · Tab 1 Active</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={s.nav}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const comingSoon = !tab.ready;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                title={comingSoon ? 'Coming soon — being built!' : tab.label}
                style={{
                  ...s.navBtn,
                  ...(active ? s.navActive : {}),
                  ...(comingSoon ? s.navSoon : {}),
                }}
              >
                {active && <div style={s.navDot} />}
                <span style={s.navIcon}>{tab.icon}</span>
                <span style={s.navLabel}>{tab.label}</span>
                {comingSoon && <span style={s.soonBadge}>Soon</span>}
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* XP Card */}
        <div style={s.xpCard}>
          <div style={s.xpTop}>
            <div style={s.xpLevel}>Lv.{level}</div>
            <div style={s.xpMeta}>
              <span style={s.xpTotal}>{xp} XP</span>
              <span style={s.xpNext}>{xpToNext} to next level</span>
            </div>
          </div>
          <div style={s.xpBar}>
            <div style={{ ...s.xpFill, width: `${Math.min((xpInLevel / 200) * 100, 100)}%` }} />
          </div>
          <div style={s.stats}>
            <div style={s.stat}>
              <span style={s.statVal}>🔥 {streak}</span>
              <span style={s.statLbl}>Day Streak</span>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <span style={s.statVal}>🏅 {badges.length}</span>
              <span style={s.statLbl}>Badges</span>
            </div>
          </div>
          {badges.length > 0 && (
            <div style={s.badges}>
              {badges.map(b => BADGE_META[b] && (
                <span key={b} title={BADGE_META[b].label} style={s.badge}>{BADGE_META[b].icon}</span>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={s.profile} onClick={() => setProfileOpen(o => !o)}>
          <div style={s.avatar}>{user.name?.[0]?.toUpperCase()}</div>
          <div style={s.profileInfo}>
            <div style={s.profileName}>{user.name}</div>
            <div style={s.profileEmail}>{user.email}</div>
          </div>
          <span style={{ color: '#64748b', fontSize: 12 }}>⚙</span>
          {profileOpen && (
            <div style={s.profileMenu}>
              <div style={s.menuItem}>👤 {user.name}</div>
              <div style={s.menuItem}>📧 {user.email}</div>
              <div style={s.menuDivider} />
              <button onClick={logout} style={s.logoutBtn}>🚪 Sign Out</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ──────────────────── */}
      <main style={s.main}>
        {renderTab()}
      </main>

      {/* Celebration Modal */}
      {celebration && <CelebrationModal data={celebration} onClose={dismissCelebration} />}
    </div>
  );
}

const s = {
  app: { display: 'flex', minHeight: '100vh', position: 'relative' },
  topLine: { position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#6366f1,#8b5cf6,#ec4899,transparent)', zIndex: 200 },

  sidebar: { width: 268, background: 'rgba(10,14,23,0.98)', borderRight: '1px solid #1a2740', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, paddingTop: 2 },
  brand: { display: 'flex', alignItems: 'center', gap: 12, padding: '22px 20px 20px', borderBottom: '1px solid #1a2740' },
  logo: { width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)', flexShrink: 0 },
  brandName: { fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700 },
  brandSub: { fontSize: 11, color: '#475569', marginTop: 1 },

  nav: { padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 },
  navBtn: { display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 11, color: '#64748b', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans,sans-serif', textAlign: 'left', position: 'relative', transition: 'all 0.2s', width: '100%' },
  navActive: { background: 'rgba(99,102,241,0.14)', color: '#a5b4fc', fontWeight: 600 },
  navSoon: { opacity: 0.45, cursor: 'not-allowed' },
  navDot: { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 22, background: 'linear-gradient(180deg,#6366f1,#8b5cf6)', borderRadius: '0 3px 3px 0' },
  navIcon: { fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 },
  navLabel: { flex: 1 },
  soonBadge: { fontSize: 10, padding: '2px 7px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, color: '#f59e0b', fontWeight: 600 },

  xpCard: { margin: '0 10px 10px', background: 'rgba(22,29,46,0.7)', border: '1px solid #1a2740', borderRadius: 14, padding: '14px' },
  xpTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  xpLevel: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 },
  xpMeta: { flex: 1 },
  xpTotal: { display: 'block', fontSize: 15, fontWeight: 700, color: '#e8edf5' },
  xpNext: { display: 'block', fontSize: 11, color: '#64748b' },
  xpBar: { height: 5, background: 'rgba(6,9,18,0.7)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  xpFill: { height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 3, transition: 'width 0.6s ease' },
  stats: { display: 'flex', alignItems: 'center', gap: 0 },
  stat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statVal: { fontSize: 14, fontWeight: 700, color: '#e8edf5' },
  statLbl: { fontSize: 10, color: '#64748b' },
  statDiv: { width: 1, height: 28, background: '#1a2740' },
  badges: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  badge: { width: 28, height: 28, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'default' },

  profile: { margin: '0 10px 14px', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'rgba(22,29,46,0.5)', border: '1px solid #1a2740', borderRadius: 13, cursor: 'pointer', position: 'relative' },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 },
  profileInfo: { flex: 1, overflow: 'hidden' },
  profileName: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  profileEmail: { fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  profileMenu: { position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, background: '#0d1117', border: '1px solid #1a2740', borderRadius: 12, padding: '8px', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  menuItem: { padding: '8px 10px', fontSize: 13, color: '#94a3b8' },
  menuDivider: { height: 1, background: '#1a2740', margin: '4px 0' },
  logoutBtn: { width: '100%', padding: '9px 10px', color: '#f87171', fontSize: 14, fontFamily: 'DM Sans,sans-serif', borderRadius: 8, textAlign: 'left', transition: 'background 0.2s' },

  main: { flex: 1, marginLeft: 268, minHeight: '100vh', overflow: 'auto', position: 'relative' },
};
