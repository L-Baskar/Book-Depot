

// src/pages/master/sidebar/MasterSalesBill.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback, useContext } from "react";
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
import axios from "axios";
import "../../../styles/salesbill.css";
import { useAuth } from "../../../context/AuthContext";
import { ShopContext } from "../../../context/ShopContext";
import Pagination from "../../../components/Pagination";
import { useParams } from "react-router-dom";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const axiosInstance = axios.create({ baseURL: API_BASE });

export default function MasterSalesBill() {
  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);
  const { shopId } = useParams();



  // Master token from localStorage (user must be master)
  const token = localStorage.getItem("token");
  const shopname = selectedShop?.shopname || "";

  // State
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([createEmptyRow()]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ billNo: "", date: "", counter: 1, customerName: "", mobile: "" });
  const [totals, setTotals] = useState({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
  const [reservedStock, setReservedStock] = useState({});
  const [popup, setPopup] = useState({ message: "", type: "" });
  const [showModal, setShowModal] = useState(false);
  const [billEditMode, setBillEditMode] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [nameSuggestions, setNameSuggestions] = useState({});
  const [codeSuggestions, setCodeSuggestions] = useState({});
  const [batchesByRow, setBatchesByRow] = useState({});
  const [showBatchList, setShowBatchList] = useState({});
  const [showNameList, setShowNameList] = useState({});
  const [showCodeList, setShowCodeList] = useState({});
  const [stockErrors, setStockErrors] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewBill, setViewBill] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [billNo, setBillNo] = useState("");
  const [originalBillItems, setOriginalBillItems] = useState({}); // store original items for editing
  const debounceRef = useRef({});


const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);


const limit = 10; // items per page

  // Helpers
  function createEmptyRow() {
    return { id: Date.now() + Math.random(), code: "", name: "", batch: "", mrp: 0, rate: 0, qty: 0, gst: 0, amount: 0, value: 0, isNew: true };
  }
  const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

  const getAuthHeaders = () => {
    const headers = {
      Authorization: token ? `Bearer ${token}` : "",
      "x-shop-id": selectedShop?._id || "",
      "x-shop-name": shopname ? encodeURIComponent(shopname) : "",
    };
    return headers;
  };

  const debounce = useCallback((key, fn, delay = 250) => (...args) => {
    clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(() => fn(...args), delay);
  }, []);

  const showPopup = (message, type = "error") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 2500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // Fetch product list (tenant products endpoint) and bills (tenant sales-bills)
  const tenantProductsApi = shopname ? `/api/tenant/shops/${encodeURIComponent(shopname)}/products` : null;
  const tenantBillsApi = shopname ? `/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills` : null;

  const fetchProducts = async () => {
    if (!tenantProductsApi) return;
    try {
      const { data } = await axiosInstance.get(tenantProductsApi, { headers: getAuthHeaders() });
      // Normalize product fields
      setProducts((data?.products ?? data ?? []).map(p => ({
        ...p,
        code: p.code || "",
        name: p.name || "",
        batchNo: p.batchNo || p.batch || "",
        mrp: Number(p.mrp ?? p.price ?? 0),
        salePrice: Number(p.salePrice ?? p.rate ?? 0),
        gst: Number(p.taxPercent ?? p.gst ?? 0),
        qty: Number(p.qty ?? 0),
        minQty: Number(p.minQty ?? 0),
        _id: p._id || p.id || null
      })));
    } catch (err) {
      console.error("Error fetching tenant products:", err);
    }
  };


  // Fetch shop if route has shopId and selectedShop is missing or different
  useEffect(() => {
    if (shopId && (!selectedShop || selectedShop._id !== shopId)) {
      axiosInstance
        .get(`${API_BASE}/api/shops/${shopId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        })
        .then(res => setSelectedShop(res.data.shop))
        .catch(err => console.error("Failed to fetch shop:", err));
    }
  }, [shopId, selectedShop, token]);

  // Fetch products, bills, and next bill number whenever shopname changes
  useEffect(() => {
    if (shopname && token) {
      fetchProducts();
      fetchBillNo();
      fetchBills();
    }

    // Reset UI when shop changes
    setRows([createEmptyRow()]);
    setShowModal(false);
    setBillEditMode(false);
    setEditingBillId(null);
  }, [shopname, token]);

const fetchBills = async (pageNumber = 1) => {
  if (!tenantBillsApi) return;
  setLoading(true);

  try {
    const token =
      localStorage.getItem("tenantToken") ||
      localStorage.getItem("masterToken") ||
      localStorage.getItem("token");

    const params = new URLSearchParams({
      page: pageNumber,
      limit,
      search,
      filter,
      fromDate,
      toDate,
    });

    const { data } = await axiosInstance.get(`${tenantBillsApi}?${params.toString()}`, {
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
    });

    setBills(Array.isArray(data.salesBills) ? data.salesBills : []);
    setPage(data.page || pageNumber);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    console.error("Error fetching bills:", err);
    setBills([]);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBills(1);
}, [tenantBillsApi, search, filter, fromDate, toDate]);

  const fetchBillNo = async () => {
    if (!shopname) return;
    try {
      const resp = await axiosInstance.get(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills/next-billno`, { headers: getAuthHeaders() });
      const next = resp.data?.nextBillNo ?? "";

      const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
      setMeta(prev => ({ ...prev, billNo: next, date: istDate.toISOString().split("T")[0] }));
    } catch (err) {
      console.error("Failed to fetch next bill no:", err);
    }
  };

  

  useEffect(() => {
    if (shopname && token) {
      fetchProducts();
      fetchBillNo();
      fetchBills();
    }
    // reset UI when shop changes
    setRows([createEmptyRow()]);
    setShowModal(false);
    setBillEditMode(false);
    setEditingBillId(null);
  }, [shopname, token]);



  // Stock & totals helpers
  const getAvailableStock = (code, batch) => {
    const base = products
      .filter(p => (p.code || "").toLowerCase() === (code || "").toLowerCase() && ((p.batchNo || "").toLowerCase() === (batch || "").toLowerCase()))
      .reduce((sum, p) => sum + Number(p.qty || 0), 0);
    const reserved = Number(reservedStock[keyFor(code, batch)] || 0);
    return Math.max(0, base - reserved);
  };

  const recalcRow = (r) => {
    const rate = Number(r.rate || 0);
    const qty = Number(r.qty || 0);
    const gst = Number(r.gst || 0);
    const amount = +(rate * qty).toFixed(2);
    const value = +(amount + (amount * gst / 100)).toFixed(2);
    return { ...r, amount, value };
  };

  useEffect(() => {
    const total = rows.filter(r => !r.isNew).reduce((s, r) => s + Number(r.amount || 0), 0);
    const gstTotal = rows.filter(r => !r.isNew).reduce((s, r) => s + (Number(r.amount || 0) * Number(r.gst || 0) / 100), 0);
    const discount = Number(totals.discount || 0);
    const netAmount = +(total + gstTotal - discount).toFixed(2);
    const cashGiven = Number(totals.cashGiven || 0);
    const balance = +(cashGiven >= netAmount ? cashGiven - netAmount : netAmount - cashGiven).toFixed(2);
    const cgst = +(gstTotal / 2).toFixed(2);
    const sgst = +(gstTotal / 2).toFixed(2);
    setTotals(prev => ({ ...prev, total, discount, netAmount, balance, cashGiven, cgst, sgst }));
  }, [rows, totals.discount, totals.cashGiven]);

  // Suggestions helpers
  const suggestNamesDebounced = debounce("name", (rowId, query) => {
    if (!query) return setNameSuggestions(s => ({ ...s, [rowId]: [] }));
    const matches = products.filter(p => (p.name || "").toLowerCase().includes(query.toLowerCase()));
    setNameSuggestions(s => ({ ...s, [rowId]: matches }));
  }, 200);

  const suggestCodesDebounced = debounce("code", (rowId, query) => {
    if (!query) return setCodeSuggestions(s => ({ ...s, [rowId]: [] }));
    const matches = products.filter(p => (p.code || "").toLowerCase().includes(query.toLowerCase()));
    setCodeSuggestions(s => ({ ...s, [rowId]: matches }));
  }, 200);

  const handleSelectSuggestion = (rowId, product) => {
    setRows(prev => prev.map(r => r.id === rowId ? recalcRow({
      ...r,
      code: product.code,
      name: product.name,
      batch: "",
      mrp: Number(product.mrp || 0),
      rate: Number(product.salePrice || product.rate || 0),
      gst: Number(product.gst || product.taxPercent || 0),
      qty: 0
    }) : r));
    setShowCodeList(prev => ({ ...prev, [rowId]: false }));
    setShowNameList(prev => ({ ...prev, [rowId]: false }));
    const batches = getBatchesForCode(product.code);
    setBatchesByRow(prev => ({ ...prev, [rowId]: batches }));
    setShowBatchList(prev => ({ ...prev, [rowId]: batches.length > 0 }));
  };

  const getBatchesForCode = (code) => {
    return products.filter(p => (p.code || "").toLowerCase() === (code || "").toLowerCase()).map(p => ({
      code: p.code,
      batchNo: p.batchNo || p.batch || "",
      mrp: Number(p.mrp || 0),
      salePrice: Number(p.salePrice || p.rate || 0),
      gst: Number(p.gst || p.taxPercent || 0),
      qty: Number(p.qty || 0),
    }));
  };

  const getBatchesForName = (name) => {
    return products.filter(p => (p.name || "").toLowerCase() === (name || "").toLowerCase()).map(p => ({
      code: p.code,
      batchNo: p.batchNo || p.batch || "",
      mrp: Number(p.mrp || 0),
      salePrice: Number(p.salePrice || p.rate || 0),
      gst: Number(p.gst || p.taxPercent || 0),
      qty: Number(p.qty || 0),
    }));
  };

  const handleBatchPick = (rowId, batch) => {
    setRows(prev => prev.map(r => r.id === rowId ? recalcRow({
      ...r,
      batch: batch.batchNo || "",
      mrp: Number(batch.mrp || 0),
      rate: Number(batch.salePrice || 0),
      gst: Number(batch.gst || 0),
      qty: 0
    }) : r));
    setShowBatchList(prev => ({ ...prev, [rowId]: false }));
  };

  // Row operations
  const addRow = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return showPopup("Row not found");
    if (!row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
    const available = getAvailableStock(row.code, row.batch);
    if (available < Number(row.qty)) return showPopup(`Only ${available} left`);
    const k = keyFor(row.code, row.batch);
    setReservedStock(rs => ({ ...rs, [k]: (rs[k] || 0) + Number(row.qty) }));
    setRows(prev => prev.map(r => r.id === id ? { ...r, isNew: false } : r).concat(createEmptyRow()));
  };

  const deleteRow = (id) => {
    const row = rows.find(r => r.id === id);
    if (row && !row.isNew) {
      const k = keyFor(row.code, row.batch);
      setReservedStock(rs => ({ ...rs, [k]: Math.max(0, (rs[k] || 0) - Number(row.qty)) }));
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id, field, value, skipRecalc = false) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      let val = value;
      if (["mrp", "rate", "gst", "qty"].includes(field)) val = Number(value) || 0;
      const updated = { ...r, [field]: val };
      if (field === "code" && !val) {
        updated.name = "";
      }
      if (field === "name" && !val) {
        updated.code = "";
      }
      return skipRecalc ? updated : recalcRow(updated);
    }));
  };

  const saveRowEdit = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    if (!row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
    const available = getAvailableStock(row.code, row.batch);
    if (row.qty > available) return showPopup(`Only ${available} left`);
    const k = keyFor(row.code, row.batch);
    setReservedStock(rs => ({ ...rs, [k]: (rs[k] || 0) + Number(row.qty) }));
    setEditRowId(null);
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, isNew: false } : r));
  };

  // Utilities for stock adjustment when editing existing bill
  // returns map key->qty
  const itemsToMap = (items = []) => {
    const m = {};
    (items || []).forEach(it => {
      const k = keyFor(it.code, it.batch || it.batchNo || "");
      m[k] = (m[k] || 0) + Number(it.qty || 0);
    });
    return m;
  };

  // Adjust stock based on delta maps
  // Positive delta => need to decrement more stock (reduce inventory)
  // Negative delta => need to increment stock (give back inventory)
  const adjustStockByDeltas = async (deltaMap) => {
    // Build arrays for decrement and increment endpoints
    const toDecrement = [];
    const toIncrement = [];
    for (const k of Object.keys(deltaMap)) {
      const [code, batch] = k.split("|");
      const delta = deltaMap[k];
      if (delta > 0) toDecrement.push({ code, batchNo: batch || "", qty: delta });
      else if (delta < 0) toIncrement.push({ code, batchNo: batch || "", qty: Math.abs(delta) });
    }

    // call tenant increment/decrement endpoints if arrays not empty
    try {
      if (toDecrement.length) {
        // endpoint: PUT /api/tenant/shops/:shopname/products/decrement-stock
        await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/decrement-stock`, { items: toDecrement }, { headers: getAuthHeaders() });
      }
      if (toIncrement.length) {
        // endpoint: PUT /api/tenant/shops/:shopname/products/increment-stock
        await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/increment-stock`, { items: toIncrement }, { headers: getAuthHeaders() });
      }
    } catch (err) {
      console.error("Error adjusting stock for edit:", err);
      throw err;
    }
  };

  // Save / Print (handles both create and edit)
  const handleSaveAndPrint = async () => {
    try {
      if (!rows || rows.length === 0) { setErrorMsg("Add items before saving."); return; }

      // Build items only (exclude blank rows)
      const items = rows.filter(r => r.code && r.batch && Number(r.qty) > 0).map(r => ({
        code: r.code,
        name: r.name,
        batch: r.batch,
        mrp: Number(r.mrp || 0),
        rate: Number(r.rate || 0),
        gst: Number(r.gst || 0),
        qty: Number(r.qty || 0),
        amount: Number(r.amount || 0),
        value: Number(r.value || 0),
      }));

      if (!items.length) { setErrorMsg("No valid items to save."); return; }

      // Prepare payload (include top-level customerName & mobile so model can save)
      const payload = {
        meta,
        customerName: meta.customerName || meta.customer || "",
        mobile: meta.mobile || "",
        items,
        totals
      };

      if (!billEditMode) {
        // NEW bill:
        // Decrement stock for all items first
        const decItems = items.map(it => ({ code: it.code, batchNo: it.batch, qty: Number(it.qty) }));
        await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/decrement-stock`, { items: decItems }, { headers: getAuthHeaders() });

        // Save sales bill
        const { data: saved } = await axiosInstance.post(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills`, payload, { headers: getAuthHeaders() });

        // add saved to list and show
        setBills(prev => [saved, ...prev]);
        setViewBill(saved);

        // clean up
        setShowModal(false);
        setRows([createEmptyRow()]);
        setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
        setMeta(prev => ({ ...prev, customerName: "", mobile: "" }));

      } else {
        // EDIT existing bill: compute deltas between originalBillItems and items
        const oldMap = itemsToMap(originalBillItems[editingBillId] || []);
        const newMap = itemsToMap(items);
        const deltaMap = {};
        const keys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
        keys.forEach(k => {
          const oldQty = oldMap[k] || 0;
          const newQty = newMap[k] || 0;
          const delta = newQty - oldQty;
          if (delta !== 0) deltaMap[k] = delta;
        });

        // Apply stock adjustments for deltas (decrement for positive, increment for negative)
        await adjustStockByDeltas(deltaMap);

        // Now update the sales-bill (PUT)
        const { data: updated } = await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills/${editingBillId}`, payload, { headers: getAuthHeaders() });

        // Update bill in UI (replace)
        setBills(prev => prev.map(b => b._id === editingBillId ? updated : b));
        setViewBill(updated);

        // cleanup
        setShowModal(false);
        setBillEditMode(false);
        setEditingBillId(null);
        setRows([createEmptyRow()]);
      }

    } catch (err) {
      console.error("Save/Print error:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to save/print");
    }
  };

  const handleEditBill = (bill) => {
    // map bill items to rows
    const mappedRows = (bill.items || []).map(it => ({
      id: Date.now() + Math.random(),
      code: it.code,
      name: it.name,
      batch: it.batch || it.batchNo || "",
      mrp: Number(it.mrp || 0),
      rate: Number(it.rate || 0),
      gst: Number(it.gst || 0),
      qty: Number(it.qty || 0),
      amount: Number(it.amount || 0),
      value: Number(it.value || 0),
      isNew: false
    }));

    setRows(mappedRows.length ? mappedRows : [createEmptyRow()]);
    setBillEditMode(true);
    setEditingBillId(bill._id);
    // store original items for delta computations
    setOriginalBillItems(prev => ({ ...prev, [bill._id]: bill.items || [] }));

    // set meta & totals to existing
    setMeta({
      billNo: bill.billNo || "",
      date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
      counter: bill.counter || 1,
      customerName: bill.customerName || bill.meta?.customerName || "",
      mobile: bill.mobile || bill.meta?.mobile || ""
    });

    setTotals({
      total: bill.total || bill.totals?.total || 0,
      discount: bill.discount || bill.totals?.discount || 0,
      netAmount: bill.netAmount || bill.totals?.netAmount || 0,
      cashGiven: bill.cashGiven || bill.totals?.cashGiven || 0,
      balance: bill.balance || bill.totals?.balance || 0,
      cgst: bill.cgst || bill.totals?.cgst || 0,
      sgst: bill.sgst || bill.totals?.sgst || 0,
    });

    setShowModal(true);
  };

  const handleViewBill = (bill) => {
    setViewBill(bill);
  };

  const deleteBill = async (id) => {
    try {
      // When deleting, ideally we should return stock back (increment) for items in bill.
      // Let's perform increment-stock for items first then delete bill.
      const bill = bills.find(b => b._id === id);
      if (!bill) {
        showPopup("Bill not found");
        return;
      }
      const incItems = (bill.items || []).map(it => ({ code: it.code, batchNo: it.batch || it.batchNo || "", qty: Number(it.qty || 0) }));
      if (incItems.length) {
        await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/increment-stock`, { items: incItems }, { headers: getAuthHeaders() });
      }
      await axiosInstance.delete(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills/${id}`, { headers: getAuthHeaders() });
      setBills(prev => prev.filter(b => b._id !== id));
      showPopup("Bill deleted", "success");
    } catch (err) {
      console.error("Failed to delete bill:", err);
      showPopup("Failed to delete bill", "error");
    }
  };

  const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

  const filteredBills = useMemo(() => {
    if (!bills) return [];
    const term = (search || "").toLowerCase();
    return bills.filter(b => {
      const name = (b.customerName || b.meta?.customerName || "").toString().toLowerCase();
      const mobile = (b.mobile || b.meta?.mobile || "").toString().toLowerCase();
      const billno = (b.billNo || "").toString().toLowerCase();
      return name.includes(term) || mobile.includes(term) || billno.includes(term);
    });
  }, [bills, search]);

  // Render
  return (
    <div className="salesbill-container">
      {popup.message && <div className={`popup-message ${popup.type}`}>{popup.message}</div>}

      <div className="salesbill-header">
        <div><h1 className="salesbill-title">Sales Bill</h1></div>
        {/* <button className="add-btn" onClick={() => { setBillEditMode(false); setEditingBillId(null); setRows([createEmptyRow()]); setShowModal(true); }}>
          <FaPlus /> Add Sales
        </button> */}
      </div>



<div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
  {/* Left: Search Box */}
  <div className="flex min-w-[360px]">
    <input
      type="text"
      placeholder="Search Bill No / Customer Name / Mobile No"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-[200px] h-8 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition placeholder-gray-400"
    />
  </div>

  {/* Middle: Filter */}
  <div className="flex items-center gap-2 min-w-[100px]">
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="w-[100px] h-8 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
    >
      <option value="">All</option>
      <option value="today">Today</option>
      <option value="this-week">This Week</option>
      <option value="this-month">This Month</option>
      <option value="custom">Custom Date</option>
    </select>

    {filter === "custom" && (
      <div className="flex gap-1 animate-fadeIn">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-[100px] h-8 text-sm border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
        />
        <span className="self-center text-sm">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-[100px] h-8 text-sm border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
        />
      </div>
    )}
  </div>


</div>



  
      <div className="salesbill-table-wrapper">
        {loading ? <p className="muted">Loading…</p> :
          filteredBills.length === 0 ? <p className="muted">No records found</p> :
    

            <div className="salesbill-table-wrapper">
  {loading ? (
    <p className="muted">Loading…</p>
  ) : bills.length === 0 ? (
    <p className="muted">No records found</p>
  ) : (
    <>
      <table className="salesbill-table w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">S.No</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Bill No</th>
            <th className="border px-4 py-2">Customer</th>
            <th className="border px-4 py-2">Net Amount</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, i) => (
            <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
              <td className="border px-4 py-2">{(page - 1) * limit + i + 1}</td>
              <td className="border px-4 py-2">{formatDate(bill.date)}</td>
              <td className="border px-4 py-2">{bill.billNo}</td>
              <td className="border px-4 py-2">{bill.customerName || bill.meta?.customerName || ""}</td>
              <td className="border px-4 py-2 text-right">
                {Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => setViewBill(bill)}
                  className="px-2 text-[#00A76F] hover:text-[#007867]"
                >
                  <FaEye title="View Bill" />
                </button>
           
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={fetchBills} />
    </>
  )}
</div>

        }
      </div>

      {/* View Bill Modal */}
      {viewBill && (
        <div className="modal fade-in">
          <div className="modal-content slide-up square-80mm">
            <div className="modal-header">
              <h2>Bill Details</h2>
              <button className="icon-close" onClick={() => setViewBill(null)}>
                <FaTimes />
              </button>
            </div>
            <p><strong>Bill No:</strong> {viewBill.billNo}</p>
            <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
            <p>
              <strong>Customer:</strong> {viewBill.customerName || viewBill.meta?.customerName || ""} 
              ({viewBill.mobile || viewBill.meta?.mobile || ""})
            </p>
            <p>
              <strong>Net Amount:</strong> {viewBill.netAmount || viewBill.totals?.netAmount || 0}
            </p>
      
            <table className="salesbill-table clean full-width">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Batch</th>
                  <th>MRP</th>
                  <th>Rate</th>
                  <th>Qty</th>
                  <th>GST%</th>
                  <th>Amount</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {viewBill.items?.map((it, i) => (
                  <tr key={i}>
                    <td>{it.code}</td>
                    <td>{it.name}</td>
                    <td>{it.batch}</td>
                    <td>{it.mrp}</td>
                    <td>{it.rate}</td>
                    <td>{it.qty}</td>
                    <td>{it.gst}</td>
                    <td>{it.amount}</td>
                    <td>{it.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
      
          </div>
        </div>
      )}
    </div>
  );
}








// // src/pages/master/sidebar/MasterSalesBill.jsx
// import React, { useState, useEffect, useMemo, useRef, useCallback, useContext } from "react";
// import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../../../styles/salesbill.css";
// import { useAuth } from "../../../context/AuthContext";
// import { ShopContext } from "../../../context/ShopContext";
// import Pagination from "../../../components/Pagination";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const axiosInstance = axios.create({ baseURL: API_BASE });

// export default function MasterSalesBill() {
//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);

//   // Master token from localStorage (user must be master)
//   const token = localStorage.getItem("token");
//   const shopname = selectedShop?.shopname || "";

//   // State
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [rows, setRows] = useState([createEmptyRow()]);
//   const [products, setProducts] = useState([]);
//   const [meta, setMeta] = useState({ billNo: "", date: "", counter: 1, customerName: "", mobile: "" });
//   const [totals, setTotals] = useState({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
//   const [reservedStock, setReservedStock] = useState({});
//   const [popup, setPopup] = useState({ message: "", type: "" });
//   const [showModal, setShowModal] = useState(false);
//   const [billEditMode, setBillEditMode] = useState(false);
//   const [editingBillId, setEditingBillId] = useState(null);
//   const [nameSuggestions, setNameSuggestions] = useState({});
//   const [codeSuggestions, setCodeSuggestions] = useState({});
//   const [batchesByRow, setBatchesByRow] = useState({});
//   const [showBatchList, setShowBatchList] = useState({});
//   const [showNameList, setShowNameList] = useState({});
//   const [showCodeList, setShowCodeList] = useState({});
//   const [stockErrors, setStockErrors] = useState({});
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [viewBill, setViewBill] = useState(null);
//   const [editRowId, setEditRowId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [billNo, setBillNo] = useState("");
//   const [originalBillItems, setOriginalBillItems] = useState({}); // store original items for editing
//   const debounceRef = useRef({});


// const [page, setPage] = useState(1);
// const [totalPages, setTotalPages] = useState(1);


// const limit = 10; // items per page

//   // Helpers
//   function createEmptyRow() {
//     return { id: Date.now() + Math.random(), code: "", name: "", batch: "", mrp: 0, rate: 0, qty: 0, gst: 0, amount: 0, value: 0, isNew: true };
//   }
//   const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

//   const getAuthHeaders = () => {
//     const headers = {
//       Authorization: token ? `Bearer ${token}` : "",
//       "x-shop-id": selectedShop?._id || "",
//       "x-shop-name": shopname ? encodeURIComponent(shopname) : "",
//     };
//     return headers;
//   };

//   const debounce = useCallback((key, fn, delay = 250) => (...args) => {
//     clearTimeout(debounceRef.current[key]);
//     debounceRef.current[key] = setTimeout(() => fn(...args), delay);
//   }, []);

//   const showPopup = (message, type = "error") => {
//     setPopup({ message, type });
//     setTimeout(() => setPopup({ message: "", type: "" }), 2500);
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
//   };

//   // Fetch product list (tenant products endpoint) and bills (tenant sales-bills)
//   const tenantProductsApi = shopname ? `/api/tenant/shops/${encodeURIComponent(shopname)}/products` : null;
//   const tenantBillsApi = shopname ? `/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills` : null;

//   const fetchProducts = async () => {
//     if (!tenantProductsApi) return;
//     try {
//       const { data } = await axiosInstance.get(tenantProductsApi, { headers: getAuthHeaders() });
//       // Normalize product fields
//       setProducts((data?.products ?? data ?? []).map(p => ({
//         ...p,
//         code: p.code || "",
//         name: p.name || "",
//         batchNo: p.batchNo || p.batch || "",
//         mrp: Number(p.mrp ?? p.price ?? 0),
//         salePrice: Number(p.salePrice ?? p.rate ?? 0),
//         gst: Number(p.taxPercent ?? p.gst ?? 0),
//         qty: Number(p.qty ?? 0),
//         minQty: Number(p.minQty ?? 0),
//         _id: p._id || p.id || null
//       })));
//     } catch (err) {
//       console.error("Error fetching tenant products:", err);
//     }
//   };

//   // const fetchBills = async () => {
//   //   if (!tenantBillsApi) return;
//   //   try {
//   //     const { data } = await axiosInstance.get(tenantBillsApi, { headers: getAuthHeaders() });
//   //     // data might be { shop, salesBills } or an array — normalize:
//   //     const billsList = Array.isArray(data) ? data : (data?.salesBills ?? data);
//   //     setBills(billsList || []);
//   //   } catch (err) {
//   //     console.error("Error fetching bills:", err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   // server/routes/tenantSalesBillRoutes.js


// //   const fetchBills = async (pageNumber = 1) => {
// //   if (!tenantBillsApi) return;
// //   setLoading(true);

// //   try {
// //     const token =
// //       localStorage.getItem("tenantToken") ||
// //       localStorage.getItem("masterToken") ||
// //       localStorage.getItem("token");

// //     const endpoint = `${tenantBillsApi}?page=${pageNumber}&limit=${limit}`;

// //     const { data } = await axiosInstance.get(endpoint, {
// //       headers: { Authorization: token ? `Bearer ${token}` : undefined },
// //     });

// //     const billsList = Array.isArray(data)
// //       ? data
// //       : data?.salesBills ?? [];

// //     setBills(billsList || []);
// //     setPage(data.page || pageNumber);
// //     setTotalPages(data.totalPages || 1);
// //   } catch (err) {
// //     console.error("Error fetching bills:", err);
// //     setBills([]);
// //     setTotalPages(1);
// //   } finally {
// //     setLoading(false);
// //   }
// // };
// // useEffect(() => {
// //   fetchBills(1);
// // }, [tenantBillsApi]); 

// const fetchBills = async (pageNumber = 1) => {
//   if (!tenantBillsApi) return;
//   setLoading(true);

//   try {
//     const token =
//       localStorage.getItem("tenantToken") ||
//       localStorage.getItem("masterToken") ||
//       localStorage.getItem("token");

//     const params = new URLSearchParams({
//       page: pageNumber,
//       limit,
//       search,
//       filter,
//       fromDate,
//       toDate,
//     });

//     const { data } = await axiosInstance.get(`${tenantBillsApi}?${params.toString()}`, {
//       headers: { Authorization: token ? `Bearer ${token}` : undefined },
//     });

//     setBills(Array.isArray(data.salesBills) ? data.salesBills : []);
//     setPage(data.page || pageNumber);
//     setTotalPages(data.totalPages || 1);
//   } catch (err) {
//     console.error("Error fetching bills:", err);
//     setBills([]);
//     setTotalPages(1);
//   } finally {
//     setLoading(false);
//   }
// };

// useEffect(() => {
//   fetchBills(1);
// }, [tenantBillsApi, search, filter, fromDate, toDate]);

//   const fetchBillNo = async () => {
//     if (!shopname) return;
//     try {
//       const resp = await axiosInstance.get(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills/next-billno`, { headers: getAuthHeaders() });
//       const next = resp.data?.nextBillNo ?? "";

//       const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
//       setMeta(prev => ({ ...prev, billNo: next, date: istDate.toISOString().split("T")[0] }));
//     } catch (err) {
//       console.error("Failed to fetch next bill no:", err);
//     }
//   };

  

//   useEffect(() => {
//     if (shopname && token) {
//       fetchProducts();
//       fetchBillNo();
//       fetchBills();
//     }
//     // reset UI when shop changes
//     setRows([createEmptyRow()]);
//     setShowModal(false);
//     setBillEditMode(false);
//     setEditingBillId(null);
//   }, [shopname, token]);



//   // Stock & totals helpers
//   const getAvailableStock = (code, batch) => {
//     const base = products
//       .filter(p => (p.code || "").toLowerCase() === (code || "").toLowerCase() && ((p.batchNo || "").toLowerCase() === (batch || "").toLowerCase()))
//       .reduce((sum, p) => sum + Number(p.qty || 0), 0);
//     const reserved = Number(reservedStock[keyFor(code, batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   const recalcRow = (r) => {
//     const rate = Number(r.rate || 0);
//     const qty = Number(r.qty || 0);
//     const gst = Number(r.gst || 0);
//     const amount = +(rate * qty).toFixed(2);
//     const value = +(amount + (amount * gst / 100)).toFixed(2);
//     return { ...r, amount, value };
//   };

//   useEffect(() => {
//     const total = rows.filter(r => !r.isNew).reduce((s, r) => s + Number(r.amount || 0), 0);
//     const gstTotal = rows.filter(r => !r.isNew).reduce((s, r) => s + (Number(r.amount || 0) * Number(r.gst || 0) / 100), 0);
//     const discount = Number(totals.discount || 0);
//     const netAmount = +(total + gstTotal - discount).toFixed(2);
//     const cashGiven = Number(totals.cashGiven || 0);
//     const balance = +(cashGiven >= netAmount ? cashGiven - netAmount : netAmount - cashGiven).toFixed(2);
//     const cgst = +(gstTotal / 2).toFixed(2);
//     const sgst = +(gstTotal / 2).toFixed(2);
//     setTotals(prev => ({ ...prev, total, discount, netAmount, balance, cashGiven, cgst, sgst }));
//   }, [rows, totals.discount, totals.cashGiven]);

//   // Suggestions helpers
//   const suggestNamesDebounced = debounce("name", (rowId, query) => {
//     if (!query) return setNameSuggestions(s => ({ ...s, [rowId]: [] }));
//     const matches = products.filter(p => (p.name || "").toLowerCase().includes(query.toLowerCase()));
//     setNameSuggestions(s => ({ ...s, [rowId]: matches }));
//   }, 200);

//   const suggestCodesDebounced = debounce("code", (rowId, query) => {
//     if (!query) return setCodeSuggestions(s => ({ ...s, [rowId]: [] }));
//     const matches = products.filter(p => (p.code || "").toLowerCase().includes(query.toLowerCase()));
//     setCodeSuggestions(s => ({ ...s, [rowId]: matches }));
//   }, 200);

//   const handleSelectSuggestion = (rowId, product) => {
//     setRows(prev => prev.map(r => r.id === rowId ? recalcRow({
//       ...r,
//       code: product.code,
//       name: product.name,
//       batch: "",
//       mrp: Number(product.mrp || 0),
//       rate: Number(product.salePrice || product.rate || 0),
//       gst: Number(product.gst || product.taxPercent || 0),
//       qty: 0
//     }) : r));
//     setShowCodeList(prev => ({ ...prev, [rowId]: false }));
//     setShowNameList(prev => ({ ...prev, [rowId]: false }));
//     const batches = getBatchesForCode(product.code);
//     setBatchesByRow(prev => ({ ...prev, [rowId]: batches }));
//     setShowBatchList(prev => ({ ...prev, [rowId]: batches.length > 0 }));
//   };

//   const getBatchesForCode = (code) => {
//     return products.filter(p => (p.code || "").toLowerCase() === (code || "").toLowerCase()).map(p => ({
//       code: p.code,
//       batchNo: p.batchNo || p.batch || "",
//       mrp: Number(p.mrp || 0),
//       salePrice: Number(p.salePrice || p.rate || 0),
//       gst: Number(p.gst || p.taxPercent || 0),
//       qty: Number(p.qty || 0),
//     }));
//   };

//   const getBatchesForName = (name) => {
//     return products.filter(p => (p.name || "").toLowerCase() === (name || "").toLowerCase()).map(p => ({
//       code: p.code,
//       batchNo: p.batchNo || p.batch || "",
//       mrp: Number(p.mrp || 0),
//       salePrice: Number(p.salePrice || p.rate || 0),
//       gst: Number(p.gst || p.taxPercent || 0),
//       qty: Number(p.qty || 0),
//     }));
//   };

//   const handleBatchPick = (rowId, batch) => {
//     setRows(prev => prev.map(r => r.id === rowId ? recalcRow({
//       ...r,
//       batch: batch.batchNo || "",
//       mrp: Number(batch.mrp || 0),
//       rate: Number(batch.salePrice || 0),
//       gst: Number(batch.gst || 0),
//       qty: 0
//     }) : r));
//     setShowBatchList(prev => ({ ...prev, [rowId]: false }));
//   };

//   // Row operations
//   const addRow = (id) => {
//     const row = rows.find(r => r.id === id);
//     if (!row) return showPopup("Row not found");
//     if (!row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code, row.batch);
//     if (available < Number(row.qty)) return showPopup(`Only ${available} left`);
//     const k = keyFor(row.code, row.batch);
//     setReservedStock(rs => ({ ...rs, [k]: (rs[k] || 0) + Number(row.qty) }));
//     setRows(prev => prev.map(r => r.id === id ? { ...r, isNew: false } : r).concat(createEmptyRow()));
//   };

//   const deleteRow = (id) => {
//     const row = rows.find(r => r.id === id);
//     if (row && !row.isNew) {
//       const k = keyFor(row.code, row.batch);
//       setReservedStock(rs => ({ ...rs, [k]: Math.max(0, (rs[k] || 0) - Number(row.qty)) }));
//     }
//     setRows(prev => prev.filter(r => r.id !== id));
//   };

//   const updateRow = (id, field, value, skipRecalc = false) => {
//     setRows(prev => prev.map(r => {
//       if (r.id !== id) return r;
//       let val = value;
//       if (["mrp", "rate", "gst", "qty"].includes(field)) val = Number(value) || 0;
//       const updated = { ...r, [field]: val };
//       if (field === "code" && !val) {
//         updated.name = "";
//       }
//       if (field === "name" && !val) {
//         updated.code = "";
//       }
//       return skipRecalc ? updated : recalcRow(updated);
//     }));
//   };

//   const saveRowEdit = (rowId) => {
//     const row = rows.find(r => r.id === rowId);
//     if (!row) return;
//     if (!row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code, row.batch);
//     if (row.qty > available) return showPopup(`Only ${available} left`);
//     const k = keyFor(row.code, row.batch);
//     setReservedStock(rs => ({ ...rs, [k]: (rs[k] || 0) + Number(row.qty) }));
//     setEditRowId(null);
//     setRows(prev => prev.map(r => r.id === rowId ? { ...r, isNew: false } : r));
//   };

//   // Utilities for stock adjustment when editing existing bill
//   // returns map key->qty
//   const itemsToMap = (items = []) => {
//     const m = {};
//     (items || []).forEach(it => {
//       const k = keyFor(it.code, it.batch || it.batchNo || "");
//       m[k] = (m[k] || 0) + Number(it.qty || 0);
//     });
//     return m;
//   };

//   // Adjust stock based on delta maps
//   // Positive delta => need to decrement more stock (reduce inventory)
//   // Negative delta => need to increment stock (give back inventory)
//   const adjustStockByDeltas = async (deltaMap) => {
//     // Build arrays for decrement and increment endpoints
//     const toDecrement = [];
//     const toIncrement = [];
//     for (const k of Object.keys(deltaMap)) {
//       const [code, batch] = k.split("|");
//       const delta = deltaMap[k];
//       if (delta > 0) toDecrement.push({ code, batchNo: batch || "", qty: delta });
//       else if (delta < 0) toIncrement.push({ code, batchNo: batch || "", qty: Math.abs(delta) });
//     }

//     // call tenant increment/decrement endpoints if arrays not empty
//     try {
//       if (toDecrement.length) {
//         // endpoint: PUT /api/tenant/shops/:shopname/products/decrement-stock
//         await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/decrement-stock`, { items: toDecrement }, { headers: getAuthHeaders() });
//       }
//       if (toIncrement.length) {
//         // endpoint: PUT /api/tenant/shops/:shopname/products/increment-stock
//         await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/increment-stock`, { items: toIncrement }, { headers: getAuthHeaders() });
//       }
//     } catch (err) {
//       console.error("Error adjusting stock for edit:", err);
//       throw err;
//     }
//   };

//   // Save / Print (handles both create and edit)
//   const handleSaveAndPrint = async () => {
//     try {
//       if (!rows || rows.length === 0) { setErrorMsg("Add items before saving."); return; }

//       // Build items only (exclude blank rows)
//       const items = rows.filter(r => r.code && r.batch && Number(r.qty) > 0).map(r => ({
//         code: r.code,
//         name: r.name,
//         batch: r.batch,
//         mrp: Number(r.mrp || 0),
//         rate: Number(r.rate || 0),
//         gst: Number(r.gst || 0),
//         qty: Number(r.qty || 0),
//         amount: Number(r.amount || 0),
//         value: Number(r.value || 0),
//       }));

//       if (!items.length) { setErrorMsg("No valid items to save."); return; }

//       // Prepare payload (include top-level customerName & mobile so model can save)
//       const payload = {
//         meta,
//         customerName: meta.customerName || meta.customer || "",
//         mobile: meta.mobile || "",
//         items,
//         totals
//       };

//       if (!billEditMode) {
//         // NEW bill:
//         // Decrement stock for all items first
//         const decItems = items.map(it => ({ code: it.code, batchNo: it.batch, qty: Number(it.qty) }));
//         await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/decrement-stock`, { items: decItems }, { headers: getAuthHeaders() });

//         // Save sales bill
//         const { data: saved } = await axiosInstance.post(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills`, payload, { headers: getAuthHeaders() });

//         // add saved to list and show
//         setBills(prev => [saved, ...prev]);
//         setViewBill(saved);

//         // clean up
//         setShowModal(false);
//         setRows([createEmptyRow()]);
//         setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
//         setMeta(prev => ({ ...prev, customerName: "", mobile: "" }));

//       } else {
//         // EDIT existing bill: compute deltas between originalBillItems and items
//         const oldMap = itemsToMap(originalBillItems[editingBillId] || []);
//         const newMap = itemsToMap(items);
//         const deltaMap = {};
//         const keys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
//         keys.forEach(k => {
//           const oldQty = oldMap[k] || 0;
//           const newQty = newMap[k] || 0;
//           const delta = newQty - oldQty;
//           if (delta !== 0) deltaMap[k] = delta;
//         });

//         // Apply stock adjustments for deltas (decrement for positive, increment for negative)
//         await adjustStockByDeltas(deltaMap);

//         // Now update the sales-bill (PUT)
//         const { data: updated } = await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills/${editingBillId}`, payload, { headers: getAuthHeaders() });

//         // Update bill in UI (replace)
//         setBills(prev => prev.map(b => b._id === editingBillId ? updated : b));
//         setViewBill(updated);

//         // cleanup
//         setShowModal(false);
//         setBillEditMode(false);
//         setEditingBillId(null);
//         setRows([createEmptyRow()]);
//       }

//     } catch (err) {
//       console.error("Save/Print error:", err);
//       setErrorMsg(err?.response?.data?.message || "Failed to save/print");
//     }
//   };

//   const handleEditBill = (bill) => {
//     // map bill items to rows
//     const mappedRows = (bill.items || []).map(it => ({
//       id: Date.now() + Math.random(),
//       code: it.code,
//       name: it.name,
//       batch: it.batch || it.batchNo || "",
//       mrp: Number(it.mrp || 0),
//       rate: Number(it.rate || 0),
//       gst: Number(it.gst || 0),
//       qty: Number(it.qty || 0),
//       amount: Number(it.amount || 0),
//       value: Number(it.value || 0),
//       isNew: false
//     }));

//     setRows(mappedRows.length ? mappedRows : [createEmptyRow()]);
//     setBillEditMode(true);
//     setEditingBillId(bill._id);
//     // store original items for delta computations
//     setOriginalBillItems(prev => ({ ...prev, [bill._id]: bill.items || [] }));

//     // set meta & totals to existing
//     setMeta({
//       billNo: bill.billNo || "",
//       date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
//       counter: bill.counter || 1,
//       customerName: bill.customerName || bill.meta?.customerName || "",
//       mobile: bill.mobile || bill.meta?.mobile || ""
//     });

//     setTotals({
//       total: bill.total || bill.totals?.total || 0,
//       discount: bill.discount || bill.totals?.discount || 0,
//       netAmount: bill.netAmount || bill.totals?.netAmount || 0,
//       cashGiven: bill.cashGiven || bill.totals?.cashGiven || 0,
//       balance: bill.balance || bill.totals?.balance || 0,
//       cgst: bill.cgst || bill.totals?.cgst || 0,
//       sgst: bill.sgst || bill.totals?.sgst || 0,
//     });

//     setShowModal(true);
//   };

//   const handleViewBill = (bill) => {
//     setViewBill(bill);
//   };

//   const deleteBill = async (id) => {
//     try {
//       // When deleting, ideally we should return stock back (increment) for items in bill.
//       // Let's perform increment-stock for items first then delete bill.
//       const bill = bills.find(b => b._id === id);
//       if (!bill) {
//         showPopup("Bill not found");
//         return;
//       }
//       const incItems = (bill.items || []).map(it => ({ code: it.code, batchNo: it.batch || it.batchNo || "", qty: Number(it.qty || 0) }));
//       if (incItems.length) {
//         await axiosInstance.put(`/api/tenant/shops/${encodeURIComponent(shopname)}/products/increment-stock`, { items: incItems }, { headers: getAuthHeaders() });
//       }
//       await axiosInstance.delete(`/api/tenant/shops/${encodeURIComponent(shopname)}/sales-bills/${id}`, { headers: getAuthHeaders() });
//       setBills(prev => prev.filter(b => b._id !== id));
//       showPopup("Bill deleted", "success");
//     } catch (err) {
//       console.error("Failed to delete bill:", err);
//       showPopup("Failed to delete bill", "error");
//     }
//   };

//   const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

//   const filteredBills = useMemo(() => {
//     if (!bills) return [];
//     const term = (search || "").toLowerCase();
//     return bills.filter(b => {
//       const name = (b.customerName || b.meta?.customerName || "").toString().toLowerCase();
//       const mobile = (b.mobile || b.meta?.mobile || "").toString().toLowerCase();
//       const billno = (b.billNo || "").toString().toLowerCase();
//       return name.includes(term) || mobile.includes(term) || billno.includes(term);
//     });
//   }, [bills, search]);

//   // Render
//   return (
//     <div className="salesbill-container">
//       {popup.message && <div className={`popup-message ${popup.type}`}>{popup.message}</div>}

//       <div className="salesbill-header">
//         <div><h1 className="salesbill-title">Sales Bill</h1></div>
//         {/* <button className="add-btn" onClick={() => { setBillEditMode(false); setEditingBillId(null); setRows([createEmptyRow()]); setShowModal(true); }}>
//           <FaPlus /> Add Sales
//         </button> */}
//       </div>



// <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
//   {/* Left: Search Box */}
//   <div className="flex min-w-[360px]">
//     <input
//       type="text"
//       placeholder="Search Bill No / Customer Name / Mobile No"
//       value={search}
//       onChange={(e) => setSearch(e.target.value)}
//       className="w-[200px] h-8 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition placeholder-gray-400"
//     />
//   </div>

//   {/* Middle: Filter */}
//   <div className="flex items-center gap-2 min-w-[100px]">
//     <select
//       value={filter}
//       onChange={(e) => setFilter(e.target.value)}
//       className="w-[100px] h-8 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
//     >
//       <option value="">All</option>
//       <option value="today">Today</option>
//       <option value="this-week">This Week</option>
//       <option value="this-month">This Month</option>
//       <option value="custom">Custom Date</option>
//     </select>

//     {filter === "custom" && (
//       <div className="flex gap-1 animate-fadeIn">
//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           className="w-[100px] h-8 text-sm border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
//         />
//         <span className="self-center text-sm">to</span>
//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//           className="w-[100px] h-8 text-sm border rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition"
//         />
//       </div>
//     )}
//   </div>

//   {/* Right: Buttons */}
//   {/* <div className="flex gap-2 flex-wrap">
//     <button
//       onClick={() => fetchBills(1)}
//       className="text-sm h-8 bg-[#007867] text-white px-3 py-1 rounded hover:bg-[#005f50] transition-shadow shadow-sm"
//     >
//       Search
//     </button>
//     <button
//       onClick={() => { setSearch(""); setFilter(""); setFromDate(""); setToDate(""); fetchBills(1); }}
//       className="text-sm h-8 bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 transition-shadow shadow-sm"
//     >
//       Reset
//     </button>
//   </div> */}
// </div>



  
//       <div className="salesbill-table-wrapper">
//         {loading ? <p className="muted">Loading…</p> :
//           filteredBills.length === 0 ? <p className="muted">No records found</p> :
//             // <table className="salesbill-table clean full-width">
//             //   <thead>
//             //     <tr>
//             //       <th>S.No</th>
//             //       <th>Date</th>
//             //       <th>Bill No</th>
//             //       <th>Customer</th>
//             //       <th>Net Amount</th>
//             //       <th>Action</th>
//             //     </tr>
//             //   </thead>
//             //   <tbody>
//             //     {filteredBills.map((bill, i) => (
//             //       <tr key={bill._id}>
//             //         <td className="border px-4 py-2">{(page - 1) * limit + i + 1}</td>
//             //         <td>{i + 1}</td>
//             //         <td>{formatDate(bill.date)}</td>
//             //         <td>{bill.billNo}</td>
//             //         <td>{bill.customerName || bill.meta?.customerName || ""}</td>
//             //         <td>{Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}</td>
//             //         <td className="salesbill-actions">
//             //           <button onClick={() => handleViewBill(bill)} className="action-btn view"><FaEye title="View" /></button>
//             //           <button onClick={() => handleEditBill(bill)} className="action-btn edit"><FaEdit title="Edit" /></button>
//             //           <button onClick={() => deleteBill(bill._id)} className="action-btn delete"><FaTrash title="Delete"/></button>
//             //         </td>
//             //       </tr>
//             //     ))}
//             //   </tbody>
//             // </table>

//             <div className="salesbill-table-wrapper">
//   {loading ? (
//     <p className="muted">Loading…</p>
//   ) : bills.length === 0 ? (
//     <p className="muted">No records found</p>
//   ) : (
//     <>
//       <table className="salesbill-table w-full border-collapse border border-gray-200">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-4 py-2">S.No</th>
//             <th className="border px-4 py-2">Date</th>
//             <th className="border px-4 py-2">Bill No</th>
//             <th className="border px-4 py-2">Customer</th>
//             <th className="border px-4 py-2">Net Amount</th>
//             <th className="border px-4 py-2">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {bills.map((bill, i) => (
//             <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
//               <td className="border px-4 py-2">{(page - 1) * limit + i + 1}</td>
//               <td className="border px-4 py-2">{formatDate(bill.date)}</td>
//               <td className="border px-4 py-2">{bill.billNo}</td>
//               <td className="border px-4 py-2">{bill.customerName || bill.meta?.customerName || ""}</td>
//               <td className="border px-4 py-2 text-right">
//                 {Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}
//               </td>
//               <td className="border px-4 py-2 text-center">
//                 <button
//                   onClick={() => setViewBill(bill)}
//                   className="px-2 text-[#00A76F] hover:text-[#007867]"
//                 >
//                   <FaEye title="View Bill" />
//                 </button>
//                 {/* <button
//                   onClick={() => handleEditBill(bill)}
//                   className="px-2 text-[#00A76F] hover:text-[#007867]"
//                 >
//                   <FaEdit />
//                 </button> */}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <Pagination page={page} totalPages={totalPages} onPageChange={fetchBills} />
//     </>
//   )}
// </div>

//         }
//       </div>

//       {/* Add/Edit Modal */}
//       {/* {showModal && (
//         <div className="modal fade-in">
//           <div className="modal-content slide-up large">
//             <div className="modal-header">
//               <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
//               <button className="icon-close" onClick={() => setShowModal(false)}>×</button>
//             </div>

//             <form className="bill-meta" onSubmit={(e) => { e.preventDefault(); handleSaveAndPrint(); }}>
//               <div className="meta-grid">
//                 <label>Bill No <input value={meta.billNo} readOnly /></label>
//                 <label>Date <input type="date" value={meta.date} readOnly /></label>
//                 <label>Counter <input type="number" value={meta.counter} onChange={(e) => setMeta(prev => ({ ...prev, counter: e.target.value }))} /></label>
//                 <label style={{ flex: 2 }}>Customer Name <input value={meta.customerName} onChange={(e) => setMeta(prev => ({ ...prev, customerName: e.target.value }))} /></label>
//                 <label>Mobile <input type="text" value={meta.mobile} maxLength={10} onChange={(e) => {
//                   let value = e.target.value.replace(/\D/g, "");
//                   if (value.length > 10) value = value.slice(0, 10);
//                   setMeta(prev => ({ ...prev, mobile: value }));
//                 }} /></label>
//               </div>

            
//               <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
//                 <thead>
//                   <tr>
//                     <th>S.No</th>
//                     <th>Product Code</th>
//                     <th>Product Name</th>
//                     <th>Batch</th>
//                     <th>MRP</th>
//                     <th>Rate</th>
//                     <th>GST%</th>
//                     <th>Qty</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.map((row, idx) => (
//                     <React.Fragment key={row.id}>
//                       <tr>
//                         <td>{idx + 1}</td>
//                         <td className="relative">
//                           <input value={row.code} placeholder="Type or scan code" disabled={!row.isNew && editRowId !== row.id}
//                             onChange={(e) => { const v = e.target.value; updateRow(row.id, "code", v); if (!v.trim()) updateRow(row.id, "name", ""); if (v.length >= 1) suggestCodesDebounced(row.id, v); setShowCodeList(prev => ({ ...prev, [row.id]: v.length >= 1 })); }}
//                             onFocus={() => row.code && setShowCodeList(prev => ({ ...prev, [row.id]: true }))} onBlur={() => setTimeout(() => setShowCodeList(prev => ({ ...prev, [row.id]: false })), 150)} />
//                           {showCodeList[row.id] && (codeSuggestions[row.id] || []).length > 0 && (
//                             <div className="suggestions">
//                               {codeSuggestions[row.id].map(p => (
//                                 <div key={p._id || `${p.code}-${p.name}`} className="suggestion" onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(row.id, p); }}>
//                                   <div style={{ fontWeight: 600 }}>{p.code}</div>
//                                   <div style={{ fontSize: 12 }}>{p.name}</div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </td>

//                         <td className="relative">
//                           <input value={row.name} placeholder="Type or select product" disabled={!row.isNew && editRowId !== row.id}
//                             onChange={(e) => { const v = e.target.value; updateRow(row.id, "name", v); if (!v.trim()) updateRow(row.id, "code", ""); if (v.length >= 1) suggestNamesDebounced(row.id, v); setShowNameList(prev => ({ ...prev, [row.id]: v.length >= 1 })); }}
//                             onFocus={() => row.name && setShowNameList(prev => ({ ...prev, [row.id]: true }))} onBlur={() => setTimeout(() => setShowNameList(prev => ({ ...prev, [row.id]: false })), 150)} />
//                           {showNameList[row.id] && (nameSuggestions[row.id] || []).length > 0 && (
//                             <div className="suggestions">
//                               {nameSuggestions[row.id].map(p => (
//                                 <div key={p._id || `${p.code}-${p.name}`} className="suggestion" onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(row.id, p); }}>
//                                   <div style={{ fontWeight: 600 }}>{p.name}</div>
//                                   <div style={{ fontSize: 12 }}>{p.code}</div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </td>

//                         <td className="relative">
//                           <input placeholder="Enter or select batch" value={row.batch} disabled={!row.isNew && editRowId !== row.id}
//                             onChange={(e) => updateRow(row.id, "batch", e.target.value)}
//                             onFocus={() => {
//                               const batches = row.name ? getBatchesForName(row.name) : row.code ? getBatchesForCode(row.code) : [];
//                               setBatchesByRow(prev => ({ ...prev, [row.id]: batches }));
//                               setShowBatchList(prev => ({ ...prev, [row.id]: batches.length > 0 }));
//                             }} onBlur={() => setTimeout(() => setShowBatchList(prev => ({ ...prev, [row.id]: false })), 150)} />
//                           {showBatchList[row.id] && Array.isArray(batchesByRow[row.id]) && batchesByRow[row.id].length > 0 && (
//                             <div className="batch-suggestions">
//                               <table style={{ width: "100%" }}>
//                                 <thead><tr><th>Batch</th><th>MRP</th><th>Rate</th><th>GST%</th><th>Stock</th></tr></thead>
//                                 <tbody>
//                                   {batchesByRow[row.id].map(b => {
//                                     const available = getAvailableStock(b.code, b.batchNo);
//                                     return (
//                                       <tr key={`${b.batchNo}-${b.rate}`} onMouseDown={e => { e.preventDefault(); handleBatchPick(row.id, b); }}>
//                                         <td style={{ fontWeight: 600 }}>{b.batchNo || "(no batch)"}</td>
//                                         <td>{Number(b.mrp || 0).toFixed(2)}</td>
//                                         <td>{Number(b.salePrice || 0).toFixed(2)}</td>
//                                         <td>{b.gst ? `${b.gst}%` : "0%"}</td>
//                                         <td>{available}</td>
//                                       </tr>
//                                     );
//                                   })}
//                                 </tbody>
//                               </table>
//                             </div>
//                           )}
//                         </td>

//                         {["mrp", "rate", "gst", "qty"].map(field => (
//                           <td key={field}>
//                             <input type="number" value={field === "qty" ? row.qty || "" : row[field] || 0} disabled={!row.isNew && editRowId !== row.id}
//                               onChange={(e) => {
//                                 const val = e.target.value;
//                                 if (field === "qty") {
//                                   const qty = val === "" ? 0 : Number(val);
//                                   updateRow(row.id, "qty", qty);
//                                   const available = row.batch ? getAvailableStock(row.code, row.batch) : null;
//                                   if (available !== null && qty > available) setStockErrors(prev => ({ ...prev, [row.id]: `Out of stock: requested ${qty}, only ${available} available` }));
//                                   else setStockErrors(prev => { const copy = { ...prev }; delete copy[row.id]; return copy; });
//                                 } else updateRow(row.id, field, val === "" ? 0 : Number(val));
//                               }} />
//                           </td>
//                         ))}

//                         <td className="row-actions">
//                           {row.isNew ? (
//                             <button type="button" onClick={() => addRow(row.id)} className="plus"><FaPlus title="Add Row" /></button>
//                           ) : editRowId === row.id ? (
//                             <>
//                               <button type="button" onClick={() => saveRowEdit(row.id)} className="success"><FaCheck title="Update Row"/></button>
//                               <button type="button" onClick={() => { setEditRowId(null); }} className="danger"><FaTimes title="Close" /></button>
//                             </>
//                           ) : (
//                             <>
//                               <button type="button" onClick={() => { setEditRowId(row.id); setOriginalBillItems(prev => ({ ...prev, [row.id]: { ...row } })); }} className="edit"><FaEdit /></button>
//                               <button type="button" onClick={() => deleteRow(row.id)} className="danger"><FaTrash title="Delete"/></button>
//                             </>
//                           )}
//                         </td>
//                       </tr>

//                       {stockErrors[row.id] && (
//                         <tr>
//                           <td colSpan="9" style={{ color: "red", fontSize: 13 }}>❌ {stockErrors[row.id]}</td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//               </table>

//               {Object.keys(stockErrors).length > 0 && <div style={{ color: "red", marginTop: 10 }}>{Object.values(stockErrors).map((msg, i) => <div key={i}>❌ {msg}</div>)}</div>}
//               {errorMsg && <p className="error">{errorMsg}</p>}


// <div
//   className="totals-layout"
//   style={{
//     display: "flex",
//     justifyContent: "space-between",
//     gap: "2rem",
//     marginTop: "2rem",
//     flexWrap: "wrap",
//   }}
// >

//   <div
//     className="totals-left"
//     style={{
//       display: "flex",
//       flexDirection: "column",
//       gap: "1rem",
//       flex: "1",
//       minWidth: "150px",
//     }}
//   >
//     {[
//       { label: "Total", value: totals.total, readOnly: true },
//       { label: "Discount", value: totals.discount, readOnly: false },
//       { label: "Net Amount", value: totals.netAmount, readOnly: true },
//       { label: "Cash Given", value: totals.cashGiven, readOnly: false },
//       { label: "Balance", value: totals.balance, readOnly: true },
//     ].map((item, idx) => (
//       <div
//         key={idx}
//         style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
//       >
//         <span style={{ fontWeight: 300, fontSize: "1rem", minWidth: "100px" }}>
//           {item.label}
//         </span>
//         <input
//           type="number"
//           readOnly={item.readOnly}
//           value={item.readOnly ? item.value.toFixed(2) : item.value === 0 ? "0" : item.value}
//           onFocus={(e) => !item.readOnly && e.target.value === "0" && (e.target.value = "")}
//           onBlur={(e) => {
//             if (!item.readOnly && e.target.value === "") {
//               const val = 0;
//               setTotals((prev) => ({ ...prev, [item.label.toLowerCase().replace(" ", "")]: val }));
//             }
//           }}
//           onChange={(e) => {
//             if (!item.readOnly) {
//               const val = Number(e.target.value) || 0;
//               setTotals((prev) => ({ ...prev, [item.label.toLowerCase().replace(" ", "")]: val }));
//             }
//           }}
//           onWheel={(e) => e.target.blur()} 
//           style={{
//             flex: 1,
//             padding: "0.75rem 1rem",
//             fontSize: "1rem",
//             fontWeight: 500,
//             borderRadius: "0.5rem",
//             border: "1px solid #ccc",
//             textAlign: "right",
//             transition: "all 0.3s ease",
//             backgroundColor: "#f9f9f9",
//           }}
//         />
//       </div>
//     ))}
//   </div>


//   <div
//     className="totals-right"
//     style={{
//       minWidth: "350px",
//       flex: "0 0 220px",
//       backgroundColor: "#f0f8f5",
//       padding: "1rem",
//       borderRadius: "0.75rem",
//       boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//       display: "flex",
//       flexDirection: "column",
//       gap: "0.75rem",
//       animation: "fadeInRight 0.5s ease forwards",
//     }}
//   >
//     <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "#007867" }}>
//       Bill Summary
//     </h3>
//     <div className="summary-line" style={{ display: "flex", justifyContent: "space-between" }}>
//       <span>CGST</span>
//       <strong>{totals.cgst.toFixed(2)}</strong>
//     </div>
//     <div className="summary-line" style={{ display: "flex", justifyContent: "space-between" }}>
//       <span>SGST</span>
//       <strong>{totals.sgst.toFixed(2)}</strong>
//     </div>
//     <hr style={{ border: "0.5px solid #ddd" }} />
//     <div className="summary-total" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
//       <span>Bill Amount</span>
//       <strong>{totals.netAmount.toFixed(2)}</strong>
//     </div>
//   </div>


//   <style>
//     {`
//       @keyframes fadeInRight {
//         from { opacity: 0; transform: translateX(20px); }
//         to { opacity: 1; transform: translateX(0); }
//       }

//       input:focus {
//         border-color: #007867;
//         box-shadow: 0 0 5px rgba(0, 167, 111, 0.3);
//         outline: none;
//       }
//     `}
//   </style>
// </div>


//               <div className="modal-actions">
//                 <button type="button" className="primary" onClick={handleSaveAndPrint}>{billEditMode ? "Save Changes" : "Save & Print"}</button>
//                 <button type="button" className="secondary" onClick={() => setShowModal(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )} */}

//       {/* View Bill Modal */}
//       {/* {viewBill && (
//         <div className="modal fade-in">
//           <div className="modal-content slide-up large">
//             <div className="modal-header">
//               <h2>Bill Details</h2>
//               <button className="icon-close" onClick={() => setViewBill(null)}><FaTimes /></button>
//             </div>
//             <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//             <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//             <p><strong>Customer:</strong> {viewBill.customerName || viewBill.meta?.customerName || ""} ({viewBill.mobile || viewBill.meta?.mobile || ""})</p>
//             <p><strong>Net Amount:</strong> {(viewBill.netAmount || viewBill.totals?.netAmount || 0).toFixed(2)}</p>

//             <table className="salesbill-table clean full-width">
//               <thead><tr><th>Code</th><th>Name</th><th>Batch</th><th>MRP</th><th>Rate</th><th>Qty</th><th>GST%</th><th>Amount</th><th>Value</th></tr></thead>
//               <tbody>
//                 {(viewBill.items || []).map((it, i) => (
//                   <tr key={i}>
//                     <td>{it.code}</td>
//                     <td>{it.name}</td>
//                     <td>{it.batch}</td>
//                     <td>{it.mrp}</td>
//                     <td>{it.rate}</td>
//                     <td>{it.qty}</td>
//                     <td>{it.gst}</td>
//                     <td>{it.amount}</td>
//                     <td>{it.value}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <div className="modal-actions">
//               <button className="secondary" onClick={() => setViewBill(null)}>Close</button>
//             </div>
//           </div>
//         </div>
//       )} */}


//       {/* View Bill Modal */}
//       {viewBill && (
//         <div className="modal fade-in">
//           <div className="modal-content slide-up square-80mm">
//             <div className="modal-header">
//               <h2>Bill Details</h2>
//               <button className="icon-close" onClick={() => setViewBill(null)}>
//                 <FaTimes />
//               </button>
//             </div>
//             <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//             <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//             <p>
//               <strong>Customer:</strong> {viewBill.customerName || viewBill.meta?.customerName || ""} 
//               ({viewBill.mobile || viewBill.meta?.mobile || ""})
//             </p>
//             <p>
//               <strong>Net Amount:</strong> {viewBill.netAmount || viewBill.totals?.netAmount || 0}
//             </p>
      
//             <table className="salesbill-table clean full-width">
//               <thead>
//                 <tr>
//                   <th>Code</th>
//                   <th>Name</th>
//                   <th>Batch</th>
//                   <th>MRP</th>
//                   <th>Rate</th>
//                   <th>Qty</th>
//                   <th>GST%</th>
//                   <th>Amount</th>
//                   <th>Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {viewBill.items?.map((it, i) => (
//                   <tr key={i}>
//                     <td>{it.code}</td>
//                     <td>{it.name}</td>
//                     <td>{it.batch}</td>
//                     <td>{it.mrp}</td>
//                     <td>{it.rate}</td>
//                     <td>{it.qty}</td>
//                     <td>{it.gst}</td>
//                     <td>{it.amount}</td>
//                     <td>{it.value}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {/* <div className="modal-actions">
//               <button className="secondary" onClick={() => setViewBill(null)}>
//                 Close
//               </button>
//             </div> */}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
