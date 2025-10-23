



// // //21/10/2025 9:42
// // // src/pages/Sidebar/Orders.jsx
// import { useEffect, useRef, useState, useContext } from "react";
// import {
//   FaPlus,
//   FaEye,
//   FaEdit,
//   FaCheck,
//   FaTimes,
//   FaTrash,
// } from "react-icons/fa";
// import "../../styles/Sidebar/Orders.css";
// import { useAuth } from "../../context/AuthContext";
// import { ShopContext } from "../../context/ShopContext";
// import { tenantApiUrl, apiGet, apiPost, apiPut } from "../../utils/api";
// import Pagination from "../../components/Pagination";

// export default function Orders({ shopname: propShopname }) {
//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);

//   const shopname = selectedShop?.shopname || propShopname || user?.shopname;
//   const token = localStorage.getItem("token");
//   const isAdmin = user?.role === "admin" || user?.role === "manager";

//   const ORDERS_API = isAdmin
//     ? tenantApiUrl("orders", selectedShop?.shopname || shopname)
//     : tenantApiUrl("orders");

//   const PRODUCTS_API = isAdmin
//     ? tenantApiUrl("products", selectedShop?.shopname || shopname)
//     : tenantApiUrl("products");

//   /* ---------- State ---------- */
//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [toasts, setToasts] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [viewOpen, setViewOpen] = useState(false);

//   const [orderNo, setOrderNo] = useState("");
//   const [orderDate, setOrderDate] = useState("");
//   const [orderLines, setOrderLines] = useState([]);
//   const nextLineId = useRef(1);

//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10); // items per page
//   const [totalPages, setTotalPages] = useState(1);

//   const [searchOrderNo, setSearchOrderNo] = useState("");
//   const [searchProduct, setSearchProduct] = useState("");
//   const [searchStatus, setSearchStatus] = useState("");
//   const [dateRange, setDateRange] = useState({ start: "", end: "" });
//   const [isEditingOrder, setIsEditingOrder] = useState(false);

//   /* ---------- Toasts ---------- */
//   const pushToast = (msg) => {
//     const id = Date.now() + Math.random();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
//   };

//   /* ---------- Fetch Orders & Products ---------- */
//   const fetchOrders = async (p = 1) => {
//     setLoading(true);
//     try {
//       const query = new URLSearchParams({
//         page: p,
//         limit,
//         orderNo: searchOrderNo,
//         product: searchProduct,
//         status: searchStatus,
//         startDate: dateRange.start,
//         endDate: dateRange.end,
//       }).toString();

//       const res = await fetch(`${ORDERS_API}?${query}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();

//       setOrders(data.orders || []);
//       setTotalPages(data.totalPages || 1);
//       setPage(p);
//     } catch (err) {
//       console.error("fetchOrders error:", err);
//       pushToast("Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const data = await apiGet(PRODUCTS_API, token);
//       const normalized = (data?.products || []).map((p) => ({
//         _id: p._id,
//         code: p.code,
//         name: p.name,
//         batchNo: p.batchNo || "",
//         qty: p.qty || 0,
//         minQty: p.minQty || 0,
//       }));
//       setProducts(normalized);
//     } catch (err) {
//       console.error("fetchProducts error:", err);
//       pushToast("Failed to fetch products");
//     }
//   };

//   useEffect(() => {
//     fetchOrders(page);
//     fetchProducts();
//     nextLineId.current = 1;
//   }, [shopname, selectedShop?.shopname, user?.role]);

//   /* ---------- Utilities ---------- */
//   const todayFormatted = () => {
//     const d = new Date();
//     return `${String(d.getDate()).padStart(2, "0")}/${String(
//       d.getMonth() + 1
//     ).padStart(2, "0")}/${d.getFullYear()}`;
//   };

//   const blankLine = () => ({
//     id: nextLineId.current++,
//     code: "",
//     name: "",
//     qty: "",
//     error: "",
//     suggestions: [],
//     suggestionType: null,
//     isEditing: true,
//     backup: null,
//   });

//   const uniqueProducts = (list) => {
//     const seen = new Set();
//     return list.filter((p) => {
//       const key = `${p.code}||${p.name}`;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });
//   };

//   const suggestionsByName = (q = "") =>
//     uniqueProducts(
//       products.filter((p) => (p.name || "").toLowerCase().includes(q.toLowerCase()))
//     );
//   const suggestionsByCode = (q = "") =>
//     uniqueProducts(
//       products.filter((p) => (p.code || "").toLowerCase().includes(q.toLowerCase()))
//     );

//   /* ---------- Modal Open/Close ---------- */
//   const openCreate = async () => {
//     setIsEditingOrder(false);

//     if (!products.length) await fetchProducts();

//     try {
//       const res = await apiGet(`${ORDERS_API}/next-order-no/preview`, token);
//       setOrderNo(res?.orderNo || "ORDER001");
//     } catch {
//       setOrderNo("ORDER001");
//     }

//     setOrderDate(todayFormatted());
//     nextLineId.current = 1;
//     setOrderLines([blankLine()]);
//     setShowModal(true);
//   };

//   const openEdit = (order) => {
//     setIsEditingOrder(true);

//     setOrderNo(order.orderNo);
//     setOrderDate(order.date || todayFormatted());
//     nextLineId.current = 1;
//     setOrderLines(
//       (order.items || []).map((it) => ({
//         id: nextLineId.current++,
//         code: it.code || "",
//         name: it.name || "",
//         qty: it.qty || "",
//         error: "",
//         suggestions: [],
//         suggestionType: null,
//         isEditing: false,
//         backup: null,
//       }))
//     );
//     setShowModal(true);
//   };

//   const closeModal = () => setShowModal(false);

//   /* ---------- Row Editing ---------- */
//   const startEditRow = (id) =>
//     setOrderLines((prev) =>
//       prev.map((ln) =>
//         ln.id === id ? { ...ln, isEditing: true, backup: { ...ln } } : ln
//       )
//     );

//   const cancelEditRow = (id) =>
//     setOrderLines((prev) =>
//       prev.map((ln) =>
//         ln.id === id ? { ...ln.backup, isEditing: false, backup: null } : ln
//       )
//     );

//   const saveEditRow = (id) =>
//     setOrderLines((prev) =>
//       prev.map((ln) => (ln.id === id ? { ...ln, isEditing: false, backup: null } : ln))
//     );

//   const updateLineField = (id, field, value) => {
//     setOrderLines((prev) =>
//       prev.map((ln) => {
//         if (ln.id !== id) return ln;

//         let next = { ...ln, [field]: value, error: "" };

//         if (field === "code") {
//           next.name = "";
//           const exact = products.find(
//             (p) => (p.code || "").toLowerCase() === value.toLowerCase()
//           );
//           if (exact) {
//             next.name = exact.name;
//             if (!next.qty) next.qty = 1;
//             next.suggestions = [];
//             next.suggestionType = null;
//           }
//         }

//         if (field === "name") {
//           next.code = "";
//           const exact = products.find(
//             (p) => (p.name || "").toLowerCase() === value.toLowerCase()
//           );
//           if (exact) {
//             next.code = exact.code;
//             if (!next.qty) next.qty = 1;
//             next.suggestions = [];
//             next.suggestionType = null;
//           }
//         }

//         return next;
//       })
//     );
//   };

//   const showSuggestionsForLine = (id, val = "", by = "name") => {
//     const matches = by === "name" ? suggestionsByName(val) : suggestionsByCode(val);
//     setOrderLines((prev) =>
//       prev.map((ln) =>
//         ln.id === id ? { ...ln, suggestions: matches.slice(0, 50), suggestionType: by } : ln
//       )
//     );
//   };

//   const selectSuggestionForLine = (id, prod) => {
//     setOrderLines((prev) =>
//       prev.map((ln) =>
//         ln.id === id
//           ? {
//               ...ln,
//               code: prod.code,
//               name: prod.name,
//               qty: ln.qty || 1,
//               suggestions: [],
//               suggestionType: null,
//             }
//           : ln
//       )
//     );
//   };

//   const addRowAfter = (afterId) => {
//     setOrderLines((prev) => {
//       const idx = prev.findIndex((r) => r.id === afterId);
//       if (idx === -1) return prev;
//       const current = prev[idx];
//       if (!current.code && !current.name) {
//         pushToast("Fill the current row before adding a new one");
//         return prev;
//       }
//       if (prev.some((r) => !r.code && !r.name)) {
//         pushToast("Only one blank row allowed at a time");
//         return prev;
//       }
//       const updated = [...prev];
//       updated.splice(idx + 1, 0, blankLine());
//       return updated;
//     });
//   };

//   const removeRow = (id) => setOrderLines((prev) => prev.filter((r) => r.id !== id));

//   const validateLine = (ln) => {
//     if (!ln) return "Invalid row";
//     if (!ln.code && !ln.name) return "Product required";
//     const q = Number(ln.qty || 0);
//     if (!q || q <= 0) return "Qty must be > 0";
//     return "";
//   };

//   /* ---------- Confirm Order ---------- */
//   const confirmOrder = async () => {
//     const nonBlankLines = orderLines.filter((ln) => ln.code || ln.name || ln.qty);
//     if (!nonBlankLines.length) return pushToast("Cannot confirm empty order");

//     const validated = nonBlankLines.map((ln) => ({ ...ln, error: validateLine(ln) }));
//     setOrderLines((prev) =>
//       prev.map((ln) => validated.find((v) => v.id === ln.id) || ln)
//     );

//     if (validated.some((ln) => ln.error)) return pushToast("Fix required fields");

//     const payload = validated.map((ln) => ({
//       code: ln.code.trim(),
//       name: ln.name.trim(),
//       qty: Number(ln.qty),
//     }));

//     try {
//       const res = await apiPost(
//         ORDERS_API,
//         { items: payload, date: orderDate, status: "placed" },
//         token,
//         { "x-shopname": shopname }
//       );
//       pushToast(`Order placed: ${res.orderNo}`);
//       await fetchOrders();
//       closeModal();
//     } catch (err) {
//       pushToast(err?.response?.data?.message || "Failed to place order");
//     }
//   };

//   /* ---------- Status Update ---------- */
//   const statusSequence = ["placed", "received", "completed", "cancelled"];
//   const nextStatus = (current) => {
//     const idx = statusSequence.indexOf((current || "").toLowerCase());
//     return idx < statusSequence.length - 1 ? statusSequence[idx + 1] : statusSequence[idx];
//   };

//   const updateOrderStatus = async (orderId, currentStatus) => {
//     const target = nextStatus(currentStatus);
//     setOrders((prev) =>
//       prev.map((o) => (o._id === orderId ? { ...o, status: target, updating: true } : o))
//     );
//     try {
//       await apiPut(`${ORDERS_API}/${orderId}/status`, { status: target }, token);
//       pushToast(`Status updated to ${target}`);
//       setOrders((prev) =>
//         prev.map((o) => (o._id === orderId ? { ...o, updating: false } : o))
//       );
//     } catch {
//       pushToast("Failed to update status");
//       setOrders((prev) =>
//         prev.map((o) =>
//           o._id === orderId ? { ...o, status: currentStatus, updating: false } : o
//         )
//       );
//     }
//   };

//   /* ---------- View Order ---------- */
//   const openView = async (order) => {
//     try {
//       const data = await apiGet(`${ORDERS_API}/${order._id}`, token);
//       setSelectedOrder(data);
//       setViewOpen(true);
//     } catch {
//       pushToast("Failed to load order details");
//     }
//   };

//   const closeView = () => {
//     setSelectedOrder(null);
//     setViewOpen(false);
//   };

//   const orderTotalQty = (order) =>
//     (order.items || []).reduce((s, it) => s + Number(it.qty || 0), 0);

//   const statusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "placed":
//         return "#F59E0B";
//       case "received":
//       case "completed":
//         return "#00A76f";
//       case "cancelled":
//         return "#E53935";
//       default:
//         return "#9CA3AF";
//     }
//   };

//   return (
//     <div className="order-page">
//       {/* Toasts */}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className="toast">
//             {t.msg}
//           </div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="orders-header">
//         <h2>Orders</h2>
//         <button className="btn btn-primary" onClick={openCreate}>
//           <FaPlus /> Purchase Order
//         </button>
//       </div>

//       {/* Search */}
//       <div className="flex items-center gap-2 p-4">
//         <input
//           type="text"
//           placeholder="Search Order No / Product Name"
//           value={searchOrderNo}
//           onChange={(e) => setSearchOrderNo(e.target.value)}
//           className="!w-[260px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//         />

//         <select
//           value={searchStatus}
//           onChange={(e) => setSearchStatus(e.target.value)}
//           className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//         >
//           <option value="">All</option>
//           <option value="placed">Placed</option>
//           <option value="received">Received</option>
//           <option value="completed">Completed</option>
//           <option value="cancelled">Cancelled</option>
//         </select>

//         <input
//           type="date"
//           value={dateRange.start}
//           onChange={(e) =>
//             setDateRange((prev) => ({ ...prev, start: e.target.value }))
//           }
//           className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//         />
//         <span className="text-sm">to</span>
//         <input
//           type="date"
//           value={dateRange.end}
//           onChange={(e) =>
//             setDateRange((prev) => ({ ...prev, end: e.target.value }))
//           }
//           className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//         />

//         {/* <button
//           onClick={() => fetchOrders(1)}
//           className="h-8 text-sm bg-[#007867] text-white px-3 py-1 rounded-md hover:bg-[#005f50] shadow-sm hover:shadow-md transition-all duration-200"
//         >
//           Search
//         </button> */}

//         <button
//           onClick={() => {
//             setSearchOrderNo("");
//             setSearchProduct("");
//             setSearchStatus("");
//             setDateRange({ start: "", end: "" });
//             fetchOrders(1);
//           }}
//           className="h-8 text-sm bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
//         >
//           Reset
//         </button>
//       </div>

//       {/* Orders Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border-collapse table-auto text-left">
//           <thead className="bg-gray-100">
//             <tr>
//               <th>S.No</th>
//               <th>Order No</th>
//               <th>Date</th>
//               <th>Product Name</th>
//               <th>Qty</th>
//               <th>Status</th>
//               <th className="text-center">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="7" className="text-center p-4">
//                   Loading...
//                 </td>
//               </tr>
//             ) : orders.length === 0 ? (
//               <tr>
//                 <td colSpan="7" className="text-center text-gray-500 p-4">
//                   No orders found
//                 </td>
//               </tr>
//             ) : (
//               orders.map((o, i) => {
//                 const firstName =
//                   (o.items && o.items[0] && o.items[0].name) || "-";
//                 return (
//                   <tr key={o._id || o.orderNo || i} className="hover:bg-gray-50 transition">
//                     <td>{(page - 1) * limit + i + 1}</td>
//                     <td>{o.orderNo}</td>
//                     <td>{o.date}</td>
//                     <td>
//                       {firstName}
//                       {o.items && o.items.length > 1
//                         ? ` (+${o.items.length - 1})`
//                         : ""}
//                     </td>
//                     <td>{orderTotalQty(o)}</td>
//                     <td>
//                       <button
//                         onClick={() => updateOrderStatus(o._id, o.status)}
//                         disabled={o.updating}
//                         style={{ cursor: o.updating ? "wait" : "pointer" }}
//                       >
//                         <span
//                           className="status-dot"
//                           style={{ backgroundColor: statusColor(o.status) }}
//                         />
//                         <span>{o.status}</span>
//                       </button>
//                     </td>
//                     <td className="flex justify-center gap-2">
//                       <button onClick={() => openView(o)} title="View">
//                         <FaEye title="View" color="#00A76f" />
//                       </button>
//                       <button onClick={() => openEdit(o)} title="Edit">
//                         <FaEdit title="Edit" color="#F59E0B" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//         <Pagination page={page} totalPages={totalPages} onPageChange={fetchOrders} />
//       </div>

//       {/* Create/Edit Modal */}
//       {showModal && (
//         <div className="modal wide">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>{isEditingOrder ? `Edit Order (${orderNo})` : "New Order"}</h3>
//               <button className="close" onClick={closeModal}>
//                 <FaTimes title="Close" />
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="order-fields">
//                 <input type="text" placeholder="Order No" value={orderNo} readOnly />
//                 <input
//                   type="text"
//                   placeholder="Date"
//                   value={orderDate}
//                   onChange={(e) => setOrderDate(e.target.value)}
//                 />
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full border-collapse table-auto text-left">
//                   <thead>
//                     <tr>
//                       <th>Code</th>
//                       <th>Name</th>
//                       <th>Qty</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orderLines.map((ln) => (
//                       <tr key={ln.id}>
//                         {ln.isEditing ? (
//                           <>
//                             <td>
//                               <input
//                                 value={ln.code}
//                                 onChange={(e) => updateLineField(ln.id, "code", e.target.value)}
//                                 onFocus={() => showSuggestionsForLine(ln.id, ln.code, "code")}
//                               />
//                               {ln.suggestions.length > 0 && ln.suggestionType === "code" && (
//                                 <ul className="suggestions">
//                                   {ln.suggestions.map((s) => (
//                                     <li key={s.code} onClick={() => selectSuggestionForLine(ln.id, s)}>
//                                       {s.code}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               )}
//                             </td>
//                             <td>
//                               <input
//                                 value={ln.name}
//                                 onChange={(e) => updateLineField(ln.id, "name", e.target.value)}
//                                 onFocus={() => showSuggestionsForLine(ln.id, ln.name, "name")}
//                               />
//                               {ln.suggestions.length > 0 && ln.suggestionType === "name" && (
//                                 <ul className="suggestions">
//                                   {ln.suggestions.map((s) => (
//                                     <li key={s.code} onClick={() => selectSuggestionForLine(ln.id, s)}>
//                                       {s.name}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               )}
//                             </td>
//                             <td>
//                               <input value={ln.qty} onChange={(e) => updateLineField(ln.id, "qty", e.target.value)} />
//                             </td>
//                             <td>
//                               <button onClick={() => saveEditRow(ln.id)}>
//                                 <FaCheck title="Update Row" color="#00A76f" />
//                               </button>
//                               <button onClick={() => cancelEditRow(ln.id)}>
//                                 <FaTimes title="Close" color="#E53935" />
//                               </button>
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td>{ln.code}</td>
//                             <td>{ln.name}</td>
//                             <td>{ln.qty}</td>
//                             <td className="flex gap-1">
//                               <button onClick={() => startEditRow(ln.id)}>
//                                 <FaEdit title="Edit" color="#F59E0B" />
//                               </button>
//                               <button onClick={() => addRowAfter(ln.id)}>
//                                 <FaPlus title="Add" color="#00A76f" />
//                               </button>
//                               {orderLines.length > 1 && (
//                                 <button onClick={() => removeRow(ln.id)}>
//                                   <FaTrash title="Delete" color="#E53935" />
//                                 </button>
//                               )}
//                             </td>
//                           </>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="btn btn-primary" onClick={confirmOrder}>
//                 <FaCheck /> Confirm Order
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Modal */}
//       {viewOpen && selectedOrder && (
//         <div className="modal wide">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>Order Details ({selectedOrder.orderNo})</h3>
//               <button className="close" onClick={closeView}>
//                 <FaTimes />
//               </button>
//             </div>
//             <div className="modal-body overflow-x-auto">
//               <table className="min-w-full border-collapse table-auto text-left">
//                 <thead>
//                   <tr>
//                     <th>Code</th>
//                     <th>Name</th>
//                     <th>Qty</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedOrder.items.map((it, i) => (
//                     <tr key={i}>
//                       <td>{it.code}</td>
//                       <td>{it.name}</td>
//                       <td>{it.qty}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// //21/10/2025 9:42
// // src/pages/Sidebar/Orders.jsx
// src/pages/Sidebar/Orders.jsx
import { useEffect, useRef, useState, useContext } from "react";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaCheck,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import "../../styles/Sidebar/Orders.css";
import { useAuth } from "../../context/AuthContext";
import { ShopContext } from "../../context/ShopContext";
import { tenantApiUrl, apiGet, apiPost, apiPut } from "../../utils/api";
import Pagination from "../../components/Pagination";

export default function Orders({ shopname: propShopname }) {
  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);

  const shopname = selectedShop?.shopname || propShopname || user?.shopname;
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin" || user?.role === "manager";

  const ORDERS_API = isAdmin
    ? tenantApiUrl("orders", selectedShop?.shopname || shopname)
    : tenantApiUrl("orders");

  const PRODUCTS_API = isAdmin
    ? tenantApiUrl("products", selectedShop?.shopname || shopname)
    : tenantApiUrl("products");

  /* ---------- State ---------- */
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderLines, setOrderLines] = useState([]);
  const nextLineId = useRef(1);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  /* ---------- Toasts ---------- */
  const pushToast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  /* ---------- Fetch Orders & Products ---------- */
  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: p,
        limit,
        orderNo: searchOrderNo,
        status: searchStatus,
        startDate: dateRange.start,
        endDate: dateRange.end,
      }).toString();

      const res = await fetch(`${ORDERS_API}?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (err) {
      console.error("fetchOrders error:", err);
      pushToast("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiGet(PRODUCTS_API, token);
      const normalized = (data?.products || []).map((p) => ({
        _id: p._id,
        code: p.code,
        name: p.name,
        batchNo: p.batchNo || "",
        qty: p.qty || 0,
        minQty: p.minQty || 0,
      }));
      setProducts(normalized);
    } catch (err) {
      console.error("fetchProducts error:", err);
      pushToast("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchOrders(page);
    fetchProducts();
    nextLineId.current = 1;
  }, [shopname, selectedShop?.shopname, user?.role]);

  /* ---------- Utilities ---------- */
  const todayFormatted = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const blankLine = () => ({
    id: nextLineId.current++,
    code: "",
    name: "",
    qty: "",
    error: "",
    suggestions: [],
    suggestionType: null,
    isEditing: true,
    backup: null,
  });

  const uniqueProducts = (list) => {
    const seen = new Set();
    return list.filter((p) => {
      const key = `${p.code}||${p.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const suggestionsByName = (q = "") =>
    uniqueProducts(
      products.filter((p) => (p.name || "").toLowerCase().includes(q.toLowerCase()))
    );
  const suggestionsByCode = (q = "") =>
    uniqueProducts(
      products.filter((p) => (p.code || "").toLowerCase().includes(q.toLowerCase()))
    );

  /* ---------- Modal Open/Close ---------- */
  const openCreate = async () => {
    setIsEditingOrder(false);

    if (!products.length) await fetchProducts();

    try {
      const res = await apiGet(`${ORDERS_API}/next-order-no/preview`, token);
      setOrderNo(res?.orderNo || "ORDER001");
    } catch {
      setOrderNo("ORDER001");
    }

    setOrderDate(todayFormatted());
    nextLineId.current = 1;
    setOrderLines([blankLine()]);
    setShowModal(true);
  };

  const openEdit = async (order) => {
    setIsEditingOrder(true);
    setSelectedOrder(order);

    setOrderNo(order.orderNo);
    setOrderDate(order.date || todayFormatted());
    nextLineId.current = 1;
    // Only status editable, products read-only
    setOrderLines(
      (order.items || []).map((it) => ({
        id: nextLineId.current++,
        code: it.code,
        name: it.name,
        qty: it.qty,
        status: order.status,
        isEditing: false,
      }))
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderLines([]);
  };

  /* ---------- Row Editing ---------- */
  const startEditRow = (id) =>
    setOrderLines((prev) =>
      prev.map((ln) =>
        ln.id === id ? { ...ln, isEditing: true, backup: { ...ln } } : ln
      )
    );

  const cancelEditRow = (id) =>
    setOrderLines((prev) =>
      prev.map((ln) =>
        ln.id === id ? { ...ln.backup, isEditing: false, backup: null } : ln
      )
    );

  const saveEditRow = (id) =>
    setOrderLines((prev) =>
      prev.map((ln) => (ln.id === id ? { ...ln, isEditing: false, backup: null } : ln))
    );

  const updateLineField = (id, field, value) => {
    setOrderLines((prev) =>
      prev.map((ln) => {
        if (ln.id !== id) return ln;
        let next = { ...ln, [field]: value, error: "" };

        if (field === "code") {
          next.name = "";
          const exact = products.find(
            (p) => (p.code || "").toLowerCase() === value.toLowerCase()
          );
          if (exact) {
            next.name = exact.name;
            if (!next.qty) next.qty = 1;
            next.suggestions = [];
            next.suggestionType = null;
          }
        }

        if (field === "name") {
          next.code = "";
          const exact = products.find(
            (p) => (p.name || "").toLowerCase() === value.toLowerCase()
          );
          if (exact) {
            next.code = exact.code;
            if (!next.qty) next.qty = 1;
            next.suggestions = [];
            next.suggestionType = null;
          }
        }

        return next;
      })
    );
  };

  const showSuggestionsForLine = (id, val = "", by = "name") => {
    const matches = by === "name" ? suggestionsByName(val) : suggestionsByCode(val);
    setOrderLines((prev) =>
      prev.map((ln) =>
        ln.id === id ? { ...ln, suggestions: matches.slice(0, 50), suggestionType: by } : ln
      )
    );
  };

  const selectSuggestionForLine = (id, prod) => {
    setOrderLines((prev) =>
      prev.map((ln) =>
        ln.id === id
          ? {
              ...ln,
              code: prod.code,
              name: prod.name,
              qty: ln.qty || 1,
              suggestions: [],
              suggestionType: null,
            }
          : ln
      )
    );
  };

  const addRowAfter = (afterId) => {
    setOrderLines((prev) => {
      const idx = prev.findIndex((r) => r.id === afterId);
      if (idx === -1) return prev;
      const current = prev[idx];
      if (!current.code || !current.name || !current.qty) {
        pushToast("Fill current row before adding a new one");
        return prev;
      }
      if (prev.some((r) => !r.code || !r.name || !r.qty)) {
        pushToast("Only one blank row allowed at a time");
        return prev;
      }
      const updated = [...prev];
      updated.splice(idx + 1, 0, blankLine());
      return updated;
    });
  };

  const removeRow = (id) => setOrderLines((prev) => prev.filter((r) => r.id !== id));

  const validateLine = (ln) => {
    if (!ln) return "Invalid row";
    if (!ln.code || !ln.name) return "Product required";
    const q = Number(ln.qty || 0);
    if (!q || q <= 0) return "Qty must be > 0";
    return "";
  };

  /* ---------- Confirm Order ---------- */
  const confirmOrder = async () => {
    if (!isEditingOrder) {
      const nonBlankLines = orderLines.filter((ln) => ln.code && ln.name && ln.qty);
      if (!nonBlankLines.length) return pushToast("Cannot confirm empty order");

      const validated = nonBlankLines.map((ln) => ({ ...ln, error: validateLine(ln) }));
      setOrderLines((prev) =>
        prev.map((ln) => validated.find((v) => v.id === ln.id) || ln)
      );
      if (validated.some((ln) => ln.error)) return pushToast("Fix required fields");

      const payload = validated.map((ln) => ({
        code: ln.code.trim(),
        name: ln.name.trim(),
        qty: Number(ln.qty),
      }));

      try {
        const res = await apiPost(
          ORDERS_API,
          { items: payload, date: orderDate, status: "placed" },
          token,
          { "x-shopname": shopname }
        );
        pushToast(`Order placed: ${res.orderNo}`);
        await fetchOrders();
        closeModal();
      } catch (err) {
        pushToast(err?.response?.data?.message || "Failed to place order");
      }
    } else {
      const status = orderLines[0].status;
      try {
        await apiPut(`${ORDERS_API}/${selectedOrder._id}/status`, { status }, token);
        pushToast(`Status updated: ${status}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? { ...o, status } : o))
        );
        closeModal();
      } catch {
        pushToast("Failed to update status");
      }
    }
  };

  /* ---------- Status Formatting ---------- */
  const statusColor = (status) => {
    if (!status) return "#9CA3AF";
    const s = status.toLowerCase();
    switch (s) {
      case "placed":
        return "#F59E0B";
      case "received":
      case "completed":
        return "#00A76f";
      case "cancelled":
        return "#E53935";
      default:
        return "#9CA3AF";
    }
  };

  const formatStatusText = (status) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "";

  /* ---------- View Order ---------- */
  const openView = async (order) => {
    try {
      const data = await apiGet(`${ORDERS_API}/${order._id}`, token);
      setSelectedOrder(data);
      setViewOpen(true);
    } catch {
      pushToast("Failed to load order details");
    }
  };
  const closeView = () => {
    setSelectedOrder(null);
    setViewOpen(false);
  };

  const orderTotalQty = (order) =>
    (order.items || []).reduce((s, it) => s + Number(it.qty || 0), 0);

  return (
    <div className="order-page p-8">
      {/* Toasts */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      {/* Header */}
      <div className="orders-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Purchase Order
        </button>
      </div>

      {/* Orders Table & Pagination */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto text-left">
          <thead className="bg-gray-100">
            <tr>
              <th>S.No</th>
              <th>Order No</th>
              <th>Date</th>
              <th>Product Name</th>
              <th>Qty</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-gray-500 p-4">No orders found</td></tr>
            ) : (
              orders.map((o, i) => {
                const firstName = (o.items && o.items[0]?.name) || "-";
                return (
                  <tr key={o._id || o.orderNo || i} className="hover:bg-gray-50 transition">
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>{o.orderNo}</td>
                    <td>{o.date}</td>
                    <td>
                      {firstName}{o.items?.length > 1 ? ` (+${o.items.length - 1})` : ""}
                    </td>
                    <td>{orderTotalQty(o)}</td>
                    <td style={{ color: statusColor(o.status) }}>{formatStatusText(o.status)}</td>
                    <td className="flex justify-center gap-2">
                      <button onClick={() => openView(o)} title="View">
                        <FaEye color="#00A76f" />
                      </button>
                      <button onClick={() => openEdit(o)} title="Edit">
                        <FaEdit color="#F59E0B" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={fetchOrders} />
      </div>

      {/* ---------- Purchase / Edit Modal ---------- */}
      {showModal && (
        <div className="modal wide">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditingOrder ? `Edit Order (${orderNo})` : "New Order"}</h3>
              <button className="close" onClick={closeModal}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="order-fields">
                <input type="text" placeholder="Order No" value={orderNo} readOnly />
                <input type="text" placeholder="Date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse table-auto text-left">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>{isEditingOrder ? "Status" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderLines.map((ln, idx) => (
                      <tr key={ln.id}>
                        {isEditingOrder ? (
                          <>
                            <td>{ln.code}</td>
                            <td>{ln.name}</td>
                            <td>{ln.qty}</td>
                            <td>
                              <select
                                value={ln.status || selectedOrder.status}
                                onChange={(e) => setOrderLines([{ ...ln, status: e.target.value }])}
                                style={{ color: statusColor(ln.status || selectedOrder.status) }}
                              >
                                <option value="placed">Placed</option>
                                <option value="received">Received</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <input
                                value={ln.code}
                                onChange={(e) => updateLineField(ln.id, "code", e.target.value)}
                                onFocus={() => showSuggestionsForLine(ln.id, ln.code, "code")}
                              />
                              {ln.suggestions.length > 0 && ln.suggestionType === "code" && (
                                <ul className="suggestions">
                                  {ln.suggestions.map((s) => (
                                    <li key={s.code} onClick={() => selectSuggestionForLine(ln.id, s)}>{s.code}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td>
                              <input
                                value={ln.name}
                                onChange={(e) => updateLineField(ln.id, "name", e.target.value)}
                                onFocus={() => showSuggestionsForLine(ln.id, ln.name, "name")}
                              />
                              {ln.suggestions.length > 0 && ln.suggestionType === "name" && (
                                <ul className="suggestions">
                                  {ln.suggestions.map((s) => (
                                    <li key={s.code} onClick={() => selectSuggestionForLine(ln.id, s)}>{s.name}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td>
                              <input value={ln.qty} onChange={(e) => updateLineField(ln.id, "qty", e.target.value)} />
                            </td>
                            <td className="flex gap-1">
                              {idx === orderLines.length - 1 ? (
                                ln.code && ln.name && ln.qty && (
                                  <button onClick={() => addRowAfter(ln.id)} title="Add Row">
                                    <FaPlus color="#00A76f" />
                                  </button>
                                )
                              ) : (
                                <>
                                  <button onClick={() => startEditRow(ln.id)} title="Edit Row">
                                    <FaEdit color="#F59E0B" />
                                  </button>
                                  <button onClick={() => removeRow(ln.id)} title="Delete Row">
                                    <FaTrash color="#E53935" />
                                  </button>
                                </>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={confirmOrder}>
                <FaCheck /> {isEditingOrder ? "Update Status" : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- View Modal ---------- */}
      {viewOpen && selectedOrder && (
        <div className="modal wide">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order {selectedOrder.orderNo}</h3>
              <button className="close" onClick={closeView}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <p>Date: {selectedOrder.date}</p>
              <p>Status: <span style={{ color: statusColor(selectedOrder.status) }}>{formatStatusText(selectedOrder.status)}</span></p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse table-auto text-left">
                  <thead>
                    <tr><th>Code</th><th>Name</th><th>Qty</th></tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((it, i) => (
                      <tr key={i}>
                        <td>{it.code}</td>
                        <td>{it.name}</td>
                        <td>{it.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeView}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
