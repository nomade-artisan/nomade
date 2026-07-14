"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import type { Collection, CollectionFormState } from "@/lib/collections/types";

// Hook personnalisé pour la compression vidéo
import { useVideoCompressor } from "@/lib/video/compressor";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: Collection;
}

export default function CollectionForm({ initialData }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupération des états et fonctions depuis le hook
  const {
    ready: ffmpegReady,
    error: ffmpegError,
    compressing,
    compress,
  } = useVideoCompressor();

  const [form, setForm] = useState<CollectionFormState>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    image_path: initialData?.image_path || "",
    video_path: initialData?.video_path || "",
    created_at: initialData?.created_at || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Aperçu de l'image existante
  const currentImageUrl = initialData?.image_path
    ? supabase.storage.from("collections").getPublicUrl(initialData.image_path).data.publicUrl
    : null;

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : generateSlug(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload image
      let finalImagePath = form.image_path;
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: imageFormData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erreur upload image");
        }

        const { fileName } = await res.json();
        finalImagePath = fileName;
      }

      // 2. Compression vidéo + upload
      let finalVideoPath = form.video_path;
      if (videoFile) {
        if (ffmpegError) throw new Error(ffmpegError);

        const compressedBlob = await compress(videoFile);
        if (!compressedBlob) throw new Error("La compression a échoué.");

        const videoFormData = new FormData();
        videoFormData.append("video", compressedBlob, "video.webm");

        const uploadRes = await fetch("/api/admin/upload-video", {
          method: "POST",
          body: videoFormData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Erreur upload vidéo");
        }

        const { fileName } = await uploadRes.json();
        finalVideoPath = fileName;
      }

      // 3. Sauvegarde des données
      const response = await fetch("/api/admin/collections", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(initialData ? { id: initialData.id } : {}),
          name: form.name,
          slug: form.slug,
          description: form.description,
          image_path: finalImagePath,
          video_path: finalVideoPath,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur sauvegarde");
      }

      router.push("/admin/collections");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Modifier la collection" : "Nouvelle collection"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium">Image de la collection</label>
            {currentImageUrl && (
              <div className="mb-2">
                <img
                  src={currentImageUrl}
                  alt="Aperçu"
                  className="h-32 w-auto object-cover rounded border"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Vidéo avec compression navigateur */}
          <div>
            <label className="text-sm font-medium">Vidéo (optionnelle)</label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              La vidéo sera compressée en WebM dans le navigateur, puis uploadée via l’API.
            </p>
            {!ffmpegReady && !ffmpegError && (
              <p className="text-xs text-amber-700 mt-1">
                Préparation du moteur de compression…
              </p>
            )}
            {ffmpegError && (
              <p className="text-xs text-red-600 mt-1">{ffmpegError}</p>
            )}
            {compressing && (
              <p className="text-xs text-blue-600 mt-1">Compression en cours…</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || compressing}>
              {isLoading || compressing ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}