// export default function Dashboard() {
//   return <h1 className="text-2xl font-bold">Dashboard</h1>;
// }


// tenant user dashboard. but using manager, mega admin, user 

// i need big container.
// current login shopname title
// 1st inside containter size 904.4 * 181.38
// 1st inside  split 2. 1st part small two container . first one is 404.2*314.76. second one is 404.2*314.76
// first one is two container one is 202.1*157.38 - left top corner - Total products with calculate fetch products, color green shadow. right top corner icon FaBoxOpen . another one is 202.1*157.38 - right top corner total low stock fetch live data color green shadow. left top corner icon FaExclamationTriangle c
// second one is 404.2*314.76 - letf side top corner Totals sales icon FaFileInvoice no of bills. fetch bill. right  side top corner dropdown box. default show today. but options today weekly,month. left side bottm corner bills. right side bottom corner amount
// default today. show today bills counting and today amount sale. same concept for weekly and monthly . container green shadow.
// all container color shodow using hover effect. button color 00A76f 007867 c8fad6.  i need all content responsive on all devices add animation and traction and professinal typology
//

// Inventory Overview and Sales Overview below same width single container - title - recently added involve - show recently last five 5 bills live updated. table calculate. view all text click go to salesbill page /sales navigate
//  recently added involve below same width container. and then this container dived two container. one is low stock last 5 data table format. live upated immediatle.|
//  another container top selling based on qty table format



// ✅ Layout Overview:

// Top Row (Equal Width):

// Left: “Inventory Overview” → (Total Products + Low Stock cards)

// Right: “Sales Overview” → (Total Sales card)

// Second Row (Full Width):

// “Recently Added Invoices” → last 5 sales bills in a table

// Includes a “View All” link → navigates to /sales

// Third Row (Full Width): split into two equal containers

// Left: “Low Stock Products” (last 5, live updated)

// Right: “Top Selling Products” (based on qty, table format)


// // src/pages/Dashboard/TenantDashboard.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import { FaBoxOpen, FaExclamationTriangle, FaFileInvoice, FaChevronDown, FaPlus, FaMinus } from "react-icons/fa";
// import { useAuth } from "../context/AuthContext";
// import apiClient from "../utils/apiClient";
// import { getApiUrl } from "../utils/api";
// import { useNavigate } from "react-router-dom";


// const CARD_BASE_STYLE = "relative bg-white rounded-xl p-4 shadow-sm border";
// const PRIMARY = "#00A76F";
// const PRIMARY_DARK = "#007867";
// const SOFT = "#C8FAD6";

// const cardHover = {
//   scale: 1.02,
//   boxShadow: `0 12px 30px -12px rgba(0,167,111,0.28), 0 6px 18px -10px rgba(0,120,103,0.08)`,
// };

// export default function TenantDashboard() {
//   const { user, token } = useAuth();

//   const shopTitle = user?.shopname || user?.shop || "Current Shop";

//   const [productsCount, setProductsCount] = useState(0);
//   const [lowStockCount, setLowStockCount] = useState(0);
//   const [salesData, setSalesData] = useState({ bills: 0, amount: 0 });
//   const [salesRange, setSalesRange] = useState("today");
//   const [loading, setLoading] = useState({ products: false, lowstock: false, sales: false });
//   const [error, setError] = useState(null);

//   const [recentBills, setRecentBills] = useState([]);
//   const [lowStockBatches, setLowStockBatches] = useState([]);
//   // const [topSelling, setTopSelling] = useState([]);
//   const [totalStock, setTotalStock] = useState(0);
// const [recentLowStock, setRecentLowStock] = useState([]);
// const [loadingLowStock, setLoadingLowStock] = useState(false);
//   const navigate = useNavigate();
//   const [topSelling, setTopSelling] = useState([]);
// const [loadingTopSelling, setLoadingTopSelling] = useState(false);


//   // API endpoints
//   // const PRODUCTS_API = useMemo(() => getApiUrl("products", user), [user]);
//   const PRODUCTS_API = useMemo(() => getApiUrl("product-total", user), [user]);

//   const SALES_API = useMemo(() => getApiUrl("sales-bills", user), [user]);

//   // ----------------------------
//   // Fetch product & low stock counts
//   // ----------------------------
//   useEffect(() => {
//     if (shopTitle) fetchProductsCount();
//   }, [PRODUCTS_API, shopTitle]);

//   useEffect(() => {
//     if (shopTitle) fetchSales(salesRange);
//   }, [SALES_API, salesRange, shopTitle]);

// // const PRODUCTS_API = "/product-total";


// async function fetchProductsCount() {
//   setLoading((s) => ({ ...s, products: true, lowstock: true }));
//   try {
//     const token = user?.token || localStorage.getItem("token");
//     if (!token) throw new Error("No auth token found");

//     const res = await apiClient.get(PRODUCTS_API, {
//       headers: {
//         "x-shopname": shopTitle,
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = res?.data ?? {};

//     setProductsCount(data.totalProducts ?? 0);
//     setTotalStock(data.totalStock ?? 0);
//     setLowStockCount(data.lowStockCount ?? 0);
//     setLowStockBatches(data.lowStockItems ?? []);
//   } catch (err) {
//     console.error("fetchProductsCount error:", err?.response?.data ?? err.message);
//     setError(err?.response?.data?.message || "Failed to load products");
//     setProductsCount(0);
//     setTotalStock(0);
//     setLowStockCount(0);
//     setLowStockBatches([]);
//   } finally {
//     setLoading((s) => ({ ...s, products: false, lowstock: false }));
//   }
// }



//   async function fetchSales(range = "today") {
//     setLoading((s) => ({ ...s, sales: true }));
//     try {
//       const token = user?.token || localStorage.getItem("token");
//       const url = `${SALES_API}/summary?period=${encodeURIComponent(range)}`;
//       const res = await apiClient.get(url, {
//         headers: {
//           "x-shopname": shopTitle,
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const bills = res?.data?.totalBills ?? res?.data?.bills ?? 0;
//       const amount = res?.data?.totalAmount ?? res?.data?.amount ?? 0;
//       setSalesData({ bills: Number(bills), amount: Number(amount) });
//     } catch (err) {
//       console.error("fetchSales error:", err?.response?.data ?? err.message);
//       setError(err?.response?.data?.message || "Failed to load sales");
//       setSalesData({ bills: 0, amount: 0 });
//     } finally {
//       setLoading((s) => ({ ...s, sales: false }));
//     }
//   }


// // Simple date formatter
// const formatDate = (dateStr) => {
//   if (!dateStr) return "-";
//   const date = new Date(dateStr);
//   return date.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };


// async function fetchRecentBills() {
//   try {
//     const token = user?.token || localStorage.getItem("token");
//     const res = await apiClient.get(`${SALES_API}/recent`, {
//       headers: {
//         "x-shopname": shopTitle,
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     setRecentBills(res.data.bills || []);
//   } catch (err) {
//     console.error("fetchRecentBills error:", err?.response?.data ?? err.message);
//   }
// }

// useEffect(() => {
//   if (user && shopTitle) fetchRecentBills();
// }, [user, shopTitle]);


//   const formatCurrency = (n) => {
//     try {
//       return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
//     } catch {
//       return `₹${n.toFixed(2)}`;
//     }
//   };

//   const handleRangeChange = (v) => setSalesRange(v);

// async function fetchRecentLowStock() {
//   setLoadingLowStock(true);
//   try {
//     const token = user?.token || localStorage.getItem("token");
//     const res = await apiClient.get("api/products/low-stock/recent", {
//       headers: { "x-shopname": shopTitle, Authorization: `Bearer ${token}` },
//     });
//     setRecentLowStock(res.data.products || []);
//   } catch (err) {
//     console.error("fetchRecentLowStock error:", err);
//   } finally {
//     setLoadingLowStock(false);
//   }
// }







// useEffect(() => {
//   if (user) fetchRecentLowStock();
// }, [user, shopTitle]);


// async function fetchTopSelling() {
//   setLoadingTopSelling(true);
//   try {
//     const token = user?.token || localStorage.getItem("token");
//     const res = await apiClient.get("api/products/top-selling", {
//       headers: { "x-shopname": shopTitle, Authorization: `Bearer ${token}` },
//     });
//     setTopSelling(res.data.topProducts || []);
//   } catch (err) {
//     console.error("fetchTopSelling error:", err);
//   } finally {
//     setLoadingTopSelling(false);
//   }
// }

// useEffect(() => {
//   fetchTopSelling();
// }, [shopTitle]);

//   return (
//     <div className="tenant-dashboard p-4 md:p-6 space-y-6">  
//       <div className="max-w-full mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold">{shopTitle}</h1>
        
//         </div>

//         {/* === Main Dashboard Grid === */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
//           {/* Total Products & Low Stock Cards */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//             <h2 className="text-lg font-medium mb-4 text-gray-700">Inventory Overview</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    
// <motion.div whileHover={cardHover} className={CARD_BASE_STYLE} style={{ borderColor: SOFT }}>
//   <div className="flex items-start justify-between">
//     <div>
//       <div className="text-xs uppercase tracking-wide text-gray-600">Total Products</div>
//       <div className="mt-3 text-3xl font-semibold" style={{ color: PRIMARY }}>
//         {loading.products ? "..." : productsCount}
//       </div>
//       <div className="mt-1 text-sm text-gray-500">
//         {/* Total Stock: {loading.products ? "..." : totalStock} */}
//       </div>
//     </div>
//     <div
//       className="text-3xl p-3 rounded-md"
//       style={{ borderLeft: `4px solid ${SOFT}`, color: PRIMARY }}
//     >
//       <FaBoxOpen />
//     </div>
//   </div>
// </motion.div>


// <motion.div whileHover={cardHover} className={CARD_BASE_STYLE} style={{ borderColor: SOFT }}>
//   <div className="flex items-start justify-between">
//     <div>
//       <div className="text-xs uppercase tracking-wide text-gray-600">Low Stock</div>
//       <div className="mt-3 text-3xl font-semibold" style={{ color: "red" }}>
//         {loading.lowstock ? "..." : lowStockCount} {/* ✅ Total low stock count */}
//       </div>
//     </div>
//     <div className="text-3xl p-3 rounded-md" style={{ borderLeft: `4px solid ${SOFT}`, color: "red" }}>
//       <FaExclamationTriangle />
//     </div>
//   </div>
// </motion.div>

//             </div>
//           </div>


//           {/* Total Sales Card */}
// {/* Total Sales Card */}
// <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//   <h2 className="text-lg font-medium mb-4 text-gray-700">Sales Overview</h2>

//   <motion.div
//     whileHover={cardHover}
//     className={`${CARD_BASE_STYLE} flex flex-col justify-between`}
//     style={{ borderColor: SOFT }}
//   >
//     <div className="text-xs uppercase tracking-wide text-gray-600">Total Sales</div>
//     {/* Top Row: Total Sales Left, Dropdown Right */}
//     <div className="flex justify-between items-center mb-4">
      
//       {/* Left: Total Sales Amount */}
//       <div className="text-xl md:text-2xl font-bold" style={{ color: PRIMARY }}>
//         {loading.sales ? "..." : formatCurrency(salesData.amount)}
//       </div>

//       {/* Right: Dropdown with Icon */}
//       <div className="flex items-center gap-2">
//         <select
//           value={salesRange}
//           onChange={(e) => handleRangeChange(e.target.value)}
//           className="text-xs border rounded px-2 py-1"
//         >
//           <option value="today">Today</option>
//           <option value="weekly">Weekly</option>
//           <option value="monthly">Monthly</option>
//         </select>
//         {/* <FaChevronDown className="text-gray-400 text-sm" /> */}
//       </div>
//     </div>

//     {/* Center Row: Total Bills with Icon */}
//     <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
//       <FaFileInvoice className="text-primary" style={{ borderLeft: `4px solid ${SOFT}`, color: PRIMARY }} />
//       <span className=" font-bold" style={{ color: PRIMARY }}>{loading.sales ? "..." : `${salesData.bills} Bills`}</span>
//     </div>
//   </motion.div>
// </div>


//         </div>

//         {/* Error display */}
//         {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

//         {/* === Low Stock Products Table with Increment/Decrement === */}
 
//   {/* === Second Row: Recently Added Invoices === */}
//   {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//     <div className="flex justify-between items-center mb-4">
//       <h2 className="text-lg font-medium text-gray-700">Recently Added Invoices</h2>
//       <button onClick={() => navigate("/sales")} className="text-green-600 hover:text-green-800 text-sm font-medium">View All →</button>
//     </div>
//     <table className="w-full border-collapse border text-sm">
//       <thead className="bg-gray-100">
//         <tr>
//           <th className="border px-3 py-2">S.No</th>
//           <th className="border px-3 py-2">Date</th>
//           <th className="border px-3 py-2">Bill No</th>
//           <th className="border px-3 py-2">Customer</th>
//           <th className="border px-3 py-2 text-right">Net Amount</th>
//         </tr>
//       </thead>
//       <tbody>
//         {recentBills.slice(0,5).map((bill,i) => (
//           <tr key={bill._id} className="hover:bg-gray-50">
//             <td className="border px-3 py-2">{i+1}</td>
//             <td className="border px-3 py-2">{formatDate(bill.date)}</td>
//             <td className="border px-3 py-2">{bill.billNo}</td>
//             <td className="border px-3 py-2">{bill.customerName}</td>
//             <td className="border px-3 py-2 text-right">₹{bill.netAmount}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div> */}

//   <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//   <div className="flex justify-between items-center mb-4">
//     <h2 className="text-lg font-medium text-gray-700">Recently Added Invoices</h2>
//     <button onClick={() => navigate("/sales")} className="text-green-600 hover:text-green-800 text-sm font-medium">
//       View All →
//     </button>
//   </div>
//   <table className="w-full border-collapse border text-sm">
//     <thead className="bg-gray-100">
//       <tr>
//         <th className="border px-3 py-2">S.No</th>
//         <th className="border px-3 py-2">Date</th>
//         <th className="border px-3 py-2">Bill No</th>
//         <th className="border px-3 py-2">Customer</th>
//         <th className="border px-3 py-2 text-right">Net Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       {recentBills.map((bill, i) => (
//         <tr key={bill._id} className="hover:bg-gray-50">
//           <td className="border px-3 py-2">{i + 1}</td>
//           <td className="border px-3 py-2">{formatDate(bill.date)}</td>
//           <td className="border px-3 py-2">{bill.billNo}</td>
//           <td className="border px-3 py-2">{bill.customerName}</td>
//           <td className="border px-3 py-2 text-right">₹{bill.netAmount}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>


//   {/* === Third Row: Low Stock + Top Selling === */}
//   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//     {/* Low Stock Products */}
//     {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//       <h2 className="text-lg font-medium mb-4 text-gray-700">Low Stock Products</h2>
//       <table className="w-full border-collapse border text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-3 py-2">S.No</th>
//             <th className="border px-3 py-2">Product</th>
//             <th className="border px-3 py-2">Batch</th>
//             <th className="border px-3 py-2 text-right">Qty</th>
//             <th className="border px-3 py-2 text-right">Min Qty</th>
//           </tr>
//         </thead>
//         <tbody>
//           {lowStockBatches.slice(0,5).map((p,i) => (
//             <tr key={p._id} className="hover:bg-gray-50">
//               <td className="border px-3 py-2">{i+1}</td>
//               <td className="border px-3 py-2">{p.name}</td>
//               <td className="border px-3 py-2">{p.batchNo}</td>
//               <td className="border px-3 py-2 text-right">{p.qty}</td>
//               <td className="border px-3 py-2 text-right">{p.minQty}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div> */}

// <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//   <div className="flex justify-between items-center mb-4">
//     <h2 className="text-lg font-medium text-gray-700">Low Stock Products</h2>
//     <button
//       onClick={() => navigate("/stock/min-qty")}
//       className="text-green-600 hover:text-green-800 text-sm font-medium"
//     >
//       View All →
//     </button>
//   </div>

//   <table className="w-full border-collapse border text-sm">
//     <thead className="bg-gray-100">
//       <tr>
//         <th className="border px-3 py-2">S.No</th>
//         <th className="border px-3 py-2">Product</th>
//         <th className="border px-3 py-2">Batch</th>
//         <th className="border px-3 py-2 text-right">Qty</th>
//         <th className="border px-3 py-2 text-right">Min Qty</th>
//         {/* <th className="border px-3 py-2 text-center">Actions</th> */}
//       </tr>
//     </thead>

//     <tbody>
//       {recentLowStock.map((p, i) => (
//         <tr key={p._id} className="hover:bg-gray-50">
//           <td className="border px-3 py-2">{i + 1}</td>
//           <td className="border px-3 py-2">{p.name}</td>
//           <td className="border px-3 py-2">{p.batchNo}</td>
//           <td className="border px-3 py-2 text-right">{p.qty}</td>
//           <td className="border px-3 py-2 text-right text-red-600">{p.minQty}</td>

//           {/* <td className="border px-3 py-2 text-center space-x-2">
//             <button
//               onClick={() => handleIncrement(p)}
//               className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
//             >
//               +
//             </button>
//             <button
//               onClick={() => handleDecrement(p)}
//               className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
//             >
//               −
//             </button>
//           </td> */}
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>





//     {/* Top Selling Products */}
//     <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//       <h2 className="text-lg font-medium mb-4 text-gray-700">Top Selling Products</h2>
//       <table className="w-full border-collapse border text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-3 py-2">S.No</th>
//             <th className="border px-3 py-2">Product</th>
//             <th className="border px-3 py-2 text-right">Qty Sold</th>
//             <th className="border px-3 py-2 text-right">Sales Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {topSelling.slice(0,5).map((p,i) => (
//             <tr key={p._id} className="hover:bg-gray-50">
//               <td className="border px-3 py-2">{i+1}</td>
//               <td className="border px-3 py-2">{p.name}</td>
//               <td className="border px-3 py-2 text-right">{p.totalQty}</td>
//               <td className="border px-3 py-2 text-right">₹{p.totalSales}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>

//   </div>

//       </div>
//     </div>


//   );
// }

// src/pages/Dashboard/TenantDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaBoxOpen, FaExclamationTriangle, FaFileInvoice, FaChevronDown, FaPlus, FaMinus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import { getApiUrl } from "../utils/api";
import { useNavigate } from "react-router-dom";


const CARD_BASE_STYLE = "relative bg-white rounded-xl p-4 shadow-sm border";
const PRIMARY = "#00A76F";
const PRIMARY_DARK = "#007867";
const SOFT = "#C8FAD6";

const cardHover = {
  scale: 1.02,
  boxShadow: `0 12px 30px -12px rgba(0,167,111,0.28), 0 6px 18px -10px rgba(0,120,103,0.08)`,
};

export default function TenantDashboard() {
  const { user, token } = useAuth();

  const shopTitle = user?.shopname || user?.shop || "Current Shop";

  const [productsCount, setProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [salesData, setSalesData] = useState({ bills: 0, amount: 0 });
  const [salesRange, setSalesRange] = useState("today");
  const [loading, setLoading] = useState({ products: false, lowstock: false, sales: false });
  const [error, setError] = useState(null);

  const [recentBills, setRecentBills] = useState([]);
  const [lowStockBatches, setLowStockBatches] = useState([]);
  // const [topSelling, setTopSelling] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
const [recentLowStock, setRecentLowStock] = useState([]);
const [loadingLowStock, setLoadingLowStock] = useState(false);
  const navigate = useNavigate();
  const [topSelling, setTopSelling] = useState([]);
const [loadingTopSelling, setLoadingTopSelling] = useState(false);


  // API endpoints
  // const PRODUCTS_API = useMemo(() => getApiUrl("products", user), [user]);
  const PRODUCTS_API = useMemo(() => getApiUrl("product-total", user), [user]);

  const SALES_API = useMemo(() => getApiUrl("sales-bills", user), [user]);


  const LOW_STOCK_API = useMemo(() => getApiUrl("products/low-stock/recent", user), [user]);
const TOP_SELLING_API = useMemo(() => getApiUrl("products/top-selling", user), [user]);


  // ----------------------------
  // Fetch product & low stock counts
  // ----------------------------
  useEffect(() => {
    if (shopTitle) fetchProductsCount();
  }, [PRODUCTS_API, shopTitle]);

  useEffect(() => {
    if (shopTitle) fetchSales(salesRange);
  }, [SALES_API, salesRange, shopTitle]);

// const PRODUCTS_API = "/product-total";


async function fetchProductsCount() {
  setLoading((s) => ({ ...s, products: true, lowstock: true }));
  try {
    const token = user?.token || localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const res = await apiClient.get(PRODUCTS_API, {
      headers: {
        "x-shopname": shopTitle,
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res?.data ?? {};

    setProductsCount(data.totalProducts ?? 0);
    setTotalStock(data.totalStock ?? 0);
    setLowStockCount(data.lowStockCount ?? 0);
    setLowStockBatches(data.lowStockItems ?? []);
  } catch (err) {
    console.error("fetchProductsCount error:", err?.response?.data ?? err.message);
    setError(err?.response?.data?.message || "Failed to load products");
    setProductsCount(0);
    setTotalStock(0);
    setLowStockCount(0);
    setLowStockBatches([]);
  } finally {
    setLoading((s) => ({ ...s, products: false, lowstock: false }));
  }
}



  async function fetchSales(range = "today") {
    setLoading((s) => ({ ...s, sales: true }));
    try {
      const token = user?.token || localStorage.getItem("token");
      const url = `${SALES_API}/summary?period=${encodeURIComponent(range)}`;
      const res = await apiClient.get(url, {
        headers: {
          "x-shopname": shopTitle,
          Authorization: `Bearer ${token}`,
        },
      });

      const bills = res?.data?.totalBills ?? res?.data?.bills ?? 0;
      const amount = res?.data?.totalAmount ?? res?.data?.amount ?? 0;
      setSalesData({ bills: Number(bills), amount: Number(amount) });
    } catch (err) {
      console.error("fetchSales error:", err?.response?.data ?? err.message);
      setError(err?.response?.data?.message || "Failed to load sales");
      setSalesData({ bills: 0, amount: 0 });
    } finally {
      setLoading((s) => ({ ...s, sales: false }));
    }
  }


// Simple date formatter
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


async function fetchRecentBills() {
  try {
    const token = user?.token || localStorage.getItem("token");
    const res = await apiClient.get(`${SALES_API}/recent`, {
      headers: {
        "x-shopname": shopTitle,
        Authorization: `Bearer ${token}`,
      },
    });
    setRecentBills(res.data.bills || []);
  } catch (err) {
    console.error("fetchRecentBills error:", err?.response?.data ?? err.message);
  }
}

useEffect(() => {
  if (user && shopTitle) fetchRecentBills();
}, [user, shopTitle]);


  const formatCurrency = (n) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
    } catch {
      return `₹${n.toFixed(2)}`;
    }
  };

  const handleRangeChange = (v) => setSalesRange(v);

// async function fetchRecentLowStock() {
//   setLoadingLowStock(true);
//   try {
//     const token = user?.token || localStorage.getItem("token");
//     const res = await apiClient.get("api/products/low-stock/recent", {
//       headers: { "x-shopname": shopTitle, Authorization: `Bearer ${token}` },
//     });
//     setRecentLowStock(res.data.products || []);
//   } catch (err) {
//     console.error("fetchRecentLowStock error:", err);
//   } finally {
//     setLoadingLowStock(false);
//   }
// }







useEffect(() => {
  if (user) fetchRecentLowStock();
}, [user, shopTitle]);


// async function fetchTopSelling() {
//   setLoadingTopSelling(true);
//   try {
//     const token = user?.token || localStorage.getItem("token");
//     const res = await apiClient.get("api/products/top-selling", {
//       headers: { "x-shopname": shopTitle, Authorization: `Bearer ${token}` },
//     });
//     setTopSelling(res.data.topProducts || []);
//   } catch (err) {
//     console.error("fetchTopSelling error:", err);
//   } finally {
//     setLoadingTopSelling(false);
//   }
// }
async function fetchRecentLowStock() {
  setLoadingLowStock(true);
  try {
    const token = user?.token || localStorage.getItem("token");
    const res = await apiClient.get(LOW_STOCK_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecentLowStock(res.data.products || []);
  } catch (err) {
    console.error("fetchRecentLowStock error:", err?.response?.data ?? err.message);
  } finally {
    setLoadingLowStock(false);
  }
}

async function fetchTopSelling() {
  setLoadingTopSelling(true);
  try {
    const token = user?.token || localStorage.getItem("token");
    const res = await apiClient.get(TOP_SELLING_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTopSelling(res.data.topProducts || []);
  } catch (err) {
    console.error("fetchTopSelling error:", err?.response?.data ?? err.message);
  } finally {
    setLoadingTopSelling(false);
  }
}


useEffect(() => {
  fetchTopSelling();
}, [shopTitle]);

  return (
    <div className="tenant-dashboard p-4 md:p-6 space-y-6">  
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">{shopTitle}</h1>
        
        </div>

        {/* === Main Dashboard Grid === */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Total Products & Low Stock Cards */}
          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Inventory Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    
<motion.div whileHover={cardHover} className={CARD_BASE_STYLE} style={{ borderColor: SOFT }}>
  <div className="flex items-start justify-between">
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-600">Total Products</div>
      <div className="mt-3 text-3xl font-semibold" style={{ color: PRIMARY }}>
        {loading.products ? "..." : productsCount}
      </div>
      <div className="mt-1 text-sm text-gray-500">
     
      </div>
    </div>
    <div
      className="text-3xl p-3 rounded-md"
      style={{ borderLeft: `4px solid ${SOFT}`, color: PRIMARY }}
    >
      <FaBoxOpen />
    </div>
  </div>
</motion.div>


<motion.div whileHover={cardHover} className={CARD_BASE_STYLE} style={{ borderColor: SOFT }}>
  <div className="flex items-start justify-between">
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-600">Low Stock</div>
      <div className="mt-3 text-3xl font-semibold" style={{ color: "red" }}>
        {loading.lowstock ? "..." : lowStockCount} 
      </div>
    </div>
    <div className="text-3xl p-3 rounded-md" style={{ borderLeft: `4px solid ${SOFT}`, color: "red" }}>
      <FaExclamationTriangle />
    </div>
  </div>
</motion.div>

            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

  {/* Total Products Card */}
  <motion.div 
    whileHover={cardHover} 
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center"
    style={{ borderColor: SOFT }}
  >
    <div className="text-xs uppercase tracking-wide text-gray-600">Total Products</div>
    <div className="mt-3 text-3xl font-semibold" style={{ color: PRIMARY }}>
      {loading.products ? "..." : productsCount}
    </div>
    <div className="mt-3 text-3xl" style={{ color: PRIMARY }}>
      <FaBoxOpen />
    </div>
  </motion.div>

  {/* Low Stock Card */}
  <motion.div 
    whileHover={cardHover} 
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center"
    style={{ borderColor: SOFT }}
  >
    <div className="text-xs uppercase tracking-wide text-gray-600">Low Stock</div>
    <div className="mt-3 text-3xl font-semibold text-red-500">
      {loading.lowstock ? "..." : lowStockCount}
    </div>
    <div className="mt-3 text-3xl text-red-500">
      <FaExclamationTriangle />
    </div>
  </motion.div>

</div>



          {/* Total Sales Card */}
{/* Total Sales Card */}
{/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ">
  <h2 className="text-lg font-medium mb-4 text-gray-700">Sales Overview</h2>

  <motion.div
    whileHover={cardHover}
    className={`${CARD_BASE_STYLE} flex flex-col justify-between`}
    style={{ borderColor: SOFT }}
  >
    <div className="text-xs uppercase tracking-wide text-gray-600">Total Sales</div>
  
    <div className="flex justify-between items-center mb-4">
      
    
      <div className="text-xl md:text-2xl font-bold" style={{ color: PRIMARY }}>
        {loading.sales ? "..." : formatCurrency(salesData.amount)}
      </div>

    
      <div className="flex items-center gap-2">
        <select
          value={salesRange}
          onChange={(e) => handleRangeChange(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="today">Today</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      
      </div>
    </div>

    <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
      <FaFileInvoice className="text-primary" style={{ borderLeft: `4px solid ${SOFT}`, color: PRIMARY }} />
      <span className=" font-bold" style={{ color: PRIMARY }}>{loading.sales ? "..." : `${salesData.bills} Bills`}</span>
    </div>
  </motion.div>
</div> */}

<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative">
  {/* Top Row: Label */}
  <div className="text-xs uppercase tracking-wide text-gray-600 mb-6">
    Total Sales
  </div>

  {/* Dropdown positioned in top-right corner */}
  <div className="absolute top-4 right-4">
    <select
      value={salesRange}
      onChange={(e) => handleRangeChange(e.target.value)}
      className="text-xs border rounded px-2 py-1"
    >
      <option value="today">Today</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  </div>

  {/* Center Content: Amount + Bills */}
  <motion.div
    whileHover={cardHover}
    className="flex flex-col items-center justify-center gap-4"
  >
    {/* Amount */}
    <div className="text-3xl md:text-4xl font-bold" style={{ color: PRIMARY }}>
      {loading.sales ? "..." : formatCurrency(salesData.amount)}
    </div>

    {/* Bills with Icon */}
    <div className="flex items-center gap-2 text-gray-600 font-medium">
      <FaFileInvoice className="text-primary" style={{ color: PRIMARY }} />
      <span style={{ color: PRIMARY }}>
        {loading.sales ? "..." : `${salesData.bills} Bills`}
      </span>
    </div>
  </motion.div>
</div>



        </div>

        {/* Error display */}
        {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

        {/* === Low Stock Products Table with Increment/Decrement === */}
 
  {/* === Second Row: Recently Added Invoices === */}
  {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium text-gray-700">Recently Added Invoices</h2>
      <button onClick={() => navigate("/sales")} className="text-green-600 hover:text-green-800 text-sm font-medium">View All →</button>
    </div>
    <table className="w-full border-collapse border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-3 py-2">S.No</th>
          <th className="border px-3 py-2">Date</th>
          <th className="border px-3 py-2">Bill No</th>
          <th className="border px-3 py-2">Customer</th>
          <th className="border px-3 py-2 text-right">Net Amount</th>
        </tr>
      </thead>
      <tbody>
        {recentBills.slice(0,5).map((bill,i) => (
          <tr key={bill._id} className="hover:bg-gray-50">
            <td className="border px-3 py-2">{i+1}</td>
            <td className="border px-3 py-2">{formatDate(bill.date)}</td>
            <td className="border px-3 py-2">{bill.billNo}</td>
            <td className="border px-3 py-2">{bill.customerName}</td>
            <td className="border px-3 py-2 text-right">₹{bill.netAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div> */}

  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-medium text-gray-700">Recently Added Invoices</h2>
    <button onClick={() => navigate("/sales")} className="text-green-600 hover:text-green-800 text-sm font-medium">
      View All →
    </button>
  </div>
  <table className="w-full border-collapse border text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-3 py-2">S.No</th>
        <th className="border px-3 py-2">Date</th>
        <th className="border px-3 py-2">Bill No</th>
        <th className="border px-3 py-2">Customer</th>
        <th className="border px-3 py-2 text-right">Net Amount</th>
      </tr>
    </thead>
    <tbody>
      {recentBills.map((bill, i) => (
        <tr key={bill._id} className="hover:bg-gray-50">
          <td className="border px-3 py-2">{i + 1}</td>
          <td className="border px-3 py-2">{formatDate(bill.date)}</td>
          <td className="border px-3 py-2">{bill.billNo}</td>
          <td className="border px-3 py-2">{bill.customerName}</td>
          <td className="border px-3 py-2 text-right">₹{bill.netAmount}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


  {/* === Third Row: Low Stock + Top Selling === */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

    {/* Low Stock Products */}
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-medium text-gray-700">Low Stock Products</h2>
    <button
      onClick={() => navigate("/stock/min-qty")}
      className="text-green-600 hover:text-green-800 text-sm font-medium"
    >
      View All →
    </button>
  </div>

  <table className="w-full border-collapse border text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-3 py-2">S.No</th>
        <th className="border px-3 py-2">Product</th>
        <th className="border px-3 py-2">Batch</th>
        <th className="border px-3 py-2 text-right">Qty</th>
        <th className="border px-3 py-2 text-right">Min Qty</th>
        {/* <th className="border px-3 py-2 text-center">Actions</th> */}
      </tr>
    </thead>

    <tbody>
      {recentLowStock.map((p, i) => (
        <tr key={p._id} className="hover:bg-gray-50">
          <td className="border px-3 py-2">{i + 1}</td>
          <td className="border px-3 py-2">{p.name}</td>
          <td className="border px-3 py-2">{p.batchNo}</td>
          <td className="border px-3 py-2 text-right text-red-600">{p.qty}</td>
          <td className="border px-3 py-2 text-right ">{p.minQty}</td>

          {/* <td className="border px-3 py-2 text-center space-x-2">
            <button
              onClick={() => handleIncrement(p)}
              className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              +
            </button>
            <button
              onClick={() => handleDecrement(p)}
              className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              −
            </button>
          </td> */}
        </tr>
      ))}
    </tbody>
  </table>
</div>





    {/* Top Selling Products */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ">
      <h2 className="text-lg font-medium mb-4 text-gray-700">Top Selling Products</h2>
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">S.No</th>
            <th className="border px-3 py-2">Product</th>
            <th className="border px-3 py-2 text-right">Qty Sold</th>
            <th className="border px-3 py-2 text-right">Sales Value</th>
          </tr>
        </thead>
        <tbody>
          {topSelling.slice(0,5).map((p,i) => (
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{i+1}</td>
              <td className="border px-3 py-2">{p.name}</td>
              <td className="border px-3 py-2 text-right">{p.totalQty}</td>
              <td className="border px-3 py-2 text-right">₹{p.totalSales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>

      </div>
    </div>


  );
}




// // src/pages/Dashboard/TenantDashboard.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import { FaBoxOpen, FaExclamationTriangle, FaFileInvoice } from "react-icons/fa";
// import { useAuth } from "../context/AuthContext";
// import apiClient from "../utils/apiClient";
// import { getApiUrl } from "../utils/api";
// import { useNavigate } from "react-router-dom";
// import { useShop } from "../context/ShopContext"; // adjust path if needed
// import axios from "axios";


// const CARD_BASE_STYLE = "relative bg-white rounded-xl p-4 shadow-sm border";
// const PRIMARY = "#00A76F";
// const PRIMARY_DARK = "#007867";
// const SOFT = "#C8FAD6";

// const cardHover = {
//   scale: 1.02,
//   boxShadow: `0 12px 30px -12px rgba(0,167,111,0.28), 0 6px 18px -10px rgba(0,120,103,0.08)`,
// };

// export default function TenantDashboard() {
//   const { user } = useAuth();
//     const { token } = useAuth();
// const { shop } = useShop();
//   const navigate = useNavigate();

//   const shopTitle = user?.shopname || user?.shop || "Current Shop";

//   // ---------------- State ----------------
//   const [productsCount, setProductsCount] = useState(0);
//   const [lowStockCount, setLowStockCount] = useState(0);
//   const [totalStock, setTotalStock] = useState(0);
//   const [lowStockBatches, setLowStockBatches] = useState([]);
//   const [recentBills, setRecentBills] = useState([]);
//   const [recentLowStock, setRecentLowStock] = useState([]);
//   const [topSelling, setTopSelling] = useState([]);
//   const [salesData, setSalesData] = useState({ bills: 0, amount: 0 });
//   const [salesRange, setSalesRange] = useState("today");
//   const [loading, setLoading] = useState({
//     products: false,
//     lowstock: false,
//     sales: false,
//   });
//   const [loadingLowStock, setLoadingLowStock] = useState(false);
//   const [loadingTopSelling, setLoadingTopSelling] = useState(false);
//   const [error, setError] = useState(null);

//     const [lowStock, setLowStock] = useState([]);
  





//   // ---------------- API Endpoints ----------------
//   const PRODUCTS_API = useMemo(() => getApiUrl("product-total", user), [user]);
//   const SALES_API = useMemo(() => getApiUrl("sales-bills", user), [user]);
//   const LOW_STOCK_API = useMemo(() => getApiUrl("products/low-stock/recent", user), [user]);
//   const TOP_SELLING_API = useMemo(() => getApiUrl("products/top-selling", user), [user]);

//   // ---------------- Fetch Functions ----------------

//   async function fetchProductsCount() {
//     setLoading((s) => ({ ...s, products: true, lowstock: true }));
//     try {
//       const token = user?.token || localStorage.getItem("token");
//       if (!token) throw new Error("No auth token found");

//       const res = await apiClient.get(PRODUCTS_API, {
//         headers: {
//           "x-shopname": shopTitle,
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = res?.data ?? {};
//       setProductsCount(data.totalProducts ?? 0);
//       setTotalStock(data.totalStock ?? 0);
//       setLowStockCount(data.lowStockCount ?? 0);
//       setLowStockBatches(data.lowStockItems ?? []);
//     } catch (err) {
//       console.error("fetchProductsCount error:", err?.response?.data ?? err.message);
//       setError(err?.response?.data?.message || "Failed to load products");
//       setProductsCount(0);
//       setTotalStock(0);
//       setLowStockCount(0);
//       setLowStockBatches([]);
//     } finally {
//       setLoading((s) => ({ ...s, products: false, lowstock: false }));
//     }
//   }

//   async function fetchSales(range = "today") {
//     setLoading((s) => ({ ...s, sales: true }));
//     try {
//       const token = user?.token || localStorage.getItem("token");
//       const url = `${SALES_API}/summary?period=${encodeURIComponent(range)}`;

//       const res = await apiClient.get(url, {
//         headers: {
//           "x-shopname": shopTitle,
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const bills = res?.data?.totalBills ?? res?.data?.bills ?? 0;
//       const amount = res?.data?.totalAmount ?? res?.data?.amount ?? 0;
//       setSalesData({ bills: Number(bills), amount: Number(amount) });
//     } catch (err) {
//       console.error("fetchSales error:", err?.response?.data ?? err.message);
//       setError(err?.response?.data?.message || "Failed to load sales");
//       setSalesData({ bills: 0, amount: 0 });
//     } finally {
//       setLoading((s) => ({ ...s, sales: false }));
//     }
//   }

//   async function fetchRecentBills() {
//     try {
//       const token = user?.token || localStorage.getItem("token");
//       const res = await apiClient.get(`${SALES_API}/recent`, {
//         headers: {
//           "x-shopname": shopTitle,
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setRecentBills(res.data.bills || []);
//     } catch (err) {
//       console.error("fetchRecentBills error:", err?.response?.data ?? err.message);
//     }
//   }

//   // async function fetchRecentLowStock() {
//   //   setLoadingLowStock(true);
//   //   try {
//   //     const token = user?.token || localStorage.getItem("token");
//   //     const res = await apiClient.get(LOW_STOCK_API, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
//   //     setRecentLowStock(res.data.products || []);
//   //   } catch (err) {
//   //     console.error("fetchRecentLowStock error:", err?.response?.data ?? err.message);
//   //   } finally {
//   //     setLoadingLowStock(false);
//   //   }
//   // }

//   // async function fetchTopSelling() {
//   //   setLoadingTopSelling(true);
//   //   try {
//   //     const token = user?.token || localStorage.getItem("token");
//   //     const res = await apiClient.get(TOP_SELLING_API, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
//   //     setTopSelling(res.data.topProducts || []);
//   //   } catch (err) {
//   //     console.error("fetchTopSelling error:", err?.response?.data ?? err.message);
//   //   } finally {
//   //     setLoadingTopSelling(false);
//   //   }
//   // }

//   // ---------------- useEffects ----------------
 
 
 
 
//   // useEffect(() => {
//   //   if (!token || !shopname) return;

//   //   fetchRecentLowStock();
//   //   fetchTopSelling();
//   // }, [token, shopname]);

//   // const fetchRecentLowStock = async () => {
//   //   try {
//   //     const res = await axios.get(
//   //       `/api/shops/${shopname}/products/low-stock/recent`,
//   //       {
//   //         headers: { Authorization: `Bearer ${token}` },
//   //       }
//   //     );
//   //     setLowStock(res.data);
//   //   } catch (err) {
//   //     console.error("fetchRecentLowStock error:", err.response?.data || err.message);
//   //   }
//   // };

//   // const fetchTopSelling = async () => {
//   //   try {
//   //     const res = await axios.get(
//   //       `/api/shops/${shopname}/products/top-selling`,
//   //       {
//   //         headers: { Authorization: `Bearer ${token}` },
//   //       }
//   //     );
//   //     setTopSelling(res.data);
//   //   } catch (err) {
//   //     console.error("fetchTopSelling error:", err.response?.data || err.message);
//   //   }
//   // };
//   // useEffect(() => {
//   //   if (!token || !shopname) return;

//   //   fetchRecentLowStock();
//   //   fetchTopSelling();
//   // }, [token, shopname]);


// const fetchRecentLowStock = async () => {
//   if (!shop?.shopname) return;
//   try {
//     const res = await axios.get(`/api/shops/${shop.shopname}/products/low-stock/recent`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setRecentLowStock(Array.isArray(res.data) ? res.data : []);
//   } catch (err) {
//     console.error("fetchRecentLowStock error:", err);
//   }
// };

// const fetchTopSelling = async () => {
//   if (!shop?.shopname) return;
//   try {
//     const res = await axios.get(`/api/shops/${shop.shopname}/products/top-selling`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setTopSelling(Array.isArray(res.data) ? res.data : []);
//   } catch (err) {
//     console.error("fetchTopSelling error:", err);
//   }
// };

// // Call them once shop is loaded
// useEffect(() => {
//   fetchRecentLowStock();
//   fetchTopSelling();
// }, [shop, token]);
  
//   useEffect(() => {
//     if (shopTitle) fetchProductsCount();
//   }, [PRODUCTS_API, shopTitle]);

//   useEffect(() => {
//     if (shopTitle) fetchSales(salesRange);
//   }, [SALES_API, salesRange, shopTitle]);

//   useEffect(() => {
//     if (user && shopTitle) fetchRecentBills();
//   }, [user, shopTitle]);

//   useEffect(() => {
//     if (user) fetchRecentLowStock();
//   }, [user, shopTitle]);

//   useEffect(() => {
//     fetchTopSelling();
//   }, [shopTitle]);

//   // ---------------- Helpers ----------------
//   const formatCurrency = (n) => {
//     try {
//       return new Intl.NumberFormat("en-IN", {
//         style: "currency",
//         currency: "INR",
//         maximumFractionDigits: 2,
//       }).format(n);
//     } catch {
//       return `₹${n.toFixed(2)}`;
//     }
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "-";
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const handleRangeChange = (v) => setSalesRange(v);

//   // ---------------- JSX ----------------
//   return (
//     <div className="tenant-dashboard p-4 md:p-6 space-y-6">
//       <div className="max-w-full mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold">{shopTitle}</h1>
//         </div>

//         {/* === Main Dashboard Grid === */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Total Products & Low Stock Cards */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//             <h2 className="text-lg font-medium mb-4 text-gray-700">Inventory Overview</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <motion.div whileHover={cardHover} className={CARD_BASE_STYLE} style={{ borderColor: SOFT }}>
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className="text-xs uppercase tracking-wide text-gray-600">Total Products</div>
//                     <div className="mt-3 text-3xl font-semibold" style={{ color: PRIMARY }}>
//                       {loading.products ? "..." : productsCount}
//                     </div>
//                   </div>
//                   <div
//                     className="text-3xl p-3 rounded-md"
//                     style={{ borderLeft: `4px solid ${SOFT}`, color: PRIMARY }}
//                   >
//                     <FaBoxOpen />
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div whileHover={cardHover} className={CARD_BASE_STYLE} style={{ borderColor: SOFT }}>
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className="text-xs uppercase tracking-wide text-gray-600">Low Stock</div>
//                     <div className="mt-3 text-3xl font-semibold" style={{ color: "red" }}>
//                       {loading.lowstock ? "..." : lowStockCount}
//                     </div>
//                   </div>
//                   <div className="text-3xl p-3 rounded-md" style={{ borderLeft: `4px solid ${SOFT}`, color: "red" }}>
//                     <FaExclamationTriangle />
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </div>

//           {/* Total Sales Card */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//             <h2 className="text-lg font-medium mb-4 text-gray-700">Sales Overview</h2>

//             <motion.div
//               whileHover={cardHover}
//               className={`${CARD_BASE_STYLE} flex flex-col justify-between`}
//               style={{ borderColor: SOFT }}
//             >
//               <div className="text-xs uppercase tracking-wide text-gray-600">Total Sales</div>
//               <div className="flex justify-between items-center mb-4">
//                 <div className="text-xl md:text-2xl font-bold" style={{ color: PRIMARY }}>
//                   {loading.sales ? "..." : formatCurrency(salesData.amount)}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <select
//                     value={salesRange}
//                     onChange={(e) => handleRangeChange(e.target.value)}
//                     className="text-xs border rounded px-2 py-1"
//                   >
//                     <option value="today">Today</option>
//                     <option value="weekly">Weekly</option>
//                     <option value="monthly">Monthly</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
//                 <FaFileInvoice className="text-primary" style={{ color: PRIMARY }} />
//                 <span className="font-bold" style={{ color: PRIMARY }}>
//                   {loading.sales ? "..." : `${salesData.bills} Bills`}
//                 </span>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         {/* Error display */}
//         {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

//         {/* === Recently Added Invoices === */}
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-medium text-gray-700">Recently Added Invoices</h2>
//             <button
//               onClick={() => navigate("/sales")}
//               className="text-green-600 hover:text-green-800 text-sm font-medium"
//             >
//               View All →
//             </button>
//           </div>
//           <table className="w-full border-collapse border text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-3 py-2">S.No</th>
//                 <th className="border px-3 py-2">Date</th>
//                 <th className="border px-3 py-2">Bill No</th>
//                 <th className="border px-3 py-2">Customer</th>
//                 <th className="border px-3 py-2 text-right">Net Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentBills.map((bill, i) => (
//                 <tr key={bill._id} className="hover:bg-gray-50">
//                   <td className="border px-3 py-2">{i + 1}</td>
//                   <td className="border px-3 py-2">{formatDate(bill.date)}</td>
//                   <td className="border px-3 py-2">{bill.billNo}</td>
//                   <td className="border px-3 py-2">{bill.customerName}</td>
//                   <td className="border px-3 py-2 text-right">₹{bill.netAmount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* === Low Stock & Top Selling Products === */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Low Stock Products */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-medium text-gray-700">Low Stock Products</h2>
//               <button
//                 onClick={() => navigate("/stock/min-qty")}
//                 className="text-green-600 hover:text-green-800 text-sm font-medium"
//               >
//                 View All →
//               </button>
//             </div>
//             <table className="w-full border-collapse border text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="border px-3 py-2">S.No</th>
//                   <th className="border px-3 py-2">Product</th>
//                   <th className="border px-3 py-2">Batch</th>
//                   <th className="border px-3 py-2 text-right">Qty</th>
//                   <th className="border px-3 py-2 text-right">Min Qty</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentLowStock.map((p, i) => (
//                   <tr key={p._id} className="hover:bg-gray-50">
//                     <td className="border px-3 py-2">{i + 1}</td>
//                     <td className="border px-3 py-2">{p.name}</td>
//                     <td className="border px-3 py-2">{p.batchNo}</td>
//                     <td className="border px-3 py-2 text-right">{p.qty}</td>
//                     <td className="border px-3 py-2 text-right text-red-600">{p.minQty}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Top Selling Products */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//             <h2 className="text-lg font-medium mb-4 text-gray-700">Top Selling Products</h2>
//             <table className="w-full border-collapse border text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="border px-3 py-2">S.No</th>
//                   <th className="border px-3 py-2">Product</th>
//                   <th className="border px-3 py-2 text-right">Qty Sold</th>
//                   <th className="border px-3 py-2 text-right">Sales Value</th>
//                 </tr>
//               </thead>
//              <tbody>
//   {Array.isArray(topSelling) && topSelling.slice(0, 5).map((p, i) => (
//     <tr key={p._id || i} className="hover:bg-gray-50">
//       <td className="border px-3 py-2">{i + 1}</td>
//       <td className="border px-3 py-2">{p.name}</td>
//       <td className="border px-3 py-2 text-right">{p.totalQty}</td>
//       <td className="border px-3 py-2 text-right">₹{p.totalSales}</td>
//     </tr>
//   ))}

//   {/* Optional: show placeholder if empty */}
//   {!Array.isArray(topSelling) || topSelling.length === 0 ? (
//     <tr>
//       <td colSpan={4} className="border px-3 py-2 text-center">
//         No top-selling products found
//       </td>
//     </tr>
//   ) : null}
// </tbody>

//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
