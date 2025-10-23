// export default function AddCustomer() {
//   return <h1 className="text-2xl font-bold">Add Customer Page</h1>;
// }




// 1. heading - Add Customer  - right corner - Add Customer with react icons
// 2. table content s.no Name of the Customer Mobile No Action - view icons green color hover. view click - show model - customer details
// 3. Add Customer button click show model - 
//     form format - Name Mobile No Address - text area
// 4. add customer button 
// i need all content responsive on all devices. .  also follow design looks like sales bill format.
// and then external css file formatlooks like professionally add animation and transaction. using hover effect. button color 00A76f 007867 c8fad6




//add new navbar - shop (only show megaadmin and manager)

// src/pages/Sidebar/Shop.jsx this file code
// 1. heading - Shops  - right corner - Add Shop with react icons
// 2. table content s.no shop Designation  status Action - view icons green color hover. view click - show model - shop details. status icon click show model status live update table
// 3. Add shop button click show model - 
//     heading create shop form format - shop Designation Address - text area, contact
// 4. after filling data add shop button  click.live data update table. with backend mongodb, routes controller. model
// i need all content responsive on all devices.
// and then external css file formatlooks like professionally add animation and transaction. using hover effect. button color 00A76f 007867 c8fad6
// src/pages/Sidebar/Shop.jsx file name //src/styles/Sidebar/Shop.css. 


//updated this code professional, modern, and fully responsive, with unique styles. also added smooth hover effects, transitions, and better typography. i need updated unique professional updated full code dont miss a class and id.



// // src/pages/AddCustomer.jsx
// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { FaPlus, FaEye, FaTimes, FaUserSlash, FaUserCheck } from "react-icons/fa";
// import "../styles/addCustomer.css";
// import { useAuth } from "../context/AuthContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function AddCustomer() {
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [form, setForm] = useState({ name: "", mobile: "", address: "" });

//   const token = localStorage.getItem("token");
//   const shopname = localStorage.getItem("shopname");
//   const headers = { Authorization: `Bearer ${token}` };
//    const { user } = useAuth();

//   const getId = (c) => c?._id ?? c?.id;
//   const serverUsesIsActive = useMemo(
//     () => customers.some((c) => Object.prototype.hasOwnProperty.call(c, "isActive")),
//     [customers]
//   );
//   const serverUsesStatus = useMemo(
//     () => customers.some((c) => Object.prototype.hasOwnProperty.call(c, "status")),
//     [customers]
//   );
//   const isActive = (c) => {
//     if ("isActive" in c) return !!c.isActive;
//     const s = (c.status ?? "active").toString().toLowerCase();
//     return s !== "inactive";
//   };
//   const labelFromActive = (active) => (active ? "active" : "inactive");

//   const payloadForActive = (cust, nextActive) => {
//     if (serverUsesIsActive) return { isActive: nextActive };
//     if (serverUsesStatus) return { status: nextActive ? "active" : "inactive" };
//     return { status: nextActive ? "active" : "inactive" };
//   };

//   const pickUpdatedFromResponse = (resData) =>
//     resData?.data ?? resData?.customer ?? resData;

//   const pushToast = (msg) => {
//     const id = Date.now();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
//   };

//   // Load customers (multi-tenant)


 


// useEffect(() => {
//   const shopnameHeader = user?.shopname || localStorage.getItem("shopname");
//   if (!shopnameHeader) return;

//   const headers = {
//     Authorization: `Bearer ${token}`,
//     "x-shopname": shopnameHeader,
//   };

//   axios
//     .get(`${API}/api/customers`, { headers })
//     .then((res) => {
//       const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
//       setCustomers(list);
//     })
//     .catch((err) => {
//       console.error("GET customers failed:", err);
//       pushToast("Failed to load customers");
//     });
// }, [user]);

//   const filtered = useMemo(() => {
//     const s = search.trim().toLowerCase();
//     if (!s) return customers;
//     return customers.filter((c) => {
//       const name = (c.name ?? "").toString().toLowerCase();
//       const mobile = (c.mobile ?? "").toString().toLowerCase();
//       return name.includes(s) || mobile.includes(s);
//     });
//   }, [search, customers]);

//   // ---- Modal handlers ----
//   const openAdd = () => {
//     setForm({ name: "", mobile: "", address: "" });
//     setShowAddModal(true);
//   };
//   const closeAdd = () => setShowAddModal(false);
//   const openView = (cust) => setShowViewModal(cust);
//   const closeView = () => setShowViewModal(null);

//   // ---- Create Customer ----


//   const onCreate = async (e) => {
//   e.preventDefault();
//   try {
//     const shopnameHeader = user?.shopname || localStorage.getItem("shopname");
//     if (!shopnameHeader) throw new Error("Missing shopname");

//     const headersWithTenant = {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//       "x-shopname": shopnameHeader,
//     };

//     const payload = { ...form }; // no need to send shopname in body

//     const res = await axios.post(`${API}/api/customers`, payload, { headers: headersWithTenant });
//     const created = pickUpdatedFromResponse(res.data);
//     const withUiStatus = {
//       ...created,
//       ...(Object.prototype.hasOwnProperty.call(created, "isActive")
//         ? {}
//         : Object.prototype.hasOwnProperty.call(created, "status")
//         ? {}
//         : { status: "active" }),
//     };
//     setCustomers((prev) => [withUiStatus, ...prev]);
//     pushToast(`Customer ${created?.name ?? ""} added`);
//     setShowAddModal(false);
//   } catch (err) {
//     console.error("POST create failed:", err);
//     pushToast("Failed to add customer");
//   }
// };


//   // ---- Toggle Status ----
//   const toggleStatus = async (cust) => {
//     const id = getId(cust);
//     if (!id) return pushToast("Cannot update: missing id");

//     const wasActive = isActive(cust);
//     const nextActive = !wasActive;
//     const optimistic = payloadForActive(cust, nextActive);

//     // optimistic UI
//     setCustomers((prev) =>
//       prev.map((c) =>
//         getId(c) === id
//           ? {
//               ...c,
//               ...optimistic,
//               isActive: "isActive" in c ? nextActive : c.isActive,
//               status:
//                 "status" in c
//                   ? labelFromActive(nextActive)
//                   : c.status ?? labelFromActive(nextActive),
//             }
//           : c
//       )
//     );


//     try {
//   const shopnameHeader = user?.shopname || localStorage.getItem("shopname");
//   if (!shopnameHeader) throw new Error("Missing shopname");

//   const headersWithTenant = {
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//     "x-shopname": shopnameHeader,
//   };

//   const res = await axios.patch(
//     `${API}/api/customers/${id}/status`,
//     optimistic,
//     { headers: headersWithTenant }
//   );

//   const updated = pickUpdatedFromResponse(res.data);
//   if (updated) {
//     setCustomers((prev) =>
//       prev.map((c) => (getId(c) === id ? { ...c, ...updated } : c))
//     );
//   }
//   pushToast(`Customer ${cust.name} is now ${labelFromActive(nextActive)}`);
// } catch (err) {
//   console.error("Update status failed:", err);
//   // revert
//   setCustomers((prev) =>
//     prev.map((c) =>
//       getId(c) === id
//         ? {
//             ...c,
//             ...payloadForActive(c, wasActive),
//             isActive: "isActive" in c ? wasActive : c.isActive,
//             status:
//               "status" in c
//                 ? labelFromActive(wasActive)
//                 : c.status ?? labelFromActive(wasActive),
//           }
//         : c
//     )
//   );
//   pushToast("Failed to update status");
// }

//   };

//   return (
//     <div className="customers-page">
//       {/* Toasts */}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className="toast">{t.msg}</div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="customers-header">
//         <h1 className="title">Add Customer</h1>
//         <button className="btn btn-primary" onClick={openAdd}>
//           <FaPlus /> Add Customer
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="customers-toolbar">
//         <input
//           className="input"
//           placeholder="Search by name or mobile"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>


//       {/* Table */}
// <div className="card table-card overflow-x-auto shadow-lg rounded-lg bg-white p-4">
//   <div className="table-responsive w-full">
//     <table className="table-auto w-full min-w-[600px] border-collapse">
//       <thead className="bg-gray-100">
//         <tr>
//           <th className="px-4 py-2 text-left text-sm md:text-base">S.No</th>
//           <th className="px-4 py-2 text-left text-sm md:text-base">Name</th>
//           <th className="px-4 py-2 text-left text-sm md:text-base">Mobile</th>
//           <th className="px-4 py-2 text-left text-sm md:text-base">Status</th>
//           <th className="px-4 py-2 text-center text-sm md:text-base">Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {filtered.length === 0 ? (
//           <tr>
//             <td colSpan="5" className="text-gray-400 text-center py-4">
//               No customers found
//             </td>
//           </tr>
//         ) : (
//           filtered.map((c, idx) => {
//             const active = isActive(c);
//             return (
//               <tr
//                 key={getId(c)}
//                 className="hover:bg-gray-50 transition-colors duration-200"
//               >
//                 <td className="px-4 py-2 text-sm md:text-base">{idx + 1}</td>
//                 <td className="px-4 py-2 text-sm md:text-base">{c.name}</td>
//                 <td className="px-4 py-2 text-sm md:text-base">{c.mobile}</td>
//                 <td
//                   className={`px-4 py-2 text-sm md:text-base font-semibold ${
//                     active ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {labelFromActive(active)}
//                 </td>
//                 <td className="px-4 py-2 text-center space-x-2">
//                   <button
//                     className="icon-btn view p-2 rounded hover:bg-gray-200 transition-colors duration-200"
//                     onClick={() => openView(c)}
//                   >
//                     <FaEye />
//                   </button>
//                   <button
//                     className={`icon-btn p-2 rounded transition-colors duration-200 ${
//                       active
//                         ? "bg-red-100 hover:bg-red-200 text-red-600"
//                         : "bg-green-100 hover:bg-green-200 text-green-600"
//                     }`}
//                     onClick={() => toggleStatus(c)}
//                   >
//                     {active ? <FaUserSlash /> : <FaUserCheck />}
//                   </button>
//                 </td>
//               </tr>
//             );
//           })
//         )}
//       </tbody>
//     </table>
//   </div>
// </div>


//       {/* View Modal */}
//       {showViewModal && (
//         <Modal title="Customer Details" onClose={closeView}>
//           <Detail label="Name" value={showViewModal.name} />
//           <Detail label="Mobile" value={showViewModal.mobile} />
//           <Detail label="Address" value={showViewModal.address} />
//           <Detail label="Status" value={labelFromActive(isActive(showViewModal))} />
//           <div className="modal-actions">
//             <button className="btn btn-muted" onClick={closeView}>Close</button>
//           </div>
//         </Modal>
//       )}

//       {/* Add Modal */}
//       {showAddModal && (
//         <Modal title="Add Customer" onClose={closeAdd}>
//           <form onSubmit={onCreate} className="customer-form">
//             <div className="form-row">
//               <label>Name</label>
//               <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
//             </div>
//             <div className="form-row">
//               <label>Mobile</label>
//               <input className="input" value={form.mobile} onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))} required />
//             </div>
//             <div className="form-row">
//               <label>Address</label>
//               <textarea className="input textarea" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
//             </div>
//             <div className="modal-actions">
//               <button type="button" className="btn btn-muted" onClick={closeAdd}>Cancel</button>
//               <button type="submit" className="btn btn-primary">Add Customer</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* Helpers */
// function Detail({ label, value }) {
//   return (
//     <div className="detail">
//       <span className="detail-label">{label}</span>
//       <span className="detail-value">{String(value ?? "-")}</span>
//     </div>
//   );
// }

// function Modal({ title, children, onClose }) {
//   return (
//     <div className="modal-overlay" onMouseDown={onClose}>
//       <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>{title}</h3>
//           <button className="icon-close" onClick={onClose}><FaTimes /></button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }





// src/pages/AddCustomer.jsx
import { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaTimes, FaUserSlash, FaUserCheck } from "react-icons/fa";
import "../styles/addCustomer.css";
import { useAuth } from "../context/AuthContext";
import { ShopContext } from "../context/ShopContext";
import Pagination from "../components/Pagination";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------------- Safe Fetch Helper ---------------- */
async function safeFetchCustomers(url, headers = {}) {
  try {
    const res = await axios.get(url, { headers });
    if (Array.isArray(res.data)) return res.data;           // tenant API
    if (Array.isArray(res.data?.data)) return res.data.data; 
    if (Array.isArray(res.data?.customers)) return res.data.customers; 
    return [];
  } catch (err) {
    console.error("safeFetchCustomers failed:", err);
    return [];
  }
}

export default function AddCustomer({ shopname: propShopname }) {
  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);

  const shopname = selectedShop?.shopname || propShopname || user?.shopname;
  const token = localStorage.getItem("token");

  const CUSTOMERS_API = `${API}/api/customers`;

  /* ---------- State ---------- */
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState({ name: "", mobile: "", address: "" });


/* ---------- State ---------- */
const [status, setStatus] = useState(""); // active/inactive
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);;


  /* ---------- Toast Helper ---------- */
  const pushToast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  /* ---------- Utilities ---------- */
  const getId = (c) => c?._id ?? c?.id;
  const isActive = (c) => ((c.status ?? "active").toString().toLowerCase() !== "inactive");
  // const labelFromActive = (active) => (active ? "active" : "inactive");
  const labelFromActive = (active) => (active ? "ACTIVE" : "INACTIVE");

  const payloadForActive = (cust, nextActive) => ({ status: nextActive ? "active" : "inactive" });
  const pickUpdatedFromResponse = (resData) => resData?.data ?? resData?.customer ?? resData;

  const buildHeaders = () => {
    const h = { Authorization: `Bearer ${token}` };
    if (shopname) h["x-shopname"] = shopname;
    return h;
  };


// fetchCustomers
const fetchCustomers = async (p = 1) => {
  try {
    const params = { page: p, limit: 10, search, status };
    const headers = buildHeaders();
    const res = await axios.get(CUSTOMERS_API, { params, headers });
    const data = res.data || {};
    setCustomers(data.customers || []);
    setPage(data.page || p);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    console.error("fetchCustomers failed:", err);
    pushToast("Failed to fetch customers");
  }
};

// Trigger fetch on search/status change
useEffect(() => {
  fetchCustomers(1);
}, [search, status, shopname]);


  /* ---------- Filtered List ---------- */
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) => {
      const name = (c.name ?? "").toLowerCase();
      const mobile = (c.mobile ?? "").toLowerCase();
      return name.includes(s) || mobile.includes(s);
    });
  }, [search, customers]);

  /* ---------- Create Customer ---------- */
  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const headers = buildHeaders();
      const res = await axios.post(CUSTOMERS_API, form, { headers });
      const created = pickUpdatedFromResponse(res.data);
      setCustomers((prev) => [created, ...prev]);
      pushToast(`Customer ${created?.name ?? ""} added`);
      setShowAddModal(false);
      setForm({ name: "", mobile: "", address: "" });
    } catch (err) {
      console.error("POST create failed:", err);
      pushToast(err?.response?.data?.message || "Failed to add customer");
    }
  };

  /* ---------- Toggle Status ---------- */
  const toggleStatus = async (cust) => {
    const id = getId(cust);
    if (!id) return pushToast("Cannot update: missing id");

    const wasActive = isActive(cust);
    const nextActive = !wasActive;
    const optimistic = payloadForActive(cust, nextActive);

    // optimistic UI
    setCustomers((prev) =>
      prev.map((c) => (getId(c) === id ? { ...c, ...optimistic } : c))
    );

    try {
      const headers = buildHeaders();
      const url = `${CUSTOMERS_API}/${id}/status`;
      const res = await axios.patch(url, optimistic, { headers });
      const updated = pickUpdatedFromResponse(res.data);
      if (updated) {
        setCustomers((prev) =>
          prev.map((c) => (getId(c) === id ? { ...c, ...updated } : c))
        );
      }
      pushToast(`Customer ${cust.name} is now ${labelFromActive(nextActive)}`);
    } catch (err) {
      console.error("PATCH status failed:", err);
      // revert
      setCustomers((prev) =>
        prev.map((c) => (getId(c) === id ? { ...c, ...payloadForActive(c, wasActive) } : c))
      );
      pushToast("Failed to update status");
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="customers-page">
      {/* Toasts */}
      <div className="toasts">{toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}</div>

      {/* Header */}
      <div className="customers-header">
        <h1 className="title">Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Customer
        </button>
      </div>

      {/* Toolbar */}
     

{/* Toolbar */}
<div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3
 ">
  {/* Left: Name / Mobile Search */}
  <div className="flex min-w-[200px] h-8">
    <input
      type="text"
      placeholder="Search by Name or Mobile"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
       className="!w-[240px] !md:w-[250px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
    />
  </div>

  {/* Right: Status Filter */}
  <div className="flex min-w-[120px] h-8">
    <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="w-full text-sm border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition
             hover:bg-green-50 hover:border-green-400"
>
    <option value="">ALL STATUS</option>
  <option value="active">ACTIVE</option>
  <option value="inactive">INACTIVE</option>
</select>

  </div>

  {/* Buttons */}
  {/* <div className="flex gap-2 flex-wrap">
    <button
      onClick={() => fetchCustomers(1)}
      className="text-sm bg-[#007867] text-white px-3 py-1 rounded hover:bg-[#005f50] transition-shadow shadow-sm"
    >
      Search
    </button>
    <button
      onClick={() => { setSearch(""); setStatus(""); fetchCustomers(1); }}
      className="text-sm bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 transition-shadow shadow-sm"
    >
      Reset
    </button>
  </div> */}
  {/* <button
  onClick={() => fetchCustomers(1)}
  className="text-sm bg-[#007867] text-white px-3 py-1 rounded hover:bg-[#005f50] transition-shadow shadow-sm"
>
  Search
</button>
<button
  onClick={() => { setSearch(""); setStatus(""); fetchCustomers(1); }}
  className="text-sm bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 transition-shadow shadow-sm"
>
  Reset
</button> */}

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
                  <td colSpan="5" className="text-gray-400 text-center py-4">No customers found</td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const active = isActive(c);
                  return (
                    <tr key={getId(c)} className="hover:bg-gray-50">
                     
                      {/* <td className="px-4 py-2">{idx + 1}</td> */}
                         <td className="px-4 py-2">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-2">{c.name}</td>
                      <td className="px-4 py-2">{c.mobile}</td>
                      {/* <td className={`px-4 py-2 font-semibold ${active ? "text-green-600" : "text-red-600"}`}>
                        {labelFromActive(active)}
                      </td> */}

                      <td className={`px-4 py-2 font-semibold ${active ? "text-green-600" : "text-red-600"}`}>
  {labelFromActive(active)}
</td>

                      <td className="px-4 py-2 text-center space-x-2">
                        <button className="icon-btn view p-2" onClick={() => setShowViewModal(c)}><FaEye title="View" /></button>
                        <button
                          className={`icon-btn p-2 ${active ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
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
          <Pagination page={page} totalPages={totalPages} onPageChange={fetchCustomers} />

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
            <button className="btn btn-muted" onClick={() => setShowViewModal(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Customer" onClose={() => setShowAddModal(false)}>
          <form onSubmit={onCreate} className="customer-form">
            <div className="form-row">
              <label>Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            {/* <div className="form-row">
              <label>Mobile</label>
              <input className="input" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} required />
            </div> */}

            <div className="form-row">
  <label>Mobile</label>
  <input
    className="input"
    value={form.mobile}
    onChange={(e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
      if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
      setForm(f => ({ ...f, mobile: value }));
    }}

    required
  />
</div>

            <div className="form-row">
              <label>Address</label>
              <textarea className="input textarea" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="modal-actions">
              {/* <button type="button" className="btn btn-muted" onClick={() => setShowAddModal(false)}>Cancel</button> */}
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



// // src/pages/AddCustomer.jsx
// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { FaPlus, FaEye, FaTimes, FaUserSlash, FaUserCheck } from "react-icons/fa";
// import "../styles/addCustomer.css";
// import { useAuth } from "../context/AuthContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// /* ---------------- Safe Fetch Helper ---------------- */
// async function safeFetchCustomers(url, options = {}) {
//   try {
//     const res = await axios(url, options);
//     if (Array.isArray(res.data)) return res.data;           // tenant API
//     if (res.data?.data) return res.data.data;             // fallback
//     return [];
//   } catch (err) {
//     console.error("safeFetchCustomers failed:", err);
//     return [];
//   }
// }

// export default function AddCustomer() {
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [form, setForm] = useState({ name: "", mobile: "", address: "" });

//   const { user } = useAuth(); // tenant user
//   const token = localStorage.getItem("token");

//   /* ---------------- Helpers ---------------- */
//   const pushToast = (msg) => {
//     const id = Date.now();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
//   };

//   const getId = (c) => c?._id ?? c?.id;

//   const isActive = (c) => {
//     const s = (c.status ?? "active").toString().toLowerCase();
//     return s !== "inactive";
//   };
//   const labelFromActive = (active) => (active ? "active" : "inactive");

//   const payloadForActive = (cust, nextActive) => ({ status: nextActive ? "active" : "inactive" });

//   const pickUpdatedFromResponse = (resData) => resData?.data ?? resData?.customer ?? resData;

//   /* ---------------- URL Builder ---------------- */
//   const buildUrl = (path = "") => `${API}/api/customers${path}`;

//   /* ---------------- Headers Builder ---------------- */
//   const buildHeaders = () => {
//     const h = { Authorization: `Bearer ${token}` };
//     if (user?.shopname) h["x-shopname"] = user.shopname;
//     return h;
//   };

//   /* ---------------- Load Customers ---------------- */
//   useEffect(() => {
//     const load = async () => {
//       const url = buildUrl();
//       const headers = buildHeaders();
//       const list = await safeFetchCustomers(url, { headers });
//       setCustomers(list);
//     };
//     load();
//   }, [user]);

//   const filtered = useMemo(() => {
//     const s = search.trim().toLowerCase();
//     if (!s) return customers;
//     return customers.filter((c) => {
//       const name = (c.name ?? "").toLowerCase();
//       const mobile = (c.mobile ?? "").toLowerCase();
//       return name.includes(s) || mobile.includes(s);
//     });
//   }, [search, customers]);

//   /* ---------------- Create Customer ---------------- */
//   const onCreate = async (e) => {
//     e.preventDefault();
//     try {
//       const url = buildUrl();
//       const headers = buildHeaders();

//       const res = await axios.post(url, form, { headers });
//       const created = pickUpdatedFromResponse(res.data);

//       setCustomers((prev) => [created, ...prev]);
//       pushToast(`Customer ${created?.name ?? ""} added`);
//       setShowAddModal(false);
//       setForm({ name: "", mobile: "", address: "" });
//     } catch (err) {
//       console.error("POST create failed:", err);
//       pushToast("Failed to add customer");
//     }
//   };

//   /* ---------------- Toggle Status ---------------- */
//   const toggleStatus = async (cust) => {
//     const id = getId(cust);
//     if (!id) return pushToast("Cannot update: missing id");

//     const wasActive = isActive(cust);
//     const nextActive = !wasActive;
//     const optimistic = payloadForActive(cust, nextActive);

//     // optimistic UI
//     setCustomers((prev) =>
//       prev.map((c) => (getId(c) === id ? { ...c, ...optimistic } : c))
//     );

//     try {
//       const url = buildUrl(`/${id}/status`);
//       const headers = buildHeaders();
//       const res = await axios.patch(url, optimistic, { headers });
//       const updated = pickUpdatedFromResponse(res.data);
//       if (updated) {
//         setCustomers((prev) =>
//           prev.map((c) => (getId(c) === id ? { ...c, ...updated } : c))
//         );
//       }
//       pushToast(`Customer ${cust.name} is now ${labelFromActive(nextActive)}`);
//     } catch (err) {
//       console.error("Update status failed:", err);
//       // revert
//       setCustomers((prev) =>
//         prev.map((c) => (getId(c) === id ? { ...c, ...payloadForActive(c, wasActive) } : c))
//       );
//       pushToast("Failed to update status");
//     }
//   };

//   /* ---------------- Render ---------------- */
//   return (
//     <div className="customers-page">
//       {/* Toasts */}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className="toast">{t.msg}</div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="customers-header">
//         <h1 className="title">Add Customer</h1>
//         <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
//           <FaPlus /> Add Customer
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="customers-toolbar">
//         <input
//           className="input"
//           placeholder="Search by name or mobile"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Table */}
//       <div className="card table-card overflow-x-auto shadow-lg rounded-lg bg-white p-4">
//         <div className="table-responsive w-full">
//           <table className="table-auto w-full min-w-[600px] border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-left">S.No</th>
//                 <th className="px-4 py-2 text-left">Name</th>
//                 <th className="px-4 py-2 text-left">Mobile</th>
//                 <th className="px-4 py-2 text-left">Status</th>
//                 <th className="px-4 py-2 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="text-gray-400 text-center py-4">
//                     No customers found
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((c, idx) => {
//                   const active = isActive(c);
//                   return (
//                     <tr key={getId(c)} className="hover:bg-gray-50">
//                       <td className="px-4 py-2">{idx + 1}</td>
//                       <td className="px-4 py-2">{c.name}</td>
//                       <td className="px-4 py-2">{c.mobile}</td>
//                       <td
//                         className={`px-4 py-2 font-semibold ${
//                           active ? "text-green-600" : "text-red-600"
//                         }`}
//                       >
//                         {labelFromActive(active)}
//                       </td>
//                       <td className="px-4 py-2 text-center space-x-2">
//                         <button
//                           className="icon-btn view p-2"
//                           onClick={() => setShowViewModal(c)}
//                         >
//                           <FaEye />
//                         </button>
//                         <button
//                           className={`icon-btn p-2 ${
//                             active
//                               ? "bg-red-100 text-red-600"
//                               : "bg-green-100 text-green-600"
//                           }`}
//                           onClick={() => toggleStatus(c)}
//                         >
//                           {active ? <FaUserSlash /> : <FaUserCheck />}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* View Modal */}
//       {showViewModal && (
//         <Modal title="Customer Details" onClose={() => setShowViewModal(null)}>
//           <Detail label="Name" value={showViewModal.name} />
//           <Detail label="Mobile" value={showViewModal.mobile} />
//           <Detail label="Address" value={showViewModal.address} />
//           <Detail label="Status" value={labelFromActive(isActive(showViewModal))} />
//           <div className="modal-actions">
//             <button className="btn btn-muted" onClick={() => setShowViewModal(null)}>
//               Close
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* Add Modal */}
//       {showAddModal && (
//         <Modal title="Add Customer" onClose={() => setShowAddModal(false)}>
//           <form onSubmit={onCreate} className="customer-form">
//             <div className="form-row">
//               <label>Name</label>
//               <input
//                 className="input"
//                 value={form.name}
//                 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                 required
//               />
//             </div>
//             <div className="form-row">
//               <label>Mobile</label>
//               <input
//                 className="input"
//                 value={form.mobile}
//                 onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
//                 required
//               />
//             </div>
//             <div className="form-row">
//               <label>Address</label>
//               <textarea
//                 className="input textarea"
//                 value={form.address}
//                 onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
//               />
//             </div>
//             <div className="modal-actions">
//               <button type="button" className="btn btn-muted" onClick={() => setShowAddModal(false)}>Cancel</button>
//               <button type="submit" className="btn btn-primary">Add Customer</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* ---------------- Small Components ---------------- */
// function Detail({ label, value }) {
//   return (
//     <div className="detail">
//       <span className="detail-label">{label}</span>
//       <span className="detail-value">{String(value ?? "-")}</span>
//     </div>
//   );
// }

// function Modal({ title, children, onClose }) {
//   return (
//     <div className="modal-overlay" onMouseDown={onClose}>
//       <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>{title}</h3>
//           <button className="icon-close" onClick={onClose}><FaTimes /></button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }



// // src/pages/AddCustomer.jsx
// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { FaPlus, FaEye, FaTimes, FaUserSlash, FaUserCheck } from "react-icons/fa";
// import "../styles/addCustomer.css";
// import { useAuth } from "../context/AuthContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// /* ---------------- Safe Fetch Helper ---------------- */
// async function safeFetch(url, options = {}, fallback = []) {
//   try {
//     const res = await axios(url, options);
//     if (Array.isArray(res.data)) return res.data;
//     if (res.data?.data) return res.data.data;
//     return res.data ?? fallback;
//   } catch (err) {
//     console.error("safeFetch failed:", err);
//     return fallback;
//   }
// }

// export default function AddCustomer() {
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(null);
//   const [toasts, setToasts] = useState([]);
//   const [form, setForm] = useState({ name: "", mobile: "", address: "" });

//   const { user } = useAuth(); // contains { role, shopname, shopId, ... }
//   const token = localStorage.getItem("token");

//   /* ---------------- Helpers ---------------- */
//   const pushToast = (msg) => {
//     const id = Date.now();
//     setToasts((t) => [...t, { id, msg }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
//   };

//   const getId = (c) => c?._id ?? c?.id;

//   const serverUsesIsActive = useMemo(
//     () => customers.some((c) => Object.prototype.hasOwnProperty.call(c, "isActive")),
//     [customers]
//   );
//   const serverUsesStatus = useMemo(
//     () => customers.some((c) => Object.prototype.hasOwnProperty.call(c, "status")),
//     [customers]
//   );
//   const isActive = (c) => {
//     if ("isActive" in c) return !!c.isActive;
//     const s = (c.status ?? "active").toString().toLowerCase();
//     return s !== "inactive";
//   };
//   const labelFromActive = (active) => (active ? "active" : "inactive");

//   const payloadForActive = (cust, nextActive) => {
//     if (serverUsesIsActive) return { isActive: nextActive };
//     if (serverUsesStatus) return { status: nextActive ? "active" : "inactive" };
//     return { status: nextActive ? "active" : "inactive" };
//   };

//   const pickUpdatedFromResponse = (resData) =>
//     resData?.data ?? resData?.customer ?? resData;

//   /* ---------------- URL Builder ---------------- */
//   const buildUrl = (path = "") => {
//     if (user?.role === "manager" || user?.role === "megaadmin") {
//       // master API (needs shopId)
//       const shopId = user?.shopId || localStorage.getItem("shopId");
//       return `${API}/api/tenant/shops/${shopId}/customers${path}`;
//     } else {
//       // tenant API (uses x-shopname)
//       return `${API}/api/customers${path}`;
//     }
//   };

//   const buildHeaders = () => {
//     const h = { Authorization: `Bearer ${token}` };
//     if (user?.role === "user") {
//       h["x-shopname"] = user?.shopname || localStorage.getItem("shopname");
//     }
//     return h;
//   };

//   /* ---------------- Load Customers ---------------- */
//   useEffect(() => {
//     const load = async () => {
//       const url = buildUrl();
//       const headers = buildHeaders();
//       const list = await safeFetch(url, { headers }, []);
//       setCustomers(list);
//     };
//     load();
//   }, [user]);

//   const filtered = useMemo(() => {
//     const s = search.trim().toLowerCase();
//     if (!s) return customers;
//     return customers.filter((c) => {
//       const name = (c.name ?? "").toString().toLowerCase();
//       const mobile = (c.mobile ?? "").toString().toLowerCase();
//       return name.includes(s) || mobile.includes(s);
//     });
//   }, [search, customers]);

//   /* ---------------- Create Customer ---------------- */
//   const onCreate = async (e) => {
//     e.preventDefault();
//     try {
//       const url = buildUrl();
//       const headers = buildHeaders();

//       const res = await axios.post(url, form, { headers });
//       const created = pickUpdatedFromResponse(res.data);

//       const withUiStatus = {
//         ...created,
//         ...(Object.prototype.hasOwnProperty.call(created, "isActive")
//           ? {}
//           : Object.prototype.hasOwnProperty.call(created, "status")
//           ? {}
//           : { status: "active" }),
//       };

//       setCustomers((prev) => [withUiStatus, ...prev]);
//       pushToast(`Customer ${created?.name ?? ""} added`);
//       setShowAddModal(false);
//     } catch (err) {
//       console.error("POST create failed:", err);
//       pushToast("Failed to add customer");
//     }
//   };

//   /* ---------------- Toggle Status ---------------- */
//   const toggleStatus = async (cust) => {
//     const id = getId(cust);
//     if (!id) return pushToast("Cannot update: missing id");

//     const wasActive = isActive(cust);
//     const nextActive = !wasActive;
//     const optimistic = payloadForActive(cust, nextActive);

//     // optimistic UI
//     setCustomers((prev) =>
//       prev.map((c) =>
//         getId(c) === id
//           ? {
//               ...c,
//               ...optimistic,
//               isActive: "isActive" in c ? nextActive : c.isActive,
//               status:
//                 "status" in c
//                   ? labelFromActive(nextActive)
//                   : c.status ?? labelFromActive(nextActive),
//             }
//           : c
//       )
//     );

//     try {
//       const url = buildUrl(`/${id}/status`);
//       const headers = buildHeaders();
//       const res = await axios.patch(url, optimistic, { headers });

//       const updated = pickUpdatedFromResponse(res.data);
//       if (updated) {
//         setCustomers((prev) =>
//           prev.map((c) => (getId(c) === id ? { ...c, ...updated } : c))
//         );
//       }
//       pushToast(`Customer ${cust.name} is now ${labelFromActive(nextActive)}`);
//     } catch (err) {
//       console.error("Update status failed:", err);
//       // revert
//       setCustomers((prev) =>
//         prev.map((c) =>
//           getId(c) === id
//             ? {
//                 ...c,
//                 ...payloadForActive(c, wasActive),
//                 isActive: "isActive" in c ? wasActive : c.isActive,
//                 status:
//                   "status" in c
//                     ? labelFromActive(wasActive)
//                     : c.status ?? labelFromActive(wasActive),
//               }
//             : c
//         )
//       );
//       pushToast("Failed to update status");
//     }
//   };

//   /* ---------------- Render ---------------- */
//   return (
//     <div className="customers-page">
//       {/* Toasts */}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className="toast">{t.msg}</div>
//         ))}
//       </div>

//       {/* Header */}
//       <div className="customers-header">
//         <h1 className="title">Add Customer</h1>
//         <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
//           <FaPlus /> Add Customer
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="customers-toolbar">
//         <input
//           className="input"
//           placeholder="Search by name or mobile"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Table */}
//       <div className="card table-card overflow-x-auto shadow-lg rounded-lg bg-white p-4">
//         <div className="table-responsive w-full">
//           <table className="table-auto w-full min-w-[600px] border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-left">S.No</th>
//                 <th className="px-4 py-2 text-left">Name</th>
//                 <th className="px-4 py-2 text-left">Mobile</th>
//                 <th className="px-4 py-2 text-left">Status</th>
//                 <th className="px-4 py-2 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="text-gray-400 text-center py-4">
//                     No customers found
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((c, idx) => {
//                   const active = isActive(c);
//                   return (
//                     <tr key={getId(c)} className="hover:bg-gray-50">
//                       <td className="px-4 py-2">{idx + 1}</td>
//                       <td className="px-4 py-2">{c.name}</td>
//                       <td className="px-4 py-2">{c.mobile}</td>
//                       <td
//                         className={`px-4 py-2 font-semibold ${
//                           active ? "text-green-600" : "text-red-600"
//                         }`}
//                       >
//                         {labelFromActive(active)}
//                       </td>
//                       <td className="px-4 py-2 text-center space-x-2">
//                         <button
//                           className="icon-btn view p-2"
//                           onClick={() => setShowViewModal(c)}
//                         >
//                           <FaEye />
//                         </button>
//                         <button
//                           className={`icon-btn p-2 ${
//                             active
//                               ? "bg-red-100 text-red-600"
//                               : "bg-green-100 text-green-600"
//                           }`}
//                           onClick={() => toggleStatus(c)}
//                         >
//                           {active ? <FaUserSlash /> : <FaUserCheck />}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* View Modal */}
//       {showViewModal && (
//         <Modal title="Customer Details" onClose={() => setShowViewModal(null)}>
//           <Detail label="Name" value={showViewModal.name} />
//           <Detail label="Mobile" value={showViewModal.mobile} />
//           <Detail label="Address" value={showViewModal.address} />
//           <Detail label="Status" value={labelFromActive(isActive(showViewModal))} />
//           <div className="modal-actions">
//             <button className="btn btn-muted" onClick={() => setShowViewModal(null)}>
//               Close
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* Add Modal */}
//       {showAddModal && (
//         <Modal title="Add Customer" onClose={() => setShowAddModal(false)}>
//           <form onSubmit={onCreate} className="customer-form">
//             <div className="form-row">
//               <label>Name</label>
//               <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
//             </div>
//             <div className="form-row">
//               <label>Mobile</label>
//               <input className="input" value={form.mobile} onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))} required />
//             </div>
//             <div className="form-row">
//               <label>Address</label>
//               <textarea className="input textarea" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
//             </div>
//             <div className="modal-actions">
//               <button type="button" className="btn btn-muted" onClick={() => setShowAddModal(false)}>Cancel</button>
//               <button type="submit" className="btn btn-primary">Add Customer</button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }

// /* ---------------- Small Components ---------------- */
// function Detail({ label, value }) {
//   return (
//     <div className="detail">
//       <span className="detail-label">{label}</span>
//       <span className="detail-value">{String(value ?? "-")}</span>
//     </div>
//   );
// }

// function Modal({ title, children, onClose }) {
//   return (
//     <div className="modal-overlay" onMouseDown={onClose}>
//       <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>{title}</h3>
//           <button className="icon-close" onClick={onClose}><FaTimes /></button>
//         </div>
//         <div className="modal-body">{children}</div>
//       </div>
//     </div>
//   );
// }
