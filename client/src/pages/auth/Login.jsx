



// //21/10/25
// // src/pages/auth/Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import logo from "../../assets/logo-icon.png";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//     // const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const persistUser = (token, user) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));
//     if (user?.shopname) {
//       localStorage.setItem("shopname", user.shopname);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // 1️⃣ Try Master Login first
//       const masterRes = await axios.post(`${API}/api/master/auth/login`, {
//         username,
//         password,
//       });

//       const { token, user } = masterRes.data;
//       persistUser(token, user);
//       navigate("/master-dashboard");
//       return; // stop if master login succeeds
//     } catch (masterErr) {
//       console.warn("Master login failed, fallback to tenant...");
//     }

//     try {
//       // 2️⃣ Find shop for tenant user via public API
//       const shopRes = await axios.get(
//         `${API}/api/shops/public/findByUsername/${username}`
//       );

//       const shopname = shopRes.data?.shopname;
//       if (!shopname) throw new Error("No shop found for this user");

//       // 3️⃣ Tenant login with shopname
//       const tenantRes = await axios.post(`${API}/api/tenant/auth/login`, {
//         username,
//         password,
//         shopname,
//       });

//       const { token, user } = tenantRes.data;
//       persistUser(token, user);
//       navigate("/dashboard");
//     } catch (tenantErr) {
//       console.error("Tenant login failed:", tenantErr);

//       // ✅ Special message for inactive users
//       if (tenantErr.response?.status === 403) {
//         setError("Your account is inactive. Please contact the administrator.");
//       } else {
//         setError(
//           tenantErr.response?.data?.message ||
//             tenantErr.message ||
//             "Login failed"
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         minHeight: "100vh",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#C8FAD6",
//         padding: "1rem",
//       }}
//     >
//       <form
//         onSubmit={handleLogin}
//         style={{
//           backgroundColor: "#ffffff",
//           padding: "2rem",
//           borderRadius: "1rem",
//           boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
//           width: "100%",
//           maxWidth: "400px",
//           display: "flex",
//           flexDirection: "column",
//           gap: "1rem",
//           transition: "all 0.3s ease-in-out",
//           animation: "fadeIn 0.5s ease-in-out",
//            alignItems: "center", // center logo and text
//         }}
//       >


//           {/* Logo */}
//   <img
//     src={logo}
//     alt="Logo"
//     style={{ width: "50px" }}
      
//   />

//   {/* Text below logo */}
//   <h2
//     style={{
//       fontSize: "1.25rem",
//       padding: "0",
//       fontWeight: "bold",
//       textAlign: "center",
//       color: "#007867",
//       // marginBottom: "1rem",
//     }}
//   >
//     CSI Diocese Book Depot
//   </h2>
  
//         <h3
//           style={{
//             fontSize: "2rem",
//             fontWeight: "bold",
//             textAlign: "center",
//             marginBottom: "1rem",
//             color: "#007867",
//             padding: "0"
//           }}
//         >
//           Sign In
//         </h3>

//         {error && (
//           <p style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
//             {error}
//           </p>
//         )}

//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//           style={{
//             padding: "0.75rem",
//             borderRadius: "0.5rem",
//             border: "1px solid #007867",
//             fontSize: "1rem",
//             transition: "all 0.3s ease",
//           }}
//           onFocus={(e) => (e.target.style.borderColor = "#00A76F")}
//           onBlur={(e) => (e.target.style.borderColor = "#007867")}
//         />

    
//   <div className="relative w-full max-w-sm">
//       <input
//         type={showPassword ? "text" : "password"}
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//         className="w-full px-4 py-3 border border-[#007867] rounded-lg text-base outline-none transition-all duration-300 focus:border-[#00A76F]"
//       />

//       <button
//         type="button"
//         onClick={() => setShowPassword(!showPassword)}
//         className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#007867] focus:outline-none"
//       >
//         {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
//       </button>
//     </div>
//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             padding: "0.75rem",
//             borderRadius: "0.5rem",
//             backgroundColor: "#00A76F",
//             color: "#fff",
//             fontWeight: "bold",
//             fontSize: "1rem",
//             cursor: loading ? "not-allowed" : "pointer",
//             transition: "all 0.3s ease",
//           }}
//           onMouseEnter={(e) => (e.target.style.backgroundColor = "#007867")}
//           onMouseLeave={(e) => (e.target.style.backgroundColor = "#00A76F")}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>

//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(-20px); }
//             to { opacity: 1; transform: translateY(0); }
//           }

//           @media (max-width: 768px) {
//             form {
//               padding: 1.5rem;
//               width: 90%;
//             }

//             h2 {
//               font-size: 1.75rem;
//             }

//             input, button {
//               font-size: 0.95rem;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }
  


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/logo-icon.png";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { setSelectedShop } = useShop();

  const persistUser = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (user?.shopname) localStorage.setItem("shopname", user.shopname);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Master login first
      const masterRes = await axios.post(`${API}/api/master/auth/login`, {
        username,
        password,
      });
      const { token, user } = masterRes.data;

      // Update context + localStorage
      persistUser(token, user);
      login(user, token);

      navigate("/master-dashboard", { replace: true });
      return;
    } catch (masterErr) {
      console.warn("Master login failed, fallback to tenant...");
    }

    try {
      // 2️⃣ Find shop for tenant user
      const shopRes = await axios.get(
        `${API}/api/shops/public/findByUsername/${username}`
      );
      const shopname = shopRes.data?.shopname;
      if (!shopname) throw new Error("No shop found for this user");

      // 3️⃣ Tenant login
      const tenantRes = await axios.post(`${API}/api/tenant/auth/login`, {
        username,
        password,
        shopname,
      });
      const { token, user } = tenantRes.data;

      // Update context + localStorage
      persistUser(token, user);
      login(user, token);

      if (user?.shopname) {
        setSelectedShop({
          _id: user._id,
          shopname: user.shopname,
          designation: user.designation || "",
          contact: user.contact || "",
          address: user.address || "",
        });
      }

      navigate("/dashboard", { replace: true });
    } catch (tenantErr) {
      console.error("Tenant login failed:", tenantErr);

      if (tenantErr.response?.status === 403) {
        setError("Your account is inactive. Please contact the administrator.");
      } else {
        setError(
          tenantErr.response?.data?.message ||
            tenantErr.message ||
            "Login failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#C8FAD6",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          transition: "all 0.3s ease-in-out",
          animation: "fadeIn 0.5s ease-in-out",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <img src={logo} alt="Logo" style={{ width: "50px" }} />

        {/* Main Heading */}
        <h2
          style={{
            fontSize: "1.25rem",
            padding: "0",
            fontWeight: "bold",
            textAlign: "center",
            color: "#007867",
          }}
        >
          CSI Diocese Book Depot
        </h2>

        <h3
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "1rem",
            color: "#007867",
            padding: "0",
          }}
        >
          Sign In
        </h3>

        {error && (
          <p style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #007867",
            fontSize: "1rem",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#00A76F")}
          onBlur={(e) => (e.target.style.borderColor = "#007867")}
        />

        <div className="relative w-full max-w-sm">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#007867] rounded-lg text-base outline-none transition-all duration-300 focus:border-[#00A76F]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#007867] focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            borderRadius: "0.5rem",
            backgroundColor: "#00A76F",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007867")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#00A76F")}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 768px) {
            form {
              padding: 1.5rem;
              width: 90%;
            }

            h2 {
              font-size: 1.75rem;
            }

            input, button {
              font-size: 0.95rem;
            }
          }
        `}
      </style>
    </div>
  );
}
