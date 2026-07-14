"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import type { Collection, CollectionFormState } from "@/lib/collections/types";

// FFmpeg.wasm
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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
  const [compressing, setCompressing] = useState(false);

  const ffmpegRef = useRef<FFmpeg | null>(null);

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

  // Aperçu image existante
  const currentImageUrl = initialData?.image_path
    ? supabase.storage.from("collections").getPublicUrl(initialData.image_path).data.publicUrl
    : null;

  // Charger FFmpeg une seule fois
  useEffect(() => {
    const load = async () => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm",
          "application/wasm"
        ),
      });
      ffmpegRef.current = ffmpeg;
    };
    load();
  }, []);

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : generateSlug(name),
    }));
  }

  /**
   * Compresse une vidéo en WebM avec FFmpeg.wasm et retourne un Blob
   */
  async function compressVideo(file: File): Promise<Blob> {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) throw new Error("FFmpeg n'est pas encore prêt.");

    setCompressing(true);
    try {
      // Écrire le fichier original
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));

      // Compression : VP8, résolution max 1280x720, qualité correcte
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-c:v", "libvpx",
        "-crf", "30",
        "-b:v", "1M",
        "-c:a", "libvorbis",
        "-vf", "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease",
        "output.webm",
      ]);

      const data = await ffmpeg.readFile("output.webm");
return new Blob([new Uint8Array(data)], { type: "video/webm" });
    } finally {
      setCompressing(false);
      // Nettoyage
      try { await ffmpeg.deleteFile("input.mp4"); } catch {}
      try { await ffmpeg.deleteFile("output.webm"); } catch {}
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload image (via API ou direct, on garde l'existant)
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

      // 2. Compression vidéo côté client, puis upload via API
      let finalVideoPath = form.video_path;
      if (videoFile) {
        const compressedBlob = await compressVideo(videoFile);

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

          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>

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

          {/* Vidéo avec compression navigateur puis API */}
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
            {compressing && (
              <p className="text-xs text-blue-600 mt-1">Compression en cours…</p>
            )}
          </div>

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