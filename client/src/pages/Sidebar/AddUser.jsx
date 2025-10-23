





// search filter. no need search and reset button. only input box typing. show particular reslut. input box erase data all data show. status filter without search and reset button give only clearly sniped code.
// live search


// //21/10/2025
// // src/pages/Sidebar/AddUser.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaPlus, FaEdit, FaTimes, FaSave, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle  } from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext";
// import "../../styles/Sidebar/adduser.css";
// import Pagination from "../../components/Pagination";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const USERS_API = `${API}/api/users`;
// const SHOPS_API = `${API}/api/shops`;

// export default function AddUser() {
//   const { user } = useAuth();
//   const token = localStorage.getItem("token");

//   const [users, setUsers] = useState([]);
//   const [shops, setShops] = useState([]);

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newUser, setNewUser] = useState({ username: "",   mobileNumber: "", password: "", shopname: "", role: "user" });
//   const [errorMsg, setErrorMsg] = useState("");
//   const [busy, setBusy] = useState(false);

//   const [viewUser, setViewUser] = useState(null);
//   const [showViewModal, setShowViewModal] = useState(false);

//   const [editUser, setEditUser] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editError, setEditError] = useState("");
//   const [editBusy, setEditBusy] = useState(false);

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const limit = 10;
//     // const [newUser, setNewUser] = useState({ password: "" });
//   const [showPassword, setShowPassword] = useState(false);




//   /* ---------- Fetch Users ---------- */
//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({ page, limit, search, status });
//       const res = await axios.get(`${USERS_API}?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = Array.isArray(res.data) ? res.data : res.data.users || [];
//       setUsers(data);
//       setTotalPages(res.data.totalPages || 1);
//     } catch (err) {
//       console.error("fetchUsers error:", err);
//       setUsers([]);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [page, search, status]);

//   /* ---------- Fetch Shops ---------- */
//   const fetchShops = async () => {
//     try {
//       if (!token) return console.error("No token found. Cannot fetch shops.");
//       const res = await axios.get(SHOPS_API, {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 10000,
//       });
//       const data = Array.isArray(res.data) ? res.data : res.data.shops || [];
//       setShops(data);
//       if (!newUser.shopname && data.length) setNewUser((p) => ({ ...p, shopname: data[0].shopname }));
//     } catch (err) {
//       console.error("fetchShops error:", err.response?.data || err.message);
//       setShops([]);
//     }
//   };

//   useEffect(() => { fetchShops(); }, []);



// /* ---------- Add User ---------- */
// // const handleAddUser = async () => {
// //   setErrorMsg("");

// //   if (!newUser.username.trim()) return setErrorMsg("Username required");
// //   if (!newUser.password.trim()) return setErrorMsg("Password required");
// //   if (!newUser.shopname.trim()) return setErrorMsg("Select a shop");

// //   setBusy(true);
// //   try {
// //     const payload = {
// //       username: newUser.username.trim(),
// //       mobileNumber: newUser.mobileNumber || "",
// //       password: newUser.password,
// //       shopname: newUser.shopname,
// //       role: "user", // default role
// //     };

// //     const res = await axios.post(USERS_API, payload, {
// //       headers: { Authorization: `Bearer ${token}` },
// //       timeout: 60000,
// //     });

// //     const created = res.data?.user || res.data;
// //     if (created) {
// //       setUsers((prev) => [...prev, created]);
// //     } else {
// //       await fetchUsers();
// //     }

// //     // Reset form fields
// //     setNewUser({
// //       shopname: "",
// //       username: "",
// //       mobileNumber: "",
// //       password: "",
// //     });

// //     setShowAddModal(false);
// //   } catch (err) {
// //     console.error("handleAddUser error:", err.response?.data || err.message);
// //     const msg =
// //       err.response?.data?.message ||
// //       err.message ||
// //       "Failed to create user";
// //     setErrorMsg(msg);
// //   } finally {
// //     setBusy(false);
// //   }
// // };

// /* ---------- Add User ---------- */
// const handleAddUser = async () => {
//   setErrorMsg("");

//   const username = newUser.username?.trim();
//   const password = newUser.password?.trim();
//   const shopname = newUser.shopname?.trim();
//   const mobileNumber = newUser.mobileNumber?.trim() || "";

//   if (!username) return setErrorMsg("Username required");
//   if (!password) return setErrorMsg("Password required");
//   if (password.length < 6) return setErrorMsg("Password must be at least 6 characters");
//   if (!shopname) return setErrorMsg("Select a shop");

//   const duplicateUser = users.find(
//     (u) => u.username.toLowerCase() === username.toLowerCase() && u.shopname === shopname
//   );
//   if (duplicateUser) return setErrorMsg("This username already exists for the selected shop");

//   setBusy(true);

//   try {
//     const payload = {
//       username,
//       mobileNumber,
//       password,
//       shopname,
//       role: "user",
//       // email: `${username}_${Date.now()}@dummy.com` // prevents Mongo duplicate error
//     };

//     const res = await axios.post(USERS_API, payload, {
//       headers: { Authorization: `Bearer ${token}` },
//       timeout: 60000,
//     });

//     const created = res.data?.user || res.data;
//     if (created) setUsers((prev) => [...prev, created]);
//     else await fetchUsers();

//     setNewUser({ shopname: "", username: "", mobileNumber: "", password: "" });
//     setShowAddModal(false);
//   } catch (err) {
//     console.error("handleAddUser error:", err.response?.data || err.message);
//     const msg = err.response?.data?.message || err.message || "Failed to create user";
//     setErrorMsg(msg);
//   } finally {
//     setBusy(false);
//   }
// };



//   /* ---------- View User ---------- */
//   const openViewModal = (u) => { setViewUser(u); setShowViewModal(true); };
//   const closeViewModal = () => { setViewUser(null); setShowViewModal(false); };

//   /* ---------- Edit User ---------- */
//   const openEditModal = (u) => {
//     setEditUser({
//       _id: u._id,
//       username: u.username || "",
//       email: u.email || "",
//       password: "",
//       shopname: u.shopname || shops[0]?.shopname || "",
//       role: u.role || "user",
//       status: u.status || "active",
//     });
//     setEditError("");
//     setShowEditModal(true);
//   };

//   const closeEditModal = () => {
//     setEditUser(null);
//     setShowEditModal(false);
//     setEditError("");
//   };


//   const handleSaveEdit = async () => {
//   if (!editUser) return;
//   setEditError("");

//   if (!editUser.username.trim()) return setEditError("Username required");
//   if (!editUser.shopname.trim()) return setEditError("Select a shop");

//   setEditBusy(true);
//   try {
//     const payload = {
//       username: editUser.username.trim(),
//       mobileNumber: editUser.mobileNumber || "",
//       ...(editUser.password ? { password: editUser.password } : {}),
//       role: editUser.role || "user",
//       shopname: editUser.shopname,
//       status: editUser.status || "active", 
//     };

//     const res = await axios.put(`${USERS_API}/${editUser._id}`, payload, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const updated = res.data?.user || res.data;
//     if (updated)
//       setUsers((prev) =>
//         prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u))
//       );
//     else await fetchUsers();

//     closeEditModal();
//   } catch (err) {
//     console.error("handleSaveEdit error:", err.response?.data || err.message);
//     const msg =
//       err.response?.data?.message ||
//       err.message ||
//       "Failed to update user";
//     setEditError(msg);
//   } finally {
//     setEditBusy(false);
//   }
// };

//   return (
//     <div className="users-page">
//       <div className="users-header">
//         <h2>Users</h2>
//         {user && (user.role === "megaadmin" || user.role === "manager") && (
//           <button className="btn-add" onClick={() => setShowAddModal(true)}><FaPlus /> Add User</button>
//         )}
//       </div>

//       {/* Search & Status Filter */}
// <div className="flex gap-2 mb-3">
//   <input
//     type="text"
//     placeholder="Search Username / Mobile No / Shopname"
//     value={search}
//     onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//     className="!w-[330px] !md:w-[350px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//   />

//   <select
//     value={status}
//     onChange={(e) => { setStatus(e.target.value); setPage(1); }}
//     className="!w-[150px] !md:w-[200px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//   >
//     <option value="">All Status</option>
//     <option value="active">Active</option>
//     <option value="inactive">Inactive</option>
//   </select>
// </div>
     
// {/* Users Table */}
// <table className="users-table">
//   <thead>
//     <tr>
//       <th>S.No</th>
//       <th>Username</th>
//       <th>Mobile</th>
//       <th>Shop Name</th>
//       <th>Role</th>
//       <th>Status</th>
//       <th>Action</th>
//     </tr>
//   </thead>
//   <tbody>
//     {users.length > 0 ? users.map((u, idx) => (
//       <tr key={u._id || idx}>
//         <td>{(page-1)*limit + idx + 1}</td>
//         <td>{u.username}</td>
//         <td>{u.mobileNumber || "-"}</td>
//         <td>{u.shopname}</td>
//         <td>{u.role}</td>
//         {/* <td style={{color:u.status==="active"?"#00A76F":"#E53935",fontWeight:600,textTransform:"uppercase"}}>{u.status || "INACTIVE"}</td> */}
        
//         <td style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, textTransform: "uppercase", color: u.status === "active" ? "#00A76F" : "#E53935" }}>
//   {u.status === "active" ? <FaCheckCircle /> : <FaTimesCircle />}
//   {u.status?.toUpperCase() || "INACTIVE"}
// </td>
//         <td>
//           <button onClick={()=>openViewModal(u)}><FaEye color="#00A76F"/></button>
//           <button onClick={()=>openEditModal(u)}><FaEdit color="#F59E0B"/></button>
//         </td>
//       </tr>
//     )) : (
//       <tr><td colSpan="7" className="text-center text-gray-500">No users found</td></tr>
//     )}
//   </tbody>
// </table>

// {/* Pagination */}
// <div className="mt-3 flex justify-center">
//   <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
// </div>

   
//  {/* ---------- Add User Modal ---------- */}
//    {showAddModal && (
//         <div className="modal fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//           <div className="modal-content bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">

//               {/* Close Icon */}
//       <button
//         className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
//         onClick={() => setShowAddModal(false)}
//       >
//         <FaTimes size={18} />
//       </button>

//             <h3 className="text-xl font-semibold mb-4 text-center">
//               Add User
//             </h3>

//             {errorMsg && (
//               <div className="text-red-600 bg-red-100 p-2 rounded mb-2 text-sm">
//                 {errorMsg}
//               </div>
//             )}

//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleAddUser();
//               }}
//               className="flex flex-col gap-4"
//             >
//               {/* Shop Select */}
//               <select
//                 value={newUser.shopname}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, shopname: e.target.value })
//                 }
//                 required
//                 className="border rounded-md px-3 py-2"
//               >
//                 <option value="">Select Shop</option>
//                 {shops.map((s) => (
//                   <option key={s._id || s.shopname} value={s.shopname}>
//                     {s.shopname}
//                   </option>
//                 ))}
//               </select>

//               {/* Username */}
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={newUser.username}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, username: e.target.value })
//                 }
//                 required
//                 autoComplete="username"
//                 className="border rounded-md px-3 py-2"
//               />

//               {/* Mobile */}
//               <input
//                 type="text"
//                 placeholder="Mobile Number (optional)"
//                 value={newUser.mobileNumber}
//                 onChange={(e) =>
//                   setNewUser({ ...newUser, mobileNumber: e.target.value })
//                 }
//                 autoComplete="tel"
//                 className="border rounded-md px-3 py-2"
//               />

//               {/* Password */}
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={newUser.password}
//                   onChange={(e) =>
//                     setNewUser({ ...newUser, password: e.target.value })
//                   }
//                   required
//                   autoComplete="new-password"
//                   className="w-full border rounded-md px-3 py-2"
//                 />
//                 <span
//                   className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>

//               {/* Add Button Only */}
//               <button
//                 type="submit"
//                 disabled={busy}
//                 className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition"
//               >
//                 {busy ? "Adding..." : "Add"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}


//       {/* ---------- View User Modal ---------- */}
//       {/* {showViewModal && viewUser && (
//         <div className="modal">
//           <div className="modal-content">
//             <div className="flex justify-between items-center">
//               <h3>View User</h3>
//               <button className="icon-close" onClick={closeViewModal}><FaTimes/></button>
//             </div>
//             <div style={{marginTop:12}}>
//               <p><strong>Username:</strong> {viewUser.username}</p>
//               <p><strong>Email:</strong> {viewUser.email}</p>
//               <p><strong>Password:</strong> {viewUser.password?"(Hidden)":"Not available"}</p>
//               <p><strong>Shop:</strong> {viewUser.shopname}</p>
//               <p><strong>Status:</strong> {viewUser.status||"active"}</p>
//               <p><strong>Role:</strong> {viewUser.role||"user"}</p>
//             </div>
//             <div className="modal-actions">
//               <button className="btn btn-muted" onClick={closeViewModal}>Close</button>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* ---------- View User Modal ---------- */}
// {showViewModal && viewUser && (
//   <div className="modal">
//     <div className="modal-content">
//       <div className="flex justify-between items-center">
//         <h3>View User</h3>
//         <button className="icon-close" onClick={closeViewModal}>
//           <FaTimes />
//         </button>
//       </div>

//       <div style={{ marginTop: 12, lineHeight: "1.8" }}>
//         <p><strong>Shop Name:</strong> {viewUser.shopname || "-"}</p>
//         <p><strong>Username:</strong> {viewUser.username || "-"}</p>
//         <p><strong>Mobile Number:</strong> {viewUser.mobileNumber || "-"}</p>
//         <p><strong>Password:</strong> {viewUser.password || "-"}</p>
//         <p><strong>Status:</strong> {(viewUser.status || "active").toUpperCase()}</p>
//         <p><strong>Role:</strong> {viewUser.role || "user"}</p>
//       </div>

//       <div className="modal-actions">
//         <button className="btn btn-muted" onClick={closeViewModal}>
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}


//       {/* ---------- Edit User Modal ---------- */}
//       {/* {showEditModal && editUser && (
//         <div className="modal">
//           <div className="modal-content">
//             <div className="flex justify-between items-center">
//               <h3>Edit User</h3>
//               <button className="icon-close" onClick={closeEditModal}><FaTimes/></button>
//             </div>
//             {editError && <div className="error-msg">{editError}</div>}
//             {editBusy && <div className="info-msg">Saving...</div>}
//             <form onSubmit={(e)=>{e.preventDefault(); handleSaveEdit();}}>
//               <input type="text" placeholder="Username" value={editUser.username} onChange={(e)=>setEditUser(p=>({...p,username:e.target.value}))} required autoComplete="username"/>
//               <input type="email" placeholder="Email" value={editUser.email} onChange={(e)=>setEditUser(p=>({...p,email:e.target.value}))} required autoComplete="email"/>
//               <input type="password" placeholder="New password (leave blank to keep unchanged)" value={editUser.password} onChange={(e)=>setEditUser(p=>({...p,password:e.target.value}))} autoComplete="new-password"/>

//               <select value={editUser.shopname} onChange={(e)=>setEditUser(p=>({...p,shopname:e.target.value}))} required className="shop-select">
//                 <option value="" disabled>Select Shop</option>
//                 {shops.map((s)=><option key={s._id||s.shopname} value={s.shopname}>{s.shopname}</option>)}
//               </select>

//               <div style={{marginTop:8,marginBottom:12}}>
//                 {editUser.status?.toLowerCase()==="inactive" ? (
//                   <>
//                     <div style={{color:"#E53935",fontWeight:"bold"}}>User is currently INACTIVE</div>
//                     <button type="button" className="btn-activate" onClick={()=>setEditUser(p=>({...p,status:"active"}))}>Activate User</button>
//                   </>
//                 ) : (
//                   <>
//                     <label style={{marginRight:8}}>
//                       <input type="checkbox" checked={(editUser.status||"active")==="active"} onChange={(e)=>setEditUser(p=>({...p,status:e.target.checked?"active":"inactive"}))}/> Active
//                     </label>
//                     <button type="button" onClick={()=>setEditUser(p=>({...p,status:"inactive"}))}>Set Inactive</button>
//                   </>
//                 )}
//               </div>

//               <div className="modal-actions">
//                 <button type="submit" className="btn-add" disabled={editBusy}>{editBusy?"Saving...":"Save"}</button>
//                 <button type="button" className="btn-cancel" onClick={closeEditModal}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )} */}

// {/* ---------- Edit User Modal ---------- */}
// {showEditModal && editUser && (
//   <div className="modal fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//     <div className="modal-content bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">

//       <h3 className="text-xl font-semibold mb-4 text-center">
//         Edit User
//       </h3>

//       {editError && (
//         <div className="text-red-600 bg-red-100 p-2 rounded mb-2 text-sm">
//           {editError}
//         </div>
//       )}

//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSaveEdit();
//         }}
//         className="flex flex-col gap-4"
//       >
//         {/* Shop Select */}
//         <select
//           value={editUser.shopname}
//           onChange={(e) =>
//             setEditUser({ ...editUser, shopname: e.target.value })
//           }
//           required
//           className="border rounded-md px-3 py-2"
//         >
//           <option value="">Select Shop</option>
//           {shops.map((s) => (
//             <option key={s._id || s.shopname} value={s.shopname}>
//               {s.shopname}
//             </option>
//           ))}
//         </select>

//         {/* Username */}
//         <input
//           type="text"
//           placeholder="Username"
//           value={editUser.username}
//           onChange={(e) =>
//             setEditUser({ ...editUser, username: e.target.value })
//           }
//           required
//           className="border rounded-md px-3 py-2"
//         />

//         {/* Mobile (optional) */}
//         <input
//           type="text"
//           placeholder="Mobile Number (optional)"
//           value={editUser.mobileNumber || ""}
//           onChange={(e) =>
//             setEditUser({ ...editUser, mobileNumber: e.target.value })
//           }
//           className="border rounded-md px-3 py-2"
//         />

//         {/* Password (optional update) */}
//         <div className="relative">
//           <input
//             type={showPassword ? "text" : "password"}
//             placeholder="New Password (optional)"
//             value={editUser.password || ""}
//             onChange={(e) =>
//               setEditUser({ ...editUser, password: e.target.value })
//             }
//             autoComplete="new-password"
//             className="w-full border rounded-md px-3 py-2"
//           />
//           <span
//             className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </span>
//         </div>

//         {/* Status Toggle */}
//         <div className="flex items-center gap-2">
//           <label className="flex items-center gap-1 cursor-pointer select-none">
//             <input
//               type="checkbox"
//               checked={editUser.status === "active"}
//               onChange={(e) => {
//                 const newStatus = e.target.checked ? "active" : "inactive";
//                 setEditUser((p) => ({ ...p, status: newStatus }));

//                 // Update main users table immediately
//                 setUsers((prev) =>
//                   prev.map((u) =>
//                     u._id === editUser._id ? { ...u, status: newStatus } : u
//                   )
//                 );
//               }}
//               className="form-checkbox h-4 w-4"
//             />
//             Status:{" "}
//             <span
//               className={`font-semibold ${
//                 editUser.status === "active"
//                   ? "text-green-600"
//                   : "text-red-600"
//               }`}
//             >
//               {editUser.status?.toUpperCase() || "INACTIVE"}
//             </span>
//           </label>
//         </div>

//         {/* Save Button */}
//         <button
//           type="submit"
//           disabled={editBusy}
//           className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition"
//         >
//           {editBusy ? "Saving..." : "Save Changes"}
//         </button>

//         {/* Cancel Button */}
//         <button
//           type="button"
//           onClick={closeEditModal}
//           className="text-gray-500 text-sm hover:text-gray-700 mt-1"
//         >
//           Cancel
//         </button>
//       </form>
//     </div>
//   </div>
// )}


//     </div>
//   );
// }



import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTimes, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Sidebar/adduser.css";
import Pagination from "../../components/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USERS_API = `${API}/api/users`;
const SHOPS_API = `${API}/api/shops`;

export default function AddUser() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [newUser, setNewUser] = useState({ username: "", mobileNumber: "", password: "", shopname: "",  });
  const [newUser, setNewUser] = useState({
  shopname: "",
  username: "",
  mobileNumber: "",
  password: "",
  role: "user"
});

  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const [showPassword, setShowPassword] = useState(false);

  /* ---------- Fetch Users ---------- */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search, status });
      const res = await axios.get(`${USERS_API}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.users || [];
      // Simulate 1s loading
      setTimeout(() => {
        setUsers(data);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setUsers([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, status]);

  /* ---------- Fetch Shops ---------- */
  // const fetchShops = async () => {
  //   try {
  //     if (!token) return console.error("No token found. Cannot fetch shops.");
  //     const res = await axios.get(SHOPS_API, {
  //       headers: { Authorization: `Bearer ${token}` },
  //       timeout: 10000,
  //     });
  //     const data = Array.isArray(res.data) ? res.data : res.data.shops || [];
  //     setShops(data);
  //     if (!newUser.shopname && data.length) setNewUser((p) => ({ ...p, shopname: data[0].shopname }));
  //   } catch (err) {
  //     console.error("fetchShops error:", err.response?.data || err.message);
  //     setShops([]);
  //   }
  // };

  // useEffect(() => { fetchShops(); }, []);
const fetchShops = async () => {
  try {
    if (!token) return console.error("No token found. Cannot fetch shops.");

    const res = await axios.get(`${SHOPS_API}?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    console.log("Shops API response:", res.data);

    const data = Array.isArray(res.data) ? res.data : res.data.shops || [];
    setShops(data);

    // Set default shop in Add User modal if not set
    if (!newUser.shopname && data.length) {
      setNewUser((p) => ({ ...p, shopname: data[0].shopname }));
    }

  } catch (err) {
    console.error("fetchShops error:", err.response?.data || err.message);
    setShops([]);
  }
};

useEffect(() => { fetchShops(); }, []);


  /* ---------- Add User ---------- */
  const handleAddUser = async () => {
    setErrorMsg("");
    const username = newUser.username?.trim();
    const password = newUser.password?.trim();
    const shopname = newUser.shopname?.trim();
    const mobileNumber = newUser.mobileNumber?.trim() || "";

    if (!username) return setErrorMsg("Username required");
    if (!password) return setErrorMsg("Password required");
    if (password.length < 6) return setErrorMsg("Password must be at least 6 characters");
    if (!shopname) return setErrorMsg("Select a shop");

    const duplicateUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.shopname === shopname
    );
    if (duplicateUser) return setErrorMsg("This username already exists for the selected shop");

    setBusy(true);
    try {
      const payload = { username, mobileNumber, password, shopname, role: "user" };
      const res = await axios.post(USERS_API, payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000,
      });

      const created = res.data?.user || res.data;
      if (created) {
        setUsers((prev) => [...prev, created]); // update table immediately
      } else {
        await fetchUsers();
      }

      setNewUser({ shopname: "", username: "", mobileNumber: "", password: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("handleAddUser error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || "Failed to create user";
      setErrorMsg(msg);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- View User ---------- */
  const openViewModal = (u) => { setViewUser(u); setShowViewModal(true); };
  const closeViewModal = () => { setViewUser(null); setShowViewModal(false); };

  /* ---------- Edit User ---------- */
  const openEditModal = (u) => {
    setEditUser({
      _id: u._id,
      username: u.username || "",
      email: u.email || "",
      password: "",
      mobileNumber: u.mobileNumber || "",
      shopname: u.shopname || shops[0]?.shopname || "",
      role: u.role || "user",
      status: u.status || "active",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditUser(null);
    setShowEditModal(false);
    setEditError("");
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditError("");
    if (!editUser.username.trim()) return setEditError("Username required");
    if (!editUser.shopname.trim()) return setEditError("Select a shop");

    setEditBusy(true);
    try {
      const payload = {
        username: editUser.username.trim(),
        mobileNumber: editUser.mobileNumber || "",
        ...(editUser.password ? { password: editUser.password } : {}),
        role: editUser.role || "user",
        shopname: editUser.shopname,
        status: editUser.status || "active",
      };

      const res = await axios.put(`${USERS_API}/${editUser._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = res.data?.user || res.data;
      if (updated) {
        setUsers((prev) => prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u))); // update table immediately
      } else {
        await fetchUsers();
      }

      closeEditModal();
    } catch (err) {
      console.error("handleSaveEdit error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.message || "Failed to update user";
      setEditError(msg);
    } finally {
      setEditBusy(false);
    }
  };

const openAddModal = () => {
  // Set default shop as the first in the list
  setNewUser({
    shopname: shops.length ? shops[0].shopname : "", // default to first shop
    username: "",
    mobileNumber: "",
    password: "",
    role: "user",
  });
  setErrorMsg("");
  setShowAddModal(true);
};


  return (
    <div className="users-page p-11">
      <div className="users-header">
        <h2>Users</h2>
        {user && (user.role === "megaadmin" || user.role === "manager") && (
          <button className="btn-add" onClick={() => setShowAddModal(true)}><FaPlus /> Add User</button>
        )}
      </div>




      {/* Search & Status Filter */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search Username / Mobile No / Shopname"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="!w-[330px] !md:w-[350px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
        />

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="!w-[150px] !md:w-[200px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Username</th>
            <th>Mobile</th>
            <th>Shop Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" className="text-center text-gray-500">Loading...</td></tr>
          ) : users.length > 0 ? users.map((u, idx) => (
            <tr key={u._id || idx}>
              <td>{(page - 1) * limit + idx + 1}</td>
              <td>{u.username}</td>
              <td>{u.mobileNumber || "-"}</td>
              <td>{u.shopname}</td>
              <td>{u.role}</td>
              <td style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, textTransform: "uppercase", color: u.status === "active" ? "#00A76F" : "#E53935" }}>
                {u.status === "active" ? <FaCheckCircle /> : <FaTimesCircle />}
                {u.status?.toUpperCase() || "INACTIVE"}
              </td>
              {/* <td>
                <button onClick={() => openViewModal(u)}><FaEye color="#00A76F" /></button> 
                <button onClick={() => openEditModal(u)}><FaEdit color="#F59E0B" /></button>
              </td> */}
              <td>
  <button 
    onClick={() => openViewModal(u)} 
    style={{ marginRight: '8px' }} // adds space to the right
  >
    <FaEye color="#00A76F" />
  </button> 
  <button onClick={() => openEditModal(u)}>
    <FaEdit color="#F59E0B" />
  </button>
</td>

            </tr>
          )) : (
            <tr><td colSpan="7" className="text-center text-gray-500">No users found</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-3 flex justify-center">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* ---------- Add, View, Edit Modals ---------- */}
      {showAddModal && (
        <div className="modal fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition" onClick={() => setShowAddModal(false)}><FaTimes size={18} /></button>
            <h3 className="text-xl font-semibold mb-4 text-center">Add User</h3>
            {errorMsg && <div className="text-red-600 bg-red-100 p-2 rounded mb-2 text-sm">{errorMsg}</div>}
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="flex flex-col gap-4">
              {/* <select value={newUser.shopname} onChange={(e) => setNewUser({ ...newUser, shopname: e.target.value })} required className="border rounded-md px-3 py-2">
                <option value="">Select Shop</option>
                {shops.map((s) => <option key={s._id || s.shopname} value={s.shopname}>{s.shopname}</option>)}
              </select> */}
  <select
  value={newUser.shopname}
  onChange={(e) => setNewUser({ ...newUser, shopname: e.target.value })}
  required
  className="border rounded-md px-3 py-2"
>
  <option value="">Select Shop</option> {/* Placeholder */}
  {shops.map((s) => (
    <option key={s._id || s.shopname} value={s.shopname}>
      {s.shopname}
    </option>
  ))}
</select>


              <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required autoComplete="username" className="border rounded-md px-3 py-2" />
              <input type="text" placeholder="Mobile Number (optional)" value={newUser.mobileNumber} onChange={(e) => setNewUser({ ...newUser, mobileNumber: e.target.value })} autoComplete="tel" className="border rounded-md px-3 py-2" />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required autoComplete="new-password" className="w-full border rounded-md px-3 py-2" />
                <span className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button type="submit" disabled={busy} className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition">{busy ? "Adding..." : "Add"}</button>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex justify-between items-center">
              <h3>View User</h3>
              <button className="icon-close" onClick={closeViewModal}><FaTimes /></button>
            </div>
            <div style={{ marginTop: 12, lineHeight: "1.8" }}>
              <p><strong>Shop Name:</strong> {viewUser.shopname || "-"}</p>
              <p><strong>Username:</strong> {viewUser.username || "-"}</p>
              <p><strong>Mobile Number:</strong> {viewUser.mobileNumber || "-"}</p>
              <p><strong>Password:</strong> {viewUser.password || "-"}</p>
              <p><strong>Status:</strong> {(viewUser.status || "active").toUpperCase()}</p>
              <p><strong>Role:</strong> {viewUser.role || "user"}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-muted" onClick={closeViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editUser && (
        <div className="modal fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-4 text-center">Edit User</h3>
            {editError && <div className="text-red-600 bg-red-100 p-2 rounded mb-2 text-sm">{editError}</div>}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="flex flex-col gap-4">
              <select value={editUser.shopname} onChange={(e) => setEditUser({ ...editUser, shopname: e.target.value })} required className="border rounded-md px-3 py-2">
                <option value="">Select Shop</option>
                {shops.map((s) => <option key={s._id || s.shopname} value={s.shopname}>{s.shopname}</option>)}
              </select>
              <input type="text" placeholder="Username" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} required className="border rounded-md px-3 py-2" />
              <input type="text" placeholder="Mobile Number (optional)" value={editUser.mobileNumber || ""} onChange={(e) => setEditUser({ ...editUser, mobileNumber: e.target.value })} className="border rounded-md px-3 py-2" />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="New Password (optional)" value={editUser.password || ""} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} autoComplete="new-password" className="w-full border rounded-md px-3 py-2" />
                <span className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input type="checkbox" checked={editUser.status === "active"} onChange={(e) => {
                  const newStatus = e.target.checked ? "active" : "inactive";
                  setEditUser(p => ({ ...p, status: newStatus }));
                  setUsers(prev => prev.map(u => u._id === editUser._id ? { ...u, status: newStatus } : u));
                }} className="form-checkbox h-4 w-4" />
                Status: <span className={`font-semibold ${editUser.status === "active" ? "text-green-600" : "text-red-600"}`}>{editUser.status?.toUpperCase() || "INACTIVE"}</span>
              </label>
              <button type="submit" disabled={editBusy} className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition">{editBusy ? "Saving..." : "Save Changes"}</button>
              <button type="button" onClick={closeEditModal} className="text-gray-500 text-sm hover:text-gray-700 mt-1">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
