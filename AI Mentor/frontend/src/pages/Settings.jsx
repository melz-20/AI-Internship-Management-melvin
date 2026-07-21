import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  FaSignOutAlt,
  FaLock,
  FaTrash,
  FaBell,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";

function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // -------------------------
  // Settings
  // -------------------------
  const [notifications, setNotifications] = useState(true);

  // -------------------------
  // Password
  // -------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // -------------------------
  // Load Saved Settings
  // -------------------------
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/auth/settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(response.data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  // -------------------------
  // Save Settings
  // -------------------------
  const saveSettings = async () => {
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/auth/settings",
        {
          notifications,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message || "Settings saved successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Could not save settings.");
    }
  };

  // -------------------------
  // Change Password
  // -------------------------

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/auth/change-password",
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Could not change password."
      );
    }

    setLoading(false);
  };

  // -------------------------
  // Delete Account
  // -------------------------

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "This will permanently delete your account, chats and uploaded PDFs.\n\nContinue?"
    );

    if (!confirmDelete) return;

    setDeleteLoading(true);

    try {
      await axios.delete(
        "http://127.0.0.1:8000/auth/delete-account",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Account deleted successfully.");

      localStorage.removeItem("token");
      localStorage.removeItem("username");

      navigate("/login");

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.detail ||
        "Failed to delete account."
      );
    }

    setDeleteLoading(false);
  };

  // -------------------------
  // Logout
  // -------------------------

  const logout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/login");
  };

  return (
    <div className="flex bg-purple-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">

          <h1 className="text-4xl font-bold text-purple-700 mb-8">
            Settings
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">

            {/* Notifications */}

            <div className="border-b pb-6">

              <div className="flex items-center gap-3 mb-4">
                <FaBell className="text-purple-600" />
                <h2 className="text-xl font-semibold">
                  Notifications
                </h2>
              </div>

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) =>
                    setNotifications(e.target.checked)
                  }
                />

                Enable Notifications

              </label>

            </div>

            <button
              onClick={saveSettings}
              className="bg-purple-600 hover:bg-purple-700 transition text-white px-6 py-3 rounded-xl"
            >
              Save Settings
            </button>

            {/* Password */}

            <div className="border-b pb-6">

              <div className="flex items-center gap-3 mb-6">
                <FaLock className="text-purple-600" />
                <h2 className="text-xl font-semibold">
                  Change Password
                </h2>
              </div>

              <div className="space-y-4">

                <div className="relative">

                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    className="w-full border rounded-xl p-3 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-4"
                  >
                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    className="w-full border rounded-xl p-3 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-4"
                  >
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full border rounded-xl p-3 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(!showConfirm)
                    }
                    className="absolute right-4 top-4"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

                <button
                  onClick={changePassword}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 transition text-white px-6 py-3 rounded-xl"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

              </div>

            </div>

            {/* Delete Account */}

            <div className="border-b pb-6">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-semibold text-red-600">
                    Delete Account
                  </h2>

                  <p className="text-gray-500">
                    Permanently delete your account and all chats.
                  </p>
                </div>

                <button
                  onClick={deleteAccount}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-5 py-2 rounded-xl transition"
                >
                  {deleteLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete
                    </>
                  )}
                </button>

              </div>

            </div>

            {/* Logout */}

            <div className="flex justify-end">

              <button
                onClick={logout}
                className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Settings;
