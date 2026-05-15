/**
 * List user profiles dan promote ke admin.
 * 
 * Usage:
 *   npx tsx --env-file=.env.production scripts/manage-admins.ts list
 *   npx tsx --env-file=.env.production scripts/manage-admins.ts promote <email>
 *   npx tsx --env-file=.env.production scripts/manage-admins.ts demote <email>
 */
import { db } from "../src/lib/db";
import { profiles } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const action = process.argv[2];
  const email = process.argv[3];

  if (action === "list") {
    const all = await db.select().from(profiles);
    console.log(`Total users: ${all.length}\n`);
    for (const u of all) {
      const tag = u.role === "admin" ? "👑 ADMIN" : "  user ";
      console.log(`${tag}  ${u.email.padEnd(40)} ${u.fullName} (id=${u.id.slice(0, 8)}...)`);
    }
    process.exit(0);
  }

  if (action === "promote" && email) {
    const found = await db.query.profiles.findFirst({
      where: eq(profiles.email, email),
    });
    if (!found) {
      console.error(`❌ User dengan email '${email}' tidak ditemukan`);
      process.exit(1);
    }
    await db
      .update(profiles)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(profiles.id, found.id));
    console.log(`✓ ${email} promoted to admin`);
    process.exit(0);
  }

  if (action === "demote" && email) {
    const found = await db.query.profiles.findFirst({
      where: eq(profiles.email, email),
    });
    if (!found) {
      console.error(`❌ User dengan email '${email}' tidak ditemukan`);
      process.exit(1);
    }
    await db
      .update(profiles)
      .set({ role: "user", updatedAt: new Date() })
      .where(eq(profiles.id, found.id));
    console.log(`✓ ${email} demoted to user`);
    process.exit(0);
  }

  console.log("Usage:");
  console.log("  npx tsx --env-file=.env.production scripts/manage-admins.ts list");
  console.log("  npx tsx --env-file=.env.production scripts/manage-admins.ts promote <email>");
  console.log("  npx tsx --env-file=.env.production scripts/manage-admins.ts demote <email>");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
