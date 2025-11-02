// src/api/ApiClient.js
const BASE_URL = "https://ecommerce.dev.local/api";

/**
 * fetchApi centralisé avec gestion automatique du token
 */
export async function fetchApi(path, options = {}, withAuth = false) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
  const headers = options.headers ? { ...options.headers } : {};

  // 🔹 Ajout du token JWT si withAuth = true
  if (withAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // 🔹 Par défaut, les requêtes POST/PUT utilisent JSON sauf si formData
  if (
    !headers["Content-Type"] &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });

  // 🔹 Gestion des erreurs HTTP
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail || err.message || `HTTP ${res.status}`;
    throw new Error(detail);
  }

  // 🔹 Parsing automatique selon le type de contenu
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  return await res.text();
}

/* ================================
   🧩 AUTH
================================ */
export const loginUser = async ({ email, password }) => {
  // Login standard utilisateur/admin
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const data = await fetchApi("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("is_admin", data.user?.is_admin ? "true" : "false");

  const userInfo = await getMe();
  return { access_token: data.access_token, user: userInfo };
};


export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("is_admin");
};

export const getMe = async () => {
  try {
    return await fetchApi("/users/me", {}, true);
  } catch {
    return null;
  }
};

/* ================================
   🧩 USERS
================================ */

export const registerUser = (data) =>
  fetchApi("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ================================
   🧩 PRODUITS
================================ */

export const getProducts = () => fetchApi("/products/public");

export const createProduct = (data) =>
  fetchApi(
    "/products/",
    { method: "POST", body: JSON.stringify(data) },
    true
  );

export const updateProduct = (id, data) =>
  fetchApi(
    `/products/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    true
  );

export const deleteProduct = (id) =>
  fetchApi(`/products/${id}`, { method: "DELETE" }, true);

/* ================================
   🧩 UPLOAD IMAGE
================================ */

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await fetchApi("/admin/upload-image", { method: "POST", body: formData }, true);
};

/* ================================
   🧩 COMMANDES
================================ */

export const getMyOrders = () => fetchApi("/orders/user/my", {}, true);

/* ================================
   💳 PAIEMENT / STRIPE
================================ */

/**
 * Crée une session Stripe Checkout (ou simule le paiement)
 * @param {Array} cartItems  Liste des produits du panier [{id, name, price, quantity}]
 */
export const createCheckoutSession = async (cartItems) => {
  // ✅ on passe directement le tableau, fetchApi s'occupe du JSON.stringify et de l'enrobage
  return await fetchApi(
    "/payments/create-checkout-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }), 
    },
    true // inclure le token utilisateur
  );
};

/* ================================
   🧩 COMMANDES ADMIN
================================ */
export const getAllOrders = () => fetchApi("/admin/orders", {}, true);