// app/(public)/layout.tsx

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://scolta.nomade-artisan.fr"),
  other: {
    "google-site-verification": "hkZccZ963jGS25PmoKeaKPWWg8TxmLjeiCJFT_BPjR8",
  },

  title: {
    default: "SCOLTA by Nomade",
    template: "%s | SCOLTA by Nomade",
  },

  description:
    "Maroquinerie fabriquée à Alès. Sacs et accessoires conçus à la main en petites séries.",

  alternates: {
    canonical: "/",
  },

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
    title: "SCOLTA by Nomade",
    description:
      "Sacs et accessoires fabriqués à Alès.",
    url: "https://scolta.nomade-artisan.fr",
    siteName: "SCOLTA by Nomade",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SCOLTA by Nomade - Maroquinerie artisanale",
      },
    ],

    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SCOLTA by Nomade",
    description:
      "Sacs et accessoires artisanaux fabriqués à Alès.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
