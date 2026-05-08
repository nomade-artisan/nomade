// app/contact/page.tsx
import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact | Nomade",
  description:
    "Une question, une envie ? Écrivez-nous. On vous répond toujours.",
};

export default function ContactPage() {
  return <ContactClient />;
}