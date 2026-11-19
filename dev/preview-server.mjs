#!/usr/bin/env node
/**
 * Local preview server for the Houshou Marine sub-bot page.
 * Serves the static site and a small in-memory mock of the real API,
 * so the whole flow (QR, crew manifest, reviews) can be tested offline.
 *
 * Usage: node dev/preview-server.mjs [port]
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 4173;

const crew = [
  { name: 'Houshou Marine', number: '51900000001', vip: true, pic: 'assets/img/marine-480.webp' },
  { name: 'Kaito', number: '51987654321', vip: true },
  { name: 'Nicolás', number: '5491123456789', vip: true },
  { name: 'Mika', number: '51911223344', vip: true },
  { name: 'Sora', number: '573001234567', vip: false },
  { name: 'Lucía', number: '34600112233', vip: false },
  { name: 'Diego', number: '51944556677', vip: false },
  { name: 'Ren', number: '819012345678', vip: false },
];

const reviews = [
  {
    name: 'Nicolás',
    date: '2026.11.18',
    message:
      'Llevo tres semanas con el sub-bot VIP y no se ha caído ni una vez. La reconexión hace su trabajo.',
    reply: 'Gracias, Nicolás. Ese es justo el rumbo: que el barco no se quede a la deriva.',
  },
  {
    name: 'Mika',
    date: '2026.11.15',
    message:
      'El QR salió a la primera. Lo único que pediría es un aviso cuando el código expira, por si uno se distrae.',
    reply: 'Anotado en la bitácora. El código se renueva solo; mantenla abierta y no tendrás que hacer nada.',
  },
  {
    name: 'Anónimo',
    date: '2026.11.11',
    message:
      '¿El .serbot normal también funciona en grupos? Quiero probarlo antes de pasarme al VIP.',
    reply: '',
  },
  {
    name: 'Diego',
    date: '2026.11.07',
    message: 'Conectado desde Arequipa, todo fino. Ahoy!',
    reply: 'Ahoy, Diego. Bienvenido a cubierta.',
  },
];

const starts = new Map();
const connected = new Set();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
};

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

/* A deterministic, QR-looking SVG for the preview (not scannable). */
function qrMock(seed) {
  const n = 33;
  let s = 2166136261;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return Math.abs(s % 1000) / 1000;
  };
  for (const char of String(seed)) s = (s * 33) ^ char.charCodeAt(0);

  const cells = [];
  const isFinder = (x, y) =>
    (x < 9 && y < 9) || (x > n - 10 && y < 9) || (x < 9 && y > n - 10);
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || core) cells.push([ox + x, oy + y]);
      }
    }
  };

  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (isFinder(x, y)) continue;
      if (rand() > 0.52) cells.push([x, y]);
    }
  }
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);

  const rects = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><g fill="#132a2f">${rects}</g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;

  if (pathname === '/api/list' && req.method === 'GET') {
    return json(res, 200, { list: crew });
  }

  if (pathname === '/api/start' && req.method === 'POST') {
    const body = await readBody(req);
    const number = String(body.number || '').replace(/\D/g, '');
    if (number.length < 8 || number.length > 15) {
      return json(res, 400, { error: 'Número inválido' });
    }
    starts.set(number, Date.now());
    return json(res, 200, { ok: true });
  }

  if (pathname === '/api/qr' && req.method === 'GET') {
    const number = url.searchParams.get('number') || 'preview';
    return json(res, 200, { qr: qrMock(number) });
  }

  if (pathname === '/api/status' && req.method === 'GET') {
    const number = url.searchParams.get('number') || '';
    const startedAt = starts.get(number);
    const isConnected = startedAt ? Date.now() - startedAt > 6000 : false;
    if (isConnected && !connected.has(number)) {
      connected.add(number);
      if (!crew.some((member) => member.number === number)) {
        crew.push({ name: `Sub-bot ${number.slice(-4)}`, number, vip: true });
      }
    }
    return json(res, 200, { connected: isConnected });
  }

  if (pathname === '/api/reviews' && req.method === 'GET') {
    const sorted = [...reviews].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return json(res, 200, { reviews: sorted });
  }

  if (pathname === '/api/reviews' && req.method === 'POST') {
    const body = await readBody(req);
    if (!String(body.message || '').trim()) {
      return json(res, 400, { error: 'Mensaje vacío' });
    }
    const now = new Date();
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    reviews.push({
      name: String(body.name || 'Anónimo').slice(0, 40),
      date,
      message: String(body.message).slice(0, 500),
      reply: '',
    });
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: 'Ruta de API desconocida' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }

    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    const filePath = path.join(ROOT, path.normalize(pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const content = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
});

server.listen(PORT, () => {
  console.log(`Carta de embarque en http://localhost:${PORT}`);
});
