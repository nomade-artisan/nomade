import Link from "next/link";

const items = [
  {
    name: "Dashboard",
    href: "/admin/analytics",
  },
  {
    name: "Tendances",
    href: "/admin/analytics/trends",
  },
  {
    name: "Stocks",
    href: "/admin/analytics/stocks",
  },
  {
    name: "Produits",
    href: "/admin/analytics/products",
  },
];

export default function AnalyticsSidebar() {
  return (
    <aside className="w-64 border-r border-stone-200 bg-white hidden md:block">
      <div className="p-6">
        <h2 className="text-lg font-medium">
          Analytics
        </h2>
      </div>

      <nav className="px-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="
              block
              px-4
              py-3
              rounded-xl
              text-sm
              text-stone-600
              hover:bg-stone-100
            "
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}