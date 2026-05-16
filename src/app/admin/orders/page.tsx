import { getDbClient } from "@/lib/db";
import AdminOrdersClient from "./admin-orders-client";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: number;
  seat_number: string | null;
  status: string;
  created_at: string;
  items: {
    menuItemId: number;
    quantity: number;
    name: string;
    price: number;
  }[];
};

export default async function AdminOrdersPage() {
  const sql = getDbClient();

  const rows = await sql`
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

  const orders = (rows as OrderRow[]).map((row) => ({
    id: row.id,
    seatNumber: row.seat_number,
    status: row.status,
    createdAt: String(row.created_at),
    items: row.items,
  }));

  return <AdminOrdersClient initialOrders={orders} />;
}
