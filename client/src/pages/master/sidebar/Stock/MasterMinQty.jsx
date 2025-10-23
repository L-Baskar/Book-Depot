
// // src/pages/master/sidebar/Stock/MasterMinQty.jsx
// import { useEffect, useState, useMemo, useContext } from "react";
// import axios from "axios";
// import "../../../../styles/products.css";
// import "../../../../styles/Sidebar/MinQty.css";
// import { useAuth } from "../../../../context/AuthContext";
// import { ShopContext } from "../../../../context/ShopContext";
// import { StockContext } from "../../../../context/StockContext";
// import Pagination from "../../../../components/Pagination";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function MinQty() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);
//   const { refreshFlag } = useContext(StockContext);

//   const shopname = selectedShop?.shopname || selectedShop?.name || user?.shopname || null;

 
//   const [search, setSearch] = useState("");

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10;

//   const getToken = () =>
//     localStorage.getItem("tenantToken") || localStorage.getItem("masterToken") || localStorage.getItem("token") || null;

//   const tryGet = async (candidates, config = {}) => {
//     let lastErr = null;
//     for (const url of candidates) {
//       try {
//         return await axios.get(url, config);
//       } catch (err) {
//         lastErr = err;
//       }
//     }
//     throw lastErr;
//   };

//   const buildEndpoints = () => {
//     const arr = [];
//     if (shopname) {
//       arr.push(`${API}/api/tenant/shops/${encodeURIComponent(shopname)}/products`);
//       arr.push(`${API}/api/shops/${encodeURIComponent(shopname)}/products`);
//     }
//     arr.push(`${API}/api/tenant/products`);
//     arr.push(`${API}/api/products`);
//     return arr;
//   };

//   const fetchProducts = async (pageNum = 1) => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       if (!token) {
//         setLoading(false);
//         setProducts([]);
//         return;
//       }

//       const headers = {
//         Authorization: `Bearer ${token}`,
//         ...(shopname ? { "x-shopname": shopname } : {}),
//       };

//       const endpoints = buildEndpoints();
//       const res = await tryGet(endpoints.map(url => `${url}?page=${pageNum}&limit=${limit}&search=${encodeURIComponent(search)}`), { headers });
//       const data = res.data;

//       const list = Array.isArray(data.products)
//         ? data.products
//         : Array.isArray(data)
//         ? data
//         : [];

//       setProducts(list);
//       setPage(pageNum);
//       setTotalPages(data.totalPages || 1);
//     } catch (err) {
//       console.error("Failed to fetch products for MinQty", err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts(page);
//   }, [shopname, refreshFlag, page]);


//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       const token = getToken();
//       if (!token) {
//         setLoading(false);
//         setProducts([]);
//         return;
//       }
//       const headers = { Authorization: `Bearer ${token}`, ...(shopname ? { "x-shopname": shopname } : {}) };
//       try {
//         const endpoints = buildEndpoints();
//         const res = await tryGet(endpoints, { headers });
//         const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.products) ? res.data.products : res.data?.items || [];
//         setProducts(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to fetch products for MinQty", err);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//     // refetch when selected shop changes or global refreshFlag toggles
//   }, [shopname, refreshFlag]);
    





//   // flatten into batches
//   const lowStockBatches = useMemo(() => {
//     const rows = [];
//     (products || []).forEach((p) => {
//       if (!p.batchNo) return;
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
//       <div className="products-header">
//         <h1 className="title">Minimum Quantity Alerts</h1>
//       </div>

//        {/* Search Input */}
//       <div className="flex items-center mb-3  gap-2">
//         <input
//           type="text"
//           placeholder="Search code / name / batch"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-[100px] min-w-[150px]  h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] placeholder-gray-400"
//         />
//         <div className="flex gap-2">
//           <button
//             onClick={() => fetchProducts(1)}
//             className="h-8 text-sm bg-[#007867] text-white px-3 py-1 rounded-md hover:bg-[#005f50] transition-all"
//           >
//             Search
//           </button>
//           <button
//             onClick={() => {
//               setSearch("");
//               fetchProducts(1);
//             }}
//             className="h-8 text-sm bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 transition-all"
//           >
//             Reset
//           </button>
//         </div>
//       </div>



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

//       {lowStockBatches.length > 0 && (
//         <div className="alert-box danger">
//           ⚠️ {lowStockBatches.length} batch{lowStockBatches.length > 1 ? "es are" : " is"} below minimum stock!
//         </div>
//       )}

//        <div className="mt-3 flex justify-center">
//         <Pagination page={page} totalPages={totalPages} onPageChange={fetchProducts} />
//       </div>
//     </div>
//   );
// }





// src/pages/master/sidebar/Stock/MasterMinQty.jsx
import { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import "../../../../styles/products.css";
import "../../../../styles/Sidebar/MinQty.css";
import { useAuth } from "../../../../context/AuthContext";
import { ShopContext } from "../../../../context/ShopContext";
import { StockContext } from "../../../../context/StockContext";
import Pagination from "../../../../components/Pagination";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MinQty() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);
  const { refreshFlag } = useContext(StockContext);

  const shopname = selectedShop?.shopname || selectedShop?.name || user?.shopname || null;

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const getToken = () =>
    localStorage.getItem("tenantToken") ||
    localStorage.getItem("masterToken") ||
    localStorage.getItem("token") ||
    null;

  const tryGet = async (candidates, config = {}) => {
    let lastErr = null;
    for (const url of candidates) {
      try {
        return await axios.get(url, config);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  };

  const buildEndpoints = () => {
    const arr = [];
    if (shopname) {
      arr.push(`${API}/api/tenant/shops/${encodeURIComponent(shopname)}/products`);
      arr.push(`${API}/api/shops/${encodeURIComponent(shopname)}/products`);
    }
    arr.push(`${API}/api/tenant/products`);
    arr.push(`${API}/api/products`);
    return arr;
  };

  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setLoading(false);
        setProducts([]);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        ...(shopname ? { "x-shopname": shopname } : {}),
      };

      const endpoints = buildEndpoints();
      const res = await tryGet(
        endpoints.map(
          (url) =>
            `${url}?page=${pageNum}&limit=${limit}&search=${encodeURIComponent(search)}`
        ),
        { headers }
      );
      const data = res.data;

      const list = Array.isArray(data.products)
        ? data.products
        : Array.isArray(data)
        ? data
        : [];

      setProducts(list);
      setPage(pageNum);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch products for MinQty", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [shopname, refreshFlag, page]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setLoading(false);
        setProducts([]);
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        ...(shopname ? { "x-shopname": shopname } : {}),
      };
      try {
        const endpoints = buildEndpoints();
        const res = await tryGet(endpoints, { headers });
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
          ? res.data.products
          : res.data?.items || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products for MinQty", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [shopname, refreshFlag]);

  // 🔹 Live search (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(1);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // flatten into batches
  const lowStockBatches = useMemo(() => {
    const rows = [];
    (products || []).forEach((p) => {
      if (!p.batchNo) return;
      const qty = Number(p.qty || 0);
      const minQty = Number(p.minQty || 0);
      if (qty <= minQty) {
        rows.push({
          ...p,
          qty,
          minQty,
          price: Number(p.mrp || 0),
          rate: Number(p.salePrice || 0),
        });
      }
    });
    return rows;
  }, [products]);

  return (
    <div className="products-page p-8">
      <div className="products-header">
        <h1 className="title">Minimum Quantity Alerts</h1>
      </div>

      {/* 🔹 Live Search Input */}
      <div className="flex items-center mb-3 gap-2">
        <input
          type="text"
          placeholder="Search by Product Code or Product Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!w-[100px] !min-w-[330px] h-8 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#007867] placeholder-gray-400"
        />
      </div>

      <div className="card table-card">
        <div className="table-responsive">
          {loading ? (
            <p className="muted text-center">Loading...</p>
          ) : lowStockBatches.length === 0 ? (
            <p className="muted text-center">
              All products are above minimum stock.
            </p>
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
                  <tr
                    key={b._id || `${b.code}-${b.batchNo}-${idx}`}
                    className="danger"
                  >
                    <td data-label="S.No">{idx + 1}</td>
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

      {lowStockBatches.length > 0 && (
        <div className="alert-box danger">
          ⚠️ {lowStockBatches.length} batch
          {lowStockBatches.length > 1 ? "es are" : " is"} below minimum stock!
        </div>
      )}

      <div className="mt-3 flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={fetchProducts}
        />
      </div>
    </div>
  );
}
