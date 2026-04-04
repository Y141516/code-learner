import React, { createContext, useContext, useState, useCallback } from 'react';
import { LESSONS } from '../data/lessons';

const AppContext = createContext();

const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
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

  // ── Auth ─────────────────────────────────────────────────────────
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
    const lastLogin = localStorage.getItem('cl_last_login');
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastLogin === yesterday ? streak + 1 : 1;
      setStreak(newStreak); LS.set('cl_streak', newStreak);
      localStorage.setItem('cl_last_login', today);
    }
    return { success: true };
  }, [streak]);

  const logout = useCallback(() => {
    setUser(null); localStorage.removeItem('cl_user');
  }, []);

  // ── Lesson helpers ────────────────────────────────────────────────
  const isLessonDone = useCallback((langId, level, lessonId) => {
    return !!progress[`${langId}_${level}_${lessonId}`];
  }, [progress]);

  const isLessonUnlocked = useCallback((langId, level, lessonIndex, lessons) => {
    if (lessonIndex === 0) return true;
    const prev = lessons[lessonIndex - 1];
    return !!progress[`${langId}_${level}_${prev.id}`];
  }, [progress]);

  const isLevelUnlocked = useCallback((langId, levelName) => {
    const langLessons = LESSONS[langId];
    if (!langLessons) return false;
    if (levelName === 'beginner') return true;
    if (levelName === 'intermediate') {
      const beg = langLessons.beginner || [];
      return beg.length > 0 && beg.every(l => !!progress[`${langId}_beginner_${l.id}`]);
    }
    if (levelName === 'expert') {
      const mid = langLessons.intermediate || [];
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
    const allLessons = levels.flatMap(lvl => lang[lvl] || []);
    const done = levels.reduce((sum, lvl) => {
      return sum + (lang[lvl] || []).filter(l => !!progress[`${langId}_${lvl}_${l.id}`]).length;
    }, 0);
    return { done, total: allLessons.length, pct: allLessons.length ? Math.round((done / allLessons.length) * 100) : 0 };
  }, [progress]);

  // ── Lesson completion + XP + badges ──────────────────────────────
  const completeLesson = useCallback((lessonId, langId, level) => {
    const key = `${langId}_${level}_${lessonId}`;
    if (progress[key]) return;
    const newProgress = { ...progress, [key]: true };
    setProgress(newProgress); LS.set('cl_progress', newProgress);

    const newXp = xp + 40;
    setXp(newXp); LS.set('cl_xp', newXp);

    // badges
    const newBadges = [...badges];
    const addB = (b) => { if (!newBadges.includes(b)) newBadges.push(b); };
    if (newXp >= 40)   addB('first_lesson');
    if (newXp >= 200)  addB('rising_coder');
    if (newXp >= 500)  addB('code_warrior');
    if (newXp >= 1000) addB('legend');
    const count = Object.keys(newProgress).length;
    if (count >= 5)  addB('lesson_5');
    if (count >= 15) addB('lesson_15');
    if (newBadges.length !== badges.length) {
      setBadges(newBadges); LS.set('cl_badges', newBadges);
    }

    // check level / language completion
    const langData  = LESSONS[langId];
    const levelLessons = langData?.[level] || [];
    const levelDone = levelLessons.every(l => !!newProgress[`${langId}_${level}_${l.id}`]);
    if (levelDone) {
      const allLevels = ['beginner','intermediate','expert'];
      const langAllDone = allLevels.every(lvl => {
        const ls = langData?.[lvl] || [];
        return ls.length === 0 || ls.every(l => !!newProgress[`${langId}_${lvl}_${l.id}`]);
      });
      if (langAllDone) {
        setTimeout(() => setCelebration({ type: 'language_complete', langId }), 400);
      } else {
        const nextLevel = level === 'beginner' ? 'intermediate' : level === 'intermediate' ? 'expert' : null;
        if (nextLevel) setTimeout(() => setCelebration({ type: 'level_complete', level, nextLevel, langId }), 400);
      }
    }
  }, [progress, xp, badges]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  // ── Skill progress ────────────────────────────────────────────────
  const updateSkillProgress = useCallback((skillId, topicIndex) => {
    const current = skillProgress[skillId] || { completed: [], xp: 0 };
    if (current.completed.includes(topicIndex)) return;
    const newSP = { ...skillProgress, [skillId]: { completed: [...current.completed, topicIndex], xp: current.xp + 20 } };
    setSkillProgress(newSP); LS.set('cl_skill_progress', newSP);
    const newXp = xp + 20;
    setXp(newXp); LS.set('cl_xp', newXp);
  }, [skillProgress, xp]);

  const getCompletedSkillsCount = useCallback(() => {
    return Object.keys(skillProgress).filter(sid => (skillProgress[sid]?.completed?.length ?? 0) >= 5).length;
  }, [skillProgress]);

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
