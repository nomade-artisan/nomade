"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavbar from "@/components/admin/layout/AdminNavbar";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wasMobileNavOpen = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      const matchesMobile = mediaQuery.matches;
      setIsMobile(matchesMobile);
      if (!matchesMobile) setMobileNavOpen(false);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    const keepFocusInMenu = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const menu = document.getElementById("admin-navigation");
      const focusableItems = menu?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableItems?.length) return;

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("keydown", keepFocusInMenu);

    document
      .getElementById("admin-navigation")
      ?.querySelector<HTMLElement>("a[href]")
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("keydown", keepFocusInMenu);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (mobileNavOpen) {
      wasMobileNavOpen.current = true;
      return;
    }

    if (wasMobileNavOpen.current && isMobile) {
      document.getElementById("admin-mobile-menu-toggle")?.focus();
    }
    wasMobileNavOpen.current = false;
  }, [isMobile, mobileNavOpen]);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Fermer le menu d’administration"
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <AdminSidebar
        mobileOpen={mobileNavOpen}
        mobileHidden={isMobile && !mobileNavOpen}
        isMobile={isMobile}
        pathname={pathname}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar
          mobileNavOpen={mobileNavOpen}
          onMenuClick={() => setMobileNavOpen((open) => !open)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
