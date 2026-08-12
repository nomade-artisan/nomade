
"use client";

import { motion } from "framer-motion";

function CgvClient() {
  const contactEmail = 'contact@nomade-artisan.fr';
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
                Conditions générales
              </p>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95]">
                Conditions générales
                <br />
                de vente
              </h1>

            </div>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-sm">
              Les informations essentielles
              concernant les commandes,
              paiements, livraisons et retours.
            </p>

          </div>

        </motion.div>

        {/* CONTENT */}

        <div className="space-y-5">

          <Section
            number="01"
            title="Préambule"
          >
            <p>
              Les présentes Conditions Générales de Vente
              régissent la vente de sacs et accessoires
              de maroquinerie proposés par NOMADE.
            </p>

            <p className="mt-4">
              Toute commande passée sur le site implique
              l’acceptation pleine et entière
              des présentes conditions.
            </p>
          </Section>

          <Section
            number="02"
            title="Produits"
          >
            <p>
              Les produits proposés sont fabriqués à la main.
              Les photographies sont les plus fidèles possibles,
              mais certaines variations naturelles peuvent exister,
              notamment sur les couleurs et le cuir.
            </p>

            <p className="mt-4">
              Chaque produit présente ses caractéristiques essentielles :
              dimensions, matières et finitions.
            </p>
          </Section>

          <Section
            number="03"
            title="Prix"
          >
            <p>
              Les prix sont indiqués en euros,
              toutes taxes comprises.
            </p>

            <p className="mt-4">
              Les frais de livraison sont affichés
              avant validation de la commande.
            </p>

            <p className="mt-4">
              NOMADE se réserve le droit de modifier ses prix à tout moment.
              Le prix appliqué reste celui affiché
              au moment de la commande.
            </p>
          </Section>

          <Section
            number="04"
            title="Commande"
          >
            <p>
              La commande est considérée comme validée
              après confirmation du paiement.
            </p>

            <p className="mt-4">
              Un email de confirmation est envoyé automatiquement.
            </p>

            <p className="mt-4">
              NOMADE se réserve le droit d’annuler une commande
              en cas de problème de stock,
              d’erreur de prix
              ou de suspicion de fraude.
            </p>
          </Section>

          <Section
            number="05"
            title="Paiement"
          >
            <p>
              Les paiements sont réalisés en ligne
              via Stripe,
              plateforme sécurisée.
            </p>

            <p className="mt-4">
              Les données bancaires ne sont jamais stockées par NOMADE.
            </p>
          </Section>

          <Section
            number="06"
            title="Livraison"
          >
            <p>
              Les commandes sont préparées sous 24 à 48 heures ouvrées.
            </p>

            <p className="mt-4">
              Livraison standard :
              3 à 5 jours ouvrés.
            </p>

            <p className="mt-4">
              Livraison offerte dès 100 € d’achat
              en France métropolitaine.
            </p>

            <p className="mt-4">
              En cas de retard ou de perte,
              une solution adaptée est proposée :
              renvoi ou remboursement.
            </p>
          </Section>

          <Section
            number="07"
            title="Droit de rétractation"
          >
            <p>
              Conformément au Code de la consommation,
              le client dispose de 15 jours
              à compter de la réception
              pour exercer son droit de rétractation.
            </p>

            <p className="mt-4">
              Les produits doivent être retournés
              dans leur état d’origine.
            </p>

            <p className="mt-4">
              Le remboursement est effectué
              sous 5 à 7 jours ouvrés
              après réception et vérification.
            </p>
          </Section>

          <Section
            number="08"
            title="Garanties"
          >
            <p>
              Tous les produits bénéficient
              des garanties légales de conformité
              et contre les vices cachés,
              conformément au droit français.
            </p>
          </Section>

          <Section
            number="09"
            title="Responsabilité"
          >
            <p>
              NOMADE ne saurait être tenue responsable
              des dommages liés à une mauvaise utilisation
              des produits.
            </p>

            <p className="mt-4">
              La responsabilité est limitée
              au montant de la commande.
            </p>
          </Section>

          <Section
            number="10"
            title="Données personnelles"
          >
            <p>
              Les données collectées sont utilisées uniquement
              dans le cadre du traitement des commandes
              et de la relation client.
            </p>

            <p className="mt-4">
              Aucune donnée personnelle n’est vendue
              ou cédée à des tiers.
            </p>

            <p className="mt-4">
              Pour toute demande :
              {" "}
              <span className="text-stone-700">
                {contactEmail}
              </span>
            </p>
          </Section>

          <Section
            number="11"
            title="Litiges"
          >
            <p>
              En cas de litige,
              une solution amiable sera toujours privilégiée.
            </p>

            <p className="mt-4">
              Les présentes CGV sont soumises au droit français.
            </p>

            <p className="mt-4">
              Les tribunaux français restent compétents
              en cas de désaccord persistant.
            </p>
          </Section>

          {/* FOOTER */}

          <div className="pt-4">

            <p className="text-stone-400 text-sm font-light">
              Dernière mise à jour :
              {" "}
              {new Date().toLocaleDateString(
                "fr-FR"
              )}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CgvClient;


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