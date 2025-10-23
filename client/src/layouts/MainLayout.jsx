
// //src/layouts/MainLayouts
// import { useState } from "react";
// import { useLocation, Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";

// export default function MainLayout() {
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const hideLayout = ["/login", "/register"].includes(location.pathname);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {!hideLayout && (
//         <>
//           {/* Overlay (mobile only) */}
//           {sidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//               onClick={() => setSidebarOpen(false)}
//             ></div>
//           )}

//           {/* Sidebar */}
//           <div
//             className={`
//               fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col
//               transform transition-transform duration-300 ease-in-out
//               ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//               lg:translate-x-0 lg:static lg:inset-0
//             `}
//           >
//             <Sidebar closeSidebar={() => setSidebarOpen(false)} />
//           </div>
//         </>
//       )}

//       {/* Main content area */}
//       <div className="flex-1 flex flex-col">
//         {!hideLayout && (
//           <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
//         )}
//         <main
//           className={`flex-1 p-4 overflow-y-auto ${
//             hideLayout ? "flex items-center justify-center" : ""
//           }`}
//         >
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

 //src/layouts/MainLayouts
import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/Navbar";

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideLayout = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      {!hideLayout && (
        <>
          {/* 🔲 Overlay (Mobile only, fades in when sidebar opens) */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
              sidebarOpen ? "bg-opacity-50 visible" : "invisible"
            }`}
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* 🧭 Sidebar (slides in on mobile) */}
          <aside
            className={`
              bg-white h-full shadow-lg w-64 lg:static fixed z-50 inset-y-0 left-0
              transform transition-all duration-300 ease-in-out
              flex flex-col pr-6 py-6 pl-0
              ${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
              lg:translate-x-0 lg:opacity-100
            `}
          >
            <Sidebar closeSidebar={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* 🧱 Main Content Area */}
      <div className="flex-1 flex flex-col">
        {!hideLayout && (
          <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <main
          className={`flex-1 overflow-y-auto ${
            hideLayout
              ? "flex items-center justify-center"
              : "pt-24" // Adds space for navbar
          } p-6 sm:p-12`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}     



// import { useState } from "react";
// import { useLocation, Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";

// export default function MainLayout() {
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const hideLayout = ["/login", "/register"].includes(location.pathname);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {!hideLayout && (
//         <>
//           {/* Overlay (mobile only) */}
//           {sidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//               onClick={() => setSidebarOpen(false)}
//             ></div>
//           )}

//           {/* Sidebar */}
//           <div
//             className={`
//               fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col
//               transform transition-transform duration-300 ease-in-out
//               ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//               lg:translate-x-0 lg:static lg:inset-0
//             `}
//           >
//             {/* Remove left padding inside Sidebar by controlling inside Sidebar.jsx */}
//             <Sidebar closeSidebar={() => setSidebarOpen(false)} />
//           </div>
//         </>
//       )}

//       {/* Main content area */}
//       <div className="flex-1 flex flex-col">
//         {!hideLayout && (
//           <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
//         )}

//         <main
//           className={`flex-1 overflow-y-auto ${
//             hideLayout
//               ? "flex items-center justify-center"
//               : "pt-24" // Increased space below Navbar
//           } p-10`}
//         >
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }
