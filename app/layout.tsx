import { CartProvider } from "@/context/cart-context";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "@/components/app-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Toaster />
        <CartProvider>
          <AppLayout>{children}</AppLayout>
        </CartProvider>
      </body>
    </html>
  );
}
