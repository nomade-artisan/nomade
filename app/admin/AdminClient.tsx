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
  const [showMobileDetail, setShowMobileDetail] = useState(false);
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
    // Mémoriser la dernière commande vue
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

  // 1. Rembourser via Stripe
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

  // 2. Remettre le stock
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

  // 3. Mettre à jour la commande
  await supabase.from("orders").update({ status: "annulée" }).eq("id", selectedOrder.id);
  await fetchOrders();
  setSelectedOrder((prev) => prev ? { ...prev, status: "annulée" } : null);
  setSending(false);
};

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber("");
    setShowMobileDetail(true);
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

  // CA filtré
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

  // ==================== RENDER ====================
  return (
    <div className="h-screen bg-stone-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-100 px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base md:text-lg font-light tracking-wide">Nomade</h1>
          <div className="flex gap-1">
            {[
              { key: "orders", label: "Commandes" },
              { key: "products", label: "Produits" },
            ].map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key as any)}
                className={`text-[11px] px-3 py-1.5 rounded-full font-light transition-colors ${activeSection === s.key ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => (activeSection === "orders" ? fetchOrders() : fetchProducts())}
            className="text-[11px] text-stone-500 hover:text-stone-800 underline underline-offset-4">
            Rafraîchir
          </button>
        </div>
      </div>

      {/* ==================== SECTION COMMANDES ==================== */}
      {activeSection === "orders" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Colonne gauche : liste */}
          <div className={`${showMobileDetail ? "hidden" : "flex"} md:flex flex-col w-full md:w-1/2 lg:w-2/5 xl:w-1/3 border-r border-stone-200 bg-white overflow-hidden flex-shrink-0`}>
            {/* Filtres */}
            <div className="p-3 border-b border-stone-100 space-y-2 flex-shrink-0">
              <input type="text" placeholder="Rechercher client, email, suivi..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setOrderPage(1); }}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs font-light focus:outline-none focus:border-stone-400" />
              <div className="flex gap-1.5 flex-wrap items-center">
                {orderTabs.map((tab) => (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); setOrderPage(1); }}
                    className={`text-[10px] px-2.5 py-1.5 rounded-full border font-light whitespace-nowrap ${activeTab === tab.key ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"}`}>
                    {newOrdersCount > 0 && tab.key === "payée" ? `● ${tab.label}` : tab.label}
                  </button>
                ))}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="text-[10px] border border-stone-200 rounded-full px-2.5 py-1.5 font-light bg-white ml-auto">
                  {sortOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              {/* Stats rapides */}
              <div className="flex gap-3 text-[10px] text-stone-400">
                <span>CA filtré : <strong className="text-stone-700">{filteredCA.toFixed(0)} €</strong></span>
                <span>Ce mois : <strong className="text-stone-700">{currentMonthCA.toFixed(0)} €</strong></span>
                <span>Total : <strong className="text-stone-700">{globalCA.toFixed(0)} €</strong></span>
              </div>
              {/* Bouton export */}
              <button onClick={exportCSV}
                className="text-[10px] text-stone-500 hover:text-stone-800 underline underline-offset-2">
                Exporter CSV
              </button>
            </div>

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" /></div>
              ) : paginatedOrders.length === 0 ? (
                <p className="text-stone-400 text-xs text-center py-16">Aucune commande.</p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {paginatedOrders.map((order) => (
                    <button key={order.id}
                      onClick={() => selectOrder(order)}
                      className={`w-full text-left p-3 hover:bg-stone-50 transition-colors ${selectedOrder?.id === order.id ? "bg-stone-100 border-l-2 border-stone-800" : ""} ${order.id > (lastViewedOrderId || 0) && order.status === "payée" ? "bg-blue-50/30" : ""}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-stone-800 truncate">{order.customer_name}</p>
                            {order.id > (lastViewedOrderId || 0) && order.status === "payée" && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400">{order.total.toFixed(2)} €</p>
                          <p className="text-[10px] text-stone-300">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-light flex-shrink-0 ${statusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalOrderPages > 1 && (
              <div className="p-2 border-t border-stone-100 flex justify-center items-center gap-3 bg-white flex-shrink-0">
                <button onClick={() => setOrderPage(Math.max(1, orderPage - 1))} disabled={orderPage <= 1}
                  className="text-[10px] text-stone-400 hover:text-stone-800 disabled:opacity-30">←</button>
                <span className="text-[10px] text-stone-400">{orderPage} / {totalOrderPages}</span>
                <button onClick={() => setOrderPage(Math.min(totalOrderPages, orderPage + 1))} disabled={orderPage >= totalOrderPages}
                  className="text-[10px] text-stone-400 hover:text-stone-800 disabled:opacity-30">→</button>
              </div>
            )}
          </div>

          {/* Colonne droite : détail */}
          <div className={`${showMobileDetail ? "flex" : "hidden"} md:flex flex-col flex-1 bg-white overflow-hidden`}>
            {selectedOrder ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {/* Bouton retour mobile */}
                <button onClick={() => setShowMobileDetail(false)}
                  className="md:hidden text-xs text-stone-500 mb-4 flex items-center gap-1">← Retour</button>

                <div className="max-w-lg space-y-6">
                  {/* Client */}
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Client</p>
                    <p className="text-xl font-light">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-stone-500">{selectedOrder.customer_email}</p>
                    {selectedOrder.shipping_address && (
                      <p className="text-sm text-stone-500 mt-1">
                        {selectedOrder.shipping_address.line1}<br />
                        {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                      </p>
                    )}
                  </div>

                  {/* Produits */}
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Produits commandés</p>
                    <div className="space-y-1.5">
                      {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-1 border-b border-stone-50">
                          <span className="text-stone-700 font-light">{item.description}</span>
                          <span className="text-stone-400 text-xs">x{item.quantity} — {(item.amount_total / 100).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-lg font-light text-right mt-3">{selectedOrder.total.toFixed(2)} €</p>
                  </div>

                  {/* Tracking */}
                  {selectedOrder.tracking_number && (
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Suivi</p>
                      <p className="text-sm text-stone-700">{selectedOrder.tracking_number}</p>
                      {selectedOrder.carrier && <p className="text-xs text-stone-400">{carrierNames[selectedOrder.carrier] || selectedOrder.carrier}</p>}
                    </div>
                  )}

                  {/* Actions */}
                  {(selectedOrder.status === "payée" || selectedOrder.status === "en préparation") && (
                    <div className="space-y-3 pt-4 border-t border-stone-100">
                      {selectedOrder.status === "payée" && (
                        <button onClick={markAsPreparing} disabled={sending}
                          className="w-full text-sm bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl font-light transition-colors disabled:opacity-50">
                          {sending ? "..." : "Marquer en préparation"}
                        </button>
                      )}
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Expédier la commande</p>
                        <div className="flex gap-2">
                          <select value={trackingCarrier} onChange={(e) => setTrackingCarrier(e.target.value)}
                            className="text-xs border border-stone-200 rounded-lg px-3 py-2 font-light bg-white">
                            {Object.entries(carrierNames).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                          </select>
                          <input type="text" placeholder="N° de suivi" value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="flex-1 text-xs border border-stone-200 rounded-lg px-3 py-2 font-light focus:outline-none focus:border-stone-400" />
                          <button onClick={markAsShipped} disabled={sending}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-light transition-colors disabled:opacity-50">
                            {sending ? "..." : "Expédier"}
                          </button>
                        </div>
                      </div>

                      {/* Annuler */}
                      <button onClick={cancelOrder} disabled={sending}
                        className="w-full text-xs text-red-400 hover:text-red-600 font-light transition-colors disabled:opacity-50 pt-2">
                        Annuler cette commande
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === "expédiée" && (
                    <div className="pt-4 border-t border-stone-100">
                      <p className="text-emerald-600 text-sm font-light">✓ Commande expédiée</p>
                    </div>
                  )}

                  {selectedOrder.status === "annulée" && (
                    <div className="pt-4 border-t border-stone-100">
                      <p className="text-red-400 text-sm font-light">Commande annulée</p>
                    </div>
                  )}

                  <p className="text-[10px] text-stone-300 pt-4">
                    Commande #{selectedOrder.id} — {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-sm font-light">
                Sélectionnez une commande à gauche
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SECTION PRODUITS ==================== */}
      {activeSection === "products" && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-[11px] flex-wrap">
                <span className="bg-white px-3 py-1 rounded-full border">{products.length} produits</span>
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full">{products.filter((p) => p.stock > 0 && p.stock <= 3).length} faible</span>
                <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full">{products.filter((p) => p.stock === 0).length} rupture</span>
              </div>
              <button onClick={() => setShowModal(true)}
                className="text-[11px] bg-stone-800 text-white px-4 py-2 rounded-full font-light hover:bg-stone-700">+ Nouveau</button>
            </div>

            {paginatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-stone-100 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-light text-stone-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-400">{p.category} — {p.price} €</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${stockBadge(p.stock)}`}>{p.stock}</span>
                  <button onClick={() => updateStock(p.id, p.stock - 1)} disabled={p.stock <= 0}
                    className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 disabled:opacity-30 text-xs">−</button>
                  <button onClick={() => updateStock(p.id, p.stock + 1)}
                    className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 text-xs">+</button>
                </div>
              </div>
            ))}

            {totalProductPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button onClick={() => setProductPage(Math.max(1, productPage - 1))} disabled={productPage <= 1}
                  className="text-xs text-stone-400 hover:text-stone-800 disabled:opacity-30">←</button>
                <span className="text-xs text-stone-400">{productPage} / {totalProductPages}</span>
                <button onClick={() => setProductPage(Math.min(totalProductPages, productPage + 1))} disabled={productPage >= totalProductPages}
                  className="text-xs text-stone-400 hover:text-stone-800 disabled:opacity-30">→</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL PRODUIT ==================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-light tracking-wide">Nouveau produit</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-800 text-lg">✕</button>
            </div>
            {formError && <p className="text-red-500 text-xs bg-red-50 rounded-lg p-3 mb-4">{formError}</p>}
            <div className="space-y-3">
              <input type="text" placeholder="Nom du sac *" value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-light focus:outline-none focus:border-stone-400" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Prix (€) *" value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-light focus:outline-none focus:border-stone-400" />
                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-light bg-white">
                  <option>Cuir</option><option>Minimal</option><option>Bandoulière</option><option>Aventure</option>
                </select>
              </div>
              <input type="number" placeholder="Stock initial" value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-light focus:outline-none focus:border-stone-400" />
              <textarea placeholder="Description *" rows={2} value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-light focus:outline-none focus:border-stone-400 resize-none" />
              <textarea placeholder="Détails (un par ligne) *" rows={2} value={newProduct.details}
                onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm font-light focus:outline-none focus:border-stone-400 resize-none" />
              <label className="block border-2 border-dashed border-stone-200 rounded-xl p-4 text-center cursor-pointer hover:border-stone-400 transition-colors">
                {newProduct.imagePreview ? (
                  <img src={newProduct.imagePreview} alt="" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <div className="text-stone-400"><p className="text-lg mb-1">+</p><p className="text-[10px] font-light">Ajouter une image</p></div>
                )}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setNewProduct((prev) => ({ ...prev, image: f, imagePreview: URL.createObjectURL(f) })); }} />
              </label>
              <button onClick={handleCreateProduct} disabled={formLoading}
                className="w-full py-3 bg-stone-900 text-white rounded-full text-sm tracking-wider font-light hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2">
                {formLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Création...</> : "Créer le produit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminClient;