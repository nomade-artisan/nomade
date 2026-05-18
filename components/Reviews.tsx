// components/Reviews.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const PAGE_SIZE = 5;

function Reviews({ productId }: { productId: number | string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "best" | "worst">("recent");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then((res) => res.json())
      .then((data) => setReviews(data || []));
  }, [productId, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);

    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        customer_name: form.name,
        rating: form.rating,
        comment: form.comment,
      }),
    });

    setForm({ name: "", rating: 5, comment: "" });
    setSubmitted(!submitted);
    setShowForm(false);
    setPage(1);
    setLoading(false);
  };

  // Tri
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "best") return b.rating - a.rating;
    if (sortBy === "worst") return a.rating - b.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / PAGE_SIZE);
  const paginatedReviews = sortedReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <div className="grid md:grid-cols-5 gap-8">
      {/* Colonne gauche : résumé */}
      <div className="md:col-span-2 space-y-5">
        {avgRating ? (
          <div className="bg-white border border-stone-100 rounded-xl p-5">
            <p className="text-4xl font-light text-stone-800 text-center">{avgRating}</p>
            <div className="flex justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${star <= Math.round(Number(avgRating)) ? "text-yellow-500" : "text-stone-200"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-xs text-stone-400 font-light text-center">{reviews.length} avis</p>

            {/* Distribution */}
            <div className="mt-4 space-y-1.5">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-stone-400">{d.star}</span>
                  <span className="text-yellow-500">★</span>
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-stone-400">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-100 rounded-xl p-5 text-center">
            <p className="text-sm text-stone-400 font-light">Aucun avis pour le moment.</p>
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full text-sm border border-stone-200 rounded-xl py-3 px-4 text-stone-500 hover:text-stone-800 hover:border-stone-400 font-light transition-colors"
        >
          {showForm ? "Annuler" : "Écrire un avis"}
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              onSubmit={handleSubmit}
            >
              <div className="space-y-3 bg-white border border-stone-100 rounded-xl p-4">
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:border-stone-400"
                  required
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-400">Note :</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className={`text-lg transition-colors ${star <= form.rating ? "text-yellow-500" : "text-stone-300 hover:text-yellow-400"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Votre avis (optionnel)"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={2}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:border-stone-400 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-sm bg-stone-800 text-white py-2 rounded-full font-light hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "..." : "Publier"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Colonne droite : liste */}
      <div className="md:col-span-3 space-y-4">
        {/* Tri */}
        {reviews.length > 1 && (
          <div className="flex gap-2">
            {[
              { key: "recent", label: "Récents" },
              { key: "best", label: "Meilleurs" },
              { key: "worst", label: "Moins bons" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setSortBy(opt.key as any); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-full border font-light transition-colors ${sortBy === opt.key ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {paginatedReviews.length === 0 ? (
          <p className="text-stone-400 text-sm font-light text-center py-8">
            Soyez le premier à donner votre avis.
          </p>
        ) : (
          paginatedReviews.map((review) => (
            <div key={review.id} className="bg-white border border-stone-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium text-stone-700">{review.customer_name}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-[11px] ${star <= review.rating ? "text-yellow-500" : "text-stone-200"}`}>★</span>
                  ))}
                </div>
                <span className="text-[10px] text-stone-300 ml-auto">
                  {new Date(review.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-stone-500 font-light leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="text-xs text-stone-400 hover:text-stone-800 disabled:opacity-30">←</button>
            <span className="text-xs text-stone-400">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="text-xs text-stone-400 hover:text-stone-800 disabled:opacity-30">→</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;