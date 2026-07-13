"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

const contactImage = (filename: string) =>
  supabase.storage.from("contact").getPublicUrl(filename).data.publicUrl;

function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Tous les champs sont nécessaires.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Veuillez entrer un email valide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || "Impossible d'envoyer le message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* En‑tête */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20 md:mb-28"
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 font-light mb-3">
            Contact
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-stone-900 leading-[1.05]">
            Échangeons
          </h1>
          <div className="w-12 h-px bg-stone-300 mx-auto mt-6" />
          <p className="text-stone-400 font-light text-base md:text-lg max-w-xs mx-auto mt-5">
            Une question, une envie, un projet.
          </p>
        </motion.div>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Formulaire (3/5) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] uppercase tracking-[0.25em] text-stone-400 font-light mb-2"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Votre nom"
                  className="w-full bg-transparent border-b border-stone-200 py-3.5 text-sm font-light text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] uppercase tracking-[0.25em] text-stone-400 font-light mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="vous@exemple.fr"
                  className="w-full bg-transparent border-b border-stone-200 py-3.5 text-sm font-light text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-[10px] uppercase tracking-[0.25em] text-stone-400 font-light mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Votre message..."
                  className="w-full bg-transparent border-b border-stone-200 py-3.5 text-sm font-light text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm font-light"
                >
                  {error}
                </motion.p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || submitted}
                  className={`px-10 py-3.5 rounded-full text-[11px] uppercase tracking-[0.25em] font-light transition-all duration-300 ${
                    submitted
                      ? "bg-emerald-700 text-white"
                      : loading
                      ? "bg-stone-300 text-white cursor-wait"
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  }`}
                >
                  {submitted ? "Message envoyé" : loading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Côté droit (2/5) : image + coordonnées */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 space-y-10"
          >
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-100 shadow-sm">
              <Image
                src={contactImage("contact.webp")}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>

            {/* Coordonnées */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-light mb-1.5">
                  Email
                </p>
                <a
                  href="mailto:contact@nomade-artisan.fr"
                  className="text-stone-700 hover:text-black transition-colors font-light text-sm"
                >
                  contact@nomade-artisan.fr
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-light mb-1.5">
                  Réponse
                </p>
                <p className="text-stone-500 font-light text-sm leading-relaxed">
                  Sous 24 à 48h
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-light mb-1.5">
                  Suivre
                </p>
                <div className="flex gap-6">
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ContactClient;