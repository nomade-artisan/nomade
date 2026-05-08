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
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation côté client
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-stone-50"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
            Une question ?
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            Parlons-nous
          </h1>
          <p className="text-stone-500 font-light max-w-md mx-auto">
            On vous lit toujours. Sous 24 heures, une réponse.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-light text-stone-500 mb-2"
                >
                  Votre nom
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm font-light focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="Comment vous appelez-vous ?"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-light text-stone-500 mb-2"
                >
                  Votre email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm font-light focus:outline-none focus:border-stone-400 transition-colors"
                  placeholder="vous@exemple.fr"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-light text-stone-500 mb-2"
                >
                  Votre message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm font-light focus:outline-none focus:border-stone-400 transition-colors resize-none"
                  placeholder="Dites-nous tout..."
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

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || submitted}
                className={`w-full py-4 rounded-xl text-sm tracking-wider font-light transition-colors ${
                  submitted
                    ? "bg-emerald-600 text-white"
                    : loading
                    ? "bg-stone-300 text-white cursor-wait"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
              >
                {submitted
                  ? "✓ Message envoyé"
                  : loading
                  ? "Envoi..."
                  : "Envoyer le message"}
              </motion.button>
            </form>
          </motion.div>

          {/* Infos + Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-10"
          >
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-base font-light tracking-wide mb-2">
                  Écrivez-nous
                </h3>
                <a
                  href="mailto:bonjour@nomade.fr"
                  className="text-stone-500 hover:text-stone-800 text-sm font-light transition-colors"
                >
                  bonjour@nomade.fr
                </a>
              </div>

              <div>
                <h3 className="text-base font-light tracking-wide mb-2">
                  Délai de réponse
                </h3>
                <p className="text-stone-500 text-sm font-light">
                  Sous 24 à 48 heures. Toujours avec soin.
                </p>
              </div>

              <div>
                <h3 className="text-base font-light tracking-wide mb-2">
                  Suivez la route
                </h3>
                <div className="flex gap-5 text-stone-400 text-sm font-light">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-700 transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-700 transition-colors"
                  >
                    Pinterest
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default ContactClient;