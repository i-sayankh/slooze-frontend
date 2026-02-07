import { CartProvider } from "@/context/cart-context";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import CartDrawer from "@/components/cart-drawer";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Toaster />
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="max-w-6xl mx-auto p-6">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
