// app/admin/AdminClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/db";

// ==================== TYPES ====================
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
  description: string;
  details: string[];
  category: string;
  is_new: boolean;
  rating: number;
  reviews: number;
}

// ==================== CONSTANTES ====================
const carrierNames: Record<string, string> = { mondialrelay: "Mondial Relay", colissimo: "Colissimo" };
const trackingUrls: Record<string, string> = {
  mondialrelay: "https://www.mondialrelay.com/suivi-de-colis/?numExpedition=",
  colissimo: "https://www.laposte.fr/outils/suivre-vos-envois?code=",
};
const PAGE_SIZE = 15;

// ==================== COMPOSANT ====================
function AdminClient() {
  // États généraux
  const [activeSection, setActiveSection] = useState<"orders" | "products">("orders");
  const [loading, setLoading] = useState(true);

  // Commandes
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("payée");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [orderPage, setOrderPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("mondialrelay");
  const [lastViewedOrderId, setLastViewedOrderId] = useState<number | null>(null);

  // Produits
  const [products, setProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", category: "Cuir", stock: "0",
    description: "", details: "", image: null as File | null, imagePreview: "",
  });

  useEffect(() => { fetchOrders(); fetchProducts(); }, []);
  useEffect(() => {
    const stored = localStorage.getItem("nomade_last_order_id");
    if (stored) setLastViewedOrderId(parseInt(stored));
  }, []);

  // ==================== COMMANDES ====================
  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const markAsPreparing = async () => {
    if (!selectedOrder) return;
    setSending(true);
    await fetch("/api/send-preparation-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: selectedOrder.id }) });
    await supabase.from("orders").update({ status: "en préparation" }).eq("id", selectedOrder.id);
    await fetchOrders();
    setSelectedOrder((prev) => prev ? { ...prev, status: "en préparation" } : null);
    setSending(false);
  };

  const markAsShipped = async () => {
    if (!selectedOrder) return;
    if (!trackingNumber.trim()) return alert("Entre un numéro de suivi");
    const url = trackingUrls[trackingCarrier] + trackingNumber;
    setSending(true);
    await fetch("/api/send-shipping-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: selectedOrder.id, trackingNumber, trackingUrl: url, carrier: trackingCarrier }) });
    await supabase.from("orders").update({ status: "expédiée", tracking_number: trackingNumber, carrier: trackingCarrier }).eq("id", selectedOrder.id);
    setTrackingNumber("");
    await fetchOrders();
    setSelectedOrder((prev) => prev ? { ...prev, status: "expédiée", tracking_number: trackingNumber, carrier: trackingCarrier } : null);
    setSending(false);
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm("Annuler cette commande ? Le client sera remboursé et le stock remis en ligne.")) return;

    setSending(true);

    // Rembourser via Stripe
    try {
      await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });
    } catch (err) {
      alert("Erreur lors du remboursement Stripe. Vérifiez manuellement.");
      setSending(false);
      return;
    }

    // Remettre le stock
    const productIds = selectedOrder.items
      ?.map((item: any) => item.price?.metadata?.product_id)
      .filter(Boolean) || [];

    const quantities = selectedOrder.items
      ?.map((item: any) => item.quantity)
      .filter(Boolean) || [];

    for (let i = 0; i < productIds.length; i++) {
      const { data: product } = await supabase.from("products").select("stock").eq("id", productIds[i]).single();
      if (product) {
        await supabase.from("products").update({ stock: product.stock + (quantities[i] || 1) }).eq("id", productIds[i]);
      }
    }

    await supabase.from("orders").update({ status: "annulée" }).eq("id", selectedOrder.id);
    await fetchOrders();
    setSelectedOrder((prev) => prev ? { ...prev, status: "annulée" } : null);
    setSending(false);
  };

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber("");
    localStorage.setItem("nomade_last_order_id", order.id.toString());
    setLastViewedOrderId(order.id);
  };

  const exportCSV = () => {
    const headers = "ID,Client,Email,Total,Statut,Date,Ville,CP,Suivi,Transporteur\n";
    const rows = filteredOrders.map((o) =>
      `${o.id},"${o.customer_name || ""}","${o.customer_email || ""}",${o.total},${o.status},"${new Date(o.created_at).toLocaleDateString("fr-FR")}","${o.shipping_address?.city || ""}","${o.shipping_address?.postal_code || ""}","${o.tracking_number || ""}","${o.carrier || ""}"`
    ).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-nomade-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = useMemo(() => {
    let result = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      result = result.filter((o) => o.customer_name?.toLowerCase().includes(t) || o.customer_email?.toLowerCase().includes(t) || o.tracking_number?.toLowerCase().includes(t));
    }
    switch (sortBy) {
      case "recent": result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case "total-asc": result.sort((a, b) => a.total - b.total); break;
      case "total-desc": result.sort((a, b) => b.total - a.total); break;
      case "name": result.sort((a, b) => (a.customer_name || "").localeCompare(b.customer_name || "")); break;
    }
    return result;
  }, [orders, activeTab, searchTerm, sortBy]);

  const paginatedOrders = filteredOrders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);
  const totalOrderPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pendingCount = orders.filter((o) => o.status === "payée").length;
  const preparingCount = orders.filter((o) => o.status === "en préparation").length;
  const newOrdersCount = lastViewedOrderId
    ? orders.filter((o) => o.id > lastViewedOrderId && o.status === "payée").length
    : 0;

  const globalCA = orders.reduce((acc, o) => acc + o.total, 0);
  const filteredCA = filteredOrders.reduce((acc, o) => acc + o.total, 0);
  const currentMonthCA = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, o) => acc + o.total, 0);

  // ==================== PRODUITS ====================
  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("category", { ascending: true });
    if (data) setProducts(data);
  };

  const updateStock = async (productId: number, newStock: number) => {
    if (newStock < 0) return;
    await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    fetchProducts();
  };

  const handleCreateProduct = async () => {
    setFormError("");
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.details || !newProduct.image) {
      return setFormError("Tous les champs * sont obligatoires");
    }
    setFormLoading(true);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${newProduct.image.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("products").upload(fileName, newProduct.image);
    if (upErr) { setFormError("Erreur upload"); setFormLoading(false); return; }
    const { data: url } = supabase.storage.from("products").getPublicUrl(fileName);
    const det = newProduct.details.split("\n").filter((d) => d.trim());
    const { error } = await supabase.from("products").insert([{
      name: newProduct.name, price: parseFloat(newProduct.price), category: newProduct.category,
      stock: parseInt(newProduct.stock) || 0, images: [url.publicUrl],
      description: newProduct.description, details: det, colors: [], color_names: [],
      rating: 0, reviews: 0, is_new: true, related_products: [],
    }]);
    if (error) { setFormError(error.message); setFormLoading(false); return; }
    setNewProduct({ name: "", price: "", category: "Cuir", stock: "0", description: "", details: "", image: null, imagePreview: "" });
    setFormLoading(false); setShowModal(false); fetchProducts();
  };

  const paginatedProducts = products.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const totalProductPages = Math.ceil(products.length / PAGE_SIZE);

  // ==================== HELPERS ====================
  const orderTabs = [
    { key: "payée", label: `À préparer (${pendingCount})` },
    { key: "en préparation", label: `En cours (${preparingCount})` },
    { key: "expédiée", label: "Expédiées" },
    { key: "annulée", label: "Annulées" },
    { key: "all", label: "Toutes" },
  ];

  const sortOptions = [
    { value: "recent", label: "Plus récent" },
    { value: "oldest", label: "Plus ancien" },
    { value: "total-desc", label: "Montant ↓" },
    { value: "total-asc", label: "Montant ↑" },
    { value: "name", label: "Nom" },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "payée": return "bg-blue-50 text-blue-600";
      case "en préparation": return "bg-amber-50 text-amber-600";
      case "expédiée": return "bg-emerald-50 text-emerald-600";
      case "annulée": return "bg-red-50 text-red-500";
      default: return "bg-stone-100 text-stone-500";
    }
  };

  const stockBadge = (stock: number) => {
    if (stock === 0) return "bg-red-50 text-red-500";
    if (stock <= 3) return "bg-amber-50 text-amber-600";
    return "bg-emerald-50 text-emerald-600";
  };

  // ==================== RENDU ====================
  return (
    <div className="h-[calc(100vh-64px)] mt-[64px] bg-[#f5f1eb] flex overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-[250px] bg-white border-r border-black/[0.04] flex-col flex-shrink-0">
        <div className="h-[82px] px-8 flex items-center border-b border-black/[0.04]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.42em] text-stone-800 font-light mb-1">Nomade</p>
            <p className="text-xs text-stone-400 font-light">Atelier digital</p>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[
            { key: "orders", label: "Commandes", count: filteredOrders.length },
            { key: "products", label: "Produits", count: products.length },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key as any)}
              className={`w-full h-[54px] rounded-[20px] px-5 flex items-center justify-between transition-all duration-300 ${
                activeSection === item.key ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              <span className="text-[11px] uppercase tracking-[0.18em] font-light">{item.label}</span>
              <span className={`text-xs ${activeSection === item.key ? "text-white/60" : "text-stone-400"}`}>{item.count}</span>
            </button>
          ))}
        </div>
        <div className="p-5 border-t border-black/[0.04]">
          <div className="bg-stone-100 rounded-[22px] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-3">Ce mois</p>
            <p className="text-3xl font-light tracking-tight text-stone-900">{currentMonthCA.toFixed(0)}€</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOPBAR */}
        <div className="h-[82px] px-6 md:px-10 flex items-center justify-between border-b border-black/[0.04] bg-[#f5f1eb]/80 backdrop-blur-md flex-shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-stone-900">
              {activeSection === "orders" ? "Commandes" : "Produits"}
            </h1>
            <p className="text-sm text-stone-400 font-light mt-1">
              {activeSection === "orders" ? `${filteredOrders.length} commandes` : `${products.length} produits`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => activeSection === "orders" ? fetchOrders() : fetchProducts()}
              className="h-11 px-5 rounded-full bg-white border border-black/[0.04] text-[11px] uppercase tracking-[0.18em] text-stone-500 hover:text-stone-900 transition-colors"
            >
              Rafraîchir
            </button>
            {activeSection === "orders" && (
              <button onClick={exportCSV} className="h-11 px-5 rounded-full bg-stone-900 text-white text-[11px] uppercase tracking-[0.18em] hover:bg-stone-800 transition-colors">
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* ================= ORDERS VIEW ================= */}
        {activeSection === "orders" && (
          <div className="flex-1 min-h-0 grid lg:grid-cols-[360px_1fr]">
            {/* LEFT LIST */}
            <div className="bg-white border-r border-black/[0.04] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-black/[0.04] flex-shrink-0">
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 rounded-full bg-stone-100/70 px-5 text-sm font-light placeholder:text-stone-400 focus:outline-none"
                />
                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
                  {orderTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-shrink-0 h-9 px-4 rounded-full text-[10px] uppercase tracking-[0.14em] transition-all duration-300 ${
                        activeTab === tab.key ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {paginatedOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => selectOrder(order)}
                    className={`w-full text-left rounded-[24px] p-5 transition-all duration-300 ${
                      selectedOrder?.id === order.id ? "bg-stone-100" : "bg-white hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-light text-stone-900 truncate mb-1">{order.customer_name}</h3>
                        <p className="text-sm text-stone-400 truncate">{order.customer_email}</p>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap font-light ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-light tracking-tight text-stone-900">{order.total.toFixed(0)}€</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-300">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* DETAIL */}
            <div className="overflow-y-auto bg-[#f7f3ed]">
              {selectedOrder ? (
                <div className="w-full max-w-[1400px] px-6 md:px-10 py-10">
                  {/* HEADER */}
                  <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 mb-5">Commande</p>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                      <div>
                        <h2 className="text-5xl font-light tracking-tight text-stone-900 mb-3">#{selectedOrder.id}</h2>
                        <p className="text-stone-500 font-light">{selectedOrder.customer_name}</p>
                      </div>
                      <div className={`inline-flex px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.14em] w-fit ${statusBadge(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </div>
                    </div>
                  </div>

                  {/* INFOS */}
                  <div className="grid xl:grid-cols-3 gap-4 mb-12">
                    <div className="bg-white rounded-[26px] p-6">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-5">Client</p>
                      <p className="text-stone-900 font-light mb-2">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-stone-400 break-all">{selectedOrder.customer_email}</p>
                    </div>
                    <div className="bg-white rounded-[26px] p-6">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-5">Total</p>
                      <p className="text-4xl font-light tracking-tight text-stone-900">{selectedOrder.total.toFixed(2)}€</p>
                    </div>
                    <div className="bg-white rounded-[26px] p-6">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-5">Date</p>
                      <p className="text-stone-900 font-light">
                        {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 mb-6">Produits</p>
                    <div className="space-y-3">
                      {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                        <div key={i} className="bg-white rounded-[26px] p-5 flex items-center justify-between gap-5">
                          <div className="flex items-center gap-5 min-w-0">
                            <div className="w-16 h-16 rounded-[18px] bg-stone-100 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[15px] font-light text-stone-900 truncate mb-1">{item.description}</p>
                              <p className="text-sm text-stone-400">Quantité : {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-lg font-light text-stone-900 whitespace-nowrap">{(item.amount_total / 100).toFixed(2)}€</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  {(selectedOrder.status === "payée" || selectedOrder.status === "en préparation") && (
                    <div className="space-y-4">
                      {selectedOrder.status === "payée" && (
                        <button
                          onClick={markAsPreparing}
                          disabled={sending}
                          className="w-full h-12 rounded-full bg-stone-900 text-white text-xs uppercase tracking-[0.2em] font-light hover:bg-stone-800 disabled:opacity-50"
                        >
                          {sending ? "..." : "Marquer en préparation"}
                        </button>
                      )}
                      <div className="flex gap-3">
                        <select
                          value={trackingCarrier}
                          onChange={(e) => setTrackingCarrier(e.target.value)}
                          className="h-12 px-4 rounded-full bg-white border border-black/[0.04] text-xs uppercase tracking-wider"
                        >
                          {Object.entries(carrierNames).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="N° de suivi"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="flex-1 h-12 px-5 rounded-full bg-white border border-black/[0.04] text-sm font-light"
                        />
                        <button
                          onClick={markAsShipped}
                          disabled={sending}
                          className="h-12 px-8 rounded-full bg-emerald-600 text-white text-xs uppercase tracking-[0.2em] font-light hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {sending ? "..." : "Expédier"}
                        </button>
                      </div>
                      <button
                        onClick={cancelOrder}
                        disabled={sending}
                        className="w-full text-xs text-red-400 hover:text-red-600 font-light pt-2"
                      >
                        Annuler cette commande
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl text-stone-200 mb-5">·</p>
                    <p className="text-stone-400 font-light">Sélectionnez une commande</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PRODUCTS VIEW ================= */}
        {activeSection === "products" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light">Produits</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="h-11 px-6 rounded-full bg-stone-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-stone-800"
                >
                  + Nouveau
                </button>
              </div>

              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden">
                      {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-light">{product.name}</p>
                      <p className="text-sm text-stone-400">{product.category} — {product.price}€</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stockBadge(product.stock)}`}>
                      {product.stock === 0 ? "Rupture" : product.stock}
                    </span>
                    <button onClick={() => updateStock(product.id, product.stock - 1)} disabled={product.stock <= 0} className="w-7 h-7 rounded-full border text-xs">−</button>
                    <button onClick={() => updateStock(product.id, product.stock + 1)} className="w-7 h-7 rounded-full border text-xs">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal nouveau produit */}
            {/* Modal nouveau produit */}
{showModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
    onClick={() => setShowModal(false)} // ferme si on clique à l'extérieur
  >
    <div
      className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4"
      onClick={(e) => e.stopPropagation()} // empêche la fermeture quand on clique dans le modal
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light">Nouveau produit</h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-stone-400 hover:text-stone-800 text-lg"
        >
          ✕
        </button>
      </div>

      {formError && <p className="text-red-500 text-sm">{formError}</p>}

      <input
        type="text"
        placeholder="Nom *"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        className="w-full border rounded-xl px-4 py-3 text-sm"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Prix *"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="border rounded-xl px-4 py-3 text-sm"
        />
        <select
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          className="border rounded-xl px-4 py-3 text-sm bg-white"
        >
          <option>Cuir</option>
          <option>Minimal</option>
          <option>Bandoulière</option>
          <option>Aventure</option>
        </select>
      </div>

      <input
        type="number"
        placeholder="Stock"
        value={newProduct.stock}
        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
        className="w-full border rounded-xl px-4 py-3 text-sm"
      />

      <textarea
        placeholder="Description *"
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        className="w-full border rounded-xl px-4 py-3 text-sm resize-none"
        rows={2}
      />

      <textarea
        placeholder="Détails (un par ligne) *"
        value={newProduct.details}
        onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
        className="w-full border rounded-xl px-4 py-3 text-sm resize-none"
        rows={2}
      />

      <label className="block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer">
        {newProduct.imagePreview ? (
          <img src={newProduct.imagePreview} className="h-32 object-cover rounded-lg" />
                ) : (
                  "+ Image"
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setNewProduct({ ...newProduct, image: f, imagePreview: URL.createObjectURL(f) });
                  }}
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-full border border-stone-200 text-stone-600 text-sm font-light hover:bg-stone-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateProduct}
                  disabled={formLoading}
                  className="flex-1 py-3 bg-stone-900 text-white rounded-full text-sm font-light hover:bg-stone-800 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? "Création..." : "Créer le produit"}
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClient;