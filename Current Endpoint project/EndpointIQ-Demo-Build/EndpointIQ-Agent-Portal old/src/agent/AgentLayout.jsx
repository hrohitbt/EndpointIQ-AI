
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AppWindow,
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Monitor,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Wrench,
  Users,
  Wifi,
} from "lucide-react";

const nav = [
  { label: "Overview", icon: LayoutDashboard, to: "/devices" },
  { label: "Devices", icon: Monitor, to: "/devices?view=devices" },
  { label: "Applications", icon: AppWindow, to: "/devices?view=applications" },
  { label: "Services", icon: Wrench, to: "/devices?view=services" },
  { label: "Security", icon: ShieldCheck, to: "/devices?view=security" },
  { label: "Diagnostics", icon: Bell, to: "/devices?view=diagnostics" },
  { label: "Fleet Assistant", icon: Bot, to: "/ai-assistant" },
  { label: "Reports", icon: FileText, to: "/devices?view=reports" },
];

export default function AgentLayout({
  children,
  title = "Agent Console",
  subtitle = "EndpointIQ Agent Intelligence",
  onRefresh,
  refreshing = false,
  lastUpdated,
  activeSection,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("endpointiq_user") || "Signed in";

  function handleLogout() {
    localStorage.removeItem("endpointiq_token");
    localStorage.removeItem("endpointiq_user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200 bg-[#0b1324] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
              <Activity size={23} />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">EndpointIQ</div>
              <div className="text-xs text-slate-400">Agent Console</div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Monitoring
          </div>
          <nav className="space-y-1.5">
            {nav.map(({ label, icon: Icon, to }) => {
              const isOverview = label === "Overview";
              const isStandaloneRoute = to.startsWith("/") && !to.includes("?");
              const active = activeSection
                ? activeSection === label
                : isOverview
                ? location.pathname === "/devices" &&
                  !new URLSearchParams(location.search).get("view")
                : isStandaloneRoute
                ? location.pathname === to
                : new URLSearchParams(location.search).get("view") ===
                  label.toLowerCase();

              return (
                <NavLink
                  key={label}
                  to={to}
                  className={() =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-950/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={15} />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wifi size={16} className="text-emerald-400" />
              Agent reporting
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Direct agent telemetry. No device LAN address is required.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between px-2 text-xs text-slate-500">
            <span>EndpointIQ</span>
            <span>Agent v1</span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>EndpointIQ</span>
              <ChevronRight size={13} />
              <span>Agent</span>
            </div>
            <h1 className="truncate text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-[11px] text-slate-400">Last refresh</div>
              <div className="text-xs font-medium text-slate-600">
                {lastUpdated || "Not loaded"}
              </div>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
              title="Refresh agent data"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button className="hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 sm:grid">
              <Bell size={18} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title={`Sign out (${username})`}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-slate-300 transition hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, helper, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
        {Icon && (
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, message, icon: Icon = Server }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={26} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}
