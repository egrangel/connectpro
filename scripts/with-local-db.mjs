/**
 * Runs a command against the project-local PostgreSQL cluster.
 *
 *   node scripts/with-local-db.mjs next dev --turbopack
 *
 * Both connection variables are set because the Prisma schema declares
 * `directUrl` for migrations (Neon's pooled endpoint cannot hold the migration
 * advisory lock). Locally there is no pooler, so both point at the same server.
 *
 * Passing them here instead of writing an .env file keeps `vercel env pull`
 * free to regenerate .env*.local without clobbering the local setup.
 */
import { spawn } from "node:child_process";
import { delimiter, resolve } from "node:path";
import { CONNECTION_STRING } from "./local-db-config.mjs";

const command = process.argv.slice(2);

if (command.length === 0) {
  console.error("Uso: node scripts/with-local-db.mjs <comando> [args...]");
  process.exit(1);
}

// `npm run` adds node_modules/.bin to PATH, but a direct `node
// scripts/with-local-db.mjs ...` does not — add it so local binaries (next,
// prisma, tsx) resolve either way.
const env = { ...process.env };
// Windows env vars are case-insensitive; drop every spelling before setting one
// so the child does not inherit a stale Path alongside the new PATH.
const pathValue = process.env.PATH ?? "";
for (const key of Object.keys(env)) {
  if (key.toUpperCase() === "PATH") delete env[key];
}

const child = spawn(command.join(" "), {
  stdio: "inherit",
  shell: true,
  env: {
    ...env,
    PATH: `${resolve(process.cwd(), "node_modules", ".bin")}${delimiter}${pathValue}`,
    DATABASE_URL: CONNECTION_STRING,
    DATABASE_URL_UNPOOLED: CONNECTION_STRING,
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
