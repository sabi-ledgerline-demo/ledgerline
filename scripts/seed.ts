// Usage: DATABASE_URL=... npm run seed   (also used as the reset script: npm run reset)
// Prints generated passwords once; store them in the Sabí workspace settings, not in the repo.
import { db } from "../lib/db";
import { resetAndSeed } from "../lib/seed";

const url = process.env.DATABASE_URL || "";
if (/production/i.test(process.env.LEDGERLINE_ENV || "") && process.argv[2] !== "--yes") {
  console.error("Refusing to wipe a production-labelled database without --yes.");
  process.exit(1);
}
if (!url) { console.error("DATABASE_URL is not set."); process.exit(1); }

async function main() {
const creds = await resetAndSeed(db());
for (const c of creds) console.log(`${c.role.padEnd(11)} ${c.email.padEnd(32)} ${c.generated ? c.password : "(from LEDGERLINE_PASSWORD_" + c.role.toUpperCase() + ")"}`);
await db().end();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
