// AURORA Zero-Dependency Multi-Process Orchestrator
// Runs Harness, Proxy Backend, and Dashboard concurrently with colored logs

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const viteBin = path.join(__dirname, 'dashboard', 'node_modules', 'vite', 'bin', 'vite.js');
const pythonBin = process.platform === 'win32'
  ? 'C:\\Users\\Divyanshu\\anaconda3\\python.exe'
  : 'python3';

const SERVICES = [
  {
    name: 'HARNESS',
    color: COLORS.cyan,
    cmd: process.execPath,
    args: ['index.js'],
    cwd: path.join(__dirname, 'harness'),
  },
  {
    name: 'PROXY',
    color: COLORS.magenta,
    cmd: pythonBin,
    args: ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8082', '--reload'],
    cwd: path.join(__dirname, 'proxy'),
  },
  {
    name: 'UI',
    color: COLORS.yellow,
    cmd: process.execPath,
    args: [viteBin],
    cwd: path.join(__dirname, 'dashboard'),
  },
];

console.log(`${COLORS.bold}${COLORS.cyan}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.cyan}║   ⚡ AURORA — Unified Claude Code Proxy Platform           ║${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.cyan}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);
console.log(`${COLORS.gray}Starting Harness (20128), Proxy (8082), and Dashboard (5173)...${COLORS.reset}\n`);

const children = [];

function killAll() {
  console.log(`\n${COLORS.yellow}⚡ Shutting down AURORA services...${COLORS.reset}`);
  for (const child of children) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', child.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // Process might already be dead
    }
  }
  process.exit(0);
}

process.on('SIGINT', killAll);
process.on('SIGTERM', killAll);

for (const svc of SERVICES) {
  const prefix = `${svc.color}[${svc.name.padEnd(7)}]${COLORS.reset} `;

  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  children.push(child);

  child.stdout?.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`${prefix}${line}`);
      }
    }
  });

  child.stderr?.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.error(`${prefix}${line}`);
      }
    }
  });

  child.on('error', (err) => {
    console.error(`${prefix}${COLORS.red}Failed to start: ${err.message}${COLORS.reset}`);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${prefix}${COLORS.red}Exited with code ${code}${COLORS.reset}`);
    }
  });
}
