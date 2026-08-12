import { useState, useEffect, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<void> | null = null;
const MAX_INPUT_SIZE = 80 * 1024 * 1024;

function resetFFmpeg() {
  ffmpeg = null;
  loadingPromise = null;
}

async function getFFmpeg() {
  if (ffmpeg) return ffmpeg;
  if (!loadingPromise) {
    ffmpeg = new FFmpeg();

    // Activer les logs pour le debug
    ffmpeg.on("log", ({ message }) => {
      console.log("[ffmpeg]", message);
    });

    loadingPromise = (async () => {
      await ffmpeg!.load({
        coreURL: "/ffmpeg/ffmpeg-core.js",
        wasmURL: "/ffmpeg/ffmpeg-core.wasm",
      });
    })();
  }
  try {
    await loadingPromise;
  } catch {
    loadingPromise = null;
    ffmpeg = null;
    throw new Error("Échec du chargement de ffmpeg.wasm");
  }
  return ffmpeg!;
}

interface UseVideoCompressorReturn {
  ready: boolean;
  error: string | null;
  compressing: boolean;
  compress: (file: File) => Promise<Blob | null>;
}

export function useVideoCompressor(): UseVideoCompressorReturn {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getFFmpeg()
      .then(() => {
        if (cancelled) return;
        setReady(true);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setReady(false);
        setError(e.message || "Erreur inconnue");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const compress = useCallback(async (file: File): Promise<Blob | null> => {
    setCompressing(true);
    try {
      if (file.size > MAX_INPUT_SIZE) {
        console.warn("Video too large for in-browser compression, uploading original file.");
        return file;
      }

      const instance = await getFFmpeg();

      const inputName = `input_${Date.now()}.${file.name.split(".").pop() || "mp4"}`;
      const outputName = `output_${Date.now()}.webm`;

      await instance.writeFile(inputName, await fetchFile(file));

      // Compression plus légère pour limiter la consommation mémoire de ffmpeg.wasm.
      await instance.exec([
  "-i",
  inputName,
  "-vf",
  "scale=960:-2",
  "-c:v",
  "libvpx-vp8",
  "-crf",
  "20",
  "-b:v",
  "0",
  "-an",
  outputName,
]);

      const data = await instance.readFile(outputName);

      // Vérifier que des données ont bien été produites
      if (!data || data.length === 0) {
        throw new Error("Le fichier compressé est vide – vérifiez les logs ffmpeg.");
      }

      const blob = new Blob([data as BlobPart], { type: "video/webm" });

      // Nettoyage
      try { await instance.deleteFile(inputName); } catch {}
      try { await instance.deleteFile(outputName); } catch {}

      return blob;
    } catch (err) {
      console.error("Compression échouée", err);
      resetFFmpeg();
      return file;
    } finally {
      setCompressing(false);
    }
  }, []);

  return { ready, error, compressing, compress };
}