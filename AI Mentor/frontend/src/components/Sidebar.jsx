import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaRobot,
  FaUpload,
  FaHistory,
  FaCog,
  FaBrain,
} from "react-icons/fa";

function Sidebar() {
  const menu = [
    { name: "Dashboard", icon: <FaHome />, path: "/" },
    { name: "AI Mentor", icon: <FaRobot />, path: "/chat" },
    { name: "Upload Notes", icon: <FaUpload />, path: "/upload" },
    { name: "History", icon: <FaHistory />, path: "/history" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-900 via-purple-700 to-purple-500 text-white min-h-screen shadow-2xl flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-purple-500">

        <div className="flex items-center gap-3">
          <div className="bg-white text-purple-700 p-3 rounded-xl">
            <FaBrain size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              AI Mentor
            </h1>

            <p className="text-sm text-purple-200">
              Learn Smarter
            </p>
          </div>
        </div>

      </div>

      {/* Navigation */}
      <nav className="mt-6 flex flex-col gap-2 px-3">

        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-white text-purple-700 shadow-xl font-semibold"
                  : "hover:bg-purple-600 text-white"
              }`
            }
          >
            <span className="text-lg">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>
          </NavLink>
        ))}

      </nav>

      {/* Bottom Section */}
      <div className="mt-auto p-6">

        {/* Storage Card (Temporary) */}
        <div className="bg-purple-800 rounded-2xl p-4 mb-6 shadow-lg">

          <h3 className="font-semibold mb-2">
            Storage
          </h3>

          <div className="w-full bg-purple-500 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full w-1/4"></div>
          </div>

          <p className="text-xs mt-2 text-purple-200">
            25 MB of 100 MB Used
          </p>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
