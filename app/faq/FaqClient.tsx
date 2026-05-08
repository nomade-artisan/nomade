// app/faq/FaqClient.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const categories = [
  {
    title: "Les sacs",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
    questions: [
      {
        question: "D'où viennent les sacs Nomade ?",
        answer:
          "Chaque sac est fabriqué à la main dans notre atelier. Nous travaillons des cuirs pleine fleur et des toiles résistantes, choisis pour leur qualité et leur durabilité. Pas d'usine, pas de chaîne. Juste des mains qui savent faire.",
      },
      {
        question: "Quels matériaux utilisez-vous ?",
        answer:
          "Du cuir pleine fleur tanné végétal, de la toile de coton épaisse, du nylon résistant à l'eau. Nous choisissons chaque matière pour sa beauté, sa résistance et sa capacité à traverser le temps.",
      },
      {
        question: "Comment entretenir mon sac ?",
        answer:
          "Pour le cuir, un chiffon doux et sec suffit. Évitez l'eau et les produits chimiques. Avec le temps, le cuir se patine : c'est normal, c'est même ce qui fait sa beauté. La toile se lave à la main, à l'eau froide.",
      },
      {
        question: "Les couleurs sont-elles fidèles aux photos ?",
        answer:
          "Nous faisons au mieux. Mais chaque écran est différent, et le cuir est une matière vivante : sa teinte peut varier légèrement. C'est ce qui rend chaque sac unique.",
      },
    ],
  },
  {
    title: "Commande & Paiement",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5ae7252",
    questions: [
      {
        question: "Comment passer commande ?",
        answer:
          "Ajoutez vos sacs au panier, suivez les étapes. C'est simple. Vous recevrez un email de confirmation tout de suite après.",
      },
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer:
          "Carte bancaire (Visa, Mastercard, American Express), Apple Pay et Google Pay. Tout passe par Stripe, sécurisé et chiffré.",
      },
      {
        question: "Ma commande est-elle confirmée ?",
        answer:
          "Oui, vous recevez un email de confirmation immédiatement après le paiement. Si vous ne le voyez pas, vérifiez vos spams ou contactez-nous.",
      },
      {
        question: "Puis-je modifier ma commande ?",
        answer:
          "Écrivez-nous dans l'heure qui suit votre commande. Nous ferons de notre mieux. Au-delà, le colis est probablement déjà en préparation.",
      },
    ],
  },
  {
    title: "Livraison",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
    questions: [
      {
        question: "Quels sont les délais de livraison ?",
        answer:
          "Préparation en 24-48h. Livraison standard : 3 à 5 jours ouvrés (Colissimo). Express : 1 à 2 jours ouvrés (Chronopost).",
      },
      {
        question: "La livraison est-elle gratuite ?",
        answer:
          "Oui, à partir de 150 € d'achat en France métropolitaine. En dessous, comptez 9,90 € en standard, 14,90 € en express.",
      },
      {
        question: "Livrez-vous à l'international ?",
        answer:
          "France, Belgique, Luxembourg et Suisse. Pour les autres destinations, contactez-nous. On trouvera une solution.",
      },
      {
        question: "Comment suivre ma commande ?",
        answer:
          "Un email avec votre numéro de suivi vous est envoyé dès l'expédition. Vous pouvez suivre votre colis en temps réel.",
      },
    ],
  },
  {
    title: "Retours & Remboursements",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    questions: [
      {
        question: "Puis-je retourner mon sac ?",
        answer:
          "Oui, vous avez 30 jours. Les retours sont gratuits en France. Le sac doit être dans son état d'origine, non utilisé.",
      },
      {
        question: "Comment faire un retour ?",
        answer:
          "1. Écrivez-nous à bonjour@nomade.fr avec votre numéro de commande. 2. Nous vous envoyons une étiquette retour. 3. Déposez le colis. 4. Remboursement sous 5-7 jours après réception.",
      },
      {
        question: "Quand serai-je remboursé ?",
        answer:
          "Sous 5 à 7 jours ouvrés après réception et vérification du sac. Le remboursement se fait sur le moyen de paiement utilisé.",
      },
      {
        question: "Et si mon sac est défectueux ?",
        answer:
          "Contactez-nous sous 48h avec des photos. Nous prenons tout en charge : retour, réparation ou échange. Nos sacs sont garantis 2 ans.",
      },
    ],
  },
];

function FaqClient() {
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleQuestion = (question: string) => {
    setOpenQuestion(openQuestion === question ? null : question);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 min-h-screen"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
            Tout savoir
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            Foire aux questions
          </h1>
          <p className="text-stone-500 font-light max-w-md mx-auto">
            Les réponses à toutes vos questions. Simple, comme tout ce qu&apos;on fait.
          </p>
        </motion.div>

        {/* Catégories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((cat, index) => (
            <motion.button
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setOpenCategory(openCategory === index ? null : index);
                setOpenQuestion(null);
              }}
              className={`group relative overflow-hidden rounded-2xl aspect-[3/4] transition-all duration-300 ${
                openCategory === index
                  ? "ring-2 ring-stone-900 ring-offset-2"
                  : "hover:ring-1 hover:ring-stone-300"
              }`}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className={`absolute inset-0 transition-colors ${
                  openCategory === index
                    ? "bg-stone-900/70"
                    : "bg-stone-900/30 group-hover:bg-stone-900/50"
                }`}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <h3 className="text-white text-sm font-light tracking-wide">
                  {cat.title}
                </h3>
                <p className="text-white/60 text-xs mt-1 font-light">
                  {cat.questions.length} questions
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Questions de la catégorie active */}
        <AnimatePresence mode="wait">
          {openCategory !== null && (
            <motion.div
              key={openCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={categories[openCategory].image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-light tracking-wide">
                  {categories[openCategory].title}
                </h2>
              </div>

              {categories[openCategory].questions.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-xl border border-stone-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(faq.question)}
                    className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-sm font-light text-stone-800 pr-4">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{
                        rotate: openQuestion === faq.question ? 45 : 0,
                      }}
                      className="text-stone-400 text-xl flex-shrink-0"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {openQuestion === faq.question && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-stone-600 font-light leading-relaxed text-sm border-t border-stone-50 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 relative rounded-2xl overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
            alt=""
            className="w-full h-64 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide mb-4">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h2>
            <p className="text-white/60 font-light mb-8 max-w-md">
              On vous répond personnellement. Sous 24 heures. Toujours avec soin.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-block bg-white text-stone-900 px-8 py-3 rounded-full text-sm tracking-wider font-light hover:bg-stone-100 transition-colors"
              >
                Nous écrire
              </Link>
              <a
                href="mailto:bonjour@nomade.fr"
                className="inline-block border border-white/30 text-white px-8 py-3 rounded-full text-sm tracking-wider font-light hover:bg-white/10 transition-colors"
              >
                bonjour@nomade.fr
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default FaqClient;