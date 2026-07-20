import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRobot, FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/auth/register", {
        username,
        email,
        password,
      });

      setSuccess("🎉 Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">

      <div className="bg-white w-[430px] rounded-3xl shadow-2xl p-10">

        <div className="flex flex-col items-center">

          <FaRobot
            size={55}
            className="text-purple-700 mb-4"
          />

          <h1 className="text-3xl font-bold text-purple-700">
            AI Mentor
          </h1>

          <p className="text-gray-500 mt-2">
            Create your account
          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5 mt-8"
        >

          <div>

            <label className="font-semibold">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter username"
              required
            />

          </div>

          <div>

            <label className="font-semibold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter email"
              required
            />

          </div>

          <div>

            <label className="font-semibold">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full mt-2 border rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                className="absolute top-6 right-4 text-gray-500"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>

          {error && (
            <div className="bg-red-100 text-red-700 rounded-xl p-3">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 rounded-xl p-3">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="text-center mt-6 text-gray-500">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-purple-700 font-semibold"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;