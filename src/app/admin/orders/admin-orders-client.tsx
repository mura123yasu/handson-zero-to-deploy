"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [seatFilter, setSeatFilter] = useState("");
  const [seatBilling, setSeatBilling] = useState<{
    seat: string;
    orders: Order[];
    total: number;
  } | null>(null);

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
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-tight">注文管理</h1>
          <Button variant="outline" size="sm" onClick={refreshOrders}>
            更新
          </Button>
        </div>
      </header>

      {/* ステータスフィルター */}
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-2xl overflow-x-auto px-4 py-2">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="shrink-0"
            >
              すべて
            </Button>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={filterStatus === key ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilterStatus(key)}
                className="shrink-0"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* 座席番号で会計確認 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">座席番号で会計確認</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="座席番号を入力（例: A1）"
                value={seatFilter}
                onChange={(e) => setSeatFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupSeatBilling()}
                className="flex-1"
              />
              <Button onClick={lookupSeatBilling}>検索</Button>
            </div>
            {seatBilling && (
              <div className="mt-4">
                {seatBilling.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    座席「{seatBilling.seat}」の注文はありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      座席「{seatBilling.seat}」の注文（{seatBilling.orders.length}件）
                    </p>
                    {seatBilling.orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-lg border p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">注文 #{order.id}</span>
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
                    <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
                      <span>会計合計</span>
                      <span>¥{seatBilling.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mb-4 text-sm text-muted-foreground">
          {filteredOrders.length}件の注文
        </p>

        {filteredOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            該当する注文がありません
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              const nextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          注文 #{order.id}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatTime(order.createdAt)}
                          {order.seatNumber && ` ・ 座席 ${order.seatNumber}`}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANTS[order.status] ?? "outline"}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="text-muted-foreground">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between border-t pt-1 font-medium">
                        <span>合計</span>
                        <span>¥{total.toLocaleString()}</span>
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
                          >
                            {updatingId === order.id
                              ? "更新中..."
                              : STATUS_LABELS[s]}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
