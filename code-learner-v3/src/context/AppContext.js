import React, { createContext, useContext, useState, useCallback } from 'react';
import { LESSONS } from '../data/lessons';

const AppContext = createContext();

const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export function AppProvider({ children }) {
  const [user,          setUser]          = useState(() => LS.get('cl_user', null));
  const [progress,      setProgress]      = useState(() => LS.get('cl_progress', {}));
  const [xp,            setXp]            = useState(() => LS.get('cl_xp', 0));
  const [badges,        setBadges]        = useState(() => LS.get('cl_badges', []));
  const [streak,        setStreak]        = useState(() => LS.get('cl_streak', 0));
  const [skillProgress, setSkillProgress] = useState(() => LS.get('cl_skill_progress', {}));
  const [activeTab,     setActiveTab]     = useState('lessons');
  const [celebration,   setCelebration]   = useState(null);

  // ── Auth ──────────────────────────────────────────────────────────
  const signup = useCallback((form) => {
    const users = LS.get('cl_users', []);
    if (users.find(u => u.email === form.email)) return { error: 'Email already registered' };
    const newUser = { id: Date.now(), name: form.name, email: form.email, password: form.password, joinedAt: new Date().toISOString() };
    LS.set('cl_users', [...users, newUser]);
    const safe = { id: newUser.id, name: newUser.name, email: newUser.email, joinedAt: newUser.joinedAt };
    setUser(safe); LS.set('cl_user', safe);
    return { success: true };
  }, []);

  const loginUser = useCallback((email, password) => {
    const users = LS.get('cl_users', []);
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { error: 'Invalid email or password' };
    const safe = { id: found.id, name: found.name, email: found.email, joinedAt: found.joinedAt };
    setUser(safe); LS.set('cl_user', safe);
    const today = new Date().toDateString();
    const last = localStorage.getItem('cl_last_login');
    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const ns = last === yesterday ? streak + 1 : 1;
      setStreak(ns); LS.set('cl_streak', ns);
      localStorage.setItem('cl_last_login', today);
    }
    return { success: true };
  }, [streak]);

  const logout = useCallback(() => { setUser(null); localStorage.removeItem('cl_user'); }, []);

  // ── Lesson helpers ────────────────────────────────────────────────
  const isLessonDone = useCallback((langId, level, lessonId) =>
    !!progress[`${langId}_${level}_${lessonId}`], [progress]);

  const isLessonUnlocked = useCallback((langId, level, idx, lessons) => {
    if (idx === 0) return true;
    const prev = lessons[idx - 1];
    return !!progress[`${langId}_${level}_${prev.id}`];
  }, [progress]);

  const isLevelUnlocked = useCallback((langId, levelName) => {
    const lang = LESSONS[langId];
    if (!lang) return false;
    if (levelName === 'beginner') return true;
    if (levelName === 'intermediate') {
      const beg = lang.beginner || [];
      return beg.length > 0 && beg.every(l => !!progress[`${langId}_beginner_${l.id}`]);
    }
    if (levelName === 'expert') {
      const mid = lang.intermediate || [];
      return mid.length > 0 && mid.every(l => !!progress[`${langId}_intermediate_${l.id}`]);
    }
    return false;
  }, [progress]);

  const getLevelProgress = useCallback((langId, levelName) => {
    const lessons = LESSONS[langId]?.[levelName] || [];
    const done = lessons.filter(l => !!progress[`${langId}_${levelName}_${l.id}`]).length;
    return { done, total: lessons.length, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
  }, [progress]);

  const getLanguageProgress = useCallback((langId) => {
    const lang = LESSONS[langId];
    if (!lang) return { done: 0, total: 0, pct: 0 };
    const levels = ['beginner', 'intermediate', 'expert'];
    const all = levels.flatMap(lvl => lang[lvl] || []);
    const done = levels.reduce((s, lvl) =>
      s + (lang[lvl] || []).filter(l => !!progress[`${langId}_${lvl}_${l.id}`]).length, 0);
    return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [progress]);

  // ── Complete lesson ───────────────────────────────────────────────
  const completeLesson = useCallback((lessonId, langId, level) => {
    const key = `${langId}_${level}_${lessonId}`;
    if (progress[key]) return;
    const np = { ...progress, [key]: true };
    setProgress(np); LS.set('cl_progress', np);
    const nx = xp + 40;
    setXp(nx); LS.set('cl_xp', nx);

    // badges
    const nb = [...badges];
    const add = (b) => { if (!nb.includes(b)) nb.push(b); };
    if (nx >= 40)   add('first_lesson');
    if (nx >= 200)  add('rising_coder');
    if (nx >= 500)  add('code_warrior');
    if (nx >= 1000) add('legend');
    const cnt = Object.keys(np).length;
    if (cnt >= 5)  add('lesson_5');
    if (cnt >= 15) add('lesson_15');
    if (nb.length !== badges.length) { setBadges(nb); LS.set('cl_badges', nb); }

    // celebrate level/lang completion
    const langData = LESSONS[langId];
    const lvlLessons = langData?.[level] || [];
    const lvlDone = lvlLessons.every(l => !!np[`${langId}_${level}_${l.id}`]);
    if (lvlDone) {
      const allLvls = ['beginner','intermediate','expert'];
      const langAllDone = allLvls.every(lvl => {
        const ls = langData?.[lvl] || [];
        return ls.length === 0 || ls.every(l => !!np[`${langId}_${lvl}_${l.id}`]);
      });
      if (langAllDone) {
        setTimeout(() => setCelebration({ type:'language_complete', langId }), 500);
      } else {
        const next = level==='beginner'?'intermediate':level==='intermediate'?'expert':null;
        if (next) setTimeout(() => setCelebration({ type:'level_complete', level, nextLevel:next, langId }), 500);
      }
    }
  }, [progress, xp, badges]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  // ── Skill progress ────────────────────────────────────────────────
  const updateSkillProgress = useCallback((skillId, topicIndex) => {
    const cur = skillProgress[skillId] || { completed:[], xp:0 };
    if (cur.completed.includes(topicIndex)) return;
    const ns = { ...skillProgress, [skillId]: { completed:[...cur.completed, topicIndex], xp: cur.xp+20 } };
    setSkillProgress(ns); LS.set('cl_skill_progress', ns);
    const nx = xp + 20; setXp(nx); LS.set('cl_xp', nx);
  }, [skillProgress, xp]);

  const getCompletedSkillsCount = useCallback(() =>
    Object.keys(skillProgress).filter(sid => (skillProgress[sid]?.completed?.length ?? 0) >= 5).length,
    [skillProgress]);

  const level     = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  const xpToNext  = 200 - xpInLevel;

  return (
    <AppContext.Provider value={{
      user, signup, loginUser, logout,
      progress, xp, level, xpInLevel, xpToNext, badges, streak,
      skillProgress, updateSkillProgress, getCompletedSkillsCount,
      activeTab, setActiveTab,
      celebration, dismissCelebration,
      completeLesson, isLessonDone, isLessonUnlocked,
      isLevelUnlocked, getLevelProgress, getLanguageProgress,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
