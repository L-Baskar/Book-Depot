// src/pages/MinQty.jsx file code  i need table format content s.no Product code produt name batch qty price rate
// when show minqty reach the qty show this list. clearly batch list

// // src/pages/Stock/MinQty.jsx
// import { useEffect, useState, useMemo, useContext } from "react";
// import axios from "axios";
// import "../../styles/products.css"; // reuse same table + danger styles
// import "../../styles/Sidebar/MinQty.css"
// import { useAuth } from "../../context/AuthContext"; 
// import { ShopContext } from "../../context/ShopContext"; 
// import Pagination from "../../components/Pagination";


// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


// export default function MinQty() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//    const { user } = useAuth();
//      const { selectedShop } = useContext(ShopContext);
//   const shopname = selectedShop?.name || user?.shopname;

//    const [search, setSearch] = useState("");

  
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);

//   const [totalPages, setTotalPages] = useState(1);

 


//     // Include shopname in API URL
//   // const API_URL = `${API}/api/products?shopname=${shopname}`;
//    const API_URL = selectedShop
//     ? `${API}/api/shops/${selectedShop._id}/products`
//     : `${API}/api/products`;




//   //   useEffect(() => {
//   //   if (!shopname) return; // wait until user loads
//   //   setLoading(true);

//   //   axios
//   //     // .get(`${API}/api/products`, {
//   //     .get(API_URL, {
//   //       headers: {
//   //         Authorization: `Bearer ${localStorage.getItem("token")}`,
//   //         "x-shopname": shopname, // ✅ tenant header
//   //       },
//   //     })
//   //     .then((res) => setProducts(res.data))
//   //     .catch(console.error)
//   //     .finally(() => setLoading(false));
//   // }, [shopname,API_URL]);

//   // flatten into batches
  
//   //   useEffect(() => {
//   //   if (!shopname) return;
//   //   setLoading(true);

//   //   axios
//   //     .get(`${API_URL}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
//   //       headers: {
//   //         Authorization: `Bearer ${localStorage.getItem("token")}`,
//   //         "x-shopname": shopname,
//   //       },
//   //     })
//   //     .then((res) => {
//   //       setProducts(res.data.products || []);
//   //       setTotalPages(res.data.totalPages || 1);
//   //     })
//   //     .catch(console.error)
//   //     .finally(() => setLoading(false));
//   // }, [shopname, API_URL, page, search]);
  

//   useEffect(() => {
//   if (!shopname) return;
//   setLoading(true);

//   axios
//     .get(`${API_URL}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//         "x-shopname": shopname,
//       },
//     })
//     .then((res) => {
//       setProducts(res.data.products || []);
//       setTotalPages(res.data.totalPages || 1);
//     })
//     .catch(console.error)
//     .finally(() => setLoading(false));
// }, [shopname, API_URL, page, search]);

//   const lowStockBatches = useMemo(() => {
//     const rows = [];
//     products.forEach((p) => {
//       if (!p.batchNo) return; // skip invalid
//       const qty = Number(p.qty || 0);
//       const minQty = Number(p.minQty || 0);
//       if (qty <= minQty) {
//         rows.push({
//           ...p,
//           qty,
//           minQty,
//           price: Number(p.mrp || 0),
//           rate: Number(p.salePrice || 0),
//         });
//       }
//     });
//     return rows;
//   }, [products]);

  

//   return (
//     <div className="products-page">
//       {/* Header */}
//       <div className="products-header">
//         <h1 className="title">Minimum Quantity Alerts</h1>

//       </div>

//         {/* Search Input */}
//          <div className="flex flex-wrap items-center gap-2 mb-3">
//         <input
//           type="text"
//           placeholder="Search by Product Code or Name / Batch / minQty"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="!w-[260px] !md:w-[300px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//         />
//         <button
//           onClick={() => setPage(1)}
//           className="h-8 text-sm bg-[#007867] text-white px-3 py-1 rounded-md hover:bg-[#005f50] transition-all"
//         >
//           Search
//         </button>
//         <button
//           onClick={() => {
//             setSearch("");
//             setPage(1);
//           }}
//           className="h-8 text-sm bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 transition-all"
//         >
//           Reset
//         </button>
//       </div>


//       {/* Table */}
//       <div className="card table-card">
//         <div className="table-responsive">
//           {loading ? (
//             <p className="muted text-center">Loading...</p>
//           ) : lowStockBatches.length === 0 ? (
//             <p className="muted text-center">All products are above minimum stock.</p>
//           ) : (
//             <table className="table clean">
//               <thead>
//                 <tr>
//                   <th>S.No</th>
//                   <th>Product Code</th>
//                   <th>Product Name</th>
//                   <th>Batch No</th>
//                   <th>Qty</th>
//                   <th>Min Qty</th>
//                   <th>MRP</th>
//                   <th>Rate</th>
//                 </tr>
//               </thead>
        

//               <tbody>
//   {lowStockBatches.map((b, idx) => (
//     <tr
//       key={b._id || `${b.code}-${b.batchNo}-${idx}`}
//       className="danger"
//     >
//       <td data-label="S.No">{idx + 1}</td>
//       <td data-label="Product Code">{b.code}</td>
//       <td data-label="Product Name">{b.name}</td>
//       <td data-label="Batch No">{b.batchNo}</td>
//       <td data-label="Qty">{b.qty}</td>
//       <td data-label="Min Qty">{b.minQty}</td>
//       <td data-label="MRP">{b.price.toFixed(2)}</td>
//       <td data-label="Rate">{b.rate.toFixed(2)}</td>
//     </tr>
//   ))}
// </tbody>

//             </table>
//           )}
//         </div>
//       </div>

//       {/* Notification Banner */}
//       {lowStockBatches.length > 0 && (
//         <div className="alert-box danger">
//           ⚠️ {lowStockBatches.length} batch
//           {lowStockBatches.length > 1 ? "es are" : " is"} below minimum stock!
//         </div>
//       )}

//        <div className="mt-3 flex justify-center">
//               <Pagination page={page} totalPages={totalPages} onPageChange={fetchProducts} />
//             </div>
//     </div>
//   );
// }


// // src/pages/Stock/MinQty.jsx
// import { useEffect, useState, useMemo, useContext } from "react";
// import axios from "axios";
// import "../../styles/products.css"; // reuse same table + danger styles
// import "../../styles/Sidebar/MinQty.css";
// import { useAuth } from "../../context/AuthContext"; 
// import { ShopContext } from "../../context/ShopContext"; 
// import Pagination from "../../components/Pagination";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function MinQty() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit] = useState(2);
//   const [totalPages, setTotalPages] = useState(1);

//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);
//   const shopname = selectedShop?.name || user?.shopname;

//   // Stable API URL
//   const API_URL = selectedShop
//     ? `${API}/api/shops/${selectedShop._id}/products`
//     : `${API}/api/products`;

//   // Fetch products whenever shop, page, search changes
//   useEffect(() => {
//     if (!shopname) return;
//     setLoading(true);

//     axios
//       .get(`${API_URL}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "x-shopname": shopname,
//         },
//       })
//       .then((res) => {
//         setProducts(res.data.products || []);
//         setTotalPages(res.data.totalPages || 1);
//       })
//       .catch(console.error)
//       .finally(() => setLoading(false));
      
//   }, [shopname, API_URL, page, search]);

//   // Compute low-stock batches
//   const lowStockBatches = useMemo(() => {
//     return products
//       .filter(p => p.batchNo && Number(p.qty || 0) <= Number(p.minQty || 0))
//       .map(p => ({
//         ...p,
//         qty: Number(p.qty || 0),
//         minQty: Number(p.minQty || 0),
//         price: Number(p.mrp || 0),
//         rate: Number(p.salePrice || 0),
//       }));
//   }, [products]);

//   // Handle pagination click
//   const handlePageChange = (newPage) => setPage(newPage);

//   return (
//     <div className="products-page">
//       {/* Header */}
//       <div className="products-header">
//         <h1 className="title">Minimum Quantity Alerts</h1>
//       </div>

//       {/* Search */}
//       <div className="flex flex-wrap items-center gap-2 mb-3">
//         <input
//           type="text"
//           placeholder="Search by Product Code or Name / Batch"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="!w-[300px] md:!w-[320px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
//         />
//         {/* <button
//           onClick={() => setPage(1)}
//           className="h-8 text-sm bg-[#007867] text-white px-3 py-1 rounded-md hover:bg-[#005f50] transition-all"
//         >
//           Search
//         </button>
//         <button
//           onClick={() => {
//             setSearch("");
//             setPage(1);
//           }}
//           className="h-8 text-sm bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 transition-all"
//         >
//           Reset
//         </button> */}
//       </div>

//       {/* Table */}
//       <div className="card table-card">
//         <div className="table-responsive">
//           {loading ? (
//             <p className="muted text-center">Loading...</p>
//           ) : lowStockBatches.length === 0 ? (
//             <p className="muted text-center">All products are above minimum stock.</p>
//           ) : (
//             <table className="table clean">
//               <thead>
//                 <tr>
//                   <th>S.No</th>
//                   <th>Product Code</th>
//                   <th>Product Name</th>
//                   <th>Batch No</th>
//                   <th>Qty</th>
//                   <th>Min Qty</th>
//                   <th>MRP</th>
//                   <th>Rate</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {lowStockBatches.map((b, idx) => (
//                   <tr key={b._id || `${b.code}-${b.batchNo}-${idx}`} className="danger">
//                     <td data-label="S.No">{idx + 1}</td>
//                     <td data-label="Product Code">{b.code}</td>
//                     <td data-label="Product Name">{b.name}</td>
//                     <td data-label="Batch No">{b.batchNo}</td>
//                     <td data-label="Qty">{b.qty}</td>
//                     <td data-label="Min Qty">{b.minQty}</td>
//                     <td data-label="MRP">{b.price.toFixed(2)}</td>
//                     <td data-label="Rate">{b.rate.toFixed(2)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       {/* Notification Banner */}
//       {lowStockBatches.length > 0 && (
//         <div className="alert-box danger">
//           ⚠️ {lowStockBatches.length} batch
//           {lowStockBatches.length > 1 ? "es are" : " is"} below minimum stock!
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="mt-3 flex justify-center">
//         <Pagination
//           page={page}
//           totalPages={totalPages}
//           onPageChange={handlePageChange} // ✅ fixed undefined error
//         />
//       </div>
//     </div>
//   );
// }



// src/pages/Stock/MinQty.jsx
import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import axios from "axios";
import "../../styles/products.css"; 
import "../../styles/Sidebar/MinQty.css";
import { useAuth } from "../../context/AuthContext"; 
import { ShopContext } from "../../context/ShopContext"; 
import Pagination from "../../components/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MinQty() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);
  const shopname = selectedShop?.name || user?.shopname;

  const token = localStorage.getItem("token");

  // Get API URL safely
  const getApiUrl = useCallback(() => {
    if (selectedShop?._id) {
      return `${API}/api/shops/${selectedShop._id}/products`;
    }
    return `${API}/api/products`;
  }, [selectedShop]);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    if (!shopname || !token) return;

    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-shopname": shopname,
          },
        }
      );

      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [shopname, page, limit, search, getApiUrl, token]);

  // Fetch on mount and whenever dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page on search change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Compute low-stock batches
  const lowStockBatches = useMemo(() => {
    return products
      .filter(p => p.batchNo && Number(p.qty || 0) <= Number(p.minQty || 0))
      .map(p => ({
        ...p,
        qty: Number(p.qty || 0),
        minQty: Number(p.minQty || 0),
        price: Number(p.mrp || 0),
        rate: Number(p.salePrice || 0),
      }));
  }, [products]);

  return (
    <div className="products-page p-8">
      {/* Header */}
      <div className="products-header">
        <h1 className="title">Minimum Quantity Alerts</h1>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search by Product Code or Name / Batch"
          value={search}
          onChange={handleSearchChange}
          className="!w-[300px] md:!w-[320px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] focus:border-[#007867] transition duration-200 placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="table-responsive">
          {loading ? (
            <p className="muted text-center">Loading...</p>
          ) : lowStockBatches.length === 0 ? (
            <p className="muted text-center">All products are above minimum stock.</p>
          ) : (
            <table className="table clean">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Batch No</th>
                  <th>Qty</th>
                  <th>Min Qty</th>
                  <th>MRP</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {lowStockBatches.map((b, idx) => (
                  <tr key={b._id || `${b.code}-${b.batchNo}-${idx}`} className="danger">
                    <td data-label="S.No">{idx + 1 + (page - 1) * limit}</td>
                    <td data-label="Product Code">{b.code}</td>
                    <td data-label="Product Name">{b.name}</td>
                    <td data-label="Batch No">{b.batchNo}</td>
                    <td data-label="Qty">{b.qty}</td>
                    <td data-label="Min Qty">{b.minQty}</td>
                    <td data-label="MRP">{b.price.toFixed(2)}</td>
                    <td data-label="Rate">{b.rate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {lowStockBatches.length > 0 && (
        <div className="alert-box danger">
          ⚠️ {lowStockBatches.length} batch
          {lowStockBatches.length > 1 ? "es are" : " is"} below minimum stock!
        </div>
      )}

      {/* Pagination */}
      <div className="mt-3 flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
