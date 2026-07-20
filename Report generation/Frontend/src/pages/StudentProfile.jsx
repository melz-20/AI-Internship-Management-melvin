import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";

const API_URL = "http://127.0.0.1:5000";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadStudent = async () => {
      try {
        const response = await fetch(`${API_URL}/students/${id}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load student details.");
        }

        setStudent(result.data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load student details.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadStudent();

    return () => controller.abort();
  }, [id]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateValue));
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC]">
      <Sidebar />

      <div className="flex-1 p-6 overflow-y-auto">
        <Navbar />

        {isLoading && (
          <div className="bg-white rounded-3xl shadow-sm p-8 mt-8 text-gray-500">
            Loading student details...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-white rounded-3xl shadow-sm p-8 mt-8">
            <p className="text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="mt-6 bg-violet-600 text-white px-6 py-3 rounded-2xl hover:bg-violet-700"
            >
              Back to Students
            </button>
          </div>
        )}

        {!isLoading && !error && student && (
          <div className="bg-white rounded-3xl shadow-sm p-8 mt-8">
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="bg-violet-100 text-violet-700 px-5 py-3 rounded-2xl hover:bg-violet-200"
            >
              Back to Students
            </button>

            <div className="flex gap-8 mt-8">
              <Avatar name={student.student_name} size="xl" />

              <div className="flex-1">
                <h1 className="text-4xl font-bold">
                  {student.student_name}
                </h1>

                <p className="text-gray-500 mt-2">
                  {student.department}
                </p>

                <p className="text-gray-500">
                  {student.company} Internship
                </p>

                <div className="mt-5 inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full">
                  {student.performance_category}
                </div>

                <p className="text-sm text-gray-500 mt-5">
                  Created {formatDate(student.created_at)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="bg-violet-50 rounded-2xl p-5">
                <p>Attendance</p>
                <h2 className="text-3xl font-bold">{student.attendance}%</h2>
              </div>

              <div className="bg-violet-50 rounded-2xl p-5">
                <p>Task Completion</p>
                <h2 className="text-3xl font-bold">{student.task_completion}%</h2>
              </div>

              <div className="bg-violet-50 rounded-2xl p-5">
                <p>Communication</p>
                <h2 className="text-3xl font-bold">{student.communication}%</h2>
              </div>

              <div className="bg-violet-50 rounded-2xl p-5">
                <p>Project Completion</p>
                <h2 className="text-3xl font-bold">{student.project_completion}%</h2>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">Overall Score</h2>

              <h1 className="text-6xl font-bold text-violet-600 mt-3">
                {student.overall_score}
              </h1>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-5">Mentor Rating</h2>

              <div className="flex items-center gap-2 text-yellow-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <FaStar
                    key={index}
                    size={30}
                    className={
                      index < Math.round(Number(student.mentor_rating))
                        ? "text-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
                <span className="ml-2 text-gray-700 font-semibold">
                  {student.mentor_rating} / 5
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;
