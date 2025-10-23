
// //src/pages/master/sidebar/Stock/MasterAddUser.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
// import { useAuth } from "../../../context/AuthContext";
// import "../../../styles/Sidebar/adduser.css";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const USERS_API = `${API}/api/tenant/auth`;
// const SHOPS_API = `${API}/api/shops`;

// export default function AddUser() {
//   const { user } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [shops, setShops] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newUser, setNewUser] = useState({
//     username: "",
//     email: "",
//     password: "",
//     shopname: "",
//     role: "user",
//   });
//   const [shopSuggestions, setShopSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [busy, setBusy] = useState(false);

//   const token = localStorage.getItem("token");

//   // Fetch users
//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get(USERS_API, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(res.data || []);
//     } catch (err) {
//       console.error("fetchUsers error:", err);
//       setUsers([]);
//     }
//   };

//   // Fetch shops
//   const fetchShops = async () => {
//     try {
//       const res = await axios.get(SHOPS_API, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setShops(res.data || []);
//     } catch (err) {
//       console.error("fetchShops error:", err);
//       setShops([]);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//     fetchShops();
//   }, []);

//   const handleShopInputChange = (value) => {
//     setNewUser((prev) => ({ ...prev, shopname: value }));
//     if (!value) {
//       setShopSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }
//     const filtered = shops.filter((s) =>
//       s.shopname.toLowerCase().startsWith(value.toLowerCase())
//     );
//     setShopSuggestions(filtered);
//     setShowSuggestions(true);
//   };

//   const handleSelectShop = (shopname) => {
//     setNewUser((prev) => ({ ...prev, shopname }));
//     setShowSuggestions(false);
//   };

//   const handleAddUser = async () => {
//     setErrorMsg("");
//     if (!newUser.username.trim()) return setErrorMsg("Username required");
//     if (!newUser.email.trim()) return setErrorMsg("Email required");
//     if (!newUser.password.trim()) return setErrorMsg("Password required");
//     if (!newUser.shopname.trim()) return setErrorMsg("Select a shop");

//     const selectedShop = shops.find(
//       (s) => s.shopname.toLowerCase() === newUser.shopname.trim().toLowerCase()
//     );
//     if (!selectedShop) return setErrorMsg("Please select a valid shop");

//     setBusy(true);
//     try {
//       const res = await axios.post(
//         USERS_API,
//         {
//           username: newUser.username.trim(),
//           email: newUser.email.trim(),
//           password: newUser.password,
//           shopname: selectedShop.shopname,
//           role: "user",
//         },
//         { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 }
//       );

//       // Add new user immediately to table
//       setUsers((prev) => [...prev, res.data.user]);

//       // Reset form
//       setNewUser({ username: "", email: "", password: "", shopname: "", role: "user" });
//       setShowAddModal(false);
//     } catch (err) {
//       console.error("handleAddUser error:", err);
//       const msg = err.response?.data?.message || err.message || "Failed to create user";
//       setErrorMsg(msg);
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="users-page">
//       <div className="users-header">
//         <h2>Users Details</h2>
//         {user && (user.role === "megaadmin" || user.role === "manager") && (
//           <button className="btn-add" onClick={() => setShowAddModal(true)}>
//             <FaPlus /> Add User
//           </button>
//         )}
//       </div>

//       <table className="users-table">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Username</th>
//             <th>Email</th>
//             <th>Shop Name</th>
//             <th>Role</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.length > 0 ? (
//             users.map((u, idx) => (
//               <tr key={u._id || idx}>
//                 <td>{idx + 1}</td>
//                 <td>{u.username}</td>
//                 <td>{u.email}</td>
//                 <td>{u.shopname}</td>
//                 <td>{u.role}</td>
//                 <td>{u.status}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="6" className="text-center text-gray-500">
//                 No users found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {showAddModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Add User</h3>
//             {errorMsg && <div className="error-msg">{errorMsg}</div>}
//             {busy && <div className="info-msg">Creating user...</div>}
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleAddUser();
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={newUser.username}
//                 onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
//                 required
//               />
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={newUser.email}
//                 onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={newUser.password}
//                 onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                 required
//               />
//               <div className="shop-suggestion-box">
//                 <input
//                   type="text"
//                   placeholder="Shop Name"
//                   value={newUser.shopname}
//                   onChange={(e) => handleShopInputChange(e.target.value)}
//                   onFocus={() => {
//                     setShopSuggestions(shops);
//                     setShowSuggestions(true);
//                   }}
//                   autoComplete="off"
//                   required
//                 />
//                 {showSuggestions && shopSuggestions.length > 0 && (
//                   <ul className="suggestion-list">
//                     {shopSuggestions.map((s) => (
//                       <li
//                         key={s._id || s.shopname}
//                         onMouseDown={(ev) => {
//                           ev.preventDefault();
//                           handleSelectShop(s.shopname);
//                         }}
//                       >
//                         {s.shopname}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               <select value="user" disabled>
//                 <option value="user">User</option>
//               </select>

//               <div className="modal-actions">
//                 <button type="submit" className="btn-add" disabled={busy}>
//                   {busy ? "Adding..." : "Add"}
//                 </button>
//                 <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// src/pages/master/sidebar/Stock/MasterAddCustomer.jsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaTimes, FaUserSlash, FaUserCheck } from "react-icons/fa";
import "../../../styles/addCustomer.css";
import { useAuth } from "../../../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------------- Safe Fetch Helper ---------------- */
async function safeFetch(url, options = {}, fallback = []) {
  try {
    const res = await axios(url, options);
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data) return res.data.data;
    return res.data ?? fallback;
  } catch (err) {
    console.error("safeFetch failed:", err);
    return fallback;
  }
}

export default function AddCustomer() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState({ name: "", mobile: "", address: "" });

  const { user } = useAuth(); // contains { role, shopname, shopId, ... }
  const token = localStorage.getItem("token");

  /* ---------------- Helpers ---------------- */
  const pushToast = (msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };

  const getId = (c) => c?._id ?? c?.id;

  const serverUsesIsActive = useMemo(
    () => customers.some((c) => Object.prototype.hasOwnProperty.call(c, "isActive")),
    [customers]
  );
  const serverUsesStatus = useMemo(
    () => customers.some((c) => Object.prototype.hasOwnProperty.call(c, "status")),
    [customers]
  );
  const isActive = (c) => {
    if ("isActive" in c) return !!c.isActive;
    const s = (c.status ?? "active").toString().toLowerCase();
    return s !== "inactive";
  };
  const labelFromActive = (active) => (active ? "active" : "inactive");

  const payloadForActive = (cust, nextActive) => {
    if (serverUsesIsActive) return { isActive: nextActive };
    if (serverUsesStatus) return { status: nextActive ? "active" : "inactive" };
    return { status: nextActive ? "active" : "inactive" };
  };

  const pickUpdatedFromResponse = (resData) =>
    resData?.data ?? resData?.customer ?? resData;

  /* ---------------- URL Builder ---------------- */
  const buildUrl = (path = "") => {
    const shopId = user?.shopId || localStorage.getItem("shopId");
    if (!shopId) throw new Error("Missing shopId");
    return `${API}/api/tenant/shops/${shopId}/customers${path}`;
  };

  const buildHeaders = () => ({ Authorization: `Bearer ${token}` });

  /* ---------------- Load Customers ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const url = buildUrl();
        const headers = buildHeaders();
        const list = await safeFetch(url, { headers }, []);
        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers:", err);
      }
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) => {
      const name = (c.name ?? "").toString().toLowerCase();
      const mobile = (c.mobile ?? "").toString().toLowerCase();
      return name.includes(s) || mobile.includes(s);
    });
  }, [search, customers]);

  /* ---------------- Create Customer ---------------- */
  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const url = buildUrl();
      const headers = buildHeaders();
      const res = await axios.post(url, form, { headers });
      const created = pickUpdatedFromResponse(res.data);

      const withUiStatus = {
        ...created,
        ...(Object.prototype.hasOwnProperty.call(created, "isActive")
          ? {}
          : Object.prototype.hasOwnProperty.call(created, "status")
          ? {}
          : { status: "active" }),
      };

      setCustomers((prev) => [withUiStatus, ...prev]);
      pushToast(`Customer ${created?.name ?? ""} added`);
      setShowAddModal(false);
      setForm({ name: "", mobile: "", address: "" });
    } catch (err) {
      console.error("POST create failed:", err);
      pushToast("Failed to add customer");
    }
  };

  /* ---------------- Toggle Status ---------------- */
  const toggleStatus = async (cust) => {
    const id = getId(cust);
    if (!id) return pushToast("Cannot update: missing id");

    const wasActive = isActive(cust);
    const nextActive = !wasActive;
    const optimistic = payloadForActive(cust, nextActive);

    // optimistic UI
    setCustomers((prev) =>
      prev.map((c) =>
        getId(c) === id
          ? {
              ...c,
              ...optimistic,
              isActive: "isActive" in c ? nextActive : c.isActive,
              status:
                "status" in c
                  ? labelFromActive(nextActive)
                  : c.status ?? labelFromActive(nextActive),
            }
          : c
      )
    );

    try {
      const url = buildUrl(`/${id}/status`);
      const headers = buildHeaders();
      const res = await axios.patch(url, optimistic, { headers });

      const updated = pickUpdatedFromResponse(res.data);
      if (updated) {
        setCustomers((prev) =>
          prev.map((c) => (getId(c) === id ? { ...c, ...updated } : c))
        );
      }
      pushToast(`Customer ${cust.name} is now ${labelFromActive(nextActive)}`);
    } catch (err) {
      console.error("Update status failed:", err);
      // revert
      setCustomers((prev) =>
        prev.map((c) =>
          getId(c) === id
            ? {
                ...c,
                ...payloadForActive(c, wasActive),
                isActive: "isActive" in c ? wasActive : c.isActive,
                status:
                  "status" in c
                    ? labelFromActive(wasActive)
                    : c.status ?? labelFromActive(wasActive),
              }
            : c
        )
      );
      pushToast("Failed to update status");
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="customers-page">
      {/* Toasts */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      {/* Header */}
      <div className="customers-header">
        <h1 className="title">Add Customer</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Customer
        </button>
      </div>

      {/* Toolbar */}
      <div className="customers-toolbar">
        <input
          className="input"
          placeholder="Search by name or mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card table-card overflow-x-auto shadow-lg rounded-lg bg-white p-4">
        <div className="table-responsive w-full">
          <table className="table-auto w-full min-w-[600px] border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">S.No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Mobile</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-gray-400 text-center py-4">
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const active = isActive(c);
                  return (
                    <tr key={getId(c)} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{c.name}</td>
                      <td className="px-4 py-2">{c.mobile}</td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          active ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {labelFromActive(active)}
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          className="icon-btn view p-2"
                          onClick={() => setShowViewModal(c)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className={`icon-btn p-2 ${
                            active
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                          onClick={() => toggleStatus(c)}
                        >
                          {active ? <FaUserSlash /> : <FaUserCheck />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && (
        <Modal title="Customer Details" onClose={() => setShowViewModal(null)}>
          <Detail label="Name" value={showViewModal.name} />
          <Detail label="Mobile" value={showViewModal.mobile} />
          <Detail label="Address" value={showViewModal.address} />
          <Detail label="Status" value={labelFromActive(isActive(showViewModal))} />
          <div className="modal-actions">
            <button className="btn btn-muted" onClick={() => setShowViewModal(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Customer" onClose={() => setShowAddModal(false)}>
          <form onSubmit={onCreate} className="customer-form">
            <div className="form-row">
              <label>Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Mobile</label>
              <input className="input" value={form.mobile} onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Address</label>
              <textarea className="input textarea" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-muted" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Customer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Small Components ---------------- */
function Detail({ label, value }) {
  return (
    <div className="detail">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{String(value ?? "-")}</span>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
