import { Metadata } from "next";
import HistoireClient from "./HistoireClient";

export const metadata: Metadata = {
  title: "Notre Histoire",
  description:
    "L'histoire de Nomade, la maison qui donne naissance a la marque SCOLTA.",
};

export default function HistoirePage() {
  return <HistoireClient />;
}