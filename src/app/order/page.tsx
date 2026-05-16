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
import type { MenuItem } from "@/data/menu";

type CartItem = {
  item: MenuItem;
  quantity: number;
};

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === menuItem.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === menuItem.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { item: menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === itemId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const totalAmount = cart.reduce(
    (sum, c) => sum + c.item.price * c.quantity,
    0
  );

  const totalQuantity = cart.reduce((sum, c) => sum + c.quantity, 0);

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
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => addToCart(item)}
                >
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
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => setShowCart(true)}
          >
            注文リストを見る
            {totalQuantity > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {totalQuantity}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 注文リストモーダル */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          />
          <div className="relative mx-auto w-full max-w-lg rounded-t-2xl bg-background p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">注文リスト</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCart(false)}
              >
                ✕
              </Button>
            </div>

            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                カートは空です
              </p>
            ) : (
              <>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {cart.map((cartItem) => (
                    <div
                      key={cartItem.item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cartItem.item.imageUrl}</span>
                        <div>
                          <p className="text-sm font-medium">
                            {cartItem.item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ¥{cartItem.item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-8 p-0"
                          onClick={() =>
                            updateQuantity(cartItem.item.id, -1)
                          }
                        >
                          −
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {cartItem.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-8 p-0"
                          onClick={() =>
                            updateQuantity(cartItem.item.id, 1)
                          }
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-destructive"
                          onClick={() => removeFromCart(cartItem.item.id)}
                        >
                          🗑
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>合計</span>
                    <span>¥{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
