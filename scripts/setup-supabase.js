#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const envPath = path.resolve(process.cwd(), '.env.local')

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans) }))
}

async function main() {
  console.log('This script will help you create a .env.local with Supabase settings')

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL) ? process.env.NEXT_PUBLIC_SUPABASE_URL : await ask('Supabase URL (NEXT_PUBLIC_SUPABASE_URL): ')
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : await ask('Supabase ANON KEY (NEXT_PUBLIC_SUPABASE_ANON_KEY): ')

  if (!url || !anon) {
    console.error('Both values are required. Aborting.')
    process.exit(1)
  }

  let contents = ''
  if (fs.existsSync(envPath)) {
    contents = fs.readFileSync(envPath, 'utf8')
  }

  // Replace or append values
  const setEnv = (key, val, src) => {
    const re = new RegExp('^' + key + '=.*$', 'm')
    if (re.test(src)) return src.replace(re, `${key}=${val}`)
    return src + (src && !src.endsWith('\n') ? '\n' : '') + `${key}=${val}\n`
  }

  contents = setEnv('NEXT_PUBLIC_SUPABASE_URL', url, contents)
  contents = setEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', anon, contents)

  fs.writeFileSync(envPath, contents, 'utf8')
  console.log('.env.local written. You can now run `pnpm dev` or `pnpm build`.')
}

main().catch(err => { console.error(err); process.exit(1) })
