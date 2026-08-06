import { resolve } from "node:path";

/** Single source of truth for the project-local PostgreSQL cluster. */
export const DATA_DIR = resolve(process.cwd(), ".localdb");
export const DATABASE = "connect_dev";
export const PORT = 5433;
export const USER = "postgres";
export const PASSWORD = "postgres";

export const CONNECTION_STRING = `postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DATABASE}`;
