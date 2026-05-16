"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type OrderItem = {
  menuItemId: number;
  quantity: number;
  name: string;
  price: number;
};

type Order = {
  id: number;
  seatNumber: string | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type AdminOrdersClientProps = {
  initialOrders: Order[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "未着手",
  cooking: "調理中",
  ready: "提供待ち",
  served: "提供済み",
  cancelled: "取消済み",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏳",
  cooking: "🔥",
  ready: "✨",
  served: "🍽️",
  cancelled: "❌",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cooking: "bg-orange-100 text-orange-800 border-orange-200",
  ready: "bg-blue-100 text-blue-800 border-blue-200",
  served: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  cooking: "default",
  ready: "secondary",
  served: "secondary",
  cancelled: "destructive",
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["cooking", "cancelled"],
  cooking: ["ready", "cancelled"],
  ready: ["served"],
  served: [],
  cancelled: [],
};

export default function AdminOrdersClient({
  initialOrders,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [seatFilter, setSeatFilter] = useState("");
  const [seatBilling, setSeatBilling] = useState<{
    seat: string;
    orders: Order[];
    total: number;
  } | null>(null);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(
          data.orders.map(
            (o: {
              id: number;
              seat_number: string | null;
              status: string;
              created_at: string;
              items: OrderItem[];
            }) => ({
              id: o.id,
              seatNumber: o.seat_number,
              status: o.status,
              createdAt: o.created_at,
              items: o.items,
            })
          )
        );
      }
    } catch {
      // ignore
    }
  };

  const lookupSeatBilling = () => {
    const trimmed = seatFilter.trim();
    if (!trimmed) {
      setSeatBilling(null);
      return;
    }
    const seatOrders = orders.filter(
      (o) =>
        o.seatNumber === trimmed && o.status !== "cancelled"
    );
    const total = seatOrders.reduce(
      (sum, o) =>
        sum + o.items.reduce((s, item) => s + item.price * item.quantity, 0),
      0
    );
    setSeatBilling({ seat: trimmed, orders: seatOrders, total });
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              注文管理
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshOrders}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
            >
              🔄 更新
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* ステータスフィルター */}
      <div className="sticky top-16 z-10 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl overflow-x-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filterStatus === "all"
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📦 すべて
            </button>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  filterStatus === key
                    ? "bg-slate-800 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {STATUS_ICONS[key]} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {/* 座席番号で会計確認 */}
        <div className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-gradient-to-r from-amber-50 to-orange-50 p-4">
            <h3 className="text-base font-bold">🪑 座席番号で会計確認</h3>
          </div>
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="座席番号を入力（例: A1）"
                value={seatFilter}
                onChange={(e) => setSeatFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupSeatBilling()}
                className="flex-1 rounded-xl border-slate-200"
              />
              <Button
                onClick={lookupSeatBilling}
                className="rounded-xl bg-amber-500 px-5 font-semibold text-white hover:bg-amber-600"
              >
                検索
              </Button>
            </div>
            {seatBilling && (
              <div className="mt-4">
                {seatBilling.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    座席「{seatBilling.seat}」の注文はありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      座席「{seatBilling.seat}」の注文（{seatBilling.orders.length}件）
                    </p>
                    {seatBilling.orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">注文 #{order.id}</span>
                          <Badge
                            variant={
                              STATUS_VARIANTS[order.status] ?? "outline"
                            }
                          >
                            {STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </div>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="mt-1 flex justify-between text-muted-foreground"
                          >
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span>
                              ¥{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-lg font-extrabold">
                      <span>会計合計</span>
                      <span className="text-amber-600">
                        ¥{seatBilling.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-baseline gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {filteredOrders.length}件の注文
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-2 text-sm text-muted-foreground">
              該当する注文がありません
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              const nextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between p-4 pb-2">
                    <div>
                      <h3 className="text-base font-extrabold">
                        注文 #{order.id}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        🕐 {formatTime(order.createdAt)}
                        {order.seatNumber && (
                          <span className="ml-2">🪑 座席 {order.seatNumber}</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-medium text-muted-foreground">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between border-t pt-2 font-bold">
                        <span>合計</span>
                        <span className="text-orange-600">
                          ¥{total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {nextStatuses.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {nextStatuses.map((s) => (
                          <Button
                            key={s}
                            variant={s === "cancelled" ? "destructive" : "default"}
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => updateStatus(order.id, s)}
                            className={
                              s !== "cancelled"
                                ? "rounded-xl bg-slate-800 font-semibold hover:bg-slate-900"
                                : "rounded-xl font-semibold"
                            }
                          >
                            {updatingId === order.id
                              ? "更新中..."
                              : `${STATUS_ICONS[s]} ${STATUS_LABELS[s]}`}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
