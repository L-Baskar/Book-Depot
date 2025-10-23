// //src/pages/master/sidebar/Stock/MasterShop.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaPlus, FaEye, FaSyncAlt, FaTimes } from "react-icons/fa";
// import "../../../styles/Sidebar/Shop.css";

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

//   // Form
//   const [form, setForm] = useState({
//     shopname: "",
//     designation: "",
//     address: "",
//     contact: "",
//   });

//   // fetch shops
//   const fetchShops = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API}/api/shops`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//       });
//       setShops(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("fetchShops:", err);
//       pushToast("Failed to fetch shops");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShops();
//   }, []);

//   const pushToast = (msg) => {
//     const id = Date.now() + Math.random();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
//   };

//   // Add shop
//   const handleCreateShop = async (e) => {
//     e?.preventDefault();
//     const payload = {
//       shopname: form.shopname.trim(),
//       designation: form.designation.trim(),
//       address: form.address.trim(),
//       contact: form.contact.trim(),
//     };
//     if (!payload.shopname) return pushToast("Shop name is required");
//     try {
//       const res = await axios.post(`${API}/api/shops`, payload, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });
//       pushToast("Shop created");
//       setShowAdd(false);
//       setForm({ shopname: "", designation: "", address: "", contact: "" });
//       setShops((s) => [res.data, ...s]);
//     } catch (err) {
//       console.error("create shop err:", err);
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

//       {/* <div className="card table-card overflow-x-auto rounded shadow bg-white">
//         <table className="table min-w-full border-collapse text-left">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border-b">S.No</th>
//               <th className="p-2 border-b">Shop</th>
//               <th className="p-2 border-b">Designation</th>
//               <th className="p-2 border-b">Status</th>
//               <th className="p-2 border-b text-center">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {!loading && shops.length === 0 && (
//               <tr>
//                 <td colSpan="5" className="p-4 text-center text-gray-500">
//                   No shops found
//                 </td>
//               </tr>
//             )}
//             {shops.map((s, idx) => (
//               <tr
//                 key={s._id || s.shopname}
//                 className="hover:bg-gray-50 transition"
//               >
//                 <td className="p-2 border-b">{idx + 1}</td>
//                 <td className="p-2 border-b">{s.shopname}</td>
//                 <td className="p-2 border-b">{s.designation || "-"}</td>
//                 <td className="p-2 border-b">
//                   <button
//                     className="flex items-center gap-2 cursor-pointer focus:outline-none"
//                     onClick={() => openStatusModal(s)}
//                   >
//                     <span
//                       className="status-dot w-3 h-3 rounded-full inline-block"
//                       style={{
//                         backgroundColor:
//                           s.status === "active" ? "#00A76f" : "#E53935",
//                       }}
//                     ></span>
//                     <span className="status-text">{s.status}</span>
//                   </button>
//                 </td>
//                 <td className="p-2 border-b text-center flex justify-center gap-2">
//                   <button
//                     className="icon-btn"
//                     onClick={() => openView(s)}
//                     title="View"
//                   >
//                     <FaEye color="#00A76f" />
//                   </button>
//                   <button
//                     className="icon-btn"
//                     onClick={() => openStatusModal(s)}
//                     title="Update Status"
//                   >
//                     <FaSyncAlt color="#007867" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {loading && (
//               <tr>
//                 <td colSpan="5" className="p-4 text-center text-gray-500">
//                   Loading...
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div> */}

//   <div className="card table-card bg-white rounded shadow p-2">
//   <div className="overflow-x-auto">
//     <table className="min-w-full border-collapse text-left">
//       <thead className="bg-gray-100">
//         <tr>
//           <th className="p-2 border-b">S.No</th>
//           <th className="p-2 border-b">Shop</th>
//           <th className="p-2 border-b">Designation</th>
//           <th className="p-2 border-b">Status</th>
//           <th className="p-2 border-b text-center">Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {!loading && shops.length === 0 && (
//           <tr>
//             <td colSpan="5" className="p-4 text-center text-gray-500">
//               No shops found
//             </td>
//           </tr>
//         )}
//         {shops.map((s, idx) => (
//           <tr
//             key={s._id || s.shopname}
//             className="hover:bg-gray-50 transition"
//           >
//             <td className="p-2 border-b">{idx + 1}</td>
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
//         ))}
//         {loading && (
//           <tr>
//             <td colSpan="5" className="p-4 text-center text-gray-500">
//               Loading...
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// </div>

//       {/* Add Shop Modal */}
//       {showAdd && (
//         <Modal onClose={() => setShowAdd(false)} title="Create Shop">
//           <form className="shop-form flex flex-col gap-4" onSubmit={handleCreateShop}>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Shop Name</label>
//               <input
//                 value={form.shopname}
//                 onChange={(e) =>
//                   setForm({ ...form, shopname: e.target.value })
//                 }
//                 required
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Designation</label>
//               <input
//                 value={form.designation}
//                 onChange={(e) =>
//                   setForm({ ...form, designation: e.target.value })
//                 }
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Contact</label>
//               <input
//                 value={form.contact}
//                 onChange={(e) =>
//                   setForm({ ...form, contact: e.target.value })
//                 }
//                 className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="form-row flex flex-col">
//               <label className="font-medium">Address</label>
//               <textarea
//                 value={form.address}
//                 onChange={(e) =>
//                   setForm({ ...form, address: e.target.value })
//                 }
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

//       {/* View Modal */}
//       {showView && viewShop && (
//         <Modal
//           onClose={() => setShowView(false)}
//           title={`Shop — ${viewShop.shopname}`}
//         >
//           <div className="shop-view flex flex-col gap-2">
//             <p>
//               <strong>Shop:</strong> {viewShop.shopname}
//             </p>
//             <p>
//               <strong>Designation:</strong> {viewShop.designation || "-"}
//             </p>
//             <p>
//               <strong>Contact:</strong> {viewShop.contact || "-"}
//             </p>
//             <p>
//               <strong>Address:</strong> {viewShop.address || "-"}
//             </p>
//             <p>
//               <strong>Status:</strong>{" "}
//               <span
//                 className="status-dot w-3 h-3 rounded-full inline-block ml-1"
//                 style={{
//                   backgroundColor:
//                     viewShop.status === "active" ? "#00A76f" : "#E53935",
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

//       {/* Status modal */}
//       {statusModalOpen && statusTarget && (
//         <Modal onClose={closeStatusModal} title="Update Shop Status">
//           <div className="flex flex-col gap-3 p-2">
//             <p>
//               Change status for <b>{statusTarget.shopname}</b>
//             </p>
//             <p>
//               Current:{" "}
//               <span
//                 className="status-dot w-3 h-3 rounded-full inline-block ml-1"
//                 style={{
//                   backgroundColor:
//                     statusTarget.status === "active" ? "#00A76f" : "#E53935",
//                 }}
//               />{" "}
//               {statusTarget.status}
//             </p>
//             <div className="flex flex-wrap gap-2 mt-2">
//               <button
//                 className="btn btn-primary px-4 py-2 rounded hover:bg-blue-600"
//                 onClick={() => {
//                   updateStatus(statusTarget._id, "active");
//                   closeStatusModal();
//                 }}
//               >
//                 active
//               </button>
//               <button
//                 className="btn btn-muted px-4 py-2 rounded hover:bg-gray-300"
//                 onClick={() => {
//                   updateStatus(statusTarget._id, "inactive");
//                   closeStatusModal();
//                 }}
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
