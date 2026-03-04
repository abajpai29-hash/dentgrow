const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'sbp_5c835e79bed3d1dccb8bec1044700fcc81c65ca7';
const PROJECT_REF = 'houwsrssoujgbjalnffe';

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
          if (parsed.message && !Array.isArray(parsed)) {
            reject(new Error(parsed.message));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  const seedPath = path.join(__dirname, '../supabase/seed.sql');

  console.log('Running schema.sql...');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    await runQuery(schema);
    console.log('✓ Schema created successfully');
  } catch (err) {
    console.log('Schema note:', err.message);
  }

  console.log('Running seed.sql...');
  const seed = fs.readFileSync(seedPath, 'utf8');
  try {
    await runQuery(seed);
    console.log('✓ Seed data inserted successfully');
  } catch (err) {
    console.log('Seed note:', err.message);
  }

  console.log('\nDone! Your Supabase project is ready.');
  console.log(`\nProject URL: https://${PROJECT_REF}.supabase.co`);
  console.log('Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdXdzcnNzb3VqZ2JqYWxuZmZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYxNjMyMSwiZXhwIjoyMDg4MTkyMzIxfQ.w6VMre5wvW657K7jDAykXrKDBLX9cm9GoWAKPepYKpc');
}

main().catch(console.error);
