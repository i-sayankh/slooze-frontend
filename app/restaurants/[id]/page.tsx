"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { getUser } from "@/lib/user";
import CreateMenuItemDialog from "@/components/create-menu-item-dialog";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  restaurant_id: number;
}

interface MenuItemsResponse {
  items: MenuItem[];
  pagination_metadata: {
    total: number;
    skip: number;
    limit: number;
    start: number;
    end: number;
  };
}

const fetchMenuItems = async (id: string) => {
  const res = await api.get<MenuItemsResponse>(`/menu-items/${id}`);
  return res.data.items;
};

export default function RestaurantMenuPage() {
  const user = getUser();
  const { id } = useParams();
  const { addItem } = useCart();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api.get<MenuItemsResponse>(`/menu-items/${id}`).then((res) => {
      setItems(res.data.items);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading menu...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Menu</h1>
        {user?.role === "ADMIN" && (
          <CreateMenuItemDialog
            restaurantId={Number(id)}
            refresh={async () => {
              const newItems = await fetchMenuItems(id as string);
              setItems(newItems);
            }}
          />
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{item.name}</h2>

                {item.is_available ? (
                  <Badge variant="secondary">Available</Badge>
                ) : (
                  <Badge variant="destructive">Unavailable</Badge>
                )}
              </div>

              <p className="text-sm text-gray-500">{item.description}</p>

              <div className="flex justify-between items-center mt-4">
                <span className="font-semibold">₹{item.price}</span>

                <Button
                  disabled={!item.is_available}
                  onClick={() =>
                    addItem({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      restaurant_id: Number(id),
                    })
                  }
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
