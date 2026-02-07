"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getUser } from "@/lib/user";
import { ShieldAlert } from "lucide-react";
import AddPaymentMethodDialog from "@/components/add-payment-method-dialog";
import UpdatePaymentMethodDialog from "@/components/update-payment-method-dialog";

interface PaymentMethod {
  id: number;
  type: string;
  provider: string;
  last_four: string;
  is_default: boolean;
}

const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await api.get("/payments/", { params: { skip: 0, limit: 20 } });
  const data = res.data;
  return data?.items ?? [];
};

export default function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const user = mounted ? getUser() : null;
  const isAdmin = user?.role === "ADMIN";

  const refreshPaymentMethods = async () => {
    const data = await fetchPaymentMethods();
    setPaymentMethods(data);
  };

  useEffect(() => {
    let cancelled = false;
    fetchPaymentMethods()
      .then((data) => {
        if (!cancelled) setPaymentMethods(data);
      })
      .catch(() => {
        if (!cancelled) setPaymentMethods([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (mounted && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShieldAlert className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Only admins can add or modify payment methods. Contact your admin if
          you need changes to your payment settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <AddPaymentMethodDialog refresh={refreshPaymentMethods} />
      </div>

      {paymentMethods.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-muted-foreground">No payment methods added yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((pm) => (
            <Card key={pm.id} className="hover:shadow-lg transition">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{pm.provider}</h2>
                  {pm.is_default && <Badge variant="secondary">Default</Badge>}
                </div>
                <Badge variant="outline">{pm.type}</Badge>
                <p className="text-sm text-muted-foreground">
                  •••• {pm.last_four}
                </p>
                <div className="flex justify-end mt-auto pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(pm);
                      setUpdateDialogOpen(true);
                    }}
                  >
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UpdatePaymentMethodDialog
        payment={selectedPayment}
        open={updateDialogOpen}
        onOpenChange={(open) => {
          setUpdateDialogOpen(open);
          if (!open) setSelectedPayment(null);
        }}
        refresh={refreshPaymentMethods}
      />
    </div>
  );
}
