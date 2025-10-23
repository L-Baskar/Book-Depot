// // src/App.jsx
// import { Routes, Route } from "react-router-dom";
// import MainLayout from "./layouts/MainLayout";
// import Login from "./pages/auth/Login";
// import Dashboard from "./pages/Dashboard";
// import Products from "./pages/Stock/Products";
// import AddStock from "./pages/Stock/AddStock";
// import MinQty from "./pages/Stock/MinQty";
// import SalesBill from "./pages/SalesBill";
// import Orders from "./pages/Sidebar/Orders.jsx";
// import AddCustomer from "./pages/AddCustomer";
// import AddUser from "./pages/Sidebar/AddUser";
// import Maintenance from "./pages/Maintenance";
// import Error404 from "./pages/Error404";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import Shop from "./pages/Sidebar/Shop";
// import AllShopsPage from "./pages/AllShopsPage.jsx";

// // Master routes
// import MasterDashboard from "./pages/master/sidebar/MasterDashboard.jsx";
// import TenantDashboard from "./pages/master/sidebar/UserDashboard.jsx";
// import MasterProducts from "./pages/master/sidebar/Stock/MasterProducts.jsx";
// import MasterAddStock from "./pages/master/sidebar/Stock/MasterAddStock.jsx";
// import MasterMinQty from "./pages/master/sidebar/Stock/MasterMinQty.jsx";
// import MasterSalesBill from "./pages/master/sidebar/MasterSalesBill.jsx";
// import MasterOrders from "./pages/master/sidebar/MasterOrder.jsx";
// import MasterAddCustomer from "./pages/master/sidebar/MasterAddCustomer.jsx";

// export default function App() {
//   return (
//     <Routes>
//       {/* Auth */}
//       <Route path="/" element={<Login />} />

//       {/* Protected layout */}
//       <Route element={<MainLayout />}>
//         {/* General routes */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager", "user"]}>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/stock/products"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager", "user"]}>
//               <Products />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/stock/add"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <AddStock />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/stock/min-qty"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <MinQty />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/sales"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <SalesBill />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/orders"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <Orders />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/add-customer"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <AddCustomer />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/add-user"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager"]}>
//               <AddUser />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/shops"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager"]}>
//               <Shop />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/all-shops"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager"]}>
//               <AllShopsPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* Master routes */}

//            <Route
//           path="/master-dashboard"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager"]}>
//               <MasterDashboard />
//             </ProtectedRoute>
//           }
//         />

//             <Route
//           path="/user-dashboard"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager"]}>
//               <TenantDashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/stock/master-products"
//           element={
//             <ProtectedRoute roles={["megaadmin", "manager"]}>
//               <MasterProducts />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/master/stock/add"
//           element={
//             <ProtectedRoute roles={["manager", "megaadmin"]}>
//               <MasterAddStock />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/master/stock/min-qty"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <MasterMinQty />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/master-sales"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <MasterSalesBill />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/master-orders"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <MasterOrders />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/master-addcustomer"
//           element={
//             <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
//               <MasterAddCustomer />
//             </ProtectedRoute>
//           }
//         />

//         {/* Maintenance */}
//         <Route path="/maintenance" element={<Maintenance />} />
//       </Route>

//       {/* 404 */}
//       <Route path="*" element={<Error404 />} />
//     </Routes>
//   );
// }


import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Stock/Products";
import AddStock from "./pages/Stock/AddStock";
import MinQty from "./pages/Stock/MinQty";
import SalesBill from "./pages/SalesBill";
import Orders from "./pages/Sidebar/Orders.jsx";
import AddCustomer from "./pages/AddCustomer";
import AddUser from "./pages/Sidebar/AddUser";
import Maintenance from "./pages/Maintenance";
import Error404 from "./pages/Error404";
import ProtectedRoute from "./routes/ProtectedRoute";
import Shop from "./pages/Sidebar/Shop";
import AllShopsPage from "./pages/AllShopsPage.jsx";

// Master routes
import MasterDashboard from "./pages/master/sidebar/MasterDashboard.jsx";
import TenantDashboard from "./pages/master/sidebar/UserDashboard.jsx";
import MasterProducts from "./pages/master/sidebar/Stock/MasterProducts.jsx";
import MasterAddStock from "./pages/master/sidebar/Stock/MasterAddStock.jsx";
import MasterMinQty from "./pages/master/sidebar/Stock/MasterMinQty.jsx";
import MasterSalesBill from "./pages/master/sidebar/MasterSalesBill.jsx";
import MasterOrders from "./pages/master/sidebar/MasterOrder.jsx";
import MasterAddCustomer from "./pages/master/sidebar/MasterAddCustomer.jsx";

// ✅ Reports (new)
import SalesReports from "./pages/master/sidebar/Reports/SalesReports.jsx";
import TopSellingProducts from "./pages/master/sidebar/Reports/TopSellingProducts.jsx";
import LowStock from "./pages/master/sidebar/Reports/LowStock.jsx";
import ProductWiseSales from "./pages/master/sidebar/Reports/ProductWiseSales.jsx";
import InventoryReport from "./pages/master/sidebar/Reports/InventoryReport.jsx";
import ProductWiseCost from "./pages/master/sidebar/Reports/ProductWiseCost.jsx";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />} />

      {/* Protected layout */}
      <Route element={<MainLayout />}>
        {/* General routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["megaadmin", "manager", "user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock/products"
          element={
            <ProtectedRoute roles={["megaadmin", "manager", "user"]}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock/add"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <AddStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock/min-qty"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <MinQty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <SalesBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-customer"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <AddCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shops"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-shops"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <AllShopsPage />
            </ProtectedRoute>
          }
        />

        {/* Master routes */}
        <Route
          path="/master-dashboard"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <MasterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock/master-products"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <MasterProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/stock/add"
          element={
            <ProtectedRoute roles={["manager", "megaadmin"]}>
              <MasterAddStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/stock/min-qty"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <MasterMinQty />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/master-sales"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <MasterSalesBill />
            </ProtectedRoute>
          }
        /> */}
        <Route
  path="/master-sales/:shopId?"
  element={
    <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
      <MasterSalesBill />
    </ProtectedRoute>
  }
/>

        <Route
          path="/master-orders"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <MasterOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-addcustomer"
          element={
            <ProtectedRoute roles={["manager", "user", "megaadmin"]}>
              <MasterAddCustomer />
            </ProtectedRoute>
          }
        />

        {/* ✅ Reports Routes */}
        <Route
          path="/reports/sales"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <SalesReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/top-products"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <TopSellingProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/low-stock"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <LowStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/product-sales"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <ProductWiseSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/inventory"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <InventoryReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/product-cost"
          element={
            <ProtectedRoute roles={["megaadmin", "manager"]}>
              <ProductWiseCost />
            </ProtectedRoute>
          }
        />

        {/* Maintenance */}
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
