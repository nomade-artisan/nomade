import AdminNavbar from "@/components/admin/layout/AdminNavbar";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}