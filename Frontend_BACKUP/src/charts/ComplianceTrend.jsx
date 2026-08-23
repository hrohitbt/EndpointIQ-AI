import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ComplianceTrend() {

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Compliance %",
        data: [96, 96.5, 97, 97.4, 98, 98.2, 98.5],
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        🛡 Compliance Trend
      </h2>

      <Line data={data} />
    </div>
  );
}