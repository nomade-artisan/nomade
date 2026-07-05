import { CartProvider } from "@/components/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <body>
        <CartProvider>
          <SpeedInsights />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}