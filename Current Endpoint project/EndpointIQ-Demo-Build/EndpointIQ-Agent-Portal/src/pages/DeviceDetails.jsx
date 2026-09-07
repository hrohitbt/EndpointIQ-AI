import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function DeviceDetails() {
  const { id } = useParams();

  const [device, setDevice] = useState(null);

  useEffect(() => {
    loadDevice();
  }, []);

  async function loadDevice() {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/device/${id}`
      );

      setDevice(res.data.device);

    } catch (err) {
      console.error(err);
    }
  }

  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl">
        Loading Device...
      </div>
    );
  }

  const healthColor =
    device.healthScore >= 90
      ? "text-green-600"
      : device.healthScore >= 70
      ? "text-yellow-500"
      : "text-red-600";

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            EndpointIQ
          </h1>

          <p className="text-slate-300">
            Device Intelligence Console
          </p>
        </div>

        <Link
          to="/"
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ← Dashboard
        </Link>

      </div>

      <div className="max-w-7xl mx-auto p-8">

        {/* Top Cards */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <Card
            title="Health Score"
            value={`${device.healthScore}%`}
            color={healthColor}
          />

          <Card
            title="Compliance"
            value={device.complianceState}
            color={
              device.complianceState === "compliant"
                ? "text-green-600"
                : "text-red-600"
            }
          />

          <Card
            title="Operating System"
            value={device.operatingSystem}
            color="text-blue-600"
          />

        </div>

        {/* Device Overview */}

        <Section title="💻 Device Overview">

          <Info label="Device Name" value={device.deviceName} />

          <Info
            label="Assigned User"
            value={device.userPrincipalName}
          />

          <Info
            label="Operating System"
            value={device.operatingSystem}
          />

          <Info
            label="Compliance"
            value={device.complianceState}
          />

          <Info
            label="Health Score"
            value={`${device.healthScore}%`}
          />

        </Section>

        {/* Health Reasons */}

        <Section title="❤️ Health Analysis">

          <ul className="list-disc pl-6 space-y-2">

            <li>
              {device.complianceState === "compliant"
                ? "Device is compliant."
                : "Device is non-compliant."}
            </li>

            <li>
              Device synced with Microsoft Intune.
            </li>

            <li>
              Operating System : {device.operatingSystem}
            </li>

          </ul>

        </Section>

        {/* AI Recommendation */}

        <Section title="🤖 EndpointIQ AI">

          <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-lg">

            <p className="font-semibold mb-4">

              AI Summary

            </p>

            <p>

              This device currently has a
              <b> {device.healthScore}% </b>
              health score.

            </p>

            <p className="mt-2">

              EndpointIQ recommends reviewing
              compliance, forcing an Intune sync,
              checking Windows Updates and
              verifying BitLocker status.

            </p>

          </div>

        </Section>

        {/* Placeholder Sections */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <Section title="📱 Applications">

            <p>Microsoft Teams - Healthy</p>

            <p>Outlook - Healthy</p>

            <p>Chrome - Healthy</p>

            <p>Company Portal - Healthy</p>

          </Section>

          <Section title="🌐 Network">

            <p>Internet : Healthy</p>

            <p>WiFi : Connected</p>

            <p>VPN : Connected</p>

            <p>DNS : Healthy</p>

          </Section>

          <Section title="🛡 Security">

            <p>BitLocker : Pending</p>

            <p>Microsoft Defender : Healthy</p>

            <p>Firewall : Enabled</p>

          </Section>

          <Section title="📦 Windows Updates">

            <p>Pending Updates : 2</p>

            <p>Restart Required : No</p>

          </Section>

        </div>

      </div>

    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <p className="text-gray-500">{title}</p>

      <h1 className={`text-4xl font-bold mt-2 ${color}`}>
        {value}
      </h1>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-5">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between border-b py-3">
      <span className="font-semibold">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default DeviceDetails;