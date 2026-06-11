// app/admin/page.tsx
import { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return <AdminClient />;
}