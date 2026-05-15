/**
 * Migration: add verification fields to questions table
 */
import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("▶ Adding verification columns to questions table");
  await db.execute(sql`
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS review_notes TEXT;
  `);
  console.log("✓ Verification columns added");
  
  // Mark the seed-tier (legacy seed.ts) verified=true to differentiate from AI-generated
  // Optional: skip - default false applies to all 929 imported soal
  
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
