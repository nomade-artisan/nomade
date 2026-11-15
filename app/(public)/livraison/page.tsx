import { Metadata } from "next";
import LivraisonClient from "./LivraisonClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/livraison",
  },
  title: "Livraison & Retours",
  description:
    "Livraison standard offerte dès 120€, retours gratuits sous 15 jours.",
};

export default function LivraisonPage() {
  return <LivraisonClient />;
}
