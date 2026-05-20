// app/admin/AdminClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/db";
import ProductsView from "./ProductsView";
import OrdersView from "./OrdersView";
import {
  Package,
  ShoppingBag,
  Plus,
  RefreshCcw,
} from "lucide-react";

// ==================== TYPES ====================
export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  shipping_address: any;
  items: any;
  created_at: string;
  tracking_number?: string;
  carrier?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  details: string[];
  category: string;
  is_new: boolean;
  rating: number;
  reviews: number;
}

// ==================== CONSTANTES ====================
export const carrierNames: Record<string, string> = { mondialrelay: "Mondial Relay", colissimo: "Colissimo" };
export const trackingUrls: Record<string, string> = {
  mondialrelay: "https://www.mondialrelay.com/suivi-de-colis/?numExpedition=",
  colissimo: "https://www.laposte.fr/outils/suivre-vos-envois?code=",
};

export const statusBadge = (status: string) => {
  switch (status) {
    case "payée": return "bg-blue-50 text-blue-600";
    case "en préparation": return "bg-amber-50 text-amber-600";
    case "expédiée": return "bg-emerald-50 text-emerald-600";
    case "annulée": return "bg-red-50 text-red-500";
    default: return "bg-stone-100 text-stone-500";
  }
};

export const stockBadge = (stock: number) => {
  if (stock === 0) return "bg-red-50 text-red-500";
  if (stock <= 3) return "bg-amber-50 text-amber-600";
  return "bg-emerald-50 text-emerald-600";
};

export default function AdminClient() {
  const [activeSection, setActiveSection] = useState<"dashboard" | "orders" | "products">("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()]).then(() => setLoading(false));
  }, []);

  const pendingCount = orders.filter((o) => o.status === "payée").length;
  const currentMonthCA = orders.filter((o) => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((acc, o) => acc + o.total, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f2eb]">
        <p className="text-stone-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f2eb]">
      {/* TOPBAR */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#f6f2eb]/80 border-b border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-stone-400 mb-0.5">Nomade</p>
            <h1 className="text-2xl md:text-3xl font-extralight tracking-tight">Admin</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => { fetchOrders(); fetchProducts(); }}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-black/[0.05] flex items-center justify-center"
            >
              <RefreshCcw size={16} />
            </button>
            {activeSection === "products" && (
              <button
                onClick={() => {
                  const event = new CustomEvent("open-create-product");
                  window.dispatchEvent(event);
                }}
                className="hidden md:flex h-11 px-5 rounded-full bg-stone-900 text-white text-xs uppercase tracking-[0.2em] items-center gap-2"
              >
                <Plus size={14} /> Nouveau
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NAV */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-4 pb-2 flex gap-2 overflow-x-auto">
        {[
          { key: "dashboard", label: "Dashboard" },
          { key: "orders", label: "Commandes" },
          { key: "products", label: "Produits" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key as any)}
            className={`h-10 md:h-11 px-4 md:px-5 rounded-full whitespace-nowrap text-[10px] md:text-[11px] uppercase tracking-[0.18em] transition-all ${
              activeSection === item.key ? "bg-stone-900 text-white" : "bg-white text-stone-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8">
        {activeSection === "dashboard" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "Produits", value: products.length },
              { label: "Commandes", value: orders.length },
              { label: "À préparer", value: pendingCount },
              { label: "CA ce mois", value: `${currentMonthCA.toFixed(0)}€` },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-7">
                <p className="text-xs md:text-sm text-stone-400 mb-2 md:mb-3">{stat.label}</p>
                <h2 className="text-3xl md:text-5xl font-extralight">{stat.value}</h2>
              </div>
            ))}
          </div>
        )}

        {activeSection === "products" && (
          <ProductsView
            products={products}
            fetchProducts={fetchProducts}
          />
        )}

        {activeSection === "orders" && (
          <OrdersView
            orders={orders}
            fetchOrders={fetchOrders}
          />
        )}
      </div>
    </div>
  );
}