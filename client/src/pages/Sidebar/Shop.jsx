



// // src/pages/Sidebar/Shop.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaPlus, FaEye, FaSyncAlt, FaTimes } from "react-icons/fa";
// import "../../styles/Sidebar/Shop.css";
// import Pagination from "../../components/Pagination";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function ShopPage() {
//   const token = localStorage.getItem("token");
//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [toasts, setToasts] = useState([]);

//   // Modals
//   const [showAdd, setShowAdd] = useState(false);
//   const [showView, setShowView] = useState(false);
//   const [viewShop, setViewShop] = useState(null);
//   const [statusModalOpen, setStatusModalOpen] = useState(false);
//   const [statusTarget, setStatusTarget] = useState(null);

//   // Filters & Pagination
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [filteredShops, setFilteredShops] = useState(shops);
//   const { setSelectedShop } = useShop();


//   // Form
//   const [form, setForm] = useState({
//     shopname: "",
//     designation: "",
//     address: "",
//     contact: "",
//   });


//    const [error, setError] = useState("");
//   // Fetch shops
//   const fetchShops = async (p = 1) => {
//     setLoading(true);
//     try {
//       const params = { page: p, limit: 10, search, status };
//       const res = await axios.get(`${API}/api/shops`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//         params,
//       });

//       const data = res.data;

//       if (Array.isArray(data)) {
//         setShops(data);
//         setPage(p);
//         setTotalPages(1); // Change if your API returns totalPages
//       } else {
//         setShops(data.shops || []);
//         setPage(data.page || 1);
//         setTotalPages(data.totalPages || 1);
//       }
//     } catch (err) {
//       console.error("fetchShops:", err);
//       pushToast("Failed to fetch shops");
//       setShops([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShops(1);
//   }, []);



  
//   // Search & Reset
//   const handleSearch = () => fetchShops(1);
//   const handleReset = () => {
//     setSearch("");
//     setStatus("");
//     fetchShops(1);
//   };

//   // Toasts
//   const pushToast = (msg) => {
//     const id = Date.now() + Math.random();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
//   };

//   // Create shop
//   const handleCreateShop = async (e) => {
//     e?.preventDefault();

//     const payload = {
//       shopname: form.shopname.trim(),
//       designation: form.designation.trim(),
//       address: form.address.trim(),
//       contact: form.contact.trim(),
//     };

//     if (!payload.shopname) {
//       pushToast("⚠️ Shop name is required");
//       return;
//     }

//     try {
//       const res = await axios.post(`${API}/api/shops`, payload, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });

//       const newShop = res.data?.shop;
//       if (!newShop) {
//         pushToast("⚠️ Server did not return shop data");
//         return;
//       }

//       setShops((prev) => {
//         const exists = prev.some((s) => s._id === newShop._id);
//         return exists ? prev : [newShop, ...prev];
//       });

//       pushToast("✅ Shop created successfully");
//       setShowAdd(false);
//       setForm({ shopname: "", designation: "", address: "", contact: "" });
//     } catch (err) {
//       console.error("❌ Create shop error:", err);
//       pushToast(err?.response?.data?.message || "Failed to create shop");
//     }
//   };

//   const openView = (shop) => {
//     setViewShop(shop);
//     setShowView(true);
//   };

//   const openStatusModal = (shop) => {
//     setStatusTarget(shop);
//     setStatusModalOpen(true);
//   };

//   const closeStatusModal = () => {
//     setStatusTarget(null);
//     setStatusModalOpen(false);
//   };

//   const updateStatus = async (shopId, newStatus) => {
//     try {
//       setShops((prev) =>
//         prev.map((s) =>
//           s._id === shopId ? { ...s, status: newStatus, updating: true } : s
//         )
//       );
//       await axios.put(
//         `${API}/api/shops/${shopId}`,
//         { status: newStatus },
//         { headers: token ? { Authorization: `Bearer ${token}` } : {} }
//       );
//       pushToast("Status updated");
//       setShops((prev) =>
//         prev.map((s) =>
//           s._id === shopId ? { ...s, status: newStatus, updating: false } : s
//         )
//       );
//     } catch (err) {
//       console.error("update status:", err);
//       pushToast("Failed to update status");
//       await fetchShops();
//     }
//   };


//     const handleChange = (e) => {
//     let value = e.target.value.replace(/\D/g, ""); // only digits

//     // Limit to 11 digits max (to catch landline with 0)
//     if (value.length > 11) value = value.slice(0, 11);

//     // Validation logic
//     if (value.startsWith("0")) {
//       setError("Kindly enter the contact number without zero or code.");
//     } else if (value.length > 10) {
//       setError("Contact number should be 10 digits only.");
//     } else {
//       setError("");
//     }

//     setForm({ ...form, contact: value });
//   };


//   return (
//     <div className="shop-page px-2 sm:px-4 md:px-6 lg:px-8 py-4">
//       {/* Toasts */}
//       <div className="toasts fixed top-4 right-4 z-50 flex flex-col gap-2">
//         {toasts.map((t) => (
//           <div
//             key={t.id}
//             className="toast bg-gray-800 text-white p-3 rounded shadow-md"
//           >
//             {t.msg}
//           </div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="shops-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
//         <h2 className="text-2xl font-semibold">Shops</h2>
//         <div>
//           <button
//             className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded shadow hover:bg-blue-600 transition"
//             onClick={() => setShowAdd(true)}
//           >
//             <FaPlus /> Add Shop
//           </button>
//         </div>
//       </div>

//       {/* Search + Status Filter */}
//       {/* <div className="flex  items-center gap-2 mb-4">
//         <input
//           type="text"
//           placeholder="Shop Name or Designation"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="!w-[260px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//         />
//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           className="!w-[170px] !md:w-[250px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//         >
//           <option value="">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//         <button
//           className="btn btn-primary px-4 py-1 rounded hover:bg-blue-600"
//           onClick={handleSearch}
//         >
//           Search
//         </button>
//         <button
//           className="btn btn-muted px-4 py-1 rounded hover:bg-gray-300"
//           onClick={handleReset}
//         >
//           Reset
//         </button>
//       </div> */}
    
// <div className="flex items-center gap-2 mb-4">
//   {/* Live Search */}
//   <input
//     type="text"
//     placeholder="Shop Name or Designation"
//     value={search}
//     onChange={(e) => setSearch(e.target.value)}
//     className="!w-[220px] !md:w-[250px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//   />


//   {/* Status Filter */}
// <select
//   value={status}
//   onChange={(e) => setStatus(e.target.value)}
//   className="!w-[100px] !md:w-[250px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1
//              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
//              transition duration-200 placeholder-gray-400"
// >
//   <option value="" style={{ color: "black"}}>All Status</option>
//   <option value="active" style={{ color: "green" }}>Active</option>
//   <option value="inactive" style={{ color: "red" }}>Inactive</option>
// </select>


// </div>

//       {/* Table */}
//       {/* Table */}
// <div className="card table-card bg-white rounded shadow p-2 overflow-x-auto">
//   <table className="min-w-full border-collapse text-left">
//     <thead className="bg-gray-100">
//       <tr>
//         <th className="p-2 border-b">S.No</th>
//         <th className="p-2 border-b">Shop</th>
//         <th className="p-2 border-b">Designation</th>
//         <th className="p-2 border-b">Status</th>
//         <th className="p-2 border-b text-center">Action</th>
//       </tr>
//     </thead>
//     <tbody>
//       {!loading && shops.length === 0 && (
//         <tr>
//           <td colSpan="5" className="p-4 text-center text-gray-500">
//             No shops found
//           </td>
//         </tr>
//       )}
// {/* 
//       {shops
//         .filter(
//           (s) =>
//             s.shopname.toLowerCase().includes(search.toLowerCase()) ||
//             (s.designation || "")
//               .toLowerCase()
//               .includes(search.toLowerCase())
//         )
//         .filter((s) => (status ? s.status === status : true))
//         .map((s, idx) => (
//           <tr key={s._id || idx} className="hover:bg-gray-50 transition">
//             <td className="p-2 border-b">{(page - 1) * 10 + idx + 1}</td>
//             <td className="p-2 border-b">{s.shopname}</td>
//             <td className="p-2 border-b">{s.designation || "-"}</td>
//             <td className="p-2 border-b">
//               <button
//                 className="flex items-center gap-2 cursor-pointer"
//                 onClick={() => openStatusModal(s)}
//               >
//                 <span
//                   className="status-dot w-3 h-3 rounded-full inline-block"
//                   style={{
//                     backgroundColor:
//                       s.status === "active" ? "#00A76f" : "#E53935",
//                   }}
//                 />
//                 <span className="status-text">{s.status}</span>
//               </button>
//             </td>
//             <td className="p-2 border-b text-center flex justify-center gap-2">
//               <button
//                 className="icon-btn"
//                 onClick={() => openView(s)}
//                 title="View"
//               >
//                 <FaEye color="#00A76f" />
//               </button>
//               <button
//                 className="icon-btn"
//                 onClick={() => openStatusModal(s)}
//                 title="Update Status"
//               >
//                 <FaSyncAlt color="#007867" />
//               </button>
//             </td>
//           </tr>
//         ))} */}
//         {shops
//   .filter((s) => {
//     const query = search.toLowerCase(); // convert input to lowercase
//     return (
//       s.shopname.toLowerCase().includes(query) || // shop name match
//       (s.designation || "").toLowerCase().includes(query) // designation match
//     );
//   })
//   .filter((s) => (status ? s.status === status : true))
//   .map((s, idx) => (
//     <tr key={s._id || idx} className="hover:bg-gray-50 transition">
//       <td className="p-2 border-b">{(page - 1) * 10 + idx + 1}</td>
//       <td className="p-2 border-b">{s.shopname}</td>
//       <td className="p-2 border-b">{s.designation || "-"}</td>
//       <td className="p-2 border-b">
//         <button
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => openStatusModal(s)}
//         >
//           <span
//             className="status-dot w-3 h-3 rounded-full inline-block"
//             style={{
//               backgroundColor: s.status === "active" ? "#00A76f" : "#E53935",
//             }}
//           />
//           <span className="status-text">{s.status}</span>
//         </button>
//       </td>
//       <td className="p-2 border-b text-center flex justify-center gap-2">
//         <button
//           className="icon-btn"
//           onClick={() => openView(s)}
//           title="View"
//         >
//           <FaEye color="#00A76f" />
//         </button>
//         <button
//           className="icon-btn"
//           onClick={() => openStatusModal(s)}
//           title="Update Status"
//         >
//           <FaSyncAlt color="#007867" />
//         </button>
//       </td>
//     </tr>
//   ))}


//       {loading && (
//         <tr>
//           <td colSpan="5" className="p-4 text-center text-gray-500">
//             Loading...
//           </td>
//         </tr>
//       )}
//     </tbody>
//   </table>

//   {/* Pagination */}
//   <div className="mt-3">
//     <Pagination
//       page={page}
//       totalPages={totalPages}
//       onPageChange={(p) => fetchShops(p)}
//     />
//   </div>
// </div>


//       {/* Add / View / Status Modals */}
//       {showAdd && (
//         <Modal onClose={() => setShowAdd(false)} title="Create Shop">
//           <form className="shop-form flex flex-col gap-4" onSubmit={handleCreateShop}>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Shop Name</label>
//               <input
//                 value={form.shopname}
//                 onChange={(e) => setForm({ ...form, shopname: e.target.value })}
//                 required
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Designation</label>
//               <input
//                 value={form.designation}
//                 onChange={(e) => setForm({ ...form, designation: e.target.value })}
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             {/* <div className="form-row flex flex-col">
//               <label className="font-medium">Contact</label>
//               <input
//                 value={form.contact}
//                 onChange={(e) => {
//                   let value = e.target.value.replace(/\D/g, "");
//                   if (value.length > 10) value = value.slice(0, 10);
//                   setForm({ ...form, contact: value });
//                 }}
//                 required
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div> */}

//        <div className="form-row flex flex-col mb-4">
//       <label className="font-medium mb-1">Contact</label>

//       <input
//         type="text"
//         value={form.contact}
//         onChange={handleChange}
//         required
//         maxLength={11}
//         className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 ${
//           error ? "border-red-500 focus:ring-red-400" : "focus:ring-green-400"
//         }`}
      
//       />

//       {/* Error message below input */}
//       {error && (
//         <p className="text-red-600 text-sm mt-1">{error}</p>
//       )}
//     </div>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Address</label>
//               <textarea
//                 value={form.address}
//                 onChange={(e) => setForm({ ...form, address: e.target.value })}
//                 rows={4}
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="modal-actions flex justify-end gap-2 mt-2 flex-wrap">
//               <button
//                 type="submit"
//                 className="btn btn-primary px-4 py-2 rounded hover:bg-blue-600"
//               >
//                 Add Shop
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowAdd(false)}
//                 className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {showView && viewShop && (
//         <Modal onClose={() => setShowView(false)} title={`${viewShop.shopname}`}>
//           <div className="shop-view flex flex-col gap-2">
//             <p><strong>Shop Name:</strong> {viewShop.shopname}</p>
//             <p><strong>Designation:</strong> {viewShop.designation || "-"}</p>
//             <p><strong>Contact:</strong> {viewShop.contact || "-"}</p>
//             <p><strong>Address:</strong> {viewShop.address || "-"}</p>
//             <p>
//               <strong>Status:</strong>{" "}
//               <span
//                 className="status-dot w-3 h-3 rounded-full inline-block ml-1"
//                 style={{
//                   backgroundColor: viewShop.status === "active" ? "#00A76f" : "#E53935",
//                 }}
//               />{" "}
//               {viewShop.status}
//             </p>
//             <div className="modal-actions flex justify-end mt-2 flex-wrap gap-2">
//               <button
//                 className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => setShowView(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {statusModalOpen && statusTarget && (
//         <Modal onClose={closeStatusModal} title="Update Shop Status">
//           <div className="flex flex-col gap-3 p-2">
//             <p>Change status for <b>{statusTarget.shopname}</b></p>
//             <p>
//               Current:{" "}
//               <span
//                 className="status-dot w-3 h-3 rounded-full inline-block ml-1"
//                 style={{
//                   backgroundColor: statusTarget.status === "active" ? "#00A76f" : "#E53935",
//                 }}
//               />{" "}
//               {statusTarget.status}
//             </p>
//             <div className="flex flex-wrap gap-2 mt-2">
//               <button
//                 className="btn btn-primary px-4 py-2 rounded hover:bg-blue-600"
//                 onClick={() => { updateStatus(statusTarget._id, "active"); closeStatusModal(); }}
//               >
//                 active
//               </button>
//               <button
//                 className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => { updateStatus(statusTarget._id, "inactive"); closeStatusModal(); }}
//               >
//                 inactive
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* Modal component */
// function Modal({ title, children, onClose }) {
//   return (
//     <div
//       className="modal-overlay fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2 z-50"
//       onMouseDown={onClose}
//     >
//       <div
//         className="modal-card bg-white rounded-lg shadow-lg max-w-full w-full sm:w-11/12 md:w-3/4 lg:w-1/2 overflow-auto max-h-full p-4 relative"
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <div className="modal-header flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <button className="icon-close" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }




// src/pages/Sidebar/Shop.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaSyncAlt, FaTimes } from "react-icons/fa";
import "../../styles/Sidebar/Shop.css";
import Pagination from "../../components/Pagination";
import { useShop } from "../../context/ShopContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ShopPage() {
  const token = localStorage.getItem("token");
  const { setSelectedShop } = useShop(); // added context usage

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewShop, setViewShop] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [designation, setDesignation] = useState("")

  const [filteredShops, setFilteredShops] = useState(shops);

  // Form
  const [form, setForm] = useState({
    shopname: "",
    designation: "",
    address: "",
    contact: "",
  });

  const [error, setError] = useState("");

  // Fetch shops
  const fetchShops = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 6, search, status };
      const res = await axios.get(`${API}/api/shops`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params,
      });

      const data = res.data;

      if (Array.isArray(data)) {
        setShops(data);
        setPage(p);
        setTotalPages(1); // Change if your API returns totalPages
      } else {
        setShops(data.shops || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("fetchShops:", err);
      pushToast("Failed to fetch shops");
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchShops(1);
  // }, []);

  

// Inside your component
useEffect(() => {
  const debounce = setTimeout(() => {
    fetchShops(1); // always start from page 1 on new search
  }, 300); // 300ms debounce

  return () => clearTimeout(debounce);
}, [search, status, designation]); // triggers when search or status changes


  // Search & Reset
  const handleSearch = () => fetchShops(1);
  const handleReset = () => {
    setSearch("");
    setStatus("");
    fetchShops(1);
  };

  // Toasts
  const pushToast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // Create shop
  const handleCreateShop = async (e) => {
    e?.preventDefault();

    const payload = {
      shopname: form.shopname.trim(),
      designation: form.designation.trim(),
      address: form.address.trim(),
      contact: form.contact.trim(),
    };

    if (!payload.shopname) {
      pushToast("⚠️ Shop name is required");
      return;
    }

    try {
      const res = await axios.post(`${API}/api/shops`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const newShop = res.data?.shop;
      if (!newShop) {
        pushToast("⚠️ Server did not return shop data");
        return;
      }

      setShops((prev) => {
        const exists = prev.some((s) => s._id === newShop._id);
        return exists ? prev : [newShop, ...prev];
      });

      // Live update navbar via context
      setSelectedShop({
        _id: newShop._id,
        shopname: newShop.shopname,
        designation: newShop.designation || "",
      });

      pushToast("✅ Shop created successfully");
      setShowAdd(false);
      setForm({ shopname: "", designation: "", address: "", contact: "" });
    } catch (err) {
      console.error("❌ Create shop error:", err);
      pushToast(err?.response?.data?.message || "Failed to create shop");
    }
  };

  const openView = (shop) => {
    setViewShop(shop);
    setShowView(true);
  };

  const openStatusModal = (shop) => {
    setStatusTarget(shop);
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusTarget(null);
    setStatusModalOpen(false);
  };

  const updateStatus = async (shopId, newStatus) => {
    try {
      setShops((prev) =>
        prev.map((s) =>
          s._id === shopId ? { ...s, status: newStatus, updating: true } : s
        )
      );
      await axios.put(
        `${API}/api/shops/${shopId}`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      pushToast("Status updated");
      setShops((prev) =>
        prev.map((s) =>
          s._id === shopId ? { ...s, status: newStatus, updating: false } : s
        )
      );
    } catch (err) {
      console.error("update status:", err);
      pushToast("Failed to update status");
      await fetchShops();
    }
  };

  const handleChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // only digits
    if (value.length > 11) value = value.slice(0, 11);

    if (value.startsWith("0")) {
      setError("Kindly enter the contact number without zero or code.");
    } else if (value.length > 10) {
      setError("Contact number should be 10 digits only.");
    } else {
      setError("");
    }

    setForm({ ...form, contact: value });
  };

  // Handle selecting a shop from table
  const handleSelectShop = (shop) => {
    setSelectedShop({
      _id: shop._id,
      shopname: shop.shopname,
      designation: shop.designation || "",
    });
    pushToast(`Selected shop: ${shop.shopname}`);
  };

  return (
    <div className="shop-page px-2 sm:px-4 md:px-6 lg:px-8 p-7">
      {/* Toasts */}
      <div className="toasts fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast bg-gray-800 text-white p-3 rounded shadow-md"
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="shops-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Shops</h2>
        <div>
          <button
            className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded shadow hover:bg-blue-600 transition"
            onClick={() => setShowAdd(true)}
          >
            <FaPlus /> Add Shop
          </button>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Shop Name or Designation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!w-[220px] !md:w-[250px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="!w-[100px] !md:w-[250px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1
             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
             transition duration-200 placeholder-gray-400"
        >
          <option value="" style={{ color: "black" }}>All Status</option>
          <option value="active" style={{ color: "green" }}>Active</option>
          <option value="inactive" style={{ color: "red" }}>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card table-card bg-white rounded shadow p-2 overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b">S.No</th>
              <th className="p-2 border-b">Shop</th>
              <th className="p-2 border-b">Designation</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && shops.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No shops found
                </td>
              </tr>
            )}

            {shops
              .filter((s) => {
                const query = search.toLowerCase();
                return (
                  s.shopname.toLowerCase().includes(query) ||
                  (s.designation || "").toLowerCase().includes(query)
                );
              })
              .filter((s) => (status ? s.status === status : true))
              .map((s, idx) => (
                <tr key={s._id || idx} className="hover:bg-gray-50 transition">
                  <td className="p-2 border-b">{(page - 1) * 10 + idx + 1}</td>
                  <td className="p-2 border-b">
                    <button
                      className="text-left w-full"
                      onClick={() => handleSelectShop(s)} // select shop live
                    >
                      {s.shopname}
                    </button>
                  </td>
                  <td className="p-2 border-b">{s.designation || "-"}</td>
                  <td className="p-2 border-b">
                    <button
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => openStatusModal(s)}
                    >
                      <span
                        className="status-dot w-3 h-3 rounded-full inline-block"
                        style={{
                          backgroundColor: s.status === "active" ? "#00A76f" : "#E53935",
                        }}
                      />
                      <span className="status-text">{s.status}</span>
                    </button>
                  </td>
                  <td className="p-2 border-b text-center flex justify-center gap-2">
                    <button
                      className="icon-btn"
                      onClick={() => openView(s)}
                      title="View"
                    >
                      <FaEye color="#00A76f" />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => openStatusModal(s)}
                      title="Update Status"
                    >
                      <FaSyncAlt color="#007867" />
                    </button>
                  </td>
                </tr>
              ))}

            {loading && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchShops(p)}
          />
        </div>
      </div>

      {/* Add / View / Status Modals */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Create Shop">
          <form className="shop-form flex flex-col gap-4" onSubmit={handleCreateShop}>
            <div className="form-row flex flex-col">
              <label className="font-medium">Shop Name</label>
              <input
                value={form.shopname}
                onChange={(e) => setForm({ ...form, shopname: e.target.value })}
                required
                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="form-row flex flex-col">
              <label className="font-medium">Designation</label>
              <input
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="form-row flex flex-col mb-4">
              <label className="font-medium mb-1">Contact</label>
              <input
                type="text"
                value={form.contact}
                onChange={handleChange}
                required
                maxLength={11}
                className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 ${
                  error ? "border-red-500 focus:ring-red-400" : "focus:ring-green-400"
                }`}
              />
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>

            <div className="form-row flex flex-col">
              <label className="font-medium">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={4}
                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="modal-actions flex justify-end gap-2 mt-2 flex-wrap">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Shop
              </button>
              {/* <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button> */}
            </div>
          </form>
        </Modal>
      )}

      {showView && viewShop && (
        <Modal onClose={() => setShowView(false)} title={`${viewShop.shopname}`}>
          <div className="shop-view flex flex-col gap-2">
            <p><strong>Shop Name:</strong> {viewShop.shopname}</p>
            <p><strong>Designation:</strong> {viewShop.designation || "-"}</p>
            <p><strong>Contact:</strong> {viewShop.contact || "-"}</p>
            <p><strong>Address:</strong> {viewShop.address || "-"}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className="status-dot w-3 h-3 rounded-full inline-block ml-1"
                style={{
                  backgroundColor: viewShop.status === "active" ? "#00A76f" : "#E53935",
                }}
              />{" "}
              {viewShop.status}
            </p>
            <div className="modal-actions flex justify-end mt-2 flex-wrap gap-2">
              <button
                className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowView(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {statusModalOpen && statusTarget && (
        <Modal onClose={closeStatusModal} title="Update Shop Status">
          <div className="flex flex-col gap-3 p-2">
            <p>Change status for <b>{statusTarget.shopname}</b></p>
            <p>
              Current:{" "}
              <span
                className="status-dot w-3 h-3 rounded-full inline-block ml-1"
                style={{
                  backgroundColor: statusTarget.status === "active" ? "#00A76f" : "#E53935",
                }}
              />{" "}
              {statusTarget.status}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                className="btn btn-primary px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => { updateStatus(statusTarget._id, "active"); closeStatusModal(); }}
              >
                active
              </button>
              <button
                className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => { updateStatus(statusTarget._id, "inactive"); closeStatusModal(); }}
              >
                inactive
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* Modal component */
function Modal({ title, children, onClose }) {
  return (
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2 z-50"
      onMouseDown={onClose}
    >
      <div
        className="modal-card bg-white rounded-lg shadow-lg max-w-full w-full sm:w-11/12 md:w-3/4 lg:w-1/2 overflow-auto max-h-full p-4 relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="icon-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
