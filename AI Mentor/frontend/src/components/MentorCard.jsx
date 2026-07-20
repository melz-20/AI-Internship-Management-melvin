import { FaRobot } from "react-icons/fa";

function MentorCard() {
  return (
    <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-2xl p-6 shadow-xl">

      <div className="flex items-center gap-4">
        <FaRobot size={45} />

        <div>
          <h2 className="text-2xl font-bold">
            AI Mentor Suggestion
          </h2>

          <p className="text-purple-100 mt-2">
            Continue your Machine Learning course today.
            You're only 20% away from completing it.
          </p>
        </div>
      </div>

    </div>
  );
}

export default MentorCard;