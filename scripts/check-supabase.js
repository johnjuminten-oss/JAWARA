#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL;

async function runSupabaseChecks() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Supabase URL or key not found in .env.local; skipping Supabase API checks.');
    return;
  }

  console.log('Supabase URL detected:', SUPABASE_URL);
  console.log('Key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon/public');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Attempting admin call: listUsers (per_page:1)');
      const { data, error } = await supabase.auth.admin.listUsers({ per_page: 1 });
      if (error) console.error('Admin API error:', error.message || error);
      else console.log('Admin API OK, sample response keys:', Object.keys(data || {}));
    } else {
      console.log('No service role key; attempting public read on "profiles" (may fail if table missing or RLS blocks it).');
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) console.warn('Public read warning:', error.message || error);
      else console.log('Public read OK, rows:', data);
    }
  } catch (err) {
    console.error('Supabase client error:', err && err.message ? err.message : err);
  }
}

async function runPostgresChecks() {
  if (!POSTGRES_URL) {
    console.warn('No POSTGRES_URL found in .env.local; skipping direct Postgres checks.');
    return;
  }

  console.log('\nConnecting to Postgres to list schemas, tables/views, RLS, and policies...');

  // Attempt to connect, retry once if a self-signed certificate error occurs by
  // temporarily disabling Node's TLS certificate verification. This is insecure
  // and only intended for local development when the Postgres server uses a
  // self-signed cert. We warn the user if we fall back to this.
  let client = null
  let connected = false
  let attemptedInsecure = false
  for (let attempt = 0; attempt < 2 && !connected; attempt++) {
    try {
      client = new Client({
        connectionString: POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
      });

      // If this is the second attempt, relax Node's TLS checks globally as a last resort.
      if (attempt === 1) {
        attemptedInsecure = true
        console.warn('\nPrevious TLS error detected; retrying with relaxed TLS checks (NODE_TLS_REJECT_UNAUTHORIZED=0).');
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      }

      await client.connect();
      connected = true
    } catch (connectErr) {
      // If this was the first attempt and looks like a cert error, retry; otherwise rethrow.
      const msg = (connectErr && connectErr.message) ? connectErr.message.toLowerCase() : ''
      if (attempt === 0 && (msg.includes('self-signed') || msg.includes('certificate') || msg.includes('ssl'))) {
        console.warn('Postgres connection failed due to TLS/certificate issue:', connectErr.message)
        console.warn('Will retry once with relaxed TLS checks (unsafe for production).')
        // continue loop to retry
      } else {
        throw connectErr
      }
    }
  }

  if (!connected) throw new Error('Failed to connect to Postgres after retries.')

  try {
    const schemasRes = await client.query(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;`);
    console.log('\nSchemas:');
    schemasRes.rows.forEach(r => console.log(' -', r.schema_name));

    const tablesRes = await client.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name;
    `);
    console.log('\nTables and views (excluding pg_catalog/information_schema):');
    tablesRes.rows.forEach(r => console.log(' -', r.table_schema, r.table_name, `(${r.table_type})`));

    const rlsRes = await client.query(`
      SELECT n.nspname AS schema, c.relname AS table_name, c.relrowsecurity AS rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relkind IN ('r','p') AND n.nspname NOT IN ('pg_catalog','information_schema')
      ORDER BY schema, table_name;
    `);
    console.log('\nRLS-enabled tables:');
    rlsRes.rows.forEach(r => console.log(' -', r.schema, r.table_name, 'rls_enabled=', r.rls_enabled));

    const policiesRes = await client.query(`
      SELECT n.nspname AS schema, c.relname AS table_name, p.polname AS policy_name,
             pg_get_expr(p.polqual, p.polrelid) AS using_expr, pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expr,
             p.polroles::text AS roles
      FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog','information_schema')
      ORDER BY schema, table_name;
    `);
    console.log('\nPolicies:');
    if (!policiesRes.rows.length) console.log('  (no policies found)');
    policiesRes.rows.forEach(r => {
      console.log(` - ${r.schema}.${r.table_name}  policy=${r.policy_name} roles=${r.roles}`);
      if (r.using_expr) console.log('    using:', r.using_expr);
      if (r.with_check_expr) console.log('    with_check:', r.with_check_expr);
    });
  } finally {
    await client.end();
  }
}

(async function main() {
  await runSupabaseChecks();
  await runPostgresChecks();
  console.log('\nChecks complete.');
  process.exit(0);
})().catch(err => {
  console.error('Unexpected error:', err && err.message ? err.message : err);
  process.exit(1);
});
