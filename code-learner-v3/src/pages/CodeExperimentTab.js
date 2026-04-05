import React, { useState, useCallback } from 'react';
import { executeCode } from '../utils/codeExecutor';

// ── Starter code templates ─────────────────────────────────
const STARTERS = {
  python: `# Python Experiment
# Write any Python code and hit ▶ Run

name = "Code Learner"
age = 20
print(f"Hello from {name}!")

numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print("Numbers:", numbers)
print("Sum:", total)
print("Average:", total / len(numbers))

# Try editing this!
for i in range(1, 6):
    print(f"  {i} squared = {i ** 2}")
`,
  javascript: `// JavaScript Experiment
// Write any JS and hit ▶ Run

const name = "Code Learner";
const age = 20;
console.log(\`Hello from \${name}!\`);

const numbers = [1, 2, 3, 4, 5];
const total = numbers.reduce((a, n) => a + n, 0);
console.log("Numbers:", numbers);
console.log("Sum:", total);
console.log("Average:", total / numbers.length);

// Try the power of array methods!
const squared = numbers.map(n => n ** 2);
console.log("Squared:", squared);
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #1a1a2e; color: white; padding: 24px; }
    h1   { color: #818cf8; margin-bottom: 8px; }
    .card { background: #16213e; padding: 20px; border-radius: 12px; margin-top: 16px; }
    button { background: #6366f1; color: white; padding: 10px 20px;
             border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <h1>🚀 My Web Page</h1>
  <div class="card">
    <p>Edit this HTML and see it render live!</p>
    <button onclick="this.textContent = 'Clicked! ✓'">Click Me</button>
  </div>
</body>
</html>`,
  java: `// Java — Simulated Output
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");

        String name = "Code Learner";
        int age = 20;
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);

        // Loop example
        for (int i = 1; i <= 5; i++) {
            System.out.println(i + " squared = " + (i * i));
        }
    }
}`,
};

const LANGS = [
  { id: 'python',     label: 'Python',      icon: '🐍', color: '#3776AB', file: 'main.py'    },
  { id: 'javascript', label: 'JavaScript',  icon: '⚡', color: '#F7DF1E', file: 'index.js'   },
  { id: 'html',       label: 'HTML & CSS',  icon: '🎨', color: '#E34F26', file: 'index.html' },
  { id: 'java',       label: 'Java',        icon: '☕', color: '#ED8B00', file: 'Main.java'  },
];

// ── Simulated AI explanations ─────────────────────────────
function buildAIExplanation(langId, code) {
  const explanations = {
    python: {
      syntax: [
        { color: '#a5b4fc', token: 'f"..."',        desc: 'f-string — embed variables directly inside text using {var}.' },
        { color: '#10b981', token: 'for i in ...',   desc: 'for loop — iterates over each item in a sequence one by one.' },
        { color: '#f59e0b', token: 'sum(list)',       desc: 'Built-in function — adds all numbers in an iterable together.' },
        { color: '#ec4899', token: 'range(1, 6)',     desc: 'Generates integers from 1 up to (not including) 6.' },
      ],
      logic: 'The code creates variables, builds a list, uses built-in functions (sum, len) to compute statistics, then uses a for loop with range() to iterate and print squared values. f-strings embed expressions directly into the output strings.',
      pros: ['Clean, readable Pythonic style', 'Uses built-in functions efficiently', 'f-strings keep formatting concise', 'range() avoids manual index tracking'],
      cons: ['No error handling if list is empty', 'Division result could be a float with many decimals', 'Magic numbers (range 1–6) could be named constants'],
      improvements: 'Add a guard for empty lists before dividing. Use round(total/len(numbers), 2) for cleaner average display. Extract the range limit into a variable like LIMIT = 5 for maintainability.',
    },
    javascript: {
      syntax: [
        { color: '#a5b4fc', token: 'const',          desc: 'Declares an immutable binding — the variable cannot be reassigned.' },
        { color: '#10b981', token: 'reduce()',        desc: 'Collapses an array into a single value using an accumulator function.' },
        { color: '#f59e0b', token: '`${...}`',        desc: 'Template literal — embed any JS expression inside backtick strings.' },
        { color: '#ec4899', token: 'map()',           desc: 'Transforms each element and returns a new array of the same length.' },
      ],
      logic: 'The code declares constants, uses reduce() to sum an array (the accumulator pattern), calculates average with division, then uses map() to square every element. All variables use const — immutable by design.',
      pros: ['Follows modern ES6+ conventions', 'Immutable const bindings prevent bugs', 'Method chaining is clean and composable', 'Arrow functions keep callbacks concise'],
      cons: ['No input validation — empty array would give NaN', 'console.log("Numbers:", numbers) prints [object] in some environments', 'Average uses floating-point division — may need rounding'],
      improvements: 'Add numbers.length > 0 check before reduce. Use toFixed(2) on the average. Consider using Array.isArray() to validate input. For large datasets, a single reduce pass computing both sum and count is more efficient.',
    },
    html: {
      syntax: [
        { color: '#a5b4fc', token: '<style>',        desc: 'Embeds CSS directly inside the HTML document head.' },
        { color: '#10b981', token: 'onclick',         desc: 'Inline event handler — calls JS when element is clicked.' },
        { color: '#f59e0b', token: 'border-radius',  desc: 'CSS property that rounds element corners by a specified amount.' },
        { color: '#ec4899', token: ':hover',          desc: 'CSS pseudo-class — applies styles only when cursor is over element.' },
      ],
      logic: 'The HTML page sets up a dark-themed layout using embedded CSS. The body background uses a dark color, elements are card-styled with rounded corners and padding. The button uses an inline onclick handler to modify its own text content.',
      pros: ['Clean semantic HTML structure', 'Self-contained — works without external files', 'Good use of CSS custom values for spacing', 'Interactive without any JS imports'],
      cons: ['Inline onclick is outdated — prefer addEventListener', 'No <meta viewport> tag for mobile responsiveness', 'CSS should be in an external file for real projects', 'No accessibility attributes (aria-label, role)'],
      improvements: 'Move onclick to addEventListener("click", handler) in a <script> tag. Add <meta name="viewport" content="width=device-width, initial-scale=1"> in head. Use CSS custom properties (variables) for the color palette.',
    },
    java: {
      syntax: [
        { color: '#a5b4fc', token: 'public class',   desc: 'Declares a class accessible from anywhere — Java requires a class wrapper.' },
        { color: '#10b981', token: 'static void main', desc: 'Entry point — JVM looks for this exact signature to start the program.' },
        { color: '#f59e0b', token: 'System.out.println', desc: 'Prints to standard output with a newline — Java\'s equivalent of print().' },
        { color: '#ec4899', token: 'for (int i=1; i<=5; i++)', desc: 'C-style for loop — initialise, condition, increment all in one line.' },
      ],
      logic: 'The Java program follows the mandatory class → main method structure. It declares typed variables (String, int), prints them using System.out.println with + concatenation, then uses a traditional C-style for loop to print a sequence of squared values.',
      pros: ['Strongly typed — bugs caught at compile time', 'Clear, explicit variable declarations', 'Standard Java structure that all Java developers recognise'],
      cons: ['Verbose compared to Python or JS equivalents', 'String concatenation with + is inefficient for many strings — use StringBuilder', 'Primitive for loop could use enhanced for loop (for-each) for collections'],
      improvements: 'Use String.format() or printf for cleaner formatted output. Use a List<Integer> and enhanced for loop for iteration. For many concatenations, use StringBuilder. Java 17+ supports records and text blocks.',
    },
  };
  return explanations[langId] || explanations.python;
}

function simulateJavaOutput(code) {
  const logs = [];
  const matches = [...code.matchAll(/System\.out\.println\(([^;]+)\)/g)];
  matches.forEach(m => {
    let val = m[1].trim();
    val = val.replace(/"/g, '').replace(/\s*\+\s*/g, ' ').replace(/\(i \* i\)/g, '').replace(/i =/g, '').trim();
    logs.push(val);
  });
  if (logs.length === 0) return '// No System.out.println() statements found.';
  return logs.join('\n');
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function CodeExperimentTab() {
  const [langId,      setLangId]      = useState('python');
  const [code,        setCode]        = useState(STARTERS.python);
  const [output,      setOutput]      = useState('');
  const [outputType,  setOutputType]  = useState('text'); // text | html | error
  const [running,     setRunning]     = useState(false);
  const [aiPanel,     setAiPanel]     = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiResult,    setAiResult]    = useState(null);

  const lang = LANGS.find(l => l.id === langId);

  const switchLang = (id) => {
    setLangId(id);
    setCode(STARTERS[id]);
    setOutput('');
    setOutputType('text');
    setAiResult(null);
    setAiPanel(false);
  };

  const runCode = useCallback(async () => {
    setRunning(true);
    setOutput('');
    await new Promise(r => setTimeout(r, 300));

    if (langId === 'html') {
      setOutputType('html');
      setOutput(code);
    } else if (langId === 'java') {
      setOutputType('text');
      setOutput(simulateJavaOutput(code));
    } else {
      const { output: out, error } = executeCode(langId, code);
      if (error) {
        setOutputType('error');
        setOutput(`❌ ${error}`);
      } else {
        setOutputType('text');
        setOutput(out || '(no output)');
      }
    }
    setRunning(false);
  }, [langId, code]);

  const explainWithAI = useCallback(async () => {
    setAiPanel(true);
    setAiLoading(true);
    setAiResult(null);
    await new Promise(r => setTimeout(r, 1600));
    setAiResult(buildAIExplanation(langId, code));
    setAiLoading(false);
  }, [langId, code]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const newCode = code.substring(0, start) + '  ' + code.substring(e.target.selectionEnd);
      setCode(newCode);
      requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  };

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Code Experiment</h1>
          <p style={s.sub}>Write, run, and explore code in real time — then let AI explain it</p>
        </div>
        <button onClick={explainWithAI} style={s.aiBtn}>
          🤖 AI Explain
        </button>
      </div>

      {/* ── Language Tabs ── */}
      <div style={s.langTabs}>
        {LANGS.map(l => (
          <button key={l.id} onClick={() => switchLang(l.id)}
            style={{ ...s.langTab, ...(langId === l.id ? { ...s.langTabActive, borderColor: `${l.color}60`, color: l.color, background: `${l.color}14` } : {}) }}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </button>
        ))}
        <div style={s.runShortcut}>Ctrl+Enter to run</div>
      </div>

      {/* ── Editor + Output ── */}
      <div style={s.editorRow}>
        {/* Editor */}
        <div style={s.editorPane}>
          <div style={s.editorTopBar}>
            <div style={s.trafficLights}>
              <span style={{ ...s.tl, background: '#ef4444' }} />
              <span style={{ ...s.tl, background: '#f59e0b' }} />
              <span style={{ ...s.tl, background: '#10b981' }} />
            </div>
            <span style={s.editorFilename}>{lang.file}</span>
            <span style={{ ...s.langTag, borderColor: `${lang.color}50`, color: lang.color, background: `${lang.color}14` }}>{lang.label}</span>
            <button onClick={runCode} disabled={running}
              style={{ ...s.runBtn, background: running ? '#1e2a3e' : `linear-gradient(135deg,#10b981,#059669)` }}>
              {running ? '⏳ Running...' : '▶ Run'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            style={s.editor}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Output */}
        <div style={s.outputPane}>
          <div style={s.outputTopBar}>
            <span style={s.outputTitle}>
              📟 Output
              {outputType === 'error' && <span style={s.errorTag}>Error</span>}
              {outputType === 'html' && <span style={s.previewTag}>Live Preview</span>}
            </span>
            {output && (
              <button onClick={() => setOutput('')} style={s.clearBtn}>Clear</button>
            )}
          </div>
          {outputType === 'html' && output
            ? <iframe srcDoc={output} style={s.htmlPreview} title="HTML Preview" sandbox="allow-scripts" />
            : <pre style={{ ...s.outputPre, color: outputType === 'error' ? '#f87171' : '#10b981' }}>
                {output || '// Press ▶ Run or Ctrl+Enter to execute your code'}
              </pre>
          }
        </div>
      </div>

      {/* ── AI Explain Panel ── */}
      {aiPanel && (
        <div style={s.aiPanel} className="anim-fade-in">
          <div style={s.aiPanelHeader}>
            <div>
              <h2 style={s.aiPanelTitle}>🤖 AI Code Analysis</h2>
              <p style={s.aiPanelSub}>Deep breakdown of your {lang.label} code</p>
            </div>
            <button onClick={() => setAiPanel(false)} style={s.closeBtn}>✕</button>
          </div>

          {aiLoading ? (
            <div style={s.aiLoading}>
              <div style={s.aiSpinner} />
              <p style={s.aiLoadingText}>Analysing your code...</p>
              <p style={s.aiLoadingHint}>Reading syntax · Understanding logic · Finding improvements</p>
            </div>
          ) : aiResult && (
            <div style={s.aiContent}>

              {/* Syntax highlights */}
              <div style={s.aiSection}>
                <h3 style={s.aiSectionTitle}>🎨 Syntax Breakdown</h3>
                <div style={s.syntaxGrid}>
                  {aiResult.syntax.map((item, i) => (
                    <div key={i} style={{ ...s.syntaxCard, borderLeftColor: item.color }}>
                      <code style={{ ...s.syntaxToken, color: item.color }}>{item.token}</code>
                      <p style={s.syntaxDesc}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logic */}
              <div style={s.aiSection}>
                <h3 style={s.aiSectionTitle}>🧠 How It Works</h3>
                <p style={s.aiText}>{aiResult.logic}</p>
              </div>

              {/* Pros & Cons */}
              <div style={s.prosConsRow}>
                <div style={s.prosCard}>
                  <h3 style={{ ...s.aiSectionTitle, color: '#10b981' }}>✅ Strengths</h3>
                  {aiResult.pros.map((p, i) => (
                    <div key={i} style={s.proItem}>
                      <span style={s.proDot} />
                      <span style={s.proText}>{p}</span>
                    </div>
                  ))}
                </div>
                <div style={s.consCard}>
                  <h3 style={{ ...s.aiSectionTitle, color: '#f87171' }}>⚠️ Could Improve</h3>
                  {aiResult.cons.map((c, i) => (
                    <div key={i} style={s.conItem}>
                      <span style={s.conDot} />
                      <span style={s.conText}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div style={s.aiSection}>
                <h3 style={s.aiSectionTitle}>💡 Suggestions</h3>
                <p style={s.aiText}>{aiResult.improvements}</p>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const s = {
  page:       { padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 20, height: '100vh', overflow: 'auto' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:      { fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 6, color: '#e8edf5' },
  sub:        { color: '#94a3b8', fontSize: 15 },
  aiBtn:      { padding: '11px 22px', background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 },

  langTabs:   { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  langTab:    { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(22,29,46,0.6)', border: '1px solid #1a2740', borderRadius: 10, color: '#64748b', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer', transition: 'all 0.2s' },
  langTabActive: { fontWeight: 700 },
  runShortcut:{ marginLeft: 'auto', fontSize: 12, color: '#475569', fontFamily: 'JetBrains Mono,monospace' },

  editorRow:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 },
  editorPane: { display: 'flex', flexDirection: 'column', background: 'rgba(6,9,18,0.97)', border: '1px solid #1a2740', borderRadius: 16, overflow: 'hidden' },
  editorTopBar:{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', background: 'rgba(22,29,46,0.9)', borderBottom: '1px solid #1a2740', flexShrink: 0 },
  trafficLights:{ display: 'flex', gap: 6 },
  tl:         { width: 12, height: 12, borderRadius: '50%' },
  editorFilename:{ flex: 1, textAlign: 'center', color: '#64748b', fontSize: 13, fontFamily: 'JetBrains Mono,monospace' },
  langTag:    { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid', flexShrink: 0 },
  runBtn:     { padding: '7px 18px', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', border: 'none', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 },
  editor:     { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#a5b4fc', fontFamily: 'JetBrains Mono,monospace', fontSize: 13, lineHeight: 1.9, padding: '20px 24px', resize: 'none', caretColor: '#818cf8', display: 'block', overflowY: 'auto' },

  outputPane: { display: 'flex', flexDirection: 'column', background: 'rgba(6,9,18,0.95)', border: '1px solid #1a2740', borderRadius: 16, overflow: 'hidden' },
  outputTopBar:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', background: 'rgba(22,29,46,0.6)', borderBottom: '1px solid #1a2740', flexShrink: 0 },
  outputTitle:{ fontSize: 14, fontWeight: 600, fontFamily: 'Syne,sans-serif', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 },
  errorTag:   { padding: '2px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, fontSize: 11, color: '#f87171' },
  previewTag: { padding: '2px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, fontSize: 11, color: '#10b981' },
  clearBtn:   { padding: '4px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, fontSize: 12, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer' },
  outputPre:  { flex: 1, margin: 0, padding: '20px 24px', fontFamily: 'JetBrains Mono,monospace', fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflow: 'auto' },
  htmlPreview:{ flex: 1, border: 'none', background: '#fff' },

  aiPanel:    { background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, overflow: 'hidden' },
  aiPanelHeader:{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid #1a2740' },
  aiPanelTitle:{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 4 },
  aiPanelSub: { color: '#64748b', fontSize: 14 },
  closeBtn:   { width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 16, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', flexShrink: 0 },

  aiLoading:  { padding: '56px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 },
  aiSpinner:  { width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' },
  aiLoadingText:{ color: '#94a3b8', fontSize: 16, fontWeight: 500 },
  aiLoadingHint:{ color: '#475569', fontSize: 13 },

  aiContent:  { padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 },
  aiSection:  { display: 'flex', flexDirection: 'column', gap: 14 },
  aiSectionTitle:{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#e8edf5', margin: 0 },
  aiText:     { color: '#94a3b8', fontSize: 14, lineHeight: 1.85, padding: '16px 20px', background: 'rgba(22,29,46,0.5)', border: '1px solid #1a2740', borderRadius: 12, margin: 0 },

  syntaxGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  syntaxCard: { padding: '14px 16px', background: 'rgba(22,29,46,0.6)', border: '1px solid #1a2740', borderRadius: 12, borderLeft: '3px solid', display: 'flex', flexDirection: 'column', gap: 6 },
  syntaxToken:{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, fontWeight: 600 },
  syntaxDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: 0 },

  prosConsRow:{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  prosCard:   { background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  consCard:   { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  proItem:    { display: 'flex', alignItems: 'flex-start', gap: 10 },
  proText:    { color: '#86efac', fontSize: 13, lineHeight: 1.6 },
  proDot:     { width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginTop: 6, flexShrink: 0 },
  conItem:    { display: 'flex', alignItems: 'flex-start', gap: 10 },
  conText:    { color: '#fca5a5', fontSize: 13, lineHeight: 1.6 },
  conDot:     { width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginTop: 6, flexShrink: 0 },
};
