// app/admin/AdminClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/db";

interface Order {
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

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  is_new: boolean;
  rating: number;
  reviews: number;
}

const carrierNames: Record<string, string> = {
  laposte: "La Poste",
  chronopost: "Chronopost",
  colissimo: "Colissimo",
  mondialrelay: "Mondial Relay",
  ups: "UPS",
  dhl: "DHL",
};

const trackingUrls: Record<string, string> = {
  laposte: "https://www.laposte.fr/outils/suivre-vos-envois?code=",
  chronopost: "https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=",
  colissimo: "https://www.laposte.fr/outils/suivre-vos-envois?code=",
  mondialrelay: "https://www.mondialrelay.com/suivi-de-colis/?numExpedition=",
  ups: "https://www.ups.com/track?tracknum=",
  dhl: "https://www.dhl.com/fr-fr/home/tracking/tracking-express.html?submit=1&tracking-id=",
};

function AdminClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState<"orders" | "products">("orders");
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});
  const [trackingCarriers, setTrackingCarriers] = useState<Record<number, string>>({});
  const [sendingPreparation, setSendingPreparation] = useState<Record<number, boolean>>({});
  const [sendingShipping, setSendingShipping] = useState<Record<number, boolean>>({});
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Commandes
  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const sendPreparationEmail = async (order: Order) => {
    setSendingPreparation((prev) => ({ ...prev, [order.id]: true }));
    const res = await fetch("/api/send-preparation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    if (res.ok) fetchOrders();
    setSendingPreparation((prev) => ({ ...prev, [order.id]: false }));
  };

  const sendShippingEmail = async (order: Order) => {
    const trackingNumber = trackingInputs[order.id]?.trim();
    if (!trackingNumber) return alert("Entre un numéro de suivi");

    const carrier = trackingCarriers[order.id] || "laposte";
    const trackingUrl = trackingUrls[carrier] + trackingNumber;

    setSendingShipping((prev) => ({ ...prev, [order.id]: true }));

    const res = await fetch("/api/send-shipping-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, trackingNumber, trackingUrl, carrier }),
    });

    if (res.ok) {
      setTrackingInputs((prev) => ({ ...prev, [order.id]: "" }));
      setTrackingCarriers((prev) => ({ ...prev, [order.id]: "" }));
      fetchOrders();
    }
    setSendingShipping((prev) => ({ ...prev, [order.id]: false }));
  };

  // Produits
  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true });
    if (data) setProducts(data);
  };

  const updateStock = async (productId: number, newStock: number) => {
    if (newStock < 0) return;
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    if (!error) fetchProducts();
  };

  // Filtrage et recherche
  const filteredOrders = useMemo(() => {
    let result = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

    // Recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name?.toLowerCase().includes(term) ||
          o.customer_email?.toLowerCase().includes(term) ||
          o.tracking_number?.toLowerCase().includes(term)
      );
    }

    // Tri
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "total-asc":
        result.sort((a, b) => a.total - b.total);
        break;
      case "total-desc":
        result.sort((a, b) => b.total - a.total);
        break;
      case "name":
        result.sort((a, b) => (a.customer_name || "").localeCompare(b.customer_name || ""));
        break;
    }

    return result;
  }, [orders, activeTab, searchTerm, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "payée":
        return "bg-blue-50 text-blue-600";
      case "en préparation":
        return "bg-amber-50 text-amber-600";
      case "expédiée":
        return "bg-emerald-50 text-emerald-600";
      case "annulée":
        return "bg-red-50 text-red-500";
      default:
        return "bg-stone-100 text-stone-500";
    }
  };

  const orderTabs = [
    { key: "all", label: "Toutes" },
    { key: "payée", label: "Payées" },
    { key: "en préparation", label: "En préparation" },
    { key: "expédiée", label: "Expédiées" },
  ];

  const sortOptions = [
    { value: "recent", label: "Plus récent" },
    { value: "oldest", label: "Plus ancien" },
    { value: "total-desc", label: "Montant ↓" },
    { value: "total-asc", label: "Montant ↑" },
    { value: "name", label: "Nom" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-light tracking-wide">Administration</h1>
            <p className="text-stone-500 text-sm font-light mt-1">
              {activeSection === "orders"
                ? `${orders.length} commande${orders.length > 1 ? "s" : ""}`
                : `${products.length} produit${products.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => (activeSection === "orders" ? fetchOrders() : fetchProducts())}
            className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-4"
          >
            Rafraîchir
          </button>
        </div>

        {/* Navigation sections */}
        <div className="flex gap-6 mb-8 border-b border-stone-200">
          <button
            onClick={() => setActiveSection("orders")}
            className={`text-sm font-light tracking-wide pb-3 border-b-2 transition-colors ${
              activeSection === "orders" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Commandes
          </button>
          <button
            onClick={() => setActiveSection("products")}
            className={`text-sm font-light tracking-wide pb-3 border-b-2 transition-colors ${
              activeSection === "products" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Produits
          </button>
        </div>

        {/* SECTION COMMANDES */}
        {activeSection === "orders" && (
          <>
            {/* Barre de recherche + tri */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="Rechercher un client, email, n° de suivi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-stone-200 rounded-lg px-4 py-2 text-sm font-light focus:outline-none focus:border-stone-400 bg-white"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:border-stone-400 bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Onglets */}
            <div className="flex flex-wrap gap-2 mb-6">
              {orderTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-xs tracking-wider font-light px-4 py-2 rounded-full border transition-all ${
                    activeTab === tab.key
                      ? "bg-stone-800 text-white border-stone-800"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-stone-400 text-sm font-light">Chargement...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-stone-400 text-sm font-light">Aucune commande trouvée.</p>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="text-sm font-medium text-stone-800 hover:text-stone-600 transition-colors text-left"
                            >
                              {order.customer_name}
                            </button>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-light ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mb-1">{order.customer_email}</p>
                          <p className="text-sm font-light text-stone-800">{order.total.toFixed(2)} €</p>
                          {order.shipping_address && (
                            <p className="text-xs text-stone-400 mt-1">
                              {order.shipping_address.line1}, {order.shipping_address.postal_code} {order.shipping_address.city}
                            </p>
                          )}
                          {order.tracking_number && (
                            <p className="text-xs text-stone-500 mt-1">
                              Suivi : {order.tracking_number}
                              {order.carrier && <> — {carrierNames[order.carrier] || order.carrier}</>}
                            </p>
                          )}
                          <p className="text-[10px] text-stone-300 mt-1">
                            {new Date(order.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 min-w-[220px]">
                          {(order.status === "payée" || order.status === "en préparation") && (
                            <>
                              {order.status === "payée" && (
                                <button
                                  onClick={() => sendPreparationEmail(order)}
                                  disabled={sendingPreparation[order.id]}
                                  className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg font-light transition-colors disabled:opacity-50"
                                >
                                  {sendingPreparation[order.id] ? "..." : "Marquer en préparation"}
                                </button>
                              )}
                              <div className="flex gap-1">
                                <select
                                  value={trackingCarriers[order.id] || "laposte"}
                                  onChange={(e) =>
                                    setTrackingCarriers((prev) => ({ ...prev, [order.id]: e.target.value }))
                                  }
                                  className="border border-stone-200 rounded-lg px-2 py-2 text-xs font-light focus:outline-none focus:border-stone-400 bg-white"
                                >
                                  {Object.entries(carrierNames).map(([key, name]) => (
                                    <option key={key} value={key}>{name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="N° de suivi"
                                  value={trackingInputs[order.id] || ""}
                                  onChange={(e) =>
                                    setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                                  }
                                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-xs font-light focus:outline-none focus:border-stone-400"
                                />
                                <button
                                  onClick={() => sendShippingEmail(order)}
                                  disabled={sendingShipping[order.id]}
                                  className="text-xs bg-stone-800 hover:bg-stone-700 text-white px-3 py-2 rounded-lg font-light transition-colors disabled:opacity-50"
                                >
                                  {sendingShipping[order.id] ? "..." : "Expédier"}
                                </button>
                              </div>
                            </>
                          )}
                          {order.status === "expédiée" && (
                            <p className="text-xs text-stone-400 font-light text-center py-2">Colis en route</p>
                          )}
                        </div>
                      </div>

                      {/* Détail commande */}
                      {expandedOrder === order.id && order.items && (
                        <div className="mt-4 pt-4 border-t border-stone-100">
                          <p className="text-xs text-stone-400 font-light mb-3">Produits commandés</p>
                          <div className="space-y-2">
                            {(Array.isArray(order.items) ? order.items : []).map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-stone-700 font-light">{item.description}</span>
                                <span className="text-stone-400 font-light">
                                  x{item.quantity} — {(item.amount_total / 100).toFixed(2)} €
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats commandes */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total", value: orders.length, color: "text-stone-800" },
                { label: "À traiter", value: orders.filter((o) => o.status === "payée" || o.status === "en préparation").length, color: "text-amber-600" },
                { label: "Expédiées", value: orders.filter((o) => o.status === "expédiée").length, color: "text-emerald-600" },
                { label: "CA total", value: `${orders.reduce((acc, o) => acc + o.total, 0).toFixed(0)} €`, color: "text-stone-800" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-stone-100 text-center">
                  <p className={`text-2xl font-light ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-stone-400 font-light">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SECTION PRODUITS */}
        {activeSection === "products" && (
          <div className="space-y-4">
            {/* Stats stock */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total produits", value: products.length },
                { label: "Stock faible (≤3)", value: products.filter((p) => p.stock > 0 && p.stock <= 3).length },
                { label: "Rupture", value: products.filter((p) => p.stock === 0).length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-stone-100 text-center">
                  <p className="text-2xl font-light text-stone-800">{stat.value}</p>
                  <p className="text-xs text-stone-400 font-light">{stat.label}</p>
                </div>
              ))}
            </div>

            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-stone-100 p-4 md:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-light text-stone-800">{product.name}</p>
                      <p className="text-xs text-stone-400">
                        {product.category} — {product.price} €
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-light px-2 py-0.5 rounded-full ${
                        product.stock === 0
                          ? "bg-red-50 text-red-500"
                          : product.stock <= 3
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {product.stock === 0 ? "Rupture" : product.stock <= 3 ? `Plus que ${product.stock}` : `${product.stock} en stock`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateStock(product.id, product.stock - 1)}
                        disabled={product.stock <= 0}
                        className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-light text-stone-800">{product.stock}</span>
                      <button
                        onClick={() => updateStock(product.id, product.stock + 1)}
                        className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClient;