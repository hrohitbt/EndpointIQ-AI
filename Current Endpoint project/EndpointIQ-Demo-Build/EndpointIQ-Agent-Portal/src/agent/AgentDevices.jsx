
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Activity,
  AppWindow,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Cpu,
  FileText,
  HardDrive,
  Monitor,
  Package,
  Search,
  Server,
  ShieldCheck,
  User,
  Wifi,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { agentApi, getAgentApiUrl } from "./agentApi";
import AgentLayout, { EmptyState, PageHeader, Stat } from "./AgentLayout";
import GaugeScore from "../components/GaugeScore";
import { securityChecks, StatusPill } from "./securityCompliance";

function normalizeDevice(device) {
  const hardware = device?.hardware || {};
  const applications = Array.isArray(device?.applications)
    ? device.applications
    : [];
  const services = Array.isArray(device?.services) ? device.services : [];

  return {
    ...device,
    deviceName: device?.deviceName || device?.computerName || "Unknown device",
    os: device?.os || device?.operatingSystem || "Windows",
    osVersion: device?.osVersion || device?.OSVersion || "Unknown",
    manufacturer:
      hardware.manufacturer ||
      hardware.Manufacturer ||
      device?.manufacturer ||
      device?.Manufacturer ||
      "Unknown",
    model:
      hardware.model ||
      hardware.Model ||
      device?.model ||
      device?.Model ||
      "Unknown",
    serialNumber:
      device?.serialNumber || device?.SerialNumber || "Not reported",
    applications,
    services,
    lastSeen: device?.agentLastSeen || device?.collectionTime,
    user:
      device?.userPrincipalName ||
      device?.emailAddress ||
      device?.username ||
      "Not assigned",
  };
}

function formatAge(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function isOnline(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && Date.now() - date.getTime() <= 15 * 60 * 1000;
}

export default function AgentDevices() {
  const [params] = useSearchParams();
  const view = params.get("view") || "overview";
  const [devices, setDevices] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadDevices = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      const [devicesRes, dashboardRes, trendsRes] = await Promise.all([
        agentApi.get("/devices"),
        agentApi.get("/dashboard").catch(() => null),
        agentApi.get("/trends").catch(() => null),
      ]);
      const list = Array.isArray(devicesRes.data?.devices) ? devicesRes.data.devices : [];
      setDevices(list.map(normalizeDevice));
      setDashboard(dashboardRes?.data || null);
      setTrends(trendsRes?.data?.trends || []);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          `Unable to reach the Agent API at ${getAgentApiUrl()}`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const stats = useMemo(() => {
    const online = devices.filter((d) => isOnline(d.lastSeen)).length;
    const apps = devices.reduce((n, d) => n + d.applications.length, 0);
    const services = devices.reduce((n, d) => n + d.services.length, 0);
    const users = new Set(devices.map((d) => d.user).filter((u) => u !== "Not assigned")).size;
    return { online, apps, services, users };
  }, [devices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter((d) =>
      [d.deviceName, d.os, d.osVersion, d.manufacturer, d.model, d.serialNumber, d.user]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [devices, search]);

  const titleMap = {
    overview: ["Agent Overview", "A clean operational view of every endpoint reporting through the EndpointIQ Agent."],
    devices: ["Devices", "Every endpoint currently reporting directly to the Agent API."],
    applications: ["Applications", "Applications reported by the installed EndpointIQ Agent."],
    services: ["Services", "Windows services discovered by the Agent on reporting endpoints."],
    security: ["Security", "Agent-reported security inventory and telemetry availability."],
    diagnostics: ["Alerts & Diagnostics", "Crash, performance and connectivity signals — populated only where the agent actually collects them."],
    reports: ["Reports", "Reporting health, collection freshness and fleet coverage."],
  };

  const [title, description] = titleMap[view] || titleMap.overview;

  const healthScore = dashboard?.experienceScore ?? 0;

  return (
    <AgentLayout
      title={title}
      subtitle={description}
      onRefresh={loadDevices}
      refreshing={refreshing}
      lastUpdated={lastUpdated}
    >
      <PageHeader
        eyebrow="EndpointIQ Agent"
        title={title}
        description={description}
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
          <span className={`h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}`} />
          {error ? "API disconnected" : "Agent API connected"}
        </div>
      </PageHeader>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 shrink-0 text-red-600" size={20} />
            <div>
              <p className="font-semibold text-red-900">Agent API connection failed</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <p className="mt-2 text-xs text-red-600">
                Configure VITE_AGENT_API_URL for the Azure-hosted API. The UI should not point to 127.0.0.1 on a remote device.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Agent Devices" value={devices.length} helper="Endpoints reporting" icon={Monitor} />
        <Stat label="Online" value={stats.online} helper="Seen in last 15 min" icon={Wifi} tone="green" />
        <Stat label="Applications" value={stats.apps} helper="Reported inventory" icon={Package} />
        <Stat label="Services" value={stats.services} helper="Reported inventory" icon={Wrench} tone="amber" />
      </div>

      {view === "overview" && (
        <Overview
          devices={devices}
          stats={stats}
          loading={loading}
          onRefresh={loadDevices}
          healthScore={healthScore}
          dashboard={dashboard}
          trends={trends}
        />
      )}

      {view === "devices" && (
        <DeviceInventory
          devices={filtered}
          loading={loading}
          search={search}
          setSearch={setSearch}
        />
      )}

      {view === "applications" && <ApplicationsView devices={devices} />}
      {view === "services" && <ServicesView devices={devices} />}
      {view === "security" && <SecurityView devices={devices} />}
      {view === "diagnostics" && <DiagnosticsView devices={devices} />}
      {view === "reports" && <ReportsView devices={devices} lastUpdated={lastUpdated} />}
    </AgentLayout>
  );
}

function Overview({ devices, stats, loading, healthScore, dashboard, trends }) {
  const recent = [...devices].sort(
    (a, b) => new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0)
  ).slice(0, 6);

  const buckets = dashboard?.experienceBuckets || { good: 0, needsAttention: 0, critical: 0, noData: 0 };
  const bucketTotal = buckets.good + buckets.needsAttention + buckets.critical + buckets.noData;

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-[#0b1324] p-6 text-white shadow-sm lg:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-col items-center justify-center">
          <GaugeScore value={healthScore} max={100} />
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">Device experience score</p>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience score trend</p>
          <div className="mt-2 h-28">
            {trends.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    formatter={(v) => [`${v}`, "Experience score"]}
                    contentStyle={{ background: "#0b1324", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="experienceScore" stroke="#60a5fa" strokeWidth={2.5} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-xs text-slate-400">
                A trend line appears once telemetry has been observed across more than one day. Today's snapshot is recorded.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 text-sm">
          <div className="flex items-center justify-between gap-6 rounded-xl bg-white/5 px-3 py-2">
            <span className="text-slate-300">Good (80+)</span>
            <span className="font-semibold text-emerald-400">{buckets.good}/{bucketTotal || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-6 rounded-xl bg-white/5 px-3 py-2">
            <span className="text-slate-300">Needs attention (50-79)</span>
            <span className="font-semibold text-amber-400">{buckets.needsAttention}/{bucketTotal || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-6 rounded-xl bg-white/5 px-3 py-2">
            <span className="text-slate-300">Critical (&lt;50)</span>
            <span className="font-semibold text-red-400">{buckets.critical}/{bucketTotal || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-6 rounded-xl bg-white/5 px-3 py-2">
            <span className="text-slate-300">Not enough data</span>
            <span className="font-semibold text-slate-400">{buckets.noData}/{bucketTotal || 0}</span>
          </div>
        </div>
      </section>

      <ImpactAreas devices={devices} />

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-semibold">Recently reporting devices</h3>
            <p className="mt-0.5 text-xs text-slate-500">Freshness is calculated from agentLastSeen / collectionTime.</p>
          </div>
          <Link to="/devices?view=devices" className="text-xs font-semibold text-blue-600 hover:text-blue-800">View all</Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading agent telemetry...</div>
        ) : recent.length === 0 ? (
          <div className="p-5"><EmptyState title="No agent devices yet" message="Install the EndpointIQ Agent on a test device and point it at the public Agent API." icon={Monitor} /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((device) => (
              <Link
                key={`${device.deviceName}-${device.serialNumber}`}
                to={`/device/${encodeURIComponent(device.deviceName)}`}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Monitor size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{device.deviceName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{device.manufacturer} {device.model}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-slate-700">{formatAge(device.lastSeen)}</p>
                  <p className={`mt-0.5 text-[11px] ${isOnline(device.lastSeen) ? "text-emerald-600" : "text-slate-400"}`}>
                    {isOnline(device.lastSeen) ? "Reporting" : "Stale"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Activity size={19} /></div>
            <div>
              <h3 className="font-semibold">Fleet signal</h3>
              <p className="text-xs text-slate-500">What the Agent has actually reported</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <MiniMetric label="Reporting now" value={`${stats.online}/${devices.length}`} />
            <MiniMetric label="Unique users" value={stats.users} />
            <MiniMetric label="Application records" value={stats.apps} />
            <MiniMetric label="Service records" value={stats.services} />
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={19} className="mt-0.5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-950">No fabricated health data</h3>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                This Agent UI only renders fields received from the Agent API. Security and compliance controls remain “not reported” until the agent collects them.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

function ImpactAreas({ devices }) {
  const securityIssues = devices.flatMap((d) =>
    securityChecks(d).filter((c) => c.status === "Not compliant").map((c) => ({ device: d.deviceName, label: c.label }))
  );
  const endpointIssues = [];
  devices.forEach((d) => {
    if ((d.hardware?.ramUsagePercent ?? 0) > 85) endpointIssues.push({ device: d.deviceName, label: "High RAM usage" });
    if ((d.hardware?.diskUsagePercent ?? 0) > 85) endpointIssues.push({ device: d.deviceName, label: "Low disk space" });
  });
  const appIssues = [];
  devices.forEach((d) => {
    const exec = d.diagnostics?.executionCrashes || [];
    const sys = d.diagnostics?.systemCrashes || [];
    if (exec.length) appIssues.push({ device: d.deviceName, label: `${exec.length} application crash(es)` });
    if (sys.length) appIssues.push({ device: d.deviceName, label: `${sys.length} unexpected shutdown(s)` });
  });
  const networkIssues = devices.flatMap((d) =>
    (d.network?.adapters || [])
      .filter((a) => (a.Name || "").toLowerCase().includes("wi-fi") && a.Status !== "Up")
      .map((a) => ({ device: d.deviceName, label: `${a.Name} is ${a.Status || "down"}` }))
  );

  const columns = [
    { title: "Security", issues: securityIssues },
    { title: "Endpoint performance", issues: endpointIssues },
    { title: "Applications", issues: appIssues },
    { title: "Network", issues: networkIssues },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800">Impact areas</h3>
        <p className="mt-0.5 text-xs text-slate-500">Real issues grouped by area, pulled directly from current telemetry — nothing scored or estimated.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">{col.title}</h4>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${col.issues.length ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                {col.issues.length}
              </span>
            </div>
            {col.issues.length === 0 ? (
              <p className="text-xs text-slate-400">No issues detected.</p>
            ) : (
              <ul className="space-y-1.5">
                {col.issues.slice(0, 5).map((issue, i) => (
                  <li key={i} className="text-xs leading-5 text-slate-600">
                    <span className="font-medium text-slate-700">{issue.device}</span>: {issue.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function DeviceInventory({ devices, loading, search, setSearch }) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-semibold">Device inventory</h3>
          <p className="mt-0.5 text-xs text-slate-500">{devices.length} matching endpoint{devices.length === 1 ? "" : "s"}</p>
        </div>
        <div className="relative w-full lg:w-[420px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, serial, model, user..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading devices...</div>
      ) : devices.length === 0 ? (
        <div className="p-5"><EmptyState title="No devices match" message="Try a different search term or install the Agent on another test endpoint." /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Device</th>
                <th className="px-5 py-3 text-left font-semibold">Operating system</th>
                <th className="px-5 py-3 text-left font-semibold">Hardware</th>
                <th className="px-5 py-3 text-left font-semibold">User</th>
                <th className="px-5 py-3 text-left font-semibold">Inventory</th>
                <th className="px-5 py-3 text-left font-semibold">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={`${d.deviceName}-${d.serialNumber}`} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link to={`/device/${encodeURIComponent(d.deviceName)}`} className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><Monitor size={17} /></div>
                      <div>
                        <div className="font-semibold text-blue-600">{d.deviceName}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400">{d.serialNumber}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium">{d.os}</div>
                    <div className="text-xs text-slate-400">{d.osVersion}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2"><Cpu size={16} className="text-slate-400" /><div><div className="text-sm">{d.manufacturer}</div><div className="text-xs text-slate-400">{d.model}</div></div></div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><User size={14} />{d.user}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-lg bg-slate-100 px-2 py-1"><Package size={13} className="mr-1 inline" />{d.applications.length}</span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1"><Wrench size={13} className="mr-1 inline" />{d.services.length}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isOnline(d.lastSeen) ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <div><div className="text-sm font-medium">{formatAge(d.lastSeen)}</div><div className="text-[11px] text-slate-400">{isOnline(d.lastSeen) ? "Reporting" : "Stale"}</div></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ApplicationsView({ devices }) {
  const [q, setQ] = useState("");
  const records = devices.flatMap((d) =>
    d.applications.map((app, i) => ({ device: d.deviceName, app, key: `${d.deviceName}-${i}-${JSON.stringify(app)}` }))
  );
  const filtered = q.trim()
    ? records.filter((r) => displayValue(r.app, "").toLowerCase().includes(q.trim().toLowerCase()))
    : records;
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SectionIntro icon={AppWindow} title="Application inventory" count={filtered.length} />
      <div className="border-b border-slate-100 px-5 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search applications..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-5"><EmptyState title={records.length ? "No applications match" : "No application inventory reported"} message={records.length ? "Try a different search term." : "The UI is ready; the Agent API needs to return an applications array for each device."} icon={AppWindow} /></div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 200).map((r) => (
            <div key={r.key} className="flex items-center gap-4 px-5 py-3.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><AppWindow size={16} /></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{displayValue(r.app, "Application")}</div>
                <div className="text-xs text-slate-400">{r.device}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ServicesView({ devices }) {
  const [q, setQ] = useState("");
  const records = devices.flatMap((d) =>
    d.services.map((service, i) => ({ device: d.deviceName, service, key: `${d.deviceName}-${i}-${JSON.stringify(service)}` }))
  );
  const filtered = q.trim()
    ? records.filter((r) => displayValue(r.service, "").toLowerCase().includes(q.trim().toLowerCase()))
    : records;
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SectionIntro icon={Wrench} title="Service inventory" count={filtered.length} />
      <div className="border-b border-slate-100 px-5 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-5"><EmptyState title={records.length ? "No services match" : "No service inventory reported"} message={records.length ? "Try a different search term." : "The Agent needs to return a services array for this section to populate."} icon={Wrench} /></div>
      ) : (
        <div className="grid gap-px bg-slate-100 md:grid-cols-2">
          {filtered.slice(0, 200).map((r) => (
            <div key={r.key} className="bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600"><Wrench size={16} /></div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{displayValue(r.service, "Service")}</div>
                  <div className="text-xs text-slate-400">{r.device}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DiagnosticCard({ icon: Icon, title, status, detail, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-500",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function DiagnosticsView({ devices }) {
  const wifi = devices.flatMap((d) =>
    (d.network?.adapters || []).filter((a) => (a.Name || "").toLowerCase().includes("wi-fi"))
      .map((a) => ({ device: d.deviceName, ...a }))
  );
  const wifiUp = wifi.filter((a) => a.Status === "Up").length;

  const memAlerts = devices.filter((d) => (d.hardware?.ramUsagePercent ?? 0) > 85);
  const diskAlerts = devices.filter((d) => (d.hardware?.diskUsagePercent ?? 0) > 85);

  const execCrashes = devices.flatMap((d) => (d.diagnostics?.executionCrashes || []).map((c) => ({ device: d.deviceName, ...c })));
  const sysCrashes = devices.flatMap((d) => (d.diagnostics?.systemCrashes || []).map((c) => ({ device: d.deviceName, ...c })));
  const bootReported = devices.filter((d) => d.diagnostics?.boot?.uptimeHours != null);
  const highUptime = bootReported.filter((d) => (d.diagnostics.boot.uptimeHours ?? 0) > 168); // 7 days
  const batteries = devices.filter((d) => d.diagnostics?.battery);
  const weakBatteries = batteries.filter((d) => (d.diagnostics.battery.healthPercent ?? 100) < 80);

  const backed = [
    {
      icon: XCircle,
      title: "Execution crashes",
      collected: execCrashes.length > 0 || devices.some((d) => d.diagnostics?.executionCrashes !== undefined),
      status: execCrashes.length ? `${execCrashes.length} crash event(s) in the last 24h` : "No crash events in the last 24h",
      detail: execCrashes.length ? execCrashes.slice(0, 3).map((c) => `${c.device}: ${c.Application || c.Message || "unknown process"}`).join(" · ") : "Collected from the Application event log (Event ID 1000).",
      tone: execCrashes.length ? "red" : "green",
    },
    {
      icon: XCircle,
      title: "System crashes",
      collected: devices.some((d) => d.diagnostics?.systemCrashes !== undefined),
      status: sysCrashes.length ? `${sysCrashes.length} unexpected shutdown(s)` : "No unexpected shutdowns detected",
      detail: sysCrashes.length ? sysCrashes.slice(0, 3).map((c) => `${c.device}: ${c.TimeCreated}`).join(" · ") : "Collected from the System event log (Event ID 41).",
      tone: sysCrashes.length ? "red" : "green",
    },
    {
      icon: Clock3,
      title: "Boot and login",
      collected: bootReported.length > 0,
      status: bootReported.length ? `${highUptime.length}/${bootReported.length} device(s) up > 7 days` : "Not reported",
      detail: bootReported.length ? bootReported.map((d) => `${d.deviceName}: ${d.diagnostics.boot.uptimeHours}h uptime`).join(", ") : "Boot time isn't in this payload yet.",
      tone: bootReported.length ? (highUptime.length ? "amber" : "green") : "slate",
    },
    {
      icon: HardDrive,
      title: "Battery health",
      collected: batteries.length > 0,
      status: batteries.length ? `${weakBatteries.length}/${batteries.length} below 80% health` : "No battery-equipped devices reported",
      detail: batteries.length ? batteries.map((d) => `${d.deviceName}: ${d.diagnostics.battery.healthPercent ?? "unknown"}%`).join(", ") : "No battery detected — expected for desktops.",
      tone: batteries.length ? (weakBatteries.length ? "amber" : "green") : "slate",
    },
  ];

  const stillMissing = [
    { icon: XCircle, title: "Binary profiling", detail: "Per-process CPU/memory profiling over time isn't collected — this would need a sampling collector." },
    { icon: XCircle, title: "Desktop virtualization", detail: "No VDI/Citrix session telemetry is collected." },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Backed by real telemetry</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <DiagnosticCard
            icon={Wifi}
            title="Wi-Fi connectivity"
            status={wifi.length ? `${wifiUp}/${wifi.length} adapters up` : "No Wi-Fi adapters reported"}
            detail={wifi.length ? wifi.map((a) => `${a.device}: ${a.Name} — ${a.LinkSpeed || "unknown speed"}`).join(", ") : "No devices have reported a Wi-Fi adapter yet."}
            tone={wifi.length ? (wifiUp === wifi.length ? "green" : "amber") : "slate"}
          />
          <DiagnosticCard
            icon={Cpu}
            title="Device and binary memory"
            status={memAlerts.length ? `${memAlerts.length} device(s) above 85% RAM` : "All devices within normal range"}
            detail={memAlerts.length ? memAlerts.map((d) => `${d.deviceName}: ${d.hardware?.ramUsagePercent}% used`).join(", ") : "RAM usage is derived from live hardware telemetry."}
            tone={memAlerts.length ? "amber" : "green"}
          />
          <DiagnosticCard
            icon={HardDrive}
            title="Device performance troubleshooting"
            status={diskAlerts.length ? `${diskAlerts.length} device(s) low on disk` : "Disk usage within normal range"}
            detail={diskAlerts.length ? diskAlerts.map((d) => `${d.deviceName}: ${d.hardware?.diskUsagePercent}% used`).join(", ") : "Disk usage is derived from live hardware telemetry."}
            tone={diskAlerts.length ? "amber" : "green"}
          />
          {backed.map((item) => (
            <DiagnosticCard key={item.title} icon={item.icon} title={item.title} status={item.collected ? item.status : "Not reported"} detail={item.collected ? item.detail : "The agent doesn't send this field yet — update the agent to populate it."} tone={item.collected ? item.tone : "slate"} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">Not collected yet</h3>
        <p className="mt-1 text-xs text-slate-500">These categories exist in the UI but have no backing telemetry — nothing here is invented.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {stillMissing.map((item) => (
            <DiagnosticCard key={item.title} icon={item.icon} title={item.title} status="Not reported" detail={item.detail} tone="slate" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityView({ devices }) {
  const rows = devices.flatMap((d) => securityChecks(d).map((c) => ({ device: d.deviceName, ...c })));

  return (
    <section className="mt-6">
      {devices.length === 0 ? (
        <EmptyState
          title="Security telemetry not reported yet"
          message="No BitLocker, Defender, Firewall, Secure Boot, TPM or patch fields were found in the current Agent payload. Nothing is being invented in the UI."
          icon={ShieldCheck}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item, i) => (
            <div key={`${item.device}-${item.label}-${i}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
              <p className="mt-3 text-xs text-slate-400">{item.device}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReportSection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon size={17} /></div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ReportRow({ label, value, tone = "slate" }) {
  const dot = { green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", slate: "bg-slate-300" };
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-2.5 text-sm last:border-0">
      <span className="flex items-center gap-2 text-slate-600"><span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function ReportsView({ devices, lastUpdated }) {
  const reporting = devices.filter((d) => isOnline(d.lastSeen)).length;
  const stale = devices.length - reporting;
  const rate = devices.length ? Math.round((reporting / devices.length) * 100) : 0;

  const nonCompliant = devices.filter((d) => securityChecks(d).some((c) => c.status === "Not compliant"));

  const withBattery = devices.filter((d) => d.diagnostics?.battery);
  const weakBattery = withBattery.filter((d) => (d.diagnostics.battery.healthPercent ?? 100) < 80);

  const totalRam = devices.reduce((s, d) => s + (d.hardware?.ramUsagePercent || 0), 0);
  const avgRam = devices.length ? Math.round(totalRam / devices.length) : 0;
  const totalDisk = devices.reduce((s, d) => s + (d.hardware?.diskUsagePercent || 0), 0);
  const avgDisk = devices.length ? Math.round(totalDisk / devices.length) : 0;
  const lowDisk = devices.filter((d) => (d.hardware?.diskUsagePercent || 0) > 85);

  const totalApps = devices.reduce((s, d) => s + (d.applications?.length || 0), 0);
  const totalServices = devices.reduce((s, d) => s + (d.services?.length || 0), 0);

  const wifiAdapters = devices.flatMap((d) => (d.network?.adapters || []).filter((a) => (a.Name || "").toLowerCase().includes("wi-fi")).map((a) => ({ device: d.deviceName, ...a })));
  const wifiDown = wifiAdapters.filter((a) => a.Status !== "Up");

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Stat label="Reporting rate" value={`${rate}%`} helper={`${reporting} currently fresh`} icon={Wifi} tone="green" />
        <Stat label="Stale" value={stale} helper="No report in last 15 min" icon={Clock3} tone={stale ? "amber" : "slate"} />
        <Stat label="Last UI refresh" value={lastUpdated || "—"} helper="Browser refresh time" icon={FileText} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection icon={ShieldCheck} title="Device health & compliance">
          <ReportRow label="Devices reporting" value={devices.length} />
          <ReportRow label="Fully compliant" value={devices.length - nonCompliant.length} tone={nonCompliant.length ? "amber" : "green"} />
          <ReportRow label="Needs review" value={nonCompliant.length} tone={nonCompliant.length ? "red" : "green"} />
          {nonCompliant.map((d) => (
            <p key={d.deviceName} className="mt-1 text-xs text-slate-400">↳ {d.deviceName}: {securityChecks(d).filter((c) => c.status === "Not compliant").map((c) => c.label).join(", ")}</p>
          ))}
        </ReportSection>

        <ReportSection icon={HardDrive} title="Battery report">
          {withBattery.length === 0 ? (
            <EmptyState title="No battery-equipped devices reported" message="Expected on desktops — laptops will populate this once telemetry arrives." icon={HardDrive} />
          ) : (
            withBattery.map((d) => (
              <ReportRow key={d.deviceName} label={d.deviceName} value={`${d.diagnostics.battery.healthPercent ?? "unknown"}% health`} tone={(d.diagnostics.battery.healthPercent ?? 100) < 80 ? "amber" : "green"} />
            ))
          )}
        </ReportSection>

        <ReportSection icon={Cpu} title="Hardware report">
          <ReportRow label="Average RAM usage" value={`${avgRam}%`} tone={avgRam > 85 ? "amber" : "green"} />
          <ReportRow label="Average disk usage" value={`${avgDisk}%`} tone={avgDisk > 85 ? "amber" : "green"} />
          <ReportRow label="Devices low on disk (>85%)" value={lowDisk.length} tone={lowDisk.length ? "red" : "green"} />
        </ReportSection>

        <ReportSection icon={AppWindow} title="Software report">
          <ReportRow label="Applications tracked" value={totalApps} />
          <ReportRow label="Services tracked" value={totalServices} />
          <ReportRow label="Avg apps / device" value={devices.length ? Math.round(totalApps / devices.length) : 0} />
        </ReportSection>

        <ReportSection icon={Wifi} title="Network problems">
          {wifiAdapters.length === 0 ? (
            <EmptyState title="No Wi-Fi adapters reported" message="Wired-only devices won't populate this section." icon={Wifi} />
          ) : (
            <>
              <ReportRow label="Wi-Fi adapters up" value={`${wifiAdapters.length - wifiDown.length}/${wifiAdapters.length}`} tone={wifiDown.length ? "red" : "green"} />
              {wifiDown.map((a, i) => (
                <p key={i} className="mt-1 text-xs text-slate-400">↳ {a.device}: {a.Name} is {a.Status || "unknown"}</p>
              ))}
            </>
          )}
        </ReportSection>
      </div>
    </div>
  );
}

function SectionIntro({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon size={17} /></div>
        <div><h3 className="font-semibold">{title}</h3><p className="text-xs text-slate-500">{count} records</p></div>
      </div>
    </div>
  );
}

function displayValue(value, fallback = "Not reported") {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") {
    return value.name || value.displayName || value.Name || value.DisplayName || JSON.stringify(value);
  }
  return String(value);
}
