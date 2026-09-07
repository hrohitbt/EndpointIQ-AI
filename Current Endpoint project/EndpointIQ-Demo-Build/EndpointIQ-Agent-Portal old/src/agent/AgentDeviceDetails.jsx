
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Cpu,
  FileText,
  Monitor,
  Package,
  Server,
  ShieldCheck,
  User,
  Wifi,
  Wrench,
} from "lucide-react";
import { agentApi, getAgentApiUrl } from "./agentApi";
import AgentLayout, { EmptyState, PageHeader, Stat } from "./AgentLayout";
import { securityChecks, StatusPill } from "./securityCompliance";

export default function AgentDeviceDetails() {
  const { id } = useParams();
  const deviceName = decodeURIComponent(id || "");
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await agentApi.get("/devices");
        const list = Array.isArray(response.data?.devices) ? response.data.devices : [];
        const found = list.find(
          (d) => (d.deviceName || d.computerName || "").toLowerCase() === deviceName.toLowerCase()
        );
        setDevice(found || null);
      } catch (err) {
        setError(err.response?.data?.detail || `Unable to reach ${getAgentApiUrl()}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deviceName]);

  if (loading) {
    return (
      <AgentLayout title="Device details" activeSection="Devices">
        <div className="py-20 text-center text-sm text-slate-500">Loading device telemetry...</div>
      </AgentLayout>
    );
  }

  if (!device) {
    return (
      <AgentLayout title="Device not found" activeSection="Devices">
        <div className="py-8">
          <EmptyState title="Device not found" message={error || "The device is no longer present in the Agent API response."} icon={Monitor} />
          <div className="mt-5 text-center"><Link to="/devices" className="text-sm font-semibold text-blue-600">Back to Agent Devices</Link></div>
        </div>
      </AgentLayout>
    );
  }

  const hardware = device.hardware || {};
  const applications = Array.isArray(device.applications) ? device.applications : [];
  const services = Array.isArray(device.services) ? device.services : [];

  const get = (...values) => values.find((v) => v !== undefined && v !== null && v !== "") ?? "Not reported";
  const serial = get(hardware.serialNumber, hardware.SerialNumber, device.serialNumber, device.SerialNumber);
  const os = get(device.os, device.operatingSystem);
  const osVersion = get(device.osVersion, device.OSVersion);
  const manufacturer = get(hardware.manufacturer, hardware.Manufacturer, device.manufacturer, device.Manufacturer);
  const model = get(hardware.model, hardware.Model, device.model, device.Model);
  const rawUser = get(device.userPrincipalName, device.emailAddress, device.username, device.user?.username);
  const user = rawUser.endsWith("$") ? `${rawUser} (machine account — no interactive user detected)` : rawUser;
  const userDomain = get(device.user?.userDomain, device.user?.computerDomain);
  const lastSeen = get(device.agentLastSeen, device.collectionTime);

  return (
    <AgentLayout title={device.deviceName || device.computerName || "Device details"} activeSection="Devices">
      <PageHeader
        eyebrow="Agent Device"
        title={device.deviceName || device.computerName || "Unknown device"}
        description="Endpoint telemetry received from the EndpointIQ Agent."
      >
        <Link to="/devices" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600">
          <ArrowLeft size={16} /> Back to devices
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Applications" value={applications.length} helper="Reported inventory" icon={Package} />
        <Stat label="Services" value={services.length} helper="Reported inventory" icon={Wrench} tone="amber" />
        <Stat label="Last seen" value={formatLastSeen(lastSeen)} helper="Agent collection timestamp" icon={Server} tone="green" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Monitor size={19} /></div>
            <div><h3 className="font-semibold">Device information</h3><p className="text-xs text-slate-500">Values are taken from the Agent payload.</p></div>
          </div>
          <div className="grid gap-x-8 md:grid-cols-2">
            <Info label="Device name" value={device.deviceName || device.computerName} />
            <Info label="Serial number" value={serial} />
            <Info label="Operating system" value={`${os} ${osVersion}`} />
            <Info label="Manufacturer" value={manufacturer} />
            <Info label="Model" value={model} />
            <Info label="Assigned user" value={user} />
            <Info label="User domain" value={userDomain} />
            <Info label="Collection time" value={get(device.collectionTime)} />
            <Info label="Agent last seen" value={get(device.agentLastSeen)} />
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-950">Security posture</h3>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                Only security properties actually present in the agent response are shown. Missing telemetry is not represented as healthy or unhealthy.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {securityChecks(device).map((check) => (
              <div key={check.label} className="flex items-start justify-between gap-3 rounded-xl bg-white/60 p-3">
                <div>
                  <p className="text-sm font-semibold text-blue-950">{check.label}</p>
                  <p className="mt-0.5 text-xs text-blue-800">{check.detail}</p>
                </div>
                <StatusPill status={check.status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <CrashCard
          title="Application crashes"
          icon={Package}
          items={(device.diagnostics?.executionCrashes || []).map((c) => c.Application || c.Message || "Unknown process")}
          emptyMessage="No application crash events reported in the last 24h."
        />
        <CrashCard
          title="Hardware / system crashes"
          icon={Cpu}
          items={(device.diagnostics?.systemCrashes || []).map((c) => `Unexpected shutdown at ${c.TimeCreated || "unknown time"}`)}
          emptyMessage="No unexpected shutdowns (Event ID 41) reported in the last 24h."
        />
        <CrashCard
          title="Network problems"
          icon={Wifi}
          items={(device.network?.adapters || [])
            .filter((a) => a.Status && a.Status !== "Up")
            .map((a) => `${a.Name || "Adapter"} is ${a.Status}`)}
          emptyMessage="No network adapter issues reported."
        />
      </div>
    </AgentLayout>
  );
}

function Info({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-700">{value || "Not reported"}</div>
    </div>
  );
}

function SecurityRow({ label, value }) {
  const present = value !== undefined && value !== null && value !== "";
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`text-xs font-semibold ${present ? "text-slate-800" : "text-slate-400"}`}>
        {present ? display(value) : "Not reported"}
      </span>
    </div>
  );
}

function CrashCard({ title, icon: Icon, items, emptyMessage }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${items.length ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}><Icon size={17} /></div>
        <div><h3 className="font-semibold">{title}</h3><p className="text-xs text-slate-500">{items.length} event(s)</p></div>
      </div>
      {items.length === 0 ? (
        <div className="p-5 text-xs leading-5 text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="max-h-72 overflow-auto divide-y divide-slate-100">
          {items.map((text, i) => (
            <div key={i} className="px-5 py-3 text-sm text-slate-700">{text}</div>
          ))}
        </div>
      )}
    </section>
  );
}

function InventoryCard({ title, icon: Icon, items }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon size={17} /></div>
        <div><h3 className="font-semibold">{title}</h3><p className="text-xs text-slate-500">{items.length} records</p></div>
      </div>
      {items.length === 0 ? (
        <div className="p-5"><EmptyState title={`No ${title.toLowerCase()} reported`} message={`The Agent payload does not currently contain ${title.toLowerCase()} records.`} icon={Icon} /></div>
      ) : (
        <div className="max-h-96 overflow-auto divide-y divide-slate-100">
          {items.map((item, i) => (
            <div key={`${i}-${JSON.stringify(item)}`} className="px-5 py-3 text-sm text-slate-700">{display(item)}</div>
          ))}
        </div>
      )}
    </section>
  );
}

function display(value) {
  if (typeof value === "object") {
    return value.name || value.displayName || value.Name || value.DisplayName || JSON.stringify(value);
  }
  return String(value);
}

function formatLastSeen(value) {
  if (!value || value === "Not reported") return "Unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}
