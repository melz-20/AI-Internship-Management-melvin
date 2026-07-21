import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { FaUserCircle, FaCamera } from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000";

function Profile() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {

    loadProfile();

  }, []);

  const loadProfile = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(

        `${API_BASE}/auth/profile`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );

      setUsername(response.data.username);
      setEmail(response.data.email);
      setProfilePicture(response.data.profile_picture);

      // Keep localStorage in sync so Navbar can show the avatar too
      if (response.data.profile_picture) {
        localStorage.setItem(
          "profile_picture",
          response.data.profile_picture
        );
      }

    }

    catch (err) {

      console.error(err);

      setError("Could not load profile.");

    }

    finally {

      setLoading(false);

    }

  };

  const updateProfile = async () => {

    setSaving(true);

    setMessage("");
    setError("");

    try {

      const token = localStorage.getItem("token");

      const response = await axios.put(

        `${API_BASE}/auth/profile`,

        {

          username,

          email,

        },

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );

      localStorage.setItem(
        "username",
        response.data.username
      );

      setMessage("✅ Profile updated successfully.");

    }

    catch (err) {

      console.error(err);

      setError(

        err.response?.data?.detail ||

        "Failed to update profile."

      );

    }

    finally {

      setSaving(false);

    }

  };

  const handlePictureSelect = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP images are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPicture(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE}/auth/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfilePicture(response.data.profile_picture);
      localStorage.setItem(
        "profile_picture",
        response.data.profile_picture
      );

      toast.success("Profile picture updated.");

    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploadingPicture(false);

      // Reset so selecting the same file again still triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-2xl text-purple-700">

        Loading Profile...

      </div>

    );

  }

  return (

    <div className="flex bg-purple-50 min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          <div className="bg-white rounded-2xl shadow-lg p-8">

            <div className="flex flex-col items-center">

              <div className="relative">

                {profilePicture ? (
                  <img
                    src={`${API_BASE}/auth/profile-picture/${profilePicture}`}
                    alt="Profile"
                    className="w-[120px] h-[120px] rounded-full object-cover border-4 border-purple-200"
                  />
                ) : (
                  <FaUserCircle
                    size={120}
                    className="text-purple-600"
                  />
                )}

                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingPicture}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white p-2 rounded-full shadow-lg transition"
                  title="Change profile picture"
                >
                  <FaCamera size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePictureSelect}
                />

              </div>

              {uploadingPicture && (
                <p className="text-sm text-gray-500 mt-2">
                  Uploading...
                </p>
              )}

              <h2 className="text-3xl font-bold mt-5">

                {username}

              </h2>

              <p className="text-gray-500">

                AIML Student

              </p>

            </div>

            <div className="grid grid-cols-2 gap-6 mt-10">

              <div>

                <label className="font-semibold">

                  Username

                </label>

                <input

                  value={username}

                  onChange={(e) =>

                    setUsername(e.target.value)

                  }

                  className="w-full border rounded-lg p-3 mt-2"

                />

              </div>

              <div>

                <label className="font-semibold">

                  Email

                </label>

                <input

                  value={email}

                  onChange={(e) =>

                    setEmail(e.target.value)

                  }

                  className="w-full border rounded-lg p-3 mt-2"

                />

              </div>

            </div>

            {message && (

              <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-xl">

                {message}

              </div>

            )}

            {error && (

              <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-xl">

                {error}

              </div>

            )}

            <button

              onClick={updateProfile}

              disabled={saving}

              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"

            >

              {saving

                ? "Updating..."

                : "Update Profile"}

            </button>

          </div>

        </main>

      </div>

    </div>

  );

}

export default Profile;
