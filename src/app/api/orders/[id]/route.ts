import { NextRequest, NextResponse } from "next/server";
import { getDbClient } from "@/lib/db";

const VALID_STATUSES = ["pending", "cooking", "ready", "served", "cancelled"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { status: "error", message: "無効な注文 ID です" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { status?: string };
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          status: "error",
          message: `ステータスは ${VALID_STATUSES.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 }
      );
    }

    const sql = getDbClient();

    const result = await sql`
      UPDATE orders SET status = ${body.status} WHERE id = ${orderId} RETURNING id, status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { status: "error", message: "注文が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "ok",
      order: { id: result[0].id, status: result[0].status },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
