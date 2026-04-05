// ─────────────────────────────────────────────────────────
//  Code Executor — simulates Python & JS output
//  Returns { output: string, error: string|null }
// ─────────────────────────────────────────────────────────

// ── JavaScript executor (real eval via Function) ──────────
function runJavaScript(code) {
  const logs = [];
  const fakeConsole = {
    log:   (...a) => logs.push(a.map(v => formatValue(v)).join(' ')),
    error: (...a) => logs.push('[Error] ' + a.map(v => formatValue(v)).join(' ')),
    warn:  (...a) => logs.push('[Warn] '  + a.map(v => formatValue(v)).join(' ')),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function('console', code)(fakeConsole);
    return { output: logs.join('\n'), error: null };
  } catch (e) {
    return { output: logs.join('\n'), error: e.message };
  }
}

function formatValue(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'boolean') return v ? 'True' : 'False'; // Python-like for display
  if (typeof v === 'object') {
    // format arrays like Python lists
    if (Array.isArray(v)) return '[' + v.map(formatValue).join(', ') + ']';
    return JSON.stringify(v);
  }
  return String(v);
}

// ── Python simulator ──────────────────────────────────────
// Executes common Python patterns and extracts print() output
function runPython(code) {
  try {
    const output = simulatePython(code);
    return { output, error: null };
  } catch (e) {
    return { output: '', error: e.message };
  }
}

function simulatePython(rawCode) {
  // Remove comment lines and blank lines for processing
  const lines = rawCode.split('\n');
  const env = {};    // variable environment
  const output = []; // collected print outputs

  // Multi-pass: first collect all assignments, then handle prints/loops
  const cleanLines = lines
    .map(l => l.replace(/#.*$/, '')) // strip comments
    .filter(l => l.trim() !== '');

  executePythonLines(cleanLines, env, output);
  return output.join('\n');
}

function executePythonLines(lines, env, output, depth = 0) {
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const indent = raw.search(/\S/);
    const line = raw.trim();

    // Skip blank
    if (!line) { i++; continue; }

    // ── pass (placeholder) ──
    if (line === 'pass') { i++; continue; }

    // ── variable assignment ──
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/.test(line) && !line.startsWith('if ') && !line.startsWith('while ') && !line.startsWith('for ') && !line.startsWith('def ') && !line.startsWith('class ')) {
      const eqIdx = line.indexOf('=');
      const varName = line.slice(0, eqIdx).trim();
      const valStr = line.slice(eqIdx + 1).trim();
      if (!varName.includes(' ')) {
        env[varName] = evalPythonExpr(valStr, env);
      }
      i++; continue;
    }

    // ── augmented assignment +=, -=, *=, //=, **= ──
    const augMatch = line.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/\/=|\*\*=|%=|\/=)\s*(.+)$/);
    if (augMatch) {
      const [, varName, op, valStr] = augMatch;
      const val = evalPythonExpr(valStr, env);
      const cur = env[varName] ?? 0;
      if (op === '+=')  env[varName] = cur + val;
      else if (op === '-=')  env[varName] = cur - val;
      else if (op === '*=')  env[varName] = cur * val;
      else if (op === '/=')  env[varName] = cur / val;
      else if (op === '//=') env[varName] = Math.floor(cur / val);
      else if (op === '**=') env[varName] = cur ** val;
      else if (op === '%=')  env[varName] = cur % val;
      i++; continue;
    }

    // ── print() ──
    if (line.startsWith('print(')) {
      const result = evalPrint(line, env);
      output.push(result);
      i++; continue;
    }

    // ── for loop ──
    const forMatch = line.match(/^for\s+(.+?)\s+in\s+(.+?)\s*:$/);
    if (forMatch) {
      const [, varPart, iterPart] = forMatch;
      const iterable = evalPythonExpr(iterPart, env);
      // collect indented body
      const body = [];
      i++;
      while (i < lines.length && (lines[i].search(/\S/) > indent || lines[i].trim() === '')) {
        if (lines[i].trim()) body.push(lines[i]);
        i++;
      }
      const iterArr = iterableToArray(iterable);
      for (const item of iterArr) {
        // handle tuple unpacking: for name, score in ...
        if (varPart.includes(',')) {
          const parts = varPart.split(',').map(p => p.trim());
          if (Array.isArray(item)) {
            parts.forEach((p, idx) => { env[p] = item[idx]; });
          }
        } else {
          env[varPart.trim()] = item;
        }
        executePythonLines(body, env, output, depth + 1);
        if (depth > 50) break; // safety
      }
      continue;
    }

    // ── while loop ──
    const whileMatch = line.match(/^while\s+(.+?)\s*:$/);
    if (whileMatch) {
      const [, cond] = whileMatch;
      const body = [];
      i++;
      while (i < lines.length && (lines[i].search(/\S/) > indent || lines[i].trim() === '')) {
        if (lines[i].trim()) body.push(lines[i]);
        i++;
      }
      let safety = 0;
      while (evalPythonCondition(cond, env) && safety < 1000) {
        safety++;
        executePythonLines(body, env, output, depth + 1);
      }
      continue;
    }

    // ── if / elif / else ──
    if (line.startsWith('if ') || line.startsWith('elif ') || line === 'else:') {
      // collect entire if-elif-else block
      const block = [{ cond: line.startsWith('if ') ? line.replace(/^if\s+/, '').replace(/:$/, '') : null, isElse: line === 'else:', body: [] }];
      i++;
      while (i < lines.length) {
        const cl = lines[i].trim();
        const ci = lines[i].search(/\S/);
        if (ci <= indent && cl !== '') {
          if (cl.startsWith('elif ') || cl === 'else:') {
            block.push({ cond: cl.startsWith('elif ') ? cl.replace(/^elif\s+/, '').replace(/:$/, '') : null, isElse: cl === 'else:', body: [] });
            i++;
          } else break;
        } else {
          if (cl) block[block.length - 1].body.push(lines[i]);
          i++;
        }
      }
      for (const branch of block) {
        if (branch.isElse || (branch.cond && evalPythonCondition(branch.cond, env))) {
          executePythonLines(branch.body, env, output, depth + 1);
          break;
        }
      }
      continue;
    }

    // ── def (skip body) ──
    if (line.startsWith('def ')) {
      i++;
      while (i < lines.length && (lines[i].search(/\S/) > indent || lines[i].trim() === '')) {
        i++;
      }
      continue;
    }

    // ── class (skip body) ──
    if (line.startsWith('class ')) {
      i++;
      while (i < lines.length && (lines[i].search(/\S/) > indent || lines[i].trim() === '')) {
        i++;
      }
      continue;
    }

    i++;
  }
}

function iterableToArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split('');
  if (typeof v === 'object' && v !== null && v.__range) {
    const { start, stop, step } = v;
    const arr = [];
    for (let x = start; step > 0 ? x < stop : x > stop; x += step) arr.push(x);
    return arr;
  }
  return [];
}

// ── Evaluate a Python expression ─────────────────────────
function evalPythonExpr(expr, env) {
  expr = expr.trim();

  // range(...)
  const rangeM = expr.match(/^range\((.+)\)$/);
  if (rangeM) {
    const args = splitArgs(rangeM[1]).map(a => Number(evalPythonExpr(a, env)));
    if (args.length === 1) return { __range: true, start: 0, stop: args[0], step: 1 };
    if (args.length === 2) return { __range: true, start: args[0], stop: args[1], step: 1 };
    return { __range: true, start: args[0], stop: args[1], step: args[2] };
  }

  // len(x)
  const lenM = expr.match(/^len\((.+)\)$/);
  if (lenM) {
    const v = evalPythonExpr(lenM[1], env);
    return Array.isArray(v) ? v.length : typeof v === 'string' ? v.length : 0;
  }

  // int(x)
  const intM = expr.match(/^int\((.+)\)$/);
  if (intM) return Math.trunc(Number(evalPythonExpr(intM[1], env)));

  // float(x)
  const floatM = expr.match(/^float\((.+)\)$/);
  if (floatM) return Number(evalPythonExpr(floatM[1], env));

  // str(x)
  const strM = expr.match(/^str\((.+)\)$/);
  if (strM) return String(evalPythonExpr(strM[1], env));

  // min/max/sum
  const minM = expr.match(/^min\((.+)\)$/);
  if (minM) { const arr = evalPythonExpr(minM[1], env); return Array.isArray(arr) ? Math.min(...arr) : arr; }
  const maxM = expr.match(/^max\((.+)\)$/);
  if (maxM) { const arr = evalPythonExpr(maxM[1], env); return Array.isArray(arr) ? Math.max(...arr) : arr; }
  const sumM = expr.match(/^sum\((.+)\)$/);
  if (sumM) { const arr = evalPythonExpr(sumM[1], env); return Array.isArray(arr) ? arr.reduce((a,b)=>a+b,0) : arr; }

  // abs(x)
  const absM = expr.match(/^abs\((.+)\)$/);
  if (absM) return Math.abs(Number(evalPythonExpr(absM[1], env)));

  // f-string: f"..." or f'...'
  const fstrM = expr.match(/^f["'](.*)["']$/s);
  if (fstrM) {
    return fstrM[1].replace(/\{([^}]+)\}/g, (_, e) => {
      // handle :.Xf format spec
      const fmtM = e.match(/^(.+?):(\.(\d+)f)$/);
      if (fmtM) {
        const val = evalPythonExpr(fmtM[1].trim(), env);
        return Number(val).toFixed(parseInt(fmtM[3]));
      }
      return String(evalPythonExpr(e.trim(), env));
    });
  }

  // Regular string
  if (/^".*"$/.test(expr) || /^'.*'$/.test(expr)) return expr.slice(1, -1);

  // Boolean
  if (expr === 'True') return true;
  if (expr === 'False') return false;
  if (expr === 'None') return null;

  // List literal [...]
  if (expr.startsWith('[') && expr.endsWith(']')) {
    const inner = expr.slice(1, -1).trim();
    if (!inner) return [];
    return splitArgs(inner).map(a => evalPythonExpr(a.trim(), env));
  }

  // Tuple (a, b)
  if (expr.startsWith('(') && expr.endsWith(')')) {
    const inner = expr.slice(1, -1).trim();
    if (!inner) return [];
    const parts = splitArgs(inner);
    if (parts.length > 1) return parts.map(a => evalPythonExpr(a.trim(), env));
    return evalPythonExpr(inner, env);
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);

  // Variable lookup
  if (/^[a-zA-Z_]\w*$/.test(expr) && expr in env) return env[expr];

  // Attribute/method: obj.method() or obj.attr
  const dotM = expr.match(/^([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)(?:\((.*)\))?$/);
  if (dotM) {
    const [, obj, attr, argsStr] = dotM;
    const objVal = evalPythonExpr(obj, env);
    if (argsStr !== undefined) {
      const args = argsStr ? splitArgs(argsStr).map(a => evalPythonExpr(a.trim(), env)) : [];
      if (typeof objVal === 'string') {
        if (attr === 'upper') return objVal.toUpperCase();
        if (attr === 'lower') return objVal.toLowerCase();
        if (attr === 'strip') return objVal.trim();
        if (attr === 'title') return objVal.replace(/\b\w/g, c => c.toUpperCase());
        if (attr === 'capitalize') return objVal.charAt(0).toUpperCase() + objVal.slice(1);
        if (attr === 'replace') return objVal.replaceAll(String(args[0]), String(args[1]));
        if (attr === 'split') return args[0] !== undefined ? objVal.split(String(args[0])) : objVal.split(' ');
        if (attr === 'join') return objVal === ',' ? args[0].join(',') : args[0].join(objVal);
        if (attr === 'format') return objVal.replace(/\{\}/g, () => String(args.shift()));
        if (attr === 'count') return objVal.split(String(args[0])).length - 1;
        if (attr === 'find') return objVal.indexOf(String(args[0]));
        if (attr === 'startswith') return objVal.startsWith(String(args[0]));
        if (attr === 'endswith') return objVal.endsWith(String(args[0]));
      }
      if (Array.isArray(objVal)) {
        if (attr === 'append') { objVal.push(args[0]); return null; }
        if (attr === 'pop') return args[0] !== undefined ? objVal.splice(args[0], 1)[0] : objVal.pop();
        if (attr === 'remove') { const idx = objVal.indexOf(args[0]); if (idx > -1) objVal.splice(idx, 1); return null; }
        if (attr === 'insert') { objVal.splice(args[0], 0, args[1]); return null; }
        if (attr === 'sort') { objVal.sort((a,b)=>a-b); return null; }
        if (attr === 'reverse') { objVal.reverse(); return null; }
        if (attr === 'count') return objVal.filter(x=>x===args[0]).length;
        if (attr === 'index') return objVal.indexOf(args[0]);
        if (attr === 'extend') { args[0].forEach(x=>objVal.push(x)); return null; }
        if (attr === 'clear') { objVal.length = 0; return null; }
        if (attr === 'copy') return [...objVal];
      }
    } else {
      // attribute access
      if (typeof objVal === 'string') {
        if (attr === 'upper') return objVal.toUpperCase();
        if (attr === 'lower') return objVal.toLowerCase();
        if (attr === 'strip') return objVal.trim();
      }
      if (Array.isArray(objVal)) {
        if (attr === 'length') return objVal.length;
      }
    }
  }

  // Indexing: var[n]
  const idxM = expr.match(/^([a-zA-Z_]\w*)\[(-?\d+)\]$/);
  if (idxM) {
    const arr = env[idxM[1]];
    const idx = parseInt(idxM[2]);
    if (Array.isArray(arr)) return idx < 0 ? arr[arr.length + idx] : arr[idx];
    if (typeof arr === 'string') return idx < 0 ? arr[arr.length + idx] : arr[idx];
  }

  // Slicing: var[a:b]
  const sliceM = expr.match(/^([a-zA-Z_]\w*)\[(-?\d*):(-?\d*)\]$/);
  if (sliceM) {
    const val = env[sliceM[1]];
    const start = sliceM[2] ? parseInt(sliceM[2]) : 0;
    const end = sliceM[3] ? parseInt(sliceM[3]) : undefined;
    if (typeof val === 'string') return val.slice(start, end);
    if (Array.isArray(val)) return val.slice(start, end);
  }

  // Arithmetic — safe eval with math ops only
  try {
    // Replace Python operators with JS
    let jsExpr = expr
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\*\*/g, '**')
      .replace(/\/\//g, 'Math.trunc(') // partial — handled below
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!');

    // Replace floor division properly: a // b → Math.floor(a/b)
    jsExpr = expr.replace(/\*\*/g, '**');
    // Substitute known variables
    jsExpr = jsExpr.replace(/\b([a-zA-Z_]\w*)\b/g, (m) => {
      if (m in env) {
        const v = env[m];
        if (typeof v === 'string') return JSON.stringify(v);
        if (v === true) return 'true';
        if (v === false) return 'false';
        if (v === null) return 'null';
        if (Array.isArray(v)) return JSON.stringify(v);
        return v;
      }
      return m;
    });
    // floor division
    jsExpr = jsExpr.replace(/(\S+)\s*\/\/\s*(\S+)/g, 'Math.floor($1/$2)');
    // eslint-disable-next-line no-new-func
    return new Function(`return (${jsExpr});`)();
  } catch {
    return expr; // return as string if unparseable
  }
}

function evalPythonCondition(cond, env) {
  try {
    return Boolean(evalPythonExpr(cond, env));
  } catch {
    return false;
  }
}

// ── Evaluate print() call ─────────────────────────────────
function evalPrint(line, env) {
  // Extract args from print(...)
  const inner = line.replace(/^print\(/, '').replace(/\)$/, '').trim();
  if (!inner) return '';

  const args = splitArgs(inner);
  const sep = ' '; // default separator
  const parts = [];

  for (const arg of args) {
    const trimmed = arg.trim();
    // skip end=... sep=... keyword args
    if (trimmed.startsWith('end=') || trimmed.startsWith('sep=')) continue;
    const val = evalPythonExpr(trimmed, env);
    parts.push(formatPythonValue(val));
  }

  return parts.join(sep);
}

function formatPythonValue(v) {
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (v === null) return 'None';
  if (Array.isArray(v)) return '[' + v.map(x => {
    if (typeof x === 'string') return `'${x}'`;
    return formatPythonValue(x);
  }).join(', ') + ']';
  if (typeof v === 'number') {
    // match Python's float display
    if (Number.isInteger(v)) return String(v);
    return String(v);
  }
  return String(v);
}

// ── Split function arguments respecting nesting ───────────
function splitArgs(str) {
  const args = [];
  let depth = 0;
  let cur = '';
  let inStr = false;
  let strChar = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inStr) {
      cur += ch;
      if (ch === strChar && str[i-1] !== '\\') inStr = false;
    } else if (ch === '"' || ch === "'") {
      inStr = true; strChar = ch; cur += ch;
    } else if (ch === '(' || ch === '[' || ch === '{') {
      depth++; cur += ch;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth--; cur += ch;
    } else if (ch === ',' && depth === 0) {
      args.push(cur.trim()); cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

// ── Main export ───────────────────────────────────────────
export function executeCode(langId, code) {
  if (!code || !code.trim()) return { output: '', error: 'No code to run' };

  if (langId === 'javascript' || langId === 'fullstack') {
    return runJavaScript(code);
  }
  if (langId === 'python') {
    return runPython(code);
  }
  // HTML/CSS — can't run, return placeholder
  return { output: '(HTML/CSS preview not available in this context)', error: null };
}

// ── Normalize output for comparison ──────────────────────
// Strips trailing whitespace, normalises line endings
export function normalizeOutput(str) {
  if (!str) return '';
  return str
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .trim();
}
