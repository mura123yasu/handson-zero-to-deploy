import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/db";

export async function POST() {
  try {
    const sql = getDbClient();

    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        in_stock BOOLEAN NOT NULL DEFAULT true
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        seat_number TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER NOT NULL
      )
    `;

    await sql`
      INSERT INTO menu_items (id, name, price, category, description, image_url, in_stock) VALUES
        (1, '特製ハンバーグ定食', 1280, 'メイン', '自家製デミグラスソースの特製ハンバーグ。ライス・味噌汁付き。', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80', true),
        (2, '海鮮丼', 1480, 'メイン', '新鮮な刺身をふんだんに盛り付けた海鮮丼。味噌汁付き。', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80', false),
        (3, 'から揚げ定食', 980, 'メイン', 'カリッとジューシーな鶏のから揚げ。ライス・味噌汁付き。', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop&q=80', true),
        (4, '季節のサラダ', 580, 'サイド', '旬の野菜を使った彩り豊かなサラダ。', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80', true),
        (5, '味噌汁（単品）', 200, 'サイド', '出汁にこだわった自家製味噌汁。', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80', true),
        (6, '枝豆', 350, 'サイド', '塩茹でした旬の枝豆。おつまみにも最適。', 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=400&h=300&fit=crop&q=80', true),
        (7, '抹茶アイス', 400, 'デザート', '濃厚な宇治抹茶を使用したアイスクリーム。', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&q=80', true),
        (8, 'わらび餅', 450, 'デザート', 'もちもち食感の手作りわらび餅。黒蜜ときな粉添え。', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&q=80', false),
        (9, '緑茶', 250, 'ドリンク', '香り高い静岡産の煎茶。', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop&q=80', true),
        (10, '生ビール', 550, 'ドリンク', 'キンキンに冷えた生ビール（中ジョッキ）。', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop&q=80', true)
      ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url
    `;

    return NextResponse.json({
      status: "ok",
      message: "Migration and seed completed",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
