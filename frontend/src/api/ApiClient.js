// src/api/ApiClient.js
const BASE_URL = "https://ecommerce.dev.local/api";

/**
 * fetchApi centralisé avec gestion automatique du token
 */
async function fetchApi(path, options = {}, withAuth = false) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
  const headers = options.headers ? { ...options.headers } : {};

  if (withAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP error! status: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  return await res.text();
}

// === AUTH UNIFIÉE ===
export const loginUser = async ({ email, password }) => {
  try {
    // 1️⃣ Login utilisateur standard
    const formData = new URLSearchParams();
    formData.append("username", email); // correspond à OAuth2PasswordRequestForm
    formData.append("password", password);

    const data = await fetchApi("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("is_admin", data.user?.is_admin ? "true" : "false");

    // Récupération complète de l'utilisateur
    const userInfo = await getMe();
    return { access_token: data.access_token, user: userInfo };
  } catch {
    // 2️⃣ Fallback login admin
    const res = await fetchApi("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("token", res.access_token);
    localStorage.setItem("is_admin", "true");

    // Pour admin, on renvoie les infos depuis le token (pas de /admin/me)
    return { access_token: res.access_token, user: { email, is_admin: true } };
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("is_admin");
};

// getMe corrigé : retourne null si pas de user ou admin
export const getMe = async () => {
  try {
    const res = await fetchApi("/users/me", {}, true);
    return res;
  } catch {
    return null; // permet d'éviter la 401 pour les admins
  }
};

// === USERS ===
export const registerUser = (data) =>
  fetchApi("/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// === PRODUITS ===
export const getProducts = () => fetchApi("/products/public", {}, false);

export const createProduct = (data) =>
  fetchApi("/products/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, true);

export const updateProduct = (id, data) =>
  fetchApi(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, true);

export const deleteProduct = (id) =>
  fetchApi(`/products/${id}`, { method: "DELETE" }, true);

// === IMAGE UPLOAD ===
export const uploadImage = async (file) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/admin/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur upload image");
  return data.url;
};

// === COMMANDES ===
export const getMyOrders = () => fetchApi("/orders/my", {}, true);

// === CHECKOUT ===
export const createCheckoutSession = async (cartItems) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Utilisateur non connecté");

  const res = await fetch(`${BASE_URL}/checkout/create-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items: cartItems }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la création de la session de paiement");

  return data; 
};
