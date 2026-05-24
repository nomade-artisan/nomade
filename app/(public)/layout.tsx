// app/(public)/layout.tsx
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Analytics } from "@vercel/analytics/next"
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Nomade | L'essentiel est à l'intérieur",
  description:
    "Nomade crée des sacs faits main, durables, pour les voyageurs de l'essentiel.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Analytics />
      <Navbar />
      <MaintenanceBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}