
// // src/context/ShopContext.jsx
// import { createContext, useContext, useState } from "react";

// export const ShopContext = createContext();

// export const ShopProvider = ({ children }) => {
//   // ✅ Initialize selectedShop directly from localStorage
//   const storedShop = localStorage.getItem("shopname");
//   const storedShopId = localStorage.getItem("shopId");
//   const storedDesignation = localStorage.getItem("designation");
//   const storedContact = localStorage.getItem("contact");
//   const storedAddress = localStorage.getItem("address");

//   const initialShop =
//     storedShop && storedShopId
//       ? {
//           _id: storedShopId,
//           shopname: storedShop.trim().toLowerCase(),
//           designation: storedDesignation || "",
//           contact: storedContact || "",
//           address: storedAddress || "",
//         }
//       : null;

//   const [selectedShop, setSelectedShop] = useState(initialShop);
//   const [tenantData, setTenantData] = useState(null);
//   const [loadingTenantData, setLoadingTenantData] = useState(false);

//   return (
//     <ShopContext.Provider
//       value={{
//         selectedShop,
//         setSelectedShop,
//         tenantData,
//         setTenantData,
//         loadingTenantData,
//         setLoadingTenantData,
//       }}
//     >
//       {children}
//     </ShopContext.Provider>
//   );
// };

// export const useShop = () => useContext(ShopContext);


// // src/context/ShopContext.jsx   
// import { createContext, useContext, useState, useEffect } from "react";

// export const ShopContext = createContext();

// export const ShopProvider = ({ children }) => {
//   const [selectedShop, setSelectedShop] = useState(null);
//   const [tenantData, setTenantData] = useState(null);
//   const [loadingTenantData, setLoadingTenantData] = useState(false);

//   // // Restore selectedShop from localStorage
//   // useEffect(() => {
//   //   const storedShop = localStorage.getItem("shopname");
//   //   const storedShopId = localStorage.getItem("shopId");

//   //   if (storedShop && storedShopId && !selectedShop) {
//   //     // ✅ normalize to lowercase before saving to state
//   //     setSelectedShop({ _id: storedShopId, shopname: storedShop.trim().toLowerCase() });
//   //   }
//   // }, []);

//     // ✅ Restore selectedShop from localStorage
//   useEffect(() => {
//     const storedShop = localStorage.getItem("shopname");
//     const storedShopId = localStorage.getItem("shopId");
//     const storedDesignation = localStorage.getItem("designation");
//     const storedContact = localStorage.getItem("contact");
//     const storedAddress = localStorage.getItem("address");

//     if (storedShop && storedShopId && !selectedShop) {
//       // ✅ Normalize to lowercase before saving to state
//       setSelectedShop({
//         _id: storedShopId,
//         shopname: storedShop.trim().toLowerCase(),
//         designation: storedDesignation || "",
//         contact: storedContact || "",
//         address: storedAddress || "",
//       });
//     }
//   }, []);


//   return (
//     <ShopContext.Provider
//       value={{
//         selectedShop,
//         setSelectedShop,
//         tenantData,
//         setTenantData,
//         loadingTenantData,
//         setLoadingTenantData,
//       }}
//     >
//       {children}
//     </ShopContext.Provider>
//   );
// };

// export const useShop = () => useContext(ShopContext);


//17/10/25
// // src/context/ShopContext.jsx
// import { createContext, useContext, useState, useEffect } from "react";

// export const ShopContext = createContext();

// export const ShopProvider = ({ children }) => {
//   const [selectedShop, setSelectedShop] = useState(null);
//   const [tenantData, setTenantData] = useState(null);
//   const [loadingTenantData, setLoadingTenantData] = useState(false);

//   useEffect(() => {
//     const storedShop = localStorage.getItem("shopname");
//     const storedShopId = localStorage.getItem("shopId");

//     if (storedShop && storedShopId && !selectedShop) {
//       setSelectedShop({ _id: storedShopId, shopname: storedShop.trim() });
//     }
//   }, []);

//   return (
//     <ShopContext.Provider
//       value={{ selectedShop, setSelectedShop, tenantData, setTenantData, loadingTenantData, setLoadingTenantData }}
//     >
//       {children}
//     </ShopContext.Provider>
//   );
// };

// export const useShop = () => useContext(ShopContext);



// src/context/ShopContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [selectedShop, setSelectedShop] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [loadingTenantData, setLoadingTenantData] = useState(false);

  useEffect(() => {
    // Check if user exited shop
    const exitFlag = localStorage.getItem("exitShop");
    if (exitFlag) {
      setSelectedShop(null);
      return;
    }

    // Restore selected shop
    const storedShop = localStorage.getItem("selectedShop");
    if (storedShop) {
      try {
        setSelectedShop(JSON.parse(storedShop));
      } catch (err) {
        console.warn("Failed to parse selectedShop from localStorage:", err);
      }
    }
  }, []);

  return (
    <ShopContext.Provider
      value={{
        selectedShop,
        setSelectedShop,
        tenantData,
        setTenantData,
        loadingTenantData,
        setLoadingTenantData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
