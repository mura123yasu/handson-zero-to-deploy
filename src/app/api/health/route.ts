import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDbClient();
    const result = await sql`SELECT NOW() AS current_time`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      serverTime: result[0].current_time,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", database: "disconnected", message },
      { status: 500 }
    );
  }
}
