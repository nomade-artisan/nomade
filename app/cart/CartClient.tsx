// app/cart/CartClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/CartContext";

function CartClient() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleStripeCheckout = async () => {
    setCheckoutLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erreur lors de la création du paiement");
      setCheckoutLoading(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 9.9;
  const total = subtotal + shipping - promoDiscount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === "NOMADE10" && !promoApplied) {
      setPromoDiscount(10);
      setPromoApplied(true);
    }
  };

  const cartItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
    }),
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeOut" as const } },
  };

  // Panier vide
  if (cart.length === 0) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-stone-50 min-h-[60vh] flex items-center justify-center px-6"
    >
      <div className="text-center max-w-sm">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-thin text-stone-300 mb-4"
        >
          .
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-light tracking-wide mb-2"
        >
          Votre panier est vide
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-stone-500 text-sm font-light mb-6"
        >
          Un sac Nomade vous attend. L&apos;essentiel n&apos;est jamais loin.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/boutique"
            className="inline-block bg-stone-900 text-white px-6 py-3 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-colors"
          >
            Découvrir la collection
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16">
        {/* En-tête compact */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-1">Votre panier</h1>
          <p className="text-stone-500 font-light text-sm">{cart.length} article{cart.length > 1 ? "s" : ""}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Liste */}
          <div className="flex-1 space-y-3">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  custom={index}
                  variants={cartItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="bg-white rounded-xl p-4 md:p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/boutique/${item.id}`} className="text-sm font-light hover:text-stone-600 transition-colors">
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-xs font-light">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (item.stock || 10)}
                              className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-light">
                            {(item.price * item.quantity).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-stone-400 font-light mt-0.5">
                              {item.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € / u.
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-stone-400 hover:text-red-500 transition-colors font-light mt-2"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors font-light underline underline-offset-4"
            >
              Vider le panier
            </button>
          </div>

          {/* Résumé */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-80"
          >
            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-light mb-4">Récapitulatif</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-light">
                  <span className="text-stone-500">Sous-total</span>
                  <span>{subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between font-light">
                  <span className="text-stone-500">Livraison</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600">Offerte</span> : `${shipping.toFixed(2)} €`}</span>
                </div>

                {!promoApplied ? (
                  <form onSubmit={handleApplyPromo} className="pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Code promo"
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-xs font-light focus:outline-none focus:border-stone-400"
                      />
                      <button type="submit" disabled={!promoCode.trim()} className="bg-stone-900 text-white text-xs px-3 py-2 rounded-lg font-light hover:bg-stone-800 disabled:opacity-40">
                        OK
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 font-light">Essayez NOMADE10</p>
                  </form>
                ) : (
                  <div className="flex justify-between text-xs font-light text-emerald-700 bg-emerald-50 -mx-2 px-2 py-1.5 rounded-lg">
                    <span>Réduction</span>
                    <span>-{promoDiscount.toFixed(2)} €</span>
                  </div>
                )}

                {subtotal < 150 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-[10px] text-amber-800 font-light mb-1.5">
                      Plus que {(150 - subtotal).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € pour la livraison offerte
                    </p>
                    <div className="h-1 bg-amber-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min((subtotal / 150) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-100 my-4 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-light">Total</span>
                  <span className="text-xl font-light">{total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1 font-light">Taxes incluses</p>
              </div>

              <button
                onClick={handleStripeCheckout}
                disabled={checkoutLoading}
                className="w-full py-3 bg-stone-900 text-white rounded-full text-xs tracking-[0.15em] uppercase font-light hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {checkoutLoading ? "Redirection..." : "Procéder au paiement"}
              </button>

              <p className="text-center text-[10px] text-stone-400 font-light mt-3">
                Paiement 100 % sécurisé
              </p>
            </div>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/boutique"
            className="text-sm text-stone-400 hover:text-stone-600 font-light tracking-wide transition-colors inline-flex items-center gap-1 group"
          >
            Ajouter d&apos;autres sacs
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CartClient;