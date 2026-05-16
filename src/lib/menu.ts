import { getDbClient } from "@/lib/db";

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
};

export const categories = [
  "すべて",
  "メイン",
  "サイド",
  "デザート",
  "ドリンク",
];

export async function getMenuItems(): Promise<MenuItem[]> {
  const sql = getDbClient();
  const rows = await sql`
    SELECT id, name, price, category, description, image_url, in_stock
    FROM menu_items
    ORDER BY id
  `;
  return rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    price: row.price as number,
    category: row.category as string,
    description: (row.description as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
    inStock: row.in_stock as boolean,
  }));
}
