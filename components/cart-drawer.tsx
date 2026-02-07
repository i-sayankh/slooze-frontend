"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cart-context";
import { getUser } from "@/lib/user";
import api from "@/lib/api";
import { useEffect, useSyncExternalStore, useState } from "react";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: number;
  type: string;
  provider: string;
  last_four: string;
  is_default: boolean;
}

interface PaymentsResponse {
  items: PaymentMethod[];
  pagination_metadata: {
    total: number;
    skip: number;
    limit: number;
    start: number;
    end: number;
  };
}

export default function CartDrawer() {
  const { items, open, toggleCart, clearCart } = useCart();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = mounted ? getUser() : null;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const canCheckout = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (!canCheckout) return;

    api.get<PaymentsResponse>("/payments").then((res) => {
      setPayments(res.data.items);
      const defaultPayment = res.data.items.find((p) => p.is_default);
      if (defaultPayment) {
        setSelectedPayment(String(defaultPayment.id));
      }
    });
  }, [canCheckout]);

  const handleCheckout = async () => {
    if (!selectedPayment) return toast.error("Select payment method");

    setLoading(true);

    try {
      // Step 1: Create Order
      const orderRes = await api.post("/orders", {
        restaurant_id: items[0]?.restaurant_id || 1,
      });

      const orderId = orderRes.data.order_id;

      // Step 2: Add Items
      for (const item of items) {
        await api.post(`/orders/${orderId}/items`, {
          menu_item_id: item.id,
          quantity: item.quantity,
        });
      }

      // Step 3: Checkout
      await api.post(`/orders/${orderId}/checkout`, {
        payment_id: Number(selectedPayment),
      });

      toast.success("Order placed successfully 🎉");

      clearCart();
      toggleCart();
    } catch {
      toast.error("Checkout failed");
    }

    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={toggleCart}>
      <SheetContent className="flex flex-col gap-0 p-0 w-full sm:max-w-md">
        <SheetHeader className="px-6 pr-12 pt-8 pb-8 space-y-0 border-b border-border/60">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            Your Cart 🛒
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 py-8 flex flex-col gap-8">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start gap-5 py-4 px-5 rounded-xl bg-muted/50 border border-border/50"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-medium text-foreground truncate leading-tight">
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-foreground shrink-0 tabular-nums pt-0.5">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Total */}
          <div className="flex justify-between items-center py-4">
            <span className="font-semibold text-base">Total</span>
            <span className="font-semibold text-lg tabular-nums">
              ₹{total}
            </span>
          </div>

          {/* Checkout section */}
          {canCheckout && (
            <div className="space-y-5 pt-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground block">
                  Payment method
                </label>
                <Select
                  value={selectedPayment ?? undefined}
                  onValueChange={setSelectedPayment}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent portal={false} position="popper">
                    {payments.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.provider} ••••{p.last_four}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 font-medium mt-2"
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          )}

          {!canCheckout && (
            <p className="text-sm text-muted-foreground pt-4">
              Members cannot checkout orders.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
