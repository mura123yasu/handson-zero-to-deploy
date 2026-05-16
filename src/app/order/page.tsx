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
import { menuItems, categories } from "@/data/menu";

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
                    {item.imageUrl}
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
