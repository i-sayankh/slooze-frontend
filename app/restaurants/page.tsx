"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { getUser } from "@/lib/user";
import CreateRestaurantDialog from "@/components/create-restaurant-dialog";

interface Restaurant {
  id: number | string;
  name: string;
  country: string;
}

const fetchRestaurants = async () => {
  const res = await api.get("/restaurants");
  const data = res.data;
  return Array.isArray(data)
    ? data
    : (data?.items ?? data?.restaurants ?? data?.data ?? []);
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  const refreshRestaurants = async () => {
    const data = await fetchRestaurants();
    setRestaurants(data);
  };

  useEffect(() => {
    let cancelled = false;
    fetchRestaurants()
      .then((data) => {
        if (!cancelled) setRestaurants(data);
      })
      .catch(() => {
        if (!cancelled) setRestaurants([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Restaurants</h1>
        {user?.role === "ADMIN" && (
          <CreateRestaurantDialog refresh={refreshRestaurants} />
        )}
      </div>

      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-muted-foreground">No restaurants available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <Card key={r.id} className="hover:shadow-lg transition">
              <CardContent className="p-6 flex flex-col gap-3">
                <h2 className="text-xl font-semibold">{r.name}</h2>

                <Badge variant="secondary">{r.country}</Badge>

                <Link
                  href={`/restaurants/${r.id}`}
                  className="text-sm text-blue-600 mt-2"
                >
                  View Menu →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
