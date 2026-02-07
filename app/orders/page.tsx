"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderItem {
  menu_item_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  restaurant_id: number;
  restaurant_name: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const fetchOrders = async (): Promise<Order[]> => {
  const res = await api.get<{ items: Order[]; pagination_metadata?: unknown }>(
    "/orders/",
  );
  const data = res.data;
  const list = data?.items ?? [];
  return Array.isArray(list) ? list : [];
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function OrderStatus({ status }: { status: string }) {
  const isCancelled = status === "CANCELLED";
  const isPlaced = status === "PLACED";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        isCancelled &&
          "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/40 dark:border-red-500 dark:text-red-400",
        isPlaced &&
          "border-green-600 text-green-700 bg-green-50 dark:bg-green-950/40 dark:border-green-500 dark:text-green-400",
        !isCancelled &&
          !isPlaced &&
          "border-border text-muted-foreground bg-muted/50",
      )}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancellingId, setCancellingId] = useState<string | number | null>(
    null,
  );

  const refreshOrders = async () => {
    const data = await fetchOrders();
    setOrders(data);
  };

  useEffect(() => {
    let cancelled = false;
    fetchOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancelOrder = async (order: Order) => {
    setCancellingId(order.id);
    try {
      await api.patch(`/orders/${order.id}/cancel`);
      toast.success("Order cancelled");
      await refreshOrders();
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(orders ?? []).map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Order #{order.id.slice(-8)}
                  </p>
                  <h2 className="text-lg font-semibold truncate mt-0.5">
                    {order.restaurant_name}
                  </h2>
                </div>
                <OrderStatus status={order.status} />
              </div>

              <ul className="space-y-2 border-t border-border pt-3">
                {order.items?.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="text-foreground">
                      {item.menu_item_name}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums shrink-0">
                      {formatMoney(item.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-base font-bold tabular-nums">
                  {formatMoney(order.total_amount)}
                </span>
              </div>

              <div className="mt-auto pt-1 flex justify-end">
                {order.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                    onClick={() => handleCancelOrder(order)}
                    disabled={cancellingId === order.id}
                  >
                    {cancellingId === order.id ? "Cancelling…" : "Cancel Order"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <p className="text-muted-foreground mt-4">No orders yet.</p>
      )}
    </div>
  );
}
