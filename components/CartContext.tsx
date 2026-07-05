"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "nomade-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {
      // Données corrompues, on réinitialise
      localStorage.removeItem(STORAGE_KEY);
    }
    setMounted(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, mounted]);

  // Ajouter au panier
  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        const maxQty = product.stock || 99;

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, maxQty);
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: newQty } : item
          );
        }

        return [...prev, { ...product, quantity: Math.min(quantity, maxQty) }];
      });
    },
    []
  );

  // Supprimer un article
  const removeFromCart = useCallback((id: number | string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Mettre à jour la quantité
  const updateQuantity = useCallback((id: number | string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
          : item
      )
    );
  }, []);

  // Vider le panier
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Calculs
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }
  return context;
}