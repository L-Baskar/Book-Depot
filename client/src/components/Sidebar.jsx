//21/10/2023
// // src/components/Sidebar.jsx
// import { useState, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaBoxes,
//   FaFileInvoice,
//   FaUserCog,
//   FaChevronDown,
//   FaBoxOpen,
//   FaPlusCircle,
//   FaExclamationTriangle,
//   FaClipboardList,
//   FaStore,
//   FaSignOutAlt,
//   FaUserCircle,
//   FaArrowLeft,
//   FaPlus,
// } from "react-icons/fa";
// import logo from "../assets/logo-icon.png";
// import "../styles/sidebar.css";
// import { useShop } from "../context/ShopContext";
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function Sidebar({ closeSidebar }) {
//   const { selectedShop, setSelectedShop, tenantData, setTenantData } = useShop();
//   const { user } = useAuth();

//   const [openStock, setOpenStock] = useState(false);
//   const [openPages, setOpenPages] = useState(false);
//   const [openShop, setOpenShop] = useState(false);
//   const [restoringShop, setRestoringShop] = useState(true);
//   const [loadingTenantData, setLoadingTenantData] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   const currentUser = JSON.parse(localStorage.getItem("user"));
//   const role = currentUser?.role;

//   /* ---------- Restore selectedShop on mount ---------- */
//   useEffect(() => {
//     if (!selectedShop) {
//       const savedShop = localStorage.getItem("selectedShop");
//       if (savedShop) {
//         try {
//           setSelectedShop(JSON.parse(savedShop));
//         } catch (err) {
//           console.warn("Failed to parse saved selectedShop:", err);
//         }
//       } else if (currentUser?.shopId && currentUser?.shopname) {
//         setSelectedShop({ _id: currentUser.shopId, shopname: currentUser.shopname });
//       }
//     }
//     setRestoringShop(false);
//   }, [currentUser, selectedShop, setSelectedShop]);

//   /* ---------- Persist selectedShop to localStorage ---------- */
//   useEffect(() => {
//     if (selectedShop) {
//       localStorage.setItem("selectedShop", JSON.stringify(selectedShop));
//     } else {
//       localStorage.removeItem("selectedShop");
//     }
//   }, [selectedShop]);

//   /* ---------- Fetch tenant data when selectedShop exists ---------- */
//   useEffect(() => {
//     if (!selectedShop?.shopname) return;

//     const controller = new AbortController();
//     const signal = controller.signal;
//     const encodedShopname = encodeURIComponent(selectedShop.shopname);

//     const getAuthToken = () => {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) return "";
//       return user.type === "master"
//         ? localStorage.getItem("masterToken")
//         : localStorage.getItem("token");
//     };

//     const safeFetch = async (endpoint) => {
//       try {
//         const res = await axios.get(
//           `${API_BASE}/api/tenant/shops/${encodedShopname}/${endpoint}`,
//           {
//             headers: {
//               Authorization: `Bearer ${getAuthToken()}`,
//               "x-shop-name": encodedShopname,
//               "x-shop-id": selectedShop._id,
//             },
//             signal,
//           }
//         );
//         return res.data || [];
//       } catch (err) {
//         if (axios.isCancel(err)) return [];
//         console.warn(
//           `Failed to fetch ${endpoint}:`,
//           err.response?.data?.message || err.message
//         );
//         return [];
//       }
//     };

//     setLoadingTenantData(true);

//     Promise.all(
//       ["products", "orders", "sales-bills", "customers", "users"].map(safeFetch)
//     )
//       .then(([products, orders, salesBills, customers, users]) => {
//         setTenantData({ products, orders, salesBills, customers, users });
//       })
//       .finally(() => setLoadingTenantData(false));

//     return () => controller.abort();
//   }, [selectedShop, setTenantData]);

//   /* ---------- Logout & Exit shop ---------- */
//   const handleLogout = () => {
//     localStorage.clear();
//     setSelectedShop(null);
//     setTenantData(null);
//     navigate("/");
//   };

//   const handleExitShop = () => {
//   // Clear shop state
//   setSelectedShop(null);
//   setTenantData(null);
//   localStorage.removeItem("selectedShop");

//   // Navigate to global dashboard
//   navigate("/master-dashboard");
// };


//   const isActiveLink = (path) => location.pathname === path;

//   /* ---------- Loading state while restoring shop ---------- */
//   if ((role === "manager" || role === "megaadmin") && restoringShop) {
//     return (
//       <aside className="bg-white h-full shadow-lg w-64 flex items-center justify-center">
//         <p className="text-green-600 font-bold">Loading shop...</p>
//       </aside>
//     );
//   }

//   return (
//     <aside
//   className="bg-white h-full shadow-lg w-64 lg:static fixed z-50 inset-y-0 left-0 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col pr-12 py-12 pl-0">

//     {/* // <aside className="bg-white h-full !left-0 shadow-lg w-64 lg:static fixed z-50 inset-y-0 left-0 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col "> */}
//       {/* Mobile close button */}
//       <div className="flex justify-end lg:hidden p-2">
//         <button
//           onClick={closeSidebar}
//           className="text-gray-500 hover:text-gray-700 text-xl font-bold"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Logo */}
//       {/* <div className="sidebar-logo px-4 py-2 flex items-center gap-2">
//         <img src={logo} alt="Logo" className="h-8 w-8" />
    
//       </div> */}
//       {/* Logo + Shop Name */}
// {/* <div className="sidebar-logo px-4 py-2 flex items-center gap-2">
//   <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
//   <span className="font-bold text-green-800 text-lg">
//     {selectedShop?.shopname || user?.shopname || "Shop Name"}
//   </span>
// </div> */}


//       {/* Logged-in user info */}
//       {currentUser && (
//         <div className="sidebar-user-info p-4 border-b border-green-600">
//           <div className="flex items-center gap-2">
//             <FaUserCircle className="text-xl" />
//             <div>
//               <h1 className="font-bold  text-green-600">{currentUser.username}</h1>

//               {/* <p className="text-sm text-green-400"> <span className="font-semibold">Role:</span> {currentUser.role}</p> */}
//               {/* <p className="text-sm text-green-400"><span className="font-semibold">Shop: </span> {currentUser.shopname}</p> */}
//               {/* <p className="text-sm text-green-500">
//                 {role}{" "}
//                 {selectedShop
//                   ? `(${selectedShop.shopname})`
//                   : currentUser.shopname
//                   ? `(${currentUser.shopname})`
//                   : ""}
//               </p> */}
//             </div>
//           </div>
//         </div>
//       )}

//       <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-4">
//         {/* GLOBAL NAV for megaadmin/manager without selectedShop */}
//         {(role === "megaadmin" || role === "manager") && !selectedShop && (
//           <>
//             <NavLink
//               to="/master-dashboard"
//               className={isActiveLink("/master-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//             >
//               <FaTachometerAlt /> Dashboard
//             </NavLink>

//             {/* Shop Dropdown */}
//             <div>
//               <button onClick={() => setOpenShop(!openShop)} className="sidebar-dropdown-btn">
//                 <span className="flex items-center gap-2">
//                   <FaStore /> Shops
//                 </span>
//                 <FaChevronDown className={`transform transition-transform ${openShop ? "rotate-180" : ""}`} />
//               </button>
//               {openShop && (
//                 <div className="sidebar-dropdown">
//                   <NavLink
//                     to="/shops"
//                     className={isActiveLink("/shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                   >
//                     <FaPlus className="inline-block mr-2" /> Add Shop
//                   </NavLink>
//                   <NavLink
//                     to="/all-shops"
//                     className={isActiveLink("/all-shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                   >
//                     <FaStore className="inline-block mr-2" /> All Shops
//                   </NavLink>
//                 </div>
//               )}
//             </div>

//             <NavLink
//               to="/add-user"
//               className={isActiveLink("/add-user") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//             >
//               <FaUserCog /> Add User
//             </NavLink>
//           </>
//         )}

//         {/* SHOP-SPECIFIC NAV */}
        
//         {(role === "user" || ((role === "manager" || role === "megaadmin") && selectedShop)) && (
//           <>

//                {(role === "manager" || role === "megaadmin") && selectedShop && (
//                 <h3 className="font-bold text-green-600">{selectedShop.shopname}</h3>
//                  )}
//                   {/* <p className="text-sm text-green-500"><span className=" font-semibold">Designation: </span> {selectedShop.designation}</p> */}
//             {(role === "manager" || role === "megaadmin") && selectedShop && (
//               <button onClick={handleExitShop} className="sidebar-link text-green-500 hover:text-green-600">
//                 <FaArrowLeft /> Exit Shop
//               </button>
//             )}

//              {/* <NavLink
//               to="/dashboard"
//               className={isActiveLink("/dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//             >
//               <FaTachometerAlt /> Dashboard
//             </NavLink>  */}


//             {/* Sales Bills */}
//             {role === "user" && (
//               <NavLink
//                 to="/dashboard"
//                 className={isActiveLink("/dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaTachometerAlt /> Dashboard
//               </NavLink>
//             )}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/user-dashboard"
//                 className={isActiveLink("/user-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaTachometerAlt /> Dashboard
//               </NavLink>
//             )}

//             {/* Stock Dropdown */}
//             <div>
//               <button onClick={() => setOpenStock(!openStock)} className="sidebar-dropdown-btn">
//                 <span className="flex items-center gap-2">
//                   <FaBoxes /> Stock
//                 </span>
//                 <FaChevronDown className={`transform transition-transform ${openStock ? "rotate-180" : ""}`} />
//               </button>
//               {openStock && (
//                 <div className="sidebar-dropdown">
//                   {/* Products */}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/products"
//                       className={isActiveLink("/stock/products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaBoxOpen className="inline-block mr-2" /> Products
//                     </NavLink>
//                   )}

//                   {/* Master Products */}
//                   {(role === "manager" || role === "megaadmin") && selectedShop && (
//                     <NavLink
//                       to="/stock/master-products"
//                       className={isActiveLink("/stock/master-products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaBoxOpen className="inline-block mr-2" /> Products
//                     </NavLink>
//                   )}

//                   {/* Add Stock */}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/add"
//                       className={isActiveLink("/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaPlusCircle className="inline-block mr-2" /> Add Stock
//                     </NavLink>
//                   )}
//                   {selectedShop && (role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/master/stock/add"
//                       className={isActiveLink("/master/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaPlusCircle className="inline-block mr-2" /> Add Stock
//                     </NavLink>
//                   )}

//                   {/* Min Qty */}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/min-qty"
//                       className={isActiveLink("/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
//                     </NavLink>
//                   )}
//                   {selectedShop && (role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/master/stock/min-qty"
//                       className={isActiveLink("/master/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
//                     </NavLink>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Sales Bills */}
//             {role === "user" && (
//               <NavLink
//                 to="/sales"
//                 className={isActiveLink("/sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaFileInvoice /> Sales Bill
//               </NavLink>
//             )}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-sales"
//                 className={isActiveLink("/master-sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaFileInvoice /> Sales Bill
//               </NavLink>
//             )}

//             {/* Orders */}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-orders"
//                 className={isActiveLink("/master-orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Orders
//               </NavLink>
//             )}
//             {role === "user" && (
//               <NavLink
//                 to="/orders"
//                 className={isActiveLink("/orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Orders
//               </NavLink>
//             )}

//             {/* Add Customer */}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-addcustomer"
//                 className={isActiveLink("/master-addcustomer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Customers
//               </NavLink>
//             )}
//             {role === "user" && (
//               <NavLink
//                 to="/add-customer"
//                 className={isActiveLink("/add-customer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Add Customer
//               </NavLink>
//             )}
//           </>
//         )}

//         {/* Pages Dropdown */}
//         {/* <div>
//           <button onClick={() => setOpenPages(!openPages)} className="sidebar-dropdown-btn">
//             <span className="flex items-center gap-2">Pages</span>
//             <FaChevronDown className={`transform transition-transform ${openPages ? "rotate-180" : ""}`} />
//           </button>
//           {openPages && (
//             <div className="sidebar-dropdown">
//               <NavLink
//                 to="/maintenance"
//                 className={isActiveLink("/maintenance") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//               >
//                 Maintenance
//               </NavLink>
//               <NavLink
//                 to="*"
//                 className={isActiveLink("*") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//               >
//                 404 Error
//               </NavLink>
//             </div>
//           )}
//         </div> */}

//         {/* Logout */}
//         <button onClick={handleLogout} className="sidebar-link text-green-600 hover:text-red-600 mt-4">
//           <FaSignOutAlt /> Logout
//         </button>
//       </nav>
//     </aside>
//   );
// }




// // src/components/Sidebar.jsx
// import { useState, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaBoxes,
//   FaFileInvoice,
//   FaUserCog,
//   FaChevronDown,
//   FaBoxOpen,
//   FaPlusCircle,
//   FaExclamationTriangle,
//   FaClipboardList,
//   FaStore,
//   FaSignOutAlt,
//   FaUserCircle,
//   FaArrowLeft,
//   FaPlus,
//   FaChartBar,
//   FaChartLine,
//   FaChartPie,
//   FaExclamationCircle,
//   FaMoneyBillWave,
// } from "react-icons/fa";
// import logo from "../assets/logo-icon.png";
// import "../styles/sidebar.css";
// import { useShop } from "../context/ShopContext";
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function Sidebar({ closeSidebar }) {
//   const { selectedShop, setSelectedShop, tenantData, setTenantData } = useShop();
//   const { user } = useAuth();

//   const [openStock, setOpenStock] = useState(false);
//   const [openPages, setOpenPages] = useState(false);
//   const [openShop, setOpenShop] = useState(false);
//   const [openReports, setOpenReports] = useState(false);
//   const [restoringShop, setRestoringShop] = useState(true);
//   const [loadingTenantData, setLoadingTenantData] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   const currentUser = JSON.parse(localStorage.getItem("user"));
//   const role = currentUser?.role;

//   // /* ---------- Restore selectedShop on mount ---------- */
//   // useEffect(() => {
//   //   if (!selectedShop) {
//   //     const savedShop = localStorage.getItem("selectedShop");
//   //     if (savedShop) {
//   //       try {
//   //         setSelectedShop(JSON.parse(savedShop));
//   //       } catch (err) {
//   //         console.warn("Failed to parse saved selectedShop:", err);
//   //       }
//   //     } else if (currentUser?.shopId && currentUser?.shopname) {
//   //       setSelectedShop({ _id: currentUser.shopId, shopname: currentUser.shopname });
//   //     }
//   //   }
//   //   setRestoringShop(false);
//   // }, [currentUser, selectedShop, setSelectedShop]);


//   /* ---------- Restore selectedShop on mount ---------- */
// useEffect(() => {
//   if (!selectedShop) {
//     const exitFlag = localStorage.getItem("exitShop"); // Check if user exited shop
//     if (!exitFlag) { // Only restore if exit flag is NOT set
//       const savedShop = localStorage.getItem("selectedShop");
//       if (savedShop) {
//         try {
//           setSelectedShop(JSON.parse(savedShop));
//         } catch (err) {
//           console.warn("Failed to parse saved selectedShop:", err);
//         }
//       } else if (currentUser?.shopId && currentUser?.shopname) {
//         setSelectedShop({ _id: currentUser.shopId, shopname: currentUser.shopname });
//       }
//     }
//   }
//   setRestoringShop(false);
// }, [currentUser, selectedShop, setSelectedShop]);


//   /* ---------- Persist selectedShop to localStorage ---------- */
//   // useEffect(() => {
//   //   if (selectedShop) {
//   //     localStorage.setItem("selectedShop", JSON.stringify(selectedShop));
//   //   } else {
//   //     localStorage.removeItem("selectedShop");
//   //   }
//   // }, [selectedShop]);


//   /* ---------- Persist selectedShop to localStorage ---------- */
// useEffect(() => {
//   if (selectedShop) {
//     localStorage.setItem("selectedShop", JSON.stringify(selectedShop));
//     // Clear exit flag when a new shop is selected
//     localStorage.removeItem("exitShop");
//   } else {
//     localStorage.removeItem("selectedShop");
//   }
// }, [selectedShop]);


//   /* ---------- Fetch tenant data when selectedShop exists ---------- */
//   useEffect(() => {
//     if (!selectedShop?.shopname) return;

//     const controller = new AbortController();
//     const signal = controller.signal;
//     const encodedShopname = encodeURIComponent(selectedShop.shopname);

//     const getAuthToken = () => {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) return "";
//       return user.type === "master"
//         ? localStorage.getItem("masterToken")
//         : localStorage.getItem("token");
//     };

//     const safeFetch = async (endpoint) => {
//       try {
//         const res = await axios.get(
//           `${API_BASE}/api/tenant/shops/${encodedShopname}/${endpoint}`,
//           {
//             headers: {
//               Authorization: `Bearer ${getAuthToken()}`,
//               "x-shop-name": encodedShopname,
//               "x-shop-id": selectedShop._id,
//             },
//             signal,
//           }
//         );
//         return res.data || [];
//       } catch (err) {
//         if (axios.isCancel(err)) return [];
//         console.warn(
//           `Failed to fetch ${endpoint}:`,
//           err.response?.data?.message || err.message
//         );
//         return [];
//       }
//     };

//     setLoadingTenantData(true);

//     Promise.all(
//       ["products", "orders", "sales-bills", "customers", "users"].map(safeFetch)
//     )
//       .then(([products, orders, salesBills, customers, users]) => {
//         setTenantData({ products, orders, salesBills, customers, users });
//       })
//       .finally(() => setLoadingTenantData(false));

//     return () => controller.abort();
//   }, [selectedShop, setTenantData]);

//   /* ---------- Logout & Exit shop ---------- */
//   const handleLogout = () => {
//     localStorage.clear();
//     setSelectedShop(null);
//     setTenantData(null);
//     navigate("/");
//   };

//   const handleExitShop = () => {
//     setSelectedShop(null);
//     setTenantData(null);
//     localStorage.removeItem("selectedShop");
//       localStorage.setItem("exitShop", "true"); 
//     navigate("/master-dashboard");
//   };

//   const isActiveLink = (path) => location.pathname === path;

//   /* ---------- Loading state ---------- */
//   if ((role === "manager" || role === "megaadmin") && restoringShop) {
//     return (
//       <aside className="bg-white h-full shadow-lg w-64 flex items-center justify-center">
//         <p className="text-green-600 font-bold">Loading shop...</p>
//       </aside>
//     );
//   }

//   return (
//     <aside
//       className="bg-white h-full shadow-lg w-64 lg:static fixed z-50 inset-y-0 left-0 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col pr-12 py-12 pl-0"
//     >
//       {/* Mobile close button */}
//       <div className="flex justify-end lg:hidden p-2">
//         <button
//           onClick={closeSidebar}
//           className="text-gray-500 hover:text-gray-700 text-xl font-bold"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Logged-in user info */}
//       {currentUser && (
//         <div className="sidebar-user-info p-4 border-b border-green-600">
//           <div className="flex items-center gap-2">
//             <FaUserCircle className="text-xl" />
//             <div>
//               <h1 className="font-bold text-green-600">{currentUser.username}</h1>
//             </div>
//           </div>
//         </div>
//       )}

//       <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-4">
//       {/* GLOBAL NAV for megaadmin/manager without selectedShop */}
// {(role === "megaadmin" || role === "manager") && !selectedShop && (
//   <>
//     <NavLink
//       to="/master-dashboard"
//       className={isActiveLink("/master-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//     >
//       <FaTachometerAlt /> Dashboard
//     </NavLink>

//     {/* Shop Dropdown */}
//     <div>
//       <button onClick={() => setOpenShop(!openShop)} className="sidebar-dropdown-btn">
//         <span className="flex items-center gap-2">
//           <FaStore /> Shops
//         </span>
//         <FaChevronDown className={`transform transition-transform ${openShop ? "rotate-180" : ""}`} />
//       </button>
//       {openShop && (
//         <div className="sidebar-dropdown">
//           <NavLink
//             to="/shops"
//             className={isActiveLink("/shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaPlus className="inline-block mr-2" /> Add Shop
//           </NavLink>
//           <NavLink
//             to="/all-shops"
//             className={isActiveLink("/all-shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaStore className="inline-block mr-2" /> All Shops
//           </NavLink>
//         </div>
//       )}
//     </div>

//     {/* Add User */}
//     <NavLink
//       to="/add-user"
//       className={isActiveLink("/add-user") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//     >
//       <FaUserCog /> Add User
//     </NavLink>

//     {/* Reports Dropdown */}
//     <div>
//       <button onClick={() => setOpenPages(!openPages)} className="sidebar-dropdown-btn">
//         <span className="flex items-center gap-2">
//           <FaFileInvoice /> Reports
//         </span>
//         <FaChevronDown className={`transform transition-transform ${openPages ? "rotate-180" : ""}`} />
//       </button>

//       {openPages && (
//         <div
//           className="sidebar-dropdown reports-scroll"
//           style={{
//             maxHeight: "180px",
//             overflowY: "auto",
//             scrollbarWidth: "thin",
//           }}
//         >
//           <NavLink
//             to="/reports/sales"
//             className={isActiveLink("/reports/sales") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaClipboardList className="inline-block mr-2" /> Sales Reports
//           </NavLink>

//           <NavLink
//             to="/reports/top-products"
//             className={isActiveLink("/reports/top-products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaBoxes className="inline-block mr-2" /> Top Selling Products
//           </NavLink>

//           <NavLink
//             to="/reports/low-stock"
//             className={isActiveLink("/reports/low-stock") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Low Stock
//           </NavLink>

//           <NavLink
//             to="/reports/product-sales"
//             className={isActiveLink("/reports/product-sales") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaFileInvoice className="inline-block mr-2" /> Product-wise Sales
//           </NavLink>

//           <NavLink
//             to="/reports/inventory"
//             className={isActiveLink("/reports/inventory") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaBoxOpen className="inline-block mr-2" /> Inventory
//           </NavLink>

//           <NavLink
//             to="/reports/product-cost"
//             className={isActiveLink("/reports/product-cost") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//           >
//             <FaClipboardList className="inline-block mr-2" /> Product-wise Cost
//           </NavLink>
//         </div>
//       )}
//     </div>
//   </>
// )}


//         {/* ========== SHOP-SPECIFIC NAVIGATION ========== */}
//         {(role === "user" || ((role === "manager" || role === "megaadmin") && selectedShop)) && (
//           <>
//             {(role === "manager" || role === "megaadmin") && selectedShop && (
//               <h3 className="font-bold text-green-600">{selectedShop.shopname}</h3>
//             )}
//             {(role === "manager" || role === "megaadmin") && selectedShop && (
//               <button onClick={handleExitShop} className="sidebar-link text-green-500 hover:text-green-600">
//                 <FaArrowLeft /> Exit Shop
//               </button>
//             )}

//             {role === "user" && (
//               <NavLink
//                 to="/dashboard"
//                 className={isActiveLink("/dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaTachometerAlt /> Dashboard
//               </NavLink>
//             )}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/user-dashboard"
//                 className={isActiveLink("/user-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaTachometerAlt /> Dashboard
//               </NavLink>
//             )}

//             {/* Stock Dropdown */}
//             <div>
//               <button onClick={() => setOpenStock(!openStock)} className="sidebar-dropdown-btn">
//                 <span className="flex items-center gap-2">
//                   <FaBoxes /> Stock
//                 </span>
//                 <FaChevronDown className={`transform transition-transform ${openStock ? "rotate-180" : ""}`} />
//               </button>
//               {openStock && (
//                 <div className="sidebar-dropdown">
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/products"
//                       className={isActiveLink("/stock/products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaBoxOpen className="inline-block mr-2" /> Products
//                     </NavLink>
//                   )}
//                   {(role === "manager" || role === "megaadmin") && selectedShop && (
//                     <NavLink
//                       to="/stock/master-products"
//                       className={isActiveLink("/stock/master-products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaBoxOpen className="inline-block mr-2" /> Products
//                     </NavLink>
//                   )}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/add"
//                       className={isActiveLink("/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaPlusCircle className="inline-block mr-2" /> Add Stock
//                     </NavLink>
//                   )}
//                   {selectedShop && (role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/master/stock/add"
//                       className={isActiveLink("/master/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaPlusCircle className="inline-block mr-2" /> Add Stock
//                     </NavLink>
//                   )}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/min-qty"
//                       className={isActiveLink("/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
//                     </NavLink>
//                   )}
//                   {selectedShop && (role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/master/stock/min-qty"
//                       className={isActiveLink("/master/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
//                     </NavLink>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Sales */}
//             {role === "user" && (
//               <NavLink
//                 to="/sales"
//                 className={isActiveLink("/sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaFileInvoice /> Sales Bill
//               </NavLink>
//             )}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-sales"
//                 className={isActiveLink("/master-sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaFileInvoice /> Sales Bill
//               </NavLink>
//             )}

//             {/* Orders */}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-orders"
//                 className={isActiveLink("/master-orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Orders
//               </NavLink>
//             )}
//             {role === "user" && (
//               <NavLink
//                 to="/orders"
//                 className={isActiveLink("/orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Orders
//               </NavLink>
//             )}

//             {/* Customers */}
//             {selectedShop && (role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-addcustomer"
//                 className={isActiveLink("/master-addcustomer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Customers
//               </NavLink>
//             )}
//             {role === "user" && (
//               <NavLink
//                 to="/add-customer"
//                 className={isActiveLink("/add-customer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Add Customer
//               </NavLink>
//             )}
//           </>
//         )}

//         {/* Logout */}
//         <button onClick={handleLogout} className="sidebar-link text-green-600 hover:text-red-600 mt-4">
//           <FaSignOutAlt /> Logout
//         </button>
//       </nav>
//     </aside>
//   );
// }


// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxes,
  FaFileInvoice,
  FaUserCog,
  FaChevronDown,
  FaBoxOpen,
  FaPlusCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaStore,
  FaSignOutAlt,
  FaUserCircle,
  FaArrowLeft,
  FaPlus,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaExclamationCircle,
  FaMoneyBillWave,
} from "react-icons/fa";
import logo from "../assets/logo-icon.png";
import "../styles/sidebar.css";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Sidebar({ closeSidebar }) {
  const { selectedShop, setSelectedShop, tenantData, setTenantData } = useShop();
  const { user } = useAuth();

  const [openStock, setOpenStock] = useState(false);
  const [openPages, setOpenPages] = useState(false);
  const [openShop, setOpenShop] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [restoringShop, setRestoringShop] = useState(true);
  const [loadingTenantData, setLoadingTenantData] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const role = currentUser?.role;

  /* ---------- Restore selectedShop on mount ---------- */
  useEffect(() => {
    // Only run once on mount
    const exitFlag = localStorage.getItem("exitShop");
    if (!exitFlag) {
      const savedShop = localStorage.getItem("selectedShop");
      if (savedShop) {
        try {
          setSelectedShop(JSON.parse(savedShop));
        } catch (err) {
          console.warn("Failed to parse saved selectedShop:", err);
        }
      } else if (currentUser?.shopId && currentUser?.shopname) {
        setSelectedShop({ _id: currentUser.shopId, shopname: currentUser.shopname });
      }
    } else {
      // User has exited shop, do not restore
      setSelectedShop(null);
    }
    setRestoringShop(false);
  }, []); // <-- run only once

  /* ---------- Persist selectedShop to localStorage ---------- */
  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem("selectedShop", JSON.stringify(selectedShop));
      // Clear exit flag when a new shop is selected
      localStorage.removeItem("exitShop");
    } else {
      localStorage.removeItem("selectedShop");
    }
  }, [selectedShop]);

  /* ---------- Fetch tenant data when selectedShop exists ---------- */
  useEffect(() => {
    if (!selectedShop?.shopname) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const encodedShopname = encodeURIComponent(selectedShop.shopname);

    const getAuthToken = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return "";
      return user.type === "master"
        ? localStorage.getItem("masterToken")
        : localStorage.getItem("token");
    };

    const safeFetch = async (endpoint) => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/tenant/shops/${encodedShopname}/${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              "x-shop-name": encodedShopname,
              "x-shop-id": selectedShop._id,
            },
            signal,
          }
        );
        return res.data || [];
      } catch (err) {
        if (axios.isCancel(err)) return [];
        console.warn(
          `Failed to fetch ${endpoint}:`,
          err.response?.data?.message || err.message
        );
        return [];
      }
    };

    setLoadingTenantData(true);

    Promise.all(
      ["products", "orders", "sales-bills", "customers", "users"].map(safeFetch)
    )
      .then(([products, orders, salesBills, customers, users]) => {
        setTenantData({ products, orders, salesBills, customers, users });
      })
      .finally(() => setLoadingTenantData(false));

    return () => controller.abort();
  }, [selectedShop, setTenantData]);

  /* ---------- Logout & Exit shop ---------- */
  const handleLogout = () => {
    localStorage.clear();
    setSelectedShop(null);
    setTenantData(null);
    navigate("/");
  };

  const handleExitShop = () => {
    setSelectedShop(null);
    setTenantData(null);
    localStorage.removeItem("selectedShop");
    localStorage.setItem("exitShop", "true"); 
    navigate("/master-dashboard");
  };

  const isActiveLink = (path) => location.pathname === path;

  /* ---------- Loading state ---------- */
  if ((role === "manager" || role === "megaadmin") && restoringShop) {
    return (
      <aside className="bg-white h-full shadow-lg w-64 flex items-center justify-center">
        <p className="text-green-600 font-bold">Loading shop...</p>
      </aside>
    );
  }

  return (
    <aside
      className="bg-white h-full shadow-lg w-64 lg:static fixed z-50 inset-y-0 left-0 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col pr-12 py-12 pl-0"
    >
      {/* Mobile close button */}
      <div className="flex justify-end lg:hidden p-2">
        <button
          onClick={closeSidebar}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* Logged-in user info */}
      {currentUser && (
        <div className="sidebar-user-info p-4 border-b border-green-600">
          <div className="flex items-center gap-2">
            <FaUserCircle className="text-xl" />
            <div>
              <h1 className="font-bold text-green-600">{currentUser.username}</h1>
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-4">
        {/* GLOBAL NAV for megaadmin/manager without selectedShop */}
        {(role === "megaadmin" || role === "manager") && !selectedShop && (
          <>
            <NavLink
              to="/master-dashboard"
              className={isActiveLink("/master-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
            >
              <FaTachometerAlt /> Dashboard
            </NavLink>

            {/* Shop Dropdown */}
            <div>
              <button onClick={() => setOpenShop(!openShop)} className="sidebar-dropdown-btn">
                <span className="flex items-center gap-2">
                  <FaStore /> Shops
                </span>
                <FaChevronDown className={`transform transition-transform ${openShop ? "rotate-180" : ""}`} />
              </button>
              {openShop && (
                <div className="sidebar-dropdown">
                  <NavLink
                    to="/shops"
                    className={isActiveLink("/shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaPlus className="inline-block mr-2" /> Add Shop
                  </NavLink>
                  <NavLink
                    to="/all-shops"
                    className={isActiveLink("/all-shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaStore className="inline-block mr-2" /> All Shops
                  </NavLink>
                </div>
              )}
            </div>

            {/* Add User */}
            <NavLink
              to="/add-user"
              className={isActiveLink("/add-user") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
            >
              <FaUserCog /> Add User
            </NavLink>

            {/* Reports Dropdown */}
            <div>
              <button onClick={() => setOpenPages(!openPages)} className="sidebar-dropdown-btn">
                <span className="flex items-center gap-2">
                  <FaFileInvoice /> Reports
                </span>
                <FaChevronDown className={`transform transition-transform ${openPages ? "rotate-180" : ""}`} />
              </button>

              {openPages && (
                <div
                  className="sidebar-dropdown reports-scroll"
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                  }}
                >
                  <NavLink
                    to="/reports/sales"
                    className={isActiveLink("/reports/sales") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaClipboardList className="inline-block mr-2" /> Sales Reports
                  </NavLink>

                  <NavLink
                    to="/reports/top-products"
                    className={isActiveLink("/reports/top-products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaBoxes className="inline-block mr-2" /> Top Selling Products
                  </NavLink>

                  <NavLink
                    to="/reports/low-stock"
                    className={isActiveLink("/reports/low-stock") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Low Stock
                  </NavLink>

                  <NavLink
                    to="/reports/product-sales"
                    className={isActiveLink("/reports/product-sales") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaFileInvoice className="inline-block mr-2" /> Product-wise Sales
                  </NavLink>

                  <NavLink
                    to="/reports/inventory"
                    className={isActiveLink("/reports/inventory") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaBoxOpen className="inline-block mr-2" /> Inventory
                  </NavLink>

                  <NavLink
                    to="/reports/product-cost"
                    className={isActiveLink("/reports/product-cost") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                  >
                    <FaClipboardList className="inline-block mr-2" /> Product-wise Cost
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}

        {/* ========== SHOP-SPECIFIC NAVIGATION ========== */}
        {(role === "user" || ((role === "manager" || role === "megaadmin") && selectedShop)) && (
          <>
            {(role === "manager" || role === "megaadmin") && selectedShop && (
              <h3 className="font-bold text-green-600">{selectedShop.shopname}</h3>
            )}
            {(role === "manager" || role === "megaadmin") && selectedShop && (
              <button onClick={handleExitShop} className="sidebar-link text-green-500 hover:text-green-600">
                <FaArrowLeft /> Exit Shop
              </button>
            )}

            {role === "user" && (
              <NavLink
                to="/dashboard"
                className={isActiveLink("/dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaTachometerAlt /> Dashboard
              </NavLink>
            )}
            {selectedShop && (role === "manager" || role === "megaadmin") && (
              <NavLink
                to="/user-dashboard"
                className={isActiveLink("/user-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaTachometerAlt /> Dashboard
              </NavLink>
            )}

            {/* Stock Dropdown */}
            <div>
              <button onClick={() => setOpenStock(!openStock)} className="sidebar-dropdown-btn">
                <span className="flex items-center gap-2">
                  <FaBoxes /> Stock
                </span>
                <FaChevronDown className={`transform transition-transform ${openStock ? "rotate-180" : ""}`} />
              </button>
              {openStock && (
                <div className="sidebar-dropdown">
                  {role === "user" && (
                    <NavLink
                      to="/stock/products"
                      className={isActiveLink("/stock/products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                    >
                      <FaBoxOpen className="inline-block mr-2" /> Products
                    </NavLink>
                  )}
                  {(role === "manager" || role === "megaadmin") && selectedShop && (
                    <NavLink
                      to="/stock/master-products"
                      className={isActiveLink("/stock/master-products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                    >
                      <FaBoxOpen className="inline-block mr-2" /> Products
                    </NavLink>
                  )}
                  {role === "user" && (
                    <NavLink
                      to="/stock/add"
                      className={isActiveLink("/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                    >
                      <FaPlusCircle className="inline-block mr-2" /> Add Stock
                    </NavLink>
                  )}
                  {selectedShop && (role === "manager" || role === "megaadmin") && (
                    <NavLink
                      to="/master/stock/add"
                      className={isActiveLink("/master/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                    >
                      <FaPlusCircle className="inline-block mr-2" /> Add Stock
                    </NavLink>
                  )}
                  {role === "user" && (
                    <NavLink
                      to="/stock/min-qty"
                      className={isActiveLink("/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                    >
                      <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
                    </NavLink>
                  )}
                  {selectedShop && (role === "manager" || role === "megaadmin") && (
                    <NavLink
                      to="/master/stock/min-qty"
                      className={isActiveLink("/master/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
                    >
                      <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
                    </NavLink>
                  )}
                </div>
              )}
            </div>

            {/* Sales */}
            {role === "user" && (
              <NavLink
                to="/sales"
                className={isActiveLink("/sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaFileInvoice /> Sales Bill
              </NavLink>
            )}
            {selectedShop && (role === "manager" || role === "megaadmin") && (
              <NavLink
                to="/master-sales"
                className={isActiveLink("/master-sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaFileInvoice /> Sales Bill
              </NavLink>
            )}

            {/* Orders */}
            {selectedShop && (role === "manager" || role === "megaadmin") && (
              <NavLink
                to="/master-orders"
                className={isActiveLink("/master-orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaClipboardList /> Orders
              </NavLink>
            )}
            {role === "user" && (
              <NavLink
                to="/orders"
                className={isActiveLink("/orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaClipboardList /> Orders
              </NavLink>
            )}

            {/* Customers */}
            {selectedShop && (role === "manager" || role === "megaadmin") && (
              <NavLink
                to="/master-addcustomer"
                className={isActiveLink("/master-addcustomer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaClipboardList /> Customers
              </NavLink>
            )}
            {role === "user" && (
              <NavLink
                to="/add-customer"
                className={isActiveLink("/add-customer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                <FaClipboardList /> Add Customer
              </NavLink>
            )}
          </>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-link text-green-600 hover:text-red-600 mt-4">
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </aside>
  );
}


// // src/components/Sidebar.jsx
// import { useState, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaBoxes,
//   FaFileInvoice,
//   FaUserCog,
//   FaChevronDown,
//   FaBoxOpen,
//   FaPlusCircle,
//   FaExclamationTriangle,
//   FaClipboardList,
//   FaStore,
//   FaSignOutAlt,
//   FaUserCircle,
//   FaArrowLeft,
//   FaPlus,
// } from "react-icons/fa";
// import "../styles/sidebar.css";
// import { useShop } from "../context/ShopContext";
// import { useAuth } from "../context/AuthContext";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// // Routes that should show global nav
// const GLOBAL_NAV_ROUTES = [
//   "/master-sales",
//   "/master-orders",
//   "/master-addcustomer",
//   "/master/stock/add",
//   "/master/stock/min-qty",
//   "/stock/master-products",
//   "/user-dashboard",
// ];

// // Routes that should show shop-specific nav
// const SHOP_NAV_ROUTES = [
//   "/dashboard",
//   "/sales",
//   "/orders",
//   "/add-customer",
//   "/stock/products",
//   "/stock/add",
//   "/stock/min-qty",
// ];

// export default function Sidebar({ closeSidebar }) {
//   const { selectedShop, setSelectedShop, tenantData, setTenantData } = useShop();
//   const { user } = useAuth();

//   const [openStock, setOpenStock] = useState(false);
//   const [openShop, setOpenShop] = useState(false);
//   const [loadingTenantData, setLoadingTenantData] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   const currentUser = JSON.parse(localStorage.getItem("user"));
//   const role = currentUser?.role;

//   const currentPath = location.pathname;

//   const isGlobalRoute = GLOBAL_NAV_ROUTES.some((r) => currentPath.startsWith(r));
//   const isShopRoute = SHOP_NAV_ROUTES.some((r) => currentPath.startsWith(r));

//   /* ---------- Restore selectedShop only if shop route ---------- */
//   useEffect(() => {
//     if (!selectedShop && currentUser && isShopRoute) {
//       const savedShop = localStorage.getItem("selectedShop");
//       if (savedShop) {
//         try {
//           setSelectedShop(JSON.parse(savedShop));
//         } catch (err) {
//           console.warn("Failed to parse saved selectedShop:", err);
//         }
//       } else if (currentUser?.shopId && currentUser?.shopname) {
//         setSelectedShop({ _id: currentUser.shopId, shopname: currentUser.shopname });
//       }
//     }
//   }, [currentUser, selectedShop, setSelectedShop, isShopRoute]);

//   /* ---------- Persist selectedShop to localStorage ---------- */
//   useEffect(() => {
//     if (selectedShop) {
//       localStorage.setItem("selectedShop", JSON.stringify(selectedShop));
//     } else {
//       localStorage.removeItem("selectedShop");
//     }
//   }, [selectedShop]);

//   /* ---------- Fetch tenant data only for shop routes ---------- */
//   useEffect(() => {
//     if (!selectedShop?.shopname || !isShopRoute) return;

//     const controller = new AbortController();
//     const signal = controller.signal;
//     const encodedShopname = encodeURIComponent(selectedShop.shopname);

//     const getAuthToken = () => {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) return "";
//       return user.type === "master"
//         ? localStorage.getItem("masterToken")
//         : localStorage.getItem("token");
//     };

//     const safeFetch = async (endpoint) => {
//       try {
//         const res = await axios.get(
//           `${API_BASE}/api/tenant/shops/${encodedShopname}/${endpoint}`,
//           {
//             headers: {
//               Authorization: `Bearer ${getAuthToken()}`,
//               "x-shop-name": encodedShopname,
//               "x-shop-id": selectedShop._id,
//             },
//             signal,
//           }
//         );
//         return res.data || [];
//       } catch (err) {
//         if (axios.isCancel(err)) return [];
//         console.warn(
//           `Failed to fetch ${endpoint}:`,
//           err.response?.data?.message || err.message
//         );
//         return [];
//       }
//     };

//     setLoadingTenantData(true);

//     Promise.all(
//       ["products", "orders", "sales-bills", "customers", "users"].map(safeFetch)
//     )
//       .then(([products, orders, salesBills, customers, users]) => {
//         setTenantData({ products, orders, salesBills, customers, users });
//       })
//       .finally(() => setLoadingTenantData(false));

//     return () => controller.abort();
//   }, [selectedShop, setTenantData, isShopRoute]);

//   /* ---------- Logout & Exit shop ---------- */
//   const handleLogout = () => {
//     localStorage.clear();
//     setSelectedShop(null);
//     setTenantData(null);
//     navigate("/");
//   };

//   const handleExitShop = () => {
//     setSelectedShop(null);
//     setTenantData(null);
//     localStorage.removeItem("selectedShop");
//     navigate("/master-dashboard");
//   };

//   const isActiveLink = (path) => location.pathname === path;

//   return (
//     <aside className="bg-white h-full shadow-lg w-64 lg:static fixed z-50 inset-y-0 left-0 transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col pr-12 py-12 pl-0">
//       {/* Mobile close button */}
//       <div className="flex justify-end lg:hidden p-2">
//         <button
//           onClick={closeSidebar}
//           className="text-gray-500 hover:text-gray-700 text-xl font-bold"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Logged-in user info */}
//       {currentUser && (
//         <div className="sidebar-user-info p-4 border-b border-green-600">
//           <div className="flex items-center gap-2">
//             <FaUserCircle className="text-xl" />
//             <div>
//               <h1 className="font-bold text-green-600">{currentUser.username}</h1>
//             </div>
//           </div>
//         </div>
//       )}

//       <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-4">
//         {/* ---------- Global Nav ---------- */}
//         {(role === "manager" || role === "megaadmin") && !selectedShop && (
//           <>
//             <NavLink
//               to="/master-dashboard"
//               className={isActiveLink("/master-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//             >
//               <FaTachometerAlt /> Dashboard
//             </NavLink>

//             <div>
//               <button onClick={() => setOpenShop(!openShop)} className="sidebar-dropdown-btn">
//                 <span className="flex items-center gap-2">
//                   <FaStore /> Shops
//                 </span>
//                 <FaChevronDown className={`transform transition-transform ${openShop ? "rotate-180" : ""}`} />
//               </button>
//               {openShop && (
//                 <div className="sidebar-dropdown">
//                   <NavLink
//                     to="/shops"
//                     className={isActiveLink("/shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                   >
//                     <FaPlus className="inline-block mr-2" /> Add Shop
//                   </NavLink>
//                   <NavLink
//                     to="/all-shops"
//                     className={isActiveLink("/all-shops") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                   >
//                     <FaStore className="inline-block mr-2" /> All Shops
//                   </NavLink>
//                 </div>
//               )}
//             </div>

//             <NavLink
//               to="/add-user"
//               className={isActiveLink("/add-user") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//             >
//               <FaUserCog /> Add User
//             </NavLink>
//           </>
//         )}

//         {/* ---------- Shop-Specific Nav ---------- */}
//         {selectedShop && isShopRoute && (
//           <>
//             <h3 className="font-bold text-green-600">{selectedShop.shopname}</h3>
//             {(role === "manager" || role === "megaadmin") && (
//               <button onClick={handleExitShop} className="sidebar-link text-green-500 hover:text-green-600">
//                 <FaArrowLeft /> Exit Shop
//               </button>
//             )}

//             {role === "user" && (
//               <NavLink
//                 to="/dashboard"
//                 className={isActiveLink("/dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaTachometerAlt /> Dashboard
//               </NavLink>
//             )}
//             {(role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/user-dashboard"
//                 className={isActiveLink("/user-dashboard") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaTachometerAlt /> Dashboard
//               </NavLink>
//             )}

//             {/* Stock Dropdown */}
//             <div>
//               <button onClick={() => setOpenStock(!openStock)} className="sidebar-dropdown-btn">
//                 <span className="flex items-center gap-2">
//                   <FaBoxes /> Stock
//                 </span>
//                 <FaChevronDown className={`transform transition-transform ${openStock ? "rotate-180" : ""}`} />
//               </button>
//               {openStock && (
//                 <div className="sidebar-dropdown">
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/products"
//                       className={isActiveLink("/stock/products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaBoxOpen className="inline-block mr-2" /> Products
//                     </NavLink>
//                   )}
//                   {(role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/stock/master-products"
//                       className={isActiveLink("/stock/master-products") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaBoxOpen className="inline-block mr-2" /> Products
//                     </NavLink>
//                   )}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/add"
//                       className={isActiveLink("/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaPlusCircle className="inline-block mr-2" /> Add Stock
//                     </NavLink>
//                   )}
//                   {(role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/master/stock/add"
//                       className={isActiveLink("/master/stock/add") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaPlusCircle className="inline-block mr-2" /> Add Stock
//                     </NavLink>
//                   )}
//                   {role === "user" && (
//                     <NavLink
//                       to="/stock/min-qty"
//                       className={isActiveLink("/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
//                     </NavLink>
//                   )}
//                   {(role === "manager" || role === "megaadmin") && (
//                     <NavLink
//                       to="/master/stock/min-qty"
//                       className={isActiveLink("/master/stock/min-qty") ? "sidebar-dropdown-link sidebar-dropdown-link-active" : "sidebar-dropdown-link"}
//                     >
//                       <FaExclamationTriangle className="inline-block mr-2 text-red-500" /> Min Qty
//                     </NavLink>
//                   )}
//                 </div>
//               )}
//             </div>

//             {role === "user" && (
//               <NavLink
//                 to="/sales"
//                 className={isActiveLink("/sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaFileInvoice /> Sales Bill
//               </NavLink>
//             )}
//             {(role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-sales"
//                 className={isActiveLink("/master-sales") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaFileInvoice /> Sales Bill
//               </NavLink>
//             )}

//             {role === "user" && (
//               <NavLink
//                 to="/orders"
//                 className={isActiveLink("/orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Orders
//               </NavLink>
//             )}
//             {(role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-orders"
//                 className={isActiveLink("/master-orders") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Orders
//               </NavLink>
//             )}

//             {role === "user" && (
//               <NavLink
//                 to="/add-customer"
//                 className={isActiveLink("/add-customer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Add Customer
//               </NavLink>
//             )}
//             {(role === "manager" || role === "megaadmin") && (
//               <NavLink
//                 to="/master-addcustomer"
//                 className={isActiveLink("/master-addcustomer") ? "sidebar-link sidebar-link-active" : "sidebar-link"}
//               >
//                 <FaClipboardList /> Customers
//               </NavLink>
//             )}
//           </>
//         )}

//         {/* Logout */}
//         <button onClick={handleLogout} className="sidebar-link text-green-600 hover:text-red-600 mt-4">
//           <FaSignOutAlt /> Logout
//         </button>
//       </nav>
//     </aside>
//   );
// }




// page refresh or f5 or ctrl+R click page refresh same page. dont need another page show. page refresh same page. manager and mega admin and user particular role same page