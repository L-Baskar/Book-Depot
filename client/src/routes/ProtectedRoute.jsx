// // src/routes/ProtectedRoute.jsx
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useShop } from "../context/ShopContext";
// export default function ProtectedRoute({ children, roles }) {
//   const { user, loading } = useAuth();
//   const { selectedShop, setSelectedShop } = useShop();
//   const location = useLocation();

//   if (loading) return <div>Loading...</div>; // wait for auth restore

//   if (!user) return <Navigate to="/" replace />; // Not logged in

//   // Restore selectedShop early
//   if ((user.role === "manager" || user.role === "megaadmin") && user.type === "master") {
//     if (!selectedShop) {
//       const savedShop = localStorage.getItem("selectedShop");
//       if (savedShop) {
//         try {
//           setSelectedShop(JSON.parse(savedShop));
//         } catch (err) {
//           console.warn("Failed to parse saved selectedShop:", err);
//         }
//       }
//     }
//   }

//   // Role check
//   if (roles && !roles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   // Shop-specific route handling for master users
//   if (user.type === "master") {
//     const shopSpecificRoutes = [
//       "/master-sales",
//       "/master-orders",
//       "/master-addcustomer",
//       "/master/stock/add",
//       "/master/stock/min-qty",
//       "/stock/master-products",
//       "/master-dashboard",
//       "/user-dashboard",
//     ];

//     const isShopRoute = shopSpecificRoutes.some(r =>
//       location.pathname.startsWith(r)
//     );

//     // Only redirect if still loading selectedShop restoration
//     if (isShopRoute && !selectedShop) {
//       return <Navigate to="/all-shops" replace />;
//     }
//   }

//   return children;
// }


// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const { selectedShop } = useShop();
  const location = useLocation();

  if (loading) return <div>Loading...</div>; // wait before redirect

  if (!user) return <Navigate to="/" replace />; // Not logged in

  // Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Shop-specific route for master
  if (user.type === "master") {
    const shopRoutes = [
      "/master-sales",
      "/master-orders",
      "/master-addcustomer",
      "/master/stock/add",
      "/master/stock/min-qty",
      "/stock/master-products",
      "/master-dashboard",
      "/user-dashboard",
    ];

    const isShopRoute = shopRoutes.some(r => location.pathname.startsWith(r));

    if (isShopRoute && !selectedShop) {
      return <Navigate to="/all-shops" replace />;
    }
  }

  return children;
}



// // 20/10/2025 16:45
// // src/routes/ProtectedRoute.jsx
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useShop } from "../context/ShopContext";

// export default function ProtectedRoute({ children, roles }) {
//   const { user, loading } = useAuth();
//   const { selectedShop, setSelectedShop } = useShop();
//   const location = useLocation();

//   if (loading) return null; // Wait until auth is restored

//   if (!user) return <Navigate to="/" replace />; // Not logged in

//   // Role check: deny access if roles defined and user role not included
//   if (roles && !roles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   // Restore selectedShop from localStorage for master/manager on F5
//   if ((user.role === "manager" || user.role === "megaadmin") && user.type === "master") {
//     if (!selectedShop) {
//       const savedShop = localStorage.getItem("selectedShop");
//       if (savedShop) {
//         try {
//           setSelectedShop(JSON.parse(savedShop));
//         } catch (err) {
//           console.warn("Failed to parse saved selectedShop:", err);
//         }
//       }
//     }
//   }

//   // Shop-specific route handling for master users
//   if (user.type === "master") {
//     const shopSpecificRoutes = [
//       "/master-sales",
//       "/master-orders",
//       "/master-addcustomer",
//       "/master/stock/add",
//       "/master/stock/min-qty",
//       "/stock/master-products",
//       "/master-dashboard",
//       "/user-dashboard",
//     ];

//     const isShopRoute = shopSpecificRoutes.some(r =>
//       location.pathname.startsWith(r)
//     );

//     // Redirect ONLY if accessing a shop-specific route without a selectedShop
//     if (isShopRoute && !selectedShop) {
//       return <Navigate to="/all-shops" replace />;
//     }
//   }

//   return children;
// }


