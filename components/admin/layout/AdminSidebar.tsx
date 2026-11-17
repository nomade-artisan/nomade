import Link from "next/link";
import {
  LayoutDashboard,
  Layers3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Ticket,
} from "lucide-react";

const links = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Produits",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Commandes",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Clients",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: Package,
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: Layers3,
  },
  {
    label: "Codes promo",
    href: "/admin/promo-codes",
    icon: Ticket,
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  mobileHidden: boolean;
  isMobile: boolean;
  pathname: string;
  onNavigate: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  mobileHidden,
  isMobile,
  pathname,
  onNavigate,
}: AdminSidebarProps) {
  return (
    <aside
      id="admin-navigation"
      role={isMobile && mobileOpen ? "dialog" : undefined}
      aria-label={isMobile && mobileOpen ? "Menu d’administration" : undefined}
      aria-modal={isMobile && mobileOpen ? true : undefined}
      inert={mobileHidden}
      className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-3rem)] flex-col border-r bg-background shadow-xl transition-transform duration-200 ease-out md:relative md:z-auto md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center border-b px-6 transition-colors hover:bg-accent"
      >
        <span className="font-bold text-lg">
          NOMADE
        </span>
      </Link>

      <nav aria-label="Navigation administration" className="flex-1 space-y-1 overflow-y-auto p-3 sm:p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                isActive ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />

              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
