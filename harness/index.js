// AURORA Harness — Node.js CLI Gateway
// Binds to port 20128 (what Claude Code sees as Anthropic API)
// Forwards all /v1/* traffic to FastAPI proxy on port 8082
// Auto-exports ANTHROPIC_BASE_URL to current shell session

import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { WebSocketServer } from 'ws';
import http from 'http';
import chalk from 'chalk';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HARNESS_PORT = parseInt(process.env.HARNESS_PORT || '20128');
const PROXY_PORT   = parseInt(process.env.PROXY_PORT   || '8082');
const DASHBOARD_PORT = parseInt(process.env.DASHBOARD_PORT || '5173');
const WS_PORT      = parseInt(process.env.WS_PORT      || '8083');

const app = express();

// ─── Logging middleware ───────────────────────────────────────────────────────
app.use((req, _res, next) => {
  const ts = new Date().toISOString().slice(11, 23);
  const methodColor = req.method === 'POST' ? chalk.magenta : chalk.cyan;
  console.log(
    chalk.gray(`[${ts}]`) + ' ' +
    methodColor(req.method.padEnd(6)) + ' ' +
    chalk.white(req.path)
  );
  next();
});

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-api-key,anthropic-version,anthropic-beta');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'aurora_online',
    harness_port: HARNESS_PORT,
    proxy_port: PROXY_PORT,
    dashboard_port: DASHBOARD_PORT,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── Proxy all /v1/* to FastAPI backend ──────────────────────────────────────
app.use('/v1', createProxyMiddleware({
  target: `http://localhost:${PROXY_PORT}`,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error(chalk.red('[HARNESS] Proxy error:'), err.message);
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: { type: 'proxy_error', message: 'Aurora proxy backend unavailable. Is FastAPI running?' }
        }));
      }
    },
    proxyReq: (proxyReq, req) => {
      // Inject Aurora routing header so FastAPI knows source
      proxyReq.setHeader('X-Aurora-Source', 'harness');
    }
  }
}));

// ─── HTTP server ─────────────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── WebSocket event bridge (port 8083 for dashboard real-time feed) ─────────
const wss = new WebSocketServer({ port: WS_PORT });
const dashboardClients = new Set();

wss.on('connection', (ws) => {
  dashboardClients.add(ws);
  ws.on('close', () => dashboardClients.delete(ws));
});

// Export broadcast so proxy events can reach dashboard
export function broadcastEvent(event) {
  const payload = JSON.stringify(event);
  dashboardClients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

// ─── Startup banner ──────────────────────────────────────────────────────────
server.listen(HARNESS_PORT, () => {
  console.log('\n' + chalk.cyan('╔══════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.yellow('  ⚡ AURORA — Unified Claude Code Proxy Platform  ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.green('  ✓ Harness Gateway:  ') + chalk.white(`http://localhost:${HARNESS_PORT}/v1`));
  console.log(chalk.green('  ✓ Proxy Backend:    ') + chalk.white(`http://localhost:${PROXY_PORT}`));
  console.log(chalk.green('  ✓ Dashboard:        ') + chalk.white(`http://localhost:${DASHBOARD_PORT}`));
  console.log(chalk.green('  ✓ WebSocket Events: ') + chalk.white(`ws://localhost:${WS_PORT}`));
  console.log('');
  console.log(chalk.bold.cyan('  ══ Point Claude Code here: ══'));
  console.log(chalk.yellow(`  export ANTHROPIC_BASE_URL="http://localhost:${HARNESS_PORT}/v1"`));
  console.log(chalk.yellow(`  export ANTHROPIC_API_KEY="aurora-free-forever"`));
  console.log('');
  console.log(chalk.gray('  Press Ctrl+C to stop AURORA'));
  console.log('');

  // Auto-open dashboard
  if (process.env.AURORA_AUTO_OPEN_BROWSER !== 'false') {
    setTimeout(() => open(`http://localhost:${DASHBOARD_PORT}`), 3000);
  }
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n' + chalk.yellow('  ⚡ AURORA shutting down...'));
  server.close(() => process.exit(0));
});

