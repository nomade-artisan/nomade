// app/histoire/page.tsx
import { Metadata } from "next";
import HistoireClient from "./HistoireClient";

export const metadata: Metadata = {
  title: "Notre Histoire",
  description:
    "L'histoire de Nomade, une marque née de la route et des mains tendues.",
};

export default function HistoirePage() {
  return <HistoireClient />;
}