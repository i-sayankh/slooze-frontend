"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  UtensilsCrossed,
  CreditCard,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import { getUser, getDisplayFirstName } from "@/lib/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const navItems = [
  { title: "Restaurants", href: "/restaurants", icon: UtensilsCrossed },
  { title: "Payment Methods", href: "/payments", icon: CreditCard },
  { title: "Orders", href: "/orders", icon: ShoppingBag },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const hasMounted = useHasMounted();
  const user = hasMounted ? getUser() : null;
  const displayName = user ? getDisplayFirstName(user) : "User";

  const handleLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-10 items-center gap-2 px-2">
          <SidebarTrigger className="size-8" />
          <Link
            href="/"
            className="font-bold text-lg truncate group-data-[collapsible=icon]:hidden"
          >
            Slooze
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Hey! {displayName}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
            <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
