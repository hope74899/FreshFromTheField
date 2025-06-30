import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBoxes, FaCheckCircle, FaTimesCircle, FaStar, FaUsers, FaTractor, FaUserTie } from 'react-icons/fa';
import { RiMenuUnfold4Fill, RiShoppingCart2Line, RiMenuUnfold3Fill } from "react-icons/ri";
import { TbLayoutGridAdd } from "react-icons/tb";
import { MdSpaceDashboard } from "react-icons/md";
import { useAuth } from "../../auth/AuthToken";
import { FaTruck } from "react-icons/fa6";
import { AiOutlineShoppingCart } from "react-icons/ai";

const Sidebar = () => {
  // State to manage sidebar expansion
  const { role } = useAuth();
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768); // Default to expanded for md and larger screens

  // Toggle sidebar state
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const navLinkStyle = ({ isActive }) => {
    return `flex items-center space-x-2 px-4 py-2 justify-start hover:text-yellow-400 transition-colors duration-200 ${isActive ? "text-white font-bold  border-b-2 border-yellow-600" : ""
      }`;
  };

  return (
    <aside
      className={`flex flex-col bg-green-800 text-white pt-4 transition-all duration-300 
      ${isExpanded ? "w-56" : "w-16"} max-h-screen`}
      style={{
        minWidth: isExpanded ? "14rem" : "4rem",
        maxWidth: isExpanded ? "14rem" : "4rem",
        width: isExpanded ? "14rem" : "4rem", // Ensure consistent width
        // padding: 0, // Remove extra padding
      }}
    >
      {/* Toggle Button */}
      <div className="flex items-center px-4 pb-4">
        {isExpanded ? (
          <RiMenuUnfold4Fill
            className="text-2xl cursor-pointer hover:text-gray-300"
            onClick={toggleSidebar}
          />
        ) : (
          <RiMenuUnfold3Fill
            className="text-2xl cursor-pointer hover:text-gray-300"
            onClick={toggleSidebar}
          />
        )}
      </div>
      {/* Navigation Items */}
      <div>
        <ul className="flex-grow w-full">
          {role === "farmer" && (
            <>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/home" className={navLinkStyle}>
                  <MdSpaceDashboard className="text-xl" />
                  {isExpanded && <span>Home</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/orderHistory" className={navLinkStyle}>
                  <RiShoppingCart2Line className="text-xl" />
                  {isExpanded && <span>Orders</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/products" className={navLinkStyle}>
                  <FaBoxes className="text-xl" />
                  {isExpanded && <span>Total Products</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/add" className={navLinkStyle}>
                  <TbLayoutGridAdd className="text-xl" />
                  {isExpanded && <span>Add Products</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/pending" className={navLinkStyle}>
                  <FaTimesCircle className="text-xl" />
                  {isExpanded && <span>Pending Products</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/approved" className={navLinkStyle}>
                  <FaCheckCircle className="text-xl" />
                  {isExpanded && <span>Approved Products</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/farmer/dashboard/best" className={navLinkStyle}>
                  <FaStar className="text-xl" />
                  {isExpanded && <span>Best Products</span>}
                </NavLink>
              </li>
            </>
          )}
          {role === "transporter" && (
            <>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/transporter/dashboard/home" className={navLinkStyle}>
                  <MdSpaceDashboard className="text-xl" />
                  {isExpanded && <span>Home</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/transporter/dashboard/Vehicles" className={navLinkStyle}>
                  <FaTruck className="text-xl" />
                  {isExpanded && <span>Total Vehicles</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/transporter/dashboard/add" className={navLinkStyle}>
                  <TbLayoutGridAdd className="text-xl" />
                  {isExpanded && <span>Add Vehicles</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/transporter/dashboard/pending" className={navLinkStyle}>
                  <FaTimesCircle className="text-xl" />
                  {isExpanded && <span>Pending Vehicles</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/transporter/dashboard/approved" className={navLinkStyle}>
                  <FaCheckCircle className="text-xl" />
                  {isExpanded && <span>Approved Vehicles</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/transporter/dashboard/best" className={navLinkStyle}>
                  <FaStar className="text-xl" />
                  {isExpanded && <span>Best Vehicles</span>}
                </NavLink>
              </li>
            </>
          )}
          {role === "admin" && (
            <>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/admin/dashboard/home" className={navLinkStyle}>
                  <MdSpaceDashboard className="text-xl" />
                  {isExpanded && <span>Home</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/admin/dashboard/products" className={navLinkStyle}>
                  <FaTimesCircle className="text-xl" />
                  {isExpanded && <span>Pending Products</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/admin/dashboard/orders" className={navLinkStyle}>
                  <AiOutlineShoppingCart className="text-xl" />
                  {isExpanded && <span>Orders</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/admin/dashboard/users" className={navLinkStyle}>
                  <FaUsers className="text-xl" />
                  {isExpanded && <span>Users</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/admin/dashboard/farmers" className={navLinkStyle}>
                  <FaTractor className="text-xl" />
                  {isExpanded && <span>Farmers</span>}
                </NavLink>
              </li>
              <li className="border-b border-gray-500 w-full">
                <NavLink to="/admin/dashboard/transporter" className={navLinkStyle}>
                  <FaUserTie className="text-xl" />
                  {isExpanded && <span>Transporter</span>}
                </NavLink>
              </li>
            </>

          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
