
// src/pages/master/sidebar/MasterAddCustomer.jsx
import { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaTimes, FaUserSlash, FaUserCheck } from "react-icons/fa";
import "../../../styles/addCustomer.css";
import { useAuth } from "../../../context/AuthContext";
import { ShopContext } from "../../../context/ShopContext";
import Pagination from "../../../components/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MasterAddCustomer() {
  const { selectedShop } = useContext(ShopContext);
  const { user } = useAuth(); // master user
  const shopId = selectedShop?._id;

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


  /* ---------- Toast helper ---------- */
  const pushToast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };

  /* ---------- Headers for master access ---------- */
  const buildHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "x-shop-id": shopId || "",
      "x-shop-name": selectedShop?.shopname ? encodeURIComponent(selectedShop.shopname) : "",
    };
  };

  /* ---------- API URL ---------- */
  const CUSTOMERS_API = shopId
    ? `${API}/api/tenant/shops/${encodeURIComponent(selectedShop.shopname)}/customers`
    : null;

  /* ---------- Fetch Customers ---------- */
  const fetchCustomers = async (p = 1) => {
    if (!CUSTOMERS_API) return;
    try {
      const { data } = await axios.get(CUSTOMERS_API, {
        headers: buildHeaders(),
        params: { page: p, limit: 10, search, status },
      });
      setCustomers(data.customers || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("fetchCustomers:", err);
      pushToast(err?.response?.data?.message || "Failed to fetch customers");
    }
  };

  useEffect(() => {
    if (shopId) fetchCustomers(1);
  }, [shopId, search, status]);


  /* ---------- Helpers ---------- */
  const getId = (c) => c?._id ?? c?.id;
  const isActive = (c) => {
    if ("isActive" in c) return !!c.isActive;
    const s = (c.status ?? "active").toLowerCase();
    return s !== "inactive";
  };
  // const labelFromActive = (active) => (active ? "active" : "inactive");
  const labelFromActive = (active) => (active ? "ACTIVE" : "INACTIVE");

  const payloadForActive = (cust, nextActive) => ({
    status: nextActive ? "active" : "inactive",
  });

  const pickUpdatedFromResponse = (resData) => resData?.data ?? resData?.customer ?? resData;

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
    if (!CUSTOMERS_API) return pushToast("No shop selected");

    try {
      const res = await axios.post(CUSTOMERS_API, form, { headers: buildHeaders() });
      const created = pickUpdatedFromResponse(res.data);
      setCustomers((prev) => [created, ...prev]);
      pushToast(`Customer ${created?.name ?? ""} added`);
      setForm({ name: "", mobile: "", address: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("POST create failed:", err);
      pushToast(err?.response?.data?.message || "Failed to add customer");
    }
  };

  /* ---------- Toggle Status ---------- */
  const toggleStatus = async (cust) => {
    const id = getId(cust);
    if (!id) return pushToast("Cannot update: missing id");

    const nextActive = !isActive(cust);

    // Optimistic UI
    setCustomers((prev) =>
      prev.map((c) =>
        getId(c) === id
          ? { ...c, status: nextActive ? "active" : "inactive" }
          : c
      )
    );

    try {
      const url = `${CUSTOMERS_API}/${id}/status`;
      const res = await axios.patch(url, payloadForActive(cust, nextActive), { headers: buildHeaders() });
      const updated = pickUpdatedFromResponse(res.data);
      if (updated) {
        setCustomers((prev) =>
          prev.map((c) => (getId(c) === id ? { ...c, ...updated } : c))
        );
      }
      pushToast(`Customer ${cust.name} is now ${labelFromActive(nextActive)}`);
    } catch (err) {
      console.error("Update status failed:", err);
      // Revert UI
      setCustomers((prev) =>
        prev.map((c) =>
          getId(c) === id ? { ...c, status: isActive(cust) ? "active" : "inactive" } : c
        )
      );
      pushToast(err?.response?.data?.message || "Failed to update status");
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="customers-page p-8">
      {/* Toasts */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      {/* Header */}
      <div className="customers-header">
        <h1 className="title">Customers</h1>
        {/* <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Customer
        </button> */}
      </div>

      {/* Search */}
      {/* <div className="customers-toolbar">
        <input
          className="input"
          placeholder="Search by name or mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}

      <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
  {/* Left: Name / Mobile Search */}
  <div className="flex min-w-[330px] h-8">
    <input
      type="text"
      placeholder="Search by Customer Name or Mobile No"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full text-sm border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition placeholder-gray-400"
    />
  </div>

  {/* Right: Status Filter */}
  <div className="flex min-w-[80px] h-8">
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="w-full text-sm border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
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
</div>

      {/* Table */}
      <div className="card table-card overflow-x-auto shadow-lg rounded-lg bg-white p-4">
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
                      <button className="icon-btn view p-2" onClick={() => setShowViewModal(c)}>
                        <FaEye title="View"/>
                      </button>
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
              <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            {/* <div className="form-row">
              <label>Mobile</label>
              <input className="input" value={form.mobile} onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))} required />
            </div> */}

            <div className="form-row">
  <label>Mobile</label>
  <input
    className="input"
    value={form.mobile}
    onChange={(e) => {
      let value = e.target.value.replace(/\D/g, ""); // remove non-numeric
      if (value.length > 10) value = value.slice(0, 10); // limit to 10 digits
      setForm(f => ({ ...f, mobile: value }));
    }}
    required
  />
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

/* ---------- Small Components ---------- */
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
