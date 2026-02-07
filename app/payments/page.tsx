"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddPaymentMethodDialog from "@/components/add-payment-method-dialog";

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
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <AddPaymentMethodDialog refresh={refreshPaymentMethods} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(paymentMethods ?? []).map((pm) => (
          <Card key={pm.id} className="hover:shadow-lg transition">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{pm.provider}</h2>
                {pm.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
              <Badge variant="outline">{pm.type}</Badge>
              <p className="text-sm text-muted-foreground">
                •••• {pm.last_four}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
