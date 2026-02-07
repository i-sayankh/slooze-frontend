"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddPaymentMethodDialog({
  refresh,
}: {
  refresh: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"CARD" | "UPI">("CARD");
  const [provider, setProvider] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setType("CARD");
    setProvider("");
    setLastFour("");
    setIsDefault(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/payments/", {
        type,
        provider,
        last_four: lastFour,
        is_default: isDefault,
      });

      toast.success("Payment method added 💳");
      setOpen(false);
      resetForm();
      await refresh();
    } catch {
      toast.error("Failed to add payment method");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Payment Method</Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "CARD" | "UPI")}>
            <SelectTrigger id="type" className="w-full">
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
            value={lastFour}
            onChange={(e) => setLastFour(e.target.value)}
            maxLength={4}
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

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Adding payment method...
            </>
          ) : (
            "Add Payment Method"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
