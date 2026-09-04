#!/usr/bin/env bash
# One-command startup for local preview.
#
#   npm run preview
#
# Brings up the embedded/local Postgres (if needed), pushes the schema,
# seeds demo data (if the DB is empty), builds the app, and starts it.
# The app server runs in the foreground; Ctrl+C stops the web server.
#
# The database process runs in the background and can be stopped later with
# `npm run db:stop`. Env is read from .env (create it with `cp .env.example .env`).

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load .env if present.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${DATABASE_URL:=postgresql://postgres:postgres@127.0.0.1:5432/app_db}"
: "${AUTH_SECRET:=dev-preview-secret-please-change-in-production-1234567890}"
export DATABASE_URL AUTH_SECRET

PORT="${PORT:-3000}"

echo "▸ Ensuring database is up..."
# Start the DB in the background. `db.mjs start` exits immediately when reusing
# an existing server, or blocks when booting an embedded cluster — so run it in
# the background and wait for the port.
node scripts/db.mjs start >/tmp/bw-db.log 2>&1 &
DB_PID=$!
trap 'kill $DB_PID 2>/dev/null || true' EXIT

# Wait for the DB port to accept connections.
host=$(node -e "console.log(new URL(process.env.DATABASE_URL).hostname)")
port=$(node -e "console.log(new URL(process.env.DATABASE_URL).port || 5432)")
echo "▸ Waiting for postgres at $host:$port ..."
for i in $(seq 1 30); do
  if node -e "
    const net=require('net');const s=net.connect($port,'$host');
    s.on('connect',()=>{s.destroy();process.exit(0)});
    s.on('error',()=>process.exit(1));s.on('timeout',()=>process.exit(1));
  " 2>/dev/null; then
    break
  fi
  sleep 1
done

# Wait a moment for embedded cluster to finish creating the DB.
sleep 1

echo "▸ Applying schema..."
npm run -s db:push

echo "▸ Checking / seeding demo data..."
# Seed only if the provider table is empty.
COUNT=$(node -e "
  const {Client}=require('pg');
  const c=new Client({connectionString:process.env.DATABASE_URL});
  c.connect().then(async()=>{
    const r=await c.query('select count(*)::int as n from providers');
    console.log(r.rows[0].n); await c.end();
  }).catch(()=>{ console.log('0'); process.exit(0); });
")
if [[ "$COUNT" == "0" ]]; then
  npm run -s seed
  echo "▸ Seeded demo data."
else
  echo "▸ Database already seeded ($COUNT providers)."
fi

echo "▸ Building app..."
npm run -s build

echo "▸ Starting server on port $PORT ..."
exec npx next start -p "$PORT"
