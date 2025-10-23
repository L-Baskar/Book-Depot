




// // src/pages/Stock/AddStock.jsx
// import { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import "../../styles/AddStock.css";
// import { useAuth } from "../../context/AuthContext";
// import { ShopContext } from "../../context/ShopContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function AddStock() {
//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);
//   const shopname = selectedShop?.name || user?.shopname;

//   const API_URL = selectedShop
//     ? `${API}/api/shops/${selectedShop._id}/products`
//     : `${API}/api/products`;

//   const [products, setProducts] = useState([]);
//   const [form, setForm] = useState({
//     code: "",
//     name: "",
//     batchNo: "",
//     mrp: "",
//     salePrice: "",
//     qty: "",
//     category: "",
//   });

//   const [codeSuggestions, setCodeSuggestions] = useState([]);
//   const [nameSuggestions, setNameSuggestions] = useState([]);
//   const [availableBatches, setAvailableBatches] = useState([]);

//   const [showCodeList, setShowCodeList] = useState(false);
//   const [showNameList, setShowNameList] = useState(false);
//   const [showBatchList, setShowBatchList] = useState(false);

//   const [popup, setPopup] = useState({ show: false, type: "", message: "" });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!shopname) return;
//     setLoading(true);
//     fetchProducts();
//   }, [shopname]);

//   // Fetch products from API
//   const fetchProducts = async () => {
//     try {
//       const { data } = await axios.get(API_URL, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "x-shopname": shopname,
//         },
//       });

//       // Handle paginated API or array response
//       const productsArray = Array.isArray(data)
//         ? data
//         : Array.isArray(data.products)
//         ? data.products
//         : [];

//       setProducts(productsArray);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to fetch products", err);
//       setProducts([]);
//       setLoading(false);
//     }
//   };

//   const getMatchingProducts = (key, value) =>
//     products.filter((p) =>
//       p[key]?.toLowerCase().includes(value.toLowerCase())
//     );

//   const onCodeChange = (val) => {
//     setForm((f) => ({ ...f, code: val }));
//     const trimmedVal = val.trim().toLowerCase();

//     if (!trimmedVal) {
//       setShowCodeList(false);
//       setForm((f) => ({
//         ...f,
//         name: "",
//         batchNo: "",
//         mrp: "",
//         salePrice: "",
//         qty: "",
//         category: "",
//       }));
//       setAvailableBatches([]);
//       setShowBatchList(false);
//       return;
//     }

//     const matches = getMatchingProducts("code", trimmedVal);
//     setCodeSuggestions(matches);
//     setShowCodeList(true);

//     const exact = products.find((p) => p.code.toLowerCase() === trimmedVal);
//     if (exact) {
//       setForm((f) => ({
//         ...f,
//         code: exact.code,
//         name: exact.name,
//         category: exact.category,
//         batchNo: "",
//         mrp: "",
//         salePrice: "",
//         qty: "",
//       }));
//       setAvailableBatches(getMatchingProducts("code", exact.code));
//       setShowBatchList(true);
//     } else {
//       setShowBatchList(false);
//       setAvailableBatches([]);
//       setForm((f) => ({
//         ...f,
//         name: "",
//         batchNo: "",
//         mrp: "",
//         salePrice: "",
//         qty: "",
//         category: "",
//       }));
//     }
//   };

//   const onCodeSelect = (prod) => {
//     setForm((f) => ({
//       ...f,
//       code: prod.code,
//       name: prod.name,
//       category: prod.category,
//       batchNo: "",
//       mrp: "",
//       salePrice: "",
//       qty: "",
//     }));
//     setAvailableBatches(getMatchingProducts("code", prod.code));
//     setShowBatchList(true);
//     setShowCodeList(false);
//   };

//   const onNameChange = (val) => {
//     setForm((f) => ({ ...f, name: val }));

//     if (!val.trim()) {
//       setShowNameList(false);
//       setForm((f) => ({
//         ...f,
//         code: "",
//         batchNo: "",
//         mrp: "",
//         salePrice: "",
//         qty: "",
//         category: "",
//       }));
//       setAvailableBatches([]);
//       return;
//     }

//     const matches = getMatchingProducts("name", val);
//     setNameSuggestions(matches);
//     setShowNameList(true);

//     const exact = products.find((p) => p.name.toLowerCase() === val.toLowerCase());
//     if (exact) {
//       setForm((f) => ({
//         ...f,
//         code: exact.code,
//         category: exact.category,
//         name: exact.name,
//       }));
//       setAvailableBatches(getMatchingProducts("name", exact.name));
//       setShowBatchList(true);
//     }
//   };

//   const onNameSelect = (prod) => {
//     setForm((f) => ({
//       ...f,
//       code: prod.code,
//       name: prod.name,
//       category: prod.category,
//       batchNo: "",
//       mrp: "",
//       salePrice: "",
//       qty: "",
//     }));
//     setAvailableBatches(getMatchingProducts("name", prod.name));
//     setShowBatchList(true);
//     setShowNameList(false);
//   };

//   const onBatchSelect = (batch) => {
//     setForm((f) => ({
//       ...f,
//       batchNo: batch.batchNo,
//       mrp: batch.mrp,
//       salePrice: batch.salePrice,
//       qty: "",
//     }));
//     setShowBatchList(false);
//   };

//   const addStock = async (e) => {
//     e.preventDefault();
//     if (!form.code || !form.name || !form.batchNo || !form.qty) {
//       return showPopup("error", "Please fill all required fields!");
//     }

//     try {
//       await axios.put(
//         `${API_URL}/increment-stock`,
//         {
//           code: form.code,
//           batchNo: form.batchNo,
//           qty: Number(form.qty),
//           mrp: Number(form.mrp),
//           salePrice: Number(form.salePrice),
//           name: form.name,
//           category: form.category,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "x-shopname": shopname,
//           },
//         }
//       );

//       showPopup("success", "Stock updated successfully!");
//       setForm({
//         code: "",
//         name: "",
//         batchNo: "",
//         mrp: "",
//         salePrice: "",
//         qty: "",
//         category: "",
//       });
//       setAvailableBatches([]);
//       fetchProducts();
//     } catch (err) {
//       console.error("AddStock error:", err);
//       showPopup("error", "Failed to update stock.");
//     }
//   };

//   const showPopup = (type, message) => {
//     setPopup({ show: true, type, message });
//     setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
//   };

//   return (
//     <div className="stock-container">
//       <div className="card">
//         <h2 className="card-title">Add Stock</h2>

//         <form className="form-grid" onSubmit={addStock}>
//           {/* Product Code */}
//           <div className="form-row relative">
//             <label>Product Code</label>
//             <input
//               type="text"
//               placeholder="Enter product code"
//               value={form.code}
//               onChange={(e) => onCodeChange(e.target.value)}
//               onFocus={() => form.code && setShowCodeList(true)}
//               onBlur={() => setTimeout(() => setShowCodeList(false), 150)}
//               className="input"
//             />
//             {showCodeList && codeSuggestions.length > 0 && (
//               <div className="dropdown animate-slide">
//                 {Array.from(
//                   new Map(codeSuggestions.map((p) => [p.code, p])).values()
//                 ).map((p, i) => (
//                   <div
//                     key={i}
//                     className="dropdown-item"
//                     onMouseDown={() => onCodeSelect(p)}
//                   >
//                     {p.code} - {p.name}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Product Name */}
//           <div className="form-row relative">
//             <label>Product Name</label>
//             <input
//               type="text"
//               placeholder="Enter product name"
//               value={form.name}
//               onChange={(e) => onNameChange(e.target.value)}
//               onFocus={() => form.name && setShowNameList(true)}
//               onBlur={() => setTimeout(() => setShowNameList(false), 150)}
//               className="input"
//             />
//             {showNameList && nameSuggestions.length > 0 && (
//               <div className="dropdown animate-slide">
//                 {Array.from(
//                   new Map(nameSuggestions.map((p) => [p.code, p])).values()
//                 ).map((p, i) => (
//                   <div
//                     key={i}
//                     className="dropdown-item"
//                     onMouseDown={() => onNameSelect(p)}
//                   >
//                     {p.name} - {p.code}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Batch No */}
//           <div className="form-row relative">
//             <label>Batch No</label>
//             <input
//               type="text"
//               placeholder="Select batch"
//               value={form.batchNo}
//               onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
//               onFocus={() => setShowBatchList(true)}
//               onBlur={() => setTimeout(() => setShowBatchList(false), 150)}
//               className="input"
//             />
//             {showBatchList && availableBatches.length > 0 && (
//               <div className="batch-suggestions animate-slide">
//                 <table className="batch-table">
//                   <thead>
//                     <tr>
//                       <th>Batch No</th>
//                       <th>MRP</th>
//                       <th>Rate</th>
//                       <th>Qty</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {availableBatches.map((b) => (
//                       <tr
//                         key={b._id || b.batchNo}
//                         onMouseDown={() => onBatchSelect(b)}
//                         className="batch-row"
//                       >
//                         <td>{b.batchNo}</td>
//                         <td>{Number(b.mrp).toFixed(2)}</td>
//                         <td>{Number(b.salePrice).toFixed(2)}</td>
//                         <td>{b.qty}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>

//           {/* Quantity */}
//           <div className="form-row">
//             <label>Quantity</label>
//             <input
//               type="number"
//               placeholder="Enter quantity"
//               value={form.qty}
//               onChange={(e) => setForm({ ...form, qty: e.target.value })}
//               className="input"
//             />
//           </div>

//           <button className="btn small primary">Add Stock</button>
//         </form>
//       </div>

//       {/* Popup */}
//       {popup.show && <div className={`popup ${popup.type}`}>{popup.message}</div>}
//     </div>
//   );
// }





// src/pages/Stock/AddStock.jsx
import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import "../../styles/AddStock.css";
import { useAuth } from "../../context/AuthContext";
import { ShopContext } from "../../context/ShopContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AddStock() {
  const { user } = useAuth();
  const { selectedShop } = useContext(ShopContext);
  const shopname = selectedShop?.name || user?.shopname;
  const token = localStorage.getItem("token");

  const getApiUrl = useCallback(() => {
    if (selectedShop?._id) {
      return `${API}/api/shops/${selectedShop._id}/products`;
    }
    return `${API}/api/products`;
  }, [selectedShop]);

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    batchNo: "",
    mrp: "",
    salePrice: "",
    qty: "",
    category: "",
  });

  const [codeSuggestions, setCodeSuggestions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);

  const [showCodeList, setShowCodeList] = useState(false);
  const [showNameList, setShowNameList] = useState(false);
  const [showBatchList, setShowBatchList] = useState(false);

  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(true);

  // Fetch products dynamically
  const fetchProducts = useCallback(async () => {
    if (!shopname || !token) return;
    const API_URL = getApiUrl();
    if (!API_URL) return;

    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-shopname": shopname,
        },
      });

      const productsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      setProducts(productsArray);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopname, token, getApiUrl]);

  // Fetch products when shop changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getMatchingProducts = (key, value) =>
    products.filter((p) => p[key]?.toLowerCase().includes(value.toLowerCase()));

  // Product code handlers
  const onCodeChange = (val) => {
    setForm((f) => ({ ...f, code: val }));
    const trimmedVal = val.trim().toLowerCase();

    if (!trimmedVal) {
      setShowCodeList(false);
      setForm((f) => ({ ...f, name: "", batchNo: "", mrp: "", salePrice: "", qty: "", category: "" }));
      setAvailableBatches([]);
      setShowBatchList(false);
      return;
    }

    const matches = getMatchingProducts("code", trimmedVal);
    setCodeSuggestions(matches);
    setShowCodeList(true);

    const exact = products.find((p) => p.code.toLowerCase() === trimmedVal);
    if (exact) {
      setForm((f) => ({ ...f, code: exact.code, name: exact.name, category: exact.category, batchNo: "", mrp: "", salePrice: "", qty: "" }));
      setAvailableBatches(getMatchingProducts("code", exact.code));
      setShowBatchList(true);
    } else {
      setAvailableBatches([]);
      setShowBatchList(false);
    }
  };

  const onCodeSelect = (prod) => {
    setForm((f) => ({ ...f, code: prod.code, name: prod.name, category: prod.category, batchNo: "", mrp: "", salePrice: "", qty: "" }));
    setAvailableBatches(getMatchingProducts("code", prod.code));
    setShowBatchList(true);
    setShowCodeList(false);
  };

  // Product name handlers
  const onNameChange = (val) => {
    setForm((f) => ({ ...f, name: val }));

    if (!val.trim()) {
      setShowNameList(false);
      setForm((f) => ({ ...f, code: "", batchNo: "", mrp: "", salePrice: "", qty: "", category: "" }));
      setAvailableBatches([]);
      return;
    }

    const matches = getMatchingProducts("name", val);
    setNameSuggestions(matches);
    setShowNameList(true);

    const exact = products.find((p) => p.name.toLowerCase() === val.toLowerCase());
    if (exact) {
      setForm((f) => ({ ...f, code: exact.code, name: exact.name, category: exact.category }));
      setAvailableBatches(getMatchingProducts("name", exact.name));
      setShowBatchList(true);
    }
  };

  const onNameSelect = (prod) => {
    setForm((f) => ({ ...f, code: prod.code, name: prod.name, category: prod.category, batchNo: "", mrp: "", salePrice: "", qty: "" }));
    setAvailableBatches(getMatchingProducts("name", prod.name));
    setShowBatchList(true);
    setShowNameList(false);
  };

  // Batch select handler
  const onBatchSelect = (batch) => {
    setForm((f) => ({ ...f, batchNo: batch.batchNo, mrp: batch.mrp, salePrice: batch.salePrice, qty: "" }));
    setShowBatchList(false);
  };

  // Add stock
  const addStock = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.batchNo || !form.qty) {
      return showPopup("error", "Please fill all required fields!");
    }

    try {
      await axios.put(
        `${getApiUrl()}/increment-stock`,
        {
          code: form.code,
          batchNo: form.batchNo,
          qty: Number(form.qty),
          mrp: Number(form.mrp),
          salePrice: Number(form.salePrice),
          name: form.name,
          category: form.category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-shopname": shopname,
          },
        }
      );

      showPopup("success", "Stock updated successfully!");
      setForm({ code: "", name: "", batchNo: "", mrp: "", salePrice: "", qty: "", category: "" });
      setAvailableBatches([]);
      fetchProducts(); // ✅ dynamically update without reload
    } catch (err) {
      console.error("AddStock error:", err);
      showPopup("error", "Failed to update stock.");
    }
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  return (
    <div className="stock-container p-8">
      <div className="card">
        <h2 className="card-title">Add Stock</h2>

        <form className="form-grid" onSubmit={addStock}>
          {/* Product Code */}
          <div className="form-row relative">
            <label>Product Code</label>
            <input
              type="text"
              placeholder="Enter product code"
              value={form.code}
              onChange={(e) => onCodeChange(e.target.value)}
              onFocus={() => form.code && setShowCodeList(true)}
              onBlur={() => setTimeout(() => setShowCodeList(false), 150)}
              className="input"
            />
            {showCodeList && codeSuggestions.length > 0 && (
              <div className="dropdown animate-slide">
                {Array.from(new Map(codeSuggestions.map((p) => [p.code, p])).values()).map((p, i) => (
                  <div key={i} className="dropdown-item" onMouseDown={() => onCodeSelect(p)}>
                    {p.code} - {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="form-row relative">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              onFocus={() => form.name && setShowNameList(true)}
              onBlur={() => setTimeout(() => setShowNameList(false), 150)}
              className="input"
            />
            {showNameList && nameSuggestions.length > 0 && (
              <div className="dropdown animate-slide">
                {Array.from(new Map(nameSuggestions.map((p) => [p.code, p])).values()).map((p, i) => (
                  <div key={i} className="dropdown-item" onMouseDown={() => onNameSelect(p)}>
                    {p.name} - {p.code}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Batch No */}
          <div className="form-row relative">
            <label>Batch No</label>
            <input
              type="text"
              placeholder="Select batch"
              value={form.batchNo}
              onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
              onFocus={() => setShowBatchList(true)}
              onBlur={() => setTimeout(() => setShowBatchList(false), 150)}
              className="input"
            />
            {showBatchList && availableBatches.length > 0 && (
              <div className="batch-suggestions animate-slide">
                <table className="batch-table">
                  <thead>
                    <tr>
                      <th>Batch No</th>
                      <th>MRP</th>
                      <th>Rate</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableBatches.map((b) => (
                      <tr key={b._id || b.batchNo} onMouseDown={() => onBatchSelect(b)} className="batch-row">
                        <td>{b.batchNo}</td>
                        <td>{Number(b.mrp).toFixed(2)}</td>
                        <td>{Number(b.salePrice).toFixed(2)}</td>
                        <td>{b.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="form-row">
            <label>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: e.target.value })}
              className="input"
            />
          </div>

          <button className="btn small primary">Add Stock</button>
        </form>
      </div>

      {/* Popup */}
      {popup.show && <div className={`popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
}




