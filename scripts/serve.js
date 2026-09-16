import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
const root = path.resolve(process.argv[2] || '.');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.pdf':'application/pdf', '.txt':'text/plain; charset=utf-8', '.woff2':'font/woff2', '.ttf':'font/ttf', '.otf':'font/otf', '.webp':'image/webp', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + path.sep) || pathname.split('/').some(s => s.startsWith('.'))) {
      res.writeHead(403).end('Acesso negado'); return;
    }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Arquivo não encontrado');
  }
}).listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log(`Quiz disponível em http://localhost:${process.env.PORT || 5173}`));
