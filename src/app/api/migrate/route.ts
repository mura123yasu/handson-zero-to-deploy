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
      INSERT INTO menu_items (id, name, price, category, description, image_url, in_stock) VALUES
        (1, '特製ハンバーグ定食', 1280, 'メイン', '自家製デミグラスソースの特製ハンバーグ。ライス・味噌汁付き。', '🍽️', true),
        (2, '海鮮丼', 1480, 'メイン', '新鮮な刺身をふんだんに盛り付けた海鮮丼。味噌汁付き。', '🐟', false),
        (3, 'から揚げ定食', 980, 'メイン', 'カリッとジューシーな鶏のから揚げ。ライス・味噌汁付き。', '🍗', true),
        (4, '季節のサラダ', 580, 'サイド', '旬の野菜を使った彩り豊かなサラダ。', '🥗', true),
        (5, '味噌汁（単品）', 200, 'サイド', '出汁にこだわった自家製味噌汁。', '🍜', true),
        (6, '枝豆', 350, 'サイド', '塩茹でした旬の枝豆。おつまみにも最適。', '🫛', true),
        (7, '抹茶アイス', 400, 'デザート', '濃厚な宇治抹茶を使用したアイスクリーム。', '🍨', true),
        (8, 'わらび餅', 450, 'デザート', 'もちもち食感の手作りわらび餅。黒蜜ときな粉添え。', '🍡', false),
        (9, '緑茶', 250, 'ドリンク', '香り高い静岡産の煎茶。', '🍵', true),
        (10, '生ビール', 550, 'ドリンク', 'キンキンに冷えた生ビール（中ジョッキ）。', '🍺', true)
      ON CONFLICT (id) DO NOTHING
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
