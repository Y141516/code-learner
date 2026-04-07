import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import {
  executeCode, needsStdin,
  isPyodideReady, isPyodideLoading,
} from '../utils/executor';

// ─── Language configs ────────────────────────────────────
const LANGS = [
  { id:'python',     label:'Python',     icon:'🐍', color:'#4EC9B0', ext:'py'   },
  { id:'javascript', label:'JavaScript', icon:'⚡', color:'#DCDCAA', ext:'js'   },
  { id:'java',       label:'Java',       icon:'☕', color:'#F0A868', ext:'java' },
  { id:'html',       label:'HTML & CSS', icon:'🎨', color:'#E5A550', ext:'html' },
];

// ─── Default starter code per language ──────────────────
const DEFAULT_CODE = {
  python: '',
  javascript: '',
  java: '',
  html: '',
};

// ─── Keywords for syntax highlighting ───────────────────
const KW = {
  python: new Set([
    'False','None','True','and','as','assert','async','await','break','class',
    'continue','def','del','elif','else','except','finally','for','from',
    'global','if','import','in','is','lambda','nonlocal','not','or','pass',
    'raise','return','try','while','with','yield',
  ]),
  javascript: new Set([
    'async','await','break','case','catch','class','const','continue',
    'debugger','default','delete','do','else','export','extends','finally',
    'for','function','if','import','in','instanceof','let','new','of',
    'return','static','super','switch','this','throw','try','typeof',
    'var','void','while','with','yield','from',
  ]),
  java: new Set([
    'abstract','assert','boolean','break','byte','case','catch','char','class',
    'continue','default','do','double','else','enum','extends','final',
    'finally','float','for','if','implements','import','instanceof','int',
    'interface','long','native','new','package','private','protected',
    'public','return','short','static','super','switch','synchronized',
    'this','throw','throws','transient','try','void','volatile','while',
  ]),
  html: new Set([]),
};

const BUILTIN_PY = new Set([
  'print','input','range','len','str','int','float','list','dict','set',
  'tuple','type','bool','sum','min','max','abs','round','sorted','reversed',
  'enumerate','zip','map','filter','open','super','self','hasattr','getattr',
  'setattr','isinstance','issubclass','repr','vars','dir','id','hash',
]);

// ─── Autocomplete suggestions ────────────────────────────
const COMPLETIONS = {
  python: [
    // Snippets
    { label:'def function():',       kind:'snippet', detail:'function definition',
      insert:'def ${1:name}(${2:args}):\n    ${3:pass}' },
    { label:'class MyClass:',        kind:'snippet', detail:'class definition',
      insert:'class ${1:Name}:\n    def __init__(self):\n        ${2:pass}' },
    { label:'for i in range():',     kind:'snippet', detail:'for loop',
      insert:'for ${1:i} in range(${2:10}):\n    ${3:pass}' },
    { label:'for item in list:',     kind:'snippet', detail:'for-each',
      insert:'for ${1:item} in ${2:collection}:\n    ${3:pass}' },
    { label:'if condition:',         kind:'snippet', detail:'if statement',
      insert:'if ${1:condition}:\n    ${2:pass}' },
    { label:'if/else',              kind:'snippet', detail:'if-else',
      insert:'if ${1:condition}:\n    ${2:pass}\nelse:\n    ${3:pass}' },
    { label:'while loop',           kind:'snippet', detail:'while loop',
      insert:'while ${1:condition}:\n    ${2:pass}' },
    { label:'try/except',           kind:'snippet', detail:'exception handling',
      insert:'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    print(e)' },
    { label:'import module',        kind:'snippet', detail:'import',
      insert:'import ${1:module}' },
    { label:'from x import y',      kind:'snippet', detail:'from import',
      insert:'from ${1:module} import ${2:name}' },
    { label:'with open()',          kind:'snippet', detail:'file open',
      insert:'with open("${1:file.txt}", "${2:r}") as f:\n    ${3:content = f.read()}' },
    { label:'list comprehension',   kind:'snippet', detail:'[x for x in y]',
      insert:'[${1:x} for ${1:x} in ${2:iterable}]' },
    { label:'lambda',               kind:'snippet', detail:'lambda function',
      insert:'lambda ${1:x}: ${2:x}' },
    { label:'print()',              kind:'function', detail:'builtin',    insert:'print(${1})' },
    { label:'input()',              kind:'function', detail:'builtin',    insert:'input("${1:prompt}: ")' },
    { label:'range()',              kind:'function', detail:'builtin',    insert:'range(${1:10})' },
    { label:'len()',                kind:'function', detail:'builtin',    insert:'len(${1})' },
    { label:'enumerate()',          kind:'function', detail:'builtin',    insert:'enumerate(${1:iterable})' },
    { label:'zip()',                kind:'function', detail:'builtin',    insert:'zip(${1:a}, ${2:b})' },
    // keywords
    ...['False','None','True','and','as','assert','async','await','break',
        'class','continue','def','del','elif','else','except','finally',
        'for','from','global','if','import','in','is','lambda','nonlocal',
        'not','or','pass','raise','return','try','while','with','yield',
    ].map(k => ({ label:k, kind:'keyword', detail:'keyword', insert:k })),
  ],
  javascript: [
    { label:'const name = value',   kind:'snippet', detail:'constant',
      insert:'const ${1:name} = ${2:value};' },
    { label:'let name = value',     kind:'snippet', detail:'variable',
      insert:'let ${1:name} = ${2:value};' },
    { label:'function name() {}',   kind:'snippet', detail:'function',
      insert:'function ${1:name}(${2:params}) {\n    ${3}\n}' },
    { label:'arrow function',       kind:'snippet', detail:'() => {}',
      insert:'const ${1:name} = (${2:params}) => {\n    ${3}\n};' },
    { label:'async function',       kind:'snippet', detail:'async/await',
      insert:'async function ${1:name}(${2:params}) {\n    ${3}\n}' },
    { label:'if/else',              kind:'snippet', detail:'conditional',
      insert:'if (${1:condition}) {\n    ${2}\n} else {\n    ${3}\n}' },
    { label:'for loop',             kind:'snippet', detail:'classic for',
      insert:'for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}' },
    { label:'for...of',             kind:'snippet', detail:'iterate array',
      insert:'for (const ${1:item} of ${2:array}) {\n    ${3}\n}' },
    { label:'try/catch',            kind:'snippet', detail:'error handling',
      insert:'try {\n    ${1}\n} catch (${2:err}) {\n    console.error(${2:err});\n}' },
    { label:'class',                kind:'snippet', detail:'ES6 class',
      insert:'class ${1:Name} {\n    constructor(${2:params}) {\n        ${3}\n    }\n}' },
    { label:'console.log()',        kind:'function', detail:'log output', insert:'console.log(${1});' },
    { label:'fetch()',              kind:'function', detail:'HTTP request', insert:'fetch("${1:url}").then(r => r.json()).then(d => console.log(d));' },
    { label:'Promise.all()',        kind:'function', detail:'parallel async', insert:'await Promise.all([${1}]);' },
    { label:'Array.from()',         kind:'function', detail:'create array', insert:'Array.from({length: ${1:n}}, (_, i) => ${2:i});' },
    { label:'.map()',               kind:'method',   detail:'transform array', insert:'.map(${1:item} => ${2:item})' },
    { label:'.filter()',            kind:'method',   detail:'filter array', insert:'.filter(${1:item} => ${2:condition})' },
    { label:'.reduce()',            kind:'method',   detail:'reduce array', insert:'.reduce((${1:acc}, ${2:cur}) => ${3:acc + cur}, ${4:0})' },
    { label:'.find()',              kind:'method',   detail:'find first match', insert:'.find(${1:item} => ${2:condition})' },
    ...['async','await','break','case','catch','class','const','continue',
        'delete','do','else','export','extends','finally','for','function',
        'if','import','in','instanceof','let','new','of','return','static',
        'super','switch','this','throw','try','typeof','var','void','while',
    ].map(k => ({ label:k, kind:'keyword', detail:'keyword', insert:k })),
  ],
  java: [
    { label:'public class Main',    kind:'snippet', detail:'main class',
      insert:'public class Main {\n    public static void main(String[] args) {\n        ${1}\n    }\n}' },
    { label:'System.out.println()', kind:'snippet', detail:'print line',
      insert:'System.out.println(${1});' },
    { label:'System.out.printf()',  kind:'snippet', detail:'formatted print',
      insert:'System.out.printf("${1:%s}%n", ${2:value});' },
    { label:'for loop',             kind:'snippet', detail:'classic for',
      insert:'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}' },
    { label:'enhanced for',         kind:'snippet', detail:'for-each',
      insert:'for (${1:String} ${2:item} : ${3:collection}) {\n    ${4}\n}' },
    { label:'if/else',              kind:'snippet', detail:'conditional',
      insert:'if (${1:condition}) {\n    ${2}\n} else {\n    ${3}\n}' },
    { label:'try/catch',            kind:'snippet', detail:'exception',
      insert:'try {\n    ${1}\n} catch (Exception ${2:e}) {\n    System.out.println(${2:e}.getMessage());\n}' },
    { label:'Scanner',              kind:'snippet', detail:'read input',
      insert:'Scanner scanner = new Scanner(System.in);\nString ${1:input} = scanner.nextLine();' },
    { label:'ArrayList',            kind:'snippet', detail:'dynamic list',
      insert:'ArrayList<${1:String}> ${2:list} = new ArrayList<>();' },
    { label:'HashMap',              kind:'snippet', detail:'key-value map',
      insert:'HashMap<${1:String}, ${2:Integer}> ${3:map} = new HashMap<>();' },
    ...['abstract','boolean','break','byte','case','catch','char','class',
        'continue','default','do','double','else','enum','extends','final',
        'finally','float','for','if','implements','import','instanceof','int',
        'interface','long','new','private','protected','public','return',
        'short','static','super','switch','this','throw','throws','try',
        'void','while',
    ].map(k => ({ label:k, kind:'keyword', detail:'keyword', insert:k })),
  ],
  html: [
    { label:'HTML5 boilerplate',    kind:'snippet', detail:'full page',
      insert:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Title}</title>\n  <style>\n    ${2}\n  </style>\n</head>\n<body>\n  ${3}\n  <script>\n    ${4}\n  </script>\n</body>\n</html>' },
    { label:'<div class="">',       kind:'snippet', detail:'div element',   insert:'<div class="${1}">\n  ${2}\n</div>' },
    { label:'<p>',                  kind:'snippet', detail:'paragraph',     insert:'<p>${1}</p>' },
    { label:'<a href="">',          kind:'snippet', detail:'anchor link',   insert:'<a href="${1:#}">${2:link text}</a>' },
    { label:'<img src="">',         kind:'snippet', detail:'image',         insert:'<img src="${1}" alt="${2}" />' },
    { label:'<input type="">',      kind:'snippet', detail:'input field',   insert:'<input type="${1:text}" placeholder="${2}" />' },
    { label:'<button>',             kind:'snippet', detail:'button',        insert:'<button onclick="${1}">${2:Click me}</button>' },
    { label:'<ul><li>',            kind:'snippet', detail:'unordered list', insert:'<ul>\n  <li>${1}</li>\n  <li>${2}</li>\n</ul>' },
    { label:'<style>',             kind:'snippet', detail:'CSS block',      insert:'<style>\n  ${1}\n</style>' },
    { label:'<script>',            kind:'snippet', detail:'JS block',       insert:'<script>\n  ${1}\n</script>' },
    { label:'flexbox container',   kind:'snippet', detail:'CSS flex',
      insert:'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};' },
    { label:'grid container',      kind:'snippet', detail:'CSS grid',
      insert:'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:16px};' },
  ],
};

// ─── AI explanations ─────────────────────────────────────
const AI_DATA = {
  python: {
    syntax:[
      {token:'def func(args):',  color:'#DCDCAA', desc:'Defines a reusable function. Python uses indentation (4 spaces) for blocks, not curly braces. The function body runs only when called.'},
      {token:'f"Hello {var}"',   color:'#CE9178', desc:'f-string (Python 3.6+) — embed any expression inside {}. Faster and cleaner than .format() or + concatenation.'},
      {token:'import module',    color:'#C586C0', desc:'Imports a Python module. Standard library (random, math, os, json) needs no install. Third-party packages need pip install first.'},
      {token:'[x for x in ...]', color:'#4EC9B0', desc:'List comprehension — builds a list in one line. Equivalent to a for loop with .append() but faster and more idiomatic.'},
    ],
    logic:'Python executes top-to-bottom. Variables are created on assignment — no type declaration needed. Functions are defined with def and called by name. Indentation defines code blocks.',
    pros:['Clean, readable syntax — almost reads like English','No type declarations — dynamic typing speeds up prototyping','Vast standard library — import and go','Indentation enforces consistently clean code'],
    cons:['Dynamic typing can hide bugs until runtime','Slower than compiled languages for heavy computation','GIL limits true multi-threading for CPU-bound tasks','No built-in type safety without mypy/type hints'],
    improvements:'Add type hints: def greet(name: str) -> str. Use if __name__ == "__main__": guard. Consider dataclasses for structured data. Use pathlib instead of os.path for file operations.',
    betterCode:`# Improved Python — type hints, docstrings, best practices
from typing import List, Optional
import sys

def greet(name: str) -> str:
    """Return a personalised greeting."""
    if not name.strip():
        raise ValueError("Name cannot be empty")
    return f"Hello, {name.strip().title()}!"

def compute_stats(numbers: List[float]) -> Optional[dict]:
    """Compute basic statistics for a list of numbers."""
    if not numbers:
        return None
    return {
        "count":   len(numbers),
        "sum":     sum(numbers),
        "average": round(sum(numbers) / len(numbers), 2),
        "min":     min(numbers),
        "max":     max(numbers),
    }

if __name__ == "__main__":
    print(greet("world"))
    stats = compute_stats([1, 2, 3, 4, 5])
    if stats:
        for key, val in stats.items():
            print(f"  {key}: {val}")
`,
  },
  javascript: {
    syntax:[
      {token:'const / let',        color:'#9CDCFE', desc:'const = immutable binding (prefer by default). let = rebindable. Both are block-scoped unlike var. Never use var — it\'s function-scoped and causes hoisting bugs.'},
      {token:'async / await',      color:'#C586C0', desc:'async functions return a Promise. await pauses execution inside async functions without blocking the thread — the foundation of modern JS I/O.'},
      {token:'.map/.filter/.reduce',color:'#4EC9B0', desc:'Functional array methods that return new arrays, leaving originals unchanged. Chain them to build clean data transformation pipelines.'},
      {token:'=> arrow function',   color:'#DCDCAA', desc:'Concise function syntax without its own this binding. Single-expression bodies have implicit return: const double = n => n * 2.'},
    ],
    logic:'JavaScript is single-threaded with an event loop. Synchronous code runs line by line. Async operations (fetch, timers) are scheduled and run when the call stack is clear. async/await makes this readable.',
    pros:['Runs natively in every browser — zero install','async/await makes async code readable','Huge ecosystem — npm has packages for everything','Destructuring, spread, and optional chaining are powerful'],
    cons:['No static typing without TypeScript','null/undefined both exist — source of bugs','== vs === confusion for newcomers','Callback-based APIs still common in older code'],
    improvements:'Use TypeScript for large projects. Add optional chaining: user?.name ?? "Guest". Always add .catch() or try/catch to async functions. Prefer Array methods over for loops for readability.',
    betterCode:`// Improved JavaScript — modern patterns, error handling
const fetchUser = async (id) => {
  try {
    const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return await res.json();
  } catch (err) {
    console.error(\`Failed to fetch user \${id}:\`, err.message);
    return null;
  }
};

const processNumbers = (nums) => {
  if (!Array.isArray(nums) || nums.length === 0) return null;
  return {
    count:   nums.length,
    sum:     nums.reduce((a, b) => a + b, 0),
    average: +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2),
    min:     Math.min(...nums),
    max:     Math.max(...nums),
    evens:   nums.filter(n => n % 2 === 0),
    squared: nums.map(n => n ** 2),
  };
};

const stats = processNumbers([1, 2, 3, 4, 5]);
console.log(JSON.stringify(stats, null, 2));
`,
  },
  java: {
    syntax:[
      {token:'public class Main',   color:'#4EC9B0', desc:'Java requires all code inside a class. public = accessible anywhere. The class name MUST match the filename exactly. Main class contains the entry point.'},
      {token:'static void main()', color:'#DCDCAA', desc:'JVM entry point — must be exactly public static void main(String[] args). static = called without creating an object first.'},
      {token:'System.out.println', color:'#C586C0', desc:'Prints to standard output. println adds a newline. print does not. printf("format", args) for C-style formatting.'},
      {token:'ArrayList / Stream',  color:'#CE9178', desc:'ArrayList is a dynamic resizable array. Streams (Java 8+) enable functional-style data processing: filter, map, collect.'},
    ],
    logic:'Java is statically typed — every variable must declare its type. All code lives inside classes. The JVM compiles to bytecode at build time, catching type errors before runtime.',
    pros:['Static typing — bugs caught at compile time','Excellent tooling (IntelliJ, Eclipse)','Rich standard library (java.util, java.io, java.net)','Platform-independent — "write once, run anywhere"'],
    cons:['Verbose compared to Python/JS','Slow startup time for small scripts','Checked exceptions can be cumbersome','No first-class functions (use lambdas/FunctionalInterface)'],
    improvements:'Use Java Streams for collection processing. Prefer ArrayList<> over arrays. Use String.format() or printf. Add specific exception types instead of catching Exception. Use var for local type inference (Java 10+).',
    betterCode:`import java.util.*;
import java.util.stream.*;

public class Main {
    // Record — clean data class (Java 16+)
    record Person(String name, int age) {}

    public static void main(String[] args) {
        var people = List.of(
            new Person("Alice", 25),
            new Person("Bob", 17),
            new Person("Carol", 32)
        );

        // Stream API — functional style
        System.out.println("Adults:");
        people.stream()
            .filter(p -> p.age() >= 18)
            .sorted(Comparator.comparing(Person::name))
            .forEach(p -> System.out.printf("  %s (age %d)%n", p.name(), p.age()));

        var stats = people.stream()
            .mapToInt(Person::age)
            .summaryStatistics();
        System.out.printf("Average age: %.1f%n", stats.getAverage());
    }
}
`,
  },
  html: {
    syntax:[
      {token:'box-sizing: border-box', color:'#CE9178', desc:'Makes width include padding and border — elements stay the declared size. Apply globally: * { box-sizing: border-box } as a reset.'},
      {token:'display: flex / grid',   color:'#4EC9B0', desc:'Flexbox = 1D layout (row or column). CSS Grid = 2D layout (rows AND columns). Use flex for components, grid for page layouts.'},
      {token:'CSS custom properties',  color:'#C586C0', desc:':root { --primary: #6366f1 } defines a global variable. Use with var(--primary). Change once and it updates everywhere — essential for theming.'},
      {token:'addEventListener()',     color:'#DCDCAA', desc:'Modern event handling — separates JS from HTML. Attach multiple listeners, remove them easily. Always prefer over inline onclick="".'},
    ],
    logic:'HTML defines structure, CSS controls appearance, JS adds behaviour. The browser parses HTML into a DOM tree, applies CSS (specificity determines winner), then executes JS which can modify both.',
    pros:['Works in every browser — no install or compilation','CSS is extremely powerful for layout and animation','Fast iteration — just refresh to see changes','Semantic HTML improves SEO and accessibility'],
    cons:['No scoped styles without CSS Modules or Shadow DOM','Inline handlers mix structure and behaviour','CSS specificity conflicts are hard to debug','No built-in state management'],
    improvements:'Use CSS custom properties for all colours. Replace onclick with addEventListener. Add ARIA attributes (aria-label, role) for accessibility. Use <button> not <div> for clickable elements.',
    betterCode:`<!DOCTYPE html>
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
    h1 { color: var(--primary); font-size: 1.5rem; margin-bottom: 16px; }
    .count { font-size: 4rem; font-weight: 800; color: var(--primary); margin: 16px 0; }
    .actions { display: flex; gap: 10px; justify-content: center; }
    button { background: var(--primary); color: #fff; border: none; padding: 10px 22px; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.85; }
    button.secondary { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Counter</h1>
    <div class="count" id="count" aria-live="polite">0</div>
    <div class="actions">
      <button id="inc">+ Increment</button>
      <button id="reset" class="secondary">Reset</button>
    </div>
  </div>
  <script>
    let n = 0;
    const el = document.getElementById('count');
    document.getElementById('inc').addEventListener('click', () => el.textContent = ++n);
    document.getElementById('reset').addEventListener('click', () => { n = 0; el.textContent = 0; });
  </script>
</body>
</html>
`,
  },
};

// ─── Tokenizer for syntax highlight ─────────────────────
function tokenize(code, langId) {
  const tokens = [];
  let i = 0;
  const kw = KW[langId] || new Set();

  while (i < code.length) {
    // Single-line comments
    if ((langId !== 'html') && code[i] === '/' && code[i+1] === '/') {
      let s = ''; while (i < code.length && code[i] !== '\n') s += code[i++];
      tokens.push({ type:'comment', val:s }); continue;
    }
    if (langId === 'python' && code[i] === '#') {
      let s = ''; while (i < code.length && code[i] !== '\n') s += code[i++];
      tokens.push({ type:'comment', val:s }); continue;
    }
    // HTML comment
    if (langId === 'html' && code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i); const s = end<0?code.slice(i):code.slice(i,end+3);
      tokens.push({ type:'comment', val:s }); i+=s.length; continue;
    }
    // Block comment
    if (code[i]==='/' && code[i+1]==='*') {
      const end = code.indexOf('*/',i+2); const s=end<0?code.slice(i):code.slice(i,end+2);
      tokens.push({ type:'comment', val:s }); i+=s.length; continue;
    }
    // Template literal
    if (code[i]==='`') {
      let s='`'; i++;
      while (i<code.length && code[i]!=='`') {
        if (code[i]==='\\'){s+=code[i]+(code[i+1]||'');i+=2;continue;}
        s+=code[i++];
      }
      s+=(code[i]==='`'?code[i++]:'');
      tokens.push({type:'string',val:s}); continue;
    }
    // Strings
    if (code[i]==='"'||code[i]==="'") {
      const q=code[i]; let s=q; i++;
      while (i<code.length && code[i]!==q && code[i]!=='\n') {
        if(code[i]==='\\'){s+=code[i]+(code[i+1]||'');i+=2;continue;}
        s+=code[i++];
      }
      s+=(code[i]===q?code[i++]:'');
      tokens.push({type:'string',val:s}); continue;
    }
    // Numbers
    if (/\d/.test(code[i]) && (i===0||/\W/.test(code[i-1]))) {
      let s=''; while(i<code.length && /[\d._xXa-fA-F]/.test(code[i])) s+=code[i++];
      tokens.push({type:'number',val:s}); continue;
    }
    // HTML tags
    if (langId==='html' && code[i]==='<') {
      let s='<'; i++;
      while(i<code.length && code[i]!=='>') s+=code[i++];
      s+=code[i]==='>'?code[i++]:'';
      tokens.push({type:'tag',val:s}); continue;
    }
    // Words
    if (/[a-zA-Z_$]/.test(code[i])) {
      let s=''; while(i<code.length && /[\w$]/.test(code[i])) s+=code[i++];
      if (kw.has(s))                tokens.push({type:'keyword',val:s});
      else if (BUILTIN_PY.has(s) && langId==='python') tokens.push({type:'builtin',val:s});
      else if (code[i]==='(')       tokens.push({type:'function',val:s});
      else                          tokens.push({type:'ident',val:s});
      continue;
    }
    // Operators / punctuation
    if (/[=!<>+\-*/%&|^~?:;,.]/.test(code[i])) {
      tokens.push({type:'op',val:code[i++]}); continue;
    }
    tokens.push({type:'other',val:code[i++]});
  }
  return tokens;
}

const TC = {
  keyword:'#C586C0', builtin:'#4EC9B0', string:'#CE9178', comment:'#6A9955',
  number:'#B5CEA8',  function:'#DCDCAA', tag:'#4EC9B0', op:'#D4D4D4',
  ident:'#9CDCFE',   other:'#D4D4D4',
};

function SyntaxHighlight({ code, langId }) {
  const tokens = useMemo(() => tokenize(code || '', langId), [code, langId]);
  return (
    <>{tokens.map((t, i) => (
      <span key={i} style={{ color: TC[t.type] || '#D4D4D4' }}>{t.val}</span>
    ))}</>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function CodeExperimentTab() {
  // Per-tab code storage
  const [codes, setCodes] = useState({
    python:'', javascript:'', java:'', html:'',
  });
  const [activeLang, setActiveLang] = useState('python');

  // Execution state
  const [status,   setStatus]   = useState('idle'); // idle|loading_py|running|done|error|html
  const [output,   setOutput]   = useState('');
  const [htmlOut,  setHtmlOut]  = useState('');
  const [runMs,    setRunMs]    = useState(null);
  const [pyReady,  setPyReady]  = useState(false);
  const [pyLoading,setPyLoading]= useState(false);

  // Editor state
  const [splitPct, setSplitPct]  = useState(55); // % height for editor
  const [stdinVal, setStdinVal]  = useState('');

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [sugIdx,      setSugIdx]      = useState(0);
  const [sugVisible,  setSugVisible]  = useState(false);
  const [cursorPos,   setCursorPos]   = useState({ top:0, left:0 });

  // AI
  const [aiOpen,    setAiOpen]    = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData,    setAiData]    = useState(null);
  const [aiTab,     setAiTab]     = useState('explain');

  const editorRef   = useRef(null);
  const overlayRef  = useRef(null);
  const termRef     = useRef(null);
  const dragRef     = useRef(null);
  const dragging    = useRef(false);
  const containerRef= useRef(null);

  const code = codes[activeLang] || '';
  const lang = LANGS.find(l => l.id === activeLang);
  const showStdin = needsStdin(activeLang, code);

  // Poll pyodide readiness
  useEffect(() => {
    const id = setInterval(() => {
      const r = isPyodideReady();
      const l = isPyodideLoading();
      setPyReady(r);
      setPyLoading(l && !r);
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Sync overlay scroll with textarea
  const syncScroll = useCallback(() => {
    if (overlayRef.current && editorRef.current) {
      overlayRef.current.scrollTop  = editorRef.current.scrollTop;
      overlayRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  }, []);

  // Scroll terminal to bottom
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [output]);

  // ── Run code ────────────────────────────────────────────
  const run = useCallback(async () => {
    if (status === 'running' || status === 'loading_py') return;

    if (activeLang === 'html') {
      setHtmlOut(code); setOutput(''); setStatus('html'); setRunMs(0); return;
    }

    if (activeLang === 'python' && !isPyodideReady()) {
      setStatus('loading_py');
      setOutput('');
    } else {
      setStatus('running');
      setOutput('');
    }

    setHtmlOut(''); setRunMs(null);
    const t0 = Date.now();

    try {
      const result = await executeCode(activeLang, code, stdinVal);
      const elapsed = Date.now() - t0;
      setRunMs(elapsed);

      if (result.html !== undefined) {
        setHtmlOut(result.html); setOutput(''); setStatus('html'); return;
      }

      const { stdout='', stderr='', exitCode=0 } = result;
      const combined = [stdout, stderr ? (stdout?'\n':'')+stderr : ''].join('').trim();
      setOutput(combined || '(program exited with no output)');
      setStatus(stderr || exitCode !== 0 ? 'error' : 'done');
    } catch (err) {
      setRunMs(Date.now() - t0);
      setOutput(`❌ ${err.message}`);
      setStatus('error');
    }
  }, [activeLang, code, stdinVal, status]);

  // ── Code change + autocomplete ──────────────────────────
  const onCodeChange = (e) => {
    const val  = e.target.value;
    const lang = activeLang;
    setCodes(prev => ({ ...prev, [lang]: val }));

    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const lineStart = before.lastIndexOf('\n') + 1;
    const currentLine = before.slice(lineStart);
    const wordMatch = before.match(/[\w.]+$/);
    const word = wordMatch ? wordMatch[0].toLowerCase() : '';

    if (word.length >= 1) {
      const all = COMPLETIONS[lang] || [];
      const matches = all
        .filter(c => c.label.toLowerCase().startsWith(word) && c.label.toLowerCase() !== word)
        .slice(0, 10);

      if (matches.length > 0) {
        setSuggestions(matches);
        setSugIdx(0);
        setSugVisible(true);

        // Calculate cursor pixel position
        const ta = e.target;
        const lineNum = (before.match(/\n/g)||[]).length;
        const colNum  = before.length - before.lastIndexOf('\n') - 1;
        setCursorPos({
          top:  (lineNum + 1) * 18.5, // line-height
          left: Math.min(colNum * 7.8, 400), // monospace char width approx
        });
      } else {
        setSugVisible(false);
      }
    } else {
      setSugVisible(false);
    }
  };

  // Apply a completion
  const applyCompletion = useCallback((comp) => {
    const ta  = editorRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const val = codes[activeLang] || '';
    const before = val.slice(0, pos);
    const wordMatch = before.match(/[\w.]+$/);
    const start = wordMatch ? pos - wordMatch[0].length : pos;
    // Strip ${n:placeholder} syntax from insert
    const insertText = comp.insert.replace(/\$\{\d+:?([^}]*)\}/g, '$1').replace(/\$\d+/g,'');
    const newVal = val.slice(0, start) + insertText + val.slice(pos);
    setCodes(prev => ({ ...prev, [activeLang]: newVal }));
    setSugVisible(false);
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = start + insertText.length;
      ta.selectionStart = ta.selectionEnd = newPos;
    });
  }, [codes, activeLang]);

  // ── Keyboard handler ─────────────────────────────────────
  const onKeyDown = (e) => {
    // Suggestion navigation
    if (sugVisible && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSugIdx(i=>(i+1)%suggestions.length); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSugIdx(i=>(i-1+suggestions.length)%suggestions.length); return; }
      if (e.key === 'Tab' || e.key === 'Enter') {
        // Only intercept Enter if suggestion visible; Tab always
        if (e.key === 'Tab' || sugVisible) {
          e.preventDefault();
          applyCompletion(suggestions[sugIdx]);
          return;
        }
      }
      if (e.key === 'Escape') { setSugVisible(false); return; }
    }

    // Run shortcut
    if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); run(); return; }

    // Tab indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta  = editorRef.current;
      const s   = ta.selectionStart;
      const end = ta.selectionEnd;
      const indent = '    ';
      const cur  = codes[activeLang]||'';
      const nv   = cur.slice(0,s)+indent+cur.slice(end);
      setCodes(prev=>({...prev,[activeLang]:nv}));
      requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=s+indent.length;});
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const ta  = editorRef.current;
      const pos = ta.selectionStart;
      const cur = codes[activeLang]||'';
      const before = cur.slice(0, pos);
      const line = before.split('\n').at(-1)||'';
      const indentMatch = line.match(/^(\s+)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      const extraIndent = /[:({]$/.test(line.trim()) ? '    ' : '';
      if (currentIndent || extraIndent) {
        e.preventDefault();
        const add = '\n' + currentIndent + extraIndent;
        const nv = cur.slice(0,pos)+add+cur.slice(ta.selectionEnd);
        setCodes(prev=>({...prev,[activeLang]:nv}));
        requestAnimationFrame(()=>{
          const np=pos+add.length;
          ta.selectionStart=ta.selectionEnd=np;
        });
        return;
      }
    }

    // Auto-close brackets/quotes
    const AUTO_CLOSE = {'(':')',  '[':']', '{':'}' };
    if (AUTO_CLOSE[e.key]) {
      const ta = editorRef.current;
      if (ta.selectionStart === ta.selectionEnd) {
        e.preventDefault();
        const cur=codes[activeLang]||'';
        const pos=ta.selectionStart;
        const nv=cur.slice(0,pos)+e.key+AUTO_CLOSE[e.key]+cur.slice(pos);
        setCodes(prev=>({...prev,[activeLang]:nv}));
        requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=pos+1;});
        return;
      }
    }
  };

  // ── Drag to resize split ─────────────────────────────────
  const onDivMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    const container = containerRef.current;
    const startY = e.clientY;
    const startPct = splitPct;

    const onMove = (me) => {
      if (!dragging.current) return;
      const rect = container.getBoundingClientRect();
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

  // ── AI explain ───────────────────────────────────────────
  const openAI = useCallback(async () => {
    setAiOpen(true); setAiLoading(true); setAiData(null); setAiTab('explain');
    await new Promise(r=>setTimeout(r,1600));
    setAiData(AI_DATA[activeLang] || AI_DATA.python);
    setAiLoading(false);
  }, [activeLang]);

  // ── Clear ────────────────────────────────────────────────
  const clearOutput = () => { setOutput(''); setHtmlOut(''); setStatus('idle'); setRunMs(null); };

  const lineCount = (code||'').split('\n').length;
  const outColor  = status==='error' ? '#F87171' : status==='done' ? '#4EC9B0' : '#94A3B8';

  // Status badge
  const statusBadge = () => {
    if (status==='loading_py') return <span style={badge('#f59e0b22','#f59e0b')}>⏳ Loading Python…</span>;
    if (status==='running')    return <span style={badge('#60a5fa22','#60a5fa')}>● running</span>;
    if (status==='done')       return <span style={badge('#4ec9b022','#4ec9b0')}>✓ exit 0</span>;
    if (status==='error')      return <span style={badge('#f8717122','#f87171')}>✗ error</span>;
    if (status==='html')       return <span style={badge('#818cf822','#818cf8')}>● preview</span>;
    return null;
  };

  return (
    <div style={c.root}>

      {/* ══ TOP BAR ══════════════════════════════════════ */}
      <div style={c.topBar}>
        {/* Language tabs — no label, just icons + names */}
        <div style={c.tabs}>
          {LANGS.map(l => (
            <button key={l.id}
              onClick={() => { setActiveLang(l.id); setSugVisible(false); }}
              style={{
                ...c.tab,
                ...(activeLang===l.id ? {
                  color: l.color,
                  borderBottom: `2px solid ${l.color}`,
                  background: `${l.color}0e`,
                } : {}),
              }}>
              <span style={c.tabIcon}>{l.icon}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        <div style={c.topRight}>
          {activeLang==='python' && !pyReady && (
            <span style={c.pyNote}>
              {pyLoading ? '⏳ Loading Python runtime…' : '⚡ Python runs in browser'}
            </span>
          )}
          <span style={c.kbHint}>Ctrl+Enter</span>
          <button onClick={openAI} style={c.aiBtn}>🤖 AI Explain</button>
          <button onClick={run}
            disabled={status==='running'||status==='loading_py'}
            style={{ ...c.runBtn, opacity:(status==='running'||status==='loading_py')?0.6:1 }}>
            {status==='running'||status==='loading_py'
              ? <><Spinner/> Running…</>
              : <>▶ Run</>}
          </button>
        </div>
      </div>

      {/* ══ BODY: [left col] [AI panel] ══════════════════ */}
      <div style={c.body}>

        {/* ── LEFT COLUMN ── */}
        <div ref={containerRef} style={c.leftCol}>

          {/* ── EDITOR PANE ── */}
          <div style={{ ...c.editorPane, height:`${splitPct}%` }}>
            <div style={c.paneBar}>
              <TrafficLights/>
              <span style={c.barFilename}>{lang?.icon} {lang?.label} — {lang?.ext ? `main.${lang.ext}` : 'file'}</span>
              <span style={c.barRight}>{lineCount} {lineCount===1?'line':'lines'}</span>
            </div>

            {/* Editor area */}
            <div style={c.editorArea}>
              {/* Line numbers */}
              <div style={c.lineNums} ref={el => {
                // sync line number scroll with textarea
                if (el && editorRef.current) {
                  editorRef.current.addEventListener('scroll', () => { if(el) el.scrollTop = editorRef.current.scrollTop; });
                }
              }}>
                {Array.from({length:lineCount},(_,i)=>(
                  <div key={i} style={c.lineNum}>{i+1}</div>
                ))}
              </div>

              {/* Highlight layer + textarea wrapper */}
              <div style={c.editorInner}>
                {/* Syntax overlay */}
                <div
                  ref={overlayRef}
                  aria-hidden
                  style={c.overlay}
                  onScroll={syncScroll}
                >
                  <pre style={c.overlayPre}>
                    {code
                      ? <SyntaxHighlight code={code} langId={activeLang}/>
                      : <span style={{color:'#3c3c3c'}}>// Write your code here…</span>
                    }
                    {'\n'}
                  </pre>
                </div>

                {/* Transparent textarea */}
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={onCodeChange}
                  onKeyDown={onKeyDown}
                  onScroll={syncScroll}
                  onBlur={() => setTimeout(()=>setSugVisible(false),120)}
                  onClick={() => setSugVisible(false)}
                  style={c.textarea}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  wrap="off"
                />

                {/* Autocomplete dropdown */}
                {sugVisible && suggestions.length > 0 && (
                  <div style={{ ...c.sugBox, top: cursorPos.top + 2, left: cursorPos.left }}>
                    {suggestions.map((s,i) => (
                      <div key={i}
                        onMouseDown={e=>{e.preventDefault();applyCompletion(s);setSugIdx(i);}}
                        style={{ ...c.sugItem, ...(i===sugIdx?c.sugItemActive:{}) }}>
                        <span style={{ ...c.sugKind, color:
                          s.kind==='snippet' ? '#818cf8' :
                          s.kind==='function'? '#DCDCAA' :
                          s.kind==='method'  ? '#4EC9B0' :
                          s.kind==='keyword' ? '#C586C0' : '#858585' }}>
                          {s.kind==='snippet'?'⬡':s.kind==='function'?'ƒ':s.kind==='method'?'m':s.kind==='keyword'?'K':'·'}
                        </span>
                        <span style={c.sugLabel}>{s.label}</span>
                        <span style={c.sugDetail}>{s.detail}</span>
                      </div>
                    ))}
                    <div style={c.sugFooter}>
                      <span>↑↓ navigate</span><span>Tab/Enter to accept</span><span>Esc dismiss</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── DRAG DIVIDER ── */}
          <div onMouseDown={onDivMouseDown} style={c.divider} title="Drag to resize">
            <div style={c.dividerLine}/>
            <div style={c.dividerGrip}>
              {[0,1,2,3,4].map(i=><span key={i} style={c.dividerDot}/>)}
            </div>
            <div style={c.dividerLine}/>
          </div>

          {/* ── STDIN (shown when input() detected) ── */}
          {showStdin && activeLang !== 'html' && (
            <div style={c.stdinRow} className="anim-fade-in">
              <span style={c.stdinLabel}>stdin</span>
              <input
                value={stdinVal}
                onChange={e=>setStdinVal(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&run()}
                placeholder="Enter program input here (one value per line for multiple input() calls)"
                style={c.stdinInput}
                spellCheck={false}
              />
            </div>
          )}

          {/* ── TERMINAL PANE ── */}
          <div style={{ ...c.termPane, height:`${100-splitPct-(showStdin?5:0)}%` }}>
            <div style={c.paneBar}>
              <TrafficLights/>
              <span style={c.barFilename}>
                Terminal {statusBadge()}
              </span>
              <div style={c.barRight}>
                {runMs!==null&&status!=='running'&&(
                  <span style={c.timeLabel}>{runMs<1000?`${runMs}ms`:`${(runMs/1000).toFixed(1)}s`}</span>
                )}
                {(output||htmlOut) && (
                  <button onClick={clearOutput} style={c.clearBtn}>Clear</button>
                )}
              </div>
            </div>

            <div ref={termRef} style={c.termBody}>
              {status==='html' && htmlOut ? (
                <iframe srcDoc={htmlOut} title="HTML preview" sandbox="allow-scripts"
                  style={{width:'100%',height:'100%',border:'none',background:'#fff'}}/>
              ) : status==='loading_py' ? (
                <div style={c.termMsg}>
                  <Spinner large/> Downloading Python runtime (~10 MB, once only)…
                </div>
              ) : status==='running' ? (
                <div style={c.termMsg}>
                  <Spinner large/> Executing…
                </div>
              ) : output ? (
                <pre style={{...c.termOut, color:outColor}}>{output}</pre>
              ) : (
                <div style={c.termEmpty}>
                  <span style={c.termPrompt}>$</span>
                  <span style={c.termHint}>
                    &nbsp;Press <Kbd>▶ Run</Kbd> or <Kbd>Ctrl+Enter</Kbd> to execute
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AI PANEL ── */}
        {aiOpen && (
          <div style={c.aiPanel} className="anim-fade-in">
            <div style={c.aiHead}>
              <div>
                <div style={c.aiTitle}>🤖 AI Analysis</div>
                <div style={c.aiSub}>{lang?.icon} {lang?.label}</div>
              </div>
              <button onClick={()=>setAiOpen(false)} style={c.aiClose}>✕</button>
            </div>

            {!aiLoading && aiData && (
              <div style={c.aiTabs}>
                {['explain','better'].map(t=>(
                  <button key={t} onClick={()=>setAiTab(t)}
                    style={{...c.aiTabBtn,...(aiTab===t?c.aiTabActive:{})}}>
                    {t==='explain'?'📖 Explain':'✨ Better Code'}
                  </button>
                ))}
              </div>
            )}

            {aiLoading ? (
              <div style={c.aiLoader}>
                <Spinner large/><p style={{color:'#858585',fontSize:13}}>Analysing…</p>
              </div>
            ) : aiData && (
              <div style={c.aiBody}>
                {aiTab==='explain' ? (
                  <>
                    <AISection label="🎨 Syntax">
                      {aiData.syntax.map((s,i)=>(
                        <div key={i} style={{...c.synCard,borderLeftColor:s.color}}>
                          <code style={{...c.synToken,color:s.color}}>{s.token}</code>
                          <p style={c.synDesc}>{s.desc}</p>
                        </div>
                      ))}
                    </AISection>
                    <AISection label="🧠 Logic"><p style={c.aiPara}>{aiData.logic}</p></AISection>
                    <AISection label="✅ Strengths">
                      <Bullets items={aiData.pros} color="#4EC9B0"/>
                    </AISection>
                    <AISection label="⚠️ Weaknesses">
                      <Bullets items={aiData.cons} color="#F87171"/>
                    </AISection>
                    <AISection label="💡 Suggestions"><p style={c.aiPara}>{aiData.improvements}</p></AISection>
                  </>
                ) : (
                  <AISection label="✨ Improved Version">
                    <p style={{...c.aiPara,marginBottom:8}}>Improvements applied — click to use:</p>
                    <div style={c.betterWrap}>
                      <div style={c.betterBar}>
                        <span style={{fontSize:11,color:'#555',fontFamily:'JetBrains Mono,monospace'}}>{`main.${lang?.ext}`}</span>
                        <button
                          onClick={()=>{
                            setCodes(prev=>({...prev,[activeLang]:aiData.betterCode.trim()}));
                            setAiOpen(false);
                          }}
                          style={c.useBtn}>
                          ↗ Use This Code
                        </button>
                      </div>
                      <pre style={c.betterPre}>{aiData.betterCode.trim()}</pre>
                    </div>
                  </AISection>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────
const badge = (bg,color) => ({
  fontSize:11, color, background:bg, padding:'2px 8px', borderRadius:10, marginLeft:6,
});
const TrafficLights = () => (
  <div style={{display:'flex',gap:6,flexShrink:0}}>
    {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=>(
      <span key={i} style={{width:12,height:12,borderRadius:'50%',background:c,display:'inline-block'}}/>
    ))}
  </div>
);
const Spinner = ({large}) => (
  <span style={{
    width:large?18:12, height:large?18:12, borderRadius:'50%',
    border:`${large?3:2}px solid rgba(255,255,255,0.15)`, borderTopColor:'#4EC9B0',
    animation:'spin 0.9s linear infinite', display:'inline-block', flexShrink:0,
  }}/>
);
const Kbd = ({children}) => (
  <kbd style={{background:'#3c3c3c',border:'1px solid #555',borderRadius:4,padding:'1px 6px',
    fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#aaa'}}>{children}</kbd>
);
const AISection = ({label,children}) => (
  <div style={{display:'flex',flexDirection:'column',gap:8}}>
    <div style={{fontSize:11,fontWeight:700,color:'#666',textTransform:'uppercase',letterSpacing:0.8}}>{label}</div>
    {children}
  </div>
);
const Bullets = ({items,color}) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    {items.map((item,i)=>(
      <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
        <span style={{width:5,height:5,borderRadius:'50%',background:color,marginTop:7,flexShrink:0}}/>
        <span style={{fontSize:12,color:color==='#4EC9B0'?'#86efac':'#fca5a5',lineHeight:1.6}}>{item}</span>
      </div>
    ))}
  </div>
);

// ─── Styles ───────────────────────────────────────────────
const c = {
  root:   { display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden',
            background:'#1e1e1e', color:'#d4d4d4', fontFamily:'DM Sans,sans-serif' },

  // Top bar
  topBar: { display:'flex', alignItems:'stretch', height:42, background:'#2d2d2d',
            borderBottom:'1px solid #1a1a1a', flexShrink:0 },
  tabs:   { display:'flex', flex:1, overflow:'hidden' },
  tab:    { display:'flex', alignItems:'center', gap:7, padding:'0 20px', height:42,
            fontSize:13, fontWeight:500, color:'#858585', background:'transparent',
            border:'none', borderBottom:'2px solid transparent', cursor:'pointer',
            transition:'all 0.15s', whiteSpace:'nowrap', fontFamily:'DM Sans,sans-serif',
            flexShrink:0 },
  tabIcon:{ fontSize:15 },
  topRight:{ display:'flex', alignItems:'center', gap:8, padding:'0 12px', flexShrink:0 },
  pyNote: { fontSize:11, color:'#6b7280', fontFamily:'JetBrains Mono,monospace', whiteSpace:'nowrap' },
  kbHint: { fontSize:11, color:'#3a3a3a', fontFamily:'JetBrains Mono,monospace', whiteSpace:'nowrap' },
  aiBtn:  { display:'flex', alignItems:'center', gap:6, padding:'6px 14px', fontSize:13,
            fontWeight:600, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
            color:'#818cf8', borderRadius:6, cursor:'pointer', fontFamily:'DM Sans,sans-serif' },
  runBtn: { display:'flex', alignItems:'center', gap:6, padding:'6px 18px', fontSize:13,
            fontWeight:700, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff',
            border:'none', borderRadius:6, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
            boxShadow:'0 2px 8px rgba(16,185,129,0.3)' },

  // Body layout
  body:   { display:'flex', flex:1, overflow:'hidden' },
  leftCol:{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', minWidth:0 },

  // Pane bars
  paneBar:{ display:'flex', alignItems:'center', gap:10, padding:'6px 14px',
            background:'#2d2d2d', borderBottom:'1px solid #1a1a1a', flexShrink:0 },
  barFilename:{ flex:1, textAlign:'center', fontSize:12, color:'#858585',
               fontFamily:'JetBrains Mono,monospace', display:'flex', alignItems:'center',
               justifyContent:'center', gap:0 },
  barRight:{ display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  timeLabel:{ fontSize:11, color:'#444', fontFamily:'JetBrains Mono,monospace' },
  clearBtn: { padding:'2px 10px', background:'#3c3c3c', border:'none', color:'#858585',
              borderRadius:4, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' },

  // Editor pane
  editorPane: { display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0,
                background:'#1e1e1e', borderBottom:'1px solid #1a1a1a' },
  editorArea: { display:'flex', flex:1, overflow:'hidden', position:'relative' },

  // Line numbers
  lineNums:   { display:'flex', flexDirection:'column', alignItems:'flex-end',
                padding:'14px 10px 14px 12px', background:'#1e1e1e',
                borderRight:'1px solid #2a2a2a', userSelect:'none',
                overflowY:'hidden', flexShrink:0, minWidth:46 },
  lineNum:    { fontSize:13, lineHeight:'23.4px', color:'#3a3a3a',
               fontFamily:'JetBrains Mono,monospace', minWidth:24, textAlign:'right' },

  // Editor inner
  editorInner:{ flex:1, position:'relative', overflow:'hidden' },
  overlay:    { position:'absolute', inset:0, overflow:'auto', pointerEvents:'none',
               padding:'14px 16px', zIndex:1 },
  overlayPre: { margin:0, fontFamily:'JetBrains Mono,monospace', fontSize:13,
               lineHeight:'23.4px', whiteSpace:'pre', color:'transparent',
               minHeight:'100%' },
  textarea:   { position:'absolute', inset:0, width:'100%', height:'100%',
               background:'transparent', border:'none', outline:'none',
               color:'transparent', caretColor:'#d4d4d4',
               fontFamily:'JetBrains Mono,monospace', fontSize:13, lineHeight:'23.4px',
               padding:'14px 16px', resize:'none', zIndex:2, overflowY:'auto',
               overflowX:'auto', whiteSpace:'pre' },

  // Autocomplete
  sugBox:   { position:'absolute', zIndex:100, background:'#252526',
              border:'1px solid #454545', borderRadius:6,
              boxShadow:'0 8px 32px rgba(0,0,0,0.6)', minWidth:260, maxWidth:380,
              maxHeight:220, overflowY:'auto' },
  sugItem:  { display:'flex', alignItems:'center', gap:8, padding:'5px 10px',
              cursor:'pointer', fontSize:13, fontFamily:'JetBrains Mono,monospace',
              borderBottom:'1px solid #2d2d2d' },
  sugItemActive:{ background:'#094771' },
  sugKind:  { fontSize:11, width:14, flexShrink:0, textAlign:'center' },
  sugLabel: { flex:1, color:'#d4d4d4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  sugDetail:{ fontSize:11, color:'#555', flexShrink:0 },
  sugFooter:{ display:'flex', justifyContent:'space-between', padding:'4px 10px',
              background:'#1e1e1e', fontSize:10, color:'#444',
              borderTop:'1px solid #2d2d2d', fontFamily:'DM Sans,sans-serif' },

  // Divider
  divider:    { display:'flex', alignItems:'center', gap:6, padding:'3px 14px',
               background:'#252526', cursor:'row-resize', flexShrink:0,
               userSelect:'none', borderTop:'1px solid #1a1a1a', borderBottom:'1px solid #1a1a1a' },
  dividerLine:{ flex:1, height:1, background:'#333' },
  dividerGrip:{ display:'flex', gap:3 },
  dividerDot: { width:3, height:3, borderRadius:'50%', background:'#555', display:'inline-block' },

  // Stdin
  stdinRow:   { display:'flex', alignItems:'center', gap:10, padding:'5px 14px',
               background:'#1a1a1a', borderBottom:'1px solid #111', flexShrink:0 },
  stdinLabel: { fontSize:11, fontWeight:700, color:'#f59e0b',
               fontFamily:'JetBrains Mono,monospace', flexShrink:0 },
  stdinInput: { flex:1, background:'transparent', border:'none', outline:'none',
               color:'#f59e0b', fontFamily:'JetBrains Mono,monospace', fontSize:12,
               padding:'2px 0' },

  // Terminal pane
  termPane:   { display:'flex', flexDirection:'column', flex:1, background:'#1e1e1e',
               overflow:'hidden', minHeight:0 },
  termBody:   { flex:1, overflow:'auto', position:'relative' },
  termOut:    { margin:0, padding:'14px 20px', fontFamily:'JetBrains Mono,monospace',
               fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap', wordBreak:'break-all' },
  termMsg:    { display:'flex', alignItems:'center', gap:12, padding:'18px 20px',
               color:'#555', fontSize:13, fontFamily:'JetBrains Mono,monospace' },
  termEmpty:  { display:'flex', alignItems:'center', padding:'14px 20px' },
  termPrompt: { color:'#4EC9B0', fontFamily:'JetBrains Mono,monospace', fontSize:14, fontWeight:700 },
  termHint:   { color:'#333', fontSize:13 },

  // AI panel
  aiPanel:{ width:360, borderLeft:'1px solid #1a1a1a', background:'#1e1e1e',
            display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 },
  aiHead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between',
            padding:'14px 16px', borderBottom:'1px solid #252526', flexShrink:0 },
  aiTitle:{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:800, color:'#d4d4d4', marginBottom:2 },
  aiSub:  { fontSize:11, color:'#555', fontFamily:'JetBrains Mono,monospace' },
  aiClose:{ width:24, height:24, borderRadius:4, background:'#3c3c3c', border:'none',
            color:'#858585', fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif', flexShrink:0 },
  aiTabs: { display:'flex', borderBottom:'1px solid #252526', flexShrink:0 },
  aiTabBtn:{ flex:1, padding:'8px 0', fontSize:12, fontWeight:600, color:'#555',
             background:'transparent', border:'none', borderBottom:'2px solid transparent',
             cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.15s' },
  aiTabActive:{ color:'#818cf8', borderBottomColor:'#6366f1', background:'rgba(99,102,241,0.06)' },
  aiLoader:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
             gap:12, flex:1 },
  aiBody: { flex:1, overflowY:'auto', padding:'14px 16px', display:'flex',
            flexDirection:'column', gap:16 },
  aiPara: { fontSize:12, color:'#858585', lineHeight:1.75, background:'#252526',
            padding:'10px 12px', borderRadius:6, margin:0 },
  synCard:{ padding:'9px 11px', background:'#252526', borderRadius:6, borderLeft:'3px solid',
            display:'flex', flexDirection:'column', gap:4 },
  synToken:{ fontFamily:'JetBrains Mono,monospace', fontSize:11, fontWeight:600 },
  synDesc: { fontSize:12, color:'#858585', lineHeight:1.6, margin:0 },
  betterWrap:{ background:'#141414', borderRadius:6, overflow:'hidden', border:'1px solid #2d2d2d' },
  betterBar: { display:'flex', alignItems:'center', justifyContent:'space-between',
               padding:'7px 12px', background:'#252526', borderBottom:'1px solid #1a1a1a' },
  useBtn: { padding:'4px 12px', background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)',
            color:'#818cf8', borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer',
            fontFamily:'DM Sans,sans-serif' },
  betterPre:{ margin:0, padding:'12px', fontFamily:'JetBrains Mono,monospace', fontSize:11.5,
              lineHeight:1.75, color:'#a5b4fc', overflowX:'auto', whiteSpace:'pre' },
};
