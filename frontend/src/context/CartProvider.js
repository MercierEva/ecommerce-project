import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import { fetchApi } from "../api/ApiClient";
import { useAuth } from "./AuthProvider";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 🔹 Charger le panier depuis le backend (si user connecté)
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        // Si utilisateur connecté
        if (user) {
          const data = await fetchApi("/cart", { method: "GET" }, true);
          const backendItems =
            data?.items?.map((it) => ({
              id: it.product.id,
              name: it.product.name,
              price: Number(it.product.price),
              image_url: it.product.image_url,
              category: it.product.category,
              quantity: it.quantity,
            })) || [];
          setCart(backendItems);
          localStorage.removeItem("cart"); // on efface le local au cas où
        } else {
          // Sinon, charger depuis le localStorage
          const saved = localStorage.getItem("cart");
          if (saved) setCart(JSON.parse(saved));
        }
      } catch (err) {
        console.warn("⚠️ Erreur chargement panier:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user]);

  // 🔹 Effet séparé : quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      setCart([]);
      localStorage.removeItem("cart");
    }
  }, [user]);

  // 🔹 Sauvegarde locale automatique
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  // 🔹 Ajouter un produit
  const addToCart = async (product) => {
    const exists = cart.find((p) => p.id === product.id);
    const newCart = exists
      ? cart.map((p) =>
          p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        )
      : [...cart, { ...product, quantity: 1 }];

    setCart(newCart);
    message.success(`${product.name} ajouté au panier !`);

    // Synchro backend si user connecté
    if (user) {
      try {
        const updatedCart = await fetchApi(
          "/cart/add",
          {
            method: "POST",
            body: JSON.stringify({
              product_id: product.id,
              quantity: 1,
            }),
          },
          true
        );

        // Met à jour le panier avec la version du backend
        setCart(updatedCart.items || []);
      } catch (err) {
        console.error("Erreur ajout backend:", err.message);
      }
    }
  };
  
  // 🔹 Supprimer un produit
  const removeFromCart = async (product) => {
    setCart((prev) => prev.filter((p) => p.id !== product.id));
    message.info(`${product.name} retiré du panier`);

    if (user) {
      try {
        await fetchApi(`/cart/remove/${product.id}`, { method: "DELETE" }, true);
      } catch (err) {
        console.error("Erreur suppression backend:", err.message);
      }
    }
  };

  // 🔹 Vider le panier
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");
    if (user) {
      try {
        await fetchApi("/cart/clear", { method: "DELETE" }, true);
      } catch (err) {
        console.error("Erreur nettoyage backend:", err.message);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
