import {
  CheckCircle,
  Clock,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default function ExecutiveSummary() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">
            Executive Summary
          </h2>

          <p className="text-gray-500">
            EndpointIQ Platform Status
          </p>
        </div>

        <div className="text-right">
          <h1 className="text-5xl font-bold text-green-600">
            96%
          </h1>

          <p className="text-gray-500">
            Overall Endpoint Health
          </p>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

        <StatusCard
          icon={<CheckCircle />}
          title="Microsoft Graph"
          value="Connected"
          colour="text-green-600"
        />

        <StatusCard
          icon={<ShieldCheck />}
          title="Intune"
          value="Connected"
          colour="text-green-600"
        />

        <StatusCard
          icon={<Cpu />}
          title="Copilot"
          value="Connected"
          colour="text-green-600"
        />

        <StatusCard
          icon={<Clock />}
          title="Last Sync"
          value="2 min ago"
          colour="text-blue-600"
        />

      </div>

    </div>
  );
}

function StatusCard({ icon, title, value, colour }) {
  return (
    <div className="border rounded-xl p-4">

      <div className={`${colour} mb-3`}>
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className={`${colour} font-bold`}>
        {value}
      </p>

    </div>
  );
}