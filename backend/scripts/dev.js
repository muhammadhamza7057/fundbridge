const path = require('path');
const { spawnSync } = require('child_process');
const nodemon = require('nodemon');

const backendRoot = path.resolve(__dirname, '..');

function runPowerShell(command) {
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], {
    cwd: backendRoot,
    encoding: 'utf8',
    windowsHide: true,
  });

  return (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectBackendPids() {
  return runPowerShell(`Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*server.js*' -and $_.ProcessId -ne ${process.pid} } | Select-Object -ExpandProperty ProcessId`)
    .filter((pid) => /^\d+$/.test(pid));
}

function killPid(pid) {
  spawnSync('taskkill', ['/PID', String(pid), '/F'], {
    cwd: backendRoot,
    stdio: 'ignore',
    windowsHide: true,
  });
}

const stalePids = [...new Set(collectBackendPids())];
if (stalePids.length > 0) {
  stalePids.forEach(killPid);
  console.log(`Stopped stale backend process${stalePids.length > 1 ? 'es' : ''}: ${stalePids.join(', ')}`);
}

nodemon({
  script: 'server.js',
  cwd: backendRoot,
  watch: ['server.js', 'routes', 'controllers', 'models', 'middleware', 'config', 'scripts'],
  ext: 'js,mjs,cjs,json',
  env: process.env,
});

nodemon.on('start', () => {
  console.log('nodemon started');
});

nodemon.on('quit', () => {
  process.exit(0);
});

nodemon.on('crash', () => {
  process.exit(1);
});
