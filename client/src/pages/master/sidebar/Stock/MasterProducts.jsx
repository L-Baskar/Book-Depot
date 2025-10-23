// // ✅ src/pages/Stock/MasterProducts.jsx
// src/pages/Stock/MasterProducts.jsx
import React from "react";
import { useMemo, useState, useEffect, useRef, useContext } from "react";
import { FaPlus, FaEye, FaTimes, FaChevronDown, FaTrash, FaEdit } from "react-icons/fa";
import "../../../../styles/products.css";
import { useAuth } from "../../../../context/AuthContext";
import { ShopContext } from "../../../../context/ShopContext";
import apiClient from "../../../../utils/apiClient";
import { getApiUrl } from "../../../../utils/api";
import Pagination from "../../../../components/Pagination";

export default function Products() {
  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);

  const [products, setProducts] = useState([]); // flat list of batches from API
  const [categories, setCategories] = useState([]); // normalized array of strings
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [nextCode, setNextCode] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [categoryTemp, setCategoryTemp] = useState([]);

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [availableBatches, setAvailableBatches] = useState([]);
  const [showBatchList, setShowBatchList] = useState(true);

 
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  
  
  const [editBatch, setEditBatch] = useState(null);
  
  const [batchEditState, setBatchEditState] = React.useState({});

  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // change as needed
  
  
  
  const [form, setForm] = useState({
    code: "",
    shortName: "",
    batchNo: "",
    salePrice: "",
    name: "",
    category: "",
    price: "",
    taxPercent: "",
    taxMode: "exclusive",
    qty: "",
    mrp: "",
    minQty: "",
  });

  const wheelPreventerRef = useRef(null);

  // -------------------------------
  // Toast helper
  // -------------------------------
  const pushToast = (msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };

  // -------------------------------
  // API path helper
  // -------------------------------
  // Keep API path consistent with tenant/master usage
  const getApiPath = (endpoint) => {
    const ep = endpoint.replace(/^\//, "");
    // tenant users: direct tenant endpoints
    if (user?.role === "tenant") return getApiUrl(`tenant/${ep}`);
    // manager / megaadmin: use selectedShop.shopname when available
    if ((user?.role === "manager" || user?.role === "megaadmin") && selectedShop) {
      const shopname = encodeURIComponent(selectedShop.shopname || selectedShop);
      return getApiUrl(`tenant/shops/${shopname}/${ep}`);
    }
    // fallback to tenant
    return getApiUrl(`tenant/${ep}`);
  };

  // -------------------------------
  // Fetch products & categories
  // -------------------------------


//   const fetchProducts = async () => {
//   if (!user) return;
  
//   // Only proceed if tenant or selectedShop exists
//   if ((user.role === "manager" || user.role === "megaadmin") && !selectedShop?.shopname) {
//     setProducts([]);
//     return;
//   }

//   try {
//     const token = localStorage.getItem("tenantToken") || localStorage.getItem("masterToken") || localStorage.getItem("token");
//     const endpoint =
//       user.role === "tenant"
//         ? getApiUrl("tenant/products")
//         : getApiUrl(`tenant/shops/${encodeURIComponent(selectedShop.shopname)}/products`);

//     const res = await apiClient.get(endpoint, {
//       headers: {
//         Authorization: token ? `Bearer ${token}` : undefined,
//         ...(selectedShop?.shopname ? { "x-shopname": selectedShop.shopname } : {}),
//       },
//     });

//     const fetchedProducts = Array.isArray(res.data?.products) ? res.data.products : res.data || [];
//     setProducts(fetchedProducts);
//   } catch (err) {
//     console.error("fetchProducts error:", err);
//     pushToast(`Failed to fetch products${selectedShop?.shopname ? ` for ${selectedShop.shopname}` : ""}`);
//     setProducts([]);
//   }
// };


const fetchProducts = async (page = 1) => {
  if (!user) return;

  if ((user.role === "manager" || user.role === "megaadmin") && !selectedShop?.shopname) {
    setProducts([]);
    setTotalPages(1);
    return;
  }

  try {
    const token =
      localStorage.getItem("tenantToken") ||
      localStorage.getItem("masterToken") ||
      localStorage.getItem("token");

    const endpoint =
      user.role === "tenant"
        ? `${getApiUrl("tenant/products")}?page=${page}&limit=${limit}`
        : `${getApiUrl(
            `tenant/shops/${encodeURIComponent(selectedShop.shopname)}/products`
          )}?page=${page}&limit=${limit}`;

    const res = await apiClient.get(endpoint, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...(selectedShop?.shopname ? { "x-shopname": selectedShop.shopname } : {}),
      },
    });

    const fetchedProducts = Array.isArray(res.data?.products)
      ? res.data.products
      : res.data || [];

    setProducts(fetchedProducts);
    setPage(res.data.page || page);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    console.error("fetchProducts error:", err);
    pushToast(
      `Failed to fetch products${selectedShop?.shopname ? ` for ${selectedShop.shopname}` : ""}`
    );
    setProducts([]);
    setTotalPages(1);
  }
};
useEffect(() => {
  fetchProducts(1);
}, [user, selectedShop]);


  const fetchCategories = async () => {
  if (!user) return;
  if ((user.role === "manager" || user.role === "megaadmin") && !selectedShop?.shopname) {
    setCategories([]);
    return;
  }

  try {
    const token = localStorage.getItem("tenantToken") || localStorage.getItem("masterToken") || localStorage.getItem("token");
    const endpoint =
      user.role === "tenant"
        ? getApiUrl("tenant/categories")
        : getApiUrl(`tenant/shops/${encodeURIComponent(selectedShop.shopname)}/categories`);

    const res = await apiClient.get(endpoint, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        ...(selectedShop?.shopname ? { "x-shopname": selectedShop.shopname } : {}),
      },
    });

    const data = Array.isArray(res.data?.categories) ? res.data.categories : res.data || [];
    setCategories(data);
  } catch (err) {
    console.error("fetchCategories error:", err);
    pushToast("Failed to fetch categories");
    setCategories([]);
  }
};

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedShop]);

  // -------------------------------
  // Unique products by code + name
  // (one row per product, batches retained in `products`)
  // -------------------------------
  const uniqueProducts = useMemo(() => {
    const map = new Map();
    for (const b of products || []) {
      const code = b.code || "";
      const name = b.name || "";
      const key = `${code}||${name}`;
      const qty = Number(b.qty || 0);
      const minQty = Number.isFinite(Number(b.minQty || NaN)) ? Number(b.minQty || 0) : Infinity;

      if (!map.has(key)) {
        map.set(key, {
          code,
          name,
          category: b.category || "",
          totalQty: qty,
          minQty: Number.isFinite(minQty) ? minQty : Infinity,
          batches: [b],
        });
      } else {
        const entry = map.get(key);
        entry.totalQty += qty;
        entry.minQty = Math.min(entry.minQty, Number.isFinite(minQty) ? minQty : entry.minQty);
        entry.batches.push(b);
      }
    }

    // convert to array and normalize minQty Infinity -> 0
    return Array.from(map.values()).map((e) => ({
      ...e,
      minQty: e.minQty === Infinity ? 0 : e.minQty,
    }));
  }, [products]);

  // -------------------------------
  // Filtered products (search operates on unique rows)
  // -------------------------------
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return uniqueProducts;
    return uniqueProducts.filter((p) =>
      [p.code, p.name, p.category].some((v) => String(v || "").toLowerCase().includes(s))
    );
  }, [search, uniqueProducts]);

  // -------------------------------
  // Helper: get batches for product (by code+name)
  // -------------------------------
  const getBatches = (prod) =>
    products.filter((p) => p.code === prod.code && p.name === prod.name);

  // -------------------------------
  // Apply decrements helper (used for local optimistic updates)
  // -------------------------------
  const applyDecrementsToProducts = (prevProducts, decrements) => {
    const copy = prevProducts.map((p) => ({ ...p }));
    for (const d of decrements) {
      const code = (d.code || "").toLowerCase();
      const batchNo = (d.batchNo || "").toLowerCase();
      let remaining = Number(d.qty || 0);
      for (let i = 0; i < copy.length && remaining > 0; i++) {
        const p = copy[i];
        if ((p.code || "").toLowerCase() === code && (p.batchNo || "").toLowerCase() === batchNo) {
          const available = Number(p.qty || 0);
          if (available <= 0) continue;
          const take = Math.min(available, remaining);
          p.qty = Math.max(0, available - take);
          remaining -= take;
        }
      }
    }
    return copy;
  };

  const decrementStockOnServer = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    try {
      await apiClient.put(getApiPath("products/decrement-stock"), { items });
      setProducts((prev) => applyDecrementsToProducts(prev, items));
      await fetchProducts();
      pushToast("Stock updated");
    } catch (err) {
      console.error("decrementStockOnServer:", err);
      pushToast("Failed to update stock on server");
    }
  };

  // -------------------------------
  // Get next code helper (robust)
  // -------------------------------


  const getNextCode = async () => {
  try {
    const res = await apiClient.get(getApiPath("products/next-code"));
    if (res?.data) {
      if (typeof res.data === "string") return { nextCode: res.data };
      if (res.data.nextCode) return { nextCode: res.data.nextCode };
      if (res.nextCode) return { nextCode: res.nextCode };
    }
    return { nextCode: "" }; // fallback
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn("Next code API not found. Falling back to empty code.");
      return { nextCode: "" };
    }
    console.error("getNextCode error:", err);
    return { nextCode: "" };
  }
};

  // -------------------------------
  // Create product (modal)
  // -------------------------------
  const resetForm = (code = "") => {
    setForm({
      code,
      shortName: "",
      batchNo: "",
      salePrice: "",
      name: "",
      category: "",
      price: "",
      taxPercent: "",
      taxMode: "exclusive",
      qty: "",
      mrp: "",
      minQty: "",
    });
    setAvailableBatches([]);
    setShowBatchList(true);
  };

  const openCreate = async () => {
    const data = await getNextCode();
    resetForm(data?.nextCode || "");
    setNextCode(data?.nextCode || "");
    setShowCreateModal(true);
  };
  const closeCreate = () => setShowCreateModal(false);
  const openView = (prod) => setShowViewModal(prod);
  const closeView = () => setShowViewModal(null);

  // -------------------------------
  // Product name suggestions
  // -------------------------------
  const onNameChange = async (val) => {
    setForm((f) => ({ ...f, name: val, batchNo: "" }));
    setAvailableBatches([]);
    setShowBatchList(true);

    if (!val.trim()) {
      const data = await getNextCode();
      resetForm(data?.nextCode || "");
      setNextCode(data?.nextCode || "");
      setShowSuggestions(false);
      return;
    }

    const matches = products.filter((p) => p.name?.toLowerCase().includes(val.toLowerCase()));
    setNameSuggestions(matches);
    setShowSuggestions(true);

    const exact = products.find((p) => p.name?.toLowerCase() === val.toLowerCase());
    if (exact) {
      const batches = getBatches(exact);
      setAvailableBatches(batches);
      setForm((f) => ({
        ...f,
        code: exact.code,
        shortName: exact.shortName,
        category: exact.category,
      }));
      setShowBatchList(true);
    } else {
      const data = await getNextCode();
      setForm((f) => ({ ...f, code: data?.nextCode || "" }));
      setNextCode(data?.nextCode || "");
    }
  };

  const selectSuggestion = (prod) => {
    const batches = getBatches(prod);
    setAvailableBatches(batches);
    setForm((f) => ({
      ...f,
      name: prod.name,
      code: prod.code,
      shortName: prod.shortName,
      category: prod.category,
      batchNo: "",
    }));
    setShowSuggestions(false);
    setShowBatchList(true);
  };

  const onBatchSelect = (batch) => {
    setForm((f) => ({
      ...f,
      batchNo: batch.batchNo,
      mrp: batch.mrp,
      salePrice: batch.salePrice,
      qty: batch.qty,
      taxPercent: batch.taxPercent,
      taxMode: batch.taxMode,
    }));
    setShowBatchList(true);
  };

  const onCreate = async (e) => {
  e.preventDefault();
  if (!form.name) return alert("Product name is required");
  if (!form.batchNo) return alert("Batch No is required");

  try {
    const payload = {
      ...form,
      shop: user.shop || selectedShop, // <-- add the shop
      qty: Number(form.qty || 0),
      mrp: Number(form.mrp || 0),
      salePrice: Number(form.salePrice || 0),
      taxPercent: Number(form.taxPercent || 0),
      minQty: Number(form.minQty || 0),
    };

    const { data } = await apiClient.post(getApiPath("products"), payload);
    setProducts((prev) => [data, ...prev]);
    if (data.name === form.name && data.code === form.code) {
      setAvailableBatches((prev) => [data, ...prev]);
    }
    setShowCreateModal(false);
    pushToast("Product / Batch saved");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Failed to create product");
  }
};
  
  const openCategoryModal = () => {
    setCategoryTemp(categories);
    setCategoryDraft("");
    setShowCategoryModal(true);
  };
  const closeCategoryModal = () => setShowCategoryModal(false);

  const addCategoryDraft = () => {
    const name = categoryDraft.trim();
    if (!name) return;
    if (!categoryTemp.includes(name)) setCategoryTemp((x) => [...x, name]);
    setCategoryDraft("");
  };
  const removeTempCategory = (name) => setCategoryTemp((x) => x.filter((c) => c !== name));

  const saveCategories = async () => {
    if (!categoryTemp || categoryTemp.length === 0) {
      pushToast("No categories to save");
      return;
    }
    try {
      const res = await apiClient.put(getApiPath("categories"), { categories: categoryTemp });
      // server may return updated categories in different shapes
      const data = Array.isArray(res.data) ? res.data : res.data?.categories || [];
      setCategories(Array.isArray(data) ? data : []);
      if (form.category && !data.includes(form.category)) setForm((f) => ({ ...f, category: "" }));
      setShowCategoryModal(false);
      pushToast("Categories saved");
    } catch (err) {
      console.error("Failed to save categories:", err);
      pushToast("Failed to save categories");
    }
  };



  // -------------------------------
  // Wheel prevention
  // -------------------------------
  const wheelHandler = (e) => {
    if (
      document.activeElement &&
      (document.activeElement.type === "number" ||
        document.activeElement.inputMode === "decimal")
    )
      e.preventDefault();
  };
  const enableWheelBlock = () => {
    if (!wheelPreventerRef.current) {
      wheelPreventerRef.current = wheelHandler;
      window.addEventListener("wheel", wheelPreventerRef.current, { passive: false, capture: true });
    }
  };
  const disableWheelBlock = () => {
    if (wheelPreventerRef.current) {
      window.removeEventListener("wheel", wheelPreventerRef.current, { capture: true });
      wheelPreventerRef.current = null;
    }
  };

  // -------------------------------
  // Listen for product refresh event
  // -------------------------------
  useEffect(() => {
    const handler = async (e) => {
      const items = e?.detail?.items;
      if (Array.isArray(items) && items.length > 0) {
        setProducts((prev) => applyDecrementsToProducts(prev, items));
      }
      await fetchProducts();
      pushToast("Products refreshed");
    };
    window.addEventListener("products:refresh", handler);
    return () => window.removeEventListener("products:refresh", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


// Handle typing in Product Code
const onCodeChange = (val) => {
  setForm((f) => ({ ...f, code: val }));
  setShowCodeSuggestions(true);

  if (!val.trim()) {
    // Reset auto-fill if code is erased
    resetForm();
    setShowCodeSuggestions(false);
    return;
  }

  const matches = products.filter((p) =>
    p.code.toLowerCase().includes(val.toLowerCase())
  );
  setShowCodeSuggestions(matches.length > 0);

  const exact = products.find((p) => p.code.toLowerCase() === val.toLowerCase());
  if (exact) {
    const batches = getBatches(exact);
    setAvailableBatches(batches);
    setForm((f) => ({
      ...f,
      name: exact.name,
      shortName: exact.shortName,
      category: exact.category,
      batchNo: "",
    }));
    setShowBatchList(true);
  }
};

// Handle selecting a code suggestion
const selectCodeSuggestion = (prod) => {
  const batches = getBatches(prod);
  setAvailableBatches(batches);
  setForm((f) => ({
    ...f,
    code: prod.code,
    name: prod.name,
    shortName: prod.shortName,
    category: prod.category,
    batchNo: "",
  }));
  setShowCodeSuggestions(false);
  setShowBatchList(true);
};


const uniqueCodeSuggestions = useMemo(() => {
  const seen = new Set();
  return products
    .filter((p) => {
      if (seen.has(p.code)) return false;
      seen.add(p.code);
      return true;
    })
    .filter((p) =>
      form.code ? p.code.toLowerCase().includes(form.code.toLowerCase()) : true
    )
    .slice(0, 5); // top 5 suggestions
}, [products, form.code]);


//   // 🔹 React-safe Min Qty Update
// const handleSaveMinQty = async ({ code, batchNo, minQty }) => {
//   if (!code || !batchNo) {
//     pushToast("Missing code or batch number");
//     return;
//   }

//   try {
//     // Get token from localStorage
//     const token =
//       localStorage.getItem("tenantToken") ||
//       localStorage.getItem("masterToken") ||
//       localStorage.getItem("token");

//     if (!token) {
//       pushToast("You are not authorized. Please login.");
//       return;
//     }

//     // API endpoint
//     const endpoint = getApiUrl("products/min-qty");

//     const payload = {
//       code,
//       batchNo,
//       minQty: Number(minQty || 0),
//     };

//     // Axios patch request
//     await apiClient.patch(endpoint, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     pushToast("Min Qty updated successfully");

//   } catch (err) {
//     console.error("handleSaveMinQty error:", err);

//     if (err.response?.status === 401) {
//       pushToast("Unauthorized. Please login again.");
//       // Optional: clear invalid token
//       localStorage.removeItem("tenantToken");
//       localStorage.removeItem("masterToken");
//       localStorage.removeItem("token");
//     } else {
//       pushToast(
//         err.response?.data?.message || "Failed to update Min Qty"
//       );
//     }
//   }
// };



const renderProducts = () => {
  return Array.isArray(products) &&
    products.map((p) => (
      <div key={p.code}>
        {Array.isArray(p.batches) &&
          p.batches.map((b) => (
            <div key={b.batchNo}>{b.minQty}</div>
          ))}
      </div>
    ));
};


const handleSaveMinQty = async ({ code, batchNo, minQty }) => {
  if (!code || !batchNo) {
    pushToast("Missing code or batch number");
    return;
  }

  try {
    const payload = { code, batchNo, minQty: Number(minQty || 0) };

    // ✅ Corrected API call (patch to /products/min-qty)
    const res = await apiClient.patch(getApiPath("products/min-qty"), payload);
    const updated = res.data;

    // ✅ Update local product list (real-time UI update)
    setProducts((prev) =>
      prev.map((p) =>
        p.code === updated.code && p.batchNo === updated.batchNo
          ? { ...p, minQty: updated.minQty }
          : p
      )
    );

    pushToast(`Min Qty updated for batch ${batchNo}`);
  } catch (err) {
    console.error("handleSaveMinQty error:", err);
    pushToast(err.response?.data?.message || "Failed to update Min Qty");
  }
};



const BatchRow = ({ batch, idx, minQty, resultingStock, handleSaveMinQty }) => {
  const [editingMinQty, setEditingMinQty] = React.useState(false);
  const [newMinQty, setNewMinQty] = React.useState(minQty);

  // Reset local state if minQty changes externally
  React.useEffect(() => {
    setNewMinQty(minQty);
  }, [minQty]);

  return (
    <tr>
      <td>{idx + 1}</td>
      <td>{batch.batchNo}</td>
      <td className={resultingStock <= minQty ? "danger" : ""}>
        {resultingStock}
      </td>
      <td>
        {editingMinQty ? (
          <input
            type="number"
            value={newMinQty}
            min={0}
            onChange={(e) => setNewMinQty(Number(e.target.value))}
            style={{ width: "60px" }}
          />
        ) : (
          minQty || "-"
        )}
      </td>
      <td>{Number(batch.mrp || 0).toFixed(2)}</td>
      <td>{Number(batch.salePrice || batch.rate || 0).toFixed(2)}</td>
      <td>{batch.taxPercent || 0}%</td>
      <td>{batch.taxMode || "-"}</td>
      <td>
        {editingMinQty ? (
          <>
            <button
              className="btn btn-success btn-small"
              onClick={async () => {
                await handleSaveMinQty({
                  code: batch.code,
                  batchNo: batch.batchNo,
                  minQty: newMinQty,
                });
                setEditingMinQty(false);
              }}
            >
              Save
            </button>
            <button
              className="btn btn-muted btn-small"
              onClick={() => {
                setNewMinQty(minQty);
                setEditingMinQty(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary btn-small"
            onClick={() => setEditingMinQty(true)}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
};



  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="products-page p-8">
      {/* Toasts */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="products-header">
        <h1 className="title">Products</h1>
        {/* <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Create Product
        </button> */}
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-wrap ">
          <input
            className="input"
            type="text"
            placeholder="Search by code / name / category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card table-card" style={{ width: "100%", overflowX: "auto" }}>
        <div className="table-responsive" style={{ minWidth: "100%" }}>
          <table className="table clean" style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#007867", color: "#fff", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>S.No</th>
                <th style={{ padding: "0.75rem" }}>Product Code</th>
                <th style={{ padding: "0.75rem" }}>Product Name</th>
                <th style={{ padding: "0.75rem" }}>Category</th>
                <th style={{ padding: "0.75rem" }}>Qty</th>
                {/* <th style={{ padding: "0.75rem" }}>Min Qty</th> */}
                <th style={{ padding: "0.75rem" }} className="text-center">Action</th>
              </tr>
            </thead>
     <tbody>
  {filtered.length === 0 ? (
    <tr>
      <td
        colSpan="7"
        style={{
          textAlign: "center",
          padding: "1rem",
          color: "#777",
        }}
      >
        No products found
      </td>
    </tr>
  ) : (
    filtered.map((p, idx) => {
      const batches = getBatches(p);
      const totalQty = batches.reduce(
        (sum, b) => sum + Number(b.qty || 0),
        0
      );
      const minQty =
        batches.length > 0
          ? Math.min(...batches.map((b) => Number(b.minQty || Infinity)))
          : 0;

      // ✅ Generate unique, stable key (avoid duplicate key warnings)
      const uniqueKey = `${p.code || "unknown"}-${p._id || idx}-${page}`;

      return (
        <tr
          key={uniqueKey}
          style={{
            transition: "all 0.3s ease",
            opacity: 0,
            animation: "fadeIn 0.5s forwards",
            cursor: "default",
          }}
          className="fade-in"
        >
          {/* Serial Number */}
          <td style={{ padding: "0.5rem" }}>
            {(page - 1) * limit + idx + 1}
          </td>

          {/* Product Code */}
          <td style={{ padding: "0.5rem" }}>{p.code}</td>

          {/* Product Name */}
          <td style={{ padding: "0.5rem" }}>{p.name}</td>

          {/* Category */}
          <td style={{ padding: "0.5rem" }}>{p.category}</td>

          {/* Quantity */}
          <td
            style={{
              padding: "0.5rem",
              color: totalQty <= minQty ? "#FF4C4C" : "#000",
              fontWeight: totalQty <= minQty ? "bold" : "normal",
            }}
          >
            {totalQty}
          </td>

          {/* Action Buttons */}
          <td style={{ padding: "0.5rem", textAlign: "center" }}>
            <button
              onClick={() =>
                openView({
                  code: p.code,
                  name: p.name,
                  category: p.category,
                })
              }
              title="View"
              style={{
                border: "none",
                backgroundColor: "#00A76F",
                color: "#fff",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#007867")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#00A76F")
              }
            >
              <FaEye />
            </button>
          </td>
        </tr>
      );
    })
  )}
</tbody>

          </table>
           {/* Pagination */}
  <Pagination page={page} totalPages={totalPages} onPageChange={fetchProducts} />
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) {
            table { min-width: 100%; font-size: 0.9rem; }
            th, td { padding: 0.5rem; }
            button { padding: 0.4rem 0.6rem; }
          }
        `}</style>
      </div>

      {/* View Modal */}
      {/* {showViewModal && (
        <Modal onClose={closeView} title="Product Details" className="wide-modal">
          <div className="product-info-grid">
            <div>
              <p><strong>Code:</strong> {showViewModal.code}</p>
              <p><strong>Category:</strong> {showViewModal.category}</p>
            </div>
            <div>
              <p><strong>Name:</strong> {showViewModal.name}</p>
              <p><strong>Total Qty:</strong> {getBatches(showViewModal).reduce((sum, b) => sum + (Number(b.qty) || 0), 0)}</p>
            </div>
          </div>

          <h4 style={{ fontWeight: "bold", marginTop: "12px" }}>Batch Details</h4>

          <div className="batch-table-wrapper" style={{ maxHeight: 320, overflow: "auto" }}>
            <table className="table clean small">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Batch No</th>
                  <th>Qty</th>
                  <th>Min Qty</th>
                  <th>MRP</th>
                  <th>Rate</th>
                  <th>Tax %</th>
                  <th>Tax Mode</th>
                </tr>
              </thead>
              <tbody>
                {getBatches(showViewModal).map((b, idx) => {
                  const qty = Number(b.qty || 0);
                  const minQty = Number(b.minQty || 0);
                  return (
                    <tr key={b._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{b.batchNo}</td>
                      <td className={qty <= minQty ? "danger" : ""}>{qty}</td>
                      <td>{minQty || "-"}</td>
                      <td>{Number(b.mrp || 0).toFixed(2)}</td>
                      <td>{Number(b.salePrice || 0).toFixed(2)}</td>
                      <td>{b.taxPercent}%</td>
                      <td>{b.taxMode}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="modal-actions">
            <button className="btn btn-muted" onClick={closeView}>Close</button>
          </div>
        </Modal>
      )} */}

      
 {/* 🔹 View Product Modal */}
{showViewModal && (
  <Modal
    onClose={closeView}
    title={`Product Details - ${showViewModal.name}`}
    className="wide-modal"
  >
    <div className="product-info-grid">
      <div>
        <p><strong>Code:</strong> {showViewModal.code}</p>
        <p><strong>Category:</strong> {showViewModal.category || "-"}</p>
      </div>
      <div>
        <p><strong>Name:</strong> {showViewModal.name}</p>
        <p>
          <strong>Total Qty:</strong>{" "}
          {getBatches(showViewModal).reduce((sum, b) => {
            const liveQty = typeof getStockCache === "function"
              ? getStockCache(showViewModal.code, b.batchNo)
              : Number(b.qty || 0);
            return sum + liveQty;
          }, 0)}
        </p>
      </div>
    </div>

    <h4 className="mt-3 font-semibold">Batch Details</h4>
    <div className="batch-table-wrapper overflow-x-auto">
      <table className="table clean small">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Batch No</th>
            <th>Qty</th>
            <th>Min Qty</th>
            <th>MRP</th>
            <th>Rate</th>
            <th>Tax %</th>
            <th>Tax Mode</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {getBatches(showViewModal).map((b, idx) => {
            const minQty = Number(b.minQty || 0);
            const resultingStock = typeof getStockCache === "function"
              ? getStockCache(showViewModal.code, b.batchNo)
              : Number(b.qty || 0);

            return (
              // <tr key={b._id || idx}>
              <tr key={`${b.batchNo}-${b._id || idx}`}>

                <td>{idx + 1}</td>
                <td>{b.batchNo}</td>
                <td className={resultingStock <= minQty ? "danger" : ""}>
                  {resultingStock}
                </td>
                <td>{minQty || "-"}</td>
                <td>{Number(b.mrp || 0).toFixed(2)}</td>
                <td>{Number(b.salePrice || b.rate || 0).toFixed(2)}</td>
                <td>{b.taxPercent || 0}%</td>
                <td>{b.taxMode || "-"}</td>
                <td>
                  <FaEdit
                    title="Edit Min Qty"
                    className="cursor-pointer text-orange-500"
                    onClick={() =>
                      setEditBatch({
                        code: showViewModal.code,
                        batchNo: b.batchNo,
                        minQty: minQty,
                      })
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
        
      </table>
    </div>

    <div className="modal-actions mt-4">
      <button className="btn btn-muted" onClick={closeView}>
        Close
      </button>
    </div>
  </Modal>
)}

{/* 🔹 Edit Min Qty Modal */}


{/* 🔹 Edit Min Qty Modal */}
{/* 
{editBatch && (
  <Modal
    onClose={() => setEditBatch(null)}
    title={`Edit Min Qty - ${editBatch.batchNo}`}
  >
    <div className="edit-minqty-form">
      <label><strong>New Min Qty:</strong></label>
      <input
        type="number"
        min={0}
        value={editBatch.minQty ?? 0}
        onChange={(e) =>
          setEditBatch((prev) => ({
            ...prev,
            minQty: Number(e.target.value),
          }))
        }
        className="input mt-1"
      />

      <div className="modal-actions mt-3">
        <button
          className="btn btn-success"
          onClick={async () => {
            if (!editBatch.code || !editBatch.batchNo) {
              pushToast("Missing code or batch number");
              return;
            }

            try {
              await handleSaveMinQty(editBatch); // Backend API call

              // Safe update of batches in current product view
              setShowViewModal((prev) => {
                if (!prev?.batches) return prev;
                return {
                  ...prev,
                  batches: prev.batches.map((b) =>
                    b.batchNo === editBatch.batchNo
                      ? { ...b, minQty: editBatch.minQty ?? 0 }
                      : b
                  ),
                };
              });

              setEditBatch(null);
              pushToast("Min Qty updated successfully");
            } catch (err) {
              console.error("handleSaveMinQty error:", err);
              pushToast(
                err.response?.data?.message || "Failed to update Min Qty"
              );
            }
          }}
        >
          Save
        </button>

        <button className="btn btn-muted" onClick={() => setEditBatch(null)}>
          Cancel
        </button>
      </div>
    </div>
  </Modal>
)} */}


{editBatch && (
  <Modal
    onClose={() => setEditBatch(null)}
    title={`Edit Min Qty - ${editBatch.batchNo || "Unknown Batch"}`}
  >
    <div className="edit-minqty-form">
      <label className="block mb-1 font-medium">New Min Qty:</label>
      <input
        type="number"
        min={0}
        value={editBatch.minQty ?? 0}
        onChange={(e) =>
          setEditBatch((prev) => ({
            ...prev,
            minQty: Number(e.target.value),
          }))
        }
        className="input mt-1 border rounded p-1 w-full"
      />

      <div className="modal-actions mt-3 flex gap-2 justify-end">
        <button
          className="btn btn-success"
          onClick={async () => {
            if (!editBatch.code || !editBatch.batchNo) {
              pushToast("Missing product code or batch number");
              return;
            }

            try {
              // ✅ API call
              await handleSaveMinQty({
                code: editBatch.code,
                batchNo: editBatch.batchNo,
                minQty: editBatch.minQty ?? 0,
              });

              // ✅ Update batch list in product modal safely
              setShowViewModal((prev) => {
                if (!prev?.batches) return prev;
                return {
                  ...prev,
                  batches: prev.batches.map((b) =>
                    b.batchNo === editBatch.batchNo
                      ? { ...b, minQty: editBatch.minQty ?? 0 }
                      : b
                  ),
                };
              });

              pushToast("✅ Min Qty updated successfully");
              setEditBatch(null);
            } catch (err) {
              console.error("handleSaveMinQty error:", err);
              pushToast(
                err.response?.data?.message ||
                  "❌ Failed to update Min Qty"
              );
            }
          }}
        >
          Save
        </button>

        <button
          className="btn btn-muted"
          onClick={() => setEditBatch(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </Modal>
)}




      {/* Create Product Modal */}
      {showCreateModal && (
        <Modal onClose={closeCreate} title="Create Product">
          <form onSubmit={onCreate} className="product-form" autoComplete="off">
            <div className="form-grid">
              {/* Left */}
              <div className="form-col">
                {/* <div className="form-row">
                  <label>Product Code</label>
                  <input className="input" value={form.code || "(select a product name)"} disabled />
                </div> */}
                <div className="form-row wide relative">
  <label>Product Code</label>
  <input
    className="input"
    value={form.code || ""}
    onChange={(e) => onCodeChange(e.target.value)}
    onFocus={() => form.code && setShowCodeSuggestions(true)}
    placeholder="Type or select product code"
  />

  {showCodeSuggestions && uniqueCodeSuggestions.length > 0 && (
    <div className="suggestions">
      {uniqueCodeSuggestions.map((s) => (
        <div
          key={s._id || s.code}
          className="suggestion"
          onClick={() => selectCodeSuggestion(s)}
        >
          <span>{s.code}</span>
        </div>
      ))}
    </div>
  )}
</div>


                <div className="form-row">
                  <label>Short Name</label>
                  <input className="input" value={form.shortName} onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))} placeholder="e.g., Blue Pen" />
                </div>

                <div className="form-row wide relative">
                  <label>Batch No</label>
                  <input className="input" placeholder="Enter or select batch number" value={form.batchNo} onChange={(e) => { const v = e.target.value; setForm((f) => ({ ...f, batchNo: v })); setShowBatchList(v.trim() === ""); }} onFocus={() => setShowBatchList(true)} onBlur={() => { setTimeout(() => { setShowBatchList((prev) => (form.batchNo ? false : prev)); }, 150); }} />

                  {availableBatches.length > 0 && showBatchList && (
                    <div className="batch-suggestions">
                      <table className="table clean small">
                        <thead>
                          <tr>
                            <th>Batch No</th>
                            <th>MRP</th>
                            <th>Rate</th>
                            <th>Tax %</th>
                            <th>Tax Mode</th>
                            <th>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableBatches.map((b) => (
                            <tr key={b._id || b.batchNo} className="batch-row" onClick={() => { onBatchSelect(b); setShowBatchList(false); }}>
                              <td>{b.batchNo}</td>
                              <td>{Number(b.mrp || 0).toFixed(2)}</td>
                              <td>{Number(b.salePrice || 0).toFixed(2)}</td>
                              <td>{b.taxPercent}%</td>
                              <td>{b.taxMode}</td>
                              <td>{b.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <label>Rate</label>
                  <input className="input" type="number" inputMode="decimal" value={form.salePrice} onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))} placeholder="e.g., 100" />
                </div>
              </div>

              {/* Right */}
              <div className="form-col">
                <div className="form-row wide relative">
                  <label>Product Name</label>
                  <input className="input" value={form.name} onChange={(e) => onNameChange(e.target.value)} onFocus={() => form.name && setShowSuggestions(true)} placeholder="Type or select product" />

                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="suggestions">
                      {nameSuggestions.map((s) => (
                        <div key={s._id || s.name} className="suggestion" onClick={() => selectSuggestion(s)}>
                          <span>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-row with-action">
                  <div className="label-row">
                    <label>Category</label>
                    <button type="button" className="link-action" onClick={openCategoryModal} title="Add Category">+ Category</button>
                  </div>
                  <div className="select-wrap">
                    <select className="input select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="chev" />
                  </div>
                </div>

                <div className="form-row">
                  <label>MRP</label>
                  <input className="input no-spin" type="number" inputMode="decimal" value={form.mrp} onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))} placeholder="e.g., 100" onFocus={enableWheelBlock} onBlur={disableWheelBlock} onKeyDown={(e) => { if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }} />
                </div>

                <div className="form-row">
                  <label>Tax %</label>
                  <input className="input no-spin" type="number" inputMode="decimal" value={form.taxPercent} onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))} placeholder="e.g., 18" onFocus={enableWheelBlock} onBlur={disableWheelBlock} onKeyDown={(e) => { if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }} />
                </div>
              </div>
            </div>

            {/* Tax Mode */}
            <div className="tax-mode">
              <label className="radio">
                <input type="radio" name="taxMode" value="inclusive" checked={form.taxMode === "inclusive"} onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))} />
                <span>Tax Inclusive</span>
              </label>
              <label className="radio">
                <input type="radio" name="taxMode" value="exclusive" checked={form.taxMode === "exclusive"} onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))} />
                <span>Tax Exclusive</span>
              </label>
            </div>

            {/* Summary */}
            {/* <div className="card summary-card">
              <div className="summary-line">
                <span>Base Price</span>
                <strong>{( (parseFloat(form.salePrice || form.price || 0) || 0) ).toFixed(2)}</strong>
              </div>
              <div className="summary-line">
                <span>Tax Amount ({form.taxPercent || 0}%)</span>
                <strong>{0.00.toFixed(2)}</strong>
              </div>
              <div className="summary-line total">
                <span>Total ({form.taxMode})</span>
                <strong>{0.00.toFixed(2)}</strong>
              </div>
            </div> */}

            {/* Summary */}
<div className="card summary-card">
  {(() => {
    const basePrice = parseFloat(form.salePrice || 0);
    const taxPercent = parseFloat(form.taxPercent || 0);
    let taxAmount = 0;
    let total = basePrice;

    if (form.taxMode === "inclusive") {
      taxAmount = basePrice - basePrice / (1 + taxPercent / 100);
      total = basePrice;
    } else if (form.taxMode === "exclusive") {
      taxAmount = (basePrice * taxPercent) / 100;
      total = basePrice + taxAmount;
    }

    return (
      <>
        <div className="summary-line">
          <span>Base Price</span>
          <strong>{basePrice.toFixed(2)}</strong>
        </div>
        <div className="summary-line">
          <span>Tax Amount ({taxPercent}%)</span>
          <strong>{taxAmount.toFixed(2)}</strong>
        </div>
        <div className="summary-line total">
          <span>Total ({form.taxMode})</span>
          <strong>{total.toFixed(2)}</strong>
        </div>
      </>
    );
  })()}
</div>


            {/* Qty & Minimum Qty */}
            <div className="form-row-inline">
              <div className="form-row small">
                <label>Qty</label>
                <input className="input" type="number" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} placeholder="e.g., 10" />
              </div>

              <div className="form-row small">
                <label>Minimum Qty</label>
                <input className="input" type="number" value={form.minQty || ""} onChange={(e) => setForm((f) => ({ ...f, minQty: e.target.value }))} placeholder="e.g., 5" />
              </div>
            </div>

            {/* Fixed Actions */}
            <div className="modal-actions fixed">
              <button type="submit" className="btn btn-primary">Create Product</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <Modal onClose={closeCategoryModal} title="Manage Categories" className="narrow-modal" style={{ width: "380px", maxWidth: "90%", margin: "0 auto" }}>
          <div className="category-panel">
            <div className="category-add">
              <input className="input" placeholder="Type a category name" value={categoryDraft} onChange={(e) => setCategoryDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategoryDraft(); } }} />
              {/* <button type="button" className="btn btn-dark" onClick={addCategoryDraft}>Add</button> */}
              <button
  type="button"
  className="btn btn-dark flex items-center gap-2"
  onClick={addCategoryDraft}
>
  <FaPlus color="green" />
  <span className="text-green-500">Add</span>
</button>
           
            </div>

            <div className="category-list">
              {categoryTemp.length === 0 ? (
                <p className="muted">No categories yet.</p>
              ) : (
                categoryTemp.map((c) => (
                  <div key={c} className="chip">
                    <span>{c}</span>
                    <button type="button" className="chip-del" title="Delete" onClick={() => removeTempCategory(c)}>
                      <FaTrash color="red" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveCategories}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Small building blocks ---------- */
function Detail({ label, value }) {
  return (
    <div className="detail">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{String(value ?? "-")}</span>
    </div>
  );
}

function Modal({ title, children, onClose, className = "", style = {}, width }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className={`modal-card slide-up ${className}`} style={{ width: width || "600px", ...style }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-close" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

