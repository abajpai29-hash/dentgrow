// Starts an SSH tunnel via serveo.net to expose the backend publicly
// Run with pm2: pm2 start tunnel.js --name dentgrow-tunnel
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const KEY_PATH = path.join(process.env.USERPROFILE || process.env.HOME, '.ssh', 'dentgrow_tunnel');
const PORT = process.env.PORT || 3001;

const args = [
  '-i', KEY_PATH,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=30',
  '-o', 'ServerAliveCountMax=5',
  '-o', 'ExitOnForwardFailure=yes',
  '-R', `dentgrow-backend:80:localhost:${PORT}`,
  'serveo.net',
];

function startTunnel() {
  console.log('[tunnel] Starting SSH tunnel to serveo.net...');
  const proc = spawn('ssh', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.stdout.on('data', (d) => {
    const line = d.toString();
    process.stdout.write(line);
    const match = line.match(/https:\/\/\S+/);
    if (match) {
      console.log('\n[tunnel] Public URL:', match[0]);
    }
  });

  proc.stderr.on('data', (d) => process.stderr.write(d.toString()));

  proc.on('exit', (code) => {
    console.log(`[tunnel] Exited (${code}), restarting in 5s...`);
    setTimeout(startTunnel, 5000);
  });
}

startTunnel();
