import { Metadata } from "next";
import MentionsLegalesClient from "./MentionsLegalesClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/mentions-legales",
  },
  title: "Mentions légales",
  description: "Mentions légales du site Nomade.",
};

export default function MentionsLegalesPage() {
  return <MentionsLegalesClient />;
}
