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
import { Input } from "@/components/ui/input";
import type { MenuItem } from "@/lib/menu";
import { categories } from "@/lib/menu";

type CartItem = {
  item: MenuItem;
  quantity: number;
};

type OrderClientProps = {
  menuItems: MenuItem[];
};

export default function OrderClient({ menuItems }: OrderClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [numPeople, setNumPeople] = useState(1);
  const [outOfStockError, setOutOfStockError] = useState<string | null>(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setOrderResult(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            menuItemId: c.item.id,
            quantity: c.quantity,
          })),
          seatNumber: seatNumber || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderResult({
          type: "success",
          message: `注文を受け付けました（注文番号: ${data.orderId}）`,
        });
        setCart([]);
        setShowCart(false);
        setTimeout(() => setOrderResult(null), 5000);
      } else {
        setOrderResult({
          type: "error",
          message: data.message || "注文に失敗しました",
        });
      }
    } catch {
      setOrderResult({
        type: "error",
        message: "通信エラーが発生しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    if (!menuItem.inStock) {
      setOutOfStockError(`「${menuItem.name}」は品切れです`);
      setTimeout(() => setOutOfStockError(null), 3000);
      return;
    }
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

  const perPersonAmount =
    numPeople > 0 ? Math.ceil(totalAmount / numPeople) : totalAmount;

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
            <Card
              key={item.id}
              className={!item.inStock ? "opacity-60" : ""}
            >
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
                      <div className="flex shrink-0 items-center gap-1">
                        {!item.inStock && (
                          <Badge variant="destructive" className="shrink-0">
                            品切れ
                          </Badge>
                        )}
                        <Badge variant="secondary" className="shrink-0">
                          {item.category}
                        </Badge>
                      </div>
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
                  disabled={!item.inStock}
                >
                  {item.inStock ? "カートに追加" : "品切れ"}
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

      {/* 品切れエラーメッセージ */}
      {outOfStockError && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground shadow-lg">
          {outOfStockError}
        </div>
      )}

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

                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>合計</span>
                    <span>¥{totalAmount.toLocaleString()}</span>
                  </div>

                  {/* 座席番号 */}
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <span className="shrink-0 text-sm font-medium">座席番号</span>
                    <Input
                      type="text"
                      placeholder="例: A1"
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  {/* 割り勘 */}
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">割り勘</span>
                      <Input
                        type="number"
                        min={1}
                        value={numPeople}
                        onChange={(e) =>
                          setNumPeople(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="h-8 w-16 text-center"
                      />
                      <span className="text-sm text-muted-foreground">人</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        1人あたり
                      </p>
                      <p className="text-base font-bold">
                        ¥{perPersonAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* 注文確定ボタン */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={submitOrder}
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? "送信中..." : "注文を確定する"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 注文結果メッセージ */}
      {orderResult && (
        <div
          className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg ${
            orderResult.type === "success"
              ? "bg-green-600 text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {orderResult.message}
        </div>
      )}
    </div>
  );
}
