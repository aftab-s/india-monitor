//LOCAL
import http from 'http';
import { URL } from 'url';
import handler from './news.js';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);

  // Only handle /api/news
  if (!parsedUrl.pathname.startsWith('/api/news')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Build a minimal req/res compatible with the Vercel handler signature
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Patch res to match Vercel's response API
  res.status = (code) => { res.statusCode = code; return res; };
  res.json   = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    await handler(req, res);
  } catch (err) {
    console.error('[dev-server] Error:', err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[dev-server] API running at http://localhost:${PORT}/api/news`);
});
