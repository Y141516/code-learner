// pyodide.worker.js — runs in a Web Worker
// Handles: real Python execution, streaming stdout, interactive input()
// Communication: postMessage to/from main thread

importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');

let pyodide = null;
let inputResolve = null; // resolve function waiting for user input

// ── Bootstrap Pyodide ─────────────────────────────────────
async function initPyodide() {
  if (pyodide) return pyodide;
  self.postMessage({ type: 'status', text: 'Loading Python runtime…' });
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    stdout: (text) => {
      // Stream each stdout line to main thread immediately
      self.postMessage({ type: 'stdout', text });
    },
    stderr: (text) => {
      self.postMessage({ type: 'stderr', text });
    },
  });
  self.postMessage({ type: 'ready' });
  return pyodide;
}

// ── Install the Python-side input() hook ─────────────────
function installInputHook(py) {
  py.runPython(`
import sys
import builtins

class _StreamingStdout:
    def write(self, text):
        from js import postMessageToMain
        postMessageToMain(text, 'stdout')
    def flush(self):
        pass

# Keep reference to originals
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr

def _blocking_input(prompt=''):
    """Send prompt to terminal, then block until main thread sends a line."""
    import js
    js.requestInputFromMain(str(prompt))
    # This will be replaced by the actual blocking mechanism via asyncio
    raise NotImplementedError("Use async version")

builtins.input = _blocking_input
`);
}

// ── Run Python code ───────────────────────────────────────
async function runCode(code) {
  const py = await initPyodide();

  // Set up JS↔Python bridges
  py.globals.set('_worker_self', self);

  // Override stdout/stderr to stream to main thread
  py.runPython(`
import sys, builtins, traceback

class _TermStream:
    def __init__(self, kind):
        self.kind = kind
        self._buf = ''
    def write(self, text):
        import _worker_bridge
        _worker_bridge.send(self.kind, text)
    def flush(self):
        pass
    def isatty(self):
        return True

class _WorkerBridge:
    def send(self, kind, text):
        import js
        js._workerSend(kind, text)
    def request_input(self, prompt):
        import js
        js._workerRequestInput(prompt)

import sys
_worker_bridge = _WorkerBridge()
sys.stdout = _TermStream('stdout')
sys.stderr = _TermStream('stderr')
`);

  // Expose JS functions to Python
  py.globals.set('_workerSend', (kind, text) => {
    self.postMessage({ type: kind, text: String(text) });
  });

  py.globals.set('_workerRequestInput', (prompt) => {
    self.postMessage({ type: 'input_request', prompt: String(prompt) });
  });

  // Async input implementation using Python asyncio + JS Promise bridge
  py.runPython(`
import asyncio
import builtins

_input_queue = asyncio.Queue()

async def _async_input(prompt=''):
    sys.stdout.write(str(prompt))
    sys.stdout.flush()
    # Signal JS we need input
    import js
    js._workerRequestInput('')
    # Wait for the value to come back
    value = await _input_queue.get()
    sys.stdout.write(value + '\\n')
    sys.stdout.flush()
    return value

builtins.input = lambda prompt='': asyncio.get_event_loop().run_until_complete(_async_input(prompt))
`);

  // Store queue ref so we can push to it
  const inputQueue = py.globals.get('_input_queue');

  // Listen for input responses from main thread
  self._pendingInputQueue = inputQueue;

  // Run the user's code
  try {
    self.postMessage({ type: 'run_start' });
    await py.runPythonAsync(code);
    self.postMessage({ type: 'run_done', exitCode: 0 });
  } catch (err) {
    // Clean up Python traceback — remove pyodide internals
    const msg = String(err.message || err)
      .split('\n')
      .filter(l =>
        !l.includes('File "<exec>"') ||
        !l.trim().startsWith('at ') &&
        !l.includes('pyodide') &&
        !l.includes('_pyodide')
      )
      .join('\n')
      .trim();
    self.postMessage({ type: 'stderr', text: '\n' + msg });
    self.postMessage({ type: 'run_done', exitCode: 1 });
  }
}

// ── Message handler ───────────────────────────────────────
self.onmessage = async (e) => {
  const { type, code, value } = e.data;

  if (type === 'init') {
    await initPyodide();
  }

  if (type === 'run') {
    await runCode(code);
  }

  if (type === 'input_response') {
    // User typed something — push into Python's asyncio queue
    if (self._pendingInputQueue) {
      try {
        self._pendingInputQueue.put_nowait(value || '');
      } catch (err) {
        // queue might be gone, ignore
      }
    }
  }
};

// Auto-init on load
initPyodide();
