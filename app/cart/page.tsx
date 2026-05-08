// app/cart/page.tsx
import { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Panier | Nomade",
  description:
    "Votre panier Nomade. L'essentiel est à l'intérieur.",
};

export default function CartPage() {
  return <CartClient />;
}