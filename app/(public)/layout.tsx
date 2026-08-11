// app/(public)/layout.tsx

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nomade-artisan.fr"),

  title: {
    default: "Nomade",
    template: "%s | Nomade",
  },

  description:
    "Maroquinerie fabriquée à Ales. Sacs et accessoires conçus à la main en petites séries.",

  keywords: [
    "nomade",
    "sac artisanal",
    "maroquinerie",
    "cuir",
    "sac fait main",
    "artisan",
    "accessoires",
    "Nîmes",
    "France",
  ],

  openGraph: {
    title: "Nomade",
    description:
      "Sacs et accessoires fabriqués à Ales.",
    url: "https://www.nomade-artisan.fr",
    siteName: "Nomade",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nomade - Maroquinerie artisanale",
      },
    ],

    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nomade",
    description:
      "Sacs et accessoires artisanaux fabriqués à Ales .",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Analytics />
      <AnalyticsTracker />
      <CookieConsent/>
      <Navbar />
      <MaintenanceBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
