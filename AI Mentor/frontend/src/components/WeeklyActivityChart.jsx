import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function WeeklyActivityChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyActivity();
  }, []);

  const loadWeeklyActivity = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/dashboard/weekly-activity",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalThisWeek = data.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-700">
          Your Activity This Week
        </h2>

        {!loading && (
          <span className="text-sm text-gray-500">
            {totalThisWeek} {totalThisWeek === 1 ? "chat" : "chats"} total
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading activity...</p>
      ) : totalThisWeek === 0 ? (
        <p className="text-gray-500">
          No chats yet this week. Ask AI Mentor a question to see your activity here.
        </p>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#9333ea" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

export default WeeklyActivityChart;
