"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { getUser } from "@/lib/user";
import { useCart } from "@/context/cart-context";

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Navbar() {
  const hasMounted = useHasMounted();
  const user = hasMounted ? getUser() : null;
  const { toggleCart, items } = useCart();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <Link href="/" className="font-bold text-xl">
          Slooze
        </Link>

        <div className="flex items-center gap-4">
          {user && <Badge variant="secondary">{user.role}</Badge>}

          <div className="relative">
            <Button variant="ghost" onClick={toggleCart}>
              <ShoppingCart className="w-5 h-5" />
            </Button>

            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full px-2 py-[2px]">
                {itemCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
