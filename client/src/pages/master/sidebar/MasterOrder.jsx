


// src/pages/master/sidebar/MasterOrders.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import "../../../styles/Sidebar/Orders.css";
import { useAuth } from "../../../context/AuthContext";
import { ShopContext } from "../../../context/ShopContext";
import Pagination from "../../../components/Pagination";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MasterOrders() {
  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);

  const shopId = selectedShop?._id;
  const shopName = selectedShop?.shopname;
  const token = localStorage.getItem("token");
  const role = user?.role;

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const pushToast = (msg) => {
    alert(msg); // simple alert for now, can replace with toast system
  };

  const buildHeaders = () => ({
    Authorization: token ? `Bearer ${token}` : "",
    "x-shop-id": shopId || "",
    "x-shop-name": shopName ? encodeURIComponent(shopName) : "",
  });

  const encodedShopname = shopName ? encodeURIComponent(shopName) : null;

  const ORDERS_API =
    role === "user"
      ? `${API_BASE}/api/orders`
      : encodedShopname
      ? `${API_BASE}/api/tenant/shops/${encodedShopname}/orders`
      : null;

  const fetchOrders = async (pageNumber = 1) => {
    if (!ORDERS_API) return;
    setLoading(true);

    try {
      const params = {
        page: pageNumber,
        limit,
        orderNo: searchOrderNo || undefined,
        status: searchStatus || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      };

      const { data } = await axios.get(ORDERS_API, { headers: buildHeaders(), params });

      setOrders(Array.isArray(data.orders) ? data.orders : data.orders || []);
      setPage(data.page || pageNumber);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("fetchOrders:", err);
      setOrders([]);
      setTotalPages(1);
      pushToast(err?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchOrders(1);
  }, [shopId, ORDERS_API]);

  const orderTotalQty = (order) => (order.items || []).reduce((s, it) => s + Number(it.qty || 0), 0);

  const statusColor = (status) => {
    switch ((status || "").toLowerCase()) {
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

  const openView = async (order) => {
    if (!ORDERS_API) return pushToast("No API available for this shop");
    try {
      const res = await axios.get(`${ORDERS_API}/${order._id}`, { headers: buildHeaders() });
      const fullOrder = res.data.order || res.data;
      if (!fullOrder.items) fullOrder.items = [];
      setSelectedOrder(fullOrder);
      setViewOpen(true);
    } catch (err) {
      console.error("openView:", err);
      pushToast("Failed to load order details");
    }
  };
  const closeView = () => {
    setSelectedOrder(null);
    setViewOpen(false);
  };

  return (
    <div className="order-page p-6">


    
         
      
            {/* Header */}
            <div className="orders-header">
              <h2>Orders</h2>
        
            </div>
      
      {/* Filters */}
      <div className="flex items-center gap-2 p-4">
        <input
          type="text"
          placeholder="Order No"
          value={searchOrderNo}
          onChange={(e) => {
            setSearchOrderNo(e.target.value);
            fetchOrders(1);
          }}
          className="w-[150px] h-8 text-sm border rounded-md px-2"
        />
        <select
          value={searchStatus}
          onChange={(e) => {
            setSearchStatus(e.target.value);
            fetchOrders(1);
          }}
          className="w-[120px] h-8 text-sm border rounded-md px-2"
        >
          <option value="">All</option>
          <option value="placed">Placed</option>
          <option value="received">Received</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => {
            setDateRange((prev) => ({ ...prev, start: e.target.value }));
            fetchOrders(1);
          }}
          className="w-[120px] h-8 text-sm border rounded-md px-2"
        />
        <span className="text-sm">to</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => {
            setDateRange((prev) => ({ ...prev, end: e.target.value }));
            fetchOrders(1);
          }}
          className="w-[120px] h-8 text-sm border rounded-md px-2"
        />
      </div>

      {/* Orders Table */}
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
                    <td>{firstName}{o.items?.length > 1 ? ` (+${o.items.length - 1})` : ""}</td>
                    <td>{orderTotalQty(o)}</td>
                    <td style={{ color: statusColor(o.status) }}>{formatStatusText(o.status)}</td>
                    <td className="flex justify-center gap-2">
                      <button onClick={() => openView(o)} title="View"><FaEye color="#00A76f" /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={fetchOrders} />
      </div>

      {/* View Modal */}
      {viewOpen && selectedOrder && (
        <div className="modal wide">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details ({selectedOrder.orderNo})</h3>
              <button className="close" onClick={closeView}>✕</button>
            </div>
            <div className="modal-body overflow-x-auto">
              <table className="min-w-full border-collapse table-auto text-left">
                <thead>
                  <tr><th>Code</th><th>Name</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {selectedOrder.items.length ? selectedOrder.items.map((it,i) => (
                    <tr key={i}><td>{it.code}</td><td>{it.name}</td><td>{it.qty}</td></tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center">No items found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// // src/pages/master/sidebar/MasterOrders.jsx
// import { useEffect, useRef, useState, useContext, useMemo } from "react";
// import axios from "axios";
// import {
//   FaPlus,
//   FaEye,
//   FaEdit,
//   FaCheck,
//   FaTimes,
//   FaTrash,
// } from "react-icons/fa";
// import "../../../styles/Sidebar/Orders.css";
// import { useAuth } from "../../../context/AuthContext";
// import { ShopContext } from "../../../context/ShopContext";
// import Pagination from "../../../components/Pagination";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function MasterOrders() {
//   const { user } = useAuth(); // master user
//   const { selectedShop } = useContext(ShopContext);
//   const shopId = selectedShop?._id;
//   const shopName = selectedShop?.shopname;

//   const token = localStorage.getItem("token");
//   const role = user?.role;

//   const [orders, setOrders] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [toasts, setToasts] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [viewOpen, setViewOpen] = useState(false);
//   const [orderNo, setOrderNo] = useState("");
//   const [orderDate, setOrderDate] = useState("");
//   const [orderLines, setOrderLines] = useState([]);
//   const nextLineId = useRef(1);


  
// const [page, setPage] = useState(1);
// const [limit] = useState(10);
// const [totalPages, setTotalPages] = useState(1);
// const [loading, setLoading] = useState(true);

// const [searchOrderNo, setSearchOrderNo] = useState("");
// const [searchProduct, setSearchProduct] = useState("");
// const [searchStatus, setSearchStatus] = useState("");
// const [dateRange, setDateRange] = useState({ start: "", end: "" });

//   /* ---------- Toast helper ---------- */
//   const pushToast = (msg) => {
//     const id = Date.now() + Math.random();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
//   };

//   /* ---------- Headers for master access ---------- */
//   const buildHeaders = () => ({
//     Authorization: token ? `Bearer ${token}` : "",
//     "x-shop-id": shopId || "",
//     "x-shop-name": shopName ? encodeURIComponent(shopName) : "",
//   });

//   const encodedShopname = shopName ? encodeURIComponent(shopName) : null;

//   /* ---------- API URLs ---------- */
//   const ORDERS_API =
//     role === "user"
//       ? `${API_BASE}/api/orders`
//       : encodedShopname
//       ? `${API_BASE}/api/tenant/shops/${encodedShopname}/orders`
//       : null;

//   const PRODUCTS_API =
//     role === "user"
//       ? `${API_BASE}/api/products`
//       : encodedShopname
//       ? `${API_BASE}/api/tenant/shops/${encodedShopname}/products`
//       : null;

//   /* ---------- Fetch Orders/Products ---------- */
//   // const fetchOrders = async () => {
//   //   if (!ORDERS_API) return;
//   //   try {
//   //     const { data } = await axios.get(ORDERS_API, { headers: buildHeaders() });
//   //     setOrders(Array.isArray(data.orders) ? data.orders : data);
//   //   } catch (err) {
//   //     console.error("fetchOrders:", err);
//   //     pushToast(err?.response?.data?.message || "Failed to fetch orders");
//   //   }
//   // };

// const fetchOrders = async (pageNumber = 1) => {
//   if (!ORDERS_API) return;
//   setLoading(true);

//   try {
//     const params = {
//       page: pageNumber,
//       limit,
//       orderNo: searchOrderNo || undefined,
//       productName: searchProduct || undefined,
//       status: searchStatus || undefined,
//       startDate: dateRange.start || undefined,
//       endDate: dateRange.end || undefined,
//     };

//     const { data } = await axios.get(ORDERS_API, { headers: buildHeaders(), params });

//     setOrders(Array.isArray(data.orders) ? data.orders : data.orders || []);
//     setPage(data.page || pageNumber);
//     setTotalPages(data.totalPages || 1);
//   } catch (err) {
//     console.error("fetchOrders:", err);
//     setOrders([]);
//     setTotalPages(1);
//     pushToast(err?.response?.data?.message || "Failed to fetch orders");
//   } finally {
//     setLoading(false);
//   }
// };
// useEffect(() => {
//   fetchOrders(1);
// }, [ORDERS_API]); // refetch if API changes


//   const fetchProducts = async () => {
//     if (!PRODUCTS_API) return;
//     try {
//       const { data } = await axios.get(PRODUCTS_API, { headers: buildHeaders() });
//       setProducts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("fetchProducts:", err);
//       pushToast(err?.response?.data?.message || "Failed to fetch products");
//     }
//   };

//   useEffect(() => {
//     if (shopId) {
//       fetchOrders();
//       fetchProducts();
//       nextLineId.current = 1;
//     }
//   }, [shopId]);

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
//     uniqueProducts(products.filter((p) => (p.name || "").toLowerCase().includes(q.toLowerCase())));
//   const suggestionsByCode = (q = "") =>
//     uniqueProducts(products.filter((p) => (p.code || "").toLowerCase().includes(q.toLowerCase())));

//   /* ---------- Create/Edit ---------- */
//   // const openCreate = async () => {
//   //   if (!products.length) await fetchProducts();
//   //   setOrderNo("");
//   //   setOrderDate(todayFormatted());
//   //   nextLineId.current = 1;
//   //   setOrderLines([blankLine()]);
//   //   setShowCreateModal(true);
//   // };

//  const openCreate = async () => {
//   if (!products.length) await fetchProducts();

//   // Fetch next order number preview
//   try {
//     if (ORDERS_API) {
//       const { data } = await axios.get(`${ORDERS_API}/next-order-no/preview`, {
//         headers: buildHeaders(),
//       });
//       setOrderNo(data?.orderNo || "ORDER001");
//     } else {
//       setOrderNo("ORDER001");
//     }
//   } catch (err) {
//     console.error("Failed to fetch next order no preview:", err);
//     setOrderNo("ORDER001");
//   }

//   setOrderDate(todayFormatted());
//   nextLineId.current = 1;
//   setOrderLines([blankLine()]);
//   setShowCreateModal(true);
// };

//   const closeCreate = () => setShowCreateModal(false);

//   const openEdit = (order) => {
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
//     setShowCreateModal(true);
//   };

//   /* ---------- Row Editing ---------- */
//   const startEditRow = (id) =>
//     setOrderLines((prev) =>
//       prev.map((ln) => (ln.id === id ? { ...ln, isEditing: true, backup: { ...ln } } : ln))
//     );

//   const cancelEditRow = (id) =>
//     setOrderLines((prev) =>
//       prev.map((ln) => (ln.id === id ? { ...ln.backup, isEditing: false, backup: null } : ln))
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
//           if (!value) next.name = "";
//           const exact = products.find((p) => (p.code || "").toLowerCase() === value.toLowerCase());
//           if (exact) next.name = exact.name;
//         }
//         if (field === "name") {
//           if (!value) next.code = "";
//           const exact = products.find((p) => (p.name || "").toLowerCase() === value.toLowerCase());
//           if (exact) next.code = exact.code;
//         }
//         return next;
//       })
//     );
//   };

//   const showSuggestionsForLine = (id, val = "", by = "name") => {
//     const matches = by === "name" ? suggestionsByName(val) : suggestionsByCode(val);
//     setOrderLines((prev) =>
//       prev.map((ln) =>
//         ln.id === id
//           ? { ...ln, suggestions: matches.slice(0, 50), suggestionType: by }
//           : ln
//       )
//     );
//   };



//   const selectSuggestionForLine = (id, prod) => {
//   setOrderLines((prev) =>
//     prev.map((ln) =>
//       ln.id === id
//         ? {
//             ...ln,
//             code: prod.code,
//             name: prod.name,
//             qty: ln.qty || 1,         // autofill default quantity if needed
//             suggestions: [],
//             suggestionType: null,
//             isEditing: true,           // keep editing mode for user to adjust qty
//           }
//         : ln
//     )
//   );
// };


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

//   /* ---------- Confirm ---------- */
//   const confirmOrder = async () => {
//     if (!ORDERS_API) return pushToast("No API available for this shop");

//     const nonBlankLines = orderLines.filter((ln) => ln.code || ln.name || ln.qty);
//     if (!nonBlankLines.length) return pushToast("You cannot confirm an empty order");

//     const validated = nonBlankLines.map((ln) => ({ ...ln, error: validateLine(ln) }));
//     setOrderLines((prev) =>
//       prev.map((ln) => validated.find((v) => v.id === ln.id) || ln)
//     );
//     if (validated.some((ln) => ln.error)) return pushToast("Please fix required fields before confirming");

//     const payloadLines = validated.map((ln) => ({ code: ln.code.trim(), name: ln.name.trim(), qty: Number(ln.qty) }));

//     try {
//       const res = await axios.post(
//         ORDERS_API,
//         { items: payloadLines, date: orderDate, status: "placed" },
//         { headers: buildHeaders() }
//       );
//       pushToast(`Order placed successfully: ${res.data.order?.orderNo || ""}`);
//       await fetchOrders();
//       closeCreate();
//     } catch (err) {
//       console.error("confirmOrder:", err.response || err);
//       pushToast(err?.response?.data?.message || "Failed to place order");
//     }
//   };

//   /* ---------- Status update ---------- */
//   const statusSequence = ["placed", "received", "completed", "cancelled"];
//   const nextStatus = (current) => {
//     const idx = statusSequence.indexOf((current || "").toLowerCase());
//     return idx < statusSequence.length - 1 ? statusSequence[idx + 1] : statusSequence[idx];
//   };

//   const updateOrderStatus = async (orderId, currentStatus) => {
//     if (!ORDERS_API) return pushToast("No API available for this shop");
//     const target = nextStatus(currentStatus);
//     setOrders((prev) =>
//       prev.map((o) => (o._id === orderId ? { ...o, status: target, updating: true } : o))
//     );
//     try {
//       await axios.put(`${ORDERS_API}/${orderId}/status`, { status: target }, { headers: buildHeaders() });
//       pushToast(`Status updated to ${target}`);
//       setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, updating: false } : o)));
//     } catch (err) {
//       console.error("updateOrderStatus:", err);
//       pushToast("Failed to update status");
//       setOrders((prev) =>
//         prev.map((o) => (o._id === orderId ? { ...o, status: currentStatus, updating: false } : o))
//       );
//     }
//   };

//   /* ---------- View ---------- */
//   const openView = async (order) => {
//     if (!ORDERS_API) return pushToast("No API available for this shop");
//     try {
//       const res = await axios.get(`${ORDERS_API}/${order._id}`, { headers: buildHeaders() });
//       const fullOrder = res.data.order || res.data;
//       if (!fullOrder.items) fullOrder.items = [];
//       setSelectedOrder(fullOrder);
//       setViewOpen(true);
//     } catch (err) {
//       console.error("openView:", err);
//       pushToast("Failed to load order details");
//     }
//   };
//   const closeView = () => { setSelectedOrder(null); setViewOpen(false); };

//   const orderTotalQty = (order) => (order.items || []).reduce((s, it) => s + Number(it.qty || 0), 0);

//   const statusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "placed": return "#F59E0B";
//       case "received":
//       case "completed": return "#00A76f";
//       case "cancelled": return "#E53935";
//       default: return "#9CA3AF";
//     }
//   };

  

//   /* ---------- Render ---------- */
//   return (
//     <div className="order-page">
//       {/* Toasts */}
//       <div className="toasts">{toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}</div>

//       {/* Header */}
//       <div className="orders-header">
//         <h2>Orders</h2>
//         {/* <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Purchase Order</button> */}
//       </div>


// {/* <div className="flex  items-center gap-2 p-4">

//   <input
//     type="text"
//     placeholder="Order No / Product"
//     value={searchOrderNo}
//     onChange={(e) => setSearchOrderNo(e.target.value)}
//     className="w-[80px] md:w-[100px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//   />

 
//   <select
//     value={searchStatus}
//     onChange={(e) => setSearchStatus(e.target.value)}
//     className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//   >
//     <option value="">All</option>
//     <option value="placed">Placed</option>
//     <option value="received">Received</option>
//     <option value="completed">Completed</option>
//     <option value="cancelled">Cancelled</option>
//   </select>

 
//   <input
//     type="date"
//     value={dateRange.start}
//     onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
//     className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//   />
//   <span className="text-sm">to</span>
//   <input
//     type="date"
//     value={dateRange.end}
//     onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
//     className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//   />

 
//   <button
//     onClick={() => fetchOrders(1)}
//     className="h-8 text-sm bg-[#007867] text-white px-3 py-1 rounded-md hover:bg-[#005f50] shadow-sm hover:shadow-md transition-all duration-200"
//   >
//     Search
//   </button>

//   <button
//     onClick={() => {
//       setSearchOrderNo("");
//       setSearchProduct("");
//       setSearchStatus("");
//       setDateRange({ start: "", end: "" });
//       fetchOrders(1);
//     }}
//     className="h-8 text-sm bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
//   >
//     Reset
//   </button>
// </div> */}




// <div className="flex items-center gap-2 p-4">
//   {/* Order No / Product Name */}
//   <input
//     type="text"
//     placeholder="Order No / Product"
//     value={searchOrderNo}
//     onChange={(e) => {
//       setSearchOrderNo(e.target.value);
//       fetchOrders(1); // live search
//     }}
//     className="w-[80px] md:w-[150px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//   />

//   {/* Status Filter */}
//   <select
//     value={searchStatus}
//     onChange={(e) => {
//       setSearchStatus(e.target.value);
//       fetchOrders(1); // live filter
//     }}
//     className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//   >
//     <option value="">All</option>
//     <option value="placed">Placed</option>
//     <option value="received">Received</option>
//     <option value="completed">Completed</option>
//     <option value="cancelled">Cancelled</option>
//   </select>

//   {/* Date Range Filter */}
//   <input
//     type="date"
//     value={dateRange.start}
//     onChange={(e) => {
//       setDateRange(prev => ({ ...prev, start: e.target.value }));
//       fetchOrders(1); // live filter
//     }}
//     className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//   />
//   <span className="text-sm">to</span>
//   <input
//     type="date"
//     value={dateRange.end}
//     onChange={(e) => {
//       setDateRange(prev => ({ ...prev, end: e.target.value }));
//       fetchOrders(1); // live filter
//     }}
//     className="w-[110px] md:w-[120px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200"
//   />
// </div>

// {/* ---------- Orders Table ---------- */}
// <div className="overflow-x-auto">
//   <table className="min-w-full border-collapse table-auto text-left">
//     <thead className="bg-gray-100">
//       <tr>
//         <th>S.No</th>
//         <th>Order No</th>
//         <th>Date</th>
//         <th>Product Name</th>
//         <th>Qty</th>
//         <th>Status</th>
//         <th className="text-center">Action</th>
//       </tr>
//     </thead>
//     <tbody>
//       {loading ? (
//         <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
//       ) : orders.length === 0 ? (
//         <tr><td colSpan="7" className="text-center text-gray-500 p-4">No orders found</td></tr>
//       ) : (
//         orders.map((o, i) => {
//           const firstName = (o.items && o.items[0] && o.items[0].name) || "-";
//           return (
//             <tr key={o._id || o.orderNo || i} className="hover:bg-gray-50 transition">
//               <td>{(page - 1) * limit + i + 1}</td>
//               <td>{o.orderNo}</td>
//               <td>{o.date}</td>
//               <td>{firstName}{o.items && o.items.length > 1 ? ` (+${o.items.length - 1})` : ""}</td>
//               <td>{orderTotalQty(o)}</td>
//               <td>
//                 <button
//                   onClick={() => updateOrderStatus(o._id, o.status)}
//                   disabled={o.updating}
//                   style={{ cursor: o.updating ? "wait" : "pointer" }}
//                 >
//                   <span className="status-dot" style={{ backgroundColor: statusColor(o.status) }} />
//                   <span>{o.status}</span>
//                 </button>
//               </td>
//               <td className="flex justify-center gap-2">
//                 <button onClick={() => openView(o)} title="View"><FaEye title="View" color="#00A76f"/></button>
//                 {/* <button onClick={() => openEdit(o)} title="Edit"><FaEdit title="Edit" color="#F59E0B" /></button> */}
//               </td>
//             </tr>
//           );
//         })
//       )}
//     </tbody>
//   </table>
//   <Pagination page={page} totalPages={totalPages} onPageChange={fetchOrders} />
// </div>



    




//       {/* Orders Table */}
    

//       {/* <div className="overflow-x-auto">
//   <table className="min-w-full border-collapse table-auto text-left">
//     <thead className="bg-gray-100">
//       <tr>
//         <th>S.No</th>
//         <th>Order No</th>
//         <th>Date</th>
//         <th>Product Name</th>
//         <th>Qty</th>
//         <th>Status</th>
//         <th className="text-center">Action</th>
//       </tr>
//     </thead>
//     <tbody>
//       {loading ? (
//         <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>
//       ) : orders.length === 0 ? (
//         <tr><td colSpan="7" className="text-center text-gray-500 p-4">No orders found</td></tr>
//       ) : (
//         orders.map((o, i) => {
//           const firstName = (o.items && o.items[0] && o.items[0].name) || "-";
//           return (
//             <tr key={o._id || o.orderNo || i} className="hover:bg-gray-50 transition">
//               <td>{(page - 1) * limit + i + 1}</td>
//               <td>{o.orderNo}</td>
//               <td>{o.date}</td>
//               <td>{firstName}{o.items && o.items.length > 1 ? ` (+${o.items.length - 1})` : ""}</td>
//               <td>{orderTotalQty(o)}</td>
//               <td>
//                 <button
//                   onClick={() => updateOrderStatus(o._id, o.status)}
//                   disabled={o.updating}
//                   style={{ cursor: o.updating ? "wait" : "pointer" }}
//                 >
//                   <span className="status-dot" style={{ backgroundColor: statusColor(o.status) }} />
//                   <span>{o.status}</span>
//                 </button>
//               </td>
//               <td className="flex justify-center gap-2">
//                 <button onClick={() => openView(o)} title="View"><FaEye title="View" color="#00A76f"/></button>
//                 <button onClick={() => openEdit(o)} title="Edit"><FaEdit title="Edit" color="#F59E0B" /></button>
//               </td>
//             </tr>
//           );
//         })
//       )}
//     </tbody>
//   </table>
//   <Pagination page={page} totalPages={totalPages} onPageChange={fetchOrders} />

// </div> */}


//       {/* Create/Edit Modal */}
//       {/* {showCreateModal && (
//         <div className="modal wide">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>{orderNo ? `Edit Order (${orderNo})` : "New Order"}</h3>
//               <button className="close" onClick={closeCreate}><FaTimes title="Close" color="#E53935" /></button>
//             </div>
//             <div className="modal-body">
//               <div className="order-fields">
//                 <input type="text" placeholder="Order No" value={orderNo} readOnly />
//                 <input type="text" placeholder="Date" value={orderDate} onChange={(e)=>setOrderDate(e.target.value)} />
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
//   <input
//     value={ln.code}
//     onChange={(e) => updateLineField(ln.id, "code", e.target.value)}
//     onFocus={() => showSuggestionsForLine(ln.id, ln.code, "code")}
//   />
//   {ln.suggestions.length > 0 && ln.suggestionType === "code" && (
//     <ul className="suggestions">
//       {ln.suggestions.map((s) => (
//         <li key={s.code} onClick={() => selectSuggestionForLine(ln.id, s)}>
//           {s.code}
//         </li>
//       ))}
//     </ul>
//   )}
// </td>
// <td>
//   <input
//     value={ln.name}
//     onChange={(e) => updateLineField(ln.id, "name", e.target.value)}
//     onFocus={() => showSuggestionsForLine(ln.id, ln.name, "name")}
//   />
//   {ln.suggestions.length > 0 && ln.suggestionType === "name" && (
//     <ul className="suggestions">
//       {ln.suggestions.map((s) => (
//         <li key={s.code} onClick={() => selectSuggestionForLine(ln.id, s)}>
//           {s.name}
//         </li>
//       ))}
//     </ul>
//   )}
// </td>

//                             <td>
//                               <input value={ln.qty} onChange={(e)=>updateLineField(ln.id,"qty",e.target.value)} />
//                             </td>
//                             <td>
//                               <button onClick={()=>saveEditRow(ln.id)}><FaCheck title="Update Row" color="#00A76f" /></button>
//                               <button onClick={()=>cancelEditRow(ln.id)}><FaTimes title="Close" color="#E53935"/></button>
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td>{ln.code}</td>
//                             <td>{ln.name}</td>
//                             <td>{ln.qty}</td>
//                             <td>
//                               <button onClick={()=>startEditRow(ln.id)}><FaEdit title="Edit" color="#F59E0B" /></button>
//                               <button onClick={()=>addRowAfter(ln.id)}><FaPlus title="Add Row" color="#00A76f"/></button>
//                               {orderLines.length>1 && <button onClick={()=>removeRow(ln.id)}><FaTrash title="Delete" color="#E53935" /></button>}
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
//               <button className="btn btn-primary" onClick={confirmOrder}><FaCheck color="#00A76f"/> Confirm Order</button>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* View Modal */}
//       {viewOpen && selectedOrder && (
//         <div className="modal wide">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>Order Details ({selectedOrder.orderNo})</h3>
//               <button className="close" onClick={closeView}><FaTimes title="Close"/></button>
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
//                   {selectedOrder?.items?.length ? selectedOrder.items.map((it,i)=>(
//                     <tr key={i}><td>{it.code}</td><td>{it.name}</td><td>{it.qty}</td></tr>
//                   )) : <tr><td colSpan="3" className="text-center">No items found</td></tr>}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






// master orders.jsx file no need purchase order. no need edit order. and status no need dot only text color changed first letter capital letter
