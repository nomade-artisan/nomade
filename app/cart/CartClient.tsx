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
    // Ne plus vider ici — on attend la confirmation du paiement
    window.location.href = data.url;
  } else {
    alert(data.error || "Erreur lors de la création du paiement");
    setCheckoutLoading(false);
  }
};
  // Calculs
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 150 ? 0 : 9.9;
  const total = subtotal + shipping - promoDiscount;

  // Code promo
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === "NOMADE10" && !promoApplied) {
      setPromoDiscount(10);
      setPromoApplied(true);
    }
  };

  // Animation
  const cartItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut" as const,
      },
    }),
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-3">
            Votre panier
          </h1>
          <p className="text-stone-500 font-light">
            {cart.length} {cart.length <= 1 ? "article" : "articles"}
          </p>
        </motion.div>

        {cart.length === 0 ? (
          /* Panier vide */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">.</div>
            <h2 className="text-2xl font-light mb-4">
              Votre panier est vide
            </h2>
            <p className="text-stone-500 mb-8 font-light max-w-md mx-auto">
              Un sac Nomade vous attend. L&apos;essentiel n&apos;est jamais loin.
            </p>
            <Link
              href="/boutique"
              className="inline-block bg-stone-900 text-white px-8 py-4 rounded-full text-sm tracking-wider hover:bg-stone-800 transition-colors"
            >
              Découvrir la collection
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Liste des articles */}
            <div className="flex-1 space-y-4">
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
                    className="bg-white rounded-2xl p-5 md:p-6 shadow-sm"
                  >
                    <div className="flex gap-5">
                      {/* Image */}
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              href={`/boutique/${item.id}`}
                              className="text-base font-light hover:text-stone-600 transition-colors"
                            >
                              {item.name}
                            </Link>

                            {/* Quantité */}
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-light">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= (item.stock || 10)}
                                className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Prix */}
                          <div className="text-right">
                            <p className="text-base font-light">
                              {(item.price * item.quantity).toLocaleString(
                                "fr-FR",
                                { minimumFractionDigits: 2 }
                              )}{" "}
                              €
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-stone-400 font-light mt-1">
                                {item.price.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                € / unité
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Supprimer */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-stone-400 hover:text-red-500 transition-colors font-light mt-3 flex items-center gap-1"
                        >
                          <span>×</span> Supprimer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Vider le panier */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearCart}
                className="text-sm text-stone-400 hover:text-red-500 transition-colors font-light underline underline-offset-4 mt-4"
              >
                Vider le panier
              </motion.button>
            </div>

            {/* Résumé */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:w-96"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm sticky top-24">
                <h2 className="text-lg font-light mb-6">Récapitulatif</h2>

                <div className="space-y-4 text-sm">
                  {/* Sous-total */}
                  <div className="flex justify-between font-light">
                    <span className="text-stone-500">Sous-total</span>
                    <span>
                      {subtotal.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      €
                    </span>
                  </div>

                  {/* Livraison */}
                  <div className="flex justify-between font-light">
                    <span className="text-stone-500">Livraison</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600">Offerte</span>
                      ) : (
                        `${shipping.toFixed(2)} €`
                      )}
                    </span>
                  </div>

                  {/* Code promo */}
                  {!promoApplied ? (
                    <form onSubmit={handleApplyPromo} className="pt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Code promo"
                          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:border-stone-400 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={!promoCode.trim()}
                          className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg font-light hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          OK
                        </button>
                      </div>
                      <p className="text-xs text-stone-400 mt-2 font-light">
                        Essayez NOMADE10
                      </p>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex justify-between text-sm font-light text-emerald-700 bg-emerald-50 -mx-3 px-3 py-2 rounded-lg"
                    >
                      <span>Réduction</span>
                      <span>-{promoDiscount.toFixed(2)} €</span>
                    </motion.div>
                  )}

                  {/* Barre livraison gratuite */}
                  {subtotal < 150 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-amber-50 border border-amber-100 rounded-lg p-4"
                    >
                      <p className="text-xs text-amber-800 font-light mb-2">
                        Plus que{" "}
                        {(150 - subtotal).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        € pour la livraison offerte
                      </p>
                      <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (subtotal / 150) * 100,
                              100
                            )}%`,
                          }}
                          className="h-full bg-amber-500 rounded-full"
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-stone-100 my-6 pt-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-light">Total</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-light"
                    >
                      {total.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      €
                    </motion.span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 font-light">
                    Taxes incluses
                  </p>
                </div>

                {/* Bouton checkout */}
                <button
                  onClick={handleStripeCheckout}
                  disabled={checkoutLoading}
                  className="w-full mt-4 py-4 bg-stone-900 text-white rounded-full text-sm tracking-[0.15em] uppercase font-light hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {checkoutLoading ? "Redirection..." : "Procéder au paiement"}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-400 font-light">
                  <span>🔒</span> Paiement 100% sécurisé
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Suggestions */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 text-center"
          >
            <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-3">
              Continuer
            </p>
            <Link
              href="/boutique"
              className="text-xl font-light tracking-wide hover:text-stone-600 transition-colors inline-flex items-center gap-2 group"
            >
              Ajouter d&apos;autres sacs
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default CartClient;