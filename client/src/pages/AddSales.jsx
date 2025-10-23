// import { useState } from "react";
// import axios from "axios";
// import "../styles/salesbill.css";

// export default function AddSales() {
//   const [form, setForm] = useState({
//     billNo: "",
//     customerName: "",
//     mobile: "",
//     netAmount: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:5000/api/sales", {
//         ...form,
//         items: [], // later replace with table input
//         total: form.netAmount,
//         discount: 0,
//         cashGiven: form.netAmount,
//         balance: 0,
//       });
//       alert("Sales bill added successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Error saving bill");
//     }
//   };

//   return (
//     <div className="salesbill-container">
//       <h1 className="salesbill-title">Add Sales Bill</h1>
//       <form className="salesbill-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="billNo"
//           placeholder="Bill No"
//           value={form.billNo}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           name="customerName"
//           placeholder="Customer Name"
//           value={form.customerName}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           name="mobile"
//           placeholder="Mobile Number"
//           value={form.mobile}
//           onChange={handleChange}
//         />
//         <input
//           type="number"
//           name="netAmount"
//           placeholder="Net Amount"
//           value={form.netAmount}
//           onChange={handleChange}
//         />
//         <button type="submit" className="add-btn">Save</button>
//       </form>
//     </div>
//   );
// }
