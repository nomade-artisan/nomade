// app/success/page.tsx
import { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "Commande confirmée | Nomade",
};

export default function SuccessPage() {
  return <SuccessClient />;
}