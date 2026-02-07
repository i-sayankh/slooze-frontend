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
import { useEffect, useState } from "react";
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
  const user = getUser();
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const canCheckout = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (!canCheckout) return;

    api.get<PaymentsResponse>("/payments").then((res) => {
      setPayments(res.data.items);
    });
  }, []);

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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart 🛒</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p>{item.name}</p>
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
              <p>₹{item.price * item.quantity}</p>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {canCheckout && (
            <>
              <Select onValueChange={setSelectedPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {payments.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.provider} ••••{p.last_four}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </>
          )}

          {!canCheckout && (
            <p className="text-sm text-gray-500 mt-4">
              Members cannot checkout orders.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
