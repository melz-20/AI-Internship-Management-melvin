import { FaMedal, FaStar } from "react-icons/fa";
import Avatar from "./Avatar";

function TopPerformer() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 h-[360px]">

      <h2 className="text-xl font-semibold text-gray-800">
        Top Performer
      </h2>

      <div className="flex flex-col items-center mt-6">

        <Avatar name="Arjun Mehta" size="xl" className="border-4 border-violet-200" />

        <h3 className="text-xl font-bold mt-4">
          Arjun Mehta
        </h3>

        <p className="text-gray-500">
          Cyber Security
        </p>

        <div className="flex items-center gap-2 mt-3">
          <FaMedal className="text-yellow-500" />
          <span className="font-semibold text-violet-700">
            Outstanding
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 w-full">

          <div className="bg-violet-50 rounded-2xl p-3 text-center">
            <p className="text-sm text-gray-500">Score</p>
            <h2 className="text-2xl font-bold text-violet-700">
              97.5
            </h2>
          </div>

          <div className="bg-violet-50 rounded-2xl p-3 text-center">
            <p className="text-sm text-gray-500">Mentor Rating</p>

            <div className="flex justify-center items-center gap-1 mt-1">
              <FaStar className="text-yellow-400" />
              <span className="font-bold">4.9</span>
            </div>
          </div>

        </div>

        <button className="mt-6 w-full bg-violet-600 text-white py-3 rounded-xl hover:bg-violet-700 transition">
          View Profile
        </button>

      </div>
    </div>
  );
}

export default TopPerformer;
