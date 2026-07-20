import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaBell,
  FaUserCircle,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("Student");
  const [profilePicture, setProfilePicture] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPicture = localStorage.getItem("profile_picture");

    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (storedPicture) {
      setProfilePicture(storedPicture);
    }
  }, []);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOnChatPage = location.pathname === "/chat";

  const handleNewChat = () => {
    // Navigating to a bare /chat (no conversation_id) starts a fresh
    // conversation -- no need for a full page reload.
    navigate("/chat");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("profile_picture");

    navigate("/login");
  };

  const toggleNotifications = async () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);

    if (opening) {
      setLoadingNotifications(true);

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE}/dashboard/recent-activity`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotifications(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingNotifications(false);
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-8 relative">

      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-purple-700">
          AI Mentor
        </h1>

        <p className="text-sm text-gray-500">
          Smart Internship Hub
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        {/* New Chat -- only shown while on the Chat page */}
        {isOnChatPage && (
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow transition"
          >
            <FaPlus />
            New Chat
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>

          <button
            onClick={toggleNotifications}
            className="text-purple-700 hover:text-purple-900"
          >
            <FaBell size={22} />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border z-50">

              <div className="p-4 border-b font-semibold text-purple-700">
                Recent Activity
              </div>

              <div className="max-h-80 overflow-y-auto">

                {loadingNotifications && (
                  <p className="p-4 text-sm text-gray-500">Loading...</p>
                )}

                {!loadingNotifications && notifications.length === 0 && (
                  <p className="p-4 text-sm text-gray-500">
                    No recent activity yet.
                  </p>
                )}

                {!loadingNotifications &&
                  notifications.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 border-b last:border-b-0 text-sm"
                    >
                      <p className="text-gray-700">
                        {item.type === "upload" ? "📄 " : "🤖 "}
                        {item.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(item.time)}
                      </p>
                    </div>
                  ))}

              </div>

            </div>
          )}

        </div>

        {/* User */}
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          title="View Profile"
        >

          {profilePicture ? (
            <img
              src={`${API_BASE}/auth/profile-picture/${profilePicture}`}
              alt="Profile"
              className="w-[38px] h-[38px] rounded-full object-cover border-2 border-purple-200"
            />
          ) : (
            <FaUserCircle
              size={38}
              className="text-purple-700"
            />
          )}

          <div>
            <p className="font-semibold">
              {username}
            </p>

            <p className="text-xs text-gray-500">
              Student
            </p>
          </div>

        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;
