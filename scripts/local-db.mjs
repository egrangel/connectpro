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
import { resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const DATA_DIR = resolve(process.cwd(), ".localdb");
const DATABASE = "connect_dev";
const PORT = 5433;

const shouldReset = process.argv.includes("--reset");

if (shouldReset && existsSync(DATA_DIR)) {
  console.log("Removendo cluster local existente...");
  rmSync(DATA_DIR, { recursive: true, force: true });
}

const postgres = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
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
