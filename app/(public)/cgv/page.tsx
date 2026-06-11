// app/cgv/page.tsx
import { Metadata } from "next";
import CgvClient from "./CgvClient";

export const metadata: Metadata = {
  title: "CGV",
  description: "Conditions Générales de Vente de Nomade.",
};

export default function CgvPage() {
  return <CgvClient />;
}