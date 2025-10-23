// import { useState } from "react";
// import { FaBell, FaUserCircle } from "react-icons/fa";
// import NotificationDropdown from "./NotificationDropdown";
// import ProfileDropdown from "./ProfileDropdown";

// export default function Navbar() {
//   const [showNotif, setShowNotif] = useState(false);
//   const [showProfile, setShowProfile] = useState(false);

//   return (
//     <header className="flex justify-between items-center bg-white shadow px-4 py-2">
//       {/* Search bar */}
//       <input
//         type="text"
//         placeholder="Search..."
//         className="border rounded-lg px-3 py-1 w-1/2 md:w-1/3"
//       />

//       <div className="flex items-center gap-4 relative">
//         {/* Notification */}
//         <div className="relative">
//           <FaBell
//             className="text-xl cursor-pointer"
//             onClick={() => setShowNotif(!showNotif)}
//           />
//           {showNotif && <NotificationDropdown />}
//         </div>

//         {/* Profile */}
//         <div className="relative">
//           <FaUserCircle
//             className="text-2xl cursor-pointer"
//             onClick={() => setShowProfile(!showProfile)}
//           />
//           {showProfile && <ProfileDropdown />}
//         </div>
//       </div>
//     </header>
//   );
// }

// import React, { useContext } from "react";
// import { FaBars } from "react-icons/fa";
// import { useAuth } from "../context/AuthContext";
// import { ShopContext } from "../context/ShopContext";
// import logo from "../assets/logo-icon.png"; // replace with your logo path

// export default function TopNavbar({ toggleSidebar }) {
//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);

//   // Determine which shop name to show
//   const shopname = selectedShop?.shopname || user?.shopname || "Unknown Shop";

//   return (
//     <header className="bg-white shadow-md w-full fixed top-0 left-0 z-50 h-16">
//       <div className="relative flex items-center justify-between px-4 md:px-8 h-full">
//         {/* Left: Hamburger menu (visible only on mobile) */}
//         <div className="flex items-center gap-3">
//           <button
//             className="text-gray-600 hover:text-gray-900 md:hidden"
//             onClick={toggleSidebar} // ✅ toggles sidebar open/close
//           >
//             <FaBars size={22} />
//           </button>
//         </div>

//         {/* Center: Logo + Shop Name */}
//         <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
//           <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
//           <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[180px] sm:max-w-none">
//             {shopname}
//           </h1>
//         </div>
//       </div>
//     </header>
//   );
// }


// // src/components/Navbar.jsx
// import React, { useContext } from "react";
// import { FaBars } from "react-icons/fa";
// import { useAuth } from "../context/AuthContext";
// import { ShopContext } from "../context/ShopContext";
// import logo from "../assets/logo-icon.png";

// export default function Navbar({ toggleSidebar }) {
//   const { user } = useAuth();
//   const { selectedShop } = useContext(ShopContext);

//   // Default display name
//   let displayName = "CSI Diocese Book Depot";

//   // Show designation only for shop-level users
//   const designation = selectedShop?.designation || user?.designation || "";

//   if (user?.role !== "Manager" && user?.role !== "Mega Admin" && designation) {
//     displayName += ` (${designation})`;
//   }

//   return (
//     <header className="bg-white shadow-md w-full fixed top-0 left-0 z-50 h-16">
//       <div className="relative flex items-center justify-between px-4 md:px-8 h-full">
//         {/* Mobile Hamburger */}
//         <button
//           className="text-gray-600 hover:text-gray-900 md:hidden"
//           onClick={toggleSidebar}
//         >
//           <FaBars size={22} />
//         </button>

//         {/* Logo + Text */}
//         <div
//           className="
//             flex items-center gap-3
//             absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
//             md:static md:transform-none
//           "
//         >
//           <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
//           <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-none">
//             {displayName}
//           </h1>
//         </div>
//       </div>
//     </header>
//   );
// }


// // src/components/Navbar.jsx
// import React, { useEffect, useState } from "react";
// import { FaBars } from "react-icons/fa";
// import { useAuth } from "../context/AuthContext";
// import { useShop } from "../context/ShopContext";
// import logo from "../assets/logo-icon.png";

// export default function Navbar({ toggleSidebar }) {
//   const { user } = useAuth();
//   const { selectedShop, tenantData } = useShop();
//   const [displayName, setDisplayName] = useState("CSI Diocese Book Depot");

//   useEffect(() => {
//     // Base title
//     const base = "CSI Diocese Book Depot";

//     // Normalise role to avoid casing issues and handle variants
//     const role = (user?.role || "").toString().trim().toLowerCase();

//     // Manager or Mega Admin — always show base name
//     if (role === "manager" || role === "mega admin" || role === "megaadmin") {
//       setDisplayName(base);
//       return;
//     }

//     // For other users — show designation if available (live-updating)
//     // Priority: tenantData.designation > selectedShop.designation > user.designation
//     const designation =
//       (tenantData && tenantData.designation) ||
//       (selectedShop && selectedShop.designation) ||
//       user?.designation ||
//       "";

//     if (designation && designation.toString().trim() !== "") {
//       setDisplayName(`${base} (${designation})`);
//     } else {
//       setDisplayName(base);
//     }
//   }, [user, selectedShop, tenantData]);

//   return (
//     <header className="bg-white shadow-md w-full fixed top-0 left-0 z-50 h-16">
//       <div className="relative flex items-center justify-between px-4 md:px-8 h-full">
//         {/* Mobile Hamburger */}
//         <button
//           className="text-gray-600 hover:text-gray-900 md:hidden"
//           onClick={toggleSidebar}
//         >
//           <FaBars size={22} />
//         </button>

//         {/* Logo + Text */}
//         <div
//           className="
//             flex items-center gap-3
//             absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
//             md:static md:transform-none
//           "
//         >
//           <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
//           <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-none">
//             {displayName}
//           </h1>
//         </div>
//       </div>
//     </header>
//   );
// }



import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import logo from "../assets/logo-icon.png";

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();
  const { selectedShop } = useShop();
  const [displayName, setDisplayName] = useState("CSI Diocese Book Depot");

  useEffect(() => {
    if (!user) {
      setDisplayName("CSI Diocese Book Depot");
      return;
    }

    const role = user?.role?.trim();

    // 🟢 Manager / Mega Admin — Always fixed
    if (role === "Manager" || role === "Mega Admin") {
      setDisplayName("CSI Diocese Book Depot");
      return;
    }

    // 🟢 Normal User — show CSI Diocese Book Depot (shopname)
    if (role === "User") {
      // Check order: selectedShop → localStorage → user object
      const shopname =
        selectedShop?.shopname ||
        localStorage.getItem("shopname") ||
        user?.shopname ||
        user?.shop?.shopname;

      if (shopname) {
        const formatted =
          shopname.charAt(0).toUpperCase() + shopname.slice(1).toLowerCase();
        setDisplayName(`CSI Diocese Book Depot (${formatted})`);
      } else {
        setDisplayName("CSI Diocese Book Depot");
      }
      return;
    }

    setDisplayName("CSI Diocese Book Depot");
  }, [user, selectedShop]);

  // 🧠 Listen to localStorage changes in case user updates shop from other tab
  useEffect(() => {
    const handleStorageChange = () => {
      const shopname = localStorage.getItem("shopname");
      if (user?.role === "User" && shopname) {
        const formatted =
          shopname.charAt(0).toUpperCase() + shopname.slice(1).toLowerCase();
        setDisplayName(`CSI Diocese Book Depot (${formatted})`);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  // 🧩 Force sync when selectedShop changes (real-time)
  useEffect(() => {
    if (user?.role === "User" && selectedShop?.shopname) {
      const formatted =
        selectedShop.shopname.charAt(0).toUpperCase() +
        selectedShop.shopname.slice(1).toLowerCase();
      setDisplayName(`CSI Diocese Book Depot (${formatted})`);
    }
  }, [selectedShop?.shopname]);

  return (
    <header className="bg-white shadow-md w-full fixed top-0 left-0 z-50 h-16">
      <div className="relative flex items-center justify-between px-4 md:px-8 h-full">
        {/* ☰ Mobile Menu */}
        <button
          className="text-gray-600 hover:text-gray-900 md:hidden"
          onClick={toggleSidebar}
        >
          <FaBars size={22} />
        </button>

        {/* 🏷️ Logo + Title */}
        <div
          className="
            flex items-center gap-3
            absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
            md:static md:transform-none
          "
        >
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[250px] sm:max-w-none">
            {displayName}
          </h1>
        </div>
      </div>
    </header>
  );
}
