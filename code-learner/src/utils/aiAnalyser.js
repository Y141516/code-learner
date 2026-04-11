// aiAnalyser.js — analyses actual user code, not generic examples

// Token patterns for counting/detecting code features
const PATTERNS = {
  python: {
    functions:    /\bdef\s+(\w+)/g,
    classes:      /\bclass\s+(\w+)/g,
    imports:      /^\s*(import|from)\s+(\S+)/gm,
    loops:        /\b(for|while)\b/g,
    conditionals: /\b(if|elif|else)\b/g,
    exceptions:   /\b(try|except|finally|raise)\b/g,
    listComps:    /\[.+\s+for\s+.+\s+in\s+.+\]/g,
    fstrings:     /f["']/g,
    recursion:    (code, fns) => fns.some(fn => { const r = new RegExp(`\\b${fn}\\s*\\(`,'g'); const m = code.match(r); return m && m.length > 1; }),
    inputCalls:   /\binput\s*\(/g,
    printCalls:   /\bprint\s*\(/g,
  },
  javascript: {
    functions:    /\b(function\s+\w+|const\s+\w+\s*=\s*(async\s*)?\(|=>)/g,
    classes:      /\bclass\s+(\w+)/g,
    imports:      /\b(import|require)\s*[\w({'"]/g,
    loops:        /\b(for|while|forEach|map|filter|reduce)\b/g,
    conditionals: /\b(if|else|switch|ternary)\b/g,
    exceptions:   /\b(try|catch|finally|throw)\b/g,
    asyncAwait:   /\b(async|await)\b/g,
    arrowFns:     /=>/g,
    consoleLogs:  /\bconsole\.(log|error|warn)\b/g,
    fetchCalls:   /\bfetch\s*\(/g,
  },
  java: {
    functions:    /\b(public|private|protected|static)\s+\w+\s+(\w+)\s*\(/g,
    classes:      /\bclass\s+(\w+)/g,
    imports:      /^import\s+[\w.]+;/gm,
    loops:        /\b(for|while|forEach)\b/g,
    conditionals: /\b(if|else|switch)\b/g,
    exceptions:   /\b(try|catch|finally|throw)\b/g,
    generics:     /<[\w,\s]+>/g,
    streams:      /\.stream\(\)|\.filter\(|\.map\(|\.collect\(/g,
  },
  html: {
    tags:         /<(\w+)[\s>]/g,
    cssRules:     /\{[^}]+\}/g,
    jsBlocks:     /<script[\s>]/g,
    styleBlocks:  /<style[\s>]/g,
    idSelectors:  /#[\w-]+/g,
    classSelectors:/\.[\w-]+/g,
    eventHandlers:/on\w+\s*=/g,
    flexbox:      /display\s*:\s*flex/g,
    grid:         /display\s*:\s*grid/g,
    cssVars:      /--[\w-]+\s*:/g,
  },
};

// ── Extract real facts from code ──────────────────────────
function analyseCode(langId, code) {
  const p = PATTERNS[langId] || PATTERNS.python;
  const lines = code.split('\n');
  const nonEmpty = lines.filter(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('//'));

  const facts = {};

  if (langId === 'python') {
    const fnMatches  = [...code.matchAll(p.functions)].map(m => m[1]);
    const clsMatches = [...code.matchAll(p.classes)].map(m => m[1]);
    const impMatches = [...code.matchAll(p.imports)].map(m => m[2]);

    facts.functions    = fnMatches;
    facts.classes      = clsMatches;
    facts.imports      = impMatches;
    facts.loops        = (code.match(p.loops)        || []).length;
    facts.conditionals = (code.match(p.conditionals) || []).length;
    facts.exceptions   = (code.match(p.exceptions)   || []).length;
    facts.listComps    = (code.match(p.listComps)     || []).length;
    facts.fstrings     = (code.match(p.fstrings)      || []).length;
    facts.hasInput     = p.inputCalls.test(code);
    facts.hasPrint     = p.printCalls.test(code);
    facts.hasRecursion = fnMatches.length > 0 && p.recursion(code, fnMatches);
    facts.lineCount    = nonEmpty.length;
  }

  if (langId === 'javascript') {
    const fnCount  = (code.match(p.functions) || []).length;
    const impCount = (code.match(p.imports)   || []).length;

    facts.functionCount  = fnCount;
    facts.imports        = impCount;
    facts.loops          = (code.match(p.loops)        || []).length;
    facts.conditionals   = (code.match(p.conditionals) || []).length;
    facts.asyncAwait     = (code.match(p.asyncAwait)   || []).length;
    facts.arrowFunctions = (code.match(p.arrowFns)     || []).length;
    facts.consoleLogs    = (code.match(p.consoleLogs)  || []).length;
    facts.fetchCalls     = (code.match(p.fetchCalls)   || []).length;
    facts.lineCount      = nonEmpty.length;
  }

  if (langId === 'java') {
    facts.methods     = [...code.matchAll(p.functions)].map(m => m[2]);
    facts.classes     = [...code.matchAll(p.classes)].map(m => m[1]);
    facts.imports     = (code.match(p.imports)     || []).length;
    facts.loops       = (code.match(p.loops)       || []).length;
    facts.exceptions  = (code.match(p.exceptions)  || []).length;
    facts.streams     = (code.match(p.streams)      || []).length;
    facts.lineCount   = nonEmpty.length;
  }

  if (langId === 'html') {
    const allTags = [...code.matchAll(p.tags)].map(m => m[1].toLowerCase());
    const uniqueTags = [...new Set(allTags)];
    facts.tags       = uniqueTags;
    facts.hasCSS     = p.styleBlocks.test(code);
    facts.hasJS      = p.jsBlocks.test(code);
    facts.cssRules   = (code.match(p.cssRules)       || []).length;
    facts.flexbox    = p.flexbox.test(code);
    facts.grid       = p.grid.test(code);
    facts.cssVars    = (code.match(p.cssVars)         || []).length;
    facts.eventHandlers = (code.match(p.eventHandlers)|| []).length;
    facts.lineCount  = nonEmpty.length;
  }

  return facts;
}

// ── Detect syntax tokens IN the actual code ───────────────
function detectSyntaxTokens(langId, code) {
  const found = [];

  if (langId === 'python') {
    if (/f["']/.test(code))                    found.push({ token:'f-strings', color:'#CE9178', desc:`You're using f-strings (f"...{var}...") — the modern Python way to embed variables directly inside strings. Faster than .format() and much cleaner than + concatenation.` });
    if (/\bdef\s+\w+/.test(code))             found.push({ token:'def (functions)', color:'#DCDCAA', desc:`You've defined ${[...code.matchAll(/\bdef\s+(\w+)/g)].map(m=>m[1]).join(', ')||'one or more'} function(s). Python functions use indentation for their block — everything 4 spaces in belongs to the function.` });
    if (/\bclass\s+\w+/.test(code))           found.push({ token:'class (OOP)', color:'#4EC9B0', desc:`You're using classes — Python's Object-Oriented Programming model. \`__init__(self)\` is the constructor that runs automatically when you create an instance.` });
    if (/\[.+for.+in/.test(code))             found.push({ token:'List comprehension', color:'#9CDCFE', desc:`You're using list comprehensions — [expr for item in iterable] — a compact, Pythonic way to build lists. Equivalent to a for loop but faster and more readable.` });
    if (/\bimport\s+\w+/.test(code))          found.push({ token:'import', color:'#C586C0', desc:`You're importing: ${[...code.matchAll(/(?:import|from)\s+(\S+)/g)].map(m=>m[1]).join(', ')}. Python's standard library is enormous — math, random, os, json, re, datetime all need no installation.` });
    if (/\btry\b/.test(code))                 found.push({ token:'try/except', color:'#F87171', desc:`You're using exception handling — \`try\` wraps risky code, \`except\` catches specific errors. This prevents crashes and lets you handle failures gracefully.` });
    if (/\basync\s+def\b/.test(code))         found.push({ token:'async/await', color:'#818CF8', desc:`You're using async functions — Python's coroutine model. \`await\` pauses execution without blocking, perfect for I/O operations like network requests and file reads.` });
    if (/\blambda\b/.test(code))              found.push({ token:'lambda', color:'#B5CEA8', desc:`You're using lambda — anonymous one-line functions. Great for short callbacks: \`sorted(items, key=lambda x: x.name)\`. For anything longer, a named \`def\` is clearer.` });
    if (/\bfor\b.+\bin\b/.test(code) && !/\[.+for.+in/.test(code)) found.push({ token:'for loop', color:'#4EC9B0', desc:`You're using for loops to iterate. Python's for loops work directly on any iterable — lists, strings, dicts, ranges — no index management needed.` });
    if (/\binput\s*\(/.test(code))            found.push({ token:'input()', color:'#FEBC2E', desc:`Your code uses input() — which pauses and waits for the user to type. In this terminal, the prompt appears inline and you type directly there, just like a real terminal.` });
  }

  if (langId === 'javascript') {
    if (/\bconst\b/.test(code))               found.push({ token:'const', color:'#9CDCFE', desc:`You're using const — the modern way to declare variables that won't be reassigned. Prefer const by default; only use let when you need to reassign.` });
    if (/=>\s*/.test(code))                   found.push({ token:'Arrow functions (=>)', color:'#DCDCAA', desc:`You're using arrow functions — concise and lexically scoped \`this\`. Single-expression bodies have implicit return: \`const double = n => n * 2\`.` });
    if (/\basync\b.+\bfunction\b|\basync\b.+=>/.test(code)) found.push({ token:'async/await', color:'#C586C0', desc:`You're using async functions. \`await\` pauses inside the async function without blocking the thread — the foundation of modern JS I/O like fetch() calls.` });
    if (/\.map\s*\(|\.filter\s*\(|\.reduce\s*\(/.test(code)) found.push({ token:'.map/.filter/.reduce', color:'#4EC9B0', desc:`You're using functional array methods — they return new arrays and leave the original unchanged. Chaining them builds powerful data transformation pipelines.` });
    if (/\bclass\b/.test(code))               found.push({ token:'class', color:'#CE9178', desc:`You're using ES6 classes — syntactic sugar over JavaScript's prototype chain. \`constructor()\` initialises the object; methods go directly on the class body.` });
    if (/\bfetch\s*\(/.test(code))            found.push({ token:'fetch()', color:'#818CF8', desc:`You're using fetch() — the modern browser API for HTTP requests. Always \`await\` it and call \`.json()\` on the response. Wrap in try/catch for error handling.` });
    if (/\btry\b/.test(code))                 found.push({ token:'try/catch', color:'#F87171', desc:`You're using exception handling — \`try\` wraps risky code, \`catch(err)\` handles failures. Always add catch when using async/await or fetch().` });
    if (/\.\.\.\w+|\.\.\./.test(code))        found.push({ token:'Spread (...)', color:'#B5CEA8', desc:`You're using the spread operator — \`[...arr]\` copies an array, \`{...obj}\` copies an object. Essential for immutable updates and merging arrays/objects.` });
  }

  if (langId === 'java') {
    if (/System\.out\.print/.test(code))      found.push({ token:'System.out.println', color:'#4EC9B0', desc:`You're using Java's standard output. \`println\` adds a newline; \`print\` doesn't; \`printf("%.2f%n", val)\` gives formatted output like C's printf.` });
    if (/\bArrayList\b/.test(code))           found.push({ token:'ArrayList<T>', color:'#DCDCAA', desc:`You're using ArrayList — a dynamically-resizable list. More flexible than arrays. Always use the generic type: \`ArrayList<String>\` to get compile-time type safety.` });
    if (/\.stream\(\)|\.filter\(|\.map\(/.test(code)) found.push({ token:'Stream API', color:'#C586C0', desc:`You're using Java Streams — functional-style data processing. \`.filter()\`, \`.map()\`, \`.collect()\` let you process collections without writing explicit loops.` });
    if (/\btry\b/.test(code))                 found.push({ token:'try/catch', color:'#F87171', desc:`You're using exception handling. Java has checked exceptions — methods that \`throws\` something force callers to handle or declare them. Use specific exception types, not just \`Exception\`.` });
    if (/\binterface\b/.test(code))           found.push({ token:'interface', color:'#9CDCFE', desc:`You're using interfaces — contracts that classes must implement. Java 8+ allows default methods in interfaces. Use them for polymorphism and dependency injection.` });
    if (/\bScanner\b/.test(code))             found.push({ token:'Scanner', color:'#FEBC2E', desc:`You're using Scanner to read user input. \`scanner.nextLine()\` reads a full line; \`nextInt()\` reads an integer. Always close with \`scanner.close()\` when done.` });
  }

  if (langId === 'html') {
    if (/display\s*:\s*flex/.test(code))      found.push({ token:'display: flex', color:'#4EC9B0', desc:`You're using Flexbox — 1D layout along a row or column. \`justify-content\` aligns on the main axis; \`align-items\` on the cross axis. Perfect for navbars and component-level layouts.` });
    if (/display\s*:\s*grid/.test(code))      found.push({ token:'display: grid', color:'#DCDCAA', desc:`You're using CSS Grid — 2D layout with rows AND columns simultaneously. \`grid-template-columns: repeat(3, 1fr)\` creates 3 equal columns. Best for full page layouts.` });
    if (/--[\w-]+\s*:/.test(code))            found.push({ token:'CSS custom properties', color:'#C586C0', desc:`You're using CSS variables (--name: value). Defined in :root to be global. Use with \`var(--name)\`. Change once and it updates everywhere — essential for theming.` });
    if (/addEventListener/.test(code))        found.push({ token:'addEventListener()', color:'#9CDCFE', desc:`You're using addEventListener() — the correct modern way to attach event handlers. Separates JS from HTML, allows multiple listeners, and lets you remove them later.` });
    if (/@media/.test(code))                  found.push({ token:'@media query', color:'#F87171', desc:`You're using media queries for responsive design. \`@media (min-width: 768px)\` applies styles only at that breakpoint. Mobile-first: write base styles for small, then add queries for larger.` });
    if (/transition|animation/.test(code))    found.push({ token:'CSS transitions/animations', color:'#818CF8', desc:`You're using CSS animations. Always animate \`transform\` and \`opacity\` — they're GPU-accelerated. Avoid animating \`width\`, \`height\`, or \`margin\` which trigger expensive layout reflow.` });
  }

  return found.slice(0, 5); // max 5 tokens shown
}

// ── Generate pros based on actual code ───────────────────
function generatePros(langId, code, facts) {
  const pros = [];

  if (langId === 'python') {
    if (facts.fstrings > 0)        pros.push(`Uses f-strings for clean string formatting (${facts.fstrings} occurrence${facts.fstrings>1?'s':''})`);
    if (facts.listComps > 0)       pros.push(`List comprehension used — idiomatic and efficient`);
    if (facts.functions.length > 0) pros.push(`Code is organised into reusable functions: ${facts.functions.join(', ')}`);
    if (facts.exceptions > 0)      pros.push(`Exception handling present — code handles errors gracefully`);
    if (facts.imports.length > 0)  pros.push(`Uses standard library: ${facts.imports.join(', ')}`);
    if (facts.hasRecursion)         pros.push(`Uses recursion — elegant solution for this type of problem`);
    if (pros.length < 2)            pros.push('Code is concise and readable');
    if (pros.length < 2)            pros.push('Uses Python idioms effectively');
  }

  if (langId === 'javascript') {
    if (facts.arrowFunctions > 0)   pros.push(`Uses arrow functions (${facts.arrowFunctions}) — modern ES6+ style`);
    if (facts.asyncAwait > 0)       pros.push(`Async/await used — clean asynchronous code`);
    if (facts.loops > 3)            pros.push(`Good use of array methods for data transformation`);
    if (facts.consoleLogs < 3)      pros.push(`Minimal console.log usage — clean output`);
    if (pros.length < 2)            pros.push('Follows modern ES6+ conventions');
    if (pros.length < 2)            pros.push('Code structure is readable and maintainable');
  }

  if (langId === 'java') {
    if (facts.streams > 0)          pros.push(`Uses Java Stream API — modern functional-style processing`);
    if (facts.exceptions > 0)       pros.push(`Exception handling implemented`);
    if (facts.methods.length > 1)   pros.push(`Good separation of concerns with ${facts.methods.length} methods`);
    if (pros.length < 2)            pros.push('Follows Java naming conventions');
    if (pros.length < 2)            pros.push('Type safety enforced by static typing');
  }

  if (langId === 'html') {
    if (facts.flexbox || facts.grid) pros.push(`Uses ${facts.flexbox?'Flexbox':''}${facts.flexbox&&facts.grid?' and ':''}${facts.grid?'CSS Grid':''} for modern layout`);
    if (facts.cssVars > 0)           pros.push(`CSS custom properties used — maintainable theming`);
    if (facts.eventHandlers === 0 && facts.hasJS) pros.push(`No inline event handlers — clean separation of HTML and JS`);
    if (facts.hasCSS && facts.hasJS) pros.push('Self-contained page with both styling and behaviour');
    if (pros.length < 2)             pros.push('Semantic HTML structure present');
    if (pros.length < 2)             pros.push('Clean, readable code organisation');
  }

  return pros.slice(0, 4);
}

// ── Generate cons based on actual code ───────────────────
function generateCons(langId, code, facts) {
  const cons = [];

  if (langId === 'python') {
    if (facts.functions.length === 0 && facts.lineCount > 10) cons.push('No functions defined — consider breaking code into reusable functions');
    if (facts.exceptions === 0 && (facts.hasInput || facts.imports.length > 0)) cons.push('No exception handling — risky code paths could crash the program');
    if (!/\bif\s+__name__\s*==/.test(code) && facts.functions.length > 0) cons.push('Missing if __name__ == "__main__": guard — file cannot be safely imported');
    if (facts.hasRecursion && !/lru_cache|functools/.test(code)) cons.push('Recursive function without memoization — may be slow for large inputs');
    if (code.match(/\bprint\s*\(/g)?.length > 5)  cons.push('Many print() calls — consider using logging module for production code');
    if (cons.length < 2) cons.push('No type hints — add them for better IDE support and clarity');
    if (cons.length < 2) cons.push('No docstrings on functions — document what each function does');
  }

  if (langId === 'javascript') {
    const hasAsync  = facts.asyncAwait > 0;
    const hasFetch  = facts.fetchCalls > 0;
    if (hasFetch && !/catch|try/.test(code))       cons.push('fetch() calls without error handling — network requests can fail');
    if (hasAsync && !/try|catch/.test(code))       cons.push('Async code without try/catch — promise rejections will be unhandled');
    if (facts.consoleLogs > 4)                     cons.push(`${facts.consoleLogs} console.log calls — remove debug logs before production`);
    if (/var\s+\w+/.test(code))                    cons.push('Uses var — replace with const or let for block scoping');
    if (cons.length < 2) cons.push('No input validation — verify data types and null values');
    if (cons.length < 2) cons.push('Consider TypeScript for larger projects to catch type errors at compile time');
  }

  if (langId === 'java') {
    if (facts.exceptions === 0)                    cons.push('No exception handling — add try/catch for robust error management');
    if (/catch\s*\(\s*Exception\s+/.test(code))    cons.push('Catching generic Exception — use specific exception types instead');
    if (/new\s+Random\s*\(\s*\)/.test(code) && !/seed|new Random\(\d/.test(code)) cons.push('Random without seed — results are non-reproducible (use new Random(seed) for testing)');
    if (cons.length < 2) cons.push('No input validation on method parameters');
    if (cons.length < 2) cons.push('Consider using var for local type inference (Java 10+) to reduce verbosity');
  }

  if (langId === 'html') {
    if (facts.eventHandlers > 0)                   cons.push(`${facts.eventHandlers} inline event handler(s) — prefer addEventListener() for separation of concerns`);
    if (!/viewport/.test(code))                    cons.push('No <meta name="viewport"> tag — page may not display correctly on mobile');
    if (!/box-sizing/.test(code) && facts.hasCSS)  cons.push('No box-sizing: border-box reset — elements may overflow their containers');
    if (!facts.cssVars && facts.hasCSS && facts.cssRules > 3) cons.push('Hardcoded colour values — use CSS custom properties (--primary: #color) for maintainability');
    if (cons.length < 2) cons.push('No ARIA attributes — add role and aria-label for screen reader accessibility');
  }

  return cons.slice(0, 4);
}

// ── Generate improvement suggestions ─────────────────────
function generateImprovements(langId, code, facts) {
  const tips = [];

  if (langId === 'python') {
    if (facts.functions.length > 0 && !/"""/.test(code))
      tips.push('Add docstrings: def func(x):\\n    """What this does."""');
    if (!facts.imports.includes('typing') && facts.functions.length > 0)
      tips.push('Add type hints: def greet(name: str) -> str: for better IDE support');
    if (facts.hasRecursion)
      tips.push('Speed up recursion with @functools.lru_cache — adds automatic memoization');
    if (facts.lineCount > 20 && facts.functions.length < 2)
      tips.push('Break long code into smaller functions — aim for < 20 lines per function');
    if (!/if\s+__name__/.test(code) && facts.functions.length > 0)
      tips.push('Wrap runnable code in: if __name__ == "__main__": — makes file importable');
  }

  if (langId === 'javascript') {
    if (facts.fetchCalls > 0 && !/try|catch/.test(code))
      tips.push('Wrap fetch() in try/catch: const data = await fetch(url).then(r=>r.json())');
    if (/var\s+\w+/.test(code))
      tips.push('Replace var with const or let everywhere — var has unpredictable hoisting');
    if (facts.asyncAwait === 0 && facts.fetchCalls > 0)
      tips.push('Add async/await: async function getData() { const r = await fetch(url); }');
    tips.push('Use optional chaining: obj?.property ?? defaultValue — prevents null errors');
  }

  if (langId === 'java') {
    tips.push('Use var for local inference (Java 10+): var list = new ArrayList<String>()');
    if (facts.streams === 0 && facts.loops > 2)
      tips.push('Replace loops with Streams: list.stream().filter(...).map(...).collect(...)');
    if (/catch\s*\(\s*Exception/.test(code))
      tips.push('Use specific exception types: catch(NumberFormatException e) instead of Exception');
    tips.push('Use String.format() or printf for output: System.out.printf("Value: %d%n", n)');
  }

  if (langId === 'html') {
    if (!facts.cssVars && facts.hasCSS)
      tips.push('Add CSS variables: :root { --primary: #6366f1; } then use var(--primary)');
    if (facts.eventHandlers > 0)
      tips.push('Move event handlers to JS: btn.addEventListener("click", handler)');
    if (!/box-sizing/.test(code) && facts.hasCSS)
      tips.push('Add reset: *, *::before, *::after { box-sizing: border-box; margin: 0; }');
    tips.push('Add :focus-visible styles for keyboard navigation accessibility');
  }

  return tips.slice(0, 3).join(' · ') || 'Code looks clean — try adding comments to document your logic.';
}

// ── Main export: analyse actual code ─────────────────────
export function analyseUserCode(langId, code) {
  if (!code || !code.trim()) {
    return {
      empty: true,
      message: 'Write some code first, then click AI Explain to get a detailed analysis.',
    };
  }

  const facts   = analyseCode(langId, code);
  const tokens  = detectSyntaxTokens(langId, code);
  const pros    = generatePros(langId, code, facts);
  const cons    = generateCons(langId, code, facts);
  const improve = generateImprovements(langId, code, facts);

  // Generate summary based on what's actually in the code
  const summary = buildSummary(langId, code, facts);

  return { tokens, logic: summary, pros, cons, improvements: improve, empty: false };
}

function buildSummary(langId, code, facts) {
  const lines = code.split('\n').filter(l => l.trim()).length;

  if (langId === 'python') {
    const parts = [];
    if (facts.imports.length)    parts.push(`imports ${facts.imports.join(', ')}`);
    if (facts.functions.length)  parts.push(`defines ${facts.functions.length} function(s): ${facts.functions.join(', ')}`);
    if (facts.classes.length)    parts.push(`defines class(es): ${facts.classes.join(', ')}`);
    if (facts.loops)             parts.push(`contains ${facts.loops} loop(s)`);
    if (facts.conditionals)      parts.push(`uses ${facts.conditionals} conditional(s)`);
    if (facts.listComps)         parts.push(`uses ${facts.listComps} list comprehension(s)`);
    if (facts.hasInput)          parts.push(`reads user input via input()`);
    if (facts.hasRecursion)      parts.push(`uses recursion`);
    return `This ${lines}-line Python program ${parts.length ? parts.join(', ') : 'performs operations on data'}. Python executes top-to-bottom — each statement runs in order. Indentation (4 spaces) defines code blocks instead of curly braces.`;
  }

  if (langId === 'javascript') {
    const parts = [];
    if (facts.imports)           parts.push(`${facts.imports} import/require statement(s)`);
    if (facts.functionCount)     parts.push(`${facts.functionCount} function definition(s)`);
    if (facts.arrowFunctions)    parts.push(`${facts.arrowFunctions} arrow function(s)`);
    if (facts.asyncAwait)        parts.push(`${facts.asyncAwait} async/await usage(s)`);
    if (facts.fetchCalls)        parts.push(`${facts.fetchCalls} fetch() call(s)`);
    if (facts.loops)             parts.push(`${facts.loops} loop/array method(s)`);
    return `This ${lines}-line JavaScript program contains ${parts.length ? parts.join(', ') : 'standard operations'}. JavaScript runs in a single thread using an event loop — async operations are queued and run when the call stack is clear.`;
  }

  if (langId === 'java') {
    const parts = [];
    if (facts.imports)           parts.push(`${facts.imports} import(s)`);
    if (facts.classes.length)    parts.push(`class(es): ${facts.classes.join(', ')}`);
    if (facts.methods.length)    parts.push(`method(s): ${facts.methods.join(', ')}`);
    if (facts.streams)           parts.push(`${facts.streams} Stream operation(s)`);
    return `This ${lines}-line Java program contains ${parts.length ? parts.join(', ') : 'standard operations'}. Java is statically typed — all types are checked at compile time before the code ever runs on the JVM.`;
  }

  if (langId === 'html') {
    const parts = [];
    if (facts.tags.length)       parts.push(`uses tags: ${facts.tags.slice(0,8).join(', ')}`);
    if (facts.cssRules)          parts.push(`${facts.cssRules} CSS rule(s)`);
    if (facts.flexbox)           parts.push('Flexbox layout');
    if (facts.grid)              parts.push('CSS Grid layout');
    if (facts.cssVars)           parts.push(`${facts.cssVars} CSS variable(s)`);
    if (facts.hasJS)             parts.push('embedded JavaScript');
    return `This ${lines}-line HTML page ${parts.length ? parts.join(', ') : 'defines web content'}. The browser parses HTML into a DOM tree, applies CSS styles (specificity determines which rule wins), then executes JavaScript to add interactivity.`;
  }

  return `This ${lines}-line program performs operations on data.`;
}
