import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Andres Sportsweartz | Move with confidence",
  description: "Shop modern sports shoes, training kits, sportswear and training clothes from Andres Sportsweartz.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>{children}</CartProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
