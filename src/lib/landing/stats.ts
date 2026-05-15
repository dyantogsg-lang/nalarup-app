/**
 * Server-side stats untuk landing page.
 * Hitung jumlah soal, paket, breakdown subtest dari DB live.
 */

import { db } from "@/lib/db";
import { questions, tryoutPackages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export interface LandingStats {
  totalQuestions: number;
  totalPackages: number;
  twkCount: number;
  tiuCount: number;
  tkpCount: number;
  simulationPackages: number;
  practicePackages: number;
}

export async function getLandingStats(): Promise<LandingStats> {
  // Aggregate published questions per subtest
  const qStats = await db
    .select({
      subtest: questions.subtest,
      count: sql<number>`count(*)::int`,
    })
    .from(questions)
    .where(eq(questions.status, "published"))
    .groupBy(questions.subtest);

  let twk = 0, tiu = 0, tkp = 0;
  for (const r of qStats) {
    if (r.subtest === "TWK") twk = Number(r.count);
    else if (r.subtest === "TIU") tiu = Number(r.count);
    else if (r.subtest === "TKP") tkp = Number(r.count);
  }

  // Aggregate published packages per mode
  const pStats = await db
    .select({
      mode: tryoutPackages.mode,
      count: sql<number>`count(*)::int`,
    })
    .from(tryoutPackages)
    .where(eq(tryoutPackages.status, "published"))
    .groupBy(tryoutPackages.mode);

  let sim = 0, prac = 0;
  for (const r of pStats) {
    if (r.mode === "simulation") sim = Number(r.count);
    else if (r.mode === "practice") prac = Number(r.count);
  }

  return {
    totalQuestions: twk + tiu + tkp,
    totalPackages: sim + prac,
    twkCount: twk,
    tiuCount: tiu,
    tkpCount: tkp,
    simulationPackages: sim,
    practicePackages: prac,
  };
}
