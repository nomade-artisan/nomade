// app/cart/CartClient.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/CartContext";

const isMaintenance =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

function CartClient() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleStripeCheckout = async () => {
    setCheckoutLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      alert(data.error || "Erreur lors du paiement");
      setCheckoutLoading(false);
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 150 ? 0 : 9.9;
  const total = subtotal + shipping - promoDiscount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      promoCode.toUpperCase() === "NOMADE10" &&
      !promoApplied
    ) {
      setPromoDiscount(10);
      setPromoApplied(true);
    }
  };

  const cartItemVariants = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.04,
        duration: 0.35,
      },
    }),
    exit: {
      opacity: 0,
      y: -8,
      transition: {
        duration: 0.2,
      },
    },
  };

  // EMPTY CART

  if (cart.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen pt-20 flex items-center justify-center px-6">

        <div className="text-center max-w-md">

          <div className="w-12 h-px bg-stone-300 mx-auto mb-8" />

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl font-light tracking-tight mb-4"
          >
            Panier vide
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="text-stone-500 text-lg leading-relaxed font-light mb-10"
          >
            L’essentiel n’est jamais loin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >

            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-900 text-white px-8 py-4 rounded-full text-[11px] tracking-[0.18em] uppercase font-light hover:bg-stone-800 transition-all duration-300"
            >
              Découvrir la collection
            </Link>

          </motion.div>

        </div>

      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pt-20">

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10"
        >

          <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-2">
            Panier
          </h1>

          <p className="text-stone-400 font-light text-sm tracking-wide">
            {cart.length} article{cart.length > 1 ? "s" : ""}
          </p>

        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">

          {/* PRODUCTS */}

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
                  className="bg-white/75 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-4 md:p-5"
                >

                  <div className="flex gap-4 md:gap-5">

                    {/* IMAGE */}

                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                    </div>

                    {/* CONTENT */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <Link
                            href={`/boutique/${item.id}`}
                            className="text-base md:text-lg font-light hover:text-stone-600 transition-colors"
                          >
                            {item.name}
                          </Link>

                          {/* QUANTITY */}

                          <div className="flex items-center gap-3 mt-5">

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="text-sm font-light w-4 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >=
                                (item.stock || 10)
                              }
                              className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-30"
                            >
                              +
                            </button>

                          </div>

                        </div>

                        {/* PRICE */}

                        <div className="text-right">

                          <p className="text-base md:text-lg font-light">
                            {(
                              item.price * item.quantity
                            ).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })} €
                          </p>

                          {item.quantity > 1 && (
                            <p className="text-xs text-stone-400 font-light mt-1">
                              {item.price.toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                              })} € / unité
                            </p>
                          )}

                        </div>

                      </div>

                      {/* REMOVE */}

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-stone-400 hover:text-red-500 transition-colors font-light mt-5"
                      >
                        Supprimer
                      </button>

                    </div>

                  </div>

                </motion.div>

              ))}

            </AnimatePresence>

            {/* CLEAR */}

            <button
              onClick={clearCart}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors font-light underline underline-offset-4 mt-3"
            >
              Vider le panier
            </button>

          </div>

          {/* SUMMARY */}

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="lg:w-[350px]"
          >

            <div className="bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-3xl p-6 md:p-7 sticky top-24">

              <h2 className="text-lg font-light mb-8">
                Récapitulatif
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between text-sm font-light">

                  <span className="text-stone-500">
                    Sous-total
                  </span>

                  <span>
                    {subtotal.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })} €
                  </span>

                </div>

                <div className="flex justify-between text-sm font-light">

                  <span className="text-stone-500">
                    Livraison
                  </span>

                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-700">
                        Offerte
                      </span>
                    ) : (
                      `${shipping.toFixed(2)} €`
                    )}
                  </span>

                </div>

                {/* PROMO */}

                {!promoApplied ? (

                  <form
                    onSubmit={handleApplyPromo}
                    className="pt-3"
                  >

                    <div className="flex gap-2">

                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value)
                        }
                        placeholder="Code promo"
                        className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm font-light bg-transparent focus:outline-none focus:border-stone-400 transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={!promoCode.trim()}
                        className="bg-stone-900 text-white px-4 rounded-xl text-xs tracking-wide uppercase font-light hover:bg-stone-800 transition-colors disabled:opacity-40"
                      >
                        OK
                      </button>

                    </div>

                  </form>

                ) : (

                  <div className="flex justify-between text-sm font-light text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">

                    <span>Réduction</span>

                    <span>
                      -{promoDiscount.toFixed(2)} €
                    </span>

                  </div>

                )}

                {/* FREE SHIPPING */}

                {subtotal < 150 && (

                  <div className="bg-stone-100/70 rounded-2xl p-4 mt-3">

                    <p className="text-xs text-stone-500 font-light mb-3 leading-relaxed">
                      Plus que{" "}
                      {(150 - subtotal).toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })} €
                      pour la livraison offerte.
                    </p>

                    <div className="h-[3px] bg-stone-200 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-stone-900 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (subtotal / 150) * 100,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                )}

              </div>

              {/* TOTAL */}

              <div className="border-t border-stone-200/70 mt-8 pt-6">

                <div className="flex justify-between items-end">

                  <span className="text-base font-light">
                    Total
                  </span>

                  <span className="text-2xl font-light tracking-tight">
                    {total.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })} €
                  </span>

                </div>

                <p className="text-[11px] text-stone-400 font-light mt-2">
                  Taxes incluses
                </p>

              </div>

              {/* CHECKOUT */}

              <div className="mt-8">

                {isMaintenance ? (

                  <div className="space-y-3">

                    <button
                      disabled
                      className="w-full py-4 bg-stone-200 text-stone-400 rounded-full text-[11px] tracking-[0.18em] uppercase font-light cursor-not-allowed"
                    >
                      Indisponible
                    </button>

                    <p className="text-[11px] text-stone-400 text-center font-light">
                      Notre boutique ouvrira bientôt.
                    </p>

                  </div>

                ) : (

                  <>
                    <button
                      onClick={handleStripeCheckout}
                      disabled={checkoutLoading}
                      className="w-full py-4 bg-stone-900 text-white rounded-full text-[11px] tracking-[0.18em] uppercase font-light hover:bg-stone-800 transition-all duration-300 disabled:opacity-50"
                    >
                      {checkoutLoading
                        ? "Redirection..."
                        : "Procéder au paiement"}
                    </button>

                    {/* SECURITY */}

                    <div className="mt-5 space-y-2 text-center">

                      <p className="text-[11px] text-stone-400 font-light">
                        Paiement sécurisé via Stripe
                      </p>

                      <div className="flex items-center justify-center gap-3 text-[10px] text-stone-300 font-light">

                        <span>Visa</span>
                        <span>·</span>
                        <span>Mastercard</span>
                        <span>·</span>
                        <span>Apple Pay</span>

                      </div>

                    </div>

                  </>

                )}

              </div>

            </div>

          </motion.div>

        </div>

        {/* BACK */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mt-14 text-center"
        >

          <Link
            href="/boutique"
            className="text-sm text-stone-400 hover:text-stone-700 font-light tracking-wide transition-colors inline-flex items-center gap-2 group"
          >
            Continuer la sélection

            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>

          </Link>

        </motion.div>

      </div>

    </div>
  );
}

export default CartClient;