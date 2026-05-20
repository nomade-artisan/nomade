// app/admin/OrdersView.tsx
"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/db";
import { Order, carrierNames, trackingUrls, statusBadge } from "./AdminClient";
import { Search, Send, Ban, FileDown } from "lucide-react";

interface Props {
  orders: Order[];
  fetchOrders: () => void;
}

const PAGE_SIZE = 12;

export default function OrdersView({ orders, fetchOrders }: Props) {
  const [activeTab, setActiveTab] = useState("payée");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [orderPage, setOrderPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("mondialrelay");

  const pendingCount = orders.filter((o) => o.status === "payée").length;
  const preparingCount = orders.filter((o) => o.status === "en préparation").length;

  const markAsPreparing = async () => {
    if (!selectedOrder) return;
    setSending(true);
    await fetch("/api/send-preparation-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id }),
    });
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
    await fetch("/api/send-shipping-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id, trackingNumber, trackingUrl: url, carrier: trackingCarrier }),
    });
    await supabase.from("orders").update({
      status: "expédiée", tracking_number: trackingNumber, carrier: trackingCarrier,
    }).eq("id", selectedOrder.id);
    setTrackingNumber("");
    await fetchOrders();
    setSelectedOrder((prev) => prev ? { ...prev, status: "expédiée", tracking_number: trackingNumber, carrier: trackingCarrier } : null);
    setSending(false);
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm("Annuler cette commande ? Le client sera remboursé et le stock remis.")) return;
    setSending(true);
    try {
      await fetch("/api/refund", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });
    } catch (err) {
      alert("Erreur lors du remboursement.");
      setSending(false);
      return;
    }
    const productIds = selectedOrder.items?.map((item: any) => item.price?.metadata?.product_id).filter(Boolean) || [];
    const quantities = selectedOrder.items?.map((item: any) => item.quantity).filter(Boolean) || [];
    for (let i = 0; i < productIds.length; i++) {
      const { data: product } = await supabase.from("products").select("stock").eq("id", productIds[i]).single();
      if (product) await supabase.from("products").update({ stock: product.stock + (quantities[i] || 1) }).eq("id", productIds[i]);
    }
    await supabase.from("orders").update({ status: "annulée" }).eq("id", selectedOrder.id);
    await fetchOrders();
    setSelectedOrder((prev) => prev ? { ...prev, status: "annulée" } : null);
    setSending(false);
  };

  const exportCSV = () => {
    const filtered = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
    const headers = "ID,Client,Email,Total,Statut,Date,Ville,Suivi,Transporteur\n";
    const rows = filtered.map((o) =>
      `${o.id},"${o.customer_name || ""}","${o.customer_email || ""}",${o.total},${o.status},"${new Date(o.created_at).toLocaleDateString("fr-FR")}","${o.shipping_address?.city || ""}","${o.tracking_number || ""}","${o.carrier || ""}"`
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
      result = result.filter((o) =>
        o.customer_name?.toLowerCase().includes(t) ||
        o.customer_email?.toLowerCase().includes(t) ||
        o.tracking_number?.toLowerCase().includes(t)
      );
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

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      {/* Liste */}
      <div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text" placeholder="Rechercher..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 md:h-12 rounded-full bg-white pl-12 pr-4 text-sm border outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-10 md:h-12 px-3 md:px-4 rounded-full bg-white border text-xs">
              {sortOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <button onClick={exportCSV}
              className="h-10 md:h-12 px-3 md:px-4 rounded-full bg-white border text-xs flex items-center gap-1">
              <FileDown size={14} /> Export
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {orderTabs.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setOrderPage(1); }}
              className={`h-9 px-3 md:px-4 rounded-full text-[10px] uppercase whitespace-nowrap ${
                activeTab === tab.key ? "bg-stone-900 text-white" : "bg-white text-stone-500 border"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 md:space-y-3">
          {paginatedOrders.map((order) => (
            <button key={order.id} onClick={() => setSelectedOrder(order)}
              className={`w-full bg-white rounded-2xl p-3 md:p-4 text-left shadow-sm ${
                selectedOrder?.id === order.id ? "ring-2 ring-stone-900" : ""
              }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm md:text-base font-medium text-stone-900">{order.customer_name}</p>
                  <p className="text-[11px] md:text-xs text-stone-400">{order.customer_email}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full ${statusBadge(order.status)}`}>{order.status}</span>
              </div>
              <div className="flex justify-between items-end mt-2 md:mt-3">
                <p className="text-base md:text-lg font-light">{order.total.toFixed(2)}€</p>
                <p className="text-[10px] md:text-xs text-stone-400">
                  {new Date(order.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </button>
          ))}
        </div>

        {totalOrderPages > 1 && (
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => setOrderPage(Math.max(1, orderPage - 1))} disabled={orderPage <= 1}
              className="text-xs text-stone-400 hover:text-stone-800 disabled:opacity-30">←</button>
            <span className="text-xs text-stone-400">{orderPage} / {totalOrderPages}</span>
            <button onClick={() => setOrderPage(Math.min(totalOrderPages, orderPage + 1))} disabled={orderPage >= totalOrderPages}
              className="text-xs text-stone-400 hover:text-stone-800 disabled:opacity-30">→</button>
          </div>
        )}
      </div>

      {/* Détail */}
      <div>
        {selectedOrder ? (
          <div className="bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light">Commande #{selectedOrder.id}</h3>
              <span className={`text-[10px] px-3 py-1 rounded-full ${statusBadge(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p className="font-medium">{selectedOrder.customer_name}</p>
              <p className="text-stone-500">{selectedOrder.customer_email}</p>
              {selectedOrder.shipping_address && (
                <p className="text-stone-400 text-xs">
                  {selectedOrder.shipping_address.line1}, {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                </p>
              )}
              <p className="text-xl font-light pt-2">{selectedOrder.total.toFixed(2)}€</p>
            </div>

            <div className="border-t pt-4 mb-4">
              <p className="text-xs text-stone-400 mb-2">Produits</p>
              {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-stone-700">{item.description}</span>
                  <span className="text-stone-400">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {(selectedOrder.status === "payée" || selectedOrder.status === "en préparation") && (
              <div className="space-y-3 border-t pt-4">
                {selectedOrder.status === "payée" && (
                  <button onClick={markAsPreparing} disabled={sending}
                    className="w-full h-10 rounded-full bg-stone-900 text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <Send size={12} /> Marquer en préparation
                  </button>
                )}
                <select value={trackingCarrier} onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full h-10 rounded-full bg-white border px-4 text-xs">
                  {Object.entries(carrierNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                <input type="text" placeholder="N° de suivi" value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full h-10 rounded-full bg-white border px-4 text-sm" />
                <button onClick={markAsShipped} disabled={sending}
                  className="w-full h-10 rounded-full bg-emerald-600 text-white text-xs uppercase tracking-wider">
                  Expédier
                </button>
                <button onClick={cancelOrder} disabled={sending}
                  className="w-full text-xs text-red-400 hover:text-red-600 flex items-center justify-center gap-1">
                  <Ban size={12} /> Annuler la commande
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] md:rounded-[28px] p-6 text-center text-stone-400 text-sm sticky top-24">
            Sélectionnez une commande
          </div>
        )}
      </div>
    </div>
  );
}