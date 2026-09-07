export default function AIInsights() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

      <h2 className="text-2xl font-bold mb-4">
        🤖 AI Insights
      </h2>

      <div className="space-y-3">

        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          🔴 17 devices are non-compliant.
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          🟡 52 devices require a reboot.
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          🔵 9 HP warranties expire within 30 days.
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          🟢 Compliance has improved by 2% this week.
        </div>

      </div>

    </div>
  );
}