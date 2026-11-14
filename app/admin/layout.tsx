import AdminNavbar from "@/components/admin/layout/AdminNavbar";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
