// app/livraison/page.tsx
import { Metadata } from "next";
import LivraisonClient from "./LivraisonClient";

export const metadata: Metadata = {
  title: "Livraison & Retours",
  description:
    "Livraison standard offerte dès 100€, retours gratuits sous 30 jours. Simple, comme tout ce qu'on fait.",
};

export default function LivraisonPage() {
  return <LivraisonClient />;
}