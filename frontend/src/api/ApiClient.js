const BASE_URL = "https://ecommerce.dev.local/api";

export async function fetchApi(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

export const getProducts = () => fetchApi("/public/products");
export const createProduct = (data, token) =>
  fetchApi("/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

export const loginAdmin = (credentials) =>
  fetchApi("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
