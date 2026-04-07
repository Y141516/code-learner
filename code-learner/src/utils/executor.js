// ─────────────────────────────────────────────────────────
//  Code Executor — Code Learner Tab 2
//
//  Python     → Pyodide (runs real CPython in the browser, zero API)
//  JavaScript → Browser Function() execution (instant)
//  Java       → Judge0 via allorigins CORS proxy (free)
//  HTML/CSS   → iframe srcdoc (instant)
// ─────────────────────────────────────────────────────────

// ── Normalise for challenge comparison ───────────────────
export function normalizeOutput(str) {
  if (!str) return '';
  return str.split('\n').map(l => l.trimEnd()).join('\n').trim();
}

// ── Detect stdin usage ────────────────────────────────────
export function needsStdin(langId, code) {
  if (langId === 'python')     return /\binput\s*\(/.test(code);
  if (langId === 'javascript') return /readline|process\.stdin/.test(code);
  if (langId === 'java')       return /Scanner|BufferedReader|System\.in/.test(code);
  return false;
}

// ─────────────────────────────────────────────────────────
//  JAVASCRIPT — Browser execution (no API, instant)
// ─────────────────────────────────────────────────────────
export function runJavaScript(code) {
  const logs = [];
  const con = {
    log:   (...a) => logs.push(a.map(fmt).join(' ')),
    error: (...a) => logs.push('\x1b[31m' + a.map(fmt).join(' ') + '\x1b[0m'),
    warn:  (...a) => logs.push('\x1b[33m' + a.map(fmt).join(' ') + '\x1b[0m'),
    info:  (...a) => logs.push(a.map(fmt).join(' ')),
    dir:   (v)    => logs.push(JSON.stringify(v, null, 2)),
    table: (v)    => logs.push(JSON.stringify(v, null, 2)),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function('console', code)(con);
    return { stdout: logs.join('\n'), stderr: '', exitCode: 0 };
  } catch (e) {
    return { stdout: logs.join('\n'), stderr: e.message, exitCode: 1 };
  }
}

function fmt(v) {
  if (v === null)       return 'null';
  if (v === undefined)  return 'undefined';
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}

// ─────────────────────────────────────────────────────────
//  HTML — iframe srcdoc
// ─────────────────────────────────────────────────────────
export function runHTML(code) {
  return { html: code };
}

// ─────────────────────────────────────────────────────────
//  PYTHON — Pyodide (real CPython in browser)
//  Loaded once from CDN, cached globally
// ─────────────────────────────────────────────────────────
let pyodideInstance = null;
let pyodideLoading  = false;
let pyodideReady    = false;
const pyodideQueue  = [];

async function getPyodide() {
  if (pyodideReady) return pyodideInstance;

  // Already loading — wait for it
  if (pyodideLoading) {
    return new Promise((resolve, reject) => {
      pyodideQueue.push({ resolve, reject });
    });
  }

  pyodideLoading = true;

  try {
    // Load Pyodide from CDN if not already on page
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        s.onload  = resolve;
        s.onerror = () => reject(new Error('Failed to load Pyodide script'));
        document.head.appendChild(s);
      });
    }

    pyodideInstance = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    });

    pyodideReady = true;
    pyodideQueue.forEach(p => p.resolve(pyodideInstance));
    pyodideQueue.length = 0;
    return pyodideInstance;
  } catch (err) {
    pyodideLoading = false;
    pyodideQueue.forEach(p => p.reject(err));
    pyodideQueue.length = 0;
    throw err;
  }
}

export async function runPython(code, stdin = '') {
  try {
    const pyodide = await getPyodide();

    // Patch stdin to use provided values
    const stdinLines = stdin ? stdin.split('\n').filter(Boolean) : [];
    let stdinIdx = 0;

    const capturedOutput = [];
    const capturedErrors = [];

    // Set up stdout/stderr capture and stdin mock
    pyodide.runPython(`
import sys
import io

class CaptureOutput:
    def __init__(self):
        self.data = []
    def write(self, text):
        self.data.append(text)
    def flush(self):
        pass
    def getvalue(self):
        return ''.join(self.data)

_stdout_capture = CaptureOutput()
_stderr_capture = CaptureOutput()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

    // Mock input() if stdin provided
    if (stdinLines.length > 0) {
      const stdinJson = JSON.stringify(stdinLines);
      pyodide.runPython(`
import builtins
_stdin_lines = ${stdinJson}
_stdin_idx = [0]
def _mock_input(prompt=''):
    sys.__stdout_orig = sys.__stdout__ if hasattr(sys, '__stdout__') else None
    if prompt:
        _stdout_capture.write(str(prompt))
    if _stdin_idx[0] < len(_stdin_lines):
        val = _stdin_lines[_stdin_idx[0]]
        _stdin_idx[0] += 1
        _stdout_capture.write(val + '\\n')
        return val
    return ''
builtins.input = _mock_input
`);
    }

    // Run user code
    try {
      await pyodide.runPythonAsync(code);
    } catch (pyErr) {
      // Python runtime error
      const stderr = pyodide.runPython('_stderr_capture.getvalue()') || pyErr.message;
      const stdout = pyodide.runPython('_stdout_capture.getvalue()');
      return { stdout: stdout.trimEnd(), stderr: cleanPyError(stderr), exitCode: 1 };
    }

    const stdout = pyodide.runPython('_stdout_capture.getvalue()');
    const stderr = pyodide.runPython('_stderr_capture.getvalue()');

    // Restore
    pyodide.runPython(`
sys.stdout = sys.__stdout__ if hasattr(sys, '__stdout__') else sys.stdout
sys.stderr = sys.__stderr__ if hasattr(sys, '__stderr__') else sys.stderr
`);

    return {
      stdout: stdout.trimEnd(),
      stderr: stderr ? cleanPyError(stderr) : '',
      exitCode: stderr ? 1 : 0,
    };

  } catch (loadErr) {
    return {
      stdout: '',
      stderr: `Pyodide failed to load: ${loadErr.message}\n\nMake sure you have an internet connection (needed once to download Python runtime ~10MB).`,
      exitCode: 1,
    };
  }
}

function cleanPyError(err) {
  // Remove Pyodide internal stack frames
  return err
    .split('\n')
    .filter(l => !l.includes('pyodide') && !l.includes('_run_python'))
    .join('\n')
    .trim();
}

export function isPyodideReady() { return pyodideReady; }
export function isPyodideLoading() { return pyodideLoading && !pyodideReady; }

// ─────────────────────────────────────────────────────────
//  JAVA — Judge0 via allorigins.win CORS proxy
// ─────────────────────────────────────────────────────────
const JUDGE0_ENDPOINT = 'https://judge0-ce.p.rapidapi.com';
// Public CORS proxy — wraps any URL
const PROXY = (url) =>
  `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

// Judge0 language IDs
const JAVA_LANG_ID = 62; // Java (OpenJDK 13)

export async function runJava(code, stdin = '') {
  // Auto-wrap in Main class if user just typed method body
  let src = code;
  if (!/public\s+class\s+\w+/.test(code)) {
    src = `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n${code.split('\n').map(l => '        ' + l).join('\n')}\n    }\n}`;
  }

  try {
    // Submit
    const submitUrl = `${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=true`;
    const res = await fetch(PROXY(submitUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: JAVA_LANG_ID,
        source_code:  src,
        stdin:         stdin || '',
        cpu_time_limit: 10,
        memory_limit:   512000,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const stdout     = (data.stdout       || '').trim();
    const stderr     = (data.stderr       || '').trim();
    const compileErr = (data.compile_output || '').trim();
    const exitCode   = data.exit_code ?? (data.status_id === 3 ? 0 : 1);

    if (compileErr) return { stdout, stderr: compileErr, exitCode: 1 };
    return { stdout, stderr: stderr || '', exitCode };

  } catch (err) {
    // Fallback: try direct Judge0 (may work in some network configs)
    try {
      const res2 = await fetch(`${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_id: JAVA_LANG_ID, source_code: src, stdin: stdin || '' }),
      });
      const data2 = await res2.json();
      return {
        stdout: (data2.stdout || '').trim(),
        stderr: (data2.stderr || data2.compile_output || '').trim(),
        exitCode: data2.status_id === 3 ? 0 : 1,
      };
    } catch {
      return {
        stdout: '',
        stderr: `Java execution failed.\n\nThis usually means:\n• No internet connection\n• The Judge0 API is temporarily down\n\nTip: Try refreshing and running again.`,
        exitCode: 1,
      };
    }
  }
}

// ─────────────────────────────────────────────────────────
//  UNIFIED RUN FUNCTION
// ─────────────────────────────────────────────────────────
export async function executeCode(langId, code, stdin = '') {
  switch (langId) {
    case 'python':     return runPython(code, stdin);
    case 'javascript': return runJavaScript(code);
    case 'java':       return runJava(code, stdin);
    case 'html':       return runHTML(code);
    default:           return { stdout: '', stderr: `Unknown language: ${langId}`, exitCode: 1 };
  }
}
