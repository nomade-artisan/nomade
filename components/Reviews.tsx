"use client";

import { useState, useEffect, useCallback } from "react";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

interface ReviewsProps {
  productId: number | string;
}

export default function Reviews({ productId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

const fetchReviews = useCallback(async () => {
  setIsLoading(true);
  try {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setRating(data.rating || 0);
    setTotalReviews(data.totalReviews || 0);
    setDistribution(data.distribution || {});
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoading(false);
  }
}, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_name: newName || "Anonyme",
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur");
      }

      setSuccess(true);
      setNewComment("");
      setNewName("");
      setNewRating(5);
      setShowForm(false);

      // Rafraîchir les avis
      await fetchReviews();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Note globale */}
      <div className="flex items-center gap-6 mb-10">
        <div className="text-center">
          <div className="text-5xl font-light">{rating || "—"}</div>
          <div className="flex gap-0.5 mt-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${star <= Math.round(rating) ? "text-stone-900" : "text-stone-300"}`}
              >
                ●
              </span>
            ))}
          </div>
          <div className="text-xs text-stone-400 mt-1">{totalReviews} avis</div>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-stone-400">
                <span className="w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-700 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton écrire un avis */}
      {!showForm && (
        <div className="text-center mb-10">
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4 transition-colors"
          >
            Écrire un avis
          </button>
        </div>
      )}

      {/* Message succès */}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm text-center mb-6">
          Merci ! Votre avis a été publié.
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-stone-50 rounded-2xl p-6 mb-10 space-y-4">
          <h3 className="text-lg font-light">Votre avis</h3>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded text-sm">{error}</div>
          )}

          {/* Nom */}
          <input
            type="text"
            placeholder="Votre prénom (optionnel)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm bg-white"
          />

          {/* Note */}
          <div>
            <p className="text-sm text-stone-500 mb-2">Note</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= newRating ? "text-stone-900" : "text-stone-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <textarea
            placeholder="Partagez votre expérience..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            required
            minLength={3}
            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm bg-white resize-none"
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newComment.length < 3}
              className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Envoi..." : "Publier"}
            </button>
          </div>
        </form>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 && !showForm && (
        <p className="text-center text-stone-400 text-sm py-8">
          Aucun avis pour le moment. Soyez le premier !
        </p>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-stone-100 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{review.user_name}</span>
                {review.is_verified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Achat vérifié
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-400">
                {new Date(review.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xs ${star <= review.rating ? "text-stone-900" : "text-stone-300"}`}
                >
                  ●
                </span>
              ))}
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}