// Copies the static files into dist/ and generates dist/config.js from env vars.
// Env vars can come from the host (Cloudflare Pages / Netlify / Vercel) or a local .env file.
const fs = require('fs');
const path = require('path');

// tiny .env loader (only fills vars that aren't already set)
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY (set them as env vars or in .env).');
  process.exit(1);
}

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist');
for (const f of ['index.html', 'manifest.json', 'service-worker.js', 'icon-192.png', 'icon-512.png']) {
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join('dist', f));
  else console.warn(`warning: ${f} not found, skipped`);
}
fs.writeFileSync(
  'dist/config.js',
  `window.APP_CONFIG = ${JSON.stringify({ SUPABASE_URL, SUPABASE_ANON_KEY })};\n`
);
console.log('Built dist/ with config.js');
