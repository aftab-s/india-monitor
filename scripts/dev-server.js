// LOCAL DEV SERVER — mirrors the Vercel serverless function environment
// Routes any /api/<name> request to api/<name>.js dynamically.
// Also loads .env so API keys (like INDIAN_API_KEY) are available via process.env.
import http from 'http';
import { URL, pathToFileURL } from 'url';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load .env into process.env ────────────────────────────────
try {
  const env = readFileSync(resolve(ROOT, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
  console.log('[dev-server] .env loaded');
} catch {
  console.warn('[dev-server] No .env file found — skipping');
}

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname  = parsedUrl.pathname; // e.g. /api/news or /api/fuel

  // Extract handler name: /api/news → news, /api/fuel → fuel
  const match = pathname.match(/^\/api\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const handlerName = match[1];
  const handlerPath = resolve(ROOT, 'api', `${handlerName}.js`);

  // Build a minimal req/res compatible with the Vercel handler signature
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  res.status = (code) => { res.statusCode = code; return res; };
  res.json   = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    // Cache-bust so edits to handler files are picked up immediately.
    // Convert to file:// URL so dynamic import() works on Windows (rejects c:\... paths).
    const handlerUrl = `${pathToFileURL(handlerPath).href}?t=${Date.now()}`;
    const { default: handler } = await import(handlerUrl);
    await handler(req, res);
    console.log(`[dev-server] ${req.method} ${pathname} → api/${handlerName}.js`);
  } catch (err) {
    console.error(`[dev-server] Error in api/${handlerName}.js:`, err.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[dev-server] API running at http://localhost:${PORT}/api/*`);
});
