import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
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
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <Link href="/admin" className="h-16 flex items-center px-6 border-b hover:bg-accent transition-colors">
        <span className="font-bold text-lg">
          NOMADE
        </span>
      </Link>

      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-2
                text-sm
                hover:bg-accent
                transition-colors
              "
            >
              <Icon className="h-4 w-4" />

              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}