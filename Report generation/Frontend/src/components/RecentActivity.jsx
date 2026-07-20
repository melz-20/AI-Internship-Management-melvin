import {
  FiCheckCircle,
  FiFileText,
  FiUserPlus,
  FiBarChart2,
} from "react-icons/fi";

const activities = [
  {
    icon: <FiCheckCircle />,
    title: "Student Classified",
    time: "2 minutes ago",
  },
  {
    icon: <FiFileText />,
    title: "Report Generated",
    time: "10 minutes ago",
  },
  {
    icon: <FiUserPlus />,
    title: "New Student Added",
    time: "25 minutes ago",
  },
  {
    icon: <FiBarChart2 />,
    title: "Analytics Updated",
    time: "1 hour ago",
  },
];

function RecentActivity() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <h2 className="text-lg font-semibold mb-5">
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.map((activity, index) => (

          <div
            key={index}
            className="flex items-center gap-4"
          >

            <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">

              {activity.icon}

            </div>

            <div>

              <h3 className="font-medium">

                {activity.title}

              </h3>

              <p className="text-sm text-gray-500">

                {activity.time}

              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default RecentActivity;