
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, duration, sessionId } = body;
    
    await db.execute(sql`
      INSERT INTO analytics_durations (path, duration_seconds, session_id, created_at)
      VALUES (${path}, ${duration}, ${sessionId}, NOW())
    `);
    
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
