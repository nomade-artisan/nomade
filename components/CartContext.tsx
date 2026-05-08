// components/CartContext.tsx
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nomade-cart");
    if (saved) setCart(JSON.parse(saved));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("nomade-cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  // Ajout avec quantité optionnelle
  const addToCart = (
    product: Omit<CartItem, "quantity">,
    quantity: number = 1
  ) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const maxQty = (product as any).stock || 10; // Stock max
      const newQty = Math.min(currentQty + quantity, maxQty);
      
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, maxQty) }];
    });
  };

  const removeFromCart = (id: number | string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = useCallback(() => setCart([]), []);

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