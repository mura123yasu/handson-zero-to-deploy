"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  initialCart?: CartItem[];
};

const CATEGORY_ICONS: Record<string, string> = {
  "すべて": "🍽️",
  "メイン": "🔥",
  "サイド": "🥗",
  "デザート": "🍰",
  "ドリンク": "🥤",
};

function isImageUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default function OrderClient({ menuItems, initialCart }: OrderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seatNumber = searchParams.get("seat") ?? "";

  const [seatInput, setSeatInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [cart, setCart] = useState<CartItem[]>(initialCart ?? []);
  const [showCart, setShowCart] = useState(initialCart && initialCart.length > 0 ? true : false);
  const [outOfStockError, setOutOfStockError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSeatSubmit = () => {
    const trimmed = seatInput.trim();
    if (!trimmed) return;
    router.replace(`/order?seat=${encodeURIComponent(trimmed)}`);
  };

  const submitOrder = async () => {
    if (cart.length === 0 || !seatNumber) return;
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
          seatNumber,
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

  const filteredItems =
    selectedCategory === "すべて"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  // 座席未選択時は座席選択画面を表示
  if (!seatNumber) {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <span className="text-6xl">🪑</span>
              <h1 className="mt-4 text-3xl font-extrabold text-white drop-shadow-md">
                座席を選択
              </h1>
              <p className="mt-2 text-base text-white/80">
                座席番号を入力してメニューを開きましょう
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-1" />
              <div className="p-6">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  🪑 座席番号
                </label>
                <Input
                  type="text"
                  placeholder="例: A1, B3, C5"
                  value={seatInput}
                  onChange={(e) => setSeatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSeatSubmit()}
                  className="mb-4 h-14 rounded-xl border-orange-200 text-center text-2xl font-bold focus:border-orange-400 focus:ring-orange-400"
                  autoFocus
                />
                <button
                  onClick={handleSeatSubmit}
                  disabled={!seatInput.trim()}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
                >
                  メニューを開く 🍽️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-orange-50 via-background to-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍔</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
              OSAKI 亭
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
              🪑 {seatNumber}
            </span>
            <Link
              href={`/order/history?seat=${encodeURIComponent(seatNumber)}`}
              className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              📋 履歴
            </Link>
          </div>
        </div>
      </header>

      {/* ジャンルフィルター */}
      <div className="sticky top-16 z-10 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-2xl overflow-x-auto px-4 py-3">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                <span>{CATEGORY_ICONS[category] ?? "🍽️"}</span>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メニューエリア */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-5 flex items-baseline gap-2">
          <h2 className="text-xl font-extrabold text-foreground">
            Menu
          </h2>
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-semibold text-orange-600">
            {filteredItems.length}品
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg ${
                !item.inStock ? "opacity-60 grayscale" : ""
              }`}
            >
              {/* 画像エリア */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-orange-50">
                {isImageUrl(item.imageUrl) ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    {item.imageUrl}
                  </div>
                )}
                {!item.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Badge variant="destructive" className="px-3 py-1 text-sm font-bold">
                      SOLD OUT
                    </Badge>
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-orange-600 shadow-sm backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>
              {/* 情報エリア */}
              <div className="p-4">
                <h3 className="text-base font-bold leading-snug text-foreground">
                  {item.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-orange-600">
                    ¥{item.price.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                    className="rounded-full bg-orange-500 px-5 font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg disabled:bg-gray-300"
                  >
                    {item.inStock ? "+ Add" : "Sold Out"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              該当するメニューがありません
            </p>
          )}
        </div>
      </main>

      {/* 品切れエラーメッセージ */}
      {outOfStockError && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {outOfStockError}
        </div>
      )}

      {/* 注文リストを見るボタン（フッター固定） */}
      <div className="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-3">
          <button
            className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
            onClick={() => setShowCart(true)}
          >
            🛒 注文リストを見る
            {totalQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-md">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 注文リストモーダル */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="relative mx-auto w-full max-w-lg animate-in slide-in-from-bottom rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="mb-1 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">🛒 注文リスト</h2>
              <button
                className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                onClick={() => setShowCart(false)}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <span className="text-4xl">🍽️</span>
                <p className="mt-2 text-sm text-muted-foreground">
                  カートは空です
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {cart.map((cartItem) => (
                    <div
                      key={cartItem.item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-orange-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {isImageUrl(cartItem.item.imageUrl) ? (
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={cartItem.item.imageUrl}
                              alt={cartItem.item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl">{cartItem.item.imageUrl}</span>
                        )}
                        <div>
                          <p className="text-sm font-bold">
                            {cartItem.item.name}
                          </p>
                          <p className="text-xs font-semibold text-orange-600">
                            ¥{cartItem.item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm transition-colors hover:bg-gray-50"
                          onClick={() =>
                            updateQuantity(cartItem.item.id, -1)
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold">
                          {cartItem.quantity}
                        </span>
                        <button
                          className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm transition-colors hover:bg-gray-50"
                          onClick={() =>
                            updateQuantity(cartItem.item.id, 1)
                          }
                        >
                          +
                        </button>
                        <button
                          className="ml-1 flex size-8 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeFromCart(cartItem.item.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold">合計</span>
                    <span className="text-2xl font-extrabold text-orange-600">
                      ¥{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* 座席番号表示 */}
                  <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                    <span className="shrink-0 text-sm font-bold">🪑 座席</span>
                    <span className="text-sm font-semibold text-amber-700">
                      {seatNumber}
                    </span>
                  </div>

                  {/* 注文確定ボタン */}
                  <button
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
                    onClick={submitOrder}
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? "送信中..." : "注文を確定する 🎉"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 注文結果メッセージ */}
      {orderResult && (
        <div
          className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-xl px-5 py-3 text-sm font-medium shadow-xl ${
            orderResult.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {orderResult.type === "success" ? "🎉 " : "⚠️ "}
          {orderResult.message}
        </div>
      )}
    </div>
  );
}
