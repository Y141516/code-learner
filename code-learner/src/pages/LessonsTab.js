import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGES, LESSONS } from '../data/lessons';

/* ═══════════════════════════════════
   TOP-LEVEL ROUTER
═══════════════════════════════════ */
export default function LessonsTab() {
  const [view,      setView]      = useState('languages');
  const [selLang,   setSelLang]   = useState(null);
  const [selLevel,  setSelLevel]  = useState(null);
  const [selLesson, setSelLesson] = useState(null);

  const goLang   = (lang)   => { setSelLang(lang);   setView('levels');   };
  const goLevel  = (level)  => { setSelLevel(level);  setView('lessons');  };
  const goLesson = (lesson) => { setSelLesson(lesson); setView('lesson');  };
  const back     = ()       => {
    if (view === 'lesson')  { setView('lessons');   setSelLesson(null); return; }
    if (view === 'lessons') { setView('levels');    setSelLevel(null);  return; }
    if (view === 'levels')  { setView('languages'); setSelLang(null);   return; }
  };

  switch (view) {
    case 'languages': return <LanguageSelect onSelect={goLang} />;
    case 'levels':    return <LevelSelect    lang={selLang}  onSelect={goLevel}  onBack={back} />;
    case 'lessons':   return <LessonList     lang={selLang}  level={selLevel}    onSelect={goLesson} onBack={back} />;
    case 'lesson':    return <LessonView     lang={selLang}  level={selLevel}    lesson={selLesson}  onBack={back} />;
    default:          return <LanguageSelect onSelect={goLang} />;
  }
}

/* ═══════════════════════════════════
   SCREEN 1 — Language Select
═══════════════════════════════════ */
function LanguageSelect({ onSelect }) {
  const { getLanguageProgress } = useApp();

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Coding Lessons</h1>
        <p style={s.pageSub}>Choose a language and start your journey — from complete beginner to expert</p>
      </div>
      <div style={s.langGrid}>
        {LANGUAGES.map((lang, i) => {
          const { done, total, pct } = getLanguageProgress(lang.id);
          return (
            <button key={lang.id} onClick={() => onSelect(lang)}
              style={{ ...s.langCard, animationDelay: `${i * 0.09}s` }}
              className="anim-fade-up">
              <div style={{ ...s.langIconBg, background: `${lang.color}18`, border: `1px solid ${lang.color}35` }}>
                <span style={s.langIconTxt}>{lang.icon}</span>
              </div>
              <div style={s.langBody}>
                <div style={s.langName}>{lang.name}</div>
                <div style={s.langTagline}>{lang.tagline}</div>
                <div style={s.levelPills}>
                  {['Beginner','Intermediate','Expert'].map(l => (
                    <span key={l} style={s.levelPill}>{l}</span>
                  ))}
                </div>
                {total > 0 && (
                  <div style={s.langProgRow}>
                    <div style={s.langProgBar}>
                      <div style={{ ...s.langProgFill, width: `${pct}%`, background: lang.color }} />
                    </div>
                    <span style={{ ...s.langProgLabel, color: lang.color }}>{done}/{total} lessons</span>
                  </div>
                )}
              </div>
              <div style={s.xpChip}>+40 XP / lesson</div>
              <div style={{ ...s.cardArrow, color: lang.color }}>→</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SCREEN 2 — Level Select
═══════════════════════════════════ */
const LEVEL_META = {
  beginner:     { label: 'Beginner',     emoji: '🌱', color: '#10b981', desc: 'Start from zero — no experience needed' },
  intermediate: { label: 'Intermediate', emoji: '🔥', color: '#f59e0b', desc: 'Build deeper understanding of core concepts' },
  expert:       { label: 'Expert',       emoji: '💎', color: '#ef4444', desc: 'Advanced patterns used in real-world projects' },
};

function LevelSelect({ lang, onSelect, onBack }) {
  const { isLevelUnlocked, getLevelProgress } = useApp();

  return (
    <div style={s.page}>
      <BackBtn onClick={onBack} />
      <div style={s.langHeroRow}>
        <span style={s.langHeroEmoji}>{lang.icon}</span>
        <div>
          <h1 style={s.pageTitle}>{lang.name}</h1>
          <p style={s.pageSub}>{lang.tagline}</p>
        </div>
      </div>
      <div style={s.xpBanner}>
        <span>💰</span>
        <span>Complete all lessons to earn up to <strong style={{ color: '#f59e0b' }}>{lang.totalXP} XP</strong> — 40 XP awarded after each full lesson set</span>
      </div>
      <div style={s.levelGrid}>
        {['beginner','intermediate','expert'].map((lk, i) => {
          const meta      = LEVEL_META[lk];
          const unlocked  = isLevelUnlocked(lang.id, lk);
          const { done, total, pct } = getLevelProgress(lang.id, lk);
          const prereq    = lk === 'intermediate' ? 'Beginner' : lk === 'expert' ? 'Intermediate' : null;
          const prereqCnt = lk === 'intermediate'
            ? (LESSONS[lang.id]?.beginner?.length ?? 0)
            : lk === 'expert'
            ? (LESSONS[lang.id]?.intermediate?.length ?? 0)
            : 0;

          return (
            <button key={lk}
              onClick={() => unlocked && onSelect(lk)}
              disabled={!unlocked}
              style={{ ...s.levelCard, ...(!unlocked ? s.levelCardLocked : {}), animationDelay: `${i * 0.1}s` }}
              className="anim-fade-up">

              {/* locked overlay */}
              {!unlocked && (
                <div style={s.lockOverlay}>
                  <span style={s.lockEmoji}>🔒</span>
                  <div style={s.lockMsg}>Complete {prereq} first</div>
                  <div style={s.lockHint}>All {prereqCnt} lessons required</div>
                </div>
              )}

              <div style={{ ...s.levelEmojiBg, background: `${meta.color}18`, border: `1px solid ${meta.color}35` }}>
                <span style={s.levelEmojiTxt}>{meta.emoji}</span>
              </div>
              <div style={s.levelLabel}>{meta.label}</div>
              <div style={s.levelDesc}>{meta.desc}</div>
              <div style={s.levelStats}>
                <span style={s.levelStat}>📚 {total} lessons</span>
                <span style={s.levelStat}>🕒 ~{total * 8} min</span>
                <span style={{ ...s.levelStat, color: meta.color }}>+{total * 40} XP</span>
              </div>
              {unlocked && (
                <>
                  <div style={s.levelProgRow}>
                    <div style={s.levelProgBar}>
                      <div style={{ ...s.levelProgFill, width: `${pct}%`, background: meta.color }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{pct}%</span>
                  </div>
                  <div style={s.levelDone}>{done}/{total} completed</div>
                  {pct === 100 && (
                    <div style={{ ...s.completeChip, color: meta.color, borderColor: `${meta.color}50`, background: `${meta.color}12` }}>
                      ✅ Level Complete!
                    </div>
                  )}
                  <div style={{ ...s.cardArrow, color: meta.color }}>→</div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SCREEN 3 — Lesson List
═══════════════════════════════════ */
function LessonList({ lang, level, onSelect, onBack }) {
  const { isLessonDone, isLessonUnlocked } = useApp();
  const meta    = LEVEL_META[level];
  const lessons = LESSONS[lang.id]?.[level] ?? [];
  const doneCount = lessons.filter(l => isLessonDone(lang.id, level, l.id)).length;
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  return (
    <div style={s.page}>
      <BackBtn onClick={onBack} />
      <div style={s.listHeader}>
        <span style={s.langHeroEmoji}>{lang.icon}</span>
        <div style={{ flex: 1 }}>
          <h1 style={s.pageTitle}>{lang.name} — {meta.label}</h1>
          <p style={s.pageSub}>{doneCount}/{lessons.length} completed · {doneCount * 40} XP earned</p>
        </div>
        <span style={{ ...s.levelBadge, color: meta.color, background: `${meta.color}12`, borderColor: `${meta.color}35` }}>
          {meta.emoji} {meta.label}
        </span>
      </div>
      <div style={s.masterBar}>
        <div style={{ ...s.masterFill, width: `${pct}%`, background: `linear-gradient(90deg,${meta.color},${meta.color}88)` }} />
      </div>

      <div style={s.lessonList}>
        {lessons.map((lesson, i) => {
          const done     = isLessonDone(lang.id, level, lesson.id);
          const unlocked = isLessonUnlocked(lang.id, level, i, lessons);
          return (
            <button key={lesson.id}
              onClick={() => unlocked && onSelect(lesson)}
              disabled={!unlocked}
              style={{ ...s.lessonRow, ...(done ? { ...s.lessonRowDone, borderColor: `${meta.color}40` } : {}), ...(!unlocked ? s.lessonRowLocked : {}) }}>
              <div style={{ ...s.lessonNum, background: done ? meta.color : unlocked ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${done ? meta.color : '#1a2740'}`, color: done ? '#fff' : unlocked ? '#818cf8' : '#475569' }}>
                {done ? '✓' : !unlocked ? '🔒' : i + 1}
              </div>
              <div style={s.lessonInfo}>
                <div style={{ ...s.lessonTitle, color: unlocked ? '#e8edf5' : '#475569' }}>
                  {lesson.title}
                </div>
                <div style={s.lessonMeta}>
                  {lesson.timestamps?.length > 0 && <span style={s.chip}>🎬 {lesson.timestamps.length} chapters</span>}
                  <span style={s.chip}>⏱ ~{lesson.timestamps?.length * 2 || 8} min</span>
                  <span style={{ ...s.chip, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>+{lesson.xp} XP</span>
                  {done && <span style={{ ...s.chip, color: meta.color, background: `${meta.color}10`, borderColor: `${meta.color}30` }}>✅ Done</span>}
                  {!unlocked && i > 0 && <span style={{ ...s.chip, color: '#94a3b8' }}>🔒 Complete previous lesson first</span>}
                </div>
              </div>
              {unlocked && <span style={{ fontSize: 18, color: done ? meta.color : '#818cf8', fontWeight: 700, flexShrink: 0 }}>→</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SCREEN 4 — Full Lesson View
═══════════════════════════════════ */
const STEPS = [
  { id: 'video',     icon: '📹', label: 'Lesson'    },
  { id: 'code',      icon: '💻', label: 'Code'      },
  { id: 'quiz',      icon: '🎯', label: 'Quiz'      },
  { id: 'challenge', icon: '⚡', label: 'Challenge' },
];

function LessonView({ lang, level, lesson, onBack }) {
  const { isLessonDone, completeLesson } = useApp();
  const meta       = LEVEL_META[level];
  const alreadyDone = isLessonDone(lang.id, level, lesson.id);

  const [step,            setStep]            = useState('video');
  const [activeTs,        setActiveTs]        = useState(0);
  const [quizAnswer,      setQuizAnswer]      = useState(null);
  const [quizResult,      setQuizResult]      = useState(null);
  const [challengeMode,   setChallengeMode]   = useState('task'); // task | review
  const [showHint,        setShowHint]        = useState(false);
  const [xpAwarded,       setXpAwarded]       = useState(alreadyDone);
  const [justCompleted,   setJustCompleted]   = useState(false);

  const stepOrder = { video: 0, code: 1, quiz: 2, challenge: 3 };

  const handleQuizAnswer = (idx) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    setQuizResult(idx === lesson.quiz.answer ? 'correct' : 'wrong');
  };

  const handleMarkComplete = () => {
    if (!xpAwarded) {
      completeLesson(lesson.id, lang.id, level);
      setXpAwarded(true);
      setJustCompleted(true);
    }
  };

  const langExt = lang.id === 'python' ? 'py' : lang.id === 'htmlcss' ? 'html' : 'js';
  const fileName = lang.id === 'python' ? 'main.py' : lang.id === 'htmlcss' ? 'index.html' : lang.id === 'fullstack' ? 'server.js' : 'index.js';

  return (
    <div style={s.lessonPage}>
      {/* ── Header ── */}
      <div style={s.lvHeader}>
        <BackBtn onClick={onBack} />
        <div style={s.lvTitleRow}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>{lang.icon}</span>
          <div>
            <div style={s.lvBreadcrumb}>{lang.name} · <span style={{ color: meta.color }}>{meta.label}</span></div>
            <h1 style={s.lvTitle}>{lesson.title}</h1>
          </div>
        </div>
        <div style={s.lvBadges}>
          <span style={{ ...s.lvBadge, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>+{lesson.xp} XP</span>
          {xpAwarded && <span style={{ ...s.lvBadge, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>✅ Completed</span>}
        </div>
      </div>

      {/* ── Step Nav ── */}
      <div style={s.stepNav}>
        {STEPS.map((st) => {
          const isActive = step === st.id;
          const isDone   = stepOrder[st.id] < stepOrder[step];
          return (
            <button key={st.id} onClick={() => setStep(st.id)}
              style={{ ...s.stepBtn, ...(isActive ? s.stepBtnActive : {}), ...(isDone ? s.stepBtnDone : {}) }}>
              <span style={s.stepBtnIcon}>{isDone ? '✓' : st.icon}</span>
              <span>{st.label}</span>
            </button>
          );
        })}
        {/* XP progress bar inside step nav */}
        <div style={s.stepProgWrap}>
          <div style={{ ...s.stepProgFill, width: `${Math.round((stepOrder[step] / 3) * 100)}%`, background: meta.color }} />
        </div>
      </div>

      {/* ══════════════════════════════════════
          STEP: VIDEO — theory + timestamps
      ══════════════════════════════════════ */}
      {step === 'video' && (
        <div style={s.stepBody} className="anim-fade-in">
          <div style={s.videoGrid}>

            {/* Timestamp sidebar */}
            <div style={s.tsSidebar}>
              <div style={s.tsSidebarTitle}>📋 Chapters</div>
              {(lesson.timestamps || []).map((ts, i) => (
                <button key={i} onClick={() => setActiveTs(i)}
                  style={{ ...s.tsRow, ...(activeTs === i ? s.tsRowActive : {}) }}>
                  {activeTs === i && <div style={{ ...s.tsActiveLine, background: meta.color }} />}
                  <span style={{ ...s.tsTime, color: activeTs === i ? meta.color : '#64748b' }}>{ts.time}</span>
                  <span style={{ ...s.tsLabel, color: activeTs === i ? '#e8edf5' : '#94a3b8' }}>{ts.label}</span>
                </button>
              ))}
              <div style={s.tsSidebarNote}>
                💡 Tap each chapter to follow along
              </div>
            </div>

            {/* Theory content */}
            <div style={s.theoryCol}>
              <div style={s.theoryCard}>
                <h3 style={s.theoryChapter}>
                  <span style={{ ...s.theoryChapterDot, background: meta.color }} />
                  {lesson.timestamps?.[activeTs]?.label ?? 'Overview'}
                </h3>
                <div style={s.theoryBody}>{renderRichText(lesson.theory)}</div>
                {(lesson.concepts || []).length > 0 && (
                  <div style={s.conceptsSection}>
                    <div style={s.conceptsTitle}>🔑 Key Concepts</div>
                    <div style={s.conceptsGrid}>
                      {lesson.concepts.map((c, i) => (
                        <div key={i} style={s.conceptCard}>
                          <div style={{ ...s.conceptLabel, color: meta.color }}>{c.label}</div>
                          <div style={s.conceptBody}>{c.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setStep('code')}
                style={{ ...s.ctaBtn, background: `linear-gradient(135deg,${meta.color},${meta.color}cc)` }}>
                Continue to Code →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: CODE
      ══════════════════════════════════════ */}
      {step === 'code' && (
        <div style={s.stepBody} className="anim-fade-in">
          <div style={s.codeWrap}>
            <div style={s.codeBlock}>
              <div style={s.codeTopBar}>
                <div style={s.trafficLights}>
                  <span style={{ ...s.tl, background: '#ef4444' }} />
                  <span style={{ ...s.tl, background: '#f59e0b' }} />
                  <span style={{ ...s.tl, background: '#10b981' }} />
                </div>
                <span style={s.codeFilename}>{fileName}</span>
                <span style={{ ...s.codeLangTag, borderColor: `${meta.color}40`, color: meta.color, background: `${meta.color}12` }}>
                  {lang.name}
                </span>
              </div>
              <pre style={s.codePre}>
                <code style={s.codeText}>{lesson.code}</code>
              </pre>
            </div>
            <div style={s.codeFooter}>
              <button onClick={() => setStep('video')} style={s.ghostBtn}>← Back to Lesson</button>
              <button onClick={() => setStep('quiz')}
                style={{ ...s.ctaBtn, background: `linear-gradient(135deg,${meta.color},${meta.color}cc)` }}>
                Take the Quiz →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: QUIZ
      ══════════════════════════════════════ */}
      {step === 'quiz' && (
        <div style={s.stepBody} className="anim-fade-in">
          <div style={s.quizWrap}>
            <div style={s.quizCard}>
              <div style={s.quizTopRow}>
                <span style={s.quizTag}>🎯 Knowledge Check</span>
                <span style={s.quizXpHint}>Quiz + Challenge = +{lesson.xp} XP</span>
              </div>
              <h2 style={s.quizQuestion}>{lesson.quiz.question}</h2>
              <div style={s.quizOpts}>
                {lesson.quiz.options.map((opt, i) => {
                  let extra = {};
                  if (quizAnswer !== null) {
                    if (i === lesson.quiz.answer) extra = s.optCorrect;
                    else if (i === quizAnswer)    extra = s.optWrong;
                    else                           extra = { opacity: 0.4 };
                  }
                  const letterStyle = quizAnswer !== null
                    ? i === lesson.quiz.answer ? { background: '#10b981', color: '#fff', borderColor: '#10b981' }
                    : i === quizAnswer          ? { background: '#ef4444', color: '#fff', borderColor: '#ef4444' }
                    : { background: `${meta.color}18`, color: meta.color, borderColor: `${meta.color}40` }
                    : { background: `${meta.color}18`, color: meta.color, borderColor: `${meta.color}40` };

                  return (
                    <button key={i} onClick={() => handleQuizAnswer(i)}
                      style={{ ...s.quizOptBtn, ...extra }}>
                      <span style={{ ...s.optLetter, ...letterStyle }}>
                        {['A','B','C','D'][i]}
                      </span>
                      <span style={s.optText}>{opt}</span>
                      {quizAnswer !== null && i === lesson.quiz.answer && (
                        <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: 18 }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {quizResult && (
                <div style={{ ...s.quizFeedback, background: quizResult === 'correct' ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)', borderColor: quizResult === 'correct' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)' }}
                  className="anim-fade-in">
                  <span style={{ fontSize: 28 }}>{quizResult === 'correct' ? '🎉' : '💡'}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: quizResult === 'correct' ? '#10b981' : '#f87171' }}>
                      {quizResult === 'correct' ? 'Correct! Well done.' : 'Not quite — but that\'s how we learn!'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>{lesson.quiz.explanation}</div>
                  </div>
                </div>
              )}

              <div style={s.quizFooter}>
                <button onClick={() => setStep('code')} style={s.ghostBtn}>← Back to Code</button>
                {quizResult && (
                  <button onClick={() => setStep('challenge')}
                    style={{ ...s.ctaBtn, background: `linear-gradient(135deg,${meta.color},${meta.color}cc)` }}>
                    Go to Challenge →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP: CHALLENGE
      ══════════════════════════════════════ */}
      {step === 'challenge' && (
        <div style={s.stepBody} className="anim-fade-in">
          {challengeMode === 'task' ? (
            <div style={s.challengeCard}>
              <div style={s.challengeTopRow}>
                <span style={s.challengeTag}>⚡ Try It Yourself</span>
                {!xpAwarded && <span style={s.challengeXpHint}>Complete to earn +{lesson.xp} XP</span>}
              </div>
              <h2 style={s.challengeTitle}>{lesson.challenge.title}</h2>
              <p style={s.challengeDesc}>{lesson.challenge.description}</p>

              <div style={s.challengeActions}>
                <button onClick={() => setShowHint(h => !h)} style={s.hintToggle}>
                  {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
                </button>
                <button onClick={() => setChallengeMode('review')} style={s.reviewToggle}>
                  📖 Review Lesson &amp; Code
                </button>
              </div>

              {showHint && (
                <div style={s.hintBox} className="anim-fade-in">
                  <div style={s.hintHead}>💡 Hint</div>
                  <p style={s.hintText}>{lesson.challenge.hint}</p>
                </div>
              )}

              {/* Example solution panel */}
              <div style={s.exampleBlock}>
                <div style={s.exHeader}>
                  <div style={s.trafficLights}>
                    <span style={{ ...s.tl, background: '#ef4444' }} />
                    <span style={{ ...s.tl, background: '#f59e0b' }} />
                    <span style={{ ...s.tl, background: '#10b981' }} />
                  </div>
                  <span style={s.codeFilename}>example_solution.{langExt}</span>
                  <span style={{ ...s.codeLangTag, borderColor: '#1a2740', color: '#64748b', background: 'transparent', fontSize: 11 }}>
                    Reference only
                  </span>
                </div>
                <pre style={s.codePre}><code style={s.codeText}>{lesson.challenge.example}</code></pre>
              </div>

              {/* Complete button or done state */}
              {!xpAwarded ? (
                <button onClick={handleMarkComplete}
                  style={{ ...s.completeBtn, background: `linear-gradient(135deg,${meta.color},${meta.color}cc)`, boxShadow: `0 4px 24px ${meta.color}44` }}>
                  ✅ I've Done It — Claim {lesson.xp} XP
                </button>
              ) : (
                <div style={s.doneBanner} className="anim-scale-in">
                  <span style={{ fontSize: 32 }}>{justCompleted ? '🎉' : '✅'}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#10b981' }}>
                      {justCompleted ? `+${lesson.xp} XP Earned!` : 'Already Completed'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 14 }}>
                      {justCompleted ? 'Great work! Keep going.' : 'You completed this lesson previously.'}
                    </div>
                  </div>
                </div>
              )}

              <button onClick={onBack} style={{ ...s.ghostBtn, marginTop: 8 }}>
                ← Back to Lesson List
              </button>
            </div>
          ) : (
            /* Review mode */
            <div style={s.reviewCard} className="anim-fade-in">
              <div style={s.reviewTopRow}>
                <button onClick={() => setChallengeMode('task')} style={s.ghostBtn}>← Back to Challenge</button>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700 }}>📖 Lesson Review</h2>
              </div>
              <div style={s.reviewGrid}>
                <div>
                  <div style={s.reviewSectionLabel}>Theory</div>
                  <div style={s.theoryCard}>{renderRichText(lesson.theory)}</div>
                </div>
                <div>
                  <div style={s.reviewSectionLabel}>Code Example</div>
                  <div style={s.codeBlock}>
                    <div style={s.codeTopBar}>
                      <div style={s.trafficLights}>
                        <span style={{ ...s.tl, background: '#ef4444' }} />
                        <span style={{ ...s.tl, background: '#f59e0b' }} />
                        <span style={{ ...s.tl, background: '#10b981' }} />
                      </div>
                      <span style={s.codeFilename}>{fileName}</span>
                    </div>
                    <pre style={{ ...s.codePre, maxHeight: 420, overflowY: 'auto' }}>
                      <code style={s.codeText}>{lesson.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   HELPERS
═══════════════════════════════════ */
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={s.backBtn}>← Back</button>
  );
}

function renderRichText(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />;

    // Parse inline **bold** and `code`
    const parseLine = (str) => {
      const tokens = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return tokens.map((tok, j) => {
        if (tok.startsWith('**') && tok.endsWith('**'))
          return <strong key={j} style={{ color: '#e8edf5', fontWeight: 700 }}>{tok.slice(2, -2)}</strong>;
        if (tok.startsWith('`') && tok.endsWith('`'))
          return <code key={j} style={s.inlineCode}>{tok.slice(1, -1)}</code>;
        return tok;
      });
    };

    if (line.startsWith('- '))
      return <div key={i} style={s.bullet}>• {parseLine(line.slice(2))}</div>;
    return <p key={i} style={s.theoryPara}>{parseLine(line)}</p>;
  });
}

/* ═══════════════════════════════════
   STYLES
═══════════════════════════════════ */
const s = {
  /* ─ Shell */
  page:       { padding: '36px 44px', maxWidth: 1080 },
  lessonPage: { padding: '28px 44px', maxWidth: 1200 },
  pageHeader: { marginBottom: 36 },
  pageTitle:  { fontFamily: 'Syne,sans-serif', fontSize: 34, fontWeight: 800, marginBottom: 8, color: '#e8edf5' },
  pageSub:    { color: '#94a3b8', fontSize: 16 },

  /* ─ Back */
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#818cf8', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans,sans-serif', marginBottom: 22, padding: '8px 16px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' },

  /* ─ Language grid */
  langGrid:      { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 22 },
  langCard:      { background: 'rgba(22,29,46,0.75)', border: '1px solid #1a2740', borderRadius: 22, padding: '26px', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s,box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: 16 },
  langIconBg:    { width: 70, height: 70, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  langIconTxt:   { fontSize: 36 },
  langBody:      { flex: 1 },
  langName:      { fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 6, color: '#e8edf5' },
  langTagline:   { color: '#94a3b8', fontSize: 13, lineHeight: 1.5, marginBottom: 14 },
  levelPills:    { display: 'flex', gap: 8, marginBottom: 14 },
  levelPill:     { padding: '3px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, fontSize: 11, color: '#818cf8' },
  langProgRow:   { display: 'flex', alignItems: 'center', gap: 10 },
  langProgBar:   { flex: 1, height: 5, background: 'rgba(6,9,18,0.6)', borderRadius: 3, overflow: 'hidden' },
  langProgFill:  { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  langProgLabel: { fontSize: 12, fontWeight: 700, flexShrink: 0 },
  xpChip:        { position: 'absolute', top: 20, right: 20, padding: '4px 10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, fontSize: 11, color: '#f59e0b', fontWeight: 600 },
  cardArrow:     { position: 'absolute', bottom: 22, right: 22, fontSize: 22, fontWeight: 700 },

  /* ─ Level grid */
  langHeroRow:   { display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 },
  langHeroEmoji: { fontSize: 46 },
  xpBanner:      { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, color: '#94a3b8', fontSize: 14, marginBottom: 28 },
  levelGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 },
  levelCard:     { background: 'rgba(22,29,46,0.75)', border: '1px solid #1a2740', borderRadius: 22, padding: '28px 22px', textAlign: 'left', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.2s,box-shadow 0.2s', overflow: 'hidden' },
  levelCardLocked: { cursor: 'not-allowed', opacity: 0.65 },
  lockOverlay:   { position: 'absolute', inset: 0, background: 'rgba(6,9,18,0.72)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 5 },
  lockEmoji:     { fontSize: 36 },
  lockMsg:       { fontWeight: 700, fontSize: 16, color: '#94a3b8' },
  lockHint:      { fontSize: 13, color: '#64748b' },
  levelEmojiBg:  { width: 62, height: 62, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  levelEmojiTxt: { fontSize: 30 },
  levelLabel:    { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#e8edf5' },
  levelDesc:     { color: '#94a3b8', fontSize: 13, lineHeight: 1.6 },
  levelStats:    { display: 'flex', gap: 12, flexWrap: 'wrap' },
  levelStat:     { fontSize: 12, color: '#64748b' },
  levelProgRow:  { display: 'flex', alignItems: 'center', gap: 8 },
  levelProgBar:  { flex: 1, height: 5, background: 'rgba(6,9,18,0.6)', borderRadius: 3, overflow: 'hidden' },
  levelProgFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s' },
  levelDone:     { fontSize: 12, color: '#64748b' },
  completeChip:  { display: 'inline-block', padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid' },

  /* ─ Lesson list */
  listHeader:    { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  levelBadge:    { padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, border: '1px solid' },
  masterBar:     { height: 6, background: 'rgba(22,29,46,0.8)', borderRadius: 3, overflow: 'hidden', marginBottom: 24 },
  masterFill:    { height: '100%', borderRadius: 3, transition: 'width 0.6s' },
  lessonList:    { display: 'flex', flexDirection: 'column', gap: 10 },
  lessonRow:     { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(22,29,46,0.65)', border: '1px solid #1a2740', borderRadius: 15, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' },
  lessonRowDone: { background: 'rgba(16,185,129,0.04)' },
  lessonRowLocked: { opacity: 0.5, cursor: 'not-allowed' },
  lessonNum:     { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  lessonInfo:    { flex: 1 },
  lessonTitle:   { fontWeight: 600, fontSize: 16, marginBottom: 6 },
  lessonMeta:    { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip:          { padding: '3px 10px', background: 'rgba(22,29,46,0.8)', border: '1px solid #1a2740', borderRadius: 20, fontSize: 11, color: '#64748b' },

  /* ─ Lesson view */
  lvHeader:    { marginBottom: 18 },
  lvTitleRow:  { display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0 10px' },
  lvBreadcrumb:{ fontSize: 12, color: '#64748b', marginBottom: 3 },
  lvTitle:     { fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5' },
  lvBadges:    { display: 'flex', gap: 8, flexWrap: 'wrap' },
  lvBadge:     { padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid' },

  /* ─ Step nav */
  stepNav:         { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 26, flexWrap: 'wrap' },
  stepBtn:         { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(22,29,46,0.6)', border: '1px solid #1a2740', borderRadius: 12, color: '#64748b', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' },
  stepBtnActive:   { background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', fontWeight: 700 },
  stepBtnDone:     { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' },
  stepBtnIcon:     { fontSize: 16 },
  stepProgWrap:    { flex: 1, height: 4, background: 'rgba(22,29,46,0.8)', borderRadius: 2, overflow: 'hidden', minWidth: 60 },
  stepProgFill:    { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },

  stepBody: { animation: 'fadeIn 0.3s ease' },

  /* ─ Video / timestamps */
  videoGrid:       { display: 'grid', gridTemplateColumns: '230px 1fr', gap: 24 },
  tsSidebar:       { background: 'rgba(13,17,23,0.85)', border: '1px solid #1a2740', borderRadius: 18, padding: '16px 12px', position: 'sticky', top: 24, height: 'fit-content' },
  tsSidebarTitle:  { fontFamily: 'Syne,sans-serif', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, paddingLeft: 10 },
  tsRow:           { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', marginBottom: 2 },
  tsRowActive:     { background: 'rgba(99,102,241,0.1)' },
  tsActiveLine:    { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, borderRadius: '0 3px 3px 0' },
  tsTime:          { fontSize: 11, fontFamily: 'JetBrains Mono,monospace', fontWeight: 600, flexShrink: 0, width: 36 },
  tsLabel:         { fontSize: 13, lineHeight: 1.4 },
  tsSidebarNote:   { marginTop: 14, padding: '10px 10px', background: 'rgba(99,102,241,0.07)', borderRadius: 10, fontSize: 11, color: '#475569', lineHeight: 1.6 },

  theoryCol:       { display: 'flex', flexDirection: 'column', gap: 20 },
  theoryCard:      { background: 'rgba(13,17,23,0.7)', border: '1px solid #1a2740', borderRadius: 18, padding: '28px 30px' },
  theoryChapter:   { fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#e8edf5', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 },
  theoryChapterDot:{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  theoryBody:      { display: 'flex', flexDirection: 'column', gap: 2 },
  theoryPara:      { color: '#94a3b8', lineHeight: 1.85, fontSize: 15, margin: '4px 0' },
  bullet:          { color: '#94a3b8', lineHeight: 1.75, fontSize: 15, paddingLeft: 4, margin: '3px 0' },
  inlineCode:      { fontFamily: 'JetBrains Mono,monospace', fontSize: 12.5, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, padding: '1px 6px', color: '#a5b4fc' },
  conceptsSection: { marginTop: 24, paddingTop: 24, borderTop: '1px solid #1a2740' },
  conceptsTitle:   { fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#64748b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  conceptsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  conceptCard:     { padding: '14px 16px', background: 'rgba(22,29,46,0.6)', border: '1px solid #1a2740', borderRadius: 12 },
  conceptLabel:    { fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', marginBottom: 5 },
  conceptBody:     { fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },

  /* ─ Shared CTA */
  ctaBtn:  { padding: '13px 32px', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'all 0.2s', alignSelf: 'flex-start', border: 'none', cursor: 'pointer' },
  ghostBtn:{ padding: '11px 22px', background: 'rgba(22,29,46,0.7)', border: '1px solid #1a2740', color: '#94a3b8', borderRadius: 11, fontSize: 14, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, cursor: 'pointer' },

  /* ─ Code block */
  codeWrap:     { display: 'flex', flexDirection: 'column', gap: 18 },
  codeBlock:    { background: 'rgba(6,9,18,0.97)', border: '1px solid #1a2740', borderRadius: 18, overflow: 'hidden' },
  codeTopBar:   { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(22,29,46,0.9)', borderBottom: '1px solid #1a2740' },
  trafficLights:{ display: 'flex', gap: 6 },
  tl:           { width: 12, height: 12, borderRadius: '50%' },
  codeFilename: { flex: 1, textAlign: 'center', color: '#64748b', fontSize: 13, fontFamily: 'JetBrains Mono,monospace' },
  codeLangTag:  { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid' },
  codePre:      { margin: 0, padding: '24px 28px', overflowX: 'auto' },
  codeText:     { fontFamily: 'JetBrains Mono,monospace', fontSize: 13, lineHeight: 1.9, color: '#a5b4fc', whiteSpace: 'pre' },
  codeFooter:   { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },

  /* ─ Quiz */
  quizWrap:     { maxWidth: 760 },
  quizCard:     { background: 'rgba(22,29,46,0.7)', border: '1px solid #1a2740', borderRadius: 22, padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 20 },
  quizTopRow:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  quizTag:      { padding: '6px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, fontSize: 13, color: '#818cf8', fontWeight: 600 },
  quizXpHint:   { fontSize: 13, color: '#64748b' },
  quizQuestion: { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: '#e8edf5', lineHeight: 1.4 },
  quizOpts:     { display: 'flex', flexDirection: 'column', gap: 12 },
  quizOptBtn:   { display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', background: 'rgba(13,17,23,0.7)', border: '1px solid #1a2740', borderRadius: 14, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans,sans-serif', fontSize: 15, color: '#e8edf5', width: '100%' },
  optCorrect:   { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.5)' },
  optWrong:     { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.5)' },
  optLetter:    { width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, border: '1px solid', transition: 'all 0.2s' },
  optText:      { flex: 1 },
  quizFeedback: { display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 22px', borderRadius: 14, border: '1px solid' },
  quizFooter:   { display: 'flex', gap: 12, flexWrap: 'wrap' },

  /* ─ Challenge */
  challengeCard:    { background: 'rgba(22,29,46,0.7)', border: '1px solid #1a2740', borderRadius: 22, padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 880 },
  challengeTopRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  challengeTag:     { padding: '6px 14px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, fontSize: 13, color: '#f59e0b', fontWeight: 600 },
  challengeXpHint:  { fontSize: 13, color: '#64748b' },
  challengeTitle:   { fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#e8edf5', lineHeight: 1.3 },
  challengeDesc:    { color: '#94a3b8', fontSize: 15, lineHeight: 1.8 },
  challengeActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  hintToggle:       { padding: '9px 18px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, color: '#818cf8', fontSize: 14, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer' },
  reviewToggle:     { padding: '9px 18px', background: 'rgba(22,29,46,0.7)', border: '1px solid #1a2740', borderRadius: 10, color: '#94a3b8', fontSize: 14, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer' },
  hintBox:          { padding: '18px 22px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14 },
  hintHead:         { fontWeight: 700, fontSize: 14, color: '#818cf8', marginBottom: 8 },
  hintText:         { color: '#94a3b8', fontSize: 14, lineHeight: 1.75 },
  exampleBlock:     { background: 'rgba(6,9,18,0.97)', border: '1px solid #1a2740', borderRadius: 16, overflow: 'hidden' },
  exHeader:         { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'rgba(22,29,46,0.9)', borderBottom: '1px solid #1a2740' },
  completeBtn:      { padding: '15px 36px', color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', border: 'none', cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-start' },
  doneBanner:       { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16 },

  /* ─ Review mode */
  reviewCard:      { background: 'rgba(22,29,46,0.7)', border: '1px solid #1a2740', borderRadius: 22, padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 24 },
  reviewTopRow:    { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  reviewGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  reviewSectionLabel: { fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
};
