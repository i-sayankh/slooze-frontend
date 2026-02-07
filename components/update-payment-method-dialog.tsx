"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethod {
  id: number;
  type: string;
  provider: string;
  last_four: string;
  is_default: boolean;
}

export default function UpdatePaymentMethodDialog({
  payment,
  open,
  onOpenChange,
  refresh,
}: {
  payment: PaymentMethod | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refresh: () => void | Promise<void>;
}) {
  const [provider, setProvider] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (payment) {
      setProvider(payment.provider);
      setIsDefault(payment.is_default);
    }
  }, [payment]);

  const handleSubmit = async () => {
    if (!payment) return;
    try {
      await api.put(`/payments/${payment.id}`, {
        provider,
        is_default: isDefault,
      });

      toast.success("Payment method updated 💳");
      onOpenChange(false);
      await refresh();
    } catch {
      toast.error("Failed to update payment method");
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Update Payment Method</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={payment.type}>
            <SelectTrigger id="type" className="w-full" disabled>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            placeholder="e.g. HDFC Bank Visa, Google Pay"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_four">Last 4 digits</Label>
          <Input
            id="last_four"
            placeholder="e.g. 4821"
            value={payment.last_four}
            disabled
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="is_default">Set as default</Label>
          <Switch
            id="is_default"
            checked={isDefault}
            onCheckedChange={setIsDefault}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Update Payment Method
        </Button>
      </DialogContent>
    </Dialog>
  );
}
