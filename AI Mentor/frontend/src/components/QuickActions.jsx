import { useNavigate } from "react-router-dom";

import {
  FaRobot,
  FaUpload,
  FaBook,
  FaHistory,
} from "react-icons/fa";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Ask AI",
      icon: <FaRobot size={30} />,
      route: "/chat",
    },
    {
      title: "Upload Notes",
      icon: <FaUpload size={30} />,
      route: "/upload",
    },
    {
      title: "Study Material",
      icon: <FaBook size={30} />,
      route: "/study-material",
    },
    {
      title: "History",
      icon: <FaHistory size={30} />,
      route: "/history",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-5 mt-10">
      {actions.map((action, index) => (
        <div
          key={index}
          onClick={() => navigate(action.route)}
          className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 hover:shadow-xl transition cursor-pointer"
        >
          <div className="text-purple-600 flex justify-center">
            {action.icon}
          </div>

          <h3 className="mt-4 font-semibold">
            {action.title}
          </h3>
        </div>
      ))}
    </div>
  );
}

export default QuickActions;