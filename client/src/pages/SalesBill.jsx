//width 80mm bill format
// src/pages/SalesBill.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaEye,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders, API } from "../utils/apiHeaders";
import Pagination from "../components/Pagination";
import "../styles/salesbill.css";

const axiosInstance = axios.create({ baseURL: API });

export default function SalesBill() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const shopname = user?.shopname || localStorage.getItem("shopname");

  // ---------------- State ----------------
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState([createEmptyRow()]);
  const [products, setProducts] = useState([]);

  const [popup, setPopup] = useState({ message: "", type: "" });

  // const [meta, setMeta] = useState({
  //   billNo: "",
  //   date: "",
  //   counter: 1,
  //   customerName: "",
  //   mobile: "",
  // });
    // -------------------
// Top of your component
// -------------------
const [meta, setMeta] = useState({
  billNo: "",
  date: new Date().toISOString().split("T")[0],
  counter: 1,
  customerName: "",
  mobile: "",
  address: "",
});

  const [totals, setTotals] = useState({
    total: 0,
    discount: 0,
    netAmount: 0,
    cashGiven: 0,
    balance: 0,
    cgst: 0,
    sgst: 0,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [viewBill, setViewBill] = useState(null);

  const [billEditMode, setBillEditMode] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);

  const [editRowId, setEditRowId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [originalRowData, setOriginalRowData] = useState({});
  const [originalBillItems, setOriginalBillItems] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [reservedStock, setReservedStock] = useState({});
  const [stockErrors, setStockErrors] = useState({});
  const [rowStockError, setRowStockError] = useState({});

  // suggestions state (per row)
  const [nameSuggestions, setNameSuggestions] = useState({});
  const [codeSuggestions, setCodeSuggestions] = useState({});
  const [showNameList, setShowNameList] = useState({});
  const [showCodeList, setShowCodeList] = useState({});
  const [batchesByRow, setBatchesByRow] = useState({});
  const [showBatchList, setShowBatchList] = useState({});

  const portalRoot = typeof document !== "undefined" ? document.body : null;
  const suggestionRefs = useRef({});

  // ---------------- Helpers ----------------
  function createEmptyRow() {
    return {
      id: "_" + Math.random().toString(36).slice(2, 10),
      code: "",
      name: "",
      batch: "",
      mrp: 0,
      rate: 0,
      gst: 0,
      qty: 0,
      amount: 0,
      value: 0,
      isNew: true,
    };
  }

  const keyFor = (code, batch) =>
    `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 2500);
  };

  const preventWheel = (e) => {
    if (document.activeElement && document.activeElement.type === "number") {
      e.preventDefault();
    }
  };
  const enableWheelBlock = () =>
    document?.addEventListener("wheel", preventWheel, { passive: false });
  const disableWheelBlock = () =>
    document?.removeEventListener("wheel", preventWheel);

  const numberInputProps = { onWheel: (e) => e.target.blur() };

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "";
      return dt.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  // debounce helper
  const debounceFn = (fn, delay = 180) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  // ---------------- Data Fetch ----------------
  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("/api/products", {
        headers: getAuthHeaders(user),
      });
      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      // normalize
      const normalized = productList.map((p) => {
        const batches =
          Array.isArray(p.batches) && p.batches.length
            ? p.batches.map((b) => ({
                batchNo: b.batchNo || b.batch || "",
                mrp: Number(b.mrp ?? b.price ?? p.mrp ?? 0),
                rate: Number(b.rate ?? b.salePrice ?? p.salePrice ?? 0),
                gst: Number(b.gst ?? b.taxPercent ?? p.taxPercent ?? 0),
                qty: Number(b.qty ?? 0),
                code: p.code || "",
              }))
            : [
                {
                  batchNo: p.batchNo || "",
                  mrp: Number(p.mrp ?? 0),
                  rate: Number(p.salePrice ?? p.rate ?? 0),
                  gst: Number(p.taxPercent ?? p.gst ?? 0),
                  qty: Number(p.qty ?? 0),
                  code: p.code || "",
                },
              ];

        return {
          ...p,
          code: p.code || "",
          name: p.name || "",
          salePrice: Number(p.salePrice ?? p.rate ?? 0),
          taxPercent: Number(p.taxPercent ?? p.gst ?? 0),
          batches,
        };
      });

      setProducts(normalized);
    } catch (e) {
      console.error("fetchProducts", e);
      setProducts([]);
    }
  };

  const fetchBills = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        search,
        filter,
        fromDate,
        toDate,
      });
      const { data } = await axiosInstance.get(`/api/sales?${params}`, {
        headers: getAuthHeaders(user),
      });
      setBills(Array.isArray(data?.bills) ? data.bills : []);
      setTotalPages(Number(data?.totalPages || 1));
      setPage(Number(data?.page || pageNum));
    } catch (e) {
      console.error("fetchBills", e);
      setBills([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };





 




  const fetchBillNo = async () => {
  try {
    if (!token || !shopname) return;

    const { data } = await axiosInstance.get("/api/sales/next-billno", {
      headers: { ...getAuthHeaders(user), "x-shopname": shopname },
    });

    console.log("✅ API BillNo:", data); // Should show { billNo: 'B070' }

    const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);

    setMeta((prev) => {
      const updated = {
        ...prev,
        billNo: data?.billNo || "", // ✅ FIXED: Use correct key
        date: istDate.toISOString().slice(0, 10),
      };
      console.log("🟢 Meta updated:", updated);
      return updated;
    });
  } catch (e) {
    console.error("fetchBillNo error:", e);
  }
};


  // useEffect(() => {
  //   fetchBillNo();
  // }, []);

  useEffect(() => {
    console.log("🟢 Meta updated:", meta);
  }, [meta]);

  // useEffect(() => {
  //   if (token && shopname) {
  //     fetchProducts();
  //     fetchBillNo();
  //     fetchBills();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [token, shopname]);

useEffect(() => {
  const init = async () => {
    if (token && shopname) {
      await fetchProducts();
      await fetchBillNo();
      await fetchBills();
    }
  };
  init();
}, [token, shopname]);


  useEffect(() => {
    fetchBills(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter, fromDate, toDate]);

  // ---------------- Row math ----------------
  const recalcRow = (r) => {
    const rate = Number(r.rate || 0);
    const qty = Number(r.qty || 0);
    const gst = Number(r.gst || 0);
    const amount = +(rate * qty).toFixed(2);
    const value = +(amount + (amount * gst) / 100).toFixed(2);
    return { ...r, amount, value };
  };

  useEffect(() => {
    const total = rows
      .filter((r) => !r.isNew)
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    const gstTotal = rows
      .filter((r) => !r.isNew)
      .reduce(
        (s, r) =>
          s + Number(r.amount || 0) * Number(r.gst || 0) * 0.01,
        0
      );
    const discount = Number(totals.discount || 0);
    const netAmount = +(total + gstTotal - discount).toFixed(2);
    const cashGiven = Number(totals.cashGiven || 0);
    const balance = +(
      cashGiven >= netAmount ? cashGiven - netAmount : netAmount - cashGiven
    ).toFixed(2);
    const cgst = +(gstTotal / 2).toFixed(2);
    const sgst = +(gstTotal / 2).toFixed(2);
    setTotals((prev) => ({
      ...prev,
      total,
      discount,
      netAmount,
      balance,
      cashGiven,
      cgst,
      sgst,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, totals.discount, totals.cashGiven]);

  // ---------------- Stock helpers ----------------
  const getAvailableStock = (code, batch) => {
    const matches = products.filter(
      (p) => (p.code || "").toLowerCase() === (code || "").toLowerCase()
    );
    const base = matches.reduce((sum, p) => {
      if (Array.isArray(p.batches)) {
        return (
          sum +
          p.batches.reduce(
            (s, b) =>
              s +
              (((b.batchNo || "").toLowerCase() ===
              (batch || "").toLowerCase()
                ? Number(b.qty || 0)
                : 0)),
            0
          )
        );
      }
      return sum;
    }, 0);
    const reserved = Number(reservedStock[keyFor(code, batch)] || 0);
    return Math.max(0, base - reserved);
  };

  // ---------------- Suggestion logic ----------------
  const uniqueProducts = (arr) => {
    const seen = new Set();
    return arr.filter((p) => {
      const k = `${(p.code || "").trim()}|${(p.name || "").trim()}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const suggestNamesDebounced = useMemo(
    () =>
      debounceFn((rowId, query) => {
        const q = (query || "").trim().toLowerCase();
        if (!q) {
          setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
          setShowNameList((s) => ({ ...s, [rowId]: false }));
          return;
        }
        const matches = uniqueProducts(
          products.filter((p) =>
            (p.name || "").toLowerCase().includes(q)
          )
        ).slice(0, 20);
        setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
        setShowNameList((s) => ({ ...s, [rowId]: matches.length > 0 }));
      }, 180),
    [products]
  );

  const suggestCodesDebounced = useMemo(
    () =>
      debounceFn((rowId, query) => {
        const q = (query || "").trim().toLowerCase();
        if (!q) {
          setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
          setShowCodeList((s) => ({ ...s, [rowId]: false }));
          return;
        }
        const matches = uniqueProducts(
          products.filter((p) =>
            (p.code || "").toLowerCase().includes(q)
          )
        ).slice(0, 20);
        setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
        setShowCodeList((s) => ({ ...s, [rowId]: matches.length > 0 }));
      }, 180),
    [products]
  );

  const getBatchesForCode = (code) => {
    const matches = products.filter(
      (p) => (p.code || "").toLowerCase() === (code || "").toLowerCase()
    );
    return matches.flatMap((p) => p.batches || []);
  };

  const getBatchesForName = (name) => {
    const matches = products.filter(
      (p) => (p.name || "").toLowerCase() === (name || "").toLowerCase()
    );
    return matches.flatMap((p) => p.batches || []);
  };

  const normalizeBatch = (m) => ({
    ...m,
    batchNo: m.batchNo || "",
    mrp: Number(m.mrp || 0),
    rate: Number(m.rate || m.salePrice || 0),
    gst: Number(m.gst || m.taxPercent || 0),
    qty: Number(m.qty || 0),
  });

  // ---------------- Row ops ----------------
  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        let v = value;
        if (["mrp", "rate", "gst", "qty"].includes(field)) {
          v = Number(value) || 0;
        }
        const updated = { ...r, [field]: v };

        // reset autofill if editing code/name
        if ((field === "code" || field === "name") && typeof value === "string") {
          updated.batch = "";
          updated.mrp = 0;
          updated.rate = 0;
          updated.gst = 0;
          updated.qty = 0;
          setShowBatchList((s) => ({ ...s, [id]: false }));
          setBatchesByRow((b) => ({ ...b, [id]: [] }));
        }

        return recalcRow(updated);
      })
    );
  };

  const handleSelectSuggestion = (rowId, product) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const updated = {
          ...r,
          code: product.code || "",
          name: product.name || "",
          batch: "",
          mrp: Number(product.mrp || 0),
          rate: Number(product.salePrice || product.rate || 0),
          gst: Number(product.taxPercent || product.gst || 0),
          qty: 0,
        };
        return recalcRow(updated);
      })
    );

    const batches = product.batches?.length
      ? product.batches
      : getBatchesForCode(product.code);

    setBatchesByRow((b) => ({ ...b, [rowId]: batches || [] }));
    setShowBatchList((b) => ({ ...b, [rowId]: (batches || []).length > 0 }));
    setShowCodeList((s) => ({ ...s, [rowId]: false }));
    setShowNameList((s) => ({ ...s, [rowId]: false }));

    setTimeout(() => {
      document
        .querySelector(`input[data-row="${rowId}"][data-field="batch"]`)
        ?.focus();
    }, 40);
  };

  const handleBatchPick = (rowId, batch) => {
    const nb = normalizeBatch(batch);
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const updated = {
          ...r,
          batch: nb.batchNo || "",
          mrp: Number(nb.mrp || 0),
          rate: Number(nb.rate || 0),
          gst: Number(nb.gst || 0),
          qty: 0,
        };
        return recalcRow(updated);
      })
    );
    setShowBatchList((s) => ({ ...s, [rowId]: false }));
  };

  const addRow = (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row || !row.code || !row.name || !row.batch || !row.qty || !row.rate) {
      showPopup("Fill required fields", "error");
      return;
    }
    const available = getAvailableStock(row.code, row.batch);
    if (available < row.qty) {
      showPopup(`Only ${available} left`, "error");
      return;
    }
    const k = keyFor(row.code, row.batch);
    setReservedStock((rs) => ({
      ...rs,
      [k]: Number(rs[k] || 0) + Number(row.qty || 0),
    }));
    setRows((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, isNew: false } : r))
        .concat(createEmptyRow())
    );
  };

  const deleteRow = (id) => {
    const row = rows.find((r) => r.id === id);
    if (row && !row.isNew) {
      const k = keyFor(row.code, row.batch);
      setReservedStock((rs) => ({
        ...rs,
        [k]: Math.max(0, Number(rs[k] || 0) - Number(row.qty || 0)),
      }));
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const cancelRowEdit = () => {
    if (!editRowId) return;
    setRows((prev) =>
      prev.map((r) => (r.id === editRowId ? { ...originalRowData[editRowId] } : r))
    );
    setOriginalRowData((prev) => {
      const c = { ...prev };
      delete c[editRowId];
      return c;
    });
    setEditRowId(null);
  };

  const saveRowEdit = async (rowId) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    if (!row.code || !row.name || !row.batch) {
      showPopup("Please fill all required fields.", "error");
      return;
    }

    const newQty = Number(row.qty);
    const oldQty = Number(originalBillItems?.[rowId]?.qty || 0);

    let actionType = "none";
    let qtyChange = 0;
    if (newQty > oldQty) {
      qtyChange = newQty - oldQty;
      actionType = "decrement";
    } else if (newQty < oldQty) {
      qtyChange = oldQty - newQty;
      actionType = "increment";
    }

    const available = getAvailableStock(row.code, row.batch);
    if (actionType === "decrement" && available < qtyChange) {
      setStockErrors((prev) => ({
        ...prev,
        [rowId]: `Only ${available} left.`,
      }));
      return;
    } else {
      setStockErrors((prev) => {
        const n = { ...prev };
        delete n[rowId];
        return n;
      });
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, qty: newQty, isNew: false, edited: true } : r
      )
    );
    setOriginalBillItems((prev) => ({
      ...prev,
      [rowId]: { code: row.code, batch: row.batch, qty: newQty },
    }));

    try {
      const headers = getAuthHeaders(user);
      if (actionType !== "none" && qtyChange > 0) {
        const url =
          actionType === "decrement"
            ? "/api/products/decrement-stock"
            : "/api/products/increment-stock";
        await axiosInstance.put(
          url,
          { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
          { headers }
        );
      }
      showPopup("Row updated and stock synced.");
    } catch (err) {
      console.error("saveRowEdit stock sync", err);
      showPopup("Failed to sync stock (server).", "error");
    }

    setEditRowId(null);
  };

  const handleSaveAndPrint = async () => {
    try {
      if (!rows.length) {
        setErrorMsg("Add items before saving.");
        return;
      }
      const validItems = rows.filter((r) => r.code && r.batch && r.qty >= 0);
      if (!validItems.length) {
        setErrorMsg("No valid items to save.");
        return;
      }

      const headers = getAuthHeaders(user);

      // Sync stock deltas for edited rows
      for (const r of validItems) {
        const newQty = Number(r.qty);
        const oldQty = Number(originalBillItems?.[r.id]?.qty || 0);
        if (newQty === oldQty) continue;

        let api = null;
        let qty = 0;
        if (newQty > oldQty) {
          qty = newQty - oldQty;
          api = "/api/products/decrement-stock";
        } else if (newQty < oldQty) {
          qty = oldQty - newQty;
          api = "/api/products/increment-stock";
        }
        if (qty > 0 && api) {
          await axiosInstance.put(
            api,
            { items: [{ code: r.code, batchNo: r.batch, qty }] },
            { headers }
          );
        }
      }

      const salesPayload = {
        billNo: meta.billNo,
        date: meta.date || new Date(),
        counter: meta.counter || 1,
        customerName: meta.customerName || "Cash Customer",
        mobile: meta.mobile || "",
        items: validItems.map((r) => ({
          code: r.code,
          name: r.name,
          batch: r.batch,
          mrp: Number(r.mrp || 0),
          rate: Number(r.rate || 0),
          gst: Number(r.gst || 0),
          qty: Number(r.qty || 0),
          amount: Number(r.rate || 0) * Number(r.qty || 0),
          value:
            Number(r.rate || 0) *
            Number(r.qty || 0) *
            (1 + Number(r.gst || 0) / 100),
        })),
        total: totals.total || 0,
        discount: totals.discount || 0,
        netAmount: totals.netAmount || 0,
        cashGiven: totals.cashGiven || 0,
        balance: totals.balance || 0,
        cgst: totals.cgst || 0,
        sgst: totals.sgst || 0,
      };

      let savedBill;
      if (billEditMode && editingBillId) {
        const { data } = await axiosInstance.put(
          `/api/sales/${editingBillId}`,
          salesPayload,
          { headers }
        );
        savedBill = data;
      } else {
        const { data } = await axiosInstance.post("/api/sales", salesPayload, {
          headers,
        });
        savedBill = data;
      }

      if (billEditMode) {
        setBills((prev) =>
          prev.map((b) => (b._id === savedBill._id ? savedBill : b))
        );
      } else {
        setBills((prev) => [savedBill, ...prev]);
      }

      setViewBill(savedBill);

      const newOriginalMap = {};
      validItems.forEach((r) => {
        newOriginalMap[r.id] = {
          code: r.code,
          batch: r.batch,
          qty: Number(r.qty),
        };
      });
      setOriginalBillItems(newOriginalMap);

      setTimeout(() => window.print(), 100);
      setShowModal(false);
      setRows([createEmptyRow()]);
      setTotals({
        total: 0,
        discount: 0,
        netAmount: 0,
        cashGiven: 0,
        balance: 0,
        cgst: 0,
        sgst: 0,
      });
      setMeta((prev) => ({ ...prev, customerName: "", mobile: "" }));
      setErrorMsg("");
      setBillEditMode(false);
      setEditingBillId(null);
      showPopup("Bill saved.");
    } catch (err) {
      console.error("handleSaveAndPrint", err);
      setErrorMsg(err.response?.data?.message || "Failed to save/print");
    }
  };

  const handleEditBill = (bill) => {
    if (!bill) return;
    setBillEditMode(true);
    setEditingBillId(bill._id);
    setShowModal(true);

    const rowsWithId = (bill.items || []).map((item, idx) => ({
      ...item,
      id: item._id || `item-${idx}-${Date.now()}`,
      isNew: false,
    }));
    setRows(rowsWithId);
    setMeta({
      billNo: bill.billNo || "",
      date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
      counter: bill.counter || 1,
      customerName: bill.customerName || bill.meta?.customerName || "",
      mobile: bill.mobile || bill.meta?.mobile || "",
    });
    setTotals({
      total: bill.total || 0,
      discount: bill.discount || 0,
      netAmount: bill.netAmount || bill.totals?.netAmount || 0,
      cashGiven: bill.cashGiven || 0,
      balance: bill.balance || 0,
      cgst: bill.cgst || 0,
      sgst: bill.sgst || 0,
    });

    const origItemsMap = {};
    rowsWithId.forEach((item) => {
      origItemsMap[item.id] = {
        code: item.code,
        batch: item.batch,
        qty: Number(item.qty) || 0,
      };
    });
    setOriginalBillItems(origItemsMap);

    setTimeout(() => {
      document.querySelector('input[name="customerName"]')?.focus();
    }, 200);
  };

  // hide all dropdowns when clicking outside
  useEffect(() => {
    const closeAll = (e) => {
      if (
        !e.target.closest(".suggestions-portal") &&
        !e.target.closest(".batch-portal") &&
        !e.target.closest("input")
      ) {
        setShowCodeList({});
        setShowNameList({});
        setShowBatchList({});
      }
    };
    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  // keyboard support
  const handleSuggestionKey = (e, rowId, field) => {
    const key = e.key;
    const list =
      field === "code"
        ? codeSuggestions[rowId] || []
        : nameSuggestions[rowId] || [];

    suggestionRefs.current[rowId] = suggestionRefs.current[rowId] || {};
    const state = suggestionRefs.current[rowId][field] || { index: -1 };
    let idx = state.index;

    if (key === "ArrowDown") {
      e.preventDefault();
      idx = Math.min(list.length - 1, idx + 1);
    } else if (key === "ArrowUp") {
      e.preventDefault();
      idx = Math.max(0, idx - 1);
    } else if (key === "Enter") {
      if (idx >= 0 && list[idx]) {
        e.preventDefault();
        handleSelectSuggestion(rowId, list[idx]);
        suggestionRefs.current[rowId][field] = { index: -1 };
      }
      return;
    } else if (key === "Escape") {
      setShowCodeList((s) => ({ ...s, [rowId]: false }));
      setShowNameList((s) => ({ ...s, [rowId]: false }));
      suggestionRefs.current[rowId][field] = { index: -1 };
      return;
    } else {
      suggestionRefs.current[rowId][field] = { index: -1 };
      return;
    }
    suggestionRefs.current[rowId][field] = { index: idx };
  };

  const openAddModal = () => {
    setBillEditMode(false);
    setMeta((prev) => ({
      ...prev,
    billNo: prev.billNo || "",           
      customerName: "",
      mobile: "",
      counter: "",
      date: new Date().toISOString().slice(0, 10),
    }));
    setTotals({
      total: 0,
      discount: 0,
      netAmount: 0,
      cashGiven: 0,
      balance: 0,
      cgst: 0,
      sgst: 0,
    });
    setRows([createEmptyRow()]);
    setStockErrors({});
    setErrorMsg("");
    setShowModal(true);
  };

  // ---------------- Portals (render near inputs) ----------------
  const renderCodeSuggestionPortal = (rowId) => {
    if (!portalRoot) return null;
    const list = codeSuggestions[rowId] || [];
    if (!showCodeList[rowId] || list.length === 0) return null;

    const inputEl = document.querySelector(
      `input[data-row="${rowId}"][data-field="code"]`
    );
    const rect =
      inputEl?.getBoundingClientRect() || { top: 0, left: 0, width: 240, height: 24 };

    const style = {
      position: "fixed",
      top: rect.top + rect.height + 6,
      left: rect.left,
      minWidth: Math.max(240, rect.width),
      zIndex: 9999,
      background: "#fff",
      border: "1px solid #ddd",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      maxHeight: 320,
      overflowY: "auto",
      padding: "6px 0",
    };

    return ReactDOM.createPortal(
      <div className="suggestions-portal" style={style} role="listbox">
        {list.map((p, i) => (
          <div
            key={p._id || `${p.code}-${p.name}-${i}`}
            className="suggestion"
            role="option"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelectSuggestion(rowId, p);
            }}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              borderBottom: "1px solid #f4f4f4",
            }}
          >
            <div style={{ fontWeight: 700 }}>{p.code}</div>
            <div style={{ fontSize: 12 }}>{p.name}</div>
          </div>
        ))}
      </div>,
      portalRoot
    );
  };

  const renderNameSuggestionPortal = (rowId) => {
    if (!portalRoot) return null;
    const list = nameSuggestions[rowId] || [];
    if (!showNameList[rowId] || list.length === 0) return null;

    const inputEl = document.querySelector(
      `input[data-row="${rowId}"][data-field="name"]`
    );
    const rect =
      inputEl?.getBoundingClientRect() || { top: 0, left: 0, width: 240, height: 24 };

    const style = {
      position: "fixed",
      top: rect.top + rect.height + 6,
      left: rect.left,
      minWidth: Math.max(240, rect.width),
      zIndex: 9999,
      background: "#fff",
      border: "1px solid #ddd",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      maxHeight: 320,
      overflowY: "auto",
      padding: "6px 0",
    };

    return ReactDOM.createPortal(
      <div className="suggestions-portal" style={style} role="listbox">
        {list.map((p, i) => (
          <div
            key={p._id || `${p.code}-${p.name}-${i}`}
            className="suggestion"
            role="option"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelectSuggestion(rowId, p);
            }}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              borderBottom: "1px solid #f4f4f4",
            }}
          >
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 12 }}>{p.code}</div>
          </div>
        ))}
      </div>,
      portalRoot
    );
  };

  const renderBatchPortal = (rowId) => {
    if (!portalRoot) return null;
    const list = batchesByRow[rowId] || [];
    if (!showBatchList[rowId] || list.length === 0) return null;

    const inputEl = document.querySelector(
      `input[data-row="${rowId}"][data-field="batch"]`
    );
    const rect =
      inputEl?.getBoundingClientRect() || { top: 0, left: 0, width: 300, height: 24 };

    const style = {
      position: "fixed",
      top: rect.top + rect.height + 6,
      left: rect.left,
      minWidth: Math.max(480, rect.width),
      zIndex: 9999,
      background: "#fff",
      border: "1px solid #eee",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      maxHeight: 320,
      overflowY: "auto",
      padding: 8,
    };

    return ReactDOM.createPortal(
      <div className="batch-portal" style={style}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa", fontSize: 13 }}>
              <th style={{ padding: 6, textAlign: "left" }}>Batch</th>
              <th style={{ padding: 6, textAlign: "left" }}>MRP</th>
              <th style={{ padding: 6, textAlign: "left" }}>Rate</th>
              <th style={{ padding: 6, textAlign: "left" }}>GST%</th>
              <th style={{ padding: 6, textAlign: "left" }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b, i) => {
              const nb = normalizeBatch(b);
              const available = getAvailableStock(
                rows.find((r) => r.id === rowId)?.code,
                nb.batchNo
              );
              return (
                <tr
                  key={`${nb.batchNo}-${i}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleBatchPick(rowId, nb);
                  }}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f4f4f4",
                  }}
                >
                  <td style={{ padding: 6, fontWeight: 600 }}>
                    {nb.batchNo || "(no batch)"}
                  </td>
                  <td style={{ padding: 6 }}>{Number(nb.mrp || 0).toFixed(2)}</td>
                  <td style={{ padding: 6 }}>{Number(nb.rate || 0).toFixed(2)}</td>
                  <td style={{ padding: 6 }}>{nb.gst}%</td>
                  <td style={{ padding: 6 }}>{available}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>,
      portalRoot
    );
  };

  // ---------------- Keyboard "Enter to next" ----------------
  function handleEnterKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      if (!form) return;
      const elements = Array.from(form.elements).filter(
        (el) => el.tagName === "INPUT" && el.type !== "hidden"
      );
      const index = elements.indexOf(e.target);
      if (elements[index + 1]) {
        elements[index + 1].focus();
      }
    }
  }

  // ===========================
  //         RETURN UI
  // ===========================
  return (
  <div className="salesbill-container p-8">
    {/* ✅ Popup Message */}
    {popup.message && (
      <div className={`popup-message ${popup.type}`}>{popup.message}</div>
    )}

    {/* Header */}
    <div className="salesbill-header">
      <div>
        <h1 className="salesbill-title"   style={{ color: "#008f5e;" }}>Sales Bill</h1>
      </div>
      <button className="add-btn" onClick={openAddModal}>
  <FaPlus /> Add Sales
</button>

    </div>

    {/* Toolbar */}
   
  
<div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
  {/* Left: Search Box */}
  <div className="flex min-w-[200px]">
    <input
      type="text"
      placeholder="Search Bill No / Customer name / Mobile No"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="!w-[350px] !md:w-[350px]  h-8 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] transition placeholder-gray-400"
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

  {/* Right: Buttons */}
  {/* <div className="flex gap-2 flex-wrap">
    <button
      onClick={() => fetchBills(1)}
      className="text-sm h-8 bg-[#007867] text-white px-3 py-1 rounded hover:bg-[#005f50] transition-shadow shadow-sm"
    >
      Search
    </button>
    <button
      onClick={() => { setSearch(""); setFilter(""); setFromDate(""); setToDate(""); fetchBills(1); }}
      className="text-sm h-8 bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 transition-shadow shadow-sm"
    >
      Reset
    </button>
  </div> */}
</div>


    {/* Table List */}


    {/* <div className="salesbill-table-wrapper">
  {loading ? (
    <p className="muted">Loading…</p>
  ) : filteredBills.length === 0 ? (
    <p className="muted">No records found</p>
  ) : (
    <table className="salesbill-table clean full-width">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Date</th>
          <th>Bill No</th>
          <th>Customer</th>
          <th>Net Amount</th>
          <th>Action</th>
        </tr>
      </thead>
   
      <tbody>
  {filteredBills.map((bill, i) => (
    <tr key={bill._id} className="fade-in">
      <td>{i + 1}</td>
      <td>{formatDate(bill.date)}</td>
      <td>{bill.billNo}</td>
      <td>{bill.customerName || bill.meta?.customerName || ""}</td>
      <td>{Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}</td>
      <td className="salesbill-actions">
        <button
          onClick={() => setViewBill(bill)}
          className="action-btn view"
        >
          <FaEye title="View" />
        </button>
        <button
          onClick={() => handleEditBill(bill)}
          className="action-btn edit"
        >
          <FaEdit title="Edit" />
        </button>
      </td>
    </tr>
  ))}
</tbody>

    </table>
  )}
</div> */}

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
                      <FaEye  />
                    </button>
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="px-2 text-[#00A76F] hover:text-[#007867]"
                    >
                      <FaEdit color="orange" />
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


    {/* Add/Edit Modal */}
    {showModal && (
      <div className="modal fade-in">
        <div className="modal-content slide-up large">
          <div className="modal-header">
            <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
            <button className="icon-close" onClick={() => setShowModal(false)}>
              ×
            </button>
          </div>

          {/* Meta */}
          <form className="bill-meta">
            <div className="meta-grid">
    
       <label className="">
          Bill No:
          <input
            type="text"
            value={meta.billNo || ""}
            readOnly
            style={{ background: "#f8f8f8", width: "150px" }}
            className="!w-[200px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
          />
        </label>
      


              <label>
                Date <input type="date" value={meta.date} readOnly className="!w-[200px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400" />
              </label>
              <label>
                Counter
                <input
                  type="number"
                  value={meta.counter}
                  onKeyDown={handleEnterKey}
                  onChange={(e) =>
                    setMeta({ ...meta, counter: e.target.value })
                  }
                  className="!w-[200px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400" 
                />
              </label>
              <label style={{ flex: "2" }}>
                Customer Name
                <input
                  value={meta.customerName}
                  onKeyDown={handleEnterKey}
                  onChange={(e) =>
                    setMeta({ ...meta, customerName: e.target.value })
                  }
                     placeholder="Enter a Customer Name"
                  className="!w-[200px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400" 
                />
              </label>
              <label>
                Mobile
                <input
                  type="text"
                  value={meta.mobile}
                  maxLength={10}
                  onKeyDown={handleEnterKey}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 10) value = value.slice(0, 10);
                    setMeta({ ...meta, mobile: value });
                  }}
                  placeholder="Enter a Mobile number"
                  className="!w-[200px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400" 
                />
              </label>
            </div>
          </form>

        

              {/* Items table */}
{/* Items table */}
          {/* Items Table */}
           <table
            className="salesbill-table clean full-width"
            style={{ tableLayout: "fixed" }}
          >
            <thead>
              <tr>
                <th style={{ width: "50px" }}>S.No</th>
                <th style={{ width: "140px" }}>Product Code</th>
                <th style={{ width: "190px" }}>Product Name</th>
                <th style={{ width: "200px" }}>Batch</th>
                <th style={{ width: "100px" }}>MRP</th>
                <th style={{ width: "90px" }}>Rate</th>
                <th style={{ width: "80px" }}>GST%</th>
                <th style={{ width: "80px" }}>Qty</th>
                <th style={{ width: "90px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td className="relative">
                      <input
                        data-row={row.id}
                        data-field="code"
                        value={row.code || ""}
                        onKeyDown={(e) => {
                          handleSuggestionKey(e, row.id, "code");
                          handleEnterKey(e);
                        }}
                        disabled={!row.isNew && editRowId !== row.id}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateRow(row.id, "code", v === "0" ? "" : v);
                          if (v.trim() === "") {
                            updateRow(row.id, "batch", "");
                            updateRow(row.id, "mrp", 0);
                            updateRow(row.id, "rate", 0);
                            updateRow(row.id, "gst", 0);
                            updateRow(row.id, "qty", 0);
                          }
                          suggestCodesDebounced(row.id, v || "");
                        }}
                        onFocus={() => {
                          if (row.code) {
                            setShowCodeList((v) => ({ ...v, [row.id]: true }));
                            suggestCodesDebounced(row.id, row.code || "");
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowCodeList((v) => ({ ...v, [row.id]: false }));
                          }, 150);
                        }}
                        placeholder="Type or scan code"
                        
                      />
                      {/* keep original block but hide; portals are used */}
                      {showCodeList[row.id] &&
                        (codeSuggestions[row.id] || []).length > 0 && (
                          <div className="suggestions" style={{display:'none'}}>
                            {(codeSuggestions[row.id] || []).map((p) => (
                              <div
                                key={p._id || `${p.code}-${p.name}`}
                                className="suggestion"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSuggestion(row.id, p);
                                }}
                              >
                                <div style={{ fontWeight: "600" }}>{p.code}</div>
                                <div style={{ fontSize: 12 }}>{p.name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      {renderCodeSuggestionPortal(row.id)}
                    </td> 
                     <td className="relative">
                      <input
                        data-row={row.id}
                        data-field="name"
                        value={row.name || ""}
                        onKeyDown={(e) => {
                          handleSuggestionKey(e, row.id, "name");
                          handleEnterKey(e);
                        }}
                        disabled={!row.isNew && editRowId !== row.id}
                        
                        onChange={(e) => {
                          const v = e.target.value;
                          updateRow(row.id, "name", v);
                          if (v.trim() === "") {
                            updateRow(row.id, "batch", "");
                            updateRow(row.id, "mrp", 0);
                            updateRow(row.id, "rate", 0);
                            updateRow(row.id, "gst", 0);
                            updateRow(row.id, "qty", 0);
                          }
                          suggestNamesDebounced(row.id, v || "");
                        }}
                        onFocus={() => {
                          if (row.name) {
                            setShowNameList((v) => ({ ...v, [row.id]: true }));
                            suggestNamesDebounced(row.id, row.name || "");
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowNameList((v) => ({ ...v, [row.id]: false }));
                          }, 150);
                        }}
                        placeholder="Type or select product"
                      />
                      {/* keep original block but hide; portals are used */}
                      {showNameList[row.id] &&
                        (nameSuggestions[row.id] || []).length > 0 && (
                          <div className="suggestions" style={{display:'none'}}>
                            {(nameSuggestions[row.id] || []).map((p) => (
                              <div
                                key={p._id || `${p.code}-${p.name}`}
                                className="suggestion"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSuggestion(row.id, p);
                                }}
                              >
                                <div style={{ fontWeight: "600" }}>{p.name}</div>
                                <div style={{ fontSize: 12 }}>{p.code}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      {renderNameSuggestionPortal(row.id)}
                    </td>

                    

                    <td className="relative">
                      <input
                        className="input"
                        data-row={row.id}
                        data-field="batch"
                        placeholder="Enter or select batch number"
                        value={row.batch}
                        disabled={!row.isNew && editRowId !== row.id}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, batch: v } : r))
                          );
                          setShowBatchList((m) => ({ ...m, [row.id]: v.trim() === "" }));
                        }}
                        onFocus={() => {
                          if (row.name) {
                            const batches = getBatchesForName(row.name);
                            setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
                          } else if (row.code) {
                            const batches = getBatchesForCode(row.code);
                            setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
                          }
                          setShowBatchList((m) => ({ ...m, [row.id]: true }));
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowBatchList((m) => ({
                              ...m,
                              [row.id]: !!row.batch ? false : m[row.id],
                            }));
                          }, 150);
                        }}
                      />
                      {/* keep original inline list hidden; portals handle UI */}
                      {Array.isArray(batchesByRow[row.id]) &&
                        batchesByRow[row.id].length > 0 &&
                        showBatchList[row.id] && (
                          <div
                            className="batch-suggestions"
                            style={{
                              maxHeight: 300,
                              overflowY: "auto",
                              border: "1px solid #eee",
                              background: "#fff",
                              zIndex: 50,
                              width: 500,
                              display:'none'
                            }}
                          >
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ background: "#fafafa", fontSize: 13 }}>
                                  <th style={{ padding: 4 }}>Batch</th>
                                  <th style={{ padding: 4 }}>MRP</th>
                                  <th style={{ padding: 4 }}>Rate</th>
                                  <th style={{ padding: 4 }}>GST%</th>
                                  <th style={{ padding: 4 }}>Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {batchesByRow[row.id].map((b) => {
                                  const available = getAvailableStock(b.code, b.batchNo);
                                  return (
                                    <tr
                                      key={`${b.batchNo}-${b.rate}-${b.mrp}`}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleBatchPick(row.id, b);
                                      }}
                                      style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid #f4f4f4",
                                      }}
                                    >
                                      <td style={{ padding: 4, fontWeight: 600 }}>
                                        {b.batchNo || "(no batch)"}
                                      </td>
                                      <td style={{ padding: 4 }}>{Number(b.mrp || 0).toFixed(2)}</td>
                                      <td style={{ padding: 4 }}>{Number(b.rate || 0).toFixed(2)}</td>
                                      <td style={{ padding: 4 }}>{b.gst}%</td>
                                      <td style={{ padding: 4 }}>{available}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      {renderBatchPortal(row.id)}
                    </td>
                    <td>
                      <input
                        type="number"
                        {...numberInputProps}
                        value={row.mrp || 0}
                        onFocus={(e) => {
                          if (String(e.target.value) === "0") e.target.value = "";
                          enableWheelBlock();
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") updateRow(row.id, "mrp", 0);
                          disableWheelBlock();
                        }}
                        disabled={!row.isNew && editRowId !== row.id}
                        onChange={(e) => updateRow(row.id, "mrp", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        {...numberInputProps}
                        value={row.rate || 0}
                        onFocus={(e) => {
                          if (String(e.target.value) === "0") e.target.value = "";
                          enableWheelBlock();
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") updateRow(row.id, "rate", 0);
                          disableWheelBlock();
                        }}
                        disabled={!row.isNew && editRowId !== row.id}
                        onChange={(e) => updateRow(row.id, "rate", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        {...numberInputProps}
                        value={row.gst || 0}
                        onFocus={(e) => {
                          if (String(e.target.value) === "0") e.target.value = "";
                          enableWheelBlock();
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") updateRow(row.id, "gst", 0);
                          disableWheelBlock();
                        }}
                        disabled={!row.isNew && editRowId !== row.id}
                        onChange={(e) => updateRow(row.id, "gst", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        {...numberInputProps}
                        value={row.qty ? row.qty : ""}
                        onFocus={(e) => {
                          if (String(e.target.value) === "0") e.target.value = "";
                          enableWheelBlock();
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") updateRow(row.id, "qty", 0);
                          disableWheelBlock();
                        }}
                        disabled={!row.isNew && editRowId !== row.id}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const qty = raw === "" ? 0 : Number(raw);
                          updateRow(row.id, "qty", qty);

                          const available = row.batch
                            ? getAvailableStock(row.code, row.batch)
                            : null;

                          if (available !== null && qty > available) {
                            setRowStockError(
                              row.id,
                              `Out of stock: requested ${qty}, only ${available} available`
                            );
                          } else {
                            setRowStockError(row.id, null);
                          }
                        }}
                      />
                    </td>
                    <td className="row-actions">
                      {row.isNew ? (
                        <button onClick={() => addRow(row.id)} className="plus">
                          <FaPlus />
                        </button>
                      ) : editRowId === row.id ? (
                        <>
                          <button
                            onClick={() => saveRowEdit(row.id)}
                            className="success"
                            style={{ color: "green" }}
                          >
                            <FaCheck />
                          </button>
                          <button onClick={cancelRowEdit} className="danger">
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditRowId(row.id)}
                            className="edit"
                          >
                            <FaEdit />
                          </button>
                          <button onClick={() => deleteRow(row.id)} className="danger">
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {stockErrors[row.id] && (
                    <tr>
                      <td colSpan="9" style={{ color: "red", fontSize: 13 }}>
                        ❌ {stockErrors[row.id]}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table> 

    




{/* --------------------------
✅ Error Display
--------------------------- */}
{Object.keys(stockErrors).length > 0 && (
  <div style={{ color: "red", marginTop: 10 }}>
    {Object.values(stockErrors).map((msg, i) => (
      <div key={i}>❌ {msg}</div>
    ))}
  </div>
)}

{errorMsg && <p className="error">{errorMsg}</p>}

          {Object.keys(stockErrors).length > 0 && (
            <div style={{ color: "red", marginTop: 10 }}>
              {Object.values(stockErrors).map((msg, i) => (
                <div key={i}>❌ {msg}</div>
              ))}
            </div>
          )}

          {errorMsg && <p className="error">{errorMsg}</p>} 





              {Object.keys(stockErrors).length > 0 && <div style={{ color: "red", marginTop: 10 }}>{Object.values(stockErrors).map((msg, i) => <div key={i}>❌ {msg}</div>)}</div>}
              {errorMsg && <p className="error">{errorMsg}</p>}


{/* Global Stock Errors */}
{/* {Object.keys(stockErrors).length > 0 && (
  <div style={{ color: "red", marginTop: 10 }}>
    {Object.values(stockErrors).map((msg, i) => (
      <div key={i}>❌ {msg}</div>
    ))}
  </div>
)}

{errorMsg && <p className="error">{errorMsg}</p>} */}

{/* Totals */}
<div
  className="totals-layout"
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "2rem",
    marginTop: "2rem",
    flexWrap: "wrap",
  }}
>
  {/* Left column */}
  <div
    className="totals-left"
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      flex: "1",
      minWidth: "150px",
    }}
  >
    {[
      { label: "Total", value: totals.total, readOnly: true },
      { label: "Discount", value: totals.discount, readOnly: false },
      { label: "Net Amount", value: totals.netAmount, readOnly: true },
      { label: "Cash Given", value: totals.cashGiven, readOnly: false },
      { label: "Balance", value: totals.balance, readOnly: true },
    ].map((item, idx) => (
      <div
        key={idx}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
      >
        <span style={{ fontWeight: 300, fontSize: "1rem", minWidth: "100px" }}>
          {item.label}
        </span>
        <input
          type="number"
          readOnly={item.readOnly}
          value={item.readOnly ? item.value.toFixed(2) : item.value === 0 ? "0" : item.value}
          onFocus={(e) => !item.readOnly && e.target.value === "0" && (e.target.value = "")}
          onBlur={(e) => {
            if (!item.readOnly && e.target.value === "") {
              const val = 0;
              setTotals((prev) => ({ ...prev, [item.label.toLowerCase().replace(" ", "")]: val }));
            }
          }}
          onChange={(e) => {
            if (!item.readOnly) {
              const val = Number(e.target.value) || 0;
              setTotals((prev) => ({ ...prev, [item.label.toLowerCase().replace(" ", "")]: val }));
            }
          }}
          onWheel={(e) => e.target.blur()} // disable mouse scroll change
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            fontWeight: 500,
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            textAlign: "right",
            transition: "all 0.3s ease",
            backgroundColor: "#f9f9f9",
          }}
        />
      </div>
    ))}
  </div>

  {/* Right column - Bill Summary */}
  <div
    className="totals-right"
    style={{
      minWidth: "350px",
      flex: "0 0 220px",
      backgroundColor: "#f0f8f5",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      animation: "fadeInRight 0.5s ease forwards",
    }}
  >
    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "#007867" }}>
      Bill Summary
    </h3>
    <div className="summary-line" style={{ display: "flex", justifyContent: "space-between" }}>
      <span>CGST</span>
      {/* <strong>{totals.cgst.toFixed(2)}</strong> */}
      <strong>{Number(totals.cgst || 0).toFixed(2)}</strong>
    </div>
    <div className="summary-line" style={{ display: "flex", justifyContent: "space-between" }}>
      <span>SGST</span>
      {/* <strong>{totals.sgst.toFixed(2)}</strong> */}
      <strong>{Number(totals.sgst || 0).toFixed(2)}</strong>
    </div>
    <hr style={{ border: "0.5px solid #ddd" }} />
    <div className="summary-total" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
      <span>Bill Amount</span>
      {/* <strong>{totals.netAmount.toFixed(2)}</strong> */}
      <strong>{Number(totals.netAmount || 0).toFixed(2)}</strong>

    </div>
  </div>

  {/* Animation */}
  <style>
    {`
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      input:focus {
        border-color: #007867;
        box-shadow: 0 0 5px rgba(0, 167, 111, 0.3);
        outline: none;
      }
    `}
  </style>
</div>


{/* Totals */}




          <div className="modal-actions">
            <button className="primary" onClick={handleSaveAndPrint}>
              Print
            </button>
          </div>
        </div>
      </div>
    )}


    {/* View Bill Modal */}
{/* {viewBill && (
  <div className="modal fade-in">
    <div className="modal-content slide-up large">
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
      <div className="modal-actions">
        <button className="secondary" onClick={() => setViewBill(null)}>
          Close
        </button>
      </div>
    </div>
  </div>
)} */}


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
      {/* <div className="modal-actions">
        <button className="secondary" onClick={() => setViewBill(null)}>
          Close
        </button>
      </div> */}
    </div>
  </div>
)}


  </div>
);

} 


// end component

// // src/pages/SalesBill.jsx
// import React, { useState, useEffect, useMemo, useRef } from "react";
// import ReactDOM from "react-dom";
// import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../styles/salesbill.css";
// import { useAuth } from "../context/AuthContext";
// import { getAuthHeaders, API } from "../utils/apiHeaders";
// import Pagination from "../components/Pagination";
// // lodash.debounce is available in your project; using small local debounce helper below as well
// // import debounce from "lodash.debounce";

// const axiosInstance = axios.create({ baseURL: API });

// export default function SalesBill() {
//   const { user } = useAuth();
//   const token = localStorage.getItem("token");
//   const shopname = user?.shopname || localStorage.getItem("shopname");

//   // ---- State ----
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [rows, setRows] = useState([createEmptyRow()]);
//   const [products, setProducts] = useState([]);
//   const [meta, setMeta] = useState({
//     billNo: "",
//     date: "",
//     counter: 1,
//     customerName: "",
//     mobile: "",
//   });
//   const [totals, setTotals] = useState({
//     total: 0,
//     discount: 0,
//     netAmount: 0,
//     cashGiven: 0,
//     balance: 0,
//     cgst: 0,
//     sgst: 0,
//   });
//   const [reservedStock, setReservedStock] = useState({});
//   const [popup, setPopup] = useState({ message: "", type: "" });
//   const [showModal, setShowModal] = useState(false);
//   const [billEditMode, setBillEditMode] = useState(false);
//   const [editingBillId, setEditingBillId] = useState(null);

//   // suggestion states keyed by row.id
//   const [nameSuggestions, setNameSuggestions] = useState({});
//   const [codeSuggestions, setCodeSuggestions] = useState({});
//   const [batchesByRow, setBatchesByRow] = useState({});
//   const [showBatchList, setShowBatchList] = useState({});
//   const [showNameList, setShowNameList] = useState({});
//   const [showCodeList, setShowCodeList] = useState({});
//   const [stockErrors, setStockErrors] = useState({});
//   const [rowStockError, setRowStockError] = useState({});

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [viewBill, setViewBill] = useState(null);

//   const [editRowId, setEditRowId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [originalRowData, setOriginalRowData] = useState({});
//   const [originalBillItems, setOriginalBillItems] = useState({});

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10;

//   const [stockCache, setStockCache] = useState({});

//   const suggestionRefs = useRef({}); // keyboard support refs per row/field
//   const portalRoot = typeof document !== "undefined" ? document.body : null;

//   // ---- small helpers ----
//   function createEmptyRow() {
//     return {
//       id: generateUniqueId(),
//       code: "",
//       name: "",
//       batch: "",
//       mrp: 0,
//       rate: 0,
//       qty: 0,
//       gst: 0,
//       amount: 0,
//       value: 0,
//       isNew: true,
//     };
//   }

//   const keyFor = (code, batch) =>
//     `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

//   const showPopup = (message, type = "error") => {
//     setPopup({ message, type });
//     setTimeout(() => setPopup({ message: "", type: "" }), 2500);
//   };

//   const numberInputProps = { onWheel: (e) => e.target.blur() };

//   // enable/disable wheel blocking on number inputs (UX small helpers)
//   const enableWheelBlock = () => {
//     document?.addEventListener("wheel", preventWheel, { passive: false });
//   };
//   const disableWheelBlock = () => {
//     document?.removeEventListener("wheel", preventWheel);
//   };
//   function preventWheel(e) {
//     if (document.activeElement && document.activeElement.type === "number") {
//       e.preventDefault();
//     }
//   }

//   // -------------- fetch products --------------
//   const fetchProducts = async () => {
//     try {
//       const { data } = await axiosInstance.get("/api/products", {
//         headers: getAuthHeaders(user),
//       });

//       const productList = Array.isArray(data)
//         ? data
//         : Array.isArray(data.products)
//         ? data.products
//         : [];

//       setProducts(
//         productList.map((p) => ({
//           ...p,
//           code: p.code || "",
//           name: p.name || "",
//           // normalize either batches array or single batchNo + qty fields
//           batches:
//             Array.isArray(p.batches) && p.batches.length
//               ? p.batches.map((b) => ({
//                   batchNo: b.batchNo || b.batch || "",
//                   mrp: Number(b.mrp || b.price || p.mrp || 0),
//                   rate: Number(b.rate || b.salePrice || p.salePrice || 0),
//                   gst: Number(b.gst || b.taxPercent || p.taxPercent || 0),
//                   qty: Number(b.qty || 0),
//                   ...b,
//                 }))
//               : [
//                   {
//                     batchNo: p.batchNo || "",
//                     mrp: Number(p.mrp || p.price || 0),
//                     rate: Number(p.salePrice || p.rate || 0),
//                     gst: Number(p.taxPercent || p.gst || 0),
//                     qty: Number(p.qty || 0),
//                   },
//                 ],
//           qty: Number(p.qty || 0),
//           mrp: Number(p.mrp || p.price || 0),
//           salePrice: Number(p.salePrice || p.price || 0),
//           taxPercent: Number(p.taxPercent || 0),
//           _id: p._id || p.id || null,
//         }))
//       );
//     } catch (e) {
//       console.error("Error fetching products", e);
//       setProducts([]);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // ---------------- bills (unchanged) ----------------
//   const fetchBills = async (pageNum = 1) => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams({
//         page: pageNum,
//         limit,
//         search,
//         filter,
//         fromDate,
//         toDate,
//       });
//       const { data } = await axiosInstance.get(`/api/sales?${params.toString()}`, {
//         headers: getAuthHeaders(user),
//       });
//       setBills(Array.isArray(data.bills) ? data.bills : []);
//       setTotalPages(data.totalPages || 1);
//       setPage(data.page || pageNum);
//     } catch (error) {
//       console.error("Error fetching bills", error);
//       setBills([]);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBills(1);
//   }, [page, search, filter, fromDate, toDate]);

//   const fetchBillNo = async () => {
//     try {
//       if (!token || !shopname) {
//         console.error("Missing token or shopname");
//         return;
//       }
//       const { data } = await axiosInstance.get("/api/sales/next-billno", {
//         headers: { ...getAuthHeaders(user), "x-shopname": shopname },
//       });
//       const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
//       setMeta((prev) => ({ ...prev, billNo: data.nextBillNo, date: istDate.toISOString().split("T")[0] }));
//     } catch (e) {
//       console.error("Failed to fetch bill number", e);
//     }
//   };

//   useEffect(() => {
//     if (token && shopname) {
//       fetchProducts();
//       fetchBillNo();
//       fetchBills();
//     }
//   }, [token, shopname]);

//   // debounce helper
//   const debounceFn = (fn, delay = 220) => {
//     let timer;
//     return (...args) => {
//       clearTimeout(timer);
//       timer = setTimeout(() => fn(...args), delay);
//     };
//   };

//   // ---------------- Suggestion logic ----------------
//   // dedupe helper (by code+name)
//   const uniqueProducts = (arr) => {
//     const seen = new Set();
//     return arr.filter((p) => {
//       const key = `${(p.code || "").trim()}|${(p.name || "").trim()}`;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });
//   };

//   const suggestNamesDebounced = useMemo(
//     () =>
//       debounceFn((rowId, query) => {
//         if (!String(query || "").trim()) {
//           setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//           setShowNameList((s) => ({ ...s, [rowId]: false }));
//           return;
//         }
//         const q = query.toLowerCase();
//         const matches = uniqueProducts(products.filter((p) => (p.name || "").toLowerCase().includes(q)));
//         setNameSuggestions((s) => ({ ...s, [rowId]: matches.slice(0, 20) }));
//         setShowNameList((s) => ({ ...s, [rowId]: matches.length > 0 }));
//       }, 180),
//     [products]
//   );

//   const suggestCodesDebounced = useMemo(
//     () =>
//       debounceFn((rowId, query) => {
//         if (!String(query || "").trim()) {
//           setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//           setShowCodeList((s) => ({ ...s, [rowId]: false }));
//           return;
//         }
//         const q = query.toLowerCase();
//         const matches = uniqueProducts(products.filter((p) => (p.code || "").toLowerCase().includes(q)));
//         setCodeSuggestions((s) => ({ ...s, [rowId]: matches.slice(0, 20) }));
//         setShowCodeList((s) => ({ ...s, [rowId]: matches.length > 0 }));
//       }, 180),
//     [products]
//   );

//   // helpers to get batches for code/name
//   const getBatchesForCode = (code) => {
//     if (!code) return [];
//     const matches = products.filter((p) => (p.code || "").toLowerCase() === (code || "").toLowerCase());
//     const batches = matches.flatMap((p) => (Array.isArray(p.batches) ? p.batches : []));
//     return batches;
//   };
//   const getBatchesForName = (name) => {
//     if (!name) return [];
//     const matches = products.filter((p) => (p.name || "").toLowerCase() === (name || "").toLowerCase());
//     const batches = matches.flatMap((p) => (Array.isArray(p.batches) ? p.batches : []));
//     return batches;
//   };

//   // available stock computed from products state and reservedStock
//   const getAvailableStock = (code, batch) => {
//     const base = products
//       .filter(
//         (p) =>
//           (p.code || "").toLowerCase() === (code || "").toLowerCase() &&
//           ((p.batchNo || "").toLowerCase() === (batch || "").toLowerCase() || (p.batches || []).some((b) => (b.batchNo || "").toLowerCase() === (batch || "").toLowerCase()))
//       )
//       .reduce((sum, p) => {
//         // If product has batches, sum matching batch qty; else use p.qty
//         if (Array.isArray(p.batches) && p.batches.length) {
//           return (
//             sum +
//             p.batches.reduce((s, b) => s + ((b.batchNo || "").toLowerCase() === (batch || "").toLowerCase() ? Number(b.qty || 0) : 0), 0)
//           );
//         }
//         return sum + Number(p.qty || 0);
//       }, 0);
//     const reserved = Number(reservedStock[keyFor(code, batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   // recalc row totals
//   const recalcRow = (r) => {
//     const rate = Number(r.rate || 0);
//     const qty = Number(r.qty || 0);
//     const gst = Number(r.gst || 0);
//     const amount = +(rate * qty).toFixed(2);
//     const value = +(amount + (amount * gst) / 100).toFixed(2);
//     return { ...r, amount, value };
//   };

//   // ---------------- Row CRUD ----------------
//   const addRow = (id) => {
//     const row = rows.find((r) => r.id === id);
//     if (!row || !row.code || !row.name || !row.batch || !row.qty || !row.rate)
//       return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code, row.batch);
//     if (available < row.qty) return showPopup(`Only ${available} left`);
//     const k = keyFor(row.code, row.batch);
//     setReservedStock((rs) => ({ ...rs, [k]: (rs[k] || 0) + Number(row.qty) }));
//     setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isNew: false } : r)).concat(createEmptyRow()));
//   };

//   const deleteRow = (id) => {
//     const row = rows.find((r) => r.id === id);
//     if (row && !row.isNew) {
//       const k = keyFor(row.code, row.batch);
//       setReservedStock((rs) => ({ ...rs, [k]: Math.max(0, (rs[k] || 0) - Number(row.qty)) }));
//     }
//     setRows((prev) => prev.filter((r) => r.id !== id));
//   };

//   const cancelRowEdit = () => {
//     if (!editRowId) return;
//     setRows((prev) =>
//       prev.map((r) => (r.id === editRowId ? { ...originalRowData[editRowId] } : r))
//     );
//     setOriginalRowData((prev) => {
//       const copy = { ...prev };
//       delete copy[editRowId];
//       return copy;
//     });
//     setEditRowId(null);
//   };

//   useEffect(() => {
//     const total = rows.filter((r) => !r.isNew).reduce((s, r) => s + Number(r.amount || 0), 0);
//     const gstTotal = rows.filter((r) => !r.isNew).reduce((s, r) => s + Number(r.amount || 0) * Number(r.gst || 0) / 100, 0);
//     const discount = Number(totals.discount || 0);
//     const netAmount = +(total + gstTotal - discount).toFixed(2);
//     const cashGiven = Number(totals.cashGiven || 0);
//     const balance = +(cashGiven >= netAmount ? cashGiven - netAmount : netAmount - cashGiven).toFixed(2);
//     const cgst = +(gstTotal / 2).toFixed(2);
//     const sgst = +(gstTotal / 2).toFixed(2);
//     setTotals((prev) => ({ ...prev, total, discount, netAmount, balance, cashGiven, cgst, sgst }));
//   }, [rows, totals.discount, totals.cashGiven]);

//   // ---------------- Select suggestion ----------------
//   const handleSelectSuggestion = (rowId, product) => {
//     // set product and clear batch
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.id !== rowId) return r;
//         const updated = {
//           ...r,
//           code: product.code,
//           name: product.name,
//           batch: "",
//           mrp: Number(product.mrp || 0),
//           rate: Number(product.salePrice || product.rate || 0),
//           gst: Number(product.taxPercent || product.gst || 0),
//           qty: 0,
//         };
//         return recalcRow(updated);
//       })
//     );

//     // hide suggestions
//     setShowCodeList((s) => ({ ...s, [rowId]: false }));
//     setShowNameList((s) => ({ ...s, [rowId]: false }));

//     // prepare batches for this row
//     const batches = product.batches || getBatchesForCode(product.code) || [];
//     setBatchesByRow((b) => ({ ...b, [rowId]: batches }));
//     setShowBatchList((b) => ({ ...b, [rowId]: batches.length > 0 }));

//     // focus batch input after selection (small delay)
//     setTimeout(() => {
//       const el = document.querySelector(`input[data-row="${rowId}"][data-field="batch"]`);
//       el?.focus();
//     }, 40);
//   };

//   // update row with recalc
//   const updateRow = (id, field, value, skipRecalc = false) => {
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.id !== id) return r;
//         let val = value;
//         if (["mrp", "rate", "gst", "qty"].includes(field)) {
//           val = Number(value) || 0;
//         }
//         const updated = { ...r, [field]: val };

//         // if field is code or name and user is typing (change) - reset auto filled fields
//         if ((field === "code" || field === "name") && typeof value === "string") {
//           // if user changed existing value even by one character, clear product/batch auto-fill
//           // BUT keep the typed value itself
//           updated.batch = "";
//           updated.mrp = 0;
//           updated.rate = 0;
//           updated.gst = 0;
//           updated.qty = 0;
//           // hide batch list
//           setShowBatchList((s) => ({ ...s, [id]: false }));
//           setBatchesByRow((b) => ({ ...b, [id]: [] }));
//         }

//         return skipRecalc ? updated : recalcRow(updated);
//       })
//     );
//   };

//   // normalize batch object (used when selecting batch)
//   const normalizeBatch = (m) => ({
//     ...m,
//     batchNo: m.batchNo || "",
//     mrp: Number(m.mrp || 0),
//     rate: Number(m.rate || m.salePrice || 0),
//     gst: Number(m.gst || m.taxPercent || 0),
//     qty: Number(m.qty || 0),
//   });

//   const handleBatchPick = (rowId, batch) => {
//     const nb = normalizeBatch(batch);
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.id !== rowId) return r;
//         const updated = {
//           ...r,
//           batch: nb.batchNo || "",
//           mrp: Number(nb.mrp || 0),
//           rate: Number(nb.rate || 0),
//           gst: Number(nb.gst || 0),
//           qty: 0,
//         };
//         return recalcRow(updated);
//       })
//     );

//     setShowBatchList((s) => ({ ...s, [rowId]: false }));
//   };

//   // small utility: openBatchList
//   const openBatchList = (rowId) => {
//     setShowBatchList((s) => ({ ...s, [rowId]: true }));
//   };

//   // ---------------- Keyboard navigation for suggestions ----------------
//   // We'll keep focused index per row+field in suggestionRefs.current
//   // keyHandler supports up/down/enter/escape
//   const handleSuggestionKey = (e, rowId, field) => {
//     const key = e.key;
//     const listKey = field === "code" ? "codeSuggestions" : "nameSuggestions";
//     const suggestionsList = field === "code" ? codeSuggestions[rowId] || [] : nameSuggestions[rowId] || [];

//     suggestionRefs.current[rowId] = suggestionRefs.current[rowId] || {};
//     const state = suggestionRefs.current[rowId][field] || { index: -1 };
//     let idx = state.index;

//     if (key === "ArrowDown") {
//       e.preventDefault();
//       idx = Math.min((suggestionsList.length || 0) - 1, idx + 1);
//     } else if (key === "ArrowUp") {
//       e.preventDefault();
//       idx = Math.max(0, idx - 1);
//     } else if (key === "Enter") {
//       if (idx >= 0 && suggestionsList[idx]) {
//         e.preventDefault();
//         handleSelectSuggestion(rowId, suggestionsList[idx]);
//         suggestionRefs.current[rowId][field] = { index: -1 };
//         return;
//       }
//     } else if (key === "Escape") {
//       setShowCodeList((s) => ({ ...s, [rowId]: false }));
//       setShowNameList((s) => ({ ...s, [rowId]: false }));
//       suggestionRefs.current[rowId][field] = { index: -1 };
//       return;
//     } else {
//       // other keys don't change selection
//       suggestionRefs.current[rowId][field] = { index: -1 };
//       return;
//     }
//     suggestionRefs.current[rowId][field] = { index: idx };
//     // force re-render to show highlighted item by storing small dummy state update: we can toggle a ref-based state
//     // Simpler: update a dummy state to re-render. But to keep file minimal, we won't force re-render here — highlight not strictly required.
//   };

//   // -------------- Save / edit / print (unchanged majority) --------------
//   const saveRowEdit = async (rowId) => {
//     const row = rows.find((r) => r.id === rowId);
//     if (!row) return;

//     if (!row.code || !row.name || !row.batch || row.qty === undefined || row.rate === undefined) {
//       showPopup("⚠️ Please fill all required fields before saving.");
//       return;
//     }

//     const newQty = Number(row.qty);
//     const oldQty = Number(originalBillItems?.[rowId]?.qty || 0);

//     const product = products.find((p) => p.code === row.code && p.name === row.name);
//     const batches = product ? getBatches(product) : [{ batchNo: row.batch, qty: 0 }];
//     const batchInfo = batches.find((b) => b.batchNo === row.batch) || { qty: 0 };

//     const stockBefore = batchInfo.qty;

//     let resultingStock = stockBefore;
//     let actionType = "none";
//     let qtyChange = 0;

//     if (newQty > oldQty) {
//       qtyChange = newQty - oldQty;
//       resultingStock = stockBefore - qtyChange;
//       actionType = "decrement";
//     } else if (newQty < oldQty) {
//       qtyChange = oldQty - newQty;
//       resultingStock = stockBefore + qtyChange;
//       actionType = "increment";
//     }

//     if (resultingStock < 0) {
//       setStockErrors((prev) => ({
//         ...prev,
//         [rowId]: `⚠️ Only ${stockBefore + oldQty} available. Enter a smaller quantity.`,
//       }));
//       return;
//     } else {
//       setStockErrors((prev) => {
//         const copy = { ...prev };
//         delete copy[rowId];
//         return copy;
//       });
//     }

//     setRows((prev) =>
//       prev.map((r) => (r.id === rowId ? { ...r, qty: newQty, isNew: false, edited: true, resultingStock } : r))
//     );

//     setOriginalBillItems((prev) => ({ ...prev, [rowId]: { code: row.code, batch: row.batch, qty: newQty } }));

//     // Backend stock update simplified (kept as in original)
//     if (actionType !== "none" && qtyChange > 0) {
//       try {
//         const headers = getAuthHeaders(user);
//         if (actionType === "decrement") {
//           await axiosInstance.put(
//             "/api/products/decrement-stock",
//             { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
//             { headers }
//           );
//         } else if (actionType === "increment") {
//           await axiosInstance.put(
//             "/api/products/increment-stock",
//             { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
//             { headers }
//           );
//         }
//       } catch (err) {
//         console.error("Backend stock update failed:", err.response?.data || err.message);
//         showPopup("⚠️ Failed to update stock on server. UI updated only.");
//       }
//     }

//     setEditRowId(null);
//     showPopup("✅ Row updated and stock synced successfully.");
//   };

//   const getBatches = (prod) => {
//     const product = products.find((p) => p.code === prod.code && p.name === prod.name);
//     if (!product) return [];

//     if (Array.isArray(product.batches) && product.batches.length) {
//       return product.batches.map((b) => ({
//         batchNo: b.batchNo || "",
//         qty: b.qty || 0,
//         mrp: b.mrp || product.mrp,
//         rate: b.rate || product.rate,
//         gst: b.gst || product.gst,
//         ...b,
//       }));
//     }

//     return [
//       {
//         batchNo: product.batchNo || "",
//         qty: product.qty || 0,
//         mrp: product.mrp,
//         rate: product.rate,
//         gst: product.gst,
//         ...product,
//       },
//     ];
//   };

//   const handleSaveAndPrint = async () => {
//     try {
//       if (!rows.length) {
//         setErrorMsg("Add items before saving.");
//         return;
//       }

//       const validItems = rows.filter((r) => r.code && r.batch && r.qty >= 0);
//       if (!validItems.length) {
//         setErrorMsg("No valid items to save.");
//         return;
//       }

//       const headers = getAuthHeaders(user);
//       const stockLog = [];

//       for (const r of validItems) {
//         const newQty = Number(r.qty);
//         const oldQty = Number(originalBillItems?.[r.id]?.qty || 0);
//         if (newQty === oldQty) continue;

//         const product = products.find((p) => p.code === r.code && p.name === r.name);
//         const batchInfo = product ? getBatches(product).find((b) => b.batchNo === r.batch) || { qty: 0 } : { qty: 0 };

//         const availableStock = getAvailableStock(r.code, r.batch);

//         let resultingStock;
//         let apiCallType;
//         let qtyToUpdate;

//         if (newQty > oldQty) {
//           qtyToUpdate = newQty - oldQty;
//           resultingStock = availableStock - qtyToUpdate;
//           apiCallType = "decrement";
//         } else if (newQty < oldQty) {
//           qtyToUpdate = oldQty - newQty;
//           resultingStock = availableStock + qtyToUpdate;
//           apiCallType = "increment";
//         }

//         if (qtyToUpdate > 0) {
//           const url = apiCallType === "decrement" ? "/api/products/decrement-stock" : "/api/products/increment-stock";
//           await axiosInstance.put(url, { items: [{ code: r.code, batchNo: r.batch, qty: qtyToUpdate }] }, { headers });

//           stockLog.push({
//             Action: apiCallType === "decrement" ? `Decrement ${qtyToUpdate}` : `Increment ${qtyToUpdate}`,
//             "Item Code": r.code,
//             "Batch No": r.batch,
//             "Previous Bill Qty": oldQty,
//             "New Qty": newQty,
//             "Stock Before Edit": availableStock,
//             "Resulting Stock": resultingStock,
//           });
//         }
//       }

//       console.table(stockLog);

//       const salesPayload = {
//         billNo: meta.billNo,
//         date: meta.date || new Date(),
//         counter: meta.counter || 1,
//         customerName: meta.customerName || "Cash Customer",
//         mobile: meta.mobile || "",
//         items: validItems.map((r) => ({
//           code: r.code,
//           name: r.name,
//           batch: r.batch,
//           mrp: Number(r.mrp),
//           rate: Number(r.rate),
//           gst: Number(r.gst),
//           qty: Number(r.qty),
//           amount: Number(r.rate) * Number(r.qty),
//           value: Number(r.rate) * Number(r.qty) * (1 + Number(r.gst) / 100),
//         })),
//         total: totals.total || 0,
//         discount: totals.discount || 0,
//         netAmount: totals.netAmount || 0,
//         cashGiven: totals.cashGiven || 0,
//         balance: totals.balance || 0,
//         cgst: totals.cgst || 0,
//         sgst: totals.sgst || 0,
//       };

//       let savedBill;
//       if (billEditMode && editingBillId) {
//         const { data } = await axiosInstance.put(`/api/sales/${editingBillId}`, salesPayload, { headers });
//         savedBill = data;
//       } else {
//         const { data } = await axiosInstance.post("/api/sales", salesPayload, { headers });
//         savedBill = data;
//       }

//       if (billEditMode) setBills((prev) => prev.map((b) => (b._id === savedBill._id ? savedBill : b)));
//       else setBills((prev) => [savedBill, ...prev]);

//       setViewBill(savedBill);

//       const newOriginalMap = {};
//       validItems.forEach((r) => {
//         newOriginalMap[r.id] = { code: r.code, batch: r.batch, qty: Number(r.qty) };
//       });
//       setOriginalBillItems(newOriginalMap);

//       setTimeout(() => window.print(), 100);
//       setShowModal(false);
//       setRows([createEmptyRow()]);
//       setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
//       setMeta((prev) => ({ ...prev, customerName: "", mobile: "" }));
//       setErrorMsg("");
//       setBillEditMode(false);
//       setEditingBillId(null);
//     } catch (err) {
//       console.error("Save/Print error:", err.response?.data || err.message);
//       setErrorMsg(err.response?.data?.message || "Failed to save/print");
//     }
//   };

//   // Edit bill function unchanged
//   const handleEditBill = (bill) => {
//     if (!bill) return;
//     setBillEditMode(true);
//     setEditingBillId(bill._id);
//     setShowModal(true);
//     const rowsWithId = bill.items.map((item, idx) => ({ ...item, id: item._id || `item-${idx}-${Date.now()}`, isNew: false }));
//     setRows(rowsWithId);
//     setMeta({
//       billNo: bill.billNo || "",
//       date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
//       counter: bill.counter || 1,
//       customerName: bill.customerName || "",
//       mobile: bill.mobile || "",
//     });
//     setTotals({ total: bill.total || 0, discount: bill.discount || 0, netAmount: bill.netAmount || 0, cashGiven: bill.cashGiven || 0, balance: bill.balance || 0, cgst: bill.cgst || 0, sgst: bill.sgst || 0 });
//     const origItemsMap = {};
//     rowsWithId.forEach((item) => {
//       origItemsMap[item.id] = { code: item.code, batch: item.batch, qty: Number(item.qty) || 0 };
//     });
//     setOriginalBillItems(origItemsMap);
//     setTimeout(() => {
//       document.querySelector('input[name="customerName"]')?.focus();
//     }, 200);
//   };

//   useEffect(() => {
//     if (viewBill) {
//       setViewBill((prev) => ({ ...prev, customerName: meta.customerName, mobile: meta.mobile, netAmount: totals.netAmount }));
//     }
//   }, [meta.customerName, meta.mobile, totals.netAmount]);

//   useEffect(() => {
//     const fetchNextBillNo = async () => {
//       try {
//         const headers = getAuthHeaders(user);
//         const { data } = await axiosInstance.get("/api/sales/next-bill-no", { headers });
//         setMeta((prev) => ({ ...prev, billNo: data.billNo }));
//       } catch (err) {
//         console.error("Failed to fetch next bill no:", err.response?.data || err.message);
//         setMeta((prev) => ({ ...prev, billNo: "B001" }));
//       }
//     };
//     if (showModal && !billEditMode) fetchNextBillNo();
//   }, [showModal, billEditMode]);

//   useEffect(() => {
//     if (!showModal) setMeta((prev) => ({ ...prev, billNo: "" }));
//   }, [showModal]);

//   const openAddModal = () => {
//     setBillEditMode(false);
//     setMeta((prev) => ({ ...prev, billNo: "", customerName: "", mobile: "", counter: "", date: new Date().toISOString().slice(0, 10) }));
//     setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
//     setRows([createEmptyRow()]);
//     setStockErrors({});
//     setErrorMsg("");
//     setShowModal(true);
//   };

//   // ---------------- Render helpers for suggestion portals ----------------
//   const renderCodeSuggestionPortal = (rowId) => {
//     if (!portalRoot) return null;
//     const list = codeSuggestions[rowId] || [];
//     if (!showCodeList[rowId] || list.length === 0) return null;

//     // compute position of the input to place portal near it
//     const inputEl = document.querySelector(`input[data-row="${rowId}"][data-field="code"]`);
//     const rect = inputEl?.getBoundingClientRect() || { top: 0, left: 0, width: 300, height: 24 };

//     const portalStyle = {
//       position: "fixed",
//       top: rect.top + rect.height + 6,
//       left: rect.left,
//       minWidth: rect.width,
//       zIndex: 9999,
//       background: "#fff",
//       border: "1px solid #ddd",
//       boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
//       maxHeight: 320,
//       overflowY: "auto",
//       padding: "6px 0",
//     };

//     return ReactDOM.createPortal(
//       <div style={portalStyle} className="suggestions-portal" role="listbox">
//         {list.map((p, i) => (
//           <div
//             key={p._id || `${p.code}-${p.name}-${i}`}
//             className="suggestion"
//             role="option"
//             onMouseDown={(e) => {
//               e.preventDefault();
//               handleSelectSuggestion(rowId, p);
//             }}
//             style={{ padding: "8px 10px", cursor: "pointer", borderBottom: "1px solid #f4f4f4" }}
//           >
//             <div style={{ fontWeight: 700 }}>{p.code}</div>
//             <div style={{ fontSize: 12 }}>{p.name}</div>
//           </div>
//         ))}
//       </div>,
//       portalRoot
//     );
//   };

//   const renderNameSuggestionPortal = (rowId) => {
//     if (!portalRoot) return null;
//     const list = nameSuggestions[rowId] || [];
//     if (!showNameList[rowId] || list.length === 0) return null;

//     const inputEl = document.querySelector(`input[data-row="${rowId}"][data-field="name"]`);
//     const rect = inputEl?.getBoundingClientRect() || { top: 0, left: 0, width: 300, height: 24 };

//     const portalStyle = {
//       position: "fixed",
//       top: rect.top + rect.height + 6,
//       left: rect.left,
//       minWidth: rect.width,
//       zIndex: 9999,
//       background: "#fff",
//       border: "1px solid #ddd",
//       boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
//       maxHeight: 320,
//       overflowY: "auto",
//       padding: "6px 0",
//     };

//     return ReactDOM.createPortal(
//       <div style={portalStyle} className="suggestions-portal" role="listbox">
//         {list.map((p, i) => (
//           <div
//             key={p._id || `${p.code}-${p.name}-${i}`}
//             className="suggestion"
//             role="option"
//             onMouseDown={(e) => {
//               e.preventDefault();
//               handleSelectSuggestion(rowId, p);
//             }}
//             style={{ padding: "8px 10px", cursor: "pointer", borderBottom: "1px solid #f4f4f4" }}
//           >
//             <div style={{ fontWeight: 700 }}>{p.name}</div>
//             <div style={{ fontSize: 12 }}>{p.code}</div>
//           </div>
//         ))}
//       </div>,
//       portalRoot
//     );
//   };

//   const renderBatchPortal = (rowId) => {
//     if (!portalRoot) return null;
//     const list = batchesByRow[rowId] || [];
//     if (!showBatchList[rowId] || list.length === 0) return null;

//     const inputEl = document.querySelector(`input[data-row="${rowId}"][data-field="batch"]`);
//     const rect = inputEl?.getBoundingClientRect() || { top: 0, left: 0, width: 300, height: 24 };

//     const portalStyle = {
//       position: "fixed",
//       top: rect.top + rect.height + 6,
//       left: rect.left,
//       minWidth: Math.max(rect.width, 480),
//       zIndex: 9999,
//       background: "#fff",
//       border: "1px solid #eee",
//       boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
//       maxHeight: 320,
//       overflowY: "auto",
//       padding: 8,
//     };

//     return ReactDOM.createPortal(
//       <div style={portalStyle} className="batch-portal">
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: "#fafafa", fontSize: 13 }}>
//               <th style={{ padding: 6, textAlign: "left" }}>Batch</th>
//               <th style={{ padding: 6, textAlign: "left" }}>MRP</th>
//               <th style={{ padding: 6, textAlign: "left" }}>Rate</th>
//               <th style={{ padding: 6, textAlign: "left" }}>GST%</th>
//               <th style={{ padding: 6, textAlign: "left" }}>Stock</th>
//             </tr>
//           </thead>
//           <tbody>
//             {list.map((b, i) => {
//               const available = getAvailableStock(b.code || rows.find((r) => r.id === rowId)?.code, b.batchNo || "");
//               const normalized = normalizeBatch(b);
//               return (
//                 <tr
//                   key={`${normalized.batchNo}-${i}`}
//                   onMouseDown={(e) => {
//                     e.preventDefault();
//                     handleBatchPick(rowId, normalized);
//                   }}
//                   style={{ cursor: "pointer", borderBottom: "1px solid #f4f4f4" }}
//                 >
//                   <td style={{ padding: 6, fontWeight: 600 }}>{normalized.batchNo || "(no batch)"}</td>
//                   <td style={{ padding: 6 }}>{Number(normalized.mrp || 0).toFixed(2)}</td>
//                   <td style={{ padding: 6 }}>{Number(normalized.rate || 0).toFixed(2)}</td>
//                   <td style={{ padding: 6 }}>{normalized.gst}%</td>
//                   <td style={{ padding: 6 }}>{available}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>,
//       portalRoot
//     );
//   };

//   // hide suggestion lists when clicking outside of inputs or suggestion portals
//   useEffect(() => {
//     const closeAll = (e) => {
//       if (!e.target.closest(".suggestions-portal") && !e.target.closest(".batch-portal") && !e.target.closest("input")) {
//         setShowCodeList({});
//         setShowNameList({});
//         setShowBatchList({});
//       }
//     };
//     document.addEventListener("click", closeAll);
//     return () => document.removeEventListener("click", closeAll);
//   }, []);

//   // ---------------- Render JSX ----------------
//   return (
//     <div className="salesbill-page">
//       {/* ... You may have more surrounding UI (header, modal toggles, etc.) ... */}

//       {/* Items Table */}
//       <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
//         <thead>
//           <tr>
//             <th style={{ width: "50px" }}>S.No</th>
//             <th style={{ width: "140px" }}>Product Code</th>
//             <th style={{ width: "190px" }}>Product Name</th>
//             <th style={{ width: "200px" }}>Batch</th>
//             <th style={{ width: "100px" }}>MRP</th>
//             <th style={{ width: "90px" }}>Rate</th>
//             <th style={{ width: "80px" }}>GST%</th>
//             <th style={{ width: "80px" }}>Qty</th>
//             <th style={{ width: "90px" }}>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, index) => (
//             <React.Fragment key={row.id}>
//               <tr>
//                 <td>{index + 1}</td>

//                 {/* Product Code */}
//                 <td className="relative">
//                   <input
//                     data-row={row.id}
//                     data-field="code"
//                     value={row.code || ""}
//                     onKeyDown={(e) => {
//                       handleSuggestionKey(e, row.id, "code");
//                       if (e.key === "Enter") handleEnterKey(e);
//                     }}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       updateRow(row.id, "code", v === "0" ? "" : v);
//                       // trigger suggestions (debounced)
//                       suggestCodesDebounced(row.id, v || "");
//                     }}
//                     onFocus={() => {
//                       // show suggestions if there's any text, else show all? we'll show when user typed or has value
//                       suggestCodesDebounced(row.id, row.code || "");
//                     }}
//                     onBlur={() => {
//                       // small delay so click on suggestion triggers first
//                       setTimeout(() => setShowCodeList((v) => ({ ...v, [row.id]: false })), 150);
//                     }}
//                     placeholder="Type or scan code"
//                     className="input"
//                   />
//                   {renderCodeSuggestionPortal(row.id)}
//                 </td>

//                 {/* Product Name */}
//                 <td className="relative">
//                   <input
//                     data-row={row.id}
//                     data-field="name"
//                     value={row.name || ""}
//                     onKeyDown={(e) => {
//                       handleSuggestionKey(e, row.id, "name");
//                       if (e.key === "Enter") handleEnterKey(e);
//                     }}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       updateRow(row.id, "name", v);
//                       suggestNamesDebounced(row.id, v || "");
//                     }}
//                     onFocus={() => suggestNamesDebounced(row.id, row.name || "")}
//                     onBlur={() => {
//                       setTimeout(() => setShowNameList((v) => ({ ...v, [row.id]: false })), 150);
//                     }}
//                     placeholder="Type or select product"
//                     className="input"
//                   />
//                   {renderNameSuggestionPortal(row.id)}
//                 </td>

//                 {/* Batch */}
//                 <td className="relative">
//                   <input
//                     className="input"
//                     data-row={row.id}
//                     data-field="batch"
//                     placeholder="Enter or select batch number"
//                     value={row.batch}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, batch: v } : r)));
//                       setShowBatchList((m) => ({ ...m, [row.id]: v.trim() === "" }));
//                     }}
//                     onFocus={() => {
//                       // populate available batches based on name or code
//                       if (row.name) {
//                         const batches = getBatchesForName(row.name);
//                         setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
//                       } else if (row.code) {
//                         const batches = getBatchesForCode(row.code);
//                         setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
//                       }
//                       openBatchList(row.id);
//                     }}
//                     onBlur={() => {
//                       setTimeout(() => {
//                         setShowBatchList((m) => ({ ...m, [row.id]: !!row.batch ? false : m[row.id] }));
//                       }, 150);
//                     }}
//                   />
//                   {renderBatchPortal(row.id)}
//                 </td>

//                 {/* MRP */}
//                 <td>
//                   <input
//                     type="number"
//                     {...numberInputProps}
//                     value={row.mrp || 0}
//                     onFocus={(e) => {
//                       if (String(e.target.value) === "0") e.target.value = "";
//                       enableWheelBlock();
//                     }}
//                     onBlur={(e) => {
//                       if (e.target.value === "") updateRow(row.id, "mrp", 0);
//                       disableWheelBlock();
//                     }}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => updateRow(row.id, "mrp", e.target.value)}
//                   />
//                 </td>

//                 {/* Rate */}
//                 <td>
//                   <input
//                     type="number"
//                     {...numberInputProps}
//                     value={row.rate || 0}
//                     onFocus={(e) => {
//                       if (String(e.target.value) === "0") e.target.value = "";
//                       enableWheelBlock();
//                     }}
//                     onBlur={(e) => {
//                       if (e.target.value === "") updateRow(row.id, "rate", 0);
//                       disableWheelBlock();
//                     }}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => updateRow(row.id, "rate", e.target.value)}
//                   />
//                 </td>

//                 {/* GST */}
//                 <td>
//                   <input
//                     type="number"
//                     {...numberInputProps}
//                     value={row.gst || 0}
//                     onFocus={(e) => {
//                       if (String(e.target.value) === "0") e.target.value = "";
//                       enableWheelBlock();
//                     }}
//                     onBlur={(e) => {
//                       if (e.target.value === "") updateRow(row.id, "gst", 0);
//                       disableWheelBlock();
//                     }}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => updateRow(row.id, "gst", e.target.value)}
//                   />
//                 </td>

//                 {/* Qty */}
//                 <td>
//                   <input
//                     type="number"
//                     {...numberInputProps}
//                     value={row.qty ? row.qty : ""}
//                     onFocus={(e) => {
//                       if (String(e.target.value) === "0") e.target.value = "";
//                       enableWheelBlock();
//                     }}
//                     onBlur={(e) => {
//                       if (e.target.value === "") updateRow(row.id, "qty", 0);
//                       disableWheelBlock();
//                     }}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => {
//                       const raw = e.target.value;
//                       const qty = raw === "" ? 0 : Number(raw);
//                       updateRow(row.id, "qty", qty);
//                       const available = row.batch ? getAvailableStock(row.code, row.batch) : null;
//                       if (available !== null && qty > available) {
//                         setRowStockError(row.id, `Out of stock: requested ${qty}, only ${available} available`);
//                       } else {
//                         setRowStockError(row.id, null);
//                       }
//                     }}
//                   />
//                 </td>

//                 {/* Actions */}
//                 <td className="row-actions">
//                   {row.isNew ? (
//                     <button onClick={() => addRow(row.id)} className="plus">
//                       <FaPlus />
//                     </button>
//                   ) : editRowId === row.id ? (
//                     <>
//                       <button onClick={() => saveRowEdit(row.id)} className="success" style={{ color: "green" }}>
//                         <FaCheck />
//                       </button>
//                       <button onClick={cancelRowEdit} className="danger">
//                         <FaTimes />
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <button onClick={() => setEditRowId(row.id)} className="edit">
//                         <FaEdit />
//                       </button>
//                       <button onClick={() => deleteRow(row.id)} className="danger">
//                         <FaTrash />
//                       </button>
//                     </>
//                   )}
//                 </td>
//               </tr>

//               {stockErrors[row.id] && (
//                 <tr>
//                   <td colSpan="9" style={{ color: "red", fontSize: 13 }}>
//                     ❌ {stockErrors[row.id]}
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>

//       {/* Simple pagination / other UI can go here */}
//     </div>
//   );

//   // helper functions used inside component but declared after return
//   function handleEnterKey(e) {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const form = e.target.form;
//       if (!form) return;
//       const elements = Array.from(form.elements).filter((el) => el.tagName === "INPUT" && el.type !== "hidden");
//       const index = elements.indexOf(e.target);
//       if (elements[index + 1]) {
//         elements[index + 1].focus();
//       } else {
//         if (typeof addRow === "function") {
//           addRow();
//           setTimeout(() => {
//             const newElements = Array.from(form.elements).filter((el) => el.tagName === "INPUT" && el.type !== "hidden");
//             newElements[newElements.length - 1]?.focus();
//           }, 100);
//         }
//       }
//     }
//   }
// }

// // small util: unique id
// function generateUniqueId() {
//   return "_" + Math.random().toString(36).substr(2, 9);
// }

//main code. 14/10/2025
// // src/pages/SalesBill.jsx
// import React, { useState, useEffect, useMemo, useRef, useCallback, useContext} from "react";
// import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../styles/salesbill.css";
// import { useAuth } from "../context/AuthContext";
// import { getAuthHeaders, API  } from "../utils/apiHeaders";
// import Pagination from "../components/Pagination";
// import debounce from "lodash.debounce"; 

// import ReactDOM from "react-dom";




// // import { ShopContext } from "../context/ShopContext";


// // const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // ✅ No interceptor – we now use getAuthHeaders(user)
// const axiosInstance = axios.create({ baseURL: API });

// export default function SalesBill() {
//   const { user } = useAuth(); // ✅ useAuth gives user
//     // const { selectedShop } = useContext(ShopContext); 
//   const token = localStorage.getItem("token");
//   const shopname = user?.shopname || localStorage.getItem("shopname");
//  const Portal = ({ children }) => ReactDOM.createPortal(children, document.body);
//   // ---- State ----
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
//   const debounceRef = useRef({});
//   // Search & Filter states     
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [viewBill, setViewBill] = useState(null);

//   const [editRowId, setEditRowId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [inputValue, setInputValue] = useState("");
// const [suggestions, setSuggestions] = useState([]);
// const [rowStockError, setRowStockError] = useState({});
// const [billNo, setBillNo] = useState("");
// const [originalRowData, setOriginalRowData] = useState({});
// const [originalBillItems, setOriginalBillItems] = useState({});

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10; // rows per page

// const [stockCache, setStockCache] = useState({});


// const codeInputRefs = useRef({});
// const nameInputRefs = useRef({});

// //  const [rows, setRows] = useState([{ id: Date.now(), isNew: true }]);
 

//   // ⚡ Enter key handler
//   const handleEnterKey = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const form = e.target.form;
//       if (!form) return;
//       const elements = Array.from(form.elements).filter(
//         (el) => el.tagName === "INPUT" && el.type !== "hidden"
//       );
//       const index = elements.indexOf(e.target);
//       if (elements[index + 1]) {
//         elements[index + 1].focus();
//       } else {
//         if (typeof addRow === "function") {
//           addRow();
//           setTimeout(() => {
//             const newElements = Array.from(form.elements).filter(
//               (el) => el.tagName === "INPUT" && el.type !== "hidden"
//             );
//             newElements[newElements.length - 1]?.focus();
//           }, 100);
//         }
//       }
//     }
//   };

//   const numberInputProps = {
//     onWheel: (e) => e.target.blur(),
//   };


//   // ---- Helpers ----
//   function createEmptyRow() {
//     return { id: Date.now(), code: "", name: "", batch: "", mrp: 0, rate: 0, qty: 0, gst: 0, amount: 0, value: 0, isNew: true };
//   }

//   const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;



//   const showPopup = (message, type = "error") => {
//     setPopup({ message, type });
//     setTimeout(() => setPopup({ message: "", type: "" }), 2500);
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
//   };

//   // ---- Fetch Functions ----

// const fetchProducts = async () => {
//   try {
//     const { data } = await axiosInstance.get("/api/products", {
//       headers: getAuthHeaders(user),
//     });

//     const productList = Array.isArray(data)
//       ? data
//       : Array.isArray(data.products)
//       ? data.products
//       : [];

//     setProducts(
//       productList.map((p) => ({
//         ...p,
//         code: p.code || "",
//         name: p.name || "",
//         batchNo: p.batchNo || "",
//         mrp: Number(p.mrp || p.price || 0),
//         salePrice: Number(p.salePrice || p.price || 0),
//         taxPercent: Number(p.taxPercent || 0),
//         qty: Number(p.qty || 0),
//         minQty: Number(p.minQty || 0),
//         _id: p._id || p.id || null,
//       }))
//     );
//   } catch (e) {
//     console.error("Error fetching products", e);
//     setProducts([]);
//   }
// };

// useEffect(() => {
//   fetchProducts();
// }, []);


// const fetchBills = async (pageNum = 1) => {
//   try {
//     setLoading(true);

//     // Build query params
//     const params = new URLSearchParams({
//       page: pageNum,
//       limit,
//       search,      // billNo / customerName / mobile
//       filter,      // today / this-week / this-month / custom
//       fromDate,    // for custom range
//       toDate,
//     });

//     const { data } = await axiosInstance.get(`/api/sales?${params.toString()}`, {
//       headers: getAuthHeaders(user),
//     });

//     setBills(Array.isArray(data.bills) ? data.bills : []);
//     setTotalPages(data.totalPages || 1);
//     setPage(data.page || pageNum);
//   } catch (error) {
//     console.error("Error fetching bills", error);
//     setBills([]);
//     setTotalPages(1);
//   } finally {
//     setLoading(false);
//   }
// };

// useEffect(() => {
//   fetchBills(1);
// }, [page, search, filter, fromDate, toDate]);


// const fetchBillNo = async () => {
//   try {
//     if (!token || !shopname) {
//       console.error("Missing token or shopname");
//       return;
//     }

//     const { data } = await axiosInstance.get("/api/sales/next-billno", {
//       headers: {
//         ...getAuthHeaders(user),
//         "x-shopname": shopname   // ensure shop/tenant is sent
//       }
//     });

//     const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
//     setMeta(prev => ({
//       ...prev,
//       billNo: data.nextBillNo,
//       date: istDate.toISOString().split("T")[0]
//     }));

//   } catch (e) {
//     console.error("Failed to fetch bill number", e);
//   }
// };



//   useEffect(() => {
//     if (token && shopname) {
//       fetchProducts();
//       fetchBillNo();
//       fetchBills();
//     }
//   }, [token, shopname]);


// // ✅ Debounce helper (declare at top, before suggest functions)
// const debounceFn = (fn, delay = 250) => {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// };

// // ---------------------
// // ✅ Suggestion Handlers
// // ---------------------
// const suggestNamesDebounced = useMemo(() => {
//   return debounceFn((rowId, query) => {
//     if (!query.trim()) {
//       setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//       setShowNameList((s) => ({ ...s, [rowId]: false }));
//       return;
//     }

//     const matches = products.filter((p) =>
//       (p.name || "").toLowerCase().includes(query.toLowerCase())
//     );

//     setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
//     setShowNameList((s) => ({ ...s, [rowId]: true }));
//     console.log("✅ Name matches:", matches);
//   }, 250);
// }, [products]);

// const suggestCodesDebounced = useMemo(() => {
//   return debounceFn((rowId, query) => {
//     if (!query.trim()) {
//       setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//       setShowCodeList((s) => ({ ...s, [rowId]: false }));
//       return;
//     }

//     const matches = products.filter((p) =>
//       (p.code || "").toLowerCase().includes(query.toLowerCase())
//     );

//     setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
//     setShowCodeList((s) => ({ ...s, [rowId]: true }));
//     console.log("✅ Code matches:", matches);
//   }, 250);
// }, [products]);




//   const getAvailableStock = (code, batch) => {
//     const base = products.filter(p => (p.code||"").toLowerCase() === (code||"").toLowerCase() && (p.batchNo||"").toLowerCase() === (batch||"").toLowerCase()).reduce((sum,p)=>sum+Number(p.qty||0),0);
//     const reserved = Number(reservedStock[keyFor(code,batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   const recalcRow = (r) => {
//     const rate = Number(r.rate || 0);
//     const qty = Number(r.qty || 0);
//     const gst = Number(r.gst || 0);
//     const amount = +(rate*qty).toFixed(2);
//     const value = +(amount + (amount*gst/100)).toFixed(2);
//     return { ...r, amount, value };
//   };

//   // ---- Add / Delete / Edit Rows ----
//   const addRow = (id) => {
//     const row = rows.find(r => r.id===id);
//     if (!row || !row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code,row.batch);
//     if (available < row.qty) return showPopup(`Only ${available} left`);
//     const k = keyFor(row.code,row.batch);
//     setReservedStock(rs => ({ ...rs, [k]: (rs[k]||0)+Number(row.qty) }));
//     setRows(prev => prev.map(r => r.id===id ? {...r,isNew:false}:r).concat(createEmptyRow()));
//   };

//   const deleteRow = (id) => {
//     const row = rows.find(r=>r.id===id);
//     if(row && !row.isNew) {
//       const k = keyFor(row.code,row.batch);
//       setReservedStock(rs => ({ ...rs, [k]: Math.max(0,(rs[k]||0)-Number(row.qty)) }));
//     }
//     setRows(prev=>prev.filter(r=>r.id!==id));
//   };

// const cancelRowEdit = () => {
//   if (!editRowId) return;
//   setRows(prev => prev.map(r => 
//     r.id === editRowId ? { ...originalRowData[editRowId] } : r
//   ));
//   setOriginalRowData(prev => {
//     const copy = { ...prev };
//     delete copy[editRowId];
//     return copy;
//   });
//   setEditRowId(null);
// };

 
//   useEffect(()=>{
//     const total = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount,0);
//     const gstTotal = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount*(r.gst||0)/100,0);
//     const discount = Number(totals.discount||0);
//     const netAmount = +(total+gstTotal-discount).toFixed(2);
//     const cashGiven = Number(totals.cashGiven||0);
//     const balance = +(cashGiven>=netAmount ? cashGiven-netAmount : netAmount-cashGiven).toFixed(2);
//     const cgst = +(gstTotal/2).toFixed(2);
//     const sgst = +(gstTotal/2).toFixed(2);
//     setTotals(prev=>({ ...prev,total,discount,netAmount,balance,cashGiven,cgst,sgst }));
//   }, [rows, totals.discount, totals.cashGiven]);

  
//   // ---- Save & Print ----





//   const resetBillForm = () => {
//     setMeta(prev=>({ ...prev, customerName:"", mobile:"" }));
//     setBillEditMode(false);
//     setEditingBillId(null);
//     setRows([createEmptyRow()]);
//     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//     setReservedStock({});
//   };

// // Handle product code or name selection from suggestions


// const handleSelectSuggestion = (rowId, product) => {
//   // Update row values
//   setRows(prev =>
//     prev.map(r => {
//       if (r.id !== rowId) return r;

//       const updated = {
//         ...r,
//         code: product.code,
//         name: product.name,
//         batch: "", // reset batch when product changes
//         mrp: Number(product.mrp || 0),
//         rate: Number(product.salePrice || product.rate || 0),
//         gst: Number(product.gst || 0),
//         qty: 0
//       };

//       return recalcRow(updated);
//     })
//   );

//   // Hide suggestion lists
//   setShowCodeList(prev => ({ ...prev, [rowId]: false }));
//   setShowNameList(prev => ({ ...prev, [rowId]: false }));

//   // Load batches for this product
//   const batches = getBatchesForCode(product.code) || [];
//   setBatchesByRow(prev => ({ ...prev, [rowId]: batches }));
//   setShowBatchList(prev => ({ ...prev, [rowId]: batches.length > 0 }));
// };




// const updateRow = (id, field, value, skipRecalc = false) => {
//   setRows(prev =>
//     prev.map(r => {
//       if (r.id !== id) return r;
//       let val = value;
//       if (["mrp", "rate", "gst", "qty"].includes(field)) {
//         val = Number(value) || 0;
//       }
//       const updated = { ...r, [field]: val };
//       return skipRecalc ? updated : recalcRow(updated);
//     })
//   );
// };



// const normalizeBatch = (m) => ({
//   ...m,
//   batchNo: m.batchNo || "",
//   mrp: Number(m.mrp || 0),
//   rate: Number(m.rate || m.salePrice || 0),
//   gst: Number(m.taxPercent || 0),   // ✅ map correctly
//   taxMode: m.taxMode || "exclusive",
//   qty: Number(m.qty || 0),
// });

// const getBatchesForCode = (code) => {
//   return products
//     .filter((p) => (p.code || "").toLowerCase() === (code || "").toLowerCase())
//     .map(normalizeBatch);
// };

// const getBatchesForName = (name) => {
//   return products
//     .filter((p) => (p.name || "").toLowerCase() === (name || "").toLowerCase())
//     .map(normalizeBatch);
// };


// const handleBatchPick = (rowId, batch) => {
//   setRows(prev => prev.map(r => {
//     if (r.id !== rowId) return r;
//     const updated = {
//       ...r,
//       batch: batch.batchNo || "",
//       mrp: Number(batch.mrp || 0),
//       rate: Number(batch.salePrice || 0),
//       gst: Number(batch.gst || 0),  // ✅ from taxPercent
//       qty: 0,
//     };
//     return recalcRow(updated);
//   }));

//   setShowBatchList(prev => ({ ...prev, [rowId]: false }));
// };


// const printBill = (bill) => {
//   const printWindow = window.open("", "_blank");
//   printWindow.document.write(`<pre>${JSON.stringify(bill, null, 2)}</pre>`);
//   printWindow.document.close();
//   printWindow.print();
// };


// // Generate temporary unique IDs for new rows
// const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);




// useEffect(() => {
//   if (viewBill) {
//     setViewBill(prev => ({
//       ...prev,
//       customerName: meta.customerName,
//       mobile: meta.mobile,
//       netAmount: totals.netAmount,
//     }));
//   }
// }, [meta.customerName, meta.mobile, totals.netAmount]);


// // ---- Filtered Bills ----
// const filteredBills = useMemo(() => {
//   if (!bills) return [];
//   return bills.filter((bill) => {
//     const term = search.toLowerCase();
//     const customerName = (bill.customerName || bill.meta?.customerName || "").toLowerCase();
//     const mobile = (bill.mobile || bill.meta?.mobile || "").toLowerCase();
//     const billNo = (bill.billNo || "").toLowerCase();
//     return (
//       customerName.includes(term) ||
//       mobile.includes(term) ||
//       billNo.includes(term)
//     );
//   });
// }, [bills, search]);


// {/* --------------------------
// ✅ Autocomplete Input Handlers
// --------------------------- */}
// // const handleCodeInput = (rowId, value) => {
// //   updateRow(rowId, "code", value, true);
// //   setShowCodeList((v) => ({ ...v, [rowId]: true }));
// //   suggestCodesDebounced(rowId, value);
// // };

// // const handleNameInput = (rowId, value) => {
// //   updateRow(rowId, "name", value, true);
// //   setShowNameList((v) => ({ ...v, [rowId]: true }));
// //   suggestNamesDebounced(rowId, value);
// // };

// // --------------------------
// // ✅ Autocomplete Input Handlers with Auto-Fill
// // --------------------------


// const handleCodeInput = (rowId, value) => {
//   updateRow(rowId, "code", value, true);
//   setShowCodeList((v) => ({ ...v, [rowId]: true }));

//   suggestCodesDebounced(rowId, value);

//   // Auto-fill Name if there’s a single match
//   const matches = products.filter((p) =>
//     (p.code || "").toLowerCase().includes(value.toLowerCase())
//   );
//   if (matches.length === 1) {
//     updateRow(rowId, "name", matches[0].name, true);
//   }
// };

// const handleNameInput = (rowId, value) => {
//   updateRow(rowId, "name", value, true);
//   setShowNameList((v) => ({ ...v, [rowId]: true }));

//   suggestNamesDebounced(rowId, value);

//   // Auto-fill Code if there’s a single match
//   const matches = products.filter((p) =>
//     (p.name || "").toLowerCase().includes(value.toLowerCase())
//   );
//   if (matches.length === 1) {
//     updateRow(rowId, "code", matches[0].code, true);
//   }
// };

// // Hide all suggestion lists when clicking outside
// useEffect(() => {
//   const closeAll = (e) => {
//     if (!e.target.closest(".suggestions") && !e.target.closest("input")) {
//       setShowCodeList({});
//       setShowNameList({});
//       setShowBatchList({});
//     }
//   };
//   document.addEventListener("click", closeAll);
//   return () => document.removeEventListener("click", closeAll);
// }, []);


// // --------------------------
// // Save single row (UI only, live validation & stock cache update)
// // ---------------------------
// const saveRowEdit = async (rowId) => {
//   const row = rows.find(r => r.id === rowId);
//   if (!row) return;

//   // 1️⃣ Required fields check
//   if (!row.code || !row.name || !row.batch || row.qty === undefined || row.rate === undefined) {
//     showPopup("⚠️ Please fill all required fields before saving.");
//     return;
//   }

//   const newQty = Number(row.qty);
//   const oldQty = Number(originalBillItems?.[rowId]?.qty || 0);

//   // 2️⃣ Get batch info
//   const product = products.find(p => p.code === row.code && p.name === row.name);
//   const batches = product ? getBatches(product) : [{ batchNo: row.batch, qty: 0 }];
//   const batchInfo = batches.find(b => b.batchNo === row.batch) || { qty: 0 };

//   const stockBefore = typeof getStockCache === "function"
//     ? getStockCache(row.code, row.batch)
//     : batchInfo.qty;

//   // 3️⃣ Calculate resulting stock
//   let resultingStock = stockBefore;
//   let actionType = "none";
//   let qtyChange = 0;

//   if (newQty > oldQty) {
//     qtyChange = newQty - oldQty;
//     resultingStock = stockBefore - qtyChange;
//     actionType = "decrement";
//   } else if (newQty < oldQty) {
//     qtyChange = oldQty - newQty;
//     resultingStock = stockBefore + qtyChange;
//     actionType = "increment";
//   }

//   // 4️⃣ Stock validation
//   if (resultingStock < 0) {
//     setStockErrors(prev => ({
//       ...prev,
//       [rowId]: `⚠️ Only ${stockBefore + oldQty} available. Enter a smaller quantity.`
//     }));
//     return;
//   } else {
//     setStockErrors(prev => {
//       const copy = { ...prev };
//       delete copy[rowId];
//       return copy;
//     });
//   }

//   // 5️⃣ Update row locally
//   setRows(prev =>
//     prev.map(r =>
//       r.id === rowId
//         ? { ...r, qty: newQty, isNew: false, edited: true, resultingStock }
//         : r
//     )
//   );

//   // 6️⃣ Update originalBillItems map
//   setOriginalBillItems(prev => ({
//     ...prev,
//     [rowId]: { code: row.code, batch: row.batch, qty: newQty },
//   }));

//   // 7️⃣ Update live stock cache
//   if (typeof updateStockCache === "function") {
//     updateStockCache(row.code, row.batch, resultingStock);
//   }

//   // 8️⃣ Log for debugging
//   console.table([{
//     Action: "Edit Row",
//     "Item Code": row.code,
//     "Batch No": row.batch,
//     "Previous Bill Qty": oldQty,
//     "New Qty": newQty,
//     "Stock Before Edit": stockBefore,
//     "Resulting Stock": resultingStock,
//     "Logic Applied": actionType
//   }]);

//   // 9️⃣ Backend update
//   if (actionType !== "none" && qtyChange > 0) {
//     try {
//       const headers = getAuthHeaders(user);

//       if (actionType === "decrement") {
//         await axiosInstance.put(
//           "/api/products/decrement-stock",
//           { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
//           { headers }
//         );
//       } else if (actionType === "increment") {
//         await axiosInstance.put(
//           "/api/products/increment-stock",
//           { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
//           { headers }
//         );
//       }
//     } catch (err) {
//       console.error("Backend stock update failed:", err.response?.data || err.message);
//       showPopup("⚠️ Failed to update stock on server. UI updated only.");
//     }
//   }

//   // 10️⃣ Exit edit mode
//   setEditRowId(null);
//   showPopup("✅ Row updated and stock synced successfully.");
// };




// // ---------------------------
// // Unified getBatches helper
// // ---------------------------
// const getBatches = (prod) => {
//   const product = products.find(p => p.code === prod.code && p.name === prod.name);
//   if (!product) return [];

//   if (product.batches && product.batches.length > 0) {
//     return product.batches.map(b => ({
//       batchNo: b.batchNo || "",
//       qty: b.qty || 0,
//       mrp: b.mrp || product.mrp,
//       rate: b.rate || product.rate,
//       gst: b.gst || product.gst,
//       ...b
//     }));
//   }

//   return [{
//     batchNo: product.batchNo || "",
//     qty: product.qty || 0,
//     mrp: product.mrp,
//     rate: product.rate,
//     gst: product.gst,
//     ...product
//   }];
// };


// // ---------------------------
// // Save & Print (backend update with correct increment/decrement)
// // ---------------------------
// const handleSaveAndPrint = async () => {
//   try {
//     if (!rows.length) {
//       setErrorMsg("Add items before saving.");
//       return;
//     }

//     const validItems = rows.filter(r => r.code && r.batch && r.qty >= 0);
//     if (!validItems.length) {
//       setErrorMsg("No valid items to save.");
//       return;
//     }

//     const headers = getAuthHeaders(user);
//     const stockLog = []; // Table log for debugging

//     // -------------------------------
//     // 1️⃣ Apply increment/decrement logic
//     // -------------------------------
//     for (const r of validItems) {
//       const newQty = Number(r.qty);
//       const oldQty = Number(originalBillItems?.[r.id]?.qty || 0);

//       // Skip if unchanged
//       if (newQty === oldQty) continue;

//       const product = products.find(p => p.code === r.code && p.name === r.name);
//       const batchInfo = product
//         ? getBatches(product).find(b => b.batchNo === r.batch) || { qty: 0 }
//         : { qty: 0 };

//       const availableStock = typeof getAvailableStock === "function"
//         ? getAvailableStock(r.code, r.batch)
//         : batchInfo.qty;

//       let resultingStock;
//       let apiCallType;
//       let qtyToUpdate;

//       if (newQty > oldQty) {
//         // Decrement stock by (newQty - oldQty)
//         qtyToUpdate = newQty - oldQty;
//         resultingStock = availableStock - qtyToUpdate;
//         apiCallType = "decrement";
//       } else if (newQty < oldQty) {
//         // Increment stock by (oldQty - newQty)
//         qtyToUpdate = oldQty - newQty;
//         resultingStock = availableStock + qtyToUpdate;
//         apiCallType = "increment";
//       }

//       // -------------------------------
//       // 2️⃣ Call backend API
//       // -------------------------------
//       if (qtyToUpdate > 0) {
//         const url = apiCallType === "decrement"
//           ? "/api/products/decrement-stock"
//           : "/api/products/increment-stock";

//         await axiosInstance.put(
//           url,
//           { items: [{ code: r.code, batchNo: r.batch, qty: qtyToUpdate }] },
//           { headers }
//         );

//         // Update local stock cache for UI
//         if (typeof updateStockCache === "function") {
//           updateStockCache(r.code, r.batch, resultingStock);
//         }

//         // Log for debugging
//         stockLog.push({
//           Action: apiCallType === "decrement" ? `Decrement ${qtyToUpdate}` : `Increment ${qtyToUpdate}`,
//           "Item Code": r.code,
//           "Batch No": r.batch,
//           "Previous Bill Qty": oldQty,
//           "New Qty": newQty,
//           "Stock Before Edit": availableStock,
//           "Resulting Stock": resultingStock
//         });
//       }
//     }

//     // Display stock table in console
//     console.table(stockLog);

//     // -------------------------------
//     // 3️⃣ Prepare & save bill payload
//     // -------------------------------
//     const salesPayload = {
//       billNo: meta.billNo,
//       date: meta.date || new Date(),
//       counter: meta.counter || 1,
//       customerName: meta.customerName || "Cash Customer",
//       mobile: meta.mobile || "",
//       items: validItems.map(r => ({
//         code: r.code,
//         name: r.name,
//         batch: r.batch,
//         mrp: Number(r.mrp),
//         rate: Number(r.rate),
//         gst: Number(r.gst),
//         qty: Number(r.qty),
//         amount: Number(r.rate) * Number(r.qty),
//         value: Number(r.rate) * Number(r.qty) * (1 + Number(r.gst)/100),
//       })),
//       total: totals.total || 0,
//       discount: totals.discount || 0,
//       netAmount: totals.netAmount || 0,
//       cashGiven: totals.cashGiven || 0,
//       balance: totals.balance || 0,
//       cgst: totals.cgst || 0,
//       sgst: totals.sgst || 0
//     };

//     let savedBill;
//     if (billEditMode && editingBillId) {
//       const { data } = await axiosInstance.put(`/api/sales/${editingBillId}`, salesPayload, { headers });
//       savedBill = data;
//     } else {
//       const { data } = await axiosInstance.post("/api/sales", salesPayload, { headers });
//       savedBill = data;
//     }

//     // -------------------------------
//     // 4️⃣ Update frontend state
//     // -------------------------------
//     if (billEditMode) setBills(prev => prev.map(b => b._id === savedBill._id ? savedBill : b));
//     else setBills(prev => [savedBill, ...prev]);

//     setViewBill(savedBill);

//     // -------------------------------
//     // 5️⃣ Reset originalBillItems
//     // -------------------------------
//     const newOriginalMap = {};
//     validItems.forEach(r => {
//       newOriginalMap[r.id] = { code: r.code, batch: r.batch, qty: Number(r.qty) };
//     });
//     setOriginalBillItems(newOriginalMap);

//     // -------------------------------
//     // 6️⃣ Print & reset UI
//     // -------------------------------
//     setTimeout(() => window.print(), 100);
//     setShowModal(false);
//     setRows([createEmptyRow()]);
//     setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
//     setMeta(prev => ({ ...prev, customerName: "", mobile: "" }));
//     setErrorMsg("");
//     setBillEditMode(false);
//     setEditingBillId(null);

//   } catch (err) {
//     console.error("Save/Print error:", err.response?.data || err.message);
//     setErrorMsg(err.response?.data?.message || "Failed to save/print");
//   }
// };




// // ----------------------
// // Edit existing Sales Bill
// // ----------------------
// const handleEditBill = (bill) => {
//   if (!bill) return;

//   // 1️⃣ Enable edit mode and store current bill ID
//   setBillEditMode(true);
//   setEditingBillId(bill._id);
//   setShowModal(true);

//   // 2️⃣ Map items with consistent row IDs
//   const rowsWithId = bill.items.map((item, idx) => ({
//     ...item,
//     id: item._id || `item-${idx}-${Date.now()}`,
//     isNew: false,
//   }));
//   setRows(rowsWithId);

//   // 3️⃣ Fill meta info
//   setMeta({
//     billNo: bill.billNo || "",
//     date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
//     counter: bill.counter || 1,
//     customerName: bill.customerName || "",
//     mobile: bill.mobile || "",
//   });

//   // 4️⃣ Fill totals
//   setTotals({
//     total: bill.total || 0,
//     discount: bill.discount || 0,
//     netAmount: bill.netAmount || 0,
//     cashGiven: bill.cashGiven || 0,
//     balance: bill.balance || 0,
//     cgst: bill.cgst || 0,
//     sgst: bill.sgst || 0,
//   });

//   // 5️⃣ Store original items to compare later during save
//   const origItemsMap = {};
//   rowsWithId.forEach(item => {
//     origItemsMap[item.id] = {
//       code: item.code,
//       batch: item.batch,
//       qty: Number(item.qty) || 0,
//     };
//   });

//   // 🧠 This object is used in handleSaveAndPrint() to detect stock difference
//   setOriginalBillItems(origItemsMap);

//   // 6️⃣ (Optional UX improvement)
//   setTimeout(() => {
//     document.querySelector('input[name="customerName"]')?.focus();
//   }, 200);
// };


// useEffect(() => {
//   if (viewBill) {
//     setViewBill(prev => ({
//       ...prev,
//       customerName: meta.customerName,
//       mobile: meta.mobile,
//       netAmount: totals.netAmount,
//     }));
//   }
// }, [meta.customerName, meta.mobile, totals.netAmount]);


// useEffect(() => {
//   const fetchNextBillNo = async () => {
//     try {
//       const headers = getAuthHeaders(user);
//       // Use the unified endpoint with "next-bill-no"
//       const { data } = await axiosInstance.get("/api/sales/next-bill-no", { headers });
//       setMeta(prev => ({ ...prev, billNo: data.billNo }));
//     } catch (err) {
//       console.error("Failed to fetch next bill no:", err.response?.data || err.message);
//       setMeta(prev => ({ ...prev, billNo: "B001" }));
//     }
//   };

//   if (showModal && !billEditMode) fetchNextBillNo();
// }, [showModal, billEditMode]);

// useEffect(() => {
//   if (!showModal) {
//     setMeta(prev => ({ ...prev, billNo: "" }));
//   }
// }, [showModal]);


// const openAddModal = () => {
//   setBillEditMode(false); // ensure Add mode
//   setMeta(prev => ({
//     ...prev,
//     billNo: "",         // temporarily empty, will fetch next
//     customerName: "",
//     mobile: "",
//     counter: "",
//     date: new Date().toISOString().slice(0, 10),
//   }));
//   setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//   setRows([createEmptyRow()]);
//   setStockErrors({});
//   setErrorMsg("");
//   setShowModal(true);   // finally open modal
// };





// return (
//   <div className="salesbill-container">
//     {/* ✅ Popup Message */}
//     {popup.message && (
//       <div className={`popup-message ${popup.type}`}>{popup.message}</div>
//     )}

//     {/* Header */}
//     <div className="salesbill-header">
//       <div>
//         <h1 className="salesbill-title">Sales Bill</h1>
//       </div>
//       <button className="add-btn" onClick={openAddModal}>
//   <FaPlus /> Add Sales
// </button>

//     </div>

//     {/* Toolbar */}
   
  
// <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
//   {/* Left: Search Box */}
//   <div className="flex min-w-[200px]">
//     <input
//       type="text"
//       placeholder="Search bill no / customer name / mobile"
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
//   <div className="flex gap-2 flex-wrap">
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
//   </div>
// </div>


//     {/* Table List */}


//     {/* <div className="salesbill-table-wrapper">
//   {loading ? (
//     <p className="muted">Loading…</p>
//   ) : filteredBills.length === 0 ? (
//     <p className="muted">No records found</p>
//   ) : (
//     <table className="salesbill-table clean full-width">
//       <thead>
//         <tr>
//           <th>S.No</th>
//           <th>Date</th>
//           <th>Bill No</th>
//           <th>Customer</th>
//           <th>Net Amount</th>
//           <th>Action</th>
//         </tr>
//       </thead>
   
//       <tbody>
//   {filteredBills.map((bill, i) => (
//     <tr key={bill._id} className="fade-in">
//       <td>{i + 1}</td>
//       <td>{formatDate(bill.date)}</td>
//       <td>{bill.billNo}</td>
//       <td>{bill.customerName || bill.meta?.customerName || ""}</td>
//       <td>{Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}</td>
//       <td className="salesbill-actions">
//         <button
//           onClick={() => setViewBill(bill)}
//           className="action-btn view"
//         >
//           <FaEye title="View" />
//         </button>
//         <button
//           onClick={() => handleEditBill(bill)}
//           className="action-btn edit"
//         >
//           <FaEdit title="Edit" />
//         </button>
//       </td>
//     </tr>
//   ))}
// </tbody>

//     </table>
//   )}
// </div> */}

// <div className="salesbill-table-wrapper">
//       {loading ? (
//         <p className="muted">Loading…</p>
//       ) : bills.length === 0 ? (
//         <p className="muted">No records found</p>
//       ) : (
//         <>
//           <table className="salesbill-table w-full border-collapse border border-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-4 py-2">S.No</th>
//                 <th className="border px-4 py-2">Date</th>
//                 <th className="border px-4 py-2">Bill No</th>
//                 <th className="border px-4 py-2">Customer</th>
//                 <th className="border px-4 py-2">Net Amount</th>
//                 <th className="border px-4 py-2">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bills.map((bill, i) => (
//                 <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
//                   <td className="border px-4 py-2">{(page - 1) * limit + i + 1}</td>
//                   <td className="border px-4 py-2">{formatDate(bill.date)}</td>
//                   <td className="border px-4 py-2">{bill.billNo}</td>
//                   <td className="border px-4 py-2">{bill.customerName || bill.meta?.customerName || ""}</td>
//                   <td className="border px-4 py-2 text-right">
//                     {Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}
//                   </td>
//                   <td className="border px-4 py-2 text-center">
//                     <button
//                       onClick={() => setViewBill(bill)}
//                       className="px-2 text-[#00A76F] hover:text-[#007867]"
//                     >
//                       <FaEye  />
//                     </button>
//                     <button
//                       onClick={() => handleEditBill(bill)}
//                       className="px-2 text-[#00A76F] hover:text-[#007867]"
//                     >
//                       <FaEdit color="orange" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <Pagination page={page} totalPages={totalPages} onPageChange={fetchBills} />
//         </>
//       )}
//     </div>


//     {/* Add/Edit Modal */}
//     {showModal && (
//       <div className="modal fade-in">
//         <div className="modal-content slide-up large">
//           <div className="modal-header">
//             <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
//             <button className="icon-close" onClick={() => setShowModal(false)}>
//               ×
//             </button>
//           </div>

//           {/* Meta */}
//           <form className="bill-meta">
//             <div className="meta-grid">
//               {/* <label>
//                 Bill No <input value={meta.billNo} readOnly />
//               </label> */}

//               <label>
//   Bill No <input type="text" value={meta.billNo || ""} readOnly />
// </label>

//               <label>
//                 Date <input type="date" value={meta.date} readOnly />
//               </label>
//               <label>
//                 Counter
//                 <input
//                   type="number"
//                   value={meta.counter}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, counter: e.target.value })
//                   }
//                 />
//               </label>
//               <label style={{ flex: "2" }}>
//                 Customer Name
//                 <input
//                   value={meta.customerName}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, customerName: e.target.value })
//                   }
//                 />
//               </label>
//               <label>
//                 Mobile
//                 <input
//                   type="text"
//                   value={meta.mobile}
//                   maxLength={10}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) => {
//                     let value = e.target.value.replace(/\D/g, "");
//                     if (value.length > 10) value = value.slice(0, 10);
//                     setMeta({ ...meta, mobile: value });
//                   }}
//                   placeholder="Enter a Mobile number"
//                 />
//               </label>
//             </div>
//           </form>

        

//               {/* Items table */}
// {/* Items table */}
//           {/* Items Table */}
//            <table
//             className="salesbill-table clean full-width"
//             style={{ tableLayout: "fixed" }}
//           >
//             <thead>
//               <tr>
//                 <th style={{ width: "50px" }}>S.No</th>
//                 <th style={{ width: "140px" }}>Product Code</th>
//                 <th style={{ width: "190px" }}>Product Name</th>
//                 <th style={{ width: "200px" }}>Batch</th>
//                 <th style={{ width: "100px" }}>MRP</th>
//                 <th style={{ width: "90px" }}>Rate</th>
//                 <th style={{ width: "80px" }}>GST%</th>
//                 <th style={{ width: "80px" }}>Qty</th>
//                 <th style={{ width: "90px" }}>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((row, index) => (
//                 <React.Fragment key={row.id}>
//                   <tr>
//                     <td>{index + 1}</td>
//                     <td className="relative">
//                       <input
//                         value={row.code || ""}
//                         onKeyDown={handleEnterKey}
//                         disabled={!row.isNew && editRowId !== row.id}
//                         onChange={(e) => {
//                           const v = e.target.value;
//                           updateRow(row.id, "code", v === "0" ? "" : v);
//                           if (v.trim() === "") {
//                             updateRow(row.id, "batch", "");
//                             updateRow(row.id, "mrp", 0);
//                             updateRow(row.id, "rate", 0);
//                             updateRow(row.id, "gst", 0);
//                             updateRow(row.id, "qty", 0);
//                           }
//                         }}
//                         onFocus={() => {
//                           if (row.code) {
//                             setShowCodeList((v) => ({ ...v, [row.id]: true }));
//                             // suggestCodesDebounced(row.id, row.code);
//                              suggestCodesDebounced(row.id, row.code || "");
//                           }
//                         }}
//                         onBlur={() => {
//                           setTimeout(() => {
//                             setShowCodeList((v) => ({ ...v, [row.id]: false }));
//                           }, 150);
//                         }}
//                         placeholder="Type or scan code"
//                       />
//                       {showCodeList[row.id] &&
//                         (codeSuggestions[row.id] || []).length > 0 && (
//                           <div className="suggestions">
//                             {(codeSuggestions[row.id] || []).map((p) => (
//                               <div
//                                 key={p._id || `${p.code}-${p.name}`}
//                                 className="suggestion"
//                                 onMouseDown={(e) => {
//                                   e.preventDefault();
//                                   handleSelectSuggestion(row.id, p);
//                                 }}
//                               >
//                                 <div style={{ fontWeight: "600" }}>{p.code}</div>
//                                 <div style={{ fontSize: 12 }}>{p.name}</div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                     </td> 
//                      <td className="relative">
//                       <input
//                         value={row.name || ""}
//                         onKeyDown={handleEnterKey}
//                         disabled={!row.isNew && editRowId !== row.id}
                        
//                         onChange={(e) => {
//                           const v = e.target.value;
//                           updateRow(row.id, "name", v);
//                           if (v.trim() === "") {
//                             updateRow(row.id, "batch", "");
//                             updateRow(row.id, "mrp", 0);
//                             updateRow(row.id, "rate", 0);
//                             updateRow(row.id, "gst", 0);
//                             updateRow(row.id, "qty", 0);
//                           }
//                         }}
//                         onFocus={() => {
//                           if (row.name) {
//                             setShowNameList((v) => ({ ...v, [row.id]: true }));
//                             // suggestNamesDebounced(row.id, row.name);
//                             suggestNamesDebounced(row.id, row.name || "");
//                           }
//                         }}
//                         onBlur={() => {
//                           setTimeout(() => {
//                             setShowNameList((v) => ({ ...v, [row.id]: false }));
//                           }, 150);
//                         }}
//                         placeholder="Type or select product"
//                       />
//                       {showNameList[row.id] &&
//                         (nameSuggestions[row.id] || []).length > 0 && (
//                           <div className="suggestions">
//                             {(nameSuggestions[row.id] || []).map((p) => (
//                               <div
//                                 key={p._id || `${p.code}-${p.name}`}
//                                 className="suggestion"
//                                 onMouseDown={(e) => {
//                                   e.preventDefault();
//                                   handleSelectSuggestion(row.id, p);
//                                 }}
//                               >
//                                 <div style={{ fontWeight: "600" }}>{p.name}</div>
//                                 <div style={{ fontSize: 12 }}>{p.code}</div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                     </td>

                    

//                     <td className="relative">
//                       <input
//                         className="input"
//                         placeholder="Enter or select batch number"
//                         value={row.batch}
//                         disabled={!row.isNew && editRowId !== row.id}
//                         onChange={(e) => {
//                           const v = e.target.value;
//                           setRows((prev) =>
//                             prev.map((r) => (r.id === row.id ? { ...r, batch: v } : r))
//                           );
//                           setShowBatchList((m) => ({ ...m, [row.id]: v.trim() === "" }));
//                         }}
//                         onFocus={() => {
//                           if (row.name) {
//                             const batches = getBatchesForName(row.name);
//                             setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
//                           } else if (row.code) {
//                             const batches = getBatchesForCode(row.code);
//                             setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
//                           }
//                           openBatchList(row.id);
//                         }}
//                         onBlur={() => {
//                           setTimeout(() => {
//                             setShowBatchList((m) => ({
//                               ...m,
//                               [row.id]: !!row.batch ? false : m[row.id],
//                             }));
//                           }, 150);
//                         }}
//                       />
//                       {Array.isArray(batchesByRow[row.id]) &&
//                         batchesByRow[row.id].length > 0 &&
//                         showBatchList[row.id] && (
//                           <div
//                             className="batch-suggestions"
//                             style={{
//                               maxHeight: 300,
//                               overflowY: "auto",
//                               border: "1px solid #eee",
//                               background: "#fff",
//                               zIndex: 50,
//                               width: 500,
//                             }}
//                           >
//                             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                               <thead>
//                                 <tr style={{ background: "#fafafa", fontSize: 13 }}>
//                                   <th style={{ padding: 4 }}>Batch</th>
//                                   <th style={{ padding: 4 }}>MRP</th>
//                                   <th style={{ padding: 4 }}>Rate</th>
//                                   <th style={{ padding: 4 }}>GST%</th>
//                                   <th style={{ padding: 4 }}>Stock</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {batchesByRow[row.id].map((b) => {
//                                   const available = getAvailableStock(b.code, b.batchNo);
//                                   return (
//                                     <tr
//                                       key={`${b.batchNo}-${b.rate}-${b.mrp}`}
//                                       onMouseDown={(e) => {
//                                         e.preventDefault();
//                                         handleBatchPick(row.id, b);
//                                       }}
//                                       style={{
//                                         cursor: "pointer",
//                                         borderBottom: "1px solid #f4f4f4",
//                                       }}
//                                     >
//                                       <td style={{ padding: 4, fontWeight: 600 }}>
//                                         {b.batchNo || "(no batch)"}
//                                       </td>
//                                       <td style={{ padding: 4 }}>{Number(b.mrp || 0).toFixed(2)}</td>
//                                       <td style={{ padding: 4 }}>{Number(b.rate || 0).toFixed(2)}</td>
//                                       <td style={{ padding: 4 }}>{b.gst}%</td>
//                                       <td style={{ padding: 4 }}>{available}</td>
//                                     </tr>
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           </div>
//                         )}
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         {...numberInputProps}
//                         value={row.mrp || 0}
//                         onFocus={(e) => {
//                           if (String(e.target.value) === "0") e.target.value = "";
//                           enableWheelBlock();
//                         }}
//                         onBlur={(e) => {
//                           if (e.target.value === "") updateRow(row.id, "mrp", 0);
//                           disableWheelBlock();
//                         }}
//                         disabled={!row.isNew && editRowId !== row.id}
//                         onChange={(e) => updateRow(row.id, "mrp", e.target.value)}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         {...numberInputProps}
//                         value={row.rate || 0}
//                         onFocus={(e) => {
//                           if (String(e.target.value) === "0") e.target.value = "";
//                           enableWheelBlock();
//                         }}
//                         onBlur={(e) => {
//                           if (e.target.value === "") updateRow(row.id, "rate", 0);
//                           disableWheelBlock();
//                         }}
//                         disabled={!row.isNew && editRowId !== row.id}
//                         onChange={(e) => updateRow(row.id, "rate", e.target.value)}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         {...numberInputProps}
//                         value={row.gst || 0}
//                         onFocus={(e) => {
//                           if (String(e.target.value) === "0") e.target.value = "";
//                           enableWheelBlock();
//                         }}
//                         onBlur={(e) => {
//                           if (e.target.value === "") updateRow(row.id, "gst", 0);
//                           disableWheelBlock();
//                         }}
//                         disabled={!row.isNew && editRowId !== row.id}
//                         onChange={(e) => updateRow(row.id, "gst", e.target.value)}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         {...numberInputProps}
//                         value={row.qty ? row.qty : ""}
//                         onFocus={(e) => {
//                           if (String(e.target.value) === "0") e.target.value = "";
//                           enableWheelBlock();
//                         }}
//                         onBlur={(e) => {
//                           if (e.target.value === "") updateRow(row.id, "qty", 0);
//                           disableWheelBlock();
//                         }}
//                         disabled={!row.isNew && editRowId !== row.id}
//                         onChange={(e) => {
//                           const raw = e.target.value;
//                           const qty = raw === "" ? 0 : Number(raw);
//                           updateRow(row.id, "qty", qty);

//                           const available = row.batch
//                             ? getAvailableStock(row.code, row.batch)
//                             : null;

//                           if (available !== null && qty > available) {
//                             setRowStockError(
//                               row.id,
//                               `Out of stock: requested ${qty}, only ${available} available`
//                             );
//                           } else {
//                             setRowStockError(row.id, null);
//                           }
//                         }}
//                       />
//                     </td>
//                     <td className="row-actions">
//                       {row.isNew ? (
//                         <button onClick={() => addRow(row.id)} className="plus">
//                           <FaPlus />
//                         </button>
//                       ) : editRowId === row.id ? (
//                         <>
//                           <button
//                             onClick={() => saveRowEdit(row.id)}
//                             className="success"
//                             style={{ color: "green" }}
//                           >
//                             <FaCheck />
//                           </button>
//                           <button onClick={cancelRowEdit} className="danger">
//                             <FaTimes />
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => setEditRowId(row.id)}
//                             className="edit"
//                           >
//                             <FaEdit />
//                           </button>
//                           <button onClick={() => deleteRow(row.id)} className="danger">
//                             <FaTrash />
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>

//                   {stockErrors[row.id] && (
//                     <tr>
//                       <td colSpan="9" style={{ color: "red", fontSize: 13 }}>
//                         ❌ {stockErrors[row.id]}
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table> 

     


//           {/* --------------------------
// {/* --------------------------- */}
// {/* ✅ Items Table with Autocomplete */}
// {/* --------------------------- */}
// {/* --------------------------- */}
// {/* ✅ Items Table with Autocomplete */}
// {/* --------------------------- */}





// {/* --------------------------
// ✅ Error Display
// --------------------------- */}
// {Object.keys(stockErrors).length > 0 && (
//   <div style={{ color: "red", marginTop: 10 }}>
//     {Object.values(stockErrors).map((msg, i) => (
//       <div key={i}>❌ {msg}</div>
//     ))}
//   </div>
// )}

// {errorMsg && <p className="error">{errorMsg}</p>}

//           {Object.keys(stockErrors).length > 0 && (
//             <div style={{ color: "red", marginTop: 10 }}>
//               {Object.values(stockErrors).map((msg, i) => (
//                 <div key={i}>❌ {msg}</div>
//               ))}
//             </div>
//           )}

//           {errorMsg && <p className="error">{errorMsg}</p>} 





//               {Object.keys(stockErrors).length > 0 && <div style={{ color: "red", marginTop: 10 }}>{Object.values(stockErrors).map((msg, i) => <div key={i}>❌ {msg}</div>)}</div>}
//               {errorMsg && <p className="error">{errorMsg}</p>}


// {/* Global Stock Errors */}
// {/* {Object.keys(stockErrors).length > 0 && (
//   <div style={{ color: "red", marginTop: 10 }}>
//     {Object.values(stockErrors).map((msg, i) => (
//       <div key={i}>❌ {msg}</div>
//     ))}
//   </div>
// )}

// {errorMsg && <p className="error">{errorMsg}</p>} */}

// {/* Totals */}
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
//   {/* Left column */}
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
//           onWheel={(e) => e.target.blur()} // disable mouse scroll change
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

//   {/* Right column - Bill Summary */}
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
//       {/* <strong>{totals.cgst.toFixed(2)}</strong> */}
//       <strong>{Number(totals.cgst || 0).toFixed(2)}</strong>
//     </div>
//     <div className="summary-line" style={{ display: "flex", justifyContent: "space-between" }}>
//       <span>SGST</span>
//       {/* <strong>{totals.sgst.toFixed(2)}</strong> */}
//       <strong>{Number(totals.sgst || 0).toFixed(2)}</strong>
//     </div>
//     <hr style={{ border: "0.5px solid #ddd" }} />
//     <div className="summary-total" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
//       <span>Bill Amount</span>
//       {/* <strong>{totals.netAmount.toFixed(2)}</strong> */}
//       <strong>{Number(totals.netAmount || 0).toFixed(2)}</strong>

//     </div>
//   </div>

//   {/* Animation */}
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


// {/* Totals */}




//           <div className="modal-actions">
//             <button className="primary" onClick={handleSaveAndPrint}>
//               Print
//             </button>
//           </div>
//         </div>
//       </div>
//     )}


//     {/* View Bill Modal */}
// {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>
//           <FaTimes />
//         </button>
//       </div>
//       <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//       <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//       {/* <p><strong>Customer:</strong> {viewBill.meta.customerName} ({viewBill.meta.mobile})</p>
//       <p><strong>Net Amount:</strong> {viewBill.totals.netAmount}</p> */}
//       <p>
//   <strong>Customer:</strong> {viewBill.customerName || viewBill.meta?.customerName || ""} 
//   ({viewBill.mobile || viewBill.meta?.mobile || ""})
// </p>
// <p>
//   <strong>Net Amount:</strong> {viewBill.netAmount || viewBill.totals?.netAmount || 0}
// </p>

//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}





//   </div>
// );




// }


// {/* Styles to prevent horizontal scrollbar */}
// <style jsx>{`
//   .salesbill-table {
//     width: 100%;
//     border-collapse: collapse;
//     table-layout: fixed; /* Prevent horizontal scroll */
//   }
//   .salesbill-table input {
//     box-sizing: border-box;
//   }
// `}</style>











//12/10/25 7.36
// // src/pages/SalesBill.jsx
// import React, { useState, useEffect, useMemo, useRef, useCallback, useContext} from "react";
// import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../styles/salesbill.css";
// import { useAuth } from "../context/AuthContext";
// import { getAuthHeaders, API  } from "../utils/apiHeaders";
// import Pagination from "../components/Pagination";
// import debounce from "lodash.debounce"; 

// // import { ShopContext } from "../context/ShopContext";


// // const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // ✅ No interceptor – we now use getAuthHeaders(user)
// const axiosInstance = axios.create({ baseURL: API });

// export default function SalesBill() {
//   const { user } = useAuth(); // ✅ useAuth gives user
//     // const { selectedShop } = useContext(ShopContext); 
//   const token = localStorage.getItem("token");
//   const shopname = user?.shopname || localStorage.getItem("shopname");

//   // ---- State ----
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
//   const debounceRef = useRef({});
//   // Search & Filter states     
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [viewBill, setViewBill] = useState(null);

//   const [editRowId, setEditRowId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [inputValue, setInputValue] = useState("");
// const [suggestions, setSuggestions] = useState([]);
// const [rowStockError, setRowStockError] = useState({});
// const [billNo, setBillNo] = useState("");
// const [originalRowData, setOriginalRowData] = useState({});
// const [originalBillItems, setOriginalBillItems] = useState({});

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10; // rows per page

// const [stockCache, setStockCache] = useState({});



//   // ⚡ Enter key handler
//   const handleEnterKey = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const form = e.target.form;
//       if (!form) return;
//       const elements = Array.from(form.elements).filter(
//         (el) => el.tagName === "INPUT" && el.type !== "hidden"
//       );
//       const index = elements.indexOf(e.target);
//       if (elements[index + 1]) {
//         elements[index + 1].focus();
//       } else {
//         if (typeof addRow === "function") {
//           addRow();
//           setTimeout(() => {
//             const newElements = Array.from(form.elements).filter(
//               (el) => el.tagName === "INPUT" && el.type !== "hidden"
//             );
//             newElements[newElements.length - 1]?.focus();
//           }, 100);
//         }
//       }
//     }
//   };

//   const numberInputProps = {
//     onWheel: (e) => e.target.blur(),
//   };


//   // ---- Helpers ----
//   function createEmptyRow() {
//     return { id: Date.now(), code: "", name: "", batch: "", mrp: 0, rate: 0, qty: 0, gst: 0, amount: 0, value: 0, isNew: true };
//   }

//   const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

//   // const debounce = useCallback((key, fn, delay = 250) => (...args) => {
//   //   clearTimeout(debounceRef.current[key]);
//   //   debounceRef.current[key] = setTimeout(() => fn(...args), delay);
//   // }, []);

// //   const debounce = useCallback(
// //   (key, fn, delay = 250) => (...args) => {
// //     if (typeof fn !== "function") {
// //       console.warn("debounce: expected a function, got", fn);
// //       return;
// //     }
// //     clearTimeout(debounceRef.current[key]);
// //     debounceRef.current[key] = setTimeout(() => fn(...args), delay);
// //   },
// //   []
// // );


//   const showPopup = (message, type = "error") => {
//     setPopup({ message, type });
//     setTimeout(() => setPopup({ message: "", type: "" }), 2500);
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
//   };

//   // ---- Fetch Functions ----
//   // const fetchProducts = async () => {
//   //   try {
//   //     const { data } = await axiosInstance.get("/api/products", {
//   //       headers: getAuthHeaders(user),
//   //     });
//   //     setProducts((data || []).map(p => ({
//   //       ...p,
//   //       code: p.code || "",
//   //       name: p.name || "",
//   //       batchNo: p.batchNo || "",
//   //       mrp: Number(p.mrp || p.price || 0),
//   //       salePrice: Number(p.salePrice || p.price || 0),
//   //       taxPercent: Number(p.taxPercent || 0),
//   //       qty: Number(p.qty || 0),
//   //       minQty: Number(p.minQty || 0),
//   //       _id: p._id || p.id || null
//   //     })));
//   //   } catch (e) { console.error("Error fetching products", e); }
//   // };

// //   const fetchProducts = async () => {
// //   try {
// //     const { data } = await axiosInstance.get("/api/products", {
// //       headers: getAuthHeaders(user),
// //     });

// //     // 🧩 Ensure `products` is always an array
// //     const productList = Array.isArray(data)
// //       ? data
// //       : Array.isArray(data.products)
// //       ? data.products
// //       : [];

// //     setProducts(
// //       productList.map((p) => ({
// //         ...p,
// //         code: p.code || "",
// //         name: p.name || "",
// //         batchNo: p.batchNo || "",
// //         mrp: Number(p.mrp || p.price || 0),
// //         salePrice: Number(p.salePrice || p.price || 0),
// //         taxPercent: Number(p.taxPercent || 0),
// //         qty: Number(p.qty || 0),
// //         minQty: Number(p.minQty || 0),
// //         _id: p._id || p.id || null,
// //       }))
// //     );
// //   } catch (e) {
// //     console.error("Error fetching products", e);
// //     setProducts([]); // fallback to empty array on error
// //   }
// // };

// const fetchProducts = async () => {
//   try {
//     const { data } = await axiosInstance.get("/api/products", {
//       headers: getAuthHeaders(user),
//     });

//     const productList = Array.isArray(data)
//       ? data
//       : Array.isArray(data.products)
//       ? data.products
//       : [];

//     setProducts(
//       productList.map((p) => ({
//         ...p,
//         code: p.code || "",
//         name: p.name || "",
//         batchNo: p.batchNo || "",
//         mrp: Number(p.mrp || p.price || 0),
//         salePrice: Number(p.salePrice || p.price || 0),
//         taxPercent: Number(p.taxPercent || 0),
//         qty: Number(p.qty || 0),
//         minQty: Number(p.minQty || 0),
//         _id: p._id || p.id || null,
//       }))
//     );
//   } catch (e) {
//     console.error("Error fetching products", e);
//     setProducts([]);
//   }
// };

// useEffect(() => {
//   fetchProducts();
// }, []);


//   // const fetchBills = async () => {
//   //   try {
//   //     const { data } = await axiosInstance.get("/api/sales", {
//   //       headers: getAuthHeaders(user),
//   //     });
//   //     setBills(data);
//   //   } catch (e) { console.error("Error fetching bills", e); }
//   //   finally { setLoading(false); }
//   // };

// const fetchBills = async (pageNum = 1) => {
//   try {
//     setLoading(true);

//     // Build query params
//     const params = new URLSearchParams({
//       page: pageNum,
//       limit,
//       search,      // billNo / customerName / mobile
//       filter,      // today / this-week / this-month / custom
//       fromDate,    // for custom range
//       toDate,
//     });

//     const { data } = await axiosInstance.get(`/api/sales?${params.toString()}`, {
//       headers: getAuthHeaders(user),
//     });

//     setBills(Array.isArray(data.bills) ? data.bills : []);
//     setTotalPages(data.totalPages || 1);
//     setPage(data.page || pageNum);
//   } catch (error) {
//     console.error("Error fetching bills", error);
//     setBills([]);
//     setTotalPages(1);
//   } finally {
//     setLoading(false);
//   }
// };

// useEffect(() => {
//   fetchBills(1);
// }, [page, search, filter, fromDate, toDate]);


// const fetchBillNo = async () => {
//   try {
//     if (!token || !shopname) {
//       console.error("Missing token or shopname");
//       return;
//     }

//     const { data } = await axiosInstance.get("/api/sales/next-billno", {
//       headers: {
//         ...getAuthHeaders(user),
//         "x-shopname": shopname   // ensure shop/tenant is sent
//       }
//     });

//     const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
//     setMeta(prev => ({
//       ...prev,
//       billNo: data.nextBillNo,
//       date: istDate.toISOString().split("T")[0]
//     }));

//   } catch (e) {
//     console.error("Failed to fetch bill number", e);
//   }
// };



//   useEffect(() => {
//     if (token && shopname) {
//       fetchProducts();
//       fetchBillNo();
//       fetchBills();
//     }
//   }, [token, shopname]);


//   const debounce = useCallback((fn, delay = 250) => {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// }, []);

// // ---------------------
// // Suggestion Handlers
// // ---------------------
// const suggestNamesDebounced = useMemo(
//   () =>
//     debounce((rowId, query) => {
//       if (!query) return setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//       const matches = products.filter((p) =>
//         (p.name || "").toLowerCase().includes(query.toLowerCase())
//       );
//       setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
//     }, 250),
//   [products]
// );

// const suggestCodesDebounced = useMemo(
//   () =>
//     debounce((rowId, query) => {
//       if (!query) return setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//       const matches = products.filter((p) =>
//         (p.code || "").toLowerCase().includes(query.toLowerCase())
//       );
//       setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
//     }, 250),
//   [products]
// );



// // // A ref to store debounce timers
// // const debounceRef = useRef({});

// // // Reusable debounce helper
// // const debounce = useCallback((key, fn, delay = 250) => {
// //   return (...args) => {
// //     if (typeof fn !== "function") {
// //       console.warn("debounce: expected a function, got", fn);
// //       return;
// //     }
// //     clearTimeout(debounceRef.current[key]);
// //     debounceRef.current[key] = setTimeout(() => fn(...args), delay);
// //   };
// // }, []);

// // Example: product name/code suggestor


// // // ✅ Create debounced versions once
// // const suggestCodesDebounced = useMemo(
// //   () => debounce("codeSearch", (rowId, q) => fetchSuggestions("code", rowId, q), 300),
// //   [debounce]
// // );

// // const suggestNamesDebounced = useMemo(
// //   () => debounce("nameSearch", (rowId, q) => fetchSuggestions("name", rowId, q), 300),
// //   [debounce]
// // );




//   const getAvailableStock = (code, batch) => {
//     const base = products.filter(p => (p.code||"").toLowerCase() === (code||"").toLowerCase() && (p.batchNo||"").toLowerCase() === (batch||"").toLowerCase()).reduce((sum,p)=>sum+Number(p.qty||0),0);
//     const reserved = Number(reservedStock[keyFor(code,batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   const recalcRow = (r) => {
//     const rate = Number(r.rate || 0);
//     const qty = Number(r.qty || 0);
//     const gst = Number(r.gst || 0);
//     const amount = +(rate*qty).toFixed(2);
//     const value = +(amount + (amount*gst/100)).toFixed(2);
//     return { ...r, amount, value };
//   };

//   // ---- Add / Delete / Edit Rows ----
//   const addRow = (id) => {
//     const row = rows.find(r => r.id===id);
//     if (!row || !row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code,row.batch);
//     if (available < row.qty) return showPopup(`Only ${available} left`);
//     const k = keyFor(row.code,row.batch);
//     setReservedStock(rs => ({ ...rs, [k]: (rs[k]||0)+Number(row.qty) }));
//     setRows(prev => prev.map(r => r.id===id ? {...r,isNew:false}:r).concat(createEmptyRow()));
//   };

//   const deleteRow = (id) => {
//     const row = rows.find(r=>r.id===id);
//     if(row && !row.isNew) {
//       const k = keyFor(row.code,row.batch);
//       setReservedStock(rs => ({ ...rs, [k]: Math.max(0,(rs[k]||0)-Number(row.qty)) }));
//     }
//     setRows(prev=>prev.filter(r=>r.id!==id));
//   };

// const cancelRowEdit = () => {
//   if (!editRowId) return;
//   setRows(prev => prev.map(r => 
//     r.id === editRowId ? { ...originalRowData[editRowId] } : r
//   ));
//   setOriginalRowData(prev => {
//     const copy = { ...prev };
//     delete copy[editRowId];
//     return copy;
//   });
//   setEditRowId(null);
// };

 
//   useEffect(()=>{
//     const total = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount,0);
//     const gstTotal = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount*(r.gst||0)/100,0);
//     const discount = Number(totals.discount||0);
//     const netAmount = +(total+gstTotal-discount).toFixed(2);
//     const cashGiven = Number(totals.cashGiven||0);
//     const balance = +(cashGiven>=netAmount ? cashGiven-netAmount : netAmount-cashGiven).toFixed(2);
//     const cgst = +(gstTotal/2).toFixed(2);
//     const sgst = +(gstTotal/2).toFixed(2);
//     setTotals(prev=>({ ...prev,total,discount,netAmount,balance,cashGiven,cgst,sgst }));
//   }, [rows, totals.discount, totals.cashGiven]);

//   // ---- Suggestions ----
//   // const suggestNamesDebounced = debounce("name", async (rowId, query) => {
//   //   if (!query) return setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//   //   const matches = products.filter((p) =>
//   //     (p.name || "").toLowerCase().includes(query.toLowerCase())
//   //   );
//   //   setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
//   // }, 250);

//   // const suggestCodesDebounced = debounce("code", async (rowId, query) => {
//   //   if (!query) return setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//   //   const matches = products.filter((p) =>
//   //     (p.code || "").toLowerCase().includes(query.toLowerCase())
//   //   );
//   //   setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
//   // }, 250);
// // const suggestNamesDebounced = debounce(
// //   "nameSearch",
// //   async (rowId, query) => {
// //     if (!query) return setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
// //     const matches = products.filter((p) =>
// //       (p.name || "").toLowerCase().includes(query.toLowerCase())
// //     );
// //     setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
// //   },
// //   250
// // );

// // const suggestCodesDebounced = debounce(
// //   "codeSearch",
// //   async (rowId, query) => {
// //     if (!query) return setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
// //     const matches = products.filter((p) =>
// //       (p.code || "").toLowerCase().includes(query.toLowerCase())
// //     );
// //     setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
// //   },
// //   250
// // );


//   // import debounce from "lodash.debounce"; // or your custom debounce utility

// // // 🔹 Suggest by product name
// // const suggestNamesDebounced = useMemo(() => debounce((rowId, query) => {
// //   if (!query) {
// //     setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
// //     return;
// //   }

// //   const matches = products.filter((p) =>
// //     (p.name || "").toLowerCase().includes(query.toLowerCase())
// //   );
// //   setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
// // }, 250), [products]);

// // // 🔹 Suggest by product code
// // const suggestCodesDebounced = useMemo(() => debounce((rowId, query) => {
// //   if (!query) {
// //     setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
// //     return;
// //   }

// //   const matches = products.filter((p) =>
// //     (p.code || "").toLowerCase().includes(query.toLowerCase())
// //   );
// //   setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
// // }, 250), [products]);

//   // ---- Save & Print ----





//   const resetBillForm = () => {
//     setMeta(prev=>({ ...prev, customerName:"", mobile:"" }));
//     setBillEditMode(false);
//     setEditingBillId(null);
//     setRows([createEmptyRow()]);
//     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//     setReservedStock({});
//   };

// // Handle product code or name selection from suggestions



// // const handleSelectSuggestion = (rowId, product) => {
// //   setRows(prev =>
// //     prev.map(r => {
// //       if (r.id !== rowId) return r;
// //       const updated = {
// //         ...r,
// //         code: product.code,
// //         name: product.name,
// //         batch: "",
// //         mrp: Number(product.mrp || 0),
// //         rate: Number(product.salePrice || product.rate || 0),
// //         gst: Number(product.gst || 0),
// //         qty: 0
// //       };
// //       return recalcRow(updated);
// //     })
// //   );

// //   setShowCodeList(prev => ({ ...prev, [rowId]: false }));
// //   setShowNameList(prev => ({ ...prev, [rowId]: false }));

// //   // Load batches for this product
// //   const batches = getBatchesForCode(product.code);
// //   setBatchesByRow(prev => ({ ...prev, [rowId]: batches }));
// //   setShowBatchList(prev => ({ ...prev, [rowId]: batches.length > 0 }));
// // };

// const handleSelectSuggestion = (rowId, product) => {
//   // Update row values
//   setRows(prev =>
//     prev.map(r => {
//       if (r.id !== rowId) return r;

//       const updated = {
//         ...r,
//         code: product.code,
//         name: product.name,
//         batch: "", // reset batch when product changes
//         mrp: Number(product.mrp || 0),
//         rate: Number(product.salePrice || product.rate || 0),
//         gst: Number(product.gst || 0),
//         qty: 0
//       };

//       return recalcRow(updated);
//     })
//   );

//   // Hide suggestion lists
//   setShowCodeList(prev => ({ ...prev, [rowId]: false }));
//   setShowNameList(prev => ({ ...prev, [rowId]: false }));

//   // Load batches for this product
//   const batches = getBatchesForCode(product.code) || [];
//   setBatchesByRow(prev => ({ ...prev, [rowId]: batches }));
//   setShowBatchList(prev => ({ ...prev, [rowId]: batches.length > 0 }));
// };




// const updateRow = (id, field, value, skipRecalc = false) => {
//   setRows(prev =>
//     prev.map(r => {
//       if (r.id !== id) return r;
//       let val = value;
//       if (["mrp", "rate", "gst", "qty"].includes(field)) {
//         val = Number(value) || 0;
//       }
//       const updated = { ...r, [field]: val };
//       return skipRecalc ? updated : recalcRow(updated);
//     })
//   );
// };



// const normalizeBatch = (m) => ({
//   ...m,
//   batchNo: m.batchNo || "",
//   mrp: Number(m.mrp || 0),
//   rate: Number(m.rate || m.salePrice || 0),
//   gst: Number(m.taxPercent || 0),   // ✅ map correctly
//   taxMode: m.taxMode || "exclusive",
//   qty: Number(m.qty || 0),
// });

// const getBatchesForCode = (code) => {
//   return products
//     .filter((p) => (p.code || "").toLowerCase() === (code || "").toLowerCase())
//     .map(normalizeBatch);
// };

// const getBatchesForName = (name) => {
//   return products
//     .filter((p) => (p.name || "").toLowerCase() === (name || "").toLowerCase())
//     .map(normalizeBatch);
// };


// const handleBatchPick = (rowId, batch) => {
//   setRows(prev => prev.map(r => {
//     if (r.id !== rowId) return r;
//     const updated = {
//       ...r,
//       batch: batch.batchNo || "",
//       mrp: Number(batch.mrp || 0),
//       rate: Number(batch.salePrice || 0),
//       gst: Number(batch.gst || 0),  // ✅ from taxPercent
//       qty: 0,
//     };
//     return recalcRow(updated);
//   }));

//   setShowBatchList(prev => ({ ...prev, [rowId]: false }));
// };


// const printBill = (bill) => {
//   const printWindow = window.open("", "_blank");
//   printWindow.document.write(`<pre>${JSON.stringify(bill, null, 2)}</pre>`);
//   printWindow.document.close();
//   printWindow.print();
// };


// // Generate temporary unique IDs for new rows
// const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);




// useEffect(() => {
//   if (viewBill) {
//     setViewBill(prev => ({
//       ...prev,
//       customerName: meta.customerName,
//       mobile: meta.mobile,
//       netAmount: totals.netAmount,
//     }));
//   }
// }, [meta.customerName, meta.mobile, totals.netAmount]);


// // ---- Filtered Bills ----
// const filteredBills = useMemo(() => {
//   if (!bills) return [];
//   return bills.filter((bill) => {
//     const term = search.toLowerCase();
//     const customerName = (bill.customerName || bill.meta?.customerName || "").toLowerCase();
//     const mobile = (bill.mobile || bill.meta?.mobile || "").toLowerCase();
//     const billNo = (bill.billNo || "").toLowerCase();
//     return (
//       customerName.includes(term) ||
//       mobile.includes(term) ||
//       billNo.includes(term)
//     );
//   });
// }, [bills, search]);



// // --------------------------
// // Save single row (UI only, live validation & stock cache update)
// // ---------------------------
// const saveRowEdit = async (rowId) => {
//   const row = rows.find(r => r.id === rowId);
//   if (!row) return;

//   // 1️⃣ Required fields check
//   if (!row.code || !row.name || !row.batch || row.qty === undefined || row.rate === undefined) {
//     showPopup("⚠️ Please fill all required fields before saving.");
//     return;
//   }

//   const newQty = Number(row.qty);
//   const oldQty = Number(originalBillItems?.[rowId]?.qty || 0);

//   // 2️⃣ Get batch info
//   const product = products.find(p => p.code === row.code && p.name === row.name);
//   const batches = product ? getBatches(product) : [{ batchNo: row.batch, qty: 0 }];
//   const batchInfo = batches.find(b => b.batchNo === row.batch) || { qty: 0 };

//   const stockBefore = typeof getStockCache === "function"
//     ? getStockCache(row.code, row.batch)
//     : batchInfo.qty;

//   // 3️⃣ Calculate resulting stock
//   let resultingStock = stockBefore;
//   let actionType = "none";
//   let qtyChange = 0;

//   if (newQty > oldQty) {
//     qtyChange = newQty - oldQty;
//     resultingStock = stockBefore - qtyChange;
//     actionType = "decrement";
//   } else if (newQty < oldQty) {
//     qtyChange = oldQty - newQty;
//     resultingStock = stockBefore + qtyChange;
//     actionType = "increment";
//   }

//   // 4️⃣ Stock validation
//   if (resultingStock < 0) {
//     setStockErrors(prev => ({
//       ...prev,
//       [rowId]: `⚠️ Only ${stockBefore + oldQty} available. Enter a smaller quantity.`
//     }));
//     return;
//   } else {
//     setStockErrors(prev => {
//       const copy = { ...prev };
//       delete copy[rowId];
//       return copy;
//     });
//   }

//   // 5️⃣ Update row locally
//   setRows(prev =>
//     prev.map(r =>
//       r.id === rowId
//         ? { ...r, qty: newQty, isNew: false, edited: true, resultingStock }
//         : r
//     )
//   );

//   // 6️⃣ Update originalBillItems map
//   setOriginalBillItems(prev => ({
//     ...prev,
//     [rowId]: { code: row.code, batch: row.batch, qty: newQty },
//   }));

//   // 7️⃣ Update live stock cache
//   if (typeof updateStockCache === "function") {
//     updateStockCache(row.code, row.batch, resultingStock);
//   }

//   // 8️⃣ Log for debugging
//   console.table([{
//     Action: "Edit Row",
//     "Item Code": row.code,
//     "Batch No": row.batch,
//     "Previous Bill Qty": oldQty,
//     "New Qty": newQty,
//     "Stock Before Edit": stockBefore,
//     "Resulting Stock": resultingStock,
//     "Logic Applied": actionType
//   }]);

//   // 9️⃣ Backend update
//   if (actionType !== "none" && qtyChange > 0) {
//     try {
//       const headers = getAuthHeaders(user);

//       if (actionType === "decrement") {
//         await axiosInstance.put(
//           "/api/products/decrement-stock",
//           { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
//           { headers }
//         );
//       } else if (actionType === "increment") {
//         await axiosInstance.put(
//           "/api/products/increment-stock",
//           { items: [{ code: row.code, batchNo: row.batch, qty: qtyChange }] },
//           { headers }
//         );
//       }
//     } catch (err) {
//       console.error("Backend stock update failed:", err.response?.data || err.message);
//       showPopup("⚠️ Failed to update stock on server. UI updated only.");
//     }
//   }

//   // 10️⃣ Exit edit mode
//   setEditRowId(null);
//   showPopup("✅ Row updated and stock synced successfully.");
// };




// // ---------------------------
// // Unified getBatches helper
// // ---------------------------
// const getBatches = (prod) => {
//   const product = products.find(p => p.code === prod.code && p.name === prod.name);
//   if (!product) return [];

//   if (product.batches && product.batches.length > 0) {
//     return product.batches.map(b => ({
//       batchNo: b.batchNo || "",
//       qty: b.qty || 0,
//       mrp: b.mrp || product.mrp,
//       rate: b.rate || product.rate,
//       gst: b.gst || product.gst,
//       ...b
//     }));
//   }

//   return [{
//     batchNo: product.batchNo || "",
//     qty: product.qty || 0,
//     mrp: product.mrp,
//     rate: product.rate,
//     gst: product.gst,
//     ...product
//   }];
// };


// // ---------------------------
// // Save & Print (backend update with correct increment/decrement)
// // ---------------------------
// const handleSaveAndPrint = async () => {
//   try {
//     if (!rows.length) {
//       setErrorMsg("Add items before saving.");
//       return;
//     }

//     const validItems = rows.filter(r => r.code && r.batch && r.qty >= 0);
//     if (!validItems.length) {
//       setErrorMsg("No valid items to save.");
//       return;
//     }

//     const headers = getAuthHeaders(user);
//     const stockLog = []; // Table log for debugging

//     // -------------------------------
//     // 1️⃣ Apply increment/decrement logic
//     // -------------------------------
//     for (const r of validItems) {
//       const newQty = Number(r.qty);
//       const oldQty = Number(originalBillItems?.[r.id]?.qty || 0);

//       // Skip if unchanged
//       if (newQty === oldQty) continue;

//       const product = products.find(p => p.code === r.code && p.name === r.name);
//       const batchInfo = product
//         ? getBatches(product).find(b => b.batchNo === r.batch) || { qty: 0 }
//         : { qty: 0 };

//       const availableStock = typeof getAvailableStock === "function"
//         ? getAvailableStock(r.code, r.batch)
//         : batchInfo.qty;

//       let resultingStock;
//       let apiCallType;
//       let qtyToUpdate;

//       if (newQty > oldQty) {
//         // Decrement stock by (newQty - oldQty)
//         qtyToUpdate = newQty - oldQty;
//         resultingStock = availableStock - qtyToUpdate;
//         apiCallType = "decrement";
//       } else if (newQty < oldQty) {
//         // Increment stock by (oldQty - newQty)
//         qtyToUpdate = oldQty - newQty;
//         resultingStock = availableStock + qtyToUpdate;
//         apiCallType = "increment";
//       }

//       // -------------------------------
//       // 2️⃣ Call backend API
//       // -------------------------------
//       if (qtyToUpdate > 0) {
//         const url = apiCallType === "decrement"
//           ? "/api/products/decrement-stock"
//           : "/api/products/increment-stock";

//         await axiosInstance.put(
//           url,
//           { items: [{ code: r.code, batchNo: r.batch, qty: qtyToUpdate }] },
//           { headers }
//         );

//         // Update local stock cache for UI
//         if (typeof updateStockCache === "function") {
//           updateStockCache(r.code, r.batch, resultingStock);
//         }

//         // Log for debugging
//         stockLog.push({
//           Action: apiCallType === "decrement" ? `Decrement ${qtyToUpdate}` : `Increment ${qtyToUpdate}`,
//           "Item Code": r.code,
//           "Batch No": r.batch,
//           "Previous Bill Qty": oldQty,
//           "New Qty": newQty,
//           "Stock Before Edit": availableStock,
//           "Resulting Stock": resultingStock
//         });
//       }
//     }

//     // Display stock table in console
//     console.table(stockLog);

//     // -------------------------------
//     // 3️⃣ Prepare & save bill payload
//     // -------------------------------
//     const salesPayload = {
//       billNo: meta.billNo,
//       date: meta.date || new Date(),
//       counter: meta.counter || 1,
//       customerName: meta.customerName || "Cash Customer",
//       mobile: meta.mobile || "",
//       items: validItems.map(r => ({
//         code: r.code,
//         name: r.name,
//         batch: r.batch,
//         mrp: Number(r.mrp),
//         rate: Number(r.rate),
//         gst: Number(r.gst),
//         qty: Number(r.qty),
//         amount: Number(r.rate) * Number(r.qty),
//         value: Number(r.rate) * Number(r.qty) * (1 + Number(r.gst)/100),
//       })),
//       total: totals.total || 0,
//       discount: totals.discount || 0,
//       netAmount: totals.netAmount || 0,
//       cashGiven: totals.cashGiven || 0,
//       balance: totals.balance || 0,
//       cgst: totals.cgst || 0,
//       sgst: totals.sgst || 0
//     };

//     let savedBill;
//     if (billEditMode && editingBillId) {
//       const { data } = await axiosInstance.put(`/api/sales/${editingBillId}`, salesPayload, { headers });
//       savedBill = data;
//     } else {
//       const { data } = await axiosInstance.post("/api/sales", salesPayload, { headers });
//       savedBill = data;
//     }

//     // -------------------------------
//     // 4️⃣ Update frontend state
//     // -------------------------------
//     if (billEditMode) setBills(prev => prev.map(b => b._id === savedBill._id ? savedBill : b));
//     else setBills(prev => [savedBill, ...prev]);

//     setViewBill(savedBill);

//     // -------------------------------
//     // 5️⃣ Reset originalBillItems
//     // -------------------------------
//     const newOriginalMap = {};
//     validItems.forEach(r => {
//       newOriginalMap[r.id] = { code: r.code, batch: r.batch, qty: Number(r.qty) };
//     });
//     setOriginalBillItems(newOriginalMap);

//     // -------------------------------
//     // 6️⃣ Print & reset UI
//     // -------------------------------
//     setTimeout(() => window.print(), 100);
//     setShowModal(false);
//     setRows([createEmptyRow()]);
//     setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
//     setMeta(prev => ({ ...prev, customerName: "", mobile: "" }));
//     setErrorMsg("");
//     setBillEditMode(false);
//     setEditingBillId(null);

//   } catch (err) {
//     console.error("Save/Print error:", err.response?.data || err.message);
//     setErrorMsg(err.response?.data?.message || "Failed to save/print");
//   }
// };




// // ----------------------
// // Edit existing Sales Bill
// // ----------------------
// const handleEditBill = (bill) => {
//   if (!bill) return;

//   // 1️⃣ Enable edit mode and store current bill ID
//   setBillEditMode(true);
//   setEditingBillId(bill._id);
//   setShowModal(true);

//   // 2️⃣ Map items with consistent row IDs
//   const rowsWithId = bill.items.map((item, idx) => ({
//     ...item,
//     id: item._id || `item-${idx}-${Date.now()}`,
//     isNew: false,
//   }));
//   setRows(rowsWithId);

//   // 3️⃣ Fill meta info
//   setMeta({
//     billNo: bill.billNo || "",
//     date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
//     counter: bill.counter || 1,
//     customerName: bill.customerName || "",
//     mobile: bill.mobile || "",
//   });

//   // 4️⃣ Fill totals
//   setTotals({
//     total: bill.total || 0,
//     discount: bill.discount || 0,
//     netAmount: bill.netAmount || 0,
//     cashGiven: bill.cashGiven || 0,
//     balance: bill.balance || 0,
//     cgst: bill.cgst || 0,
//     sgst: bill.sgst || 0,
//   });

//   // 5️⃣ Store original items to compare later during save
//   const origItemsMap = {};
//   rowsWithId.forEach(item => {
//     origItemsMap[item.id] = {
//       code: item.code,
//       batch: item.batch,
//       qty: Number(item.qty) || 0,
//     };
//   });

//   // 🧠 This object is used in handleSaveAndPrint() to detect stock difference
//   setOriginalBillItems(origItemsMap);

//   // 6️⃣ (Optional UX improvement)
//   setTimeout(() => {
//     document.querySelector('input[name="customerName"]')?.focus();
//   }, 200);
// };






// // const handleEditBill = (bill) => {
// //   setBillEditMode(true);
// //   setEditingBillId(bill._id);
// //   setShowModal(true);

// //   setRows(bill.items.map(item => ({ ...item, id: generateUniqueId(), isNew: false })));

// //   setMeta({
// //     billNo: bill.billNo,
// //     date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
// //     counter: bill.counter || 1,
// //     customerName: bill.customerName,
// //     mobile: bill.mobile,
// //   });

// //   setTotals({
// //     total: bill.total,
// //     discount: bill.discount,
// //     netAmount: bill.netAmount,
// //     cashGiven: bill.cashGiven,
// //     balance: bill.balance,
// //     cgst: bill.cgst,
// //     sgst: bill.sgst,
// //   });
// // };


// useEffect(() => {
//   if (viewBill) {
//     setViewBill(prev => ({
//       ...prev,
//       customerName: meta.customerName,
//       mobile: meta.mobile,
//       netAmount: totals.netAmount,
//     }));
//   }
// }, [meta.customerName, meta.mobile, totals.netAmount]);


// useEffect(() => {
//   const fetchNextBillNo = async () => {
//     try {
//       const headers = getAuthHeaders(user);
//       // Use the unified endpoint with "next-bill-no"
//       const { data } = await axiosInstance.get("/api/sales/next-bill-no", { headers });
//       setMeta(prev => ({ ...prev, billNo: data.billNo }));
//     } catch (err) {
//       console.error("Failed to fetch next bill no:", err.response?.data || err.message);
//       setMeta(prev => ({ ...prev, billNo: "B001" }));
//     }
//   };

//   if (showModal && !billEditMode) fetchNextBillNo();
// }, [showModal, billEditMode]);

// useEffect(() => {
//   if (!showModal) {
//     setMeta(prev => ({ ...prev, billNo: "" }));
//   }
// }, [showModal]);


// const openAddModal = () => {
//   setBillEditMode(false); // ensure Add mode
//   setMeta(prev => ({
//     ...prev,
//     billNo: "",         // temporarily empty, will fetch next
//     customerName: "",
//     mobile: "",
//     counter: "",
//     date: new Date().toISOString().slice(0, 10),
//   }));
//   setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//   setRows([createEmptyRow()]);
//   setStockErrors({});
//   setErrorMsg("");
//   setShowModal(true);   // finally open modal
// };





// return (
//   <div className="salesbill-container">
//     {/* ✅ Popup Message */}
//     {popup.message && (
//       <div className={`popup-message ${popup.type}`}>{popup.message}</div>
//     )}

//     {/* Header */}
//     <div className="salesbill-header">
//       <div>
//         <h1 className="salesbill-title">Sales Bill</h1>
//       </div>
//       <button className="add-btn" onClick={openAddModal}>
//   <FaPlus /> Add Sales
// </button>

//     </div>

//     {/* Toolbar */}
   
  
// <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
//   {/* Left: Search Box */}
//   <div className="flex min-w-[200px]">
//     <input
//       type="text"
//       placeholder="Search bill no / customer name / mobile"
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
//   <div className="flex gap-2 flex-wrap">
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
//   </div>
// </div>


//     {/* Table List */}


//     {/* <div className="salesbill-table-wrapper">
//   {loading ? (
//     <p className="muted">Loading…</p>
//   ) : filteredBills.length === 0 ? (
//     <p className="muted">No records found</p>
//   ) : (
//     <table className="salesbill-table clean full-width">
//       <thead>
//         <tr>
//           <th>S.No</th>
//           <th>Date</th>
//           <th>Bill No</th>
//           <th>Customer</th>
//           <th>Net Amount</th>
//           <th>Action</th>
//         </tr>
//       </thead>
   
//       <tbody>
//   {filteredBills.map((bill, i) => (
//     <tr key={bill._id} className="fade-in">
//       <td>{i + 1}</td>
//       <td>{formatDate(bill.date)}</td>
//       <td>{bill.billNo}</td>
//       <td>{bill.customerName || bill.meta?.customerName || ""}</td>
//       <td>{Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}</td>
//       <td className="salesbill-actions">
//         <button
//           onClick={() => setViewBill(bill)}
//           className="action-btn view"
//         >
//           <FaEye title="View" />
//         </button>
//         <button
//           onClick={() => handleEditBill(bill)}
//           className="action-btn edit"
//         >
//           <FaEdit title="Edit" />
//         </button>
//       </td>
//     </tr>
//   ))}
// </tbody>

//     </table>
//   )}
// </div> */}

// <div className="salesbill-table-wrapper">
//       {loading ? (
//         <p className="muted">Loading…</p>
//       ) : bills.length === 0 ? (
//         <p className="muted">No records found</p>
//       ) : (
//         <>
//           <table className="salesbill-table w-full border-collapse border border-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-4 py-2">S.No</th>
//                 <th className="border px-4 py-2">Date</th>
//                 <th className="border px-4 py-2">Bill No</th>
//                 <th className="border px-4 py-2">Customer</th>
//                 <th className="border px-4 py-2">Net Amount</th>
//                 <th className="border px-4 py-2">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bills.map((bill, i) => (
//                 <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
//                   <td className="border px-4 py-2">{(page - 1) * limit + i + 1}</td>
//                   <td className="border px-4 py-2">{formatDate(bill.date)}</td>
//                   <td className="border px-4 py-2">{bill.billNo}</td>
//                   <td className="border px-4 py-2">{bill.customerName || bill.meta?.customerName || ""}</td>
//                   <td className="border px-4 py-2 text-right">
//                     {Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}
//                   </td>
//                   <td className="border px-4 py-2 text-center">
//                     <button
//                       onClick={() => setViewBill(bill)}
//                       className="px-2 text-[#00A76F] hover:text-[#007867]"
//                     >
//                       <FaEye  />
//                     </button>
//                     <button
//                       onClick={() => handleEditBill(bill)}
//                       className="px-2 text-[#00A76F] hover:text-[#007867]"
//                     >
//                       <FaEdit color="orange" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <Pagination page={page} totalPages={totalPages} onPageChange={fetchBills} />
//         </>
//       )}
//     </div>


//     {/* Add/Edit Modal */}
//     {showModal && (
//       <div className="modal fade-in">
//         <div className="modal-content slide-up large">
//           <div className="modal-header">
//             <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
//             <button className="icon-close" onClick={() => setShowModal(false)}>
//               ×
//             </button>
//           </div>

//           {/* Meta */}
//           <form className="bill-meta">
//             <div className="meta-grid">
//               {/* <label>
//                 Bill No <input value={meta.billNo} readOnly />
//               </label> */}

//               <label>
//   Bill No <input type="text" value={meta.billNo || ""} readOnly />
// </label>

//               <label>
//                 Date <input type="date" value={meta.date} readOnly />
//               </label>
//               <label>
//                 Counter
//                 <input
//                   type="number"
//                   value={meta.counter}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, counter: e.target.value })
//                   }
//                 />
//               </label>
//               <label style={{ flex: "2" }}>
//                 Customer Name
//                 <input
//                   value={meta.customerName}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, customerName: e.target.value })
//                   }
//                 />
//               </label>
//               <label>
//                 Mobile
//                 <input
//                   type="text"
//                   value={meta.mobile}
//                   maxLength={10}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) => {
//                     let value = e.target.value.replace(/\D/g, "");
//                     if (value.length > 10) value = value.slice(0, 10);
//                     setMeta({ ...meta, mobile: value });
//                   }}
//                   placeholder="Enter a Mobile number"
//                 />
//               </label>
//             </div>
//           </form>

        

//               {/* Items table */}
// <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
//       <thead>
//         <tr>
//           <th>S.No</th>
//           <th>Product Code</th>
//           <th>Product Name</th>
//           <th>Batch</th>
//           <th>MRP</th>
//           <th>Rate</th>
//           <th>GST%</th>
//           <th>Qty</th>
//           <th>Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {rows.map((row, idx) => (
//           <React.Fragment key={row.id}>
//             <tr>
//               <td>{idx + 1}</td>

//               {/* Product Code */}
//               <td className="relative">
//                 <input
//                   value={row.code}
//                   placeholder="Type or scan code"
//                   disabled={!row.isNew && editRowId !== row.id}
//                   onChange={(e) => {
//                     const v = e.target.value;
//                     updateRow(row.id, "code", v);
//                     if (!v.trim()) updateRow(row.id, "name", "");
//                     if (v.length >= 1) suggestCodesDebounced(row.id, v);
//                     setShowCodeList(prev => ({ ...prev, [row.id]: v.length >= 1 }));
//                   }}
//                   onFocus={() => row.code && setShowCodeList(prev => ({ ...prev, [row.id]: true }))}
//                   onBlur={() => setTimeout(() => setShowCodeList(prev => ({ ...prev, [row.id]: false })), 150)}
//                 />
//                 {showCodeList[row.id] && (codeSuggestions[row.id] || []).length > 0 && (
//                   <div className="suggestions">
//                     {codeSuggestions[row.id].map(p => (
//                       <div key={p._id || p.code} className="suggestion"
//                         onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(row.id, p); }}>
//                         <div style={{ fontWeight: 600 }}>{p.code}</div>
//                         <div style={{ fontSize: 12 }}>{p.name}</div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </td>

//               {/* Product Name */}
//               <td className="relative">
//                 <input
//                   value={row.name}
//                   placeholder="Type or select product"
//                   disabled={!row.isNew && editRowId !== row.id}
//                   onChange={(e) => {
//                     const v = e.target.value;
//                     updateRow(row.id, "name", v);
//                     if (!v.trim()) updateRow(row.id, "code", "");
//                     if (v.length >= 1) suggestNamesDebounced(row.id, v);
//                     setShowNameList(prev => ({ ...prev, [row.id]: v.length >= 1 }));
//                   }}
//                   onFocus={() => row.name && setShowNameList(prev => ({ ...prev, [row.id]: true }))}
//                   onBlur={() => setTimeout(() => setShowNameList(prev => ({ ...prev, [row.id]: false })), 150)}
//                 />
//                 {showNameList[row.id] && (nameSuggestions[row.id] || []).length > 0 && (
//                   <div className="suggestions">
//                     {nameSuggestions[row.id].map(p => (
//                       <div key={p._id || p.name} className="suggestion"
//                         onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(row.id, p); }}>
//                         <div style={{ fontWeight: 600 }}>{p.name}</div>
//                         <div style={{ fontSize: 12 }}>{p.code}</div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </td>

//               {/* Batch */}
//               <td className="relative">
//                 <input
//                   value={row.batch}
//                   placeholder="Enter or select batch"
//                   disabled={!row.isNew && editRowId !== row.id}
//                   onChange={e => updateRow(row.id, "batch", e.target.value)}
//                   onFocus={() => {
//                     const batches = row.name ? getBatchesForName(row.name) : row.code ? getBatchesForCode(row.code) : [];
//                     setBatchesByRow(prev => ({ ...prev, [row.id]: batches }));
//                     setShowBatchList(prev => ({ ...prev, [row.id]: batches.length > 0 }));
//                   }}
//                   onBlur={() => setTimeout(() => setShowBatchList(prev => ({ ...prev, [row.id]: false })), 150)}
//                 />
//                 {showBatchList[row.id] && Array.isArray(batchesByRow[row.id]) && (
//                   <div className="batch-suggestions" style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #eee", background: "#fff", zIndex: 50, width: 400 }}>
//                     <table style={{ width: "100%" }}>
//                       <thead><tr><th>Batch</th><th>MRP</th><th>Rate</th><th>GST%</th><th>Stock</th></tr></thead>
//                       <tbody>
//                         {batchesByRow[row.id].map(b => (
//                           <tr key={b.batchNo} onMouseDown={e => { e.preventDefault(); handleBatchPick(row.id, b); }}>
//                             <td>{b.batchNo}</td>
//                             <td>{b.mrp}</td>
//                             <td>{b.salePrice || b.rate}</td>
//                             <td>{b.gst || 0}%</td>
//                             <td>{getAvailableStock(b.code, b.batchNo)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </td>

//               {/* MRP, Rate, GST, Qty */}
//               {["mrp", "rate", "gst", "qty"].map(field => (
//                 <td key={field}>
//                   <input
//                     type="number"
//                     value={field === "qty" ? row.qty || "" : row[field] || 0}
//                     disabled={!row.isNew && editRowId !== row.id}
//                     onChange={(e) => {
//                       const val = e.target.value;
//                       if (field === "qty") {
//                         const newQty = val === "" ? 0 : Number(val);
//                         updateRow(row.id, "qty", newQty);

//                         const originalQty = originalBillItems[row.id]?.qty || 0;
//                         const stockAvailable = row.batch ? getAvailableStock(row.code, row.batch) + originalQty : null;
//                         if (stockAvailable !== null && newQty > stockAvailable) {
//                           setStockErrors(prev => ({ ...prev, [row.id]: `Out of stock: requested ${newQty}, only ${stockAvailable} available` }));
//                         } else {
//                           setStockErrors(prev => { const copy = { ...prev }; delete copy[row.id]; return copy; });
//                         }
//                       } else {
//                         updateRow(row.id, field, val === "" ? 0 : Number(val));
//                       }
//                     }}
//                   />
//                 </td>
//               ))}

//               {/* Actions */}
//               <td>
//                 {row.isNew ? (
//                   <button onClick={() => addRow(row.id)}><FaPlus /></button>
//                 ) : editRowId === row.id ? (
//                   <>
//                     <button onClick={() => setEditRowId(null)}><FaCheck /></button>
//                     <button onClick={() => setEditRowId(null)}><FaTimes /></button>
//                   </>
//                 ) : (
//                   <>
//                     <button onClick={() => { setEditRowId(row.id); setOriginalBillItems(prev => ({ ...prev, [row.id]: { ...row } })); }}><FaEdit /></button>
//                     <button onClick={() => deleteRow(row.id)}><FaTrash /></button>
//                   </>
//                 )}
//               </td>

//             </tr>

//             {stockErrors[row.id] && (
//               <tr>
//                 <td colSpan="9" style={{ color: "red", fontSize: 13 }}>❌ {stockErrors[row.id]}</td>
//               </tr>
//             )}
//           </React.Fragment>
//         ))}
//       </tbody>
//     </table>



//               {Object.keys(stockErrors).length > 0 && <div style={{ color: "red", marginTop: 10 }}>{Object.values(stockErrors).map((msg, i) => <div key={i}>❌ {msg}</div>)}</div>}
//               {errorMsg && <p className="error">{errorMsg}</p>}


// {/* Global Stock Errors */}
// {/* {Object.keys(stockErrors).length > 0 && (
//   <div style={{ color: "red", marginTop: 10 }}>
//     {Object.values(stockErrors).map((msg, i) => (
//       <div key={i}>❌ {msg}</div>
//     ))}
//   </div>
// )}

// {errorMsg && <p className="error">{errorMsg}</p>} */}

// {/* Totals */}
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
//   {/* Left column */}
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
//           onWheel={(e) => e.target.blur()} // disable mouse scroll change
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

//   {/* Right column - Bill Summary */}
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
//       {/* <strong>{totals.cgst.toFixed(2)}</strong> */}
//       <strong>{Number(totals.cgst || 0).toFixed(2)}</strong>
//     </div>
//     <div className="summary-line" style={{ display: "flex", justifyContent: "space-between" }}>
//       <span>SGST</span>
//       {/* <strong>{totals.sgst.toFixed(2)}</strong> */}
//       <strong>{Number(totals.sgst || 0).toFixed(2)}</strong>
//     </div>
//     <hr style={{ border: "0.5px solid #ddd" }} />
//     <div className="summary-total" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
//       <span>Bill Amount</span>
//       {/* <strong>{totals.netAmount.toFixed(2)}</strong> */}
//       <strong>{Number(totals.netAmount || 0).toFixed(2)}</strong>

//     </div>
//   </div>

//   {/* Animation */}
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


// {/* Totals */}




//           <div className="modal-actions">
//             <button className="primary" onClick={handleSaveAndPrint}>
//               Print
//             </button>
//           </div>
//         </div>
//       </div>
//     )}


//     {/* View Bill Modal */}
// {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>
//           <FaTimes />
//         </button>
//       </div>
//       <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//       <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//       {/* <p><strong>Customer:</strong> {viewBill.meta.customerName} ({viewBill.meta.mobile})</p>
//       <p><strong>Net Amount:</strong> {viewBill.totals.netAmount}</p> */}
//       <p>
//   <strong>Customer:</strong> {viewBill.customerName || viewBill.meta?.customerName || ""} 
//   ({viewBill.mobile || viewBill.meta?.mobile || ""})
// </p>
// <p>
//   <strong>Net Amount:</strong> {viewBill.netAmount || viewBill.totals?.netAmount || 0}
// </p>

//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}





//   </div>
// );




// }


// {/* Styles to prevent horizontal scrollbar */}
// <style jsx>{`
//   .salesbill-table {
//     width: 100%;
//     border-collapse: collapse;
//     table-layout: fixed; /* Prevent horizontal scroll */
//   }
//   .salesbill-table input {
//     box-sizing: border-box;
//   }
// `}</style>








// i need add items table product code input box working similarly product name format. batch - sugguestion without hozitontal bar show all data. oty add manually. all input box while type 0 hide only show type number. and when qty manually add then add button click decrease products home page table action view button click product details qty reduce. otherwise not add dont need decrease qty from products table. stock when 0 qty stock outof stock show eg. stock qty 10. user type 20 - left 10 products. lets connect product api from Products.jsx file i need updated full code SalesBill.jsx file code. dont miss a line


// // src/pages/SalesBill.jsx
// import React from "react";
// import { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../styles/salesbill.css";
// import { useAuth } from "../context/AuthContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
// // const axiosInstance = axios.create({
// //   baseURL: API,
// //   headers: {
// //     'x-shopname': localStorage.getItem("shopname") || "default-shop", 
// //     'Content-Type': 'application/json',
// //   },
// // });

// const axiosInstance = axios.create({
//   baseURL: API,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); 
//   const shopname = localStorage.getItem("shopname"); 
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   if (shopname) {
//     config.headers["x-shopname"] = shopname;
//   }
//   return config;
// });


// export default function SalesBill() {
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { token, shopname } = useAuth(); 

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [viewBill, setViewBill] = useState(null);

//   // Popup message state
//   const [popup, setPopup] = useState({ message: "", type: "" });

//   // Meta data
//   const [meta, setMeta] = useState({
//     billNo: "",
//     date: "",
//     counter: 1,
//     customerName: "",
//     mobile: "",
//   });

//   // Products cache (from backend). Each entry is a batch record (flat).
//   const [products, setProducts] = useState([]);

//   // ==== Autocomplete/suggestions state (per row) ====
//   // Product suggestions per row { [rowId]: Array<ProductBatchRecords> }
//   const [nameSuggestions, setNameSuggestions] = useState({});
//   // Code suggestions per row { [rowId]: Array<ProductBatchRecords> }
//   const [codeSuggestions, setCodeSuggestions] = useState({});
//   // Available batches per row { [rowId]: Array<{batchNo, mrp, rate, gst, qty, name, code}> }
//   const [batchesByRow, setBatchesByRow] = useState({});
//   // Batch dropdown visibility per row { [rowId]: boolean }
//   const [showBatchList, setShowBatchList] = useState({});
//   // Name dropdown visibility per row { [rowId]: boolean }
//   const [showNameList, setShowNameList] = useState({});
//   // Code dropdown visibility per row { [rowId]: boolean }
//   const [showCodeList, setShowCodeList] = useState({});
// // Per-row stock error messages: { [rowId]: "error message" }
//   const [stockErrors, setStockErrors] = useState({});

//   // Debounce registry
//   const debounceRef = useRef({});

//   // ==== Rows ====
//   const [rows, setRows] = useState([
//     {
//       id: Date.now(),
//       code: "",
//       name: "",
//       batch: "",
//       mrp: 0,
//       rate: 0,
//       qty: 0,
//       gst: 0,
//       amount: 0,
//       value: 0,
//       isNew: true,
//     },
//   ]);
//   const [editRowId, setEditRowId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");

//   // Totals
//   const [totals, setTotals] = useState({
//     total: 0,
//     discount: 0,
//     netAmount: 0,
//     cashGiven: 0,
//     balance: 0,
//     cgst: 0,
//     sgst: 0,
//   });

//   const [billEditMode, setBillEditMode] = useState(false);
//   const [editingBillId, setEditingBillId] = useState(null);

//   // Reserved stock for this bill (not yet persisted), keyed by code|batch
//   const [reservedStock, setReservedStock] = useState({});

//   // ---- Helpers ----
//   const debounce = useCallback((key, fn, delay = 250) => {
//     return (...args) => {
//       clearTimeout(debounceRef.current[key]);
//       debounceRef.current[key] = setTimeout(() => fn(...args), delay);
//     };
//   }, []);

//   const fetchBills = async () => {
//     try {
//       // const { data } = await axios.get(`${API}/api/sales`);
//           // const { data } = await axios.get(`${API}/api/sales`, { headers: { "x-shopname": shopname } });
//           const { data } = await axiosInstance.get("/api/sales");

//       setBills(data);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProducts = async () => {
//   if (!token || !shopname) {
//     console.error("Token or shopname not available");
//     return;
//   }

//   try {
//     // const { data } = await axios.get(`${API}/api/products`, {
//     //   headers: {
//     //     Authorization: `Bearer ${token}`,
//     //     "x-shopname": shopname,
//     //   },
//     // });
//        const { data } = await axiosInstance.get("/api/products");

//     // Normalize for safety: ensure fields exist
//     const normalized = (data || []).map((p) => ({
//       ...p,
//       code: p.code || "",
//       name: p.name || "",
//       batchNo: p.batchNo || "",
//       mrp: Number(p.mrp || p.price || 0),
//       salePrice: Number(p.salePrice || p.price || 0),
//       taxPercent: Number(p.taxPercent || 0),
//       qty: Number(p.qty || 0),
//       minQty: Number(p.minQty || 0),
//       _id: p._id || p.id || null,
//     }));

//     setProducts(normalized);
//   } catch (e) {
//     console.error("Error fetching products", e);
//   }
// };
//   useEffect(() => {
//   if (token && shopname) {
//     fetchProducts();
//     fetchBillNo();
//     fetchBills();
//   }
// }, [token, shopname]); 

//   // Format date as dd-mm-yyyy
//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     const day = String(d.getDate()).padStart(2, "0");
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Fetch new bill number
//   // const fetchBillNo = async () => {
//   //   try {
//   //     // const { data } = await axios.get(`${API}/api/sales/next-billno`);
//   //         const { data } = await axios.get(`${API}/api/sales/next-billno`, {
//   //     headers: {
//   //       Authorization: `Bearer ${token}`,
//   //       "x-shopname": shopname,
//   //     }, // <-- pass tenant
//   //   });
//   //     const now = new Date();
//   //     const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
//   //     setMeta((m) => ({
//   //       ...m,
//   //       billNo: data.nextBillNo,
//   //       date: istDate.toISOString().split("T")[0],
//   //     }));
//   //   } catch (error) {
//   //     console.error("Failed to fetch bill number", error);
//   //   }
//   // };

// //   const fetchBillNo = async () => {
// //   if (!token || !shopname) {
// //     console.error("Token or shopname not available");
// //     return;
// //   }

// //   try {
// //     const { data } = await axios.get(`${API}/api/sales/next-billno`, {
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "x-shopname": shopname, // must match backend tenant middleware
// //       },
// //     });

// //     const now = new Date();
// //     const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // IST

// //     setMeta((m) => ({
// //       ...m,
// //       billNo: data.nextBillNo,
// //       date: istDate.toISOString().split("T")[0],
// //     }));
// //   } catch (error) {
// //     console.error("Failed to fetch bill number", error);
// //   }
// // };


// const fetchBillNo = async () => {
//   if (!token || !shopname) {
//     console.error("Token or shopname not available");
//     return;
//   }

//   try {
//     // const { data } = await axios.get(`${API}/api/sales/next-billno`, {
//     //   headers: {
//     //     Authorization: `Bearer ${token}`,
//     //     "x-shopname": shopname, 
//     //   },
//     // });

//      const { data } = await axiosInstance.get("/api/sales/next-billno");
//     const now = new Date();
//     const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // IST

//     setMeta((m) => ({
//       ...m,
//       billNo: data.nextBillNo,
//       date: istDate.toISOString().split("T")[0],
//     }));
//   } catch (error) {
//     console.error("Failed to fetch bill number", error);
//   }
// };


//   useEffect(() => {
//     if (showModal && !billEditMode) {
//       fetchBillNo();
//     }
//   }, [showModal, billEditMode]);

  

//   // Filters
//   const today = new Date().toISOString().split("T")[0];
//   const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//     .toISOString()
//     .split("T")[0];
//   const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//     .toISOString()
//     .split("T")[0];

//   const filteredBills = useMemo(() => {
//     return bills.filter((bill) => {
//       const billDate = new Date(bill.date);
//       const s = search.trim().toLowerCase();
//       const matchesSearch =
//         !s ||
//         bill.billNo?.toLowerCase().includes(s) ||
//         bill.customerName?.toLowerCase().includes(s) ||
//         bill.mobile?.toLowerCase().includes(s);

//       if (!matchesSearch) return false;
//       if (filter === "today") return bill.date?.slice(0, 10) === today;
//       if (filter === "this-week") {
//         const d = bill.date?.slice(0, 10);
//         return d >= weekAgo && d <= today;
//       }
//       if (filter === "this-month") {
//         const d = bill.date?.slice(0, 10);
//         return d >= monthAgo && d <= today;
//       }
//       if (filter === "custom" && fromDate && toDate) {
//         return billDate >= new Date(fromDate) && billDate <= new Date(toDate);
//       }
//       return true;
//     });
//   }, [bills, search, filter, fromDate, toDate, today, weekAgo, monthAgo]);

//   // Row calculations (amount/value kept for totals; not shown in grid)
//   const recalcRow = (r) => {
//     const rate = parseFloat(r.rate) || 0;
//     const qty = parseFloat(r.qty) || 0;
//     const gst = parseFloat(r.gst) || 0;
//     const amount = +(rate * qty).toFixed(2);
//     const value = +(amount + (amount * gst) / 100).toFixed(2);
//     return { ...r, amount, value };
//   };

//   // Build batches for a given product code or name from flat products list
//   const getBatchesForCode = useCallback(
//     (code) => {
//       const matches = products.filter(
//         (p) => (p.code || "").toLowerCase() === (code || "").toLowerCase()
//       );
//       // Unique by batchNo+rate+mrp to avoid dupes from backend
//       const uniq = [];
//       const seen = new Set();
//       for (const m of matches) {
//         const key = `${m.batchNo}|${m.salePrice}|${m.mrp}`;
//         if (!seen.has(key)) {
//           uniq.push({
//             _id: m._id || null,
//             batchNo: m.batchNo || "",
//             mrp: Number(m.mrp || 0),
//             rate: Number(m.salePrice || 0),
//             gst: Number(m.taxPercent || 0),
//             qty: Number(m.qty || 0),
//             name: m.name || "",
//             code: m.code || "",
//           });
//           seen.add(key);
//         }
//       }
//       return uniq;
//     },
//     [products]
//   );

//   const getBatchesForName = useCallback(
//     (name) => {
//       const matches = products.filter(
//         (p) => (p.name || "").toLowerCase() === (name || "").toLowerCase()
//       );
//       const uniq = [];
//       const seen = new Set();
//       for (const m of matches) {
//         const key = `${m.batchNo}|${m.salePrice}|${m.mrp}`;
//         if (!seen.has(key)) {
//           uniq.push({
//             _id: m._id || null,
//             batchNo: m.batchNo || "",
//             mrp: Number(m.mrp || 0),
//             rate: Number(m.salePrice || 0),
//             gst: Number(m.taxPercent || 0),
//             qty: Number(m.qty || 0),
//             name: m.name || "",
//             code: m.code || "",
//           });
//           seen.add(key);
//         }
//       }
//       return uniq;
//     },
//     [products]
//   );

//   // Real-time available stock = backend stock - reserved in this bill
//   const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

//   const getInitialStock = (code, batch) => {
//     // Sum qty from product records that match code+batch
//     return products
//       .filter(
//         (p) =>
//           (p.code || "").toLowerCase() === (code || "").toLowerCase() &&
//           (p.batchNo || "").toLowerCase() === (batch || "").toLowerCase()
//       )
//       .reduce((sum, p) => sum + Number(p.qty || 0), 0);
//   };

//   const getAvailableStock = (code, batch) => {
//     const base = getInitialStock(code, batch);
//     const reserved = Number(reservedStock[keyFor(code, batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   // Debounced name suggestions (searchable dropdown)
//   const suggestNamesDebounced = useMemo(
//     () =>
//       debounce("name-suggest", (rowId, query) => {
//         if (!query) {
//           setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//           return;
//         }
//         const q = query.toLowerCase();
//         // Return unique by code+name (one per product, not per batch)
//         const map = new Map();
//         for (const p of products) {
//           const nm = (p.name || "").toLowerCase();
//           if (nm.includes(q)) {
//             const k = `${p.code}-${p.name}`.toLowerCase();
//             if (!map.has(k)) map.set(k, p);
//           }
//         }
//         const results = Array.from(map.values()).slice(0, 50);
//         setNameSuggestions((s) => ({ ...s, [rowId]: results }));
//       }, 250),
//     [debounce, products]
//   );

//   // Debounced code suggestions (searchable dropdown)
//   const suggestCodesDebounced = useMemo(
//     () =>
//       debounce("code-suggest", (rowId, query) => {
//         if (!query) {
//           setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//           return;
//         }
//         const q = query.toLowerCase();
//         // Return unique by code+name (one per product, not per batch)
//         const map = new Map();
//         for (const p of products) {
//           const codeLower = (p.code || "").toLowerCase();
//           if (codeLower.includes(q)) {
//             const k = `${p.code}-${p.name}`.toLowerCase();
//             if (!map.has(k)) map.set(k, p);
//           }
//         }
//         const results = Array.from(map.values()).slice(0, 50);
//         setCodeSuggestions((s) => ({ ...s, [rowId]: results }));
//       }, 250),
//     [debounce, products]
//   );

//   // Debounced code resolver (kept in case code is entered/scanned)
//   const resolveCodeDebounced = useMemo(
//     () =>
//       debounce("code-resolve", (rowId, code) => {
//         setRows((prev) =>
//           prev.map((r) => {
//             if (r.id !== rowId) return r;
//             const batches = getBatchesForCode(code);
//             let updated = { ...r, code };

//             if (batches.length === 0) {
//               // clear autofill if no matches
//               updated = {
//                 ...updated,
//                 name: "",
//                 batch: "",
//                 mrp: 0,
//                 rate: 0,
//                 gst: 0,
//               };
//               setBatchesByRow((b) => ({ ...b, [rowId]: [] }));
//               setShowBatchList((v) => ({ ...v, [rowId]: false }));
//               return recalcRow(updated);
//             }

//             const chosen = batches[0];
//             updated = {
//               ...updated,
//               name: chosen.name,
//               batch: chosen.batchNo || "",
//               mrp: chosen.mrp || 0,
//               rate: chosen.rate || 0,
//               gst: chosen.gst || 0,
//             };

//             setBatchesByRow((b) => ({ ...b, [rowId]: batches }));
//             setShowBatchList((v) => ({ ...v, [rowId]: true }));

//             return recalcRow(updated);
//           })
//         );
//       }, 250),
//     [debounce, getBatchesForCode]
//   );

//   // Unified row updater + autofill + stock validation for qty
//   const updateRow = (id, field, value) => {
//     // Special handling: if user types "0" we show empty string - interpret as 0 only on blur
//     if (["mrp", "rate", "qty", "gst"].includes(field) && value === "") {
//       value = 0;
//     }

//     // if user typed "0" and we want to hide it while typing, set empty string in UI state
//     if (field === "qty" && String(value) === "0") {
//       // keep internal value 0 but visually display empty — we handle this in input's value prop
//       value = 0;
//     }

//     // Immediate set (with recalculation)
//     setRows((prev) =>
//       prev.map((r) => (r.id === id ? recalcRow({ ...r, [field]: value }) : r))
//     );

//     // Debounced resolvers
//     if (field === "code") {
//       resolveCodeDebounced(id, value);
//       // also suggest codes while typing
//       suggestCodesDebounced(id, value);
//       setShowCodeList((v) => ({ ...v, [id]: !!value }));
//     }
//     if (field === "name") {
//       suggestNamesDebounced(id, value);
//       // show name list while typing
//       setShowNameList((v) => ({ ...v, [id]: !!value }));
//     }

//     // Quantity stock validation (cap / out of stock)
//     if (field === "qty") {
//       setRows((prev) =>
//         prev.map((r) => {
//           if (r.id !== id) return r;
//           const code = r.code;
//           const batch = r.batch;
//           if (!code || !batch) {
//             // Keep typed qty but we can't validate without selection
//             return recalcRow({ ...r, qty: Number(value || 0) });
//           }

//           const requested = Number(value || 0);
//           const available = getAvailableStock(code, batch);

//           if (available <= 0 && requested > 0) {
//             // Out of stock
//             showWarn("Out of Stock");
//             return recalcRow({ ...r, qty: 0 });
//           }

//           if (requested > available) {
//             showWarn(`Only ${available} left`);
//             return recalcRow({ ...r, qty: available });
//           }

//           return recalcRow({ ...r, qty: requested });
//         })
//       );
//     }
//   };

//   const showWarn = (message) => {
//     setPopup({ message: `⚠️ ${message}`, type: "error" });
//     setTimeout(() => setPopup({ message: "", type: "" }), 2200);
//   };

//   // Selecting a product suggestion → fill code/name + batches; open batch list
//   const handleSelectSuggestion = (rowId, product) => {
//     const batches = getBatchesForCode(product.code);
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.id !== rowId) return r;
//         const chosen = batches[0] || {};
//         const updated = {
//           ...r,
//           code: product.code || "",
//           name: product.name || "",
//           batch: chosen.batchNo || "",
//           mrp: Number(chosen.mrp || product.mrp || 0),
//           rate: Number(chosen.rate || product.salePrice || 0),
//           gst: Number(chosen.gst || product.taxPercent || 0),
//         };
//         return recalcRow(updated);
//       })
//     );
//     setBatchesByRow((b) => ({ ...b, [rowId]: batches }));
//     setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//     setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//     setShowNameList((v) => ({ ...v, [rowId]: false }));
//     setShowCodeList((v) => ({ ...v, [rowId]: false }));
//     setShowBatchList((v) => ({ ...v, [rowId]: true }));
//   };

//   // Batch list visibility toggles
//   const openBatchList = (rowId) =>
//     setShowBatchList((v) => ({ ...v, [rowId]: true }));
//   const closeBatchList = (rowId) =>
//     setShowBatchList((v) => ({ ...v, [rowId]: false }));

//   // When user selects a batch → apply price/rate/gst; keep qty valid
//   const handleBatchPick = (rowId, batchObj) => {
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.id !== rowId) return r;
//         let updated = {
//           ...r,
//           batch: batchObj.batchNo || "",
//           mrp: Number(batchObj.mrp || 0),
//           rate: Number(batchObj.rate || 0),
//           gst: Number(batchObj.gst || 0),
//         };
//         // validate current qty against available
//         const available = getAvailableStock(updated.code, updated.batch);
//         if (available <= 0) {
//           showWarn("Out of Stock");
//           updated.qty = 0;
//         } else if (Number(updated.qty || 0) > available) {
//           showWarn(`Only ${available} left`);
//           updated.qty = available;
//         }
//         return recalcRow(updated);
//       })
//     );
//     closeBatchList(rowId);
//   };

//   // Add row: validate required + reserve stock
//   const addRow = (id) => {
//     const row = rows.find((r) => r.id === id);
//     if (!row.code || !row.name || !row.batch || !row.rate || !row.qty) {
//       setErrorMsg("⚠️ Please fill required fields before adding.");
//       return;
//     }
//     // Final stock check
//     const available = getAvailableStock(row.code, row.batch);
//     if (available <= 0) {
//       showWarn("Out of Stock");
//       return;
//     }
//     if (row.qty > available) {
//       showWarn(`Only ${available} left`);
//       setRows((prev) =>
//         prev.map((r) =>
//           r.id === id ? recalcRow({ ...r, qty: available }) : r
//         )
//       );
//       return;
//     }

//     setErrorMsg("");

//     // Reserve stock locally
//     const k = keyFor(row.code, row.batch);
//     setReservedStock((rs) => ({
//       ...rs,
//       [k]: Number(rs[k] || 0) + Number(row.qty || 0),
//     }));

//     // Lock the row and add a fresh one
//     setRows((prev) =>
//       prev
//         .map((r) => (r.id === id ? { ...r, isNew: false } : r))
//         .concat({
//           id: Date.now(),
//           code: "",
//           name: "",
//           batch: "",
//           mrp: 0,
//           rate: 0,
//           qty: 0,
//           gst: 0,
//           amount: 0,
//           value: 0,
//           isNew: true,
//         })
//     );
//   };

//   // If a locked row is deleted, release reserved stock
//   const deleteRow = (id) => {
//     const row = rows.find((r) => r.id === id);
//     if (row && !row.isNew) {
//       const k = keyFor(row.code, row.batch);
//       setReservedStock((rs) => ({
//         ...rs,
//         [k]: Math.max(0, Number(rs[k] || 0) - Number(row.qty || 0)),
//       }));
//     }
//     setRows((prev) => prev.filter((r) => r.id !== id));
//     setNameSuggestions((s) => {
//       const { [id]: _omit, ...rest } = s;
//       return rest;
//     });
//     setCodeSuggestions((s) => {
//       const { [id]: _omit, ...rest } = s;
//       return rest;
//     });
//     setBatchesByRow((b) => {
//       const { [id]: _omit2, ...rest } = b;
//       return rest;
//     });
//     setShowBatchList((v) => {
//       const { [id]: _o3, ...rest } = v;
//       return rest;
//     });
//     setShowNameList((v) => {
//       const { [id]: _o4, ...rest } = v;
//       return rest;
//     });
//     setShowCodeList((v) => {
//       const { [id]: _o5, ...rest } = v;
//       return rest;
//     });
//   };

//   const saveRowEdit = (id) => {
//     // Adjust reserved stock if qty changed during edit
//     const row = rows.find((r) => r.id === id);
//     if (row && !row.isNew) {
//       const k = keyFor(row.code, row.batch);
//       // Recalculate reservation based on all locked rows
//       const newReserved = {};
//       rows.forEach((rw) => {
//         if (!rw.isNew) {
//           const kk = keyFor(rw.code, rw.batch);
//           newReserved[kk] = Number(newReserved[kk] || 0) + Number(rw.qty || 0);
//         }
//       });
//       setReservedStock(newReserved);
//     }
//     setEditRowId(null);
//   };

//   const cancelRowEdit = () => {
//     setEditRowId(null);
//   };

//   // Totals
//   useEffect(() => {
//     const total = rows
//       .filter((r) => !r.isNew)
//       .reduce((sum, r) => sum + (r.amount || 0), 0);

//     const gstTotal = rows
//       .filter((r) => !r.isNew)
//       .reduce((sum, r) => sum + (r.amount * (r.gst || 0)) / 100, 0);

//     const discount = parseFloat(totals.discount) || 0;
//     const netAmount = +(total + gstTotal - discount).toFixed(2);
//     const cashGiven = parseFloat(totals.cashGiven) || 0;

//     let balance = 0;
//     if (cashGiven > 0) {
//       if (cashGiven >= netAmount) {
//         balance = +(cashGiven - netAmount).toFixed(2);
//       } else {
//         balance = +(netAmount - cashGiven).toFixed(2);
//       }
//     }

//     const cgst = +(gstTotal / 2).toFixed(2);
//     const sgst = +(gstTotal / 2).toFixed(2);

//     setTotals((t) => ({
//       ...t,
//       total,
//       discount,
//       netAmount,
//       balance,
//       cgst,
//       sgst,
//     }));
//   }, [rows, totals.discount, totals.cashGiven]);




// // Save & Print


// const handleSaveAndPrint = async () => {
//   // ===== Validation =====
//   if (!meta.customerName.trim()) return showPopup("Customer Name is required");
//   if (!meta.mobile.trim()) return showPopup("Mobile number is required");
//   if (meta.mobile.trim().length !== 10) return showPopup("Mobile number must be 10 digits");
//   if (rows.filter((r) => !r.isNew).length === 0) return showPopup("Add at least one product");

//   try {
//     const payload = {
//       ...meta,
//       counter: Number(meta.counter) || 1,
//       items: rows.filter((r) => !r.isNew),
//       ...totals,
//       status:"confirmed"    };

//     let savedBill;

//     // ===== Save or Edit Bill =====
//     if (billEditMode && editingBillId) {
//       // const { data } = await axios.put(`${API}/api/sales/${editingBillId}`, payload, {
//       //   headers: { "Content-Type": "application/json", "x-shopname": shopname },
//       // });

//         const { data } = await axiosInstance.put(`/api/sales/${editingBillId}`, payload);

//       setBills((prev) => prev.map((b) => (b._id === editingBillId ? data : b)));
//       savedBill = data;
//     } else {
//       // const { data } = await axios.post(`${API}/api/sales`, payload, {
//       //   headers: { "Content-Type": "application/json", "x-shopname": shopname },
//       // });
//         const { data } = await axiosInstance.get("/api/sales", payload);
//       setBills((prev) => [data, ...prev]);
//       savedBill = data;
//     }

//     // ===== Decrement Stock =====
//     const itemsToReduce = rows.filter((r) => !r.isNew);
//     const reduceMap = {};

//     for (const it of itemsToReduce) {
//       const k = keyFor(it.code, it.batch);
//       if (!reduceMap[k]) reduceMap[k] = { code: it.code, batchNo: it.batch, qty: 0 };
//       reduceMap[k].qty += Number(it.qty || 0);
//     }

//     const reduceArray = Object.values(reduceMap);
//     if (reduceArray.length) {
//       try {
//         // await axios.put(`${API}/api/products/decrement-stock`, { items: reduceArray }, {
//         //   headers: { "x-shopname": shopname },
//         // });
//         await axiosInstance.put("/api/products/decrement-stock", { items: reduceArray });

//         // Trigger global refresh
//         window.dispatchEvent(new CustomEvent("products:refresh", { detail: { items: reduceArray } }));
//       } catch (err) {
//         console.error("❌ Failed to decrement stock on backend", err);
//       }
//     }

//     // ===== Reset Form & UI =====
//     showPopup("✅ Saved successfully", "success");
//     resetBillForm();
//     fetchBillNo();

//     setTimeout(() => window.print(), 400);
//   } catch (e) {
//     console.error(e);
//     showPopup("❌ Failed to save bill", "error");
//   }
// };

// // ===== Helper: Popup =====
// const showPopup = (message, type = "error") => {
//   setPopup({ message, type });
//   setTimeout(() => setPopup({ message: "", type: "" }), 2500);
// };

// // ===== Helper: Reset Form =====
// const resetBillForm = () => {
//   setMeta(prev => ({ ...prev, customerName: "", mobile: "" }));
//   setBillEditMode(false);
//   setEditingBillId(null);
//   setRows([{
//     id: Date.now(),
//     code: "",
//     name: "",
//     batch: "",
//     mrp: 0,
//     rate: 0,
//     qty: 0,
//     gst: 0,
//     amount: 0,
//     value: 0,
//     isNew: true,
//   }]);
//   setTotals({
//     total: 0,
//     discount: 0,
//     netAmount: 0,
//     cashGiven: 0,
//     balance: 0,
//     cgst: 0,
//     sgst: 0,
//   });
//   setReservedStock({});
// };



//   // Edit bill
//   const handleEditBill = (bill) => {
//     setMeta({
//       billNo: bill.billNo,
//       date: bill.date?.slice(0, 10),
//       counter: bill.counter,
//       customerName: bill.customerName,
//       mobile: bill.mobile,
//     });
//     if (bill.items && bill.items.length > 0) {
//       setRows(
//         bill.items.map((it) => ({
//           ...it,
//           id: Date.now() + Math.random(),
//           isNew: false,
//         }))
//       );
//       setRows((prev) => [
//         ...prev,
//         {
//           id: Date.now(),
//           code: "",
//           name: "",
//           batch: "",
//           mrp: 0,
//           rate: 0,
//           qty: 0,
//           gst: 0,
//           amount: 0,
//           value: 0,
//           isNew: true,
//         },
//       ]);
//       // rebuild reserved from items
//       const newReserved = {};
//       bill.items.forEach((it) => {
//         const k = keyFor(it.code, it.batch);
//         newReserved[k] = Number(newReserved[k] || 0) + Number(it.qty || 0);
//       });
//       setReservedStock(newReserved);
//     }
//     setTotals({
//       total: bill.total,
//       discount: bill.discount,
//       netAmount: bill.netAmount,
//       cashGiven: bill.cashGiven,
//       balance: bill.balance,
//       cgst: bill.cgst || 0,
//       sgst: bill.sgst || 0,
//     });
//     setEditingBillId(bill._id);
//     setBillEditMode(true);
//     setShowModal(true);
//   };

//   --- Handle Enter key navigation ---


//   const handleEnterKey = (e) => {
//   if (e.key === "Enter") {
//     e.preventDefault();

//     const form = e.target.form;
//     if (!form) return;

//     const elements = Array.from(form.elements).filter(
//       (el) => el.tagName === "INPUT" && el.type !== "hidden"
//     );

//     const index = elements.indexOf(e.target);

//     // 👉 Move to next input
//     if (elements[index + 1]) {
//       elements[index + 1].focus();
//     } else {
//       // 👉 If it's the last input, add a new row automatically
//       if (typeof addRow === "function") {
//         addRow();
//         setTimeout(() => {
//           const newElements = Array.from(form.elements).filter(
//             (el) => el.tagName === "INPUT" && el.type !== "hidden"
//           );
//           newElements[newElements.length - 1]?.focus();
//         }, 100);
//       }
//     }
//   }
// };


//   // Reusable scroll-block helpers
//   const wheelHandler = (e) => {
//     if (document.activeElement && document.activeElement.type === "number") {
//       e.preventDefault();
//     }
//   };

//   const enableWheelBlock = () => {
//     window.addEventListener("wheel", wheelHandler, { passive: false, capture: true });
//   };

//   const disableWheelBlock = () => {
//     window.removeEventListener("wheel", wheelHandler, { capture: true });
//   };

//   // Reusable props to spread into inputs
//   const numberInputProps = {
//     className: "no-spin",
//     onFocus: enableWheelBlock,
//     onBlur: disableWheelBlock,
//     onKeyDown: (e) => {
//       if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
//     },
//   };



  
// const setRowStockError = (rowId, msg) => {
//   setStockErrors((prev) => {
//     if (!msg) {
//       // remove key to keep object small
//       const { [rowId]: _, ...rest } = prev;
//       return rest;
//     }
//     return { ...prev, [rowId]: msg };
//   });
// };

// const hasStockErrors = () => Object.keys(stockErrors).length > 0;



//   return (
//     <div className="salesbill-container">
//       {/* ✅ Popup Message */}
//       {popup.message && (
//         <div className={`popup-message ${popup.type}`}>{popup.message}</div>
//       )}

//       {/* Header */}
//       <div className="salesbill-header">
//         <div>
//           <h1 className="salesbill-title">Sales Bill</h1>
//         </div>
//         <button className="add-btn" onClick={() => setShowModal(true)}>
//           <FaPlus /> Add Sales
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className="salesbill-toolbar">
//         <input
//           type="text"
//           placeholder="Search bill no / name / mobile"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="salesbill-search"
//         />
//         <div className="salesbill-filter-wrapper">
//           <select
//             className="salesbill-filter"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >
//             <option value="">All</option>
//             <option value="today">Today</option>
//             <option value="this-week">This Week</option>
//             <option value="this-month">This Month</option>
//             <option value="custom">Custom Date</option>
//           </select>
//           {filter === "custom" && (
//             <div className="custom-date fade-in">
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//               />
//               <span>to</span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Table List */}
//       <div className="salesbill-table-wrapper">
//         {loading ? (
//           <p className="muted">Loading…</p>
//         ) : filteredBills.length === 0 ? (
//           <p className="muted">No records found</p>
//         ) : (
//           <table className="salesbill-table clean full-width">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Date</th>
//                 <th>Bill No</th>
//                 <th>Customer</th>
//                 <th>Net Amount</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredBills.map((bill, i) => (
//                 <tr key={bill._id} className="fade-in">
//                   <td>{i + 1}</td>
//                   <td>{formatDate(bill.date)}</td>
//                   <td>{bill.billNo}</td>
//                   <td>{bill.customerName}</td>
//                   <td>{Number(bill.netAmount).toFixed(2)}</td>
//                   <td className="salesbill-actions">
//                     <button
//                       onClick={() => setViewBill(bill)}
//                       className="action-btn view"
//                     >
//                       <FaEye />
//                     </button>
//                     <button
//                       onClick={() => handleEditBill(bill)}
//                       className="action-btn edit"
//                     >
//                       <FaEdit />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="modal fade-in">
//           <div className="modal-content slide-up large">
//             <div className="modal-header">
//               <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
//               <button className="icon-close" onClick={() => setShowModal(false)}>
//                 ×
//               </button>
//             </div>

//             {/* Meta */}
//             <form className="bill-meta">
//               <div className="meta-grid">
//                 <label>
//                   Bill No <input value={meta.billNo} readOnly />
//                 </label>
//                 <label>
//                   Date <input type="date" value={meta.date} readOnly />
//                 </label>
//                 <label>
//                   Counter
//                   <input
//                     type="number"
//                     value={meta.counter}
//                     onKeyDown={handleEnterKey}
//                     onChange={(e) =>
//                       setMeta({ ...meta, counter: e.target.value })
//                     }
//                   />
//                 </label>
//                 <label style={{ flex: "2" }}>
//                   Customer Name
//                   <input
//                     value={meta.customerName}
//                     onKeyDown={handleEnterKey}
//                     onChange={(e) =>
//                       setMeta({ ...meta, customerName: e.target.value })
//                     }
//                   />
//                 </label>

//                 <label>
//   Mobile
//   <input
//     type="text"
//     value={meta.mobile}
//     maxLength={10} // ensures input won't exceed 10 characters
//     onKeyDown={handleEnterKey}
//     onChange={(e) => {
//       // remove any non-digit characters
//       let value = e.target.value.replace(/\D/g, "");

//       // truncate to max 10 digits
//       if (value.length > 10) value = value.slice(0, 10);

//       setMeta({ ...meta, mobile: value });
//     }}
//     placeholder="Enter a Mobile number"
//   />
// </label>

//               </div>
//             </form>

//   {/* Items Table (Customized columns) */}
// <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
//   <thead>
//     <tr>
//       <th style={{ width: "50px" }}>S.No</th>
//       <th style={{ width: "140px" }}>Product Code</th>
//       <th style={{ width: "190px" }}>Product Name</th>
//       <th style={{ width: "200px" }}>Batch</th> {/* wider */}
//       <th style={{ width: "100px" }}>MRP</th>
//       <th style={{ width: "90px" }}>Rate</th>
//       <th style={{ width: "80px" }}>GST%</th>
//       <th style={{ width: "80px" }}>Qty</th>
//       <th style={{ width: "90px" }}>Action</th>
//     </tr>
//   </thead>
//   <tbody>
//     {rows.map((row, index) => (
//       <React.Fragment key={row.id}>
//         <tr>
//           {/* S.No */}
//           <td>{index + 1}</td>
//           {/* Product Code */}
// <td className="relative">
//   <input
//     value={row.code || ""}
//     onKeyDown={handleEnterKey}
//     disabled={!row.isNew && editRowId !== row.id}
//     onChange={(e) => {
//       const v = e.target.value;
//       updateRow(row.id, "code", v === "0" ? "" : v);

//       // Reset dependent fields if cleared
//       if (v.trim() === "") {
//         updateRow(row.id, "batch", "");
//         updateRow(row.id, "mrp", 0);
//         updateRow(row.id, "rate", 0);
//         updateRow(row.id, "gst", 0);
//         updateRow(row.id, "qty", 0);
//       }
//     }}
//     onFocus={() => {
//       if (row.code) {
//         setShowCodeList((v) => ({ ...v, [row.id]: true }));
//         suggestCodesDebounced(row.id, row.code);
//       }
//     }}
//     onBlur={() => {
//       setTimeout(() => {
//         setShowCodeList((v) => ({ ...v, [row.id]: false }));
//       }, 150);
//     }}
//     placeholder="Type or scan code"
//   />
//   {showCodeList[row.id] && (codeSuggestions[row.id] || []).length > 0 && (
//     <div className="suggestions">
//       {(codeSuggestions[row.id] || []).map((p) => (
//         <div
//           key={p._id || `${p.code}-${p.name}`}
//           className="suggestion"
//           onMouseDown={(e) => {
//             e.preventDefault();
//             handleSelectSuggestion(row.id, p);
//           }}
//         >
//           <div style={{ fontWeight: "600" }}>{p.code}</div>
//           <div style={{ fontSize: 12 }}>{p.name}</div>
//         </div>
//       ))}
//     </div>
//   )}
// </td>

// {/* Product Name */}
// <td className="relative">
//   <input
//     value={row.name || ""}
//     onKeyDown={handleEnterKey}
//     disabled={!row.isNew && editRowId !== row.id}
//     onChange={(e) => {
//       const v = e.target.value;
//       updateRow(row.id, "name", v);

//       // Reset dependent fields if cleared
//       if (v.trim() === "") {
//         updateRow(row.id, "batch", "");
//         updateRow(row.id, "mrp", 0);
//         updateRow(row.id, "rate", 0);
//         updateRow(row.id, "gst", 0);
//         updateRow(row.id, "qty", 0);
//       }
//     }}
//     onFocus={() => {
//       if (row.name) {
//         setShowNameList((v) => ({ ...v, [row.id]: true }));
//         suggestNamesDebounced(row.id, row.name);
//       }
//     }}
//     onBlur={() => {
//       setTimeout(() => {
//         setShowNameList((v) => ({ ...v, [row.id]: false }));
//       }, 150);
//     }}
//     placeholder="Type or select product"
//   />
//   {showNameList[row.id] && (nameSuggestions[row.id] || []).length > 0 && (
//     <div className="suggestions">
//       {(nameSuggestions[row.id] || []).map((p) => (
//         <div
//           key={p._id || `${p.code}-${p.name}`}
//           className="suggestion"
//           onMouseDown={(e) => {
//             e.preventDefault();
//             handleSelectSuggestion(row.id, p);
//           }}
//         >
//           <div style={{ fontWeight: "600" }}>{p.name}</div>
//           <div style={{ fontSize: 12 }}>{p.code}</div>
//         </div>
//       ))}
//     </div>
//   )}
// </td>


//           {/* Batch Selector */}
//           <td className="relative">
//             <input
//               className="input"
//               placeholder="Enter or select batch number"
//               value={row.batch}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 setRows((prev) =>
//                   prev.map((r) => (r.id === row.id ? { ...r, batch: v } : r))
//                 );
//                 setShowBatchList((m) => ({ ...m, [row.id]: v.trim() === "" }));
//               }}
//               onFocus={() => {
//                 if (row.name) {
//                   const batches = getBatchesForName(row.name);
//                   setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
//                 } else if (row.code) {
//                   const batches = getBatchesForCode(row.code);
//                   setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
//                 }
//                 openBatchList(row.id);
//               }}
//               onBlur={() => {
//                 setTimeout(() => {
//                   setShowBatchList((m) => ({
//                     ...m,
//                     [row.id]: !!row.batch ? false : m[row.id],
//                   }));
//                 }, 150);
//               }}
//             />

//             {Array.isArray(batchesByRow[row.id]) &&
//               batchesByRow[row.id].length > 0 &&
//               showBatchList[row.id] && (
//                 <div
//                   className="batch-suggestions"
//                   style={{
//                     maxHeight: 300,
//                     overflowY: "auto",
//                     border: "1px solid #eee",
//                     background: "#fff",
//                     zIndex: 50,
//                     width: 500, // wider
//                   }}
//                 >
//                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <thead>
//                       <tr style={{ background: "#fafafa", fontSize: 13 }}>
//                         <th style={{ padding: 4 }}>Batch</th>
//                         <th style={{ padding: 4 }}>MRP</th>
//                         <th style={{ padding: 4 }}>Rate</th>
//                         <th style={{ padding: 4 }}>GST%</th>
//                         <th style={{ padding: 4 }}>Stock</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {batchesByRow[row.id].map((b) => {
//                         const available = getAvailableStock(b.code, b.batchNo);
//                         return (
//                           <tr
//                             key={`${b.batchNo}-${b.rate}-${b.mrp}`}
//                             onMouseDown={(e) => {
//                               e.preventDefault();
//                               handleBatchPick(row.id, b);
//                             }}
//                             style={{
//                               cursor: "pointer",
//                               borderBottom: "1px solid #f4f4f4",
//                             }}
//                           >
//                             <td style={{ padding: 4, fontWeight: 600 }}>
//                               {b.batchNo || "(no batch)"}
//                             </td>
//                             <td style={{ padding: 4 }}>
//                               {Number(b.mrp || 0).toFixed(2)}
//                             </td>
//                             <td style={{ padding: 4 }}>
//                               {Number(b.rate || 0).toFixed(2)}
//                             </td>
//                             <td style={{ padding: 4 }}>{b.gst}%</td>
//                             <td style={{ padding: 4 }}>{available}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//           </td>

//           {/* MRP */}
//           <td>
//             <input
//               type="number"
//               {...numberInputProps}
//               value={row.mrp || 0}
//               onFocus={(e) => {
//                 if (String(e.target.value) === "0") e.target.value = "";
//                 enableWheelBlock();
//               }}
//               onBlur={(e) => {
//                 if (e.target.value === "") updateRow(row.id, "mrp", 0);
//                 disableWheelBlock();
//               }}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => updateRow(row.id, "mrp", e.target.value)}
//             />
//           </td>

//           {/* Rate */}
//           <td>
//             <input
//               type="number"
//               {...numberInputProps}
//               value={row.rate || 0}
//               onFocus={(e) => {
//                 if (String(e.target.value) === "0") e.target.value = "";
//                 enableWheelBlock();
//               }}
//               onBlur={(e) => {
//                 if (e.target.value === "") updateRow(row.id, "rate", 0);
//                 disableWheelBlock();
//               }}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => updateRow(row.id, "rate", e.target.value)}
//             />
//           </td>

//           {/* GST */}
//           <td>
//             <input
//               type="number"
//               {...numberInputProps}
//               value={row.gst || 0}
//               onFocus={(e) => {
//                 if (String(e.target.value) === "0") e.target.value = "";
//                 enableWheelBlock();
//               }}
//               onBlur={(e) => {
//                 if (e.target.value === "") updateRow(row.id, "gst", 0);
//                 disableWheelBlock();
//               }}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => updateRow(row.id, "gst", e.target.value)}
//             />
//           </td>

//           {/* Qty with stock validation */}
//           <td>
//             <input
//               type="number"
//               {...numberInputProps}
//               value={row.qty ? row.qty : ""}
//               onFocus={(e) => {
//                 if (String(e.target.value) === "0") e.target.value = "";
//                 enableWheelBlock();
//               }}
//               onBlur={(e) => {
//                 if (e.target.value === "") updateRow(row.id, "qty", 0);
//                 disableWheelBlock();
//               }}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => {
//                 const raw = e.target.value;
//                 const qty = raw === "" ? 0 : Number(raw);
//                 updateRow(row.id, "qty", qty);

//                 const available = row.batch
//                   ? getAvailableStock(row.code, row.batch)
//                   : null;

//                 if (available !== null && qty > available) {
//                   setRowStockError(
//                     row.id,
//                     `Out of stock: requested ${qty}, only ${available} available`
//                   );
//                 } else {
//                   setRowStockError(row.id, null);
//                 }
//               }}
//             />
//           </td>

//           {/* Actions */}
//           <td className="row-actions">
//             {row.isNew ? (
//               <button onClick={() => addRow(row.id)} className="plus">
//                 <FaPlus />
//               </button>
//             ) : editRowId === row.id ? (
//               <>
//                 <button
//                   onClick={() => saveRowEdit(row.id)}
//                   className="success"
//                   style={{ color: "green"}}
//                 >
//                   <FaCheck />
//                 </button>
//                 <button onClick={cancelRowEdit} className="danger">
//                   <FaTimes />
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => setEditRowId(row.id)}
//                   className="edit"
                   
//                 >
//                   <FaEdit />
//                 </button>
//                 <button onClick={() => deleteRow(row.id)} className="danger">
//                   <FaTrash />
//                 </button>
//               </>
//             )}
//           </td>
//         </tr>

//         {/* Per-row error row */}
//         {stockErrors[row.id] && (
//           <tr>
//             <td colSpan="9" style={{ color: "red", fontSize: 13 }}>
//               ❌ {stockErrors[row.id]}
//             </td>
//           </tr>
//         )}
//       </React.Fragment>
//     ))}
//   </tbody>
// </table>

// {/* Aggregated errors under table */}
// {Object.keys(stockErrors).length > 0 && (
//   <div style={{ color: "red", marginTop: 10 }}>
//     {Object.values(stockErrors).map((msg, i) => (
//       <div key={i}>❌ {msg}</div>
//     ))}
//   </div>
// )}

//             {errorMsg && <p className="error">{errorMsg}</p>}

//             {/* Totals */}
//             <div className="totals-layout">
//               {/* Left summary */}
//               <div className="totals-left">
//                 <div>
//                   <span>Total</span>
//                   <input value={totals.total} readOnly />
//                 </div>
//                 <div>
//                   <span>Discount</span>
//                   <input
//                     type="number"
//                     value={totals.discount}
//                     onChange={(e) =>
//                       setTotals({ ...totals, discount: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <span>Net Amount</span>
//                   <input value={totals.netAmount} readOnly />
//                 </div>
//                 <div>
//                   <span>Cash Given</span>
//                   <input
//                     type="number"
//                     value={totals.cashGiven}
//                     onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
//                     onBlur={(e) =>
//                       e.target.value === "" &&
//                       setTotals((t) => ({ ...t, cashGiven: 0 }))
//                     }
//                     onChange={(e) =>
//                       setTotals({ ...totals, cashGiven: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <span>Balance</span>
//                   <input value={totals.balance} readOnly />
//                 </div>
//               </div>

//               {/* Right card */}
//               <div className="totals-right">
//                 <div className="bill-amount-card">
//                   <h3>Bill Summary</h3>

//                   <div className="summary-line">
//                     <span>CGST</span>
//                     <strong>{totals.cgst.toFixed(2)}</strong>
//                   </div>

//                   <div className="summary-line">
//                     <span>SGST</span>
//                     <strong>{totals.sgst.toFixed(2)}</strong>
//                   </div>

//                   <hr />

//                   <div className="summary-total">
//                     <span>Bill Amount</span>
//                     <strong>{totals.netAmount.toFixed(2)}</strong>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="modal-actions">
//               <button className="primary" onClick={handleSaveAndPrint}>
//                 Print
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Bill Modal */}
//       {viewBill && (
//         <div className="modal fade-in">
//           <div className="modal-content slide-up large">
//             <div className="modal-header">
//               <h2>Bill Details</h2>
//               <button className="icon-close" onClick={() => setViewBill(null)}>
//                 <FaTimes />
//               </button>
//             </div>
//             <p>
//               <strong>Bill No:</strong> {viewBill.billNo}
//             </p>
//             <p>
//               <strong>Date:</strong> {formatDate(viewBill.date)}
//             </p>
//             <p>
//               <strong>Customer:</strong> {viewBill.customerName} (
//               {viewBill.mobile})
//             </p>
//             <p>
//               <strong>Net Amount:</strong> {viewBill.netAmount}
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
//                 {viewBill.items.map((it, i) => (
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
//               <button className="secondary" onClick={() => setViewBill(null)}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );





// ---- Suggestion helpers ----




// // src/pages/SalesBill.jsx
// import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../styles/salesbill.css";
// import { useAuth } from "../context/AuthContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // Axios instance with automatic token & shopname headers
// const axiosInstance = axios.create({ baseURL: API });
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   const shopname = localStorage.getItem("shopname");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   if (shopname) config.headers["x-shopname"] = shopname;
//   return config;
// });

// export default function SalesBill() {
//   const { token, shopname } = useAuth();

//   // ---- State ----
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
//   const debounceRef = useRef({});
//     // Search & Filter states
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [viewBill, setViewBill] = useState(null);


//   const [editRowId, setEditRowId] = useState(null);
  
//   const [errorMsg, setErrorMsg] = useState("");

//   // ⚡ Move this function here
//   const handleEnterKey = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();

//       const form = e.target.form;
//       if (!form) return;

//       const elements = Array.from(form.elements).filter(
//         (el) => el.tagName === "INPUT" && el.type !== "hidden"
//       );

//       const index = elements.indexOf(e.target);

//       if (elements[index + 1]) {
//         elements[index + 1].focus();
//       } else {
//         if (typeof addRow === "function") {
//           addRow();
//           setTimeout(() => {
//             const newElements = Array.from(form.elements).filter(
//               (el) => el.tagName === "INPUT" && el.type !== "hidden"
//             );
//             newElements[newElements.length - 1]?.focus();
//           }, 100);
//         }
//       }
//     }
//   };



// const numberInputProps = {
//   onWheel: (e) => e.target.blur(), // disables mouse wheel changing number
// };



//   // ---- Helpers ----
//   function createEmptyRow() {
//     return { id: Date.now(), code: "", name: "", batch: "", mrp: 0, rate: 0, qty: 0, gst: 0, amount: 0, value: 0, isNew: true };
//   }

//   const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

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
//     return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
//   };

//   // ---- Fetch Functions ----
//   const fetchProducts = async () => {
//     if (!token || !shopname) return console.error("Token or shopname not available");
//     try {
//       const { data } = await axiosInstance.get("/api/products");
//       setProducts((data || []).map(p => ({
//         ...p,
//         code: p.code || "",
//         name: p.name || "",
//         batchNo: p.batchNo || "",
//         mrp: Number(p.mrp || p.price || 0),
//         salePrice: Number(p.salePrice || p.price || 0),
//         taxPercent: Number(p.taxPercent || 0),
//         qty: Number(p.qty || 0),
//         minQty: Number(p.minQty || 0),
//         _id: p._id || p.id || null
//       })));
//     } catch (e) { console.error("Error fetching products", e); }
//   };

//   const fetchBills = async () => {
//     if (!token || !shopname) return console.error("Token or shopname not available");
//     try {
//       const { data } = await axiosInstance.get("/api/sales");
//       setBills(data);
//     } catch (e) { console.error("Error fetching bills", e); }
//     finally { setLoading(false); }
//   };

//   const fetchBillNo = async () => {
//     if (!token || !shopname) return console.error("Token or shopname not available");
//     try {
//       const { data } = await axiosInstance.get("/api/sales/next-billno");
//       const istDate = new Date(Date.now() + 5.5*60*60*1000);
//       setMeta(prev => ({ ...prev, billNo: data.nextBillNo, date: istDate.toISOString().split("T")[0] }));
//     } catch (e) { console.error("Failed to fetch bill number", e); }
//   };

//   useEffect(() => {
//     if (token && shopname) {
//       fetchProducts();
//       fetchBillNo();
//       fetchBills();
//     }
//   }, [token, shopname]);

//   // ---- Stock & Row Helpers ----
//   const getBatchesForCode = useCallback((code) => {
//     const matches = products.filter(p => (p.code||"").toLowerCase() === (code||"").toLowerCase());
//     const uniq = [];
//     const seen = new Set();
//     for (const m of matches) {
//       const key = `${m.batchNo}|${m.salePrice}|${m.mrp}`;
//       if (!seen.has(key)) { uniq.push({...m, batchNo: m.batchNo || ""}); seen.add(key); }
//     }
//     return uniq;
//   }, [products]);

//   const getAvailableStock = (code, batch) => {
//     const base = products.filter(p => (p.code||"").toLowerCase() === (code||"").toLowerCase() && (p.batchNo||"").toLowerCase() === (batch||"").toLowerCase()).reduce((sum,p)=>sum+Number(p.qty||0),0);
//     const reserved = Number(reservedStock[keyFor(code,batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   const recalcRow = (r) => {
//     const rate = Number(r.rate || 0);
//     const qty = Number(r.qty || 0);
//     const gst = Number(r.gst || 0);
//     const amount = +(rate*qty).toFixed(2);
//     const value = +(amount + (amount*gst/100)).toFixed(2);
//     return { ...r, amount, value };
//   };

//   // ---- Add / Delete / Edit Rows ----
//   const addRow = (id) => {
//     const row = rows.find(r => r.id===id);
//     if (!row || !row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code,row.batch);
//     if (available < row.qty) return showPopup(`Only ${available} left`);
//     // reserve stock
//     const k = keyFor(row.code,row.batch);
//     setReservedStock(rs => ({ ...rs, [k]: (rs[k]||0)+Number(row.qty) }));
//     setRows(prev => prev.map(r => r.id===id ? {...r,isNew:false}:r).concat(createEmptyRow()));
//   };

//   const deleteRow = (id) => {
//     const row = rows.find(r=>r.id===id);
//     if(row && !row.isNew) {
//       const k = keyFor(row.code,row.batch);
//       setReservedStock(rs => ({ ...rs, [k]: Math.max(0,(rs[k]||0)-Number(row.qty)) }));
//     }
//     setRows(prev=>prev.filter(r=>r.id!==id));
//   };

//   const updateRow = (id, field, value) => {
//     setRows(prev => prev.map(r => {
//       if(r.id!==id) return r;
//       const updated = { ...r, [field]: value };
//       return recalcRow(updated);
//     }));
//   };

//   // ---- Totals Calculation ----
//   useEffect(()=>{
//     const total = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount,0);
//     const gstTotal = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount*(r.gst||0)/100,0);
//     const discount = Number(totals.discount||0);
//     const netAmount = +(total+gstTotal-discount).toFixed(2);
//     const cashGiven = Number(totals.cashGiven||0);
//     const balance = +(cashGiven>=netAmount ? cashGiven-netAmount : netAmount-cashGiven).toFixed(2);
//     const cgst = +(gstTotal/2).toFixed(2);
//     const sgst = +(gstTotal/2).toFixed(2);
//     setTotals(prev=>({ ...prev,total,discount,netAmount,balance,cashGiven,cgst,sgst }));
//   }, [rows, totals.discount, totals.cashGiven]);

//   // ---- Save & Print ----
//   const handleSaveAndPrint = async () => {
//     if (!meta.customerName || !meta.mobile || rows.filter(r=>!r.isNew).length===0) return showPopup("Fill all required fields");
//     try {
//       const payload = { ...meta, counter:Number(meta.counter||1), items:rows.filter(r=>!r.isNew), ...totals, status:"confirmed" };
//       let savedBill;
//       if(billEditMode && editingBillId){
//         const { data } = await axiosInstance.put(`/api/sales/${editingBillId}`, payload);
//         setBills(prev=>prev.map(b=>b._id===editingBillId?data:b));
//         savedBill = data;
//       }else{
//         const { data } = await axiosInstance.post("/api/sales", payload);
//         setBills(prev=>[data,...prev]);
//         savedBill = data;
//       }
//       // Decrement stock
//       const reduceArray = rows.filter(r=>!r.isNew).map(it=>({ code: it.code, batchNo: it.batch, qty: Number(it.qty||0) }));
//       if(reduceArray.length) await axiosInstance.put("/api/products/decrement-stock",{ items: reduceArray });
//       window.dispatchEvent(new CustomEvent("products:refresh",{ detail:{ items: reduceArray }}));
//       showPopup("Saved successfully","success");
//       resetBillForm();
//       fetchBillNo();
//       setTimeout(()=>window.print(),400);
//     } catch(e){ console.error(e); showPopup("Failed to save bill","error"); }
//   };

//   const resetBillForm = () => {
//     setMeta(prev=>({ ...prev, customerName:"", mobile:"" }));
//     setBillEditMode(false);
//     setEditingBillId(null);
//     setRows([createEmptyRow()]);
//     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//     setReservedStock({});
//   };


// const suggestNamesDebounced = debounce("name", async (rowId, query) => {
//   if (!query) return setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//   const matches = products.filter((p) =>
//     (p.name || "").toLowerCase().includes(query.toLowerCase())
//   );
//   setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
// }, 250);

// const suggestCodesDebounced = debounce("code", async (rowId, query) => {
//   if (!query) return setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//   const matches = products.filter((p) =>
//     (p.code || "").toLowerCase().includes(query.toLowerCase())
//   );
//   setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
// }, 250);

// // ---- Select suggestion (name or code) ----
// const handleSelectSuggestion = (rowId, product) => {
//   updateRow(rowId, "code", product.code);
//   updateRow(rowId, "name", product.name);
//   updateRow(rowId, "batch", product.batchNo || "");
//   updateRow(rowId, "mrp", Number(product.mrp || 0));
//   updateRow(rowId, "rate", Number(product.salePrice || 0));
//   updateRow(rowId, "gst", Number(product.taxPercent || 0));
//   setShowNameList((s) => ({ ...s, [rowId]: false }));
//   setShowCodeList((s) => ({ ...s, [rowId]: false }));
//   setBatchesByRow((b) => ({ ...b, [rowId]: getBatchesForCode(product.code) }));
//   setShowBatchList((s) => ({ ...s, [rowId]: true }));
// };

// // ---- Batch helpers ----
// const getBatchesForName = useCallback(
//   (name) => products.filter((p) => (p.name || "").toLowerCase() === (name || "").toLowerCase()),
//   [products]
// );

// const openBatchList = (rowId) => {
//   setShowBatchList((s) => ({ ...s, [rowId]: true }));
// };

// const handleBatchPick = (rowId, batch) => {
//   updateRow(rowId, "batch", batch.batchNo || "");
//   updateRow(rowId, "mrp", Number(batch.mrp || 0));
//   updateRow(rowId, "rate", Number(batch.salePrice || 0));
//   updateRow(rowId, "gst", Number(batch.taxPercent || 0));
//   setShowBatchList((s) => ({ ...s, [rowId]: false }));
// };

// // ---- Row Stock Error ----
// const setRowStockError = (rowId, msg) => {
//   setStockErrors((prev) => {
//     if (msg === null) {
//       const { [rowId]: _, ...rest } = prev;
//       return rest;
//     } else return { ...prev, [rowId]: msg };
//   });
// };




// return (
//   <div className="salesbill-container">
//     {/* ✅ Popup Message */}
//     {popup.message && (
//       <div className={`popup-message ${popup.type}`}>{popup.message}</div>
//     )}

//     {/* Header */}
//     <div className="salesbill-header">
//       <div>
//         <h1 className="salesbill-title">Sales Bill</h1>
//       </div>
//       <button className="add-btn" onClick={() => setShowModal(true)}>
//         <FaPlus /> Add Sales
//       </button>
//     </div>

//     {/* Toolbar */}
//     {/* <div className="salesbill-toolbar">
//       <input
//         type="text"
//         placeholder="Search bill no / name / mobile"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="salesbill-search"
//       />
//       <div className="salesbill-filter-wrapper">
//         <select
//           className="salesbill-filter"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="">All</option>
//           <option value="today">Today</option>
//           <option value="this-week">This Week</option>
//           <option value="this-month">This Month</option>
//           <option value="custom">Custom Date</option>
//         </select>
//         {filter === "custom" && (
//           <div className="custom-date fade-in">
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//             />
//             <span>to</span>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//             />
//           </div>
//         )}
//       </div>
//     </div> */}
//   <div className="salesbill-toolbar">
//       <input
//         type="text"
//         placeholder="Search bill no / name / mobile"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="salesbill-search"
//       />
//       <div className="salesbill-filter-wrapper">
//         <select
//           className="salesbill-filter"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="">All</option>
//           <option value="today">Today</option>
//           <option value="this-week">This Week</option>
//           <option value="this-month">This Month</option>
//           <option value="custom">Custom Date</option>
//         </select>
//         {filter === "custom" && (
//           <div className="custom-date fade-in">
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//             />
//             <span>to</span>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//             />
//           </div>
//         )}
//       </div>
//     </div>


//     {/* Table List */}
//     <div className="salesbill-table-wrapper">
//       {loading ? (
//         <p className="muted">Loading…</p>
//       ) : filteredBills.length === 0 ? (
//         <p className="muted">No records found</p>
//       ) : (
//         <table className="salesbill-table clean full-width">
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Date</th>
//               <th>Bill No</th>
//               <th>Customer</th>
//               <th>Net Amount</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredBills.map((bill, i) => (
//               <tr key={bill._id} className="fade-in">
//                 <td>{i + 1}</td>
//                 <td>{formatDate(bill.date)}</td>
//                 <td>{bill.billNo}</td>
//                 <td>{bill.customerName}</td>
//                 <td>{Number(bill.netAmount).toFixed(2)}</td>
//                 <td className="salesbill-actions">
//                   <button
//                     onClick={() => setViewBill(bill)}
//                     className="action-btn view"
//                   >
//                     <FaEye />
//                   </button>
//                   <button
//                     onClick={() => handleEditBill(bill)}
//                     className="action-btn edit"
//                   >
//                     <FaEdit />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>

//     {/* Add/Edit Modal */}
//     {showModal && (
//       <div className="modal fade-in">
//         <div className="modal-content slide-up large">
//           <div className="modal-header">
//             <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
//             <button className="icon-close" onClick={() => setShowModal(false)}>
//               ×
//             </button>
//           </div>

//           {/* Meta */}
//           <form className="bill-meta">
//             <div className="meta-grid">
//               <label>
//                 Bill No <input value={meta.billNo} readOnly />
//               </label>
//               <label>
//                 Date <input type="date" value={meta.date} readOnly />
//               </label>
//               <label>
//                 Counter
//                 <input
//                   type="number"
//                   value={meta.counter}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, counter: e.target.value })
//                   }
//                 />
//               </label>
//               <label style={{ flex: "2" }}>
//                 Customer Name
//                 <input
//                   value={meta.customerName}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, customerName: e.target.value })
//                   }
//                 />
//               </label>
//               <label>
//                 Mobile
//                 <input
//                   type="text"
//                   value={meta.mobile}
//                   maxLength={10}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) => {
//                     let value = e.target.value.replace(/\D/g, "");
//                     if (value.length > 10) value = value.slice(0, 10);
//                     setMeta({ ...meta, mobile: value });
//                   }}
//                   placeholder="Enter a Mobile number"
//                 />
//               </label>
//             </div>
//           </form>

          // {/* Items Table */}
          //  <table
          //   className="salesbill-table clean full-width"
          //   style={{ tableLayout: "fixed" }}
          // >
          //   <thead>
          //     <tr>
          //       <th style={{ width: "50px" }}>S.No</th>
          //       <th style={{ width: "140px" }}>Product Code</th>
          //       <th style={{ width: "190px" }}>Product Name</th>
          //       <th style={{ width: "200px" }}>Batch</th>
          //       <th style={{ width: "100px" }}>MRP</th>
          //       <th style={{ width: "90px" }}>Rate</th>
          //       <th style={{ width: "80px" }}>GST%</th>
          //       <th style={{ width: "80px" }}>Qty</th>
          //       <th style={{ width: "90px" }}>Action</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     {rows.map((row, index) => (
          //       <React.Fragment key={row.id}>
          //         <tr>
          //           <td>{index + 1}</td>
          //           <td className="relative">
          //             <input
          //               value={row.code || ""}
          //               onKeyDown={handleEnterKey}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => {
          //                 const v = e.target.value;
          //                 updateRow(row.id, "code", v === "0" ? "" : v);
          //                 if (v.trim() === "") {
          //                   updateRow(row.id, "batch", "");
          //                   updateRow(row.id, "mrp", 0);
          //                   updateRow(row.id, "rate", 0);
          //                   updateRow(row.id, "gst", 0);
          //                   updateRow(row.id, "qty", 0);
          //                 }
          //               }}
          //               onFocus={() => {
          //                 if (row.code) {
          //                   setShowCodeList((v) => ({ ...v, [row.id]: true }));
          //                   suggestCodesDebounced(row.id, row.code);
          //                 }
          //               }}
          //               onBlur={() => {
          //                 setTimeout(() => {
          //                   setShowCodeList((v) => ({ ...v, [row.id]: false }));
          //                 }, 150);
          //               }}
          //               placeholder="Type or scan code"
          //             />
          //             {showCodeList[row.id] &&
          //               (codeSuggestions[row.id] || []).length > 0 && (
          //                 <div className="suggestions">
          //                   {(codeSuggestions[row.id] || []).map((p) => (
          //                     <div
          //                       key={p._id || `${p.code}-${p.name}`}
          //                       className="suggestion"
          //                       onMouseDown={(e) => {
          //                         e.preventDefault();
          //                         handleSelectSuggestion(row.id, p);
          //                       }}
          //                     >
          //                       <div style={{ fontWeight: "600" }}>{p.code}</div>
          //                       <div style={{ fontSize: 12 }}>{p.name}</div>
          //                     </div>
          //                   ))}
          //                 </div>
          //               )}
          //           </td>
          //           <td className="relative">
          //             <input
          //               value={row.name || ""}
          //               onKeyDown={handleEnterKey}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => {
          //                 const v = e.target.value;
          //                 updateRow(row.id, "name", v);
          //                 if (v.trim() === "") {
          //                   updateRow(row.id, "batch", "");
          //                   updateRow(row.id, "mrp", 0);
          //                   updateRow(row.id, "rate", 0);
          //                   updateRow(row.id, "gst", 0);
          //                   updateRow(row.id, "qty", 0);
          //                 }
          //               }}
          //               onFocus={() => {
          //                 if (row.name) {
          //                   setShowNameList((v) => ({ ...v, [row.id]: true }));
          //                   suggestNamesDebounced(row.id, row.name);
          //                 }
          //               }}
          //               onBlur={() => {
          //                 setTimeout(() => {
          //                   setShowNameList((v) => ({ ...v, [row.id]: false }));
          //                 }, 150);
          //               }}
          //               placeholder="Type or select product"
          //             />
          //             {showNameList[row.id] &&
          //               (nameSuggestions[row.id] || []).length > 0 && (
          //                 <div className="suggestions">
          //                   {(nameSuggestions[row.id] || []).map((p) => (
          //                     <div
          //                       key={p._id || `${p.code}-${p.name}`}
          //                       className="suggestion"
          //                       onMouseDown={(e) => {
          //                         e.preventDefault();
          //                         handleSelectSuggestion(row.id, p);
          //                       }}
          //                     >
          //                       <div style={{ fontWeight: "600" }}>{p.name}</div>
          //                       <div style={{ fontSize: 12 }}>{p.code}</div>
          //                     </div>
          //                   ))}
          //                 </div>
          //               )}
          //           </td>
          //           <td className="relative">
          //             <input
          //               className="input"
          //               placeholder="Enter or select batch number"
          //               value={row.batch}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => {
          //                 const v = e.target.value;
          //                 setRows((prev) =>
          //                   prev.map((r) => (r.id === row.id ? { ...r, batch: v } : r))
          //                 );
          //                 setShowBatchList((m) => ({ ...m, [row.id]: v.trim() === "" }));
          //               }}
          //               onFocus={() => {
          //                 if (row.name) {
          //                   const batches = getBatchesForName(row.name);
          //                   setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
          //                 } else if (row.code) {
          //                   const batches = getBatchesForCode(row.code);
          //                   setBatchesByRow((b) => ({ ...b, [row.id]: batches }));
          //                 }
          //                 openBatchList(row.id);
          //               }}
          //               onBlur={() => {
          //                 setTimeout(() => {
          //                   setShowBatchList((m) => ({
          //                     ...m,
          //                     [row.id]: !!row.batch ? false : m[row.id],
          //                   }));
          //                 }, 150);
          //               }}
          //             />
          //             {Array.isArray(batchesByRow[row.id]) &&
          //               batchesByRow[row.id].length > 0 &&
          //               showBatchList[row.id] && (
          //                 <div
          //                   className="batch-suggestions"
          //                   style={{
          //                     maxHeight: 300,
          //                     overflowY: "auto",
          //                     border: "1px solid #eee",
          //                     background: "#fff",
          //                     zIndex: 50,
          //                     width: 500,
          //                   }}
          //                 >
          //                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
          //                     <thead>
          //                       <tr style={{ background: "#fafafa", fontSize: 13 }}>
          //                         <th style={{ padding: 4 }}>Batch</th>
          //                         <th style={{ padding: 4 }}>MRP</th>
          //                         <th style={{ padding: 4 }}>Rate</th>
          //                         <th style={{ padding: 4 }}>GST%</th>
          //                         <th style={{ padding: 4 }}>Stock</th>
          //                       </tr>
          //                     </thead>
          //                     <tbody>
          //                       {batchesByRow[row.id].map((b) => {
          //                         const available = getAvailableStock(b.code, b.batchNo);
          //                         return (
          //                           <tr
          //                             key={`${b.batchNo}-${b.rate}-${b.mrp}`}
          //                             onMouseDown={(e) => {
          //                               e.preventDefault();
          //                               handleBatchPick(row.id, b);
          //                             }}
          //                             style={{
          //                               cursor: "pointer",
          //                               borderBottom: "1px solid #f4f4f4",
          //                             }}
          //                           >
          //                             <td style={{ padding: 4, fontWeight: 600 }}>
          //                               {b.batchNo || "(no batch)"}
          //                             </td>
          //                             <td style={{ padding: 4 }}>{Number(b.mrp || 0).toFixed(2)}</td>
          //                             <td style={{ padding: 4 }}>{Number(b.rate || 0).toFixed(2)}</td>
          //                             <td style={{ padding: 4 }}>{b.gst}%</td>
          //                             <td style={{ padding: 4 }}>{available}</td>
          //                           </tr>
          //                         );
          //                       })}
          //                     </tbody>
          //                   </table>
          //                 </div>
          //               )}
          //           </td>
          //           <td>
          //             <input
          //               type="number"
          //               {...numberInputProps}
          //               value={row.mrp || 0}
          //               onFocus={(e) => {
          //                 if (String(e.target.value) === "0") e.target.value = "";
          //                 enableWheelBlock();
          //               }}
          //               onBlur={(e) => {
          //                 if (e.target.value === "") updateRow(row.id, "mrp", 0);
          //                 disableWheelBlock();
          //               }}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => updateRow(row.id, "mrp", e.target.value)}
          //             />
          //           </td>
          //           <td>
          //             <input
          //               type="number"
          //               {...numberInputProps}
          //               value={row.rate || 0}
          //               onFocus={(e) => {
          //                 if (String(e.target.value) === "0") e.target.value = "";
          //                 enableWheelBlock();
          //               }}
          //               onBlur={(e) => {
          //                 if (e.target.value === "") updateRow(row.id, "rate", 0);
          //                 disableWheelBlock();
          //               }}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => updateRow(row.id, "rate", e.target.value)}
          //             />
          //           </td>
          //           <td>
          //             <input
          //               type="number"
          //               {...numberInputProps}
          //               value={row.gst || 0}
          //               onFocus={(e) => {
          //                 if (String(e.target.value) === "0") e.target.value = "";
          //                 enableWheelBlock();
          //               }}
          //               onBlur={(e) => {
          //                 if (e.target.value === "") updateRow(row.id, "gst", 0);
          //                 disableWheelBlock();
          //               }}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => updateRow(row.id, "gst", e.target.value)}
          //             />
          //           </td>
          //           <td>
          //             <input
          //               type="number"
          //               {...numberInputProps}
          //               value={row.qty ? row.qty : ""}
          //               onFocus={(e) => {
          //                 if (String(e.target.value) === "0") e.target.value = "";
          //                 enableWheelBlock();
          //               }}
          //               onBlur={(e) => {
          //                 if (e.target.value === "") updateRow(row.id, "qty", 0);
          //                 disableWheelBlock();
          //               }}
          //               disabled={!row.isNew && editRowId !== row.id}
          //               onChange={(e) => {
          //                 const raw = e.target.value;
          //                 const qty = raw === "" ? 0 : Number(raw);
          //                 updateRow(row.id, "qty", qty);

          //                 const available = row.batch
          //                   ? getAvailableStock(row.code, row.batch)
          //                   : null;

          //                 if (available !== null && qty > available) {
          //                   setRowStockError(
          //                     row.id,
          //                     `Out of stock: requested ${qty}, only ${available} available`
          //                   );
          //                 } else {
          //                   setRowStockError(row.id, null);
          //                 }
          //               }}
          //             />
          //           </td>
          //           <td className="row-actions">
          //             {row.isNew ? (
          //               <button onClick={() => addRow(row.id)} className="plus">
          //                 <FaPlus />
          //               </button>
          //             ) : editRowId === row.id ? (
          //               <>
          //                 <button
          //                   onClick={() => saveRowEdit(row.id)}
          //                   className="success"
          //                   style={{ color: "green" }}
          //                 >
          //                   <FaCheck />
          //                 </button>
          //                 <button onClick={cancelRowEdit} className="danger">
          //                   <FaTimes />
          //                 </button>
          //               </>
          //             ) : (
          //               <>
          //                 <button
          //                   onClick={() => setEditRowId(row.id)}
          //                   className="edit"
          //                 >
          //                   <FaEdit />
          //                 </button>
          //                 <button onClick={() => deleteRow(row.id)} className="danger">
          //                   <FaTrash />
          //                 </button>
          //               </>
          //             )}
          //           </td>
          //         </tr>

          //         {stockErrors[row.id] && (
          //           <tr>
          //             <td colSpan="9" style={{ color: "red", fontSize: 13 }}>
          //               ❌ {stockErrors[row.id]}
          //             </td>
          //           </tr>
          //         )}
          //       </React.Fragment>
          //     ))}
          //   </tbody>
          // </table> 

          // {Object.keys(stockErrors).length > 0 && (
          //   <div style={{ color: "red", marginTop: 10 }}>
          //     {Object.values(stockErrors).map((msg, i) => (
          //       <div key={i}>❌ {msg}</div>
          //     ))}
          //   </div>
          // )}

          // {errorMsg && <p className="error">{errorMsg}</p>} 

//           {/* Totals */}
//           {/* <div className="totals-layout">
//             <div className="totals-left">
//               <div>
//                 <span>Total</span>
//                 <input value={totals.total} readOnly />
//               </div>
//               <div>
//                 <span>Discount</span>
//                 <input
//                   type="number"
//                   value={totals.discount}
//                   onChange={(e) =>
//                     setTotals({ ...totals, discount: e.target.value })
//                   }
//                 />
//               </div>
//               <div>
//                 <span>Net Amount</span>
//                 <input value={totals.netAmount} readOnly />
//               </div>
//               <div>
//                 <span>Cash Given</span>
//                 <input
//                   type="number"
//                   value={totals.cashGiven}
//                   onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
//                   onBlur={(e) =>
//                     e.target.value === "" &&
//                     setTotals((t) => ({ ...t, cashGiven: 0 }))
//                   }
//                   onChange={(e) =>
//                     setTotals({ ...totals, cashGiven: e.target.value })
//                   }
//                 />
//               </div>
//               <div>
//                 <span>Balance</span>
//                 <input value={totals.balance} readOnly />
//               </div>
//             </div>

//             <div className="totals-right">
//               <div className="bill-amount-card">
//                 <h3>Bill Summary</h3>
//                 <div className="summary-line">
//                   <span>CGST</span>
//                   <strong>{totals.cgst.toFixed(2)}</strong>
//                 </div>
//                 <div className="summary-line">
//                   <span>SGST</span>
//                   <strong>{totals.sgst.toFixed(2)}</strong>
//                 </div>
//                 <hr />
//                 <div className="summary-total">
//                   <span>Bill Amount</span>
//                   <strong>{totals.netAmount.toFixed(2)}</strong>
//                 </div>
//               </div>
//             </div>
//           </div> */}



//           {/* Items Table */}
// {/* Items Table */}
// <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
//   <thead>
//     <tr>
//       <th style={{ width: "50px" }}>S.No</th>
//       <th style={{ width: "140px" }}>Product Code</th>
//       <th style={{ width: "190px" }}>Product Name</th>
//       <th style={{ width: "200px" }}>Batch</th>
//       <th style={{ width: "100px" }}>MRP</th>
//       <th style={{ width: "90px" }}>Rate</th>
//       <th style={{ width: "80px" }}>GST%</th>
//       <th style={{ width: "80px" }}>Qty</th>
//       <th style={{ width: "90px" }}>Action</th>
//     </tr>
//   </thead>
//   <tbody>
//     {rows.map((row, index) => (
//       <React.Fragment key={row.id}>
//         <tr>
//           <td>{index + 1}</td>

//           {/* Product Code */}
//           <td className="relative">
//             <input
//               value={row.code || ""}
//               placeholder="Type or scan code"
//               disabled={!row.isNew && editRowId !== row.id}
//               onKeyDown={handleEnterKey}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 updateRow(row.id, "code", v);
//                 if (!v.trim()) {
//                   ["batch", "mrp", "rate", "gst", "qty"].forEach((f) =>
//                     updateRow(row.id, f, f === "batch" ? "" : 0)
//                   );
//                 }
//                 if (v.length >= 1) suggestCodesDebounced(row.id, v);
//                 setShowCodeList({ ...showCodeList, [row.id]: v.length >= 1 });
//               }}
//               onFocus={() => row.code && setShowCodeList({ ...showCodeList, [row.id]: true })}
//               onBlur={() => setTimeout(() => setShowCodeList({ ...showCodeList, [row.id]: false }), 150)}
//             />
//             {showCodeList[row.id] && (codeSuggestions[row.id] || []).length > 0 && (
//               <div className="suggestions">
//                 {codeSuggestions[row.id].map((p) => (
//                   <div
//                     key={p._id || `${p.code}-${p.name}`}
//                     className="suggestion"
//                     onMouseDown={(e) => {
//                       e.preventDefault();
//                       handleSelectSuggestion(row.id, p); // auto-fill name, batch, mrp, rate, gst
//                     }}
//                   >
//                     <div style={{ fontWeight: 600 }}>{p.code}</div>
//                     <div style={{ fontSize: 12 }}>{p.name}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </td>

//           {/* Product Name */}
//           <td className="relative">
//             <input
//               value={row.name || ""}
//               placeholder="Type or select product"
//               disabled={!row.isNew && editRowId !== row.id}
//               onKeyDown={handleEnterKey}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 updateRow(row.id, "name", v);
//                 if (!v.trim()) {
//                   ["batch", "mrp", "rate", "gst", "qty"].forEach((f) =>
//                     updateRow(row.id, f, f === "batch" ? "" : 0)
//                   );
//                 }
//                 if (v.length >= 1) suggestNamesDebounced(row.id, v);
//                 setShowNameList({ ...showNameList, [row.id]: v.length >= 1 });
//               }}
//               onFocus={() => row.name && setShowNameList({ ...showNameList, [row.id]: true })}
//               onBlur={() => setTimeout(() => setShowNameList({ ...showNameList, [row.id]: false }), 150)}
//             />
//             {showNameList[row.id] && (nameSuggestions[row.id] || []).length > 0 && (
//               <div className="suggestions">
//                 {nameSuggestions[row.id].map((p) => (
//                   <div
//                     key={p._id || `${p.code}-${p.name}`}
//                     className="suggestion"
//                     onMouseDown={(e) => {
//                       e.preventDefault();
//                       handleSelectSuggestion(row.id, p); // auto-fill code, batch, mrp, rate, gst
//                     }}
//                   >
//                     <div style={{ fontWeight: 600 }}>{p.name}</div>
//                     <div style={{ fontSize: 12 }}>{p.code}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </td>

//           {/* Batch */}
//           <td className="relative">
//             <input
//               placeholder="Enter or select batch"
//               value={row.batch}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => updateRow(row.id, "batch", e.target.value)}
//               onFocus={() => {
//                 const batches = row.name
//                   ? getBatchesForName(row.name)
//                   : row.code
//                   ? getBatchesForCode(row.code)
//                   : [];
//                 setBatchesByRow({ ...batchesByRow, [row.id]: batches });
//                 openBatchList(row.id);
//               }}
//               onBlur={() => setTimeout(() => setShowBatchList({ ...showBatchList, [row.id]: false }), 150)}
//             />
//             {showBatchList[row.id] &&
//               Array.isArray(batchesByRow[row.id]) &&
//               batchesByRow[row.id].length > 0 && (
//                 <div className="batch-suggestions" style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #eee", background: "#fff", zIndex: 50, width: 500 }}>
//                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <thead>
//                       <tr style={{ background: "#fafafa", fontSize: 13 }}>
//                         <th style={{ padding: 4 }}>Batch</th>
//                         <th style={{ padding: 4 }}>MRP</th>
//                         <th style={{ padding: 4 }}>Rate</th>
//                         <th style={{ padding: 4 }}>GST%</th>
//                         <th style={{ padding: 4 }}>Stock</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {batchesByRow[row.id].map((b) => {
//                         const available = getAvailableStock(b.code, b.batchNo);
//                         return (
//                           <tr
//                             key={`${b.batchNo}-${b.rate}-${b.mrp}`}
//                             onMouseDown={(e) => {
//                               e.preventDefault();
//                               handleBatchPick(row.id, b); // auto-fill batch, mrp, rate, gst
//                             }}
//                             style={{ cursor: "pointer", borderBottom: "1px solid #f4f4f4" }}
//                           >
//                             <td style={{ padding: 4, fontWeight: 600 }}>{b.batchNo || "(no batch)"}</td>
//                             <td style={{ padding: 4 }}>{Number(b.mrp || 0).toFixed(2)}</td>
//                             <td style={{ padding: 4 }}>{Number(b.rate || 0).toFixed(2)}</td>
//                             <td style={{ padding: 4 }}>{b.gst}%</td>
//                             <td style={{ padding: 4 }}>{available}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//           </td>

//           {/* MRP, Rate, GST, Qty */}
//           {["mrp", "rate", "gst", "qty"].map((field) => (
//             <td key={field}>
//               <input
//                 type="number"
//                 {...numberInputProps}
//                 value={field === "qty" ? row.qty || "" : row[field] || 0}
//                 disabled={!row.isNew && editRowId !== row.id}
//                 onFocus={(e) => { if (String(e.target.value) === "0") e.target.value = ""; }}
//                 onBlur={(e) => { if (!e.target.value) updateRow(row.id, field, 0); }}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (field === "qty") {
//                     const qty = val === "" ? 0 : Number(val);
//                     updateRow(row.id, "qty", qty);
//                     const available = row.batch ? getAvailableStock(row.code, row.batch) : null;
//                     if (available !== null && qty > available) setRowStockError(row.id, `Out of stock: requested ${qty}, only ${available} available`);
//                     else setRowStockError(row.id, null);
//                   } else updateRow(row.id, field, val);
//                 }}
//               />
//             </td>
//           ))}

//           {/* Actions */}
//           <td className="row-actions">
//             {row.isNew ? (
//               <button onClick={() => addRow(row.id)} className="plus"><FaPlus /></button>
//             ) : editRowId === row.id ? (
//               <>
//                 <button onClick={() => saveRowEdit(row.id)} className="success" style={{ color: "green" }}><FaCheck /></button>
//                 <button onClick={cancelRowEdit} className="danger"><FaTimes /></button>
//               </>
//             ) : (
//               <>
//                 <button onClick={() => setEditRowId(row.id)} className="edit"><FaEdit /></button>
//                 <button onClick={() => deleteRow(row.id)} className="danger"><FaTrash /></button>
//               </>
//             )}
//           </td>
//         </tr>

//         {/* Stock Errors */}
//         {stockErrors[row.id] && (
//           <tr>
//             <td colSpan="9" style={{ color: "red", fontSize: 13 }}>❌ {stockErrors[row.id]}</td>
//           </tr>
//         )}
//       </React.Fragment>
//     ))}
//   </tbody>
// </table>


// {/* Global Stock Errors */}
// {Object.keys(stockErrors).length > 0 && (
//   <div style={{ color: "red", marginTop: 10 }}>
//     {Object.values(stockErrors).map((msg, i) => (
//       <div key={i}>❌ {msg}</div>
//     ))}
//   </div>
// )}

// {errorMsg && <p className="error">{errorMsg}</p>}

// {/* Totals */}
// <div className="totals-layout">
//   <div className="totals-left">
//     <div>
//       <span>Total</span>
//       <input value={totals.total} readOnly />
//     </div>
//     <div>
//       <span>Discount</span>
//       <input
//         type="number"
//         value={totals.discount}
//         onChange={(e) => setTotals({ ...totals, discount: e.target.value })}
//       />
//     </div>
//     <div>
//       <span>Net Amount</span>
//       <input value={totals.netAmount} readOnly />
//     </div>
//     <div>
//       <span>Cash Given</span>
//       <input
//         type="number"
//         value={totals.cashGiven}
//         onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
//         onBlur={(e) =>
//           e.target.value === "" && setTotals((t) => ({ ...t, cashGiven: 0 }))
//         }
//         onChange={(e) => setTotals({ ...totals, cashGiven: e.target.value })}
//       />
//     </div>
//     <div>
//       <span>Balance</span>
//       <input value={totals.balance} readOnly />
//     </div>
//   </div>

//   <div className="totals-right">
//     <div className="bill-amount-card">
//       <h3>Bill Summary</h3>
//       <div className="summary-line">
//         <span>CGST</span>
//         <strong>{totals.cgst.toFixed(2)}</strong>
//       </div>
//       <div className="summary-line">
//         <span>SGST</span>
//         <strong>{totals.sgst.toFixed(2)}</strong>
//       </div>
//       <hr />
//       <div className="summary-total">
//         <span>Bill Amount</span>
//         <strong>{totals.netAmount.toFixed(2)}</strong>
//       </div>
//     </div>
//   </div>
// </div>


//           <div className="modal-actions">
//             <button className="primary" onClick={handleSaveAndPrint}>
//               Print
//             </button>
//           </div>
//         </div>
//       </div>
//     )}

//     {/* View Bill Modal */}
//     {/* {viewBill && (
//       <div className="modal fade-in">
//         <div className="modal-content slide-up large">
//           <div className="modal-header">
//             <h2>Bill Details</h2>
//             <button className="icon-close" onClick={() => setViewBill(null)}>
//               <FaTimes />
//             </button>
//           </div>
//           <p>
//             <strong>Bill No:</strong> {viewBill.billNo}
//           </p>
//           <p>
//             <strong>Date:</strong> {formatDate(viewBill.date)}
//           </p>
//           <p>
//             <strong>Customer:</strong> {viewBill.customerName} ({viewBill.mobile})
//           </p>
//           <p>
//             <strong>Net Amount:</strong> {viewBill.netAmount}
//           </p>
//           <table className="salesbill-table clean full-width">
//             <thead>
//               <tr>
//                 <th>Code</th>
//                 <th>Name</th>
//                 <th>Batch</th>
//                 <th>MRP</th>
//                 <th>Rate</th>
//                 <th>Qty</th>
//                 <th>GST%</th>
//                 <th>Amount</th>
//                 <th>Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {viewBill.items.map((it, i) => (
//                 <tr key={i}>
//                   <td>{it.code}</td>
//                   <td>{it.name}</td>
//                   <td>{it.batch}</td>
//                   <td>{it.mrp}</td>
//                   <td>{it.rate}</td>
//                   <td>{it.qty}</td>
//                   <td>{it.gst}</td>
//                   <td>{it.amount}</td>
//                   <td>{it.value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="modal-actions">
//             <button className="secondary" onClick={() => setViewBill(null)}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     )} */}

//     {/* View Bill Modal */}
// {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>
//           <FaTimes />
//         </button>
//       </div>
//       <p>
//         <strong>Bill No:</strong> {viewBill.billNo}
//       </p>
//       <p>
//         <strong>Date:</strong> {formatDate(viewBill.date)}
//       </p>
//       <p>
//         <strong>Customer:</strong> {viewBill.customerName} ({viewBill.mobile})
//       </p>
//       <p>
//         <strong>Net Amount:</strong> {viewBill.netAmount}
//       </p>
//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//   </div>
// );




// }





// {/* Styles to prevent horizontal scrollbar */}
// <style jsx>{`
//   .salesbill-table {
//     width: 100%;
//     border-collapse: collapse;
//     table-layout: fixed; /* Prevent horizontal scroll */
//   }
//   .salesbill-table input {
//     box-sizing: border-box;
//   }
// `}</style>




// // baskar
// // src/pages/SalesBill.jsx
// import React, { useState, useEffect, useMemo, useRef, useCallback, useContext} from "react";
// import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
// import axios from "axios";
// import "../styles/salesbill.css";
// import { useAuth } from "../context/AuthContext";
// import { getAuthHeaders, API  } from "../utils/apiHeaders";
// // import { ShopContext } from "../context/ShopContext";


// // const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // ✅ No interceptor – we now use getAuthHeaders(user)
// const axiosInstance = axios.create({ baseURL: API });

// export default function SalesBill() {
//   const { user } = useAuth(); // ✅ useAuth gives user
//     // const { selectedShop } = useContext(ShopContext); 
//   const token = localStorage.getItem("token");
//   const shopname = user?.shopname || localStorage.getItem("shopname");

//   // ---- State ----
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
//   const debounceRef = useRef({});
//   // Search & Filter states
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [viewBill, setViewBill] = useState(null);

//   const [editRowId, setEditRowId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [inputValue, setInputValue] = useState("");
// const [suggestions, setSuggestions] = useState([]);
// const [rowStockError, setRowStockError] = useState({});
// const [billNo, setBillNo] = useState("");
// const [originalRowData, setOriginalRowData] = useState({});




//   // ⚡ Enter key handler
//   const handleEnterKey = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const form = e.target.form;
//       if (!form) return;
//       const elements = Array.from(form.elements).filter(
//         (el) => el.tagName === "INPUT" && el.type !== "hidden"
//       );
//       const index = elements.indexOf(e.target);
//       if (elements[index + 1]) {
//         elements[index + 1].focus();
//       } else {
//         if (typeof addRow === "function") {
//           addRow();
//           setTimeout(() => {
//             const newElements = Array.from(form.elements).filter(
//               (el) => el.tagName === "INPUT" && el.type !== "hidden"
//             );
//             newElements[newElements.length - 1]?.focus();
//           }, 100);
//         }
//       }
//     }
//   };

//   const numberInputProps = {
//     onWheel: (e) => e.target.blur(),
//   };


//   // ---- Helpers ----
//   function createEmptyRow() {
//     return { id: Date.now(), code: "", name: "", batch: "", mrp: 0, rate: 0, qty: 0, gst: 0, amount: 0, value: 0, isNew: true };
//   }

//   const keyFor = (code, batch) => `${(code || "").toLowerCase()}|${(batch || "").toLowerCase()}`;

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

//   // ---- Fetch Functions ----
//   const fetchProducts = async () => {
//     try {
//       const { data } = await axiosInstance.get("/api/products", {
//         headers: getAuthHeaders(user),
//       });
//       setProducts((data || []).map(p => ({
//         ...p,
//         code: p.code || "",
//         name: p.name || "",
//         batchNo: p.batchNo || "",
//         mrp: Number(p.mrp || p.price || 0),
//         salePrice: Number(p.salePrice || p.price || 0),
//         taxPercent: Number(p.taxPercent || 0),
//         qty: Number(p.qty || 0),
//         minQty: Number(p.minQty || 0),
//         _id: p._id || p.id || null
//       })));
//     } catch (e) { console.error("Error fetching products", e); }
//   };

//   const fetchBills = async () => {
//     try {
//       const { data } = await axiosInstance.get("/api/sales", {
//         headers: getAuthHeaders(user),
//       });
//       setBills(data);
//     } catch (e) { console.error("Error fetching bills", e); }
//     finally { setLoading(false); }
//   };
// //   const fetchBills = async (shopId) => {
// //   if (!shopId) return;
// //   try {
// //     const { data } = await axiosInstance.get(`/api/sales-bill/${shopId}`, {
// //       headers: getAuthHeaders(user),
// //     });
// //     setBills(data);
// //   } catch (e) {
// //     console.error("Error fetching bills", e);
// //   } finally {
// //     setLoading(false);
// //   }
// // };


  
//   //   try {
//   //     const { data } = await axiosInstance.get("/api/sales/next-billno", {
//   //       headers: getAuthHeaders(user),
//   //     });
//   //     const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
//   //     setMeta(prev => ({ ...prev, billNo: data.nextBillNo, date: istDate.toISOString().split("T")[0] }));
//   //   } catch (e) { console.error("Failed to fetch bill number", e); }
//   // };


// const fetchBillNo = async () => {
//   try {
//     if (!token || !shopname) {
//       console.error("Missing token or shopname");
//       return;
//     }

//     const { data } = await axiosInstance.get("/api/sales/next-billno", {
//       headers: {
//         ...getAuthHeaders(user),
//         "x-shopname": shopname   // ensure shop/tenant is sent
//       }
//     });

//     const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
//     setMeta(prev => ({
//       ...prev,
//       billNo: data.nextBillNo,
//       date: istDate.toISOString().split("T")[0]
//     }));

//   } catch (e) {
//     console.error("Failed to fetch bill number", e);
//   }
// };

// // const fetchBillNo = async (shopId) => {
// //   if (!shopId) return;
// //   try {
// //     const { data } = await axiosInstance.get(`/api/sales/next-billno/${shopId}`, {
// //       headers: getAuthHeaders(user),
// //     });
// //     const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
// //     setMeta(prev => ({ ...prev, billNo: data.nextBillNo, date: istDate.toISOString().split("T")[0] }));
// //   } catch (e) {
// //     console.error("Failed to fetch bill number", e);
// //   }
// // };






//   useEffect(() => {
//     if (token && shopname) {
//       fetchProducts();
//       fetchBillNo();
//       fetchBills();
//     }
//   }, [token, shopname]);

// // useEffect(() => {
// //   if (token && shopname && selectedShop?._id) {
// //     fetchProducts();
// //     fetchBillNo();
// //     fetchBills(selectedShop._id);
// //   }
// // }, [token, shopname, selectedShop?._id]);








//   const getAvailableStock = (code, batch) => {
//     const base = products.filter(p => (p.code||"").toLowerCase() === (code||"").toLowerCase() && (p.batchNo||"").toLowerCase() === (batch||"").toLowerCase()).reduce((sum,p)=>sum+Number(p.qty||0),0);
//     const reserved = Number(reservedStock[keyFor(code,batch)] || 0);
//     return Math.max(0, base - reserved);
//   };

//   const recalcRow = (r) => {
//     const rate = Number(r.rate || 0);
//     const qty = Number(r.qty || 0);
//     const gst = Number(r.gst || 0);
//     const amount = +(rate*qty).toFixed(2);
//     const value = +(amount + (amount*gst/100)).toFixed(2);
//     return { ...r, amount, value };
//   };

//   // ---- Add / Delete / Edit Rows ----
//   const addRow = (id) => {
//     const row = rows.find(r => r.id===id);
//     if (!row || !row.code || !row.name || !row.batch || !row.qty || !row.rate) return showPopup("Fill required fields");
//     const available = getAvailableStock(row.code,row.batch);
//     if (available < row.qty) return showPopup(`Only ${available} left`);
//     const k = keyFor(row.code,row.batch);
//     setReservedStock(rs => ({ ...rs, [k]: (rs[k]||0)+Number(row.qty) }));
//     setRows(prev => prev.map(r => r.id===id ? {...r,isNew:false}:r).concat(createEmptyRow()));
//   };

//   const deleteRow = (id) => {
//     const row = rows.find(r=>r.id===id);
//     if(row && !row.isNew) {
//       const k = keyFor(row.code,row.batch);
//       setReservedStock(rs => ({ ...rs, [k]: Math.max(0,(rs[k]||0)-Number(row.qty)) }));
//     }
//     setRows(prev=>prev.filter(r=>r.id!==id));
//   };

// const cancelRowEdit = () => {
//   if (!editRowId) return;
//   setRows(prev => prev.map(r => 
//     r.id === editRowId ? { ...originalRowData[editRowId] } : r
//   ));
//   setOriginalRowData(prev => {
//     const copy = { ...prev };
//     delete copy[editRowId];
//     return copy;
//   });
//   setEditRowId(null);
// };


// // const filteredBills = useMemo(() => {
// //   if (!bills) return [];
// //   return bills.filter(b => {
// //     if (search) return b.customerName.toLowerCase().includes(search.toLowerCase());
// //     if (filter) return b.status === filter;
// //     if (fromDate && toDate) {
// //       const billDate = new Date(b.date);
// //       return billDate >= new Date(fromDate) && billDate <= new Date(toDate);
// //     }
// //     return true;
// //   });
// // }, [bills, search, filter, fromDate, toDate]);


//   // ---- Totals Calculation ----
 
//   useEffect(()=>{
//     const total = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount,0);
//     const gstTotal = rows.filter(r=>!r.isNew).reduce((s,r)=>s+r.amount*(r.gst||0)/100,0);
//     const discount = Number(totals.discount||0);
//     const netAmount = +(total+gstTotal-discount).toFixed(2);
//     const cashGiven = Number(totals.cashGiven||0);
//     const balance = +(cashGiven>=netAmount ? cashGiven-netAmount : netAmount-cashGiven).toFixed(2);
//     const cgst = +(gstTotal/2).toFixed(2);
//     const sgst = +(gstTotal/2).toFixed(2);
//     setTotals(prev=>({ ...prev,total,discount,netAmount,balance,cashGiven,cgst,sgst }));
//   }, [rows, totals.discount, totals.cashGiven]);

//   // ---- Suggestions ----
//   const suggestNamesDebounced = debounce("name", async (rowId, query) => {
//     if (!query) return setNameSuggestions((s) => ({ ...s, [rowId]: [] }));
//     const matches = products.filter((p) =>
//       (p.name || "").toLowerCase().includes(query.toLowerCase())
//     );
//     setNameSuggestions((s) => ({ ...s, [rowId]: matches }));
//   }, 250);

//   const suggestCodesDebounced = debounce("code", async (rowId, query) => {
//     if (!query) return setCodeSuggestions((s) => ({ ...s, [rowId]: [] }));
//     const matches = products.filter((p) =>
//       (p.code || "").toLowerCase().includes(query.toLowerCase())
//     );
//     setCodeSuggestions((s) => ({ ...s, [rowId]: matches }));
//   }, 250);

//   // ---- Save & Print ----





//   const resetBillForm = () => {
//     setMeta(prev=>({ ...prev, customerName:"", mobile:"" }));
//     setBillEditMode(false);
//     setEditingBillId(null);
//     setRows([createEmptyRow()]);
//     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//     setReservedStock({});
//   };





// // Function to pick batch


// // Handle product code or name selection from suggestions



// const handleSelectSuggestion = (rowId, product) => {
//   setRows(prev =>
//     prev.map(r => {
//       if (r.id !== rowId) return r;
//       const updated = {
//         ...r,
//         code: product.code,
//         name: product.name,
//         batch: "",
//         mrp: Number(product.mrp || 0),
//         rate: Number(product.salePrice || product.rate || 0),
//         gst: Number(product.gst || 0),
//         qty: 0
//       };
//       return recalcRow(updated);
//     })
//   );

//   setShowCodeList(prev => ({ ...prev, [rowId]: false }));
//   setShowNameList(prev => ({ ...prev, [rowId]: false }));

//   // Load batches for this product
//   const batches = getBatchesForCode(product.code);
//   setBatchesByRow(prev => ({ ...prev, [rowId]: batches }));
//   setShowBatchList(prev => ({ ...prev, [rowId]: batches.length > 0 }));
// };



// const updateRow = (id, field, value, skipRecalc = false) => {
//   setRows(prev =>
//     prev.map(r => {
//       if (r.id !== id) return r;
//       let val = value;
//       if (["mrp", "rate", "gst", "qty"].includes(field)) {
//         val = Number(value) || 0;
//       }
//       const updated = { ...r, [field]: val };
//       return skipRecalc ? updated : recalcRow(updated);
//     })
//   );
// };



// const normalizeBatch = (m) => ({
//   ...m,
//   batchNo: m.batchNo || "",
//   mrp: Number(m.mrp || 0),
//   rate: Number(m.rate || m.salePrice || 0),
//   gst: Number(m.taxPercent || 0),   // ✅ map correctly
//   taxMode: m.taxMode || "exclusive",
//   qty: Number(m.qty || 0),
// });

// const getBatchesForCode = (code) => {
//   return products
//     .filter((p) => (p.code || "").toLowerCase() === (code || "").toLowerCase())
//     .map(normalizeBatch);
// };

// const getBatchesForName = (name) => {
//   return products
//     .filter((p) => (p.name || "").toLowerCase() === (name || "").toLowerCase())
//     .map(normalizeBatch);
// };


// const handleBatchPick = (rowId, batch) => {
//   setRows(prev => prev.map(r => {
//     if (r.id !== rowId) return r;
//     const updated = {
//       ...r,
//       batch: batch.batchNo || "",
//       mrp: Number(batch.mrp || 0),
//       rate: Number(batch.salePrice || 0),
//       gst: Number(batch.gst || 0),  // ✅ from taxPercent
//       qty: 0,
//     };
//     return recalcRow(updated);
//   }));

//   setShowBatchList(prev => ({ ...prev, [rowId]: false }));
// };



// // // --- Normalize batches by Code ---
// // const getBatchesForCode = (code) => {
// //   const matches = products.filter(
// //     (p) => (p.code || "").toLowerCase() === (code || "").toLowerCase()
// //   );

// //   return matches.map((m) => ({
// //     ...m,
// //     batchNo: m.batchNo || "",
// //     mrp: Number(m.mrp || 0),
// //     rate: Number(m.rate || m.salePrice || 0),
// //     // ✅ normalize GST from possible fields
// //     gst: Number(
// //       m.gst !== undefined
// //         ? m.gst
// //         : m.gstRate !== undefined
// //         ? m.gstRate
// //         : m.tax !== undefined
// //         ? m.tax
// //         : 0
// //     ),
// //   }));
// // };

// // // --- Normalize batches by Name ---
// // const getBatchesForName = (name) => {
// //   const matches = products.filter(
// //     (p) => (p.name || "").toLowerCase() === (name || "").toLowerCase()
// //   );

// //   return matches.map((m) => ({
// //     ...m,
// //     batchNo: m.batchNo || "",
// //     mrp: Number(m.mrp || 0),
// //     rate: Number(m.rate || m.salePrice || 0),
// //     gst: Number(
// //       m.gst !== undefined
// //         ? m.gst
// //         : m.gstRate !== undefined
// //         ? m.gstRate
// //         : m.tax !== undefined
// //         ? m.tax
// //         : 0
// //     ),
// //   }));
// // };

// // // --- Handle Batch Pick ---
// // const handleBatchPick = (rowId, batch) => {
// //   updateRow(rowId, "batch", batch.batchNo || "");
// //   updateRow(rowId, "mrp", batch.mrp || 0);
// //   updateRow(rowId, "rate", batch.rate || 0);
// //   updateRow(rowId, "gst", batch.gst || 0); // ✅ GST saved to row
// //   // Optionally close the batch list after selection
// //   setShowBatchList((prev) => ({ ...prev, [rowId]: false }));
// // };






// // const cancelRowEdit = () => {
// //   if (editRowId) {
// //     setRows(prev =>
// //       prev.map(r => (r.id === editRowId ? { ...r, ...originalRowData[r.id] } : r))
// //     );
// //   }
// //   setEditRowId(null);
// // };

// // Save changes made to a row with stock validation
// const saveRowEdit = (rowId) => {
//   const row = rows.find(r => r.id === rowId);
//   if (!row) return;

//   // Required fields validation
//   if (!row.code || !row.name || !row.batch || !row.qty || !row.rate) {
//     return showPopup("Fill required fields");
//   }

//   // Stock validation
//   const available = getAvailableStock(row.code, row.batch);
//   if (row.qty > available) {
//     return showPopup(`Only ${available} left`);
//   }

//   // Update reserved stock
//   const k = keyFor(row.code, row.batch);
//   setReservedStock(rs => ({ ...rs, [k]: (rs[k] || 0) + Number(row.qty) }));

//   // Exit edit mode
//   setEditRowId(null);

//   // Mark row as saved
//   setRows(prev => prev.map(r => r.id === rowId ? { ...r, isNew: false } : r));
// };


// //   try {
// //     if (!rows.length) {
// //       setErrorMsg("Add items before saving.");
// //       return;
// //     }

// //     const token = localStorage.getItem("token")?.replace(/"/g, "");
// //     const shopname = localStorage.getItem("shopname");

// //     if (!token || !shopname) {
// //       setErrorMsg("Login required");
// //       return;
// //     }

// //     const headers = {
// //       Authorization: `Bearer ${token}`,
// //       "x-shopname": shopname,
// //     };

// //     // Filter valid rows for stock decrement
// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({
// //         code: r.code,
// //         batchNo: r.batch,
// //         qty: Number(r.qty),
// //       }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // 1️⃣ Decrement stock
// //     await axios.put(`${API}/api/products/decrement-stock`, { items: itemsToDecrement }, { headers });

// //     // 2️⃣ Prepare sales bill payload
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: (Number(r.rate) * Number(r.qty)) + ((Number(r.gst)/100) * Number(r.rate) * Number(r.qty))
// //       })),
// //       totals,
// //     };

// //     // 3️⃣ Save sales bill
// //     const res = await axios.post(`${API}/api/sales`, salesPayload, { headers });
// //     console.log("Saved bill:", res.data);

// //     // 4️⃣ Print
// //     window.print();

// //     // 5️⃣ Reset modal and form
// //     setShowModal(false);
// //     setRows([]);
// //     setTotals({
// //       total: 0,
// //       discount: 0,
// //       netAmount: 0,
// //       cashGiven: 0,
// //       balance: 0,
// //       cgst: 0,
// //       sgst: 0
// //     });
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };



// // Simple print function


// // const handleSaveAndPrint = async () => {
// //   try {
// //     // 1️⃣ Validate rows/items
// //     if (!rows.length) {
// //       setErrorMsg("Add items before saving.");
// //       return;
// //     }

// //     // 2️⃣ Prepare headers
// //     const headers = getAuthHeaders(user);

// //     // 3️⃣ Prepare items to decrement stock
// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({ code: r.code, batchNo: r.batch, qty: Number(r.qty) }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // 4️⃣ Decrement stock
// //     await axiosInstance.put("/api/products/decrement-stock", { items: itemsToDecrement }, { headers });

// //     // 5️⃣ Save bill
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: (Number(r.rate) * Number(r.qty)) + ((Number(r.gst)/100) * Number(r.rate) * Number(r.qty))
// //       })),
// //       totals,
// //     };

// //     const { data: newBill } = await axiosInstance.post("/api/sales", salesPayload, { headers });

// //     // 6️⃣ Refresh bills table live
// //     await fetchBills();

// //     // 7️⃣ Show new bill in modal
// //     // setViewBill(newBill);

// //     // 8️⃣ Trigger print
// //     setTimeout(() => window.print(), 100);
// //     setViewBill(liveBill); 

// //     // 9️⃣ Reset form/modal
// //     setShowModal(false);
// //     setRows([]);
// //     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };
// // const handleSaveAndPrint = async () => {
// //   try {
// //     // 1️⃣ Validate rows/items
// //     if (!rows.length) {
// //       setErrorMsg("Add items before saving.");
// //       return;
// //     }

// //     // 2️⃣ Prepare headers
// //     const headers = getAuthHeaders(user);

// //     // 3️⃣ Prepare items to decrement stock
// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({
// //         code: r.code,
// //         batchNo: r.batch,
// //         qty: Number(r.qty),
// //       }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // 4️⃣ Decrement stock
// //     await axiosInstance.put("/api/products/decrement-stock", { items: itemsToDecrement }, { headers });

// //     // 5️⃣ Prepare sales payload
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: Number(r.rate) * Number(r.qty) * (1 + Number(r.gst)/100),
// //       })),
// //       totals,
// //     };

// //     // 6️⃣ Save bill
// //     const { data } = await axiosInstance.post("/api/sales", salesPayload, { headers });

// //     // 7️⃣ Update state live
// //     setViewBill(data);      // show in View Bill modal
// //     await fetchBills();     // refresh table

// //     // 8️⃣ Trigger print
// //     setTimeout(() => window.print(), 100);

// //     // 9️⃣ Reset form/modal AFTER printing
// //     setShowModal(false);
// //     setRows([]);
// //     setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
// //     setMeta(prev => ({ ...prev, customerName: "", mobile: "", counter: "" }));
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };
// // const handleSaveAndPrint = async () => {
// //   try {
// //     if (!rows.length) {
// //       setErrorMsg("Add items before saving.");
// //       return;
// //     }

// //     const headers = getAuthHeaders(user);

// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({ code: r.code, batchNo: r.batch, qty: Number(r.qty) }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // Decrement stock
// //     await axiosInstance.put("/api/products/decrement-stock", { items: itemsToDecrement }, { headers });

// //     // Prepare bill payload
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: (Number(r.rate) * Number(r.qty)) + ((Number(r.gst)/100) * Number(r.rate) * Number(r.qty))
// //       })),
// //       totals,
// //     };

// //     // Save bill
// //     const { data } = await axiosInstance.post("/api/sales", salesPayload, { headers });

// //     // ✅ Update bills table live
// //     setBills(prev => [data, ...prev]);  // prepend new bill

// //     // ✅ Show bill in modal
// //     setViewBill(data);

// //     // Print
// //     setTimeout(() => window.print(), 100);

// //     // Reset form/modal
// //     setShowModal(false);
// //     setRows([]);
// //     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };
// // const handleSaveAndPrint = async () => {
// //   try {
// //     // 1️⃣ Validate rows/items
// //     if (!rows.length) {
// //       setErrorMsg("Add items before saving.");
// //       return;
// //     }

// //     const headers = getAuthHeaders(user);

// //     // 2️⃣ Prepare items to decrement stock
// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({ code: r.code, batchNo: r.batch, qty: Number(r.qty) }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // 3️⃣ Decrement stock
// //     await axiosInstance.put("/api/products/decrement-stock", { items: itemsToDecrement }, { headers });

// //     // 4️⃣ Prepare sales payload
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: (Number(r.rate) * Number(r.qty)) + ((Number(r.gst)/100) * Number(r.rate) * Number(r.qty))
// //       })),
// //       totals,
// //     };

// //     // 5️⃣ Save bill
// //     const { data: savedBill } = await axiosInstance.post("/api/sales", salesPayload, { headers });

// //     // 6️⃣ Update sales table live
// //     setBills(prev => [savedBill, ...prev]); // prepend new bill to top

// //     // 7️⃣ Show new bill in View Bill modal
// //     setViewBill(savedBill);

// //     // 8️⃣ Trigger print
// //     setTimeout(() => window.print(), 100);

// //     // 9️⃣ Reset form/modal
// //     setShowModal(false);
// //     setRows([]);
// //     setTotals({ total: 0, discount: 0, netAmount: 0, cashGiven: 0, balance: 0, cgst: 0, sgst: 0 });
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };
// // const handleSaveAndPrint = async () => {
// //   try {
// //     if (!rows.length) { setErrorMsg("Add items before saving."); return; }
    
// //     const headers = getAuthHeaders(user);

// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({ code: r.code, batchNo: r.batch, qty: Number(r.qty) }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // Decrement stock
// //     await axiosInstance.put("/api/products/decrement-stock", { items: itemsToDecrement }, { headers });

// //     // Save bill
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: (Number(r.rate) * Number(r.qty)) + ((Number(r.gst)/100) * Number(r.rate) * Number(r.qty))
// //       })),
// //       totals,
// //     };

// //     const { data: savedBill } = await axiosInstance.post("/api/sales", salesPayload, { headers });

// //     // Refresh table and show new bill
// //     await fetchBills();
// //     setViewBill(savedBill);

// //     setTimeout(() => window.print(), 100);

// //     setShowModal(false);
// //     setRows([]);
// //     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };

// const printBill = (bill) => {
//   const printWindow = window.open("", "_blank");
//   printWindow.document.write(`<pre>${JSON.stringify(bill, null, 2)}</pre>`);
//   printWindow.document.close();
//   printWindow.print();
// };



// //   updateRow(rowId, field, value);

// //   if (field === "code" || field === "name") {
// //     if (!value.trim()) {
// //       ["batch", "mrp", "rate", "gst", "qty"].forEach((f) =>
// //         updateRow(rowId, f, f === "batch" ? "" : 0)
// //       );
// //       setShowBatchList({ ...showBatchList, [rowId]: false });
// //     } else if (field === "code") {
// //       const batches = getBatchesForCode(value);
// //       setBatchesByRow({ ...batchesByRow, [rowId]: batches });
// //       setShowBatchList({ ...showBatchList, [rowId]: batches.length > 0 });
// //     } else if (field === "name") {
// //       const batches = getBatchesForName(value);
// //       setBatchesByRow({ ...batchesByRow, [rowId]: batches });
// //       setShowBatchList({ ...showBatchList, [rowId]: batches.length > 0 });
// //     }
// //   }

// //   if (field === "batch" && !value) {
// //     updateRow(rowId, "mrp", 0);
// //     updateRow(rowId, "rate", 0);
// //     updateRow(rowId, "gst", 0);
// //     updateRow(rowId, "qty", 0);
// //   }
// // };

// // Generate temporary unique IDs for new rows
// const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

// // const handleEditBill = (bill) => {
// //   setBillEditMode(true);
// //   setEditingBillId(bill._id);
// //   setShowModal(true);

// //   // Map existing items to rows, adding temporary IDs
// //   const mappedRows = bill.items.map((item) => ({
// //     id: generateUniqueId(),   // unique temp ID for each row
// //     code: item.code,
// //     name: item.name,
// //     batch: item.batch,
// //     mrp: item.mrp,
// //     rate: item.rate,
// //     gst: item.gst,
// //     qty: item.qty,
// //     amount: item.amount,
// //     value: item.value,
// //     isNew: false,             // existing rows are not new
// //   }));

// //   setRows(mappedRows);

// //   // Set meta info
// //   setMeta({
// //     billNo: bill.billNo,
// //     date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
// //     counter: bill.counter || 1,
// //     customerName: bill.customerName,
// //     mobile: bill.mobile,
// //   });

// //   // Calculate totals
// //   setTotals({
// //     total: bill.total || 0,
// //     discount: bill.discount || 0,
// //     netAmount: bill.netAmount || 0,
// //     cashGiven: bill.cashGiven || 0,
// //     balance: bill.balance || 0,
// //     cgst: bill.cgst || 0,
// //     sgst: bill.sgst || 0,
// //   });
// // };


// useEffect(() => {
//   if (viewBill) {
//     setViewBill(prev => ({
//       ...prev,
//       customerName: meta.customerName,
//       mobile: meta.mobile,
//       netAmount: totals.netAmount,
//     }));
//   }
// }, [meta.customerName, meta.mobile, totals.netAmount]);



// // const liveBill = {
// //   ...newBill,
// //   customerName: meta.customerName,
// //   mobile: meta.mobile,
// //   netAmount: totals.netAmount,
// //   items: rows.map(r => ({
// //     code: r.code,
// //     name: r.name,
// //     batch: r.batch,
// //     mrp: Number(r.mrp),
// //     rate: Number(r.rate),
// //     gst: Number(r.gst),
// //     qty: Number(r.qty),
// //     amount: Number(r.rate) * Number(r.qty),
// //     value: (Number(r.rate) * Number(r.qty)) + ((Number(r.gst)/100) * Number(r.rate) * Number(r.qty))
// //   })),
// // };
// // setViewBill(liveBill);

  



















// // ---- Filtered Bills ----
// const filteredBills = useMemo(() => {
//   if (!bills) return [];
//   return bills.filter((bill) => {
//     const term = search.toLowerCase();
//     const customerName = (bill.customerName || bill.meta?.customerName || "").toLowerCase();
//     const mobile = (bill.mobile || bill.meta?.mobile || "").toLowerCase();
//     const billNo = (bill.billNo || "").toLowerCase();
//     return (
//       customerName.includes(term) ||
//       mobile.includes(term) ||
//       billNo.includes(term)
//     );
//   });
// }, [bills, search]);

// // ---- Handle Save & Print ----
// const handleSaveAndPrint = async () => {
//   try {
//     if (!rows.length) { setErrorMsg("Add items before saving."); return; }

//     const headers = getAuthHeaders(user);

//     // Prepare items to decrement stock
//     const itemsToDecrement = rows
//       .filter(r => r.code && r.batch && r.qty > 0)
//       .map(r => ({ code: r.code, batchNo: r.batch, qty: Number(r.qty) }));

//     if (!itemsToDecrement.length) {
//       setErrorMsg("No valid items to decrement stock.");
//       return;
//     }

//     // Decrement stock
//     await axiosInstance.put("/api/products/decrement-stock", { items: itemsToDecrement }, { headers });

//     // Prepare sales payload
//     const salesPayload = {
//       meta,
//       items: rows.map(r => ({
//         code: r.code,
//         name: r.name,
//         batch: r.batch,
//         mrp: Number(r.mrp),
//         rate: Number(r.rate),
//         gst: Number(r.gst),
//         qty: Number(r.qty),
//         amount: Number(r.rate) * Number(r.qty),
//         value: Number(r.rate) * Number(r.qty) * (1 + Number(r.gst)/100),
//       })),
//       totals,
//     };

//     // Save bill
//     const { data: savedBill } = await axiosInstance.post("/api/sales", salesPayload, { headers });

//     // Refresh table and show new bill
//     setBills(prev => [savedBill, ...prev]);
//     setViewBill(savedBill);

//     // Trigger print
//     setTimeout(() => window.print(), 100);

//     // Reset modal & form
//     setShowModal(false);
//     setRows([createEmptyRow()]);
//     setTotals({ total:0, discount:0, netAmount:0, cashGiven:0, balance:0, cgst:0, sgst:0 });
//     setMeta(prev => ({ ...prev, customerName:"", mobile:"" }));
//     setErrorMsg("");

//   } catch (err) {
//     console.error("Save/Print error:", err.response?.data || err.message);
//     setErrorMsg(err.response?.data?.message || "Failed to save/print");
//   }
// };

// // const handleSaveAndPrint = async () => {
// //   try {
// //     if (!rows.length) {
// //       setErrorMsg("Add items before saving.");
// //       return;
// //     }
// //     if (!selectedShop?._id) {
// //       setErrorMsg("No shop selected.");
// //       return;
// //     }

// //     const headers = getAuthHeaders(user);

// //     // Prepare items to decrement stock
// //     const itemsToDecrement = rows
// //       .filter(r => r.code && r.batch && r.qty > 0)
// //       .map(r => ({ code: r.code, batchNo: r.batch, qty: Number(r.qty) }));

// //     if (!itemsToDecrement.length) {
// //       setErrorMsg("No valid items to decrement stock.");
// //       return;
// //     }

// //     // 1️⃣ Decrement stock for this shop
// //     await axiosInstance.put(
// //       `/api/products/decrement-stock/${selectedShop._id}`,
// //       { items: itemsToDecrement },
// //       { headers }
// //     );

// //     // 2️⃣ Prepare sales payload
// //     const salesPayload = {
// //       meta,
// //       items: rows.map(r => ({
// //         code: r.code,
// //         name: r.name,
// //         batch: r.batch,
// //         mrp: Number(r.mrp),
// //         rate: Number(r.rate),
// //         gst: Number(r.gst),
// //         qty: Number(r.qty),
// //         amount: Number(r.rate) * Number(r.qty),
// //         value: Number(r.rate) * Number(r.qty) * (1 + Number(r.gst) / 100),
// //       })),
// //       totals,
// //     };

// //     // 3️⃣ Save bill for this shop
// //     const { data: savedBill } = await axiosInstance.post(
// //       `/api/sales-bill/${selectedShop._id}`,
// //       salesPayload,
// //       { headers }
// //     );

// //     // 4️⃣ Refresh table and show new bill
// //     setBills(prev => [savedBill, ...prev]);
// //     setViewBill(savedBill);

// //     // 5️⃣ Trigger print
// //     setTimeout(() => window.print(), 100);

// //     // 6️⃣ Reset modal & form
// //     setShowModal(false);
// //     setRows([createEmptyRow()]);
// //     setTotals({
// //       total: 0,
// //       discount: 0,
// //       netAmount: 0,
// //       cashGiven: 0,
// //       balance: 0,
// //       cgst: 0,
// //       sgst: 0,
// //     });
// //     setMeta(prev => ({ ...prev, customerName: "", mobile: "" }));
// //     setErrorMsg("");

// //   } catch (err) {
// //     console.error("Save/Print error:", err.response?.data || err.message);
// //     setErrorMsg(err.response?.data?.message || "Failed to save/print");
// //   }
// // };


// // ---- Edit Existing Bill ----
// const handleEditBill = (bill) => {
//   setBillEditMode(true);
//   setEditingBillId(bill._id);
//   setShowModal(true);

//   // Map existing items to rows
//   const mappedRows = bill.items.map((item) => ({
//     id: generateUniqueId(),
//     code: item.code,
//     name: item.name,
//     batch: item.batch,
//     mrp: item.mrp,
//     rate: item.rate,
//     gst: item.gst,
//     qty: item.qty,
//     amount: item.amount,
//     value: item.value,
//     isNew: false,
//   }));
//   setRows(mappedRows);

//   // Set meta info
//   setMeta({
//     billNo: bill.billNo,
//     date: bill.date ? new Date(bill.date).toISOString().split("T")[0] : "",
//     counter: bill.counter || 1,
//     customerName: bill.customerName || "",
//     mobile: bill.mobile || "",
//   });

//   // Calculate totals
//   setTotals({
//     total: bill.total || 0,
//     discount: bill.discount || 0,
//     netAmount: bill.netAmount || 0,
//     cashGiven: bill.cashGiven || 0,
//     balance: bill.balance || 0,
//     cgst: bill.cgst || 0,
//     sgst: bill.sgst || 0,
//   });
// };

// // ---- Live Update of View Bill ----
// useEffect(() => {
//   if (viewBill) {
//     setViewBill(prev => ({
//       ...prev,
//       customerName: meta.customerName,
//       mobile: meta.mobile,
//       netAmount: totals.netAmount,
//     }));
//   }
// }, [meta.customerName, meta.mobile, totals.netAmount]);








// return (
//   <div className="salesbill-container">
//     {/* ✅ Popup Message */}
//     {popup.message && (
//       <div className={`popup-message ${popup.type}`}>{popup.message}</div>
//     )}

//     {/* Header */}
//     <div className="salesbill-header">
//       <div>
//         <h1 className="salesbill-title">Sales Bill</h1>
//       </div>
//       <button className="add-btn" onClick={() => setShowModal(true)}>
//         <FaPlus /> Add Sales
//       </button>
//     </div>

//     {/* Toolbar */}
   
//   <div className="salesbill-toolbar">
//       <input
//         type="text"
//         placeholder="Search bill no / name / mobile"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="salesbill-search"
//       />
//       <div className="salesbill-filter-wrapper">
//         <select
//           className="salesbill-filter"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="">All</option>
//           <option value="today">Today</option>
//           <option value="this-week">This Week</option>
//           <option value="this-month">This Month</option>
//           <option value="custom">Custom Date</option>
//         </select>
//         {filter === "custom" && (
//           <div className="custom-date fade-in">
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//             />
//             <span>to</span>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//             />
//           </div>
//         )}
//       </div>
//     </div>


//     {/* Table List */}


//     <div className="salesbill-table-wrapper">
//   {loading ? (
//     <p className="muted">Loading…</p>
//   ) : filteredBills.length === 0 ? (
//     <p className="muted">No records found</p>
//   ) : (
//     <table className="salesbill-table clean full-width">
//       <thead>
//         <tr>
//           <th>S.No</th>
//           <th>Date</th>
//           <th>Bill No</th>
//           <th>Customer</th>
//           <th>Net Amount</th>
//           <th>Action</th>
//         </tr>
//       </thead>
   
//       <tbody>
//   {filteredBills.map((bill, i) => (
//     <tr key={bill._id} className="fade-in">
//       <td>{i + 1}</td>
//       <td>{formatDate(bill.date)}</td>
//       <td>{bill.billNo}</td>
//       <td>{bill.customerName || bill.meta?.customerName || ""}</td>
//       <td>{Number(bill.netAmount || bill.totals?.netAmount || 0).toFixed(2)}</td>
//       <td className="salesbill-actions">
//         <button
//           onClick={() => setViewBill(bill)}
//           className="action-btn view"
//         >
//           <FaEye />
//         </button>
//         <button
//           onClick={() => handleEditBill(bill)}
//           className="action-btn edit"
//         >
//           <FaEdit />
//         </button>
//       </td>
//     </tr>
//   ))}
// </tbody>

//     </table>
//   )}
// </div>


//     {/* Add/Edit Modal */}
//     {showModal && (
//       <div className="modal fade-in">
//         <div className="modal-content slide-up large">
//           <div className="modal-header">
//             <h2>{billEditMode ? "Edit Bill" : "Add Sales"}</h2>
//             <button className="icon-close" onClick={() => setShowModal(false)}>
//               ×
//             </button>
//           </div>

//           {/* Meta */}
//           <form className="bill-meta">
//             <div className="meta-grid">
//               <label>
//                 Bill No <input value={meta.billNo} readOnly />
//               </label>
//               <label>
//                 Date <input type="date" value={meta.date} readOnly />
//               </label>
//               <label>
//                 Counter
//                 <input
//                   type="number"
//                   value={meta.counter}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, counter: e.target.value })
//                   }
//                 />
//               </label>
//               <label style={{ flex: "2" }}>
//                 Customer Name
//                 <input
//                   value={meta.customerName}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) =>
//                     setMeta({ ...meta, customerName: e.target.value })
//                   }
//                 />
//               </label>
//               <label>
//                 Mobile
//                 <input
//                   type="text"
//                   value={meta.mobile}
//                   maxLength={10}
//                   onKeyDown={handleEnterKey}
//                   onChange={(e) => {
//                     let value = e.target.value.replace(/\D/g, "");
//                     if (value.length > 10) value = value.slice(0, 10);
//                     setMeta({ ...meta, mobile: value });
//                   }}
//                   placeholder="Enter a Mobile number"
//                 />
//               </label>
//             </div>
//           </form>

         


//           {/* Items Table */}
// {/* Items Table */}
// <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
//   <thead>
//     <tr>
//       <th style={{ width: "50px" }}>S.No</th>
//       <th style={{ width: "140px" }}>Product Code</th>
//       <th style={{ width: "190px" }}>Product Name</th>
//       <th style={{ width: "200px" }}>Batch</th>
//       <th style={{ width: "100px" }}>MRP</th>
//       <th style={{ width: "90px" }}>Rate</th>
//       <th style={{ width: "80px" }}>GST%</th>
//       <th style={{ width: "80px" }}>Qty</th>
//       <th style={{ width: "90px" }}>Action</th>
//     </tr>
//   </thead>
//   <tbody>
//     {rows.map((row, index) => (
//       <React.Fragment key={row.id}>
//         <tr>
//           <td>{index + 1}</td>

//           {/* Product Code */}
//           <td className="relative">
//             <input
//               value={row.code || ""}
//               placeholder="Type or scan code"
//               disabled={!row.isNew && editRowId !== row.id}
//               onKeyDown={handleEnterKey}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 updateRow(row.id, "code", v);
//                 if (!v.trim()) {
//                   ["batch", "mrp", "rate", "gst", "qty"].forEach((f) =>
//                     updateRow(row.id, f, f === "batch" ? "" : 0)
//                   );
//                 }
//                 if (v.length >= 1) suggestCodesDebounced(row.id, v);
//                 setShowCodeList({ ...showCodeList, [row.id]: v.length >= 1 });
//               }}
//               onFocus={() => row.code && setShowCodeList({ ...showCodeList, [row.id]: true })}
//               onBlur={() => setTimeout(() => setShowCodeList({ ...showCodeList, [row.id]: false }), 150)}
//             />
//             {showCodeList[row.id] && (codeSuggestions[row.id] || []).length > 0 && (
//               <div className="suggestions">
//                 {codeSuggestions[row.id].map((p) => (
//                   <div
//                     key={p._id || `${p.code}-${p.name}`}
//                     className="suggestion"
//                     onMouseDown={(e) => {
//                       e.preventDefault();
//                       handleSelectSuggestion(row.id, p); // auto-fill name, batch, mrp, rate, gst
//                     }}
//                   >
//                     <div style={{ fontWeight: 600 }}>{p.code}</div>
//                     <div style={{ fontSize: 12 }}>{p.name}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </td>

//           {/* Product Name */}
//           <td className="relative">
//             <input
//               value={row.name || ""}
//               placeholder="Type or select product"
//               disabled={!row.isNew && editRowId !== row.id}
//               onKeyDown={handleEnterKey}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 updateRow(row.id, "name", v);
//                 if (!v.trim()) {
//                   ["batch", "mrp", "rate", "gst", "qty"].forEach((f) =>
//                     updateRow(row.id, f, f === "batch" ? "" : 0)
//                   );
//                 }
//                 if (v.length >= 1) suggestNamesDebounced(row.id, v);
//                 setShowNameList({ ...showNameList, [row.id]: v.length >= 1 });
//               }}
//               onFocus={() => row.name && setShowNameList({ ...showNameList, [row.id]: true })}
//               onBlur={() => setTimeout(() => setShowNameList({ ...showNameList, [row.id]: false }), 150)}
//             />
//             {showNameList[row.id] && (nameSuggestions[row.id] || []).length > 0 && (
//               <div className="suggestions">
//                 {nameSuggestions[row.id].map((p) => (
//                   <div
//                     key={p._id || `${p.code}-${p.name}`}
//                     className="suggestion"
//                     onMouseDown={(e) => {
//                       e.preventDefault();
//                       handleSelectSuggestion(row.id, p); // auto-fill code, batch, mrp, rate, gst
//                     }}
//                   >
//                     <div style={{ fontWeight: 600 }}>{p.name}</div>
//                     <div style={{ fontSize: 12 }}>{p.code}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </td>

          

//           {/* Batch */}
//           <td className="relative">
//             <input
//               placeholder="Enter or select batch"
//               value={row.batch}
//               disabled={!row.isNew && editRowId !== row.id}
//               onChange={(e) => updateRow(row.id, "batch", e.target.value)}
//               onFocus={() => {
//                 const batches = row.name
//                   ? getBatchesForName(row.name)
//                   : row.code
//                   ? getBatchesForCode(row.code)
//                   : [];
//                 setBatchesByRow({ ...batchesByRow, [row.id]: batches });
//                 // openBatchList(row.id);
//                   setShowBatchList(prev => ({ ...prev, [row.id]: true }));
//               }}
//               onBlur={() => setTimeout(() => setShowBatchList({ ...showBatchList, [row.id]: false }), 150)}
//             />
//             {showBatchList[row.id] &&
//               Array.isArray(batchesByRow[row.id]) &&
//               batchesByRow[row.id].length > 0 && (
//                 <div className="batch-suggestions" style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #eee", background: "#fff", zIndex: 50, width: 500 }}>
//                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <thead>
//                       <tr style={{ background: "#fafafa", fontSize: 13 }}>
//                         <th style={{ padding: 4 }}>Batch</th>
//                         <th style={{ padding: 4 }}>MRP</th>
//                         <th style={{ padding: 4 }}>Rate</th>
//                         <th style={{ padding: 4 }}>GST%</th>
//                         <th style={{ padding: 4 }}>Stock</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {batchesByRow[row.id].map((b) => {
//                         const available = getAvailableStock(b.code, b.batchNo);
//                         return (
//                           <tr
//                             key={`${b.batchNo}-${b.rate}-${b.mrp}-${b.gst}`}
//                             onMouseDown={(e) => {
//                               e.preventDefault();
//                               handleBatchPick(row.id, b); // auto-fill batch, mrp, rate, gst
//                             }}
//                             style={{ cursor: "pointer", borderBottom: "1px solid #f4f4f4" }}
//                           >
//                             <td style={{ padding: 4, fontWeight: 600 }}>{b.batchNo || "(no batch)"}</td>
//                             <td style={{ padding: 4 }}>{Number(b.mrp || 0).toFixed(2)}</td>
//                             <td style={{ padding: 4 }}>{Number(b.rate || 0).toFixed(2)}</td>
                           
//                             {/* <td style={{ padding: 4 }}>{Number(b.gst || 0).toFixed(2)}%</td> */}
//                             <td style={{ padding: 4 }}>{b.gst ? `${b.gst}%` : "0%"}</td>
                            

//                             <td style={{ padding: 4 }}>{available}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//           </td>

//           {/* MRP, Rate, GST, Qty */}
//           {["mrp", "rate", "gst", "qty"].map((field) => (
//             <td key={field}>
//               <input
//                 type="number"
//                 {...numberInputProps}
//                 value={field === "qty" ? row.qty || "" : row[field] || 0}
//                 disabled={!row.isNew && editRowId !== row.id}
//                 onFocus={(e) => { if (String(e.target.value) === "0") e.target.value = ""; }}
//                 onBlur={(e) => { if (!e.target.value) updateRow(row.id, field, 0); }}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (field === "qty") {
//                     const qty = val === "" ? 0 : Number(val);
//                     updateRow(row.id, "qty", qty);
//                     const available = row.batch ? getAvailableStock(row.code, row.batch) : null;
//                     if (available !== null && qty > available) setRowStockError(row.id, `Out of stock: requested ${qty}, only ${available} available`);
//                     else setRowStockError(row.id, null);
//                   } else updateRow(row.id, field, val === "" ? 0 : Number(val));
//                 }}
//               />
//             </td>
//           ))}

 


//           {/* Actions */}
//           <td className="row-actions">
//             {row.isNew ? (
//               <button onClick={() => addRow(row.id)} className="plus"><FaPlus /></button>
//             ) : editRowId === row.id ? (
//               <>
//                 <button onClick={() => saveRowEdit(row.id)} className="success" style={{ color: "green" }}><FaCheck /></button>
//                 <button onClick={cancelRowEdit} className="danger"><FaTimes /></button>
//               </>
//             ) : (
//               <>
//                 <button onClick={() => setEditRowId(row.id)} className="edit"><FaEdit /></button>
//                 <button onClick={() => deleteRow(row.id)} className="danger"><FaTrash /></button>
//               </>
//             )}
//           </td>
//         </tr>

//         {/* Stock Errors */}
//         {stockErrors[row.id] && (
//           <tr>
//             <td colSpan="9" style={{ color: "red", fontSize: 13 }}>❌ {stockErrors[row.id]}</td>
//           </tr>
//         )}
//       </React.Fragment>
//     ))}
//   </tbody>
// </table>


// {/* Global Stock Errors */}
// {/* {Object.keys(stockErrors).length > 0 && (
//   <div style={{ color: "red", marginTop: 10 }}>
//     {Object.values(stockErrors).map((msg, i) => (
//       <div key={i}>❌ {msg}</div>
//     ))}
//   </div>
// )}

// {errorMsg && <p className="error">{errorMsg}</p>} */}

// {/* Totals */}
// {/* <div className="totals-layout">
//   <div className="totals-left">
//     <div>
//       <span>Total</span>
//       <input value={totals.total} readOnly />
//     </div>
//     <div>
//       <span>Discount</span>
//       <input
//         type="number"
//         value={totals.discount}
//         onChange={(e) => setTotals({ ...totals, discount: e.target.value })}
//       />
//     </div>
//     <div>
//       <span>Net Amount</span>
//       <input value={totals.netAmount} readOnly />
//     </div>
//     <div>
//       <span>Cash Given</span>
//       <input
//         type="number"
//         value={totals.cashGiven}
//         onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
//         onBlur={(e) =>
//           e.target.value === "" && setTotals((t) => ({ ...t, cashGiven: 0 }))
//         }
//         onChange={(e) => setTotals({ ...totals, cashGiven: e.target.value })}
//       />
//     </div>
//     <div>
//       <span>Balance</span>
//       <input value={totals.balance} readOnly />
//     </div>
//   </div>

//   <div className="totals-right">
//     <div className="bill-amount-card">
//       <h3>Bill Summary</h3>
//       <div className="summary-line">
//         <span>CGST</span>
//         <strong>{totals.cgst.toFixed(2)}</strong>
//       </div>
//       <div className="summary-line">
//         <span>SGST</span>
//         <strong>{totals.sgst.toFixed(2)}</strong>
//       </div>
//       <hr />
//       <div className="summary-total">
//         <span>Bill Amount</span>
//         <strong>{totals.netAmount.toFixed(2)}</strong>
//       </div>
//     </div>
//   </div>
// </div> */}


// {/* Totals */}
// {/* <div className="totals-layout">
//   <div className="totals-left">
//     <div>
//       <span>Total</span>
//       <input value={totals.total.toFixed(2)} readOnly />
//     </div>
//     <div>
//       <span>Discount</span>
//       <input
//         type="number"
//         value={totals.discount}
//         onChange={(e) =>
//           setTotals((prev) => ({
//             ...prev,
//             discount: Number(e.target.value) || 0,
//           }))
//         }
//       />
//     </div>
//     <div>
//       <span>Net Amount</span>
//       <input value={totals.netAmount.toFixed(2)} readOnly />
//     </div>
//     <div>
//       <span>Cash Given</span>
//       <input
//         type="number"
//         value={totals.cashGiven}
//         onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
//         onBlur={(e) =>
//           e.target.value === "" &&
//           setTotals((prev) => ({ ...prev, cashGiven: 0 }))
//         }
//         onChange={(e) =>
//           setTotals((prev) => ({
//             ...prev,
//             cashGiven: Number(e.target.value) || 0,
//           }))
//         }
//       />
//     </div>
//     <div>
//       <span>Balance</span>
//       <input value={totals.balance.toFixed(2)} readOnly />
//     </div>
//   </div>

//   <div className="totals-right">
//     <div className="bill-amount-card">
//       <h3>Bill Summary</h3>
//       <div className="summary-line">
//         <span>CGST</span>
//         <strong>{totals.cgst.toFixed(2)}</strong>
//       </div>
//       <div className="summary-line">
//         <span>SGST</span>
//         <strong>{totals.sgst.toFixed(2)}</strong>
//       </div>
//       <hr />
//       <div className="summary-total">
//         <span>Bill Amount</span>
//         <strong>{totals.netAmount.toFixed(2)}</strong>
//       </div>
//     </div>
//   </div>
// </div> */}
// {/* Totals */}
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
//   {/* Left column */}
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
//           onWheel={(e) => e.target.blur()} // disable mouse scroll change
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

//   {/* Right column - Bill Summary */}
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

//   {/* Animation */}
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


// {/* Totals */}




//           <div className="modal-actions">
//             <button className="primary" onClick={handleSaveAndPrint}>
//               Print
//             </button>
//           </div>
//         </div>
//       </div>
//     )}


//     {/* View Bill Modal */}
// {/* {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>
//           <FaTimes />
//         </button>
//       </div>
//       <p>
//         <strong>Bill No:</strong> {viewBill.billNo}
//       </p>
//       <p>
//         <strong>Date:</strong> {formatDate(viewBill.date)}
//       </p>
//       <p>
//         <strong>Customer:</strong> {viewBill.customerName} ({viewBill.mobile})
//       </p>
//       <p>
//         <strong>Net Amount:</strong> {viewBill.netAmount}
//       </p>
//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )} */}

// {/* {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>×</button>
//       </div>
//       <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//       <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//       <p><strong>Customer:</strong> {viewBill.customerName} ({viewBill.mobile})</p>
//       <p><strong>Net Amount:</strong> {viewBill.netAmount}</p>
//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>Close</button>
//       </div>
//     </div>
//   </div>
// )} */}

// {/* {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>×</button>
//       </div>
//       <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//       <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//       <p><strong>Customer:</strong> {viewBill.customerName} ({viewBill.mobile})</p>
//       <p><strong>Net Amount:</strong> {viewBill.netAmount}</p>
//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>Close</button>
//       </div>
//     </div>
//   </div>
// )} */}
// {viewBill && (
//   <div className="modal fade-in">
//     <div className="modal-content slide-up large">
//       <div className="modal-header">
//         <h2>Bill Details</h2>
//         <button className="icon-close" onClick={() => setViewBill(null)}>
//           <FaTimes />
//         </button>
//       </div>
//       <p><strong>Bill No:</strong> {viewBill.billNo}</p>
//       <p><strong>Date:</strong> {formatDate(viewBill.date)}</p>
//       {/* <p><strong>Customer:</strong> {viewBill.meta.customerName} ({viewBill.meta.mobile})</p>
//       <p><strong>Net Amount:</strong> {viewBill.totals.netAmount}</p> */}
//       <p>
//   <strong>Customer:</strong> {viewBill.customerName || viewBill.meta?.customerName || ""} 
//   ({viewBill.mobile || viewBill.meta?.mobile || ""})
// </p>
// <p>
//   <strong>Net Amount:</strong> {viewBill.netAmount || viewBill.totals?.netAmount || 0}
// </p>

//       <table className="salesbill-table clean full-width">
//         <thead>
//           <tr>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Batch</th>
//             <th>MRP</th>
//             <th>Rate</th>
//             <th>Qty</th>
//             <th>GST%</th>
//             <th>Amount</th>
//             <th>Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {viewBill.items?.map((it, i) => (
//             <tr key={i}>
//               <td>{it.code}</td>
//               <td>{it.name}</td>
//               <td>{it.batch}</td>
//               <td>{it.mrp}</td>
//               <td>{it.rate}</td>
//               <td>{it.qty}</td>
//               <td>{it.gst}</td>
//               <td>{it.amount}</td>
//               <td>{it.value}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div className="modal-actions">
//         <button className="secondary" onClick={() => setViewBill(null)}>
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}





//   </div>
// );




// }





// {/* Styles to prevent horizontal scrollbar */}
// <style jsx>{`
//   .salesbill-table {
//     width: 100%;
//     border-collapse: collapse;
//     table-layout: fixed; /* Prevent horizontal scroll */
//   }
//   .salesbill-table input {
//     box-sizing: border-box;
//   }
// `}</style>













              {/* Items table */}
              {/* <table className="salesbill-table clean full-width" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Batch</th>
                    <th>MRP</th>
                    <th>Rate</th>
                    <th>GST%</th>
                    <th>Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <React.Fragment key={row.id}>
                      <tr>
                        <td>{idx + 1}</td>
                        <td className="relative">
                          <input value={row.code} placeholder="Type or scan code" disabled={!row.isNew && editRowId !== row.id}
                            onChange={(e) => { const v = e.target.value; updateRow(row.id, "code", v); if (!v.trim()) updateRow(row.id, "name", ""); if (v.length >= 1) suggestCodesDebounced(row.id, v); setShowCodeList(prev => ({ ...prev, [row.id]: v.length >= 1 })); }}
                            onFocus={() => row.code && setShowCodeList(prev => ({ ...prev, [row.id]: true }))} onBlur={() => setTimeout(() => setShowCodeList(prev => ({ ...prev, [row.id]: false })), 150)} />
                          {showCodeList[row.id] && (codeSuggestions[row.id] || []).length > 0 && (
                            <div className="suggestions">
                              {codeSuggestions[row.id].map(p => (
                                <div key={p._id || `${p.code}-${p.name}`} className="suggestion" onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(row.id, p); }}>
                                  <div style={{ fontWeight: 600 }}>{p.code}</div>
                                  <div style={{ fontSize: 12 }}>{p.name}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="relative">
                          <input value={row.name} placeholder="Type or select product" disabled={!row.isNew && editRowId !== row.id}
                            onChange={(e) => { const v = e.target.value; updateRow(row.id, "name", v); if (!v.trim()) updateRow(row.id, "code", ""); if (v.length >= 1) suggestNamesDebounced(row.id, v); setShowNameList(prev => ({ ...prev, [row.id]: v.length >= 1 })); }}
                            onFocus={() => row.name && setShowNameList(prev => ({ ...prev, [row.id]: true }))} onBlur={() => setTimeout(() => setShowNameList(prev => ({ ...prev, [row.id]: false })), 150)} />
                          {showNameList[row.id] && (nameSuggestions[row.id] || []).length > 0 && (
                            <div className="suggestions">
                              {nameSuggestions[row.id].map(p => (
                                <div key={p._id || `${p.code}-${p.name}`} className="suggestion" onMouseDown={e => { e.preventDefault(); handleSelectSuggestion(row.id, p); }}>
                                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                                  <div style={{ fontSize: 12 }}>{p.code}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="relative">
                          <input placeholder="Enter or select batch" value={row.batch} disabled={!row.isNew && editRowId !== row.id}
                            onChange={(e) => updateRow(row.id, "batch", e.target.value)}
                            onFocus={() => {
                              const batches = row.name ? getBatchesForName(row.name) : row.code ? getBatchesForCode(row.code) : [];
                              setBatchesByRow(prev => ({ ...prev, [row.id]: batches }));
                              setShowBatchList(prev => ({ ...prev, [row.id]: batches.length > 0 }));
                            }} onBlur={() => setTimeout(() => setShowBatchList(prev => ({ ...prev, [row.id]: false })), 150)} />
                          {showBatchList[row.id] && Array.isArray(batchesByRow[row.id]) && batchesByRow[row.id].length > 0 && (
                            <div className="batch-suggestions">
                              <table style={{ width: "100%" }}>
                                <thead><tr><th>Batch</th><th>MRP</th><th>Rate</th><th>GST%</th><th>Stock</th></tr></thead>
                                <tbody>
                                  {batchesByRow[row.id].map(b => {
                                    const available = getAvailableStock(b.code, b.batchNo);
                                    return (
                                      <tr key={`${b.batchNo}-${b.rate}`} onMouseDown={e => { e.preventDefault(); handleBatchPick(row.id, b); }}>
                                        <td style={{ fontWeight: 600 }}>{b.batchNo || "(no batch)"}</td>
                                        <td>{Number(b.mrp || 0).toFixed(2)}</td>
                                        <td>{Number(b.salePrice || 0).toFixed(2)}</td>
                                        <td>{b.gst ? `${b.gst}%` : "0%"}</td>
                                        <td>{available}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>

                        {["mrp", "rate", "gst", "qty"].map(field => (
                          <td key={field}>
                            <input type="number" value={field === "qty" ? row.qty || "" : row[field] || 0} disabled={!row.isNew && editRowId !== row.id}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (field === "qty") {
                                  const qty = val === "" ? 0 : Number(val);
                                  updateRow(row.id, "qty", qty);
                                  const available = row.batch ? getAvailableStock(row.code, row.batch) : null;
                                  if (available !== null && qty > available) setStockErrors(prev => ({ ...prev, [row.id]: `Out of stock: requested ${qty}, only ${available} available` }));
                                  else setStockErrors(prev => { const copy = { ...prev }; delete copy[row.id]; return copy; });
                                } else updateRow(row.id, field, val === "" ? 0 : Number(val));
                              }} />
                          </td>
                        ))}

                        <td className="row-actions">
                          {row.isNew ? (
                            <button type="button" onClick={() => addRow(row.id)} className="plus"><FaPlus /></button>
                          ) : editRowId === row.id ? (
                            <>
                              <button type="button" onClick={() => saveRowEdit(row.id)} className="success"><FaCheck /></button>
                              <button type="button" onClick={() => { setEditRowId(null); }} className="danger"><FaTimes /></button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => { setEditRowId(row.id); setOriginalBillItems(prev => ({ ...prev, [row.id]: { ...row } })); }} className="edit"><FaEdit /></button>
                              <button type="button" onClick={() => deleteRow(row.id)} className="danger"><FaTrash /></button>
                            </>
                          )}
                        </td>
                      </tr>

                      {stockErrors[row.id] && (
                        <tr>
                          <td colSpan="9" style={{ color: "red", fontSize: 13 }}>❌ {stockErrors[row.id]}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table> */}

// // i need add items table product code input box working similarly product name format. batch - sugguestion without hozitontal bar show all data. oty add manually. all input box while type 0 hide only show type number. and when qty manually add then add button click decrease products home page table action view button click product details qty reduce. otherwise not add dont need decrease qty from products table. stock when 0 qty stock outof stock show eg. stock qty 10. user type 20 - left 10 products. lets connect product api from Products.jsx file i need updated full code SalesBill.jsx file code. dont miss a line