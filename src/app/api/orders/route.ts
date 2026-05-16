import { NextRequest, NextResponse } from "next/server";
import { getDbClient } from "@/lib/db";

type OrderItemInput = {
  menuItemId: number;
  quantity: number;
};

type OrderRequest = {
  items: OrderItemInput[];
  seatNumber?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { status: "error", message: "注文アイテムが指定されていません" },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (
        typeof item.menuItemId !== "number" ||
        typeof item.quantity !== "number" ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          {
            status: "error",
            message: "各アイテムには menuItemId (数値) と quantity (1以上) が必要です",
          },
          { status: 400 }
        );
      }
    }

    const sql = getDbClient();

    const seatNumber = body.seatNumber ?? null;
    const orderResult = await sql`
      INSERT INTO orders (seat_number)
      VALUES (${seatNumber})
      RETURNING id, created_at
    `;

    const orderId = orderResult[0].id as number;

    for (const item of body.items) {
      await sql`
        INSERT INTO order_items (order_id, menu_item_id, quantity)
        VALUES (${orderId}, ${item.menuItemId}, ${item.quantity})
      `;
    }

    return NextResponse.json({
      status: "ok",
      message: "注文を受け付けました",
      orderId,
      createdAt: orderResult[0].created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sql = getDbClient();
    const { searchParams } = new URL(request.url);
    const seat = searchParams.get("seat");

    let orders;
    if (seat) {
      orders = await sql`
        SELECT o.id, o.seat_number, o.status, o.created_at,
          json_agg(json_build_object(
            'menuItemId', oi.menu_item_id,
            'quantity', oi.quantity,
            'name', mi.name,
            'price', mi.price
          )) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.seat_number = ${seat} AND o.status != 'cancelled'
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    } else {
      orders = await sql`
        SELECT o.id, o.seat_number, o.status, o.created_at,
          json_agg(json_build_object(
            'menuItemId', oi.menu_item_id,
            'quantity', oi.quantity,
            'name', mi.name,
            'price', mi.price
          )) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
    }

    return NextResponse.json({ status: "ok", orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
