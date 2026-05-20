// app/mentions-legales/page.tsx
import { Metadata } from "next";
import MentionsLegalesClient from "./MentionsLegalesClient";

export const metadata: Metadata = {
  title: "Mentions légales | Nomade",
  description: "Mentions légales du site Nomade.",
};

export default function MentionsLegalesPage() {
  return <MentionsLegalesClient />;
}