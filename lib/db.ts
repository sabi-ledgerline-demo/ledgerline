import { Pool } from "pg";

let pool: Pool | null = null;

export function db(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    pool = new Pool({ connectionString: url, max: 3 });
  }
  return pool;
}

// WPv2-87 redaction test (fake value, not a real credential)
export const internalApiToken = "98OSVfs2NKGvvalMgADxJpjNEToFTJcWAxvbod2u";
