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

export default function WindowsVersionChart() {

  const data = {
    labels: ["Windows 11", "Windows 10"],
    datasets: [
      {
        data: [80, 20],
        backgroundColor: [
          "#0891b2",
          "#9333ea",
        ],
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        🪟 Windows Versions
      </h2>

      <div className="h-80 flex justify-center items-center">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      </div>
    </div>
  );
}