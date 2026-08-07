/**
 * Project-local PostgreSQL for development.
 *
 * Runs a real Postgres binary (same engine as production) out of `.localdb/`,
 * so migrations and SQL dialect are identical to Neon — no second Prisma
 * schema, no second migration history. Nothing is installed system-wide.
 *
 *   npm run db:local          start it (keep the terminal open, Ctrl+C stops)
 *   npm run db:local:reset    throw the cluster away and start fresh
 *
 * Connection string (already set in .env / .env.development.local):
 *   postgresql://postgres:postgres@localhost:5433/connect_dev
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { DATA_DIR, DATABASE, PASSWORD, PORT, USER } from "./local-db-config.mjs";

const shouldReset = process.argv.includes("--reset");

if (shouldReset && existsSync(DATA_DIR)) {
  console.log("Removendo cluster local existente...");
  rmSync(DATA_DIR, { recursive: true, force: true });
}

const postgres = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
  // Quiet by default: Postgres logs every checkpoint otherwise.
  onLog: () => {},
  onError: (error) => console.error(error),
});

const isFirstRun = !existsSync(DATA_DIR);
if (isFirstRun) {
  console.log("Inicializando cluster PostgreSQL em .localdb/ (so na primeira vez)...");
  await postgres.initialise();
}

// A postmaster.pid left behind means a previous cluster is still up — usually
// because this script was killed without its shutdown hook running. That
// cluster keeps port 5433 open but often stops accepting connections, which
// surfaces as confusing timeouts. Stop it first so `db:local` is always
// safe to re-run. (`stop` shells out to pg_ctl against the data dir, so it
// works even though another process started the server.)
if (!isFirstRun && existsSync(join(DATA_DIR, "postmaster.pid"))) {
  console.log("Cluster anterior detectado — parando antes de iniciar...");
  try {
    await postgres.stop();
  } catch (error) {
    // Expected when the pid file is stale and no server is actually running.
    console.log(`  (nada para parar: ${String(error).split("\n")[0]})`);
  }
}

await postgres.start();

// createDatabase throws if it already exists — expected on every run but the first.
try {
  await postgres.createDatabase(DATABASE);
  console.log(`Banco "${DATABASE}" criado.`);
} catch (error) {
  if (!String(error).includes("already exists")) throw error;
}

console.log(
  [
    "",
    `PostgreSQL local rodando em localhost:${PORT} (banco "${DATABASE}").`,
    "Deixe este terminal aberto. Ctrl+C para parar.",
    "",
    isFirstRun
      ? "Primeira execucao — em outro terminal rode: npm run db:migrate && npm run db:seed"
      : "Em outro terminal: npm run dev",
    "",
  ].join("\n"),
);

async function shutdown() {
  console.log("\nParando PostgreSQL local...");
  try {
    await postgres.stop();
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
