
// // src/utils/api.js
export const getApiUrl = (endpoint, user, shopName) => {
  const ep = endpoint.replace(/^\/+/, ""); // remove leading slash

  if (!user) return `/api/${ep}`;

  // Tenant user → tenant DB
  if (user.role === "tenant") {
    return `/api/${ep}`;
  }


   // Manager / Megaadmin → fetch from master DB for a shop
  if ((user.role === "manager" || user.role === "megaadmin") && shopName) {
    const safeShop = shopName.trim().toLowerCase(); // ✅ normalize
    return `/api/shops/${encodeURIComponent(safeShop)}/${ep}`; // ✅ correct master->tenant route
  }

  // Default → master
  return `/api/${ep}`;
};



  // Manager / Megaadmin → fetch from master DB for a shop
  // if ((user.role === "manager" || user.role === "megaadmin") && shopName) {
  //   return `/api/tenant/shops/${encodeURIComponent(shopName)}/${ep}`;
  // }


    // Manager / Megaadmin → fetch from master DB for a shop
  // if ((user.role === "manager" || user.role === "megaadmin") && shopName) {
  //   return `/api/shops/${encodeURIComponent(shopName)}/${ep}`; // ✅ master path
  // }



// export const getApiUrl = (endpoint, user = null, shopName = "") => {
//   if (!endpoint) throw new Error("Endpoint is required");

//   const ep = endpoint.replace(/^\/+/, ""); // remove leading slash

//   const role = user?.role?.toLowerCase();

//   // Tenant user → tenant DB
//   if (role === "tenant") return `/api/${ep}`;

//   // Manager / Megaadmin → fetch from master DB for a shop
//   if ((role === "manager" || role === "megaadmin") && shopName?.trim()) {
//     const safeShop = shopName.trim().toLowerCase();
//     return `/api/shops/${encodeURIComponent(safeShop)}/${ep}`;
//   }

//   // Default → master
//   return `/api/${ep}`;
// };


// // src/utils/api.js
// export const getApiUrl = (endpoint, user, shopName) => {
//   const ep = endpoint.replace(/^\/+/, ""); // remove leading slash

//   if (!user) return `/api/${ep}`;

//   // Tenant user → tenant DB
//   if (user.role === "tenant") {
//     return `/api/${ep}`;
//   }

//   // Master / Manager → fetch from master DB
//   if (user.role === "manager" || user.role === "megaadmin") {
//     if (shopName) {
//       // Optional: fetch specific shop from tenant DB
//       return `/api/master/shops/${encodeURIComponent(shopName)}/${ep}`;
//     }
//     // Otherwise, fetch master DB collection
//     return `/api/${ep}`;
//   }

//   return `/api/${ep}`;
// };




// src/utils/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Build API URL safely for tenant/shop endpoints
 * @param {string} endpoint - API endpoint, e.g., "orders" or "products"
 * @param {string} [shopname] - Tenant/shop name
 * @returns {string} Full URL
 */
export const tenantApiUrl = (endpoint, shopname) => {
  if (shopname) {
    // Ensure proper slash between name and endpoint
    const cleanShop = encodeURIComponent(shopname);
    return `${API_BASE}/api/tenant/shops/${cleanShop}/${endpoint}`;
  }
  // fallback to general endpoint
  return `${API_BASE}/api/${endpoint}`;
};

/**
 * Wrapper for GET requests with optional auth
 */
export const apiGet = async (url, token) => {
  try {
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err) {
    console.error(`GET ${url} failed:`, err);
    throw err;
  }
};

/**
 * Wrapper for POST requests with optional auth
 */
export const apiPost = async (url, payload, token) => {
  try {
    const res = await axios.post(url, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err) {
    console.error(`POST ${url} failed:`, err.response || err);
    throw err;
  }
};

/**
 * Wrapper for PUT requests with optional auth
 */
export const apiPut = async (url, payload, token) => {
  try {
    const res = await axios.put(url, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err) {
    console.error(`PUT ${url} failed:`, err.response || err);
    throw err;
  }
};


/**
 * Wrapper for PATCH requests with optional auth
 */
export const apiPatch = async (url, payload, token) => {
  try {
    const res = await axios.patch(url, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;   
  } catch (err) {
    console.error(`PATCH ${url} failed:`, err.response || err);
    throw err;
  }
};
