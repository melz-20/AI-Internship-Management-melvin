import {
  MdDashboard,
  MdAnalytics,
  MdSettings,
  MdLogout,
  MdPeople,
} from "react-icons/md";

import {
  FaUserGraduate,
  FaFileAlt,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import Avatar from "./Avatar";

function Sidebar() {

  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard size={22} />,
      path: "/",
    },
    {
      name: "Students",
      icon: <FaUserGraduate size={20} />,
      path: "/students",
    },
    {
      name: "Classification",
      icon: <MdPeople size={20} />,
      path: "/students",
    },
    {
      name: "Analytics",
      icon: <MdAnalytics size={20} />,
      path: "/analytics",
    },
    {
      name: "Reports",
      icon: <FaFileAlt size={18} />,
      path: "/reports",
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between shadow-sm">

      {/* Logo */}

      <div>

        <div className="p-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white font-bold text-xl">
              AI
            </div>

            <div>

              <h2 className="font-bold text-xl">
                Internship Hub
              </h2>

              <p className="text-sm text-gray-500">
                Management System
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <div className="px-5 space-y-2">

          {menuItems.map((item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
                  isActive
                    ? "theme-bg text-white"
                    : "theme-hover text-gray-700"
                }`
              }
            >

              {item.icon}

              <span>{item.name}</span>

            </NavLink>

          ))}

          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-4 rounded-2xl px-5 py-4 transition ${isActive ? "theme-bg text-white" : "theme-hover text-gray-700"}`}>

            <MdSettings size={20} />

            Settings

          </NavLink>

        </div>

      </div>

      {/* Profile */}

      <div className="border-t p-6">

        <div className="flex items-center gap-3">

          <Avatar name="Admin" />

          <div>

            <h3 className="font-semibold">
              Admin
            </h3>

            <p className="text-sm text-gray-500">
              Administrator
            </p>

          </div>

        </div>

        <button className="flex items-center gap-3 text-red-500 mt-6 hover:text-red-600">

          <MdLogout size={20} />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Sidebar;
