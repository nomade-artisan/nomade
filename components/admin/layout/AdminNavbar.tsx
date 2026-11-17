"use client";

import { LogOut, Menu, X } from "lucide-react";

interface AdminNavbarProps {
  mobileNavOpen: boolean;
  onMenuClick: () => void;
}

export default function AdminNavbar({
  mobileNavOpen,
  onMenuClick,
}: AdminNavbarProps) {
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-3 sm:h-16 sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          id="admin-mobile-menu-toggle"
          aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-controls="admin-navigation"
          aria-expanded={mobileNavOpen}
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          {mobileNavOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>

        <div className="truncate text-sm font-medium text-muted-foreground">
          Administration
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Déconnexion"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-2.5 text-sm transition-colors hover:bg-accent sm:px-3"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </header>
  );
}
