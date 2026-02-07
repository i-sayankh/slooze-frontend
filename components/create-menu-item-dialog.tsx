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

export default function CreateMenuItemDialog({
  restaurantId,
  refresh,
}: {
  restaurantId: number;
  refresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/menu-items/", {
        name,
        description: description || name,
        price: Number(price),
        restaurant_id: restaurantId,
      });

      toast.success("Menu item added 🍽️");
      setName("");
      setDescription("");
      setPrice("");
      setOpen(false);
      refresh();
    } catch {
      toast.error("Failed to add menu item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Menu Item</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Adding item...
            </>
          ) : (
            "Add"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
