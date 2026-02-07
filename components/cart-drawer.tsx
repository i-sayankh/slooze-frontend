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
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/context/cart-context";
import { getUser } from "@/lib/user";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { items, open, toggleCart, clearCart } = useCart();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const user = mounted ? getUser() : null;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const canCheckout = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (!canCheckout) return;

    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) setLoadingPayments(true);
    }, 0);

    api
      .get<PaymentsResponse>("/payments")
      .then((res) => {
        if (cancelled) return;
        setPayments(res.data.items);
        const defaultPayment = res.data.items.find((p) => p.is_default);
        if (defaultPayment) {
          setSelectedPayment(String(defaultPayment.id));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPayments(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [canCheckout]);

  const createOrderAndAddItems = async (): Promise<number | null> => {
    const orderRes = await api.post("/orders", {
      restaurant_id: items[0]?.restaurant_id || 1,
    });
    const orderId = orderRes.data.order_id;
    for (const item of items) {
      await api.post(`/orders/${orderId}/items`, {
        menu_item_id: item.id,
        quantity: item.quantity,
      });
    }
    return orderId;
  };

  const handleCheckout = async () => {
    if (!selectedPayment) return toast.error("Select payment method");

    setLoading(true);

    try {
      const orderId = await createOrderAndAddItems();
      if (orderId == null) return;
      await api.post(`/orders/${orderId}/checkout`, {
        payment_id: Number(selectedPayment),
      });
      toast.success("Order placed successfully 🎉");
      clearCart();
      toggleCart();
      router.push("/orders");
    } catch {
      toast.error("Checkout failed");
    }

    setLoading(false);
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      await createOrderAndAddItems();
      toast.success("Order created successfully. It will be processed once payment is completed.");
      clearCart();
      toggleCart();
      router.push("/orders");
    } catch {
      toast.error("Failed to create order");
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
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-muted-foreground">Your cart is empty. Browse a restaurant and add some items!</p>
            </div>
          ) : (
            <>
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
                    {loadingPayments ? (
                      <div className="flex items-center gap-2 h-11 px-3 rounded-md border border-input bg-muted/50">
                        <Spinner className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading payment methods...</span>
                      </div>
                    ) : (
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
                    )}
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={loading || loadingPayments}
                    className="w-full h-12 font-medium mt-2"
                  >
                    {loading ? (
                      <>
                        <Spinner className="size-4" />
                        Processing order...
                      </>
                    ) : (
                      "Checkout"
                    )}
                  </Button>
                </div>
              )}

              {!canCheckout && (
                <div className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Members cannot pay or checkout. You can create the order for Admin or Manager to complete payment.
                  </p>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="w-full h-12 font-medium"
                    variant="secondary"
                  >
                    {loading ? (
                      <>
                        <Spinner className="size-4" />
                        Creating order...
                      </>
                    ) : (
                      "Create order"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
