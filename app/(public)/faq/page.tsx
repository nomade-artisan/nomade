// app/faq/page.tsx
import { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ | Nomade",
  description:
    "Les réponses à vos questions. Simple, comme tout ce qu'on fait.",
};

export default function FaqPage() {
  return <FaqClient />;
}