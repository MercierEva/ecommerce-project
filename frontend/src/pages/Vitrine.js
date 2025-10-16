// src/pages/Vitrine.js
import React, { useEffect, useState } from "react";
import { getProducts } from "../api/ApiClient";
import ProductCard from "../components/ProductCard";

export default function Vitrine() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(err => console.error("Erreur chargement produits :", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 text-center text-2xl font-bold">
        Mon Ecommerce
      </header>

      {/* Main */}
      <main className="container mx-auto p-4 flex-1">
        <h1 className="text-2xl font-semibold mb-4">Vitrine</h1>
        {products.length === 0 ? (
          <p className="text-gray-600">Chargement des produits...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow p-4 text-center">
        &copy; 2025 Mon Ecommerce
      </footer>
    </div>
  );
}
