/**
 * Cek user admin existing
 */
import { db } from "../src/lib/db";
import { profiles } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const admins = await db.query.profiles.findMany({
    where: eq(profiles.role, "admin"),
  });
  console.log(`Admin count: ${admins.length}`);
  for (const a of admins) {
    console.log(`  - ${a.fullName} <${a.email}> (id=${a.id})`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
