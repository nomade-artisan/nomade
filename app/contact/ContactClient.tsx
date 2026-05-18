// app/contact/ContactClient.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setError(
        "Tous les champs sont nécessaires."
      );

      return;
    }

    if (
      !formData.email.includes("@")
    ) {
      setError(
        "Veuillez entrer un email valide."
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            formData
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Une erreur est survenue."
        );
      }

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setTimeout(
        () => setSubmitted(false),
        5000
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Impossible d'envoyer le message."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-[64px]">

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-10">

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
          className="mb-10 md:mb-14"
        >

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div>

              <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 font-light mb-4">
                Contact
              </p>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95]">
                Quelques mots
                <br />
                suffisent.
              </h1>

            </div>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-sm">
              Une question,
              une idée,
              ou simplement une conversation.
            </p>

          </div>

        </motion.div>

        {/* CONTENT */}

        <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">

          {/* FORM */}

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
              delay: 0.04,
              duration: 0.35,
            }}
          >

            <div className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] p-5 md:p-7">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-light mb-2.5"
                  >
                    Nom
                  </label>

                  <input
                    type="text"
                    id="name"
                    value={
                      formData.name
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name:
                          e.target.value,
                      })
                    }
                    placeholder="Votre nom"
                    className="w-full bg-transparent border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-light text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-light mb-2.5"
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    id="email"
                    value={
                      formData.email
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
                    }
                    placeholder="vous@exemple.fr"
                    className="w-full bg-transparent border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-light text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
                  />

                </div>

                {/* MESSAGE */}

                <div>

                  <label
                    htmlFor="message"
                    className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-light mb-2.5"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    rows={6}
                    value={
                      formData.message
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message:
                          e.target.value,
                      })
                    }
                    placeholder="Quelques mots..."
                    className="w-full bg-transparent border border-stone-200 rounded-[24px] px-4 py-4 text-sm font-light text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                  />

                </div>

                {/* ERROR */}

                {error && (

                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="text-red-400 text-sm font-light"
                  >
                    {error}
                  </motion.p>

                )}

                {/* BUTTON */}

                <div className="pt-1">

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      submitted
                    }
                    className={`px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light transition-all duration-300
                      ${
                        submitted
                          ? "bg-emerald-700 text-white"
                          : loading
                          ? "bg-stone-300 text-white cursor-wait"
                          : "bg-stone-900 text-white hover:bg-stone-800"
                      }`}
                  >

                    {submitted
                      ? "Message envoyé"
                      : loading
                      ? "Envoi..."
                      : "Envoyer"}

                  </button>

                </div>

              </form>

            </div>

          </motion.div>

          {/* RIGHT */}

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
              delay: 0.08,
              duration: 0.35,
            }}
            className="space-y-5"
          >

            {/* IMAGE */}

            <div className="rounded-[32px] overflow-hidden aspect-[4/5] bg-stone-100">

              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
                alt=""
                className="w-full h-full object-cover"
              />

            </div>

            {/* INFOS */}

            <div className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[28px] p-5 md:p-6">

              <div className="grid grid-cols-3 gap-5">

                {/* EMAIL */}

                <div>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                    Email
                  </p>

                  <a
                    href="mailto:bonjour@nomade.fr"
                    className="text-stone-700 hover:text-black transition-colors font-light text-sm leading-relaxed break-words"
                  >
                    bonjour@nomade.fr
                  </a>

                </div>

                {/* RESPONSE */}

                <div>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                    Réponse
                  </p>

                  <p className="text-stone-500 font-light text-sm leading-relaxed">
                    Sous 24 à 48h.
                    <br />
                    Avec attention.
                  </p>

                </div>

                {/* SOCIALS */}

                <div>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                    Suivre
                  </p>

                  <div className="flex flex-col gap-2">

                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-500 hover:text-black transition-colors text-sm font-light"
                    >
                      Instagram
                    </a>

                    <a
                      href="https://pinterest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-500 hover:text-black transition-colors text-sm font-light"
                    >
                      Pinterest
                    </a>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}

export default ContactClient;