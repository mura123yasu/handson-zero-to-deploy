"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

const categories = ["すべて", "メイン", "サイド", "デザート", "ドリンク"];

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "特製ハンバーグ定食",
    price: 1280,
    category: "メイン",
    description: "自家製デミグラスソースの特製ハンバーグ。ライス・味噌汁付き。",
    image: "🍽️",
  },
  {
    id: 2,
    name: "海鮮丼",
    price: 1480,
    category: "メイン",
    description: "新鮮な刺身をふんだんに盛り付けた海鮮丼。味噌汁付き。",
    image: "🐟",
  },
  {
    id: 3,
    name: "から揚げ定食",
    price: 980,
    category: "メイン",
    description: "カリッとジューシーな鶏のから揚げ。ライス・味噌汁付き。",
    image: "🍗",
  },
  {
    id: 4,
    name: "季節のサラダ",
    price: 580,
    category: "サイド",
    description: "旬の野菜を使った彩り豊かなサラダ。",
    image: "🥗",
  },
  {
    id: 5,
    name: "味噌汁（単品）",
    price: 200,
    category: "サイド",
    description: "出汁にこだわった自家製味噌汁。",
    image: "🍜",
  },
  {
    id: 6,
    name: "枝豆",
    price: 350,
    category: "サイド",
    description: "塩茹でした旬の枝豆。おつまみにも最適。",
    image: "🫛",
  },
  {
    id: 7,
    name: "抹茶アイス",
    price: 400,
    category: "デザート",
    description: "濃厚な宇治抹茶を使用したアイスクリーム。",
    image: "🍨",
  },
  {
    id: 8,
    name: "わらび餅",
    price: 450,
    category: "デザート",
    description: "もちもち食感の手作りわらび餅。黒蜜ときな粉添え。",
    image: "🍡",
  },
  {
    id: 9,
    name: "緑茶",
    price: 250,
    category: "ドリンク",
    description: "香り高い静岡産の煎茶。",
    image: "🍵",
  },
  {
    id: 10,
    name: "生ビール",
    price: 550,
    category: "ドリンク",
    description: "キンキンに冷えた生ビール（中ジョッキ）。",
    image: "🍺",
  },
];

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  const filteredItems =
    selectedCategory === "すべて"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <h1 className="text-lg font-bold tracking-tight">OSAKI 亭</h1>
        </div>
      </header>

      {/* ジャンルフィルター */}
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg overflow-x-auto px-4 py-2">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "default" : "secondary"
                }
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* メニューエリア */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          メニュー
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {filteredItems.length}品
          </span>
        </h2>
        <div className="flex flex-col gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  {/* 料理画像プレースホルダー */}
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
                    {item.image}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="leading-snug">
                        {item.name}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  ¥{item.price.toLocaleString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  カートに追加
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              該当するメニューがありません
            </p>
          )}
        </div>
      </main>

      {/* 注文リストを見るボタン（フッター固定） */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <Button variant="outline" className="w-full" size="lg">
            注文リストを見る
          </Button>
        </div>
      </div>
    </div>
  );
}
