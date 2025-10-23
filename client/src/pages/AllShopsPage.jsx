
// // src/pages/AllShopsPage.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../styles/allShops.css";
// import { useShop } from "../context/ShopContext";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function AllShopsPage() {
//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { setSelectedShop } = useShop();
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   // // Fetch all shops from master DB
//   useEffect(() => {
//   const fetchShops = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`${API}/api/shops`, { headers });
//       // Extract shops array from response
//       const data = Array.isArray(res.data.shops) ? res.data.shops : [];
//       setShops(data);
//     } catch (err) {
//       console.error("Failed to fetch shops:", err);
//       setError("Failed to load shops");
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchShops();
// }, []);


//   const selectShop = (shop) => {
//     if (!shop?.shopname) return;
//     // Store selected shop in context & localStorage
//     setSelectedShop(shop);
//     localStorage.setItem("shopname", shop.shopname);
//     navigate("/user-dashboard"); 
//   };

//   return (
//     <div className="all-shops-page p-4">
//       <h1 className="title mb-4">All Shops</h1>

//       {loading && <p className="text-blue-500">Loading shops...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       <div className="shops-grid grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//         {shops.map((shop) => (
//           <div
//             key={shop._id}
//             className="shop-card p-4 bg-white shadow rounded cursor-pointer hover:shadow-lg transition"
//             onClick={() => selectShop(shop)}
//           >
//             <h2 className="font-semibold text-lg">{shop.shopname}</h2>
//             {shop.city && <p className="text-sm text-gray-500">City: {shop.city}</p>}
//             {shop.dbName && <p className="text-sm text-gray-500">DB: {shop.dbName}</p>}
//           </div>
//         ))}
//         {shops.length === 0 && !loading && <p className="text-gray-400">No shops found.</p>}
//       </div>
//     </div>
//   );
// }



// src/pages/AllShopsPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/allShops.css";
import { useShop } from "../context/ShopContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AllShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setSelectedShop } = useShop();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Fetch all shops (no limit)
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/api/shops?limit=0`, { headers });
        const data = Array.isArray(res.data.shops) ? res.data.shops : [];
        setShops(data);
      } catch (err) {
        console.error("Failed to fetch shops:", err);
        setError("Failed to load shops");
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // const selectShop = (shop) => {
  //   if (!shop?.shopname) return;
  //   setSelectedShop(shop);
  //   localStorage.setItem("shopname", shop.shopname);
  //   navigate("/user-dashboard");
  // };

  //   const selectShop = (shop) => {
  //   if (!shop?.shopname) return;
  //   setSelectedShop(shop);
  //   // Persist full shop object so we can restore designation on reload
  //   try {
  //     localStorage.setItem("selectedShop", JSON.stringify(shop));
  //   } catch (e) {
  //     console.warn("Failed saving selectedShop to localStorage", e);
  //   }
  //   localStorage.setItem("shopname", shop.shopname);
  //   localStorage.setItem("shopId", shop._id || "");
  //   navigate("/user-dashboard");
  // };

  const selectShop = (shop) => {
  if (!shop?.shopname) return;

  // Persist the selected shop
  setSelectedShop(shop);
  try {
    localStorage.setItem("selectedShop", JSON.stringify(shop));
  } catch (e) {
    console.warn("Failed saving selectedShop to localStorage", e);
  }
  localStorage.setItem("shopname", shop.shopname);
  localStorage.setItem("shopId", shop._id || "");

  // Navigate and scroll to top
  navigate("/user-dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scroll to top
};


  return (
    <div className="all-shops-page p-6">
      <h1 className="title mb-6 text-3xl font-bold text-gray-800 ">
        All Shops
      </h1>

      {loading && <p className="text-green-500 text-center">Loading shops...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="shops-grid grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <div
            key={shop._id}
            className="shop-card p-6 bg-[#C8FAD6]/40 border border-[#C8FAD6] shadow-md rounded-2xl cursor-pointer transform transition duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-[#C8FAD6]/60"
          >
            <h2 className="font-semibold text-xl text-[#007867] mb-2">
              {shop.shopname}
            </h2>
            {shop.designation && (
              <p className="text-gray-700 mb-1">
                <span className="font-medium text-[#00A76F]">Designation:</span>{" "}
                {shop.designation}
              </p>
            )}
            {shop.contact && (
              <p className="text-gray-700 mb-1">
                <span className="font-medium text-[#00A76F]">Contact:</span>{" "}
                {shop.contact}
              </p>
            )}
            {shop.address && (
              <p className="text-gray-700 mb-3">
                <span className="font-medium text-[#00A76F]">Address:</span>{" "}
                {shop.address}
              </p>
            )}
            <button
              onClick={() => selectShop(shop)}
              className="mt-3 w-full bg-[#00A76F] text-white py-1.5 text-sm rounded-md hover:bg-[#007867] active:bg-[#007867]/90 transition duration-200"
            >
              View Shop
            </button>
          </div>
        ))}
        {shops.length === 0 && !loading && (
          <p className="text-gray-400 text-center">No shops found.</p>
        )}
      </div>
    </div>
  );
}
