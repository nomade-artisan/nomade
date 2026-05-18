// app/confidentialite/ConfidentialiteClient.tsx

"use client";

import { motion } from "framer-motion";

function ConfidentialiteClient() {
  return (
    <div className="bg-stone-50 min-h-screen pt-[64px]">

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">

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
          className="mb-14 md:mb-16"
        >

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div>

              <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 font-light mb-4">
                Protection des données
              </p>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95]">
                Politique de
                <br />
                confidentialité
              </h1>

            </div>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-sm">
              Comment les données sont collectées,
              utilisées et protégées chez NOMADE.
            </p>

          </div>

        </motion.div>

        {/* CONTENT */}

        <div className="space-y-5">

          {/* INTRO */}

          <Section
            number="01"
            title="Introduction"
          >

            <p>
              NOMADE respecte votre vie privée
              et s’engage à protéger vos données personnelles.
            </p>

            <p className="mt-4">
              Cette politique explique
              quelles informations sont collectées,
              pourquoi elles le sont
              et comment elles sont utilisées.
            </p>

          </Section>

          {/* DONNÉES */}

          <Section
            number="02"
            title="Données collectées"
          >

            <div className="space-y-6">

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Commandes
                </p>

                <ul className="space-y-2 text-stone-500 font-light leading-relaxed">

                  <li>
                    Nom et prénom
                  </li>

                  <li>
                    Adresse email
                  </li>

                  <li>
                    Adresse de livraison
                  </li>

                  <li>
                    Produits commandés
                  </li>

                </ul>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Contact
                </p>

                <ul className="space-y-2 text-stone-500 font-light leading-relaxed">

                  <li>
                    Nom
                  </li>

                  <li>
                    Adresse email
                  </li>

                  <li>
                    Message envoyé via le formulaire
                  </li>

                </ul>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Navigation
                </p>

                <ul className="space-y-2 text-stone-500 font-light leading-relaxed">

                  <li>
                    Pages consultées
                  </li>

                  <li>
                    Temps de navigation
                  </li>

                  <li>
                    Type d’appareil et navigateur
                  </li>

                </ul>

              </div>

            </div>

          </Section>

          {/* UTILISATION */}

          <Section
            number="03"
            title="Utilisation des données"
          >

            <div className="space-y-6">

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Commandes
                </p>

                <p className="text-stone-500 font-light leading-relaxed">
                  Les informations sont utilisées
                  pour préparer,
                  expédier et suivre votre commande.
                </p>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Service client
                </p>

                <p className="text-stone-500 font-light leading-relaxed">
                  Votre email permet de vous contacter
                  concernant votre commande,
                  vos retours ou vos demandes.
                </p>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Statistiques
                </p>

                <p className="text-stone-500 font-light leading-relaxed">
                  Certaines données anonymisées
                  permettent d’améliorer l’expérience du site.
                </p>

              </div>

            </div>

          </Section>

          {/* PARTAGE */}

          <Section
            number="04"
            title="Partage des données"
          >

            <p>
              Les données personnelles ne sont jamais vendues
              ou cédées à des tiers à des fins commerciales.
            </p>

            <p className="mt-5">
              Elles sont uniquement partagées
              avec les services nécessaires au fonctionnement du site :
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">

              <MiniCard
                title="Stripe"
                text="Paiement sécurisé"
              />

              <MiniCard
                title="Colissimo / Mondial Relay"
                text="Livraison des commandes"
              />

              <MiniCard
                title="Resend"
                text="Emails transactionnels"
              />

              <MiniCard
                title="Supabase"
                text="Base de données"
              />

            </div>

          </Section>

          {/* CONSERVATION */}

          <Section
            number="05"
            title="Durée de conservation"
          >

            <div className="space-y-4">

              <Line
                left="Commandes"
                right="10 ans"
              />

              <Line
                left="Messages de contact"
                right="3 ans"
              />

              <Line
                left="Données anonymisées"
                right="26 mois"
              />

              <Line
                left="Cookies de session"
                right="Durée de navigation"
              />

            </div>

          </Section>

          {/* COOKIES */}

          <Section
            number="06"
            title="Cookies"
          >

            <p>
              Le site utilise uniquement des cookies nécessaires
              à son bon fonctionnement.
            </p>

            <div className="space-y-4 mt-6">

              <MiniCard
                title="Panier"
                text="Mémorisation des articles"
              />

              <MiniCard
                title="Stripe"
                text="Sécurisation du paiement"
              />

            </div>

            <p className="mt-6">
              Aucun cookie publicitaire
              ou de tracking marketing n’est utilisé.
            </p>

          </Section>

          {/* SÉCURITÉ */}

          <Section
            number="07"
            title="Sécurité"
          >

            <div className="grid md:grid-cols-2 gap-4">

              <MiniCard
                title="HTTPS"
                text="Connexion sécurisée SSL/TLS"
              />

              <MiniCard
                title="Stripe"
                text="Paiement PCI-DSS"
              />

              <MiniCard
                title="Accès restreint"
                text="Données accessibles uniquement par l’administrateur"
              />

              <MiniCard
                title="Authentification"
                text="Base de données protégée"
              />

            </div>

          </Section>

          {/* DROITS */}

          <Section
            number="08"
            title="Vos droits"
          >

            <p>
              Conformément au RGPD,
              vous disposez d’un droit :
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">

              <MiniCard
                title="Accès"
                text="Consulter vos données"
              />

              <MiniCard
                title="Rectification"
                text="Corriger vos informations"
              />

              <MiniCard
                title="Suppression"
                text="Effacer vos données"
              />

              <MiniCard
                title="Portabilité"
                text="Récupérer vos données"
              />

            </div>

            <p className="mt-6">
              Pour toute demande :
              {" "}
              <span className="text-stone-700">
                bonjour@nomade.fr
              </span>
            </p>

          </Section>

          {/* UPDATE */}

          <Section
            number="09"
            title="Mise à jour"
          >

            <p>
              Cette politique peut être modifiée
              afin de refléter l’évolution du site
              ou des obligations légales.
            </p>

            <p className="text-stone-400 text-sm mt-6">
              Dernière mise à jour :
              {" "}
              {new Date().toLocaleDateString(
                "fr-FR"
              )}
            </p>

          </Section>

        </div>

      </div>

    </div>
  );
}

export default ConfidentialiteClient;

/* ========================= */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
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
      className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] p-5 md:p-7"
    >

      <div className="flex items-start gap-5">

        {/* NUMBER */}

        <div className="flex-shrink-0">

          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light pt-1">
            {number}
          </p>

        </div>

        {/* CONTENT */}

        <div className="flex-1">

          <h2 className="text-lg md:text-xl font-light tracking-tight text-stone-900 mb-5">
            {title}
          </h2>

          <div className="text-stone-500 font-light leading-relaxed">
            {children}
          </div>

        </div>

      </div>

    </motion.section>
  );
}

/* ========================= */

function MiniCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="border border-stone-200 rounded-[22px] p-4">

      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-light mb-3">
        {title}
      </p>

      <p className="text-stone-500 font-light text-sm leading-relaxed">
        {text}
      </p>

    </div>
  );
}

/* ========================= */

function Line({
  left,
  right,
}: {
  left: string;
  right: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-stone-100 pb-4">

      <p className="text-stone-500 font-light">
        {left}
      </p>

      <p className="text-stone-700 font-light">
        {right}
      </p>

    </div>
  );
}