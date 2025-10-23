


// src/pages/master/sidebar/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBoxOpen, FaExclamationTriangle, FaFileInvoice } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useShop } from "../../../context/ShopContext";
import apiClient from "../../../utils/apiClient";
import { useNavigate } from "react-router-dom";

const PRIMARY = "#00A76F";
const SOFT = "#C8FAD6";

const cardHover = {
  scale: 1.02,
  boxShadow: `0 12px 30px -12px rgba(0,167,111,0.28), 0 6px 18px -10px rgba(0,120,103,0.08)`,
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const { selectedShop } = useShop();
  const navigate = useNavigate();

  const [productsCount, setProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [salesData, setSalesData] = useState({ bills: 0, amount: 0 });
  const [salesRange, setSalesRange] = useState("today");
  const [loading, setLoading] = useState({ products: false, lowstock: false, sales: false });
  const [error, setError] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [recentLowStock, setRecentLowStock] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [totalStock, setTotalStock] = useState(0);

  const shopName = selectedShop?.shopname?.trim();
  const token = user?.token || localStorage.getItem("token");

  // ----------------------------
  // Scroll to top when shop changes
  // ----------------------------
  useEffect(() => {
    if (selectedShop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedShop]);

  // ----------------------------
  // Fetch functions
  // ----------------------------
  const fetchProductsCount = async () => {
    if (!shopName) return;
    setLoading(s => ({ ...s, products: true, lowstock: true }));
    try {
      const res = await apiClient.get(`/api/shops/${shopName}/dashboard/product-total`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductsCount(res.data.totalProducts || 0);
      setTotalStock(res.data.totalStock || 0);
      setLowStockCount(res.data.lowStockCount || 0);
    } catch (err) {
      console.error("fetchProductsCount error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(s => ({ ...s, products: false, lowstock: false }));
    }
  };

  const fetchSales = async (range = "today") => {
    if (!shopName) return;
    setLoading(s => ({ ...s, sales: true }));
    try {
      const res = await apiClient.get(
        `/api/shops/${shopName}/dashboard/sales-bills/summary?period=${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bills = res?.data?.totalBills ?? 0;
      const amount = res?.data?.totalAmount ?? 0;
      setSalesData({ bills, amount });
    } catch (err) {
      console.error("fetchSales error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load sales");
      setSalesData({ bills: 0, amount: 0 });
    } finally {
      setLoading(s => ({ ...s, sales: false }));
    }
  };

  const handleRangeChange = (range) => {
    setSalesRange(range);
    fetchSales(range);
  };

  const fetchRecentBills = async () => {
    if (!shopName) return;
    try {
      const res = await apiClient.get(`/api/shops/${shopName}/dashboard/sales-bills/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // prioritize selected shop first
      const bills = res.data.bills || [];
      setRecentBills(bills);
    } catch (err) {
      console.error("fetchRecentBills error:", err.response?.data || err.message);
    }
  };

  const fetchRecentLowStock = async () => {
    if (!shopName) return;
    try {
      const res = await apiClient.get(`/api/shops/${shopName}/dashboard/products/low-stock/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = res.data.products || [];
      setRecentLowStock(products);
    } catch (err) {
      console.error("fetchRecentLowStock error:", err.response?.data || err.message);
    }
  };

  const fetchTopSelling = async () => {
    if (!shopName) return;
    try {
      const res = await apiClient.get(`/api/shops/${shopName}/dashboard/products/top-selling`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const topProducts = res.data.topProducts || [];
      setTopSelling(topProducts);
    } catch (err) {
      console.error("fetchTopSelling error:", err.response?.data || err.message);
    }
  };

  // ----------------------------
  // Lifecycle
  // ----------------------------
  useEffect(() => {
    fetchProductsCount();
    fetchSales(salesRange);
    fetchRecentBills();
    fetchRecentLowStock();
    fetchTopSelling();
  }, [shopName, salesRange]);

  const formatCurrency = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
  const formatDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  // ----------------------------
  // 🔹 Render
  // ----------------------------
  return (
    <div className="tenant-dashboard p-8 md:p-6 space-y-6 ">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">{shopName}</h1>
        </div>

        {/* === Main Dashboard Grid === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Total Products */}
            <motion.div
              whileHover={cardHover}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center"
              style={{ borderColor: SOFT }}
            >
              <div className="text-xs uppercase tracking-wide text-gray-600">
                Total Products
              </div>
              <div className="mt-3 text-3xl font-semibold" style={{ color: PRIMARY }}>
                {loading.products ? "..." : productsCount}
              </div>
              <div className="mt-3 text-3xl" style={{ color: PRIMARY }}>
                <FaBoxOpen />
              </div>
            </motion.div>

            {/* Low Stock */}
            <motion.div
              whileHover={cardHover}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center"
              style={{ borderColor: SOFT }}
            >
              <div className="text-xs uppercase tracking-wide text-gray-600">
                Low Stock
              </div>
              <div className="mt-3 text-3xl font-semibold text-red-500">
                {loading.lowstock ? "..." : lowStockCount}
              </div>
              <div className="mt-3 text-3xl text-red-500">
                <FaExclamationTriangle />
              </div>
            </motion.div>
          </div>

          {/* Total Sales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-6">
              Total Sales
            </div>
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

            <motion.div
              whileHover={cardHover}
              className="flex flex-col items-center justify-center gap-4"
            >
              <div className="text-3xl md:text-4xl font-bold" style={{ color: PRIMARY }}>
                {loading.sales ? "..." : formatCurrency(salesData.amount)}
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <FaFileInvoice style={{ color: PRIMARY }} />
                <span style={{ color: PRIMARY }}>
                  {loading.sales ? "..." : `${salesData.bills} Bills`}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              Recently Added Invoices
            </h2>
            <button
              onClick={() => navigate("/master-sales")}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
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
                  <td className="border px-3 py-2 text-right">
                    ₹{bill.netAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock + Top Selling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Low Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                Low Stock Products
              </h2>
              <button
                onClick={() => navigate("/master/stock/min-qty")}
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
                </tr>
              </thead>
              <tbody>
                {recentLowStock.map((p, i) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{i + 1}</td>
                    <td className="border px-3 py-2">{p.name}</td>
                    <td className="border px-3 py-2">{p.batchNo}</td>
                    <td className="border px-3 py-2 text-right text-red-600">{p.qty}</td>
                    <td className="border px-3 py-2 text-right">{p.minQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Selling */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-gray-700">
              Top Selling Products
            </h2>
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
                {topSelling.slice(0, 5).map((p, i) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{i + 1}</td>
                    <td className="border px-3 py-2">{p.name}</td>
                    <td className="border px-3 py-2 text-right">{p.totalQty}</td>
                    <td className="border px-3 py-2 text-right">
                      ₹{p.totalSales}
                    </td>
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



// // src/pages/master/sidebar/UserDashboard.jsx
// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { FaBoxOpen, FaExclamationTriangle, FaFileInvoice } from "react-icons/fa";
// import { useAuth } from "../../../context/AuthContext";
// import { useShop } from "../../../context/ShopContext";
// import apiClient from "../../../utils/apiClient";
// import { useNavigate } from "react-router-dom";

// const PRIMARY = "#00A76F";
// const SOFT = "#C8FAD6";

// const cardHover = {
//   scale: 1.02,
//   boxShadow: `0 12px 30px -12px rgba(0,167,111,0.28), 0 6px 18px -10px rgba(0,120,103,0.08)`,
// };

// export default function TenantDashboard() {
//   const { user } = useAuth();
//   const { selectedShop } = useShop();
//   const navigate = useNavigate();

//   const [productsCount, setProductsCount] = useState(0);
//   const [lowStockCount, setLowStockCount] = useState(0);
//   const [salesData, setSalesData] = useState({ bills: 0, amount: 0 });
//   const [salesRange, setSalesRange] = useState("today");
//   const [loading, setLoading] = useState({ products: false, lowstock: false, sales: false });
//   const [error, setError] = useState(null);
//   const [recentBills, setRecentBills] = useState([]);
//   const [recentLowStock, setRecentLowStock] = useState([]);
//   const [topSelling, setTopSelling] = useState([]);
//   const [totalStock, setTotalStock] = useState(0);

//   const shopName = selectedShop?.shopname?.trim();
//   const token = user?.token || localStorage.getItem("token");

//   // ----------------------------
//   // Fetch functions
//   // ----------------------------
//   const fetchProductsCount = async () => {
//     if (!shopName) return;
//     setLoading(s => ({ ...s, products: true, lowstock: true }));
//     try {
//       const res = await apiClient.get(`/api/shops/${shopName}/dashboard/product-total`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setProductsCount(res.data.totalProducts || 0);
//       setTotalStock(res.data.totalStock || 0);
//       setLowStockCount(res.data.lowStockCount || 0);
//     } catch (err) {
//       console.error("fetchProductsCount error:", err.response?.data || err.message);
//       setError(err.response?.data?.message || "Failed to load products");
//     } finally {
//       setLoading(s => ({ ...s, products: false, lowstock: false }));
//     }
//   };

//   // const fetchSales = async (range = "today") => {
//   //   if (!shopName) return;
//   //   setLoading(s => ({ ...s, sales: true }));
//   //   try {
//   //     const res = await apiClient.get(`/api/shops/${shopName}/dashboard/sales-bills/summary?period=${range}`, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
      
//   //     const bills = res?.data?.totalBills ?? res?.data?.bills ?? 0;
//   //     const amount = res?.data?.totalAmount ?? res?.data?.amount ?? 0;
//   //     setSalesData({ bills: res.data.totalBills, amount: res.data.totalAmount });
//   //   } catch (err) {
//   //     console.error("fetchSales error:", err.response?.data || err.message);
//   //     setError(err.response?.data?.message || "Failed to load sales");
//   //     setSalesData({ bills: 0, amount: 0 });
//   //   } finally {
//   //     setLoading(s => ({ ...s, sales: false }));
//   //   }
//   // };


//   const fetchSales = async (range = "today") => {
//   if (!shopName) return;
//   setLoading(s => ({ ...s, sales: true }));

//   try {
//     const res = await apiClient.get(
//       `/api/shops/${shopName}/dashboard/sales-bills/summary?period=${range}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     const bills = res?.data?.totalBills ?? 0;
//     const amount = res?.data?.totalAmount ?? 0;

//     setSalesData({ bills, amount });
//   } catch (err) {
//     console.error("fetchSales error:", err.response?.data || err.message);
//     setError(err.response?.data?.message || "Failed to load sales");
//     setSalesData({ bills: 0, amount: 0 });
//   } finally {
//     setLoading(s => ({ ...s, sales: false }));
//   }
// };


// const handleRangeChange = (range) => {
//   setSalesRange(range);      // Update state
//   fetchSales(range);         // Refetch sales data for selected range
// };

//   const fetchRecentBills = async () => {
//     if (!shopName) return;
//     try {
//       const res = await apiClient.get(`/api/shops/${shopName}/dashboard/sales-bills/recent`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRecentBills(res.data.bills || []);
//     } catch (err) {
//       console.error("fetchRecentBills error:", err.response?.data || err.message);
//     }
//   };

//   const fetchRecentLowStock = async () => {
//     if (!shopName) return;
//     try {
//       const res = await apiClient.get(`/api/shops/${shopName}/dashboard/products/low-stock/recent`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRecentLowStock(res.data.products || []);
//     } catch (err) {
//       console.error("fetchRecentLowStock error:", err.response?.data || err.message);
//     }
//   };

//   const fetchTopSelling = async () => {
//     if (!shopName) return;
//     try {
//       const res = await apiClient.get(`/api/shops/${shopName}/dashboard/products/top-selling`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTopSelling(res.data.topProducts || []);
//     } catch (err) {
//       console.error("fetchTopSelling error:", err.response?.data || err.message);
//     }
//   };

//   // ----------------------------
//   // Lifecycle
//   // ----------------------------
//   useEffect(() => {
//     fetchProductsCount();
//     fetchSales(salesRange);
//     fetchRecentBills();
//     fetchRecentLowStock();
//     fetchTopSelling();
//   }, [shopName, salesRange]);

//   const formatCurrency = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
//   const formatDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";


//   // ----------------------------
//   // 🔹 Render
//   // ----------------------------
//   return (
//     <div className="tenant-dashboard p-4 md:p-6 space-y-6">
//       <div className="max-w-full mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold">{shopName}</h1>
//         </div>

//         {/* === Main Dashboard Grid === */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             {/* Total Products */}
//             <motion.div
//               whileHover={cardHover}
//               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center"
//               style={{ borderColor: SOFT }}
//             >
//               <div className="text-xs uppercase tracking-wide text-gray-600">
//                 Total Products
//               </div>
//               <div className="mt-3 text-3xl font-semibold" style={{ color: PRIMARY }}>
//                 {loading.products ? "..." : productsCount}
//               </div>
//               <div className="mt-3 text-3xl" style={{ color: PRIMARY }}>
//                 <FaBoxOpen />
//               </div>
//             </motion.div>

//             {/* Low Stock */}
//             <motion.div
//               whileHover={cardHover}
//               className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center"
//               style={{ borderColor: SOFT }}
//             >
//               <div className="text-xs uppercase tracking-wide text-gray-600">
//                 Low Stock
//               </div>
//               <div className="mt-3 text-3xl font-semibold text-red-500">
//                 {loading.lowstock ? "..." : lowStockCount}
//               </div>
//               <div className="mt-3 text-3xl text-red-500">
//                 <FaExclamationTriangle />
//               </div>
//             </motion.div>
//           </div>

//           {/* Total Sales */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative">
//             <div className="text-xs uppercase tracking-wide text-gray-600 mb-6">
//               Total Sales
//             </div>
//             <div className="absolute top-4 right-4">
//               {/* <select
//                 value={salesRange}
//                 onChange={(e) => handleRangeChange(e.target.value)}
//                 className="text-xs border rounded px-2 py-1"
//               >
//                 <option value="today">Today</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//               </select> */}


//               <select
//   value={salesRange}
//   onChange={(e) => handleRangeChange(e.target.value)}
//   className="text-xs border rounded px-2 py-1"
// >
//   <option value="today">Today</option>
//   <option value="weekly">Weekly</option>
//   <option value="monthly">Monthly</option>
// </select>

//             </div>

//             <motion.div
//               whileHover={cardHover}
//               className="flex flex-col items-center justify-center gap-4"
//             >
//               <div className="text-3xl md:text-4xl font-bold" style={{ color: PRIMARY }}>
//                 {loading.sales ? "..." : formatCurrency(salesData.amount)}
//               </div>
//               <div className="flex items-center gap-2 text-gray-600 font-medium">
//                 <FaFileInvoice style={{ color: PRIMARY }} />
//                 <span style={{ color: PRIMARY }}>
//                   {loading.sales ? "..." : `${salesData.bills} Bills`}
//                 </span>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

//         {/* Recent Invoices */}
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-medium text-gray-700">
//               Recently Added Invoices
//             </h2>
//             <button
//               onClick={() => navigate("/master-sales")}
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
//                   <td className="border px-3 py-2 text-right">
//                     ₹{bill.netAmount}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Low Stock + Top Selling */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           {/* Low Stock */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-medium text-gray-700">
//                 Low Stock Products
//               </h2>
//               <button
//                 onClick={() => navigate("/master/stock/min-qty")}
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
//                     <td className="border px-3 py-2 text-right text-red-600">{p.qty}</td>
//                     <td className="border px-3 py-2 text-right ">
//                       {p.minQty}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Top Selling */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ">
//             <h2 className="text-lg font-medium mb-4 text-gray-700">
//               Top Selling Products
//             </h2>
//             <table className="w-full border-collapse border text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="border px-3 py-2">S.No</th>
//                   <th className="border px-3 py-2">Product</th>
//                   <th className="border px-3 py-2 text-right">Qty Sold</th>
//                   <th className="border px-3 py-2 text-right">Sales Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {topSelling.slice(0, 5).map((p, i) => (
//                   <tr key={p._id} className="hover:bg-gray-50">
//                     <td className="border px-3 py-2">{i + 1}</td>
//                     <td className="border px-3 py-2">{p.name}</td>
//                     <td className="border px-3 py-2 text-right">{p.totalQty}</td>
//                     <td className="border px-3 py-2 text-right">
//                       ₹{p.totalSales}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

