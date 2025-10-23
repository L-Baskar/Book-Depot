// import { Link } from "react-router-dom";
// import {
//   FaHome,
//   FaInbox,
//   FaComments,
//   FaBolt,
//   FaUserCog,
//   FaSignOutAlt,
// } from "react-icons/fa";

// export default function ProfileDropdown() {
//   return (
//     <div className="absolute right-0 mt-2 w-56 bg-white shadow rounded-lg p-3">
//       <div className="flex items-center gap-3 border-b pb-2 mb-2">
//         <img
//           src="https://via.placeholder.com/40"
//           alt="profile"
//           className="w-10 h-10 rounded-full"
//         />
//         <div>
//           <p className="font-bold">John Doe</p>
//           <p className="text-sm text-gray-500">Admin</p>
//         </div>
//       </div>

//       <ul className="space-y-2 text-gray-500 text-[14px] ">
//         <li><Link to="/" className="flex items-center gap-2"><FaHome /> Home</Link></li>
//         <li><Link to="/inbox" className="flex items-center gap-2"><FaInbox /> Inbox</Link></li>
//         <li><Link to="/chat" className="flex items-center gap-2"><FaComments /> Chat</Link></li>
//         <li><Link to="/activity" className="flex items-center gap-2"><FaBolt /> Activity</Link></li>
//         <li><Link to="/account" className="flex items-center gap-2"><FaUserCog /> Account Settings</Link></li>
//         <li><Link to="/logout" className="flex items-center gap-2"><FaSignOutAlt /> Logout</Link></li>
//       </ul>
//     </div>
//   );
// }






import { Link } from "react-router-dom";
import {
  FaHome,
  FaInbox,
  FaComments,
  FaBolt,
  FaUserCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function ProfileDropdown() {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white shadow rounded-lg p-3 font-['Public_Sans']">
      {/* Profile Header */}
      <div className="flex items-center gap-3 border-b pb-2 mb-2">
        <img
          src="https://via.placeholder.com/40"
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-bold text-gray-800 text-[15px]">John Doe</p>
          <p className="text-sm text-gray-500">Admin</p>
        </div>
      </div>

      {/* Menu List */}
      <ul className="space-y-2 text-gray-600 text-[14px]">
        <li>
          <Link to="/" className="flex items-center gap-2 hover:text-[#007867]">
            <FaHome /> Home
          </Link>
        </li>
        <li>
          <Link
            to="/inbox"
            className="flex items-center gap-2 hover:text-[#007867]"
          >
            <FaInbox /> Inbox
          </Link>
        </li>
        <li>
          <Link
            to="/chat"
            className="flex items-center gap-2 hover:text-[#007867]"
          >
            <FaComments /> Chat
          </Link>
        </li>
        <li>
          <Link
            to="/activity"
            className="flex items-center gap-2 hover:text-[#007867]"
          >
            <FaBolt /> Activity
          </Link>
        </li>
        <li>
          <Link
            to="/account"
            className="flex items-center gap-2 hover:text-[#007867]"
          >
            <FaUserCog /> Account Settings
          </Link>
        </li>
        <li>
          <Link
            to="/logout"
            className="flex items-center gap-2  hover:text-[#007867]"
          >
            <FaSignOutAlt /> Logout
          </Link>
        </li>
      </ul>
    </div>
  );
}
