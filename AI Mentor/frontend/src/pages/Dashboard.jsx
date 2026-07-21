import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import WeeklyActivityChart from "../components/WeeklyActivityChart";
import QuickActions from "../components/QuickActions";

import { motion } from "framer-motion";

import {
  FaRobot,
  FaFilePdf,
  FaComments,
  FaClock,
} from "react-icons/fa";

function Dashboard() {

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Student"
  );

  const [stats, setStats] = useState({
    ai_chats: 0,
    uploaded_pdfs: 0,
    questions: 0,
    study_hours: 0,
  });

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadRecentActivity();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/dashboard/recent-activity",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActivity(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex bg-purple-50 min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          {/* Welcome Banner */}

          <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-purple-500 rounded-3xl text-white p-8 shadow-xl">

            <h1 className="text-4xl font-bold">
              Welcome Back, {username} 👋
            </h1>

            <p className="mt-3 text-lg text-purple-100">
              Continue learning with your AI Mentor and improve your skills every day.
            </p>

          </div>

          {/* Statistics */}

          <div className="grid grid-cols-4 gap-6 mt-10">

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <FaRobot
                size={40}
                className="text-purple-600"
              />

              <h2 className="mt-4 text-lg font-semibold">
                AI Chats
              </h2>

              <p className="text-5xl font-bold text-purple-700 mt-3">
                {stats.ai_chats}
              </p>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <FaFilePdf
                size={40}
                className="text-red-500"
              />

              <h2 className="mt-4 text-lg font-semibold">
                Uploaded PDFs
              </h2>

              <p className="text-5xl font-bold text-purple-700 mt-3">
                {stats.uploaded_pdfs}
              </p>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <FaComments
                size={40}
                className="text-blue-500"
              />

              <h2 className="mt-4 text-lg font-semibold">
                Questions
              </h2>

              <p className="text-5xl font-bold text-purple-700 mt-3">
                {stats.questions}
              </p>

            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <FaClock
                size={40}
                className="text-green-500"
              />

              <h2 className="mt-4 text-lg font-semibold">
                Study Hours
              </h2>

              <p className="text-5xl font-bold text-purple-700 mt-3">
                {stats.study_hours}
              </p>

            </motion.div>

          </div>

          {/* AI Mentor */}

          <div className="mt-10">
            <WeeklyActivityChart />
          </div>

          {/* Quick Actions */}

          <div className="mt-10">
            <QuickActions />
          </div>

          {/* Recent Activity */}

          <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

            <h2 className="text-2xl font-bold text-purple-700 mb-6">
              Recent Activity
            </h2>

            <div className="space-y-5">

              {activity.length === 0 && (
                <div className="border-l-4 border-purple-600 pl-4 text-gray-500">
                  No activity yet — upload a PDF or start a chat to get going.
                </div>
              )}

              {activity.map((item, index) => (
                <div
                  key={index}
                  className={
                    item.type === "upload"
                      ? "border-l-4 border-red-500 pl-4"
                      : "border-l-4 border-blue-500 pl-4"
                  }
                >
                  {item.type === "upload" ? "📄 " : "🤖 "}
                  {item.text}
                </div>
              ))}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;
