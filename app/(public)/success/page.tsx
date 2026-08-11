import { Metadata } from "next";
import SuccessClient from "./SuccessClient";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessClient />
    </Suspense>
  );
}