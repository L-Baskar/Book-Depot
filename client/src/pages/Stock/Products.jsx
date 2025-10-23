// 1. create product model - product name typing eg b typing show suggetion small or captial b starting letters words show. unique product name show . no need same product name multiple times no needed. new product name typing proper working .

// 2. products main table action coloumn add edit icon orange color near view icon. icon below name edit and view. and edit icon click open a edit model open . particular product code all details with  all batches. i need only min qty edit and updated main table min qty live updated immediatly.

// code unchanged. i need requirement  updated full code dont miss a line



// 1. heading - Products  - right corner - Create Product with react icons
// 2. table content s.no Product code product Name category Batch Number oty MRP Action - view icons green color hover show model - product details
// 3. create Product button click show model - 
//     form format - Left side-Product code, short name, batch no, Sale Price 
//                   right side -  Product name ,category Name dropdown . above category name +Category text format . Add category text click show model - Model Content Add Categories center professioanal looks input box add category show input below with delete icon. and then save and cancel button.save button click show category name dropdown list add and show.  cancel button click model close. input below delete text imediate delete for categories dropdown.
//                                Price Tax % 

// 4. and then below form calculate above form condition . Tax - inclusive and exclusive - Ratio button                               
// 5 . Create product show product P001 created

// i need all content responsive on all devices. looks like professionally add animation and transaction. using hover effect. button color 00A76f 007867 c8fad6.  also follow design looks like sales bill format.
// and then external css file format



//create product model. product name type - product code, short name, category auto fill from product home page table. product name type drop down show all list show with style eg. a type a letters all name show 
// when user type product name dont name from database . auto generate new code f 




// i need products home page table batch number dont need table. i need batch number  view button click particular batch number show. and then example products home table
// no need same product code show .view button click - show view details. and then table format show batch details and particular product name details 

// i need i type product name and then when dropdown selected show batch no input box popup show Batch list - once select batch list auto fill MRp rate quantiy tax and tax mode. and important once i erase product name reset all auto fill 





// create product minimum qty number of qty fill show products home table action view button click batch detail minimum qty coloum add near qty .










//10/10/2023 15:07

// // // src/pages/Stock/Products.jsx
// import { useMemo, useState, useEffect, useRef } from "react";
// import { FaPlus, FaEye, FaTimes, FaChevronDown, FaTrash } from "react-icons/fa";
// import "../../styles/products.css";
// import { useAuth } from "../../context/AuthContext";
// import apiClient from "../../utils/apiClient";
// import { getApiUrl } from "../../utils/api";

// export default function Products() {
//   const { user } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [nextCode, setNextCode] = useState("");

//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [categoryDraft, setCategoryDraft] = useState("");
//   const [categoryTemp, setCategoryTemp] = useState([]);

//   const [nameSuggestions, setNameSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);

//   const [availableBatches, setAvailableBatches] = useState([]);
//   const [showBatchList, setShowBatchList] = useState(true);

//   const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);

//   // For manager/megaadmin: selected shop
//   const [selectedShop, setSelectedShop] = useState("" );

//   const [form, setForm] = useState({
//     code: "",
//     shortName: "",
//     batchNo: "",
//     salePrice: "",
//     name: "",
//     category: "",
//     price: "",
//     taxPercent: "",
//     taxMode: "exclusive",
//     qty: "",
//     mrp: "",
//     minQty: "",
//   });

//   const wheelPreventerRef = useRef(null);

//   // -------------------------------
//   // Toast helper
//   // -------------------------------
//   const pushToast = (msg) => {
//     const id = Date.now();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
//   };

//   // -------------------------------
// // API path helper
// // -------------------------------
// const getApiPath = (endpoint) => {
//   const ep = endpoint.replace(/^\//, "");
//   if (!user) return getApiUrl(ep);

//   // Tenant user: send normal endpoint, header includes shopname
//   if (user.role === "tenant") return getApiUrl(ep);

//   // Manager/Megaadmin: include selectedShop in path
//   if ((user.role === "manager" || user.role === "megaadmin") && selectedShop) {
//     return getApiUrl(`api/shops/${selectedShop}/${ep}`);
//   }

//   return getApiUrl(ep);
// };



//   // -------------------------------
//   // Fetch products & categories
//   // -------------------------------
//   const fetchProducts = async () => {
//     if (!user) return;
//     try {
//       const res = await apiClient.get(getApiPath("products"));
//       setProducts(res.data || []);
//     } catch (err) {
//       console.error("fetchProducts error:", err);
//       pushToast(`Failed to fetch products${selectedShop ? ` for shop ${selectedShop}` : ""}`);
//     }
//   };
  
// const fetchCategories = async () => {
//   if (!user) return;
//   try {
//     const res = await apiClient.get(getApiPath("categories"));

//     // Normalize categories to an array
//     const cats = Array.isArray(res.data) 
//       ? res.data 
//       : Array.isArray(res.data?.categories) 
//         ? res.data.categories 
//         : [];

//     setCategories(cats);
//   } catch (err) {
//     console.error("fetchCategories error:", err);
//     pushToast("Failed to fetch categories");
//   }
// };


//   useEffect(() => {
//   const loadData = async () => {
//     await fetchProducts();
//     await fetchCategories();
//   };
//   if (user) loadData();
// }, [user, selectedShop]);


//   // -------------------------------
//   // Filtered products
//   // -------------------------------
//   const filtered = useMemo(() => {
//     const s = search.trim().toLowerCase();
//     if (!s) return products;
//     return products.filter((p) =>
//       [p.code, p.name, p.category].some((v) => v?.toLowerCase().includes(s))
//     );
//   }, [search, products]);

//   // -------------------------------
//   // Helper: get batches
//   // -------------------------------
//   const getBatches = (prod) => products.filter((p) => p.code === prod.code && p.name === prod.name);

//   // -------------------------------
//   // Apply decrements helper
//   // -------------------------------
//   const applyDecrementsToProducts = (prevProducts, decrements) => {
//     const productsCopy = prevProducts.map((p) => ({ ...p }));
//     for (const d of decrements) {
//       const code = (d.code || "").toLowerCase();
//       const batchNo = (d.batchNo || "").toLowerCase();
//       let remaining = Number(d.qty || 0);

//       for (let i = 0; i < productsCopy.length && remaining > 0; i++) {
//         const p = productsCopy[i];
//         if ((p.code || "").toLowerCase() === code && (p.batchNo || "").toLowerCase() === batchNo) {
//           const available = Number(p.qty || 0);
//           if (available <= 0) continue;
//           const take = Math.min(available, remaining);
//           p.qty = Math.max(0, available - take);
//           remaining -= take;
//         }
//       }
//     }
//     return productsCopy;
//   };

//   const decrementStockOnServer = async (items) => {
//     if (!Array.isArray(items) || items.length === 0) return;
//     try {
//       await apiClient.put(getApiPath("products/decrement-stock"), { items });
//       setProducts((prev) => applyDecrementsToProducts(prev, items));
//       await fetchProducts();
//       pushToast("Stock updated");
//     } catch (err) {
//       console.error("decrementStockOnServer:", err);
//       pushToast("Failed to update stock on server");
//     }
//   };

//   // -------------------------------
//   // Unique products by code + name
//   // -------------------------------
//   const uniqueProducts = useMemo(() => {
//     const map = new Map();
//     products.forEach((p) => {
//       const key = `${p.code}-${p.name}`;
//       if (!map.has(key)) map.set(key, p);
//     });
//     return Array.from(map.values());
//   }, [products]);

//   const uniqueNameSuggestions = useMemo(() => {
//     const seen = new Set();
//     return uniqueProducts.filter((p) => {
//       if (seen.has(p.name.toLowerCase())) return false;
//       seen.add(p.name.toLowerCase());
//       return true;
//     });
//   }, [uniqueProducts]);

//   // -------------------------------
//   // Tax summary
//   // -------------------------------
//   const taxSummary = useMemo(() => {
//     const priceNum = parseFloat(form.salePrice || form.price || 0) || 0;
//     const tax = parseFloat(form.taxPercent || 0) || 0;
//     if (!priceNum || !tax) return { base: priceNum, taxAmt: 0, total: priceNum, mode: form.taxMode };
//     if (form.taxMode === "exclusive") {
//       const taxAmt = +(priceNum * (tax / 100)).toFixed(2);
//       const total = +(priceNum + taxAmt).toFixed(2);
//       return { base: priceNum, taxAmt, total, mode: "exclusive" };
//     } else {
//       const base = +((priceNum * 100) / (100 + tax)).toFixed(2);
//       const taxAmt = +(priceNum - base).toFixed(2);
//       return { base, taxAmt, total: priceNum, mode: "inclusive" };
//     }
//   }, [form.salePrice, form.price, form.taxPercent, form.taxMode]);

//   // -------------------------------
//   // Form & modal helpers
//   // -------------------------------
//   const resetForm = (code = "") => {
//     setForm({
//       code,
//       shortName: "",
//       batchNo: "",
//       salePrice: "",
//       name: "",
//       category: "",
//       price: "",
//       taxPercent: "",
//       taxMode: "exclusive",
//       qty: "",
//       mrp: "",
//       minQty: "",
//     });
//     setAvailableBatches([]);
//     setShowBatchList(true);
//   };

//   const openCreate = async () => {
//     try {
//       const { data } = await apiClient.get(getApiPath("products/next-code"));
//       resetForm(data.nextCode);
//       setNextCode(data.nextCode);
//       setShowCreateModal(true);
//     } catch (err) {
//       console.error("Failed to get next code", err);
//       pushToast("Failed to generate code");
//     }
//   };
//   const closeCreate = () => setShowCreateModal(false);
//   const openView = (prod) => setShowViewModal(prod);
//   const closeView = () => setShowViewModal(null);

//   // -------------------------------
//   // Product name suggestions
//   // -------------------------------
//   const onNameChange = async (val) => {
//     setForm((f) => ({ ...f, name: val, batchNo: "" }));
//     setAvailableBatches([]);
//     setShowBatchList(true);

//     if (!val.trim()) {
//       const { data } = await apiClient.get(getApiPath("products/next-code"));
//       resetForm(data.nextCode);
//       setNextCode(data.nextCode);
//       setShowSuggestions(false);
//       return;
//     }

//     const matches = products.filter((p) => p.name.toLowerCase().includes(val.toLowerCase()));
//     setNameSuggestions(matches);
//     setShowSuggestions(true);
//       setUniqueNameSuggestions(uniqueMatches); 

//     const exact = products.find((p) => p.name.toLowerCase() === val.toLowerCase());
//     if (exact) {
//       const batches = getBatches(exact);
//       setAvailableBatches(batches);
//       setForm((f) => ({ ...f, code: exact.code, shortName: exact.shortName, category: exact.category }));
//       setShowBatchList(true);
//     } else {
//       const { data } = await apiClient.get(getApiPath("products/next-code"));
//       setForm((f) => ({ ...f, code: data.nextCode }));
//       setNextCode(data.nextCode);
//     }
//   };

//   const selectSuggestion = (prod) => {
//     const batches = getBatches(prod);
//     setAvailableBatches(batches);
//     setForm((f) => ({
//       ...f,
//       name: prod.name,
//       code: prod.code,
//       shortName: prod.shortName,
//       category: prod.category,
//       batchNo: "",
//     }));
//     setShowSuggestions(false);
//     setShowBatchList(true);
//   };

//   const onBatchSelect = (batch) => {
//     setForm((f) => ({
//       ...f,
//       batchNo: batch.batchNo,
//       mrp: batch.mrp,
//       salePrice: batch.salePrice,
//       qty: batch.qty,
//       taxPercent: batch.taxPercent,
//       taxMode: batch.taxMode,
//     }));
//     setShowBatchList(true);
//   };

//   // -------------------------------
//   // Create product
//   // -------------------------------

//   const onCreate = async (e) => {
//   e.preventDefault();
//   if (!form.name) return alert("Product name is required");
//   if (!form.batchNo) return alert("Batch No is required");

//   try {
//     const payload = {
//       ...form,
//       shop: user.shop || selectedShop, // <-- add the shop
//       qty: Number(form.qty || 0),
//       mrp: Number(form.mrp || 0),
//       salePrice: Number(form.salePrice || 0),
//       taxPercent: Number(form.taxPercent || 0),
//       minQty: Number(form.minQty || 0),
//         code: form.code, 
//     };

//     const { data } = await apiClient.post(getApiPath("products"), payload);
//     setProducts((prev) => [data, ...prev]);
//     if (data.name === form.name && data.code === form.code) {
//       setAvailableBatches((prev) => [data, ...prev]);
//     }
//     setShowCreateModal(false);
//     pushToast("Product / Batch saved");
//   } catch (err) {
//     console.error(err);
//     alert(err.response?.data?.error || "Failed to create product");
//   }
// };


//   // -------------------------------
//   // Category modal helpers
//   // -------------------------------
//   const openCategoryModal = () => {
//     setCategoryTemp(categories);
//     setCategoryDraft("");
//     setShowCategoryModal(true);
//   };
//   const closeCategoryModal = () => setShowCategoryModal(false);

//   const addCategoryDraft = () => {
//     const name = categoryDraft.trim();
//     if (!name) return;
//     if (!categoryTemp.includes(name)) setCategoryTemp((x) => [...x, name]);
//     setCategoryDraft("");
//   };
//   const removeTempCategory = (name) => setCategoryTemp((x) => x.filter((c) => c !== name));

//   const saveCategories = async () => {
//     if (!categoryTemp || categoryTemp.length === 0) {
//       pushToast("No categories to save");
//       return;
//     }
//     try {
//       const { data } = await apiClient.put(getApiPath("categories"), { categories: categoryTemp });
//       setCategories(Array.isArray(data) ? data : []);
//       if (form.category && !data.includes(form.category)) setForm((f) => ({ ...f, category: "" }));
//       setShowCategoryModal(false);
//       pushToast("Categories saved");
//     } catch (err) {
//       console.error("Failed to save categories:", err);
//       pushToast("Failed to save categories");
//     }
//   };

//   // -------------------------------
//   // Wheel prevention
//   // -------------------------------
//   const wheelHandler = (e) => {
//     if (
//       document.activeElement &&
//       (document.activeElement.type === "number" || document.activeElement.inputMode === "decimal")
//     ) e.preventDefault();
//   };
//   const enableWheelBlock = () => {
//     if (!wheelPreventerRef.current) {
//       wheelPreventerRef.current = wheelHandler;
//       window.addEventListener("wheel", wheelPreventerRef.current, { passive: false, capture: true });
//     }
//   };
//   const disableWheelBlock = () => {
//     if (wheelPreventerRef.current) {
//       window.removeEventListener("wheel", wheelPreventerRef.current, { capture: true });
//       wheelPreventerRef.current = null;
//     }
//   };

//   // -------------------------------
//   // Listen for product refresh event
//   // -------------------------------
//   useEffect(() => {
//     const handler = async (e) => {
//       const items = e?.detail?.items;
//       if (Array.isArray(items) && items.length > 0) {
//         setProducts((prev) => applyDecrementsToProducts(prev, items));
//       }
//       await fetchProducts();
//       pushToast("Products refreshed");
//     };
//     window.addEventListener("products:refresh", handler);
//     return () => window.removeEventListener("products:refresh", handler);
//   }, []);

// // -------------------------------
// // Listen for sales bill updates (live stock decrement)
// // -------------------------------
// useEffect(() => {
//   const handleSalesBillUpdate = async (e) => {
//     const { newItems = [], oldItems = [] } = e?.detail || {};

//     if (!Array.isArray(newItems)) return;

//     // Calculate net decrements (new qty - old qty if editing)
//     const decrements = newItems.map((item) => {
//       let prevQty = 0;
//       if (oldItems.length > 0) {
//         const match = oldItems.find((o) => o.code === item.code && o.batch === item.batch);
//         if (match) prevQty = Number(match.qty || 0);
//       }
//       const netQty = Number(item.qty || 0) - prevQty;
//       return netQty > 0
//         ? { code: item.code, batchNo: item.batch, qty: netQty }
//         : null;
//     }).filter(Boolean);

//     if (decrements.length === 0) return;

//     // Apply decrements locally
//     setProducts((prev) => applyDecrementsToProducts(prev, decrements));

//     // Optional: refresh from server
//     await fetchProducts();
//     pushToast("Stock updated from sales bill");
//   };

//   window.addEventListener("salesbill:updated", handleSalesBillUpdate);
//   return () => window.removeEventListener("salesbill:updated", handleSalesBillUpdate);
// }, []);




// // Handle typing in Product Code
// const onCodeChange = (val) => {
//   setForm((f) => ({ ...f, code: val }));
//   setShowCodeSuggestions(true);

//   if (!val.trim()) {
//     // Reset auto-fill if code is erased
//     resetForm();
//     setShowCodeSuggestions(false);
//     return;
//   }

//   const matches = products.filter((p) =>
//     p.code.toLowerCase().includes(val.toLowerCase())
//   );
//   setShowCodeSuggestions(matches.length > 0);

//   const exact = products.find((p) => p.code.toLowerCase() === val.toLowerCase());
//   if (exact) {
//     const batches = getBatches(exact);
//     setAvailableBatches(batches);
//     setForm((f) => ({
//       ...f,
//       name: exact.name,
//       shortName: exact.shortName,
//       category: exact.category,
//       batchNo: "",
//     }));
//     setShowBatchList(true);
//   }
// };

// // Handle selecting a code suggestion
// const selectCodeSuggestion = (prod) => {
//   const batches = getBatches(prod);
//   setAvailableBatches(batches);
//   setForm((f) => ({
//     ...f,
//     code: prod.code,
//     name: prod.name,
//     shortName: prod.shortName,
//     category: prod.category,
//     batchNo: "",
//   }));
//   setShowCodeSuggestions(false);
//   setShowBatchList(true);
// };

// const uniqueCodeSuggestions = useMemo(() => {
//   const seen = new Set();
//   return products
//     .filter((p) => {
//       if (seen.has(p.code)) return false;
//       seen.add(p.code);
//       return true;
//     })
//     .filter((p) =>
//       form.code ? p.code.toLowerCase().includes(form.code.toLowerCase()) : true
//     )
//     .slice(0, 5); // top 5 suggestions
// }, [products, form.code]);


//   return (
//     <div className="products-page">
//       {/* Toasts */}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className="toast">
//             {t.msg}
//           </div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="products-header">
//         <h1 className="title">Products</h1>
   
//      <button className="btn btn-primary" onClick={openCreate}>
//           <FaPlus /> Create Product
//         </button>
    
        
//       </div>

//       {/* Toolbar */}
//       <div className="products-toolbar">
//         <div className="search-wrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="Search by code / name / category"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Table */}
    
      
//    {/* Table */}
// <div className="card table-card" style={{ width: "100%", overflowX: "auto" }}>
//   <div className="table-responsive" style={{ minWidth: "100%" }}>
//     <table
//       className="table clean"
//       style={{
//         width: "100%",
//         borderCollapse: "collapse",
//         minWidth: "600px",
//       }}
//     >
//       <thead>
//         <tr
//           style={{
//             backgroundColor: "#007867",
//             color: "#fff",
//             textAlign: "left",
//           }}
//         >
//           <th style={{ padding: "0.75rem" }}>S.No</th>
//           <th style={{ padding: "0.75rem" }}>Product Code</th>
//           <th style={{ padding: "0.75rem" }}>Product Name</th>
//           <th style={{ padding: "0.75rem" }}>Category</th>
//           <th style={{ padding: "0.75rem" }}>Qty</th>
//           {/* <th style={{ padding: "0.75rem" }}>Min Qty</th> */}
//           <th style={{ padding: "0.75rem" }} className="text-center">
//             Action
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {filtered.length === 0 ? (
//           <tr>
//             <td colSpan="7" style={{ textAlign: "center", padding: "1rem", color: "#777" }}>
//               No products found
//             </td>
//           </tr>
//         ) : (
//           // Group by product code to show one row per product
//           Object.values(
//             filtered.reduce((acc, p) => {
//               if (!acc[p.code]) {
//                 acc[p.code] = { ...p }; // first product instance
//               } else {
//                 // optional: merge batches if p has new ones
//                 acc[p.code].batches = [
//                   ...(acc[p.code].batches || getBatches(acc[p.code])),
//                   ...(getBatches(p) || []),
//                 ].filter(
//                   (b, idx, self) =>
//                     idx === self.findIndex((t) => t.batchNo === b.batchNo)
//                 ); // remove duplicate batches
//               }
//               return acc;
//             }, {})
//           ).map((p, idx) => {
//             const batches = p.batches || getBatches(p); // all batches
//             const totalQty = batches.reduce((sum, b) => sum + Number(b.qty || 0), 0);
//             const minQty = Math.min(...batches.map((b) => Number(b.minQty || Infinity)));

//             return (
//               <tr
//                 key={p._id || p.code}
//                 style={{
//                   transition: "all 0.3s ease",
//                   opacity: 0,
//                   animation: "fadeIn 0.5s forwards",
//                   cursor: "default",
//                 }}
//                 className="fade-in"
//               >
//                 <td style={{ padding: "0.5rem" }}>{idx + 1}</td>
//                 <td style={{ padding: "0.5rem" }}>{p.code}</td>
//                 <td style={{ padding: "0.5rem" }}>{p.name}</td>
//                 <td style={{ padding: "0.5rem" }}>{p.category}</td>

//                 {/* Qty column - highlight if ≤ min qty */}
//                 <td
//                   style={{
//                     padding: "0.5rem",
//                     color: totalQty <= minQty ? "#FF4C4C" : "#000",
//                     fontWeight: totalQty <= minQty ? "bold" : "normal",
//                   }}
//                 >
//                   {totalQty}
//                 </td>

//                 {/* Min Qty column */}
//                 {/* <td style={{ padding: "0.5rem" }}>{minQty === Infinity ? "-" : minQty}</td> */}

//                 <td style={{ padding: "0.5rem", textAlign: "center" }}>
//                   <button
//                     onClick={() => openView({ ...p, batches })} // pass product + all batches
//                     title="View Details"
//                     style={{
//                       border: "none",
//                       backgroundColor: "#00A76F",
//                       color: "#fff",
//                       padding: "0.5rem 0.75rem",
//                       borderRadius: "0.5rem",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => (e.target.style.backgroundColor = "#007867")}
//                     onMouseLeave={(e) => (e.target.style.backgroundColor = "#00A76F")}
//                   >
//                     <FaEye />
//                   </button>
//                 </td>
//               </tr>
//             );
//           })
//         )}
//       </tbody>
//     </table>
//   </div>

//   <style>
//     {`
//       @keyframes fadeIn {
//         from { opacity: 0; transform: translateY(10px); }
//         to { opacity: 1; transform: translateY(0); }
//       }

//       @media (max-width: 768px) {
//         table {
//           min-width: 100%;
//           font-size: 0.9rem;
//         }

//         th, td {
//           padding: 0.5rem;
//         }

//         button {
//           padding: 0.4rem 0.6rem;
//         }
//       }
//     `}
//   </style>
// </div>


// {/* View Modal */}


// {showViewModal && (
//   <Modal onClose={closeView} title="Product Details" className="wide-modal">
//     <div className="product-info-grid">
//       <div>
//         <p><strong>Code:</strong> {showViewModal.code}</p>
//         <p><strong>Category:</strong> {showViewModal.category}</p>
//       </div>
//       <div>
//         <p><strong>Name:</strong> {showViewModal.name}</p>
//         <p>
//           <strong>Total Qty:</strong>{" "}
//           {getBatches(showViewModal).reduce((sum, b) => {
//             const liveQty = typeof getStockCache === "function"
//               ? getStockCache(showViewModal.code, b.batchNo)
//               : Number(b.qty || 0);
//             return sum + liveQty;
//           }, 0)}
//         </p>
//       </div>
//     </div>

//     <h4 style={{ fontWeight: "bold", marginTop: "12px" }}>Batch Details</h4>
//     <div className="batch-table-wrapper">
//       <table className="table clean small">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Batch No</th>
//             <th>Qty</th>
//             <th>Min Qty</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Tax %</th>
//             <th>Tax Mode</th>
//           </tr>
//         </thead>
//         <tbody>
//           {getBatches(showViewModal).map((b, idx) => {
//             const minQty = Number(b.minQty || 0);
//             const resultingStock = typeof getStockCache === "function"
//               ? getStockCache(showViewModal.code, b.batchNo)
//               : Number(b.qty || 0);

//             return (
//               <tr key={b._id || idx}>
//                 <td>{idx + 1}</td>
//                 <td>{b.batchNo}</td>
//                 <td className={resultingStock <= minQty ? "danger" : ""}>
//                   {resultingStock}
//                 </td>
//                 <td>{minQty || "-"}</td>
//                 <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                 <td>{Number(b.salePrice || b.rate || 0).toFixed(2)}</td>
//                 <td>{b.taxPercent || 0}%</td>
//                 <td>{b.taxMode || "-"}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>

//     <div className="modal-actions">
//       <button className="btn btn-muted" onClick={closeView}>
//         Close
//       </button>
//     </div>
//   </Modal>
// )}


//       {/* Create Product Modal */}
//       {showCreateModal && (
//         <Modal onClose={closeCreate} title="Create Product">
//           <form onSubmit={onCreate} className="product-form" autoComplete="off">
//             <div className="form-grid">
//               {/* Left */}
//               <div className="form-col">
//                 {/* <div className="form-row">
//                   <label>Product Code</label>
//                   <input className="input" value={form.code || "(select a product name)"} disabled />
//                 </div> */}

// <div className="form-row wide relative">
//   <label>Product Code</label>
//   <input
//     className="input"
//     value={form.code || ""}
//     onChange={(e) => onCodeChange(e.target.value)}
//     onFocus={() => form.code && setShowCodeSuggestions(true)}
 
//   />

//   {showCodeSuggestions && uniqueCodeSuggestions.length > 0 && (
//     <div className="suggestions">
//       {uniqueCodeSuggestions.map((s) => (
//         <div
//           key={s._id || s.code}
//           className="suggestion"
//           onClick={() => selectCodeSuggestion(s)}
//         >
//           <span>{s.code}</span>
//         </div>
//       ))}
//     </div>
//   )}
// </div>



//                 <div className="form-row">
//                   <label>Short Name</label>
//                   <input
//                     className="input"
//                     value={form.shortName}
//                     onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                   
//                   />
//                 </div>

//                 {/* Batch No */}
//                 <div className="form-row wide relative">
//                   <label>Batch No</label>
//                   <input
//                     className="input"
                
//                     value={form.batchNo}
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       setForm((f) => ({ ...f, batchNo: v }));
//                       setShowBatchList(v.trim() === "");
//                     }}
//                     onFocus={() => setShowBatchList(true)}
//                     onBlur={() => {
//                       setTimeout(() => {
//                         setShowBatchList((prev) => (form.batchNo ? false : prev));
//                       }, 150);
//                     }}
//                   />

//                   {availableBatches.length > 0 && showBatchList && (
//                     <div className="batch-suggestions">
//                       <table className="table clean small">
//                         <thead>
//                           <tr>
//                             <th>Batch No</th>
//                             <th>MRP</th>
//                             <th>Rate</th>
//                             <th>Tax %</th>
//                             <th>Tax Mode</th>
//                             <th>Qty</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {availableBatches.map((b) => (
//                             <tr
//                               key={b._id || b.batchNo}
//                               className="batch-row"
//                               onClick={() => {
//                                 onBatchSelect(b);
//                                 setShowBatchList(false);
//                               }}
//                             >
//                               <td>{b.batchNo}</td>
//                               <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                               <td>{Number(b.salePrice || 0).toFixed(2)}</td>
//                               <td>{b.taxPercent}%</td>
//                               <td>{b.taxMode}</td>
//                               <td>{b.qty}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>

//                 <div className="form-row">
//                   <label>Rate</label>
//                   <input
//                     className="input"
//                     type="number"
//                     inputMode="decimal"
//                     value={form.salePrice}
//                     onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                    
//                   />
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="form-col">
//                 {/* <div className="form-row wide relative">
//                   <label>Product Name</label>
//                   <input
//                     className="input"
//                     value={form.name}
//                     onChange={(e) => onNameChange(e.target.value)}
//                     onFocus={() => form.name && setShowSuggestions(true)}
//                     placeholder="Type or select product"
//                   />

//                   {showSuggestions && uniqueNameSuggestions.length > 0 && (
//                     <div className="suggestions">
//                       {uniqueNameSuggestions.map((s) => (
//                         <div
//                           key={s._id || s.name}
//                           className="suggestion"
//                           onClick={() => selectSuggestion(s)}
//                         >
//                           <span>{s.name}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div> */}
//                 {/* <div className="form-row wide relative">
//   <label>Product Name</label>
//   <input
//     className="input"
//     value={form.name}
//     onChange={(e) => onNameChange(e.target.value)}
//     onFocus={() => form.name && setShowSuggestions(true)}
   
//   />

//   {showSuggestions && uniqueNameSuggestions.length > 0 && (
//     <div className="suggestions">
//       {uniqueNameSuggestions.map((s) => (
//         <div
//           key={s._id || s.name}
//           className="suggestion"
//           onClick={() => selectSuggestion(s)}
//         >
//           <span>{s.name}</span>
//         </div>
//       ))}
//     </div>
//   )}
// </div>  */}

// <div className="form-row wide relative">
//   <label>Product Name</label>
//   <input
//     className="input"
//     value={form.name}
//     onChange={(e) => onNameChange(e.target.value)}
//     onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
//   />

//   {showSuggestions && nameSuggestions.length > 0 && (
//     <div className="suggestions">
//       {nameSuggestions.map((s) => (
//         <div
//           key={s._id || s.name}
//           className="suggestion"
//           onClick={() => selectSuggestion(s)}
//         >
//           <span>{s.name}</span>
//         </div>
//       ))}
//     </div>
//   )}
// </div>

//                 <div className="form-row with-action">
//                   <div className="label-row">
//                     <label>Category</label>
//                     <button
//                       type="button"
//                       className="link-action"
//                       onClick={openCategoryModal}
//                       title="Add Category"
//                     >
//                       + Category
//                     </button>
//                   </div>
//                   <div className="select-wrap">
//                     {/* <select
//                       className="input select"
//                       value={form.category}
//                       onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
//                     >
//                       <option value="">Select category</option>
//                       {categories.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select> */}
//                     <select
//   className="input select"
//   value={form.category}
//   onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
// >
//   <option value="">Select category</option>
//   {Array.isArray(categories) && categories.map((c) => (
//     <option key={c} value={c}>
//       {c}
//     </option>
//   ))}
// </select>

//                     <FaChevronDown className="chev" />
//                   </div>
//                 </div>

//                 <div className="form-row">
//                   <label>MRP</label>
//                   <input
//                     className="input no-spin"
//                     type="number"
//                     inputMode="decimal"
//                     value={form.mrp}
//                     onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                  
//                     onFocus={enableWheelBlock}
//                     onBlur={disableWheelBlock}
//                     onKeyDown={(e) => {
//                       if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
//                     }}
//                   />
//                 </div>

//                 <div className="form-row">
//                   <label>Tax %</label>
//                   <input
//                     className="input no-spin"
//                     type="number"
//                     inputMode="decimal"
//                     value={form.taxPercent}
//                     onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))}
//                     onFocus={enableWheelBlock}
//                     onBlur={disableWheelBlock}
//                     onKeyDown={(e) => {
//                       if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Tax Mode */}
//             <div className="tax-mode">
//               <label className="radio">
//                 <input
//                   type="radio"
//                   name="taxMode"
//                   value="inclusive"
//                   checked={form.taxMode === "inclusive"}
//                   onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))}
//                 />
//                 <span>Tax Inclusive</span>
//               </label>
//               <label className="radio">
//                 <input
//                   type="radio"
//                   name="taxMode"
//                   value="exclusive"
//                   checked={form.taxMode === "exclusive"}
//                   onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))}
//                 />
//                 <span>Tax Exclusive</span>
//               </label>
//             </div>

//             {/* Summary */}
//             <div className="card summary-card">
//               <div className="summary-line">
//                 <span>Base Price</span>
//                 <strong>{taxSummary.base.toFixed(2)}</strong>
//               </div>
//               <div className="summary-line">
//                 <span>Tax Amount ({form.taxPercent || 0}%)</span>
//                 <strong>{taxSummary.taxAmt.toFixed(2)}</strong>
//               </div>
//               <div className="summary-line total">
//                 <span>Total ({form.taxMode})</span>
//                 <strong>{taxSummary.total.toFixed(2)}</strong>
//               </div>
//             </div>

//             {/* Qty & Minimum Qty */}
//             <div className="form-row-inline">
//               {/* <div className="form-row small">
//                 <label>Qty</label>
//                 <input
//                   className="input"
//                   type="number"
//                   value={form.qty}
//                   onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                  
//                 />
//               </div> */}

//               <div className="form-row small">
//                 <label>Minimum Qty</label>
//                 <input
//                   className="input"
//                   type="number"
//                   value={form.minQty || ""}
//                   onChange={(e) => setForm((f) => ({ ...f, minQty: e.target.value }))}
                 
//                 />
//               </div>
//             </div>

//             {/* Fixed Actions */}
//             <div className="modal-actions fixed">
//               <button type="submit" className="btn btn-primary">
//                 Create Product
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {/* Category Modal */}
//       {showCategoryModal && (
//         <Modal onClose={closeCategoryModal} title="Manage Categories" className="narrow-modal"  style={{
//           width: "380px",
//           maxWidth: "90%",
//           margin: "0 auto",
//         }}>
//           <div className="category-panel">
//             <div className="category-add">
//               <input
//                 className="input"
//                 placeholder="Type a category name"
//                 value={categoryDraft}
//                 onChange={(e) => setCategoryDraft(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     addCategoryDraft();
//                   }
//                 }}
//               />
// <button
//   type="button"
//   className="btn btn-dark flex items-center gap-2"
//   onClick={addCategoryDraft}
// >
//   <FaPlus color="green" />
//   <span className="text-green-500">Add</span>
// </button>
//             </div>

//             <div className="category-list">
//               {categoryTemp.length === 0 ? (
//                 <p className="muted">No categories yet.</p>
//               ) : (
//                 categoryTemp.map((c) => (
//                   <div key={c} className="chip">
//                     <span>{c}</span>

//                     <button
//                       type="button"
//                       className="chip-del"
//                       title="Delete"
//                       onClick={() => removeTempCategory(c)}
//                     >
//                       <FaTrash color="red" />
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>

//             <div className="modal-actions">
//               <button className="btn btn-primary" onClick={saveCategories}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* ---------- Small building blocks ---------- */
// function Detail({ label, value }) {
//   return (
//     <div className="detail">
//       <span className="detail-label">{label}</span>
//       <span className="detail-value">{String(value ?? "-")}</span>
//     </div>
//   );
// }

// function Modal({ title, children, onClose, className = "", style = {}, width }) {
//   return (
//     <div className="modal-overlay" onMouseDown={onClose}>
//       <div
//         className={`modal-card slide-up ${className}`}
//         style={{ width: width || "600px", ...style }}
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <div className="modal-header">
//           <h3>{title}</h3>
//           <button className="icon-close" onClick={onClose} aria-label="Close">
//             <FaTimes />
//           </button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }




// 2. products view product code respective batch minqty edit option add. add action coloumn add and edit icon orange color. icon below name edit and edit icon click open a edit model open . particular product code selected batch. i need only min qty edit and updated view table min qty live updated immediatly particular batch .with backend support. code unchanged. i need requirement only view model updated only code sniped



//11/10/2025 9.13
// // // src/pages/Stock/Products.jsx
// import React from "react";
// import { useMemo, useState, useEffect, useRef } from "react";
// import { FaPlus, FaEye, FaTimes, FaChevronDown, FaTrash, FaEdit } from "react-icons/fa";
// import "../../styles/products.css";
// import { useAuth } from "../../context/AuthContext";
// import apiClient from "../../utils/apiClient";
// import { getApiUrl } from "../../utils/api";

// export default function Products() {
//   const { user } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [nextCode, setNextCode] = useState("");

//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [categoryDraft, setCategoryDraft] = useState("");
//   const [categoryTemp, setCategoryTemp] = useState([]);

//   const [nameSuggestions, setNameSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);

//   const [availableBatches, setAvailableBatches] = useState([]);
//   const [showBatchList, setShowBatchList] = useState(true);

//   const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);


// const [editBatch, setEditBatch] = useState(null);

// const [batchEditState, setBatchEditState] = React.useState({});

// const toggleEditing = (batchNo, value, initialQty = 0) => {
//   setBatchEditState((prev) => ({
//     ...prev,
//     [batchNo]: { ...prev[batchNo], editing: value, newMinQty: prev[batchNo]?.newMinQty ?? initialQty }
//   }));
// };

// const updateMinQty = (batchNo, value) => {
//   setBatchEditState((prev) => ({
//     ...prev,
//     [batchNo]: { ...prev[batchNo], newMinQty: value }
//   }));
// };

//   // For manager/megaadmin: selected shop
//   const [selectedShop, setSelectedShop] = useState("" );

//   const [form, setForm] = useState({
//     code: "",
//     shortName: "",
//     batchNo: "",
//     salePrice: "",
//     name: "",
//     category: "",
//     price: "",
//     taxPercent: "",
//     taxMode: "exclusive",
//     qty: "",
//     mrp: "",
//     minQty: "",
//   });

//   const wheelPreventerRef = useRef(null);

//   // -------------------------------
//   // Toast helper
//   // -------------------------------
//   const pushToast = (msg) => {
//     const id = Date.now();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
//   };

//   // -------------------------------
// // API path helper
// // -------------------------------
// const getApiPath = (endpoint) => {
//   const ep = endpoint.replace(/^\//, "");
//   if (!user) return getApiUrl(ep);

//   // Tenant user: send normal endpoint, header includes shopname
//   if (user.role === "tenant") return getApiUrl(ep);

//   // Manager/Megaadmin: include selectedShop in path
//   if ((user.role === "manager" || user.role === "megaadmin") && selectedShop) {
//     return getApiUrl(`api/shops/${selectedShop}/${ep}`);
//   }

//   return getApiUrl(ep);
// };



//   // -------------------------------
//   // Fetch products & categories
//   // -------------------------------
//   const fetchProducts = async () => {
//     if (!user) return;
//     try {
//       const res = await apiClient.get(getApiPath("products"));
//       setProducts(res.data || []);
//     } catch (err) {
//       console.error("fetchProducts error:", err);
//       pushToast(`Failed to fetch products${selectedShop ? ` for shop ${selectedShop}` : ""}`);
//     }
//   };
  
// const fetchCategories = async () => {
//   if (!user) return;
//   try {
//     const res = await apiClient.get(getApiPath("categories"));

//     // Normalize categories to an array
//     const cats = Array.isArray(res.data) 
//       ? res.data 
//       : Array.isArray(res.data?.categories) 
//         ? res.data.categories 
//         : [];

//     setCategories(cats);
//   } catch (err) {
//     console.error("fetchCategories error:", err);
//     pushToast("Failed to fetch categories");
//   }
// };


//   useEffect(() => {
//   const loadData = async () => {
//     await fetchProducts();
//     await fetchCategories();
//   };
//   if (user) loadData();
// }, [user, selectedShop]);


//   // -------------------------------
//   // Filtered products
//   // -------------------------------
//   const filtered = useMemo(() => {
//     const s = search.trim().toLowerCase();
//     if (!s) return products;
//     return products.filter((p) =>
//       [p.code, p.name, p.category].some((v) => v?.toLowerCase().includes(s))
//     );
//   }, [search, products]);

//   // -------------------------------
//   // Helper: get batches
//   // -------------------------------
//   const getBatches = (prod) => products.filter((p) => p.code === prod.code && p.name === prod.name);

//   // -------------------------------
//   // Apply decrements helper
//   // -------------------------------
//   const applyDecrementsToProducts = (prevProducts, decrements) => {
//     const productsCopy = prevProducts.map((p) => ({ ...p }));
//     for (const d of decrements) {
//       const code = (d.code || "").toLowerCase();
//       const batchNo = (d.batchNo || "").toLowerCase();    
//       let remaining = Number(d.qty || 0);

//       for (let i = 0; i < productsCopy.length && remaining > 0; i++) {
//         const p = productsCopy[i];
//         if ((p.code || "").toLowerCase() === code && (p.batchNo || "").toLowerCase() === batchNo) {
//           const available = Number(p.qty || 0);
//           if (available <= 0) continue;
//           const take = Math.min(available, remaining);
//           p.qty = Math.max(0, available - take);
//           remaining -= take;
//         }
//       }
//     }
//     return productsCopy;
//   };

//   const decrementStockOnServer = async (items) => {
//     if (!Array.isArray(items) || items.length === 0) return;
//     try {
//       await apiClient.put(getApiPath("products/decrement-stock"), { items });
//       setProducts((prev) => applyDecrementsToProducts(prev, items));
//       await fetchProducts();
//       pushToast("Stock updated");
//     } catch (err) {
//       console.error("decrementStockOnServer:", err);
//       pushToast("Failed to update stock on server");
//     }
//   };

//   // -------------------------------
//   // Unique products by code + name
//   // -------------------------------
//   const uniqueProducts = useMemo(() => {
//     const map = new Map();
//     products.forEach((p) => {
//       const key = `${p.code}-${p.name}`;
//       if (!map.has(key)) map.set(key, p);
//     });
//     return Array.from(map.values());
//   }, [products]);

//   const uniqueNameSuggestions = useMemo(() => {
//     const seen = new Set();
//     return uniqueProducts.filter((p) => {
//       if (seen.has(p.name.toLowerCase())) return false;
//       seen.add(p.name.toLowerCase());
//       return true;
//     });
//   }, [uniqueProducts]);

//   // -------------------------------
//   // Tax summary
//   // -------------------------------
//   const taxSummary = useMemo(() => {
//     const priceNum = parseFloat(form.salePrice || form.price || 0) || 0;
//     const tax = parseFloat(form.taxPercent || 0) || 0;
//     if (!priceNum || !tax) return { base: priceNum, taxAmt: 0, total: priceNum, mode: form.taxMode };
//     if (form.taxMode === "exclusive") {
//       const taxAmt = +(priceNum * (tax / 100)).toFixed(2);
//       const total = +(priceNum + taxAmt).toFixed(2);
//       return { base: priceNum, taxAmt, total, mode: "exclusive" };
//     } else {
//       const base = +((priceNum * 100) / (100 + tax)).toFixed(2);
//       const taxAmt = +(priceNum - base).toFixed(2);
//       return { base, taxAmt, total: priceNum, mode: "inclusive" };
//     }
//   }, [form.salePrice, form.price, form.taxPercent, form.taxMode]);

//   // -------------------------------
//   // Form & modal helpers
//   // -------------------------------
//   const resetForm = (code = "") => {
//     setForm({
//       code,
//       shortName: "",
//       batchNo: "",
//       salePrice: "",
//       name: "",
//       category: "",
//       price: "",
//       taxPercent: "",
//       taxMode: "exclusive",
//       qty: "",
//       mrp: "",
//       minQty: "",
//     });
//     setAvailableBatches([]);
//     setShowBatchList(true);
//   };

//   const openCreate = async () => {
//     try {
//       const { data } = await apiClient.get(getApiPath("products/next-code"));
//       resetForm(data.nextCode);
//       setNextCode(data.nextCode);
//       setShowCreateModal(true);
//     } catch (err) {
//       console.error("Failed to get next code", err);
//       pushToast("Failed to generate code");
//     }
//   };
//   const closeCreate = () => setShowCreateModal(false);
//   const openView = (prod) => setShowViewModal(prod);
//   const closeView = () => setShowViewModal(null);

//   // -------------------------------
//   // Product name suggestions
//   // -------------------------------
//   const onNameChange = async (val) => {
//     setForm((f) => ({ ...f, name: val, batchNo: "" }));
//     setAvailableBatches([]);
//     setShowBatchList(true);

//     if (!val.trim()) {
//       const { data } = await apiClient.get(getApiPath("products/next-code"));
//       resetForm(data.nextCode);
//       setNextCode(data.nextCode);
//       setShowSuggestions(false);
//       return;
//     }

//     const matches = products.filter((p) => p.name.toLowerCase().includes(val.toLowerCase()));
//     setNameSuggestions(matches);
//     setShowSuggestions(true);
//       setUniqueNameSuggestions(uniqueMatches); 

//     const exact = products.find((p) => p.name.toLowerCase() === val.toLowerCase());
//     if (exact) {
//       const batches = getBatches(exact);
//       setAvailableBatches(batches);
//       setForm((f) => ({ ...f, code: exact.code, shortName: exact.shortName, category: exact.category }));
//       setShowBatchList(true);
//     } else {
//       const { data } = await apiClient.get(getApiPath("products/next-code"));
//       setForm((f) => ({ ...f, code: data.nextCode }));
//       setNextCode(data.nextCode);
//     }
//   };

//   const selectSuggestion = (prod) => {
//     const batches = getBatches(prod);
//     setAvailableBatches(batches);
//     setForm((f) => ({
//       ...f,
//       name: prod.name,
//       code: prod.code,
//       shortName: prod.shortName,
//       category: prod.category,
//       batchNo: "",
//     }));
//     setShowSuggestions(false);
//     setShowBatchList(true);
//   };

//   const onBatchSelect = (batch) => {
//     setForm((f) => ({
//       ...f,
//       batchNo: batch.batchNo,
//       mrp: batch.mrp,
//       salePrice: batch.salePrice,
//       qty: batch.qty,
//       taxPercent: batch.taxPercent,
//       taxMode: batch.taxMode,
//     }));
//     setShowBatchList(true);
//   };

//   // -------------------------------
//   // Create product
//   // -------------------------------

//   const onCreate = async (e) => {
//   e.preventDefault();
//   if (!form.name) return alert("Product name is required");
//   if (!form.batchNo) return alert("Batch No is required");

//   try {
//     const payload = {
//       ...form,
//       shop: user.shop || selectedShop, // <-- add the shop
//       qty: Number(form.qty || 0),
//       mrp: Number(form.mrp || 0),
//       salePrice: Number(form.salePrice || 0),
//       taxPercent: Number(form.taxPercent || 0),
//       minQty: Number(form.minQty || 0),
//         code: form.code, 
//     };

//     const { data } = await apiClient.post(getApiPath("products"), payload);
//     setProducts((prev) => [data, ...prev]);
//     if (data.name === form.name && data.code === form.code) {
//       setAvailableBatches((prev) => [data, ...prev]);
//     }
//     setShowCreateModal(false);
//     pushToast("Product / Batch saved");
//   } catch (err) {
//     console.error(err);
//     alert(err.response?.data?.error || "Failed to create product");
//   }
// };


//   // -------------------------------
//   // Category modal helpers
//   // -------------------------------
//   const openCategoryModal = () => {
//     setCategoryTemp(categories);
//     setCategoryDraft("");
//     setShowCategoryModal(true);
//   };
//   const closeCategoryModal = () => setShowCategoryModal(false);

//   const addCategoryDraft = () => {
//     const name = categoryDraft.trim();
//     if (!name) return;
//     if (!categoryTemp.includes(name)) setCategoryTemp((x) => [...x, name]);
//     setCategoryDraft("");
//   };
//   const removeTempCategory = (name) => setCategoryTemp((x) => x.filter((c) => c !== name));

//   const saveCategories = async () => {
//     if (!categoryTemp || categoryTemp.length === 0) {
//       pushToast("No categories to save");
//       return;
//     }
//     try {
//       const { data } = await apiClient.put(getApiPath("categories"), { categories: categoryTemp });
//       setCategories(Array.isArray(data) ? data : []);
//       if (form.category && !data.includes(form.category)) setForm((f) => ({ ...f, category: "" }));
//       setShowCategoryModal(false);
//       pushToast("Categories saved");
//     } catch (err) {
//       console.error("Failed to save categories:", err);
//       pushToast("Failed to save categories");
//     }
//   };

//   // -------------------------------
//   // Wheel prevention
//   // -------------------------------
//   const wheelHandler = (e) => {
//     if (
//       document.activeElement &&
//       (document.activeElement.type === "number" || document.activeElement.inputMode === "decimal")
//     ) e.preventDefault();
//   };
//   const enableWheelBlock = () => {
//     if (!wheelPreventerRef.current) {
//       wheelPreventerRef.current = wheelHandler;
//       window.addEventListener("wheel", wheelPreventerRef.current, { passive: false, capture: true });
//     }
//   };
//   const disableWheelBlock = () => {
//     if (wheelPreventerRef.current) {
//       window.removeEventListener("wheel", wheelPreventerRef.current, { capture: true });
//       wheelPreventerRef.current = null;
//     }
//   };

//   // -------------------------------
//   // Listen for product refresh event
//   // -------------------------------
//   useEffect(() => {
//     const handler = async (e) => {
//       const items = e?.detail?.items;
//       if (Array.isArray(items) && items.length > 0) {
//         setProducts((prev) => applyDecrementsToProducts(prev, items));
//       }
//       await fetchProducts();
//       pushToast("Products refreshed");
//     };
//     window.addEventListener("products:refresh", handler);
//     return () => window.removeEventListener("products:refresh", handler);
//   }, []);

// // -------------------------------
// // Listen for sales bill updates (live stock decrement)
// // -------------------------------
// useEffect(() => {
//   const handleSalesBillUpdate = async (e) => {
//     const { newItems = [], oldItems = [] } = e?.detail || {};

//     if (!Array.isArray(newItems)) return;

//     // Calculate net decrements (new qty - old qty if editing)
//     const decrements = newItems.map((item) => {
//       let prevQty = 0;
//       if (oldItems.length > 0) {
//         const match = oldItems.find((o) => o.code === item.code && o.batch === item.batch);
//         if (match) prevQty = Number(match.qty || 0);
//       }
//       const netQty = Number(item.qty || 0) - prevQty;
//       return netQty > 0
//         ? { code: item.code, batchNo: item.batch, qty: netQty }
//         : null;
//     }).filter(Boolean);

//     if (decrements.length === 0) return;

//     // Apply decrements locally
//     setProducts((prev) => applyDecrementsToProducts(prev, decrements));

//     // Optional: refresh from server
//     await fetchProducts();
//     pushToast("Stock updated from sales bill");
//   };

//   window.addEventListener("salesbill:updated", handleSalesBillUpdate);
//   return () => window.removeEventListener("salesbill:updated", handleSalesBillUpdate);
// }, []);




// // Handle typing in Product Code
// const onCodeChange = (val) => {
//   setForm((f) => ({ ...f, code: val }));
//   setShowCodeSuggestions(true);

//   if (!val.trim()) {
//     // Reset auto-fill if code is erased
//     resetForm();
//     setShowCodeSuggestions(false);
//     return;
//   }

//   const matches = products.filter((p) =>
//     p.code.toLowerCase().includes(val.toLowerCase())
//   );
//   setShowCodeSuggestions(matches.length > 0);

//   const exact = products.find((p) => p.code.toLowerCase() === val.toLowerCase());
//   if (exact) {
//     const batches = getBatches(exact);
//     setAvailableBatches(batches);
//     setForm((f) => ({
//       ...f,
//       name: exact.name,
//       shortName: exact.shortName,
//       category: exact.category,
//       batchNo: "",
//     }));
//     setShowBatchList(true);
//   }
// };

// // Handle selecting a code suggestion
// const selectCodeSuggestion = (prod) => {
//   const batches = getBatches(prod);
//   setAvailableBatches(batches);
//   setForm((f) => ({
//     ...f,
//     code: prod.code,
//     name: prod.name,
//     shortName: prod.shortName,
//     category: prod.category,
//     batchNo: "",
//   }));
//   setShowCodeSuggestions(false);
//   setShowBatchList(true);
// };

// const uniqueCodeSuggestions = useMemo(() => {
//   const seen = new Set();
//   return products
//     .filter((p) => {
//       if (seen.has(p.code)) return false;
//       seen.add(p.code);
//       return true;
//     })
//     .filter((p) =>
//       form.code ? p.code.toLowerCase().includes(form.code.toLowerCase()) : true
//     )
//     .slice(0, 5); // top 5 suggestions
// }, [products, form.code]);

// const handleSaveMinQty = async ({ code, batchNo, minQty }) => {
//   if (!code || !batchNo) {
//     pushToast("Missing code or batch number");
//     return;
//   }

//   try {
//     const payload = { code, batchNo, minQty: Number(minQty || 0) };

//     // ✅ Corrected API call (patch to /products/min-qty)
//     const res = await apiClient.patch(getApiPath("products/min-qty"), payload);
//     const updated = res.data;

//     // ✅ Update local product list (real-time UI update)
//     setProducts((prev) =>
//       prev.map((p) =>
//         p.code === updated.code && p.batchNo === updated.batchNo
//           ? { ...p, minQty: updated.minQty }
//           : p
//       )
//     );

//     pushToast(`Min Qty updated for batch ${batchNo}`);
//   } catch (err) {
//     console.error("handleSaveMinQty error:", err);
//     pushToast(err.response?.data?.message || "Failed to update Min Qty");
//   }
// };



// const BatchRow = ({ batch, idx, minQty, resultingStock, handleSaveMinQty }) => {
//   const [editingMinQty, setEditingMinQty] = React.useState(false);
//   const [newMinQty, setNewMinQty] = React.useState(minQty);

//   // Reset local state if minQty changes externally
//   React.useEffect(() => {
//     setNewMinQty(minQty);
//   }, [minQty]);

//   return (
//     <tr>
//       <td>{idx + 1}</td>
//       <td>{batch.batchNo}</td>
//       <td className={resultingStock <= minQty ? "danger" : ""}>
//         {resultingStock}
//       </td>
//       <td>
//         {editingMinQty ? (
//           <input
//             type="number"
//             value={newMinQty}
//             min={0}
//             onChange={(e) => setNewMinQty(Number(e.target.value))}
//             style={{ width: "60px" }}
//           />
//         ) : (
//           minQty || "-"
//         )}
//       </td>
//       <td>{Number(batch.mrp || 0).toFixed(2)}</td>
//       <td>{Number(batch.salePrice || batch.rate || 0).toFixed(2)}</td>
//       <td>{batch.taxPercent || 0}%</td>
//       <td>{batch.taxMode || "-"}</td>
//       <td>
//         {editingMinQty ? (
//           <>
//             <button
//               className="btn btn-success btn-small"
//               onClick={async () => {
//                 await handleSaveMinQty({
//                   code: batch.code,
//                   batchNo: batch.batchNo,
//                   minQty: newMinQty,
//                 });
//                 setEditingMinQty(false);
//               }}
//             >
//               Save
//             </button>
//             <button
//               className="btn btn-muted btn-small"
//               onClick={() => {
//                 setNewMinQty(minQty);
//                 setEditingMinQty(false);
//               }}
//             >
//               Cancel
//             </button>
//           </>
//         ) : (
//           <button
//             className="btn btn-primary btn-small"
//             onClick={() => setEditingMinQty(true)}
//           >
//             Edit
//           </button>
//         )}
//       </td>
//     </tr>
//   );
// };




// /* -------------------- */
// /* Subcomponent Section */
// /* -------------------- */

// const BatchTableView = ({ product, getBatches, getStockCache, handleSaveMinQty }) => {
//   // ✅ Keep all edit states in one place
//   const [editState, setEditState] = React.useState({});

//   const toggleEdit = (batchNo, value) => {
//     setEditState((prev) => ({
//       ...prev,
//       [batchNo]: { ...prev[batchNo], editing: value },
//     }));
//   };

//   const updateMinQty = (batchNo, newValue) => {
//     setEditState((prev) => ({
//       ...prev,
//       [batchNo]: { ...prev[batchNo], newMinQty: newValue },
//     }));
//   };

//   const batches = getBatches(product);

//   return (
//     <div className="batch-table-wrapper">
//       <table className="table clean small">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Batch No</th>
//             <th>Qty</th>
//             <th>Min Qty</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Tax %</th>
//             <th>Tax Mode</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {batches.map((b, idx) => {
//             const batchNo = b.batchNo;
//             const minQty = Number(b.minQty || 0);
//             const stock =
//               typeof getStockCache === "function"
//                 ? getStockCache(product.code, batchNo)
//                 : Number(b.qty || 0);

//             const editing = editState[batchNo]?.editing || false;
//             const newMinQty =
//               editState[batchNo]?.newMinQty !== undefined
//                 ? editState[batchNo].newMinQty
//                 : minQty;

//             return (
//               <tr key={b._id || idx}>
//                 <td>{idx + 1}</td>
//                 <td>{batchNo}</td>
//                 <td className={stock <= minQty ? "danger" : ""}>{stock}</td>
//                 <td>
//                   {editing ? (
//                     <input
//                       type="number"
//                       value={newMinQty}
//                       min={0}
//                       onChange={(e) => updateMinQty(batchNo, Number(e.target.value))}
//                       style={{ width: "60px" }}
//                     />
//                   ) : (
//                     minQty || "-"
//                   )}
//                 </td>
//                 <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                 <td>{Number(b.salePrice || b.rate || 0).toFixed(2)}</td>
//                 <td>{b.taxPercent || 0}%</td>
//                 <td>{b.taxMode || "-"}</td>
//                 <td>
//                   {editing ? (
//                     <>
//                       <button
//                         className="btn btn-success btn-small"
//                         onClick={async () => {
//                           await handleSaveMinQty({
//                             code: product.code,
//                             batchNo,
//                             minQty: newMinQty,
//                           });
//                           toggleEdit(batchNo, false);
//                         }}
//                       >
//                         Save
//                       </button>
//                       <button
//                         className="btn btn-muted btn-small"
//                         onClick={() => toggleEdit(batchNo, false)}
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <button
//                       className="btn btn-primary btn-small"
//                       onClick={() => toggleEdit(batchNo, true)}
//                     >
//                       Edit
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };


//   return (
//     <div className="products-page">
//       {/* Toasts */}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className="toast">
//             {t.msg}
//           </div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="products-header">
//         <h1 className="title">Products</h1>
   
//      <button className="btn btn-primary" onClick={openCreate}>
//           <FaPlus /> Create Product
//         </button>
    
        
//       </div>

//       {/* Toolbar */}
//       <div className="products-toolbar">
//         <div className="search-wrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="Search by code / name / category"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Table */}
    
      
//    {/* Table */}
// <div className="card table-card" style={{ width: "100%", overflowX: "auto" }}>
//   <div className="table-responsive" style={{ minWidth: "100%" }}>
//     <table
//       className="table clean"
//       style={{
//         width: "100%",
//         borderCollapse: "collapse",
//         minWidth: "600px",
//       }}
//     >
//       <thead>
//         <tr
//           style={{
//             backgroundColor: "#007867",
//             color: "#fff",
//             textAlign: "left",
//           }}
//         >
//           <th style={{ padding: "0.75rem" }}>S.No</th>
//           <th style={{ padding: "0.75rem" }}>Product Code</th>
//           <th style={{ padding: "0.75rem" }}>Product Name</th>
//           <th style={{ padding: "0.75rem" }}>Category</th>
//           <th style={{ padding: "0.75rem" }}>Qty</th>
//           {/* <th style={{ padding: "0.75rem" }}>Min Qty</th> */}
//           <th style={{ padding: "0.75rem" }} className="text-center">
//             Action
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {filtered.length === 0 ? (
//           <tr>
//             <td colSpan="7" style={{ textAlign: "center", padding: "1rem", color: "#777" }}>
//               No products found
//             </td>
//           </tr>
//         ) : (
//           // Group by product code to show one row per product
//           Object.values(
//             filtered.reduce((acc, p) => {
//               if (!acc[p.code]) {
//                 acc[p.code] = { ...p }; // first product instance
//               } else {
//                 // optional: merge batches if p has new ones
//                 acc[p.code].batches = [
//                   ...(acc[p.code].batches || getBatches(acc[p.code])),
//                   ...(getBatches(p) || []),
//                 ].filter(
//                   (b, idx, self) =>
//                     idx === self.findIndex((t) => t.batchNo === b.batchNo)
//                 ); // remove duplicate batches
//               }
//               return acc;
//             }, {})
//           ).map((p, idx) => {
//             const batches = p.batches || getBatches(p); // all batches
//             const totalQty = batches.reduce((sum, b) => sum + Number(b.qty || 0), 0);
//             const minQty = Math.min(...batches.map((b) => Number(b.minQty || Infinity)));

//             return (
//               <tr
//                 key={p._id || p.code}
//                 style={{
//                   transition: "all 0.3s ease",
//                   opacity: 0,
//                   animation: "fadeIn 0.5s forwards",
//                   cursor: "default",
//                 }}
//                 className="fade-in"
//               >
//                 <td style={{ padding: "0.5rem" }}>{idx + 1}</td>
//                 <td style={{ padding: "0.5rem" }}>{p.code}</td>
//                 <td style={{ padding: "0.5rem" }}>{p.name}</td>
//                 <td style={{ padding: "0.5rem" }}>{p.category}</td>

//                 {/* Qty column - highlight if ≤ min qty */}
//                 <td
//                   style={{
//                     padding: "0.5rem",
//                     color: totalQty <= minQty ? "#FF4C4C" : "#000",
//                     fontWeight: totalQty <= minQty ? "bold" : "normal",
//                   }}
//                 >
//                   {totalQty}
//                 </td>

//                 {/* Min Qty column */}
//                 {/* <td style={{ padding: "0.5rem" }}>{minQty === Infinity ? "-" : minQty}</td> */}

//                 <td style={{ padding: "0.5rem", textAlign: "center" }}>
//                   <button
//                     onClick={() => openView({ ...p, batches })} // pass product + all batches
//                     title="View"
//                     style={{
//                       border: "none",
//                       backgroundColor: "#00A76F",
//                       color: "#fff",
//                       padding: "0.5rem 0.75rem",
//                       borderRadius: "0.5rem",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => (e.target.style.backgroundColor = "#007867")}
//                     onMouseLeave={(e) => (e.target.style.backgroundColor = "#00A76F")}
//                   >
//                     <FaEye />
            
//                   </button>
                
//                 </td>
              
//               </tr>
//             );
//           })
//         )}
//       </tbody>
//     </table>
//   </div>

//   <style>
//     {`
//       @keyframes fadeIn {
//         from { opacity: 0; transform: translateY(10px); }
//         to { opacity: 1; transform: translateY(0); }
//       }

//       @media (max-width: 768px) {
//         table {
//           min-width: 100%;
//           font-size: 0.9rem;
//         }

//         th, td {
//           padding: 0.5rem;
//         }

//         button {
//           padding: 0.4rem 0.6rem;
//         }
//       }
//     `}
//   </style>
// </div>


// {/* View Modal */}


// {/* {showViewModal && (
//   <Modal onClose={closeView} title="Product Details" className="wide-modal">
//     <div className="product-info-grid">
//       <div>
//         <p><strong>Code:</strong> {showViewModal.code}</p>
//         <p><strong>Category:</strong> {showViewModal.category}</p>
//       </div>
//       <div>
//         <p><strong>Name:</strong> {showViewModal.name}</p>
//         <p>
//           <strong>Total Qty:</strong>{" "}
//           {getBatches(showViewModal).reduce((sum, b) => {
//             const liveQty = typeof getStockCache === "function"
//               ? getStockCache(showViewModal.code, b.batchNo)
//               : Number(b.qty || 0);
//             return sum + liveQty;
//           }, 0)}
//         </p>
//       </div>
//     </div>

//     <h4 style={{ fontWeight: "bold", marginTop: "12px" }}>Batch Details</h4>
//     <div className="batch-table-wrapper">
//       <table className="table clean small">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Batch No</th>
//             <th>Qty</th>
//             <th>Min Qty</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Tax %</th>
//             <th>Tax Mode</th>
//           </tr>
//         </thead>
//         <tbody>
//           {getBatches(showViewModal).map((b, idx) => {
//             const minQty = Number(b.minQty || 0);
//             const resultingStock = typeof getStockCache === "function"
//               ? getStockCache(showViewModal.code, b.batchNo)
//               : Number(b.qty || 0);

//             return (
//               <tr key={b._id || idx}>
//                 <td>{idx + 1}</td>
//                 <td>{b.batchNo}</td>
//                 <td className={resultingStock <= minQty ? "danger" : ""}>
//                   {resultingStock}
//                 </td>
//                 <td>{minQty || "-"}</td>
//                 <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                 <td>{Number(b.salePrice || b.rate || 0).toFixed(2)}</td>
//                 <td>{b.taxPercent || 0}%</td>
//                 <td>{b.taxMode || "-"}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>

//     <div className="modal-actions">
//       <button className="btn btn-muted" onClick={closeView}>
//         Close
//       </button>
//     </div>
//   </Modal>
// )}  */}


// {/* 🔹 View Modal */}
// {showViewModal && (
//   <Modal onClose={closeView} title="Product Details" className="wide-modal">
//     <div className="product-info-grid">
//       <div>
//         <p><strong>Code:</strong> {showViewModal.code}</p>
//         <p><strong>Category:</strong> {showViewModal.category}</p>
//       </div>
//       <div>
//         <p><strong>Name:</strong> {showViewModal.name}</p>
//         <p>
//           <strong>Total Qty:</strong>{" "}
//           {getBatches(showViewModal).reduce((sum, b) => {
//             const liveQty = typeof getStockCache === "function"
//               ? getStockCache(showViewModal.code, b.batchNo)
//               : Number(b.qty || 0);
//             return sum + liveQty;
//           }, 0)}
//         </p>
//       </div>
//     </div>

//     <h4 style={{ fontWeight: "bold", marginTop: "12px" }}>Batch Details</h4>
//     <div className="batch-table-wrapper">
//       <table className="table clean small">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Batch No</th>
//             <th>Qty</th>
//             <th>Min Qty</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Tax %</th>
//             <th>Tax Mode</th>
//             <th>Action</th> {/* 🟠 Added */}
//           </tr>
//         </thead>
//         <tbody>
//           {getBatches(showViewModal).map((b, idx) => {
//             const minQty = Number(b.minQty || 0);
//             const resultingStock = typeof getStockCache === "function"
//               ? getStockCache(showViewModal.code, b.batchNo)
//               : Number(b.qty || 0);

//             return (
//               <tr key={b._id || idx}>
//                 <td>{idx + 1}</td>
//                 <td>{b.batchNo}</td>
//                 <td className={resultingStock <= minQty ? "danger" : ""}>
//                   {resultingStock}
//                 </td>
//                 <td>{minQty || "-"}</td>
//                 <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                 <td>{Number(b.salePrice || b.rate || 0).toFixed(2)}</td>
//                 <td>{b.taxPercent || 0}%</td>
//                 <td>{b.taxMode || "-"}</td>
//                 <td>
//                   <FaEdit
//                     title="Edit Min Qty"
//                     style={{
//                       color: "orange",
//                       cursor: "pointer",
//                       fontSize: "16px",
//                     }}
//                     onClick={() =>
//                       setEditBatch({
//                         code: showViewModal.code,
//                         batchNo: b.batchNo,
//                         minQty: minQty,
//                       })
//                     }
//                   />
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>

//     <div className="modal-actions">
//       <button className="btn btn-muted" onClick={closeView}>
//         Close
//       </button>
//     </div>
//   </Modal>
// )}


// {/* 🔹 Edit Min Qty Modal */}
// {editBatch && (
//   <Modal
//     onClose={() => setEditBatch(null)}
//     title={`Edit Min Qty - ${editBatch.batchNo}`}
//   >
//     <div className="edit-minqty-form">
//       <label><strong>New Min Qty:</strong></label>
//       <input
//         type="number"
//         value={editBatch.minQty}
//         min={0}
//         onChange={(e) =>
//           setEditBatch((prev) => ({
//             ...prev,
//             minQty: Number(e.target.value),
//           }))
//         }
//         style={{ width: "100%", padding: "6px", marginTop: "6px" }}
//       />

//       <div className="modal-actions" style={{ marginTop: "14px" }}>
//         <button
//           className="btn btn-success"
//           onClick={async () => {
//             try {
//               await handleSaveMinQty(editBatch); // 🔹 backend update
//               // 🔹 update local state for immediate view refresh
//               showViewModal.batches = showViewModal.batches.map((b) =>
//                 b.batchNo === editBatch.batchNo
//                   ? { ...b, minQty: editBatch.minQty }
//                   : b
//               );
//               setEditBatch(null);
//             } catch (err) {
//               console.error("Failed to update min qty:", err);
//             }
//           }}
//         >
//           Save
//         </button>
//         <button className="btn btn-muted" onClick={() => setEditBatch(null)}>
//           Cancel
//         </button>
//       </div>
//     </div>
//   </Modal>
// )}







// {/* View Modal */}






//       {/* Create Product Modal */}
//       {showCreateModal && (
//         <Modal onClose={closeCreate} title="Create Product">
//           <form onSubmit={onCreate} className="product-form" autoComplete="off">
//             <div className="form-grid">
//               {/* Left */}
//               <div className="form-col">
// <div className="form-row wide relative">
//   <label>Product Code</label>
//   <input
//     className="input"
//     value={form.code || ""}
//     onChange={(e) => onCodeChange(e.target.value)}
//     onFocus={() => form.code && setShowCodeSuggestions(true)}
//     placeholder="Enter a Product Code"
//   />

//   {showCodeSuggestions && uniqueCodeSuggestions.length > 0 && (
//     <div className="suggestions">
//       {uniqueCodeSuggestions.map((s) => (
//         <div
//           key={s._id || s.code}
//           className="suggestion"
//           onClick={() => selectCodeSuggestion(s)}
//         >
//           <span>{s.code}</span>
//         </div>
//       ))}
//     </div>
//   )}
// </div>



//                 <div className="form-row">
//                   <label>Short Name</label>
//                   <input
//                     className="input"
//                     value={form.shortName}
//                     onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
//                    placeholder="Enter a Short Name"
//                   />
//                 </div>

//                 {/* Batch No */}
//                 <div className="form-row wide relative">
//                   <label>Batch No</label>
//                   <input
//                     className="input"
//                     placeholder="Enter a Batch"
//                     value={form.batchNo}
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       setForm((f) => ({ ...f, batchNo: v }));
//                       setShowBatchList(v.trim() === "");
//                     }}
//                     onFocus={() => setShowBatchList(true)}
//                     onBlur={() => {
//                       setTimeout(() => {
//                         setShowBatchList((prev) => (form.batchNo ? false : prev));
//                       }, 150);
//                     }}
//                   />

//                   {availableBatches.length > 0 && showBatchList && (
//                     <div className="batch-suggestions">
//                       <table className="table clean small">
//                         <thead>
//                           <tr>
//                             <th>Batch No</th>
//                             <th>MRP</th>
//                             <th>Rate</th>
//                             <th>Tax %</th>
//                             <th>Tax Mode</th>
//                             <th>Qty</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {availableBatches.map((b) => (
//                             <tr
//                               key={b._id || b.batchNo}
//                               className="batch-row"
//                               onClick={() => {
//                                 onBatchSelect(b);
//                                 setShowBatchList(false);
//                               }}
//                             >
//                               <td>{b.batchNo}</td>
//                               <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                               <td>{Number(b.salePrice || 0).toFixed(2)}</td>
//                               <td>{b.taxPercent}%</td>
//                               <td>{b.taxMode}</td>
//                               <td>{b.qty}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>

//                 <div className="form-row">
//                   <label>Rate</label>
//                   <input
//                     className="input"
//                     type="number"
//                     inputMode="decimal"
//                     value={form.salePrice}
//                     onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
//                     placeholder="Enter a Rate"
//                   />
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="form-col">

// <div className="form-row wide relative">
//   <label>Product Name</label>
//   <input
//     className="input"
//     value={form.name}
//     onChange={(e) => onNameChange(e.target.value)}
//     onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
//     placeholder="Enter a Product Name"
//   />

//   {showSuggestions && nameSuggestions.length > 0 && (
//     <div className="suggestions">
//       {nameSuggestions.map((s) => (
//         <div
//           key={s._id || s.name}
//           className="suggestion"
//           onClick={() => selectSuggestion(s)}
//         >
//           <span>{s.name}</span>
//         </div>
//       ))}
//     </div>
//   )}
// </div>

//                 <div className="form-row with-action">
//                   <div className="label-row">
//                     <label>Category</label>
//                     <button
//                       type="button"
//                       className="link-action"
//                       onClick={openCategoryModal}
//                       title="Add Category"
//                     >
//                       + Category
//                     </button>
//                   </div>
//                   <div className="select-wrap">

//                     <select
//   className="input select"
//   value={form.category}
//   onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
// >
//   <option value="">Select category</option>
//   {Array.isArray(categories) && categories.map((c) => (
//     <option key={c} value={c}>
//       {c}
//     </option>
//   ))}
// </select>

//                     <FaChevronDown className="chev" />
//                   </div>
//                 </div>

//                 <div className="form-row">
//                   <label>MRP</label>
//                   <input
//                     className="input no-spin"
//                     type="number"
//                     inputMode="decimal"
//                     value={form.mrp}
//                     onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
//                     placeholder="Enter a MRP"
//                     onFocus={enableWheelBlock}
//                     onBlur={disableWheelBlock}
//                     onKeyDown={(e) => {
//                       if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
//                     }}
//                   />
//                 </div>

//                 <div className="form-row">
//                   <label>Tax %</label>
//                   <input
//                     className="input no-spin"
//                     type="number"
//                     placeholder="Enter a Tax"
//                     inputMode="decimal"
//                     value={form.taxPercent}
//                     onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))}
//                     onFocus={enableWheelBlock}
//                     onBlur={disableWheelBlock}
//                     onKeyDown={(e) => {
//                       if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Tax Mode */}
//             <div className="tax-mode">
//               <label className="radio">
//                 <input
//                   type="radio"
//                   name="taxMode"
//                   value="inclusive"
//                   checked={form.taxMode === "inclusive"}
//                   onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))}
//                 />
//                 <span>Tax Inclusive</span>
//               </label>
//               <label className="radio">
//                 <input
//                   type="radio"
//                   name="taxMode"
//                   value="exclusive"
//                   checked={form.taxMode === "exclusive"}
//                   onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))}
//                 />
//                 <span>Tax Exclusive</span>
//               </label>
//             </div>

//             {/* Summary */}
//             <div className="card summary-card">
//               <div className="summary-line">
//                 <span>Base Price</span>
//                 <strong>{taxSummary.base.toFixed(2)}</strong>
//               </div>
//               <div className="summary-line">
//                 <span>Tax Amount ({form.taxPercent || 0}%)</span>
//                 <strong>{taxSummary.taxAmt.toFixed(2)}</strong>
//               </div>
//               <div className="summary-line total">
//                 <span>Total ({form.taxMode})</span>
//                 <strong>{taxSummary.total.toFixed(2)}</strong>
//               </div>
//             </div>

//             {/* Qty & Minimum Qty */}
//             <div className="form-row-inline">
//               {/* <div className="form-row small">
//                 <label>Qty</label>
//                 <input
//                   className="input"
//                   type="number"
//                   value={form.qty}
//                   onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                  
//                 />
//               </div> */}

//               <div className="form-row small">
//                 <label>Minimum Qty</label>
//                 <input
//                   className="input"
//                   type="number"
//                   value={form.minQty || ""}
//                   onChange={(e) => setForm((f) => ({ ...f, minQty: e.target.value }))}
//                   placeholder="Enter a Minimum Qty"
//                 />
//               </div>
//             </div>

//             {/* Fixed Actions */}
//             <div className="modal-actions fixed">
//               <button type="submit" className="btn btn-primary">
//                 Create Product
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {/* Category Modal */}
//       {showCategoryModal && (
//         <Modal onClose={closeCategoryModal} title="Manage Categories" className="narrow-modal"  style={{
//           width: "380px",
//           maxWidth: "90%",
//           margin: "0 auto",
//         }}>
//           <div className="category-panel">
//             <div className="category-add">
//               <input
//                 className="input"
//                 placeholder="Type a category name"
//                 value={categoryDraft}
//                 onChange={(e) => setCategoryDraft(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     addCategoryDraft();
//                   }
//                 }}
//               />
// <button
//   type="button"
//   className="btn btn-dark flex items-center gap-2"
//   onClick={addCategoryDraft}
// >
//   <FaPlus color="green" />
//   <span className="text-green-500">Add</span>
// </button>
//             </div>

//             <div className="category-list">
//               {categoryTemp.length === 0 ? (
//                 <p className="muted">No categories yet.</p>
//               ) : (
//                 categoryTemp.map((c) => (
//                   <div key={c} className="chip">
//                     <span>{c}</span>

//                     <button
//                       type="button"
//                       className="chip-del"
//                       title="Delete"
//                       onClick={() => removeTempCategory(c)}
//                     >
//                       <FaTrash color="red" />
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>

//             <div className="modal-actions">
//               <button className="btn btn-primary" onClick={saveCategories}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* ---------- Small building blocks ---------- */
// function Detail({ label, value }) {
//   return (
//     <div className="detail">
//       <span className="detail-label">{label}</span>
//       <span className="detail-value">{String(value ?? "-")}</span>
//     </div>
//   );
// }

// function Modal({ title, children, onClose, className = "", style = {}, width }) {
//   return (
//     <div className="modal-overlay" onMouseDown={onClose}>
//       <div
//         className={`modal-card slide-up ${className}`}
//         style={{ width: width || "600px", ...style }}
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <div className="modal-header">
//           <h3>{title}</h3>
//           <button className="icon-close" onClick={onClose} aria-label="Close">
//             <FaTimes />
//           </button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }










// // src/pages/Stock/Products.jsx
import React from "react";
import { useMemo, useState, useEffect, useRef } from "react";
import { FaPlus, FaEye, FaTimes, FaChevronDown, FaTrash, FaEdit } from "react-icons/fa";
import "../../styles/products.css";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";
import { getApiUrl } from "../../utils/api";
import Pagination from "../../components/Pagination";

export default function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const wrapperRef = useRef(null);

const [editBatch, setEditBatch] = useState(null);

const [batchEditState, setBatchEditState] = React.useState({});

const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const limit = 5; // change as needed

const toggleEditing = (batchNo, value, initialQty = 0) => {
  setBatchEditState((prev) => ({
    ...prev,
    [batchNo]: { ...prev[batchNo], editing: value, newMinQty: prev[batchNo]?.newMinQty ?? initialQty }
  }));
};

const updateMinQty = (batchNo, value) => {
  setBatchEditState((prev) => ({
    ...prev,
    [batchNo]: { ...prev[batchNo], newMinQty: value }
  }));
};

  // For manager/megaadmin: selected shop
  const [selectedShop, setSelectedShop] = useState("" );

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
const getApiPath = (endpoint) => {
  const ep = endpoint.replace(/^\//, "");
  if (!user) return getApiUrl(ep);

  // Tenant user: send normal endpoint, header includes shopname
  if (user.role === "tenant") return getApiUrl(ep);

  // Manager/Megaadmin: include selectedShop in path
  if ((user.role === "manager" || user.role === "megaadmin") && selectedShop) {
    return getApiUrl(`api/shops/${selectedShop}/${ep}`);
  }

  return getApiUrl(ep);
};



  // -------------------------------
  // Fetch products & categories
  // -------------------------------
const fetchProducts = async (page = 1) => {
  if (!user) return;

  try {
    const res = await apiClient.get(`${getApiPath("products")}?page=${page}&limit=${limit}`);
    setProducts(res.data.products || []);
    setTotalPages(res.data.totalPages || 1);
    setPage(page);
  } catch (err) {
    console.error("fetchProducts error:", err);
    pushToast(`Failed to fetch products${selectedShop ? ` for shop ${selectedShop}` : ""}`);
  }
};

useEffect(() => {
  fetchProducts(page);
}, [user, selectedShop]);

const fetchCategories = async () => {
  if (!user) return;
  try {
    const res = await apiClient.get(getApiPath("categories"));

    // Normalize categories to an array
    const cats = Array.isArray(res.data) 
      ? res.data 
      : Array.isArray(res.data?.categories) 
        ? res.data.categories 
        : [];

    setCategories(cats);
  } catch (err) {
    console.error("fetchCategories error:", err);
    pushToast("Failed to fetch categories");
  }
};


  useEffect(() => {
  const loadData = async () => {
    await fetchProducts();
    await fetchCategories();
  };
  if (user) loadData();
}, [user, selectedShop]);


  // -------------------------------
  // Filtered products
  // -------------------------------
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      [p.code, p.name, p.category].some((v) => v?.toLowerCase().includes(s))
    );
  }, [search, products]);

  // -------------------------------
  // Helper: get batches
  // -------------------------------
  const getBatches = (prod) => products.filter((p) => p.code === prod.code && p.name === prod.name);

  // -------------------------------
  // Apply decrements helper
  // -------------------------------
  const applyDecrementsToProducts = (prevProducts, decrements) => {
    const productsCopy = prevProducts.map((p) => ({ ...p }));
    for (const d of decrements) {
      const code = (d.code || "").toLowerCase();
      const batchNo = (d.batchNo || "").toLowerCase();    
      let remaining = Number(d.qty || 0);

      for (let i = 0; i < productsCopy.length && remaining > 0; i++) {
        const p = productsCopy[i];
        if ((p.code || "").toLowerCase() === code && (p.batchNo || "").toLowerCase() === batchNo) {
          const available = Number(p.qty || 0);
          if (available <= 0) continue;
          const take = Math.min(available, remaining);
          p.qty = Math.max(0, available - take);
          remaining -= take;
        }
      }
    }
    return productsCopy;
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
  // Unique products by code + name
  // -------------------------------
  const uniqueProducts = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const key = `${p.code}-${p.name}`;
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values());
  }, [products]);

  const uniqueNameSuggestions = useMemo(() => {
    const seen = new Set();
    return uniqueProducts.filter((p) => {
      if (seen.has(p.name.toLowerCase())) return false;
      seen.add(p.name.toLowerCase());
      return true;
    });
  }, [uniqueProducts]);

  // -------------------------------
  // Tax summary
  // -------------------------------
  const taxSummary = useMemo(() => {
    const priceNum = parseFloat(form.salePrice || form.price || 0) || 0;
    const tax = parseFloat(form.taxPercent || 0) || 0;
    if (!priceNum || !tax) return { base: priceNum, taxAmt: 0, total: priceNum, mode: form.taxMode };
    if (form.taxMode === "exclusive") {
      const taxAmt = +(priceNum * (tax / 100)).toFixed(2);
      const total = +(priceNum + taxAmt).toFixed(2);
      return { base: priceNum, taxAmt, total, mode: "exclusive" };
    } else {
      const base = +((priceNum * 100) / (100 + tax)).toFixed(2);
      const taxAmt = +(priceNum - base).toFixed(2);
      return { base, taxAmt, total: priceNum, mode: "inclusive" };
    }
  }, [form.salePrice, form.price, form.taxPercent, form.taxMode]);

  // -------------------------------
  // Form & modal helpers
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
    try {
      const { data } = await apiClient.get(getApiPath("products/next-code"));
      resetForm(data.nextCode);
      setNextCode(data.nextCode);
      setShowCreateModal(true);
    } catch (err) {
      console.error("Failed to get next code", err);
      pushToast("Failed to generate code");
    }
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
      const { data } = await apiClient.get(getApiPath("products/next-code"));
      resetForm(data.nextCode);
      setNextCode(data.nextCode);
      setShowSuggestions(false);
      return;
    }

    const matches = products.filter((p) => p.name.toLowerCase().includes(val.toLowerCase()));
    setNameSuggestions(matches);
    setShowSuggestions(true);
      setUniqueNameSuggestions(uniqueMatches); 

    const exact = products.find((p) => p.name.toLowerCase() === val.toLowerCase());
    if (exact) {
      const batches = getBatches(exact);
      setAvailableBatches(batches);
      setForm((f) => ({ ...f, code: exact.code, shortName: exact.shortName, category: exact.category }));
      setShowBatchList(true);
    } else {
      const { data } = await apiClient.get(getApiPath("products/next-code"));
      setForm((f) => ({ ...f, code: data.nextCode }));
      setNextCode(data.nextCode);
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

  // -------------------------------
  // Create product
  // -------------------------------

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
        code: form.code, 
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


  // -------------------------------
  // Category modal helpers
  // -------------------------------
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
      const { data } = await apiClient.put(getApiPath("categories"), { categories: categoryTemp });
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
      (document.activeElement.type === "number" || document.activeElement.inputMode === "decimal")
    ) e.preventDefault();
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
  }, []);

// -------------------------------
// Listen for sales bill updates (live stock decrement)
// -------------------------------
useEffect(() => {
  const handleSalesBillUpdate = async (e) => {
    const { newItems = [], oldItems = [] } = e?.detail || {};

    if (!Array.isArray(newItems)) return;

    // Calculate net decrements (new qty - old qty if editing)
    const decrements = newItems.map((item) => {
      let prevQty = 0;
      if (oldItems.length > 0) {
        const match = oldItems.find((o) => o.code === item.code && o.batch === item.batch);
        if (match) prevQty = Number(match.qty || 0);
      }
      const netQty = Number(item.qty || 0) - prevQty;
      return netQty > 0
        ? { code: item.code, batchNo: item.batch, qty: netQty }
        : null;
    }).filter(Boolean);

    if (decrements.length === 0) return;

    // Apply decrements locally
    setProducts((prev) => applyDecrementsToProducts(prev, decrements));

    // Optional: refresh from server
    await fetchProducts();
    pushToast("Stock updated from sales bill");
  };

  window.addEventListener("salesbill:updated", handleSalesBillUpdate);
  return () => window.removeEventListener("salesbill:updated", handleSalesBillUpdate);
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




/* -------------------- */
/* Subcomponent Section */
/* -------------------- */

const BatchTableView = ({ product, getBatches, getStockCache, handleSaveMinQty }) => {
  // ✅ Keep all edit states in one place
  const [editState, setEditState] = React.useState({});

  const toggleEdit = (batchNo, value) => {
    setEditState((prev) => ({
      ...prev,
      [batchNo]: { ...prev[batchNo], editing: value },
    }));
  };

  const updateMinQty = (batchNo, newValue) => {
    setEditState((prev) => ({
      ...prev,
      [batchNo]: { ...prev[batchNo], newMinQty: newValue },
    }));
  };

  const batches = getBatches(product);

  return (
    <div className="batch-table-wrapper">
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {batches.map((b, idx) => {
            const batchNo = b.batchNo;
            const minQty = Number(b.minQty || 0);
            const stock =
              typeof getStockCache === "function"
                ? getStockCache(product.code, batchNo)
                : Number(b.qty || 0);

            const editing = editState[batchNo]?.editing || false;
            const newMinQty =
              editState[batchNo]?.newMinQty !== undefined
                ? editState[batchNo].newMinQty
                : minQty;

            return (
              <tr key={b._id || idx}>
                <td>{idx + 1}</td>
                <td>{batchNo}</td>
                <td className={stock <= minQty ? "danger" : ""}>{stock}</td>
                <td>
                  {editing ? (
                    <input
                      type="number"
                      value={newMinQty}
                      min={0}
                      onChange={(e) => updateMinQty(batchNo, Number(e.target.value))}
                      style={{ width: "60px" }}
                    />
                  ) : (
                    minQty || "-"
                  )}
                </td>
                <td>{Number(b.mrp || 0).toFixed(2)}</td>
                <td>{Number(b.salePrice || b.rate || 0).toFixed(2)}</td>
                <td>{b.taxPercent || 0}%</td>
                <td>{b.taxMode || "-"}</td>
                <td>
                  {editing ? (
                    <>
                      <button
                        className="btn btn-success btn-small"
                        onClick={async () => {
                          await handleSaveMinQty({
                            code: product.code,
                            batchNo,
                            minQty: newMinQty,
                          });
                          toggleEdit(batchNo, false);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-muted btn-small"
                        onClick={() => toggleEdit(batchNo, false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => toggleEdit(batchNo, true)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


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
   
     <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Create Product
        </button>
    
        
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-wrap">
          <input
            className="input !w-[350px] !md:w-[400px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
            type="text"
            placeholder="Search by Product Code or Name / Category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
    
      
   {/* Table */}
<div className="card table-card" style={{ width: "100%", overflowX: "auto" }}>
  <div className="table-responsive" style={{ minWidth: "100%" }}>
    <table
      className="table clean"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "600px",
      }}
    >
      <thead>
        <tr
          style={{
            backgroundColor: "#007867",
            color: "#fff",
            textAlign: "left",
          }}
        >
          <th style={{ padding: "0.75rem" }}>S.No</th>
          <th style={{ padding: "0.75rem" }}>Product Code</th>
          <th style={{ padding: "0.75rem" }}>Product Name</th>
          <th style={{ padding: "0.75rem" }}>Category</th>
          <th style={{ padding: "0.75rem" }}>Qty</th>
          {/* <th style={{ padding: "0.75rem" }}>Min Qty</th> */}
          <th style={{ padding: "0.75rem" }} className="text-center">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "1rem", color: "#777" }}>
              No products found
            </td>
          </tr>
        ) : (
          // Group by product code to show one row per product
          Object.values(
            filtered.reduce((acc, p) => {
              if (!acc[p.code]) {
                acc[p.code] = { ...p }; // first product instance
              } else {
                // optional: merge batches if p has new ones
                acc[p.code].batches = [
                  ...(acc[p.code].batches || getBatches(acc[p.code])),
                  ...(getBatches(p) || []),
                ].filter(
                  (b, idx, self) =>
                    idx === self.findIndex((t) => t.batchNo === b.batchNo)
                ); // remove duplicate batches
              }
              return acc;
            }, {})
          ).map((p, idx) => {
            const batches = p.batches || getBatches(p); // all batches
            const totalQty = batches.reduce((sum, b) => sum + Number(b.qty || 0), 0);
            const minQty = Math.min(...batches.map((b) => Number(b.minQty || Infinity)));

            return (
              <tr
                key={p._id || p.code}
                style={{
                  transition: "all 0.3s ease",
                  opacity: 0,
                  animation: "fadeIn 0.5s forwards",
                  cursor: "default",
                }}
                className="fade-in"
              >
                <td style={{ padding: "0.5rem" }}>{idx + 1}</td>
                <td style={{ padding: "0.5rem" }}>{p.code}</td>
                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                <td style={{ padding: "0.5rem" }}>{p.category}</td>

                {/* Qty column - highlight if ≤ min qty */}
                <td
                  style={{
                    padding: "0.5rem",
                    color: totalQty <= minQty ? "#FF4C4C" : "#000",
                    fontWeight: totalQty <= minQty ? "bold" : "normal",
                  }}
                >
                  {totalQty}
                </td>

                {/* Min Qty column */}
                {/* <td style={{ padding: "0.5rem" }}>{minQty === Infinity ? "-" : minQty}</td> */}

                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                  <button
                    onClick={() => openView({ ...p, batches })} // pass product + all batches
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
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#007867")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#00A76F")}
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
  </div>
  <Pagination page={page} totalPages={totalPages} onPageChange={fetchProducts} />

  <style>
    {`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        table {
          min-width: 100%;
          font-size: 0.9rem;
        }

        th, td {
          padding: 0.5rem;
        }

        button {
          padding: 0.4rem 0.6rem;
        }
      }
    `}
  </style>
</div>



{/* 🔹 View Modal */}
{showViewModal && (
  <Modal onClose={closeView} title="Product Details" className="wide-modal">
    <div className="product-info-grid">
      <div>
        <p><strong>Code:</strong> {showViewModal.code}</p>
        <p><strong>Category:</strong> {showViewModal.category}</p>
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

    <h4 style={{ fontWeight: "bold", marginTop: "12px" }}>Batch Details</h4>
    <div className="batch-table-wrapper">
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
            <th>Action</th> {/* 🟠 Added */}
          </tr>
        </thead>
        <tbody>
          {getBatches(showViewModal).map((b, idx) => {
            const minQty = Number(b.minQty || 0);
            const resultingStock = typeof getStockCache === "function"
              ? getStockCache(showViewModal.code, b.batchNo)
              : Number(b.qty || 0);

            return (
              <tr key={b._id || idx}>
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
                    style={{
                      color: "orange",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
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

    <div className="modal-actions">
      <button className="btn btn-muted" onClick={closeView}>
        Close
      </button>
    </div>
  </Modal>
)}


{/* 🔹 Edit Min Qty Modal */}
{editBatch && (
  <Modal
    onClose={() => setEditBatch(null)}
    title={`Edit Min Qty - ${editBatch.batchNo}`}
  >
    <div className="edit-minqty-form">
      <label><strong>New Min Qty:</strong></label>
      <input
        type="number"
        value={editBatch.minQty}
        min={0}
        onChange={(e) =>
          setEditBatch((prev) => ({
            ...prev,
            minQty: Number(e.target.value),
          }))
        }
        style={{ width: "100%", padding: "6px", marginTop: "6px" }}
      />

      <div className="modal-actions" style={{ marginTop: "14px" }}>
        <button
          className="btn btn-success"
          onClick={async () => {
            try {
              await handleSaveMinQty(editBatch); // 🔹 backend update
              // 🔹 update local state for immediate view refresh
              showViewModal.batches = showViewModal.batches.map((b) =>
                b.batchNo === editBatch.batchNo
                  ? { ...b, minQty: editBatch.minQty }
                  : b
              );
              setEditBatch(null);
            } catch (err) {
              console.error("Failed to update min qty:", err);
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
)}







{/* View Modal */}






      {/* Create Product Modal */}
      {showCreateModal && (
        <Modal onClose={closeCreate} title="Create Product">
          <form onSubmit={onCreate} className="product-form" autoComplete="off">
            <div className="form-grid">
              {/* Left */}
              <div className="form-col">


      <div className="form-row wide relative" style={{ position: "relative" }}>
      <label>Product Code</label>
      <input
        className="input"
        value={form.code || ""}
        onChange={(e) => onCodeChange(e.target.value)}
        onFocus={() =>
          form.code || uniqueCodeSuggestions.length > 0
            ? setShowCodeSuggestions(true)
            : null
        }
        onBlur={() => setTimeout(() => setShowCodeSuggestions(false), 150)}
        placeholder="Enter a Product Code"
        style={{
          width: "100%",
          padding: "0.5rem 0.75rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          fontSize: "1rem",
        }}
      />

      {showCodeSuggestions && uniqueCodeSuggestions.length > 0 && (
        <div
          className="suggestions"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "250px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            background: "#fff",
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {uniqueCodeSuggestions.map((s) => (
            <div
              key={s._id || s.code}
              className="suggestion"
              onMouseDown={(e) => {
                e.preventDefault();
                selectCodeSuggestion(s);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f0f0f0",
                fontWeight: 500,
              }}
            >
              <span>{s.code}</span>
              <span style={{ fontSize: "0.85rem", color: "#888" }}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>



                <div className="form-row">
                  <label>Short Name</label>
                  <input
                    className="input"
                    value={form.shortName}
                    onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                   placeholder="Enter a Short Name"
                  />
                </div>

                {/* Batch No */}
                <div className="form-row wide relative">
                  <label>Batch No</label>
                  <input
                    className="input"
                    placeholder="Enter a Batch"
                    value={form.batchNo}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => ({ ...f, batchNo: v }));
                      setShowBatchList(v.trim() === "");
                    }}
                    onFocus={() => setShowBatchList(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowBatchList((prev) => (form.batchNo ? false : prev));
                      }, 150);
                    }}
                  />

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
                            <tr
                              key={b._id || b.batchNo}
                              className="batch-row"
                              onClick={() => {
                                onBatchSelect(b);
                                setShowBatchList(false);
                              }}
                            >
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
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    value={form.salePrice}
                    onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                    placeholder="Enter a Rate"
                  />
                </div>
              </div>

              {/* Right */}
              <div className="form-col">

{/* <div className="form-row wide relative">
  <label>Product Name</label>
  <input
    className="input"
    value={form.name}
    onChange={(e) => onNameChange(e.target.value)}
    onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
    placeholder="Enter a Product Name"
  />

  {showSuggestions && nameSuggestions.length > 0 && (
    <div className="suggestions">
      {nameSuggestions.map((s) => (
        <div
          key={s._id || s.name}
          className="suggestion"
          onClick={() => selectSuggestion(s)}
        >
          <span>{s.name}</span>
        </div>
      ))}
    </div>
  )}
</div> */}
   <div className="form-row wide relative" style={{ position: "relative" }}>
      <label>Product Name</label>
      <input
        className="input"
        value={form.name}
        onChange={(e) => onNameChange(e.target.value)}
        onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Enter a Product Name"
        style={{
          width: "100%",
          padding: "0.5rem 0.75rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          fontSize: "1rem",
        }}
      />

      {showSuggestions && nameSuggestions.length > 0 && (
        <div
          className="suggestions"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "250px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            background: "#fff",
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {nameSuggestions.map((s) => (
            <div
              key={s._id || s.code}
              className="suggestion"
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ fontWeight: 500 }}>{s.name}</span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#888",
                  fontStyle: "italic",
                }}
              >
                {s.code}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>

                <div className="form-row with-action">
                  <div className="label-row">
                    <label>Category</label>
                    <button
                      type="button"
                      className="link-action"
                      onClick={openCategoryModal}
                      title="Add Category"
                    >
                      + Category
                    </button>
                  </div>
                  <div className="select-wrap">

                    <select
  className="input select"
  value={form.category}
  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
>
  <option value="">Select category</option>
  {Array.isArray(categories) && categories.map((c) => (
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
                  <input
                    className="input no-spin"
                    type="number"
                    inputMode="decimal"
                    value={form.mrp}
                    onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                    placeholder="Enter a MRP"
                    onFocus={enableWheelBlock}
                    onBlur={disableWheelBlock}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                    }}
                  />
                </div>

                <div className="form-row">
                  <label>Tax %</label>
                  <input
                    className="input no-spin"
                    type="number"
                    placeholder="Enter a Tax"
                    inputMode="decimal"
                    value={form.taxPercent}
                    onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))}
                    onFocus={enableWheelBlock}
                    onBlur={disableWheelBlock}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tax Mode */}
            <div className="tax-mode">
              <label className="radio">
                <input
                  type="radio"
                  name="taxMode"
                  value="inclusive"
                  checked={form.taxMode === "inclusive"}
                  onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))}
                />
                <span>Tax Inclusive</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="taxMode"
                  value="exclusive"
                  checked={form.taxMode === "exclusive"}
                  onChange={(e) => setForm((f) => ({ ...f, taxMode: e.target.value }))}
                />
                <span>Tax Exclusive</span>
              </label>
            </div>

            {/* Summary */}
            <div className="card summary-card">
              <div className="summary-line">
                <span>Base Price</span>
                <strong>{taxSummary.base.toFixed(2)}</strong>
              </div>
              <div className="summary-line">
                <span>Tax Amount ({form.taxPercent || 0}%)</span>
                <strong>{taxSummary.taxAmt.toFixed(2)}</strong>
              </div>
              <div className="summary-line total">
                <span>Total ({form.taxMode})</span>
                <strong>{taxSummary.total.toFixed(2)}</strong>
              </div>
            </div>

            {/* Qty & Minimum Qty */}
            <div className="form-row-inline">
              {/* <div className="form-row small">
                <label>Qty</label>
                <input
                  className="input"
                  type="number"
                  value={form.qty}
                  onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                  
                />
              </div> */}

              <div className="form-row small">
                <label>Minimum Qty</label>
                <input
                  className="input"
                  type="number"
                  value={form.minQty || ""}
                  onChange={(e) => setForm((f) => ({ ...f, minQty: e.target.value }))}
                  placeholder="Enter a Minimum Qty"
                />
              </div>
            </div>

            {/* Fixed Actions */}
            <div className="modal-actions fixed">
              <button type="submit" className="btn btn-primary">
                Create Product
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <Modal onClose={closeCategoryModal} title="Manage Categories" className="narrow-modal"  style={{
          width: "380px",
          maxWidth: "90%",
          margin: "0 auto",
        }}>
          <div className="category-panel">
            <div className="category-add">
              <input
                className="input"
                placeholder="Type a category name"
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategoryDraft();
                  }
                }}
              />
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

                    <button
                      type="button"
                      className="chip-del"
                      title="Delete"
                      onClick={() => removeTempCategory(c)}
                    >
                      <FaTrash color="red" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveCategories}>
                Save
              </button>
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
      <div
        className={`modal-card slide-up ${className}`}
        style={{ width: width || "600px", ...style }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
