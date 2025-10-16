import React, { useState, useEffect } from "react";

const BASE_URL = "https://ecommerce.dev.local/api";

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState([]);

  // ----- LOGIN ADMIN -----
  const handleLogin = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Identifiants invalides");
        return;
      }

      setToken(data.access_token);
      localStorage.setItem("adminToken", data.access_token);
    } catch (err) {
      console.error("Erreur login:", err);
      alert("Connexion au serveur impossible");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  // ----- FETCH PRODUCTS -----
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/public/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur fetch produits:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ----- UPLOAD IMAGE -----
  const handleUploadImage = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/admin/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return null;
    }

    return data.url;
  };

  // ----- CREATE PRODUCT -----
  const handleCreateProduct = async () => {
    if (!name || !description || !price || !file) {
      alert("Tous les champs sont obligatoires");
      return;
    }

    const image_url = await handleUploadImage();
    if (!image_url) return;

    const res = await fetch(`${BASE_URL}/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        image_url,
      }),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      setPrice("");
      setFile(null);
      fetchProducts();
    } else {
      const err = await res.json();
      alert(err.detail || "Erreur création produit");
    }
  };

  // ----- DELETE PRODUCT -----
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchProducts();
  };


  return (
    <div className="container mx-auto p-4">
      {/* LOGIN */}
      {!token && (
        <div className="mb-4 border p-4 rounded shadow-md w-fit mx-auto">
          <h2 className="text-xl font-bold mb-2 text-center">Admin Login</h2>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="border p-1 mr-2"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="border p-1 mr-2"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Login
          </button>
        </div>
      )}

      {/* DASHBOARD ADMIN */}
      {token && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Espace Admin</h2>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Déconnexion
            </button>
          </div>

          {/* FORM CREATION PRODUIT */}
          <div className="mb-6 border p-4 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Créer un produit</h3>
            <input
              type="text"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-1 mr-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-1 mr-2"
            />
            <input
              type="number"
              placeholder="Prix"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-1 mr-2"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-1 mr-2"
            />
            <button
              onClick={handleCreateProduct}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Créer
            </button>
          </div>

          {/* LISTE PRODUITS */}
          <h3 className="text-lg font-bold mb-2">Produits existants</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="border rounded p-2 flex flex-col shadow-sm"
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-48 object-cover mb-2"
                />
                <h3 className="font-semibold">{p.name}</h3>
                <p>{p.price} €</p>
                <p className="text-sm">{p.description}</p>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white py-1 mt-auto rounded"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}