import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // 🔹 Persistance locale (si on actualise la page)
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ➕ Ajouter un produit
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        message.info(`${product.name} est déjà dans le panier.`);
        return prev;
      }
      message.success(`${product.name} ajouté au panier !`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ➖ Retirer un produit
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
    message.info("Produit retiré du panier.");
  };

  // 🧹 Vider le panier
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personnalisé pour accéder facilement au contexte
export const useCart = () => useContext(CartContext);
