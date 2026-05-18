import type { Metadata } from "next";
import { CartProvider } from "@/components/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navbar from "@/components/Navbar";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomade | L'essentiel est à l'intérieur",
  description:
    "Nomade crée des sacs faits main, durables, pour les voyageurs de l'essentiel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <SpeedInsights />

          <div className="flex flex-col min-h-screen">
            <Navbar />
            <MaintenanceBanner />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}