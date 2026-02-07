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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateRestaurantDialog({
  refresh,
}: {
  refresh: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/restaurants", {
        name,
        country,
      });

      toast.success("Restaurant created 🎉");
      setOpen(false);
      setName("");
      setCountry("");
      await refresh();
    } catch {
      toast.error("Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Restaurant</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Restaurant</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Restaurant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="America">America</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Creating restaurant...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
