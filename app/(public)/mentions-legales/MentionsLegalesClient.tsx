"use client";

import { motion } from "framer-motion";

function MentionsLegalesClient() {
  const contactEmail = "contact@nomade-artisan.fr";

  return (
    <div className="bg-stone-50 min-h-screen pt-16">
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
            concernant la Maison NOMADE et
            l'univers SCOLTA.
          </p>

        </div>

      </motion.div>

      {/* CONTENT */}

        <div className="space-y-5">

          {/* ÉDITEUR */}

          <Section number="01" title="Éditeur du site">

            <Info
              label="Maison"
              value="NOMADE"
            />

            <Info
              label="Nom utilisé pour l'univers"
              value="SCOLTA"
            />

            <Info
              label="Nom"
              value="Megan Cadet"
            />

            <Info
              label="Statut"
              value="Entrepreneur individuel"
            />

            <Info
              label="Nom commercial"
              value="Nomade"
            />

            <Info
              label="Adresse"
              value="30100 Alès, France"
            />

            <Info
              label="Email"
              value={contactEmail}
            />

            <Info
              label="SIREN"
              value="105 460 646"
            />

            <Info
              label="SIRET"
              value="105 460 646 00026"
            />

            <Info
              label="N° TVA intracommunautaire"
              value="FR57105460646"
            />

            <Info
              label="Code APE"
              value="1512Z"
            />

            <Info
              label="Activité"
              value="Fabrication d'articles de voyage, de maroquinerie et de sellerie"
            />

            <Info
              label="Directrice de publication"
              value="Megan Cadet"
            />

          </Section>

          {/* HÉBERGEMENT */}

          <Section number="02" title="Hébergement">

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

          </Section>

          {/* PROPRIÉTÉ */}

          <Section number="03" title="Propriété intellectuelle">

          <p className="text-stone-500 font-light leading-relaxed">
            L’ensemble des contenus présents sur le site NOMADE, notamment
            les textes, photographies, illustrations, créations graphiques,
            logos et éléments visuels, est protégé par les dispositions
            applicables du Code de la propriété intellectuelle lorsqu'il
            remplit les conditions de protection prévues par la loi.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Toute reproduction, représentation, modification ou adaptation,
            totale ou partielle, des contenus présents sur le site est
            interdite sans autorisation préalable, sauf dans les cas prévus
            par la loi.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Le nom NOMADE est utilisé dans le cadre de l’activité commerciale
            de l’entreprise. SCOLTA est utilisé pour désigner l’univers et
            les produits développés par la Maison NOMADE.
          </p>

          </Section>

          {/* DONNÉES */}

          <Section number="04" title="Données personnelles">

          <p className="text-stone-500 font-light leading-relaxed">
            Les données collectées sont utilisées dans le cadre de la
            relation commerciale, notamment pour les commandes, la livraison,
            le service client et les échanges liés aux achats.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Conformément au RGPD, vous disposez, selon les conditions prévues
            par la réglementation, de droits d’accès, de rectification,
            d’effacement, d’opposition et de limitation du traitement de
            vos données personnelles.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Contact :
            {" "}
            <span className="text-stone-700">
              {contactEmail}
            </span>
          </p>

          </Section>

          {/* COOKIES */}

          <Section number="05" title="Cookies">

          <p className="text-stone-500 font-light leading-relaxed">
            Le site peut utiliser des cookies nécessaires à son bon
            fonctionnement, notamment pour la gestion du panier, des sessions
            utilisateurs et de la navigation.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Les cookies non nécessaires au fonctionnement du site sont
            déposés et utilisés conformément aux règles applicables en
            matière de consentement.
          </p>

          </Section>

          {/* RESPONSABILITÉ */}

          <Section number="06" title="Responsabilité">

          <p className="text-stone-500 font-light leading-relaxed">
            Malgré le soin apporté au contenu du site, l’éditeur s’efforce
            d’assurer l’exactitude et la mise à jour des informations
            publiées.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Toutefois, des erreurs, omissions ou interruptions temporaires
            peuvent survenir. L’éditeur ne pourra être tenu responsable des
            éventuelles conséquences liées à ces situations.
          </p>

          </Section>

          {/* DROIT */}

          <Section number="07" title="Droit applicable">

          <p className="text-stone-500 font-light leading-relaxed">
            Les présentes mentions légales sont soumises au droit français.
          </p>

          <p className="text-stone-500 font-light leading-relaxed mt-4">
            Les règles applicables en matière de règlement des litiges
            dépendent notamment de la qualité du visiteur ou du client et
            des dispositions légales en vigueur.
          </p>

          </Section>

          <div className="pt-4">
            <p className="text-stone-400 text-sm font-light">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default MentionsLegalesClient;

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
        <div className="shrink-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light pt-1">
            {number}
          </p>
        </div>

        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-light tracking-tight text-stone-900 mb-5">
            {title}
          </h2>

          <div className="space-y-4 text-stone-500 font-light leading-relaxed">
            {children}
          </div>
        </div>
      </div>

    </motion.section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light pt-1">
        {label}
      </p>

      <p className="text-stone-600 font-light leading-relaxed wrap-break-word">
        {value}
      </p>

    </div>
  );
}