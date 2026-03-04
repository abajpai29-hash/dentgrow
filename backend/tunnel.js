// Manages SSH tunnel to serveo.net and auto-updates the public URL in GitHub
// pm2 start tunnel.js --name dentgrow-tunnel
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const KEY_PATH = path.join(process.env.USERPROFILE || process.env.HOME, '.ssh', 'dentgrow_tunnel');
const PORT = process.env.PORT || 3001;
const REPO = 'abajpai29-hash/dentgrow';
const URL_FILE = 'public-url.txt';

// Find gh CLI
function findGh() {
  const candidates = [
    'gh',
    'C:\\Program Files\\GitHub CLI\\gh.exe',
    '/usr/bin/gh',
  ];
  for (const c of candidates) {
    try { execSync(`"${c}" --version`, { stdio: 'ignore' }); return c; } catch {}
  }
  return null;
}

function pushUrlToGitHub(tunnelUrl) {
  const gh = findGh();
  if (!gh) { console.log('[tunnel] gh CLI not found, skipping GitHub update'); return; }
  try {
    const content = Buffer.from(tunnelUrl).toString('base64');
    // Get current SHA of file (needed for update)
    let sha = '';
    try {
      const info = JSON.parse(execSync(
        `"${gh}" api repos/${REPO}/contents/${URL_FILE} --jq .sha`,
        { encoding: 'utf8' }
      ).trim());
      sha = info;
    } catch {}

    const body = JSON.stringify({ message: 'ci: update tunnel URL', content, sha: sha || undefined });
    const tempFile = path.join(require('os').tmpdir(), 'gh-body.json');
    fs.writeFileSync(tempFile, body);

    execSync(
      `"${gh}" api repos/${REPO}/contents/${URL_FILE} --method PUT --input "${tempFile}"`,
      { stdio: 'pipe' }
    );
    console.log(`[tunnel] GitHub updated → ${tunnelUrl}`);
  } catch (e) {
    console.log('[tunnel] GitHub update failed:', e.message);
  }
}

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
  console.log('[tunnel] Connecting to serveo.net...');
  const proc = spawn('ssh', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let urlFound = false;

  function parseLine(line) {
    process.stdout.write(line);
    const match = line.match(/https:\/\/\S+serveo\S+/);
    if (match && !urlFound) {
      urlFound = true;
      const url = match[0].replace(/\x1b\[[0-9;]*m/g, '').trim();
      console.log('\n[tunnel] Public URL:', url);
      pushUrlToGitHub(url);
    }
  }

  proc.stdout.on('data', (d) => parseLine(d.toString()));
  proc.stderr.on('data', (d) => parseLine(d.toString()));

  proc.on('exit', (code) => {
    console.log(`[tunnel] Disconnected (${code}), reconnecting in 10s...`);
    setTimeout(startTunnel, 10000);
  });
}

startTunnel();
