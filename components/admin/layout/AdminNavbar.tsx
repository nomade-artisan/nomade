"use client";

import { LogOut } from "lucide-react";

export default function AdminNavbar() {
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
    } finally {
      window.location.href = "/admin-login";
    }
  };

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between">

      <div className="text-sm text-muted-foreground">
        Administration
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Deconnexion
      </button>
    </header>
  );
}