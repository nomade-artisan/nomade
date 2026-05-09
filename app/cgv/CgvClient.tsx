// app/cgv/CgvClient.tsx
"use client";

import { motion } from "framer-motion";

function CgvClient() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 min-h-screen"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
            Conditions de vente
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            CGV
          </h1>
          <p className="text-stone-500 font-light">
            Conditions Générales de Vente applicables à toutes les commandes passées sur le site Nomade.
          </p>
        </motion.div>

        <div className="space-y-12 text-stone-600 font-light leading-relaxed">
          {/* 1. Préambule */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              1. Préambule
            </h2>
            <p>
              Les présentes Conditions Générales de Vente régissent la vente de
              sacs et accessoires de maroquinerie par Nomade, entrepreneur
              individuel, à destination de clients particuliers et professionnels.
              Toute commande passée sur le site implique l&apos;acceptation sans
              réserve des présentes CGV.
            </p>
          </section>

          {/* 2. Produits */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              2. Produits
            </h2>
            <p>
              Les produits proposés sont fabriqués à la main. Les photographies
              sont les plus fidèles possibles mais ne peuvent assurer une
              similitude parfaite avec le produit, notamment en ce qui concerne
              les couleurs (chaque écran est différent) et l&apos;aspect du cuir
              (matière vivante, variations naturelles).
            </p>
            <p className="mt-3">
              Chaque produit est décrit avec ses caractéristiques essentielles
              (dimensions, matière, couleur). Le client est tenu d&apos;en prendre
              connaissance avant de passer commande.
            </p>
          </section>

          {/* 3. Prix */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              3. Prix
            </h2>
            <p>
              Les prix sont affichés en euros, toutes taxes comprises (TVA non
              applicable, article 293 B du CGI). Les frais de livraison sont
              indiqués dans le panier avant validation de la commande.
            </p>
            <p className="mt-3">
              Nomade se réserve le droit de modifier ses prix à tout moment. Le
              prix applicable est celui en vigueur au moment de la commande.
            </p>
          </section>

          {/* 4. Commande */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              4. Commande
            </h2>
            <p>
              La commande est validée après le paiement réussi sur Stripe. Un
              email de confirmation est envoyé au client. Nomade se réserve le
              droit d&apos;annuler une commande en cas de stock insuffisant, de
              prix erroné, ou de suspicion de fraude. Le client sera remboursé
              intégralement.
            </p>
          </section>

          {/* 5. Paiement */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              5. Paiement
            </h2>
            <p>
              Le paiement s&apos;effectue en ligne par carte bancaire via Stripe,
              plateforme de paiement sécurisé. Les données bancaires ne sont
              jamais stockées par Nomade. Le débit est effectué au moment de
              la commande.
            </p>
          </section>

          {/* 6. Livraison */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              6. Livraison
            </h2>
            <p>
              Les commandes sont préparées sous 24 à 48 heures ouvrées et
              livrées en France métropolitaine, Belgique, Luxembourg et Suisse.
              Les délais de livraison sont de 3 à 5 jours ouvrés en standard.
            </p>
            <p className="mt-3">
              La livraison est offerte à partir de 150 € d&apos;achat. Les frais
              de livraison pour les autres pays sont communiqués sur demande.
            </p>
            <p className="mt-3">
              En cas de retard, le client peut contacter Nomade à
              bonjour@nomade.fr. Si le colis est perdu, une enquête est ouverte
              auprès du transporteur. En cas de perte avérée, le client est
              remboursé ou un nouveau produit est expédié.
            </p>
          </section>

          {/* 7. Droit de rétractation */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              7. Droit de rétractation
            </h2>
            <p>
              Conformément à l&apos;article L.221-18 du Code de la consommation,
              le client dispose de 30 jours à compter de la réception de sa
              commande pour exercer son droit de rétractation, sans motif ni
              pénalité.
            </p>
            <p className="mt-3">
              Pour exercer ce droit, le client envoie un email à
              bonjour@nomade.fr. Il dispose ensuite de 14 jours pour renvoyer
              le produit dans son état d&apos;origine.
            </p>
            <p className="mt-3">
              Le remboursement est effectué sous 5 à 7 jours ouvrés après
              réception et vérification du produit.
            </p>
          </section>

          {/* 8. Garantie */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              8. Garantie
            </h2>
            <p>
              Tous les produits bénéficient de la garantie légale de conformité
              (article L.217-4 du Code de la consommation) et de la garantie
              contre les vices cachés (article 1641 du Code civil). Tout défaut
              doit être signalé dans les 48 heures suivant la réception.
            </p>
          </section>

          {/* 9. Responsabilité */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              9. Responsabilité
            </h2>
            <p>
              Nomade ne saurait être tenue responsable des dommages résultant
              d&apos;une mauvaise utilisation du produit. La responsabilité de
              Nomade est limitée au montant de la commande.
            </p>
          </section>

          {/* 10. Données personnelles */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              10. Données personnelles
            </h2>
            <p>
              Les données collectées (nom, email, adresse) sont utilisées
              uniquement pour le traitement de la commande. Elles ne sont ni
              vendues ni cédées à des tiers. Le client dispose d&apos;un droit
              d&apos;accès, de rectification et de suppression en écrivant à
              bonjour@nomade.fr. Voir notre politique de confidentialité pour
              plus d&apos;informations.
            </p>
          </section>

          {/* 11. Litiges */}
          <section>
            <h2 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              11. Litiges et médiation
            </h2>
            <p>
              En cas de litige, le client est invité à contacter Nomade en
              priorité pour trouver une solution amiable. À défaut, le client
              peut recourir à une médiation via la plateforme européenne de
              règlement des litiges : https://ec.europa.eu/consumers/odr.
            </p>
            <p className="mt-3">
              Les présentes CGV sont soumises au droit français. Tout litige
              relève de la compétence des tribunaux français.
            </p>
          </section>

          {/* Date */}
          <p className="text-stone-400 text-sm pt-4">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default CgvClient;