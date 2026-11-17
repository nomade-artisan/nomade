import { Metadata } from "next";
import HistoireClient from "./HistoireClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/histoire",
  },
  title: "Notre Histoire",
  description:
    "NOMADE est née à Alès d'une envie d'entreprendre et de garder du temps pour la famille. Découvrez SCOLTA et sa fabrication, de la coupe à l'assemblage.",
};

export default function HistoirePage() {
  return <HistoireClient />;
}
