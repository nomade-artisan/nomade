// app/success/page.tsx
import { Metadata } from "next";
import SuccessClient from "./SuccessClient";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Commande confirmée | Nomade",
};

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessClient />
    </Suspense>
  );
}