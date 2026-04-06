import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  executeCode as executeRemote,
  executeJSInBrowser,
  executeHTML,
  detectsInput,
} from '../utils/judge0Executor';

// ─── Language configs ─────────────────────────────────────
const LANGS = [
  { id:'python',     label:'Python',      icon:'🐍', color:'#4ec9b0', version:'3.10', file:'main.py'    },
  { id:'javascript', label:'JavaScript',  icon:'⚡', color:'#DCDCAA', version:'18',   file:'index.js'   },
  { id:'java',       label:'Java',        icon:'☕', color:'#CE9178', version:'17',   file:'Main.java'  },
  { id:'html',       label:'HTML & CSS',  icon:'🎨', color:'#F28B54', version:'5',    file:'index.html' },
];

// ─── Syntax keyword sets per language ────────────────────
const KEYWORDS = {
  python: ['False','None','True','and','as','assert','async','await','break','class',
    'continue','def','del','elif','else','except','finally','for','from','global',
    'if','import','in','is','lambda','nonlocal','not','or','pass','raise','return',
    'try','while','with','yield','print','input','range','len','str','int','float',
    'list','dict','set','tuple','type','bool','sum','min','max','sorted','reversed',
    'enumerate','zip','map','filter','open','super','self'],
  javascript: ['break','case','catch','class','const','continue','debugger','default',
    'delete','do','else','export','extends','finally','for','function','if','import',
    'in','instanceof','let','new','return','static','super','switch','this','throw',
    'try','typeof','var','void','while','with','yield','async','await','of','from',
    'console','Promise','Array','Object','Math','JSON','parseInt','parseFloat',
    'undefined','null','true','false','NaN','Infinity'],
  java: ['abstract','assert','boolean','break','byte','case','catch','char','class',
    'continue','default','do','double','else','enum','extends','final','finally',
    'float','for','if','implements','import','instanceof','int','interface','long',
    'native','new','package','private','protected','public','return','short','static',
    'super','switch','synchronized','this','throw','throws','transient','try','void',
    'volatile','while','String','System','out','println','print','Scanner','Arrays',
    'ArrayList','HashMap','true','false','null'],
  html: ['<!DOCTYPE','html','head','body','title','meta','link','script','style',
    'div','span','p','h1','h2','h3','h4','h5','h6','a','img','ul','ol','li',
    'table','tr','td','th','form','input','button','textarea','select','option',
    'header','footer','main','nav','section','article','aside','canvas','video',
    'audio','source','iframe','br','hr','strong','em','i','b','u','pre','code',
    'class','id','href','src','alt','type','name','value','placeholder','style',
    'onclick','onchange','oninput','rel','charset','viewport','content',
    'display','flex','grid','color','background','margin','padding','font',
    'border','width','height','position','top','left','right','bottom'],
};

// ─── Autocomplete suggestions per language ────────────────
const SNIPPETS = {
  python: [
    { trigger:'def ',    insert:'def function_name(args):\n    pass', label:'def — function' },
    { trigger:'class ',  insert:'class ClassName:\n    def __init__(self):\n        pass', label:'class' },
    { trigger:'for ',    insert:'for i in range(10):\n    ', label:'for loop' },
    { trigger:'while ',  insert:'while condition:\n    ', label:'while loop' },
    { trigger:'if ',     insert:'if condition:\n    ', label:'if statement' },
    { trigger:'import ', insert:'import ', label:'import module' },
    { trigger:'print(',  insert:'print()', label:'print()' },
    { trigger:'input(',  insert:'input("Enter value: ")', label:'input()' },
    { trigger:'try:',    insert:'try:\n    \nexcept Exception as e:\n    print(e)', label:'try/except' },
    { trigger:'with open(', insert:'with open("file.txt", "r") as f:\n    content = f.read()', label:'with open()' },
  ],
  javascript: [
    { trigger:'function ', insert:'function name(params) {\n  \n}', label:'function' },
    { trigger:'const ',    insert:'const name = ', label:'const' },
    { trigger:'let ',      insert:'let name = ', label:'let' },
    { trigger:'for(',      insert:'for (let i = 0; i < arr.length; i++) {\n  \n}', label:'for loop' },
    { trigger:'arr.map(',  insert:'arr.map(item => )', label:'Array.map()' },
    { trigger:'arr.filter(', insert:'arr.filter(item => )', label:'Array.filter()' },
    { trigger:'async ',    insert:'async function name() {\n  \n}', label:'async function' },
    { trigger:'console.log(', insert:'console.log()', label:'console.log()' },
    { trigger:'fetch(',    insert:'fetch(url)\n  .then(res => res.json())\n  .then(data => console.log(data))', label:'fetch()' },
    { trigger:'class ',    insert:'class Name {\n  constructor() {\n    \n  }\n}', label:'class' },
  ],
  java: [
    { trigger:'public class ', insert:'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}', label:'class Main' },
    { trigger:'System.out.', insert:'System.out.println()', label:'println()' },
    { trigger:'for(',        insert:'for (int i = 0; i < n; i++) {\n    \n}', label:'for loop' },
    { trigger:'Scanner ',    insert:'Scanner scanner = new Scanner(System.in);\nString input = scanner.nextLine();', label:'Scanner' },
    { trigger:'ArrayList',   insert:'ArrayList<String> list = new ArrayList<>();', label:'ArrayList' },
    { trigger:'if(',         insert:'if (condition) {\n    \n}', label:'if statement' },
    { trigger:'try{',        insert:'try {\n    \n} catch (Exception e) {\n    System.out.println(e.getMessage());\n}', label:'try/catch' },
  ],
  html: [
    { trigger:'<!',     insert:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Title</title>\n</head>\n<body>\n  \n</body>\n</html>', label:'HTML boilerplate' },
    { trigger:'<div',   insert:'<div class="">\n  \n</div>', label:'<div>' },
    { trigger:'<p',     insert:'<p></p>', label:'<p>' },
    { trigger:'<a ',    insert:'<a href="#"></a>', label:'<a href>' },
    { trigger:'<img',   insert:'<img src="" alt="" />', label:'<img>' },
    { trigger:'<input', insert:'<input type="text" placeholder="" />', label:'<input>' },
    { trigger:'<button',insert:'<button onclick=""></button>', label:'<button>' },
    { trigger:'<style', insert:'<style>\n  \n</style>', label:'<style>' },
    { trigger:'<script',insert:'<script>\n  \n</script>', label:'<script>' },
  ],
};

// ─── Syntax token colours ─────────────────────────────────
const TOKEN_COLORS = {
  keyword:  '#c586c0',
  string:   '#ce9178',
  comment:  '#6a9955',
  number:   '#b5cea8',
  function: '#dcdcaa',
  builtin:  '#4ec9b0',
  operator: '#d4d4d4',
  default:  '#d4d4d4',
};

// ─── AI explain builder ───────────────────────────────────
function buildAIResult(langId, code) {
  const results = {
    python: {
      syntax: [
        { token:'import module',   color:'#c586c0', desc:'Imports a Python module — gives access to all its functions. Standard library (random, math, os) needs no install. Third-party packages need pip install first.' },
        { token:'f"Hello {var}"',  color:'#ce9178', desc:'f-string — embed any expression inside {}. Faster than concatenation, more readable than .format(). The recommended way to format strings in Python 3.6+.' },
        { token:'def func(args):', color:'#dcdcaa', desc:'Defines a reusable function. Python uses indentation (4 spaces) for blocks. The function does nothing until called.' },
        { token:'[x for x in ...]',color:'#4ec9b0', desc:'List comprehension — creates a list in one line. Equivalent to a for loop with .append(). More idiomatic and slightly faster.' },
      ],
      logic: 'The code follows Python\'s clean, readable style. Variables are created with simple assignment (no type declaration needed). Functions are defined with def and called by name. Python executes top-to-bottom, running each statement in order.',
      pros: ['Readable, expressive Pythonic style','No type declarations needed — dynamic typing','Rich standard library — import and use','Indentation enforces clean code structure'],
      cons: ['No type safety — bugs appear at runtime','Global variables can cause side effects','Mutable default arguments are a common trap','Recursive functions without memoization can be slow'],
      improvements: 'Add type hints for better IDE support: def greet(name: str) -> str. Use if __name__ == "__main__": to make the file importable. Consider dataclasses for structured data instead of plain dicts.',
      betterCode: `# Improved version with type hints, docstrings, and best practices
from typing import List
import sys

def greet(name: str) -> str:
    """Return a personalised greeting."""
    if not name.strip():
        raise ValueError("Name cannot be empty")
    return f"Hello, {name.strip().title()}!"

def process_numbers(nums: List[int]) -> dict:
    """Compute statistics for a list of numbers."""
    if not nums:
        return {"error": "Empty list"}
    return {
        "count":   len(nums),
        "sum":     sum(nums),
        "average": round(sum(nums) / len(nums), 2),
        "min":     min(nums),
        "max":     max(nums),
        "squares": [n ** 2 for n in nums],
    }

if __name__ == "__main__":
    name = input("Enter your name: ") if sys.stdin.isatty() else "World"
    print(greet(name))
    
    numbers = [1, 2, 3, 4, 5]
    stats = process_numbers(numbers)
    for key, value in stats.items():
        print(f"  {key}: {value}")
`,
    },
    javascript: {
      syntax: [
        { token:'const / let',     color:'#9cdcfe', desc:'const = immutable binding (use by default). let = rebindable. Both are block-scoped. Never use var — it\'s function-scoped and causes subtle bugs.' },
        { token:'async/await',     color:'#c586c0', desc:'async functions always return a Promise. await pauses execution inside async functions without blocking the thread — ideal for API calls and I/O.' },
        { token:'arr.map/filter',  color:'#4ec9b0', desc:'Functional array methods — they return new arrays, leaving the original unchanged. Chain them for clean data pipelines: arr.filter(...).map(...).reduce(...).' },
        { token:'=> arrow func',   color:'#dcdcaa', desc:'Arrow functions are concise and don\'t have their own this binding. Single-expression bodies have implicit return: const double = n => n * 2.' },
      ],
      logic: 'JavaScript runs in a single thread using an event loop. Synchronous code runs line by line. Asynchronous code (fetch, timers) is scheduled and runs when the call stack is empty. async/await makes this flow readable.',
      pros: ['Modern ES2023+ syntax is expressive','Array methods enable functional style','async/await simplifies async code','Runs natively in browsers — no install'],
      cons: ['No type safety without TypeScript','null/undefined can cause runtime errors','this binding is confusing in callbacks','== vs === is a common source of bugs'],
      improvements: 'Add error handling: try/catch around async calls. Use optional chaining: user?.name ?? "Guest". Consider TypeScript for large projects. Use Array.isArray() before array methods.',
      betterCode: `// Improved: error handling, optional chaining, modern patterns
const fetchUser = async (id) => {
  try {
    const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error(\`Failed to fetch user \${id}:\`, err.message);
    return null;
  }
};

const processUsers = async () => {
  const ids = [1, 2, 3];
  
  // Parallel fetching — much faster than sequential
  const users = await Promise.allSettled(ids.map(fetchUser));
  
  users
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value)
    .forEach(user => {
      const city = user?.address?.city ?? 'Unknown city';
      console.log(\`\${user.name} — \${user.email} — \${city}\`);
    });
};

processUsers();
`,
    },
    java: {
      syntax: [
        { token:'public class Main',  color:'#4ec9b0', desc:'Java requires all code inside a class. public means accessible from anywhere. The class name must match the filename exactly.' },
        { token:'static void main()', color:'#dcdcaa', desc:'The JVM entry point — must be exactly this signature. static means it runs without creating an object. String[] args receives command-line arguments.' },
        { token:'System.out.println', color:'#c586c0', desc:'Standard output to the console. println adds a newline. print does not. printf allows C-style formatting: printf("%s is %d years old%n", name, age).' },
        { token:'int[] / ArrayList',  color:'#ce9178', desc:'int[] is a fixed-size primitive array. ArrayList<Integer> is dynamic, resizable, and has useful methods like add(), remove(), contains(). Prefer ArrayList for flexibility.' },
      ],
      logic: 'Java is statically typed — every variable must declare its type. All code lives inside classes. The JVM compiles Java to bytecode, which runs on any platform. Strong type checking catches errors before runtime.',
      pros: ['Static typing catches bugs at compile time','Excellent tooling and IDE support','Rich standard library (java.util, java.io)','Platform independent — runs anywhere with JVM'],
      cons: ['Verbose compared to Python/JS','No operator overloading','Checked exceptions can be cumbersome','Slow startup time for small scripts'],
      improvements: 'Use enhanced for loops: for (String item : list). Prefer ArrayList over arrays for flexibility. Use String.format() instead of concatenation. Add proper exception handling with specific exception types.',
      betterCode: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Person(String name, int age) {}
    
    public static void main(String[] args) {
        // Modern Java — records, streams, var
        var people = List.of(
            new Person("Alice", 25),
            new Person("Bob", 17),
            new Person("Carol", 32),
            new Person("Dave", 15)
        );
        
        // Stream API — filter, sort, collect
        var adults = people.stream()
            .filter(p -> p.age() >= 18)
            .sorted(Comparator.comparing(Person::name))
            .collect(Collectors.toList());
        
        System.out.println("Adults:");
        adults.forEach(p -> 
            System.out.printf("  %s — age %d%n", p.name(), p.age())
        );
        
        // Statistics
        var stats = people.stream()
            .mapToInt(Person::age)
            .summaryStatistics();
        System.out.printf("Average age: %.1f%n", stats.getAverage());
    }
}
`,
    },
    html: {
      syntax: [
        { token:'box-sizing: border-box', color:'#ce9178', desc:'Makes width/height include padding and border — prevents elements from growing beyond declared size. Add * { box-sizing: border-box } as a global reset.' },
        { token:'display: flex / grid',   color:'#4ec9b0', desc:'Flexbox = one-dimensional layout (row OR column). CSS Grid = two-dimensional (rows AND columns). Use flex for components, grid for page layouts.' },
        { token:'CSS custom properties',  color:'#c586c0', desc:':root { --primary: #6366f1 } defines a global variable. Use with var(--primary). Change once and it updates everywhere — essential for theming.' },
        { token:'addEventListener()',     color:'#dcdcaa', desc:'The modern way to handle events — cleaner than inline onclick="". Attach multiple listeners, easily remove them, and keep HTML/JS separate.' },
      ],
      logic: 'HTML defines structure, CSS controls appearance, JS adds behaviour. The browser parses HTML into a DOM tree, applies CSS rules (specificity determines which rule wins), then executes JS which can modify both.',
      pros: ['Works in every browser — no install','CSS modern features are very powerful','Fast iteration — just refresh the page','Semantic HTML improves SEO and accessibility'],
      cons: ['No scoped styles without CSS modules','Inline event handlers mix concerns','No built-in state management','CSS specificity conflicts are hard to debug'],
      improvements: 'Use CSS custom properties for all colours and spacing. Replace onclick attributes with addEventListener. Add ARIA attributes for accessibility. Use <button> not <div> for clickable elements.',
      betterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Improved Page</title>
  <style>
    :root {
      --primary: #6366f1;
      --surface: #1e293b;
      --bg: #0f172a;
      --text: #e2e8f0;
      --radius: 12px;
      --gap: 16px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; padding: 32px; }
    .card { background: var(--surface); border-radius: var(--radius); padding: 24px; margin-top: var(--gap); }
    .btn { background: var(--primary); color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.85; }
    .btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
    #count { font-size: 3rem; font-weight: 800; color: var(--primary); }
  </style>
</head>
<body>
  <main>
    <h1>Better Component</h1>
    <div class="card" aria-label="Counter widget">
      <p id="count" aria-live="polite">0</p>
      <button class="btn" id="incrementBtn" type="button">Count Up +1</button>
      <button class="btn" id="resetBtn" type="button" style="margin-left:8px;background:#475569">Reset</button>
    </div>
  </main>
  <script>
    const countEl = document.getElementById('count');
    let count = 0;
    document.getElementById('incrementBtn').addEventListener('click', () => { countEl.textContent = ++count; });
    document.getElementById('resetBtn').addEventListener('click', () => { count = 0; countEl.textContent = 0; });
  </script>
</body>
</html>
`,
    },
  };
  return results[langId] || results.python;
}

/* ════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHTER — renders coloured tokens in a div
   overlaid on the transparent textarea
════════════════════════════════════════════════════════ */
function highlight(code, langId) {
  const kw = new Set(KEYWORDS[langId] || []);

  // Split into tokens: strings, comments, numbers, words, operators
  const parts = [];
  let i = 0;
  while (i < code.length) {
    // Python/JS/Java single-line comment
    if ((langId !== 'html') && code[i] === '/' && code[i+1] === '/') {
      const end = code.indexOf('\n', i);
      const s = end === -1 ? code.slice(i) : code.slice(i, end);
      parts.push({ type:'comment', val:s });
      i += s.length; continue;
    }
    // Python comment
    if (langId === 'python' && code[i] === '#') {
      const end = code.indexOf('\n', i);
      const s = end === -1 ? code.slice(i) : code.slice(i, end);
      parts.push({ type:'comment', val:s });
      i += s.length; continue;
    }
    // HTML comment
    if (langId === 'html' && code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i);
      const s = end === -1 ? code.slice(i) : code.slice(i, end + 3);
      parts.push({ type:'comment', val:s });
      i += s.length; continue;
    }
    // Multi-line comment /* ... */
    if (code[i] === '/' && code[i+1] === '*') {
      const end = code.indexOf('*/', i+2);
      const s = end === -1 ? code.slice(i) : code.slice(i, end+2);
      parts.push({ type:'comment', val:s });
      i += s.length; continue;
    }
    // Strings — double or single quote
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let s = q; i++;
      while (i < code.length && code[i] !== q && code[i] !== '\n') {
        if (code[i] === '\\') { s += code[i] + (code[i+1]||''); i+=2; continue; }
        s += code[i++];
      }
      s += code[i] === q ? code[i++] : '';
      parts.push({ type:'string', val:s }); continue;
    }
    // Template literal
    if (code[i] === '`') {
      let s = '`'; i++;
      while (i < code.length && code[i] !== '`') { s += code[i++]; }
      s += '`'; i++;
      parts.push({ type:'string', val:s }); continue;
    }
    // Numbers
    if (/\d/.test(code[i]) && (i===0 || /\W/.test(code[i-1]))) {
      let s = '';
      while (i < code.length && /[\d._]/.test(code[i])) s += code[i++];
      parts.push({ type:'number', val:s }); continue;
    }
    // Words (keywords / identifiers)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let s = '';
      while (i < code.length && /\w/.test(code[i])) s += code[i++];
      const nextCh = code[i];
      if (kw.has(s))           parts.push({ type:'keyword',  val:s });
      else if (nextCh === '(') parts.push({ type:'function', val:s });
      else                      parts.push({ type:'default',  val:s });
      continue;
    }
    // HTML tags
    if (langId === 'html' && code[i] === '<') {
      let s = '<'; i++;
      while (i < code.length && code[i] !== '>') s += code[i++];
      s += '>'; i++;
      parts.push({ type:'keyword', val:s }); continue;
    }
    // Everything else
    parts.push({ type:'operator', val:code[i++] });
  }

  return parts.map((p, idx) => (
    <span key={idx} style={{ color: TOKEN_COLORS[p.type] || TOKEN_COLORS.default }}>
      {p.val}
    </span>
  ));
}

/* ════════════════════════════════════════════════════════
   AUTOCOMPLETE — suggests keywords and snippets
════════════════════════════════════════════════════════ */
function getCompletions(langId, word, line) {
  if (!word || word.length < 1) return [];
  const kw  = KEYWORDS[langId]  || [];
  const snips = SNIPPETS[langId] || [];
  const wordLower = word.toLowerCase();

  // Snippet matches (check full line ending)
  const snipMatches = snips.filter(s => line.trimStart().toLowerCase().startsWith(s.trigger.toLowerCase()) || s.trigger.toLowerCase().startsWith(wordLower));

  // Keyword matches
  const kwMatches = kw
    .filter(k => k.toLowerCase().startsWith(wordLower) && k !== word)
    .slice(0, 6)
    .map(k => ({ type:'keyword', label:k, insert:k }));

  return [...snipMatches.slice(0,3).map(s => ({ type:'snippet', label:s.label, insert:s.insert })), ...kwMatches].slice(0, 8);
}

/* ════════════════════════════════════════════════════════
   INLINE TERMINAL INPUT
   Manages a queue of input() prompts inline in the terminal
════════════════════════════════════════════════════════ */
function useInlineInput() {
  const [inputLines, setInputLines] = useState([]); // completed stdin lines
  const [pendingPrompt, setPendingPrompt] = useState(null); // current prompt
  const [inputVal, setInputVal] = useState('');
  const resolveRef = useRef(null);

  const requestInput = useCallback((prompt) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setPendingPrompt(prompt || '');
    });
  }, []);

  const submitInput = useCallback(() => {
    const val = inputVal;
    setInputLines(l => [...l, { prompt: pendingPrompt, value: val }]);
    setInputVal('');
    setPendingPrompt(null);
    if (resolveRef.current) { resolveRef.current(val); resolveRef.current = null; }
  }, [inputVal, pendingPrompt]);

  return { inputLines, pendingPrompt, inputVal, setInputVal, requestInput, submitInput };
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function CodeExperimentTab() {
  const [langId,      setLangId]      = useState('python');
  const [code,        setCode]        = useState('');
  const [output,      setOutput]      = useState('');      // text output lines
  const [outputType,  setOutputType]  = useState('idle');  // idle|running|success|error|html
  const [htmlOutput,  setHtmlOutput]  = useState('');
  const [runTime,     setRunTime]     = useState(null);
  const [aiOpen,      setAiOpen]      = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiResult,    setAiResult]    = useState(null);
  const [aiTab,       setAiTab]       = useState('explain'); // explain | better
  const [completions, setCompletions] = useState([]);
  const [compIdx,     setCompIdx]     = useState(0);
  const [showComp,    setShowComp]    = useState(false);
  const [editorH,     setEditorH]     = useState(300);
  const [stdinLines,  setStdinLines]  = useState(''); // pre-filled stdin

  const textRef     = useRef(null);
  const isDragging  = useRef(false);
  const termBodyRef = useRef(null);
  const inputRef    = useRef(null);

  const lang = LANGS.find(l => l.id === langId) || LANGS[0];
  const lines = code.split('\n').length;

  // ── Switch language ──────────────────────────────────
  const switchLang = (id) => {
    setLangId(id);
    setCode('');
    setOutput(''); setOutputType('idle'); setHtmlOutput('');
    setRunTime(null); setAiResult(null); setAiOpen(false);
    setCompletions([]); setShowComp(false); setStdinLines('');
  };

  // scroll terminal to bottom on new output
  useEffect(() => {
    if (termBodyRef.current) termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
  }, [output]);

  // ── Run code ─────────────────────────────────────────
  const runCode = useCallback(async () => {
    if (outputType === 'running') return;
    setOutputType('running');
    setOutput('');
    setHtmlOutput('');
    setRunTime(null);
    const t0 = Date.now();

    try {
      // HTML → iframe
      if (langId === 'html') {
        setHtmlOutput(code);
        setOutputType('html');
        setRunTime(Date.now() - t0);
        return;
      }

      // JavaScript — run in browser (instant, no API)
      if (langId === 'javascript') {
        const { output: out, error } = executeJSInBrowser(code);
        setRunTime(Date.now() - t0);
        if (error) { setOutput(`❌ ${error}\n\n${out}`); setOutputType('error'); }
        else        { setOutput(out);                     setOutputType('success'); }
        return;
      }

      // Python / Java → Judge0 API
      const { output: out, error } = await executeRemote(langId, code, stdinLines);
      setRunTime(Date.now() - t0);
      if (error) {
        setOutput((out ? out + '\n\n' : '') + `❌ ${error}`);
        setOutputType('error');
      } else {
        setOutput(out || '(program exited with no output)');
        setOutputType('success');
      }
    } catch (err) {
      setRunTime(Date.now() - t0);
      setOutput(`❌ ${err.message}`);
      setOutputType('error');
    }
  }, [langId, code, stdinLines, outputType]);

  // ── Editor keydown ────────────────────────────────────
  const onKeyDown = (e) => {
    // Run shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); return; }

    // Navigate completions
    if (showComp && completions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCompIdx(i => (i+1)%completions.length); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCompIdx(i => (i-1+completions.length)%completions.length); return; }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applyCompletion(completions[compIdx]);
        return;
      }
      if (e.key === 'Escape') { setShowComp(false); return; }
    }

    // Tab = indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textRef.current;
      const s  = el.selectionStart;
      const indent = langId === 'python' ? '    ' : '  ';
      const nv = code.substring(0, s) + indent + code.substring(el.selectionEnd);
      setCode(nv);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + indent.length; });
    }

    // Auto-closing brackets
    const pairs = { '(':')', '[':']', '{':'}', '"':'"', "'":"'" };
    if (pairs[e.key] && e.key !== '"' && e.key !== "'") {
      const el = textRef.current;
      const s = el.selectionStart;
      if (el.selectionStart !== el.selectionEnd) return;
      e.preventDefault();
      const nv = code.substring(0,s) + e.key + pairs[e.key] + code.substring(s);
      setCode(nv);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s+1; });
    }
  };

  // ── Autocomplete trigger on change ───────────────────
  const onCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    const pos = e.target.selectionStart;
    const beforeCursor = val.slice(0, pos);
    const currentLine  = beforeCursor.split('\n').at(-1) || '';
    const wordMatch    = beforeCursor.match(/[\w.]+$/);
    const word         = wordMatch ? wordMatch[0] : '';

    if (word.length >= 1) {
      const comps = getCompletions(langId, word, currentLine);
      if (comps.length > 0) { setCompletions(comps); setCompIdx(0); setShowComp(true); }
      else setShowComp(false);
    } else {
      setShowComp(false);
    }
  };

  const applyCompletion = (comp) => {
    const el  = textRef.current;
    const pos = el.selectionStart;
    const before = code.slice(0, pos);
    const wordMatch = before.match(/[\w.]+$/);
    const start = wordMatch ? pos - wordMatch[0].length : pos;
    const nv = code.slice(0, start) + comp.insert + code.slice(pos);
    setCode(nv);
    setShowComp(false);
    requestAnimationFrame(() => {
      el.focus();
      const newPos = start + comp.insert.length;
      el.selectionStart = el.selectionEnd = newPos;
    });
  };

  // ── Drag resize ───────────────────────────────────────
  const onDividerDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    const startY = e.clientY, startH = editorH;
    const onMove = (me) => {
      if (!isDragging.current) return;
      setEditorH(Math.max(120, Math.min(560, startH + (me.clientY - startY))));
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── AI explain ────────────────────────────────────────
  const explainCode = useCallback(async () => {
    setAiOpen(true); setAiLoading(true); setAiResult(null); setAiTab('explain');
    await new Promise(r => setTimeout(r, 1800));
    setAiResult(buildAIResult(langId, code));
    setAiLoading(false);
  }, [langId, code]);

  const clearOutput = () => { setOutput(''); setOutputType('idle'); setRunTime(null); setHtmlOutput(''); };
  const outColor    = outputType==='error' ? '#f87171' : outputType==='success' ? '#4ec9b0' : '#94a3b8';
  const needsStdin  = detectsInput(langId, code);

  return (
    <div style={s.root}>

      {/* ══ TOP BAR ══════════════════════════════════════ */}
      <div style={s.topBar}>
        {/* Language tabs ONLY — no "Code Experiment" label */}
        <div style={s.langTabs}>
          {LANGS.map(l => (
            <button key={l.id} onClick={() => switchLang(l.id)}
              style={{ ...s.langTab, ...(langId===l.id
                ? { color:l.color, borderBottomColor:l.color, background:`${l.color}10` }
                : {}) }}>
              <span style={s.langIcon}>{l.icon}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        <div style={s.topRight}>
          <span style={s.shortcutHint}>Ctrl+Enter to run</span>
          <button onClick={explainCode} style={s.aiBtn}>🤖 AI Explain</button>
          <button onClick={runCode} disabled={outputType==='running'}
            style={{ ...s.runBtn, opacity: outputType==='running' ? 0.6 : 1 }}>
            {outputType==='running'
              ? <><span style={s.spinner}/>Running…</>
              : <>▶ Run</>}
          </button>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══════════════════════════════════ */}
      <div style={s.mainLayout}>

        {/* ── LEFT: editor + terminal ── */}
        <div style={s.leftCol}>

          {/* EDITOR */}
          <div style={s.editorWrap}>
            <div style={s.editorBar}>
              <Dots/>
              <span style={s.filename}>{lang.file}</span>
              <span style={s.langBadge}>{lang.icon} {lang.label}</span>
            </div>
            <div style={{ position:'relative' }}>
              {/* Syntax highlight overlay */}
              <div style={{ ...s.highlight, height:editorH }}>
                <div style={s.lineNums}>
                  {Array.from({ length:lines }, (_,i) => (
                    <div key={i} style={s.lineNum}>{i+1}</div>
                  ))}
                </div>
                <div style={s.highlightCode}>
                  <pre style={s.highlightPre}>
                    {code ? highlight(code, langId) : <span style={{color:'#3c3c3c'}}>// Start coding here…</span>}
                    {'\n'}
                  </pre>
                </div>
              </div>
              {/* Invisible textarea on top */}
              <textarea
                ref={textRef}
                value={code}
                onChange={onCodeChange}
                onKeyDown={onKeyDown}
                onClick={() => setShowComp(false)}
                style={{ ...s.editor, height:editorH }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder=""
              />

              {/* Autocomplete dropdown */}
              {showComp && completions.length > 0 && (
                <div style={s.autocomplete}>
                  {completions.map((c,i) => (
                    <div key={i} onMouseDown={e=>{e.preventDefault();applyCompletion(c);setCompIdx(i);}}
                      style={{ ...s.acItem, ...(i===compIdx ? s.acItemActive : {}) }}>
                      <span style={{ ...s.acType, color: c.type==='snippet'?'#818cf8':'#4ec9b0' }}>
                        {c.type==='snippet' ? '⬡' : '●'}
                      </span>
                      <span style={s.acLabel}>{c.label}</span>
                      {c.type==='snippet' && <span style={s.acSnip}>snippet</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DRAG HANDLE */}
          <div onMouseDown={onDividerDown} style={s.dragHandle}>
            <div style={s.dragLine}/><span style={s.dragDots}>⠿</span><div style={s.dragLine}/>
          </div>

          {/* STDIN pre-fill (only shown when input() detected) */}
          {needsStdin && (
            <div style={s.stdinWrap} className="anim-fade-in">
              <span style={s.stdinLabel}>⌨ stdin</span>
              <textarea
                value={stdinLines}
                onChange={e=>setStdinLines(e.target.value)}
                placeholder="One input value per line (feeds into input() calls when you click Run)"
                style={s.stdinArea}
                spellCheck={false}
              />
            </div>
          )}

          {/* TERMINAL */}
          <div style={s.terminal}>
            <div style={s.termBar}>
              <Dots/>
              <span style={s.termTitle}>
                Terminal
                {outputType==='running' && <Badge bg="rgba(245,158,11,0.15)" c="#f59e0b">● running</Badge>}
                {outputType==='success' && <Badge bg="rgba(78,201,176,0.15)" c="#4ec9b0">✓ exit 0</Badge>}
                {outputType==='error'   && <Badge bg="rgba(248,113,113,0.15)" c="#f87171">✗ error</Badge>}
                {outputType==='html'    && <Badge bg="rgba(129,140,248,0.15)" c="#818cf8">● preview</Badge>}
              </span>
              {runTime!==null && outputType!=='running' && (
                <span style={s.timeLabel}>{runTime<1000?`${runTime}ms`:`${(runTime/1000).toFixed(1)}s`}</span>
              )}
              {(output||htmlOutput) && <button onClick={clearOutput} style={s.clearBtn}>Clear</button>}
            </div>

            <div ref={termBodyRef} style={s.termBody}>
              {outputType==='html' && htmlOutput
                ? <iframe srcDoc={htmlOutput} style={s.htmlFrame} title="Preview" sandbox="allow-scripts"/>
                : outputType==='running'
                ? <div style={s.runningRow}><div style={s.runSpinner}/><span style={{color:'#555',fontSize:13}}>Executing…</span></div>
                : output
                ? <pre style={{...s.outPre, color:outColor}}>{output}</pre>
                : <div style={s.emptyTerm}>
                    <span style={s.prompt}>$</span>
                    <span style={s.emptyHint}>&nbsp;Press <Kbd>▶ Run</Kbd> or <Kbd>Ctrl+Enter</Kbd> to execute</span>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* ── RIGHT: AI panel ── */}
        {aiOpen && (
          <div style={s.aiPanel} className="anim-fade-in">
            <div style={s.aiHead}>
              <div>
                <h3 style={s.aiTitle}>🤖 AI Analysis</h3>
                <p style={s.aiSub}>{lang.icon} {lang.label}</p>
              </div>
              <button onClick={()=>setAiOpen(false)} style={s.aiClose}>✕</button>
            </div>

            {/* AI Tabs: Explain | Better Code */}
            {!aiLoading && aiResult && (
              <div style={s.aiTabRow}>
                {['explain','better'].map(t => (
                  <button key={t} onClick={()=>setAiTab(t)}
                    style={{ ...s.aiTabBtn, ...(aiTab===t ? s.aiTabActive : {}) }}>
                    {t==='explain' ? '📖 Explain' : '✨ Better Code'}
                  </button>
                ))}
              </div>
            )}

            {aiLoading ? (
              <div style={s.aiLoading}>
                <div style={s.aiSpinner}/>
                <p style={s.aiLoadTxt}>Analysing your code…</p>
                <p style={s.aiLoadSub}>Syntax · Logic · Improvements · Better version</p>
              </div>
            ) : aiResult && (
              <div style={s.aiBody}>
                {aiTab === 'explain' ? (
                  <>
                    <AiSection title="🎨 Syntax">
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {aiResult.syntax.map((item,i)=>(
                          <div key={i} style={{...s.synCard,borderLeftColor:item.color}}>
                            <code style={{...s.synToken,color:item.color}}>{item.token}</code>
                            <p style={s.synDesc}>{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </AiSection>
                    <AiSection title="🧠 Logic">
                      <p style={s.aiPara}>{aiResult.logic}</p>
                    </AiSection>
                    <AiSection title="✅ Strengths" color="#4ec9b0">
                      <Blist items={aiResult.pros} dot="#4ec9b0" txt="#86efac"/>
                    </AiSection>
                    <AiSection title="⚠️ Weaknesses" color="#f87171">
                      <Blist items={aiResult.cons} dot="#f87171" txt="#fca5a5"/>
                    </AiSection>
                    <AiSection title="💡 Suggestions">
                      <p style={s.aiPara}>{aiResult.improvements}</p>
                    </AiSection>
                  </>
                ) : (
                  <AiSection title="✨ Improved Version">
                    <p style={{...s.aiPara,marginBottom:10}}>Here's a better version of your code with improvements applied:</p>
                    <div style={s.betterCodeWrap}>
                      <div style={s.betterCodeBar}>
                        <span style={s.betterCodeLabel}>{lang.file}</span>
                        <button
                          onClick={() => { setCode(aiResult.betterCode.trim()); setAiOpen(false); }}
                          style={s.useCodeBtn}>
                          ↗ Use This Code
                        </button>
                      </div>
                      <pre style={s.betterCodePre}>{aiResult.betterCode.trim()}</pre>
                    </div>
                  </AiSection>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Mini helpers ───────────────────────────────────────── */
const Dots = () => (
  <div style={{display:'flex',gap:6}}>
    <span style={{width:12,height:12,borderRadius:'50%',background:'#ff5f57',display:'inline-block'}}/>
    <span style={{width:12,height:12,borderRadius:'50%',background:'#febc2e',display:'inline-block'}}/>
    <span style={{width:12,height:12,borderRadius:'50%',background:'#28c840',display:'inline-block'}}/>
  </div>
);
const Badge = ({bg,c,children}) => <span style={{fontSize:11,color:c,background:bg,padding:'2px 8px',borderRadius:10,marginLeft:4}}>{children}</span>;
const Kbd   = ({children}) => <kbd style={{background:'#3c3c3c',border:'1px solid #555',borderRadius:4,padding:'1px 6px',fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#858585'}}>{children}</kbd>;
const AiSection = ({title,color='#555',children}) => (
  <div style={{display:'flex',flexDirection:'column',gap:8}}>
    <div style={{fontSize:12,fontWeight:700,color,textTransform:'uppercase',letterSpacing:0.8}}>{title}</div>
    {children}
  </div>
);
const Blist = ({items,dot,txt}) => (
  <div style={{display:'flex',flexDirection:'column',gap:6}}>
    {items.map((item,i) => (
      <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8}}>
        <span style={{width:5,height:5,borderRadius:'50%',background:dot,marginTop:6,flexShrink:0}}/>
        <span style={{fontSize:12,color:txt,lineHeight:1.65}}>{item}</span>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════
   STYLES — VS Code Dark
═══════════════════════════════════════════════════════ */
const s = {
  root:        { display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',background:'#1e1e1e',color:'#d4d4d4',fontFamily:'DM Sans,sans-serif' },

  topBar:      { display:'flex',alignItems:'stretch',justifyContent:'space-between',height:44,background:'#323233',borderBottom:'1px solid #252526',flexShrink:0,paddingRight:12 },
  langTabs:    { display:'flex',gap:0 },
  langTab:     { display:'flex',alignItems:'center',gap:7,padding:'0 18px',height:44,fontSize:13,fontWeight:500,color:'#858585',background:'transparent',border:'none',borderBottom:'2px solid transparent',cursor:'pointer',transition:'all 0.18s',whiteSpace:'nowrap',fontFamily:'DM Sans,sans-serif' },
  langIcon:    { fontSize:15 },
  topRight:    { display:'flex',alignItems:'center',gap:8 },
  shortcutHint:{ fontSize:11,color:'#3c3c3c',fontFamily:'JetBrains Mono,monospace',whiteSpace:'nowrap' },
  aiBtn:       { display:'flex',alignItems:'center',gap:6,padding:'6px 14px',fontSize:13,fontWeight:600,background:'rgba(99,102,241,0.14)',border:'1px solid rgba(99,102,241,0.3)',color:'#818cf8',borderRadius:6,cursor:'pointer',transition:'all 0.2s',fontFamily:'DM Sans,sans-serif' },
  runBtn:      { display:'flex',alignItems:'center',gap:6,padding:'7px 18px',fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',transition:'all 0.2s',fontFamily:'DM Sans,sans-serif',boxShadow:'0 2px 8px rgba(16,185,129,0.3)' },
  spinner:     { width:12,height:12,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite',display:'inline-block' },

  mainLayout:  { display:'flex',flex:1,overflow:'hidden' },
  leftCol:     { display:'flex',flexDirection:'column',flex:1,overflow:'hidden',minWidth:0 },

  editorWrap:  { background:'#1e1e1e',borderBottom:'1px solid #252526',flexShrink:0 },
  editorBar:   { display:'flex',alignItems:'center',gap:10,padding:'7px 14px',background:'#252526',borderBottom:'1px solid #1e1e1e' },
  filename:    { flex:1,textAlign:'center',fontSize:12,color:'#858585',fontFamily:'JetBrains Mono,monospace' },
  langBadge:   { fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace' },

  // Highlight overlay
  highlight:   { position:'absolute',top:0,left:0,right:0,pointerEvents:'none',overflow:'hidden',display:'flex' },
  lineNums:    { display:'flex',flexDirection:'column',alignItems:'flex-end',padding:'14px 10px 14px 12px',background:'#1e1e1e',borderRight:'1px solid #2d2d2d',userSelect:'none',flexShrink:0,minWidth:44 },
  lineNum:     { fontSize:13,lineHeight:'23.4px',color:'#3c3c3c',fontFamily:'JetBrains Mono,monospace',minWidth:20,textAlign:'right' },
  highlightCode:{ flex:1,overflow:'hidden',padding:'14px 20px' },
  highlightPre:{ margin:0,fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:1.8,whiteSpace:'pre',color:'transparent' },

  editor:      { position:'absolute',top:0,left:0,right:0,bottom:0,width:'100%',paddingLeft:54,paddingRight:20,paddingTop:14,paddingBottom:14,background:'transparent',border:'none',outline:'none',color:'transparent',caretColor:'#d4d4d4',fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:1.8,resize:'none',overflowY:'auto' },

  autocomplete:{ position:'absolute',zIndex:1000,background:'#252526',border:'1px solid #454545',borderRadius:6,boxShadow:'0 8px 32px rgba(0,0,0,0.5)',minWidth:220,maxHeight:200,overflowY:'auto',top:'calc(100% - 4px)',left:54 },
  acItem:      { display:'flex',alignItems:'center',gap:8,padding:'7px 10px',cursor:'pointer',fontSize:13,fontFamily:'JetBrains Mono,monospace' },
  acItemActive:{ background:'#094771' },
  acType:      { fontSize:10,flexShrink:0 },
  acLabel:     { flex:1,color:'#d4d4d4' },
  acSnip:      { fontSize:10,color:'#555',background:'#3c3c3c',padding:'1px 6px',borderRadius:4 },

  dragHandle:  { display:'flex',alignItems:'center',gap:8,padding:'3px 16px',background:'#252526',borderTop:'1px solid #1a1a1a',borderBottom:'1px solid #1a1a1a',cursor:'row-resize',flexShrink:0,userSelect:'none' },
  dragLine:    { flex:1,height:1,background:'#3c3c3c' },
  dragDots:    { fontSize:11,color:'#444',letterSpacing:1 },

  stdinWrap:   { background:'#1a1a1a',borderBottom:'1px solid #1e1e1e',display:'flex',alignItems:'center',gap:10,padding:'6px 14px',flexShrink:0 },
  stdinLabel:  { fontSize:11,color:'#f59e0b',fontFamily:'JetBrains Mono,monospace',fontWeight:700,flexShrink:0 },
  stdinArea:   { flex:1,height:28,background:'transparent',border:'none',outline:'none',color:'#f59e0b',fontFamily:'JetBrains Mono,monospace',fontSize:12,resize:'none',lineHeight:1.4 },

  terminal:    { display:'flex',flexDirection:'column',flex:1,background:'#1e1e1e',overflow:'hidden' },
  termBar:     { display:'flex',alignItems:'center',gap:8,padding:'7px 14px',background:'#252526',borderTop:'1px solid #1a1a1a',flexShrink:0 },
  termTitle:   { flex:1,fontSize:12,fontWeight:600,color:'#858585',fontFamily:'Syne,sans-serif',display:'flex',alignItems:'center',gap:4 },
  timeLabel:   { fontSize:11,color:'#3c3c3c',fontFamily:'JetBrains Mono,monospace' },
  clearBtn:    { padding:'3px 10px',background:'#3c3c3c',border:'none',color:'#858585',borderRadius:4,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif' },
  termBody:    { flex:1,overflow:'auto',position:'relative' },
  outPre:      { margin:0,padding:'14px 20px',fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap',wordBreak:'break-all' },
  htmlFrame:   { width:'100%',height:'100%',border:'none',background:'#fff' },
  runningRow:  { display:'flex',alignItems:'center',gap:12,padding:'20px' },
  runSpinner:  { width:16,height:16,borderRadius:'50%',border:'2px solid rgba(78,201,176,0.2)',borderTopColor:'#4ec9b0',animation:'spin 1s linear infinite',flexShrink:0 },
  emptyTerm:   { display:'flex',alignItems:'center',padding:'14px 20px' },
  prompt:      { color:'#4ec9b0',fontFamily:'JetBrains Mono,monospace',fontSize:14,fontWeight:700 },
  emptyHint:   { color:'#3c3c3c',fontSize:13 },

  aiPanel:     { width:360,borderLeft:'1px solid #252526',background:'#1e1e1e',display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0 },
  aiHead:      { display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid #252526',flexShrink:0 },
  aiTitle:     { fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:800,color:'#d4d4d4',marginBottom:2 },
  aiSub:       { fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace' },
  aiClose:     { width:24,height:24,borderRadius:4,background:'#3c3c3c',border:'none',color:'#858585',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif',flexShrink:0 },
  aiTabRow:    { display:'flex',borderBottom:'1px solid #252526',flexShrink:0 },
  aiTabBtn:    { flex:1,padding:'9px 0',fontSize:12,fontWeight:600,color:'#555',background:'transparent',border:'none',borderBottom:'2px solid transparent',cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all 0.2s' },
  aiTabActive: { color:'#818cf8',borderBottomColor:'#6366f1',background:'rgba(99,102,241,0.06)' },
  aiLoading:   { display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,flex:1,padding:'32px 18px' },
  aiSpinner:   { width:32,height:32,borderRadius:'50%',border:'3px solid rgba(99,102,241,0.2)',borderTopColor:'#6366f1',animation:'spin 1s linear infinite' },
  aiLoadTxt:   { fontSize:13,color:'#858585',fontWeight:500,textAlign:'center' },
  aiLoadSub:   { fontSize:11,color:'#4d4d4d',textAlign:'center',lineHeight:1.6 },
  aiBody:      { flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:16 },
  aiPara:      { fontSize:12,color:'#858585',lineHeight:1.75,background:'#252526',padding:'10px 12px',borderRadius:6,margin:0 },
  synCard:     { padding:'9px 11px',background:'#252526',borderRadius:6,borderLeft:'3px solid',display:'flex',flexDirection:'column',gap:4 },
  synToken:    { fontFamily:'JetBrains Mono,monospace',fontSize:11,fontWeight:600 },
  synDesc:     { fontSize:12,color:'#858585',lineHeight:1.6,margin:0 },
  betterCodeWrap:{ background:'#1a1a1a',borderRadius:8,overflow:'hidden',border:'1px solid #2d2d2d' },
  betterCodeBar: { display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'#252526',borderBottom:'1px solid #1e1e1e' },
  betterCodeLabel:{ fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace' },
  useCodeBtn:  { padding:'4px 12px',background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.4)',color:'#818cf8',borderRadius:5,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif' },
  betterCodePre:{ margin:0,padding:'14px',fontFamily:'JetBrains Mono,monospace',fontSize:11.5,lineHeight:1.75,color:'#a5b4fc',overflowX:'auto',whiteSpace:'pre' },
};
