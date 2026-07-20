import { FiSearch, FiBell, FiCalendar, FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

function Navbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm px-8 py-5 flex items-center justify-between">

      {/* Search Bar */}
      <div className="relative">

        <FiSearch
          className="absolute left-4 top-3.5 text-gray-400"
          size={20}
        />

        <input
          type="text"
          placeholder="Search students, companies, reports..."
          className="w-[420px] pl-12 pr-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
        />

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Date */}
        <div className="flex items-center gap-2 bg-violet-50 px-4 py-2 rounded-xl">

          <FiCalendar className="text-violet-600" />

          <span className="text-sm font-medium text-gray-700">
            {today}
          </span>

        </div>

        <Link to="/settings" title="Settings" className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-violet-600 transition hover:bg-violet-100"><FiSettings size={20} /></Link>

        {/* Notifications */}
        <div className="relative cursor-pointer">

          <button className="w-11 h-11 rounded-full bg-gray-100 hover:bg-violet-100 transition flex items-center justify-center">

            <FiBell
              size={20}
              className="text-violet-600"
            />

          </button>

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </span>

        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">

          <Avatar name="Admin" className="border-2 border-violet-200" />

          <div>

            <h2 className="font-semibold text-gray-800">
              Admin
            </h2>

            <p className="text-sm text-gray-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Navbar;
