import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
      <div className="h-48 bg-gray-200 mb-4 flex items-center justify-center text-gray-500">
        Image
      </div>
      <h2 className="font-semibold text-lg">{product.name}</h2>
      <p className="text-gray-700 mb-2">{product.price} €</p>
      <button className="mt-auto bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
        Ajouter au panier
      </button>
    </div>
  );
}
