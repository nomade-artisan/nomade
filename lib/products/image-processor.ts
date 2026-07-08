import imageCompression from "browser-image-compression";

interface ProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: ProcessOptions = {
  maxWidth: 2000,      // Max 2000px (suffisant pour du e-commerce)
  maxHeight: 2000,
  quality: 0.85,       // 85% qualité = bon rapport qualité/poids
  maxSizeMB: 0.5,      // Max 500KB par image
};

/**
 * Convertit et compresse une image en WebP
 */
export async function processImage(
  file: File,
  options: ProcessOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Étape 1 : Redimensionner si nécessaire
    const resizedFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(mergedOptions.maxWidth!, mergedOptions.maxHeight!),
      useWebWorker: true,        // Utilise un Web Worker pour ne pas bloquer l'UI
      fileType: "image/webp",    // Force la conversion en WebP
      initialQuality: mergedOptions.quality,
    });

    // Étape 2 : Compresser à la taille cible
    const compressedFile = await imageCompression(resizedFile, {
      maxSizeMB: mergedOptions.maxSizeMB,
      useWebWorker: true,
      fileType: "image/webp",
      maxIteration: 10,          // Nombre max de tentatives de compression
    });

    // Renommer le fichier en .webp
    const webpFile = new File(
      [compressedFile],
      file.name.replace(/\.[^/.]+$/, ".webp"),
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    );

    return webpFile;
  } catch (error) {
    console.error("Error processing image:", error);
    // Fallback : retourner le fichier original
    return file;
  }
}

/**
 * Traite plusieurs images en parallèle
 */
export async function processImages(files: File[]): Promise<File[]> {
  const processed = await Promise.all(
    files.map((file) => processImage(file))
  );
  return processed;
}

/**
 * Calcule le poids total économisé
 */
export function getCompressionStats(
  originals: File[],
  compressed: File[]
): {
  originalSize: string;
  compressedSize: string;
  savedPercent: number;
} {
  const originalSize = originals.reduce((acc, f) => acc + f.size, 0);
  const compressedSize = compressed.reduce((acc, f) => acc + f.size, 0);
  const savedPercent = Math.round(
    ((originalSize - compressedSize) / originalSize) * 100
  );

  return {
    originalSize: formatBytes(originalSize),
    compressedSize: formatBytes(compressedSize),
    savedPercent,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}