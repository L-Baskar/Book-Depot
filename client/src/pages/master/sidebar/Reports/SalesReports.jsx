


// src/pages/master/sidebar/Reports/SalesReport.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../../../context/AuthContext";
import { useShop } from "../../../../context/ShopContext";
import { useNavigate } from "react-router-dom";
import "../../../../styles/reports/SalesReport.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ---- Deterministic color per shop ----
const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};
const colorForShop = (name) => {
  const h = hashString(name) % 360;
  const s = 60 + (hashString(name + "s") % 20);
  const l = 45 + (hashString(name + "l") % 20);
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// ---- Date helpers ----
const ddmmyyyy = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

const formatLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SalesReport() {
  const { getToken } = useAuth();
  const { setSelectedShop } = useShop();
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [filter, setFilter] = useState("today"); // today | week | month | year
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const [hoveredShop, setHoveredShop] = useState(null);



  // ---- Compute period start date (local timezone-safe) ----
  // const getStartDate = () => {
  //   const now = new Date();
  //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  //   let startDate;

  //   if (filter === "today") {
  //     startDate = new Date(today);
  //     startDate.setDate(today.getDate() - offset);
  //   } else if (filter === "week") {
  //     const dayOfWeek = today.getDay(); // 0 = Sunday
  //     startDate = new Date(today);
  //     startDate.setDate(today.getDate() - dayOfWeek - offset * 7);
  //   } else if (filter === "month") {
  //     startDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  //   } else if (filter === "year") {
  //     startDate = new Date(today.getFullYear() - offset, 0, 1);
  //   } else {
  //     startDate = new Date(today);
  //   }

  //   startDate.setHours(0, 0, 0, 0);
  //   return formatLocalDate(startDate);
  // };

  const getStartDate = () => {
  const now = new Date();
  let startDate;

  if (filter === "today") {
    // 12 PM previous day to 12 PM today
    const offsetDays = offset || 0;
    startDate = new Date(now);
    startDate.setDate(now.getDate() - offsetDays);
    startDate.setHours(12, 0, 0, 0); // start at 12 PM
  } else if (filter === "week") {
    const day = now.getDay(); // 0 = Sunday
    startDate = new Date(now);
    startDate.setDate(now.getDate() - day - offset * 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (filter === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (filter === "year") {
    startDate = new Date(now.getFullYear() - offset, 0, 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  }

  return formatLocalDate(startDate);
};


  // ---- Period label (human readable) ----
  const getPeriodLabel = () => {
    const startDate = new Date(getStartDate());
    if (filter === "today") return ddmmyyyy(startDate);
    if (filter === "week") {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return `Week of ${ddmmyyyy(startDate)} - ${ddmmyyyy(endDate)}`;
    }
    if (filter === "month") return startDate.toLocaleString("default", { month: "long", year: "numeric" });
    if (filter === "year") return String(startDate.getFullYear());
    return "";
  };

  // ---- Fetch all shops & their summaries ----
  // const fetchShopsSummary = async () => {
  //   try {
  //     setLoading(true);
  //     const token = getToken();
  //     if (!token) throw new Error("No auth token found");

  //     const shopsRes = await axios.get(`${API}/api/shops?limit=1000`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const shopData = shopsRes.data?.shops || [];
  //     const startDate = getStartDate();

  //     const shopSales = await Promise.all(
  //       shopData.map(async (shop) => {
  //         try {
  //           const url = `${API}/api/shops/${encodeURIComponent(
  //             shop.shopname
  //           )}/dashboard/sales-bills/summary?period=${filter}&start=${startDate}`;
  //           const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  //           const data = res.data || {};
  //           const summary = data.summary || data;
  //           const totalAmount = Number(summary.totalAmount || 0);
  //           const totalBills =
  //             Number(summary.totalBills ?? data.totalBills ?? (Array.isArray(data.bills) ? data.bills.length : 0)) || 0;

  //           return {
  //             ...shop,
  //             totalAmount,
  //             totalBills,
  //             color: colorForShop(shop.shopname),
  //           };
  //         } catch {
  //           return { ...shop, totalAmount: 0, totalBills: 0, color: colorForShop(shop.shopname) };
  //         }
  //       })
  //     );

  //     setShops(shopSales);
  //     setTotalSales(shopSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0));
  //   } catch (err) {
  //     console.error("Fetch shops summary error:", err);
  //     setShops([]);
  //     setTotalSales(0);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // ---- Fetch all shops & their summaries ----
// ---- Fetch all shops & their summaries ----
// ---- Fetch all shops & their summaries ----
// const fetchShopsSummary = async () => {
//   try {
//     setLoading(true);
//     const token = getToken();
//     if (!token) throw new Error("No auth token found");

//     // 1️⃣ Fetch all shops
//     const shopsRes = await axios.get(`${API}/api/shops?limit=1000`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const shopData = shopsRes.data?.shops || [];
//     const startDate = getStartDate(); // your function to get filter start date

//     // 2️⃣ Fetch each shop's sales summary
//     const shopSales = await Promise.all(
//       shopData.map(async (shop) => {
//         try {
//           const url = `${API}/api/shops/${encodeURIComponent(
//             shop.shopname
//           )}/dashboard/sales-bills/summary?period=${filter}&start=${startDate}`;

//           const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
//           const summary = res.data || {};

//           return {
//             shopId: summary.shopId || shop._id,
//             shopname: summary.shopname || shop.shopname,
//             totalAmount: Number(summary.totalAmount || 0),
//             totalBills: Number(summary.totalBills || 0),
//             color: colorForShop(shop.shopname), // optional
//           };
//         } catch (err) {
//           console.error(`Failed fetching summary for ${shop.shopname}:`, err);
//           return {
//             shopId: shop._id,
//             shopname: shop.shopname,
//             totalAmount: 0,
//             totalBills: 0,
//             color: colorForShop(shop.shopname),
//           };
//         }
//       })
//     );

//     setShops(shopSales);
//     setTotalSales(shopSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0));
//   } catch (err) {
//     console.error("Fetch shops summary error:", err);
//     setShops([]);
//     setTotalSales(0);
//   } finally {
//     setLoading(false);
//   }
// };

const fetchShopsSummary = async () => {
  try {
    setLoading(true);
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    // 1) Fetch all shops
    const shopsRes = await axios.get(`${API}/api/shops`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 1000 },
    });
    const shopData = shopsRes.data?.shops || [];

    // Ensure startDate is an ISO string (or undefined)
    const startDateObj = getStartDate && getStartDate(); // could be Date or string
    const startISO = startDateObj ? new Date(startDateObj).toISOString() : undefined;

    // prefer 'period' name, fallback to filter if you use that variable elsewhere
    const periodVal = typeof period !== "undefined" ? period : typeof filter !== "undefined" ? filter : "today";

    // 2) Fetch summaries (use allSettled so a few failures won't break the rest)
    const results = await Promise.allSettled(
      shopData.map((shop) =>
        axios.get(`${API}/api/shops/${encodeURIComponent(shop.shopname)}/dashboard/sales-bills/summary`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            period: periodVal,
            ...(startISO ? { start: startISO } : {}),
          },
          timeout: 30_000, // optional
        })
      )
    );

    const shopSales = results.map((r, i) => {
      const shop = shopData[i];
      if (r.status === "fulfilled") {
        const res = r.value;
        const data = res.data || {};

        // handle multiple possible shapes from backend:
        // prefer summary.totalNetAmount, fallback to summary.totalAmount, fallback to top-level totalAmount or total
        const totalAmount =
          (data.summary && (Number(data.summary.totalNetAmount ?? data.summary.totalAmount) || 0)) ||
          Number(data.totalNetAmount ?? data.totalAmount ?? data.total ?? 0);

        const totalBills =
          (data.summary && (Number(data.summary.totalBills ?? data.summary.total) || 0)) ||
          Number(data.totalBills ?? data.total ?? 0);

        const shopId = data.shop?._id || data.shopId || shop._id;
        const shopname = data.shop?.shopname || data.shopname || shop.shopname;

        return {
          shopId,
          shopname,
          totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
          totalBills: Number.isFinite(totalBills) ? totalBills : 0,
          color: colorForShop(shop.shopname),
        };
      } else {
        console.error(`Failed fetching summary for ${shop?.shopname}`, r.reason);
        return {
          shopId: shop._id,
          shopname: shop.shopname,
          totalAmount: 0,
          totalBills: 0,
          color: colorForShop(shop.shopname),
        };
      }
    });

    setShops(shopSales);
    const totalSalesSum = shopSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    setTotalSales(totalSalesSum);
  } catch (err) {
    console.error("Fetch shops summary error:", err);
    setShops([]);
    setTotalSales(0);
  } finally {
    setLoading(false);
  }
};


  // ---- Chart data generation (hide empty periods) ----
const chartData = useMemo(() => {
  if (!shops.length) return [];

  const now = new Date();
  const data = [];
  const getLabel = (date) => date.toLocaleDateString();

  const hasData = (shopTotals) => Object.values(shopTotals).some((v) => v > 0);

  if (filter === "today") {
    const labelDate = new Date(now);
    labelDate.setDate(now.getDate() - offset);
    const shopTotals = shops.reduce((acc, shop) => {
      acc[shop.shopname] = shop.totalAmount || 0;
      return acc;
    }, {});
    if (hasData(shopTotals)) {
      data.push({ date: getLabel(labelDate), ...shopTotals });
    }
  } else if (filter === "week") {
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(now.getDate() - i * 7 - offset * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = `${getLabel(start)} - ${getLabel(end)}`;
      const shopTotals = shops.reduce((acc, shop) => {
        acc[shop.shopname] = shop.totalAmount || 0;
        return acc;
      }, {});
      if (hasData(shopTotals)) {
        data.push({ week: label, ...shopTotals });
      }
    }
  } else if (filter === "month") {
    for (let i = 3; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i - offset, 1);
      const label = month.toLocaleString("default", { month: "short", year: "numeric" });
      const shopTotals = shops.reduce((acc, shop) => {
        acc[shop.shopname] = shop.totalAmount || 0;
        return acc;
      }, {});
      if (hasData(shopTotals)) {
        data.push({ month: label, ...shopTotals });
      }
    }
  } else if (filter === "year") {
    for (let i = 3; i >= 0; i--) {
      const year = now.getFullYear() - i - offset;
      const shopTotals = shops.reduce((acc, shop) => {
        acc[shop.shopname] = shop.totalAmount || 0;
        return acc;
      }, {});
      if (hasData(shopTotals)) {
        data.push({ year, ...shopTotals });
      }
    }
  }

  return data;
}, [shops, filter, offset]);


  useEffect(() => {
    fetchShopsSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, offset]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setOffset(0);
  };





  return (
    <div className="sales-report-container">
      <h1 className="heading">Sales Reports</h1>

      {/* Total Sales */}
      <div className="total-sales-card bg-gradient-success">
        <h2>Total Sales</h2>
        <p>₹ {totalSales.toLocaleString()}</p>
      </div>

      {/* Shops cards */}
      <div className="shops-cards-container" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {shops.map((shop) => (
          <div
            key={shop._id}
            className="shop-card bg-gradient-info"
            style={{ flex: "1 1 calc(25% - 16px)", minWidth: 220, borderLeft: `5px solid ${shop.color}` }}
          >
            <h3>{shop.shopname}</h3>
            <p>Total: ₹ {Number(shop.totalAmount || 0).toLocaleString()}</p>
            <p>Bills: {Number(shop.totalBills || 0)}</p>
            <span
              className="view-bills-text"
              onClick={() => {
                setSelectedShop(shop);
                navigate(`/master-sales/${shop._id}`);
              }}
            >
              View Bills
            </span>
          </div>
        ))}
      </div>

      {/* Chart Header */}
      <div className="chart-header" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        <button className="nav-btn" onClick={() => setOffset((prev) => prev + 1)}>
          <FaChevronLeft /> Prev
        </button>

        <button
          className="nav-btn"
          onClick={() => setOffset((prev) => Math.max(prev - 1, 0))}
          disabled={offset === 0}
        >
          Next <FaChevronRight />
        </button>

        <div className="filter-dropdown-container">
          <FaCalendarAlt style={{ marginRight: 6 }} />
          <select value={filter} onChange={handleFilterChange} className="filter-dropdown">
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      <h3 className="current-period-label">{getPeriodLabel()}</h3>

{/* Chart */}
<div className="chart-container">
  <ResponsiveContainer width="100%" height={400}>
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={filter === "today" ? "date" : filter} />
      <YAxis />

      {/* Custom Tooltip */}
      <Tooltip
        cursor={{ fill: "rgba(0,0,0,0.1)" }}
        content={({ active, payload }) => {
          if (!active || !payload || !payload.length || !hoveredShop) return null;

          // Find the hovered shop's data in the payload
          const shopData = payload.find(
            (p) => p.dataKey === hoveredShop && p.value != null
          );
          if (!shopData) return null;

          return (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                padding: 8,
                borderRadius: 8,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{shopData.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    background: shopData.fill,
                    borderRadius: 2,
                  }}
                />
                <span>{shopData.name}</span>
                <span style={{ marginLeft: "auto" }}>
                  ₹ {Number(shopData.value || 0).toLocaleString()}
                </span>
              </div>
            </div>
          );
        }}
      />

      <Legend />

      {shops.map((shop) => (
        <Bar
          key={shop._id}
          dataKey={shop.shopname}
          fill={shop.color}
          radius={[8, 8, 0, 0]}
          animationDuration={800}
          onMouseEnter={() => setHoveredShop(shop.shopname)} // track hovered bar
          onMouseLeave={() => setHoveredShop(null)}
          opacity={hoveredShop ? (hoveredShop === shop.shopname ? 1 : 0.3) : 1} // highlight hovered bar
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
</div>




      {loading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
}







// // src/pages/master/sidebar/Reports/SalesReport.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { useAuth } from "../../../../context/AuthContext";
// import { useShop } from "../../../../context/ShopContext";
// import { useNavigate } from "react-router-dom";
// import "../../../../styles/reports/SalesReport.css";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // ---- Deterministic color per shop ----
// const hashString = (str) => {
//   let h = 0;
//   for (let i = 0; i < str.length; i++) {
//     h = (h << 5) - h + str.charCodeAt(i);
//     h |= 0;
//   }
//   return Math.abs(h);
// };
// const colorForShop = (name) => {
//   const h = hashString(name) % 360;
//   const s = 60 + (hashString(name + "s") % 20);
//   const l = 45 + (hashString(name + "l") % 20);
//   return `hsl(${h}, ${s}%, ${l}%)`;
// };

// // ---- Date helpers ----
// const ddmmyyyy = (d) =>
//   `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

// const formatLocalDate = (d) => {
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// export default function SalesReport() {
//   const { getToken } = useAuth();
//   const { setSelectedShop } = useShop();
//   const navigate = useNavigate();

//   const [shops, setShops] = useState([]);
//   const [totalSales, setTotalSales] = useState(0);
//   const [filter, setFilter] = useState("today"); // today | week | month | year
//   const [loading, setLoading] = useState(false);
//   const [offset, setOffset] = useState(0);

//   const [hoveredShop, setHoveredShop] = useState(null);



//   // ---- Compute period start date (local timezone-safe) ----
//   const getStartDate = () => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     let startDate;

//     if (filter === "today") {
//       startDate = new Date(today);
//       startDate.setDate(today.getDate() - offset);
//     } else if (filter === "week") {
//       const dayOfWeek = today.getDay(); // 0 = Sunday
//       startDate = new Date(today);
//       startDate.setDate(today.getDate() - dayOfWeek - offset * 7);
//     } else if (filter === "month") {
//       startDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
//     } else if (filter === "year") {
//       startDate = new Date(today.getFullYear() - offset, 0, 1);
//     } else {
//       startDate = new Date(today);
//     }

//     startDate.setHours(0, 0, 0, 0);
//     return formatLocalDate(startDate);
//   };

//   // ---- Period label (human readable) ----
//   const getPeriodLabel = () => {
//     const startDate = new Date(getStartDate());
//     if (filter === "today") return ddmmyyyy(startDate);
//     if (filter === "week") {
//       const endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + 6);
//       return `Week of ${ddmmyyyy(startDate)} - ${ddmmyyyy(endDate)}`;
//     }
//     if (filter === "month") return startDate.toLocaleString("default", { month: "long", year: "numeric" });
//     if (filter === "year") return String(startDate.getFullYear());
//     return "";
//   };

//   // ---- Fetch all shops & their summaries ----
//   const fetchShopsSummary = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       if (!token) throw new Error("No auth token found");

//       const shopsRes = await axios.get(`${API}/api/shops?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const shopData = shopsRes.data?.shops || [];
//       const startDate = getStartDate();

//       const shopSales = await Promise.all(
//         shopData.map(async (shop) => {
//           try {
//             const url = `${API}/api/shops/${encodeURIComponent(
//               shop.shopname
//             )}/dashboard/sales-bills/summary?period=${filter}&start=${startDate}`;
//             const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
//             const data = res.data || {};
//             const summary = data.summary || data;
//             const totalAmount = Number(summary.totalAmount || 0);
//             const totalBills =
//               Number(summary.totalBills ?? data.totalBills ?? (Array.isArray(data.bills) ? data.bills.length : 0)) || 0;

//             return {
//               ...shop,
//               totalAmount,
//               totalBills,
//               color: colorForShop(shop.shopname),
//             };
//           } catch {
//             return { ...shop, totalAmount: 0, totalBills: 0, color: colorForShop(shop.shopname) };
//           }
//         })
//       );

//       setShops(shopSales);
//       setTotalSales(shopSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0));
//     } catch (err) {
//       console.error("Fetch shops summary error:", err);
//       setShops([]);
//       setTotalSales(0);
//     } finally {
//       setLoading(false);
//     }
//   };




//   // ---- Chart data generation (hide empty periods) ----
// const chartData = useMemo(() => {
//   if (!shops.length) return [];

//   const now = new Date();
//   const data = [];
//   const getLabel = (date) => date.toLocaleDateString();

//   const hasData = (shopTotals) => Object.values(shopTotals).some((v) => v > 0);

//   if (filter === "today") {
//     const labelDate = new Date(now);
//     labelDate.setDate(now.getDate() - offset);
//     const shopTotals = shops.reduce((acc, shop) => {
//       acc[shop.shopname] = shop.totalAmount || 0;
//       return acc;
//     }, {});
//     if (hasData(shopTotals)) {
//       data.push({ date: getLabel(labelDate), ...shopTotals });
//     }
//   } else if (filter === "week") {
//     for (let i = 3; i >= 0; i--) {
//       const start = new Date();
//       start.setDate(now.getDate() - i * 7 - offset * 7);
//       const end = new Date(start);
//       end.setDate(start.getDate() + 6);
//       const label = `${getLabel(start)} - ${getLabel(end)}`;
//       const shopTotals = shops.reduce((acc, shop) => {
//         acc[shop.shopname] = shop.totalAmount || 0;
//         return acc;
//       }, {});
//       if (hasData(shopTotals)) {
//         data.push({ week: label, ...shopTotals });
//       }
//     }
//   } else if (filter === "month") {
//     for (let i = 3; i >= 0; i--) {
//       const month = new Date(now.getFullYear(), now.getMonth() - i - offset, 1);
//       const label = month.toLocaleString("default", { month: "short", year: "numeric" });
//       const shopTotals = shops.reduce((acc, shop) => {
//         acc[shop.shopname] = shop.totalAmount || 0;
//         return acc;
//       }, {});
//       if (hasData(shopTotals)) {
//         data.push({ month: label, ...shopTotals });
//       }
//     }
//   } else if (filter === "year") {
//     for (let i = 3; i >= 0; i--) {
//       const year = now.getFullYear() - i - offset;
//       const shopTotals = shops.reduce((acc, shop) => {
//         acc[shop.shopname] = shop.totalAmount || 0;
//         return acc;
//       }, {});
//       if (hasData(shopTotals)) {
//         data.push({ year, ...shopTotals });
//       }
//     }
//   }

//   return data;
// }, [shops, filter, offset]);


//   useEffect(() => {
//     fetchShopsSummary();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter, offset]);

//   const handleFilterChange = (e) => {
//     setFilter(e.target.value);
//     setOffset(0);
//   };





//   return (
//     <div className="sales-report-container">
//       <h1 className="heading">Sales Reports</h1>

//       {/* Total Sales */}
//       <div className="total-sales-card bg-gradient-success">
//         <h2>Total Sales</h2>
//         <p>₹ {totalSales.toLocaleString()}</p>
//       </div>

//       {/* Shops cards */}
//       <div className="shops-cards-container" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
//         {shops.map((shop) => (
//           <div
//             key={shop._id}
//             className="shop-card bg-gradient-info"
//             style={{ flex: "1 1 calc(25% - 16px)", minWidth: 220, borderLeft: `5px solid ${shop.color}` }}
//           >
//             <h3>{shop.shopname}</h3>
//             <p>Total: ₹ {Number(shop.totalAmount || 0).toLocaleString()}</p>
//             <p>Bills: {Number(shop.totalBills || 0)}</p>
//             <span
//               className="view-bills-text"
//               onClick={() => {
//                 setSelectedShop(shop);
//                 navigate(`/master-sales/${shop._id}`);
//               }}
//             >
//               View Bills
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Chart Header */}
//       <div className="chart-header" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
//         <button className="nav-btn" onClick={() => setOffset((prev) => prev + 1)}>
//           <FaChevronLeft /> Prev
//         </button>

//         <button
//           className="nav-btn"
//           onClick={() => setOffset((prev) => Math.max(prev - 1, 0))}
//           disabled={offset === 0}
//         >
//           Next <FaChevronRight />
//         </button>

//         <div className="filter-dropdown-container">
//           <FaCalendarAlt style={{ marginRight: 6 }} />
//           <select value={filter} onChange={handleFilterChange} className="filter-dropdown">
//             <option value="today">Today</option>
//             <option value="week">Week</option>
//             <option value="month">Month</option>
//             <option value="year">Year</option>
//           </select>
//         </div>
//       </div>

//       <h3 className="current-period-label">{getPeriodLabel()}</h3>

// {/* Chart */}
// <div className="chart-container">
//   <ResponsiveContainer width="100%" height={400}>
//     <BarChart
//       data={chartData}
//       margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//     >
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis dataKey={filter === "today" ? "date" : filter} />
//       <YAxis />

//       {/* Custom Tooltip */}
//       <Tooltip
//         cursor={{ fill: "rgba(0,0,0,0.1)" }}
//         content={({ active, payload }) => {
//           if (!active || !payload || !payload.length || !hoveredShop) return null;

//           // Find the hovered shop's data in the payload
//           const shopData = payload.find(
//             (p) => p.dataKey === hoveredShop && p.value != null
//           );
//           if (!shopData) return null;

//           return (
//             <div
//               style={{
//                 background: "#fff",
//                 border: "1px solid #e0e0e0",
//                 padding: 8,
//                 borderRadius: 8,
//                 boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
//                 fontSize: 12,
//               }}
//             >
//               <div style={{ fontWeight: 700, marginBottom: 4 }}>{shopData.name}</div>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <span
//                   style={{
//                     display: "inline-block",
//                     width: 10,
//                     height: 10,
//                     background: shopData.fill,
//                     borderRadius: 2,
//                   }}
//                 />
//                 <span>{shopData.name}</span>
//                 <span style={{ marginLeft: "auto" }}>
//                   ₹ {Number(shopData.value || 0).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           );
//         }}
//       />

//       <Legend />

//       {shops.map((shop) => (
//         <Bar
//           key={shop._id}
//           dataKey={shop.shopname}
//           fill={shop.color}
//           radius={[8, 8, 0, 0]}
//           animationDuration={800}
//           onMouseEnter={() => setHoveredShop(shop.shopname)} // track hovered bar
//           onMouseLeave={() => setHoveredShop(null)}
//           opacity={hoveredShop ? (hoveredShop === shop.shopname ? 1 : 0.3) : 1} // highlight hovered bar
//         />
//       ))}
//     </BarChart>
//   </ResponsiveContainer>
// </div>




//       {loading && <div className="loading-overlay">Loading...</div>}
//     </div>
//   );
// }


