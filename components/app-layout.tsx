"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import CartDrawer from "@/components/cart-drawer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const LOGIN_PATH = "/login";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === LOGIN_PATH;

  if (isLoginPage) {
    return (
      <>
        <Navbar showCart={false} />
        <div className="min-h-0 flex-1">
          <div className="max-w-6xl mx-auto p-6">{children}</div>
        </div>
      </>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Navbar showCart />
        <CartDrawer />
        <div className="flex-1 min-h-0 overflow-auto bg-gray-50">
          <div className="max-w-6xl mx-auto p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
