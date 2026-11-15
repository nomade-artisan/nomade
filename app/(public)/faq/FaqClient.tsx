
"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  CreditCard,
  MessageCircle,
  Package,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";

import Link from "next/link";
const contactEmail = 'contact@nomade-artisan.fr';

function parseShippingSetting(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function formatEuro(value: number, maximumFractionDigits = 2) {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits })} €`;
}

function FaqClient() {
  const [openCategory, setOpenCategory] =
    useState<number | null>(0);

  const [openQuestion, setOpenQuestion] =
    useState<string | null>(null);

  const toggleQuestion = (
    question: string
  ) => {
    setOpenQuestion(
      openQuestion === question
        ? null
        : question
    );
  };

  const shippingCost = parseShippingSetting(
    process.env.NEXT_PUBLIC_SHIPPING_COST,
    8.11
  );
  const freeShippingThreshold = parseShippingSetting(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD,
    120
  );

  const categories = [
    {
      title: "Les sacs",
      icon: ShoppingBag,
      questions: [
        {
          question: "Où sont conçus les sacs SCOLTA ?",
          answer:
            "Les sacs SCOLTA sont conçus par Nomade à Alès. Les matières et les détails de fabrication peuvent varier selon le modèle : consultez sa fiche produit pour les informations précises.",
        },
        {
          question: "Quels matériaux utilisez-vous ?",
          answer:
            "Les matières varient selon les modèles. La fiche de chaque sac précise sa composition et ses caractéristiques.",
        },
        {
          question: "Comment entretenir mon sac ?",
          answer:
            "Les conseils dépendent des matières du modèle. Consultez sa fiche produit ou écrivez-nous si vous avez un doute avant de le nettoyer.",
        },
        {
          question: "Les couleurs sont-elles fidèles ?",
          answer:
            "Le rendu peut varier d’un écran à l’autre. De légères différences de teinte peuvent aussi exister d’une pièce à l’autre.",
        },
      ],
    },
    {
      title: "Commande",
      icon: CreditCard,
      questions: [
        {
          question: "Comment passer commande ?",
          answer:
            "Ajoutez vos articles au panier, renseignez vos coordonnées et votre adresse de livraison, puis finalisez le paiement. Un email confirme la commande.",
        },
        {
          question: "Quels moyens de paiement acceptez-vous ?",
          answer:
            "Le paiement est sécurisé par Stripe. Les moyens disponibles s’affichent au moment du règlement.",
        },
        {
          question: "Puis-je modifier ma commande ?",
          answer:
            "Écrivez-nous dès que possible après votre achat. Nous vérifierons si une modification est encore possible avant l’expédition.",
        },
      ],
    },
    {
      title: "Livraison",
      icon: Truck,
      questions: [
        {
          question: "Quels sont les délais ?",
          answer:
            "La préparation prend 24 à 48 heures ouvrées. La livraison standard prend ensuite 3 à 5 jours ouvrés et comprend un suivi.",
        },
        {
          question: "Combien coûte la livraison ?",
          answer:
            `La livraison standard coûte ${formatEuro(shippingCost)}. Elle est offerte dès ${formatEuro(freeShippingThreshold, 0)} d’achat dans les destinations desservies.`,
        },
        {
          question: "Dans quels pays livrez-vous ?",
          answer:
            "Les commandes peuvent être livrées en France, en Belgique, au Luxembourg et en Suisse.",
        },
      ],
    },
    {
      title: "Retours",
      icon: RotateCcw,
      questions: [
        {
          question: "Puis-je retourner mon sac ?",
          answer:
            "Oui, dans les 15 jours suivant sa réception. Pour organiser un retour gratuit, contactez-nous : nous vous indiquerons la marche à suivre et vous transmettrons une étiquette prépayée. Le produit doit être dans son état d’origine.",
        },
        {
          question: "Quand serai-je remboursé ?",
          answer:
            "Le remboursement est effectué sous 5 à 7 jours ouvrés après réception et vérification du colis retourné.",
        },
        {
          question: "Et si mon sac est défectueux ?",
          answer:
            "Écrivez-nous avec votre numéro de commande et une photo du problème. Nous étudierons votre demande et vous proposerons une solution adaptée.",
        },
      ],
    },
  ];

  const activeCategory = openCategory === null ? null : categories[openCategory];
  const ActiveCategoryIcon = activeCategory?.icon ?? Package;

  return (
    <div className="bg-stone-50 min-h-screen pt-[64px]">

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* HERO */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mb-12 md:mb-16"
        >

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div>

              <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 font-light mb-4">
                FAQ
              </p>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95]">
                Quelques réponses.
                <br />
                Simplement.
              </h1>

            </div>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-sm">
              Tout ce qu’il faut savoir
              avant de continuer la route.
            </p>

          </div>

        </motion.div>

        {/* CATEGORIES */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          {categories.map((cat, index) => {
            const CategoryIcon = cat.icon;
            const isActive = openCategory === index;

            return (
              <button
                key={cat.title}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setOpenCategory(isActive ? null : index);
                  setOpenQuestion(null);
                }}
                className={`group flex min-h-44 flex-col justify-between rounded-[28px] border p-5 text-left transition-colors md:min-h-48 ${
                  isActive
                    ? "border-stone-400 bg-white"
                    : "border-stone-200/60 bg-white/60 hover:bg-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
                  }`}
                >
                  <CategoryIcon className="h-5 w-5" strokeWidth={1.5} />
                </span>

                <span>
                  <span className="block text-sm font-light tracking-tight text-stone-900 md:text-base">
                    {cat.title}
                  </span>
                  <span className="mt-2 block text-[11px] font-light uppercase tracking-[0.18em] text-stone-400">
                    {cat.questions.length} questions
                  </span>
                </span>
              </button>
            );
          })}

        </div>

        {/* QUESTIONS */}

        <AnimatePresence mode="wait">

          {activeCategory && (

            <motion.div
              key={activeCategory.title}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -6,
              }}
              transition={{
                duration: 0.25,
              }}
              className="space-y-3"
            >

              {/* TITLE */}

              <div className="flex items-center gap-4 mb-6">

                <div aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  <ActiveCategoryIcon className="h-5 w-5" strokeWidth={1.5} />
                </div>

                <h2 className="text-xl font-light tracking-tight">
                  {activeCategory.title}
                </h2>

              </div>

              {/* ITEMS */}

              {activeCategory.questions.map((faq) => (

                  <div
                    key={
                      faq.question
                    }
                    className="bg-white/75 backdrop-blur-sm border border-stone-200/60 rounded-[24px] overflow-hidden"
                  >

                    <button
                      onClick={() =>
                        toggleQuestion(
                          faq.question
                        )
                      }
                      className="w-full flex items-center justify-between gap-5 px-5 md:px-6 py-5 text-left"
                    >

                      <span className="text-sm md:text-[15px] font-light text-stone-800 leading-relaxed">
                        {
                          faq.question
                        }
                      </span>

                      <motion.span
                        animate={{
                          rotate:
                            openQuestion ===
                            faq.question
                              ? 45
                              : 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="text-stone-400 text-lg flex-shrink-0"
                      >
                        +
                      </motion.span>

                    </button>

                    <AnimatePresence>

                      {openQuestion ===
                        faq.question && (

                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height:
                              "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.22,
                          }}
                          className="overflow-hidden"
                        >

                          <div className="px-5 md:px-6 pb-5 text-stone-500 font-light leading-relaxed text-sm border-t border-stone-100 pt-4">
                            {
                              faq.answer
                            }
                          </div>

                        </motion.div>

                      )}

                    </AnimatePresence>

                  </div>

              ))}

            </motion.div>

          )}

        </AnimatePresence>

        {/* CONTACT */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mt-16 md:mt-20 rounded-[36px] overflow-hidden relative"
        >

          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-950" />
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-10 h-52 w-52 rounded-full border border-white/10" />

          <div className="relative flex min-h-[320px] items-center justify-center md:min-h-[360px]">

            <div className="text-center px-6 max-w-2xl">

              <MessageCircle aria-hidden="true" className="mx-auto mb-5 h-8 w-8 text-white/75" strokeWidth={1.25} />

              <h2 className="text-2xl md:text-4xl font-light text-white tracking-tight leading-tight mb-5">
                Vous ne trouvez
                <br />
                pas votre réponse ?
              </h2>

              <p className="text-white/65 font-light leading-relaxed mb-8 max-w-md mx-auto">
                Nous répondons personnellement.
                Toujours avec attention.
              </p>

              <div className="flex flex-wrap justify-center gap-4">

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-white text-stone-900 px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light hover:bg-stone-100 transition-colors"
                >
                  Nous écrire
                </Link>

                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center justify-center border border-white/20 text-white px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light hover:bg-white/10 transition-colors"
                >
                  {contactEmail}
                </a>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}

export default FaqClient;
