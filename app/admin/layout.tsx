import AdminShell from "@/components/admin/layout/AdminShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionTokenValid,
} from "@/lib/security/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!isAdminSessionTokenValid(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin-login");
  }

  return <AdminShell>{children}</AdminShell>;
}
