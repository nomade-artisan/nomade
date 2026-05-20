// app/mentions-legales/MentionsLegalesClient.tsx

"use client";

import { motion } from "framer-motion";

function MentionsLegalesClient() {
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
                Informations légales
              </p>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95]">
                Mentions légales
              </h1>

            </div>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-sm">
              Les informations essentielles
              concernant Nomade et son fonctionnement.
            </p>

          </div>

        </motion.div>

        {/* CONTENT */}

        <div className="space-y-5">

          {/* ÉDITEUR */}

          <LegalBlock
            title="Éditeur du site"
          >

            <Info
              label="Marque"
              value="NOMADE"
            />

            <Info
              label="Entreprise"
              value="Megan cadet"
            />

            <Info
              label="Statut"
              value="Entrepreneur individuel / Micro-entreprise"
            />

            <Info
              label="Adresse"
              value="[Ton adresse professionnelle]"
            />

            <Info
              label="Email"
              value= {contactEmail}
            />

            <Info
              label="Téléphone"
              value="xxx xxx xxx"
            />

            <Info
              label="SIRET"
              value="xxx xxx xxx xxx xx"
            />

            <Info
              label="TVA"
              value="xxx xxx xxx"
            />

            <Info
              label="Code APE"
              value="xxx x xx"
            />

            <Info
              label="Directrice de publication"
              value="Megan cadet"
            />

          </LegalBlock>

          {/* HÉBERGEMENT */}

          <LegalBlock
            title="Hébergement"
          >

            <Info
              label="Hébergeur"
              value="Vercel Inc."
            />

            <Info
              label="Adresse"
              value="340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis"
            />

            <Info
              label="Site web"
              value="https://vercel.com"
            />

          </LegalBlock>

          {/* PROPRIÉTÉ */}

          <LegalBlock
            title="Propriété intellectuelle"
          >

            <p className="text-stone-500 font-light leading-relaxed">
              L’ensemble des contenus présents sur le site NOMADE
              — textes, images, photographies, logos,
              éléments graphiques et identité visuelle —
              est protégé par le Code de la propriété intellectuelle.
            </p>

            <p className="text-stone-500 font-light leading-relaxed mt-4">
              Toute reproduction, représentation,
              modification ou adaptation,
              totale ou partielle,
              est interdite sans autorisation écrite préalable.
            </p>

          </LegalBlock>

          {/* DONNÉES */}

          <LegalBlock
            title="Données personnelles"
          >

            <p className="text-stone-500 font-light leading-relaxed">
              Les données collectées sont utilisées uniquement
              dans le cadre de la relation commerciale :
              commandes, livraison,
              service client et échanges liés aux achats.
            </p>

            <p className="text-stone-500 font-light leading-relaxed mt-4">
              Conformément au RGPD,
              vous disposez d’un droit d’accès,
              de rectification et de suppression
              de vos données personnelles.
            </p>

            <p className="text-stone-500 font-light leading-relaxed mt-4">
              Contact :
              {" "}
              <span className="text-stone-700">
                {contactEmail}
              </span>
            </p>

          </LegalBlock>

          {/* COOKIES */}

          <LegalBlock
            title="Cookies"
          >

            <p className="text-stone-500 font-light leading-relaxed">
              Le site peut utiliser des cookies nécessaires
              à son bon fonctionnement,
              notamment pour la gestion du panier,
              des sessions utilisateurs et de la navigation.
            </p>

            <p className="text-stone-500 font-light leading-relaxed mt-4">
              Aucun cookie publicitaire n’est déposé
              sans consentement préalable.
            </p>

          </LegalBlock>

          {/* RESPONSABILITÉ */}

          <LegalBlock
            title="Responsabilité"
          >

            <p className="text-stone-500 font-light leading-relaxed">
              Malgré le soin apporté au contenu du site,
              l’éditeur ne pourra être tenu responsable
              des éventuelles omissions,
              inexactitudes ou défauts de mise à jour.
            </p>

          </LegalBlock>

          {/* DROIT */}

          <LegalBlock
            title="Droit applicable"
          >

            <p className="text-stone-500 font-light leading-relaxed">
              Les présentes mentions légales
              sont soumises au droit français.
            </p>

            <p className="text-stone-500 font-light leading-relaxed mt-4">
              En cas de litige,
              les tribunaux français seront compétents.
            </p>

          </LegalBlock>

        </div>

      </div>

    </div>
  );
}

export default MentionsLegalesClient;

/* ========================= */

function LegalBlock({
  title,
  children,
}: {
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

      <h2 className="text-lg md:text-xl font-light tracking-tight text-stone-900 mb-6">
        {title}
      </h2>

      <div className="space-y-4">
        {children}
      </div>

    </motion.section>
  );
}

/* ========================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-5 items-start">

      <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light pt-1">
        {label}
      </p>

      <p className="text-stone-600 font-light leading-relaxed break-words">
        {value}
      </p>

    </div>
  );
}