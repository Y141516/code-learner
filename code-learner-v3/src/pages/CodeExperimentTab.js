import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  executeViaPiston,
  executeHTML,
  executeJSInBrowser,
  detectsInput,
} from '../utils/pistonExecutor';

// ── Language definitions ──────────────────────────────────
const LANGS = [
  {
    id: 'python', label: 'Python', icon: '🐍', color: '#4ec9b0', version: '3.10', file: 'main.py',
    starter: `# Python — Real execution powered by Piston API
# Supports: imports, OOP, recursion, all stdlib

import random
import math

name = "Code Learner"
print(f"Hello, {name}!")

rand_num = random.randint(1, 100)
print(f"Random number: {rand_num}")
print(f"Square root of 144: {math.sqrt(144)}")

squares = [x**2 for x in range(1, 6)]
print(f"Squares: {squares}")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(8):
    print(f"  fib({i}) = {fibonacci(i)}")
`,
  },
  {
    id: 'javascript', label: 'JavaScript', icon: '⚡', color: '#DCDCAA', version: '18.15', file: 'index.js',
    starter: `// JavaScript — Node.js execution via Piston API
// Supports: all Node built-ins, modern ES2023

const name = "Code Learner";
console.log(\`Hello, \${name}!\`);

// Array methods
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
const sorted = [...nums].sort((a, b) => a - b);
console.log("Sorted:", sorted);

const squares = Array.from({length: 5}, (_, i) => (i+1) ** 2);
console.log("Squares:", squares);

// Functions
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci:");
for (let i = 0; i < 8; i++) {
  console.log(\`  fib(\${i}) = \${fibonacci(i)}\`);
}

// Async example
async function main() {
  const result = await Promise.resolve("Async works!");
  console.log(result);
}
main();
`,
  },
  {
    id: 'java', label: 'Java', icon: '☕', color: '#CE9178', version: '15.0', file: 'Main.java',
    starter: `// Java — Real JVM execution via Piston API
import java.util.Arrays;
import java.util.Random;

public class Main {
    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("Hello from Java!");

        String name = "Code Learner";
        System.out.printf("Name: %s%n", name);

        Random rand = new Random();
        System.out.println("Random: " + (rand.nextInt(100) + 1));

        int[] nums = {5, 2, 8, 1, 9, 3};
        Arrays.sort(nums);
        System.out.println("Sorted: " + Arrays.toString(nums));

        System.out.print("Fibonacci: ");
        for (int i = 0; i < 8; i++) {
            System.out.print(fib(i) + " ");
        }
        System.out.println();
    }
}
`,
  },
  {
    id: 'html', label: 'HTML & CSS', icon: '🎨', color: '#F28B54', version: 'browser', file: 'index.html',
    starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 32px; }
    h1   { color: #818cf8; font-size: 2rem; margin-bottom: 8px; }
    p    { color: #94a3b8; line-height: 1.7; margin-bottom: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; margin-top: 20px; }
    button { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; margin-top: 12px; transition: transform 0.2s; }
    button:hover { transform: translateY(-2px); }
    #counter { font-size: 3rem; font-weight: 800; color: #818cf8; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>⚡ Code Learner IDE</h1>
  <p>Edit this HTML and see it render live in the preview panel.</p>
  <div class="card">
    <p>Click the button to count up!</p>
    <div id="counter">0</div>
    <button onclick="document.getElementById('counter').textContent = +document.getElementById('counter').textContent + 1">Count Up +1</button>
  </div>
</body>
</html>`,
  },
];

// ── AI explanation data ───────────────────────────────────
function buildAIExplanation(langId) {
  const data = {
    python: {
      syntax: [
        { token: 'import random',        color: '#c586c0', desc: 'Imports Python\'s standard random module — gives access to randint(), choice(), shuffle(), and more. No installation needed.' },
        { token: 'f"Hello {name}"',      color: '#ce9178', desc: 'f-string: any Python expression inside {} is evaluated and embedded. Faster and cleaner than concatenation or .format().' },
        { token: '[x**2 for x in ...]',  color: '#4ec9b0', desc: 'List comprehension — one-line syntax to create a list by applying an expression to each element of an iterable.' },
        { token: 'def fibonacci(n):',    color: '#dcdcaa', desc: 'Function definition using recursion — the function calls itself with a smaller input until it hits the base case (n ≤ 1).' },
      ],
      logic: 'The program imports random and math from the standard library, prints an f-string greeting, generates a random integer, computes a square root, builds a list of squares with a comprehension, then defines and calls a recursive fibonacci function in a loop.',
      pros: ['Clean Pythonic style throughout', 'Uses standard library imports correctly', 'f-strings for all string formatting', 'List comprehension is idiomatic and efficient'],
      cons: ['Recursive fibonacci is O(2ⁿ) — exponential time', 'No guard for negative input in fibonacci()', 'rand_num is computed but the variable isn\'t reused'],
      improvements: 'Memoize fibonacci with @functools.lru_cache or use an iterative approach. Add input validation: if n < 0: raise ValueError. For large sequences, use a generator instead of a loop.',
    },
    javascript: {
      syntax: [
        { token: 'const [...].sort()',  color: '#9cdcfe', desc: 'Spread creates a shallow copy before sort — .sort() mutates in place, so this pattern safely sorts without changing the original.' },
        { token: 'Array.from({length})', color: '#4ec9b0', desc: 'Creates an array of specific length and maps each index — a clean alternative to a for loop when building computed arrays.' },
        { token: 'async function main()', color: '#dcdcaa', desc: 'async functions return a Promise automatically. await pauses execution inside without blocking the event loop.' },
        { token: 'Promise.resolve()',   color: '#c586c0', desc: 'Creates an already-resolved Promise with the given value — useful for wrapping synchronous values in async contexts.' },
      ],
      logic: 'The code demonstrates modern ES2023 patterns: spread+sort for immutable array operations, Array.from with a mapper as a concise list builder, a classic recursive fibonacci, and an async function using await on a resolved promise.',
      pros: ['Spread prevents mutation of original array', 'Array.from is expressive and readable', 'async/await follows modern JS best practices', 'Arrow functions used consistently'],
      cons: ['main() rejection is unhandled — add .catch()', 'Recursive fibonacci is O(2ⁿ)', 'console.log("Sorted:", sorted) prints differently in Node vs browser'],
      improvements: 'Add main().catch(console.error). Memoize fibonacci with a Map or use iteration. Use console.log(JSON.stringify(sorted)) for consistent array output across environments.',
    },
    java: {
      syntax: [
        { token: 'import java.util.*',    color: '#c586c0', desc: 'Wildcard import — brings all public classes from java.util into scope, including Arrays, Random, ArrayList, HashMap and more.' },
        { token: 'static int fib()',      color: '#dcdcaa', desc: 'Static method — belongs to the class, not an instance. Can be called without creating a Main object first.' },
        { token: 'System.out.printf()',   color: '#4ec9b0', desc: 'Formatted output — %s for strings, %d for integers, %n for newline. More powerful than println for precise formatting.' },
        { token: 'Arrays.sort(nums)',     color: '#9cdcfe', desc: 'Sorts the array IN PLACE using dual-pivot quicksort — O(n log n). Much faster than sorting manually.' },
      ],
      logic: 'Java enforces a class wrapper with a static main entry point. The code uses Random for number generation, Arrays.sort() for in-place sorting, printf for formatted output, and a recursive static method for fibonacci — all standard Java patterns.',
      pros: ['Strong typing catches errors at compile time', 'printf gives precise formatting control', 'Arrays.sort is highly optimised', 'Clear static method structure'],
      cons: ['Recursive fibonacci is O(2ⁿ)', 'new Random() without seed is not reproducible', 'No try/catch for robustness', 'int[] is fixed — ArrayList<Integer> is more flexible'],
      improvements: 'Use a HashMap for memoised fibonacci. Seed Random with new Random(42) for reproducible tests. Wrap main body in try/catch. Prefer ArrayList<Integer> when size may change.',
    },
    html: {
      syntax: [
        { token: 'box-sizing: border-box', color: '#ce9178', desc: 'Makes element width include padding and border — prevents overflow. Apply to * (all elements) as a global reset.' },
        { token: ':hover { transform }',   color: '#4ec9b0', desc: 'CSS pseudo-class + transform — creates smooth GPU-accelerated hover animation without any JavaScript.' },
        { token: 'linear-gradient()',      color: '#c586c0', desc: 'CSS gradient function — smooth transition between colours at a specified angle. No image needed.' },
        { token: 'onclick="..."',          color: '#dcdcaa', desc: 'Inline event handler — fine for simple demos. In production, prefer addEventListener() in a separate <script> tag.' },
      ],
      logic: 'The page uses a CSS reset, dark-theme colour palette, a card component with border and border-radius, and a counter implemented with inline onclick that reads and writes the textContent of a div element.',
      pros: ['Completely self-contained — one file', 'Accessible dark theme with good contrast', 'CSS transitions for smooth hover effect', 'Semantic HTML structure'],
      cons: ['Inline onclick is outdated — prefer addEventListener', 'Counter resets on page refresh — use localStorage', 'No meta viewport for mobile', 'Hardcoded colours — CSS variables would be cleaner'],
      improvements: 'Move onclick to addEventListener in a <script>. Add <meta name="viewport"> for mobile. Use CSS custom properties: --primary: #6366f1. Persist counter with localStorage.setItem("count", value).',
    },
  };
  return data[langId] || data.python;
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function CodeExperimentTab() {
  const [langId,       setLangId]       = useState('python');
  const [code,         setCode]         = useState(LANGS[0].starter);
  const [stdinValue,   setStdinValue]   = useState('');
  const [showStdin,    setShowStdin]    = useState(false);
  const [output,       setOutput]       = useState('');
  const [outputType,   setOutputType]   = useState('idle');
  const [runTime,      setRunTime]      = useState(null);
  const [aiOpen,       setAiOpen]       = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiResult,     setAiResult]     = useState(null);
  const [editorHeight, setEditorHeight] = useState(340);
  const textareaRef    = useRef(null);
  const isDragging     = useRef(false);

  const lang = LANGS.find(l => l.id === langId) || LANGS[0];

  // switch language
  const switchLang = (id) => {
    const l = LANGS.find(x => x.id === id);
    setLangId(id);
    setCode(l.starter);
    setOutput(''); setOutputType('idle'); setRunTime(null);
    setShowStdin(false); setStdinValue('');
    setAiResult(null); setAiOpen(false);
  };

  // auto-show stdin panel when input() detected
  useEffect(() => {
    if (detectsInput(langId, code)) setShowStdin(true);
  }, [code, langId]);

  // run code
  const runCode = useCallback(async () => {
    setOutputType('running');
    setOutput('');
    setRunTime(null);
    const t0 = Date.now();

    try {
      if (langId === 'html') {
        const { output: html } = executeHTML(code);
        setOutput(html); setOutputType('html'); setRunTime(Date.now() - t0);
        return;
      }
      // JS: use browser executor for pure client-side code (instant)
      if (langId === 'javascript' && !/require\s*\(|process\.|__dirname/.test(code)) {
        const { output: out, error } = executeJSInBrowser(code);
        setRunTime(Date.now() - t0);
        if (error) { setOutput(`❌ ${error}`); setOutputType('error'); }
        else        { setOutput(out);           setOutputType('success'); }
        return;
      }
      // Piston API
      const { output: out, error } = await executeViaPiston(langId, code, stdinValue);
      setRunTime(Date.now() - t0);
      if (error) {
        setOutput(out ? `${out}\n\n❌ ${error}` : `❌ ${error}`);
        setOutputType('error');
      } else {
        setOutput(out || '(program exited with no output)');
        setOutputType('success');
      }
    } catch (err) {
      setRunTime(Date.now() - t0);
      setOutput(`❌ Unexpected error: ${err.message}`);
      setOutputType('error');
    }
  }, [langId, code, stdinValue]);

  // keyboard shortcuts
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textareaRef.current;
      const s  = el.selectionStart;
      const nv = code.substring(0, s) + '    ' + code.substring(el.selectionEnd);
      setCode(nv);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
    }
  };

  // drag-to-resize editor height
  const onDividerDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    const startY = e.clientY, startH = editorHeight;
    const onMove = (me) => {
      if (!isDragging.current) return;
      setEditorHeight(Math.max(140, Math.min(580, startH + (me.clientY - startY))));
    };
    const onUp = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // AI explain
  const explainCode = useCallback(async () => {
    setAiOpen(true); setAiLoading(true); setAiResult(null);
    await new Promise(r => setTimeout(r, 1600));
    setAiResult(buildAIExplanation(langId));
    setAiLoading(false);
  }, [langId]);

  const clearOutput = () => { setOutput(''); setOutputType('idle'); setRunTime(null); };
  const needsInput  = detectsInput(langId, code);
  const outColor    = outputType === 'error' ? '#f87171' : outputType === 'success' ? '#4ec9b0' : '#94a3b8';
  const lineCount   = code.split('\n').length;

  return (
    <div style={s.root}>

      {/* ── TOP BAR ──────────────────────────────────── */}
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <div style={s.appLabel}><span style={s.appDot}/>Code Experiment</div>
          <div style={s.langTabs}>
            {LANGS.map(l => (
              <button key={l.id} onClick={() => switchLang(l.id)}
                style={{ ...s.langTab, ...(langId===l.id ? { color:l.color, borderBottomColor:l.color, background:`${l.color}12` } : {}) }}>
                <span>{l.icon}</span><span>{l.label}</span>
                {langId===l.id && <span style={{ ...s.langVer, color:l.color }}>{l.version}</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={s.topRight}>
          {needsInput && (
            <button onClick={() => setShowStdin(v=>!v)}
              style={{ ...s.iconBtn, ...(showStdin ? { color:'#f59e0b', borderColor:'rgba(245,158,11,0.4)', background:'rgba(245,158,11,0.08)' } : {}) }}
              title="Toggle stdin input">
              ⌨ stdin
            </button>
          )}
          <button onClick={explainCode} style={s.aiBtn}>🤖 AI Explain</button>
          <button onClick={runCode} disabled={outputType==='running'}
            style={{ ...s.runBtn, opacity: outputType==='running' ? 0.6 : 1 }}>
            {outputType==='running' ? <><span style={s.spinner}/>Running</> : <>▶ Run</>}
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────── */}
      <div style={s.mainLayout}>

        {/* ── LEFT: editor stack + terminal ── */}
        <div style={s.leftCol}>

          {/* EDITOR */}
          <div style={s.editorWrap}>
            <div style={s.editorBar}>
              <div style={s.dots}><span style={{...s.dot,background:'#ff5f57'}}/><span style={{...s.dot,background:'#febc2e'}}/><span style={{...s.dot,background:'#28c840'}}/></div>
              <span style={s.filename}>{lang.file}</span>
              <span style={s.shortcut}>Ctrl+Enter to run · Tab to indent</span>
            </div>
            <div style={s.editorInner}>
              {/* line numbers */}
              <div style={{ ...s.lineNums, height: editorHeight }}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} style={s.lineNum}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ ...s.editor, height: editorHeight }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
          </div>

          {/* DRAG HANDLE */}
          <div onMouseDown={onDividerDown} style={s.dragHandle}>
            <div style={s.dragLine}/><span style={s.dragIcon}>⠿</span><div style={s.dragLine}/>
          </div>

          {/* STDIN PANEL */}
          {showStdin && (
            <div style={s.stdinWrap} className="anim-fade-in">
              <div style={s.stdinHead}>
                <span style={s.stdinLabel}>⌨ stdin — Program Input</span>
                <span style={s.stdinHint}>One value per line — feeds into input() / Scanner calls</span>
                <button onClick={() => setShowStdin(false)} style={s.stdinClose}>✕</button>
              </div>
              <textarea
                value={stdinValue}
                onChange={e => setStdinValue(e.target.value)}
                placeholder={"Alice\n20\nMumbai"}
                style={s.stdinArea}
                spellCheck={false}
              />
            </div>
          )}

          {/* TERMINAL */}
          <div style={s.terminal}>
            <div style={s.termBar}>
              <div style={s.dots}><span style={{...s.dot,background:'#ff5f57'}}/><span style={{...s.dot,background:'#febc2e'}}/><span style={{...s.dot,background:'#28c840'}}/></div>
              <span style={s.termTitle}>
                Terminal
                {outputType==='running' && <span style={s.badge('rgba(245,158,11,0.12)','#f59e0b')}>● running</span>}
                {outputType==='success' && <span style={s.badge('rgba(78,201,176,0.12)','#4ec9b0')}>✓ exit 0</span>}
                {outputType==='error'   && <span style={s.badge('rgba(248,113,113,0.12)','#f87171')}>✗ error</span>}
                {outputType==='html'    && <span style={s.badge('rgba(129,140,248,0.12)','#818cf8')}>● preview</span>}
              </span>
              {runTime!==null && outputType!=='running' && (
                <span style={s.timeLabel}>{runTime<1000?`${runTime}ms`:`${(runTime/1000).toFixed(1)}s`}</span>
              )}
              {output && <button onClick={clearOutput} style={s.clearBtn}>Clear</button>}
            </div>

            <div style={s.termBody}>
              {outputType==='html' && output
                ? <iframe srcDoc={output} style={s.htmlFrame} title="Preview" sandbox="allow-scripts"/>
                : outputType==='running'
                ? <div style={s.runningRow}><div style={s.runSpinner}/><span style={{color:'#555',fontSize:13}}>Executing on Piston API...</span></div>
                : output
                ? <pre style={{...s.outPre,color:outColor}}>{output}</pre>
                : <div style={s.emptyTerm}>
                    <span style={s.prompt}>$</span>
                    <span style={s.emptyHint}> Press <kbd style={s.kbd}>▶ Run</kbd> or <kbd style={s.kbd}>Ctrl+Enter</kbd> to execute your code</span>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* ── RIGHT: AI Explain panel ── */}
        {aiOpen && (
          <div style={s.aiPanel} className="anim-fade-in">
            <div style={s.aiHead}>
              <div>
                <h3 style={s.aiTitle}>🤖 AI Explain</h3>
                <p style={s.aiSub}>{lang.label} · {lang.file}</p>
              </div>
              <button onClick={() => setAiOpen(false)} style={s.aiClose}>✕</button>
            </div>

            {aiLoading ? (
              <div style={s.aiLoading}>
                <div style={s.aiSpinner}/>
                <p style={s.aiLoadTxt}>Analysing your code...</p>
                <p style={s.aiLoadSub}>Syntax · Logic · Pros &amp; Cons · Improvements</p>
              </div>
            ) : aiResult && (
              <div style={s.aiBody}>
                <Section title="🎨 Syntax Breakdown">
                  <div style={s.syntaxList}>
                    {aiResult.syntax.map((item,i) => (
                      <div key={i} style={{...s.syntaxCard, borderLeftColor:item.color}}>
                        <code style={{...s.synToken,color:item.color}}>{item.token}</code>
                        <p style={s.synDesc}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="🧠 How It Works">
                  <p style={s.aiPara}>{aiResult.logic}</p>
                </Section>
                <Section title="✅ Strengths" titleColor="#4ec9b0">
                  <Bullets items={aiResult.pros} dotColor="#4ec9b0" txtColor="#86efac"/>
                </Section>
                <Section title="⚠️ Could Improve" titleColor="#f87171">
                  <Bullets items={aiResult.cons} dotColor="#f87171" txtColor="#fca5a5"/>
                </Section>
                <Section title="💡 Suggestions">
                  <p style={s.aiPara}>{aiResult.improvements}</p>
                </Section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Small helpers ──────────────────────────────────────── */
function Section({ title, titleColor='#555', children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:12, fontWeight:700, color:titleColor, textTransform:'uppercase', letterSpacing:0.8 }}>{title}</div>
      {children}
    </div>
  );
}
function Bullets({ items, dotColor, txtColor }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {items.map((item,i) => (
        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
          <span style={{ width:5,height:5,borderRadius:'50%',background:dotColor,marginTop:6,flexShrink:0 }}/>
          <span style={{ fontSize:12, color:txtColor, lineHeight:1.65 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STYLES — VS Code Dark theme
═══════════════════════════════════════════════════ */
const s = {
  root:        { display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#1e1e1e', color:'#d4d4d4', fontFamily:'DM Sans,sans-serif' },
  topBar:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:44, background:'#323233', borderBottom:'1px solid #252526', flexShrink:0, gap:12 },
  topLeft:     { display:'flex', alignItems:'center', gap:16, overflow:'hidden', minWidth:0 },
  topRight:    { display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  appLabel:    { display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#858585', whiteSpace:'nowrap', flexShrink:0 },
  appDot:      { width:8, height:8, borderRadius:'50%', background:'#6366f1' },
  langTabs:    { display:'flex', gap:0, overflow:'hidden' },
  langTab:     { display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:44, fontSize:13, fontWeight:500, color:'#858585', background:'transparent', border:'none', borderBottom:'2px solid transparent', cursor:'pointer', transition:'all 0.18s', whiteSpace:'nowrap', fontFamily:'DM Sans,sans-serif' },
  langVer:     { fontSize:10, fontFamily:'JetBrains Mono,monospace', opacity:0.7 },
  iconBtn:     { display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'transparent', border:'1px solid #2d2d2d', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer', color:'#858585', transition:'all 0.2s', fontFamily:'DM Sans,sans-serif' },
  aiBtn:       { display:'flex', alignItems:'center', gap:6, padding:'6px 14px', fontSize:13, fontWeight:600, background:'rgba(99,102,241,0.14)', border:'1px solid rgba(99,102,241,0.3)', color:'#818cf8', borderRadius:6, cursor:'pointer', transition:'all 0.2s', fontFamily:'DM Sans,sans-serif' },
  runBtn:      { display:'flex', alignItems:'center', gap:6, padding:'7px 18px', fontSize:13, fontWeight:700, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', transition:'all 0.2s', fontFamily:'DM Sans,sans-serif', boxShadow:'0 2px 8px rgba(16,185,129,0.3)' },
  spinner:     { width:12, height:12, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.8s linear infinite', display:'inline-block' },

  mainLayout:  { display:'flex', flex:1, overflow:'hidden' },
  leftCol:     { display:'flex', flexDirection:'column', flex:1, overflow:'hidden', minWidth:0 },

  editorWrap:  { background:'#1e1e1e', borderBottom:'1px solid #252526', flexShrink:0 },
  editorBar:   { display:'flex', alignItems:'center', gap:10, padding:'7px 14px', background:'#252526', borderBottom:'1px solid #1e1e1e' },
  dots:        { display:'flex', gap:6 },
  dot:         { width:12, height:12, borderRadius:'50%' },
  filename:    { flex:1, textAlign:'center', fontSize:12, color:'#858585', fontFamily:'JetBrains Mono,monospace' },
  shortcut:    { fontSize:11, color:'#3c3c3c', fontFamily:'JetBrains Mono,monospace', whiteSpace:'nowrap' },

  editorInner: { display:'flex', overflow:'hidden' },
  lineNums:    { display:'flex', flexDirection:'column', alignItems:'flex-end', padding:'14px 10px 14px 12px', background:'#1e1e1e', borderRight:'1px solid #2d2d2d', userSelect:'none', overflowY:'hidden', flexShrink:0 },
  lineNum:     { fontSize:13, lineHeight:'23.4px', color:'#3c3c3c', fontFamily:'JetBrains Mono,monospace', minWidth:20, textAlign:'right' },
  editor:      { flex:1, background:'#1e1e1e', border:'none', outline:'none', color:'#d4d4d4', fontFamily:'JetBrains Mono,monospace', fontSize:13, lineHeight:1.8, padding:'14px 20px', resize:'none', caretColor:'#d4d4d4', overflowY:'auto', display:'block' },

  dragHandle:  { display:'flex', alignItems:'center', gap:8, padding:'4px 16px', background:'#252526', borderTop:'1px solid #1a1a1a', borderBottom:'1px solid #1a1a1a', cursor:'row-resize', flexShrink:0, userSelect:'none' },
  dragLine:    { flex:1, height:1, background:'#3c3c3c' },
  dragIcon:    { fontSize:12, color:'#444', letterSpacing:1 },

  stdinWrap:   { background:'#252526', borderBottom:'1px solid #1e1e1e', flexShrink:0 },
  stdinHead:   { display:'flex', alignItems:'center', gap:10, padding:'8px 14px', borderBottom:'1px solid #1e1e1e' },
  stdinLabel:  { fontSize:12, fontWeight:700, color:'#f59e0b', fontFamily:'JetBrains Mono,monospace' },
  stdinHint:   { fontSize:11, color:'#555', flex:1 },
  stdinClose:  { width:22, height:22, borderRadius:4, background:'#3c3c3c', border:'none', color:'#858585', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' },
  stdinArea:   { width:'100%', height:80, background:'#1e1e1e', border:'none', outline:'none', color:'#f59e0b', fontFamily:'JetBrains Mono,monospace', fontSize:13, padding:'10px 14px', resize:'none' },

  terminal:    { display:'flex', flexDirection:'column', flex:1, background:'#1e1e1e', overflow:'hidden' },
  termBar:     { display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'#252526', borderTop:'1px solid #1a1a1a', borderBottom:'1px solid #1e1e1e', flexShrink:0 },
  termTitle:   { flex:1, fontSize:12, fontWeight:600, color:'#858585', fontFamily:'Syne,sans-serif', display:'flex', alignItems:'center', gap:8 },
  badge:       (bg, color) => ({ fontSize:11, color, background:bg, padding:'2px 8px', borderRadius:10 }),
  timeLabel:   { fontSize:11, color:'#3c3c3c', fontFamily:'JetBrains Mono,monospace' },
  clearBtn:    { padding:'3px 10px', background:'#3c3c3c', border:'none', color:'#858585', borderRadius:4, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' },
  termBody:    { flex:1, overflow:'auto', position:'relative' },
  outPre:      { margin:0, padding:'14px 20px', fontFamily:'JetBrains Mono,monospace', fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap', wordBreak:'break-all' },
  htmlFrame:   { width:'100%', height:'100%', border:'none', background:'#fff' },
  runningRow:  { display:'flex', alignItems:'center', gap:12, padding:'20px' },
  runSpinner:  { width:16, height:16, borderRadius:'50%', border:'2px solid rgba(78,201,176,0.2)', borderTopColor:'#4ec9b0', animation:'spin 1s linear infinite', flexShrink:0 },
  emptyTerm:   { display:'flex', alignItems:'center', padding:'14px 20px' },
  prompt:      { color:'#4ec9b0', fontFamily:'JetBrains Mono,monospace', fontSize:14, fontWeight:700 },
  emptyHint:   { color:'#3c3c3c', fontSize:13 },
  kbd:         { background:'#3c3c3c', border:'1px solid #555', borderRadius:4, padding:'1px 6px', fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#858585' },

  aiPanel:     { width:360, borderLeft:'1px solid #252526', background:'#1e1e1e', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 },
  aiHead:      { display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'16px 18px', borderBottom:'1px solid #252526', flexShrink:0 },
  aiTitle:     { fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:800, color:'#d4d4d4', marginBottom:2 },
  aiSub:       { fontSize:11, color:'#555', fontFamily:'JetBrains Mono,monospace' },
  aiClose:     { width:24, height:24, borderRadius:4, background:'#3c3c3c', border:'none', color:'#858585', fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif', flexShrink:0 },
  aiLoading:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, flex:1, padding:'32px 18px' },
  aiSpinner:   { width:36, height:36, borderRadius:'50%', border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366f1', animation:'spin 1s linear infinite' },
  aiLoadTxt:   { fontSize:14, color:'#858585', fontWeight:500, textAlign:'center' },
  aiLoadSub:   { fontSize:12, color:'#4d4d4d', textAlign:'center', lineHeight:1.6 },
  aiBody:      { flex:1, overflowY:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:18 },
  aiPara:      { fontSize:12, color:'#858585', lineHeight:1.75, background:'#252526', padding:'10px 12px', borderRadius:6, margin:0 },
  syntaxList:  { display:'flex', flexDirection:'column', gap:8 },
  syntaxCard:  { padding:'10px 12px', background:'#252526', borderRadius:6, borderLeft:'3px solid', display:'flex', flexDirection:'column', gap:4 },
  synToken:    { fontFamily:'JetBrains Mono,monospace', fontSize:12, fontWeight:600 },
  synDesc:     { fontSize:12, color:'#858585', lineHeight:1.6, margin:0 },
};
