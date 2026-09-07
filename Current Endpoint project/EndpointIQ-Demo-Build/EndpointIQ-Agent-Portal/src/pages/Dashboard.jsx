import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AppWindow,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Cpu,
  HardDrive,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AgentLayout, { PageHeader, Stat } from "../agent/AgentLayout";
import { agentApi, getAgentApiUrl } from "../agent/agentApi";

function statusTone(value) {
  if (value === "Compliant") return "text-emerald-600 bg-emerald-50";
  if (value === "Review") return "text-amber-700 bg-amber-50";
  return "text-slate-500 bg-slate-100";
}

function ComplianceRow({ label, icon: Icon, counts }) {
  const compliant = counts?.Compliant || 0;
  const review = counts?.Review || 0;
  const unavailable = counts?.["Data unavailable"] || 0;
  const total = compliant + review + unavailable;
  const percent = total ? Math.round((compliant / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon size={19} /></div>
          <div><p className="font-semibold">{label}</p><p className="text-xs text-slate-500">Derived from endpoint telemetry</p></div>
        </div>
        <span className="text-2xl font-bold">{percent}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} /></div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-1 ${statusTone("Compliant")}`}>{compliant} compliant</span>
        <span className={`rounded-full px-2.5 py-1 ${statusTone("Review")}`}>{review} review</span>
        <span className={`rounded-full px-2.5 py-1 ${statusTone("Data unavailable")}`}>{unavailable} incomplete</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [dashboard, deviceResponse, trendResponse] = await Promise.all([
        agentApi.get("/dashboard"),
        agentApi.get("/devices"),
        agentApi.get("/trends"),
      ]);
      setData(dashboard.data);
      setDevices(deviceResponse.data?.devices || []);
      setTrends(trendResponse.data?.trends || []);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setError(e.response?.data?.detail || `Unable to reach ${getAgentApiUrl()}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const health = useMemo(() => {
    if (!data?.deviceCount) return 0;
    const bit = data.security?.bitlocker || {};
    const def = data.security?.defender || {};
    const fw = data.security?.firewall || {};
    const compliant = (bit.Compliant || 0) + (def.Compliant || 0) + (fw.Compliant || 0);
    const total = data.deviceCount * 3;
    return Math.round((compliant / total) * 100);
  }, [data]);

  const recent = [...devices].sort((a, b) => new Date(b.agentLastSeen || b.collectionTime || 0) - new Date(a.agentLastSeen || a.collectionTime || 0)).slice(0, 5);

  return (
    <AgentLayout title="Endpoint Intelligence" subtitle="Fleet health, compliance and evidence from live agent telemetry." onRefresh={load} refreshing={loading} lastUpdated={lastUpdated}>
      <PageHeader eyebrow="EndpointIQ" title="Endpoint Intelligence" description="A telemetry-first view of what is happening across the endpoint estate. Every metric below is derived from data reported by the agent." />

      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><b>Agent API unavailable.</b> {error}</div>}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Devices" value={data?.deviceCount ?? 0} helper="Endpoints reporting" icon={Monitor} />
        <Stat label="Applications" value={data?.applicationCount ?? 0} helper="Installed inventory" icon={AppWindow} />
        <Stat label="Services" value={data?.serviceCount ?? 0} helper="Windows service inventory" icon={Activity} tone="amber" />
        <Stat label="Security posture" value={`${health}%`} helper="Across reported controls" icon={ShieldCheck} tone={health >= 80 ? "green" : "amber"} />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="mb-3 flex items-end justify-between"><div><h3 className="text-lg font-bold">Compliance intelligence</h3><p className="text-sm text-slate-500">The portal distinguishes compliant, review and missing telemetry instead of inventing a status.</p></div></div>
          <div className="grid gap-4 md:grid-cols-3">
            <ComplianceRow label="BitLocker" icon={ShieldCheck} counts={data?.security?.bitlocker} />
            <ComplianceRow label="Defender / AV" icon={CheckCircle2} counts={data?.security?.defender} />
            <ComplianceRow label="Firewall" icon={Wifi} counts={data?.security?.firewall} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-bold">AI-ready signals</h3><p className="text-xs text-slate-500">Evidence currently available for reasoning</p></div><Activity size={20} className="text-blue-600" /></div>
          <div className="mt-4 space-y-3">
            {(data?.insights || []).slice(0, 4).map((item, index) => (
              <div key={`${item.device}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex gap-3"><CircleAlert size={17} className={item.severity === "high" ? "text-red-500" : "text-amber-500"} /><div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p></div></div>
              </div>
            ))}
            {!data?.insights?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No additional signals have been derived from the current telemetry.</p>}
          </div>
          <Link to="/devices" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">Explore devices <ArrowUpRight size={15} /></Link>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Compliance trend</h3>
            <p className="text-xs text-slate-500">
              One rollup recorded per day from live telemetry — this is the historical
              signal the fleet snapshot above can't show on its own.
            </p>
          </div>
        </div>
        {trends.length > 1 ? (
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={34} />
                <Tooltip formatter={(value) => [`${value}%`, "Compliance"]} />
                <Line type="monotone" dataKey="complianceRate" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            A trend line will appear once the fleet has been observed across more than one day.
            Today's snapshot has been recorded.
          </div>
        )}
      </section>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-bold">Reporting endpoints</h3><p className="text-xs text-slate-500">Live inventory from the Agent API</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-blue-300"><RefreshCw size={14} /> Refresh</button></div>
        {loading ? <div className="p-8 text-center text-sm text-slate-500">Loading telemetry...</div> : recent.length ? <div className="divide-y divide-slate-100">{recent.map((d) => <Link key={d.deviceName} to={`/device/${encodeURIComponent(d.deviceName)}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Monitor size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{d.deviceName}</p><p className="truncate text-xs text-slate-500">{d.hardware?.processor || d.osVersion || "Endpoint telemetry"}</p></div><div className="hidden items-center gap-2 text-xs sm:flex"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">Reporting</span><ArrowUpRight size={15} className="text-slate-400" /></div></Link>)}</div> : <div className="p-8 text-center text-sm text-slate-500">No endpoints have reported telemetry yet.</div>}
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><Cpu className="text-blue-600" size={20} /><h4 className="mt-3 font-semibold">Hardware intelligence</h4><p className="mt-1 text-xs leading-5 text-slate-500">CPU, memory, storage and endpoint model data are available for the device view.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><HardDrive className="text-blue-600" size={20} /><h4 className="mt-3 font-semibold">Application health</h4><p className="mt-1 text-xs leading-5 text-slate-500">Application inventory is ready to be correlated with Windows crash diagnostics as the collector expands.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><XCircle className="text-blue-600" size={20} /><h4 className="mt-3 font-semibold">No fabricated findings</h4><p className="mt-1 text-xs leading-5 text-slate-500">Unknown telemetry remains unknown. The AI layer will reason from evidence rather than fixed demo values.</p></div>
      </div>
    </AgentLayout>
  );
}
