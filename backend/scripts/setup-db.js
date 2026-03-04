// Run this once to set up the Supabase database
// Usage: SUPABASE_ACCESS_TOKEN=your_token node scripts/setup-db.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'houwsrssoujgbjalnffe';

if (!TOKEN) {
  console.error('Set SUPABASE_ACCESS_TOKEN env var first');
  process.exit(1);
}

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.message && !Array.isArray(parsed)) reject(new Error(parsed.message));
          else resolve(parsed);
        } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Running schema.sql...');
  await runQuery(fs.readFileSync(path.join(__dirname, '../supabase/schema.sql'), 'utf8'));
  console.log('✓ Schema created');
  console.log('Running seed.sql...');
  await runQuery(fs.readFileSync(path.join(__dirname, '../supabase/seed.sql'), 'utf8'));
  console.log('✓ Seed data inserted');
}

main().catch(console.error);
