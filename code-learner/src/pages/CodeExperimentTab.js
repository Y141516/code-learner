import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import { runJavaScript, runJava, runHTML, normalizeOutput } from '../utils/executor';
import { analyseUserCode } from '../utils/aiAnalyser';

// ─── Language configs ─────────────────────────────────────
const LANGS = [
  { id:'python',     label:'Python',     icon:'🐍', color:'#4EC9B0', ext:'py'   },
  { id:'javascript', label:'JavaScript', icon:'⚡', color:'#DCDCAA', ext:'js'   },
  { id:'java',       label:'Java',       icon:'☕', color:'#F0A868', ext:'java' },
  { id:'html',       label:'HTML & CSS', icon:'🎨', color:'#E5A550', ext:'html' },
];

// ─── Keywords for syntax highlighting ────────────────────
const KW = {
  python: new Set(['False','None','True','and','as','assert','async','await',
    'break','class','continue','def','del','elif','else','except','finally',
    'for','from','global','if','import','in','is','lambda','nonlocal','not',
    'or','pass','raise','return','try','while','with','yield']),
  javascript: new Set(['async','await','break','case','catch','class','const',
    'continue','debugger','default','delete','do','else','export','extends',
    'finally','for','function','if','import','in','instanceof','let','new',
    'of','return','static','super','switch','this','throw','try','typeof',
    'var','void','while','with','yield','from','null','undefined','true','false']),
  java: new Set(['abstract','assert','boolean','break','byte','case','catch',
    'char','class','continue','default','do','double','else','enum','extends',
    'final','finally','float','for','if','implements','import','instanceof',
    'int','interface','long','native','new','package','private','protected',
    'public','return','short','static','super','switch','synchronized','this',
    'throw','throws','transient','try','void','volatile','while','null','true','false']),
  html: new Set([]),
};

const BUILTIN_PY = new Set(['print','input','range','len','str','int','float',
  'list','dict','set','tuple','type','bool','sum','min','max','abs','round',
  'sorted','reversed','enumerate','zip','map','filter','open','super','self']);

// ─── Completions ──────────────────────────────────────────
const COMPLETIONS = {
  python: [
    { label:'def func():',         kind:'snippet', insert:'def ${1:name}(${2:args}):\n    ${3:pass}' },
    { label:'class MyClass:',      kind:'snippet', insert:'class ${1:Name}:\n    def __init__(self):\n        ${2:pass}' },
    { label:'for i in range():',   kind:'snippet', insert:'for ${1:i} in range(${2:10}):\n    ${3:pass}' },
    { label:'for item in list:',   kind:'snippet', insert:'for ${1:item} in ${2:items}:\n    ${3:pass}' },
    { label:'if condition:',       kind:'snippet', insert:'if ${1:condition}:\n    ${2:pass}' },
    { label:'if / else',           kind:'snippet', insert:'if ${1:condition}:\n    ${2:pass}\nelse:\n    ${3:pass}' },
    { label:'while loop',          kind:'snippet', insert:'while ${1:condition}:\n    ${2:pass}' },
    { label:'try / except',        kind:'snippet', insert:'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    print(e)' },
    { label:'import module',       kind:'snippet', insert:'import ${1:module}' },
    { label:'from x import y',     kind:'snippet', insert:'from ${1:module} import ${2:name}' },
    { label:'with open()',         kind:'snippet', insert:'with open("${1:file.txt}", "${2:r}") as f:\n    ${3:content = f.read()}' },
    { label:'[x for x in list]',   kind:'snippet', insert:'[${1:x} for ${2:x} in ${3:iterable}]' },
    { label:'lambda x: x',         kind:'snippet', insert:'lambda ${1:x}: ${2:x}' },
    { label:'print()',             kind:'function', insert:'print(${1})' },
    { label:'input()',             kind:'function', insert:'input("${1:prompt}: ")' },
    { label:'range()',             kind:'function', insert:'range(${1:10})' },
    { label:'len()',               kind:'function', insert:'len(${1})' },
    { label:'enumerate()',         kind:'function', insert:'enumerate(${1:iterable})' },
    { label:'zip()',               kind:'function', insert:'zip(${1:a}, ${2:b})' },
    { label:'isinstance()',        kind:'function', insert:'isinstance(${1:obj}, ${2:type})' },
    ...[
      'False','None','True','and','as','assert','async','await','break','class',
      'continue','def','del','elif','else','except','finally','for','from',
      'global','if','import','in','is','lambda','nonlocal','not','or','pass',
      'raise','return','try','while','with','yield',
    ].map(k => ({ label:k, kind:'keyword', insert:k })),
  ],
  javascript: [
    { label:'const name = value',  kind:'snippet', insert:'const ${1:name} = ${2:value};' },
    { label:'let name = value',    kind:'snippet', insert:'let ${1:name} = ${2:value};' },
    { label:'function name() {}',  kind:'snippet', insert:'function ${1:name}(${2:params}) {\n  ${3}\n}' },
    { label:'arrow function',      kind:'snippet', insert:'const ${1:name} = (${2:params}) => {\n  ${3}\n};' },
    { label:'async function',      kind:'snippet', insert:'async function ${1:name}() {\n  try {\n    ${2}\n  } catch (err) {\n    console.error(err);\n  }\n}' },
    { label:'if / else',           kind:'snippet', insert:'if (${1:condition}) {\n  ${2}\n} else {\n  ${3}\n}' },
    { label:'for loop',            kind:'snippet', insert:'for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n  ${3}\n}' },
    { label:'for...of',            kind:'snippet', insert:'for (const ${1:item} of ${2:array}) {\n  ${3}\n}' },
    { label:'try / catch',         kind:'snippet', insert:'try {\n  ${1}\n} catch (${2:err}) {\n  console.error(${2:err});\n}' },
    { label:'class Name {}',       kind:'snippet', insert:'class ${1:Name} {\n  constructor(${2:params}) {\n    ${3}\n  }\n}' },
    { label:'Promise.all()',       kind:'snippet', insert:'const [${1:a}, ${2:b}] = await Promise.all([\n  ${3},\n  ${4},\n]);' },
    { label:'console.log()',       kind:'function', insert:'console.log(${1});' },
    { label:'console.error()',     kind:'function', insert:'console.error(${1});' },
    { label:'fetch()',             kind:'function', insert:'const res = await fetch("${1:url}");\nconst data = await res.json();' },
    { label:'.map()',              kind:'method',   insert:'.map(${1:item} => ${2:item})' },
    { label:'.filter()',           kind:'method',   insert:'.filter(${1:item} => ${2:condition})' },
    { label:'.reduce()',           kind:'method',   insert:'.reduce((${1:acc}, ${2:cur}) => ${3:acc + cur}, ${4:0})' },
    { label:'.find()',             kind:'method',   insert:'.find(${1:item} => ${2:condition})' },
    { label:'.forEach()',          kind:'method',   insert:'.forEach(${1:item} => {\n  ${2}\n})' },
    ...[
      'async','await','break','case','catch','class','const','continue',
      'delete','do','else','export','extends','finally','for','function',
      'if','import','in','instanceof','let','new','of','return','static',
      'super','switch','this','throw','try','typeof','var','void','while',
    ].map(k => ({ label:k, kind:'keyword', insert:k })),
  ],
  java: [
    { label:'main class',                kind:'snippet', insert:'public class Main {\n    public static void main(String[] args) {\n        ${1}\n    }\n}' },
    { label:'System.out.println()',      kind:'snippet', insert:'System.out.println(${1});' },
    { label:'System.out.printf()',       kind:'snippet', insert:'System.out.printf("${1:%s}%n", ${2:value});' },
    { label:'for loop',                  kind:'snippet', insert:'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}' },
    { label:'enhanced for',             kind:'snippet', insert:'for (${1:String} ${2:item} : ${3:collection}) {\n    ${4}\n}' },
    { label:'if / else',                kind:'snippet', insert:'if (${1:condition}) {\n    ${2}\n} else {\n    ${3}\n}' },
    { label:'try / catch',              kind:'snippet', insert:'try {\n    ${1}\n} catch (Exception ${2:e}) {\n    System.out.println(${2:e}.getMessage());\n}' },
    { label:'Scanner (user input)',      kind:'snippet', insert:'Scanner scanner = new Scanner(System.in);\nSystem.out.print("${1:Enter value: }");\nString ${2:input} = scanner.nextLine();' },
    { label:'ArrayList<String>',         kind:'snippet', insert:'ArrayList<${1:String}> ${2:list} = new ArrayList<>();' },
    { label:'HashMap<K,V>',             kind:'snippet', insert:'HashMap<${1:String}, ${2:Integer}> ${3:map} = new HashMap<>();' },
    { label:'method definition',         kind:'snippet', insert:'public static ${1:void} ${2:methodName}(${3:params}) {\n    ${4}\n}' },
    ...[
      'abstract','boolean','break','byte','case','catch','char','class',
      'continue','default','do','double','else','enum','extends','final',
      'finally','float','for','if','implements','import','instanceof','int',
      'interface','long','new','private','protected','public','return',
      'short','static','super','switch','this','throw','throws','try',
      'void','while',
    ].map(k => ({ label:k, kind:'keyword', insert:k })),
  ],
  html: [
    { label:'HTML5 boilerplate',         kind:'snippet', insert:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Title}</title>\n  <style>\n    ${2}\n  </style>\n</head>\n<body>\n  ${3}\n  <script>\n    ${4}\n  </script>\n</body>\n</html>' },
    { label:'<div class="">',            kind:'snippet', insert:'<div class="${1}">\n  ${2}\n</div>' },
    { label:'<p> paragraph',            kind:'snippet', insert:'<p>${1}</p>' },
    { label:'<a href=""> link',         kind:'snippet', insert:'<a href="${1:#}">${2:link text}</a>' },
    { label:'<img src="" alt="">',      kind:'snippet', insert:'<img src="${1}" alt="${2}" />' },
    { label:'<input type="">',          kind:'snippet', insert:'<input type="${1:text}" placeholder="${2}" />' },
    { label:'<button onclick="">',      kind:'snippet', insert:'<button onclick="${1}">${2:Click me}</button>' },
    { label:'<ul> list',               kind:'snippet', insert:'<ul>\n  <li>${1}</li>\n  <li>${2}</li>\n</ul>' },
    { label:'<style> block',           kind:'snippet', insert:'<style>\n  ${1}\n</style>' },
    { label:'<script> block',          kind:'snippet', insert:'<script>\n  ${1}\n</script>' },
    { label:'CSS flexbox',             kind:'snippet', insert:'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};' },
    { label:'CSS grid',                kind:'snippet', insert:'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:16px};' },
    { label:'CSS custom properties',   kind:'snippet', insert:':root {\n  --primary: ${1:#6366f1};\n  --bg: ${2:#0f172a};\n}' },
    { label:'CSS hover transition',    kind:'snippet', insert:'transition: ${1:all} ${2:0.2s} ease;\n&:hover {\n  ${3}\n}' },
    { label:'@media query',            kind:'snippet', insert:'@media (min-width: ${1:768px}) {\n  ${2}\n}' },
  ],
};

// ─── Token colour map ─────────────────────────────────────
const TC = {
  keyword:'#C586C0', builtin:'#4EC9B0', string:'#CE9178', comment:'#6A9955',
  number:'#B5CEA8',  function:'#DCDCAA', tag:'#4EC9B0',   op:'#D4D4D4',
  ident:'#9CDCFE',   other:'#D4D4D4',
};

// ─── Tokenizer ────────────────────────────────────────────
function tokenize(code, langId) {
  const tokens = [];
  let i = 0;
  const kw = KW[langId] || new Set();

  while (i < code.length) {
    if ((langId !== 'html') && code[i]==='/' && code[i+1]==='/') {
      let s=''; while(i<code.length && code[i]!=='\n') s+=code[i++];
      tokens.push({type:'comment',val:s}); continue;
    }
    if (langId==='python' && code[i]==='#') {
      let s=''; while(i<code.length && code[i]!=='\n') s+=code[i++];
      tokens.push({type:'comment',val:s}); continue;
    }
    if (langId==='html' && code.startsWith('<!--',i)) {
      const end=code.indexOf('-->',i); const s=end<0?code.slice(i):code.slice(i,end+3);
      tokens.push({type:'comment',val:s}); i+=s.length; continue;
    }
    if (code[i]==='/' && code[i+1]==='*') {
      const end=code.indexOf('*/',i+2); const s=end<0?code.slice(i):code.slice(i,end+2);
      tokens.push({type:'comment',val:s}); i+=s.length; continue;
    }
    if (code[i]==='`') {
      let s='`'; i++;
      while(i<code.length && code[i]!=='`') { if(code[i]==='\\'){s+=code[i]+(code[i+1]||'');i+=2;continue;} s+=code[i++]; }
      s+=code[i]==='`'?code[i++]:'';
      tokens.push({type:'string',val:s}); continue;
    }
    if (code[i]==='"'||code[i]==="'") {
      const q=code[i]; let s=q; i++;
      while(i<code.length && code[i]!==q && code[i]!=='\n') { if(code[i]==='\\'){s+=code[i]+(code[i+1]||'');i+=2;continue;} s+=code[i++]; }
      s+=code[i]===q?code[i++]:'';
      tokens.push({type:'string',val:s}); continue;
    }
    if (/\d/.test(code[i]) && (i===0||/\W/.test(code[i-1]))) {
      let s=''; while(i<code.length && /[\d._xXa-fA-F]/.test(code[i])) s+=code[i++];
      tokens.push({type:'number',val:s}); continue;
    }
    if (langId==='html' && code[i]==='<') {
      let s='<'; i++;
      while(i<code.length && code[i]!=='>') s+=code[i++];
      s+=code[i]==='>'?code[i++]:'';
      tokens.push({type:'tag',val:s}); continue;
    }
    if (/[a-zA-Z_$]/.test(code[i])) {
      let s=''; while(i<code.length && /[\w$]/.test(code[i])) s+=code[i++];
      if (kw.has(s))                             tokens.push({type:'keyword',val:s});
      else if (BUILTIN_PY.has(s)&&langId==='python') tokens.push({type:'builtin',val:s});
      else if (code[i]==='(')                    tokens.push({type:'function',val:s});
      else                                       tokens.push({type:'ident',val:s});
      continue;
    }
    if (/[=!<>+\-*/%&|^~?:;,.]/.test(code[i])) {
      tokens.push({type:'op',val:code[i++]}); continue;
    }
    tokens.push({type:'other',val:code[i++]});
  }
  return tokens;
}

function Highlight({ code, langId }) {
  const tokens = useMemo(()=>tokenize(code||'',langId),[code,langId]);
  return <>{tokens.map((t,i)=><span key={i} style={{color:TC[t.type]||'#D4D4D4'}}>{t.val}</span>)}</>;
}

// ─── Better code examples per language ───────────────────
const BETTER_CODE = {
  python: `# Improved Python — type hints, docstrings, best practices
from typing import List, Optional
import sys

def greet(name: str) -> str:
    """Return a personalised greeting for the given name."""
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Name must be a non-empty string")
    return f"Hello, {name.strip().title()}!"

def compute_stats(numbers: List[float]) -> Optional[dict]:
    """Return basic statistics or None if list is empty."""
    if not numbers:
        return None
    total = sum(numbers)
    return {
        "count":   len(numbers),
        "sum":     total,
        "average": round(total / len(numbers), 2),
        "min":     min(numbers),
        "max":     max(numbers),
    }

if __name__ == "__main__":
    name = input("Enter your name: ")
    print(greet(name))
    stats = compute_stats([1, 2, 3, 4, 5])
    if stats:
        for key, val in stats.items():
            print(f"  {key}: {val}")
`,
  javascript:`// Improved JavaScript — modern patterns, error handling
const processData = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Expected a non-empty array");
  }
  return {
    count:   items.length,
    sum:     items.reduce((a, b) => a + b, 0),
    average: +(items.reduce((a, b) => a + b, 0) / items.length).toFixed(2),
    min:     Math.min(...items),
    max:     Math.max(...items),
    evens:   items.filter(n => n % 2 === 0),
    odds:    items.filter(n => n % 2 !== 0),
  };
};

const fetchJSON = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err.message);
    return null;
  }
};

// Example usage
const stats = processData([1, 2, 3, 4, 5, 6, 7, 8]);
console.log(JSON.stringify(stats, null, 2));
`,
  java:`import java.util.*;
import java.util.stream.*;

public class Main {
    record Person(String name, int age) {}

    public static void main(String[] args) {
        var people = List.of(
            new Person("Alice", 25),
            new Person("Bob", 17),
            new Person("Carol", 32),
            new Person("Dave", 15)
        );

        // Stream API — filter, sort, display
        System.out.println("Adults (sorted):");
        people.stream()
            .filter(p -> p.age() >= 18)
            .sorted(Comparator.comparing(Person::name))
            .forEach(p ->
                System.out.printf("  %-10s — age %d%n", p.name(), p.age())
            );

        var stats = people.stream()
            .mapToInt(Person::age)
            .summaryStatistics();
        System.out.printf("Average age: %.1f%n", stats.getAverage());
    }
}
`,
  html:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Better Component</title>
  <style>
    :root {
      --primary: #6366f1;
      --surface: #1e293b;
      --bg: #0f172a;
      --text: #e2e8f0;
      --radius: 12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: grid; place-items: center; }
    .card { background: var(--surface); padding: 32px; border-radius: var(--radius); text-align: center; min-width: 280px; }
    .count { font-size: 4rem; font-weight: 800; color: var(--primary); margin: 16px 0; }
    .actions { display: flex; gap: 10px; justify-content: center; }
    button { background: var(--primary); color: #fff; border: none; padding: 10px 22px; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.85; }
    button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
    .secondary { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1 style="color: var(--primary); margin-bottom: 8px;">Counter</h1>
    <div class="count" id="count" aria-live="polite">0</div>
    <div class="actions">
      <button id="dec" class="secondary">− Decrement</button>
      <button id="inc">+ Increment</button>
    </div>
  </div>
  <script>
    let n = 0;
    const el = document.getElementById('count');
    document.getElementById('inc').addEventListener('click', () => { el.textContent = ++n; });
    document.getElementById('dec').addEventListener('click', () => { el.textContent = --n; });
  </script>
</body>
</html>
`,
};

// ─── Main Component ───────────────────────────────────────
export default function CodeExperimentTab() {
  const [codes,      setCodes]      = useState({ python:'', javascript:'', java:'', html:'' });
  const [activeLang, setActiveLang] = useState('python');
  const [status,     setStatus]     = useState('idle'); // idle|running|done|error|html
  const [splitPct,   setSplitPct]   = useState(55);

  // Terminal lines: { kind:'output'|'input_prompt'|'input_value'|'error', text }
  const [termLines,  setTermLines]  = useState([]);
  const [inputMode,  setInputMode]  = useState(false);
  const [inputVal,   setInputVal]   = useState('');
  const [runMs,      setRunMs]      = useState(null);
  const [htmlOut,    setHtmlOut]    = useState('');

  // AI
  const [aiOpen,     setAiOpen]     = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiResult,   setAiResult]   = useState(null);
  const [aiTab,      setAiTab]      = useState('explain');

  // Autocomplete
  const [sugs,       setSugs]       = useState([]);
  const [sugIdx,     setSugIdx]     = useState(0);
  const [sugVisible, setSugVisible] = useState(false);

  // Pyodide worker
  const workerRef   = useRef(null);
  const resolveInput= useRef(null); // promise resolver waiting for user input
  const editorRef   = useRef(null);
  const overlayRef  = useRef(null);
  const termRef     = useRef(null);
  const inputRef    = useRef(null);
  const dragging    = useRef(false);
  const containerRef= useRef(null);
  const startTimeRef= useRef(null);

  const code = codes[activeLang] || '';
  const lang = LANGS.find(l => l.id === activeLang);
  const lines = (code || '').split('\n').length;

  // ── Init/reuse Pyodide worker ────────────────────────────
  useEffect(() => {
    const w = new Worker('/pyodide.worker.js');

    w.onmessage = (e) => {
      const { type, text, prompt, exitCode } = e.data;

      if (type === 'status') {
        setTermLines(prev => [...prev, { kind:'output', text: '⏳ ' + text }]);
      }

      if (type === 'stdout') {
        setTermLines(prev => [...prev, { kind:'output', text }]);
        // Scroll
        requestAnimationFrame(() => {
          if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
        });
      }

      if (type === 'stderr') {
        if (text.trim()) {
          setTermLines(prev => [...prev, { kind:'error', text }]);
        }
      }

      if (type === 'input_request') {
        // Python called input() — show input row in terminal
        if (prompt) {
          setTermLines(prev => [...prev, { kind:'input_prompt', text: prompt }]);
        }
        setInputMode(true);
        setInputVal('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }

      if (type === 'run_done') {
        setRunMs(Date.now() - (startTimeRef.current || Date.now()));
        setInputMode(false);
        setStatus(exitCode === 0 ? 'done' : 'error');
      }

      if (type === 'ready') {
        // Pyodide loaded — update indicator (no user-visible message)
      }
    };

    workerRef.current = w;
    return () => w.terminate();
  }, []);

  // ── Submit input line to worker ──────────────────────────
  const submitInput = useCallback(() => {
    const val = inputVal;
    setTermLines(prev => [...prev, { kind:'input_value', text: val }]);
    setInputVal('');
    setInputMode(false);
    workerRef.current?.postMessage({ type: 'input_response', value: val });
  }, [inputVal]);

  // ── Run code ─────────────────────────────────────────────
  const run = useCallback(async () => {
    if (status === 'running') return;
    setTermLines([]);
    setHtmlOut('');
    setStatus('running');
    setRunMs(null);
    setInputMode(false);
    startTimeRef.current = Date.now();

    // HTML
    if (activeLang === 'html') {
      setHtmlOut(code);
      setStatus('html');
      setRunMs(0);
      return;
    }

    // JavaScript — browser
    if (activeLang === 'javascript') {
      const { lines: outLines, exitCode, error } = runJavaScript(code);
      const elapsed = Date.now() - startTimeRef.current;
      setRunMs(elapsed);
      const termOut = [];
      outLines.forEach(l => termOut.push({ kind:'output', text:l }));
      if (error) termOut.push({ kind:'error', text: error });
      setTermLines(termOut);
      setStatus(error ? 'error' : 'done');
      return;
    }

    // Java — Judge0
    if (activeLang === 'java') {
      setTermLines([{ kind:'output', text:'Running Java via Judge0 API…' }]);
      const { lines: outLines, exitCode, error } = await runJava(code, '');
      const elapsed = Date.now() - startTimeRef.current;
      setRunMs(elapsed);
      const termOut = [];
      outLines.forEach(l => termOut.push({ kind:'output', text:l }));
      if (error) termOut.push({ kind:'error', text: error });
      setTermLines(termOut);
      setStatus(error ? 'error' : 'done');
      return;
    }

    // Python — send to worker, worker will send back stdout/input_request/run_done
    if (activeLang === 'python') {
      workerRef.current?.postMessage({ type: 'run', code });
    }
  }, [activeLang, code, status]);

  // ── Scroll terminal on new lines ─────────────────────────
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [termLines, inputMode]);

  // ── Code change + autocomplete ───────────────────────────
  const onCodeChange = useCallback((e) => {
    const val = e.target.value;
    const lang = activeLang;
    setCodes(prev => ({ ...prev, [lang]: val }));

    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const wordMatch = before.match(/[\w.]+$/);
    const word = wordMatch ? wordMatch[0].toLowerCase() : '';

    if (word.length >= 1) {
      const all = COMPLETIONS[lang] || [];
      const matches = all
        .filter(c => c.label.toLowerCase().startsWith(word) && c.label.toLowerCase() !== word)
        .slice(0, 10);
      if (matches.length > 0) { setSugs(matches); setSugIdx(0); setSugVisible(true); }
      else setSugVisible(false);
    } else {
      setSugVisible(false);
    }
  }, [activeLang]);

  const applyCompletion = useCallback((comp) => {
    const ta = editorRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const val = codes[activeLang] || '';
    const before = val.slice(0, pos);
    const wordMatch = before.match(/[\w.]+$/);
    const start = wordMatch ? pos - wordMatch[0].length : pos;
    const insertText = comp.insert.replace(/\$\{\d+:?([^}]*)\}/g,'$1').replace(/\$\d+/g,'');
    const nv = val.slice(0,start) + insertText + val.slice(pos);
    setCodes(prev => ({ ...prev, [activeLang]: nv }));
    setSugVisible(false);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + insertText.length;
    });
  }, [codes, activeLang]);

  // ── Keydown ───────────────────────────────────────────────
  const onKeyDown = useCallback((e) => {
    if (sugVisible && sugs.length > 0) {
      if (e.key==='ArrowDown') { e.preventDefault(); setSugIdx(i=>(i+1)%sugs.length); return; }
      if (e.key==='ArrowUp')   { e.preventDefault(); setSugIdx(i=>(i-1+sugs.length)%sugs.length); return; }
      if (e.key==='Tab'||e.key==='Enter') { e.preventDefault(); applyCompletion(sugs[sugIdx]); return; }
      if (e.key==='Escape')    { setSugVisible(false); return; }
    }

    if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); run(); return; }

    if (e.key==='Tab') {
      e.preventDefault();
      const ta=editorRef.current; const s=ta.selectionStart;
      const indent='    ';
      const cur=codes[activeLang]||'';
      const nv=cur.slice(0,s)+indent+cur.slice(ta.selectionEnd);
      setCodes(prev=>({...prev,[activeLang]:nv}));
      requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=s+indent.length;});
      return;
    }

    if (e.key==='Enter') {
      const ta=editorRef.current; const pos=ta.selectionStart;
      const cur=codes[activeLang]||'';
      const line=cur.slice(0,pos).split('\n').at(-1)||'';
      const indent=(line.match(/^(\s+)/)||['',''])[1];
      const extra=/[:({]$/.test(line.trim())?'    ':'';
      if (indent||extra) {
        e.preventDefault();
        const add='\n'+indent+extra;
        const nv=cur.slice(0,pos)+add+cur.slice(ta.selectionEnd);
        setCodes(prev=>({...prev,[activeLang]:nv}));
        requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=pos+add.length;});
        return;
      }
    }

    const PAIRS={'(':')',  '[':']', '{':'}' };
    if (PAIRS[e.key]) {
      const ta=editorRef.current;
      if (ta.selectionStart===ta.selectionEnd) {
        e.preventDefault();
        const cur=codes[activeLang]||''; const pos=ta.selectionStart;
        const nv=cur.slice(0,pos)+e.key+PAIRS[e.key]+cur.slice(pos);
        setCodes(prev=>({...prev,[activeLang]:nv}));
        requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=pos+1;});
        return;
      }
    }
  }, [sugVisible, sugs, sugIdx, activeLang, codes, run, applyCompletion]);

  // ── Sync overlay scroll with textarea ────────────────────
  const syncScroll = useCallback(() => {
    if (overlayRef.current && editorRef.current) {
      overlayRef.current.scrollTop  = editorRef.current.scrollTop;
      overlayRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  }, []);

  // ── Drag resize ───────────────────────────────────────────
  const onDividerDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const onMove = (me) => {
      if (!dragging.current) return;
      const pct = ((me.clientY - rect.top) / rect.height) * 100;
      setSplitPct(Math.max(20, Math.min(80, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── AI explain (reads actual editor code) ────────────────
  const openAI = useCallback(async () => {
    setAiOpen(true); setAiLoading(true); setAiResult(null); setAiTab('explain');
    await new Promise(r => setTimeout(r, 800)); // brief "thinking" pause
    const result = analyseUserCode(activeLang, code);
    setAiResult(result);
    setAiLoading(false);
  }, [activeLang, code]);

  // ── Switch language ───────────────────────────────────────
  const switchLang = (id) => {
    setActiveLang(id);
    setSugVisible(false);
    setTermLines([]);
    setHtmlOut('');
    setStatus('idle');
    setRunMs(null);
    setInputMode(false);
  };

  const clearTerm = () => { setTermLines([]); setHtmlOut(''); setStatus('idle'); setRunMs(null); };

  const statusBadge = () => {
    if (status==='running') return <Bdg bg="rgba(96,165,250,.15)" c="#60a5fa">● running</Bdg>;
    if (status==='done')    return <Bdg bg="rgba(78,201,176,.15)" c="#4EC9B0">✓ exit 0</Bdg>;
    if (status==='error')   return <Bdg bg="rgba(248,113,113,.15)" c="#F87171">✗ error</Bdg>;
    if (status==='html')    return <Bdg bg="rgba(129,140,248,.15)" c="#818cf8">● preview</Bdg>;
    return null;
  };

  return (
    <div style={s.root}>
      {/* ══ TOP BAR ══ */}
      <div style={s.bar}>
        <div style={s.tabs}>
          {LANGS.map(l => (
            <button key={l.id} onClick={() => switchLang(l.id)}
              style={{
                ...s.tab,
                ...(activeLang===l.id
                  ? { color:l.color, borderBottomColor:l.color, background:`${l.color}10` }
                  : {}),
              }}>
              <span style={s.tabIcon}>{l.icon}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
        <div style={s.barRight}>
          <span style={s.kbHint}>Ctrl+Enter to run</span>
          <button onClick={openAI} style={s.aiBtnTop}>🤖 AI Explain</button>
          <button onClick={run} disabled={status==='running'}
            style={{...s.runBtnTop, opacity:status==='running'?0.6:1}}>
            {status==='running' ? <><Spin/>Running…</> : <>▶ Run</>}
          </button>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div style={s.main}>
        {/* LEFT: editor + terminal */}
        <div ref={containerRef} style={s.left}>

          {/* EDITOR */}
          <div style={{...s.pane, height:`${splitPct}%`, flexShrink:0}}>
            <div style={s.paneBar}>
              <Dots/><span style={s.paneTitle}>{lang?.icon} {lang?.label} — main.{lang?.ext}</span>
              <span style={s.paneRight}>{lines} {lines===1?'line':'lines'}</span>
            </div>
            <div style={s.editorArea}>
              {/* Line numbers */}
              <div style={s.lineNums}>
                {Array.from({length:lines},(_,i)=>(
                  <div key={i} style={s.lineNum}>{i+1}</div>
                ))}
              </div>
              {/* Overlay + textarea */}
              <div style={s.editorInner}>
                <div ref={overlayRef} aria-hidden style={s.overlay}>
                  <pre style={s.overlayPre}>
                    {code
                      ? <Highlight code={code} langId={activeLang}/>
                      : <span style={{color:'#2d2d2d'}}>{'// Write your code here…'}</span>
                    }{'\n'}
                  </pre>
                </div>
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={onCodeChange}
                  onKeyDown={onKeyDown}
                  onScroll={syncScroll}
                  onBlur={() => setTimeout(()=>setSugVisible(false), 150)}
                  onClick={() => setSugVisible(false)}
                  style={s.textarea}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  wrap="off"
                />
                {/* Autocomplete */}
                {sugVisible && sugs.length > 0 && (
                  <div style={s.sugBox}>
                    {sugs.map((sg,i) => (
                      <div key={i}
                        onMouseDown={e=>{e.preventDefault();applyCompletion(sg);setSugIdx(i);}}
                        style={{...s.sugItem,...(i===sugIdx?s.sugActive:{})}}>
                        <span style={{...s.sugKind, color:
                          sg.kind==='snippet' ?'#818cf8':
                          sg.kind==='function'?'#DCDCAA':
                          sg.kind==='method'  ?'#4EC9B0':
                          sg.kind==='keyword' ?'#C586C0':'#555'}}>
                          {sg.kind==='snippet'?'⬡':sg.kind==='function'?'ƒ':sg.kind==='method'?'ᵐ':sg.kind==='keyword'?'K':'·'}
                        </span>
                        <span style={s.sugLabel}>{sg.label}</span>
                        <span style={s.sugKind2}>{sg.kind}</span>
                      </div>
                    ))}
                    <div style={s.sugFooter}>Tab/Enter accept · Esc dismiss · ↑↓ navigate</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DRAG DIVIDER */}
          <div onMouseDown={onDividerDown} style={s.divider}>
            <div style={s.divLine}/><Grip/><div style={s.divLine}/>
          </div>

          {/* TERMINAL */}
          <div style={{...s.pane, flex:1, minHeight:0}}>
            <div style={s.paneBar}>
              <Dots/>
              <span style={s.paneTitle}>Terminal {statusBadge()}</span>
              <div style={s.paneRight}>
                {runMs!==null && status!=='running' && (
                  <span style={s.timeLabel}>{runMs<1000?`${runMs}ms`:`${(runMs/1000).toFixed(2)}s`}</span>
                )}
                {(termLines.length > 0 || htmlOut) && (
                  <button onClick={clearTerm} style={s.clearBtn}>Clear</button>
                )}
              </div>
            </div>

            <div ref={termRef} style={s.termBody}>
              {status==='html' && htmlOut ? (
                <iframe srcDoc={htmlOut} title="Preview" sandbox="allow-scripts"
                  style={{width:'100%',height:'100%',border:'none',background:'#fff'}}/>
              ) : (
                <div style={s.termInner}>
                  {termLines.length === 0 && !inputMode ? (
                    <div style={s.termEmpty}>
                      <span style={s.termPrompt}>$</span>
                      <span style={s.termHint}>&nbsp;Press <Kbd>▶ Run</Kbd> or <Kbd>Ctrl+Enter</Kbd> to execute</span>
                    </div>
                  ) : (
                    <>
                      {termLines.map((line, i) => (
                        <div key={i} style={{display:'flex', lineHeight:'20px'}}>
                          {line.kind==='input_prompt' && (
                            <span style={{color:'#D4D4D4',fontFamily:'JetBrains Mono,monospace',fontSize:13,whiteSpace:'pre-wrap'}}>{line.text}</span>
                          )}
                          {line.kind==='input_value' && (
                            <span style={{color:'#FEBC2E',fontFamily:'JetBrains Mono,monospace',fontSize:13,whiteSpace:'pre-wrap'}}>{line.text}</span>
                          )}
                          {line.kind==='output' && (
                            <span style={{color:'#4EC9B0',fontFamily:'JetBrains Mono,monospace',fontSize:13,whiteSpace:'pre-wrap'}}>{line.text}</span>
                          )}
                          {line.kind==='error' && (
                            <span style={{color:'#F87171',fontFamily:'JetBrains Mono,monospace',fontSize:13,whiteSpace:'pre-wrap'}}>{line.text}</span>
                          )}
                        </div>
                      ))}

                      {/* Inline input row — appears when Python calls input() */}
                      {inputMode && (
                        <div style={s.inputRow}>
                          <span style={s.termPrompt2}>▶</span>
                          <input
                            ref={inputRef}
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onKeyDown={e => { if (e.key==='Enter') submitInput(); }}
                            style={s.termInputField}
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                            placeholder="Type and press Enter…"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI PANEL */}
        {aiOpen && (
          <div style={s.aiPanel} className="anim-fade-in">
            <div style={s.aiHead}>
              <div>
                <div style={s.aiTitle}>🤖 AI Analysis</div>
                <div style={s.aiSub}>{lang?.icon} {lang?.label} · {lines} lines</div>
              </div>
              <button onClick={()=>setAiOpen(false)} style={s.aiClose}>✕</button>
            </div>

            {!aiLoading && aiResult && !aiResult.empty && (
              <div style={s.aiTabRow}>
                {['explain','better'].map(t=>(
                  <button key={t} onClick={()=>setAiTab(t)}
                    style={{...s.aiTabBtn,...(aiTab===t?s.aiTabOn:{})}}>
                    {t==='explain'?'📖 Explain':'✨ Better Code'}
                  </button>
                ))}
              </div>
            )}

            {aiLoading ? (
              <div style={s.aiSpinBox}><Spin large/><p style={{color:'#555',fontSize:13,marginTop:10}}>Analysing your code…</p></div>
            ) : aiResult?.empty ? (
              <div style={s.aiSpinBox}><p style={{color:'#555',fontSize:14,textAlign:'center'}}>{aiResult.message}</p></div>
            ) : aiResult && (
              <div style={s.aiBody}>
                {aiTab==='explain' ? (
                  <>
                    {aiResult.tokens.length > 0 && (
                      <AISec label="🎨 Syntax Detected">
                        {aiResult.tokens.map((t,i)=>(
                          <div key={i} style={{...s.synCard,borderLeftColor:t.color}}>
                            <code style={{...s.synTok,color:t.color}}>{t.token}</code>
                            <p style={s.synDesc}>{t.desc}</p>
                          </div>
                        ))}
                      </AISec>
                    )}
                    <AISec label="🧠 What This Code Does">
                      <p style={s.aiPara}>{aiResult.logic}</p>
                    </AISec>
                    <AISec label="✅ Strengths">
                      <Blist items={aiResult.pros} color="#4EC9B0" txtColor="#86efac"/>
                    </AISec>
                    <AISec label="⚠️ Weaknesses">
                      <Blist items={aiResult.cons} color="#F87171" txtColor="#fca5a5"/>
                    </AISec>
                    <AISec label="💡 Suggestions">
                      <p style={s.aiPara}>{aiResult.improvements}</p>
                    </AISec>
                  </>
                ) : (
                  <AISec label="✨ Improved Version">
                    <p style={{...s.aiPara,marginBottom:8}}>A better version — click "Use This Code" to load it:</p>
                    <div style={s.betterWrap}>
                      <div style={s.betterBar}>
                        <span style={{fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>main.{lang?.ext}</span>
                        <button onClick={()=>{setCodes(prev=>({...prev,[activeLang]:BETTER_CODE[activeLang]?.trim()||''}));setAiOpen(false);}} style={s.useBtn}>↗ Use This Code</button>
                      </div>
                      <pre style={s.betterPre}>{BETTER_CODE[activeLang]?.trim()}</pre>
                    </div>
                  </AISec>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini UI helpers ──────────────────────────────────────
const Bdg = ({bg,c,children}) => <span style={{fontSize:10,color:c,background:bg,padding:'2px 7px',borderRadius:10,marginLeft:6}}>{children}</span>;
const Dots = () => (
  <div style={{display:'flex',gap:5,flexShrink:0}}>
    {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><span key={i} style={{width:11,height:11,borderRadius:'50%',background:c,display:'inline-block'}}/>)}
  </div>
);
const Spin = ({large}) => (
  <span style={{width:large?18:12,height:large?18:12,borderRadius:'50%',border:`${large?3:2}px solid rgba(78,201,176,0.2)`,borderTopColor:'#4EC9B0',animation:'spin 0.9s linear infinite',display:'inline-block',flexShrink:0}}/>
);
const Kbd = ({children}) => <kbd style={{background:'#3c3c3c',border:'1px solid #555',borderRadius:4,padding:'1px 6px',fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#aaa'}}>{children}</kbd>;
const Grip = () => (
  <div style={{display:'flex',gap:3}}>
    {[0,1,2,3,4].map(i=><span key={i} style={{width:3,height:3,borderRadius:'50%',background:'#444',display:'inline-block'}}/>)}
  </div>
);
const AISec = ({label,children}) => (
  <div style={{display:'flex',flexDirection:'column',gap:7}}>
    <div style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:0.8}}>{label}</div>
    {children}
  </div>
);
const Blist = ({items,color,txtColor}) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {items.map((t,i)=>(
      <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
        <span style={{width:4,height:4,borderRadius:'50%',background:color,marginTop:7,flexShrink:0}}/>
        <span style={{fontSize:12,color:txtColor,lineHeight:1.65}}>{t}</span>
      </div>
    ))}
  </div>
);

// ─── Styles ───────────────────────────────────────────────
const s = {
  root:    { display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',background:'#1e1e1e',color:'#d4d4d4',fontFamily:'DM Sans,sans-serif' },
  bar:     { display:'flex',alignItems:'stretch',height:42,background:'#2d2d2d',borderBottom:'1px solid #191919',flexShrink:0 },
  tabs:    { display:'flex' },
  tab:     { display:'flex',alignItems:'center',gap:7,padding:'0 20px',height:42,fontSize:13,fontWeight:500,color:'#666',background:'transparent',border:'none',borderBottom:'2px solid transparent',cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap',fontFamily:'DM Sans,sans-serif',flexShrink:0 },
  tabIcon: { fontSize:14 },
  barRight:{ display:'flex',alignItems:'center',gap:8,padding:'0 12px',marginLeft:'auto' },
  kbHint:  { fontSize:11,color:'#333',fontFamily:'JetBrains Mono,monospace',whiteSpace:'nowrap' },
  aiBtnTop:{ display:'flex',alignItems:'center',gap:6,padding:'5px 12px',fontSize:12,fontWeight:600,background:'rgba(99,102,241,.14)',border:'1px solid rgba(99,102,241,.3)',color:'#818cf8',borderRadius:5,cursor:'pointer',fontFamily:'DM Sans,sans-serif' },
  runBtnTop:{ display:'flex',alignItems:'center',gap:6,padding:'5px 16px',fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',borderRadius:5,cursor:'pointer',fontFamily:'DM Sans,sans-serif',boxShadow:'0 2px 6px rgba(16,185,129,.3)' },

  main:    { display:'flex',flex:1,overflow:'hidden' },
  left:    { display:'flex',flexDirection:'column',flex:1,overflow:'hidden',minWidth:0 },

  pane:    { display:'flex',flexDirection:'column',overflow:'hidden',background:'#1e1e1e' },
  paneBar: { display:'flex',alignItems:'center',gap:10,padding:'6px 14px',background:'#252526',borderBottom:'1px solid #191919',flexShrink:0 },
  paneTitle:{ flex:1,textAlign:'center',fontSize:12,color:'#666',fontFamily:'JetBrains Mono,monospace',display:'flex',alignItems:'center',justifyContent:'center',gap:4 },
  paneRight:{ display:'flex',alignItems:'center',gap:8,flexShrink:0 },
  timeLabel:{ fontSize:11,color:'#3a3a3a',fontFamily:'JetBrains Mono,monospace' },
  clearBtn: { padding:'2px 9px',background:'#3c3c3c',border:'none',color:'#666',borderRadius:4,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif' },

  editorArea:{ display:'flex',flex:1,overflow:'hidden',position:'relative' },
  lineNums:  { display:'flex',flexDirection:'column',alignItems:'flex-end',padding:'14px 8px 14px 10px',background:'#1e1e1e',borderRight:'1px solid #252526',userSelect:'none',overflowY:'hidden',flexShrink:0,minWidth:42 },
  lineNum:   { fontSize:13,lineHeight:'23.4px',color:'#3a3a3a',fontFamily:'JetBrains Mono,monospace',minWidth:20,textAlign:'right' },
  editorInner:{ flex:1,position:'relative',overflow:'hidden' },
  overlay:   { position:'absolute',inset:0,overflow:'auto',padding:'14px 16px',zIndex:1,pointerEvents:'none' },
  overlayPre:{ margin:0,fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:'23.4px',whiteSpace:'pre',color:'transparent',minHeight:'100%' },
  textarea:  { position:'absolute',inset:0,width:'100%',height:'100%',background:'transparent',border:'none',outline:'none',color:'transparent',caretColor:'#d4d4d4',fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:'23.4px',padding:'14px 16px',resize:'none',zIndex:2,overflow:'auto',whiteSpace:'pre' },

  sugBox:    { position:'absolute',top:0,left:46,zIndex:200,background:'#252526',border:'1px solid #3c3c3c',borderRadius:6,boxShadow:'0 8px 32px rgba(0,0,0,.6)',minWidth:280,maxWidth:380,maxHeight:210,overflowY:'auto' },
  sugItem:   { display:'flex',alignItems:'center',gap:8,padding:'5px 10px',cursor:'pointer',fontSize:13,fontFamily:'JetBrains Mono,monospace',borderBottom:'1px solid #2d2d2d' },
  sugActive: { background:'#094771' },
  sugKind:   { fontSize:11,width:14,flexShrink:0,textAlign:'center',fontWeight:700 },
  sugLabel:  { flex:1,color:'#d4d4d4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' },
  sugKind2:  { fontSize:10,color:'#444' },
  sugFooter: { padding:'4px 10px',background:'#1e1e1e',fontSize:10,color:'#3a3a3a',fontFamily:'DM Sans,sans-serif',borderTop:'1px solid #2a2a2a' },

  divider:   { display:'flex',alignItems:'center',gap:8,padding:'3px 14px',background:'#252526',cursor:'row-resize',flexShrink:0,userSelect:'none',borderTop:'1px solid #191919',borderBottom:'1px solid #191919' },
  divLine:   { flex:1,height:1,background:'#2a2a2a' },

  termBody:  { flex:1,overflow:'auto',position:'relative',minHeight:0 },
  termInner: { padding:'10px 16px',minHeight:'100%',display:'flex',flexDirection:'column',gap:0 },
  termEmpty: { display:'flex',alignItems:'center',padding:'4px 0',opacity:0.5 },
  termPrompt:{ color:'#4EC9B0',fontFamily:'JetBrains Mono,monospace',fontSize:14,fontWeight:700 },
  termHint:  { color:'#333',fontSize:13 },
  inputRow:  { display:'flex',alignItems:'center',gap:8,marginTop:2 },
  termPrompt2:{ color:'#FEBC2E',fontFamily:'JetBrains Mono,monospace',fontSize:13,fontWeight:700,flexShrink:0 },
  termInputField:{ flex:1,background:'transparent',border:'none',outline:'none',color:'#FEBC2E',fontFamily:'JetBrains Mono,monospace',fontSize:13,lineHeight:'20px',padding:0,caretColor:'#FEBC2E' },

  aiPanel:  { width:360,borderLeft:'1px solid #191919',background:'#1e1e1e',display:'flex',flexDirection:'column',overflow:'hidden',flexShrink:0 },
  aiHead:   { display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid #252526',flexShrink:0 },
  aiTitle:  { fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:800,color:'#d4d4d4',marginBottom:2 },
  aiSub:    { fontSize:11,color:'#444',fontFamily:'JetBrains Mono,monospace' },
  aiClose:  { width:24,height:24,borderRadius:4,background:'#333',border:'none',color:'#666',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif',flexShrink:0 },
  aiTabRow: { display:'flex',borderBottom:'1px solid #252526',flexShrink:0 },
  aiTabBtn: { flex:1,padding:'8px 0',fontSize:12,fontWeight:600,color:'#555',background:'transparent',border:'none',borderBottom:'2px solid transparent',cursor:'pointer',fontFamily:'DM Sans,sans-serif' },
  aiTabOn:  { color:'#818cf8',borderBottomColor:'#6366f1',background:'rgba(99,102,241,.06)' },
  aiSpinBox:{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:'32px 18px' },
  aiBody:   { flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:16 },
  aiPara:   { fontSize:12,color:'#858585',lineHeight:1.75,background:'#252526',padding:'10px 12px',borderRadius:6,margin:0 },
  synCard:  { padding:'9px 11px',background:'#252526',borderRadius:6,borderLeft:'3px solid',display:'flex',flexDirection:'column',gap:4 },
  synTok:   { fontFamily:'JetBrains Mono,monospace',fontSize:11,fontWeight:600 },
  synDesc:  { fontSize:12,color:'#858585',lineHeight:1.6,margin:0 },
  betterWrap:{ background:'#141414',borderRadius:6,overflow:'hidden',border:'1px solid #2d2d2d' },
  betterBar:{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',background:'#252526',borderBottom:'1px solid #1a1a1a' },
  useBtn:   { padding:'4px 12px',background:'rgba(99,102,241,.2)',border:'1px solid rgba(99,102,241,.4)',color:'#818cf8',borderRadius:5,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif' },
  betterPre:{ margin:0,padding:'12px',fontFamily:'JetBrains Mono,monospace',fontSize:11.5,lineHeight:1.75,color:'#a5b4fc',overflowX:'auto',whiteSpace:'pre' },
};
