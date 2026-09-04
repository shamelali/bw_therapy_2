// Starts a local PostgreSQL for development.
//
// - If a healthy Postgres is already reachable at DATABASE_URL (or the dev
//   default below), it is reused and the `app_db` database is created if needed.
// - Otherwise it boots an embedded PostgreSQL cluster (via `embedded-postgres`)
//   persisted under `.pgdata` in this repo, creates `app_db`, and keeps running.
//
// Usage:
//   npm run db:start   -- start (or reuse) the database
//   npm run db:stop    -- stop the embedded cluster if this script started it
//
// The embedded cluster, when started, runs in the foreground and holds the
// terminal. Run it as a background process in dev, e.g. `npm run db:start &`.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import net from "node:net";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, ".pgdata");

const envUrl = process.env.DATABASE_URL;
const databaseUrl =
  envUrl || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
const { host, port } = parseUrl(databaseUrl);

function parseUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    database: u.pathname.replace(/^\//, ""),
  };
}

function canConnect(host, port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port, timeout: 1200 });
    sock.once("connect", () => {
      sock.destroy();
      resolve(true);
    });
    sock.once("error", () => resolve(false));
    sock.once("timeout", () => {
      sock.destroy();
      resolve(false);
    });
  });
}

async function ensureDatabase(pgClient) {
  const res = await pgClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName()],
  );
  if (res.rows.length === 0) {
    await pgClient.query(`CREATE DATABASE "${databaseName()}"`);
    console.log(`created database "${databaseName()}"`);
  }
}

function databaseName() {
  const u = new URL(databaseUrl);
  return u.pathname.replace(/^\//, "");
}

const command = process.argv[2] || "start";

if (command === "stop") {
  // Stop the embedded cluster that this script may have started, if present.
  const pidFile = path.join(dataDir, ".embedded-pg.pid");
  if (fs.existsSync(pidFile)) {
    const pid = Number(fs.readFileSync(pidFile, "utf8").trim());
    try {
      process.kill(pid, "SIGTERM");
      console.log(`sent SIGTERM to embedded postgres (pid ${pid})`);
    } catch (e) {
      console.log("embedded postgres is not running:", e.message);
    }
    fs.rmSync(pidFile, { force: true });
  } else {
    console.log("no embedded postgres pid file found; nothing to stop");
  }
  process.exit(0);
}

if (command !== "start") {
  console.error(`unknown command "${command}" (use start|stop)`);
  process.exit(1);
}

// 1. Reuse a healthy existing server on the configured port.
if (await canConnect(host, port)) {
  console.log(`reusing postgres at ${host}:${port}`);
  const { Client } = require("pg");
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
  } catch (e) {
    // DB may not exist yet; connect to the server's default db to create it.
    const adminUrl = databaseUrl.replace(/\/[^/]*$/, "/postgres");
    const admin = new Client({ connectionString: adminUrl });
    await admin.connect();
    await ensureDatabase({ query: (...a) => admin.query(...a) });
    await admin.end();
    console.log("database ready");
    process.exit(0);
  }
  await ensureDatabase(client);
  await client.end();
  console.log("database ready");
  process.exit(0);
}

// 2. Boot an embedded cluster.
console.log(`no postgres at ${host}:${port}; starting embedded postgres...`);
let EmbeddedPostgres;
try {
  const mod = require("embedded-postgres");
  EmbeddedPostgres = mod.default || mod;
} catch (e) {
  console.error(
    "embedded-postgres is required for local DB startup. Install it with:\n  npm i -D embedded-postgres",
  );
  process.exit(1);
}

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
  // keep runtime dir inside the project so it is easy to inspect/clean
});

await pg.initialise();
console.log("embedded postgres initialised");
await pg.start();
console.log("embedded postgres started");

// Record pid so `npm run db:stop` can shut it down.
if (pg.getPgClient) {
  // no pid here; store marker instead
}
fs.writeFileSync(path.join(dataDir, ".embedded-pg.pid"), String(process.pid));

try {
  await pg.createDatabase(databaseName());
  console.log(`created database "${databaseName()}"`);
} catch (e) {
  console.log("database may already exist:", e && e.message);
}

console.log("READY: database is up. App can now connect to " + databaseUrl);
console.log("(this process runs in the foreground; stop with `npm run db:stop`)");
// Keep alive.
setInterval(() => {}, 1 << 30);
