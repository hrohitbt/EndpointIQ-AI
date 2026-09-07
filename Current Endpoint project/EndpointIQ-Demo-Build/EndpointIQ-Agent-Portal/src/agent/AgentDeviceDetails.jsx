
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BatteryMedium,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Cpu,
  FileText,
  HeartPulse,
  Monitor,
  Package,
  Server,
  ShieldCheck,
  User,
  Wifi,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { agentApi, getAgentApiUrl } from "./agentApi";
import AgentLayout, { EmptyState, PageHeader, Stat } from "./AgentLayout";
import { securityChecks, StatusPill } from "./securityCompliance";

export default function AgentDeviceDetails() {
  const { id } = useParams();
  const deviceName = decodeURIComponent(id || "");
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [topProcesses, setTopProcesses] = useState({ cyclesTotal: 0, processes: [] });
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
        if (found) {
          const name = found.deviceName || found.computerName;
          const historyRes = await agentApi
            .get(`/device/${encodeURIComponent(name)}/history`)
            .catch(() => null);
          setHistory(historyRes?.data?.history || []);
          setTopProcesses(historyRes?.data?.topProcesses || { cyclesTotal: 0, processes: [] });
        }
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
  const loggedInUsers = Array.isArray(device.user?.loggedInUsers) ? device.user.loggedInUsers : [];
  const batteryHealth = device.diagnostics?.battery?.healthPercent;

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

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Applications" value={applications.length} helper="Reported inventory" icon={Package} />
        <Stat label="Services" value={services.length} helper="Reported inventory" icon={Wrench} tone="amber" />
        <Stat label="Last seen" value={formatLastSeen(lastSeen)} helper="Agent collection timestamp" icon={Server} tone="green" />
        {batteryHealth !== undefined && batteryHealth !== null && (
          <Stat label="Battery health" value={`${batteryHealth}%`} helper="Design vs. full-charge capacity" icon={BatteryMedium} tone={batteryHealth < 80 ? "amber" : "green"} />
        )}
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
            <Info
              label="Currently logged in"
              value={loggedInUsers.length ? loggedInUsers.map((u) => `${u.username}${u.state ? ` (${u.state})` : ""}`).join(", ") : undefined}
            />
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

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <CrashCard
          title="Application crashes"
          icon={Package}
          items={(device.diagnostics?.executionCrashes || []).map((c) => ({
            summary: c.application || c.Application || c.message || c.Message || "Unknown process",
            detail: c,
          }))}
          emptyMessage="No application crash events reported in the last 24h."
        />
        <CrashCard
          title="Hardware / system crashes"
          icon={Cpu}
          items={(device.diagnostics?.systemCrashes || []).map((c) => ({
            summary: `Unexpected shutdown at ${c.timeCreated || c.TimeCreated || "unknown time"}`,
            detail: c,
          }))}
          emptyMessage="No unexpected shutdowns (Event ID 41) reported in the last 24h."
        />
        <CrashCard
          title="Driver issues"
          icon={Wrench}
          items={(device.diagnostics?.driverIssues || []).map((d) => ({
            summary: `${d.name || "Unknown device"} (code ${d.problemCode ?? "?"})`,
            detail: d,
          }))}
          emptyMessage="No devices are currently flagged with a driver error."
        />
        <CrashCard
          title="Network problems"
          icon={Wifi}
          items={(device.network?.adapters || [])
            .filter((a) => a.Status && a.Status !== "Up")
            .map((a) => ({ summary: `${a.Name || "Adapter"} is ${a.Status}`, detail: a }))}
          emptyMessage="No network adapter issues reported."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <HealthTimelineCard history={history} />
        <TopUsedAppsCard topProcesses={topProcesses} applications={applications} />
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
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${items.length ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}><Icon size={17} /></div>
        <div><h3 className="font-semibold">{title}</h3><p className="text-xs text-slate-500">{items.length} event(s){items.length ? " — click one for details" : ""}</p></div>
      </div>
      {items.length === 0 ? (
        <div className="p-5 text-xs leading-5 text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="max-h-72 overflow-auto divide-y divide-slate-100">
          {items.map((item, i) => {
            const isOpen = expanded === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <span className="truncate">{item.summary}</span>
                  <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="space-y-1.5 bg-slate-50 px-5 py-3 text-xs">
                    {detailRows(item.detail).map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <span className="w-36 shrink-0 font-semibold text-slate-500">{label}</span>
                        <span className="break-words text-slate-700">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function detailRows(detail) {
  if (!detail || typeof detail !== "object") return [];
  return Object.entries(detail)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => [
      key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase()),
      typeof value === "object" ? JSON.stringify(value) : String(value),
    ]);
}

const HEALTH_ROWS = [
  { key: "ramUsagePercent", label: "Memory", color: "#2563eb" },
  { key: "diskUsagePercent", label: "System drive", color: "#d97706" },
  { key: "cpuUsagePercent", label: "CPU", color: "#16a34a" },
];

function HealthTimelineCard({ history }) {
  const rows = (history || []).map((h, i) => ({ ...h, i }));
  const hasCrashRow = rows.some((r) => (r.executionCrashCount || 0) + (r.systemCrashCount || 0) > 0);
  const first = rows[0]?.timestamp;
  const last = rows[rows.length - 1]?.timestamp;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><HeartPulse size={19} /></div>
        <div>
          <h3 className="font-semibold">Device health over time</h3>
          <p className="text-xs text-slate-500">One row per signal, recorded on every collection cycle for this device.</p>
        </div>
      </div>

      {rows.length > 1 ? (
        <div className="mt-5">
          {HEALTH_ROWS.map((row) => (
            <HealthSwimlane key={row.key} label={row.label} color={row.color} dataKey={row.key} rows={rows} />
          ))}
          {hasCrashRow && <CrashSwimlane rows={rows} />}
          <div className="flex items-center justify-between border-t border-slate-100 pl-[152px] pt-2 text-[11px] text-slate-400">
            <span>{first ? new Date(first).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
            <span>{last ? new Date(last).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
          These rows fill in once this device has reported more than one collection cycle.
        </div>
      )}
    </section>
  );
}

function HealthSwimlane({ label, color, dataKey, rows }) {
  const latest = rows[rows.length - 1]?.[dataKey];
  return (
    <div className="flex items-center gap-4 border-t border-slate-100 py-2 first:border-t-0">
      <div className="w-32 shrink-0 text-xs font-medium text-slate-500">{label}</div>
      <div className="h-10 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`, label]}
              labelFormatter={(i) => (rows[i]?.timestamp ? new Date(rows[i].timestamp).toLocaleString() : "")}
              contentStyle={{ fontSize: 12 }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.75} fill={color} fillOpacity={0.15} connectNulls isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">
        {latest !== undefined && latest !== null ? `${latest}%` : "—"}
      </div>
    </div>
  );
}

function CrashSwimlane({ rows }) {
  const events = rows
    .map((r, i) => ({ i, total: (r.executionCrashCount || 0) + (r.systemCrashCount || 0), timestamp: r.timestamp }))
    .filter((r, idx, arr) => r.total > 0 && (idx === 0 || r.total > arr[idx - 1].total));
  const span = Math.max(1, rows.length - 1);

  return (
    <div className="flex items-center gap-4 border-t border-slate-100 py-2">
      <div className="w-32 shrink-0 text-xs font-medium text-slate-500">Crash events</div>
      <div className="relative h-10 flex-1">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-100" />
        {events.map((e) => (
          <div
            key={e.i}
            title={e.timestamp ? new Date(e.timestamp).toLocaleString() : ""}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"
            style={{ left: `${(e.i / span) * 100}%` }}
          />
        ))}
      </div>
      <div className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">{events.length}</div>
    </div>
  );
}

function TopUsedAppsCard({ topProcesses, applications }) {
  const { cyclesTotal, processes } = topProcesses;

  const displayName = useMemo(() => {
    return (processName) => {
      const base = processName.toLowerCase().replace(/\.exe$/, "");
      const match = applications.find((a) => (a.name || "").toLowerCase().includes(base) || base.includes((a.name || "").toLowerCase().split(" ")[0]));
      return match?.name || processName;
    };
  }, [applications]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold">Top 10 most-used apps</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {cyclesTotal > 1
            ? `Ranked by how often each process was seen running, across the last ${cyclesTotal} collection cycles.`
            : "Ranking builds up as more collection cycles are observed — usage needs more than one cycle to rank."}
        </p>
      </div>
      {processes.length === 0 ? (
        <div className="p-5"><EmptyState title="No usage data yet" message="The agent hasn't reported running-process telemetry yet — this fills in after the next few collection cycles." icon={Package} /></div>
      ) : (
        <div className="divide-y divide-slate-100">
          {processes.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-4 shrink-0 text-xs font-semibold text-slate-400">{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{displayName(p.name)}</p>
                  <p className="truncate text-xs text-slate-400">{p.name}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{p.cyclesSeen}/{cyclesTotal} checks</span>
            </div>
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
