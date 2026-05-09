// app/mentions-legales/MentionsLegalesClient.tsx
"use client";

import { motion } from "framer-motion";

function MentionsLegalesClient() {
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
            Informations légales
          </p>

          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4 text-stone-900">
            Mentions légales
          </h1>

          <p className="text-stone-500 font-light leading-8">
            Conformément aux dispositions des articles 6-III et 19 de la Loi
            n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie
            Numérique (LCEN).
          </p>
        </motion.div>

        <div className="space-y-14 text-stone-600 font-light leading-8">
          {/* Éditeur */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Éditeur du site
            </h2>

            <div className="space-y-3">
              <p>
                <strong>Nom de la marque :</strong> NOMADE
              </p>

              <p>
                <strong>Entreprise :</strong> [Ton nom complet]
              </p>

              <p>
                <strong>Statut :</strong> Entrepreneur individuel / Micro-entreprise
              </p>

              <p>
                <strong>Adresse :</strong> [Ton adresse professionnelle]
              </p>

              <p>
                <strong>Email :</strong> bonjour@nomade.fr
              </p>

              <p>
                <strong>Téléphone :</strong> [Ton numéro]
              </p>

              <p>
                <strong>SIRET :</strong> [À compléter]
              </p>

              <p>
                <strong>TVA intracommunautaire :</strong> [À compléter]
              </p>

              <p>
                <strong>Code APE :</strong> [À compléter]
              </p>

              <p>
                <strong>Directeur de la publication :</strong> [Ton nom complet]
              </p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Hébergement
            </h2>

            <div className="space-y-3">
              <p>
                <strong>Hébergeur :</strong> Vercel Inc.
              </p>

              <p>
                <strong>Adresse :</strong> 340 S Lemon Ave #4133,
                Walnut, CA 91789, États-Unis
              </p>

              <p>
                <strong>Site web :</strong> https://vercel.com
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Propriété intellectuelle
            </h2>

            <p>
              L&apos;ensemble du contenu présent sur le site NOMADE,
              incluant de manière non limitative les textes, images,
              photographies, vidéos, logos, éléments graphiques,
              design, identité visuelle et contenus éditoriaux,
              est protégé par les dispositions du Code de la propriété
              intellectuelle.
            </p>

            <p className="mt-4">
              Toute reproduction, représentation, modification,
              publication ou adaptation, totale ou partielle,
              des éléments du site, quel que soit le moyen ou
              le procédé utilisé, est interdite sans autorisation
              écrite préalable.
            </p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Données personnelles
            </h2>

            <p>
              Les données personnelles collectées sur le site sont
              exclusivement utilisées dans le cadre de la relation
              commerciale avec le client : traitement des commandes,
              livraison, service client et communication liée aux achats.
            </p>

            <p className="mt-4">
              Conformément au Règlement Général sur la Protection
              des Données (RGPD) et à la loi Informatique et Libertés,
              vous disposez d&apos;un droit d&apos;accès, de rectification,
              de suppression et d&apos;opposition concernant vos données
              personnelles.
            </p>

            <p className="mt-4">
              Pour exercer ces droits, vous pouvez contacter :
              bonjour@nomade.fr
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Cookies
            </h2>

            <p>
              Le site NOMADE peut utiliser des cookies nécessaires
              à son bon fonctionnement, notamment pour la gestion
              du panier, de la navigation et des sessions utilisateurs.
            </p>

            <p className="mt-4">
              Aucun cookie publicitaire ou de suivi marketing
              n&apos;est déposé sans le consentement préalable
              de l&apos;utilisateur.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Responsabilité
            </h2>

            <p>
              L&apos;éditeur du site s&apos;efforce de fournir des
              informations aussi précises que possible. Toutefois,
              il ne pourra être tenu responsable des omissions,
              inexactitudes ou carences dans la mise à jour
              des contenus.
            </p>

            <p className="mt-4">
              L&apos;utilisateur reconnaît utiliser les informations
              présentes sur le site sous sa responsabilité exclusive.
            </p>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-xl font-light text-stone-900 mb-5 tracking-wide">
              Droit applicable
            </h2>

            <p>
              Les présentes mentions légales sont soumises au droit français.
            </p>

            <p className="mt-4">
              En cas de litige et à défaut de résolution amiable,
              les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

export default MentionsLegalesClient;