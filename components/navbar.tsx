"use client";

import { useSyncExternalStore } from "react";
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

export function Navbar({ showCart = true }: { showCart?: boolean }) {
  const hasMounted = useHasMounted();
  const user = hasMounted ? getUser() : null;
  const { toggleCart, items } = useCart();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-12 items-center justify-end gap-3 px-4">
        {user && (
          <Badge variant="secondary" className="font-normal text-muted-foreground">
            {user.role}
          </Badge>
        )}

        {showCart && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-muted-foreground hover:text-foreground"
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <ShoppingCart className="size-5" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                {itemCount}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
