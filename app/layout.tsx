import { CartProvider } from "@/components/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <SpeedInsights />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}