import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function PerformanceChart({ distribution }) {

  const data = {

    labels: [
      "Outstanding",
      "Excellent",
      "Good",
      "Satisfactory",
      "Needs Improvement",
    ],

    datasets: [

      {

        data: [
          distribution?.outstanding ?? 0,
          distribution?.excellent ?? 0,
          distribution?.good ?? 0,
          distribution?.satisfactory ?? 0,
          distribution?.needs_improvement ?? 0,
        ],

        backgroundColor: [

          "#8B5CF6",
          "#A78BFA",
          "#C4B5FD",
          "#DDD6FE",
          "#EDE9FE",

        ],

        borderWidth: 0,

      },

    ],

  };

  const options = {

    plugins: {

      legend: {

        position: "right",

      },

    },

    cutout: "70%",

    responsive: true,

    maintainAspectRatio: false,

  };

  return (

    <div className="bg-white rounded-3xl shadow-sm p-6 h-[360px]">

      <h2 className="font-semibold text-lg mb-5">

        Performance Distribution

      </h2>

      <div className="h-[260px]">

        <Doughnut
          data={data}
          options={options}
        />

      </div>

    </div>

  );

}

export default PerformanceChart;
