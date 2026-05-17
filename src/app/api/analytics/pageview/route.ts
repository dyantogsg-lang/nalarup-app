
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, timestamp, sessionId } = body;
    
    await db.execute(sql`
      INSERT INTO analytics_pageviews (path, referrer, session_id, created_at)
      VALUES (${path}, ${referrer}, ${sessionId}, ${new Date(timestamp).toISOString()})
    `);
    
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
