import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";

function StudentCard({
  studentId,
  name,
  department,
  company,
  score,
  category,
  onEdit,
  onDelete,
}) {
  const initials = name
    ? name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-lg transition duration-300">

      <div className="flex justify-between items-start">

        {/* Student Initial Avatar */}
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xl">
          {initials || <FiUser size={28} />}
        </div>

        {/* Performance Badge */}
        <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
          {category}
        </span>

      </div>

      <h2 className="text-xl font-bold mt-5">
        {name}
      </h2>

      <p className="text-gray-500">
        {department}
      </p>

      <p className="text-gray-500">
        {company}
      </p>

      <div className="mt-5">

        <p className="text-sm text-gray-500">
          Overall Score
        </p>

        <h2 className="text-3xl font-bold text-violet-700">
          {score}
        </h2>

      </div>

      <div className="flex justify-between items-center mt-6 border-t pt-4">

        <Link
          to={`/student/${studentId}`}
          className="text-violet-600 hover:text-violet-800 transition"
          title="View Student"
        >
          <FiEye size={20} />
        </Link>

        <button
          type="button"
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 transition"
          title="Edit Student"
        >
          <FiEdit2 size={20} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 transition"
          title="Delete Student"
        >
          <FiTrash2 size={20} />
        </button>

      </div>

    </div>
  );
}

export default StudentCard;