"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";

type OrderItem = {
  menuItemId: number;
  quantity: number;
  name: string;
  price: number;
};

type Order = {
  id: number;
  seat_number: string;
  status: string;
  created_at: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-800" },
  preparing: { label: "調理中", color: "bg-blue-100 text-blue-800" },
  ready: { label: "提供済み", color: "bg-green-100 text-green-800" },
  cancelled: { label: "キャンセル", color: "bg-red-100 text-red-800" },
};

export default function OrderHistoryClient() {
  const searchParams = useSearchParams();
  const seatNumber = searchParams.get("seat") ?? "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPeople, setNumPeople] = useState(1);
  const [reorderQuantities, setReorderQuantities] = useState<Record<string, number>>({});
  const [submittingItem, setSubmittingItem] = useState<string | null>(null);
  const [reorderResult, setReorderResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchedSeatRef = useRef<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!seatNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders?seat=${encodeURIComponent(seatNumber)}`
      );
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders ?? []);
      } else {
        setError(data.message || "注文履歴の取得に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [seatNumber]);

  useEffect(() => {
    if (fetchedSeatRef.current !== seatNumber) {
      fetchedSeatRef.current = seatNumber;
      fetchOrders();
    }
  }, [seatNumber, fetchOrders]);

  const grandTotal = orders.reduce((sum, order) => {
    const orderTotal = order.items.reduce(
      (s, item) => s + item.price * item.quantity,
      0
    );
    return sum + orderTotal;
  }, 0);

  const perPersonAmount =
    numPeople > 0 ? Math.ceil(grandTotal / numPeople) : grandTotal;

  const getReorderKey = (orderId: number, menuItemId: number) =>
    `${orderId}-${menuItemId}`;

  const getReorderQty = (orderId: number, menuItemId: number, defaultQty: number) => {
    const key = getReorderKey(orderId, menuItemId);
    return reorderQuantities[key] ?? defaultQty;
  };

  const setReorderQty = (orderId: number, menuItemId: number, qty: number) => {
    const key = getReorderKey(orderId, menuItemId);
    setReorderQuantities((prev) => ({ ...prev, [key]: Math.max(1, qty) }));
  };

  const handleReorderItem = async (orderId: number, item: OrderItem) => {
    const key = getReorderKey(orderId, item.menuItemId);
    const qty = reorderQuantities[key] ?? item.quantity;
    setSubmittingItem(key);
    setReorderResult(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ menuItemId: item.menuItemId, quantity: qty }],
          seatNumber,
        }),
      });
      if (res.ok) {
        setReorderResult({
          type: "success",
          message: `${item.name} ×${qty} を注文しました`,
        });
        setTimeout(() => setReorderResult(null), 3000);
        await fetchOrders();
      } else {
        setReorderResult({ type: "error", message: "注文に失敗しました" });
        setTimeout(() => setReorderResult(null), 3000);
      }
    } catch {
      setReorderResult({ type: "error", message: "通信エラーが発生しました" });
      setTimeout(() => setReorderResult(null), 3000);
    } finally {
      setSubmittingItem(null);
    }
  };

  if (!seatNumber) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-6 py-24">
        <div className="text-center">
          <span className="text-6xl">📋</span>
          <h1 className="mt-4 text-3xl font-extrabold text-white drop-shadow-md">
            注文履歴
          </h1>
          <p className="mt-2 text-base text-white/80">
            座席番号が指定されていません
          </p>
          <Link
            href="/order"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-orange-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            🍽️ 注文画面へ
          </Link>
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
            <span className="text-3xl">📋</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
              注文履歴
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
              🪑 {seatNumber}
            </span>
            <Link
              href={`/order?seat=${encodeURIComponent(seatNumber)}`}
              className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              🍽️ メニュー
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="size-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="mt-4 text-sm text-muted-foreground">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              再読み込み
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center">
            <span className="text-6xl">🍽️</span>
            <p className="mt-4 text-lg font-bold text-foreground">
              まだ注文がありません
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              メニューから最初の注文をしましょう
            </p>
            <Link
              href={`/order?seat=${encodeURIComponent(seatNumber)}`}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl"
            >
              🍽️ メニューを見る
            </Link>
          </div>
        ) : (
          <>
            {/* 注文一覧 */}
            <div className="space-y-4">
              {orders.map((order) => {
                const orderTotal = order.items.reduce(
                  (s, item) => s + item.price * item.quantity,
                  0
                );
                const status = STATUS_LABELS[order.status] ?? {
                  label: order.status,
                  color: "bg-gray-100 text-gray-800",
                };
                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b bg-orange-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">
                          #{order.id}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("ja-JP", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="divide-y">
                      {order.items.map((item, idx) => {
                        const key = getReorderKey(order.id, item.menuItemId);
                        const qty = getReorderQty(order.id, item.menuItemId, item.quantity);
                        const isSubmitting = submittingItem === key;
                        return (
                          <div
                            key={idx}
                            className="px-4 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {item.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ×{item.quantity}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-orange-600">
                                ¥{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-200"
                                  onClick={() =>
                                    setReorderQty(order.id, item.menuItemId, qty - 1)
                                  }
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-bold">
                                  {qty}
                                </span>
                                <button
                                  className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-200"
                                  onClick={() =>
                                    setReorderQty(order.id, item.menuItemId, qty + 1)
                                  }
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => handleReorderItem(order.id, item)}
                                disabled={isSubmitting}
                                className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md disabled:bg-gray-300"
                              >
                                {isSubmitting ? "注文中..." : "🔄 おかわり"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
                      <span className="text-base font-bold text-orange-600">
                        ¥{orderTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 割り勘セクション */}
            <div className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
                <h2 className="text-lg font-extrabold text-white">
                  💰 お会計
                </h2>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">
                    合計（{orders.length}件）
                  </span>
                  <span className="text-2xl font-extrabold text-orange-600">
                    ¥{grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">👥 割り勘</span>
                    <Input
                      type="number"
                      min={1}
                      value={numPeople}
                      onChange={(e) =>
                        setNumPeople(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="h-9 w-16 rounded-lg border-amber-200 bg-white text-center"
                    />
                    <span className="text-sm text-muted-foreground">人</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">1人あたり</p>
                    <p className="text-xl font-extrabold text-orange-600">
                      ¥{perPersonAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-3">
          <Link
            href={`/order?seat=${encodeURIComponent(seatNumber)}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            🍽️ メニューに戻る
          </Link>
        </div>
      </footer>

      {/* おかわり結果メッセージ */}
      {reorderResult && (
        <div
          className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-xl px-5 py-3 text-sm font-medium shadow-xl ${
            reorderResult.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {reorderResult.type === "success" ? "🎉 " : "⚠️ "}
          {reorderResult.message}
        </div>
      )}
    </div>
  );
}
