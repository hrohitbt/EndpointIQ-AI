function Card({ title, value, color }) {
  return (
    <div className={`${color} rounded-xl shadow-lg p-6 text-white`}>
      <p className="text-sm">{title}</p>
      <h1 className="text-4xl font-bold mt-2">{value}</h1>
    </div>
  );
}

function KPICards({ summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

      <Card
        title="💻 Total Devices"
        value={summary.totalDevices}
        color="bg-blue-600"
      />

      <Card
        title="✅ Healthy"
        value={summary.healthyDevices}
        color="bg-green-600"
      />

      <Card
        title="❌ Unhealthy"
        value={summary.unhealthyDevices}
        color="bg-red-600"
      />

      <Card
        title="🪟 Windows 11"
        value={summary.windows11}
        color="bg-cyan-600"
      />

      <Card
        title="🛡 Compliance"
        value={`${summary.compliance}%`}
        color="bg-purple-600"
      />

    </div>
  );
}

export default KPICards;