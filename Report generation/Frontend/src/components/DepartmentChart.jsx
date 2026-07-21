import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function DepartmentChart({ departmentScores }) {

  const data = {

    labels: departmentScores?.map((score) => score.department) ?? [],

    datasets: [

      {

        label: "Average Score",

        data: departmentScores?.map((score) => score.average_score) ?? [],

        backgroundColor: [
          "#8B5CF6",
          "#A78BFA",
          "#C4B5FD",
          "#DDD6FE",
          "#EDE9FE",
        ],

        borderRadius: 12,

      },

    ],

  };

  const options = {

    responsive: true,

    plugins: {

      legend: {

        display: false,

      },

    },

    scales: {

      y: {

        beginAtZero: true,

        max: 100,

      },

    },

  };

  return (

    <div className="bg-white rounded-3xl shadow-sm p-6 h-[360px]">

      <h2 className="font-semibold text-lg mb-5">

        Average Score by Department

      </h2>

      <Bar
        data={data}
        options={options}
      />

    </div>

  );

}

export default DepartmentChart;
