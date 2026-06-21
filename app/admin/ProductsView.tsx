// app/admin/ProductsView.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/db";
import { Product, stockBadge } from "./AdminClient";
import { Search, Plus, Upload, X, Trash2, Pencil, Loader2 } from "lucide-react";

interface Props {
  products: Product[];
  fetchProducts: () => void;
}

// ─── Helper WebP (défini hors composant pour être stable) ──────
const convertToWebP = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Échec de la conversion WebP"));
              return;
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: "image/webp",
            });
            resolve(webpFile);
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = () => reject(new Error("Impossible de charger l'image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsDataURL(file);
  });
};

// ─── Composant ────────────────────────────────────────────────
export default function ProductsView({ products, fetchProducts }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState<Record<number, boolean>>({});
  const [converting, setConverting] = useState(false); // loader conversion

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Cuir",
    stock: "0",
    description: "",
    details: "",
    image: null as File | null,
    imagePreview: "",
  });

  // Écouter l'événement d'ouverture depuis la topbar
  useEffect(() => {
    const handler = () => setShowCreateModal(true);
    window.addEventListener("open-create-product", handler);
    return () => window.removeEventListener("open-create-product", handler);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const t = searchTerm.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t),
    );
  }, [products, searchTerm]);

  const updateStock = async (productId: number, newStock: number) => {
    if (newStock < 0) return;
    await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    fetchProducts();
  };

  // ─── SUPPRIMER UN PRODUIT (avec nettoyage du storage) ──────
  const deleteProduct = async (productId: number) => {
    if (!window.confirm("Supprimer ce produit ?")) return;

    // 1. Récupérer les URLs des images du produit
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();

    if (fetchError) {
      alert("Erreur lors de la récupération des images");
      return;
    }

    // 2. Supprimer les fichiers du bucket Supabase Storage
    if (product?.images && product.images.length > 0) {
      const fileNames = product.images
        .map((url: string) => url.split("/").pop()) // extraire le nom du fichier
        .filter(Boolean);

      if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove(fileNames);
        if (storageError) {
          console.warn("Erreur lors de la suppression des fichiers :", storageError);
        }
      }
    }

    // 3. Supprimer l'entrée de la base de données
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      alert("Erreur lors de la suppression du produit");
      return;
    }

    fetchProducts();
  };

  // ─── CRÉER UN PRODUIT ──────────────────────────────────────
  const handleCreateProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.description ||
      !newProduct.details ||
      !newProduct.image
    ) {
      alert("Tous les champs * sont obligatoires");
      return;
    }

    setConverting(true);
    let fileToUpload: File = newProduct.image;
    try {
      fileToUpload = await convertToWebP(newProduct.image, 0.8);
    } catch (e) {
      console.warn("Conversion WebP impossible, utilisation du fichier original");
    }
    setConverting(false);

    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, fileToUpload);
    if (uploadError) {
      console.error(uploadError);
      alert(uploadError.message);
      return;
    }

    const { data: url } = supabase.storage.from("products").getPublicUrl(fileName);
    const det = newProduct.details.split("\n").filter((d) => d.trim());

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock) || 0,
          images: [url.publicUrl],
          description: newProduct.description,
          details: det,
          rating: 0,
          reviews: 0,
          is_new: true,
          related_products: [],
        },
      ]);

    console.log("INSERT RESULT", data);
    console.log("INSERT ERROR", error);

    if (error) {
      alert(error.message);
      return;
    }

    setNewProduct({
      name: "",
      price: "",
      category: "Cuir",
      stock: "0",
      description: "",
      details: "",
      image: null,
      imagePreview: "",
    });
    setShowCreateModal(false);
    fetchProducts();
  };

  // ─── ÉDITER UN PRODUIT ─────────────────────────────────────
  const handleEditProduct = async () => {
    if (!editingProduct) return;
    await supabase
      .from("products")
      .update({
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        category: editingProduct.category,
        description: editingProduct.description,
        details: editingProduct.details,
      })
      .eq("id", editingProduct.id);
    setShowEditModal(false);
    setEditingProduct(null);
    fetchProducts();
  };

  // ─── AJOUTER UNE IMAGE À UN PRODUIT EXISTANT ───────────────
  const uploadImageToProduct = async (productId: number, file: File) => {
    setUploadingImage((prev) => ({ ...prev, [productId]: true }));

    let fileToUpload: File = file;
    try {
      fileToUpload = await convertToWebP(file, 0.8);
    } catch (e) {
      console.warn("Conversion WebP impossible, utilisation du fichier original");
    }

    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, fileToUpload);
    if (uploadError) {
      console.error(uploadError);
      alert("Erreur upload");
      setUploadingImage((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    const { data: url } = supabase.storage.from("products").getPublicUrl(fileName);
    const { data: product } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();
    const updatedImages = [...(product?.images || []), url.publicUrl];
    await supabase.from("products").update({ images: updatedImages }).eq("id", productId);

    setUploadingImage((prev) => ({ ...prev, [productId]: false }));
    fetchProducts();
  };

  // ─── SUPPRIMER UNE IMAGE ───────────────────────────────────
  const removeImage = async (productId: number, imageUrl: string) => {
    const { data: product } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();
    const updatedImages = (product?.images || []).filter((img: string) => img !== imageUrl);
    await supabase.from("products").update({ images: updatedImages }).eq("id", productId);
    const fileName = imageUrl.split("/").pop();
    if (fileName) await supabase.storage.from("products").remove([fileName]);
    fetchProducts();
  };

  // ─── RENDU ─────────────────────────────────────────────────
  return (
    <div>
      {/* Search */}
      <div className="relative mb-4 md:mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 md:h-14 rounded-full bg-white pl-12 pr-6 text-sm border border-black/[0.05] outline-none"
        />
      </div>

      {/* Mobile create button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="md:hidden w-full h-12 rounded-full bg-stone-900 text-white text-xs uppercase tracking-[0.18em] mb-6 flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Nouveau produit
      </button>

      {/* Products list */}
      <div className="space-y-3 md:space-y-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-[20px] md:rounded-[28px] p-4 md:p-5">
            <div className="flex gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0">
                {product.images?.[0] && (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="text-sm md:text-[15px] font-light truncate text-stone-900">
                      {product.name}
                    </p>
                    <p className="text-[11px] md:text-xs text-stone-400 mt-0.5">
                      {product.category} — {product.price}€
                    </p>
                  </div>
                </div>
                <p className="text-[11px] md:text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3 md:mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <button
                      onClick={() => updateStock(product.id, product.stock - 1)}
                      disabled={product.stock <= 0}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-stone-200 text-xs md:text-sm disabled:opacity-30"
                    >
                      −
                    </button>
                    <span
                      className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full ${stockBadge(product.stock)}`}
                    >
                      {product.stock === 0 ? "Rupture" : product.stock}
                    </span>
                    <button
                      onClick={() => updateStock(product.id, product.stock + 1)}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-stone-200 text-xs md:text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <label className="cursor-pointer text-[10px] md:text-xs text-stone-400 hover:text-stone-700">
                      {uploadingImage[product.id] ? "..." : "+ Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) await uploadImageToProduct(product.id, file);
                        }}
                        disabled={uploadingImage[product.id]}
                      />
                    </label>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowEditModal(true);
                      }}
                      className="h-8 md:h-9 px-3 md:px-4 rounded-full bg-stone-900 text-white text-[10px] uppercase tracking-[0.18em] flex items-center gap-1"
                    >
                      <Pencil size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="h-8 md:h-9 px-3 md:px-4 rounded-full border border-red-200 text-red-500 text-[10px] uppercase tracking-[0.18em] flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== MODAL CRÉATION ==================== */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-end md:items-center justify-center"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-xl bg-white rounded-t-[24px] md:rounded-[32px] p-4 md:p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-lg md:text-2xl font-light">Nouveau produit</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 -mr-2">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom du produit *"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full h-10 md:h-11 rounded-xl border px-4 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Prix (€) *"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="h-10 md:h-11 rounded-xl border px-4 text-sm"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="h-10 md:h-11 rounded-xl border px-4 text-sm bg-white"
                >
                  <option>Cuir</option>
                  <option>Minimal</option>
                  <option>Bandoulière</option>
                  <option>Aventure</option>
                  <option>Accessoires</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="Stock initial"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full h-10 md:h-11 rounded-xl border px-4 text-sm"
              />
              <textarea
                placeholder="Description *"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full min-h-[70px] md:min-h-[80px] rounded-xl border px-4 py-3 text-sm resize-none"
              />
              <textarea
                placeholder="Détails (un par ligne) *"
                value={newProduct.details}
                onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
                className="w-full min-h-[70px] md:min-h-[80px] rounded-xl border px-4 py-3 text-sm resize-none"
              />
              <label className="block border-2 border-dashed rounded-2xl p-5 md:p-6 text-center cursor-pointer">
                {newProduct.imagePreview ? (
                  <img
                    src={newProduct.imagePreview}
                    className="h-28 md:h-32 mx-auto rounded-xl object-cover"
                  />
                ) : (
                  <div>
                    <Upload className="mx-auto text-stone-300 mb-2" size={24} />
                    <p className="text-xs text-stone-400">Ajouter une image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setNewProduct({
                        ...newProduct,
                        image: file,
                        imagePreview: URL.createObjectURL(file),
                      });
                  }}
                />
              </label>

              {/* Boutons création */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-10 md:h-11 rounded-full border border-stone-200 text-stone-600 text-xs uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateProduct}
                  disabled={converting}
                  className="flex-1 h-10 md:h-11 rounded-full bg-stone-900 text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {converting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Conversion...
                    </>
                  ) : (
                    "Créer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL ÉDITION ==================== */}
      {showEditModal && editingProduct && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-end md:items-center justify-center"
          onClick={() => setShowEditModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-xl bg-white rounded-t-[24px] md:rounded-[32px] p-4 md:p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-lg md:text-2xl font-light">Modifier le produit</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 -mr-2">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full h-10 md:h-11 rounded-xl border px-4 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  className="h-10 md:h-11 rounded-xl border px-4 text-sm"
                />
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className="h-10 md:h-11 rounded-xl border px-4 text-sm bg-white"
                >
                  <option>Cuir</option>
                  <option>Minimal</option>
                  <option>Bandoulière</option>
                  <option>Aventure</option>
                  <option>Accessoires</option>
                </select>
              </div>
              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                }
                className="w-full h-10 md:h-11 rounded-xl border px-4 text-sm"
              />
              <textarea
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                className="w-full min-h-[70px] md:min-h-[80px] rounded-xl border px-4 py-3 text-sm resize-none"
              />
              <textarea
                value={editingProduct.details.join("\n")}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, details: e.target.value.split("\n") })
                }
                className="w-full min-h-[70px] md:min-h-[80px] rounded-xl border px-4 py-3 text-sm resize-none"
              />
              {editingProduct.images?.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 mb-2">Images actuelles</p>
                  <div className="flex flex-wrap gap-2">
                    {editingProduct.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden"
                      >
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(editingProduct.id, img)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="text-xs text-stone-500 cursor-pointer hover:text-stone-700 mt-2 inline-block">
                    + Ajouter une image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await uploadImageToProduct(editingProduct.id, file);
                      }}
                    />
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-10 md:h-11 rounded-full border border-stone-200 text-stone-600 text-xs uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditProduct}
                  className="flex-1 h-10 md:h-11 rounded-full bg-stone-900 text-white text-xs uppercase tracking-wider"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}