// ─────────────────────────────────────────────────────────
//  Piston API Executor
//  Real code execution — supports imports, all stdlib
//  https://emkc.org/api/v2/piston/execute
// ─────────────────────────────────────────────────────────

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// Language config: piston runtime name + version
export const PISTON_LANGS = {
  python:     { language: 'python',     version: '3.10.0',  ext: 'py'   },
  javascript: { language: 'javascript', version: '18.15.0', ext: 'js'   },
  java:       { language: 'java',       version: '15.0.2',  ext: 'java' },
};

// ── Detect if code uses input() / Scanner etc ────────────
export function detectsInput(langId, code) {
  if (!code) return false;
  if (langId === 'python') {
    return /\binput\s*\(/.test(code);
  }
  if (langId === 'javascript') {
    // readline, prompt etc
    return /readline|process\.stdin|prompt\s*\(/.test(code);
  }
  if (langId === 'java') {
    return /Scanner|BufferedReader|System\.in/.test(code);
  }
  return false;
}

// ── Execute via Piston API ────────────────────────────────
export async function executeViaPiston(langId, code, stdin = '') {
  const config = PISTON_LANGS[langId];
  if (!config) {
    return { output: '', error: `Language "${langId}" not supported via Piston.` };
  }

  const filename = langId === 'java'
    ? extractJavaClassName(code) + '.java'
    : `main.${config.ext}`;

  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version:  config.version,
        files:    [{ name: filename, content: code }],
        stdin:    stdin,
        run_timeout: 10000,
        compile_timeout: 10000,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { output: '', error: `API error ${res.status}: ${text}` };
    }

    const data = await res.json();
    const runStage = data.run || {};
    const compileStage = data.compile || {};

    // Compile error (Java etc.)
    if (compileStage.stderr && compileStage.code !== 0) {
      return {
        output: compileStage.stdout || '',
        error: compileStage.stderr,
      };
    }

    // Runtime output
    const stdout = runStage.stdout || '';
    const stderr = runStage.stderr || '';
    const exitCode = runStage.code ?? 0;

    if (stderr && exitCode !== 0) {
      return { output: stdout, error: stderr };
    }

    // stderr but exit 0 = warnings, show with output
    const combined = stdout + (stderr ? `\n⚠️ ${stderr}` : '');
    return { output: combined.trim(), error: null };

  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return {
        output: '',
        error: 'Network error — cannot reach Piston API. Check your internet connection.',
      };
    }
    return { output: '', error: err.message };
  }
}

// ── HTML execution (browser iframe only) ─────────────────
export function executeHTML(code) {
  return { output: code, isHTML: true, error: null };
}

// ── Helper: extract Java class name ──────────────────────
function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : 'Main';
}

// ── Normalize output for challenge comparison ─────────────
export function normalizeOutput(str) {
  if (!str) return '';
  return str
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .trim();
}

// ── Simple browser-based JS fallback (no API needed) ─────
export function executeJSInBrowser(code) {
  const logs = [];
  const fakeConsole = {
    log:   (...a) => logs.push(a.map(v => fmtVal(v)).join(' ')),
    error: (...a) => logs.push('[error] ' + a.map(v => fmtVal(v)).join(' ')),
    warn:  (...a) => logs.push('[warn]  ' + a.map(v => fmtVal(v)).join(' ')),
    info:  (...a) => logs.push(a.map(v => fmtVal(v)).join(' ')),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function('console', code)(fakeConsole);
    return { output: logs.join('\n') || '(no output)', error: null };
  } catch (e) {
    return { output: logs.join('\n'), error: e.message };
  }
}

function fmtVal(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}
