// Manages SSH tunnel to serveo.net and auto-updates the public URL in GitHub
// pm2 start tunnel.js --name dentgrow-tunnel
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const KEY_PATH = path.join(process.env.USERPROFILE || os.homedir(), '.ssh', 'dentgrow_tunnel');
const PORT = process.env.PORT || 3001;
const REPO = 'abajpai29/dentgrow';
const URL_FILE = 'public-url.txt';

// Strip ANSI escape codes
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '').trim();
}

function findGh() {
  for (const c of ['gh', 'C:\\Program Files\\GitHub CLI\\gh.exe']) {
    try { execSync(`"${c}" --version`, { stdio: 'ignore' }); return c; } catch {}
  }
  return null;
}

function pushUrlToGitHub(tunnelUrl) {
  const gh = findGh();
  if (!gh) { console.log('[tunnel] gh not found, skipping update'); return; }
  try {
    // Get current SHA of the file
    let sha = '';
    try {
      sha = execSync(
        `"${gh}" api repos/${REPO}/contents/${URL_FILE} --jq .sha`,
        { encoding: 'utf8' }
      ).trim().replace(/"/g, '');
    } catch {}

    const content = Buffer.from(tunnelUrl + '\n').toString('base64');
    const body = { message: 'ci: update tunnel URL', content };
    if (sha) body.sha = sha;

    const tempFile = path.join(os.tmpdir(), 'gh-body.json');
    fs.writeFileSync(tempFile, JSON.stringify(body));

    execSync(
      `"${gh}" api repos/${REPO}/contents/${URL_FILE} --method PUT --input "${tempFile}"`,
      { stdio: 'pipe' }
    );
    console.log(`[tunnel] ✓ GitHub updated → ${tunnelUrl}`);
  } catch (e) {
    console.log('[tunnel] GitHub update failed:', e.message.split('\n')[0]);
  }
}

const SSH_ARGS = [
  '-i', KEY_PATH,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=30',
  '-o', 'ServerAliveCountMax=5',
  '-o', 'ExitOnForwardFailure=yes',
  '-R', `dentgrow-backend:80:localhost:${PORT}`,
  'serveo.net',
];

function startTunnel() {
  console.log('[tunnel] Connecting to serveo.net...');
  const proc = spawn('ssh', SSH_ARGS, { stdio: ['ignore', 'pipe', 'pipe'] });
  let urlFound = false;

  function handleLine(raw) {
    const line = stripAnsi(raw);
    process.stdout.write(raw);
    // Match the forwarding URL (not the registration URL)
    const match = line.match(/Forwarding HTTP traffic from (https:\/\/\S+)/);
    if (match && !urlFound) {
      urlFound = true;
      const url = match[1];
      console.log('\n[tunnel] Public URL:', url);
      pushUrlToGitHub(url);
    }
  }

  proc.stdout.on('data', (d) => handleLine(d.toString()));
  proc.stderr.on('data', (d) => handleLine(d.toString()));
  proc.on('exit', (code) => {
    console.log(`[tunnel] Disconnected (${code}), reconnecting in 10s...`);
    setTimeout(startTunnel, 10000);
  });
}

startTunnel();
