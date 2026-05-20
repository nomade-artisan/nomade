// app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mini barre admin */}
      <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-stone-900 text-white flex items-center justify-between px-4 text-[10px] uppercase tracking-wider">
        <span>Nomade Admin</span>
        <Link href="/" className="text-white/60 hover:text-white transition-colors">
          Voir le site
        </Link>
      </div>
      <div className="pt-10">
        {children}
      </div>
    </>
  );
}