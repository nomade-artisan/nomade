// app/faq/FaqClient.tsx

"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Link from "next/link";
const contactEmail = 'contact@nomade-artisan.fr';

const categories = [
  {
    title: "Les sacs",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
    questions: [
      {
        question:
          "D'où viennent les sacs Nomade ?",
        answer:
          "Chaque sac est fabriqué à la main dans notre atelier. Nous travaillons des cuirs pleine fleur et des toiles résistantes, choisis pour leur qualité et leur durabilité.",
      },
      {
        question:
          "Quels matériaux utilisez-vous ?",
        answer:
          "Du cuir pleine fleur tanné végétal, de la toile épaisse et des matières pensées pour durer.",
      },
      {
        question:
          "Comment entretenir mon sac ?",
        answer:
          "Un chiffon doux suffit pour le cuir. Avec le temps, les matières se patinent naturellement.",
      },
      {
        question:
          "Les couleurs sont-elles fidèles ?",
        answer:
          "Chaque écran est différent. Le cuir étant vivant, certaines nuances peuvent légèrement varier.",
      },
    ],
  },

  {
    title: "Commande",
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5ae7252",
    questions: [
      {
        question:
          "Comment passer commande ?",
        answer:
          "Ajoutez vos pièces au panier puis suivez les étapes de paiement.",
      },
      {
        question:
          "Quels moyens de paiement acceptez-vous ?",
        answer:
          "Visa, Mastercard, Apple Pay et Google Pay via Stripe.",
      },
      {
        question:
          "Puis-je modifier ma commande ?",
        answer:
          "Oui, dans l'heure suivant votre commande selon l'état de préparation.",
      },
    ],
  },

  {
    title: "Livraison",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
    questions: [
      {
        question:
          "Quels sont les délais ?",
        answer:
          "Préparation sous 24-48h. Livraison standard : 3 à 5 jours.",
      },
      {
        question:
          "La livraison est-elle offerte ?",
        answer:
          "Oui à partir de 100€ en France métropolitaine.",
      },
      {
        question:
          "Livrez-vous à l'international ?",
        answer:
          "Oui, selon les destinations disponibles au moment de la commande.",
      },
    ],
  },

  {
    title: "Retours",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    questions: [
      {
        question:
          "Puis-je retourner mon sac ?",
        answer:
          "Oui, sous 30 jours si le produit est inutilisé.",
      },
      {
        question:
          "Quand serai-je remboursé ?",
        answer:
          "Sous 5 à 7 jours après réception du retour.",
      },
      {
        question:
          "Et si mon sac est défectueux ?",
        answer:
          "Nous prenons tout en charge : retour, échange ou réparation.",
      },
    ],
  },
];

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

          {categories.map(
            (cat, index) => (

              <button
                key={cat.title}
                onClick={() => {
                  setOpenCategory(
                    openCategory ===
                      index
                      ? null
                      : index
                  );

                  setOpenQuestion(
                    null
                  );
                }}
                className="group relative overflow-hidden rounded-[28px] aspect-[4/5]"
              >

                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />

                <div
                  className={`absolute inset-0 transition-colors duration-300
                    ${
                      openCategory ===
                      index
                        ? "bg-stone-900/60"
                        : "bg-stone-900/30 group-hover:bg-stone-900/45"
                    }`}
                />

                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">

                  <h3 className="text-white text-sm md:text-base font-light tracking-tight">
                    {cat.title}
                  </h3>

                  <p className="text-white/60 text-[11px] uppercase tracking-[0.18em] mt-2 font-light">
                    {
                      cat.questions
                        .length
                    }{" "}
                    questions
                  </p>

                </div>

              </button>

            )
          )}

        </div>

        {/* QUESTIONS */}

        <AnimatePresence mode="wait">

          {openCategory !==
            null && (

            <motion.div
              key={openCategory}
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

                <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0">

                  <img
                    src={
                      categories[
                        openCategory
                      ].image
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />

                </div>

                <h2 className="text-xl font-light tracking-tight">
                  {
                    categories[
                      openCategory
                    ].title
                  }
                </h2>

              </div>

              {/* ITEMS */}

              {categories[
                openCategory
              ].questions.map(
                (faq) => (

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

                )
              )}

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

          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
            alt=""
            className="w-full h-[320px] md:h-[360px] object-cover"
          />

          <div className="absolute inset-0 bg-stone-900/55 flex items-center justify-center">

            <div className="text-center px-6 max-w-2xl">

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