
// app/confidentialite/page.tsx
import { Metadata } from "next";
import ConfidentialiteClient from "./ConfidentialiteClient";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Nomade.",
};

export default function ConfidentialitePage() {
  return <ConfidentialiteClient />;
}