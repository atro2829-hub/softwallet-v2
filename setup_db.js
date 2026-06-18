const { Client } = require('pg');

const PROJECT_REF = 'nnywltnzjkpnhnapyvem';
const sql = require('fs').readFileSync('/home/z/my-project/softwallet-v2/schema.sql', 'utf8');

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'us-east-1', 'us-west-1', 'us-west-2',
  'ap-south-1', 'ap-northeast-1', 'ap-northeast-2',
  'ap-southeast-1', 'ap-southeast-2',
  'sa-east-1', 'ca-central-1', 'af-south-1', 'me-south-1',
];

async function tryConnect(connStr) {
  const client = new Client({ connectionString: connStr, statement_timeout: 15000 });
  try {
    await client.connect();
    return client;
  } catch (e) {
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  const password = process.env.DB_PASSWORD;
  if (!password) {
    console.error('Error: Set DB_PASSWORD environment variable');
    console.error('  Get it from: Supabase Dashboard → Settings → Database → Database password');
    process.exit(1);
  }

  // Try direct connection first
  const directStr = `postgresql://postgres.${PROJECT_REF}:${password}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;
  console.log('Trying direct connection...');
  let client = await tryConnect(directStr);
  
  if (!client) {
    // Try pooler endpoints
    console.log('Trying connection pooler...');
    for (const region of regions) {
      const poolerStr = `postgresql://postgres.${PROJECT_REF}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
      process.stdout.write(`  ${region}... `);
      client = await tryConnect(poolerStr);
      if (client) {
        console.log('✓ Connected!');
        break;
      }
      console.log('timeout');
    }
  } else {
    console.log('✓ Connected directly!');
  }

  if (!client) {
    console.error('Could not connect to any endpoint.');
    process.exit(1);
  }

  try {
    console.log(`\nExecuting schema (${sql.length} chars)...`);
    await client.query(sql);
    console.log('✅ Schema executed successfully!');
  } catch (e) {
    console.error('❌ SQL Error:', e.message);
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });