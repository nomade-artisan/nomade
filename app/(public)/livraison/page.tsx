import { Metadata } from "next";
import LivraisonClient from "./LivraisonClient";

export const metadata: Metadata = {
  title: "Livraison & Retours",
  description:
    "Livraison standard offerte dès 100€, retours gratuits sous 15 jours.",
};

export default function LivraisonPage() {
  return <LivraisonClient />;
}