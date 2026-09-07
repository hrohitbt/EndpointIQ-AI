function SummaryCards({ summary }) {
  if (!summary) {
    return <h3>Loading dashboard...</h3>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <Card
        title="💻 Total Devices"
        value={summary.totalDevices}
        color="#2563eb"
      />

      <Card
        title="✅ Healthy"
        value={summary.healthyDevices}
        color="#16a34a"
      />

      <Card
        title="❌ Unhealthy"
        value={summary.unhealthyDevices}
        color="#dc2626"
      />

      <Card
        title="🪟 Windows 11"
        value={summary.windows11}
        color="#0891b2"
      />

      <Card
        title="🛡 Compliance"
        value={`${summary.compliance}%`}
        color="#9333ea"
      />
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        background: color,
        color: "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 8px 18px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>{title}</h3>

      <h1
        style={{
          fontSize: "48px",
          margin: 0,
          fontWeight: "bold",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

export default SummaryCards;