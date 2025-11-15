// src/api/ApiClient.js
const BASE_URL = "https://ecommerce.dev.local/api";
let isRefreshing = false;
let refreshQueue = [];

export async function fetchApi(path, options = {}, withAuth = false) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;

  let headers = options.headers ? { ...options.headers } : {};

  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (withAuth && !accessToken) return null;

  if (withAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(url, { ...options, headers });

  /* =============================
     🔁 TOKEN EXPIRE → 401
  ============================= */
  if (response.status === 401 && withAuth) {
    // ❌ Pas de refresh_token → logout
    if (!refreshToken) {
      localStorage.clear();
      throw new Error("Session expirée, veuillez vous reconnecter.");
    }

    /* =============================
       🚫 Si refresh déjà en cours → attendre
    ============================= */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
    }

    /* =============================
       🔄 DÉMARRER UN REFRESH
    ============================= */
    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      if (!refreshRes.ok) throw new Error("Refresh token invalide");

      const data = await refreshRes.json();

      // Mettre à jour les tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || refreshToken);

      // Débloquer la queue
      refreshQueue.forEach(({ resolve }) => resolve());
      refreshQueue = [];

      /* ===================================
         🔁 Ressayer la requête d'origine
      =================================== */
      headers["Authorization"] = `Bearer ${data.access_token}`;
      const retry = await fetch(url, { ...options, headers });

      return responseIsJson(retry);
    } catch (err) {
      // Échec total : logout
      localStorage.clear();

      // Débloquer la queue en erreur
      refreshQueue.forEach(({ reject }) => reject(err));
      refreshQueue = [];

      throw new Error("Session expirée, veuillez vous reconnecter.");
    } finally {
      isRefreshing = false;
    }
  }

  // Retour normal
  return responseIsJson(response);
}

/* =============================
   🧠 Détection auto JSON / TEXT
============================= */
function responseIsJson(res) {
  const type = res.headers.get("content-type") || "";
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (type.includes("application/json")) return res.json();
  return res.text();
}


/* ================================
   🧩 AUTH
================================ */
export const loginUser = async ({ email, password }) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const data = await fetchApi("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token); 
    localStorage.setItem("is_admin", data.user?.is_admin ? "true" : "false");

    const userInfo = await getMe(); 
    return { access_token: data.access_token, user: userInfo };
  } catch {
    // Fallback login admin
    const res = await fetchApi("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("access_token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token); 
    localStorage.setItem("is_admin", "true");

    const adminInfo = await getMeAdmin();
    return { access_token: res.access_token, user: { ...adminInfo, is_admin: true } };
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
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

export const registerUser = async (data) => {
  try {
    const res = await fetchApi("/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res || !res.access_token || !res.user) {
      throw new Error("Erreur lors de la création du compte");
    }

    localStorage.setItem("access_token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    localStorage.setItem("is_admin", "false");

    return res;
  } catch (err) {
    throw new Error(err.detail || err.message || "Erreur lors de l'inscription");
  }
};

/**
 * Change password (utilisateur connecté)
 */
export const changePassword = async ({ oldPassword, newPassword }) => {
  return fetchApi("/users/change-password", {
    method: "POST",
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  }, true);
};

/**
 * Forgot password (reset)
 */
export const forgotPassword = async ({ email }) => {
  return fetchApi("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export async function resetPassword(token, newPassword) {
  return fetchApi("/users/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

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

export const getMyOrders = async () =>
  fetchApi("/orders/", { method: "GET" }, true);

export const getOrderById = async (id) =>
  fetchApi(`/orders/${id}`, { method: "GET" }, true);

/* ================================
   💳 PAIEMENT / STRIPE
================================ */

/**
 * Crée une session Stripe Checkout (ou simule le paiement)
 * @param {Array} cartItems  Liste des produits du panier [{id, name, price, quantity}]
 * @param {Object} shipping  Infos de livraison { full_name, address, city, postal_code, phone }
 */
export const createCheckoutSession = async (cartItems, shipping) => {
  // 🔹 transformer chaque item pour correspondre aux clés attendues par le backend
  const items = cartItems.map(item => ({
    id: item.id || item.product_id,    // backend attend "id"
    name: item.name || item.title,     // backend attend "name"
    price: item.price,
    quantity: item.quantity || 1,
  }));

  return await fetchApi(
    "/payments/create-checkout-session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, shipping }),
    },
    true
  );
};


/* ================================
   🧩 COMMANDES ADMIN
================================ */

export const getMeAdmin = async () =>
  fetchApi("/admin/me", {}, true);


export const getAllOrders = () => fetchApi("/admin/orders", {}, true);

/**
 * Récupère le détail d'une commande par son ID (admin)
 * @param {number} id
 */
export const getOrderByIdAdmin = (id) =>
  fetchApi(`/admin/orders/${id}`, {}, true);


/**
 * Supprime une commande par son ID
 * @param {number} id
 */
export const deleteOrderAdmin = (id) =>
  fetchApi(`/admin/orders/${id}`, { method: "DELETE" }, true);

/**
 * Met à jour le statut d'une commande
 * @param {number} id
 * @param {object} data  { status: "pending"|"paid"|"shipped"|"delivered"|"cancelled" }
 */
export const updateOrderStatusAdmin = (id, data) =>
  fetchApi(`/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify(data) }, true);