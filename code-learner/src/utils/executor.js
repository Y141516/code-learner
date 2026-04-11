// executor.js — handles JS, Java, HTML execution
// Python is handled directly in CodeExperimentTab via pyodide.worker.js

// ── JavaScript (browser, instant) ────────────────────────
export function runJavaScript(code) {
  const logs = [];
  const con = {
    log:   (...a) => logs.push(a.map(fmt).join(' ')),
    error: (...a) => logs.push('[error] ' + a.map(fmt).join(' ')),
    warn:  (...a) => logs.push('[warn]  ' + a.map(fmt).join(' ')),
    info:  (...a) => logs.push(a.map(fmt).join(' ')),
    dir:   (v)    => logs.push(JSON.stringify(v, null, 2)),
    table: (v)    => logs.push(JSON.stringify(v, null, 2)),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function('console', code)(con);
    return { lines: logs, exitCode: 0, error: null };
  } catch (e) {
    return { lines: logs, exitCode: 1, error: e.message };
  }
}

// ── HTML preview ─────────────────────────────────────────
export function runHTML(code) {
  return { html: code };
}

// ── Java via Judge0 CE (CORS proxy) ──────────────────────
const JUDGE0 = 'https://judge0-ce.p.rapidapi.com';
const PROXY  = (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
const JAVA_ID = 62;

export async function runJava(code, stdin = '') {
  // Auto-wrap if no class found
  let src = code;
  if (!/public\s+class\s+\w+/.test(code)) {
    src = [
      'import java.util.*;',
      'import java.io.*;',
      '',
      'public class Main {',
      '    public static void main(String[] args) throws Exception {',
      ...code.split('\n').map(l => '        ' + l),
      '    }',
      '}',
    ].join('\n');
  }

  const body = JSON.stringify({
    language_id: JAVA_ID,
    source_code: src,
    stdin:       stdin || '',
    cpu_time_limit: 10,
    memory_limit:   512000,
  });

  const tryFetch = async (url, opts) => {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };

  let data;
  try {
    data = await tryFetch(
      PROXY(`${JUDGE0}/submissions?base64_encoded=false&wait=true`),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
    );
  } catch {
    try {
      data = await tryFetch(
        `${JUDGE0}/submissions?base64_encoded=false&wait=true`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
      );
    } catch (err2) {
      return {
        lines: [],
        exitCode: 1,
        error: 'Java execution failed — check your internet connection and try again.',
      };
    }
  }

  const stdout     = (data.stdout        || '').trimEnd();
  const stderr     = (data.stderr        || '').trimEnd();
  const compileErr = (data.compile_output|| '').trimEnd();

  if (compileErr) return { lines: stdout ? [stdout] : [], exitCode: 1, error: compileErr };
  return {
    lines:    stdout ? stdout.split('\n') : [],
    exitCode: data.exit_code ?? (data.status_id === 3 ? 0 : 1),
    error:    stderr || null,
  };
}

// ── Normalise for challenge comparison ────────────────────
export function normalizeOutput(str) {
  if (!str) return '';
  return str.split('\n').map(l => l.trimEnd()).join('\n').trim();
}

function fmt(v) {
  if (v === null)       return 'null';
  if (v === undefined)  return 'undefined';
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
}
