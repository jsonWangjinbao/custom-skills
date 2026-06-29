import http from 'http';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DEBUG_ID = process.argv[2];
const PORT = parseInt(process.argv[3] || '19999', 10);

if (!DEBUG_ID) {
  console.error('Usage: node server.mjs <DEBUG_ID> [PORT]');
  process.exit(1);
}

const LOG_DIR = join(process.cwd(), '.claude', 'auto-debug');

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = join(LOG_DIR, `${DEBUG_ID}.log`);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        appendFileSync(LOG_FILE, body + '\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', debugId: DEBUG_ID, port: PORT }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`[auto-debug] server started: port=${PORT} id=${DEBUG_ID} log=${LOG_FILE}`);
  const pidFile = join(LOG_DIR, `${DEBUG_ID}.pid`);
  appendFileSync(pidFile, String(process.pid));
});
