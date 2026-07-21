import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PerformanceChart from "../components/PerformanceChart";
import DepartmentChart from "../components/DepartmentChart";

import {
  MdPeople,
  MdTrendingUp,
  MdSchool,
  MdBusiness,
} from "react-icons/md";

const API_URL = "http://127.0.0.1:5000";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadAnalytics = async () => {
      try {
        const responses = await Promise.all([
          fetch(`${API_URL}/analytics/performance`, { signal: controller.signal }),
          fetch(`${API_URL}/analytics/departments`, { signal: controller.signal }),
          fetch(`${API_URL}/analytics/companies`, { signal: controller.signal }),
          fetch(`${API_URL}/analytics/average-score`, { signal: controller.signal }),
        ]);
        const results = await Promise.all(responses.map((response) => response.json()));

        const failedResult = results.find(
          (result, index) => !responses[index].ok || !result.success,
        );

        if (failedResult) {
          throw new Error(failedResult.message || "Unable to load analytics data.");
        }

        setAnalytics({
          performance: results[0].data,
          departments: results[1].data,
          companies: results[2].data,
          averageScores: results[3].data,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load analytics data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => controller.abort();
  }, []);

  const totalStudents = analytics
    ? Object.values(analytics.performance).reduce((total, count) => total + count, 0)
    : 0;
  const departmentCounts = analytics
    ? Object.fromEntries(
        analytics.departments.map((department) => [
          department.department,
          department.student_count,
        ]),
      )
    : {};
  const averageScore = analytics && totalStudents
    ? (
        analytics.averageScores.reduce(
          (total, score) => total + Number(score.average_score) * departmentCounts[score.department],
          0,
        ) / totalStudents
      ).toFixed(2)
    : "0.00";
  const categories = analytics
    ? [
        { name: "Outstanding", value: analytics.performance.outstanding, color: "text-green-600" },
        { name: "Excellent", value: analytics.performance.excellent, color: "text-blue-600" },
        { name: "Good", value: analytics.performance.good, color: "text-yellow-500" },
        { name: "Satisfactory", value: analytics.performance.satisfactory, color: "text-orange-500" },
        { name: "Needs Improvement", value: analytics.performance.needs_improvement, color: "text-red-500" },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-[#F8F7FC]">
      <Sidebar />

      <div className="flex-1 p-6 overflow-y-auto">
        <Navbar />

        <div className="mt-8">
          <h1 className="text-4xl font-bold">Analytics Dashboard</h1>

          <p className="text-gray-500 mt-2">
            Monitor internship performance and AI classification insights.
          </p>
        </div>

        {isLoading && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mt-8 text-gray-500">
            Loading analytics data...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mt-8 text-red-500">
            {error}
          </div>
        )}

        {!isLoading && !error && analytics && (
          <>
            <div className="grid grid-cols-4 gap-6 mt-8">
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <MdPeople size={40} className="text-violet-600" />
                <h2 className="text-3xl font-bold mt-4">{totalStudents}</h2>
                <p className="text-gray-500">Total Students</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-6">
                <MdTrendingUp size={40} className="text-green-500" />
                <h2 className="text-3xl font-bold mt-4">{averageScore}%</h2>
                <p className="text-gray-500">Average Score</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-6">
                <MdSchool size={40} className="text-blue-500" />
                <h2 className="text-3xl font-bold mt-4">{analytics.departments.length}</h2>
                <p className="text-gray-500">Departments</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-6">
                <MdBusiness size={40} className="text-orange-500" />
                <h2 className="text-3xl font-bold mt-4">{analytics.companies.length}</h2>
                <p className="text-gray-500">Internship Companies</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <PerformanceChart distribution={analytics.performance} />
              <DepartmentChart departmentScores={analytics.averageScores} />
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-8 mt-8">
              <h2 className="text-2xl font-bold mb-6">AI Classification Summary</h2>

              <div className="grid grid-cols-5 gap-5">
                {categories.map((category) => (
                  <div key={category.name} className="text-center">
                    <h3 className={`text-4xl font-bold ${category.color}`}>
                      {category.value}
                    </h3>

                    <p>{category.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
