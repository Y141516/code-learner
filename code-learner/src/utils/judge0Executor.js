// ─────────────────────────────────────────────────────────
//  Judge0 CE — Free public API, no key required
//  https://judge0.com/  |  https://ce.judge0.com/
//  Supports: Python 3, JavaScript (Node), Java, C++, etc.
// ─────────────────────────────────────────────────────────

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';

// Language IDs for Judge0 CE
// Full list: GET /languages
const LANG_IDS = {
  python:     71,   // Python 3.8.1
  javascript: 63,   // JavaScript (Node.js 12.14.0)
  java:       62,   // Java (OpenJDK 13.0.1)
};

// Normalise output for comparison (used by LessonsTab)
export function normalizeOutput(str) {
  if (!str) return '';
  return str.split('\n').map(l => l.trimEnd()).join('\n').trim();
}

// Detect if code uses input() / Scanner / readline
export function detectsInput(langId, code) {
  if (!code) return false;
  if (langId === 'python')     return /\binput\s*\(/.test(code);
  if (langId === 'javascript') return /readline|process\.stdin/.test(code);
  if (langId === 'java')       return /Scanner|BufferedReader|System\.in/.test(code);
  return false;
}

// ── Execute via Judge0 CE (no API key needed) ─────────────
export async function executeCode(langId, code, stdin = '') {
  const languageId = LANG_IDS[langId];
  if (!languageId) {
    return { output: '', error: `Language "${langId}" not supported.` };
  }

  // For Java — auto-wrap if no class found
  let finalCode = code;
  if (langId === 'java' && !/public\s+class\s+\w+/.test(code)) {
    finalCode = `public class Main {\n    public static void main(String[] args) throws Exception {\n${code.split('\n').map(l => '        ' + l).join('\n')}\n    }\n}`;
  }

  try {
    // Step 1: Submit
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: finalCode,
        stdin: stdin || '',
      }),
    });

    if (!submitRes.ok) {
      const text = await submitRes.text();
      // Fallback to alternative endpoint if RapidAPI fails
      return await executeViaAlternative(langId, finalCode, stdin);
    }

    const { token } = await submitRes.json();

    // Step 2: Poll for result (max 15 attempts × 800ms = 12s)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 800));
      const res = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        { headers: { 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' } }
      );
      if (!res.ok) continue;
      const data = await res.json();

      // status_id: 1=queued, 2=processing, 3=accepted, 4+=error
      if (data.status_id <= 2) continue;

      const stdout = data.stdout || '';
      const stderr = data.stderr || '';
      const compileErr = data.compile_output || '';

      if (compileErr) return { output: stdout, error: compileErr.trim() };
      if (data.status_id === 3) return { output: stdout.trim(), error: stderr ? stderr.trim() : null };
      return { output: stdout, error: (stderr || data.status?.description || 'Runtime error').trim() };
    }
    return { output: '', error: 'Execution timed out.' };

  } catch (err) {
    if (err.message?.includes('fetch') || err.message?.includes('network')) {
      return await executeViaAlternative(langId, finalCode, stdin);
    }
    return { output: '', error: err.message };
  }
}

// ── Alternative: Glot.io (backup free executor) ───────────
async function executeViaAlternative(langId, code, stdin) {
  const glotLangs = { python: 'python', javascript: 'javascript', java: 'java' };
  const glotLang = glotLangs[langId];
  const ext = { python: 'py', javascript: 'js', java: 'java' }[langId];
  const filename = langId === 'java'
    ? (code.match(/public\s+class\s+(\w+)/)?.[1] || 'Main') + '.java'
    : `main.${ext}`;

  try {
    const res = await fetch('https://run.glot.io/languages/' + glotLang + '/latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Token null' },
      body: JSON.stringify({ files: [{ name: filename, content: code }], stdin }),
    });
    if (!res.ok) return await executeViaJDoodle(langId, code, stdin);
    const data = await res.json();
    const out = data.stdout || '';
    const err = data.stderr || '';
    return { output: out.trim(), error: err ? err.trim() : null };
  } catch {
    return await executeViaJDoodle(langId, code, stdin);
  }
}

// ── Second fallback: JDoodle compiler API ─────────────────
async function executeViaJDoodle(langId, code, stdin) {
  // Public CORS proxy to JDoodle
  const versionIndex = { python: '3', javascript: '3', java: '3' };
  const langMap = { python: 'python3', javascript: 'nodejs', java: 'java' };

  try {
    const res = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: code,
        language: langMap[langId],
        versionIndex: versionIndex[langId],
        stdin: stdin,
        clientId: '7a45cf6b6f3a9a03d2a4fdb0e0ef40b9',
        clientSecret: '7c1c3ec4a0fc9e0e1a84d8e2b5b3e0c6d1a5f2b8e3d6c9f0a2b5e8c1d4f7a0b',
      }),
    });
    if (!res.ok) throw new Error('JDoodle failed');
    const data = await res.json();
    if (data.error) return { output: '', error: data.error };
    return { output: (data.output || '').trim(), error: null };
  } catch {
    return {
      output: '',
      error: 'All execution APIs are currently unreachable.\n\nPlease check your internet connection.\n\nFor JavaScript and HTML, code runs locally in your browser instantly.\nFor Python and Java, an internet connection is required.',
    };
  }
}

// ── Browser JS executor (no API needed — instant) ─────────
export function executeJSInBrowser(code) {
  const logs = [];
  const fakeConsole = {
    log:   (...a) => logs.push(a.map(fmtVal).join(' ')),
    error: (...a) => logs.push('[error] ' + a.map(fmtVal).join(' ')),
    warn:  (...a) => logs.push('[warn]  ' + a.map(fmtVal).join(' ')),
    info:  (...a) => logs.push(a.map(fmtVal).join(' ')),
    dir:   (v)    => logs.push(JSON.stringify(v, null, 2)),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function('console', code)(fakeConsole);
    return { output: logs.join('\n') || '(no output)', error: null };
  } catch (e) {
    return { output: logs.join('\n'), error: e.message };
  }
}

// ── HTML execution ────────────────────────────────────────
export function executeHTML(code) {
  return { output: code, isHTML: true, error: null };
}

function fmtVal(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}
